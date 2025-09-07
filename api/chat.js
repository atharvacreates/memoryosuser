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
        memories = await db.select().from(memories)
          .where(eq(memories.userId, "shared-user"))
          .limit(10);
        console.log(`[CHAT API] Found ${memories.length} memories from database`);
      } catch (error) {
        console.error("[CHAT API] Error fetching memories:", error);
        memories = [];
      }
    } else {
      console.log(`[CHAT API] Database not available, using empty memories array`);
    }

    // Build context from relevant memories
    const context = memories.length > 0
      ? memories.map(memory =>
        `[${memory.type.toUpperCase()}] ${memory.title}: ${memory.content}${memory.tags && memory.tags.length > 0 ? ` (Tags: ${memory.tags.join(', ')})` : ''
        }`
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
- If memories are provided, ONLY respond based on those memories
- If NO memories are provided, you can provide general information but clearly state it's not from personal memories
- DO NOT hallucinate or make up information
- DO NOT copy the raw memory format (no [LEARNING], [NOTE], etc. tags)
- DO NOT include the memory tags in your response
- Give natural, conversational responses
- Reference the memory title naturally in conversation
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