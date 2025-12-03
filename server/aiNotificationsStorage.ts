import { db } from "./db";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";
import {
  aiNotifications,
  aiReminderSettings,
  aiNotificationHistory,
  type AiNotification,
  type InsertAiNotification,
  type AiReminderSetting,
  type InsertAiReminderSetting,
  type AiNotificationHistory,
  type InsertAiNotificationHistory,
} from "@shared/schema";

export class AiNotificationsStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // AI Notifications CRUD operations
  async getAiNotifications(filters: {
    propertyId?: number;
    alertType?: string;
    status?: string;
    priority?: string;
    visibleToRole?: string;
  } = {}): Promise<AiNotification[]> {
    const conditions = [eq(aiNotifications.organizationId, this.organizationId)];

    if (filters.propertyId) {
      conditions.push(eq(aiNotifications.propertyId, filters.propertyId));
    }

    if (filters.alertType) {
      conditions.push(eq(aiNotifications.alertType, filters.alertType));
    }

    if (filters.status) {
      conditions.push(eq(aiNotifications.status, filters.status));
    }

    if (filters.priority) {
      conditions.push(eq(aiNotifications.priority, filters.priority));
    }

    return await db
      .select()
      .from(aiNotifications)
      .where(and(...conditions))
      .orderBy(desc(aiNotifications.createdAt));
  }

  async getAiNotification(id: number): Promise<AiNotification | undefined> {
    const [notification] = await db
      .select()
      .from(aiNotifications)
      .where(
        and(
          eq(aiNotifications.id, id),
          eq(aiNotifications.organizationId, this.organizationId)
        )
      );
    return notification;
  }

  async createAiNotification(notification: InsertAiNotification): Promise<AiNotification> {
    const [created] = await db
      .insert(aiNotifications)
      .values({
        ...notification,
        organizationId: this.organizationId,
      })
      .returning();
    return created;
  }

  async updateAiNotification(
    id: number,
    updates: Partial<InsertAiNotification>
  ): Promise<AiNotification | undefined> {
    const [updated] = await db
      .update(aiNotifications)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiNotifications.id, id),
          eq(aiNotifications.organizationId, this.organizationId)
        )
      )
      .returning();
    return updated;
  }

  async deleteAiNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(aiNotifications)
      .where(
        and(
          eq(aiNotifications.id, id),
          eq(aiNotifications.organizationId, this.organizationId)
        )
      );
    return result.rowCount > 0;
  }

  // AI Reminder Settings CRUD operations
  async getReminderSettings(propertyId?: number): Promise<AiReminderSetting[]> {
    const conditions = [eq(aiReminderSettings.organizationId, this.organizationId)];

    if (propertyId) {
      conditions.push(eq(aiReminderSettings.propertyId, propertyId));
    }

    return await db
      .select()
      .from(aiReminderSettings)
      .where(and(...conditions))
      .orderBy(desc(aiReminderSettings.createdAt));
  }

  async createReminderSetting(setting: InsertAiReminderSetting): Promise<AiReminderSetting> {
    const [created] = await db
      .insert(aiReminderSettings)
      .values({
        ...setting,
        organizationId: this.organizationId,
      })
      .returning();
    return created;
  }

  async updateReminderSetting(
    id: number,
    updates: Partial<InsertAiReminderSetting>
  ): Promise<AiReminderSetting | undefined> {
    const [updated] = await db
      .update(aiReminderSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiReminderSettings.id, id),
          eq(aiReminderSettings.organizationId, this.organizationId)
        )
      )
      .returning();
    return updated;
  }

  // AI Notification History operations
  async getNotificationHistory(notificationId?: number): Promise<AiNotificationHistory[]> {
    const conditions = [eq(aiNotificationHistory.organizationId, this.organizationId)];

    if (notificationId) {
      conditions.push(eq(aiNotificationHistory.notificationId, notificationId));
    }

    return await db
      .select()
      .from(aiNotificationHistory)
      .where(and(...conditions))
      .orderBy(desc(aiNotificationHistory.createdAt));
  }

  async createNotificationHistory(history: InsertAiNotificationHistory): Promise<AiNotificationHistory> {
    const [created] = await db
      .insert(aiNotificationHistory)
      .values({
        ...history,
        organizationId: this.organizationId,
      })
      .returning();
    return created;
  }

  // Analytics and dashboard methods
  async getNotificationStats(propertyId?: number): Promise<{
    total: number;
    active: number;
    overdue: number;
    highPriority: number;
    byType: Array<{ alertType: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  }> {
    const conditions = [eq(aiNotifications.organizationId, this.organizationId)];

    if (propertyId) {
      conditions.push(eq(aiNotifications.propertyId, propertyId));
    }

    const allNotifications = await db
      .select()
      .from(aiNotifications)
      .where(and(...conditions));

    const total = allNotifications.length;
    const active = allNotifications.filter(n => n.status === "active").length;
    const overdue = allNotifications.filter(n => 
      n.status === "active" && n.dueDate && new Date(n.dueDate) < new Date()
    ).length;
    const highPriority = allNotifications.filter(n => 
      n.priority === "high" || n.priority === "critical"
    ).length;

    // Group by alert type
    const typeMap = new Map<string, number>();
    const priorityMap = new Map<string, number>();

    allNotifications.forEach(notification => {
      typeMap.set(notification.alertType, (typeMap.get(notification.alertType) || 0) + 1);
      priorityMap.set(notification.priority, (priorityMap.get(notification.priority) || 0) + 1);
    });

    const byType = Array.from(typeMap.entries()).map(([alertType, count]) => ({
      alertType,
      count,
    }));

    const byPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));

    return {
      total,
      active,
      overdue,
      highPriority,
      byType,
      byPriority,
    };
  }

  // Demo data methods for Villa Aruna
  async getDemoNotifications(): Promise<AiNotification[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "pest",
        title: "Pest Control Overdue",
        description: "Last pest control service was on May 31, 2025. Recommended interval is 30 days. Service is now 14 days overdue.",
        priority: "high",
        status: "active",
        dueDate: new Date("2025-06-30T00:00:00Z"),
        snoozeUntil: null,
        lastServiceDate: new Date("2025-05-31T00:00:00Z"),
        estimatedNextDate: new Date("2025-06-30T00:00:00Z"),
        aiConfidence: "0.92",
        sourceType: "service_log",
        sourceId: "pest_control_001",
        visibleToRoles: ["admin", "portfolio-manager", "staff"],
        assignedTo: null,
        createdBy: "ai-system",
        actionTaken: false,
        actionTakenBy: null,
        actionTakenAt: null,
        actionNotes: null,
        createdAt: new Date("2025-07-14T00:00:00Z"),
        updatedAt: new Date("2025-07-14T00:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "electricity",
        title: "Electricity Bill Expected",
        description: "PEA electricity bill typically arrives between 15th-17th of each month. Bill for July 2025 should arrive soon.",
        priority: "medium",
        status: "active",
        dueDate: new Date("2025-07-17T00:00:00Z"),
        snoozeUntil: null,
        lastServiceDate: null,
        estimatedNextDate: new Date("2025-07-17T00:00:00Z"),
        aiConfidence: "0.87",
        sourceType: "bill_pattern",
        sourceId: "pea_bill_pattern",
        visibleToRoles: ["admin", "portfolio-manager", "owner"],
        assignedTo: null,
        createdBy: "ai-system",
        actionTaken: false,
        actionTakenBy: null,
        actionTakenAt: null,
        actionNotes: null,
        createdAt: new Date("2025-07-15T00:00:00Z"),
        updatedAt: new Date("2025-07-15T00:00:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "cleaning",
        title: "Pool Cleaning Missed",
        description: "Regular pool cleaning was scheduled last week but appears to have been missed. Pool should be cleaned every 5-7 days.",
        priority: "medium",
        status: "active",
        dueDate: new Date("2025-07-10T00:00:00Z"),
        snoozeUntil: null,
        lastServiceDate: new Date("2025-07-03T00:00:00Z"),
        estimatedNextDate: new Date("2025-07-10T00:00:00Z"),
        aiConfidence: "0.78",
        sourceType: "service_log",
        sourceId: "pool_cleaning_001",
        visibleToRoles: ["admin", "portfolio-manager", "staff"],
        assignedTo: "staff-pool",
        createdBy: "ai-system",
        actionTaken: false,
        actionTakenBy: null,
        actionTakenAt: null,
        actionNotes: null,
        createdAt: new Date("2025-07-12T00:00:00Z"),
        updatedAt: new Date("2025-07-12T00:00:00Z"),
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "ac",
        title: "AC Deep Clean Recommended",
        description: "Last major AC cleaning was 13 months ago. AI recommends scheduling a comprehensive AC service to maintain efficiency.",
        priority: "medium",
        status: "active",
        dueDate: new Date("2025-07-25T00:00:00Z"),
        snoozeUntil: null,
        lastServiceDate: new Date("2024-06-15T00:00:00Z"),
        estimatedNextDate: new Date("2025-07-25T00:00:00Z"),
        aiConfidence: "0.85",
        sourceType: "maintenance_history",
        sourceId: "ac_service_001",
        visibleToRoles: ["admin", "portfolio-manager", "owner"],
        assignedTo: null,
        createdBy: "ai-system",
        actionTaken: false,
        actionTakenBy: null,
        actionTakenAt: null,
        actionNotes: null,
        createdAt: new Date("2025-07-05T00:00:00Z"),
        updatedAt: new Date("2025-07-05T00:00:00Z"),
      },
      {
        id: 5,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "upgrade",
        title: "Outdoor Furniture Upgrade",
        description: "Revenue target for Q3 2025 exceeded. Consider purchasing new outdoor sofa set as planned reward.",
        priority: "low",
        status: "active",
        dueDate: new Date("2025-08-01T00:00:00Z"),
        snoozeUntil: null,
        lastServiceDate: null,
        estimatedNextDate: new Date("2025-08-01T00:00:00Z"),
        aiConfidence: "0.95",
        sourceType: "manual",
        sourceId: "goals_module_001",
        visibleToRoles: ["admin", "portfolio-manager", "owner"],
        assignedTo: null,
        createdBy: "goals-system",
        actionTaken: false,
        actionTakenBy: null,
        actionTakenAt: null,
        actionNotes: null,
        createdAt: new Date("2025-07-01T00:00:00Z"),
        updatedAt: new Date("2025-07-01T00:00:00Z"),
      },
    ] as AiNotification[];
  }

  async getDemoReminderSettings(): Promise<AiReminderSetting[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "pest",
        enabled: true,
        intervalDays: 30,
        reminderDaysBefore: 3,
        autoCreateTasks: false,
        notificationMethods: ["dashboard", "email"],
        customRules: {
          priority: "high_if_overdue",
          escalation: "notify_manager_after_7_days",
        },
        createdAt: new Date("2025-07-01T00:00:00Z"),
        updatedAt: new Date("2025-07-01T00:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "electricity",
        enabled: true,
        intervalDays: 30,
        reminderDaysBefore: 2,
        autoCreateTasks: false,
        notificationMethods: ["dashboard"],
        customRules: {
          bill_arrival_window: "15th-17th",
          amount_variance_alert: "20_percent",
        },
        createdAt: new Date("2025-07-01T00:00:00Z"),
        updatedAt: new Date("2025-07-01T00:00:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1, // Villa Aruna
        alertType: "cleaning",
        enabled: true,
        intervalDays: 7,
        reminderDaysBefore: 1,
        autoCreateTasks: true,
        notificationMethods: ["dashboard"],
        customRules: {
          auto_assign_to: "staff-pool",
          weather_check: true,
        },
        createdAt: new Date("2025-07-01T00:00:00Z"),
        updatedAt: new Date("2025-07-01T00:00:00Z"),
      },
    ] as AiReminderSetting[];
  }
}