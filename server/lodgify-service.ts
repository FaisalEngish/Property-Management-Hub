import axios, { AxiosInstance } from "axios";

interface LodgifyProperty {
  id: number;
  name: string;
  currency: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  type?: string;
  description?: string;
}

interface LodgifyBooking {
  id: number;
  property_id: number;
  guest: {
    name?: string;
    email?: string;
    phone?: string;
    country_code?: string;
  };
  status: string;
  arrival: string;
  departure: string;
  total: number;
  currency_code: string;
  people: number;
  source?: string;
  created: string;
  modified: string;
}

interface LodgifyBookingWithTransactions extends LodgifyBooking {
  transactions?: Array<{
    id: number;
    type: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
  }>;
}

export class LodgifyService {
  private client: AxiosInstance;
  private apiKey: string;
  private organizationId: string;

  constructor(apiKey: string, organizationId: string = "default-org") {
    if (!apiKey) {
      throw new Error("Lodgify API key is required");
    }

    this.apiKey = apiKey;
    this.organizationId = organizationId;

    this.client = axios.create({
      baseURL: "https://api.lodgify.com",
      headers: {
        "X-ApiKey": this.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get("/v1/properties");
      return {
        success: true,
        message: `Connected successfully. Found ${response.data.length || 0} properties.`,
      };
    } catch (error: any) {
      console.error("[Lodgify] Connection test failed:", error.message);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Connection failed",
      };
    }
  }

  /**
   * Fetch all properties from Lodgify
   */
  async getProperties(): Promise<LodgifyProperty[]> {
    try {
      const response = await this.client.get("/v1/properties");
      console.log(`[Lodgify] Fetched ${response.data.length} properties`);
      return response.data;
    } catch (error: any) {
      console.error("[Lodgify] Error fetching properties:", error.message);
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  /**
   * Fetch a single property by ID
   */
  async getProperty(propertyId: number): Promise<LodgifyProperty> {
    try {
      const response = await this.client.get(`/v1/properties/${propertyId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `[Lodgify] Error fetching property ${propertyId}:`,
        error.message,
      );
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  /**
   * Fetch all bookings from Lodgify
   * @param includeTransactions - Include payment transaction details
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 100)
   */
  async getBookings(
    includeTransactions: boolean = true,
    page: number = 1,
    size: number = 100,
  ): Promise<LodgifyBookingWithTransactions[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        includeTransactions: includeTransactions.toString(),
        includeExternal: "false",
        includeQuoteDetails: "true",
      });

      const response = await this.client.get(
        `/v2/reservations/bookings?${params.toString()}`,
      );
      console.log(`[Lodgify] Fetched ${response.data.length} bookings`);
      return response.data;
    } catch (error: any) {
      console.error("[Lodgify] Error fetching bookings:", error.message);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  /**
   * Fetch a single booking by ID
   */
  async getBooking(bookingId: number): Promise<LodgifyBookingWithTransactions> {
    try {
      const response = await this.client.get(
        `/v2/reservations/bookings/${bookingId}`,
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `[Lodgify] Error fetching booking ${bookingId}:`,
        error.message,
      );
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  }

  /**
   * Create a new booking in Lodgify
   */
  async createBooking(
    bookingData: Partial<LodgifyBooking>,
  ): Promise<LodgifyBooking> {
    try {
      const response = await this.client.post(
        "/v1/reservation/booking",
        bookingData,
      );
      console.log(`[Lodgify] Created booking ID: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error("[Lodgify] Error creating booking:", error.message);
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Get payment link for a booking
   */
  async getPaymentLink(bookingId: number): Promise<string> {
    try {
      const response = await this.client.get(
        `/v2/reservations/bookings/${bookingId}/quote/paymentLink`,
      );
      return response.data.paymentLink || response.data;
    } catch (error: any) {
      console.error(
        `[Lodgify] Error getting payment link for booking ${bookingId}:`,
        error.message,
      );
      throw new Error(`Failed to get payment link: ${error.message}`);
    }
  }

  /**
   * Fetch availability calendar for a property
   */
  async getCalendar(
    propertyId: number,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    try {
      const response = await this.client.get(
        `/v1/calendar?propertyId=${propertyId}&start=${startDate}&end=${endDate}`,
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `[Lodgify] Error fetching calendar for property ${propertyId}:`,
        error.message,
      );
      throw new Error(`Failed to fetch calendar: ${error.message}`);
    }
  }
}

// Cache instances per organization to avoid credential leakage
const lodgifyInstances: Map<string, LodgifyService> = new Map();

export function getLodgifyService(
  apiKey: string,
  organizationId: string = "default-org",
): LodgifyService {
  // Create a new instance for each organization
  const cacheKey = `${organizationId}:${apiKey.substring(0, 10)}`;

  if (!lodgifyInstances.has(cacheKey)) {
    lodgifyInstances.set(cacheKey, new LodgifyService(apiKey, organizationId));
  }

  return lodgifyInstances.get(cacheKey)!;
}

export function clearLodgifyCache() {
  lodgifyInstances.clear();
}
