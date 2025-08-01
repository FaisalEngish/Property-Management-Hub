import { db } from "./db";
import { 
  addonServiceCatalog,
  addonServiceCategories,
  addonServiceBookings,
  addonServiceCommissions,
  addonServiceReports,
  addonBillingRules
} from "@shared/schema";

export async function seedAddonServicesData() {
  try {
    const existingCategories = await db.select().from(addonServiceCategories).limit(1);
    if (existingCategories.length > 0) {
      console.log("Add-on services data already exists, skipping seed.");
      return;
    }

    console.log("Seeding add-on services data...");

    // Seed service categories
    const categories = await db.insert(addonServiceCategories).values([
      {
        organizationId: "default",
        categoryName: "tours",
        categoryIcon: "🏝️",
        categoryColor: "#3B82F6",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "15.00",
        description: "Island tours, cultural experiences, and sightseeing",
        displayOrder: 1,
      },
      {
        organizationId: "default",
        categoryName: "chef",
        categoryIcon: "👨‍🍳",
        categoryColor: "#F59E0B",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "20.00",
        description: "Private chef services and catering",
        displayOrder: 2,
      },
      {
        organizationId: "default",
        categoryName: "transport",
        categoryIcon: "🚗",
        categoryColor: "#10B981",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "12.00",
        description: "Airport transfers, car rentals, and transportation",
        displayOrder: 3,
      },
      {
        organizationId: "default",
        categoryName: "massage",
        categoryIcon: "💆‍♀️",
        categoryColor: "#8B5CF6",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "25.00",
        description: "Spa services and therapeutic massage",
        displayOrder: 4,
      },
      {
        organizationId: "default",
        categoryName: "rental",
        categoryIcon: "🏊‍♂️",
        categoryColor: "#06B6D4",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "10.00",
        description: "Equipment rentals and recreational gear",
        displayOrder: 5,
      },
      {
        organizationId: "default",
        categoryName: "grocery",
        categoryIcon: "🛒",
        categoryColor: "#EF4444",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "8.00",
        description: "Grocery delivery and provisioning services",
        displayOrder: 6,
      },
      {
        organizationId: "default",
        categoryName: "baby",
        categoryIcon: "👶",
        categoryColor: "#F97316",
        defaultBillingRule: "owner_charged",
        defaultCommissionRate: "5.00",
        description: "Baby equipment rental and childcare services",
        displayOrder: 7,
      },
      {
        organizationId: "default",
        categoryName: "photography",
        categoryIcon: "📸",
        categoryColor: "#EC4899",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "18.00",
        description: "Professional photography and videography",
        displayOrder: 8,
      },
      {
        organizationId: "default",
        categoryName: "airport",
        categoryIcon: "✈️",
        categoryColor: "#6366F1",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "10.00",
        description: "Airport transfer and travel assistance",
        displayOrder: 9,
      },
      {
        organizationId: "default",
        categoryName: "events",
        categoryIcon: "🎉",
        categoryColor: "#84CC16",
        defaultBillingRule: "guest_charged",
        defaultCommissionRate: "22.00",
        description: "Event planning and special occasion services",
        displayOrder: 10,
      }
    ]).returning();

    // Seed service catalog
    await db.insert(addonServiceCatalog).values([
      // Tours
      {
        organizationId: "default",
        serviceName: "Phi Phi Island Day Trip",
        category: "tours",
        description: "Full day tour to Phi Phi Islands including Maya Bay, snorkeling, and lunch",
        basePrice: "1800.00",
        currency: "THB",
        duration: 480, // 8 hours
        imageUrl: "/images/phi-phi-tour.jpg",
        maxGuests: 8,
        advanceBookingHours: 24,
        providerName: "Phuket Island Tours",
        providerContact: "+66 76 123 456",
        commissionRate: "15.00",
        createdBy: "demo-admin",
        displayOrder: 1,
      },
      {
        organizationId: "default",
        serviceName: "James Bond Island Tour",
        category: "tours",
        description: "Visit famous James Bond Island and Phang Nga Bay by longtail boat",
        basePrice: "1500.00",
        currency: "THB",
        duration: 360, // 6 hours
        imageUrl: "/images/james-bond-tour.jpg",
        maxGuests: 6,
        advanceBookingHours: 24,
        providerName: "Phang Nga Adventures",
        providerContact: "+66 76 234 567",
        commissionRate: "15.00",
        createdBy: "demo-admin",
        displayOrder: 2,
      },
      // Chef Services
      {
        organizationId: "default",
        serviceName: "Private Thai Cooking Class",
        category: "chef",
        description: "Learn to cook authentic Thai dishes with a professional chef at your villa",
        basePrice: "3500.00",
        currency: "THB",
        duration: 180, // 3 hours
        imageUrl: "/images/cooking-class.jpg",
        maxGuests: 6,
        advanceBookingHours: 48,
        providerName: "Chef Somchai",
        providerContact: "+66 81 345 678",
        commissionRate: "20.00",
        createdBy: "demo-admin",
        displayOrder: 3,
      },
      {
        organizationId: "default",
        serviceName: "BBQ Dinner Service",
        category: "chef",
        description: "Private BBQ dinner preparation and service for up to 8 guests",
        basePrice: "2800.00",
        currency: "THB",
        duration: 240, // 4 hours
        imageUrl: "/images/bbq-service.jpg",
        maxGuests: 8,
        advanceBookingHours: 24,
        providerName: "Grill Masters Phuket",
        providerContact: "+66 81 456 789",
        commissionRate: "20.00",
        createdBy: "demo-admin",
        displayOrder: 4,
      },
      // Transportation
      {
        organizationId: "default",
        serviceName: "Airport Transfer (Van)",
        category: "transport",
        description: "Private van transfer between Phuket Airport and villa (up to 8 passengers)",
        basePrice: "800.00",
        currency: "THB",
        duration: 60, // 1 hour
        imageUrl: "/images/airport-transfer.jpg",
        maxGuests: 8,
        advanceBookingHours: 12,
        providerName: "Phuket Airport Transfers",
        providerContact: "+66 76 567 890",
        commissionRate: "12.00",
        createdBy: "demo-admin",
        displayOrder: 5,
      },
      {
        organizationId: "default",
        serviceName: "Motorbike Rental (Daily)",
        category: "transport",
        description: "Honda PCX 150cc motorbike rental for one day including helmet",
        basePrice: "300.00",
        currency: "THB",
        duration: 1440, // 24 hours
        imageUrl: "/images/motorbike-rental.jpg",
        maxGuests: 2,
        advanceBookingHours: 4,
        providerName: "Phuket Bike Rental",
        providerContact: "+66 81 678 901",
        commissionRate: "12.00",
        createdBy: "demo-admin",
        displayOrder: 6,
      },
      // Massage & Spa
      {
        organizationId: "default",
        serviceName: "Traditional Thai Massage (60 min)",
        category: "massage",
        description: "Authentic Thai massage performed by certified therapist at your villa",
        basePrice: "800.00",
        currency: "THB",
        duration: 60,
        imageUrl: "/images/thai-massage.jpg",
        maxGuests: 2,
        advanceBookingHours: 6,
        providerName: "Villa Spa Services",
        providerContact: "+66 81 789 012",
        commissionRate: "25.00",
        createdBy: "demo-admin",
        displayOrder: 7,
      },
      {
        organizationId: "default",
        serviceName: "Couple's Oil Massage (90 min)",
        category: "massage",
        description: "Relaxing oil massage for couples in the comfort of your villa",
        basePrice: "1800.00",
        currency: "THB",
        duration: 90,
        imageUrl: "/images/couples-massage.jpg",
        maxGuests: 2,
        advanceBookingHours: 12,
        providerName: "Luxury Spa Phuket",
        providerContact: "+66 81 890 123",
        commissionRate: "25.00",
        createdBy: "demo-admin",
        displayOrder: 8,
      },
      // Equipment Rental
      {
        organizationId: "default",
        serviceName: "Snorkeling Gear Set",
        category: "rental",
        description: "Complete snorkeling equipment set for one day (mask, fins, snorkel)",
        basePrice: "200.00",
        currency: "THB",
        duration: 1440, // 24 hours
        imageUrl: "/images/snorkel-gear.jpg",
        maxGuests: 4,
        advanceBookingHours: 2,
        providerName: "Phuket Water Sports",
        providerContact: "+66 76 901 234",
        commissionRate: "10.00",
        createdBy: "demo-admin",
        displayOrder: 9,
      },
      // Grocery Delivery
      {
        organizationId: "default",
        serviceName: "Welcome Grocery Package",
        category: "grocery",
        description: "Essential groceries delivered before arrival (milk, bread, fruits, water)",
        basePrice: "1200.00",
        currency: "THB",
        duration: 30,
        imageUrl: "/images/grocery-package.jpg",
        maxGuests: 8,
        advanceBookingHours: 24,
        providerName: "Villa Provisions",
        providerContact: "+66 81 012 345",
        commissionRate: "8.00",
        createdBy: "demo-admin",
        displayOrder: 10,
      }
    ]);

    // Seed billing rules
    await db.insert(addonBillingRules).values([
      {
        organizationId: "default",
        ruleName: "Guest Pays Standard Services",
        category: "tours",
        billingRule: "guest_charged",
        billingType: "charged",
        autoApply: true,
        isActive: true,
        priority: 1,
        createdBy: "demo-admin",
      },
      {
        organizationId: "default",
        ruleName: "Owner Covers Baby Equipment",
        category: "baby",
        billingRule: "owner_charged",
        billingType: "charged",
        autoApply: true,
        isActive: true,
        priority: 1,
        createdBy: "demo-admin",
      },
      {
        organizationId: "default",
        ruleName: "Complimentary Welcome Groceries",
        category: "grocery",
        billingRule: "complimentary",
        billingType: "company_gift",
        autoApply: false,
        isActive: true,
        priority: 2,
        createdBy: "demo-admin",
      },
      {
        organizationId: "default",
        ruleName: "VIP Guest Massage Gift",
        category: "massage",
        billingRule: "complimentary",
        billingType: "owner_gift",
        autoApply: false,
        conditions: { vipGuest: true, stayLength: { min: 7 } },
        isActive: true,
        priority: 3,
        createdBy: "demo-admin",
      }
    ]);

    // Seed sample bookings
    await db.insert(addonServiceBookings).values([
      {
        organizationId: "default",
        serviceId: 1, // Phi Phi Island Tour
        propertyId: 1,
        guestName: "John Smith",
        guestEmail: "john.smith@email.com",
        guestPhone: "+1 555 123 4567",
        guestCount: 4,
        serviceDate: "2025-01-15",
        serviceTime: "08:00",
        totalAmount: "7200.00", // 4 guests x 1800
        billingRule: "guest_charged",
        billingType: "charged",
        paymentStatus: "paid",
        paymentMethod: "card",
        status: "confirmed",
        commissionAmount: "1080.00", // 15% of 7200
        bookedBy: "demo-staff",
        confirmedBy: "demo-admin",
        confirmedAt: new Date("2025-01-10T10:00:00Z"),
      },
      {
        organizationId: "default",
        serviceId: 3, // Thai Cooking Class
        propertyId: 2,
        guestName: "Sarah Johnson",
        guestEmail: "sarah.j@email.com",
        guestPhone: "+44 20 1234 5678",
        guestCount: 2,
        serviceDate: "2025-01-18",
        serviceTime: "15:00",
        totalAmount: "3500.00",
        billingRule: "guest_charged",
        billingType: "charged",
        paymentStatus: "pending",
        status: "pending",
        commissionAmount: "700.00", // 20% of 3500
        bookedBy: "demo-staff",
        specialRequests: "Vegetarian cooking class preferred",
      },
      {
        organizationId: "default",
        serviceId: 7, // Thai Massage
        propertyId: 1,
        guestName: "Mike Wilson",
        guestEmail: "mike.w@email.com",
        guestCount: 2,
        serviceDate: "2025-01-20",
        serviceTime: "19:00",
        totalAmount: "1600.00", // 2 x 800
        billingRule: "complimentary",
        billingType: "owner_gift",
        paymentStatus: "paid",
        status: "confirmed",
        commissionAmount: "400.00", // 25% of 1600
        bookedBy: "demo-staff",
        confirmedBy: "demo-admin",
        confirmedAt: new Date("2025-01-15T14:30:00Z"),
        internalNotes: "VIP guest - owner covering as welcome gift",
      }
    ]);

    // Seed commission records
    await db.insert(addonServiceCommissions).values([
      {
        organizationId: "default",
        bookingId: 1,
        serviceId: 1,
        category: "tours",
        staffId: "demo-staff",
        commissionAmount: "1080.00",
        commissionRate: "15.00",
        paymentStatus: "paid",
        paymentDate: new Date("2025-01-16T10:00:00Z"),
        paymentMethod: "bank_transfer",
        notes: "Commission for Phi Phi Island tour booking",
      },
      {
        organizationId: "default",
        bookingId: 2,
        serviceId: 3,
        category: "chef",
        staffId: "demo-staff",
        commissionAmount: "700.00",
        commissionRate: "20.00",
        paymentStatus: "pending",
        notes: "Commission for Thai cooking class booking",
      }
    ]);

    // Seed monthly reports
    await db.insert(addonServiceReports).values([
      {
        organizationId: "default",
        reportMonth: "2024-12",
        category: "tours",
        totalBookings: 8,
        totalRevenue: "14400.00",
        totalCommissions: "2160.00",
        guestChargedRevenue: "14400.00",
        ownerChargedRevenue: "0.00",
        companyExpenseAmount: "0.00",
        complimentaryAmount: "0.00",
        averageBookingValue: "1800.00",
        topService: "Phi Phi Island Day Trip",
      },
      {
        organizationId: "default",
        reportMonth: "2024-12",
        category: "chef",
        totalBookings: 5,
        totalRevenue: "17500.00",
        totalCommissions: "3500.00",
        guestChargedRevenue: "17500.00",
        ownerChargedRevenue: "0.00",
        companyExpenseAmount: "0.00",
        complimentaryAmount: "0.00",
        averageBookingValue: "3500.00",
        topService: "Private Thai Cooking Class",
      },
      {
        organizationId: "default",
        reportMonth: "2024-12",
        category: "massage",
        totalBookings: 12,
        totalRevenue: "9600.00",
        totalCommissions: "2400.00",
        guestChargedRevenue: "6400.00",
        ownerChargedRevenue: "0.00",
        companyExpenseAmount: "0.00",
        complimentaryAmount: "3200.00", // Some complimentary massages
        averageBookingValue: "800.00",
        topService: "Traditional Thai Massage",
      }
    ]);

    console.log("Add-on services data seeded successfully!");
  } catch (error) {
    console.error("Error seeding add-on services data:", error);
  }
}