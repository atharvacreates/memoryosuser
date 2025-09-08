// Simplified chat API for Vercel deployment
import OpenAI from 'openai';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Define schema inline to avoid import issues in Vercel
const memories = {
  id: 'id',
  userId: 'user_id',
  title: 'title',
  content: 'content',
  type: 'type',
  tags: 'tags',
  embedding: 'embedding',
  priority: 'priority',
  status: 'status',
  source: 'source',
  linkedMemories: 'linked_memories',
  summary: 'summary',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// Initialize OpenAI client for OpenRouter
let openai = null;
try {
  if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://memoryos.vercel.app",
        "X-Title": "MemoryOS",
      }
    });
    console.log("[CHAT API] OpenAI client initialized");
  } else {
    console.error("[CHAT API] OPENROUTER_API_KEY not set");
  }
} catch (error) {
  console.error("[CHAT API] OpenAI client initialization failed:", error);
}

// Initialize database connection
const databaseUrl = process.env.SUPABASE_DATABASE_URL;
let db = null;
let client = null;

try {
  if (databaseUrl) {
    client = postgres(databaseUrl);
    db = drizzle(client);
    console.log("[CHAT API] Database connection established");
  } else {
    console.error("[CHAT API] SUPABASE_DATABASE_URL not set");
  }
} catch (error) {
  console.error("[CHAT API] Database connection failed:", error);
}

export default async function handler(req, res) {
  console.log(`[CHAT API] ${req.method} /api/chat called`);
  console.log(`[CHAT API] Request body:`, req.body);
  console.log(`[CHAT API] OpenAI available:`, !!openai);
  console.log(`[CHAT API] Database available:`, !!db);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[CHAT API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log(`[CHAT API] Processing chat message`);

    // Basic validation
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const lastMessage = req.body.messages[req.body.messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // Search for relevant memories based on the user's question
    console.log(`[CHAT API] Searching for relevant memories`);
    let memories = [];

    if (db) {
      try {
        // Normalize the query and extract key terms
        const query = lastMessage.content.toLowerCase().trim();

        // Smart query parsing - extract potential names and key terms
        const namePattern = /\b[A-Z][a-z]+\b/g;
        const potentialNames = lastMessage.content.match(namePattern) || [];
        const normalizedNames = potentialNames.map(name => name.toLowerCase());

        // Split into meaningful terms, remove common words
        const stopWords = new Set(['the', 'was', 'what', 'who', 'how', 'why', 'when', 'is', 'are', 'from', 'for', 'that', 'this', 'to', 'in', 'on', 'at', 'by']);
        const queryTerms = query.split(/[\s,.-]+/)
          .filter(term => term.length > 1 && !stopWords.has(term));

        // Add potential names to query terms
        queryTerms.push(...normalizedNames);

        // Fetch all memories for the user
        const allMemories = await db.select().from(memories)
          .where(eq(memories.userId, "shared-user"));

        // Score memories based on relevance
        const scoredMemories = allMemories.map(memory => {
          let score = 0;
          const memoryContent = (memory.title + " " + memory.content).toLowerCase();
          const memoryTitle = memory.title.toLowerCase();

          // Named entity matching (highest weight)
          normalizedNames.forEach(name => {
            if (memoryContent.includes(name)) {
              score += 15; // High priority for name matches
            }
          });

          // Tag exact matches (very high weight)
          if (memory.tags) {
            const normalizedTags = memory.tags.map(tag => tag.toLowerCase());
            queryTerms.forEach(term => {
              if (normalizedTags.includes(term)) {
                score += 12; // Exact tag match
              }
              normalizedTags.forEach(tag => {
                if (tag.includes(term) || term.includes(tag)) {
                  score += 8; // Partial tag match
                }
              });
            });
          }

          // Title matches (high weight)
          queryTerms.forEach(term => {
            if (memoryTitle.includes(term)) {
              score += 10;
            }
          });

          // Content semantic matching (medium weight)
          queryTerms.forEach(term => {
            // Count occurrences for term frequency
            const termCount = (memoryContent.match(new RegExp(term, 'gi')) || []).length;
            if (termCount > 0) {
              score += Math.min(termCount * 2, 6); // Cap at 6 to prevent overflow
            }
          });

          // Proximity bonus for terms appearing close together
          if (queryTerms.length > 1) {
            const words = memoryContent.split(/\s+/);
            for (let i = 0; i < words.length - 1; i++) {
              if (queryTerms.some(term => words[i].includes(term)) &&
                queryTerms.some(term => words[i + 1].includes(term))) {
                score += 4; // Bonus for adjacent term matches
              }
            }
          }

          // Recent content bonus
          if (memory.createdAt) {
            const daysAgo = (new Date() - new Date(memory.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysAgo < 7) {
              score += 2; // Small bonus for recent content
            }
          }

          // Debug information
          const debugScoring = {
            title: memory.title,
            tags: memory.tags,
            score: score,
            matchedTerms: queryTerms.filter(term =>
              memoryContent.includes(term.toLowerCase())
            ),
            hasNameMatch: normalizedNames.some(name =>
              memoryContent.includes(name)
            )
          };

          return {
            ...memory,
            relevanceScore: score,
            debugScoring // Include debug info
          };
        });

        // Log scoring details for debugging
        console.log('Query terms:', queryTerms);
        console.log('Potential names:', normalizedNames);
        console.log('Scoring details:',
          scoredMemories
            .filter(m => m.relevanceScore > 0)
            .map(m => m.debugScoring)
        );

        // Filter memories with any relevance and sort by score
        memories = scoredMemories
          .filter(m => m.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 5); // Get top 5 most relevant memories

        console.log(`[CHAT API] Found ${memories.length} relevant memories from database`);
      } catch (error) {
        console.error("[CHAT API] Error fetching memories:", error);
        memories = [];
      }
    } else {
      console.log(`[CHAT API] Database not available, using empty memories array`);
    }

    // Build context from relevant memories with relevance info
    const context = memories.length > 0
      ? memories.map(memory =>
        `[${memory.type.toUpperCase()}] ${memory.title}
Content: ${memory.content}
Tags: ${memory.tags ? memory.tags.join(', ') : 'none'}
Relevance Score: ${memory.relevanceScore}
---`
      ).join('\n\n')
      : '';

    console.log(`[CHAT API] Context built with ${memories.length} memories`);

    // Generate AI response using OpenRouter
    if (openai) {
      try {
        const systemMessage = context
          ? `You are an AI assistant for MemoryOS, a personal knowledge management system. You help users find and organize their stored memories, thoughts, ideas, and learnings. 

IMPORTANT: You can ONLY use information from the user's stored memories below. DO NOT use any external knowledge or make up information.

User's stored memories:
${context}

CRITICAL RULES:
- If memories are provided, ONLY respond based on those memories, prioritizing those with higher relevance scores
- Focus on memories with relevance scores above 5 first
- If NO memories are provided, you can provide general information but clearly state it's not from personal memories
- DO NOT hallucinate or make up information
- DO NOT copy the raw memory format (no [LEARNING], [NOTE], etc. tags)
- DO NOT include the memory tags in your response unless specifically asked about tags
- Give natural, conversational responses that combine information from multiple relevant memories when appropriate
- Reference memory titles naturally in conversation
- If the user's query matches specific tags, mention that you found memories with those tags
- Be helpful and conversational

RESPONSE FORMAT:
- If memories exist: Give a natural response based on the memories
- If no memories: Provide helpful general information and suggest creating a memory
- Always encourage memory creation when appropriate
- Keep it friendly and helpful`
          : "You are an AI assistant for MemoryOS, a personal knowledge management system. You help users find and organize their stored memories, thoughts, ideas, and learnings. Since no relevant memories were found for this query, I can provide general information and help you create a memory about this topic. Always encourage users to save important information as memories.";

        console.log(`[CHAT API] Generating AI response with OpenRouter`);
        const aiResponse = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemMessage },
            ...req.body.messages.slice(-2).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        const response = aiResponse.choices[0].message.content || "I apologize, but I couldn't generate a response.";

        console.log(`[CHAT API] AI response generated successfully`);
        res.json({
          message: response,
          relevantMemories: memories.slice(0, 3), // Return top 3 relevant memories
          success: true
        });
      } catch (error) {
        console.error("[CHAT API] OpenAI error:", error);

        // If it's an API credit error, provide a helpful message
        if (error && typeof error === 'object' && 'code' in error && error.code === 402) {
          return res.status(500).json({
            error: "I'm currently experiencing high demand and my API credits are running low. I can still help you search through your memories and provide basic assistance. For full AI responses, you may need to upgrade your OpenRouter account or try again later.",
            success: false
          });
        }

        // Fallback to simple response
        const fallbackResponse = `Hello! I received your message: "${lastMessage.content}". I'm experiencing some technical difficulties with my AI service right now, but I can still help you search through your memories.`;

        res.json({
          message: fallbackResponse,
          relevantMemories: memories.slice(0, 3),
          success: true,
          note: "AI service temporarily unavailable"
        });
      }
    } else {
      // Fallback when OpenAI is not available
      console.log(`[CHAT API] OpenAI not available, using fallback response`);
      const fallbackResponse = `Hello! I received your message: "${lastMessage.content}". This is a fallback response from the chat API. In the full version, I would use AI to provide intelligent responses based on your memories.`;

      res.json({
        message: fallbackResponse,
        relevantMemories: memories.slice(0, 3),
        success: true,
        note: "AI service not configured"
      });
    }
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat message", details: error.message, success: false });
  }
}