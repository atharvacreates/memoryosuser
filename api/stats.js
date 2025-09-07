// Simplified stats API for Vercel deployment
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Define schema inline to avoid import issues in Vercel
const memorySchema = {
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

// Initialize database connection
const databaseUrl = process.env.SUPABASE_DATABASE_URL;
let db = null;
let client = null;

try {
  if (databaseUrl) {
    client = postgres(databaseUrl);
    db = drizzle(client);
    console.log("[STATS API] Database connection established");
  } else {
    console.error("[STATS API] SUPABASE_DATABASE_URL not set");
  }
} catch (error) {
  console.error("[STATS API] Database connection failed:", error);
}

export default async function handler(req, res) {
  console.log(`[STATS API] ${req.method} /api/stats called`);
  console.log(`[STATS API] Database available:`, !!db);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log(`[STATS API] OPTIONS request handled`);
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const userId = "shared-user";
    console.log(`[STATS API] Fetching stats for user: ${userId}`);

    let memories = [];

    if (db) {
      try {
        // Query memories from database
        memories = await db.select().from(memorySchema)
          .where(eq(memorySchema.userId, userId));
        console.log(`[STATS API] Found ${memories.length} memories from database`);
      } catch (error) {
        console.error("[STATS API] Error fetching memories:", error);
        memories = [];
      }
    } else {
      console.log(`[STATS API] Database not available, using empty memories array`);
    }

    const stats = {
      total: memories.length,
      ideas: memories.filter(m => m.type === 'idea').length,
      notes: memories.filter(m => m.type === 'note').length,
      learnings: memories.filter(m => m.type === 'learning').length,
      tasks: memories.filter(m => m.type === 'task').length,
    };

    console.log(`[STATS API] Stats calculated:`, stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics", details: error.message });
  }
}