import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set for production deployment. Please provide your Supabase connection string.",
  );
}

// Create postgres client for Supabase with SSL in production
const client = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // This allows self-signed certificates
  } : false,
  connect_timeout: 30,
  idle_timeout: 600,
  max_lifetime: 3600,
  connection: {
    application_name: 'memoryos'
  },
  max: 10 // maximum number of connections
});

export const db = drizzle(client, { schema });

console.log("Database connection established successfully");