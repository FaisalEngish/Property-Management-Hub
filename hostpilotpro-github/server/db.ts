import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// For now, keep using Neon until Supabase connection is properly tested
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("🔗 Connecting to database:", databaseUrl.includes('supabase') ? 'Supabase' : 'Neon');

// Create HTTP connection client - more stable than WebSocket
const sql = neon(databaseUrl);

// Create drizzle instance with HTTP client
export const db = drizzle(sql, { schema });

// For backward compatibility with existing code
export const pool = {
  query: sql,
  end: () => Promise.resolve(),
  on: () => {},
};
