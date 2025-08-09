import axios, { AxiosInstance } from 'axios';
import { PMSClient, PMSListing, PMSAvailability } from '../types';

export interface HostawayConfig {
  apiKey?: string;
  accountId: string;
  accessToken?: string;
}

export class HostawayAdapter implements PMSClient {
  private client: AxiosInstance;
  private config: HostawayConfig;

  constructor(config: HostawayConfig) {
    this.config = config;
    
    const authHeader = config.accessToken 
      ? `Bearer ${config.accessToken}`
      : config.apiKey 
        ? `Bearer ${config.apiKey}`
        : undefined;

    this.client = axios.create({
      baseURL: process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    });
  }

  async listListings(params?: { limit?: number; offset?: number }): Promise<PMSListing[]> {
    try {
      const { limit = 50, offset = 0 } = params || {};
      
      const response = await this.client.get('/listings', {
        params: {
          accountId: this.config.accountId,
          limit,
          offset,
          includeInactive: false
        }
      });

      if (!response.data?.result) {
        throw new Error('Invalid response format from Hostaway');
      }
      
      return response.data.result.map((listing: any) => ({
        id: listing.id.toString(),
        title: listing.name || listing.title || 'Unnamed Property',
        address: this.formatAddress(listing),
        bedrooms: parseInt(listing.bedrooms) || 0,
        bathrooms: parseInt(listing.bathrooms) || 0,
        maxGuests: parseInt(listing.maxGuests) || 1,
        propertyType: listing.propertyTypeName || 'Property',
        status: listing.isActive ? 'active' : 'inactive',
        description: listing.description || undefined,
        images: listing.pictures?.map((pic: any) => pic.url).slice(0, 5) || undefined
      }));
    } catch (error) {
      console.error('Error fetching Hostaway listings:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Hostaway credentials - please reconnect your integration');
        }
        if (error.response?.status === 403) {
          throw new Error('Insufficient permissions - check your Hostaway account access');
        }
        throw new Error(`Hostaway API error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to fetch listings from Hostaway');
    }
  }

  async getAvailability(params: { 
    listingId: string | number; 
    start: string; 
    end: string 
  }): Promise<PMSAvailability[]> {
    try {
      const { listingId, start, end } = params;
      
      const response = await this.client.get(`/listings/${listingId}/calendar`, {
        params: {
          startDate: start,
          endDate: end,
          accountId: this.config.accountId
        }
      });

      if (!response.data?.result) {
        throw new Error('Invalid availability response from Hostaway');
      }

      return response.data.result.map((day: any) => ({
        date: day.date,
        available: Boolean(day.isAvailable),
        price: day.price ? parseFloat(day.price) : undefined,
        minStay: day.minStay ? parseInt(day.minStay) : undefined,
        currency: day.currency || 'USD'
      }));
    } catch (error) {
      console.error('Error fetching Hostaway availability:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Hostaway credentials - please reconnect your integration');
        }
        if (error.response?.status === 404) {
          throw new Error(`Property ${listingId} not found in Hostaway`);
        }
        throw new Error(`Hostaway API error: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to fetch availability from Hostaway');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/me', {
        params: { accountId: this.config.accountId }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Hostaway connection test failed:', error);
      return false;
    }
  }

  private formatAddress(listing: any): string {
    const parts = [
      listing.address,
      listing.city,
      listing.state,
      listing.country
    ].filter(Boolean);
    
    return parts.join(', ') || 'Address not available';
  }
}