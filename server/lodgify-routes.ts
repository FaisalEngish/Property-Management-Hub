import { Router, Request, Response } from "express";
import { getLodgifyService } from "./lodgify-service";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  properties,
  bookings,
  apiConnections,
  organizationApiKeys,
} from "@shared/schema";

const router = Router();

// Helper function to get organization from session
function getOrgId(req: Request): string {
  return (req.user as any)?.organizationId || "default-org";
}

// Helper function to get Lodgify API key for organization
async function getLodgifyApiKey(organizationId: string): Promise<string> {
  // PRODUCTION SECURITY REQUIREMENTS:
  // 1. API keys MUST be encrypted at rest using strong encryption (AES-256)
  // 2. Decryption keys MUST be stored in secure key management (e.g., AWS KMS, HashiCorp Vault)
  // 3. Fallback environment variable should ONLY be used in development/testing
  // 4. Each organization MUST have unique organizationId (never use 'default-org' in production)

  // First, try to get from organization API keys table
  const apiKeyRecord = await db
    .select()
    .from(organizationApiKeys)
    .where(
      and(
        eq(organizationApiKeys.organizationId, organizationId),
        eq(organizationApiKeys.provider, "lodgify"),
        eq(organizationApiKeys.isActive, true),
      ),
    )
    .limit(1);

  if (apiKeyRecord.length > 0 && apiKeyRecord[0].encryptedValue) {
    // TODO PRODUCTION: Decrypt the value using secure key management
    // Currently storing plaintext for development - MUST encrypt before production deployment
    console.log(
      `[Lodgify] Using database API key for organization: ${organizationId}`,
    );
    return apiKeyRecord[0].encryptedValue;
  }

  // Fallback to environment variable for testing/development ONLY
  const envKey = process.env.LODGIFY_API_KEY;
  if (envKey) {
    console.log(
      `[Lodgify] WARNING: Using fallback environment variable for org ${organizationId}. Configure org-specific key in production.`,
    );
    return envKey;
  }

  throw new Error(
    "Lodgify API key not configured. Please add it in API Connections settings.",
  );
}

/**
 * Test Lodgify API connection
 */
router.get("/lodgify/test-connection", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getLodgifyApiKey(orgId);
    const lodgify = getLodgifyService(apiKey, orgId);
    const result = await lodgify.testConnection();

    console.log("[Lodgify API] Connection test:", result);

    res.json(result);
  } catch (error: any) {
    console.error("[Lodgify API] Test connection error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Connection test failed",
    });
  }
});

/**
 * Fetch properties from Lodgify API
 */
router.get("/lodgify/fetch-properties", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getLodgifyApiKey(orgId);
    const lodgify = getLodgifyService(apiKey, orgId);
    const lodgifyProperties = await lodgify.getProperties();

    console.log(`[Lodgify API] Fetched ${lodgifyProperties.length} properties`);

    res.json({
      success: true,
      count: lodgifyProperties.length,
      properties: lodgifyProperties,
    });
  } catch (error: any) {
    console.error("[Lodgify API] Fetch properties error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch properties",
    });
  }
});

/**
 * Sync properties from Lodgify to local database
 */
router.post("/lodgify/sync-properties", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getLodgifyApiKey(orgId);
    const lodgify = getLodgifyService(apiKey, orgId);
    const lodgifyProperties = await lodgify.getProperties();

    let synced = 0;
    let updated = 0;
    let created = 0;
    const errors: string[] = [];

    for (const lodgifyProp of lodgifyProperties) {
      try {
        // Check if property already exists by external ID
        const existing = await db
          .select()
          .from(properties)
          .where(
            and(
              eq(properties.organizationId, orgId),
              eq(properties.externalId as any, lodgifyProp.id.toString()),
            ),
          )
          .limit(1);

        const propertyData = {
          organizationId: orgId,
          externalId: lodgifyProp.id.toString(),
          name: lodgifyProp.name,
          address: lodgifyProp.address?.street || "",
          city: lodgifyProp.address?.city || "",
          state: lodgifyProp.address?.state || "",
          zipCode: lodgifyProp.address?.zipCode || "",
          country: lodgifyProp.address?.country || "",
          bedrooms: lodgifyProp.bedrooms || 0,
          bathrooms: lodgifyProp.bathrooms || 0,
          maxGuests: lodgifyProp.maxGuests || 0,
          propertyType: lodgifyProp.type || "apartment",
          description: lodgifyProp.description || "",
          currency: lodgifyProp.currency || "USD",
          status: "active" as const,
          pricePerNight: 0, // Will be updated from calendar/rates
        };

        if (existing.length > 0) {
          // Update existing property
          await db
            .update(properties)
            .set({
              ...propertyData,
              updatedAt: new Date(),
            })
            .where(eq(properties.id, existing[0].id));
          updated++;
        } else {
          // Create new property
          await db.insert(properties).values(propertyData);
          created++;
        }

        synced++;
      } catch (error: any) {
        errors.push(`Property ${lodgifyProp.name}: ${error.message}`);
      }
    }

    console.log(
      `[Lodgify Sync] Properties: ${synced} synced (${created} created, ${updated} updated)`,
    );

    res.json({
      success: true,
      synced,
      created,
      updated,
      total: lodgifyProperties.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[Lodgify API] Sync properties error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync properties",
    });
  }
});

/**
 * Fetch bookings from Lodgify API
 */
router.get("/lodgify/fetch-bookings", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getLodgifyApiKey(orgId);
    const lodgify = getLodgifyService(apiKey, orgId);
    const lodgifyBookings = await lodgify.getBookings(true, 1, 100);

    console.log(`[Lodgify API] Fetched ${lodgifyBookings.length} bookings`);

    res.json({
      success: true,
      count: lodgifyBookings.length,
      bookings: lodgifyBookings,
    });
  } catch (error: any) {
    console.error("[Lodgify API] Fetch bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
});

/**
 * Sync bookings from Lodgify to local database
 */
router.post("/lodgify/sync-bookings", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getLodgifyApiKey(orgId);
    const lodgify = getLodgifyService(apiKey, orgId);
    const lodgifyBookings = await lodgify.getBookings(true, 1, 100);

    let synced = 0;
    let updated = 0;
    let created = 0;
    const errors: string[] = [];

    for (const lodgifyBooking of lodgifyBookings) {
      try {
        // Find matching property by external ID
        const matchedProperty = await db
          .select()
          .from(properties)
          .where(
            and(
              eq(properties.organizationId, orgId),
              eq(properties.externalId, lodgifyBooking.property_id.toString()),
            ),
          )
          .limit(1);

        if (matchedProperty.length === 0) {
          errors.push(
            `Booking ${lodgifyBooking.id}: Property not found (external ID: ${lodgifyBooking.property_id})`,
          );
          continue;
        }

        // Check if booking already exists
        const existing = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.organizationId, orgId),
              eq(bookings.externalId, lodgifyBooking.id.toString()),
            ),
          )
          .limit(1);

        // Calculate payment status
        const totalAmount = lodgifyBooking.total || 0;
        const transactions = lodgifyBooking.transactions || [];
        const amountPaid = transactions
          .filter((t) => t.status === "completed" || t.status === "paid")
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const amountDue = totalAmount - amountPaid;

        let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid";
        if (amountPaid >= totalAmount && totalAmount > 0) {
          paymentStatus = "paid";
        } else if (amountPaid > 0) {
          paymentStatus = "partial";
        }

        // Map Lodgify status to our status
        let bookingStatus:
          | "pending"
          | "confirmed"
          | "checked-in"
          | "checked-out"
          | "cancelled" = "confirmed";
        const lodgifyStatus = lodgifyBooking.status?.toLowerCase();
        if (lodgifyStatus === "cancelled") bookingStatus = "cancelled";
        else if (lodgifyStatus === "booked" || lodgifyStatus === "confirmed")
          bookingStatus = "confirmed";
        else if (lodgifyStatus === "tentative") bookingStatus = "pending";

        const bookingData = {
          organizationId: orgId,
          externalId: lodgifyBooking.id.toString(),
          propertyId: matchedProperty[0].id,
          guestName: lodgifyBooking.guest?.name || "Unknown Guest",
          guestEmail: lodgifyBooking.guest?.email || "",
          guestPhone: lodgifyBooking.guest?.phone || "",
          checkIn: lodgifyBooking.arrival,
          checkOut: lodgifyBooking.departure,
          guests: lodgifyBooking.people || 1,
          totalAmount: totalAmount.toFixed(2),
          currency: lodgifyBooking.currency_code || "USD",
          paymentStatus,
          amountPaid: amountPaid.toFixed(2),
          amountDue: amountDue.toFixed(2),
          status: bookingStatus,
          bookingPlatform: (lodgifyBooking.source || "lodgify") as any,
        };

        if (existing.length > 0) {
          // Update existing booking
          await db
            .update(bookings)
            .set({
              ...bookingData,
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, existing[0].id));
          updated++;
        } else {
          // Create new booking
          await db.insert(bookings).values(bookingData);
          created++;
        }

        synced++;
      } catch (error: any) {
        errors.push(`Booking ${lodgifyBooking.id}: ${error.message}`);
      }
    }

    console.log(
      `[Lodgify Sync] Bookings: ${synced} synced (${created} created, ${updated} updated)`,
    );

    res.json({
      success: true,
      synced,
      created,
      updated,
      total: lodgifyBookings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[Lodgify API] Sync bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync bookings",
    });
  }
});

/**
 * Get sync status and statistics
 */
router.get("/lodgify/sync-status", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    // Count synced properties (with externalId from Lodgify)
    const syncedProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.organizationId, orgId));

    // Count synced bookings
    const syncedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.organizationId, orgId));

    const lodgifyBookings = syncedBookings.filter(
      (b: any) => b.externalId && b.bookingPlatform === "lodgify",
    );

    res.json({
      success: true,
      properties: {
        total: syncedProperties.length,
        synced: syncedProperties.filter((p: any) => p.externalId).length,
      },
      bookings: {
        total: syncedBookings.length,
        synced: lodgifyBookings.length,
      },
      lastSync: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Lodgify API] Sync status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get sync status",
    });
  }
});

export default router;
