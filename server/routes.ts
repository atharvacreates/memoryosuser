import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemorySchema, searchQuerySchema, chatMessageSchema } from "@shared/schema";
import { generateEmbedding, generateChatResponse, generateRelevantTags } from "./services/openai";
import { MemoryWithSimilarity } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize shared user for all users
  let sharedUser = await storage.getUser("shared-user");
  if (!sharedUser) {
    sharedUser = await storage.upsertUser({
      id: "shared-user",
      email: "user@memoryos.app",
      firstName: "MemoryOS",
      lastName: "User",
      profileImageUrl: null,
    });
    console.log("Created shared user:", sharedUser);
  }

  // Auth routes - return shared user
  app.get('/api/auth/user', async (req, res) => {
    try {
      const user = await storage.getUser("shared-user");
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all memories
  app.get("/api/memories", async (req, res) => {
    try {
      const memories = await storage.getMemoriesByUserId("shared-user");
      res.json(memories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  });

  // Create new memory
  app.post("/api/memories", async (req, res) => {
    try {
      const memoryData = insertMemorySchema.parse(req.body);

      // Generate embedding for the content
      const embedding = await generateEmbedding(`${memoryData.title} ${memoryData.content}`);

      // Generate AI-powered tags if none provided
      if (!memoryData.tags || memoryData.tags.length === 0) {
        memoryData.tags = await generateRelevantTags(memoryData.content, memoryData.title, memoryData.type);
      }

      const memory = await storage.createMemory({
        ...memoryData,
        userId: "shared-user",
        embedding,
      });

      res.json(memory);
    } catch (error) {
      console.error("Error creating memory:", error);
      res.status(500).json({ error: "Failed to create memory" });
    }
  });

  // Update memory
  app.put("/api/memories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const memoryData = insertMemorySchema.partial().parse(req.body);

      // Generate new embedding if content changed
      let embedding;
      if (memoryData.title || memoryData.content) {
        const existingMemory = await storage.getMemoryById(id);
        if (existingMemory) {
          const title = memoryData.title || existingMemory.title;
          const content = memoryData.content || existingMemory.content;
          embedding = await generateEmbedding(`${title} ${content}`);
        }
      }

      const memory = await storage.updateMemory(id, {
        ...memoryData,
        ...(embedding && { embedding }),
      });

      if (!memory) {
        return res.status(404).json({ error: "Memory not found" });
      }

      res.json(memory);
    } catch (error) {
      console.error("Error updating memory:", error);
      res.status(500).json({ error: "Failed to update memory" });
    }
  });

  // Delete memory
  app.delete("/api/memories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMemory(id, "shared-user");

      if (!deleted) {
        return res.status(404).json({ error: "Memory not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
    }
  });

  // Search memories
  app.post("/api/search", async (req, res) => {
    try {
      const { query, type } = searchQuerySchema.parse(req.body);

      // Generate embedding for the search query
      const queryEmbedding = await generateEmbedding(query);

      // Search by similarity
      const results = await storage.searchMemoriesByEmbedding("shared-user", queryEmbedding, 10);

      // Filter by type if specified
      const filteredResults = type && type !== 'all'
        ? results.filter(memory => memory.type === type)
        : results;

      // Store search for history
      await storage.createSearch("shared-user", query, filteredResults);

      res.json(filteredResults);
    } catch (error) {
      console.error("Error searching memories:", error);
      res.status(500).json({ error: "Failed to search memories" });
    }
  });

  // Chat with AI
  app.post("/api/chat", async (req, res) => {
    try {
      const messages = req.body.messages;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user') {
        return res.status(400).json({ error: "Last message must be from user" });
      }

      // Search for relevant memories based on the user's question
      const queryEmbedding = await generateEmbedding(lastMessage.content);
      const relevantMemories = await storage.searchMemoriesByEmbedding("shared-user", queryEmbedding, 5); // Reduced from 10 to 5

      // Only log in development mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.log(`Search query: "${lastMessage.content}"`);
        console.log(`Found ${relevantMemories.length} relevant memories:`);
        relevantMemories.forEach((memory, index) => {
          console.log(`${index + 1}. [${memory.type}] ${memory.title}`);
        });
      }

      // Build context from relevant memories (clean format for AI)
      const context = relevantMemories.length > 0
        ? relevantMemories.map(memory => {
          // Truncate content to reduce token usage and improve speed
          const truncatedContent = memory.content.length > 300
            ? memory.content.substring(0, 300) + '...'
            : memory.content;

          // Provide clean context without formatting tags
          return `Memory: ${memory.title}\nType: ${memory.type}\nContent: ${truncatedContent}`;
        }).join('\n\n---\n\n')
        : '';

      // Generate AI response
      const response = await generateChatResponse(messages, context);

      // Only return memories that are actually relevant (high similarity score)
      const highlyRelevantMemories = (relevantMemories as MemoryWithSimilarity[]).filter(memory =>
        memory.similarity && memory.similarity > 0.1
      ).slice(0, 2); // Limit to 2 most relevant

      res.json({
        message: response,
        relevantMemories: highlyRelevantMemories
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Get recent searches
  app.get("/api/searches/recent", async (req, res) => {
    try {
      const searches = await storage.getRecentSearches("shared-user", 5);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching recent searches:", error);
      res.status(500).json({ error: "Failed to fetch recent searches" });
    }
  });

  // Get memory statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const memories = await storage.getMemoriesByUserId("shared-user");

      const stats = {
        total: memories.length,
        ideas: memories.filter(m => m.type === 'idea').length,
        notes: memories.filter(m => m.type === 'note').length,
        learnings: memories.filter(m => m.type === 'learning').length,
        tasks: memories.filter(m => m.type === 'task').length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
