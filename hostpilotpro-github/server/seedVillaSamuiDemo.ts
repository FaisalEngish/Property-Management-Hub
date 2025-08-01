import { db } from "./db";
import { 
  properties, 
  bookings, 
  tasks, 
  users,
  financialTransactions,
  guestFeedback,
  guestCheckIns,
  guestCheckOuts,
  addonServiceBookings,
  addonServices,
  welcomePackUsage,
  welcomePackItems,
  ownerPayouts,
  invoices,
  invoiceLineItems,
  commissionEarnings,
  notifications,
  agentPayouts,
  utilityBills
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedVillaSamuiDemo() {
  console.log("Seeding Villa Samui Breeze demo data...");
  
  try {
    const organizationId = "default-org";
    
    // 1. Create Villa Samui Breeze Property
    const [property] = await db.insert(properties).values({
      organizationId,
      name: "Villa Samui Breeze",
      address: "123 Beach Road, Koh Samui, Thailand",
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      pricePerNight: "8000.00",
      currency: "THB",
      isActive: true,
      amenities: JSON.stringify(["Pool", "Garden", "WiFi", "Air Conditioning", "Kitchen"]),
      description: "Luxurious 3-bedroom villa with private pool and garden on Koh Samui",
      status: "active",
      ownerId: "demo-owner"
    }).returning();

    console.log("Created property:", property.name);

    // 2. Create Portfolio Manager Adam
    const [portfolioManager] = await db.insert(users).values({
      id: "demo-pm-adam",
      organizationId,
      email: "adam@villacrew.com",
      firstName: "Adam",
      lastName: "Johnson", 
      role: "portfolio-manager",
      profileImageUrl: null
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        firstName: "Adam",
        lastName: "Johnson",
        role: "portfolio-manager"
      }
    }).returning();

    // 3. Create Staff Members Nye and Thura
    await db.insert(users).values([
      {
        id: "demo-staff-nye",
        organizationId,
        email: "nye@villacrew.com",
        firstName: "Nye",
        lastName: "Thanakit",
        role: "staff"
      },
      {
        id: "demo-staff-thura",
        organizationId,
        email: "thura@villacrew.com", 
        firstName: "Thura",
        lastName: "Myanmar",
        role: "staff"
      }
    ]).onConflictDoNothing();

    // 4. Create the Main Booking
    const [booking] = await db.insert(bookings).values({
      organizationId,
      propertyId: property.id,
      guestName: "John Doe",
      guestEmail: "john.doe@email.com",
      guestPhone: "+1-555-0123",
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      totalAmount: "32000.00",
      currency: "THB",
      status: "confirmed",
      source: "Airbnb",
      specialRequests: "Early check-in if possible",
      adults: 2,
      children: 0,
      platformCommission: "4800.00", // 15% Airbnb commission
      cleaningFee: "0.00",
      securityDeposit: "5000.00"
    }).returning();

    console.log("Created booking for John Doe");

    // 5. Create Check-in Record
    const [checkInRecord] = await db.insert(guestCheckIns).values({
      organizationId,
      bookingId: booking.id,
      propertyId: property.id,
      guestName: "John Doe",
      guestPhoneNumber: "+1-555-0123",
      guestPassportNumber: "US123456789",
      assignedToStaff: "demo-staff-nye",
      completedByStaff: "demo-staff-nye",
      passportPhotoUrl: "/demo/passport-john-doe.jpg",
      depositAmount: 5000.00,
      depositCurrency: "THB",
      depositType: "cash",
      electricMeterReading: 1000,
      electricMeterPhoto: "/demo/meter-checkin-1000.jpg",
      checkInDate: new Date("2025-07-01T15:00:00Z"),
      status: "completed",
      notes: "Guest arrived early at 3 PM, very friendly. Deposit collected in cash.",
      completedAt: new Date("2025-07-01T15:00:00Z")
    }).returning();

    // 6. Create Check-out Record
    await db.insert(guestCheckOuts).values({
      organizationId,
      bookingId: booking.id,
      propertyId: property.id,
      checkInId: checkInRecord.id,
      assignedToStaff: "demo-staff-thura",
      completedByStaff: "demo-staff-thura",
      electricMeterReading: 1100,
      electricMeterPhoto: "/demo/meter-checkout-1100.jpg",
      electricityUsageKwh: 100,
      electricityRatePerKwh: 7.0,
      electricityChargeAmount: 700.00,
      damageFound: false,
      cleaningStatus: "excellent",
      depositRefundAmount: 750.00,
      depositRefundMethod: "cash",
      checkOutDate: new Date("2025-07-05T11:00:00Z"),
      status: "completed",
      notes: "Property left in excellent condition, no damage found. Guest mentioned AC in master bedroom was weak.",
      completedAt: new Date("2025-07-05T11:00:00Z")
    });

    // 6. Create Add-on Services
    const addonServiceData = [
      { name: "Airport Pickup", category: "transportation", basePrice: 700.00, currency: "THB", description: "One-way airport transfer" },
      { name: "Private Chef Dinner", category: "dining", basePrice: 2000.00, currency: "THB", description: "Professional chef for dinner service" },
      { name: "Mid-stay Cleaning", category: "cleaning", basePrice: 850.00, currency: "THB", description: "Deep cleaning service during stay" }
    ];

    for (const service of addonServiceData) {
      await db.insert(addonServices).values({
        organizationId,
        ...service,
        isActive: true
      }).onConflictDoNothing();
    }

    // Get created services for bookings
    const services = await db.select().from(addonServices).where(eq(addonServices.organizationId, organizationId));
    const airportService = services.find(s => s.name === "Airport Pickup");
    const chefService = services.find(s => s.name === "Private Chef Dinner");
    const cleaningService = services.find(s => s.name === "Mid-stay Cleaning");

    // 7. Create Add-on Service Bookings
    const serviceBookings = [
      {
        organizationId,
        propertyId: property.id,
        serviceId: airportService!.id,
        guestName: "John Doe",
        guestEmail: "john.doe@email.com",
        serviceDate: "2025-07-01",
        totalAmount: 700.00,
        currency: "THB",
        status: "completed",
        paymentStatus: "paid_by_guest",
        bookingReference: booking.id.toString(),
        specialRequests: "Flight arrives at 2 PM"
      },
      {
        organizationId,
        propertyId: property.id,
        serviceId: chefService!.id,
        guestName: "John Doe", 
        guestEmail: "john.doe@email.com",
        serviceDate: "2025-07-03",
        totalAmount: 2000.00,
        currency: "THB",
        status: "completed",
        paymentStatus: "paid_by_guest",
        bookingReference: booking.id.toString(),
        specialRequests: "Thai cuisine preferred, no shellfish"
      },
      {
        organizationId,
        propertyId: property.id,
        serviceId: cleaningService!.id,
        guestName: "John Doe",
        guestEmail: "john.doe@email.com", 
        serviceDate: "2025-07-03",
        totalAmount: 850.00,
        currency: "THB",
        status: "completed",
        paymentStatus: "paid_by_guest",
        bookingReference: booking.id.toString(),
        specialRequests: "Mid-stay deep clean"
      }
    ];

    for (const serviceBooking of serviceBookings) {
      await db.insert(addonServiceBookings).values(serviceBooking);
    }

    // 8. Create Welcome Pack Usage
    await db.insert(welcomePackItems).values([
      { organizationId, name: "Welcome Fruit Basket", category: "food", unitCost: 250.00, currency: "THB", stockQuantity: 50 },
      { organizationId, name: "Local Coffee & Tea Set", category: "beverage", unitCost: 180.00, currency: "THB", stockQuantity: 30 },
      { organizationId, name: "Beach Towels (2pc)", category: "amenity", unitCost: 120.00, currency: "THB", stockQuantity: 25 },
      { organizationId, name: "Welcome Information Booklet", category: "information", unitCost: 50.00, currency: "THB", stockQuantity: 100 }
    ]).onConflictDoNothing();

    const welcomeItems = await db.select().from(welcomePackItems).where(eq(welcomePackItems.organizationId, organizationId));
    
    for (const item of welcomeItems) {
      await db.insert(welcomePackUsage).values({
        organizationId,
        propertyId: property.id,
        itemId: item.id,
        bookingId: booking.id,
        quantityUsed: 1,
        totalCost: item.unitCost,
        currency: "THB",
        usageDate: "2025-07-01",
        usedBy: "demo-staff-nye",
        notes: "Standard Pack A - delivered upon check-in"
      });
    }

    // 9. Create Financial Transactions
    const financialTransactions = [
      // Rental Income
      {
        organizationId,
        type: "income",
        category: "rental_income", 
        amount: "32000.00",
        currency: "THB",
        source: "Guest Payment",
        date: "2025-07-01",
        description: "4-night stay rental income",
        propertyId: property.id,
        processedBy: "demo-staff-nye",
        referenceNumber: `RENT-${booking.id}`,
        status: "completed"
      },
      // Platform Commission (Airbnb)
      {
        organizationId,
        type: "expense",
        category: "platform_commission",
        amount: "4800.00", 
        currency: "THB",
        source: "Company Expense",
        date: "2025-07-01",
        description: "Airbnb commission (15%)",
        propertyId: property.id,
        processedBy: "demo-staff-nye",
        referenceNumber: `COMM-${booking.id}`,
        status: "completed"
      },
      // Electricity Bill
      {
        organizationId,
        type: "expense",
        category: "utilities",
        amount: "700.00",
        currency: "THB", 
        source: "Guest Payment",
        date: "2025-07-05",
        description: "Electricity usage: 100 kWh x 7 THB",
        propertyId: property.id,
        processedBy: "demo-staff-thura",
        referenceNumber: `ELEC-${booking.id}`,
        status: "completed"
      },
      // Service Fees
      {
        organizationId,
        type: "income",
        category: "service_fees",
        amount: "3550.00", // 700 + 2000 + 850
        currency: "THB",
        source: "Guest Payment", 
        date: "2025-07-03",
        description: "Add-on services (Airport + Chef + Cleaning)",
        propertyId: property.id,
        processedBy: "demo-staff-nye",
        referenceNumber: `SERV-${booking.id}`,
        status: "completed"
      }
    ];

    for (const transaction of financialTransactions) {
      await db.insert(financeTransactions).values(transaction);
    }

    // 10. Create Tasks for the Stay
    const taskData = [
      {
        organizationId,
        title: "Pre-arrival Cleaning",
        description: "Deep clean villa before John Doe check-in",
        type: "cleaning",
        department: "🧹 Cleaning",
        status: "completed",
        priority: "high",
        propertyId: property.id,
        assignedTo: "demo-staff-nye",
        dueDate: "2025-06-30",
        completedAt: new Date("2025-06-30T16:00:00Z"),
        evidencePhotos: JSON.stringify(["/demo/cleaning-completed-1.jpg", "/demo/cleaning-completed-2.jpg"]),
        completionNotes: "Villa thoroughly cleaned and prepared for guest arrival"
      },
      {
        organizationId,
        title: "Pool Service - Day 1",
        description: "Regular pool maintenance and chemical balance check", 
        type: "maintenance",
        department: "🏊 Pool",
        status: "completed", 
        priority: "medium",
        propertyId: property.id,
        assignedTo: "demo-staff-thura",
        dueDate: "2025-07-02",
        completedAt: new Date("2025-07-02T09:00:00Z"),
        evidencePhotos: JSON.stringify(["/demo/pool-service-1.jpg"]),
        completionNotes: "Pool cleaned, chemicals balanced, equipment checked"
      },
      {
        organizationId,
        title: "Pool Service - Day 3", 
        description: "Mid-stay pool maintenance",
        type: "maintenance",
        department: "🏊 Pool", 
        status: "completed",
        priority: "medium",
        propertyId: property.id,
        assignedTo: "demo-staff-thura", 
        dueDate: "2025-07-04",
        completedAt: new Date("2025-07-04T09:00:00Z"),
        evidencePhotos: JSON.stringify(["/demo/pool-service-2.jpg"]),
        completionNotes: "Pool maintenance completed, all equipment functioning"
      },
      {
        organizationId,
        title: "AC Maintenance Check - Master Bedroom",
        description: "Check and repair weak AC unit in master bedroom",
        type: "maintenance", 
        department: "🔧 Maintenance",
        status: "pending",
        priority: "high",
        propertyId: property.id,
        assignedTo: "demo-staff-nye",
        dueDate: "2025-07-06",
        issuesFound: JSON.stringify(["Guest reported weak cooling in master bedroom"]),
        completionNotes: "AI-triggered maintenance alert from guest feedback"
      },
      {
        organizationId,
        title: "Post-checkout Cleaning",
        description: "Deep clean villa after John Doe checkout",
        type: "cleaning",
        department: "🧹 Cleaning", 
        status: "completed",
        priority: "high",
        propertyId: property.id,
        assignedTo: "demo-staff-thura",
        dueDate: "2025-07-05", 
        completedAt: new Date("2025-07-05T14:00:00Z"),
        evidencePhotos: JSON.stringify(["/demo/checkout-cleaning-1.jpg", "/demo/checkout-cleaning-2.jpg"]),
        completionNotes: "Villa cleaned and prepared for next guest"
      }
    ];

    for (const task of taskData) {
      await db.insert(tasks).values(task);
    }

    // 11. Create Guest Feedback with AC Complaint
    await db.insert(guestFeedback).values({
      organizationId,
      propertyId: property.id,
      bookingId: booking.id,
      guestName: "John Doe",
      guestEmail: "john.doe@email.com",
      feedbackType: "complaint",
      category: "maintenance",
      message: "The air conditioning in the master bedroom seems to be quite weak. It's not cooling properly even when set to the lowest temperature.",
      rating: 3,
      submittedAt: new Date("2025-07-02T22:00:00Z"),
      status: "addressed",
      priority: "high",
      responseBy: "demo-pm-adam",
      responseMessage: "Thank you for reporting this. We have scheduled maintenance to check the AC unit immediately.",
      responseAt: new Date("2025-07-03T08:00:00Z"),
      processed: true,
      requiresAction: true
    });

    // 12. Create Owner Payout Request
    await db.insert(ownerPayouts).values({
      organizationId,
      userId: "demo-owner",
      amount: 22400.00, // 70% of 32,000 THB
      currency: "THB",
      status: "approved",
      requestedAt: new Date("2025-07-05T16:00:00Z"),
      processedAt: new Date("2025-07-05T18:00:00Z"),
      processedBy: "demo-pm-adam",
      paymentMethod: "bank_transfer",
      description: "Owner share for Villa Samui Breeze - John Doe stay (70%)",
      referenceNumber: `PAYOUT-${booking.id}`,
      receiptUrl: "/demo/owner-payout-receipt.pdf"
    });

    // 13. Create Commission Earnings for Portfolio Manager Adam
    await db.insert(commissionEarnings).values({
      organizationId,
      userId: "demo-pm-adam",
      propertyId: property.id,
      bookingId: booking.id,
      commissionType: "portfolio_management",
      amount: 4800.00, // 50% of company share (30% of 32,000)
      currency: "THB",
      commissionRate: 0.50,
      baseAmount: 9600.00, // Company's 30% share
      description: "Portfolio management commission - Villa Samui Breeze",
      earnedAt: new Date("2025-07-05T12:00:00Z"),
      status: "earned",
      payoutStatus: "pending"
    });

    // 14. Create Agent Payout for Adam
    await db.insert(agentPayouts).values({
      organizationId,
      userId: "demo-pm-adam",
      amount: 4800.00,
      currency: "THB",
      status: "pending",
      requestedAt: new Date("2025-07-05T17:00:00Z"),
      description: "Commission payout for Villa Samui Breeze management",
      paymentMethod: "bank_transfer",
      referenceNumber: `AGENT-${Date.now()}`
    });

    // 15. Create Sample Invoice
    const [invoice] = await db.insert(invoices).values({
      organizationId,
      invoiceNumber: `INV-${Date.now()}`,
      fromPartyType: "company",
      fromPartyId: "company",
      toPartyType: "owner", 
      toPartyId: "demo-owner",
      totalAmount: 22400.00,
      currency: "THB",
      status: "sent",
      dueDate: "2025-07-15",
      issuedAt: new Date("2025-07-05T20:00:00Z"),
      description: "Owner earnings statement for Villa Samui Breeze",
      taxAmount: 0.00,
      taxRate: 0.00
    }).returning();

    // Add invoice line items
    await db.insert(invoiceLineItems).values([
      {
        organizationId,
        invoiceId: invoice.id,
        description: "Rental Income (4 nights)",
        quantity: 1,
        unitPrice: 32000.00,
        totalPrice: 32000.00,
        currency: "THB"
      },
      {
        organizationId,
        invoiceId: invoice.id,
        description: "Platform Commission (Airbnb 15%)",
        quantity: 1,
        unitPrice: -4800.00,
        totalPrice: -4800.00,
        currency: "THB"
      },
      {
        organizationId,
        invoiceId: invoice.id,
        description: "Management Fee (30%)",
        quantity: 1,
        unitPrice: -4800.00,
        totalPrice: -4800.00,
        currency: "THB"
      }
    ]);

    // 16. Create Notifications
    const notificationData = [
      {
        organizationId,
        type: "maintenance_alert",
        title: "AC Maintenance Required",
        message: "Guest reported weak AC in master bedroom at Villa Samui Breeze",
        userId: "demo-pm-adam",
        priority: "high",
        relatedEntityType: "property",
        relatedEntityId: property.id.toString(),
        isRead: false
      },
      {
        organizationId,
        type: "payout_request",
        title: "Owner Payout Processed",
        message: "Payout of 22,400 THB processed for Villa Samui Breeze owner",
        userId: "demo-owner",
        priority: "medium",
        relatedEntityType: "payout",
        relatedEntityId: "1",
        isRead: false
      },
      {
        organizationId,
        type: "task_assignment", 
        title: "AC Maintenance Task Assigned",
        message: "You have been assigned to check AC unit in Villa Samui Breeze master bedroom",
        userId: "demo-staff-nye",
        priority: "high", 
        relatedEntityType: "task",
        relatedEntityId: "1",
        isRead: false
      }
    ];

    for (const notification of notificationData) {
      await db.insert(notifications).values(notification);
    }

    // 17. Create Utility Bill
    await db.insert(utilityBills).values({
      organizationId,
      propertyId: property.id,
      utilityType: "electricity",
      provider: "PEA (Provincial Electricity Authority)",
      accountNumber: "1234567890",
      amount: 700.00,
      currency: "THB",
      billingPeriodStart: "2025-07-01",
      billingPeriodEnd: "2025-07-05",
      dueDate: "2025-07-15",
      status: "paid",
      paidAt: new Date("2025-07-05T12:00:00Z"),
      paidBy: "demo-staff-thura",
      usage: "100 kWh",
      rate: "7.00 THB/kWh",
      notes: "Guest usage during stay - charged to guest",
      routingDecision: "guest_charge",
      receiptUrl: "/demo/electric-bill-receipt.pdf"
    });

    console.log("✅ Villa Samui Breeze demo data seeded successfully!");
    console.log("Demo includes:");
    console.log("- Property: Villa Samui Breeze (3BR with pool & garden)");
    console.log("- Booking: John Doe, July 1-5, 2025 (4 nights, 32,000 THB)");
    console.log("- Check-in/out: Complete workflow with meter readings");
    console.log("- Add-on services: Airport pickup, chef, cleaning");
    console.log("- Financial transactions: All income/expense tracking");
    console.log("- Tasks: Cleaning, pool service, AI-triggered maintenance");
    console.log("- Guest feedback: AC complaint triggering maintenance alert");
    console.log("- Owner payout: 22,400 THB (70% share)");
    console.log("- PM commission: 4,800 THB for Adam");
    console.log("- Invoice & notifications: Complete financial flow");

  } catch (error) {
    console.error("Error seeding Villa Samui demo data:", error);
    throw error;
  }
}