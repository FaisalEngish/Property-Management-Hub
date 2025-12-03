import { eq, and, desc, asc, gte, lte, like, ne, isNull, isNotNull, sql } from "drizzle-orm";
import { db } from "./db";
import {
  propertyGoals,
  propertyGoalAttachments,
  propertyGoalProgress,
  properties,
  type PropertyGoals,
  type InsertPropertyGoals,
  type PropertyGoalAttachment,
  type InsertPropertyGoalAttachment,
  type PropertyGoalProgress,
  type InsertPropertyGoalProgress
} from "@shared/schema";

export class PropertyGoalsStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== PROPERTY GOALS CRUD OPERATIONS =====
  async getPropertyGoals(filters?: {
    propertyId?: number;
    status?: string;
    priority?: string;
    upgradeType?: string;
    triggerType?: string;
  }): Promise<(PropertyGoals & { propertyName?: string })[]> {
    let query = db
      .select({
        ...propertyGoals,
        propertyName: properties.name,
      })
      .from(propertyGoals)
      .leftJoin(properties, eq(propertyGoals.propertyId, properties.id))
      .where(eq(propertyGoals.organizationId, this.organizationId))
      .orderBy(desc(propertyGoals.createdAt));

    if (filters?.propertyId) {
      query = query.where(and(
        eq(propertyGoals.organizationId, this.organizationId),
        eq(propertyGoals.propertyId, filters.propertyId)
      ));
    }

    if (filters?.status) {
      query = query.where(and(
        eq(propertyGoals.organizationId, this.organizationId),
        eq(propertyGoals.status, filters.status)
      ));
    }

    if (filters?.priority) {
      query = query.where(and(
        eq(propertyGoals.organizationId, this.organizationId),
        eq(propertyGoals.priority, filters.priority)
      ));
    }

    if (filters?.upgradeType) {
      query = query.where(and(
        eq(propertyGoals.organizationId, this.organizationId),
        eq(propertyGoals.upgradeType, filters.upgradeType)
      ));
    }

    if (filters?.triggerType) {
      query = query.where(and(
        eq(propertyGoals.organizationId, this.organizationId),
        eq(propertyGoals.triggerType, filters.triggerType)
      ));
    }

    return await query;
  }

  async getPropertyGoal(id: number): Promise<PropertyGoals | undefined> {
    const [result] = await db
      .select()
      .from(propertyGoals)
      .where(and(
        eq(propertyGoals.id, id),
        eq(propertyGoals.organizationId, this.organizationId)
      ));
    return result;
  }

  async createPropertyGoal(data: Omit<InsertPropertyGoals, "organizationId">): Promise<PropertyGoals> {
    const [result] = await db
      .insert(propertyGoals)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updatePropertyGoal(id: number, data: Partial<InsertPropertyGoals>): Promise<PropertyGoals | undefined> {
    const [result] = await db
      .update(propertyGoals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(propertyGoals.id, id),
        eq(propertyGoals.organizationId, this.organizationId)
      ))
      .returning();
    return result;
  }

  async deletePropertyGoal(id: number): Promise<boolean> {
    const result = await db
      .delete(propertyGoals)
      .where(and(
        eq(propertyGoals.id, id),
        eq(propertyGoals.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  // ===== GOAL ATTACHMENTS CRUD OPERATIONS =====
  async getGoalAttachments(goalId: number): Promise<PropertyGoalAttachment[]> {
    return await db
      .select()
      .from(propertyGoalAttachments)
      .where(and(
        eq(propertyGoalAttachments.goalId, goalId),
        eq(propertyGoalAttachments.organizationId, this.organizationId)
      ))
      .orderBy(desc(propertyGoalAttachments.createdAt));
  }

  async createGoalAttachment(data: Omit<InsertPropertyGoalAttachment, "organizationId">): Promise<PropertyGoalAttachment> {
    const [result] = await db
      .insert(propertyGoalAttachments)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async deleteGoalAttachment(id: number): Promise<boolean> {
    const result = await db
      .delete(propertyGoalAttachments)
      .where(and(
        eq(propertyGoalAttachments.id, id),
        eq(propertyGoalAttachments.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  // ===== GOAL PROGRESS CRUD OPERATIONS =====
  async getGoalProgress(goalId: number): Promise<PropertyGoalProgress[]> {
    return await db
      .select()
      .from(propertyGoalProgress)
      .where(and(
        eq(propertyGoalProgress.goalId, goalId),
        eq(propertyGoalProgress.organizationId, this.organizationId)
      ))
      .orderBy(desc(propertyGoalProgress.progressDate));
  }

  async createGoalProgress(data: Omit<InsertPropertyGoalProgress, "organizationId">): Promise<PropertyGoalProgress> {
    const [result] = await db
      .insert(propertyGoalProgress)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updateGoalProgress(id: number, data: Partial<InsertPropertyGoalProgress>): Promise<PropertyGoalProgress | undefined> {
    const [result] = await db
      .update(propertyGoalProgress)
      .set(data)
      .where(and(
        eq(propertyGoalProgress.id, id),
        eq(propertyGoalProgress.organizationId, this.organizationId)
      ))
      .returning();
    return result;
  }

  // ===== ANALYTICS & REPORTING =====
  async getGoalsAnalytics(propertyId?: number) {
    const goals = await this.getPropertyGoals(propertyId ? { propertyId } : {});
    
    const totalGoals = goals.length;
    const notStartedGoals = goals.filter(g => g.status === "not_started").length;
    const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
    const completedGoals = goals.filter(g => g.status === "completed").length;
    const cancelledGoals = goals.filter(g => g.status === "cancelled").length;
    
    const totalEstimatedCost = goals.reduce((sum, g) => sum + parseFloat(g.estimatedCost), 0);
    const completedActualCost = goals
      .filter(g => g.status === "completed" && g.actualCost)
      .reduce((sum, g) => sum + parseFloat(g.actualCost || "0"), 0);

    // Progress by upgrade type
    const upgradeTypeBreakdown = goals.reduce((acc: any, goal) => {
      const type = goal.upgradeType;
      if (!acc[type]) {
        acc[type] = {
          upgradeType: type,
          totalGoals: 0,
          completedGoals: 0,
          totalEstimatedCost: 0,
          totalActualCost: 0,
        };
      }
      acc[type].totalGoals++;
      if (goal.status === "completed") {
        acc[type].completedGoals++;
        acc[type].totalActualCost += parseFloat(goal.actualCost || "0");
      }
      acc[type].totalEstimatedCost += parseFloat(goal.estimatedCost);
      return acc;
    }, {});

    // Progress by trigger type
    const triggerTypeBreakdown = goals.reduce((acc: any, goal) => {
      const type = goal.triggerType;
      if (!acc[type]) {
        acc[type] = {
          triggerType: type,
          totalGoals: 0,
          completedGoals: 0,
          averageCompletionDays: 0,
        };
      }
      acc[type].totalGoals++;
      if (goal.status === "completed") {
        acc[type].completedGoals++;
      }
      return acc;
    }, {});

    return {
      summary: {
        totalGoals,
        notStartedGoals,
        inProgressGoals,
        completedGoals,
        cancelledGoals,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        totalEstimatedCost,
        completedActualCost,
        costVariance: completedActualCost - totalEstimatedCost,
      },
      upgradeTypeBreakdown: Object.values(upgradeTypeBreakdown),
      triggerTypeBreakdown: Object.values(triggerTypeBreakdown),
    };
  }

  // ===== DEMO DATA METHODS =====
  async getDemoPropertyGoals(): Promise<(PropertyGoals & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Property",
        goalTitle: "Outdoor Furniture Upgrade",
        goalDescription: "Replace current outdoor furniture set with modern weather-resistant pieces including sofa, dining table, and lounge chairs.",
        upgradeType: "Furniture",
        estimatedCost: "450000.00",
        currency: "THB",
        priority: "high",
        triggerType: "revenue",
        targetDate: null,
        revenueTarget: "2500000.00",
        occupancyTarget: null,
        occupancyDuration: null,
        customTrigger: null,
        status: "not_started",
        completionDate: null,
        actualCost: null,
        proposedBy: "demo-owner",
        approvedBy: "demo-admin",
        approvedDate: "2024-12-01",
        requiresApproval: true,
        notes: "Triggered when monthly revenue exceeds ฿2.5M. Current progress: ฿2.1M (84%)",
        createdAt: new Date("2024-12-01T10:00:00Z"),
        updatedAt: new Date("2024-12-01T10:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Property",
        goalTitle: "Smart TV Installation",
        goalDescription: "Install 65-inch Smart TV in main living area with premium sound system integration.",
        upgradeType: "Electronics",
        estimatedCost: "85000.00",
        currency: "THB",
        priority: "medium",
        triggerType: "occupancy",
        targetDate: null,
        revenueTarget: null,
        occupancyTarget: "85.00",
        occupancyDuration: 3,
        customTrigger: null,
        status: "in_progress",
        completionDate: null,
        actualCost: null,
        proposedBy: "demo-pm",
        approvedBy: "demo-admin",
        approvedDate: "2024-11-15",
        requiresApproval: true,
        notes: "Triggered when occupancy reaches 85% for 3 consecutive months. Currently at 82% for 2 months.",
        createdAt: new Date("2024-11-15T14:30:00Z"),
        updatedAt: new Date("2024-12-20T09:15:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Property",
        goalTitle: "Pool Pump Replacement",
        goalDescription: "Replace aging pool pump system with energy-efficient variable speed pump.",
        upgradeType: "Maintenance",
        estimatedCost: "120000.00",
        currency: "THB",
        priority: "critical",
        triggerType: "date",
        targetDate: "2025-02-01",
        revenueTarget: null,
        occupancyTarget: null,
        occupancyDuration: null,
        customTrigger: null,
        status: "completed",
        completionDate: "2024-12-18",
        actualCost: "118500.00",
        proposedBy: "demo-admin",
        approvedBy: "demo-admin",
        approvedDate: "2024-12-10",
        requiresApproval: false,
        notes: "Emergency replacement completed ahead of schedule. Saved ฿1,500 on estimated cost.",
        createdAt: new Date("2024-12-10T08:00:00Z"),
        updatedAt: new Date("2024-12-18T16:45:00Z"),
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 3,
        propertyName: "Property",
        goalTitle: "Kitchen Appliance Upgrade",
        goalDescription: "Replace refrigerator, dishwasher, and microwave with premium stainless steel appliances.",
        upgradeType: "Electronics",
        estimatedCost: "180000.00",
        currency: "THB",
        priority: "medium",
        triggerType: "custom",
        targetDate: null,
        revenueTarget: null,
        occupancyTarget: null,
        occupancyDuration: null,
        customTrigger: "After Q1 2025 bookings exceed 90% capacity",
        status: "not_started",
        completionDate: null,
        actualCost: null,
        proposedBy: "demo-owner",
        approvedBy: null,
        approvedDate: null,
        requiresApproval: true,
        notes: "Pending approval from management. Custom trigger based on Q1 booking performance.",
        createdAt: new Date("2024-12-22T11:20:00Z"),
        updatedAt: new Date("2024-12-22T11:20:00Z"),
      },
      {
        id: 5,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Property",
        goalTitle: "Decorative Garden Lighting",
        goalDescription: "Install LED pathway lighting and decorative garden features to enhance evening ambiance.",
        upgradeType: "Decor",
        estimatedCost: "75000.00",
        currency: "THB",
        priority: "low",
        triggerType: "date",
        targetDate: "2025-03-15",
        revenueTarget: null,
        occupancyTarget: null,
        occupancyDuration: null,
        customTrigger: null,
        status: "not_started",
        completionDate: null,
        actualCost: null,
        proposedBy: "demo-pm",
        approvedBy: "demo-admin",
        approvedDate: "2024-12-20",
        requiresApproval: true,
        notes: "Scheduled for installation before high season. Vendor quotes received.",
        createdAt: new Date("2024-12-20T13:45:00Z"),
        updatedAt: new Date("2024-12-20T13:45:00Z"),
      },
    ];
  }

  async getDemoGoalsAnalytics() {
    const goals = await this.getDemoPropertyGoals();
    
    const totalGoals = goals.length;
    const notStartedGoals = goals.filter(g => g.status === "not_started").length;
    const inProgressGoals = goals.filter(g => g.status === "in_progress").length;
    const completedGoals = goals.filter(g => g.status === "completed").length;
    const cancelledGoals = goals.filter(g => g.status === "cancelled").length;
    
    const totalEstimatedCost = goals.reduce((sum, g) => sum + parseFloat(g.estimatedCost), 0);
    const completedActualCost = goals
      .filter(g => g.status === "completed" && g.actualCost)
      .reduce((sum, g) => sum + parseFloat(g.actualCost || "0"), 0);

    return {
      summary: {
        totalGoals,
        notStartedGoals,
        inProgressGoals,
        completedGoals,
        cancelledGoals,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        totalEstimatedCost,
        completedActualCost,
        costVariance: completedActualCost - totalEstimatedCost,
      },
      upgradeTypeBreakdown: [
        {
          upgradeType: "Furniture",
          totalGoals: 1,
          completedGoals: 0,
          totalEstimatedCost: 450000,
          totalActualCost: 0,
        },
        {
          upgradeType: "Electronics", 
          totalGoals: 2,
          completedGoals: 0,
          totalEstimatedCost: 265000,
          totalActualCost: 0,
        },
        {
          upgradeType: "Maintenance",
          totalGoals: 1,
          completedGoals: 1,
          totalEstimatedCost: 120000,
          totalActualCost: 118500,
        },
        {
          upgradeType: "Decor",
          totalGoals: 1,
          completedGoals: 0,
          totalEstimatedCost: 75000,
          totalActualCost: 0,
        },
      ],
      triggerTypeBreakdown: [
        {
          triggerType: "revenue",
          totalGoals: 1,
          completedGoals: 0,
          averageCompletionDays: 0,
        },
        {
          triggerType: "occupancy",
          totalGoals: 1,
          completedGoals: 0,
          averageCompletionDays: 0,
        },
        {
          triggerType: "date",
          totalGoals: 2,
          completedGoals: 1,
          averageCompletionDays: 8,
        },
        {
          triggerType: "custom",
          totalGoals: 1,
          completedGoals: 0,
          averageCompletionDays: 0,
        },
      ],
    };
  }

  async getDemoGoalAttachments(goalId: number): Promise<PropertyGoalAttachment[]> {
    const attachmentsByGoal: { [key: number]: PropertyGoalAttachment[] } = {
      1: [ // Outdoor Furniture Upgrade
        {
          id: 1,
          organizationId: this.organizationId,
          goalId: 1,
          fileName: "outdoor_furniture_quote.pdf",
          fileType: "pdf",
          fileUrl: "/attachments/outdoor_furniture_quote.pdf",
          fileSize: 245760,
          description: "Quote from Premium Outdoor Furniture Co.",
          uploadedBy: "demo-owner",
          createdAt: new Date("2024-12-01T10:30:00Z"),
        },
        {
          id: 2,
          organizationId: this.organizationId,
          goalId: 1,
          fileName: "furniture_inspiration.jpg",
          fileType: "image",
          fileUrl: "/attachments/furniture_inspiration.jpg",
          fileSize: 512000,
          description: "Inspiration photos for modern outdoor set",
          uploadedBy: "demo-owner",
          createdAt: new Date("2024-12-01T11:00:00Z"),
        },
      ],
      2: [ // Smart TV Installation
        {
          id: 3,
          organizationId: this.organizationId,
          goalId: 2,
          fileName: "tv_installation_quote.pdf",
          fileType: "pdf",
          fileUrl: "/attachments/tv_installation_quote.pdf",
          fileSize: 189432,
          description: "Installation quote from Electronics Pro",
          uploadedBy: "demo-pm",
          createdAt: new Date("2024-11-15T15:00:00Z"),
        },
      ],
      3: [ // Pool Pump Replacement
        {
          id: 4,
          organizationId: this.organizationId,
          goalId: 3,
          fileName: "pool_pump_receipt.pdf",
          fileType: "pdf",
          fileUrl: "/attachments/pool_pump_receipt.pdf",
          fileSize: 156789,
          description: "Purchase receipt and warranty information",
          uploadedBy: "demo-admin",
          createdAt: new Date("2024-12-18T17:00:00Z"),
        },
        {
          id: 5,
          organizationId: this.organizationId,
          goalId: 3,
          fileName: "installation_photos.jpg",
          fileType: "image",
          fileUrl: "/attachments/installation_photos.jpg",
          fileSize: 892340,
          description: "Before and after installation photos",
          uploadedBy: "demo-admin",
          createdAt: new Date("2024-12-18T17:15:00Z"),
        },
      ],
    };

    return attachmentsByGoal[goalId] || [];
  }

  async getDemoGoalProgress(goalId: number): Promise<PropertyGoalProgress[]> {
    const progressByGoal: { [key: number]: PropertyGoalProgress[] } = {
      2: [ // Smart TV Installation progress
        {
          id: 1,
          organizationId: this.organizationId,
          goalId: 2,
          progressDate: "2024-12-15",
          progressPercentage: "25.00",
          milestoneDescription: "TV model selected and ordered",
          notes: "65-inch Samsung Smart TV ordered from authorized dealer",
          recordedBy: "demo-pm",
          createdAt: new Date("2024-12-15T10:00:00Z"),
        },
        {
          id: 2,
          organizationId: this.organizationId,
          goalId: 2,
          progressDate: "2024-12-20",
          progressPercentage: "50.00",
          milestoneDescription: "TV delivered, installation scheduled",
          notes: "TV arrived on schedule. Installation appointment set for Dec 28th",
          recordedBy: "demo-pm",
          createdAt: new Date("2024-12-20T14:30:00Z"),
        },
      ],
      3: [ // Pool Pump Replacement progress
        {
          id: 3,
          organizationId: this.organizationId,
          goalId: 3,
          progressDate: "2024-12-10",
          progressPercentage: "0.00",
          milestoneDescription: "Goal created and approved",
          notes: "Emergency replacement approved due to pump failure",
          recordedBy: "demo-admin",
          createdAt: new Date("2024-12-10T08:30:00Z"),
        },
        {
          id: 4,
          organizationId: this.organizationId,
          goalId: 3,
          progressDate: "2024-12-12",
          progressPercentage: "30.00",
          milestoneDescription: "Pump ordered from supplier",
          notes: "Variable speed pump ordered with 2-day delivery",
          recordedBy: "demo-admin",
          createdAt: new Date("2024-12-12T11:15:00Z"),
        },
        {
          id: 5,
          organizationId: this.organizationId,
          goalId: 3,
          progressDate: "2024-12-18",
          progressPercentage: "100.00",
          milestoneDescription: "Installation completed successfully",
          notes: "New pump installed and tested. Energy efficiency improved by 40%",
          recordedBy: "demo-admin",
          createdAt: new Date("2024-12-18T16:45:00Z"),
        },
      ],
    };

    return progressByGoal[goalId] || [];
  }
}