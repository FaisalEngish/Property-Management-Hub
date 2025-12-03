import { db } from "./db";

export async function healthCheck() {
  try {
    // Test database connection
    await db.execute("SELECT 1");
    return { status: 'healthy', database: 'connected' };
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy', database: 'disconnected', error: error.message };
  }
}
