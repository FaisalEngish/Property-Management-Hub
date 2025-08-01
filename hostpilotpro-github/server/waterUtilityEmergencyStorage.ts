import { db } from "./db";
import {
  waterUtilitySources,
  emergencyWaterDeliveries,
  waterUtilityBills,
  waterUtilityAlerts,
  propertyWaterSettings,
  properties,
  type WaterUtilitySource,
  type InsertWaterUtilitySource,
  type EmergencyWaterDelivery,
  type InsertEmergencyWaterDelivery,
  type WaterUtilityBill,
  type InsertWaterUtilityBill,
  type WaterUtilityAlert,
  type InsertWaterUtilityAlert,
  type PropertyWaterSetting,
  type InsertPropertyWaterSetting,
} from "@shared/schema";
import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";

export class WaterUtilityEmergencyStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== WATER UTILITY SOURCES =====
  async getWaterUtilitySources(propertyId?: number): Promise<WaterUtilitySource[]> {
    const filters = [eq(waterUtilitySources.organizationId, this.organizationId)];
    if (propertyId) {
      filters.push(eq(waterUtilitySources.propertyId, propertyId));
    }

    return await db
      .select()
      .from(waterUtilitySources)
      .where(and(...filters))
      .orderBy(desc(waterUtilitySources.createdAt));
  }

  async createWaterUtilitySource(data: Omit<InsertWaterUtilitySource, "organizationId">): Promise<WaterUtilitySource> {
    const [source] = await db
      .insert(waterUtilitySources)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return source;
  }

  async updateWaterUtilitySource(id: number, data: Partial<InsertWaterUtilitySource>): Promise<WaterUtilitySource | undefined> {
    const [source] = await db
      .update(waterUtilitySources)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(waterUtilitySources.id, id),
        eq(waterUtilitySources.organizationId, this.organizationId)
      ))
      .returning();
    return source;
  }

  // ===== EMERGENCY WATER DELIVERIES =====
  async getEmergencyWaterDeliveries(filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<(EmergencyWaterDelivery & { propertyName?: string })[]> {
    const conditions = [eq(emergencyWaterDeliveries.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(emergencyWaterDeliveries.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      conditions.push(gte(emergencyWaterDeliveries.deliveryDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(emergencyWaterDeliveries.deliveryDate, filters.endDate));
    }

    const deliveries = await db
      .select({
        id: emergencyWaterDeliveries.id,
        organizationId: emergencyWaterDeliveries.organizationId,
        propertyId: emergencyWaterDeliveries.propertyId,
        supplierName: emergencyWaterDeliveries.supplierName,
        deliveryDate: emergencyWaterDeliveries.deliveryDate,
        volumeLiters: emergencyWaterDeliveries.volumeLiters,
        costTHB: emergencyWaterDeliveries.costTHB,
        costPerLiter: emergencyWaterDeliveries.costPerLiter,
        receiptUrl: emergencyWaterDeliveries.receiptUrl,
        notes: emergencyWaterDeliveries.notes,
        linkedGuestBooking: emergencyWaterDeliveries.linkedGuestBooking,
        linkedEvent: emergencyWaterDeliveries.linkedEvent,
        deliveryType: emergencyWaterDeliveries.deliveryType,
        billingType: emergencyWaterDeliveries.billingType,
        processedBy: emergencyWaterDeliveries.processedBy,
        approvedBy: emergencyWaterDeliveries.approvedBy,
        status: emergencyWaterDeliveries.status,
        createdAt: emergencyWaterDeliveries.createdAt,
        updatedAt: emergencyWaterDeliveries.updatedAt,
        propertyName: properties.name,
      })
      .from(emergencyWaterDeliveries)
      .leftJoin(properties, eq(emergencyWaterDeliveries.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(emergencyWaterDeliveries.deliveryDate));

    return deliveries;
  }

  async createEmergencyWaterDelivery(data: Omit<InsertEmergencyWaterDelivery, "organizationId">): Promise<EmergencyWaterDelivery> {
    // Auto-calculate cost per liter
    const costPerLiter = data.costTHB && data.volumeLiters 
      ? parseFloat(data.costTHB) / data.volumeLiters
      : 0;

    const [delivery] = await db
      .insert(emergencyWaterDeliveries)
      .values({
        ...data,
        organizationId: this.organizationId,
        costPerLiter: costPerLiter.toString(),
      })
      .returning();
    return delivery;
  }

  async updateEmergencyWaterDelivery(id: number, data: Partial<InsertEmergencyWaterDelivery>): Promise<EmergencyWaterDelivery | undefined> {
    // Recalculate cost per liter if relevant fields are updated
    let updateData = { ...data };
    if (data.totalCost || data.litersDelivered) {
      const existingDelivery = await db
        .select()
        .from(emergencyWaterDeliveries)
        .where(and(
          eq(emergencyWaterDeliveries.id, id),
          eq(emergencyWaterDeliveries.organizationId, this.organizationId)
        ))
        .limit(1);

      if (existingDelivery.length > 0) {
        const totalCost = data.totalCost || existingDelivery[0].totalCost;
        const litersDelivered = data.litersDelivered || existingDelivery[0].litersDelivered;
        
        if (totalCost && litersDelivered) {
          updateData.costPerLiter = (parseFloat(totalCost) / parseFloat(litersDelivered)).toString();
        }
      }
    }

    const [delivery] = await db
      .update(emergencyWaterDeliveries)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(
        eq(emergencyWaterDeliveries.id, id),
        eq(emergencyWaterDeliveries.organizationId, this.organizationId)
      ))
      .returning();
    return delivery;
  }

  async deleteEmergencyWaterDelivery(id: number): Promise<boolean> {
    const result = await db
      .delete(emergencyWaterDeliveries)
      .where(and(
        eq(emergencyWaterDeliveries.id, id),
        eq(emergencyWaterDeliveries.organizationId, this.organizationId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===== WATER UTILITY BILLS =====
  async getWaterUtilityBills(filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    billType?: string;
    paymentStatus?: string;
  }): Promise<(WaterUtilityBill & { propertyName?: string })[]> {
    const conditions = [eq(waterUtilityBills.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(waterUtilityBills.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      conditions.push(gte(waterUtilityBills.billDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(waterUtilityBills.billDate, filters.endDate));
    }
    if (filters?.billType) {
      conditions.push(eq(waterUtilityBills.billType, filters.billType));
    }
    if (filters?.paymentStatus) {
      conditions.push(eq(waterUtilityBills.paymentStatus, filters.paymentStatus));
    }

    const bills = await db
      .select({
        id: waterUtilityBills.id,
        organizationId: waterUtilityBills.organizationId,
        propertyId: waterUtilityBills.propertyId,
        billType: waterUtilityBills.billType,
        billDate: waterUtilityBills.billDate,
        dueDate: waterUtilityBills.dueDate,
        amount: waterUtilityBills.amount,
        currency: waterUtilityBills.currency,
        units: waterUtilityBills.units,
        unitRate: waterUtilityBills.unitRate,
        paymentStatus: waterUtilityBills.paymentStatus,
        paidDate: waterUtilityBills.paidDate,
        receiptUrl: waterUtilityBills.receiptUrl,
        sourceType: waterUtilityBills.sourceType,
        emergencyDeliveryId: waterUtilityBills.emergencyDeliveryId,
        notes: waterUtilityBills.notes,
        createdAt: waterUtilityBills.createdAt,
        updatedAt: waterUtilityBills.updatedAt,
        propertyName: properties.name,
      })
      .from(waterUtilityBills)
      .leftJoin(properties, eq(waterUtilityBills.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(waterUtilityBills.billDate));

    return bills;
  }

  async createWaterUtilityBill(data: Omit<InsertWaterUtilityBill, "organizationId">): Promise<WaterUtilityBill> {
    const [bill] = await db
      .insert(waterUtilityBills)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return bill;
  }

  async updateWaterUtilityBill(id: number, data: Partial<InsertWaterUtilityBill>): Promise<WaterUtilityBill | undefined> {
    const [bill] = await db
      .update(waterUtilityBills)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(waterUtilityBills.id, id),
        eq(waterUtilityBills.organizationId, this.organizationId)
      ))
      .returning();
    return bill;
  }

  // ===== WATER UTILITY ALERTS =====
  async getWaterUtilityAlerts(filters?: {
    propertyId?: number;
    alertType?: string;
    isActive?: boolean;
  }): Promise<(WaterUtilityAlert & { propertyName?: string })[]> {
    const conditions = [eq(waterUtilityAlerts.organizationId, this.organizationId)];
    
    if (filters?.propertyId) {
      conditions.push(eq(waterUtilityAlerts.propertyId, filters.propertyId));
    }
    if (filters?.alertType) {
      conditions.push(eq(waterUtilityAlerts.alertType, filters.alertType));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(waterUtilityAlerts.isActive, filters.isActive));
    }

    const alerts = await db
      .select({
        id: waterUtilityAlerts.id,
        organizationId: waterUtilityAlerts.organizationId,
        propertyId: waterUtilityAlerts.propertyId,
        alertType: waterUtilityAlerts.alertType,
        alertDate: waterUtilityAlerts.alertDate,
        expectedBillDate: waterUtilityAlerts.expectedBillDate,
        daysSinceLastBill: waterUtilityAlerts.daysSinceLastBill,
        alertMessage: waterUtilityAlerts.alertMessage,
        isActive: waterUtilityAlerts.isActive,
        dismissedBy: waterUtilityAlerts.dismissedBy,
        dismissedAt: waterUtilityAlerts.dismissedAt,
        actionTaken: waterUtilityAlerts.actionTaken,
        notes: waterUtilityAlerts.notes,
        createdAt: waterUtilityAlerts.createdAt,
        propertyName: properties.name,
      })
      .from(waterUtilityAlerts)
      .leftJoin(properties, eq(waterUtilityAlerts.propertyId, properties.id))
      .where(and(...conditions))
      .orderBy(desc(waterUtilityAlerts.alertDate));

    return alerts;
  }

  async createWaterUtilityAlert(data: Omit<InsertWaterUtilityAlert, "organizationId">): Promise<WaterUtilityAlert> {
    const [alert] = await db
      .insert(waterUtilityAlerts)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return alert;
  }

  async dismissWaterUtilityAlert(id: number, dismissedBy: string, actionTaken?: string): Promise<WaterUtilityAlert | undefined> {
    const [alert] = await db
      .update(waterUtilityAlerts)
      .set({
        isActive: false,
        dismissedBy,
        dismissedAt: new Date(),
        actionTaken,
      })
      .where(and(
        eq(waterUtilityAlerts.id, id),
        eq(waterUtilityAlerts.organizationId, this.organizationId)
      ))
      .returning();
    return alert;
  }

  // ===== PROPERTY WATER SETTINGS =====
  async getPropertyWaterSettings(propertyId?: number): Promise<PropertyWaterSetting[]> {
    const conditions = [eq(propertyWaterSettings.organizationId, this.organizationId)];
    if (propertyId) {
      conditions.push(eq(propertyWaterSettings.propertyId, propertyId));
    }

    return await db
      .select()
      .from(propertyWaterSettings)
      .where(and(...conditions))
      .orderBy(desc(propertyWaterSettings.createdAt));
  }

  async createPropertyWaterSetting(data: Omit<InsertPropertyWaterSetting, "organizationId">): Promise<PropertyWaterSetting> {
    const [setting] = await db
      .insert(propertyWaterSettings)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return setting;
  }

  async updatePropertyWaterSetting(id: number, data: Partial<InsertPropertyWaterSetting>): Promise<PropertyWaterSetting | undefined> {
    const [setting] = await db
      .update(propertyWaterSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(propertyWaterSettings.id, id),
        eq(propertyWaterSettings.organizationId, this.organizationId)
      ))
      .returning();
    return setting;
  }

  // ===== ANALYTICS AND REPORTING =====
  async getWaterUtilityAnalytics(propertyId?: number) {
    const conditions = [eq(emergencyWaterDeliveries.organizationId, this.organizationId)];
    if (propertyId) {
      conditions.push(eq(emergencyWaterDeliveries.propertyId, propertyId));
    }

    // Get emergency delivery statistics
    const deliveries = await db
      .select()
      .from(emergencyWaterDeliveries)
      .where(and(...conditions));

    const totalDeliveries = deliveries.length;
    const totalLiters = deliveries.reduce((sum, d) => sum + parseFloat(d.litersDelivered), 0);
    const totalCost = deliveries.reduce((sum, d) => sum + parseFloat(d.totalCost), 0);
    const averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    // Get active alerts count
    const activeAlerts = await db
      .select()
      .from(waterUtilityAlerts)
      .where(and(
        eq(waterUtilityAlerts.organizationId, this.organizationId),
        eq(waterUtilityAlerts.isActive, true),
        ...(propertyId ? [eq(waterUtilityAlerts.propertyId, propertyId)] : [])
      ));

    // Get recent billing activity
    const billConditions = [eq(waterUtilityBills.organizationId, this.organizationId)];
    if (propertyId) {
      billConditions.push(eq(waterUtilityBills.propertyId, propertyId));
    }

    const bills = await db
      .select()
      .from(waterUtilityBills)
      .where(and(...billConditions));

    const overdueBills = bills.filter(b => 
      b.paymentStatus === 'pending' && 
      b.dueDate && 
      new Date(b.dueDate) < new Date()
    ).length;

    return {
      emergencyDeliveries: {
        totalDeliveries,
        totalLiters,
        totalCost,
        averageCostPerLiter,
      },
      alerts: {
        activeAlerts: activeAlerts.length,
      },
      billing: {
        totalBills: bills.length,
        overdueBills,
        paidBills: bills.filter(b => b.paymentStatus === 'paid').length,
      },
    };
  }

  // ===== DEMO DATA METHODS =====
  async getDemoEmergencyWaterDeliveries(): Promise<(EmergencyWaterDelivery & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        supplierName: "Samui Water Express",
        deliveryDate: "2024-12-15",
        volumeLiters: 5000,
        costTHB: "750.00",
        costPerLiter: "0.15",
        receiptUrl: null,
        notes: "Emergency delivery due to main water line maintenance",
        linkedGuestBooking: null,
        linkedEvent: null,
        deliveryType: "unexpected",
        billingType: "owner_billable",
        processedBy: "demo-pm",
        approvedBy: null,
        status: "completed",
        createdAt: new Date("2024-12-15T10:30:00Z"),
        updatedAt: new Date("2024-12-15T10:30:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Villa Tropical Paradise",
        supplierName: "Island H2O Services",
        deliveryDate: "2024-12-20",
        volumeLiters: 3000,
        costTHB: "480.00",
        costPerLiter: "0.16",
        receiptUrl: null,
        notes: "Backup supply during peak season",
        linkedGuestBooking: null,
        linkedEvent: null,
        deliveryType: "planned",
        billingType: "company_expense",
        processedBy: "demo-admin",
        approvedBy: "demo-admin",
        status: "completed",
        createdAt: new Date("2024-12-20T14:15:00Z"),
        updatedAt: new Date("2024-12-20T14:15:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        supplierName: "Samui Water Express",
        deliveryDate: "2025-01-03",
        volumeLiters: 4000,
        costTHB: "620.00",
        costPerLiter: "0.155",
        receiptUrl: null,
        notes: "Regular emergency supply during dry season",
        linkedGuestBooking: null,
        linkedEvent: null,
        deliveryType: "preventable",
        billingType: "owner_billable",
        processedBy: "demo-staff",
        approvedBy: null,
        status: "pending",
        createdAt: new Date("2025-01-03T09:00:00Z"),
        updatedAt: new Date("2025-01-03T09:00:00Z"),
      },
    ];
  }

  async getDemoWaterUtilityBills(): Promise<(WaterUtilityBill & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        billType: "regular_bill",
        billDate: "2024-12-01",
        dueDate: "2024-12-20",
        amount: "450.00",
        currency: "THB",
        units: "15.00",
        unitRate: "30.00",
        paymentStatus: "paid",
        paidDate: "2024-12-18",
        receiptUrl: null,
        sourceType: "government_water",
        emergencyDeliveryId: null,
        notes: "Regular monthly water bill",
        createdAt: new Date("2024-12-01T00:00:00Z"),
        updatedAt: new Date("2024-12-18T16:30:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        billType: "emergency_delivery",
        billDate: "2024-12-15",
        dueDate: null,
        amount: "750.00",
        currency: "THB",
        units: "5000.00",
        unitRate: "0.15",
        paymentStatus: "paid",
        paidDate: "2024-12-15",
        receiptUrl: null,
        sourceType: "emergency_truck",
        emergencyDeliveryId: 1,
        notes: "Emergency water truck delivery",
        createdAt: new Date("2024-12-15T10:30:00Z"),
        updatedAt: new Date("2024-12-15T10:30:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Villa Tropical Paradise",
        billType: "regular_bill",
        billDate: "2025-01-01",
        dueDate: "2025-01-20",
        amount: "520.00",
        currency: "THB",
        units: "18.00",
        unitRate: "28.89",
        paymentStatus: "pending",
        paidDate: null,
        receiptUrl: null,
        sourceType: "government_water",
        emergencyDeliveryId: null,
        notes: "January 2025 water bill",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
      },
    ];
  }

  async getDemoWaterUtilityAlerts(): Promise<(WaterUtilityAlert & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Villa Tropical Paradise",
        alertType: "emergency_prompt",
        alertDate: new Date("2025-01-05T08:00:00Z"),
        expectedBillDate: "2025-01-01",
        daysSinceLastBill: 35,
        alertMessage: "No water bills logged for 35 days. Did you have an emergency truck delivery?",
        isActive: true,
        dismissedBy: null,
        dismissedAt: null,
        actionTaken: null,
        notes: null,
        createdAt: new Date("2025-01-05T08:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        alertType: "overdue_payment",
        alertDate: new Date("2024-12-21T10:00:00Z"),
        expectedBillDate: null,
        daysSinceLastBill: null,
        alertMessage: "Water bill payment is 1 day overdue (Due: Dec 20, 2024)",
        isActive: false,
        dismissedBy: "demo-admin",
        dismissedAt: new Date("2024-12-21T14:30:00Z"),
        actionTaken: "payment_processed",
        notes: "Payment completed on Dec 21",
        createdAt: new Date("2024-12-21T10:00:00Z"),
      },
    ];
  }

  async getDemoPropertyWaterSettings(): Promise<PropertyWaterSetting[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        primarySource: "government_water",
        expectedBillCycle: 30,
        autoAlertEnabled: true,
        alertThresholdDays: 7,
        emergencySupplierContact: "Samui Water Express: +66-77-123-456",
        averageMonthlyUsage: "16.50",
        usageUnit: "cubic_meters",
        notes: "Primary villa with garden irrigation needs",
        createdAt: new Date("2024-11-01T00:00:00Z"),
        updatedAt: new Date("2024-12-15T10:30:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 2,
        primarySource: "deepwell",
        expectedBillCycle: 45,
        autoAlertEnabled: true,
        alertThresholdDays: 10,
        emergencySupplierContact: "Island H2O Services: +66-77-987-654",
        averageMonthlyUsage: "12.00",
        usageUnit: "cubic_meters",
        notes: "Secondary villa with well water backup",
        createdAt: new Date("2024-11-01T00:00:00Z"),
        updatedAt: new Date("2024-11-01T00:00:00Z"),
      },
    ];
  }

  async getDemoWaterUtilityAnalytics() {
    return {
      emergencyDeliveries: {
        totalDeliveries: 3,
        totalLiters: 12000,
        totalCost: 1850,
        averageCostPerLiter: 0.154,
      },
      alerts: {
        activeAlerts: 1,
      },
      billing: {
        totalBills: 3,
        overdueBills: 0,
        paidBills: 2,
      },
    };
  }
}