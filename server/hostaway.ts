import { getTenantContext, ApiKeyManager } from "./multiTenant";
import { db } from "./db";
import { properties, bookings, finances, users, addonServices } from "@shared/schema";
import type { Request } from "express";
import { eq } from "drizzle-orm";

export interface HostawayProperty {
  id: number;
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  isActive: boolean;
}

export interface HostawayBooking {
  id: number;
  propertyId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  commission: number;
  platformFee: number;
}

export interface HostawayCalendar {
  propertyId: number;
  date: string;
  isAvailable: boolean;
  price: number;
  minStay: number;
}

export class HostawayAPI {
  private apiKey: string;
  private baseUrl = 'https://api.hostaway.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Mock Hostaway API responses for demo purposes
  private getMockProperties(): HostawayProperty[] {
    return [
      {
        id: 1001,
        name: "Sunset Villa Bondi",
        address: "123 Ocean View Drive, Bondi Beach, NSW 2026",
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        pricePerNight: 450,
        currency: "AUD",
        isActive: true
      },
      {
        id: 1002,
        name: "City Penthouse Melbourne",
        address: "456 Collins Street, Melbourne, VIC 3000",
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 380,
        currency: "AUD",
        isActive: true
      },
      {
        id: 1003,
        name: "Harbour View Apartment",
        address: "789 Circular Quay, Sydney, NSW 2000",
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        pricePerNight: 320,
        currency: "AUD",
        isActive: true
      },
      {
        id: 1004,
        name: "Byron Bay Beach House",
        address: "321 Beachfront Road, Byron Bay, NSW 2481",
        bedrooms: 5,
        bathrooms: 4,
        maxGuests: 10,
        pricePerNight: 520,
        currency: "AUD",
        isActive: true
      },
      {
        id: 1005,
        name: "Gold Coast High-Rise",
        address: "654 Surfers Paradise Blvd, Gold Coast, QLD 4217",
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 290,
        currency: "AUD",
        isActive: true
      }
    ];
  }

  private getMockBookings(): HostawayBooking[] {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return [
      {
        id: 2001,
        propertyId: 1001,
        guestName: "Sarah Johnson",
        guestEmail: "sarah.johnson@email.com",
        guestPhone: "+61 412 345 678",
        checkIn: "2025-01-15",
        checkOut: "2025-01-20",
        totalAmount: 2250,
        currency: "AUD",
        status: 'confirmed',
        commission: 337.50,
        platformFee: 67.50
      },
      {
        id: 2002,
        propertyId: 1002,
        guestName: "Michael Chen",
        guestEmail: "m.chen@email.com",
        guestPhone: "+61 423 456 789",
        checkIn: "2025-01-18",
        checkOut: "2025-01-25",
        totalAmount: 2660,
        currency: "AUD",
        status: 'confirmed',
        commission: 399.00,
        platformFee: 79.80
      },
      {
        id: 2003,
        propertyId: 1003,
        guestName: "Emma Wilson",
        guestEmail: "emma.w@email.com",
        guestPhone: "+61 434 567 890",
        checkIn: "2025-01-22",
        checkOut: "2025-01-26",
        totalAmount: 1280,
        currency: "AUD",
        status: 'confirmed',
        commission: 192.00,
        platformFee: 38.40
      },
      {
        id: 2004,
        propertyId: 1004,
        guestName: "David Rodriguez",
        guestEmail: "d.rodriguez@email.com",
        guestPhone: "+61 445 678 901",
        checkIn: nextMonth.toISOString().split('T')[0],
        checkOut: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 3640,
        currency: "AUD",
        status: 'confirmed',
        commission: 546.00,
        platformFee: 109.20
      },
      {
        id: 2005,
        propertyId: 1005,
        guestName: "Lisa Thompson",
        guestEmail: "lisa.t@email.com",
        guestPhone: "+61 456 789 012",
        checkIn: new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOut: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 1160,
        currency: "AUD",
        status: 'confirmed',
        commission: 174.00,
        platformFee: 34.80
      },
      {
        id: 2006,
        propertyId: 1001,
        guestName: "James Anderson",
        guestEmail: "j.anderson@email.com",
        guestPhone: "+61 467 890 123",
        checkIn: new Date(nextMonth.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOut: new Date(nextMonth.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 1350,
        currency: "AUD",
        status: 'pending',
        commission: 202.50,
        platformFee: 40.50
      }
    ];
  }

  private getMockCalendar(): HostawayCalendar[] {
    const calendar: HostawayCalendar[] = [];
    const properties = this.getMockProperties();
    const bookings = this.getMockBookings();
    
    // Generate 90 days of calendar data for each property
    for (const property of properties) {
      for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        // Check if date is booked
        const isBooked = bookings.some(booking => 
          booking.propertyId === property.id &&
          dateString >= booking.checkIn &&
          dateString <= booking.checkOut
        );
        
        calendar.push({
          propertyId: property.id,
          date: dateString,
          isAvailable: !isBooked,
          price: property.pricePerNight,
          minStay: 2
        });
      }
    }
    
    return calendar;
  }

  async getProperties(): Promise<HostawayProperty[]> {
    // In production, this would make actual API calls to Hostaway
    // For demo purposes, return mock data
    return this.getMockProperties();
  }

  async getBookings(): Promise<HostawayBooking[]> {
    return this.getMockBookings();
  }

  async getCalendar(propertyId?: number): Promise<HostawayCalendar[]> {
    const calendar = this.getMockCalendar();
    return propertyId 
      ? calendar.filter(c => c.propertyId === propertyId)
      : calendar;
  }

  async getEarnings(): Promise<{
    totalRevenue: number;
    totalCommission: number;
    totalPlatformFees: number;
    monthlyBreakdown: Array<{
      month: string;
      revenue: number;
      commission: number;
      platformFees: number;
    }>;
  }> {
    const bookings = await this.getBookings();
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCommission = confirmedBookings.reduce((sum, b) => sum + b.commission, 0);
    const totalPlatformFees = confirmedBookings.reduce((sum, b) => sum + b.platformFee, 0);
    
    // Group by month for breakdown
    const monthlyData = new Map<string, { revenue: number; commission: number; platformFees: number }>();
    
    confirmedBookings.forEach(booking => {
      const month = booking.checkIn.substring(0, 7); // YYYY-MM format
      const existing = monthlyData.get(month) || { revenue: 0, commission: 0, platformFees: 0 };
      
      monthlyData.set(month, {
        revenue: existing.revenue + booking.totalAmount,
        commission: existing.commission + booking.commission,
        platformFees: existing.platformFees + booking.platformFee
      });
    });
    
    const monthlyBreakdown = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data
    }));
    
    return {
      totalRevenue,
      totalCommission,
      totalPlatformFees,
      monthlyBreakdown
    };
  }
}

export async function getHostawayAPI(req: Request): Promise<HostawayAPI | null> {
  try {
    const { organizationId } = getTenantContext(req);
    
    // Get encrypted Hostaway API key for this organization
    const apiKeyRecord = await db.query.organizationApiKeys.findFirst({
      where: (keys, { and, eq }) => and(
        eq(keys.organizationId, organizationId),
        eq(keys.provider, 'hostaway'),
        eq(keys.keyName, 'api_key'),
        eq(keys.isActive, true)
      )
    });
    
    if (!apiKeyRecord) {
      console.log(`No Hostaway API key found for organization ${organizationId}`);
      return null;
    }
    
    const apiKey = ApiKeyManager.decrypt(apiKeyRecord.encryptedValue);
    return new HostawayAPI(apiKey);
  } catch (error) {
    console.error('Error getting Hostaway API:', error);
    return null;
  }
}

export async function syncHostawayData(req: Request, userId: string): Promise<{
  propertiesSync: number;
  bookingsSync: number;
  financesSync: number;
}> {
  const hostaway = await getHostawayAPI(req);
  if (!hostaway) {
    throw new Error('Hostaway API not configured for this organization');
  }
  
  const { organizationId } = getTenantContext(req);
  let propertiesSync = 0;
  let bookingsSync = 0;
  let financesSync = 0;
  
  try {
    // Sync properties
    const hostawayProperties = await hostaway.getProperties();
    
    for (const hProperty of hostawayProperties) {
      // Check if property already exists
      const existingProperty = await db.query.properties.findFirst({
        where: (props, { and, eq }) => and(
          eq(props.organizationId, organizationId),
          eq(props.externalId, hProperty.id.toString())
        )
      });
      
      if (!existingProperty) {
        await db.insert(properties).values({
          organizationId,
          externalId: hProperty.id.toString(),
          name: hProperty.name,
          address: hProperty.address,
          bedrooms: hProperty.bedrooms,
          bathrooms: hProperty.bathrooms,
          maxGuests: hProperty.maxGuests,
          pricePerNight: hProperty.pricePerNight,
          currency: hProperty.currency,
          status: hProperty.isActive ? 'active' : 'inactive',
          ownerId: userId, // Assign to sync user for now
        });
        propertiesSync++;
      }
    }
    
    // Sync bookings
    const hostawayBookings = await hostaway.getBookings();
    
    for (const hBooking of hostawayBookings) {
      // Find corresponding property
      const property = await db.query.properties.findFirst({
        where: (props, { and, eq }) => and(
          eq(props.organizationId, organizationId),
          eq(props.externalId, hBooking.propertyId.toString())
        )
      });
      
      if (!property) continue;
      
      // Check if booking already exists
      const existingBooking = await db.query.bookings.findFirst({
        where: (bookings, { and, eq }) => and(
          eq(bookings.organizationId, organizationId),
          eq(bookings.externalId, hBooking.id.toString())
        )
      });
      
      if (!existingBooking) {
        await db.insert(bookings).values({
          organizationId,
          externalId: hBooking.id.toString(),
          propertyId: property.id,
          guestName: hBooking.guestName,
          guestEmail: hBooking.guestEmail,
          guestPhone: hBooking.guestPhone,
          checkIn: new Date(hBooking.checkIn),
          checkOut: new Date(hBooking.checkOut),
          totalAmount: hBooking.totalAmount,
          currency: hBooking.currency,
          status: hBooking.status,
        });
        bookingsSync++;
        
        // Create finance records for confirmed bookings
        if (hBooking.status === 'confirmed') {
          // Guest payment
          await db.insert(finances).values({
            organizationId,
            propertyId: property.id,
            type: 'income',
            source: 'guest_payment',
            amount: hBooking.totalAmount,
            currency: hBooking.currency,
            description: `Booking payment from ${hBooking.guestName}`,
            referenceNumber: `HW-${hBooking.id}`,
            processedBy: userId,
            date: new Date(hBooking.checkIn),
          });
          
          // Platform commission
          await db.insert(finances).values({
            organizationId,
            propertyId: property.id,
            type: 'expense',
            source: 'company_expense',
            amount: hBooking.commission,
            currency: hBooking.currency,
            description: `Hostaway commission for booking ${hBooking.id}`,
            referenceNumber: `HW-COMM-${hBooking.id}`,
            processedBy: userId,
            date: new Date(hBooking.checkIn),
          });
          
          // Platform fee
          await db.insert(finances).values({
            organizationId,
            propertyId: property.id,
            type: 'expense',
            source: 'company_expense',
            amount: hBooking.platformFee,
            currency: hBooking.currency,
            description: `Platform fee for booking ${hBooking.id}`,
            referenceNumber: `HW-FEE-${hBooking.id}`,
            processedBy: userId,
            date: new Date(hBooking.checkIn),
          });
          
          financesSync += 3;
        }
      }
    }

    // Create sample add-on services if none exist
    const existingServices = await db.query.addonServices.findFirst({
      where: (services, { eq }) => eq(services.organizationId, organizationId)
    });

    if (!existingServices) {
      const addonServicesData = [
        {
          name: "Airport Pickup",
          organizationId,
          category: "transportation", 
          pricingModel: "fixed",
          basePrice: "85",
          description: "Comfortable airport transfer service",
          isActive: true,
          duration: 60,
          allowGuestBooking: true,
          allowManagerBooking: true,
        },
        {
          name: "In-Villa Massage",
          organizationId,
          category: "massage",
          pricingModel: "variable", 
          hourlyRate: "120",
          description: "Professional massage therapist service",
          isActive: true,
          minimumCharge: "120",
          allowGuestBooking: true,
          allowManagerBooking: true,
        },
        {
          name: "Private Chef",
          organizationId,
          category: "chef",
          pricingModel: "variable",
          hourlyRate: "85",
          description: "Personal chef for in-villa dining",
          isActive: true,
          minimumCharge: "340",
          allowGuestBooking: false,
          allowManagerBooking: true,
        },
        {
          name: "Extra Cleaning",
          organizationId,
          category: "cleaning",
          pricingModel: "fixed",
          basePrice: "75",
          description: "Additional housekeeping service",
          isActive: true,
          duration: 120,
          allowGuestBooking: true,
          allowManagerBooking: true,
        },
        {
          name: "Welcome Gift",
          organizationId,
          category: "concierge",
          pricingModel: "complimentary",
          basePrice: "0",
          description: "Complimentary welcome basket",
          isActive: true,
          allowGuestBooking: false,
          allowManagerBooking: true,
        },
      ];

      await db.insert(addonServices).values(addonServicesData);
    }
    
    return { propertiesSync, bookingsSync, financesSync };
    
  } catch (error) {
    console.error('Error syncing Hostaway data:', error);
    throw error;
  }
}