import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  guestServiceRequests,
  guestConfirmedServices,
  bookingLinkedTasks,
  tasks,
  bookings,
  properties,
  users
} from "@shared/schema";

export async function seedCrossSyncedTaskData() {
  console.log("🔄 Seeding cross-synced task visibility demo data...");

  const organizationId = "demo-org";

  try {
    // Get existing properties and bookings for demo
    const [villaAruna] = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.organizationId, organizationId),
        eq(properties.name, "Villa Aruna")
      ))
      .limit(1);

    if (!villaAruna) {
      console.log("❌ Villa Aruna not found, skipping cross-sync seeding");
      return;
    }

    // Get or create demo bookings
    let demo1234Booking = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        eq(bookings.guestName, "John Doe")
      ))
      .limit(1);

    if (demo1234Booking.length === 0) {
      // Create Demo1234 booking
      [demo1234Booking[0]] = await db
        .insert(bookings)
        .values({
          organizationId,
          propertyId: villaAruna.id,
          guestName: "John Doe",
          guestEmail: "john.doe@example.com",
          guestPhone: "+1-555-0123",
          checkinDate: new Date("2024-07-06"),
          checkoutDate: new Date("2024-07-10"),
          totalAmount: 25000,
          status: "confirmed",
          numGuests: 2,
          reservationCode: "Demo1234"
        })
        .returning();
    }

    let demo1235Booking = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        eq(bookings.guestName, "Maria Smith")
      ))
      .limit(1);

    if (demo1235Booking.length === 0) {
      // Create Demo1235 booking
      [demo1235Booking[0]] = await db
        .insert(bookings)
        .values({
          organizationId,
          propertyId: villaAruna.id,
          guestName: "Maria Smith",
          guestEmail: "maria.smith@example.com",
          guestPhone: "+1-555-0456",
          checkinDate: new Date("2024-07-08"),
          checkoutDate: new Date("2024-07-12"),
          totalAmount: 32000,
          status: "confirmed",
          numGuests: 4,
          reservationCode: "Demo1235"
        })
        .returning();
    }

    // Create demo tasks for Demo1234
    const demo1234Tasks = [
      {
        organizationId,
        title: "Pre-arrival Cleaning",
        description: "Complete deep cleaning before guest arrival",
        type: "cleaning",
        department: "housekeeping",
        status: "completed",
        priority: "high",
        propertyId: villaAruna.id,
        dueDate: new Date("2024-07-05T14:00:00"),
        estimatedCost: 2500
      },
      {
        organizationId,
        title: "Pool Service & Chemical Balance",
        description: "Check and balance pool chemicals, clean pool area",
        type: "maintenance",
        department: "pool",
        status: "completed",
        priority: "medium",
        propertyId: villaAruna.id,
        dueDate: new Date("2024-07-07T15:00:00"),
        estimatedCost: 1500
      },
      {
        organizationId,
        title: "Garden Maintenance",
        description: "Trim hedges, water plants, general garden upkeep",
        type: "maintenance",
        department: "garden",
        status: "in_progress",
        priority: "medium",
        propertyId: villaAruna.id,
        dueDate: new Date("2024-07-08T14:00:00"),
        estimatedCost: 1800
      },
      {
        organizationId,
        title: "Checkout Cleaning",
        description: "Complete checkout cleaning and inspection",
        type: "cleaning",
        department: "housekeeping",
        status: "pending",
        priority: "high",
        propertyId: villaAruna.id,
        dueDate: new Date("2024-07-10T16:00:00"),
        estimatedCost: 3000
      }
    ];

    // Insert tasks and get IDs
    const createdTasks = await db
      .insert(tasks)
      .values(demo1234Tasks)
      .returning();

    // Create guest service requests for Demo1234
    const demo1234ServiceRequests = [
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        requestType: "spa",
        serviceName: "In-Villa Thai Massage",
        description: "Traditional Thai massage for 2 people, 90 minutes each",
        status: "approved",
        requestedDate: new Date("2024-07-07"),
        requestedTime: "18:00",
        estimatedCost: 4800,
        finalCost: 4800,
        assignedDepartment: "spa",
        approvedBy: "demo-admin",
        approvedAt: new Date("2024-07-06T10:30:00"),
        isVisible: true,
        requestedBy: "guest-demo1234"
      },
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        requestType: "housekeeping",
        serviceName: "Extra Pool Towels",
        description: "Request for 4 additional pool towels",
        status: "completed",
        requestedDate: new Date("2024-07-07"),
        requestedTime: "12:00",
        estimatedCost: 0,
        finalCost: 0,
        assignedDepartment: "housekeeping",
        approvedBy: "demo-admin",
        approvedAt: new Date("2024-07-07T09:15:00"),
        completedAt: new Date("2024-07-07T11:45:00"),
        isVisible: true,
        requestedBy: "guest-demo1234"
      },
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        requestType: "transport",
        serviceName: "Airport Transfer",
        description: "Private car transfer to Samui Airport for 2 passengers",
        status: "requested",
        requestedDate: new Date("2024-07-10"),
        requestedTime: "14:00",
        estimatedCost: 1500,
        assignedDepartment: "concierge",
        isVisible: true,
        requestedBy: "guest-demo1234"
      }
    ];

    const createdServiceRequests = await db
      .insert(guestServiceRequests)
      .values(demo1234ServiceRequests)
      .returning();

    // Create confirmed services for Demo1234
    const demo1234ConfirmedServices = [
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        serviceType: "welcome",
        serviceName: "Welcome Fruit Basket",
        serviceDescription: "Fresh tropical fruits arranged in traditional Thai basket",
        scheduledDate: new Date("2024-07-06"),
        scheduledTime: "16:00",
        serviceCost: 800,
        isActive: true,
        isCompleted: true,
        confirmedBy: "demo-admin"
      },
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        serviceType: "dining",
        serviceName: "Private Chef Dinner",
        serviceDescription: "3-course Thai dinner prepared by private chef",
        scheduledDate: new Date("2024-07-08"),
        scheduledTime: "19:00",
        serviceCost: 6500,
        isActive: true,
        isCompleted: false,
        confirmedBy: "demo-admin"
      },
      {
        organizationId,
        bookingId: demo1234Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1234",
        serviceType: "wellness",
        serviceName: "Morning Yoga Session",
        serviceDescription: "Private yoga instructor for sunrise session",
        scheduledDate: new Date("2024-07-09"),
        scheduledTime: "06:30",
        serviceCost: 2500,
        isActive: true,
        isCompleted: false,
        confirmedBy: "demo-admin"
      }
    ];

    const createdConfirmedServices = await db
      .insert(guestConfirmedServices)
      .values(demo1234ConfirmedServices)
      .returning();

    // Create booking linked tasks for Demo1234
    const demo1234LinkedTasks = [
      {
        organizationId,
        taskId: createdTasks[0].id, // Pre-arrival cleaning
        bookingId: demo1234Booking[0].id,
        reservationId: "Demo1234",
        taskCategory: "pre_arrival",
        isGuestVisible: false,
        guestDescription: null,
        serviceRequestId: null,
        isServiceGenerated: false
      },
      {
        organizationId,
        taskId: createdTasks[1].id, // Pool service
        bookingId: demo1234Booking[0].id,
        reservationId: "Demo1234",
        taskCategory: "during_stay",
        isGuestVisible: true,
        guestDescription: "Pool maintenance scheduled - fresh and clean for your enjoyment",
        serviceRequestId: null,
        isServiceGenerated: false
      },
      {
        organizationId,
        taskId: createdTasks[2].id, // Garden maintenance
        bookingId: demo1234Booking[0].id,
        reservationId: "Demo1234",
        taskCategory: "during_stay",
        isGuestVisible: true,
        guestDescription: "Garden beautification in progress - enhancing your villa experience",
        serviceRequestId: null,
        isServiceGenerated: false
      },
      {
        organizationId,
        taskId: createdTasks[3].id, // Checkout cleaning
        bookingId: demo1234Booking[0].id,
        reservationId: "Demo1234",
        taskCategory: "checkout",
        isGuestVisible: false,
        guestDescription: null,
        serviceRequestId: null,
        isServiceGenerated: false
      }
    ];

    await db
      .insert(bookingLinkedTasks)
      .values(demo1234LinkedTasks);

    // Create similar data for Demo1235 (simplified)
    const demo1235ServiceRequests = [
      {
        organizationId,
        bookingId: demo1235Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1235",
        requestType: "dining",
        serviceName: "BBQ Equipment Setup",
        description: "Setup BBQ grill and provide fresh ingredients for family dinner",
        status: "approved",
        requestedDate: new Date("2024-07-09"),
        requestedTime: "17:00",
        estimatedCost: 2200,
        finalCost: 2200,
        assignedDepartment: "dining",
        approvedBy: "demo-admin",
        approvedAt: new Date("2024-07-08T14:20:00"),
        isVisible: true,
        requestedBy: "guest-demo1235"
      },
      {
        organizationId,
        bookingId: demo1235Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1235",
        requestType: "recreation",
        serviceName: "Kids Activity Setup",
        description: "Setup kids play area with games and entertainment",
        status: "in_progress",
        requestedDate: new Date("2024-07-10"),
        requestedTime: "10:00",
        estimatedCost: 1800,
        assignedDepartment: "recreation",
        approvedBy: "demo-admin",
        approvedAt: new Date("2024-07-09T16:45:00"),
        isVisible: true,
        requestedBy: "guest-demo1235"
      }
    ];

    await db
      .insert(guestServiceRequests)
      .values(demo1235ServiceRequests);

    const demo1235ConfirmedServices = [
      {
        organizationId,
        bookingId: demo1235Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1235",
        serviceType: "welcome",
        serviceName: "Family Welcome Package",
        serviceDescription: "Kids snacks, adult beverages, and local welcome gifts",
        scheduledDate: new Date("2024-07-08"),
        scheduledTime: "16:00",
        serviceCost: 1500,
        isActive: true,
        isCompleted: true,
        confirmedBy: "demo-admin"
      },
      {
        organizationId,
        bookingId: demo1235Booking[0].id,
        propertyId: villaAruna.id,
        reservationId: "Demo1235",
        serviceType: "recreation",
        serviceName: "Family Pool Games",
        serviceDescription: "Pool games equipment and floating toys setup",
        scheduledDate: new Date("2024-07-10"),
        scheduledTime: "11:00",
        serviceCost: 900,
        isActive: true,
        isCompleted: false,
        confirmedBy: "demo-admin"
      }
    ];

    await db
      .insert(guestConfirmedServices)
      .values(demo1235ConfirmedServices);

    console.log("✅ Cross-synced task visibility demo data seeded successfully");
    console.log(`   - Created ${createdTasks.length} demo tasks`);
    console.log(`   - Created ${createdServiceRequests.length + demo1235ServiceRequests.length} service requests`);
    console.log(`   - Created ${createdConfirmedServices.length + demo1235ConfirmedServices.length} confirmed services`);
    console.log(`   - Created ${demo1234LinkedTasks.length} booking linked tasks`);
    console.log("   - Reservations: Demo1234 (John Doe), Demo1235 (Maria Smith)");

  } catch (error) {
    console.error("❌ Error seeding cross-synced task data:", error);
  }
}