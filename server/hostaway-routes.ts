import { Router } from "express";
import { isDemoAuthenticated } from "./demoAuth";
import { db } from "./db";
import { properties } from "@shared/schema";
import { and, eq, inArray } from "drizzle-orm";

const router = Router();

// Test Hostaway connection
router.get("/test-connection", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { hostawayService } = await import("./hostawayService");
    const result = await hostawayService.testConnection();
    res.json(result);
  } catch (error: any) {
    console.error("Error testing Hostaway connection:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to test Hostaway connection",
    });
  }
});

/**
 * Get Hostaway listings from HOSTAWAY API,
 * then attach local DB propertyId (if synced).
 *
 * This keeps the old rich Hostaway UI,
 * but also lets the frontend link to /property/:propertyId.
 */

// Get all Hostaway listings (DB-backed when possible)
router.get("/listings", isDemoAuthenticated, async (req: any, res) => {
  console.log(
    "🚀 [HOSTAWAY] Route handler executing for /listings (DB-backed)",
  );

  try {
    const organizationId = req.user?.organizationId || "default-org";

    // try DB-first: return properties inserted by syncPropertiesToDatabase
    const { db } = await import("./db");
    const { properties } = await import("../shared/schema");
    const { eq, and } = await import("drizzle-orm");

    console.log("🚀 [HOSTAWAY] Looking for DB-backed Hostaway properties...");
    const dbProps = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.organizationId, organizationId),
          eq(properties.source, "HOSTAWAY"),
        ),
      )
      .orderBy(properties.id);

    if (dbProps && dbProps.length > 0) {
      console.log(
        `🚀 [HOSTAWAY] Returning ${dbProps.length} Hostaway properties from DB`,
      );

      // Normalize DB properties into the shape the frontend expects
      const listings = dbProps.map((row: any) => {
        const imagesArray: string[] = Array.isArray(row.images)
          ? row.images
          : [];

        const listingImages =
          imagesArray.length > 0 ? imagesArray.map((url) => ({ url })) : [];

        // price used by the UI
        const price =
          row.price ??
          row.pricePerNight ??
          (typeof row.pricePerNight === "string"
            ? parseFloat(row.pricePerNight)
            : undefined);

        return {
          // core fields used in Hostaway cards
          id: row.id,
          name: row.name,
          description: row.description,
          price,
          bedroomsNumber: row.bedrooms,
          bathroomsNumber: row.bathrooms,
          personCapacity: row.maxGuests,
          averageReviewRating: row.averageReviewRating,
          airbnbListingUrl: row.airbnbListingUrl,

          // 🔑 the image fields that the UI expects
          thumbnailUrl:
            row.thumbnailUrl ??
            (imagesArray.length > 0 ? imagesArray[0] : null),
          listingImages,

          // mapping/meta fields (kept for future use)
          organizationId: row.organizationId,
          source: row.source,
          externalId: row.externalId,
          hostawayId: row.hostawayId,
          hostawayListingMapId: row.hostawayListingMapId,
          hostawayPropertyId: row.hostawayPropertyId,
          hostawayAccountId: row.hostawayAccountId,
        };
      });

      return res.json({
        success: true,
        listings,
        count: listings.length,
        backend: "db",
      });
    }

    // If DB has none, fall back to external Hostaway API (unchanged behavior)
    console.log(
      "🚀 [HOSTAWAY] No DB-backed properties found, falling back to Hostaway API",
    );
    const { hostawayService } = await import("./hostawayService");
    const { limit, offset, city, country } = req.query;

    const listings = await hostawayService.getListings({
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      city: city as string,
      country: country as string,
    });

    console.log(
      "🚀 [HOSTAWAY] Got",
      listings.length,
      "listings from Hostaway API - sending JSON response",
    );
    return res.json({
      success: true,
      listings,
      count: listings.length,
      backend: "hostaway-api",
    });
  } catch (error: any) {
    console.error("Error fetching Hostaway listings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Hostaway listings",
    });
  }
});

// Get single Hostaway listing by ID (still direct API)
router.get("/listings/:id", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { hostawayService } = await import("./hostawayService");
    const listingId = parseInt(req.params.id);

    const listing = await hostawayService.getListing(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    res.json({
      success: true,
      listing,
    });
  } catch (error: any) {
    console.error("Error fetching Hostaway listing:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Hostaway listing",
    });
  }
});

// Sync Hostaway properties to database (unchanged)
router.post("/sync-properties", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { hostawayService } = await import("./hostawayService");
    const organizationId = req.user?.organizationId || "default-org";

    console.log(
      `🔄 Starting Hostaway properties sync for organization: ${organizationId}`,
    );
    const result =
      await hostawayService.syncPropertiesToDatabase(organizationId);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully synced ${result.synced} properties from Hostaway`,
        synced: result.synced,
        properties: result.properties,
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Sync completed with errors: ${result.errors.join(", ")}`,
        synced: result.synced,
        errors: result.errors,
      });
    }
  } catch (error: any) {
    console.error("Error syncing Hostaway properties:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync Hostaway properties",
    });
  }
});

// Sync Hostaway bookings to database (unchanged)
router.post("/sync-bookings", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { hostawayService } = await import("./hostawayService");
    const organizationId = req.user?.organizationId || "default-org";

    console.log(
      `🔄 Starting Hostaway bookings sync for organization: ${organizationId}`,
    );
    const result = await hostawayService.syncBookingsToDatabase(organizationId);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully synced ${result.synced} bookings from Hostaway`,
        synced: result.synced,
        bookings: result.bookings,
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Sync completed with errors: ${result.errors.join(", ")}`,
        synced: result.synced,
        errors: result.errors,
      });
    }
  } catch (error: any) {
    console.error("Error syncing Hostaway bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to sync Hostaway bookings",
    });
  }
});

export default router;
