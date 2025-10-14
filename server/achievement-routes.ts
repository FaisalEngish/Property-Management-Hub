import { Express } from "express";
import { db } from "./db";
import { 
  achievements, 
  userAchievements, 
  userGameStats,
  tasks,
  bookings,
  properties,
  users
} from "@shared/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";

const isDemoAuthenticated = (req: any, res: any, next: any) => {
  if (req.user) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

export function setupAchievementRoutes(app: Express) {
  
  // Get user game stats with real-time calculation
  app.get("/api/achievements/user/:userId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const organizationId = req.user?.organizationId || "default-org";

      // Get or create user game stats
      let [userStats] = await db
        .select()
        .from(userGameStats)
        .where(and(
          eq(userGameStats.userId, userId),
          eq(userGameStats.organizationId, organizationId)
        ));

      if (!userStats) {
        // Create initial stats for new user
        [userStats] = await db
          .insert(userGameStats)
          .values({
            userId,
            organizationId,
            totalPoints: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            tasksCompleted: 0,
            bookingsProcessed: 0,
            propertiesManaged: 0,
          })
          .returning();
      }

      // Calculate real-time stats from actual data (ALL completed tasks in organization)
      const [taskStats] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tasks)
        .where(and(
          eq(tasks.organizationId, organizationId),
          eq(tasks.status, 'completed')
        ));

      console.log('🎮 Achievement Debug - Task Stats:', taskStats);
      console.log('🎮 Achievement Debug - Organization:', organizationId, 'User:', userId);

      const [propertyStats] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(properties)
        .where(and(
          eq(properties.organizationId, organizationId),
          eq(properties.ownerId, userId)
        ));

      // Count bookings for properties owned by this user
      const [bookingStats] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${bookings.id})` })
        .from(bookings)
        .innerJoin(properties, eq(bookings.propertyId, properties.id))
        .where(and(
          eq(bookings.organizationId, organizationId),
          eq(properties.ownerId, userId)
        ));

      // Calculate points based on activities
      const tasksCompleted = Number(taskStats?.count || 0);
      const bookingsProcessed = Number(bookingStats?.count || 0);
      const propertiesManaged = Number(propertyStats?.count || 0);

      console.log('🎮 Achievement Counts - Tasks:', tasksCompleted, 'Bookings:', bookingsProcessed, 'Properties:', propertiesManaged);

      const totalPoints = (tasksCompleted * 10) + (bookingsProcessed * 25) + (propertiesManaged * 50);
      const level = calculateLevel(totalPoints);

      // Update user stats with real-time data
      await db
        .update(userGameStats)
        .set({
          tasksCompleted,
          bookingsProcessed,
          propertiesManaged,
          totalPoints,
          level,
          updatedAt: new Date(),
        })
        .where(eq(userGameStats.id, userStats.id));

      res.json({
        ...userStats,
        tasksCompleted,
        bookingsProcessed,
        propertiesManaged,
        totalPoints,
        level,
      });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Get all achievement definitions for organization
  app.get("/api/achievements/definitions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const userId = req.user?.id;

      // Get all achievements for organization
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.organizationId, organizationId),
          eq(achievements.isActive, true)
        ))
        .orderBy(achievements.category, achievements.points);

      // Get user's earned achievements
      const earnedAchievements = await db
        .select()
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.organizationId, organizationId)
        ));

      const earnedIds = new Set(earnedAchievements.map(a => a.achievementId));

      // Get user stats for progress calculation
      const [userStats] = await db
        .select()
        .from(userGameStats)
        .where(and(
          eq(userGameStats.userId, userId),
          eq(userGameStats.organizationId, organizationId)
        ));

      // Add earned status and progress to achievements
      const achievementsWithStatus = allAchievements.map(achievement => {
        const isEarned = earnedIds.has(achievement.id);
        const earned = earnedAchievements.find(e => e.achievementId === achievement.id);
        
        let progress = 0;
        if (!isEarned && userStats) {
          progress = calculateProgress(achievement, userStats);
        }

        return {
          ...achievement,
          isEarned,
          earnedAt: earned?.earnedAt,
          progress,
        };
      });

      res.json(achievementsWithStatus);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Check and award achievements
  app.post("/api/achievements/check", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId || "default-org";

      // Get user stats
      const [userStats] = await db
        .select()
        .from(userGameStats)
        .where(and(
          eq(userGameStats.userId, userId),
          eq(userGameStats.organizationId, organizationId)
        ));

      if (!userStats) {
        return res.json({ newAchievements: [] });
      }

      // Get all achievements not yet earned
      const allAchievements = await db
        .select()
        .from(achievements)
        .where(and(
          eq(achievements.organizationId, organizationId),
          eq(achievements.isActive, true)
        ));

      const earnedAchievements = await db
        .select()
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.organizationId, organizationId)
        ));

      const earnedIds = new Set(earnedAchievements.map(a => a.achievementId));
      const newAchievements = [];

      for (const achievement of allAchievements) {
        if (earnedIds.has(achievement.id)) continue;

        if (checkAchievementCriteria(achievement, userStats)) {
          // Award achievement (points and level are calculated from activity in the stats endpoint)
          await db.insert(userAchievements).values({
            userId,
            organizationId,
            achievementId: achievement.id,
            progress: 100,
          });

          newAchievements.push(achievement);
        }
      }

      res.json({ newAchievements });
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });
}

// Helper function to calculate level from points
function calculateLevel(points: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000, 50000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Helper function to calculate progress for an achievement
function calculateProgress(achievement: any, userStats: any): number {
  const criteria = achievement.criteria;
  
  switch (achievement.category) {
    case 'task':
      if (criteria.target) {
        return Math.min(100, (userStats.tasksCompleted / criteria.target) * 100);
      }
      break;
    case 'booking':
      if (criteria.target) {
        return Math.min(100, (userStats.bookingsProcessed / criteria.target) * 100);
      }
      break;
    case 'property':
      if (criteria.target) {
        return Math.min(100, (userStats.propertiesManaged / criteria.target) * 100);
      }
      break;
    case 'system':
      if (criteria.action === 'streak' && criteria.target) {
        return Math.min(100, (userStats.currentStreak / criteria.target) * 100);
      }
      break;
  }
  return 0;
}

// Helper function to check if achievement criteria is met
function checkAchievementCriteria(achievement: any, userStats: any): boolean {
  const criteria = achievement.criteria;
  
  switch (achievement.category) {
    case 'task':
      return userStats.tasksCompleted >= (criteria.target || 0);
    case 'booking':
      return userStats.bookingsProcessed >= (criteria.target || 0);
    case 'property':
      return userStats.propertiesManaged >= (criteria.target || 0);
    case 'system':
      if (criteria.action === 'streak') {
        return userStats.currentStreak >= (criteria.target || 0);
      }
      break;
  }
  return false;
}
