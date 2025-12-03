import express from "express";
import { isDemoAuthenticated } from "./demoAuth";
import { db } from "./db";
import { addonServices, addonBookings, properties, finances, platformSettings } from "@shared/schema";
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
serviceBookingRouter.post("/", isDemoAuthenticated, async (req: any, res) => {
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
      scheduledDate: scheduled_date ? new Date(scheduled_date) : new Date(),
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

    // Create finance record for revenue tracking (only for non-gift types with price)
    try {
      // Get organization currency from platform settings (scoped to org)
      // Try displayCurrency first, then baseCurrency, then fall back to USD
      let orgCurrency = 'USD';
      const displayCurrencySetting = await db.select()
        .from(platformSettings)
        .where(and(
          eq(platformSettings.settingKey, 'displayCurrency'),
          eq(platformSettings.organizationId, orgId)
        ))
        .limit(1);
      
      if (displayCurrencySetting[0]?.settingValue) {
        orgCurrency = displayCurrencySetting[0].settingValue;
      } else {
        // Fallback to baseCurrency
        const baseCurrencySetting = await db.select()
          .from(platformSettings)
          .where(and(
            eq(platformSettings.settingKey, 'baseCurrency'),
            eq(platformSettings.organizationId, orgId)
          ))
          .limit(1);
        if (baseCurrencySetting[0]?.settingValue) {
          orgCurrency = baseCurrencySetting[0].settingValue;
        }
      }
      console.log("[SERVICE-BOOKING] Using currency:", orgCurrency, "for org:", orgId);

      if (price_cents && price_cents > 0) {
        const financeSource = billing_type === 'auto_guest' ? 'guest_payment' :
                             billing_type === 'auto_owner' ? 'owner_charge' : 'guest_payment';
        
        // Get property name for description
        let propertyName = 'Unknown Property';
        if (property_id) {
          const prop = await db.select().from(properties).where(eq(properties.id, property_id)).limit(1);
          if (prop.length > 0) propertyName = prop[0].name || 'Unknown Property';
        }

        const financeRecord = await db.insert(finances).values({
          organizationId: orgId,
          propertyId: property_id || null,
          type: 'income',
          source: financeSource,
          category: 'add-on-service',
          subcategory: serviceData.name || 'addon-service',
          department: 'guest-services',
          amount: price_cents / 100,
          currency: orgCurrency,
          date: new Date(),
          description: `Add-on Service: ${serviceData.name || 'Service'} - ${guest_name} at ${propertyName} (Ref: ${bookingIdRef})`,
          referenceNumber: bookingIdRef,
          processedBy: userId,
        }).returning();

        console.log("[SERVICE-BOOKING] Created finance record:", financeRecord[0]?.id, "with currency:", orgCurrency);
      } else if (billing_type === 'owner_gift' || billing_type === 'company_gift') {
        // Create a complimentary record for tracking purposes
        let propertyName = 'Unknown Property';
        if (property_id) {
          const prop = await db.select().from(properties).where(eq(properties.id, property_id)).limit(1);
          if (prop.length > 0) propertyName = prop[0].name || 'Unknown Property';
        }

        const giftValue = serviceData.defaultPriceCents ? (serviceData.defaultPriceCents / 100) : 0;

        await db.insert(finances).values({
          organizationId: orgId,
          propertyId: property_id || null,
          type: 'expense',
          source: 'complimentary',
          sourceType: billing_type,
          category: 'add-on-service',
          subcategory: serviceData.name || 'addon-service',
          department: 'guest-services',
          amount: giftValue,
          currency: orgCurrency,
          date: new Date(),
          description: `Complimentary Service: ${serviceData.name || 'Service'} - ${guest_name} at ${propertyName} (${billing_type === 'owner_gift' ? 'Owner Gift' : 'Company Gift'})`,
          referenceNumber: bookingIdRef,
          processedBy: userId,
        });

        console.log("[SERVICE-BOOKING] Created complimentary finance record for", billing_type, "with currency:", orgCurrency);
      }
    } catch (financeErr: any) {
      // Log finance creation error but don't fail the booking
      console.error("[SERVICE-BOOKING] Warning: Failed to create finance record:", financeErr.message);
    }

    res.status(201).json({ booking: newBooking[0] });

  } catch (err: any) {
    console.error("[SERVICE-BOOKING] ERROR creating booking:", err);
    res.status(500).json({ error: err.message || 'Server error creating booking' });
  }
});

// GET /api/service-bookings - List service bookings
serviceBookingRouter.get("/", isDemoAuthenticated, async (req: any, res) => {
  console.log("[SERVICE-BOOKING] GET /api/service-bookings hit");
  
  try {
    const orgId = req.user?.organizationId || "default-org";
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : null;

    // Build where conditions
    const whereConditions = [eq(addonBookings.organizationId, orgId)];
    if (propertyId) {
      whereConditions.push(eq(addonBookings.propertyId, propertyId));
    }

    // Fetch bookings with service name and property name
    const rawBookings = await db.select()
      .from(addonBookings)
      .leftJoin(addonServices, eq(addonBookings.serviceId, addonServices.id))
      .leftJoin(properties, eq(addonBookings.propertyId, properties.id))
      .where(and(...whereConditions))
      .orderBy(order === 'asc' ? addonBookings.createdAt : desc(addonBookings.createdAt))
      .limit(limit);

    // Transform the results to flatten the joined data
    // Drizzle returns keys matching JS variable names (addonBookings, addonServices, properties)
    // Filter out any rows where addonBookings is undefined (shouldn't happen but handle edge cases)
    const bookings = rawBookings
      .filter((row: any) => row.addon_bookings || row.addonBookings)
      .map((row: any) => {
        // Drizzle may use snake_case or camelCase depending on naming strategy
        const booking = row.addon_bookings || row.addonBookings;
        const service = row.addon_services || row.addonServices;
        const property = row.properties;
        
        return {
          id: booking?.id,
          bookingIdRef: booking?.bookingIdRef || booking?.booking_id_ref,
          serviceId: booking?.serviceId || booking?.service_id,
          serviceName: service?.name || null,
          guestName: booking?.guestName || booking?.guest_name,
          guestEmail: booking?.guestEmail || booking?.guest_email,
          guestPhone: booking?.guestPhone || booking?.guest_phone,
          propertyId: booking?.propertyId || booking?.property_id,
          propertyName: property?.name || null,
          billingType: booking?.billingType || booking?.billing_type,
          priceCents: booking?.priceCents || booking?.price_cents,
          dateDue: booking?.dateDue || booking?.date_due,
          scheduledDate: booking?.scheduledDate || booking?.scheduled_date,
          status: booking?.status,
          totalPrice: booking?.totalPrice || booking?.total_price,
          createdAt: booking?.createdAt || booking?.created_at,
        };
      });

    console.log("[SERVICE-BOOKING] Found", bookings.length, "bookings");
    res.json({ bookings });

  } catch (err: any) {
    console.error("[SERVICE-BOOKING] ERROR fetching bookings:", err);
    res.status(500).json({ error: err.message || 'Server error fetching bookings' });
  }
});

// GET /api/service-bookings/:id - Get a specific booking
serviceBookingRouter.get("/:id", isDemoAuthenticated, async (req: any, res) => {
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
