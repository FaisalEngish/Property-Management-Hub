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
  type InsertOtaPlatformSettings
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
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        eq(bookingRevenue.propertyId, filters.propertyId)
      ));
    }

    if (filters?.otaName) {
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        eq(bookingRevenue.otaName, filters.otaName)
      ));
    }

    if (filters?.bookingType) {
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        eq(bookingRevenue.bookingType, filters.bookingType)
      ));
    }

    if (filters?.paymentStatus) {
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        eq(bookingRevenue.paymentStatus, filters.paymentStatus)
      ));
    }

    if (filters?.startDate) {
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        gte(bookingRevenue.checkInDate, filters.startDate)
      ));
    }

    if (filters?.endDate) {
      query = query.where(and(
        eq(bookingRevenue.organizationId, this.organizationId),
        lte(bookingRevenue.checkOutDate, filters.endDate)
      ));
    }

    return await query;
  }

  async getBookingRevenue(id: number): Promise<BookingRevenue | undefined> {
    const [result] = await db
      .select()
      .from(bookingRevenue)
      .where(and(
        eq(bookingRevenue.id, id),
        eq(bookingRevenue.organizationId, this.organizationId)
      ));
    return result;
  }

  async createBookingRevenue(data: Omit<InsertBookingRevenue, "organizationId">): Promise<BookingRevenue> {
    const [result] = await db
      .insert(bookingRevenue)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updateBookingRevenue(id: number, data: Partial<InsertBookingRevenue>): Promise<BookingRevenue | undefined> {
    const [result] = await db
      .update(bookingRevenue)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(bookingRevenue.id, id),
        eq(bookingRevenue.organizationId, this.organizationId)
      ))
      .returning();
    return result;
  }

  async deleteBookingRevenue(id: number): Promise<boolean> {
    const result = await db
      .delete(bookingRevenue)
      .where(and(
        eq(bookingRevenue.id, id),
        eq(bookingRevenue.organizationId, this.organizationId)
      ));
    return result.rowCount > 0;
  }

  // ===== COMMISSION CALCULATIONS =====
  async calculateAndCreateCommissions(bookingRevenueId: number, calculatedBy: string): Promise<BookingRevenueCommissions> {
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
    const ownerNetAmount = finalPayout - managementCommissionAmount - portfolioManagerCommissionAmount - referralAgentCommissionAmount;

    const [result] = await db
      .insert(bookingRevenueCommissions)
      .values({
        organizationId: this.organizationId,
        bookingRevenueId,
        managementCommissionAmount: managementCommissionAmount.toFixed(2),
        portfolioManagerCommissionAmount: portfolioManagerCommissionAmount.toFixed(2),
        referralAgentCommissionAmount: referralAgentCommissionAmount.toFixed(2),
        ownerNetAmount: ownerNetAmount.toFixed(2),
        ownerId: booking.createdBy, // For now, use creator as owner
        calculatedBy,
        isFinalized: false,
      })
      .returning();

    return result;
  }

  async getBookingCommissions(bookingRevenueId?: number): Promise<BookingRevenueCommissions[]> {
    let query = db
      .select()
      .from(bookingRevenueCommissions)
      .where(eq(bookingRevenueCommissions.organizationId, this.organizationId));

    if (bookingRevenueId) {
      query = query.where(and(
        eq(bookingRevenueCommissions.organizationId, this.organizationId),
        eq(bookingRevenueCommissions.bookingRevenueId, bookingRevenueId)
      ));
    }

    return await query.orderBy(desc(bookingRevenueCommissions.calculationDate));
  }

  // ===== OTA PLATFORM SETTINGS =====
  async getOtaPlatformSettings(propertyId?: number): Promise<OtaPlatformSettings[]> {
    let query = db
      .select()
      .from(otaPlatformSettings)
      .where(eq(otaPlatformSettings.organizationId, this.organizationId));

    if (propertyId) {
      query = query.where(and(
        eq(otaPlatformSettings.organizationId, this.organizationId),
        eq(otaPlatformSettings.propertyId, propertyId)
      ));
    }

    return await query.orderBy(otaPlatformSettings.otaName);
  }

  async createOtaPlatformSetting(data: Omit<InsertOtaPlatformSettings, "organizationId">): Promise<OtaPlatformSettings> {
    const [result] = await db
      .insert(otaPlatformSettings)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async updateOtaPlatformSetting(id: number, data: Partial<InsertOtaPlatformSettings>): Promise<OtaPlatformSettings | undefined> {
    const [result] = await db
      .update(otaPlatformSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(otaPlatformSettings.id, id),
        eq(otaPlatformSettings.organizationId, this.organizationId)
      ))
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
    const totalGuestRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.guestBookingPrice), 0);
    const totalOtaCommissions = bookings.reduce((sum, b) => sum + parseFloat(b.otaPlatformFee), 0);
    const totalNetPayouts = bookings.reduce((sum, b) => sum + parseFloat(b.finalPayoutAmount), 0);
    const averageCommissionRate = totalGuestRevenue > 0 ? (totalOtaCommissions / totalGuestRevenue) * 100 : 0;

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
      acc[ota].averageCommissionRate = (acc[ota].totalOtaCommissions / acc[ota].totalGuestRevenue) * 100;
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
        commissionLossPercentage: totalGuestRevenue > 0 ? (totalOtaCommissions / totalGuestRevenue) * 100 : 0,
      },
      otaBreakdown: Object.values(otaBreakdown),
      monthlyTrends: Object.values(monthlyTrends).sort((a: any, b: any) => a.month.localeCompare(b.month)),
    };
  }

  // ===== DEMO DATA METHODS =====
  async getDemoBookingRevenues(): Promise<(BookingRevenue & { propertyName?: string })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        reservationCode: "ABB-2024-12001",
        guestName: "John & Sarah Smith",
        guestEmail: "john.smith@example.com",
        checkInDate: "2024-12-01",
        checkOutDate: "2024-12-08",
        numberOfNights: 7,
        numberOfGuests: 2,
        otaName: "Airbnb",
        bookingType: "OTA",
        guestBookingPrice: "45000.00", // Guest paid ฿45,000
        otaPlatformFee: "6750.00", // Airbnb took 15% commission
        finalPayoutAmount: "38250.00", // Net payout ฿38,250
        currency: "THB",
        paymentStatus: "paid",
        payoutDate: "2024-12-10",
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId: null,
        externalReservationId: "HMHKL7PF9X",
        notes: "Guest celebrated anniversary. Provided champagne welcome gift.",
        createdBy: "demo-admin",
        createdAt: new Date("2024-12-01T10:00:00Z"),
        updatedAt: new Date("2024-12-01T10:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Villa Tropical Paradise",
        reservationCode: "BDC-2024-12002",
        guestName: "Michael & Lisa Chen",
        guestEmail: "michael.chen@example.com",
        checkInDate: "2024-12-15",
        checkOutDate: "2024-12-22",
        numberOfNights: 7,
        numberOfGuests: 4,
        otaName: "Booking.com",
        bookingType: "OTA",
        guestBookingPrice: "52000.00", // Guest paid ฿52,000
        otaPlatformFee: "7800.00", // Booking.com took 15% commission
        finalPayoutAmount: "44200.00", // Net payout ฿44,200
        currency: "THB",
        paymentStatus: "paid",
        payoutDate: "2024-12-25",
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId: null,
        externalReservationId: "BDC-567891234",
        notes: "Family vacation with children. Requested extra towels and child safety items.",
        createdBy: "demo-admin",
        createdAt: new Date("2024-12-15T14:30:00Z"),
        updatedAt: new Date("2024-12-15T14:30:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        propertyId: 1,
        propertyName: "Villa Samui Breeze",
        reservationCode: "VRB-2024-12003",
        guestName: "Emma & David Wilson",
        guestEmail: "emma.wilson@example.com",
        checkInDate: "2024-12-20",
        checkOutDate: "2024-12-27",
        numberOfNights: 7,
        numberOfGuests: 2,
        otaName: "VRBO",
        bookingType: "OTA",
        guestBookingPrice: "48000.00", // Guest paid ฿48,000
        otaPlatformFee: "4800.00", // VRBO took 10% commission
        finalPayoutAmount: "43200.00", // Net payout ฿43,200
        currency: "THB",
        paymentStatus: "paid",
        payoutDate: "2024-12-30",
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId: null,
        externalReservationId: "VRB-987654321",
        notes: "Honeymoon couple. Requested romantic dinner setup and spa services.",
        createdBy: "demo-admin",
        createdAt: new Date("2024-12-20T16:45:00Z"),
        updatedAt: new Date("2024-12-20T16:45:00Z"),
      },
      {
        id: 4,
        organizationId: this.organizationId,
        propertyId: 3,
        propertyName: "Villa Aruna",
        reservationCode: "DIR-2024-12004",
        guestName: "Robert & Anna Martinez",
        guestEmail: "robert.martinez@example.com",
        checkInDate: "2025-01-05",
        checkOutDate: "2025-01-12",
        numberOfNights: 7,
        numberOfGuests: 3,
        otaName: "Direct",
        bookingType: "Direct",
        guestBookingPrice: "42000.00", // Guest paid ฿42,000
        otaPlatformFee: "0.00", // No OTA commission for direct bookings
        finalPayoutAmount: "42000.00", // Full payout ฿42,000
        currency: "THB",
        paymentStatus: "paid",
        payoutDate: "2025-01-15",
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId: null,
        externalReservationId: "DIR-DIRECT-001",
        notes: "Direct booking through website. Repeat guest with loyalty discount applied.",
        createdBy: "demo-admin",
        createdAt: new Date("2025-01-05T09:00:00Z"),
        updatedAt: new Date("2025-01-05T09:00:00Z"),
      },
      {
        id: 5,
        organizationId: this.organizationId,
        propertyId: 2,
        propertyName: "Villa Tropical Paradise",
        reservationCode: "ABB-2025-01005",
        guestName: "Sophie & James Taylor",
        guestEmail: "sophie.taylor@example.com",
        checkInDate: "2025-01-10",
        checkOutDate: "2025-01-17",
        numberOfNights: 7,
        numberOfGuests: 2,
        otaName: "Airbnb",
        bookingType: "OTA",
        guestBookingPrice: "50000.00", // Guest paid ฿50,000
        otaPlatformFee: "7500.00", // Airbnb took 15% commission
        finalPayoutAmount: "42500.00", // Net payout ฿42,500
        currency: "THB",
        paymentStatus: "pending",
        payoutDate: null,
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId: null,
        externalReservationId: "HMKJHGFDSA",
        notes: "New Year vacation. Requested late check-out and airport transfer.",
        createdBy: "demo-admin",
        createdAt: new Date("2025-01-10T11:15:00Z"),
        updatedAt: new Date("2025-01-10T11:15:00Z"),
      },
    ];
  }

  async getDemoRevenueAnalytics() {
    const bookings = await this.getDemoBookingRevenues();
    
    const totalBookings = bookings.length;
    const totalGuestRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.guestBookingPrice), 0);
    const totalOtaCommissions = bookings.reduce((sum, b) => sum + parseFloat(b.otaPlatformFee), 0);
    const totalNetPayouts = bookings.reduce((sum, b) => sum + parseFloat(b.finalPayoutAmount), 0);

    return {
      summary: {
        totalBookings,
        totalGuestRevenue,
        totalOtaCommissions,
        totalNetPayouts,
        averageCommissionRate: totalGuestRevenue > 0 ? (totalOtaCommissions / totalGuestRevenue) * 100 : 0,
        commissionLossPercentage: totalGuestRevenue > 0 ? (totalOtaCommissions / totalGuestRevenue) * 100 : 0,
      },
      otaBreakdown: [
        {
          otaName: "Airbnb",
          bookingCount: 2,
          totalGuestRevenue: 95000,
          totalOtaCommissions: 14250,
          totalNetPayouts: 80750,
          averageCommissionRate: 15.0,
        },
        {
          otaName: "Booking.com",
          bookingCount: 1,
          totalGuestRevenue: 52000,
          totalOtaCommissions: 7800,
          totalNetPayouts: 44200,
          averageCommissionRate: 15.0,
        },
        {
          otaName: "VRBO",
          bookingCount: 1,
          totalGuestRevenue: 48000,
          totalOtaCommissions: 4800,
          totalNetPayouts: 43200,
          averageCommissionRate: 10.0,
        },
        {
          otaName: "Direct",
          bookingCount: 1,
          totalGuestRevenue: 42000,
          totalOtaCommissions: 0,
          totalNetPayouts: 42000,
          averageCommissionRate: 0.0,
        },
      ],
      monthlyTrends: [
        {
          month: "2024-12",
          bookingCount: 3,
          totalGuestRevenue: 145000,
          totalNetPayouts: 125650,
          commissionLoss: 19350,
        },
        {
          month: "2025-01",
          bookingCount: 2,
          totalGuestRevenue: 92000,
          totalNetPayouts: 84500,
          commissionLoss: 7500,
        },
      ],
    };
  }
}