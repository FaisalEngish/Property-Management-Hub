import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Use HTTP connection instead of WebSocket to avoid connection issues
// This is more stable for server environments

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create HTTP connection client - more stable than WebSocket
const sql = neon(process.env.DATABASE_URL);

// Create drizzle instance with HTTP client
export const db = drizzle(sql, { schema });

// For backward compatibility with existing code
export const pool = {
  query: sql,
  end: () => Promise.resolve(),
  on: () => {},
};
