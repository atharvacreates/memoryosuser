import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set for production deployment. Please provide your Supabase connection string.",
  );
}

// Create postgres client for Supabase
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });

console.log("Database connection established successfully");
// lololol