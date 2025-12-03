import express from "express";
import { isDemoAuthenticated } from "../demoAuth";
import { db } from "../db";
import { bookingRevenue, properties, bookings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hostawayService } from "../hostawayService"; // adjust path if needed

export const bookingRevenueRouter = express.Router();

function generateReservationCode(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RES-${datePart}-${rand}`;
}

// GET endpoint to fetch booking revenue records
bookingRevenueRouter.get("/", isDemoAuthenticated, async (req: any, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const { propertyId } = req.query;

    let records;
    if (propertyId) {
      records = await db
        .select()
        .from(bookingRevenue)
        .where(eq(bookingRevenue.organizationId, orgId))
        .where(eq(bookingRevenue.propertyId, parseInt(propertyId as string)));
    } else {
      records = await db
        .select()
        .from(bookingRevenue)
        .where(eq(bookingRevenue.organizationId, orgId));
    }

    res.json(records);
  } catch (err: any) {
    console.error("[BOOKING-REVENUE] GET error:", err);
    res.status(500).json({ error: "Failed to fetch booking revenue records" });
  }
});

bookingRevenueRouter.post("/", isDemoAuthenticated, async (req, res) => {
  console.log("[BOOKING-REVENUE] POST /api/booking-revenue hit");
  console.log("[BOOKING-REVENUE] Session userId:", req.session?.userId);
  console.log("[BOOKING-REVENUE] Authenticated user:", req.user?.id, req.user?.email);
  console.log("[BOOKING-REVENUE] Request body propertyId:", req.body?.propertyId);

  try {
    const orgId = req.user?.organizationId || "default-org";
    const userId = req.user?.id || "unknown";

    const {
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      guestBookingPrice,
      otaPlatformFee,
      finalPayoutAmount,
      currency,
      paymentStatus,
      payoutDate,
      notes,
      reservationCode: clientReservationCode,
      skipHostawaySync, // Flag to skip Hostaway API call for local-only bookings
    } = req.body;

    if (
      !propertyId ||
      !guestName ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests
    ) {
      return res.status(400).json({
        error:
          "propertyId, guestName, checkInDate, checkOutDate, numberOfGuests are required",
      });
    }

    // 1) Find property to determine LOCAL vs HOSTAWAY
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const msDiff = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.max(
      1,
      Math.round(msDiff / (1000 * 60 * 60 * 24)),
    );

    const currencySafe = currency || "THB";
    const paymentStatusSafe = paymentStatus || "pending";

    const guestBookingPriceSafe =
      guestBookingPrice != null
        ? Number(guestBookingPrice)
        : Number(finalPayoutAmount ?? 0);
    const otaPlatformFeeSafe =
      otaPlatformFee != null ? Number(otaPlatformFee) : 0;
    const finalPayoutAmountSafe =
      finalPayoutAmount != null
        ? Number(finalPayoutAmount)
        : guestBookingPriceSafe - otaPlatformFeeSafe;

    let hostAwayReservationId: string | null = null;
    let externalReservationId: string | null = null;
    let reservationCode = clientReservationCode || generateReservationCode();

    // 2) If property is HOSTAWAY → create reservation via HostawayService (unless skipHostawaySync is true)
    if (property.source === "HOSTAWAY" && !skipHostawaySync) {
      if (!property.hostawayListingMapId) {
        return res.status(400).json({
          error:
            "Property is marked as HOSTAWAY but hostawayListingMapId is missing. Please resync properties.",
        });
      }

      try {
        const hostawayResult = await hostawayService.createReservation({
          listingMapId: property.hostawayListingMapId,
          arrivalDate: checkInDate,
          departureDate: checkOutDate,
          guestName,
          guestEmail,
          guestPhone,
          numberOfGuests: Number(numberOfGuests),
          specialRequests: notes,
        });

        hostAwayReservationId = String(hostawayResult.id);
        externalReservationId = hostawayResult.reservationCode || null;
        if (hostawayResult.reservationCode) {
          reservationCode = hostawayResult.reservationCode;
        }
      } catch (err: any) {
        console.error("[BOOKING-REVENUE] Hostaway reservation error:", err);
        // Extract user-friendly error message from Hostaway API
        let userMessage = "Failed to create reservation in Hostaway";
        if (err.message && err.message.includes("not available")) {
          userMessage = err.message.replace(/Failed to create reservation in Hostaway: \d+ - /g, "");
          try {
            const parsed = JSON.parse(userMessage);
            userMessage = parsed.message || userMessage;
          } catch {}
        }
        return res.status(502).json({
          error: userMessage,
          details: err.message || String(err),
        });
      }
    }

    // 3) Determine source
    const bookingSource = skipHostawaySync || !hostAwayReservationId ? "LOCAL" : "HOSTAWAY";
    const platformName = property.source === "HOSTAWAY" ? "hostaway" : "direct";

    // 4) Insert into BOTH tables sequentially (Neon HTTP driver doesn't support transactions)
    // Insert booking revenue row first
    const [created] = await db
      .insert(bookingRevenue)
      .values({
        organizationId: orgId,
        propertyId,
        reservationCode,
        guestName,
        guestEmail: guestEmail || null,
        checkInDate,
        checkOutDate,
        numberOfNights,
        numberOfGuests: Number(numberOfGuests),
        otaName: property.source === "HOSTAWAY" ? "Hostaway" : "Direct",
        bookingType: "OTA",
        guestBookingPrice: String(guestBookingPriceSafe),
        otaPlatformFee: String(otaPlatformFeeSafe),
        finalPayoutAmount: String(finalPayoutAmountSafe),
        currency: currencySafe,
        paymentStatus: paymentStatusSafe,
        payoutDate: payoutDate || null,
        isCommissionable: true,
        managementCommissionRate: "15.00",
        hostAwayReservationId,
        externalReservationId,
        notes: notes || null,
        createdBy: userId,
      })
      .returning();

    // Insert into bookings table for calendar visibility
    let calendarBooking;
    try {
      const [booking] = await db
        .insert(bookings)
        .values({
          organizationId: orgId,
          propertyId,
          source: bookingSource, // LOCAL for locally-created, even on Hostaway properties
          externalId: hostAwayReservationId || null,
          bookingReference: reservationCode,
          guestName,
          guestEmail: guestEmail || null,
          guestPhone: guestPhone || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: Number(numberOfGuests),
          totalAmount: String(guestBookingPriceSafe),
          status: "confirmed",
          bookingPlatform: platformName,
          currency: currencySafe,
          paymentStatus: paymentStatusSafe,
          amountPaid: paymentStatusSafe === "paid" ? String(guestBookingPriceSafe) : "0",
          amountDue: paymentStatusSafe === "paid" ? "0" : String(guestBookingPriceSafe),
          specialRequests: notes || null,
        })
        .returning();
      calendarBooking = booking;
    } catch (calendarErr) {
      // Manual rollback: delete the booking revenue if calendar insert fails
      console.error("[BOOKING-REVENUE] Calendar booking failed, rolling back revenue entry:", calendarErr);
      await db.delete(bookingRevenue).where(eq(bookingRevenue.id, created.id));
      throw calendarErr;
    }

    const result = { created, calendarBooking };

    console.log("[BOOKING-REVENUE] Created booking revenue:", result.created.id, "and calendar booking:", result.calendarBooking.id, "source:", bookingSource);

    // 5) CRITICAL: Invalidate ALL booking caches (both LOCAL and HOSTAWAY) so calendar updates immediately
    try {
      const { clearCache } = await import("../performanceOptimizer");
      const { clearUltraFastCache } = await import("../ultraFastMiddleware");
      
      // Clear base cache
      clearCache("bookings");
      clearCache(`bookings-${orgId}`);
      
      // Clear BOTH source-specific caches so all filter states refresh
      clearCache(`bookings-${orgId}-LOCAL`);
      clearCache(`bookings-${orgId}-HOSTAWAY`);
      
      clearUltraFastCache("/api/bookings");
      
      console.log("[BOOKING-REVENUE] All booking caches invalidated for immediate calendar update");
    } catch (cacheErr) {
      console.warn("[BOOKING-REVENUE] Cache invalidation failed (non-fatal):", cacheErr);
    }

    res.status(201).json({ 
      booking: result.created,
      calendarBooking: result.calendarBooking,
      source: bookingSource,
    });
  } catch (err: any) {
    console.error("[BOOKING-REVENUE] ERROR creating booking:", err);
    res.status(500).json({
      error: err.message || "Server error creating booking revenue",
    });
  }
});
