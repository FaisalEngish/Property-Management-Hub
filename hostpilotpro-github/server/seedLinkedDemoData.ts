/**
 * Comprehensive Demo Data Seeding
 * Creates properly linked data across all dashboards
 */

import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, 
  properties, 
  tasks, 
  bookings, 
  finances,
  type InsertUser,
  type InsertProperty,
  type InsertTask,
  type InsertBooking,
  type InsertFinance
} from "@shared/schema";

const DEMO_ORG_ID = 'default-org';

export async function seedLinkedDemoData(): Promise<void> {
  console.log("🔗 Creating comprehensive linked demo data...");
  
  try {
    // Step 1: Ensure consistent properties (match what standardDemoProperties creates)
    console.log("1️⃣ Ensuring 4 standard properties...");
    
    const demoProperties: InsertProperty[] = [
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'DEMO-VILLA-001',
        name: 'Villa Samui Breeze',
        address: '123 Beach Road, Koh Samui, Thailand',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        pricePerNight: 8000,
        currency: 'THB',
        status: 'active',
        ownerId: 'owner-1',
        description: 'Luxurious 3-bedroom villa with private pool and garden.',
        amenities: ['Private Pool', 'Garden', 'WiFi', 'Air Conditioning', 'Kitchen', 'Beach Access'],
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'DEMO-VILLA-002',
        name: 'Villa Ocean View',
        address: '456 Hillside Drive, Koh Samui, Thailand',
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        pricePerNight: 6500,
        currency: 'THB',
        status: 'active',
        ownerId: 'owner-2',
        description: 'Cozy 2-bedroom villa with stunning ocean views.',
        amenities: ['Ocean View', 'WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'DEMO-VILLA-003',
        name: 'Villa Aruna (Demo)',
        address: 'Bophut Hills, Koh Samui, Thailand',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        pricePerNight: 20000,
        currency: 'THB',
        status: 'active',
        ownerId: 'owner-1',
        description: 'Stunning 3-bedroom villa with private pool and ocean views.',
        amenities: ['Private Pool', 'Ocean View', 'Air Conditioning', 'WiFi', 'Kitchen', 'Parking', 'Garden'],
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'DEMO-VILLA-004',
        name: 'Villa Tropical Paradise',
        address: '789 Coconut Grove, Koh Samui, Thailand',
        bedrooms: 4,
        bathrooms: 4,
        maxGuests: 8,
        pricePerNight: 12000,
        currency: 'THB',
        status: 'active',
        ownerId: 'owner-3',
        description: 'Spacious 4-bedroom villa surrounded by tropical gardens.',
        amenities: ['Infinity Pool', 'Tropical Garden', 'WiFi', 'Air Conditioning', 'Full Kitchen', 'BBQ Area'],
      }
    ];

    // Insert/update properties with proper conflict resolution
    for (const prop of demoProperties) {
      await db.insert(properties).values(prop).onConflictDoUpdate({
        target: properties.externalId,
        set: {
          name: prop.name,
          address: prop.address,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          maxGuests: prop.maxGuests,
          pricePerNight: prop.pricePerNight,
          status: prop.status,
          ownerId: prop.ownerId,
          description: prop.description,
          amenities: prop.amenities
        }
      });
    }

    // Get created properties for linking
    const createdProperties = await db.query.properties.findMany({
      where: (props, { eq }) => eq(props.organizationId, DEMO_ORG_ID)
    });

    console.log(`✅ Properties: ${createdProperties.length} available`);

    // Step 2: Create linked bookings (past, current, future)
    console.log("2️⃣ Creating linked bookings...");
    
    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    const futureDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days future
    const julyDate = new Date('2025-07-21'); // Villa Aruna booking in July
    const julyEndDate = new Date('2025-07-26');

    const linkedBookings: InsertBooking[] = [
      // Past booking - Villa Samui Breeze (completed, should generate finance record)
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'BK-2024-001',
        propertyId: createdProperties.find(p => p.name === 'Villa Samui Breeze')?.id || createdProperties[0].id,
        guestName: 'Robert Johnson',
        guestEmail: 'robert.johnson@email.com',
        guestPhone: '+1 555 0101',
        checkInDate: pastDate,
        checkOutDate: new Date(pastDate.getTime() + (5 * 24 * 60 * 60 * 1000)),
        totalAmount: 40000, // 5 nights x 8000 THB
        status: 'completed',
        adults: 2,
        children: 1,
        source: 'Airbnb',
      },
      // Current booking - Villa Ocean View (active)
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'BK-2025-002',
        propertyId: createdProperties.find(p => p.name === 'Villa Ocean View')?.id || createdProperties[1].id,
        guestName: 'Emily Davis',
        guestEmail: 'emily.davis@email.com',
        guestPhone: '+44 20 1234 5678',
        checkInDate: new Date(currentDate.getTime() - (2 * 24 * 60 * 60 * 1000)),
        checkOutDate: new Date(currentDate.getTime() + (3 * 24 * 60 * 60 * 1000)),
        totalAmount: 32500, // 5 nights x 6500 THB
        status: 'active',
        adults: 2,
        children: 0,
        source: 'Booking.com',
      },
      // Future booking - Villa Tropical Paradise
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'BK-2025-003',
        propertyId: createdProperties.find(p => p.name === 'Villa Tropical Paradise')?.id || createdProperties[3].id,
        guestName: 'Zhang Wei',
        guestEmail: 'zhang.wei@email.com',
        guestPhone: '+86 138 0013 8000',
        checkInDate: futureDate,
        checkOutDate: new Date(futureDate.getTime() + (7 * 24 * 60 * 60 * 1000)),
        totalAmount: 84000, // 7 nights x 12000 THB
        status: 'confirmed',
        adults: 4,
        children: 2,
        source: 'Direct',
      },
      // July booking - Villa Aruna (the one mentioned in screenshot)
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'BK-2025-004',
        propertyId: createdProperties.find(p => p.name === 'Villa Aruna (Demo)')?.id || createdProperties[2].id,
        guestName: 'John Smith',
        guestEmail: 'john.smith@email.com',
        guestPhone: '+1 555 0123',
        checkInDate: julyDate,
        checkOutDate: julyEndDate,
        totalAmount: 100000, // 5 nights x 20000 THB
        status: 'confirmed',
        adults: 2,
        children: 0,
        source: 'Airbnb',
      },
      // Additional current booking for testing
      {
        organizationId: DEMO_ORG_ID,
        externalId: 'BK-2025-005',
        propertyId: createdProperties.find(p => p.name === 'Villa Samui Breeze')?.id || createdProperties[0].id,
        guestName: 'Marie Dubois',
        guestEmail: 'marie.dubois@email.com',
        guestPhone: '+33 1 42 34 56 78',
        checkInDate: new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)),
        checkOutDate: new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000)),
        totalAmount: 56000, // 7 nights x 8000 THB
        status: 'confirmed',
        adults: 3,
        children: 1,
        source: 'VRBO',
      }
    ];

    // Clear existing bookings and insert new ones
    await db.delete(bookings).where(eq(bookings.organizationId, DEMO_ORG_ID));
    await db.insert(bookings).values(linkedBookings);
    
    console.log(`✅ Bookings: ${linkedBookings.length} created`);

    // Step 3: Create linked finance records (from completed bookings + expenses)
    console.log("3️⃣ Creating linked finance records...");
    
    const insertedBookings = await db.query.bookings.findMany({
      where: (bkgs, { eq }) => eq(bkgs.organizationId, DEMO_ORG_ID)
    });

    const linkedFinances: InsertFinance[] = [];

    // Income from completed bookings
    const completedBookings = insertedBookings.filter(b => b.status === 'completed');
    for (const booking of completedBookings) {
      linkedFinances.push({
        organizationId: DEMO_ORG_ID,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        type: 'income',
        category: 'booking_revenue',
        amount: booking.totalAmount,
        description: `Booking revenue from ${booking.guestName}`,
        date: booking.checkOutDate,
        paymentMethod: 'bank_transfer',
        receiptNumber: `REC-${booking.externalId}`,
      });
    }

    // Future income projections from confirmed bookings
    const confirmedBookings = insertedBookings.filter(b => b.status === 'confirmed');
    for (const booking of confirmedBookings) {
      linkedFinances.push({
        organizationId: DEMO_ORG_ID,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        type: 'income',
        category: 'booking_revenue_projected',
        amount: booking.totalAmount,
        description: `Projected revenue from ${booking.guestName}`,
        date: booking.checkOutDate,
        paymentMethod: 'pending',
        receiptNumber: `PROJ-${booking.externalId}`,
      });
    }

    // Property-specific expenses
    for (const property of createdProperties) {
      // Monthly electricity
      linkedFinances.push({
        organizationId: DEMO_ORG_ID,
        propertyId: property.id,
        type: 'expense',
        category: 'utilities_electricity',
        amount: Math.floor(Math.random() * 3000) + 2000, // 2000-5000 THB
        description: 'Monthly electricity bill',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15),
        paymentMethod: 'bank_transfer',
        receiptNumber: `ELEC-${property.externalId}-${currentDate.getMonth()}`,
      });

      // Water bill
      linkedFinances.push({
        organizationId: DEMO_ORG_ID,
        propertyId: property.id,
        type: 'expense',
        category: 'utilities_water',
        amount: Math.floor(Math.random() * 1000) + 500, // 500-1500 THB
        description: 'Monthly water bill',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20),
        paymentMethod: 'bank_transfer',
        receiptNumber: `WATER-${property.externalId}-${currentDate.getMonth()}`,
      });

      // Cleaning expenses
      linkedFinances.push({
        organizationId: DEMO_ORG_ID,
        propertyId: property.id,
        type: 'expense',
        category: 'cleaning',
        amount: Math.floor(Math.random() * 2000) + 1500, // 1500-3500 THB
        description: 'Professional cleaning service',
        date: new Date(currentDate.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        paymentMethod: 'cash',
        receiptNumber: `CLEAN-${property.externalId}-${Math.floor(Math.random() * 1000)}`,
      });
    }

    // Clear existing finances and insert new ones
    await db.delete(finances).where(eq(finances.organizationId, DEMO_ORG_ID));
    await db.insert(finances).values(linkedFinances);
    
    console.log(`✅ Finance records: ${linkedFinances.length} created`);

    // Step 4: Create linked tasks
    console.log("4️⃣ Creating linked tasks...");
    
    const linkedTasks: InsertTask[] = [];

    for (const property of createdProperties) {
      // Pre-arrival cleaning for upcoming bookings
      const upcomingBookings = insertedBookings.filter(b => 
        b.propertyId === property.id && 
        b.status === 'confirmed' && 
        new Date(b.checkInDate) > currentDate
      );

      for (const booking of upcomingBookings) {
        const taskDate = new Date(booking.checkInDate);
        taskDate.setDate(taskDate.getDate() - 1); // Day before check-in

        linkedTasks.push({
          organizationId: DEMO_ORG_ID,
          propertyId: property.id,
          title: `Pre-arrival cleaning for ${booking.guestName}`,
          description: `Deep cleaning and preparation for guest arrival on ${booking.checkInDate.toDateString()}`,
          type: 'cleaning',
          priority: 'high',
          status: 'pending',
          assigneeId: 'staff-1',
          dueDate: taskDate,
          department: 'housekeeping',
        });
      }

      // Regular maintenance tasks
      linkedTasks.push({
        organizationId: DEMO_ORG_ID,
        propertyId: property.id,
        title: `Monthly pool maintenance - ${property.name}`,
        description: 'Check pool equipment, chemical levels, and clean filters',
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        assigneeId: 'staff-2',
        dueDate: new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)),
        department: 'maintenance',
      });

      // Post-checkout inspection for active bookings
      const activeBookings = insertedBookings.filter(b => 
        b.propertyId === property.id && 
        b.status === 'active'
      );

      for (const booking of activeBookings) {
        linkedTasks.push({
          organizationId: DEMO_ORG_ID,
          propertyId: property.id,
          title: `Post-checkout inspection - ${booking.guestName}`,
          description: 'Inspect property condition and prepare for next guest',
          type: 'inspection',
          priority: 'high',
          status: 'pending',
          assigneeId: 'staff-3',
          dueDate: booking.checkOutDate,
          department: 'housekeeping',
        });
      }
    }

    // Clear existing tasks and insert new ones
    await db.delete(tasks).where(eq(tasks.organizationId, DEMO_ORG_ID));
    await db.insert(tasks).values(linkedTasks);
    
    console.log(`✅ Tasks: ${linkedTasks.length} created`);

    console.log("🎉 Comprehensive linked demo data created successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Properties: ${createdProperties.length}`);
    console.log(`   - Bookings: ${linkedBookings.length}`);
    console.log(`   - Finance records: ${linkedFinances.length}`);
    console.log(`   - Tasks: ${linkedTasks.length}`);

  } catch (error) {
    console.error("❌ Error creating linked demo data:", error);
    throw error;
  }
}