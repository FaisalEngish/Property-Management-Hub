import { db } from "./db";
import {
  bookingRevenue,
  bookingRevenueCommissions,
  otaPlatformSettings,
  properties,
  users,
  type BookingRevenue,
  type BookingRevenueCommissions,
  type OtaPlatformSettings,
  type InsertBookingRevenue,
  type InsertBookingRevenueCommissions,
  type InsertOtaPlatformSettings,
} from "@shared/schema";
import { eq, and, desc, sum, count, gte, lte, isNotNull } from "drizzle-orm";

export class BookingRevenueStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== BOOKING REVENUE CRUD =====
  async getBookingRevenues(filters?: {
    propertyId?: number;
    otaName?: string;
    bookingType?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(BookingRevenue & { propertyName?: string })[]> {
    let query = db
      .select({
        ...bookingRevenue,
        propertyName: properties.name,
      })
      .from(bookingRevenue)
      .leftJoin(properties, eq(bookingRevenue.propertyId, properties.id))
      .where(eq(bookingRevenue.organizationId, this.organizationId))
      .orderBy(desc(bookingRevenue.checkInDate));

    if (filters?.propertyId) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          eq(bookingRevenue.propertyId, filters.propertyId),
        ),
      );
    }

    if (filters?.otaName) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          eq(bookingRevenue.otaName, filters.otaName),
        ),
      );
    }

    if (filters?.bookingType) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          eq(bookingRevenue.bookingType, filters.bookingType),
        ),
      );
    }

    if (filters?.paymentStatus) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          eq(bookingRevenue.paymentStatus, filters.paymentStatus),
        ),
      );
    }

    if (filters?.startDate) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          gte(bookingRevenue.checkInDate, filters.startDate),
        ),
      );
    }

    if (filters?.endDate) {
      query = query.where(
        and(
          eq(bookingRevenue.organizationId, this.organizationId),
          lte(bookingRevenue.checkOutDate, filters.endDate),
        ),
      );
    }

    return await query;
  }

  async getBookingRevenue(id: number): Promise<BookingRevenue | undefined> {
    const [result] = await db
      .select()
      .from(bookingRevenue)
      .where(
        and(
          eq(bookingRevenue.id, id),
          eq(bookingRevenue.organizationId, this.organizationId),
        ),
      );
    return result;
  }

  async createBookingRevenue(
    data: Omit<InsertBookingRevenue, "organizationId">,
  ): Promise<BookingRevenue> {
    const [result] = await db
      .insert(bookingRevenue)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updateBookingRevenue(
    id: number,
    data: Partial<InsertBookingRevenue>,
  ): Promise<BookingRevenue | undefined> {
    const [result] = await db
      .update(bookingRevenue)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(bookingRevenue.id, id),
          eq(bookingRevenue.organizationId, this.organizationId),
        ),
      )
      .returning();
    return result;
  }

  async deleteBookingRevenue(id: number): Promise<boolean> {
    const result = await db
      .delete(bookingRevenue)
      .where(
        and(
          eq(bookingRevenue.id, id),
          eq(bookingRevenue.organizationId, this.organizationId),
        ),
      );
    return result.rowCount > 0;
  }

  // ===== COMMISSION CALCULATIONS =====
  async calculateAndCreateCommissions(
    bookingRevenueId: number,
    calculatedBy: string,
  ): Promise<BookingRevenueCommissions> {
    // Get booking revenue details
    const booking = await this.getBookingRevenue(bookingRevenueId);
    if (!booking) {
      throw new Error("Booking revenue not found");
    }

    const finalPayout = parseFloat(booking.finalPayoutAmount);
    const managementRate = parseFloat(booking.managementCommissionRate) / 100;

    // Calculate commission amounts (ALL based on finalPayoutAmount only)
    const managementCommissionAmount = finalPayout * managementRate;
    const portfolioManagerCommissionAmount = 0; // To be configured later
    const referralAgentCommissionAmount = 0; // To be configured later
    const ownerNetAmount =
      finalPayout -
      managementCommissionAmount -
      portfolioManagerCommissionAmount -
      referralAgentCommissionAmount;

    const [result] = await db
      .insert(bookingRevenueCommissions)
      .values({
        organizationId: this.organizationId,
        bookingRevenueId,
        managementCommissionAmount: managementCommissionAmount.toFixed(2),
        portfolioManagerCommissionAmount:
          portfolioManagerCommissionAmount.toFixed(2),
        referralAgentCommissionAmount: referralAgentCommissionAmount.toFixed(2),
        ownerNetAmount: ownerNetAmount.toFixed(2),
        ownerId: booking.createdBy, // For now, use creator as owner
        calculatedBy,
        isFinalized: false,
      })
      .returning();

    return result;
  }

  async getBookingCommissions(
    bookingRevenueId?: number,
  ): Promise<BookingRevenueCommissions[]> {
    let query = db
      .select()
      .from(bookingRevenueCommissions)
      .where(eq(bookingRevenueCommissions.organizationId, this.organizationId));

    if (bookingRevenueId) {
      query = query.where(
        and(
          eq(bookingRevenueCommissions.organizationId, this.organizationId),
          eq(bookingRevenueCommissions.bookingRevenueId, bookingRevenueId),
        ),
      );
    }

    return await query.orderBy(desc(bookingRevenueCommissions.calculationDate));
  }

  // ===== OTA PLATFORM SETTINGS =====
  async getOtaPlatformSettings(
    propertyId?: number,
  ): Promise<OtaPlatformSettings[]> {
    let query = db
      .select()
      .from(otaPlatformSettings)
      .where(eq(otaPlatformSettings.organizationId, this.organizationId));

    if (propertyId) {
      query = query.where(
        and(
          eq(otaPlatformSettings.organizationId, this.organizationId),
          eq(otaPlatformSettings.propertyId, propertyId),
        ),
      );
    }

    return await query.orderBy(otaPlatformSettings.otaName);
  }

  async createOtaPlatformSetting(
    data: Omit<InsertOtaPlatformSettings, "organizationId">,
  ): Promise<OtaPlatformSettings> {
    const [result] = await db
      .insert(otaPlatformSettings)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updateOtaPlatformSetting(
    id: number,
    data: Partial<InsertOtaPlatformSettings>,
  ): Promise<OtaPlatformSettings | undefined> {
    const [result] = await db
      .update(otaPlatformSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(otaPlatformSettings.id, id),
          eq(otaPlatformSettings.organizationId, this.organizationId),
        ),
      )
      .returning();
    return result;
  }

  // ===== ANALYTICS & REPORTING =====
  async getRevenueAnalytics(filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const bookings = await this.getBookingRevenues(filters);

    const totalBookings = bookings.length;
    const totalGuestRevenue = bookings.reduce(
      (sum, b) => sum + parseFloat(b.guestBookingPrice),
      0,
    );
    const totalOtaCommissions = bookings.reduce(
      (sum, b) => sum + parseFloat(b.otaPlatformFee),
      0,
    );
    const totalNetPayouts = bookings.reduce(
      (sum, b) => sum + parseFloat(b.finalPayoutAmount),
      0,
    );
    const averageCommissionRate =
      totalGuestRevenue > 0
        ? (totalOtaCommissions / totalGuestRevenue) * 100
        : 0;

    // OTA breakdown
    const otaBreakdown = bookings.reduce((acc: any, booking) => {
      const ota = booking.otaName;
      if (!acc[ota]) {
        acc[ota] = {
          otaName: ota,
          bookingCount: 0,
          totalGuestRevenue: 0,
          totalOtaCommissions: 0,
          totalNetPayouts: 0,
          averageCommissionRate: 0,
        };
      }
      acc[ota].bookingCount++;
      acc[ota].totalGuestRevenue += parseFloat(booking.guestBookingPrice);
      acc[ota].totalOtaCommissions += parseFloat(booking.otaPlatformFee);
      acc[ota].totalNetPayouts += parseFloat(booking.finalPayoutAmount);
      acc[ota].averageCommissionRate =
        (acc[ota].totalOtaCommissions / acc[ota].totalGuestRevenue) * 100;
      return acc;
    }, {});

    // Monthly trends
    const monthlyTrends = bookings.reduce((acc: any, booking) => {
      const month = new Date(booking.checkInDate).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          bookingCount: 0,
          totalGuestRevenue: 0,
          totalNetPayouts: 0,
          commissionLoss: 0,
        };
      }
      acc[month].bookingCount++;
      acc[month].totalGuestRevenue += parseFloat(booking.guestBookingPrice);
      acc[month].totalNetPayouts += parseFloat(booking.finalPayoutAmount);
      acc[month].commissionLoss += parseFloat(booking.otaPlatformFee);
      return acc;
    }, {});

    return {
      summary: {
        totalBookings,
        totalGuestRevenue,
        totalOtaCommissions,
        totalNetPayouts,
        averageCommissionRate,
        commissionLossPercentage:
          totalGuestRevenue > 0
            ? (totalOtaCommissions / totalGuestRevenue) * 100
            : 0,
      },
      otaBreakdown: Object.values(otaBreakdown),
      monthlyTrends: Object.values(monthlyTrends).sort((a: any, b: any) =>
        a.month.localeCompare(b.month),
      ),
    };
  }

  // ===== DEMO DATA METHODS =====
  /**
   * Legacy demo helpers.
   *
   * Previously this returned hard-coded demo bookings tied to static demo properties.
   * Now it simply uses live booking revenue data from the database, so:
   *  - Locally created bookings AND
   *  - Hostaway-imported bookings
   * are both reflected consistently.
   */
  async getDemoBookingRevenues(): Promise<
    (BookingRevenue & { propertyName?: string })[]
  > {
    // Use the same data source as the real Finance Hub
    return this.getBookingRevenues();
  }

  async getDemoRevenueAnalytics() {
    // Reuse the real analytics logic so there's a single source of truth
    return this.getRevenueAnalytics();
  }
}
