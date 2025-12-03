import { db } from "./db";
import { guestAddonServices } from "@shared/schema";

export async function seedGuestAddonServices(organizationId: string = "default-org") {
  console.log("Seeding guest add-on services...");

  const services = [
    // Transport Services
    {
      serviceName: "Airport Transfer",
      description: "Private car transfer to/from Phuket Airport. Professional driver, meet & greet service included.",
      category: "transport",
      pricingType: "per-trip",
      basePrice: "1500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 30,
      cancellationPolicyHours: 24,
      vendorName: "Phuket Elite Transport",
      vendorContact: "+66 76 123 456",
      commissionPercentage: 15,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Island Hopping Tour",
      description: "Full-day boat tour to Phi Phi Islands, Maya Bay, and Monkey Beach. Lunch and snorkeling equipment included.",
      category: "transport",
      pricingType: "per-person",
      basePrice: "2800",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 14,
      cancellationPolicyHours: 48,
      vendorName: "Andaman Sea Adventures",
      vendorContact: "+66 76 987 654",
      commissionPercentage: 20,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Tuk Tuk City Tour",
      description: "3-hour guided city tour in traditional tuk tuk. Visit temples, markets, and local attractions.",
      category: "transport",
      pricingType: "per-group",
      basePrice: "800",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 7,
      cancellationPolicyHours: 12,
      vendorName: "Phuket Local Tours",
      vendorContact: "+66 81 234 567",
      commissionPercentage: 25,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Private Chef Services
    {
      serviceName: "Private Chef - Thai Cuisine",
      description: "Professional Thai chef prepares authentic 4-course meal in your villa. Includes shopping and cleanup.",
      category: "chef",
      pricingType: "per-meal",
      basePrice: "3500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 5,
      cancellationPolicyHours: 24,
      vendorName: "Villa Chef Services",
      vendorContact: "+66 89 456 789",
      commissionPercentage: 30,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "BBQ Chef Experience",
      description: "Private BBQ chef with premium meats and seafood. Perfect for groups, includes all equipment and setup.",
      category: "chef",
      pricingType: "per-group",
      basePrice: "4500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 7,
      cancellationPolicyHours: 48,
      vendorName: "Phuket BBQ Masters",
      vendorContact: "+66 82 567 890",
      commissionPercentage: 25,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Breakfast Services
    {
      serviceName: "Continental Breakfast Delivery",
      description: "Fresh pastries, fruits, coffee, and juice delivered daily to your villa. Perfect for a relaxing morning.",
      category: "breakfast",
      pricingType: "per-person",
      basePrice: "450",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 3,
      cancellationPolicyHours: 12,
      vendorName: "Morning Delights Catering",
      vendorContact: "+66 76 345 678",
      commissionPercentage: 20,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Thai Breakfast Experience",
      description: "Traditional Thai breakfast with congee, dim sum, fresh fruits, and Thai coffee served at your villa.",
      category: "breakfast",
      pricingType: "per-person",
      basePrice: "380",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 3,
      cancellationPolicyHours: 12,
      vendorName: "Thai Morning Feast",
      vendorContact: "+66 85 678 901",
      commissionPercentage: 25,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Massage Services
    {
      serviceName: "Traditional Thai Massage",
      description: "60-minute authentic Thai massage by certified therapist. Relaxing treatment in the comfort of your villa.",
      category: "massage",
      pricingType: "per-person",
      basePrice: "1200",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 7,
      cancellationPolicyHours: 6,
      vendorName: "Serenity Spa Services",
      vendorContact: "+66 89 789 012",
      commissionPercentage: 35,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Couples Spa Package",
      description: "90-minute couples massage with aromatherapy oils. Includes wine and tropical fruits.",
      category: "massage",
      pricingType: "per-couple",
      basePrice: "2800",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 10,
      cancellationPolicyHours: 12,
      vendorName: "Romance Spa Phuket",
      vendorContact: "+66 87 890 123",
      commissionPercentage: 40,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Vehicle Rentals
    {
      serviceName: "Scooter Rental - Daily",
      description: "Honda PCX 150cc scooter rental with helmets. Perfect for exploring the island at your own pace.",
      category: "rental",
      pricingType: "per-day",
      basePrice: "300",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: false,
      maxAdvanceBookingDays: 14,
      cancellationPolicyHours: 24,
      vendorName: "Island Ride Rentals",
      vendorContact: "+66 81 901 234",
      commissionPercentage: 15,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Private Car with Driver",
      description: "8-hour private car with professional English-speaking driver. Visit attractions at your own pace.",
      category: "rental",
      pricingType: "per-day",
      basePrice: "2500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 21,
      cancellationPolicyHours: 24,
      vendorName: "Phuket Driver Services",
      vendorContact: "+66 86 012 345",
      commissionPercentage: 20,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Activities
    {
      serviceName: "Elephant Sanctuary Visit",
      description: "Half-day ethical elephant sanctuary experience. Feed, bathe, and learn about elephant conservation.",
      category: "activities",
      pricingType: "per-person",
      basePrice: "1800",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 14,
      cancellationPolicyHours: 48,
      vendorName: "Phuket Elephant Sanctuary",
      vendorContact: "+66 83 123 456",
      commissionPercentage: 25,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Muay Thai Training Session",
      description: "2-hour private Muay Thai lesson with professional trainer. Includes equipment and refreshments.",
      category: "activities",
      pricingType: "per-person",
      basePrice: "1500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 7,
      cancellationPolicyHours: 12,
      vendorName: "Tiger Muay Thai Phuket",
      vendorContact: "+66 84 234 567",
      commissionPercentage: 30,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Sunset Sailing Trip",
      description: "3-hour private sailing experience with champagne and canapés. Watch the famous Phuket sunset from the sea.",
      category: "activities",
      pricingType: "per-group",
      basePrice: "8500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 10,
      cancellationPolicyHours: 24,
      vendorName: "Sunset Sailing Phuket",
      vendorContact: "+66 88 345 678",
      commissionPercentage: 35,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Other Services
    {
      serviceName: "Grocery Shopping Service",
      description: "Personal shopper will stock your villa with groceries and essentials. Includes delivery and storage.",
      category: "other",
      pricingType: "flat-rate",
      basePrice: "500",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 2,
      cancellationPolicyHours: 4,
      vendorName: "Villa Concierge Services",
      vendorContact: "+66 85 456 789",
      commissionPercentage: 25,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Laundry & Dry Cleaning",
      description: "Professional laundry and dry cleaning service with same-day return. Pick-up and delivery included.",
      category: "other",
      pricingType: "per-kg",
      basePrice: "80",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: false,
      maxAdvanceBookingDays: 1,
      cancellationPolicyHours: 2,
      vendorName: "Express Laundry Phuket",
      vendorContact: "+66 87 567 890",
      commissionPercentage: 20,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      serviceName: "Baby Equipment Rental",
      description: "Complete baby equipment rental including crib, high chair, stroller, and baby monitor. Cleaned and sanitized.",
      category: "other",
      pricingType: "per-week",
      basePrice: "2000",
      currency: "THB",
      isActive: true,
      requiresTimeSlot: true,
      maxAdvanceBookingDays: 30,
      cancellationPolicyHours: 48,
      vendorName: "Baby Comfort Rentals",
      vendorContact: "+66 89 678 901",
      commissionPercentage: 30,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    // Check if services already exist
    const existingServices = await db.select()
      .from(guestAddonServices)
      .where({ organizationId });

    if (existingServices.length > 0) {
      console.log("Guest add-on services already exist, skipping seed...");
      return;
    }

    // Insert services
    const insertedServices = await db.insert(guestAddonServices)
      .values(services)
      .returning();

    console.log(`Successfully seeded ${insertedServices.length} guest add-on services`);
    return insertedServices;

  } catch (error) {
    console.error("Error seeding guest add-on services:", error);
    throw error;
  }
}