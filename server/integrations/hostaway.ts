import axios, { AxiosInstance } from 'axios';

export interface HostawayListing {
  id: number;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyType: string;
  status: string;
}

export interface HostawayAvailability {
  date: string;
  available: boolean;
  price?: number;
  minStay?: number;
}

export interface HostawayCredentials {
  apiKey: string;
  accountId: string;
}

export class HostawayClient {
  private client: AxiosInstance;
  private credentials: HostawayCredentials;

  constructor(credentials: HostawayCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getListings(): Promise<HostawayListing[]> {
    try {
      const response = await this.client.get('/listings', {
        params: {
          accountId: this.credentials.accountId
        }
      });
      
      return response.data.result?.map((listing: any) => ({
        id: listing.id,
        title: listing.name || listing.title,
        address: listing.address,
        bedrooms: listing.bedrooms || 0,
        bathrooms: listing.bathrooms || 0,
        maxGuests: listing.maxGuests || 1,
        propertyType: listing.propertyTypeName || 'Unknown',
        status: listing.isActive ? 'active' : 'inactive'
      })) || [];
    } catch (error) {
      console.error('Error fetching Hostaway listings:', error);
      throw new Error('Failed to fetch listings from Hostaway');
    }
  }

  async getAvailability(listingId: number, startDate: string, endDate: string): Promise<HostawayAvailability[]> {
    try {
      const response = await this.client.get(`/listings/${listingId}/calendar`, {
        params: {
          startDate,
          endDate,
          accountId: this.credentials.accountId
        }
      });

      return response.data.result?.map((day: any) => ({
        date: day.date,
        available: day.isAvailable,
        price: day.price || undefined,
        minStay: day.minStay || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching Hostaway availability:', error);
      throw new Error('Failed to fetch availability from Hostaway');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/me', {
        params: { accountId: this.credentials.accountId }
      });
      return true;
    } catch (error) {
      console.error('Hostaway connection test failed:', error);
      return false;
    }
  }
}