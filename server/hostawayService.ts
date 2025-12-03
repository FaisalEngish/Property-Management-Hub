import fetch from "node-fetch";

interface HostawayAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface HostawayListing {
  id: number;
  // these usually come from Hostaway listing APIs – we’ll use them if present
  listingMapId?: number;
  propertyId?: number;
  name: string;
  externalListingName?: string;
  internalListingName?: string;
  description?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  street?: string;
  address?: string;
  zipcode?: string;
  price?: number;
  starRating?: number;
  propertyTypeId?: number;
  guestBathroomsNumber?: number;
  maxGuests?: number;
  bedrooms?: number;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  guestsIncluded?: number;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  imageUrls?: string[];
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string;
  keyPickup?: string;
  specialInstruction?: string;
  doorSecurityCode?: string;
}

interface HostawayListingsResponse {
  status: string;
  result: HostawayListing[];
  limit: number | null;
  offset: number | null;
  count: number;
  page: number;
  totalPages: number;
}

interface HostawayReservation {
  id: number;
  listingMapId: number;
  channelId: number;
  status: string;
  arrivalDate: string;
  departureDate: string;
  guestName: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests: number;
  adults?: number;
  children?: number;
  totalPrice: number;
  isPaid: boolean;
  insertedOn: string;
  updatedOn: string;
  guestCurrency?: string;
  channelCommissionAmount?: number;
  channelCommissionPercent?: number;
  specialRequests?: string;
  guestTotalPrice?: number;
}

interface HostawayReservationsResponse {
  status: string;
  result: HostawayReservation[];
  limit: number | null;
  offset: number | null;
  count: number;
  page: number;
  totalPages: number;
}

export class HostawayService {
  private accountId: string;
  private apiKey: string;
  private baseUrl = "https://api.hostaway.com/v1";
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private isConfigured: boolean = false;

  constructor() {
    this.accountId = process.env.HOSTAWAY_ACCOUNT_ID || "";
    this.apiKey = process.env.HOSTAWAY_API_KEY || "";

    if (this.accountId && this.apiKey) {
      this.isConfigured = true;
    } else {
      console.warn(
        "⚠️ Hostaway credentials not configured. Please set HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY environment variables.",
      );
    }
  }

  private checkConfiguration(): void {
    if (!this.isConfigured) {
      throw new Error(
        "Hostaway is not configured. Please provide HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY in environment variables.",
      );
    }
  }

  /**
   * Authenticate with Hostaway API using OAuth 2.0 Client Credentials flow
   */
  private async authenticate(): Promise<string> {
    this.checkConfiguration();

    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    console.log("🔐 Authenticating with Hostaway API...");
    console.log("📍 Using credentials:", {
      client_id: this.accountId
        ? `${this.accountId.substring(0, 4)}****`
        : "missing",
      client_secret: this.apiKey ? "****" : "missing",
      baseUrl: this.baseUrl,
    });

    const response = await fetch(`${this.baseUrl}/accessTokens`, {
      method: "POST",
      headers: {
        "Cache-control": "no-cache",
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.accountId,
        client_secret: this.apiKey,
        scope: "general",
      }).toString(),
    });

    console.log(
      "📡 Hostaway auth response status:",
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Hostaway authentication failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 500), // Log first 500 chars
      });
      throw new Error(
        `Hostaway authentication failed: ${response.status} - ${errorText.substring(0, 200)}`,
      );
    }

    const data = (await response.json()) as HostawayAuthResponse;
    this.accessToken = data.access_token;
    // Set expiry to 90% of the actual expiry time to ensure we refresh before it expires
    this.tokenExpiry = Date.now() + data.expires_in * 1000 * 0.9;

    console.log("✅ Hostaway authentication successful");
    return this.accessToken;
  }

  /**
   * Fetch all listings/properties from Hostaway
   */
  async getListings(params?: {
    limit?: number;
    offset?: number;
    city?: string;
    country?: string;
  }): Promise<HostawayListing[]> {
    const token = await this.authenticate();

    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.city) queryParams.append("city", params.city);
    if (params?.country) queryParams.append("country", params.country);

    const url = `${this.baseUrl}/listings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    console.log(`📡 Fetching Hostaway listings from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-control": "no-cache",
      },
    });

    console.log(
      "📡 Hostaway listings response status:",
      response.status,
      response.statusText,
    );
    console.log(
      "📋 Response content-type:",
      response.headers.get("content-type"),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to fetch listings:", {
        status: response.status,
        error: errorText.substring(0, 500),
      });
      throw new Error(
        `Failed to fetch Hostaway listings: ${response.status} - ${errorText.substring(0, 200)}`,
      );
    }

    const responseText = await response.text();
    console.log(
      "📄 Response type:",
      typeof responseText,
      "First 200 chars:",
      responseText.substring(0, 200),
    );

    let data: HostawayListingsResponse;
    try {
      data = JSON.parse(responseText) as HostawayListingsResponse;
    } catch (parseError) {
      console.error(
        "❌ JSON parse error. Response was:",
        responseText.substring(0, 1000),
      );
      throw new Error(
        `Invalid JSON response from Hostaway: ${responseText.substring(0, 200)}`,
      );
    }

    console.log(`✅ Retrieved ${data.result.length} listings from Hostaway`);

    return data.result;
  }

  /**
   * Get a single listing by ID
   */
  async getListing(listingId: number): Promise<HostawayListing | null> {
    const token = await this.authenticate();

    const response = await fetch(`${this.baseUrl}/listings/${listingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-control": "no-cache",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch Hostaway listing ${listingId}: ${response.status} ${errorText}`,
      );
    }

    const data = (await response.json()) as { result: HostawayListing };
    return data.result;
  }

  /**
   * Test the connection to Hostaway
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    listingCount?: number;
  }> {
    try {
      this.checkConfiguration();
      await this.authenticate();
      const listings = await this.getListings({ limit: 1 });

      return {
        success: true,
        message: "Successfully connected to Hostaway",
        listingCount: listings.length,
      };
    } catch (error: any) {
      console.error("❌ Hostaway connection test failed:", error);
      return {
        success: false,
        message: error.message || "Unknown error connecting to Hostaway",
      };
    }
  }

  /**
   * Map Hostaway listing to our Property model
   */
  private mapHostawayListingToProperty(
    listing: HostawayListing,
    organizationId: string,
  ): any {
    const address =
      [
        listing.street || listing.address,
        listing.city,
        listing.state,
        listing.country,
      ]
        .filter(Boolean)
        .join(", ") || "No address provided";

    // Collect all available images from the listing response
    const images: string[] = [];
    
    console.log(`🖼️ [IMAGE DEBUG] Processing images for listing ${listing.id} (${listing.name})`);
    console.log(`  thumbnailUrl:`, listing.thumbnailUrl ? 'EXISTS' : 'MISSING');
    console.log(`  imageUrls:`, listing.imageUrls ? `ARRAY[${listing.imageUrls.length}]` : 'MISSING');
    console.log(`  listingImages:`, (listing as any).listingImages ? `ARRAY[${(listing as any).listingImages.length}]` : 'MISSING');
    
    // Helper function to filter out low-quality thumbnails
    const isHighQualityImage = (url: string): boolean => {
      if (!url || !url.startsWith('http')) return false;
      
      // Filter out Airbnb x_small and small thumbnails (these are pixelated!)
      if (url.includes('aki_policy=x_small') || url.includes('aki_policy=small')) {
        console.log(`  🚫 Skipping low-quality thumbnail: ${url.substring(0, 80)}...`);
        return false;
      }
      
      return true;
    };
    
    // Helper to upgrade Airbnb image URLs to high quality
    const upgradeImageQuality = (url: string): string => {
      if (url.includes('muscache.com') && url.includes('aki_policy=')) {
        // Replace with large or remove policy to get original
        return url.replace(/aki_policy=(x_small|small|medium)/, 'aki_policy=large');
      }
      return url;
    };
    
    // Add listingImages array FIRST (these are usually Hostaway S3 URLs - full resolution)
    if ((listing as any).listingImages && Array.isArray((listing as any).listingImages)) {
      const listingImgUrls = (listing as any).listingImages
        .map((img: any) => img.url || img.large || img.original)
        .filter(isHighQualityImage)
        .map(upgradeImageQuality);
      images.push(...listingImgUrls);
    }
    
    // Add imageUrls array (if present)
    if (listing.imageUrls && listing.imageUrls.length > 0) {
      const filteredUrls = listing.imageUrls
        .filter(isHighQualityImage)
        .map(upgradeImageQuality);
      images.push(...filteredUrls);
    }
    
    // Add thumbnail LAST (often low quality, only as fallback)
    if (listing.thumbnailUrl && isHighQualityImage(listing.thumbnailUrl)) {
      images.push(upgradeImageQuality(listing.thumbnailUrl));
    }
    
    // Remove duplicates
    const uniqueImages = Array.from(new Set(images));
    
    console.log(`  ✅ Final unique images count: ${uniqueImages.length}`);

    return {
      organizationId,
      source: "HOSTAWAY",

      // generic identifiers
      externalId: listing.id.toString(),
      hostawayId: listing.id.toString(),

      // 🔹 NEW: explicit Hostaway mapping fields for our properties schema
      hostawayListingMapId: listing.listingMapId ?? listing.id ?? null,
      hostawayPropertyId: listing.propertyId ?? listing.id ?? null,
      hostawayAccountId: Number(this.accountId) || null,

      name:
        listing.name ||
        listing.externalListingName ||
        listing.internalListingName ||
        "Unnamed Property",
      address,
      description: listing.description || "",
      bedrooms: listing.bedroomsNumber || listing.bedrooms || 0,
      bathrooms: listing.bathroomsNumber || listing.guestBathroomsNumber || 0,
      maxGuests: listing.guestsIncluded || listing.maxGuests || 0,
      rating: listing.starRating?.toString() || null,
      pricePerNight: listing.price?.toString() || "0",
      currency: "USD", // or match your properties.currency default
      status: "active",
      amenities: listing.amenities || [],
      images: uniqueImages,
      googleMapsLink:
        listing.latitude && listing.longitude
          ? `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`
          : null,
      ownerId: null, // Will be set to organization owner if needed
    };
  }

  /**
   * Sync Hostaway properties to database
   * Upserts properties by matching source=HOSTAWAY and externalId
   */
  /**
   * Fetch photos for a listing from Hostaway API
   */
  /**
   * Deprecated: Photos endpoint returns 404 (requires special API scope)
   * Images are now extracted directly from the listing response
   */
  async getListingPhotos(listingId: number): Promise<string[]> {
    console.warn(`⚠️ getListingPhotos() is deprecated - images are in listing response`);
    return [];
  }

  async syncPropertiesToDatabase(organizationId: string): Promise<{
    success: boolean;
    synced: number;
    errors: string[];
    properties?: any[];
  }> {
    try {
      this.checkConfiguration();

      console.log("🔄 Starting Hostaway properties sync...");
      const listings = await this.getListings();
      console.log(`📦 Found ${listings.length} Hostaway listings to sync`);

      const { db } = await import("./db");
      const { properties } = await import("../shared/schema");
      const { eq, and } = await import("drizzle-orm");

      const syncedProperties: any[] = [];
      const errors: string[] = [];

      for (const listing of listings) {
        try {
          // Use images already in the listing response
          // (thumbnailUrl, imageUrls, listingImages are already populated by getListings)
          const propertyData = this.mapHostawayListingToProperty(
            listing,
            organizationId,
          );

          // Check if property already exists
          const existing = await db
            .select()
            .from(properties)
            .where(
              and(
                eq(properties.organizationId, organizationId),
                eq(properties.source, "HOSTAWAY"),
                eq(properties.externalId, listing.id.toString()),
              ),
            )
            .limit(1);

          if (existing.length > 0) {
            // Update existing property
            const [updated] = await db
              .update(properties)
              .set({
                ...propertyData,
                updatedAt: new Date(),
              })
              .where(eq(properties.id, existing[0].id))
              .returning();

            syncedProperties.push(updated);
            console.log(
              `✅ Updated Hostaway property: ${propertyData.name} (ID: ${listing.id})`,
            );
          } else {
            // Insert new property
            const [inserted] = await db
              .insert(properties)
              .values(propertyData)
              .returning();

            syncedProperties.push(inserted);
            console.log(
              `✅ Created new Hostaway property: ${propertyData.name} (ID: ${listing.id})`,
            );
          }
        } catch (error: any) {
          const errorMsg = `Failed to sync listing ${listing.id}: ${error.message}`;
          console.error("❌", errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(
        `✅ Sync complete: ${syncedProperties.length} properties synced, ${errors.length} errors`,
      );

      return {
        success: errors.length === 0,
        synced: syncedProperties.length,
        errors,
        properties: syncedProperties,
      };
    } catch (error: any) {
      console.error("❌ Hostaway sync failed:", error);
      return {
        success: false,
        synced: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Get all reservations from Hostaway
   */
  async getReservations(params?: {
    listingId?: number;
    status?: string;
    arrivalStartDate?: string;
    arrivalEndDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<HostawayReservation[]> {
    this.checkConfiguration();

    const token = await this.authenticate();
    const queryParams = new URLSearchParams();

    if (params?.listingId)
      queryParams.append("listingMapId", params.listingId.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.arrivalStartDate)
      queryParams.append("arrivalStartDate", params.arrivalStartDate);
    if (params?.arrivalEndDate)
      queryParams.append("arrivalEndDate", params.arrivalEndDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    // Important: Include resources for complete data
    queryParams.append("includeResources", "1");

    const url = `${this.baseUrl}/reservations?${queryParams.toString()}`;
    console.log("📅 Fetching reservations from Hostaway:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch reservations: ${response.status} - ${errorText}`,
      );
    }

    const data = (await response.json()) as HostawayReservationsResponse;
    console.log(`✅ Fetched ${data.result.length} reservations from Hostaway`);

    return data.result;
  }

  /**
   * Map Hostaway reservation to our Booking model
   */
  private mapHostawayReservationToBooking(
    reservation: HostawayReservation,
    organizationId: string,
    propertyId: number | null,
  ): any {
    // Map Hostaway status to our booking status
    const statusMap: { [key: string]: string } = {
      new: "pending",
      confirmed: "confirmed",
      modified: "confirmed",
      cancelled: "cancelled",
      declined: "cancelled",
      expired: "cancelled",
      awaiting_payment: "pending",
    };

    const bookingStatus =
      statusMap[reservation.status.toLowerCase()] || "confirmed";

    // Determine payment status
    const paymentStatus = reservation.isPaid ? "paid" : "pending";

    // Calculate amounts
    const totalAmount =
      reservation.totalPrice || reservation.guestTotalPrice || 0;
    const amountPaid = reservation.isPaid ? totalAmount : 0;
    const amountDue = totalAmount - amountPaid;

    return {
      organizationId,
      source: "HOSTAWAY",
      externalId: reservation.id.toString(),
      hostawayId: reservation.id.toString(),
      propertyId,
      guestName:
        reservation.guestName ||
        `${reservation.guestFirstName || ""} ${reservation.guestLastName || ""}`.trim() ||
        "Guest",
      guestEmail: reservation.guestEmail || null,
      guestPhone: reservation.guestPhone || null,
      checkIn: reservation.arrivalDate,
      checkOut: reservation.departureDate,
      guests:
        reservation.numberOfGuests ||
        (reservation.adults || 0) + (reservation.children || 0),
      totalAmount: totalAmount.toString(),
      guestTotalPrice:
        reservation.guestTotalPrice?.toString() || totalAmount.toString(),
      platformPayout:
        reservation.totalPrice?.toString() || totalAmount.toString(),
      otaCommissionAmount:
        reservation.channelCommissionAmount?.toString() || null,
      otaCommissionPercentage:
        reservation.channelCommissionPercent?.toString() || null,
      currency: reservation.guestCurrency || "USD",
      status: bookingStatus,
      paymentStatus,
      amountPaid: amountPaid.toString(),
      amountDue: amountDue.toString(),
      specialRequests: reservation.specialRequests || null,
      bookingPlatform: "hostaway",
    };
  }

  /**
   * Sync Hostaway reservations to database
   * Must be called after properties are synced to ensure property mapping works
   */
  async syncBookingsToDatabase(organizationId: string): Promise<{
    success: boolean;
    synced: number;
    errors: string[];
    bookings?: any[];
  }> {
    try {
      this.checkConfiguration();

      console.log("🔄 Starting Hostaway bookings sync...");
      const reservations = await this.getReservations();
      console.log(
        `📦 Found ${reservations.length} Hostaway reservations to sync`,
      );

      const { db } = await import("./db");
      const { bookings, properties } = await import("../shared/schema");
      const { eq, and } = await import("drizzle-orm");

      const syncedBookings: any[] = [];
      const errors: string[] = [];

      for (const reservation of reservations) {
        try {
          // Find the corresponding property by Hostaway listing ID
          const property = await db
            .select()
            .from(properties)
            .where(
              and(
                eq(properties.organizationId, organizationId),
                eq(properties.source, "HOSTAWAY"),
                // 🔹 use the dedicated hostawayListingMapId column
                eq(properties.hostawayListingMapId, reservation.listingMapId),
              ),
            )
            .limit(1);

          if (property.length === 0) {
            const errorMsg = `Property not found for Hostaway listing ${reservation.listingMapId} (reservation ${reservation.id}). Please sync properties first.`;
            console.warn("⚠️", errorMsg);
            errors.push(errorMsg);
            continue;
          }

          const bookingData = this.mapHostawayReservationToBooking(
            reservation,
            organizationId,
            property[0].id,
          );

          // Check if booking already exists
          const existing = await db
            .select()
            .from(bookings)
            .where(
              and(
                eq(bookings.organizationId, organizationId),
                eq(bookings.source, "HOSTAWAY"),
                eq(bookings.externalId, reservation.id.toString()),
              ),
            )
            .limit(1);

          if (existing.length > 0) {
            // Update existing booking
            const [updated] = await db
              .update(bookings)
              .set({
                ...bookingData,
                updatedAt: new Date(),
              })
              .where(eq(bookings.id, existing[0].id))
              .returning();

            syncedBookings.push(updated);
            console.log(
              `✅ Updated Hostaway booking: ${bookingData.guestName} (ID: ${reservation.id})`,
            );
          } else {
            // Insert new booking
            const [inserted] = await db
              .insert(bookings)
              .values(bookingData)
              .returning();

            syncedBookings.push(inserted);
            console.log(
              `✅ Created new Hostaway booking: ${bookingData.guestName} (ID: ${reservation.id})`,
            );
          }
        } catch (error: any) {
          const errorMsg = `Failed to sync reservation ${reservation.id}: ${error.message}`;
          console.error("❌", errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(
        `✅ Bookings sync complete: ${syncedBookings.length} bookings synced, ${errors.length} errors`,
      );

      return {
        success: errors.length === 0,
        synced: syncedBookings.length,
        errors,
        bookings: syncedBookings,
      };
    } catch (error: any) {
      console.error("❌ Hostaway bookings sync failed:", error);
      return {
        success: false,
        synced: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Create a reservation in Hostaway
   * Used by our /api/booking-revenue route when property.source = "HOSTAWAY"
   */
  async createReservation(params: {
  listingMapId: number;
  arrivalDate: string;       // "YYYY-MM-DD"
  departureDate: string;     // "YYYY-MM-DD"
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests: number;
  specialRequests?: string;
}): Promise<{ id: number; reservationCode?: string | null }> {
  this.checkConfiguration();

  const token = await this.authenticate();

  const payload: any = {
    listingMapId: params.listingMapId,
    arrivalDate: params.arrivalDate,
    departureDate: params.departureDate,
    guestName: params.guestName,
    guestEmail: params.guestEmail,
    phone: params.guestPhone,
    numberOfGuests: params.numberOfGuests,
    specialRequests: params.specialRequests,
    // 🔸 channelId: adjust if you use a specific "Direct / Manual" channel in Hostaway
    channelId: 2000,
  };

  console.log("[HOSTAWAY] Creating reservation with payload:", payload);

  const response = await fetch(`${this.baseUrl}/reservations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[HOSTAWAY] Reservation create failed:",
      response.status,
      errorText.substring(0, 500),
    );
    throw new Error(
      `Failed to create reservation in Hostaway: ${response.status} - ${errorText.substring(0, 200)}`,
    );
  }

  const data = await response.json() as any;
  // Hostaway often wraps result in { status, result: { ... } }
  const reservation = (data.result ?? data) as {
    id: number;
    reservationCode?: string;
    code?: string;
  };

  console.log("[HOSTAWAY] Reservation created:", reservation.id);

    return {
      id: reservation.id,
      reservationCode: reservation.reservationCode || reservation.code || null,
    };
  }
}


// Export singleton instance
export const hostawayService = new HostawayService();
