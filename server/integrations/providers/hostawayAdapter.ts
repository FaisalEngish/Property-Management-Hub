import type { PMSClient, PMSListing, PMSAvailability } from "../types";

// Node 18+ has global fetch; if not, `npm i node-fetch` and `import fetch from "node-fetch";`
export class HostawayAdapter implements PMSClient {
  constructor(private cfg: { apiKey?: string; accountId: string; accessToken?: string }) {}

  private headers() {
    const token = this.cfg.apiKey || this.cfg.accessToken;
    if (!token) throw new Error("HostawayAdapter missing API key or access token");
    return {
      "Authorization": `Bearer ${token}`,
      "X-Account-Id": this.cfg.accountId,
      "Content-Type": "application/json",
    };
  }

  private async get(path: string, params?: Record<string, any>) {
    const base = process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";
    const url = new URL(base + path);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url, { headers: this.headers() } as any);
    if (!res.ok) throw new Error(`Hostaway ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async listListings(params?: { limit?: number; offset?: number }): Promise<PMSListing[]> {
    const { limit = 50, offset = 0 } = params || {};
    const data = await this.get("/listings", { limit, offset });
    
    if (!data?.result) {
      throw new Error('Invalid response format from Hostaway');
    }
    
    return data.result.map((listing: any) => ({
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
  }

  async getAvailability(params: { 
    listingId: string | number; 
    start: string; 
    end: string 
  }): Promise<PMSAvailability[]> {
    const { listingId, start, end } = params;
    const data = await this.get(`/listings/${listingId}/calendar`, { 
      startDate: start, 
      endDate: end 
    });

    if (!data?.result) {
      throw new Error('Invalid availability response from Hostaway');
    }

    return data.result.map((day: any) => ({
      date: day.date,
      available: Boolean(day.isAvailable),
      price: day.price ? parseFloat(day.price) : undefined,
      minStay: day.minStay ? parseInt(day.minStay) : undefined,
      currency: day.currency || 'USD'
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.get('/me');
      return true;
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