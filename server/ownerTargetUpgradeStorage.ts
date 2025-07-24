import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  // propertyRevenueTargets, // Schema removed - commenting out
  // propertyUpgradeWishlist,
  // targetUpgradeSuggestions,
  // targetProgressTracking,
  properties,
  // type PropertyRevenueTarget,
  // type InsertPropertyRevenueTarget,
  // type PropertyUpgradeWishlist,
  // type InsertPropertyUpgradeWishlist,
  // type TargetUpgradeSuggestion,
  // type InsertTargetUpgradeSuggestion,
  // type TargetProgressTracking,
  // type InsertTargetProgressTracking,
} from "@shared/schema";

// Temporary types until schemas are restored
type PropertyRevenueTarget = any;
type InsertPropertyRevenueTarget = any;
type PropertyUpgradeWishlist = any;
type InsertPropertyUpgradeWishlist = any;
type TargetUpgradeSuggestion = any;
type InsertTargetUpgradeSuggestion = any;
type TargetProgressTracking = any;
type InsertTargetProgressTracking = any;

export class OwnerTargetUpgradeStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== REVENUE TARGETS =====

  async getRevenueTargets(filters?: {
    propertyId?: number;
    targetYear?: number;
    targetQuarter?: number;
    isActive?: boolean;
  }): Promise<(PropertyRevenueTarget & { propertyName?: string })[]> {
    const conditions = [eq(propertyRevenueTargets.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(propertyRevenueTargets.propertyId, filters.propertyId));
    }
    if (filters?.targetYear) {
      conditions.push(eq(propertyRevenueTargets.targetYear, filters.targetYear));
    }
    if (filters?.targetQuarter) {
      conditions.push(eq(propertyRevenueTargets.targetQuarter, filters.targetQuarter));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(propertyRevenueTargets.isActive, filters.isActive));
    }

    const targets = await db
      .select({
        ...propertyRevenueTargets,
        propertyName: properties.name,
      })
      .from(propertyRevenueTargets)
      .leftJoin(properties, eq(propertyRevenueTargets.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(propertyRevenueTargets.targetYear), desc(propertyRevenueTargets.targetQuarter));

    return targets.map(target => ({
      ...target,
      propertyName: target.propertyName || undefined,
    }));
  }

  async getRevenueTarget(id: number): Promise<PropertyRevenueTarget | undefined> {
    const [target] = await db
      .select()
      .from(propertyRevenueTargets)
      .where(and(
        eq(propertyRevenueTargets.id, id),
        eq(propertyRevenueTargets.organizationId, this.organizationId)
      ));
    return target;
  }

  async createRevenueTarget(data: Omit<InsertPropertyRevenueTarget, "organizationId">): Promise<PropertyRevenueTarget> {
    const [target] = await db
      .insert(propertyRevenueTargets)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return target;
  }

  async updateRevenueTarget(id: number, data: Partial<InsertPropertyRevenueTarget>): Promise<PropertyRevenueTarget | undefined> {
    const [target] = await db
      .update(propertyRevenueTargets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(propertyRevenueTargets.id, id),
        eq(propertyRevenueTargets.organizationId, this.organizationId)
      ))
      .returning();
    return target;
  }

  async deleteRevenueTarget(id: number): Promise<boolean> {
    const result = await db
      .delete(propertyRevenueTargets)
      .where(and(
        eq(propertyRevenueTargets.id, id),
        eq(propertyRevenueTargets.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  // ===== UPGRADE WISHLIST =====

  async getUpgradeWishlist(filters?: {
    propertyId?: number;
    targetId?: number;
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<(PropertyUpgradeWishlist & { propertyName?: string; targetDescription?: string })[]> {
    const conditions = [eq(propertyUpgradeWishlist.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(propertyUpgradeWishlist.propertyId, filters.propertyId));
    }
    if (filters?.targetId) {
      conditions.push(eq(propertyUpgradeWishlist.targetId, filters.targetId));
    }
    if (filters?.status) {
      conditions.push(eq(propertyUpgradeWishlist.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(propertyUpgradeWishlist.priority, filters.priority));
    }
    if (filters?.category) {
      conditions.push(eq(propertyUpgradeWishlist.category, filters.category));
    }

    const upgrades = await db
      .select({
        ...propertyUpgradeWishlist,
        propertyName: properties.name,
        targetDescription: propertyRevenueTargets.description,
      })
      .from(propertyUpgradeWishlist)
      .leftJoin(properties, eq(propertyUpgradeWishlist.propertyId, properties.id))
      .leftJoin(propertyRevenueTargets, eq(propertyUpgradeWishlist.targetId, propertyRevenueTargets.id))
      .where(and(...conditions))
      .orderBy(
        sql`CASE WHEN ${propertyUpgradeWishlist.priority} = 'high' THEN 1 
                 WHEN ${propertyUpgradeWishlist.priority} = 'medium' THEN 2 
                 ELSE 3 END`,
        propertyUpgradeWishlist.deadline
      );

    return upgrades.map(upgrade => ({
      ...upgrade,
      propertyName: upgrade.propertyName || undefined,
      targetDescription: upgrade.targetDescription || undefined,
    }));
  }

  async getUpgradeItem(id: number): Promise<PropertyUpgradeWishlist | undefined> {
    const [upgrade] = await db
      .select()
      .from(propertyUpgradeWishlist)
      .where(and(
        eq(propertyUpgradeWishlist.id, id),
        eq(propertyUpgradeWishlist.organizationId, this.organizationId)
      ));
    return upgrade;
  }

  async createUpgradeItem(data: Omit<InsertPropertyUpgradeWishlist, "organizationId">): Promise<PropertyUpgradeWishlist> {
    const [upgrade] = await db
      .insert(propertyUpgradeWishlist)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return upgrade;
  }

  async updateUpgradeItem(id: number, data: Partial<InsertPropertyUpgradeWishlist>): Promise<PropertyUpgradeWishlist | undefined> {
    const [upgrade] = await db
      .update(propertyUpgradeWishlist)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(propertyUpgradeWishlist.id, id),
        eq(propertyUpgradeWishlist.organizationId, this.organizationId)
      ))
      .returning();
    return upgrade;
  }

  async deleteUpgradeItem(id: number): Promise<boolean> {
    const result = await db
      .delete(propertyUpgradeWishlist)
      .where(and(
        eq(propertyUpgradeWishlist.id, id),
        eq(propertyUpgradeWishlist.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  async approveUpgradeItem(id: number, approvedBy: string): Promise<PropertyUpgradeWishlist | undefined> {
    return this.updateUpgradeItem(id, {
      status: "confirmed",
      approvedBy,
      approvedAt: new Date(),
    });
  }

  async completeUpgradeItem(id: number): Promise<PropertyUpgradeWishlist | undefined> {
    return this.updateUpgradeItem(id, {
      status: "completed",
      completedAt: new Date(),
    });
  }

  // ===== AI SUGGESTIONS =====

  async getSuggestions(filters?: {
    propertyId?: number;
    suggestionType?: string;
    isRead?: boolean;
    isDismissed?: boolean;
  }): Promise<TargetUpgradeSuggestion[]> {
    const conditions = [eq(targetUpgradeSuggestions.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(targetUpgradeSuggestions.propertyId, filters.propertyId));
    }
    if (filters?.suggestionType) {
      conditions.push(eq(targetUpgradeSuggestions.suggestionType, filters.suggestionType));
    }
    if (filters?.isRead !== undefined) {
      conditions.push(eq(targetUpgradeSuggestions.isRead, filters.isRead));
    }
    if (filters?.isDismissed !== undefined) {
      conditions.push(eq(targetUpgradeSuggestions.isDismissed, filters.isDismissed));
    }

    return await db
      .select()
      .from(targetUpgradeSuggestions)
      .where(and(...conditions))
      .orderBy(desc(targetUpgradeSuggestions.createdAt));
  }

  async createSuggestion(data: Omit<InsertTargetUpgradeSuggestion, "organizationId">): Promise<TargetUpgradeSuggestion> {
    const [suggestion] = await db
      .insert(targetUpgradeSuggestions)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return suggestion;
  }

  async markSuggestionAsRead(id: number): Promise<TargetUpgradeSuggestion | undefined> {
    const [suggestion] = await db
      .update(targetUpgradeSuggestions)
      .set({ isRead: true })
      .where(and(
        eq(targetUpgradeSuggestions.id, id),
        eq(targetUpgradeSuggestions.organizationId, this.organizationId)
      ))
      .returning();
    return suggestion;
  }

  async dismissSuggestion(id: number): Promise<TargetUpgradeSuggestion | undefined> {
    const [suggestion] = await db
      .update(targetUpgradeSuggestions)
      .set({ isDismissed: true })
      .where(and(
        eq(targetUpgradeSuggestions.id, id),
        eq(targetUpgradeSuggestions.organizationId, this.organizationId)
      ))
      .returning();
    return suggestion;
  }

  // ===== PROGRESS TRACKING =====

  async getProgressTracking(targetId: number): Promise<TargetProgressTracking[]> {
    return await db
      .select()
      .from(targetProgressTracking)
      .where(and(
        eq(targetProgressTracking.targetId, targetId),
        eq(targetProgressTracking.organizationId, this.organizationId)
      ))
      .orderBy(desc(targetProgressTracking.recordDate));
  }

  async createProgressRecord(data: Omit<InsertTargetProgressTracking, "organizationId">): Promise<TargetProgressTracking> {
    const [record] = await db
      .insert(targetProgressTracking)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return record;
  }

  // ===== ANALYTICS & DASHBOARD =====

  async getTargetDashboard(propertyId?: number): Promise<{
    totalTargets: number;
    activeTargets: number;
    targetsOnTrack: number;
    totalUpgrades: number;
    pendingUpgrades: number;
    completedUpgrades: number;
    unreadSuggestions: number;
  }> {
    const propertyCondition = propertyId 
      ? eq(propertyRevenueTargets.propertyId, propertyId)
      : sql`1=1`;

    const [stats] = await db
      .select({
        totalTargets: sql<number>`COUNT(DISTINCT ${propertyRevenueTargets.id})`,
        activeTargets: sql<number>`COUNT(DISTINCT CASE WHEN ${propertyRevenueTargets.isActive} = true THEN ${propertyRevenueTargets.id} END)`,
        targetsOnTrack: sql<number>`COUNT(DISTINCT CASE WHEN ${propertyRevenueTargets.currentRevenue}::numeric >= ${propertyRevenueTargets.targetAmount}::numeric * 0.8 THEN ${propertyRevenueTargets.id} END)`,
        totalUpgrades: sql<number>`COUNT(DISTINCT ${propertyUpgradeWishlist.id})`,
        pendingUpgrades: sql<number>`COUNT(DISTINCT CASE WHEN ${propertyUpgradeWishlist.status} IN ('planned', 'confirmed') THEN ${propertyUpgradeWishlist.id} END)`,
        completedUpgrades: sql<number>`COUNT(DISTINCT CASE WHEN ${propertyUpgradeWishlist.status} = 'completed' THEN ${propertyUpgradeWishlist.id} END)`,
        unreadSuggestions: sql<number>`COUNT(DISTINCT CASE WHEN ${targetUpgradeSuggestions.isRead} = false AND ${targetUpgradeSuggestions.isDismissed} = false THEN ${targetUpgradeSuggestions.id} END)`,
      })
      .from(propertyRevenueTargets)
      .leftJoin(propertyUpgradeWishlist, eq(propertyRevenueTargets.id, propertyUpgradeWishlist.targetId))
      .leftJoin(targetUpgradeSuggestions, eq(propertyRevenueTargets.propertyId, targetUpgradeSuggestions.propertyId))
      .where(and(
        eq(propertyRevenueTargets.organizationId, this.organizationId),
        propertyCondition
      ));

    return {
      totalTargets: stats.totalTargets || 0,
      activeTargets: stats.activeTargets || 0,
      targetsOnTrack: stats.targetsOnTrack || 0,
      totalUpgrades: stats.totalUpgrades || 0,
      pendingUpgrades: stats.pendingUpgrades || 0,
      completedUpgrades: stats.completedUpgrades || 0,
      unreadSuggestions: stats.unreadSuggestions || 0,
    };
  }

  // ===== DEMO DATA =====

  async getDemoRevenueTargets(): Promise<(PropertyRevenueTarget & { propertyName?: string })[]> {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        targetYear: currentYear,
        targetQuarter: null,
        targetAmount: "3000000.00",
        currency: "THB",
        currentRevenue: "2400000.00",
        description: "3M THB annual revenue target",
        isActive: true,
        createdBy: "demo-pm",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
        propertyName: "Villa Samui Breeze",
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 2,
        targetYear: currentYear,
        targetQuarter: 2,
        targetAmount: "750000.00",
        currency: "THB",
        currentRevenue: "620000.00",
        description: "Q2 target with pool upgrade milestone",
        isActive: true,
        createdBy: "demo-owner",
        createdAt: new Date("2024-04-01"),
        updatedAt: new Date(),
        propertyName: "Villa Tropical Paradise",
      },
    ];
  }

  async getDemoUpgradeWishlist(): Promise<(PropertyUpgradeWishlist & { propertyName?: string; targetDescription?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        targetId: 1,
        upgradeName: "Premium Sunbeds",
        description: "Replace old pool loungers with luxury teak sunbeds",
        triggerAmount: "2500000.00",
        estimatedCost: "180000.00",
        currency: "THB",
        priority: "high",
        status: "confirmed",
        deadline: "2024-12-31",
        category: "outdoor",
        notes: "Triggered! Revenue target 83% achieved",
        createdBy: "demo-pm",
        approvedBy: "demo-owner",
        approvedAt: new Date("2024-06-15"),
        completedAt: null,
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date(),
        propertyName: "Villa Samui Breeze",
        targetDescription: "3M THB annual revenue target",
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        targetId: 1,
        upgradeName: "Smart TV Upgrade",
        description: "Install 65\" 4K Smart TVs in all bedrooms",
        triggerAmount: "2800000.00",
        estimatedCost: "250000.00",
        currency: "THB",
        priority: "medium",
        status: "planned",
        deadline: "2025-01-31",
        category: "technology",
        notes: "Pending revenue milestone - need 400K more",
        createdBy: "demo-owner",
        approvedBy: null,
        approvedAt: null,
        completedAt: null,
        createdAt: new Date("2024-06-10"),
        updatedAt: new Date(),
        propertyName: "Villa Samui Breeze",
        targetDescription: "3M THB annual revenue target",
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        targetId: 2,
        upgradeName: "Outdoor Dining Set",
        description: "Teak dining table with 8 chairs for terrace",
        triggerAmount: "600000.00",
        estimatedCost: "120000.00",
        currency: "THB",
        priority: "high",
        status: "completed",
        deadline: "2024-06-30",
        category: "furniture",
        notes: "Completed ahead of schedule!",
        createdBy: "demo-pm",
        approvedBy: "demo-pm",
        approvedAt: new Date("2024-05-20"),
        completedAt: new Date("2024-06-25"),
        createdAt: new Date("2024-05-15"),
        updatedAt: new Date(),
        propertyName: "Villa Tropical Paradise",
        targetDescription: "Q2 target with pool upgrade milestone",
      },
    ];
  }

  async getDemoSuggestions(): Promise<TargetUpgradeSuggestion[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        suggestionType: "price_increase",
        title: "Consider Rate Increase",
        message: "Your occupancy rate is 92% this month. Consider increasing nightly rates by 10-15% for peak season.",
        suggestedAction: "Update base rates from ฿12,000 to ฿13,500 for December-February",
        confidence: "0.87",
        isRead: false,
        isDismissed: false,
        metadata: {
          currentRate: 12000,
          suggestedRate: 13500,
          occupancyRate: 0.92,
          seasonality: "peak"
        },
        createdAt: new Date("2024-07-01"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        suggestionType: "upgrade_timing",
        title: "Optimal Upgrade Window",
        message: "Low season (September-October) identified as ideal time for TV upgrades. Minimal booking disruption expected.",
        suggestedAction: "Schedule Smart TV installation for September 15-30 when occupancy drops to 45%",
        confidence: "0.91",
        isRead: true,
        isDismissed: false,
        metadata: {
          lowSeasonMonths: ["September", "October"],
          expectedOccupancy: 0.45,
          upgradeCategory: "technology"
        },
        createdAt: new Date("2024-06-28"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        suggestionType: "performance_alert",
        title: "Q2 Target Exceeded!",
        message: "Congratulations! You've exceeded your Q2 target by 12%. Consider setting a stretch goal for Q3.",
        suggestedAction: "Set Q3 target at ฿800,000 (20% increase) and plan kitchen appliance upgrades",
        confidence: "0.95",
        isRead: false,
        isDismissed: false,
        metadata: {
          targetAmount: 750000,
          actualAmount: 840000,
          exceededBy: 0.12,
          quarter: 2
        },
        createdAt: new Date("2024-07-02"),
      },
    ];
  }
}