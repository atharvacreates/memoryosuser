import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

// Check if we're in demo mode
const isDemoMode = process.env.DEMO_MODE === 'true' || !databaseUrl;

if (!databaseUrl && !isDemoMode) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Please provide your Supabase connection string, or set DEMO_MODE=true for demo mode.",
  );
}

// In demo mode, we'll use in-memory storage instead of database
export let db: any = null;

if (!isDemoMode && databaseUrl) {
  // Create postgres client for Supabase
  const client = postgres(databaseUrl);
  db = drizzle(client, { schema });
} else {
  console.log("Running in DEMO MODE - using in-memory storage");
  // In demo mode, db will be null and the app will use MemStorage
}