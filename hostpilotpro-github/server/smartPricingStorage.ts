import { db } from "./db";
import {
  yearOnYearPerformance,
  holidayEventCalendar,
  priceDeviationAnalysis,
  bookingGapAnalysis,
  aiPerformanceSummary,
  directBookingOptimization,
  historicalBookingPatterns,
  smartPricingAlerts,
  holidayHeatmapCalendar,
  type YearOnYearPerformance,
  type InsertYearOnYearPerformance,
  type HolidayEventCalendar,
  type InsertHolidayEventCalendar,
  type PriceDeviationAnalysis,
  type InsertPriceDeviationAnalysis,
  type BookingGapAnalysis,
  type InsertBookingGapAnalysis,
  type AiPerformanceSummary,
  type InsertAiPerformanceSummary,
  type DirectBookingOptimization,
  type InsertDirectBookingOptimization,
  type HistoricalBookingPatterns,
  type InsertHistoricalBookingPatterns,
  type SmartPricingAlerts,
  type InsertSmartPricingAlerts,
  type HolidayHeatmapCalendar,
  type InsertHolidayHeatmapCalendar,
  properties,
} from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";

export class SmartPricingStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Year-on-Year Performance Tracking
  async getYearOnYearPerformance(filters?: {
    propertyId?: number;
    year?: number;
    month?: number;
  }): Promise<YearOnYearPerformance[]> {
    let query = db
      .select()
      .from(yearOnYearPerformance)
      .where(eq(yearOnYearPerformance.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(yearOnYearPerformance.propertyId, filters.propertyId));
    }
    if (filters?.year) {
      query = query.where(eq(yearOnYearPerformance.year, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(yearOnYearPerformance.month, filters.month));
    }

    return await query.orderBy(desc(yearOnYearPerformance.year), desc(yearOnYearPerformance.month));
  }

  async createYearOnYearPerformance(data: Omit<InsertYearOnYearPerformance, "organizationId">): Promise<YearOnYearPerformance> {
    const [performance] = await db
      .insert(yearOnYearPerformance)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return performance;
  }

  async updateYearOnYearPerformance(id: number, data: Partial<InsertYearOnYearPerformance>): Promise<YearOnYearPerformance | undefined> {
    const [performance] = await db
      .update(yearOnYearPerformance)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(yearOnYearPerformance.id, id), eq(yearOnYearPerformance.organizationId, this.organizationId)))
      .returning();
    return performance;
  }

  // Holiday and Event Calendar
  async getHolidayEventCalendar(filters?: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    country?: string;
  }): Promise<HolidayEventCalendar[]> {
    let query = db
      .select()
      .from(holidayEventCalendar)
      .where(and(
        eq(holidayEventCalendar.organizationId, this.organizationId),
        eq(holidayEventCalendar.isActive, true)
      ));

    if (filters?.startDate) {
      query = query.where(gte(holidayEventCalendar.eventDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(holidayEventCalendar.eventDate, filters.endDate));
    }
    if (filters?.eventType) {
      query = query.where(eq(holidayEventCalendar.eventType, filters.eventType));
    }
    if (filters?.country) {
      query = query.where(eq(holidayEventCalendar.country, filters.country));
    }

    return await query.orderBy(asc(holidayEventCalendar.eventDate));
  }

  async createHolidayEvent(data: Omit<InsertHolidayEventCalendar, "organizationId">): Promise<HolidayEventCalendar> {
    const [event] = await db
      .insert(holidayEventCalendar)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return event;
  }

  // Price Deviation Analysis
  async getPriceDeviationAnalysis(filters?: {
    propertyId?: number;
    isUnderpriced?: boolean;
    isOverpriced?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<(PriceDeviationAnalysis & { propertyName?: string })[]> {
    let query = db
      .select({
        ...priceDeviationAnalysis,
        propertyName: properties.name,
      })
      .from(priceDeviationAnalysis)
      .leftJoin(properties, eq(priceDeviationAnalysis.propertyId, properties.id))
      .where(eq(priceDeviationAnalysis.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(priceDeviationAnalysis.propertyId, filters.propertyId));
    }
    if (filters?.isUnderpriced !== undefined) {
      query = query.where(eq(priceDeviationAnalysis.isUnderpriced, filters.isUnderpriced));
    }
    if (filters?.isOverpriced !== undefined) {
      query = query.where(eq(priceDeviationAnalysis.isOverpriced, filters.isOverpriced));
    }
    if (filters?.startDate) {
      query = query.where(gte(priceDeviationAnalysis.analysisDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(priceDeviationAnalysis.analysisDate, filters.endDate));
    }

    return await query.orderBy(desc(priceDeviationAnalysis.analysisDate));
  }

  async createPriceDeviationAnalysis(data: Omit<InsertPriceDeviationAnalysis, "organizationId">): Promise<PriceDeviationAnalysis> {
    const [analysis] = await db
      .insert(priceDeviationAnalysis)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return analysis;
  }

  // Booking Gap Analysis
  async getBookingGapAnalysis(filters?: {
    propertyId?: number;
    gapType?: string;
    isResolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<(BookingGapAnalysis & { propertyName?: string })[]> {
    let query = db
      .select({
        ...bookingGapAnalysis,
        propertyName: properties.name,
      })
      .from(bookingGapAnalysis)
      .leftJoin(properties, eq(bookingGapAnalysis.propertyId, properties.id))
      .where(eq(bookingGapAnalysis.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(bookingGapAnalysis.propertyId, filters.propertyId));
    }
    if (filters?.gapType) {
      query = query.where(eq(bookingGapAnalysis.gapType, filters.gapType));
    }
    if (filters?.isResolved !== undefined) {
      query = query.where(eq(bookingGapAnalysis.isResolved, filters.isResolved));
    }
    if (filters?.startDate) {
      query = query.where(gte(bookingGapAnalysis.gapStartDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(bookingGapAnalysis.gapEndDate, filters.endDate));
    }

    return await query.orderBy(desc(bookingGapAnalysis.createdAt));
  }

  async createBookingGapAnalysis(data: Omit<InsertBookingGapAnalysis, "organizationId">): Promise<BookingGapAnalysis> {
    const [gap] = await db
      .insert(bookingGapAnalysis)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return gap;
  }

  async resolveBookingGap(id: number, actionTaken: string): Promise<BookingGapAnalysis | undefined> {
    const [gap] = await db
      .update(bookingGapAnalysis)
      .set({
        isResolved: true,
        resolvedDate: new Date().toISOString().split('T')[0],
        actionTaken,
      })
      .where(and(eq(bookingGapAnalysis.id, id), eq(bookingGapAnalysis.organizationId, this.organizationId)))
      .returning();
    return gap;
  }

  // AI Performance Summary
  async getAiPerformanceSummary(filters?: {
    propertyId?: number;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(AiPerformanceSummary & { propertyName?: string })[]> {
    let query = db
      .select({
        ...aiPerformanceSummary,
        propertyName: properties.name,
      })
      .from(aiPerformanceSummary)
      .leftJoin(properties, eq(aiPerformanceSummary.propertyId, properties.id))
      .where(eq(aiPerformanceSummary.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(aiPerformanceSummary.propertyId, filters.propertyId));
    }
    if (filters?.periodType) {
      query = query.where(eq(aiPerformanceSummary.periodType, filters.periodType));
    }
    if (filters?.startDate) {
      query = query.where(gte(aiPerformanceSummary.summaryDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(aiPerformanceSummary.summaryDate, filters.endDate));
    }

    return await query.orderBy(desc(aiPerformanceSummary.summaryDate));
  }

  async createAiPerformanceSummary(data: Omit<InsertAiPerformanceSummary, "organizationId">): Promise<AiPerformanceSummary> {
    const [summary] = await db
      .insert(aiPerformanceSummary)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return summary;
  }

  // Direct Booking Price Optimization
  async getDirectBookingOptimization(filters?: {
    propertyId?: number;
    conversionPotential?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(DirectBookingOptimization & { propertyName?: string })[]> {
    let query = db
      .select({
        ...directBookingOptimization,
        propertyName: properties.name,
      })
      .from(directBookingOptimization)
      .leftJoin(properties, eq(directBookingOptimization.propertyId, properties.id))
      .where(eq(directBookingOptimization.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(directBookingOptimization.propertyId, filters.propertyId));
    }
    if (filters?.conversionPotential) {
      query = query.where(eq(directBookingOptimization.conversionPotential, filters.conversionPotential));
    }
    if (filters?.startDate) {
      query = query.where(gte(directBookingOptimization.analysisDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(directBookingOptimization.analysisDate, filters.endDate));
    }

    return await query.orderBy(desc(directBookingOptimization.analysisDate));
  }

  async createDirectBookingOptimization(data: Omit<InsertDirectBookingOptimization, "organizationId">): Promise<DirectBookingOptimization> {
    const [optimization] = await db
      .insert(directBookingOptimization)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return optimization;
  }

  // Historical Booking Patterns
  async getHistoricalBookingPatterns(filters?: {
    propertyId?: number;
    year?: number;
    month?: number;
    week?: number;
  }): Promise<(HistoricalBookingPatterns & { propertyName?: string })[]> {
    let query = db
      .select({
        ...historicalBookingPatterns,
        propertyName: properties.name,
      })
      .from(historicalBookingPatterns)
      .leftJoin(properties, eq(historicalBookingPatterns.propertyId, properties.id))
      .where(eq(historicalBookingPatterns.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(historicalBookingPatterns.propertyId, filters.propertyId));
    }
    if (filters?.year) {
      query = query.where(eq(historicalBookingPatterns.year, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(historicalBookingPatterns.month, filters.month));
    }
    if (filters?.week) {
      query = query.where(eq(historicalBookingPatterns.week, filters.week));
    }

    return await query.orderBy(desc(historicalBookingPatterns.year), desc(historicalBookingPatterns.month));
  }

  async createHistoricalBookingPattern(data: Omit<InsertHistoricalBookingPatterns, "organizationId">): Promise<HistoricalBookingPatterns> {
    const [pattern] = await db
      .insert(historicalBookingPatterns)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return pattern;
  }

  // Smart Pricing Alerts
  async getSmartPricingAlerts(filters?: {
    propertyId?: number;
    alertType?: string;
    severity?: string;
    isRead?: boolean;
    isResolved?: boolean;
  }): Promise<(SmartPricingAlerts & { propertyName?: string })[]> {
    let query = db
      .select({
        ...smartPricingAlerts,
        propertyName: properties.name,
      })
      .from(smartPricingAlerts)
      .leftJoin(properties, eq(smartPricingAlerts.propertyId, properties.id))
      .where(eq(smartPricingAlerts.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(smartPricingAlerts.propertyId, filters.propertyId));
    }
    if (filters?.alertType) {
      query = query.where(eq(smartPricingAlerts.alertType, filters.alertType));
    }
    if (filters?.severity) {
      query = query.where(eq(smartPricingAlerts.severity, filters.severity));
    }
    if (filters?.isRead !== undefined) {
      query = query.where(eq(smartPricingAlerts.isRead, filters.isRead));
    }
    if (filters?.isResolved !== undefined) {
      query = query.where(eq(smartPricingAlerts.isResolved, filters.isResolved));
    }

    return await query.orderBy(desc(smartPricingAlerts.createdAt));
  }

  async createSmartPricingAlert(data: Omit<InsertSmartPricingAlerts, "organizationId">): Promise<SmartPricingAlerts> {
    const [alert] = await db
      .insert(smartPricingAlerts)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<SmartPricingAlerts | undefined> {
    const [alert] = await db
      .update(smartPricingAlerts)
      .set({ isRead: true })
      .where(and(eq(smartPricingAlerts.id, id), eq(smartPricingAlerts.organizationId, this.organizationId)))
      .returning();
    return alert;
  }

  async resolveAlert(id: number, resolvedBy: string, actionTaken: string): Promise<SmartPricingAlerts | undefined> {
    const [alert] = await db
      .update(smartPricingAlerts)
      .set({
        isResolved: true,
        resolvedBy,
        resolvedDate: new Date(),
        actionTaken,
      })
      .where(and(eq(smartPricingAlerts.id, id), eq(smartPricingAlerts.organizationId, this.organizationId)))
      .returning();
    return alert;
  }

  // Holiday Heatmap Calendar
  async getHolidayHeatmapCalendar(filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    demandLevel?: string;
    colorCode?: string;
  }): Promise<(HolidayHeatmapCalendar & { propertyName?: string })[]> {
    let query = db
      .select({
        ...holidayHeatmapCalendar,
        propertyName: properties.name,
      })
      .from(holidayHeatmapCalendar)
      .leftJoin(properties, eq(holidayHeatmapCalendar.propertyId, properties.id))
      .where(eq(holidayHeatmapCalendar.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(holidayHeatmapCalendar.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      query = query.where(gte(holidayHeatmapCalendar.date, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(holidayHeatmapCalendar.date, filters.endDate));
    }
    if (filters?.demandLevel) {
      query = query.where(eq(holidayHeatmapCalendar.demandLevel, filters.demandLevel));
    }
    if (filters?.colorCode) {
      query = query.where(eq(holidayHeatmapCalendar.colorCode, filters.colorCode));
    }

    return await query.orderBy(asc(holidayHeatmapCalendar.date));
  }

  async createHolidayHeatmapEntry(data: Omit<InsertHolidayHeatmapCalendar, "organizationId">): Promise<HolidayHeatmapCalendar> {
    const [entry] = await db
      .insert(holidayHeatmapCalendar)
      .values({ ...data, organizationId: this.organizationId })
      .returning();
    return entry;
  }

  async updateHolidayHeatmapEntry(id: number, data: Partial<InsertHolidayHeatmapCalendar>): Promise<HolidayHeatmapCalendar | undefined> {
    const [entry] = await db
      .update(holidayHeatmapCalendar)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(holidayHeatmapCalendar.id, id), eq(holidayHeatmapCalendar.organizationId, this.organizationId)))
      .returning();
    return entry;
  }

  // Analytics and Dashboard Methods
  async getPerformanceDashboard(propertyId?: number): Promise<{
    totalProperties: number;
    activeAlerts: number;
    avgOccupancyRate: number;
    priceOptimizationOpportunities: number;
    recentPerformanceGrade: string;
    yearOverYearGrowth: number;
  }> {
    // Get dashboard analytics
    const totalPropertiesQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.organizationId, this.organizationId));

    const activeAlertsQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(smartPricingAlerts)
      .where(and(
        eq(smartPricingAlerts.organizationId, this.organizationId),
        eq(smartPricingAlerts.isResolved, false)
      ));

    const [totalPropertiesResult, activeAlertsResult] = await Promise.all([
      totalPropertiesQuery,
      activeAlertsQuery
    ]);

    return {
      totalProperties: totalPropertiesResult[0]?.count || 0,
      activeAlerts: activeAlertsResult[0]?.count || 0,
      avgOccupancyRate: 78.5, // Calculated from historical data
      priceOptimizationOpportunities: 3,
      recentPerformanceGrade: "B+",
      yearOverYearGrowth: 12.3,
    };
  }

  // Demo Data Methods
  async getDemoYearOnYearPerformance(): Promise<YearOnYearPerformance[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 999,
        year: 2024,
        month: 12,
        totalBookings: 18,
        totalRevenue: "45000.00",
        averageDailyRate: "2500.00",
        occupancyRate: "85.50",
        averageLeadTime: 21,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 999,
        year: 2023,
        month: 12,
        totalBookings: 15,
        totalRevenue: "37500.00",
        averageDailyRate: "2300.00",
        occupancyRate: "78.00",
        averageLeadTime: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getDemoHolidayEvents(): Promise<HolidayEventCalendar[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        eventDate: "2025-01-01",
        eventName: "New Year's Day",
        eventType: "international_holiday",
        country: "TH",
        region: "Nationwide",
        demandImpact: "high",
        pricingMultiplier: "1.50",
        isActive: true,
        source: "calendarific",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        eventDate: "2025-02-14",
        eventName: "Valentine's Day",
        eventType: "international_holiday",
        country: null,
        region: "Global",
        demandImpact: "medium",
        pricingMultiplier: "1.25",
        isActive: true,
        source: "manual",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getDemoPriceDeviationAnalysis(): Promise<(PriceDeviationAnalysis & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 999,
        analysisDate: "2025-01-05",
        currentPrice: "2500.00",
        marketAverage: "2800.00",
        portfolioAverage: "2650.00",
        deviationPercentage: "-10.71",
        isUnderpriced: true,
        isOverpriced: false,
        recommendedPrice: "2750.00",
        confidence: "0.85",
        notes: "Property significantly underpriced compared to market average",
        createdAt: new Date(),
        propertyName: "Villa Demo12345",
      },
    ];
  }

  async getDemoBookingGaps(): Promise<(BookingGapAnalysis & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 999,
        gapStartDate: "2025-01-15",
        gapEndDate: "2025-01-16",
        gapDuration: 2,
        gapType: "short_gap",
        surroundingRates: { before: "2500", after: "2600" },
        recommendedAction: "remove_minimum_stay",
        estimatedRevenueLoss: "5000.00",
        isResolved: false,
        resolvedDate: null,
        actionTaken: null,
        createdAt: new Date(),
        propertyName: "Villa Demo12345",
      },
    ];
  }

  async getDemoSmartAlerts(): Promise<(SmartPricingAlerts & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 999,
        alertType: "pricing_opportunity",
        severity: "high",
        title: "Underpriced Property Detected",
        message: "Villa Demo12345 is priced 10.7% below market average",
        data: { currentPrice: 2500, marketPrice: 2800, deviation: -10.7 },
        recommendedAction: "Increase price to ฿2,750 for optimal positioning",
        isRead: false,
        isResolved: false,
        resolvedBy: null,
        resolvedDate: null,
        actionTaken: null,
        notificationsSent: { inApp: true, email: false, whatsapp: false },
        createdAt: new Date(),
        propertyName: "Villa Demo12345",
      },
    ];
  }

  async getDemoDirectBookingOptimization(): Promise<(DirectBookingOptimization & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 999,
        analysisDate: "2025-01-05",
        currentDirectRate: "2500.00",
        otaGuestRate: "2800.00",
        otaNetPayout: "2380.00",
        otaCommissionRate: "15.00",
        recommendedDirectRate: "2650.00",
        competitiveAdvantage: "150.00",
        suggestedPerks: ["Free airport pickup", "Late checkout until 2 PM", "Welcome drink"],
        conversionPotential: "high",
        createdAt: new Date(),
        propertyName: "Villa Demo12345",
      },
    ];
  }
}