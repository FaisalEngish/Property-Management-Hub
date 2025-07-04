import { db } from "./db";
import { 
  serviceVendors, 
  serviceCategories, 
  marketplaceServices, 
  serviceBookings, 
  serviceReviews 
} from "@shared/schema";

export async function seedServiceMarketplaceData() {
  try {
    console.log("Seeding Service Marketplace data...");

    // Check if data already exists
    const existingVendors = await db.select().from(serviceVendors).limit(1);
    if (existingVendors.length > 0) {
      console.log("Service Marketplace data already exists, skipping seed.");
      return;
    }

    // Insert service categories
    const categoryData = [
      {
        organizationId: "default-org",
        name: "Home Cleaning",
        description: "Professional cleaning services for residential properties",
        icon: "home",
        color: "#3B82F6",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Garden & Landscaping",
        description: "Garden maintenance and landscaping services",
        icon: "leaf",
        color: "#10B981",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Pool Maintenance",
        description: "Swimming pool cleaning and maintenance",
        icon: "droplets",
        color: "#06B6D4",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Electrical Services",
        description: "Electrical repairs and installations",
        icon: "zap",
        color: "#F59E0B",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Plumbing",
        description: "Plumbing repairs and installations",
        icon: "wrench",
        color: "#8B5CF6",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "AC & HVAC",
        description: "Air conditioning and heating services",
        icon: "wind",
        color: "#EF4444",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Pest Control",
        description: "Professional pest control services",
        icon: "bug",
        color: "#F97316",
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Transportation",
        description: "Transportation and taxi services",
        icon: "car",
        color: "#6366F1",
        createdBy: "demo-admin",
      }
    ];

    const insertedCategories = await db.insert(serviceCategories).values(categoryData).returning();

    // Insert service vendors
    const vendorData = [
      {
        organizationId: "default-org",
        name: "Samui Clean Pro",
        description: "Professional cleaning service with 10 years experience in Koh Samui",
        vendorType: "external",
        contactPerson: "Niran Sompong",
        email: "info@samuicleanpro.com",
        phone: "+66 77 123 4567",
        businessLicense: "BL-001-2024",
        taxId: "TN-123456789",
        address: "123 Chaweng Beach Road, Koh Samui, Surat Thani 84320",
        paymentTerms: "net_30",
        rating: 4.8,
        reviewCount: 245,
        responseTime: 24,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "08:00", end: "18:00" },
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Tropical Gardens Samui",
        description: "Award-winning landscaping company specializing in tropical garden design",
        vendorType: "external",
        contactPerson: "Somchai Rattana",
        email: "contact@tropicalgardens.co.th",
        phone: "+66 77 987 6543",
        businessLicense: "BL-002-2024",
        taxId: "TN-987654321",
        address: "456 Lamai Ring Road, Koh Samui, Surat Thani 84310",
        paymentTerms: "net_15",
        deliveryTime: "3-7 business days",
        rating: 4.9,
        reviewCount: 156,
        responseTime: 48,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        workingHours: { start: "07:00", end: "17:00" },
        tags: ["landscaping", "garden", "design", "premium"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Island Pool Services",
        description: "Certified pool technician with 8 years experience",
        vendorType: "external",
        contactPerson: "Khun Prasert",
        email: "service@islandpools.com",
        phone: "+66 77 555 1234",
        businessLicense: "BL-003-2024",
        taxId: "TN-111222333",
        address: "789 Maenam Beach, Koh Samui, Surat Thani 84330",
        paymentTerms: "immediate",
        deliveryTime: "Same day response",
        rating: 4.7,
        reviewCount: 312,
        responseTime: 2,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "08:00", end: "17:00" },
        tags: ["pool", "maintenance", "cleaning", "individual"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Samui Electric Solutions",
        description: "Licensed electrical contractor serving Koh Samui for 12 years",
        vendorType: "external",
        contactPerson: "Wichai Thepsiri",
        email: "electric@samuisolutions.co.th",
        phone: "+66 77 333 7890",
        businessLicense: "BL-004-2024",
        taxId: "TN-444555666",
        address: "321 Nathon Pier Road, Koh Samui, Surat Thani 84140",
        paymentTerms: "net_15",
        deliveryTime: "24-48 hours",
        rating: 4.6,
        reviewCount: 189,
        responseTime: 4,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "08:00", end: "18:00" },
        tags: ["electrical", "installation", "repairs", "licensed"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Quick Fix Plumbing",
        description: "Experienced plumber with same-day service guarantee",
        vendorType: "external",
        contactPerson: "Nopparat Wongsa",
        email: "info@quickfixsamui.com",
        phone: "+66 77 444 5678",
        businessLicense: "BL-005-2024",
        taxId: "TN-777888999",
        address: "567 Chaweng-Choeng Mon Road, Koh Samui, Surat Thani 84320",
        paymentTerms: "immediate",
        deliveryTime: "Same day or emergency 24/7",
        rating: 4.5,
        reviewCount: 278,
        responseTime: 1,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        workingHours: { start: "07:00", end: "19:00" },
        tags: ["plumbing", "repairs", "emergency", "budget-friendly"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Cool Air Samui",
        description: "Certified AC technicians with warranty on all work",
        vendorType: "external",
        contactPerson: "Apirak Jintana",
        email: "service@coolairsamui.com",
        phone: "+66 77 666 9012",
        businessLicense: "BL-006-2024",
        taxId: "TN-101112131",
        address: "890 Big Buddha Road, Koh Samui, Surat Thani 84320",
        paymentTerms: "net_15",
        deliveryTime: "1-3 business days",
        rating: 4.8,
        reviewCount: 198,
        responseTime: 6,
        isActive: true,
        isVerified: true,
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        workingHours: { start: "08:00", end: "18:00" },
        tags: ["air-conditioning", "installation", "maintenance", "warranty"],
        createdBy: "demo-admin",
      }
    ];

    const insertedVendors = await db.insert(serviceVendors).values(vendorData).returning();

    // Insert marketplace services
    const serviceData = [
      // Cleaning Services
      {
        organizationId: "default-org",
        name: "Standard House Cleaning",
        categoryId: insertedCategories[0].id, // Home Cleaning
        vendorId: insertedVendors[0].id, // Samui Clean Pro
        description: "Complete house cleaning including bathrooms, kitchen, bedrooms, living areas",
        pricingType: "flat_rate",
        basePrice: "1500",
        currency: "THB",
        duration: "3-4 hours",
        availability: "Mon-Sat 8AM-4PM",
        bookingInstructions: "Access to property, parking space",
        isActive: true,
        tags: ["cleaning", "house", "standard"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Deep Cleaning Service",
        categoryId: insertedCategories[0].id, // Home Cleaning
        vendorId: insertedVendors[0].id, // Samui Clean Pro
        description: "Intensive deep cleaning including inside appliances, detailed bathroom cleaning",
        pricingType: "flat_rate",
        basePrice: "2500",
        currency: "THB",
        duration: "5-6 hours",
        availability: "Mon-Fri 8AM-2PM",
        bookingInstructions: "Full day access, water and electricity",
        isActive: true,
        tags: ["cleaning", "deep", "intensive"],
        createdBy: "demo-admin",
      },
      
      // Garden Services
      {
        organizationId: "default-org",
        name: "Garden Maintenance",
        categoryId: insertedCategories[1].id, // Garden & Landscaping
        vendorId: insertedVendors[1].id, // Tropical Gardens
        description: "Regular garden maintenance including pruning, weeding, watering",
        pricingType: "flat_rate",
        basePrice: "800",
        currency: "THB",
        duration: "2-3 hours",
        availability: "Daily 7AM-4PM",
        bookingInstructions: "Garden access, tool storage space",
        isActive: true,
        tags: ["garden", "maintenance", "regular"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Landscape Design & Installation",
        categoryId: insertedCategories[1].id, // Garden & Landscaping
        vendorId: insertedVendors[1].id, // Tropical Gardens
        description: "Complete landscape design and installation with tropical plants",
        pricingType: "quote_based",
        basePrice: "15000",
        currency: "THB",
        duration: "3-5 days",
        availability: "Mon-Fri (project based)",
        bookingInstructions: "Site survey, design approval, material access",
        isActive: true,
        tags: ["landscape", "design", "installation"],
        createdBy: "demo-admin",
      },
      
      // Pool Services
      {
        organizationId: "default-org",
        name: "Weekly Pool Cleaning",
        categoryId: insertedCategories[2].id, // Pool Maintenance
        vendorId: insertedVendors[2].id, // Island Pool Services
        description: "Complete pool cleaning, chemical balancing, equipment check",
        pricingType: "flat_rate",
        basePrice: "600",
        currency: "THB",
        duration: "1-2 hours",
        availability: "Mon-Fri 8AM-4PM",
        bookingInstructions: "Pool access, equipment room access",
        isActive: true,
        tags: ["pool", "cleaning", "weekly"],
        createdBy: "demo-admin",
      },
      {
        organizationId: "default-org",
        name: "Pool Equipment Repair",
        categoryId: insertedCategories[2].id, // Pool Maintenance
        vendorId: insertedVendors[2].id, // Island Pool Services
        description: "Repair and replacement of pool pumps, filters, heaters",
        pricingType: "quote_based",
        basePrice: "2000",
        currency: "THB",
        duration: "2-4 hours",
        availability: "Mon-Sat 8AM-5PM",
        bookingInstructions: "Equipment room access, power shutdown capability",
        isActive: true,
        tags: ["pool", "repair", "equipment"],
        createdBy: "demo-admin",
      },
      
      // Electrical Services
      {
        organizationId: "default-org",
        name: "Electrical Safety Inspection",
        categoryId: insertedCategories[3].id, // Electrical Services
        vendorId: insertedVendors[3].id, // Samui Electric Solutions
        description: "Complete electrical system inspection and safety certification",
        pricingType: "flat_rate",
        basePrice: "1200",
        currency: "THB",
        duration: "2-3 hours",
        availability: "Mon-Sat 8AM-5PM",
        bookingInstructions: "Access to all electrical panels, property walkthrough",
        isActive: true,
        tags: ["electrical", "inspection", "safety"],
        createdBy: "demo-admin",
      },
      
      // Plumbing Services
      {
        organizationId: "default-org",
        name: "Emergency Plumbing Repair",
        categoryId: insertedCategories[4].id, // Plumbing
        vendorId: insertedVendors[4].id, // Quick Fix Plumbing
        description: "24/7 emergency plumbing repairs for leaks, blockages, breaks",
        pricingType: "hourly",
        basePrice: "1500",
        currency: "THB",
        duration: "1-3 hours",
        availability: "24/7 Emergency Service",
        bookingInstructions: "Property access, water main location",
        isActive: true,
        tags: ["plumbing", "emergency", "repair"],
        createdBy: "demo-admin",
      },
      
      // AC Services
      {
        organizationId: "default-org",
        name: "AC Service & Maintenance",
        categoryId: insertedCategories[5].id, // AC & HVAC
        vendorId: insertedVendors[5].id, // Cool Air Samui
        description: "Complete AC service including cleaning, gas check, filter replacement",
        pricingType: "flat_rate",
        basePrice: "800",
        currency: "THB",
        duration: "1-2 hours per unit",
        availability: "Mon-Sat 8AM-5PM",
        bookingInstructions: "Access to all AC units, power availability",
        isActive: true,
        tags: ["ac", "service", "maintenance"],
        createdBy: "demo-admin",
      }
    ];

    const insertedServices = await db.insert(marketplaceServices).values(serviceData).returning();

    // Insert sample bookings
    const bookingData = [
      {
        organizationId: "default-org",
        serviceId: insertedServices[0].id, // Standard House Cleaning
        propertyId: 1, // Assuming property ID 1 exists
        bookingNumber: "SRV-001-2024",
        guestName: "John Smith",
        guestEmail: "john.smith@example.com",
        guestPhone: "+66 12 345 6789",
        requestedDate: "2024-12-15",
        requestedTime: "09:00",
        estimatedDuration: 180, // 3 hours in minutes
        billingAssignment: "guest_billable",
        status: "completed",
        paymentStatus: "paid",
        totalAmount: "1500",
        currency: "THB",
        guestNotes: "Regular weekly cleaning service",
        requestedBy: "demo-pm",
        requestedByRole: "portfolio-manager",
      },
      {
        organizationId: "default-org",
        serviceId: insertedServices[4].id, // Weekly Pool Cleaning
        propertyId: 1,
        bookingNumber: "SRV-002-2024",
        guestName: "Sarah Johnson",
        guestEmail: "sarah.j@example.com",
        guestPhone: "+66 98 765 4321",
        requestedDate: "2024-12-16",
        requestedTime: "10:00",
        estimatedDuration: 90, // 1.5 hours in minutes
        billingAssignment: "owner_expense",
        status: "confirmed",
        paymentStatus: "pending",
        totalAmount: "600",
        currency: "THB",
        guestNotes: "Weekly pool maintenance",
        requestedBy: "demo-staff",
        requestedByRole: "staff",
      },
      {
        organizationId: "default-org",
        serviceId: insertedServices[2].id, // Garden Maintenance
        propertyId: 2, // Assuming property ID 2 exists
        bookingNumber: "SRV-003-2024",
        guestName: "Mike Wilson",
        guestEmail: "mike.w@example.com",
        guestPhone: "+66 55 123 4567",
        requestedDate: "2024-12-18",
        requestedTime: "08:00",
        estimatedDuration: 150, // 2.5 hours in minutes
        billingAssignment: "company_expense",
        status: "confirmed",
        paymentStatus: "pending",
        totalAmount: "800",
        currency: "THB",
        guestNotes: "Monthly garden maintenance visit",
        requestedBy: "demo-pm",
        requestedByRole: "portfolio-manager",
      },
      {
        organizationId: "default-org",
        serviceId: insertedServices[8].id, // AC Service
        propertyId: 1,
        bookingNumber: "SRV-004-2024",
        guestName: "Lisa Chen",
        guestEmail: "lisa.chen@example.com",
        guestPhone: "+66 77 888 9999",
        requestedDate: "2024-12-20",
        requestedTime: "14:00",
        estimatedDuration: 240, // 4 hours in minutes (3 AC units)
        billingAssignment: "guest_billable",
        status: "pending",
        paymentStatus: "pending",
        totalAmount: "2400",
        currency: "THB",
        guestNotes: "Service 3 AC units in villa",
        requestedBy: "demo-staff",
        requestedByRole: "staff",
      }
    ];

    const insertedBookings = await db.insert(serviceBookings).values(bookingData).returning();

    // Insert sample reviews
    const reviewData = [
      {
        organizationId: "default-org",
        bookingId: insertedBookings[0].id,
        serviceId: insertedServices[0].id, // Standard House Cleaning
        vendorId: insertedVendors[0].id, // Samui Clean Pro
        rating: 5,
        title: "Excellent Service",
        review: "Excellent cleaning service! Very thorough and professional. The team arrived on time and left the villa spotless.",
        serviceRating: 5,
        qualityRating: 5,
        timelinessRating: 5,
        communicationRating: 5,
        valueRating: 5,
        reviewerType: "portfolio_manager",
        reviewedBy: "demo-pm",
      },
      {
        organizationId: "default-org",
        bookingId: insertedBookings[1].id,
        serviceId: insertedServices[4].id, // Weekly Pool Cleaning
        vendorId: insertedVendors[2].id, // Island Pool Services
        rating: 4,
        title: "Good Pool Service",
        review: "Good pool service, reliable and knowledgeable. Pool is always crystal clear after their visit.",
        serviceRating: 4,
        qualityRating: 4,
        timelinessRating: 4,
        communicationRating: 4,
        valueRating: 4,
        reviewerType: "staff",
        reviewedBy: "demo-staff",
      },
      {
        organizationId: "default-org",
        bookingId: insertedBookings[2].id,
        serviceId: insertedServices[2].id, // Garden Maintenance
        vendorId: insertedVendors[1].id, // Tropical Gardens
        rating: 5,
        title: "Outstanding Garden Work",
        review: "Outstanding garden work! They really understand tropical plants and the garden looks amazing.",
        serviceRating: 5,
        qualityRating: 5,
        timelinessRating: 5,
        communicationRating: 5,
        valueRating: 5,
        reviewerType: "admin",
        reviewedBy: "demo-admin",
      }
    ];

    await db.insert(serviceReviews).values(reviewData);

    console.log("Service Marketplace data seeded successfully!");
    console.log(`- Created ${insertedCategories.length} service categories`);
    console.log(`- Created ${insertedVendors.length} service vendors`);
    console.log(`- Created ${insertedServices.length} marketplace services`);
    console.log(`- Created ${insertedBookings.length} service bookings`);
    console.log(`- Created ${reviewData.length} service reviews`);

  } catch (error) {
    console.error("Error seeding Service Marketplace data:", error);
    throw error;
  }
}