// Bulk delete operations for tasks
import { Express } from 'express';

// Bulk delete task functions using Drizzle ORM with organization filtering
async function deleteExpiredTasks(organizationId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const { db } = await import('./db');
    const { tasks } = await import('../shared/schema');
    const { lt, and, eq } = await import('drizzle-orm');
    
    const result = await db.delete(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          lt(tasks.createdAt, thirtyDaysAgo)
        )
      )
      .returning({ id: tasks.id });
    
    return result.length;
  } catch (error) {
    console.error('Error deleting expired tasks:', error);
    return 0;
  }
}

async function deleteCompletedTasks(organizationId: string) {
  try {
    const { db } = await import('./db');
    const { tasks } = await import('../shared/schema');
    const { and, eq } = await import('drizzle-orm');
    
    const result = await db.delete(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          eq(tasks.status, 'completed')
        )
      )
      .returning({ id: tasks.id });
    
    return result.length;
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    return 0;
  }
}

async function deleteOldTasks(organizationId: string) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  try {
    const { db } = await import('./db');
    const { tasks } = await import('../shared/schema');
    const { lt, and, eq } = await import('drizzle-orm');
    
    const result = await db.delete(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          lt(tasks.createdAt, ninetyDaysAgo)
        )
      )
      .returning({ id: tasks.id });
    
    return result.length;
  } catch (error) {
    console.error('Error deleting old tasks:', error);
    return 0;
  }
}

export function registerBulkDeleteRoutes(app: Express) {
  // Middleware for demo authentication
  const isDemoAuthenticated = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Bulk delete routes for tasks with organization filtering and cache invalidation
  app.delete('/api/tasks/bulk-delete/expired', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.session.user.organizationId;
      const deletedCount = await deleteExpiredTasks(organizationId);
      
      // Clear caches for real-time UI updates
      const { clearCache } = await import("./performanceOptimizer");
      clearCache("tasks");
      clearCache("properties");
      
      console.log(`✅ Bulk deleted ${deletedCount} expired tasks for org: ${organizationId}`);
      
      res.json({ 
        deletedCount, 
        message: `Successfully deleted ${deletedCount} expired tasks` 
      });
    } catch (error) {
      console.error('Error deleting expired tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/tasks/bulk-delete/completed', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.session.user.organizationId;
      const deletedCount = await deleteCompletedTasks(organizationId);
      
      // Clear caches for real-time UI updates
      const { clearCache } = await import("./performanceOptimizer");
      clearCache("tasks");
      clearCache("properties");
      
      console.log(`✅ Bulk deleted ${deletedCount} completed tasks for org: ${organizationId}`);
      
      res.json({ 
        deletedCount, 
        message: `Successfully deleted ${deletedCount} completed tasks` 
      });
    } catch (error) {
      console.error('Error deleting completed tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/tasks/bulk-delete/old', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.session.user.organizationId;
      const deletedCount = await deleteOldTasks(organizationId);
      
      // Clear caches for real-time UI updates
      const { clearCache } = await import("./performanceOptimizer");
      clearCache("tasks");
      clearCache("properties");
      
      console.log(`✅ Bulk deleted ${deletedCount} old tasks for org: ${organizationId}`);
      
      res.json({ 
        deletedCount, 
        message: `Successfully deleted ${deletedCount} old tasks` 
      });
    } catch (error) {
      console.error('Error deleting old tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}