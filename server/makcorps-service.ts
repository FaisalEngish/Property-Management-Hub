import axios, { AxiosInstance } from 'axios';

export interface MakcorpsMappingResult {
  autobroadened: string;
  type: string;
  title: string;
  document_id: string;
  scope: string;
  name: string;
  data_type: string;
  details: {
    placetype?: number;
    parent_name?: string;
    address?: string;
    grandparent_name?: string;
    highlighted_name?: string;
  };
}

export interface MakcorpsHotelPricing {
  vendor1?: string;
  price1?: string;
  Totalprice1?: string;
  vendor2?: string;
  price2?: string;
  Totalprice2?: string;
  vendor3?: string;
  price3?: string;
  Totalprice3?: string;
  vendor4?: string;
  price4?: string;
  Totalprice4?: string;
}

export interface MakcorpsCitySearchResult {
  comparison: MakcorpsHotelPricing[][];
  hotel_name?: string;
  hotel_id?: string;
  rating?: number;
  reviews_count?: number;
}

export interface MakcorpsBookingResult {
  room: string;
  price: string;
  payment_details: string[];
}

export class MakcorpsService {
  private client: AxiosInstance;
  private apiKey: string;
  private organizationId: string;

  constructor(apiKey: string, organizationId: string = 'default-org') {
    if (!apiKey) {
      throw new Error('Makcorps API key is required');
    }
    
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    
    this.client = axios.create({
      baseURL: 'https://api.makcorps.com',
      timeout: 30000,
      params: {
        api_key: this.apiKey,
      },
    });
  }

  /**
   * Test the API connection by making a simple mapping request
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get('/mapping', {
        params: {
          name: 'New York',
        },
      });

      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          message: `Connected successfully. Found ${response.data.length} results for test query.`,
        };
      }

      return {
        success: false,
        message: 'Unexpected response format',
      };
    } catch (error: any) {
      console.error('[Makcorps API] Connection test error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Connection test failed');
    }
  }

  /**
   * Search for hotel or city IDs using the Mapping API
   * @param name - Hotel or city name to search for
   */
  async searchMapping(name: string): Promise<MakcorpsMappingResult[]> {
    try {
      const response = await this.client.get('/mapping', {
        params: { name },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[Makcorps API] Mapping search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search mapping');
    }
  }

  /**
   * Search hotels by city ID with pricing comparison
   * @param cityId - City ID from mapping API
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param adults - Number of adults
   * @param rooms - Number of rooms
   * @param currency - Currency code (USD, EUR, etc.)
   * @param pagination - Page number (starts at 0, ~30 hotels per page)
   * @param kids - Number of children (optional, 0-10)
   */
  async searchByCity(params: {
    cityId: string;
    checkin: string;
    checkout: string;
    adults: number;
    rooms: number;
    currency: string;
    pagination?: number;
    kids?: number;
  }): Promise<MakcorpsCitySearchResult[]> {
    try {
      const response = await this.client.get('/city', {
        params: {
          cityid: params.cityId,
          checkin: params.checkin,
          checkout: params.checkout,
          adults: params.adults,
          rooms: params.rooms,
          cur: params.currency,
          pagination: params.pagination || 0,
          kids: params.kids || 0,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[Makcorps API] City search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search by city');
    }
  }

  /**
   * Get pricing for a specific hotel from 15+ vendors
   * @param hotelId - Hotel ID from mapping API
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param adults - Number of adults
   * @param rooms - Number of rooms
   * @param currency - Currency code (USD, EUR, etc.)
   */
  async searchByHotel(params: {
    hotelId: string;
    checkin: string;
    checkout: string;
    adults: number;
    rooms: number;
    currency: string;
  }): Promise<{ comparison: MakcorpsHotelPricing[][] }> {
    try {
      const response = await this.client.get('/hotel', {
        params: {
          hotelid: params.hotelId,
          checkin: params.checkin,
          checkout: params.checkout,
          adults: params.adults,
          rooms: params.rooms,
          cur: params.currency,
        },
      });

      return response.data || { comparison: [] };
    } catch (error: any) {
      console.error('[Makcorps API] Hotel search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search by hotel');
    }
  }

  /**
   * Get Booking.com specific pricing data
   * @param country - ISO country code (e.g., "us")
   * @param hotelId - Booking.com hotel ID
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param adults - Number of adults
   * @param rooms - Number of rooms
   * @param currency - Currency code (USD, EUR, etc.)
   * @param kids - Number of children
   */
  async getBookingPrices(params: {
    country: string;
    hotelId: string;
    checkin: string;
    checkout: string;
    adults: number;
    rooms: number;
    currency: string;
    kids?: number;
  }): Promise<MakcorpsBookingResult[]> {
    try {
      const response = await this.client.get('/booking', {
        params: {
          country: params.country,
          hotelid: params.hotelId,
          checkin: params.checkin,
          checkout: params.checkout,
          adults: params.adults,
          rooms: params.rooms,
          currency: params.currency,
          kids: params.kids || 0,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[Makcorps API] Booking.com search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get Booking.com prices');
    }
  }

  /**
   * Get Expedia specific pricing data
   * @param hotelId - Expedia hotel ID
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param adults - Number of adults
   * @param rooms - Number of rooms
   * @param currency - Currency code (USD, EUR, etc.)
   * @param kids - Number of children (optional)
   */
  async getExpediaPrices(params: {
    hotelId: string;
    checkin: string;
    checkout: string;
    adults: number;
    rooms: number;
    currency: string;
    kids?: number;
  }): Promise<any> {
    try {
      const response = await this.client.get('/expedia', {
        params: {
          hotelid: params.hotelId,
          checkin: params.checkin,
          checkout: params.checkout,
          adults: params.adults,
          rooms: params.rooms,
          currency: params.currency,
          kids: params.kids || 0,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[Makcorps API] Expedia search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get Expedia prices');
    }
  }
}

// Cache instances per organization to avoid credential leakage
// Key format: organizationId ensures complete isolation even with same API keys
const makcorpsInstances: Map<string, MakcorpsService> = new Map();

export function getMakcorpsService(apiKey: string, organizationId: string = 'default-org'): MakcorpsService {
  // Always scope by organizationId first to prevent cross-tenant leakage
  // Even if multiple orgs use same API key (fallback), they get separate instances
  const cacheKey = `org:${organizationId}:key:${apiKey.substring(0, 10)}`;
  
  if (!makcorpsInstances.has(cacheKey)) {
    makcorpsInstances.set(cacheKey, new MakcorpsService(apiKey, organizationId));
  }
  
  return makcorpsInstances.get(cacheKey)!;
}

export function clearMakcorpsCache() {
  makcorpsInstances.clear();
}
