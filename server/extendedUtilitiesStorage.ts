import { 
  PropertyUtilitiesMaster,
  InsertPropertyUtilitiesMaster,
  UtilityBillsExtended,
  InsertUtilityBillsExtended,
  UtilityAccessPermissions,
  InsertUtilityAccessPermissions,
  UtilityAiPredictions,
  InsertUtilityAiPredictions,
  UtilityNotifications,
  InsertUtilityNotifications,
  propertyUtilitiesMaster,
  utilityBillsExtended,
  utilityAccessPermissions,
  utilityAiPredictions,
  utilityNotifications,
  properties,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, gte, lte, or } from "drizzle-orm";

export class ExtendedUtilitiesStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== PROPERTY UTILITIES MASTER MANAGEMENT =====

  async getPropertyUtilities(propertyId?: number): Promise<PropertyUtilitiesMaster[]> {
    const query = db
      .select()
      .from(propertyUtilitiesMaster)
      .where(
        propertyId 
          ? and(
              eq(propertyUtilitiesMaster.organizationId, this.organizationId),
              eq(propertyUtilitiesMaster.propertyId, propertyId),
              eq(propertyUtilitiesMaster.isActive, true)
            )
          : and(
              eq(propertyUtilitiesMaster.organizationId, this.organizationId),
              eq(propertyUtilitiesMaster.isActive, true)
            )
      )
      .orderBy(propertyUtilitiesMaster.utilityType);

    return await query;
  }

  async getPropertyUtility(id: number): Promise<PropertyUtilitiesMaster | undefined> {
    const [utility] = await db
      .select()
      .from(propertyUtilitiesMaster)
      .where(
        and(
          eq(propertyUtilitiesMaster.id, id),
          eq(propertyUtilitiesMaster.organizationId, this.organizationId)
        )
      );
    
    return utility;
  }

  async createPropertyUtility(utility: InsertPropertyUtilitiesMaster): Promise<PropertyUtilitiesMaster> {
    const [created] = await db
      .insert(propertyUtilitiesMaster)
      .values({
        ...utility,
        organizationId: this.organizationId,
      })
      .returning();

    return created;
  }

  async updatePropertyUtility(id: number, updates: Partial<InsertPropertyUtilitiesMaster>): Promise<PropertyUtilitiesMaster | undefined> {
    const [updated] = await db
      .update(propertyUtilitiesMaster)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(propertyUtilitiesMaster.id, id),
          eq(propertyUtilitiesMaster.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  async deletePropertyUtility(id: number): Promise<boolean> {
    const result = await db
      .update(propertyUtilitiesMaster)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(propertyUtilitiesMaster.id, id),
          eq(propertyUtilitiesMaster.organizationId, this.organizationId)
        )
      );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== UTILITY BILLS MANAGEMENT =====

  async getUtilityBills(filters?: {
    utilityMasterId?: number;
    propertyId?: number;
    billingMonth?: string;
    isPaid?: boolean;
    isLate?: boolean;
    monthsBack?: number;
  }): Promise<(UtilityBillsExtended & { utilityMaster?: PropertyUtilitiesMaster })[]> {
    let whereConditions = [eq(utilityBillsExtended.organizationId, this.organizationId)];

    if (filters?.utilityMasterId) {
      whereConditions.push(eq(utilityBillsExtended.utilityMasterId, filters.utilityMasterId));
    }

    if (filters?.propertyId) {
      whereConditions.push(eq(utilityBillsExtended.propertyId, filters.propertyId));
    }

    if (filters?.billingMonth) {
      whereConditions.push(eq(utilityBillsExtended.billingMonth, filters.billingMonth));
    }

    if (filters?.isPaid !== undefined) {
      whereConditions.push(eq(utilityBillsExtended.isPaid, filters.isPaid));
    }

    if (filters?.isLate !== undefined) {
      whereConditions.push(eq(utilityBillsExtended.isLate, filters.isLate));
    }

    // Filter by months back (for 6-month history)
    if (filters?.monthsBack) {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - filters.monthsBack);
      whereConditions.push(gte(utilityBillsExtended.billingPeriodStart, cutoffDate));
    }

    const bills = await db
      .select({
        id: utilityBillsExtended.id,
        organizationId: utilityBillsExtended.organizationId,
        utilityMasterId: utilityBillsExtended.utilityMasterId,
        propertyId: utilityBillsExtended.propertyId,
        billingMonth: utilityBillsExtended.billingMonth,
        billingPeriodStart: utilityBillsExtended.billingPeriodStart,
        billingPeriodEnd: utilityBillsExtended.billingPeriodEnd,
        amount: utilityBillsExtended.amount,
        currency: utilityBillsExtended.currency,
        isPaid: utilityBillsExtended.isPaid,
        paidDate: utilityBillsExtended.paidDate,
        receiptUploaded: utilityBillsExtended.receiptUploaded,
        receiptFileUrl: utilityBillsExtended.receiptFileUrl,
        receiptFileName: utilityBillsExtended.receiptFileName,
        dueDate: utilityBillsExtended.dueDate,
        expectedArrivalDate: utilityBillsExtended.expectedArrivalDate,
        isLate: utilityBillsExtended.isLate,
        lateReason: utilityBillsExtended.lateReason,
        uploadedBy: utilityBillsExtended.uploadedBy,
        uploadedAt: utilityBillsExtended.uploadedAt,
        notes: utilityBillsExtended.notes,
        createdAt: utilityBillsExtended.createdAt,
        updatedAt: utilityBillsExtended.updatedAt,
        utilityMaster: propertyUtilitiesMaster,
      })
      .from(utilityBillsExtended)
      .leftJoin(
        propertyUtilitiesMaster,
        eq(utilityBillsExtended.utilityMasterId, propertyUtilitiesMaster.id)
      )
      .where(and(...whereConditions))
      .orderBy(desc(utilityBillsExtended.billingPeriodStart));

    return bills;
  }

  async getUtilityBill(id: number): Promise<UtilityBillsExtended | undefined> {
    const [bill] = await db
      .select()
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.id, id),
          eq(utilityBillsExtended.organizationId, this.organizationId)
        )
      );

    return bill;
  }

  async createUtilityBill(bill: InsertUtilityBillsExtended): Promise<UtilityBillsExtended> {
    const [created] = await db
      .insert(utilityBillsExtended)
      .values({
        ...bill,
        organizationId: this.organizationId,
      })
      .returning();

    return created;
  }

  async updateUtilityBill(id: number, updates: Partial<InsertUtilityBillsExtended>): Promise<UtilityBillsExtended | undefined> {
    const [updated] = await db
      .update(utilityBillsExtended)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(utilityBillsExtended.id, id),
          eq(utilityBillsExtended.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  async deleteUtilityBill(id: number): Promise<boolean> {
    const result = await db
      .delete(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.id, id),
          eq(utilityBillsExtended.organizationId, this.organizationId)
        )
      );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== ACCESS PERMISSIONS MANAGEMENT =====

  async getUtilityPermissions(utilityMasterId: number, userRole?: string): Promise<UtilityAccessPermissions[]> {
    const whereConditions = [
      eq(utilityAccessPermissions.organizationId, this.organizationId),
      eq(utilityAccessPermissions.utilityMasterId, utilityMasterId),
    ];

    if (userRole) {
      whereConditions.push(eq(utilityAccessPermissions.userRole, userRole));
    }

    return await db
      .select()
      .from(utilityAccessPermissions)
      .where(and(...whereConditions));
  }

  async createUtilityPermission(permission: InsertUtilityAccessPermissions): Promise<UtilityAccessPermissions> {
    const [created] = await db
      .insert(utilityAccessPermissions)
      .values({
        ...permission,
        organizationId: this.organizationId,
      })
      .returning();

    return created;
  }

  async updateUtilityPermission(id: number, updates: Partial<InsertUtilityAccessPermissions>): Promise<UtilityAccessPermissions | undefined> {
    const [updated] = await db
      .update(utilityAccessPermissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(utilityAccessPermissions.id, id),
          eq(utilityAccessPermissions.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  // ===== AI PREDICTIONS MANAGEMENT =====

  async getUtilityAiPredictions(utilityMasterId?: number, predictionType?: string): Promise<UtilityAiPredictions[]> {
    let whereConditions = [
      eq(utilityAiPredictions.organizationId, this.organizationId),
      eq(utilityAiPredictions.isActive, true),
    ];

    if (utilityMasterId) {
      whereConditions.push(eq(utilityAiPredictions.utilityMasterId, utilityMasterId));
    }

    if (predictionType) {
      whereConditions.push(eq(utilityAiPredictions.predictionType, predictionType));
    }

    return await db
      .select()
      .from(utilityAiPredictions)
      .where(and(...whereConditions))
      .orderBy(desc(utilityAiPredictions.createdAt));
  }

  async createUtilityAiPrediction(prediction: InsertUtilityAiPredictions): Promise<UtilityAiPredictions> {
    const [created] = await db
      .insert(utilityAiPredictions)
      .values({
        ...prediction,
        organizationId: this.organizationId,
      })
      .returning();

    return created;
  }

  async updateUtilityAiPrediction(id: number, updates: Partial<InsertUtilityAiPredictions>): Promise<UtilityAiPredictions | undefined> {
    const [updated] = await db
      .update(utilityAiPredictions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(utilityAiPredictions.id, id),
          eq(utilityAiPredictions.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  // ===== NOTIFICATIONS MANAGEMENT =====

  async getUtilityNotifications(filters?: {
    recipientUserId?: string;
    recipientRole?: string;
    notificationType?: string;
    isRead?: boolean;
    actionRequired?: boolean;
    severity?: string;
  }): Promise<UtilityNotifications[]> {
    let whereConditions = [eq(utilityNotifications.organizationId, this.organizationId)];

    if (filters?.recipientUserId) {
      whereConditions.push(eq(utilityNotifications.recipientUserId, filters.recipientUserId));
    }

    if (filters?.recipientRole) {
      whereConditions.push(eq(utilityNotifications.recipientRole, filters.recipientRole));
    }

    if (filters?.notificationType) {
      whereConditions.push(eq(utilityNotifications.notificationType, filters.notificationType));
    }

    if (filters?.isRead !== undefined) {
      whereConditions.push(eq(utilityNotifications.isRead, filters.isRead));
    }

    if (filters?.actionRequired !== undefined) {
      whereConditions.push(eq(utilityNotifications.actionRequired, filters.actionRequired));
    }

    if (filters?.severity) {
      whereConditions.push(eq(utilityNotifications.severity, filters.severity));
    }

    return await db
      .select()
      .from(utilityNotifications)
      .where(and(...whereConditions))
      .orderBy(desc(utilityNotifications.createdAt));
  }

  async createUtilityNotification(notification: InsertUtilityNotifications): Promise<UtilityNotifications> {
    const [created] = await db
      .insert(utilityNotifications)
      .values({
        ...notification,
        organizationId: this.organizationId,
      })
      .returning();

    return created;
  }

  async markNotificationAsRead(id: number, readByUserId: string): Promise<UtilityNotifications | undefined> {
    const [updated] = await db
      .update(utilityNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(utilityNotifications.id, id),
          eq(utilityNotifications.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  async markNotificationActionTaken(id: number, actionTakenBy: string, actionNotes?: string): Promise<UtilityNotifications | undefined> {
    const [updated] = await db
      .update(utilityNotifications)
      .set({
        actionTaken: true,
        actionTakenBy: actionTakenBy,
        actionTakenAt: new Date(),
        actionNotes: actionNotes,
      })
      .where(
        and(
          eq(utilityNotifications.id, id),
          eq(utilityNotifications.organizationId, this.organizationId)
        )
      )
      .returning();

    return updated;
  }

  // ===== DASHBOARD ANALYTICS =====

  async getDashboardAnalytics(): Promise<{
    totalUtilities: number;
    overdueBills: number;
    upcomingBills: number;
    unpaidBills: number;
    totalUnpaidAmount: number;
    unreadNotifications: number;
    criticalAlerts: number;
    utilityTypeBreakdown: { utilityType: string; count: number }[];
    monthlySpending: { month: string; amount: number }[];
  }> {
    // Get total utilities count
    const totalUtilitiesResult = await db
      .select({ count: propertyUtilitiesMaster.id })
      .from(propertyUtilitiesMaster)
      .where(
        and(
          eq(propertyUtilitiesMaster.organizationId, this.organizationId),
          eq(propertyUtilitiesMaster.isActive, true)
        )
      );

    // Get overdue bills (late bills)
    const overdueBillsResult = await db
      .select({ count: utilityBillsExtended.id })
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.organizationId, this.organizationId),
          eq(utilityBillsExtended.isLate, true),
          eq(utilityBillsExtended.isPaid, false)
        )
      );

    // Get upcoming bills (expected in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingBillsResult = await db
      .select({ count: utilityBillsExtended.id })
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.organizationId, this.organizationId),
          lte(utilityBillsExtended.expectedArrivalDate, nextWeek),
          eq(utilityBillsExtended.isPaid, false)
        )
      );

    // Get unpaid bills count and total amount
    const unpaidBillsResult = await db
      .select({ 
        count: utilityBillsExtended.id,
        totalAmount: utilityBillsExtended.amount 
      })
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.organizationId, this.organizationId),
          eq(utilityBillsExtended.isPaid, false)
        )
      );

    // Get unread notifications
    const unreadNotificationsResult = await db
      .select({ count: utilityNotifications.id })
      .from(utilityNotifications)
      .where(
        and(
          eq(utilityNotifications.organizationId, this.organizationId),
          eq(utilityNotifications.isRead, false)
        )
      );

    // Get critical alerts
    const criticalAlertsResult = await db
      .select({ count: utilityNotifications.id })
      .from(utilityNotifications)
      .where(
        and(
          eq(utilityNotifications.organizationId, this.organizationId),
          eq(utilityNotifications.severity, "critical"),
          eq(utilityNotifications.isRead, false)
        )
      );

    // Get utility type breakdown
    const utilityTypeBreakdown = await db
      .select({
        utilityType: propertyUtilitiesMaster.utilityType,
        count: propertyUtilitiesMaster.id,
      })
      .from(propertyUtilitiesMaster)
      .where(
        and(
          eq(propertyUtilitiesMaster.organizationId, this.organizationId),
          eq(propertyUtilitiesMaster.isActive, true)
        )
      );

    // Get monthly spending for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySpending = await db
      .select({
        month: utilityBillsExtended.billingMonth,
        amount: utilityBillsExtended.amount,
      })
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.organizationId, this.organizationId),
          gte(utilityBillsExtended.billingPeriodStart, sixMonthsAgo)
        )
      );

    return {
      totalUtilities: totalUtilitiesResult.length,
      overdueBills: overdueBillsResult.length,
      upcomingBills: upcomingBillsResult.length,
      unpaidBills: unpaidBillsResult.length,
      totalUnpaidAmount: unpaidBillsResult.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || '0'), 0),
      unreadNotifications: unreadNotificationsResult.length,
      criticalAlerts: criticalAlertsResult.length,
      utilityTypeBreakdown: utilityTypeBreakdown.map(item => ({
        utilityType: item.utilityType,
        count: utilityTypeBreakdown.filter(u => u.utilityType === item.utilityType).length
      })),
      monthlySpending: monthlySpending.reduce((acc, item) => {
        const existing = acc.find(m => m.month === item.month);
        if (existing) {
          existing.amount += parseFloat(item.amount);
        } else {
          acc.push({ month: item.month, amount: parseFloat(item.amount) });
        }
        return acc;
      }, [] as { month: string; amount: number }[])
    };
  }

  // ===== AI PREDICTION HELPERS =====

  async generateArrivalPrediction(utilityMasterId: number): Promise<{
    predictedDate: Date;
    confidenceScore: number;
    averageArrivalDay: number;
    notes: string;
  }> {
    // Get last 6 months of bills for this utility
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const historicalBills = await db
      .select()
      .from(utilityBillsExtended)
      .where(
        and(
          eq(utilityBillsExtended.organizationId, this.organizationId),
          eq(utilityBillsExtended.utilityMasterId, utilityMasterId),
          gte(utilityBillsExtended.billingPeriodStart, sixMonthsAgo)
        )
      )
      .orderBy(desc(utilityBillsExtended.billingPeriodStart));

    if (historicalBills.length === 0) {
      // No historical data, predict middle of month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(15);

      return {
        predictedDate: nextMonth,
        confidenceScore: 0.3,
        averageArrivalDay: 15,
        notes: "No historical data available. Predicted middle of month."
      };
    }

    // Calculate average arrival day
    const arrivalDays = historicalBills
      .filter(bill => bill.uploadedAt)
      .map(bill => new Date(bill.uploadedAt!).getDate());

    const averageDay = arrivalDays.length > 0 
      ? Math.round(arrivalDays.reduce((sum, day) => sum + day, 0) / arrivalDays.length)
      : 15;

    // Calculate confidence based on consistency
    const variance = arrivalDays.length > 1
      ? arrivalDays.reduce((sum, day) => sum + Math.pow(day - averageDay, 2), 0) / arrivalDays.length
      : 0;
    
    const confidenceScore = Math.max(0.1, Math.min(1.0, 1 - (variance / 100)));

    // Predict next month's arrival
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(averageDay);

    return {
      predictedDate: nextMonth,
      confidenceScore,
      averageArrivalDay: averageDay,
      notes: `Based on ${historicalBills.length} months of data. Average arrival: day ${averageDay}.`
    };
  }
}