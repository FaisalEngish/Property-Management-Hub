import axios, { AxiosInstance } from 'axios';

// Property Data Types
export interface RentCastProperty {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize?: number;
  yearBuilt: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  assessedValue?: number;
  taxAmount?: number;
  owner?: {
    name: string;
    mailingAddress?: string;
  };
  features?: string[];
}

// Rent Estimate (AVM) Types
export interface RentEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  rent: number; // Backward compatibility
  rentRangeLow: number;
  rentRangeHigh: number;
  latitude: number;
  longitude: number;
  comparables?: RentComparable[];
}

export interface RentComparable {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  daysOnMarket?: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  distance: number; // miles from subject property
  latitude: number;
  longitude: number;
}

// Home Value Estimate Types
export interface ValueEstimate {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  latitude: number;
  longitude: number;
  comparables?: SaleComparable[];
}

export interface SaleComparable {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  saleDate: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  distance: number;
  latitude: number;
  longitude: number;
}

// Listings Types
export interface RentalListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  daysOnMarket: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  removedDate?: string;
  status: string;
}

export interface SaleListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  daysOnMarket: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  removedDate?: string;
  status: string;
}

// Market Data Types
export interface MarketData {
  id: string;
  city: string;
  state: string;
  zipCode: string;
  averageRent?: number;
  averagePrice?: number;
  medianRent?: number;
  medianPrice?: number;
  listings?: {
    total: number;
    forSale?: number;
    forRent?: number;
  };
  trends?: {
    rentChange30Day?: number;
    rentChange90Day?: number;
    rentChange1Year?: number;
    priceChange30Day?: number;
    priceChange90Day?: number;
    priceChange1Year?: number;
  };
}

export class RentCastService {
  private client: AxiosInstance;
  private apiKey: string;
  private organizationId: string;

  constructor(apiKey: string, organizationId: string = 'default-org') {
    if (!apiKey) {
      throw new Error('RentCast API key is required');
    }
    
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    
    this.client = axios.create({
      baseURL: 'https://api.rentcast.io/v1',
      headers: {
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with a simple property search
      const response = await this.client.get('/properties', {
        params: {
          city: 'Austin',
          state: 'TX',
          limit: 1,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          message: `Connected successfully. API key valid. Access to 140M+ properties.`,
        };
      }

      return {
        success: false,
        message: 'Unexpected response format',
      };
    } catch (error: any) {
      console.error('[RentCast API] Connection test error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Connection test failed');
    }
  }

  /**
   * Search properties by address, city, state, or zip code
   */
  async searchProperties(params: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: string; // e.g., "1:2" for range
    limit?: number;
  }): Promise<RentCastProperty[]> {
    try {
      const response = await this.client.get('/properties', {
        params: {
          address: params.address,
          city: params.city,
          state: params.state,
          zipCode: params.zipCode,
          radius: params.radius,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          limit: params.limit || 25,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[RentCast API] Property search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search properties');
    }
  }

  /**
   * Get property details by ID
   */
  async getProperty(propertyId: string): Promise<RentCastProperty> {
    try {
      const response = await this.client.get(`/properties/${propertyId}`);
      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Get property error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get property');
    }
  }

  /**
   * Get rent estimate (AVM) for a property with comparables
   */
  async getRentEstimate(params: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    compCount?: number; // Number of comparables to return (default 25)
  }): Promise<RentEstimate> {
    try {
      const response = await this.client.get('/avm/rent', {
        params: {
          address: params.address,
          city: params.city,
          state: params.state,
          zipCode: params.zipCode,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          squareFootage: params.squareFootage,
          compCount: params.compCount || 10,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Rent estimate error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get rent estimate');
    }
  }

  /**
   * Get home value estimate (AVM) with sale comparables
   */
  async getValueEstimate(params: {
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    compCount?: number;
  }): Promise<ValueEstimate> {
    try {
      const response = await this.client.get('/avm/value', {
        params: {
          address: params.address,
          city: params.city,
          state: params.state,
          zipCode: params.zipCode,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          squareFootage: params.squareFootage,
          compCount: params.compCount || 10,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Value estimate error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get value estimate');
    }
  }

  /**
   * Search long-term rental listings
   */
  async searchRentalListings(params: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: string;
    status?: string; // active, pending, rented
    limit?: number;
  }): Promise<RentalListing[]> {
    try {
      const response = await this.client.get('/listings/rental/long-term', {
        params: {
          city: params.city,
          state: params.state,
          zipCode: params.zipCode,
          radius: params.radius,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          status: params.status,
          limit: params.limit || 25,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[RentCast API] Rental listings search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search rental listings');
    }
  }

  /**
   * Get specific rental listing by ID
   */
  async getRentalListing(listingId: string): Promise<RentalListing> {
    try {
      const response = await this.client.get(`/listings/rental/long-term/${listingId}`);
      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Get rental listing error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get rental listing');
    }
  }

  /**
   * Search for-sale listings
   */
  async searchSaleListings(params: {
    city?: string;
    state?: string;
    zipCode?: string;
    radius?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: string;
    status?: string; // active, pending, sold
    limit?: number;
  }): Promise<SaleListing[]> {
    try {
      const response = await this.client.get('/listings/sale', {
        params: {
          city: params.city,
          state: params.state,
          zipCode: params.zipCode,
          radius: params.radius,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          status: params.status,
          limit: params.limit || 25,
        },
      });

      return response.data || [];
    } catch (error: any) {
      console.error('[RentCast API] Sale listings search error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to search sale listings');
    }
  }

  /**
   * Get specific sale listing by ID
   */
  async getSaleListing(listingId: string): Promise<SaleListing> {
    try {
      const response = await this.client.get(`/listings/sale/${listingId}`);
      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Get sale listing error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get sale listing');
    }
  }

  /**
   * Get market data and trends by zip code
   */
  async getMarketData(params: {
    zipCode?: string;
    city?: string;
    state?: string;
  }): Promise<MarketData> {
    try {
      const response = await this.client.get('/markets', {
        params: {
          zipCode: params.zipCode,
          city: params.city,
          state: params.state,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('[RentCast API] Market data error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get market data');
    }
  }
}

// Cache instances per organization to avoid credential leakage
// Key format: organizationId ensures complete isolation even with same API keys
const rentcastInstances: Map<string, RentCastService> = new Map();

export function getRentCastService(apiKey: string, organizationId: string = 'default-org'): RentCastService {
  // Always scope by organizationId first to prevent cross-tenant leakage
  // Even if multiple orgs use same API key (fallback), they get separate instances
  const cacheKey = `org:${organizationId}:key:${apiKey.substring(0, 10)}`;
  
  if (!rentcastInstances.has(cacheKey)) {
    rentcastInstances.set(cacheKey, new RentCastService(apiKey, organizationId));
  }
  
  return rentcastInstances.get(cacheKey)!;
}

export function clearRentCastCache() {
  rentcastInstances.clear();
}
