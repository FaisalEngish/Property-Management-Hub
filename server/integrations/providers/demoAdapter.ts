import type { PMSClient } from "../types";

export class DemoAdapter implements PMSClient {
  async listListings() {
    return {
      items: [
        { id: 1001, name: "Demo Villa A", bedrooms: 3, bathrooms: 2, pricePerNight: 180, currency: "THB" },
        { id: 1002, name: "Demo Villa B", bedrooms: 4, bathrooms: 3, pricePerNight: 240, currency: "THB" },
      ],
      total: 2,
    };
  }
  
  async getAvailability({ listingId, start, end }: any) {
    return {
      listingId, start, end,
      days: [
        { date: start, available: true },
        { date: end,   available: false },
      ]
    };
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}