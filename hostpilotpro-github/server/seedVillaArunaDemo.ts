import { db } from "./db";
import { 
  properties, 
  users, 
  bookings, 
  tasks, 
  taskHistory, 
  guestCheckIns,
  guestCheckOuts,
  finances,
  guestLoyaltyProfiles,
  guestAddonBookings,
  utilityBills,
  propertyUtilityAccounts,
  propertyMaintenanceHistory
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedVillaArunaDemo() {
  console.log("Seeding Villa Aruna Demo data...");

  try {
    // Check if demo data already exists
    const existingProperty = await db.select().from(properties).where(
      and(
        eq(properties.organizationId, "default-org"),
        eq(properties.name, "Villa Aruna (Demo)")
      )
    );

    if (existingProperty.length > 0) {
      console.log("Villa Aruna demo data already exists, skipping seed.");
      return;
    }

    // 1. Create Demo Property
    const [villaAruna] = await db.insert(properties).values({
      organizationId: "default-org",
      name: "Villa Aruna (Demo)",
      address: "Bophut Hills, Koh Samui, Thailand",
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: 20000,
      currency: "THB",
      isActive: true,
      ownerId: "demo-owner",
      managerId: "demo-pm",
      amenities: [
        "Private Pool",
        "Ocean View", 
        "Air Conditioning",
        "WiFi",
        "Kitchen",
        "Parking",
        "Garden"
      ],
      description: "Stunning 3-bedroom villa with private pool and ocean views in exclusive Bophut Hills location. Perfect for families and groups seeking luxury accommodation in Koh Samui.",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      latitude: 9.5515,
      longitude: 100.0986,
      status: "active"
    }).returning();

    console.log("✓ Created Villa Aruna property");

    // 2. Create Utility Account for Electricity
    await db.insert(propertyUtilityAccounts).values({
      organizationId: "default-org",
      propertyId: villaAruna.id,
      utilityType: "electricity",
      provider: "PEA (Provincial Electricity Authority)",
      accountNumber: "54-123-456789-0",
      packageInfo: "Standard residential electricity - 7 THB per kWh",
      expectedBillDay: 15,
      isActive: true
    });

    console.log("✓ Created electricity utility account");

    // 3. Create Demo Users (if they don't exist)
    const demoUsers = [
      {
        id: "jacky-testuser",
        organizationId: "default-org",
        email: "jacky@test.com",
        firstName: "Jacky",
        lastName: "Testuser",
        role: "owner",
        profileImageUrl: null
      },
      {
        id: "dean-testmanager", 
        organizationId: "default-org",
        email: "dean@test.com",
        firstName: "Dean",
        lastName: "Testmanager",
        role: "portfolio-manager",
        profileImageUrl: null
      },
      {
        id: "thura-host",
        organizationId: "default-org",
        email: "thura@test.com",
        firstName: "Thura",
        lastName: "Host",
        role: "staff",
        profileImageUrl: null
      }
    ];

    for (const user of demoUsers) {
      const existingUser = await db.select().from(users).where(eq(users.id, user.id));
      if (existingUser.length === 0) {
        await db.insert(users).values(user);
        console.log(`✓ Created demo user: ${user.firstName} ${user.lastName}`);
      }
    }

    // 4. Create Guest Profile
    const [guestProfile] = await db.insert(guestLoyaltyProfiles).values({
      organizationId: "default-org",
      guestName: "John Doe",
      guestEmail: "john.doe@email.com",
      guestPhone: "+66-89-123-4567",
      totalStays: 2,
      firstStayDate: new Date('2024-01-15'),
      lastStayDate: new Date('2024-07-05'),
      loyaltyTier: "silver",
      totalSpent: 25000,
      averageStayDuration: 4,
      preferredProperties: null,
      specialPreferences: "Late check-out preferred, King Size bed",
      loyaltyPoints: 500,
      isVip: false,
      notes: "Returning guest - very polite and tidy"
    }).returning();

    console.log("✓ Created John Doe guest profile");

    // 5. Create Demo Booking
    const [demoBooking] = await db.insert(bookings).values({
      organizationId: "default-org",
      propertyId: villaAruna.id,
      guestId: guestProfile.id,
      guestName: "John Doe",
      guestEmail: "john.doe@email.com",
      guestPhone: "+66-89-123-4567",
      checkIn: new Date('2024-07-01'),
      checkOut: new Date('2024-07-05'),
      guests: 2,
      totalAmount: 80000, // 4 nights × 20,000 THB
      currency: "THB",
      status: "completed",
      platform: "direct",
      commission: 0,
      platformFee: 0,
      paymentStatus: "paid",
      notes: "Demo booking for testing check-in/check-out workflow"
    }).returning();

    console.log("✓ Created demo booking");

    // 6. Create Check-in Record
    const [checkInRecord] = await db.insert(guestCheckIns).values({
      organizationId: "default-org",
      bookingId: demoBooking.id,
      propertyId: villaAruna.id,
      assignedToStaff: "thura-host",
      completedByStaff: "thura-host",
      passportPhotos: ["/demo/john-doe-passport.jpg"],
      guestNames: ["John Doe"],
      passportNumbers: ["GB123456789"],
      depositType: "cash",
      depositAmount: 5000,
      depositCurrency: "THB",
      electricMeterReading: 1000,
      meterReadingMethod: "manual",
      electricMeterPhoto: "/demo/meter-checkin-1000.jpg",
      scheduledDate: new Date('2024-07-01T15:00:00Z'),
      completedAt: new Date('2024-07-01T15:00:00Z'),
      status: "completed",
      notes: "Guest arrived on time. Deposit collected in cash. Meter reading confirmed at 1000 kW."
    }).returning();

    console.log("✓ Created check-in record");

    // 7. Create Check-out Record with Billing
    await db.insert(guestCheckOuts).values({
      organizationId: "default-org",
      bookingId: demoBooking.id,
      propertyId: villaAruna.id,
      checkInId: checkInRecord.id,
      assignedToStaff: "thura-host",
      completedByStaff: "thura-host",
      electricMeterReading: 1100,
      meterReadingMethod: "manual",
      electricMeterPhoto: "/demo/meter-checkout-1100.jpg",
      electricityUsed: 100,
      electricityRatePerKwh: 7.0,
      totalElectricityCharge: 700,
      paymentStatus: "paid_by_guest",
      depositRefundAmount: 4300, // 5000 - 700
      depositRefundCurrency: "THB",
      depositRefundMethod: "cash",
      discountAmount: 0,
      discountReason: null,
      scheduledDate: new Date('2024-07-05T11:00:00Z'),
      completedAt: new Date('2024-07-05T11:00:00Z'),
      status: "completed",
      notes: "Guest checked out on time. Electricity usage: 100 kWh × 7 THB = 700 THB. Refunded 4,300 THB in cash."
    });

    console.log("✓ Created check-out record with billing");

    // 8. Create Utility Bill Record
    await db.insert(utilityBills).values({
      organizationId: "default-org",
      propertyId: villaAruna.id,
      utilityType: "electricity",
      providerName: "PEA",
      accountNumber: "54-123-456789-0",
      billingPeriodStart: new Date('2024-07-01'),
      billingPeriodEnd: new Date('2024-07-05'),
      amount: 700,
      currency: "THB",
      dueDate: new Date('2024-07-20'),
      paymentStatus: "paid",
      routingDecision: "owner_charge",
      notes: "Guest electricity usage during John Doe stay - charged to guest",
      usageAmount: 100,
      usageUnit: "kWh",
      ratePerUnit: 7.0,
      paidBy: "guest",
      paidAt: new Date('2024-07-05T11:00:00Z')
    });

    console.log("✓ Created utility bill record");

    // 9. Create Financial Records
    await db.insert(finances).values([
      // Rental Income
      {
        organizationId: "default-org",
        type: "income",
        category: "rental",
        amount: 80000,
        currency: "THB",
        description: "Villa Aruna rental - John Doe (4 nights)",
        propertyId: villaAruna.id,
        bookingId: demoBooking.id,
        sourceAttribution: "guest_payment",
        processedBy: "thura-host",
        referenceNumber: `RENT-${demoBooking.id}-001`,
        date: new Date('2024-07-01')
      },
      // Management Fee (9% of rental)
      {
        organizationId: "default-org",
        type: "expense",
        category: "management_fee",
        amount: 7200,
        currency: "THB",
        description: "Management fee (9% of 80,000 THB rental)",
        propertyId: villaAruna.id,
        bookingId: demoBooking.id,
        sourceAttribution: "company_expense",
        processedBy: "dean-testmanager",
        referenceNumber: `MGT-${demoBooking.id}-001`,
        date: new Date('2024-07-01')
      },
      // Service Fee
      {
        organizationId: "default-org",
        type: "expense", 
        category: "service_fee",
        amount: 1800,
        currency: "THB",
        description: "Property service fee",
        propertyId: villaAruna.id,
        bookingId: demoBooking.id,
        sourceAttribution: "company_expense",
        processedBy: "dean-testmanager",
        referenceNumber: `SVC-${demoBooking.id}-001`,
        date: new Date('2024-07-01')
      },
      // Electricity - Offset (Guest Paid)
      {
        organizationId: "default-org",
        type: "income",
        category: "utility_recovery",
        amount: 700,
        currency: "THB",
        description: "Electricity charges recovered from guest",
        propertyId: villaAruna.id,
        bookingId: demoBooking.id,
        sourceAttribution: "guest_payment",
        processedBy: "thura-host",
        referenceNumber: `UTIL-${demoBooking.id}-001`,
        date: new Date('2024-07-05')
      }
    ]);

    console.log("✓ Created financial records");

    console.log("✓ Financial records created");

    // 11. Create Tasks for Property Management
    const demoTasks = [
      {
        organizationId: "default-org",
        title: "Check-in: John Doe - Villa Aruna",
        description: "Complete guest check-in process including passport verification, deposit collection, and electric meter reading",
        propertyId: villaAruna.id,
        assignedTo: "thura-host",
        department: "housekeeping",
        type: "check-in",
        priority: "high",
        status: "completed",
        dueDate: new Date('2024-07-01T15:00:00Z'),
        completedAt: new Date('2024-07-01T15:00:00Z'),
        evidencePhotos: JSON.stringify(["/demo/meter-reading-checkin.jpg", "/demo/passport-john-doe.jpg"]),
        completionNotes: "Guest checked in successfully. Passport verified, 5,000 THB cash deposit collected, meter reading: 1000 kW"
      },
      {
        organizationId: "default-org", 
        title: "Check-out: John Doe - Villa Aruna",
        description: "Complete guest check-out process including final meter reading, electricity billing, and deposit refund",
        propertyId: villaAruna.id,
        assignedTo: "thura-host",
        department: "housekeeping",
        type: "check-out",
        priority: "high",
        status: "completed",
        dueDate: new Date('2024-07-05T11:00:00Z'),
        completedAt: new Date('2024-07-05T11:00:00Z'),
        evidencePhotos: JSON.stringify(["/demo/meter-reading-checkout.jpg"]),
        completionNotes: "Guest checked out successfully. Final meter: 1100 kW, Usage: 100 kW, Electricity: 700 THB, Refunded: 4,300 THB cash"
      },
      {
        organizationId: "default-org",
        title: "Post-Checkout Cleaning - Villa Aruna",
        description: "Deep cleaning after John Doe checkout",
        propertyId: villaAruna.id,
        assignedTo: "thura-host",
        department: "housekeeping",
        type: "cleaning",
        priority: "medium",
        status: "completed",
        dueDate: new Date('2024-07-05T14:00:00Z'),
        completedAt: new Date('2024-07-05T13:30:00Z'),
        evidencePhotos: ["/demo/cleaning-complete.jpg"],
        completionNotes: "Villa cleaned and prepared for next guests. All rooms, bathrooms, and common areas cleaned."
      },
      {
        organizationId: "default-org",
        title: "Pool Service - Villa Aruna",
        description: "Weekly pool cleaning and chemical balancing",
        propertyId: villaAruna.id,
        assignedTo: "thura-host",
        department: "maintenance",
        type: "maintenance",
        priority: "medium",
        status: "completed",
        dueDate: new Date('2024-07-03T10:00:00Z'),
        completedAt: new Date('2024-07-03T09:45:00Z'),
        evidencePhotos: ["/demo/pool-service.jpg"],
        completionNotes: "Pool cleaned, skimmed, and chemicals balanced. pH: 7.2, Chlorine: 1.5 ppm"
      },
      {
        organizationId: "default-org",
        title: "Garden Maintenance - Villa Aruna",
        description: "Landscaping and garden upkeep",
        propertyId: villaAruna.id,
        assignedTo: "thura-host",
        department: "maintenance",
        type: "maintenance",
        priority: "low",
        status: "completed",
        dueDate: new Date('2024-07-04T08:00:00Z'),
        completedAt: new Date('2024-07-04T08:30:00Z'),
        evidencePhotos: ["/demo/garden-service.jpg"],
        completionNotes: "Garden trimmed, watered, and weeded. All plants healthy and well-maintained."
      }
    ];

    for (const task of demoTasks) {
      const [createdTask] = await db.insert(tasks).values(task).returning();
      
      // Create corresponding task history entry
      await db.insert(taskHistory).values({
        organizationId: "default-org",
        taskId: createdTask.id,
        action: "completed",
        performedBy: task.assignedTo!,
        details: task.completionNotes || `Task ${task.status}`,
        timestamp: task.completedAt || new Date()
      });
    }

    console.log("✓ Created demo tasks and task history");

    // 12. Create Enhanced Maintenance Tasks
    await db.insert(maintenanceTasksEnhanced).values([
      {
        organizationId: "default-org",
        propertyId: villaAruna.id,
        taskType: "preventive",
        title: "Monthly Pool Equipment Check",
        description: "Inspect pool pump, filter, and chemical levels",
        assignedTo: "thura-host",
        priority: "medium",
        status: "completed",
        scheduledDate: new Date('2024-07-03'),
        completedDate: new Date('2024-07-03'),
        estimatedCost: 500,
        actualCost: 450,
        currency: "THB",
        completionNotes: "All equipment functioning normally. Replaced pool filter. Chemical levels optimal.",
        proofPhotos: JSON.stringify(["/demo/pool-maintenance.jpg"]),
        nextScheduledDate: new Date('2024-08-03')
      },
      {
        organizationId: "default-org",
        propertyId: villaAruna.id,
        taskType: "corrective",
        title: "Garden Sprinkler Repair",
        description: "Fix broken sprinkler head in garden area",
        assignedTo: "thura-host",
        priority: "low",
        status: "completed",
        scheduledDate: new Date('2024-07-02'),
        completedDate: new Date('2024-07-02'),
        estimatedCost: 300,
        actualCost: 250,
        currency: "THB",
        completionNotes: "Replaced faulty sprinkler head. Water pressure restored to normal.",
        proofPhotos: JSON.stringify(["/demo/sprinkler-repair.jpg"]),
        vendorUsed: "Samui Garden Services",
        warrantyPeriod: "6 months"
      }
    ]);

    console.log("✓ Created enhanced maintenance tasks");

    console.log("🎉 Villa Aruna Demo setup completed successfully!");
    console.log(`
    📊 DEMO DATA SUMMARY:
    • Property: Villa Aruna (Demo) - Bophut Hills, Koh Samui
    • Owner: Jacky Testuser
    • PM: Dean Testmanager
    • Staff: Thura Host
    • Guest: John Doe (July 1-5, 2024)
    • Electricity: 100 kWh × 7 THB = 700 THB
    • Deposit Refund: 4,300 THB
    • Owner Net Earnings: 71,000 THB
    • Tasks: 5 completed (check-in, check-out, cleaning, pool, garden)
    • Maintenance: 2 tasks completed with photos
    `);

  } catch (error) {
    console.error("Error seeding Villa Aruna demo data:", error);
    throw error;
  }
}