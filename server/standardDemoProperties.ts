import { db } from "./db";
import { properties } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Standard 4 DEMO properties that should be consistent across the entire system
 * These represent the management company's property portfolio that agents can book
 */
export const STANDARD_DEMO_PROPERTIES = [
  {
    organizationId: 'default-org',
    externalId: 'DEMO-VILLA-001',
    name: 'Villa Samui Breeze',
    address: '123 Beach Road, Koh Samui, Thailand',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    pricePerNight: 8000,
    currency: 'THB',
    status: 'active' as const,
    ownerId: 'demo-owner',
    description: 'Luxurious 3-bedroom villa with private pool and garden on Koh Samui. Perfect for families seeking authentic Thai hospitality.',
    amenities: ['Private Pool', 'Garden', 'WiFi', 'Air Conditioning', 'Kitchen', 'Beach Access'],
  },
  {
    organizationId: 'default-org',
    externalId: 'DEMO-VILLA-002',
    name: 'Villa Ocean View',
    address: '456 Hillside Drive, Koh Samui, Thailand',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 6500,
    currency: 'THB',
    status: 'active' as const,
    ownerId: 'demo-owner',
    description: 'Cozy 2-bedroom villa with stunning ocean views. Perfect for couples and small families.',
    amenities: ['Ocean View', 'WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
  },
  {
    organizationId: 'default-org', 
    externalId: 'DEMO-VILLA-003',
    name: 'Villa Aruna (Demo)',
    address: 'Bophut Hills, Koh Samui, Thailand',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    pricePerNight: 20000,
    currency: 'THB',
    status: 'active' as const,
    ownerId: 'demo-owner',
    description: 'Stunning 3-bedroom villa with private pool and ocean views in exclusive Bophut Hills location. Perfect for families and groups seeking luxury accommodation in Koh Samui.',
    amenities: ['Private Pool', 'Ocean View', 'Air Conditioning', 'WiFi', 'Kitchen', 'Parking', 'Garden'],
  },
  {
    organizationId: 'default-org',
    externalId: 'DEMO-VILLA-004', 
    name: 'Villa Tropical Paradise',
    address: '789 Coconut Grove, Koh Samui, Thailand',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    pricePerNight: 12000,
    currency: 'THB',
    status: 'active' as const,
    ownerId: 'demo-owner',
    description: 'Spacious 4-bedroom villa surrounded by tropical gardens with infinity pool. Ideal for larger families and groups.',
    amenities: ['Infinity Pool', 'Tropical Garden', 'WiFi', 'Air Conditioning', 'Full Kitchen', 'BBQ Area', 'Parking'],
  }
];

/**
 * Ensures the 4 standard DEMO properties exist in the database
 * This should be called by all seeding functions to maintain consistency
 */
export async function ensureStandardDemoProperties() {
  console.log("Ensuring 4 standard DEMO properties exist...");
  
  for (const propData of STANDARD_DEMO_PROPERTIES) {
    const existing = await db.select().from(properties).where(eq(properties.externalId, propData.externalId)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(properties).values(propData);
      console.log(`✓ Created: ${propData.name}`);
    } else {
      await db.update(properties)
        .set({
          name: propData.name,
          address: propData.address,
          bedrooms: propData.bedrooms,
          bathrooms: propData.bathrooms,
          maxGuests: propData.maxGuests,
          pricePerNight: propData.pricePerNight,
          currency: propData.currency,
          status: propData.status,
          description: propData.description,
          amenities: propData.amenities
        })
        .where(eq(properties.externalId, propData.externalId));
      console.log(`✓ Updated: ${propData.name}`);
    }
  }
  
  console.log("Standard DEMO properties are ready!");
}

/**
 * Gets the standardized DEMO property IDs for use in other seeding functions
 */
export async function getStandardDemoPropertyIds(): Promise<number[]> {
  const props = await db.select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, 'demo-owner'));
  
  return props.map(p => p.id);
}