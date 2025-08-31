// Production stats API with Supabase database integration
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

// Initialize database connection
const databaseUrl = process.env.SUPABASE_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("SUPABASE_DATABASE_URL must be set for production deployment");
}

const client = postgres(databaseUrl);
const db = drizzle(client, { schema });

export default async function handler(req, res) {
  console.log(`[STATS API] ${req.method} /api/stats called`);

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

    // Query memories from database
    const memories = await db.select().from(schema.memories)
      .where(eq(schema.memories.userId, userId));

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
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
}