// Fast dashboard API endpoints optimized for performance
import { Express } from 'express';

export function registerFastDashboardRoutes(app: Express) {
  // Middleware for demo authentication
  const isDemoAuthenticated = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Fast tasks endpoint for dashboard - only recent tasks
  app.get('/api/dashboard/recent-tasks', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const { storage } = await import('./storage');
      
      const allTasks = await storage.getTasks();
      
      // Filter by organization and get only recent 10 tasks
      const filteredTasks = allTasks
        .filter(task => task.organizationId === organizationId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      res.json(filteredTasks);
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
      res.status(500).json({ message: "Failed to fetch recent tasks" });
    }
  });

  // Fast task stats endpoint for dashboard
  app.get('/api/dashboard/task-stats', isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const { storage } = await import('./storage');
      
      const allTasks = await storage.getTasks();
      const orgTasks = allTasks.filter(task => task.organizationId === organizationId);
      
      const stats = {
        total: orgTasks.length,
        pending: orgTasks.filter(t => t.status === 'pending').length,
        inProgress: orgTasks.filter(t => t.status === 'in-progress').length,
        completed: orgTasks.filter(t => t.status === 'completed').length,
        highPriority: orgTasks.filter(t => t.priority === 'high').length,
        overdue: orgTasks.filter(t => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < new Date();
        }).length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      res.status(500).json({ message: "Failed to fetch task stats" });
    }
  });
}