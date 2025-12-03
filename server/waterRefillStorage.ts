import { db } from "./db";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { 
  waterUtilityRefills, 
  waterRefillAlerts, 
  waterRefillBills,
  properties,
  type WaterUtilityRefill,
  type InsertWaterUtilityRefill,
  type WaterRefillAlert,
  type InsertWaterRefillAlert,
  type WaterRefillBill,
  type InsertWaterRefillBill
} from "@shared/schema";

interface RefillFilters {
  propertyId?: number;
  status?: string;
  waterType?: string;
  billingRoute?: string;
  fromDate?: Date;
  toDate?: Date;
}

interface RefillAnalytics {
  totalRefills: number;
  totalLiters: number;
  totalCost: number;
  averageCostPerLiter: number;
  monthlyUsage: Array<{
    month: string;
    liters: number;
    cost: number;
    refillCount: number;
  }>;
  alertsTriggered: number;
  propertyBreakdown: Array<{
    propertyId: number;
    propertyName: string;
    refillCount: number;
    totalLiters: number;
    totalCost: number;
    averageCostPerLiter: number;
  }>;
}

export class WaterRefillStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Water Refills CRUD
  async getWaterRefills(filters: RefillFilters = {}): Promise<Array<WaterUtilityRefill & { propertyName: string }>> {
    let query = db
      .select({
        id: waterUtilityRefills.id,
        organizationId: waterUtilityRefills.organizationId,
        propertyId: waterUtilityRefills.propertyId,
        propertyName: properties.name,
        deliveryDate: waterUtilityRefills.deliveryDate,
        litersDelivered: waterUtilityRefills.litersDelivered,
        costAmount: waterUtilityRefills.costAmount,
        costPerLiter: waterUtilityRefills.costPerLiter,
        supplierName: waterUtilityRefills.supplierName,
        supplierContact: waterUtilityRefills.supplierContact,
        waterType: waterUtilityRefills.waterType,
        billingRoute: waterUtilityRefills.billingRoute,
        notes: waterUtilityRefills.notes,
        status: waterUtilityRefills.status,
        createdBy: waterUtilityRefills.createdBy,
        createdAt: waterUtilityRefills.createdAt,
        updatedAt: waterUtilityRefills.updatedAt,
      })
      .from(waterUtilityRefills)
      .leftJoin(properties, eq(waterUtilityRefills.propertyId, properties.id))
      .where(eq(waterUtilityRefills.organizationId, this.organizationId))
      .orderBy(desc(waterUtilityRefills.deliveryDate));

    // Apply filters
    const conditions = [eq(waterUtilityRefills.organizationId, this.organizationId)];
    
    if (filters.propertyId) {
      conditions.push(eq(waterUtilityRefills.propertyId, filters.propertyId));
    }
    if (filters.status) {
      conditions.push(eq(waterUtilityRefills.status, filters.status));
    }
    if (filters.waterType) {
      conditions.push(eq(waterUtilityRefills.waterType, filters.waterType));
    }
    if (filters.billingRoute) {
      conditions.push(eq(waterUtilityRefills.billingRoute, filters.billingRoute));
    }
    if (filters.fromDate) {
      conditions.push(gte(waterUtilityRefills.deliveryDate, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(waterUtilityRefills.deliveryDate, filters.toDate));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getWaterRefill(id: number): Promise<WaterUtilityRefill | undefined> {
    const [refill] = await db
      .select()
      .from(waterUtilityRefills)
      .where(
        and(
          eq(waterUtilityRefills.id, id),
          eq(waterUtilityRefills.organizationId, this.organizationId)
        )
      );
    return refill;
  }

  async createWaterRefill(data: Omit<InsertWaterUtilityRefill, 'organizationId'>): Promise<WaterUtilityRefill> {
    const [refill] = await db
      .insert(waterUtilityRefills)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();

    // Check for frequency alerts after creating
    await this.checkFrequencyAlerts(data.propertyId);

    return refill;
  }

  async updateWaterRefill(id: number, data: Partial<InsertWaterUtilityRefill>): Promise<WaterUtilityRefill | undefined> {
    const [refill] = await db
      .update(waterUtilityRefills)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(waterUtilityRefills.id, id),
          eq(waterUtilityRefills.organizationId, this.organizationId)
        )
      )
      .returning();

    return refill;
  }

  async deleteWaterRefill(id: number): Promise<boolean> {
    const result = await db
      .delete(waterUtilityRefills)
      .where(
        and(
          eq(waterUtilityRefills.id, id),
          eq(waterUtilityRefills.organizationId, this.organizationId)
        )
      );

    return result.rowCount > 0;
  }

  // Analytics
  async getRefillAnalytics(filters: RefillFilters = {}): Promise<RefillAnalytics> {
    const conditions = [eq(waterUtilityRefills.organizationId, this.organizationId)];
    
    if (filters.propertyId) {
      conditions.push(eq(waterUtilityRefills.propertyId, filters.propertyId));
    }
    if (filters.fromDate) {
      conditions.push(gte(waterUtilityRefills.deliveryDate, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(waterUtilityRefills.deliveryDate, filters.toDate));
    }

    // Get basic totals
    const [totals] = await db
      .select({
        totalRefills: count(),
        totalLiters: sql<number>`sum(${waterUtilityRefills.litersDelivered})`,
        totalCost: sql<number>`sum(${waterUtilityRefills.costAmount})`,
        averageCostPerLiter: sql<number>`avg(${waterUtilityRefills.costPerLiter})`,
      })
      .from(waterUtilityRefills)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

    // Get monthly usage
    const monthlyUsage = await db
      .select({
        month: sql<string>`to_char(${waterUtilityRefills.deliveryDate}, 'YYYY-MM')`,
        liters: sql<number>`sum(${waterUtilityRefills.litersDelivered})`,
        cost: sql<number>`sum(${waterUtilityRefills.costAmount})`,
        refillCount: count(),
      })
      .from(waterUtilityRefills)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .groupBy(sql`to_char(${waterUtilityRefills.deliveryDate}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${waterUtilityRefills.deliveryDate}, 'YYYY-MM') desc`)
      .limit(12);

    // Get property breakdown
    const propertyBreakdown = await db
      .select({
        propertyId: waterUtilityRefills.propertyId,
        propertyName: properties.name,
        refillCount: count(),
        totalLiters: sql<number>`sum(${waterUtilityRefills.litersDelivered})`,
        totalCost: sql<number>`sum(${waterUtilityRefills.costAmount})`,
        averageCostPerLiter: sql<number>`avg(${waterUtilityRefills.costPerLiter})`,
      })
      .from(waterUtilityRefills)
      .leftJoin(properties, eq(waterUtilityRefills.propertyId, properties.id))
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .groupBy(waterUtilityRefills.propertyId, properties.name)
      .orderBy(desc(sql`sum(${waterUtilityRefills.costAmount})`));

    // Get alerts count
    const [alertsCount] = await db
      .select({ count: count() })
      .from(waterRefillAlerts)
      .where(
        and(
          eq(waterRefillAlerts.organizationId, this.organizationId),
          eq(waterRefillAlerts.isAcknowledged, false)
        )
      );

    return {
      totalRefills: totals.totalRefills || 0,
      totalLiters: totals.totalLiters || 0,
      totalCost: Number(totals.totalCost) || 0,
      averageCostPerLiter: Number(totals.averageCostPerLiter) || 0,
      monthlyUsage: monthlyUsage.map(m => ({
        month: m.month,
        liters: m.liters || 0,
        cost: Number(m.cost) || 0,
        refillCount: m.refillCount || 0,
      })),
      alertsTriggered: alertsCount.count || 0,
      propertyBreakdown: propertyBreakdown.map(p => ({
        propertyId: p.propertyId,
        propertyName: p.propertyName || 'Unknown Property',
        refillCount: p.refillCount || 0,
        totalLiters: p.totalLiters || 0,
        totalCost: Number(p.totalCost) || 0,
        averageCostPerLiter: Number(p.averageCostPerLiter) || 0,
      })),
    };
  }

  // Alerts
  async getRefillAlerts(propertyId?: number): Promise<Array<WaterRefillAlert & { propertyName: string }>> {
    let query = db
      .select({
        id: waterRefillAlerts.id,
        organizationId: waterRefillAlerts.organizationId,
        propertyId: waterRefillAlerts.propertyId,
        propertyName: properties.name,
        alertType: waterRefillAlerts.alertType,
        alertMessage: waterRefillAlerts.alertMessage,
        triggerCount: waterRefillAlerts.triggerCount,
        triggerPeriodDays: waterRefillAlerts.triggerPeriodDays,
        severity: waterRefillAlerts.severity,
        recommendations: waterRefillAlerts.recommendations,
        isAcknowledged: waterRefillAlerts.isAcknowledged,
        acknowledgedBy: waterRefillAlerts.acknowledgedBy,
        acknowledgedAt: waterRefillAlerts.acknowledgedAt,
        createdAt: waterRefillAlerts.createdAt,
      })
      .from(waterRefillAlerts)
      .leftJoin(properties, eq(waterRefillAlerts.propertyId, properties.id))
      .where(eq(waterRefillAlerts.organizationId, this.organizationId))
      .orderBy(desc(waterRefillAlerts.createdAt));

    if (propertyId) {
      query = query.where(
        and(
          eq(waterRefillAlerts.organizationId, this.organizationId),
          eq(waterRefillAlerts.propertyId, propertyId)
        )
      );
    }

    return await query;
  }

  async createRefillAlert(data: Omit<InsertWaterRefillAlert, 'organizationId'>): Promise<WaterRefillAlert> {
    const [alert] = await db
      .insert(waterRefillAlerts)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();

    return alert;
  }

  async acknowledgeAlert(alertId: number, acknowledgedBy: string): Promise<WaterRefillAlert | undefined> {
    const [alert] = await db
      .update(waterRefillAlerts)
      .set({
        isAcknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      })
      .where(
        and(
          eq(waterRefillAlerts.id, alertId),
          eq(waterRefillAlerts.organizationId, this.organizationId)
        )
      )
      .returning();

    return alert;
  }

  // Frequency alert checking
  async checkFrequencyAlerts(propertyId: number): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count refills in the last 30 days
    const [refillCount] = await db
      .select({ count: count() })
      .from(waterUtilityRefills)
      .where(
        and(
          eq(waterUtilityRefills.organizationId, this.organizationId),
          eq(waterUtilityRefills.propertyId, propertyId),
          gte(waterUtilityRefills.deliveryDate, thirtyDaysAgo)
        )
      );

    // Trigger alert if 2 or more refills in 30 days
    if (refillCount.count >= 2) {
      // Check if we already have an unacknowledged alert for this property
      const [existingAlert] = await db
        .select()
        .from(waterRefillAlerts)
        .where(
          and(
            eq(waterRefillAlerts.organizationId, this.organizationId),
            eq(waterRefillAlerts.propertyId, propertyId),
            eq(waterRefillAlerts.alertType, 'frequency_alert'),
            eq(waterRefillAlerts.isAcknowledged, false)
          )
        );

      if (!existingAlert) {
        await this.createRefillAlert({
          propertyId,
          alertType: 'frequency_alert',
          alertMessage: `High frequency emergency water refills detected: ${refillCount.count} refills in the last 30 days`,
          triggerCount: refillCount.count,
          triggerPeriodDays: 30,
          severity: refillCount.count >= 4 ? 'high' : 'medium',
          recommendations: refillCount.count >= 4 
            ? 'URGENT: Consider immediate water system inspection and deepwell upgrade. Multiple emergency refills indicate serious water supply issues.'
            : 'Recommend water system inspection to identify potential issues. Consider deepwell servicing or tank maintenance.',
        });
      }
    }
  }

  // Bills
  async createRefillBill(data: Omit<InsertWaterRefillBill, 'organizationId'>): Promise<WaterRefillBill> {
    const [bill] = await db
      .insert(waterRefillBills)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();

    return bill;
  }

  async getRefillBills(refillId?: number): Promise<WaterRefillBill[]> {
    let query = db
      .select()
      .from(waterRefillBills)
      .where(eq(waterRefillBills.organizationId, this.organizationId));

    if (refillId) {
      query = query.where(
        and(
          eq(waterRefillBills.organizationId, this.organizationId),
          eq(waterRefillBills.refillId, refillId)
        )
      );
    }

    return await query;
  }

  // Demo data methods
  async createDemoRefills(): Promise<void> {
    const demoRefills = [
      {
        propertyId: 999,
        deliveryDate: new Date('2024-12-15'),
        litersDelivered: 1500,
        costAmount: 3750,
        costPerLiter: 2.5,
        supplierName: 'Thai Water Solutions',
        supplierContact: '02-123-4567',
        waterType: 'emergency_truck',
        billingRoute: 'company_expense',
        notes: 'Emergency delivery due to pump failure',
        createdBy: 'demo-admin',
      },
      {
        propertyId: 999,
        deliveryDate: new Date('2024-12-10'),
        litersDelivered: 2000,
        costAmount: 4800,
        costPerLiter: 2.4,
        supplierName: 'Bangkok Water Co.',
        supplierContact: '02-987-6543',
        waterType: 'emergency_truck',
        billingRoute: 'owner_billable',
        notes: 'Guest requested additional water for pool',
        createdBy: 'demo-pm',
      },
      {
        propertyId: 1000,
        deliveryDate: new Date('2024-11-28'),
        litersDelivered: 1000,
        costAmount: 2800,
        costPerLiter: 2.8,
        supplierName: 'Emergency Water Services',
        supplierContact: '02-555-1234',
        waterType: 'emergency_truck',
        billingRoute: 'guest_billable',
        notes: 'Emergency refill during high season',
        createdBy: 'demo-admin',
      },
      {
        propertyId: 1001,
        deliveryDate: new Date('2024-11-20'),
        litersDelivered: 1800,
        costAmount: 5040,
        costPerLiter: 2.8,
        supplierName: 'Koh Samui Water Supply',
        supplierContact: '077-123-456',
        waterType: 'emergency_truck',
        billingRoute: 'company_expense',
        notes: 'Tank cleaning required emergency delivery',
        createdBy: 'demo-pm',
      },
    ];

    for (const refill of demoRefills) {
      try {
        await this.createWaterRefill(refill);
      } catch (error) {
        // Skip if already exists
        continue;
      }
    }
  }

  async getDemoAnalytics(): Promise<RefillAnalytics> {
    return {
      totalRefills: 4,
      totalLiters: 6300,
      totalCost: 16390,
      averageCostPerLiter: 2.6,
      monthlyUsage: [
        {
          month: '2024-12',
          liters: 3500,
          cost: 8550,
          refillCount: 2,
        },
        {
          month: '2024-11',
          liters: 2800,
          cost: 7840,
          refillCount: 2,
        },
      ],
      alertsTriggered: 1,
      propertyBreakdown: [
        {
          propertyId: 999,
          propertyName: 'Property',
          refillCount: 2,
          totalLiters: 3500,
          totalCost: 8550,
          averageCostPerLiter: 2.44,
        },
        {
          propertyId: 1000,
          propertyName: 'Property',
          refillCount: 1,
          totalLiters: 1000,
          totalCost: 2800,
          averageCostPerLiter: 2.8,
        },
        {
          propertyId: 1001,
          propertyName: 'Property Charm',
          refillCount: 1,
          totalLiters: 1800,
          totalCost: 5040,
          averageCostPerLiter: 2.8,
        },
      ],
    };
  }

  async exportRefillsToCSV(filters: RefillFilters = {}): Promise<string> {
    const refills = await this.getWaterRefills(filters);
    
    const headers = [
      'ID',
      'Property',
      'Delivery Date',
      'Liters Delivered',
      'Total Cost (THB)',
      'Cost per Liter (THB)',
      'Supplier Name',
      'Supplier Contact',
      'Water Type',
      'Billing Route',
      'Status',
      'Notes',
      'Created At'
    ].join(',');

    const rows = refills.map(refill => [
      refill.id,
      `"${refill.propertyName}"`,
      refill.deliveryDate.toISOString().split('T')[0],
      refill.litersDelivered,
      refill.costAmount,
      refill.costPerLiter,
      `"${refill.supplierName || ''}"`,
      `"${refill.supplierContact || ''}"`,
      refill.waterType,
      refill.billingRoute,
      refill.status,
      `"${refill.notes || ''}"`,
      refill.createdAt?.toISOString().split('T')[0] || ''
    ].join(','));

    return [headers, ...rows].join('\n');
  }
}