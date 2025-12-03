import { db } from "./db";
import { 
  otaPayoutRules, 
  otaBookingPayouts, 
  otaPayoutAlerts, 
  otaRevenueReports,
  properties,
  users,
  type OtaPayoutRule,
  type InsertOtaPayoutRule,
  type OtaBookingPayout,
  type InsertOtaBookingPayout,
  type OtaPayoutAlert,
  type InsertOtaPayoutAlert,
  type OtaRevenueReport,
  type InsertOtaRevenueReport
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, isNull, sql } from "drizzle-orm";

export class OtaPayoutLogicStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== OTA PAYOUT RULES MANAGEMENT =====

  async getOtaPayoutRules(propertyId?: number): Promise<(OtaPayoutRule & { propertyName?: string })[]> {
    let query = db
      .select({
        ...otaPayoutRules,
        propertyName: properties.name,
      })
      .from(otaPayoutRules)
      .leftJoin(properties, eq(otaPayoutRules.propertyId, properties.id))
      .where(eq(otaPayoutRules.organizationId, this.organizationId));

    if (propertyId) {
      query = query.where(and(
        eq(otaPayoutRules.organizationId, this.organizationId),
        eq(otaPayoutRules.propertyId, propertyId)
      ));
    }

    return await query.orderBy(asc(otaPayoutRules.otaPlatform));
  }

  async getOtaPayoutRule(id: number): Promise<OtaPayoutRule | undefined> {
    const [rule] = await db
      .select()
      .from(otaPayoutRules)
      .where(and(
        eq(otaPayoutRules.id, id),
        eq(otaPayoutRules.organizationId, this.organizationId)
      ));
    return rule;
  }

  async createOtaPayoutRule(rule: InsertOtaPayoutRule): Promise<OtaPayoutRule> {
    const [newRule] = await db
      .insert(otaPayoutRules)
      .values({ ...rule, organizationId: this.organizationId })
      .returning();
    return newRule;
  }

  async updateOtaPayoutRule(id: number, updates: Partial<InsertOtaPayoutRule>): Promise<OtaPayoutRule | undefined> {
    const [updatedRule] = await db
      .update(otaPayoutRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(otaPayoutRules.id, id),
        eq(otaPayoutRules.organizationId, this.organizationId)
      ))
      .returning();
    return updatedRule;
  }

  async deleteOtaPayoutRule(id: number): Promise<boolean> {
    const result = await db
      .delete(otaPayoutRules)
      .where(and(
        eq(otaPayoutRules.id, id),
        eq(otaPayoutRules.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  // ===== OTA BOOKING PAYOUTS MANAGEMENT =====

  async getOtaBookingPayouts(filters?: {
    propertyId?: number;
    otaPlatform?: string;
    payoutStatus?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(OtaBookingPayout & { propertyName?: string })[]> {
    let query = db
      .select({
        ...otaBookingPayouts,
        propertyName: properties.name,
      })
      .from(otaBookingPayouts)
      .leftJoin(properties, eq(otaBookingPayouts.propertyId, properties.id))
      .where(eq(otaBookingPayouts.organizationId, this.organizationId));

    if (filters?.propertyId) {
      query = query.where(and(
        eq(otaBookingPayouts.organizationId, this.organizationId),
        eq(otaBookingPayouts.propertyId, filters.propertyId)
      ));
    }

    if (filters?.otaPlatform) {
      query = query.where(and(
        eq(otaBookingPayouts.organizationId, this.organizationId),
        eq(otaBookingPayouts.otaPlatform, filters.otaPlatform)
      ));
    }

    if (filters?.payoutStatus) {
      query = query.where(and(
        eq(otaBookingPayouts.organizationId, this.organizationId),
        eq(otaBookingPayouts.payoutStatus, filters.payoutStatus)
      ));
    }

    if (filters?.startDate) {
      query = query.where(and(
        eq(otaBookingPayouts.organizationId, this.organizationId),
        gte(otaBookingPayouts.checkInDate, filters.startDate)
      ));
    }

    if (filters?.endDate) {
      query = query.where(and(
        eq(otaBookingPayouts.organizationId, this.organizationId),
        lte(otaBookingPayouts.checkInDate, filters.endDate)
      ));
    }

    return await query.orderBy(desc(otaBookingPayouts.checkInDate));
  }

  async getOtaBookingPayout(id: number): Promise<OtaBookingPayout | undefined> {
    const [payout] = await db
      .select()
      .from(otaBookingPayouts)
      .where(and(
        eq(otaBookingPayouts.id, id),
        eq(otaBookingPayouts.organizationId, this.organizationId)
      ));
    return payout;
  }

  async createOtaBookingPayout(payout: InsertOtaBookingPayout): Promise<OtaBookingPayout> {
    const [newPayout] = await db
      .insert(otaBookingPayouts)
      .values({ ...payout, organizationId: this.organizationId })
      .returning();
    return newPayout;
  }

  async updateOtaBookingPayout(id: number, updates: Partial<InsertOtaBookingPayout>): Promise<OtaBookingPayout | undefined> {
    const [updatedPayout] = await db
      .update(otaBookingPayouts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(otaBookingPayouts.id, id),
        eq(otaBookingPayouts.organizationId, this.organizationId)
      ))
      .returning();
    return updatedPayout;
  }

  async confirmPayout(id: number, confirmedBy: string): Promise<OtaBookingPayout | undefined> {
    const [updatedPayout] = await db
      .update(otaBookingPayouts)
      .set({ 
        payoutStatus: "confirmed",
        payoutConfirmedAt: new Date(),
        payoutConfirmedBy: confirmedBy,
        updatedAt: new Date()
      })
      .where(and(
        eq(otaBookingPayouts.id, id),
        eq(otaBookingPayouts.organizationId, this.organizationId)
      ))
      .returning();
    return updatedPayout;
  }

  async overridePayout(
    id: number, 
    overrideData: {
      netPayoutAmount: number;
      otaCommissionAmount: number;
      otaCommissionRate: number;
      overrideReason: string;
      overrideBy: string;
    }
  ): Promise<OtaBookingPayout | undefined> {
    const [updatedPayout] = await db
      .update(otaBookingPayouts)
      .set({ 
        ...overrideData,
        manualOverride: true,
        overrideAt: new Date(),
        payoutStatus: "confirmed",
        updatedAt: new Date()
      })
      .where(and(
        eq(otaBookingPayouts.id, id),
        eq(otaBookingPayouts.organizationId, this.organizationId)
      ))
      .returning();
    return updatedPayout;
  }

  // ===== OTA PAYOUT ALERTS MANAGEMENT =====

  async getOtaPayoutAlerts(filters?: {
    alertType?: string;
    severity?: string;
    isResolved?: boolean;
  }): Promise<(OtaPayoutAlert & { 
    booking?: OtaBookingPayout;
    propertyName?: string;
  })[]> {
    let query = db
      .select({
        ...otaPayoutAlerts,
        booking: otaBookingPayouts,
        propertyName: properties.name,
      })
      .from(otaPayoutAlerts)
      .leftJoin(otaBookingPayouts, eq(otaPayoutAlerts.bookingPayoutId, otaBookingPayouts.id))
      .leftJoin(properties, eq(otaBookingPayouts.propertyId, properties.id))
      .where(eq(otaPayoutAlerts.organizationId, this.organizationId));

    if (filters?.alertType) {
      query = query.where(and(
        eq(otaPayoutAlerts.organizationId, this.organizationId),
        eq(otaPayoutAlerts.alertType, filters.alertType)
      ));
    }

    if (filters?.severity) {
      query = query.where(and(
        eq(otaPayoutAlerts.organizationId, this.organizationId),
        eq(otaPayoutAlerts.severity, filters.severity)
      ));
    }

    if (filters?.isResolved !== undefined) {
      query = query.where(and(
        eq(otaPayoutAlerts.organizationId, this.organizationId),
        eq(otaPayoutAlerts.isResolved, filters.isResolved)
      ));
    }

    return await query.orderBy(desc(otaPayoutAlerts.createdAt));
  }

  async createOtaPayoutAlert(alert: InsertOtaPayoutAlert): Promise<OtaPayoutAlert> {
    const [newAlert] = await db
      .insert(otaPayoutAlerts)
      .values({ ...alert, organizationId: this.organizationId })
      .returning();
    return newAlert;
  }

  async resolveOtaPayoutAlert(
    id: number, 
    resolvedBy: string, 
    resolutionNotes?: string
  ): Promise<OtaPayoutAlert | undefined> {
    const [resolvedAlert] = await db
      .update(otaPayoutAlerts)
      .set({ 
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
        resolutionNotes
      })
      .where(and(
        eq(otaPayoutAlerts.id, id),
        eq(otaPayoutAlerts.organizationId, this.organizationId)
      ))
      .returning();
    return resolvedAlert;
  }

  // ===== REVENUE REPORTS & ANALYTICS =====

  async generateRevenueReport(
    reportPeriod: string,
    periodStart: string,
    periodEnd: string,
    generatedBy: string
  ): Promise<OtaRevenueReport> {
    // Get all payouts in the period
    const payouts = await this.getOtaBookingPayouts({
      startDate: periodStart,
      endDate: periodEnd
    });

    // Calculate totals
    const totalGrossRevenue = payouts.reduce((sum, p) => sum + parseFloat(p.guestPaidAmount), 0);
    const totalNetPayout = payouts.reduce((sum, p) => sum + parseFloat(p.netPayoutAmount), 0);
    const totalOtaCommissions = payouts.reduce((sum, p) => sum + parseFloat(p.otaCommissionAmount), 0);
    const totalBookings = payouts.length;
    const averageOtaCommissionRate = totalBookings > 0 ? 
      payouts.reduce((sum, p) => sum + parseFloat(p.otaCommissionRate), 0) / totalBookings : 0;

    // Generate platform breakdown
    const platformBreakdown = payouts.reduce((acc, payout) => {
      const platform = payout.otaPlatform;
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          bookingCount: 0,
          totalGuestPayments: 0,
          totalNetPayouts: 0,
          totalOtaCommissions: 0
        };
      }
      acc[platform].bookingCount++;
      acc[platform].totalGuestPayments += parseFloat(payout.guestPaidAmount);
      acc[platform].totalNetPayouts += parseFloat(payout.netPayoutAmount);
      acc[platform].totalOtaCommissions += parseFloat(payout.otaCommissionAmount);
      return acc;
    }, {} as Record<string, any>);

    const [report] = await db
      .insert(otaRevenueReports)
      .values({
        organizationId: this.organizationId,
        reportPeriod,
        periodStart,
        periodEnd,
        totalGrossRevenue: totalGrossRevenue.toString(),
        totalNetPayout: totalNetPayout.toString(),
        totalOtaCommissions: totalOtaCommissions.toString(),
        totalBookings,
        averageOtaCommissionRate: averageOtaCommissionRate.toString(),
        platformBreakdown: Object.values(platformBreakdown),
        generatedBy
      })
      .returning();

    return report;
  }

  async getRevenueReports(limit: number = 10): Promise<OtaRevenueReport[]> {
    return await db
      .select()
      .from(otaRevenueReports)
      .where(eq(otaRevenueReports.organizationId, this.organizationId))
      .orderBy(desc(otaRevenueReports.generatedAt))
      .limit(limit);
  }

  async getRevenueAnalytics(filters?: {
    propertyId?: number;
    otaPlatform?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalGrossRevenue: number;
    totalNetPayout: number;
    totalOtaCommissions: number;
    totalBookings: number;
    averageOtaCommissionRate: number;
    platformBreakdown: Array<{
      platform: string;
      bookingCount: number;
      totalGuestPayments: number;
      totalNetPayouts: number;
      averageCommissionRate: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      guestPayments: number;
      netPayouts: number;
      otaCommissions: number;
    }>;
    payoutStatusBreakdown: Array<{
      status: string;
      count: number;
      totalAmount: number;
    }>;
  }> {
    const payouts = await this.getOtaBookingPayouts(filters);

    const totalGrossRevenue = payouts.reduce((sum, p) => sum + parseFloat(p.guestPaidAmount), 0);
    const totalNetPayout = payouts.reduce((sum, p) => sum + parseFloat(p.netPayoutAmount), 0);
    const totalOtaCommissions = payouts.reduce((sum, p) => sum + parseFloat(p.otaCommissionAmount), 0);
    const totalBookings = payouts.length;
    const averageOtaCommissionRate = totalBookings > 0 ? 
      payouts.reduce((sum, p) => sum + parseFloat(p.otaCommissionRate), 0) / totalBookings : 0;

    // Platform breakdown
    const platformStats = payouts.reduce((acc, payout) => {
      const platform = payout.otaPlatform;
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          bookingCount: 0,
          totalGuestPayments: 0,
          totalNetPayouts: 0,
          commissionRates: []
        };
      }
      acc[platform].bookingCount++;
      acc[platform].totalGuestPayments += parseFloat(payout.guestPaidAmount);
      acc[platform].totalNetPayouts += parseFloat(payout.netPayoutAmount);
      acc[platform].commissionRates.push(parseFloat(payout.otaCommissionRate));
      return acc;
    }, {} as Record<string, any>);

    const platformBreakdown = Object.values(platformStats).map((stats: any) => ({
      platform: stats.platform,
      bookingCount: stats.bookingCount,
      totalGuestPayments: stats.totalGuestPayments,
      totalNetPayouts: stats.totalNetPayouts,
      averageCommissionRate: stats.commissionRates.reduce((sum: number, rate: number) => sum + rate, 0) / stats.commissionRates.length
    }));

    // Monthly trends
    const monthlyStats = payouts.reduce((acc, payout) => {
      const month = new Date(payout.checkInDate).toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          month,
          guestPayments: 0,
          netPayouts: 0,
          otaCommissions: 0
        };
      }
      acc[month].guestPayments += parseFloat(payout.guestPaidAmount);
      acc[month].netPayouts += parseFloat(payout.netPayoutAmount);
      acc[month].otaCommissions += parseFloat(payout.otaCommissionAmount);
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyStats);

    // Payout status breakdown
    const statusStats = payouts.reduce((acc, payout) => {
      const status = payout.payoutStatus;
      if (!acc[status]) {
        acc[status] = {
          status,
          count: 0,
          totalAmount: 0
        };
      }
      acc[status].count++;
      acc[status].totalAmount += parseFloat(payout.netPayoutAmount);
      return acc;
    }, {} as Record<string, any>);

    const payoutStatusBreakdown = Object.values(statusStats);

    return {
      totalGrossRevenue,
      totalNetPayout,
      totalOtaCommissions,
      totalBookings,
      averageOtaCommissionRate,
      platformBreakdown,
      monthlyTrends,
      payoutStatusBreakdown
    };
  }

  // ===== DEMO DATA METHODS =====

  async getDemoOtaPayoutRules(): Promise<(OtaPayoutRule & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        otaPlatform: "airbnb",
        defaultCommissionRate: "13.00",
        useHostawayPayout: true,
        manualPayoutOverride: false,
        alertOnPayoutMissing: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        propertyName: "Property"
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        otaPlatform: "booking_com",
        defaultCommissionRate: "15.00",
        useHostawayPayout: true,
        manualPayoutOverride: false,
        alertOnPayoutMissing: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        propertyName: "Property"
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1,
        otaPlatform: "vrbo",
        defaultCommissionRate: "8.00",
        useHostawayPayout: true,
        manualPayoutOverride: false,
        alertOnPayoutMissing: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        propertyName: "Property"
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 1,
        otaPlatform: "direct",
        defaultCommissionRate: "0.00",
        useHostawayPayout: false,
        manualPayoutOverride: false,
        alertOnPayoutMissing: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        propertyName: "Property"
      }
    ];
  }

  async getDemoOtaBookingPayouts(): Promise<(OtaBookingPayout & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        reservationCode: "HM29844723",
        guestName: "Emma & James Wilson",
        checkInDate: "2025-01-15",
        checkOutDate: "2025-01-22",
        otaPlatform: "airbnb",
        guestPaidAmount: "45600.00",
        netPayoutAmount: "39672.00",
        otaCommissionAmount: "5928.00",
        otaCommissionRate: "13.00",
        currency: "THB",
        payoutStatus: "confirmed",
        payoutConfirmedAt: new Date(),
        payoutConfirmedBy: "demo-admin",
        hostawaySync: true,
        emailParsed: false,
        manualOverride: false,
        overrideReason: null,
        overrideBy: null,
        overrideAt: null,
        notes: "Hostaway payout automatically confirmed",
        alertGenerated: false,
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date(),
        propertyName: "Property"
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 1,
        reservationCode: "BDC789456123",
        guestName: "Sophie Chen",
        checkInDate: "2025-01-08",
        checkOutDate: "2025-01-12",
        otaPlatform: "booking_com",
        guestPaidAmount: "28800.00",
        netPayoutAmount: "24480.00",
        otaCommissionAmount: "4320.00",
        otaCommissionRate: "15.00",
        currency: "THB",
        payoutStatus: "pending",
        payoutConfirmedAt: null,
        payoutConfirmedBy: null,
        hostawaySync: false,
        emailParsed: true,
        manualOverride: false,
        overrideReason: null,
        overrideBy: null,
        overrideAt: null,
        notes: "Awaiting payout confirmation from email parsing",
        alertGenerated: true,
        createdAt: new Date("2025-01-05"),
        updatedAt: new Date(),
        propertyName: "Property"
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1,
        reservationCode: "VRBO445788",
        guestName: "Michael & Lisa Thompson",
        checkInDate: "2024-12-28",
        checkOutDate: "2025-01-05",
        otaPlatform: "vrbo",
        guestPaidAmount: "52000.00",
        netPayoutAmount: "47840.00",
        otaCommissionAmount: "4160.00",
        otaCommissionRate: "8.00",
        currency: "THB",
        payoutStatus: "received",
        payoutConfirmedAt: new Date("2025-01-02"),
        payoutConfirmedBy: "demo-pm",
        hostawaySync: true,
        emailParsed: false,
        manualOverride: false,
        overrideReason: null,
        overrideBy: null,
        overrideAt: null,
        notes: "Payout received and confirmed via bank statement",
        alertGenerated: false,
        createdAt: new Date("2024-12-25"),
        updatedAt: new Date("2025-01-02"),
        propertyName: "Property"
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 1,
        reservationCode: "DIRECT2025001",
        guestName: "David & Sarah Kim",
        checkInDate: "2025-01-20",
        checkOutDate: "2025-01-27",
        otaPlatform: "direct",
        guestPaidAmount: "38500.00",
        netPayoutAmount: "36575.00",
        otaCommissionAmount: "1925.00",
        otaCommissionRate: "5.00",
        currency: "THB",
        payoutStatus: "confirmed",
        payoutConfirmedAt: new Date(),
        payoutConfirmedBy: "demo-admin",
        hostawaySync: false,
        emailParsed: false,
        manualOverride: true,
        overrideReason: "Direct booking with payment processing fees",
        overrideBy: "demo-admin",
        overrideAt: new Date(),
        notes: "Direct booking, manual payout calculation after Stripe fees",
        alertGenerated: false,
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date(),
        propertyName: "Property"
      }
    ];
  }

  async getDemoOtaPayoutAlerts(): Promise<(OtaPayoutAlert & { 
    booking?: OtaBookingPayout;
    propertyName?: string;
  })[]> {
    const bookings = await this.getDemoOtaBookingPayouts();
    
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        bookingPayoutId: 2,
        alertType: "payout_missing",
        alertMessage: "Booking.com payout confirmation pending for 5 days - requires manual verification",
        severity: "medium",
        isResolved: false,
        resolvedBy: null,
        resolvedAt: null,
        resolutionNotes: null,
        createdAt: new Date("2025-01-06"),
        booking: bookings[1],
        propertyName: "Property"
      },
      {
        id: 2,
        organizationId: this.organizationId,
        bookingPayoutId: 4,
        alertType: "manual_review_needed",
        alertMessage: "Direct booking payout manually overridden - admin review recommended",
        severity: "low",
        isResolved: true,
        resolvedBy: "demo-pm",
        resolvedAt: new Date(),
        resolutionNotes: "Reviewed and approved - direct booking processing fees correctly calculated",
        createdAt: new Date("2025-01-15"),
        booking: bookings[3],
        propertyName: "Property"
      }
    ];
  }

  async getDemoRevenueAnalytics() {
    const payouts = await this.getDemoOtaBookingPayouts();
    
    return {
      totalGrossRevenue: 164900.00,
      totalNetPayout: 148567.00,
      totalOtaCommissions: 16333.00,
      totalBookings: 4,
      averageOtaCommissionRate: 10.25,
      platformBreakdown: [
        {
          platform: "airbnb",
          bookingCount: 1,
          totalGuestPayments: 45600.00,
          totalNetPayouts: 39672.00,
          averageCommissionRate: 13.00
        },
        {
          platform: "booking_com",
          bookingCount: 1,
          totalGuestPayments: 28800.00,
          totalNetPayouts: 24480.00,
          averageCommissionRate: 15.00
        },
        {
          platform: "vrbo",
          bookingCount: 1,
          totalGuestPayments: 52000.00,
          totalNetPayouts: 47840.00,
          averageCommissionRate: 8.00
        },
        {
          platform: "direct",
          bookingCount: 1,
          totalGuestPayments: 38500.00,
          totalNetPayouts: 36575.00,
          averageCommissionRate: 5.00
        }
      ],
      monthlyTrends: [
        {
          month: "2024-12",
          guestPayments: 52000.00,
          netPayouts: 47840.00,
          otaCommissions: 4160.00
        },
        {
          month: "2025-01",
          guestPayments: 112900.00,
          netPayouts: 100727.00,
          otaCommissions: 12173.00
        }
      ],
      payoutStatusBreakdown: [
        { status: "confirmed", count: 2, totalAmount: 76247.00 },
        { status: "pending", count: 1, totalAmount: 24480.00 },
        { status: "received", count: 1, totalAmount: 47840.00 }
      ]
    };
  }
}