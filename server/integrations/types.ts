export interface PMSClient {
  listListings(params?: { limit?: number; offset?: number }): Promise<any>;
  getAvailability(params: { listingId: string | number; start: string; end: string }): Promise<any>;
  // Extend later: getReservations, createBooking, pricing/quote, etc.
}

export type PMSProviderName = "demo" | "hostaway" | "lodgify";

export interface PMSListing {
  id: string | number;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyType: string;
  status: string;
  images?: string[];
  description?: string;
}

export interface PMSAvailability {
  date: string;
  available: boolean;
  price?: number;
  minStay?: number;
  currency?: string;
}

export interface PMSReservation {
  id: string | number;
  listingId: string | number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  guestCount: number;
}

export interface PMSCredentials {
  [key: string]: any;
}

export interface PMSConnection {
  provider: PMSProviderName;
  credentials: PMSCredentials;
  isActive: boolean;
  lastSync?: Date;
}