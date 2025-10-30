import express from "express";
import { isDemoAuthenticated } from "./demoAuth";
import { db } from "./db";
import { addonServices, addonBookings } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export const serviceBookingRouter = express.Router();

// Helper function to generate unique booking ID: BK-YYYYMMDD-XXXX
function generateBookingId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-${datePart}-${rand}`;
}

// POST /api/service-bookings - Create a new service booking
serviceBookingRouter.post("/", isDemoAuthenticated, async (req, res) => {
  console.log("[SERVICE-BOOKING] POST /api/service-bookings hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const userId = req.user?.id || "unknown";
    
    const {
      service_id,
      guest_name,
      guest_email,
      guest_phone,
      property_id,
      billing_type,
      price,
      date_due,
      scheduled_date
    } = req.body;

    // Validate required fields
    if (!service_id || !guest_name || !billing_type) {
      return res.status(400).json({ 
        error: 'service_id, guest_name and billing_type are required' 
      });
    }

    // Validate billing type
    const validBillingTypes = ['auto_guest', 'auto_owner', 'owner_gift', 'company_gift'];
    if (!validBillingTypes.includes(billing_type)) {
      return res.status(400).json({ 
        error: `Invalid billing_type. Must be one of: ${validBillingTypes.join(', ')}` 
      });
    }

    // Normalize price -> cents or null if complimentary
    let price_cents = null;
    if (!(billing_type === 'owner_gift' || billing_type === 'company_gift')) {
      // Price must be provided and numeric for non-gift billing types
      if (price == null || isNaN(Number(price))) {
        return res.status(400).json({ 
          error: 'price is required for this billing type' 
        });
      }
      price_cents = Math.round(Number(price) * 100);
      if (price_cents < 0) {
        return res.status(400).json({ error: 'price must be >= 0' });
      }
    } else {
      // Complimentary for gifts
      price_cents = null;
    }

    // Validate date_due if provided: must be today or future
    if (date_due) {
      const d = new Date(date_due);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      if (d < today) {
        return res.status(400).json({ error: 'date_due cannot be in the past' });
      }
    }

    // Generate unique booking ID
    let bookingIdRef = generateBookingId();
    
    // Ensure uniqueness (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.select()
        .from(addonBookings)
        .where(eq(addonBookings.bookingIdRef, bookingIdRef))
        .limit(1);
      
      if (existing.length === 0) break;
      bookingIdRef = generateBookingId();
      attempts++;
    }

    if (attempts >= 5) {
      return res.status(500).json({ error: 'Failed to generate unique booking ID' });
    }

    // Get service details for defaults
    const service = await db.select()
      .from(addonServices)
      .where(eq(addonServices.id, service_id))
      .limit(1);

    if (!service || service.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceData = service[0];

    // Calculate total price
    let totalPrice = price_cents ? (price_cents / 100).toFixed(2) : "0.00";

    // Create booking
    const newBooking = await db.insert(addonBookings).values({
      organizationId: orgId,
      bookingIdRef,
      serviceId: service_id,
      propertyId: property_id || null,
      guestName: guest_name,
      guestEmail: guest_email || null,
      guestPhone: guest_phone || null,
      billingType: billing_type,
      priceCents: price_cents,
      dateDue: date_due || null,
      scheduledDate: scheduled_date || new Date(),
      duration: serviceData.duration || null,
      basePrice: serviceData.basePrice || null,
      totalPrice,
      status: 'pending',
      bookedBy: userId,
      bookedByRole: req.user?.role || 'guest',
      approvalStatus: 'auto-approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log("[SERVICE-BOOKING] Created booking:", newBooking[0]);
    res.status(201).json({ booking: newBooking[0] });

  } catch (err: any) {
    console.error("[SERVICE-BOOKING] ERROR creating booking:", err);
    res.status(500).json({ error: err.message || 'Server error creating booking' });
  }
});

// GET /api/service-bookings - List service bookings
serviceBookingRouter.get("/", isDemoAuthenticated, async (req, res) => {
  console.log("[SERVICE-BOOKING] GET /api/service-bookings hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const limit = Math.min(100, Number(req.query.limit) || 50);

    // Fetch bookings with service name
    const bookings = await db.select({
      id: addonBookings.id,
      bookingIdRef: addonBookings.bookingIdRef,
      serviceId: addonBookings.serviceId,
      serviceName: addonServices.name,
      guestName: addonBookings.guestName,
      guestEmail: addonBookings.guestEmail,
      guestPhone: addonBookings.guestPhone,
      propertyId: addonBookings.propertyId,
      billingType: addonBookings.billingType,
      priceCents: addonBookings.priceCents,
      dateDue: addonBookings.dateDue,
      scheduledDate: addonBookings.scheduledDate,
      status: addonBookings.status,
      totalPrice: addonBookings.totalPrice,
      createdAt: addonBookings.createdAt,
    })
    .from(addonBookings)
    .leftJoin(addonServices, eq(addonBookings.serviceId, addonServices.id))
    .where(eq(addonBookings.organizationId, orgId))
    .orderBy(order === 'asc' ? addonBookings.createdAt : desc(addonBookings.createdAt))
    .limit(limit);

    console.log("[SERVICE-BOOKING] Found", bookings.length, "bookings");
    res.json({ bookings });

  } catch (err: any) {
    console.error("[SERVICE-BOOKING] ERROR fetching bookings:", err);
    res.status(500).json({ error: err.message || 'Server error fetching bookings' });
  }
});

// GET /api/service-bookings/:id - Get a specific booking
serviceBookingRouter.get("/:id", isDemoAuthenticated, async (req, res) => {
  try {
    const orgId = req.user?.organizationId || "default-org";
    const bookingId = parseInt(req.params.id);

    const booking = await db.select()
      .from(addonBookings)
      .where(and(
        eq(addonBookings.id, bookingId),
        eq(addonBookings.organizationId, orgId)
      ))
      .limit(1);

    if (!booking || booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: booking[0] });
  } catch (err: any) {
    console.error("[SERVICE-BOOKING] ERROR fetching booking:", err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});
