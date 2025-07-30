// Bulk delete operations for tasks
import { Express } from 'express';

// Bulk delete task functions
async function deleteExpiredTasks() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const { pool } = await import('./db');
    const result = await pool.query(
      'DELETE FROM tasks WHERE created_at < $1 RETURNING id',
      [thirtyDaysAgo.toISOString()]
    );
    return result.rows.length;
  } catch (error) {
    console.error('Error deleting expired tasks:', error);
    return 0;
  }
}

async function deleteCompletedTasks() {
  try {
    const { pool } = await import('./db');
    const result = await pool.query(
      'DELETE FROM tasks WHERE status = $1 RETURNING id',
      ['completed']
    );
    return result.rows.length;
  } catch (error) {
    console.error('Error deleting completed tasks:', error);
    return 0;
  }
}

async function deleteOldTasks() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  try {
    const { pool } = await import('./db');
    const result = await pool.query(
      'DELETE FROM tasks WHERE created_at < $1 RETURNING id',
      [ninetyDaysAgo.toISOString()]
    );
    return result.rows.length;
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

  // Bulk delete routes for tasks
  app.delete('/api/tasks/bulk-delete/expired', isDemoAuthenticated, async (req: any, res) => {
    try {
      const deletedCount = await deleteExpiredTasks();
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
      const deletedCount = await deleteCompletedTasks();
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
      const deletedCount = await deleteOldTasks();
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