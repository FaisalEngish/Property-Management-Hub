import { db } from "./db";
import { 
  propertyWaterSources, 
  waterConsumptionEntries, 
  waterConsumptionAlerts, 
  waterSuppliers,
  properties,
  type PropertyWaterSource,
  type InsertPropertyWaterSource,
  type WaterConsumptionEntry,
  type InsertWaterConsumptionEntry,
  type WaterConsumptionAlert,
  type InsertWaterConsumptionAlert,
  type WaterSupplier,
  type InsertWaterSupplier
} from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql, count } from "drizzle-orm";

export class WaterUtilityEnhancedStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Water Sources Management
  async getWaterSources(filters?: {
    propertyId?: number;
    sourceType?: string;
    isActive?: boolean;
  }): Promise<(PropertyWaterSource & { propertyName?: string })[]> {
    let query = db
      .select({
        ...propertyWaterSources,
        propertyName: properties.name,
      })
      .from(propertyWaterSources)
      .leftJoin(properties, eq(propertyWaterSources.propertyId, properties.id))
      .where(eq(propertyWaterSources.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.propertyId, filters.propertyId)
      ));
    }

    if (filters?.sourceType) {
      query = query.where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.sourceType, filters.sourceType)
      ));
    }

    if (filters?.isActive !== undefined) {
      query = query.where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.isActive, filters.isActive)
      ));
    }

    return await query.orderBy(asc(propertyWaterSources.sourceName));
  }

  async getWaterSource(id: number): Promise<PropertyWaterSource | undefined> {
    const [source] = await db
      .select()
      .from(propertyWaterSources)
      .where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.id, id)
      ));
    return source;
  }

  async createWaterSource(data: Omit<InsertPropertyWaterSource, "organizationId">): Promise<PropertyWaterSource> {
    const [source] = await db
      .insert(propertyWaterSources)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return source;
  }

  async updateWaterSource(id: number, data: Partial<InsertPropertyWaterSource>): Promise<PropertyWaterSource | undefined> {
    const [source] = await db
      .update(propertyWaterSources)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.id, id)
      ))
      .returning();
    return source;
  }

  async deleteWaterSource(id: number): Promise<boolean> {
    const result = await db
      .delete(propertyWaterSources)
      .where(and(
        eq(propertyWaterSources.organizationId, this.organizationId),
        eq(propertyWaterSources.id, id)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Water Consumption Entries Management
  async getConsumptionEntries(filters?: {
    propertyId?: number;
    sourceId?: number;
    entryType?: string;
    isEmergency?: boolean;
    startDate?: Date;
    endDate?: Date;
    paidBy?: string;
  }): Promise<(WaterConsumptionEntry & { propertyName?: string; sourceName?: string })[]> {
    let query = db
      .select({
        ...waterConsumptionEntries,
        propertyName: properties.name,
        sourceName: propertyWaterSources.sourceName,
      })
      .from(waterConsumptionEntries)
      .leftJoin(properties, eq(waterConsumptionEntries.propertyId, properties.id))
      .leftJoin(propertyWaterSources, eq(waterConsumptionEntries.sourceId, propertyWaterSources.id))
      .where(eq(waterConsumptionEntries.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.propertyId, filters.propertyId)
      ));
    }

    if (filters?.sourceId) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.sourceId, filters.sourceId)
      ));
    }

    if (filters?.entryType) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.entryType, filters.entryType)
      ));
    }

    if (filters?.isEmergency !== undefined) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.isEmergency, filters.isEmergency)
      ));
    }

    if (filters?.startDate) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        gte(waterConsumptionEntries.entryDate, filters.startDate)
      ));
    }

    if (filters?.endDate) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        lte(waterConsumptionEntries.entryDate, filters.endDate)
      ));
    }

    if (filters?.paidBy) {
      query = query.where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.paidBy, filters.paidBy)
      ));
    }

    return await query.orderBy(desc(waterConsumptionEntries.entryDate));
  }

  async getConsumptionEntry(id: number): Promise<WaterConsumptionEntry | undefined> {
    const [entry] = await db
      .select()
      .from(waterConsumptionEntries)
      .where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.id, id)
      ));
    return entry;
  }

  async createConsumptionEntry(data: Omit<InsertWaterConsumptionEntry, "organizationId">): Promise<WaterConsumptionEntry> {
    const [entry] = await db
      .insert(waterConsumptionEntries)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();

    // Check for AI alert triggers after creating entry
    await this.checkAndCreateAlerts(data.propertyId);

    return entry;
  }

  async updateConsumptionEntry(id: number, data: Partial<InsertWaterConsumptionEntry>): Promise<WaterConsumptionEntry | undefined> {
    const [entry] = await db
      .update(waterConsumptionEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.id, id)
      ))
      .returning();
    return entry;
  }

  async deleteConsumptionEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(waterConsumptionEntries)
      .where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.id, id)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Alerts Management
  async getAlerts(filters?: {
    propertyId?: number;
    alertType?: string;
    severity?: string;
    isActive?: boolean;
  }): Promise<(WaterConsumptionAlert & { propertyName?: string })[]> {
    let query = db
      .select({
        ...waterConsumptionAlerts,
        propertyName: properties.name,
      })
      .from(waterConsumptionAlerts)
      .leftJoin(properties, eq(waterConsumptionAlerts.propertyId, properties.id))
      .where(eq(waterConsumptionAlerts.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(and(
        eq(waterConsumptionAlerts.organizationId, this.organizationId),
        eq(waterConsumptionAlerts.propertyId, filters.propertyId)
      ));
    }

    if (filters?.alertType) {
      query = query.where(and(
        eq(waterConsumptionAlerts.organizationId, this.organizationId),
        eq(waterConsumptionAlerts.alertType, filters.alertType)
      ));
    }

    if (filters?.severity) {
      query = query.where(and(
        eq(waterConsumptionAlerts.organizationId, this.organizationId),
        eq(waterConsumptionAlerts.severity, filters.severity)
      ));
    }

    if (filters?.isActive !== undefined) {
      query = query.where(and(
        eq(waterConsumptionAlerts.organizationId, this.organizationId),
        eq(waterConsumptionAlerts.isActive, filters.isActive)
      ));
    }

    return await query.orderBy(desc(waterConsumptionAlerts.createdAt));
  }

  async acknowledgeAlert(id: number, acknowledgedBy: string): Promise<WaterConsumptionAlert | undefined> {
    const [alert] = await db
      .update(waterConsumptionAlerts)
      .set({
        acknowledgedBy,
        acknowledgedAt: new Date(),
      })
      .where(and(
        eq(waterConsumptionAlerts.organizationId, this.organizationId),
        eq(waterConsumptionAlerts.id, id)
      ))
      .returning();
    return alert;
  }

  // Suppliers Management
  async getSuppliers(filters?: {
    isActive?: boolean;
    isPreferred?: boolean;
  }): Promise<WaterSupplier[]> {
    let query = db
      .select()
      .from(waterSuppliers)
      .where(eq(waterSuppliers.organizationId, this.organizationId));

    if (filters?.isActive !== undefined) {
      query = query.where(and(
        eq(waterSuppliers.organizationId, this.organizationId),
        eq(waterSuppliers.isActive, filters.isActive)
      ));
    }

    if (filters?.isPreferred !== undefined) {
      query = query.where(and(
        eq(waterSuppliers.organizationId, this.organizationId),
        eq(waterSuppliers.isPreferred, filters.isPreferred)
      ));
    }

    return await query.orderBy(desc(waterSuppliers.isPreferred), asc(waterSuppliers.supplierName));
  }

  async createSupplier(data: Omit<InsertWaterSupplier, "organizationId">): Promise<WaterSupplier> {
    const [supplier] = await db
      .insert(waterSuppliers)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return supplier;
  }

  async updateSupplier(id: number, data: Partial<InsertWaterSupplier>): Promise<WaterSupplier | undefined> {
    const [supplier] = await db
      .update(waterSuppliers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(waterSuppliers.organizationId, this.organizationId),
        eq(waterSuppliers.id, id)
      ))
      .returning();
    return supplier;
  }

  // Analytics and Dashboard
  async getWaterConsumptionSummary(propertyId?: number): Promise<{
    totalEntries: number;
    emergencyDeliveries: number;
    totalCost: number;
    averageCostPerLiter: number;
    monthlyBreakdown: Array<{
      month: string;
      totalCost: number;
      totalVolume: number;
      emergencyCount: number;
    }>;
    sourceTypeBreakdown: Array<{
      sourceType: string;
      totalCost: number;
      totalVolume: number;
      entryCount: number;
    }>;
  }> {
    const baseCondition = propertyId 
      ? and(eq(waterConsumptionEntries.organizationId, this.organizationId), eq(waterConsumptionEntries.propertyId, propertyId))
      : eq(waterConsumptionEntries.organizationId, this.organizationId);

    // Get basic summary stats
    const [summary] = await db
      .select({
        totalEntries: count(waterConsumptionEntries.id),
        emergencyDeliveries: sql<number>`sum(case when ${waterConsumptionEntries.isEmergency} then 1 else 0 end)::int`,
        totalCost: sql<number>`sum(${waterConsumptionEntries.totalCost})::numeric`,
        totalVolume: sql<number>`sum(coalesce(${waterConsumptionEntries.volumeLiters}, 0))::int`,
      })
      .from(waterConsumptionEntries)
      .where(baseCondition);

    const averageCostPerLiter = summary.totalVolume > 0 ? summary.totalCost / summary.totalVolume : 0;

    // Get monthly breakdown (last 6 months)
    const monthlyBreakdown = await db
      .select({
        month: sql<string>`to_char(${waterConsumptionEntries.entryDate}, 'YYYY-MM')`,
        totalCost: sql<number>`sum(${waterConsumptionEntries.totalCost})::numeric`,
        totalVolume: sql<number>`sum(coalesce(${waterConsumptionEntries.volumeLiters}, 0))::int`,
        emergencyCount: sql<number>`sum(case when ${waterConsumptionEntries.isEmergency} then 1 else 0 end)::int`,
      })
      .from(waterConsumptionEntries)
      .where(and(
        baseCondition,
        gte(waterConsumptionEntries.entryDate, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000))
      ))
      .groupBy(sql`to_char(${waterConsumptionEntries.entryDate}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${waterConsumptionEntries.entryDate}, 'YYYY-MM') desc`);

    // Get source type breakdown
    const sourceTypeBreakdown = await db
      .select({
        sourceType: propertyWaterSources.sourceType,
        totalCost: sql<number>`sum(${waterConsumptionEntries.totalCost})::numeric`,
        totalVolume: sql<number>`sum(coalesce(${waterConsumptionEntries.volumeLiters}, 0))::int`,
        entryCount: count(waterConsumptionEntries.id),
      })
      .from(waterConsumptionEntries)
      .leftJoin(propertyWaterSources, eq(waterConsumptionEntries.sourceId, propertyWaterSources.id))
      .where(baseCondition)
      .groupBy(propertyWaterSources.sourceType)
      .orderBy(sql`sum(${waterConsumptionEntries.totalCost}) desc`);

    return {
      totalEntries: summary.totalEntries,
      emergencyDeliveries: summary.emergencyDeliveries,
      totalCost: summary.totalCost,
      averageCostPerLiter,
      monthlyBreakdown,
      sourceTypeBreakdown: sourceTypeBreakdown.map(item => ({
        sourceType: item.sourceType || 'Unknown',
        totalCost: item.totalCost,
        totalVolume: item.totalVolume,
        entryCount: item.entryCount,
      })),
    };
  }

  // AI Alert Logic
  private async checkAndCreateAlerts(propertyId: number): Promise<void> {
    // Check for frequent emergency deliveries (3+ in 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [emergencyCount] = await db
      .select({
        count: count(waterConsumptionEntries.id),
      })
      .from(waterConsumptionEntries)
      .where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.propertyId, propertyId),
        eq(waterConsumptionEntries.isEmergency, true),
        gte(waterConsumptionEntries.entryDate, thirtyDaysAgo)
      ));

    if (emergencyCount.count >= 3) {
      await this.createAlert({
        propertyId,
        alertType: 'frequent_emergency',
        alertMessage: `Property has had ${emergencyCount.count} emergency water deliveries in the last 30 days. Consider investigating water supply issues.`,
        severity: 'high',
        triggerCount: emergencyCount.count,
        triggerPeriodDays: 30,
        recommendations: 'Check main water source, inspect for leaks, consider upgrading to more reliable water source.',
        aiGenerated: true,
      });
    }

    // Check for no entries during dry season (20+ days without entry)
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const [recentEntries] = await db
      .select({
        count: count(waterConsumptionEntries.id),
      })
      .from(waterConsumptionEntries)
      .where(and(
        eq(waterConsumptionEntries.organizationId, this.organizationId),
        eq(waterConsumptionEntries.propertyId, propertyId),
        gte(waterConsumptionEntries.entryDate, twentyDaysAgo)
      ));

    if (recentEntries.count === 0) {
      await this.createAlert({
        propertyId,
        alertType: 'no_entry_dry_season',
        alertMessage: 'No water consumption entries recorded for 20+ days. Please verify water usage and billing status.',
        severity: 'medium',
        daysSinceLastEntry: 20,
        recommendations: 'Update water consumption records, check for missing bills, verify property occupancy.',
        aiGenerated: true,
      });
    }
  }

  private async createAlert(data: Omit<InsertWaterConsumptionAlert, "organizationId">): Promise<WaterConsumptionAlert> {
    const [alert] = await db
      .insert(waterConsumptionAlerts)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return alert;
  }

  // Demo Data Methods
  async getDemoWaterSources(): Promise<(PropertyWaterSource & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceType: 'government',
        sourceName: 'Municipal Water Supply',
        isActive: true,
        isPrimary: true,
        billingCycle: 'monthly',
        accountNumber: 'GW-001-2024',
        supplierName: null,
        contactNumber: '+66-2-123-4567',
        averageCostPerLiter: '0.0085',
        currency: 'THB',
        setupDate: new Date('2024-01-15'),
        notes: 'Primary water source for Property',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-01'),
        propertyName: 'Property',
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceType: 'emergency_truck',
        sourceName: 'Emergency Water Delivery',
        isActive: true,
        isPrimary: false,
        billingCycle: null,
        accountNumber: null,
        supplierName: 'Samui Water Express',
        contactNumber: '+66-77-987-6543',
        averageCostPerLiter: '0.055',
        currency: 'THB',
        setupDate: new Date('2024-03-10'),
        notes: 'Backup water supply for emergencies and peak season',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-12-01'),
        propertyName: 'Property',
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        sourceType: 'deepwell',
        sourceName: 'Private Deep Well',
        isActive: true,
        isPrimary: true,
        billingCycle: 'quarterly',
        accountNumber: 'DW-002-2024',
        supplierName: null,
        contactNumber: '+66-2-234-5678',
        averageCostPerLiter: '0.0045',
        currency: 'THB',
        setupDate: new Date('2024-02-01'),
        notes: 'Private well with electric pump system',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-01'),
        propertyName: 'Property',
      },
    ];
  }

  async getDemoConsumptionEntries(): Promise<(WaterConsumptionEntry & { propertyName?: string; sourceName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceId: 1,
        entryType: 'bill',
        entryDate: new Date('2024-12-01'),
        volumeLiters: null,
        totalCost: '485.50',
        costPerLiter: null,
        currency: 'THB',
        billDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-25'),
        billNumber: 'GW-12-2024-001',
        units: 'm3',
        unitRate: '12.15',
        supplierName: null,
        deliveryType: null,
        driverName: null,
        truckLicensePlate: null,
        paidBy: 'management',
        paidByCustom: null,
        paymentStatus: 'paid',
        paidAt: new Date('2024-12-05'),
        isEmergency: false,
        urgencyLevel: null,
        emergencyReason: null,
        receiptUrl: '/uploads/water-bills/gw-001-dec2024.pdf',
        proofOfDeliveryUrl: null,
        notes: 'Regular monthly government water bill',
        createdBy: 'demo-admin',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-05'),
        propertyName: 'Property',
        sourceName: 'Municipal Water Supply',
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceId: 2,
        entryType: 'emergency_delivery',
        entryDate: new Date('2024-11-28'),
        volumeLiters: 2000,
        totalCost: '110.00',
        costPerLiter: '0.055',
        currency: 'THB',
        billDate: null,
        dueDate: null,
        billNumber: null,
        units: 'liters',
        unitRate: null,
        supplierName: 'Samui Water Express',
        deliveryType: 'emergency',
        driverName: 'Somsak Thanakit',
        truckLicensePlate: '1กท-1234',
        paidBy: 'owner',
        paidByCustom: null,
        paymentStatus: 'paid',
        paidAt: new Date('2024-11-28'),
        isEmergency: true,
        urgencyLevel: 'high',
        emergencyReason: 'Municipal water supply interrupted due to maintenance',
        receiptUrl: '/uploads/delivery-receipts/emergency-nov28-2024.pdf',
        proofOfDeliveryUrl: '/uploads/delivery-proof/truck-photo-nov28.jpg',
        notes: '🔴 EMERGENCY - Municipal supply down for 3 days',
        createdBy: 'demo-pm',
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-11-28'),
        propertyName: 'Property',
        sourceName: 'Emergency Water Delivery',
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 2,
        sourceId: 3,
        entryType: 'bill',
        entryDate: new Date('2024-11-15'),
        volumeLiters: null,
        totalCost: '320.75',
        costPerLiter: null,
        currency: 'THB',
        billDate: new Date('2024-11-15'),
        dueDate: new Date('2025-01-15'),
        billNumber: 'DW-Q4-2024-002',
        units: 'kWh',
        unitRate: '5.85',
        supplierName: null,
        deliveryType: null,
        driverName: null,
        truckLicensePlate: null,
        paidBy: 'management',
        paidByCustom: null,
        paymentStatus: 'pending',
        paidAt: null,
        isEmergency: false,
        urgencyLevel: null,
        emergencyReason: null,
        receiptUrl: '/uploads/well-bills/dw-q4-2024.pdf',
        proofOfDeliveryUrl: null,
        notes: 'Quarterly electricity bill for deep well pump operation',
        createdBy: 'demo-admin',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15'),
        propertyName: 'Property',
        sourceName: 'Private Deep Well',
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceId: 2,
        entryType: 'emergency_delivery',
        entryDate: new Date('2024-11-15'),
        volumeLiters: 1500,
        totalCost: '90.00',
        costPerLiter: '0.060',
        currency: 'THB',
        billDate: null,
        dueDate: null,
        billNumber: null,
        units: 'liters',
        unitRate: null,
        supplierName: 'Samui Water Express',
        deliveryType: 'emergency',
        driverName: 'Niran Wongchai',
        truckLicensePlate: '1กท-5678',
        paidBy: 'owner',
        paidByCustom: null,
        paymentStatus: 'paid',
        paidAt: new Date('2024-11-15'),
        isEmergency: true,
        urgencyLevel: 'critical',
        emergencyReason: 'Tank leak discovered, immediate top-up required',
        receiptUrl: '/uploads/delivery-receipts/emergency-nov15-2024.pdf',
        proofOfDeliveryUrl: '/uploads/delivery-proof/tank-leak-photo.jpg',
        notes: '🔴 EMERGENCY - Tank repair needed urgently',
        createdBy: 'demo-pm',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15'),
        propertyName: 'Property',
        sourceName: 'Emergency Water Delivery',
      },
      {
        id: 5,
        organizationId: this.organizationId,
        propertyId: 1,
        sourceId: 2,
        entryType: 'emergency_delivery',
        entryDate: new Date('2024-11-02'),
        volumeLiters: 3000,
        totalCost: '165.00',
        costPerLiter: '0.055',
        currency: 'THB',
        billDate: null,
        dueDate: null,
        billNumber: null,
        units: 'liters',
        unitRate: null,
        supplierName: 'Samui Water Express',
        deliveryType: 'emergency',
        driverName: 'Preecha Samart',
        truckLicensePlate: '1กท-9012',
        paidBy: 'management',
        paidByCustom: null,
        paymentStatus: 'paid',
        paidAt: new Date('2024-11-02'),
        isEmergency: true,
        urgencyLevel: 'high',
        emergencyReason: 'High occupancy weekend, extra water needed for guest comfort',
        receiptUrl: '/uploads/delivery-receipts/emergency-nov02-2024.pdf',
        proofOfDeliveryUrl: '/uploads/delivery-proof/full-tank-confirmation.jpg',
        notes: '🔴 EMERGENCY - Peak season demand surge',
        createdBy: 'demo-staff',
        createdAt: new Date('2024-11-02'),
        updatedAt: new Date('2024-11-02'),
        propertyName: 'Property',
        sourceName: 'Emergency Water Delivery',
      },
    ];
  }

  async getDemoSuppliers(): Promise<WaterSupplier[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        supplierName: 'Samui Water Express',
        contactPerson: 'Khun Somsak Thanakit',
        phoneNumber: '+66-77-987-6543',
        alternatePhone: '+66-89-123-4567',
        email: 'delivery@samuiwater.co.th',
        serviceAreas: '["Koh Samui", "Chaweng", "Lamai", "Nathon", "Bophut"]',
        vehicleTypes: '["6000L Truck", "3000L Truck", "1500L Pickup"]',
        minimumOrder: 1000,
        maximumCapacity: 6000,
        pricePerLiter: '0.055',
        emergencyUpcharge: '15.00',
        currency: 'THB',
        averageResponseTime: 2,
        reliabilityRating: '4.50',
        totalDeliveries: 47,
        isActive: true,
        isPreferred: true,
        notes: 'Reliable emergency water supplier with 24/7 service. Preferred vendor for all Samui properties.',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        supplierName: 'Island Pure Water Co.',
        contactPerson: 'Ms. Siriporn Watana',
        phoneNumber: '+66-77-456-7890',
        alternatePhone: '+66-81-987-6543',
        email: 'orders@islandpure.th',
        serviceAreas: '["Koh Samui", "Koh Phangan", "Koh Tao"]',
        vehicleTypes: '["8000L Truck", "4000L Truck"]',
        minimumOrder: 2000,
        maximumCapacity: 8000,
        pricePerLiter: '0.048',
        emergencyUpcharge: '20.00',
        currency: 'THB',
        averageResponseTime: 4,
        reliabilityRating: '4.20',
        totalDeliveries: 23,
        isActive: true,
        isPreferred: false,
        notes: 'Good backup supplier with competitive pricing. Longer response times but reliable for planned deliveries.',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-11-20'),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        supplierName: 'Quick H2O Delivery',
        contactPerson: 'Mr. Narong Sukhum',
        phoneNumber: '+66-77-234-5678',
        alternatePhone: null,
        email: 'info@quickh2o.com',
        serviceAreas: '["Chaweng", "Lamai", "Fisherman Village"]',
        vehicleTypes: '["2000L Truck", "1000L Pickup"]',
        minimumOrder: 500,
        maximumCapacity: 2000,
        pricePerLiter: '0.065',
        emergencyUpcharge: '25.00',
        currency: 'THB',
        averageResponseTime: 1,
        reliabilityRating: '3.80',
        totalDeliveries: 15,
        isActive: true,
        isPreferred: false,
        notes: 'Fast response times but higher pricing. Good for urgent small deliveries in central areas.',
        createdAt: new Date('2024-07-20'),
        updatedAt: new Date('2024-10-15'),
      },
    ];
  }

  async getDemoAlerts(): Promise<(WaterConsumptionAlert & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        alertType: 'frequent_emergency',
        alertMessage: 'Property has had 3 emergency water deliveries in the last 30 days. Consider investigating water supply issues.',
        severity: 'high',
        triggerCount: 3,
        triggerPeriodDays: 30,
        daysSinceLastEntry: null,
        sourceType: 'emergency_truck',
        recommendations: 'Check main water source, inspect for leaks, consider upgrading to more reliable water source.',
        aiGenerated: true,
        isActive: true,
        acknowledgedBy: null,
        acknowledgedAt: null,
        notes: null,
        createdAt: new Date('2024-11-28'),
        propertyName: 'Property',
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 2,
        alertType: 'overdue_bill',
        alertMessage: 'Deep well electricity bill (DW-Q4-2024-002) is overdue by 15 days. Please process payment immediately.',
        severity: 'medium',
        triggerCount: null,
        triggerPeriodDays: 30,
        daysSinceLastEntry: null,
        sourceType: 'deepwell',
        recommendations: 'Process payment to avoid service disruption. Set up automatic payment reminders.',
        aiGenerated: false,
        isActive: true,
        acknowledgedBy: null,
        acknowledgedAt: null,
        notes: null,
        createdAt: new Date('2024-11-30'),
        propertyName: 'Property',
      },
    ];
  }
}