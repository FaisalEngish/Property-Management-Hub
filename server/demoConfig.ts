// Centralized Demo Configuration
// All demo data across the platform must reference these reservation IDs

export const DEMO_RESERVATIONS = {
  demoOne: "Demo1234",  // John & Sarah Smith at Villa Samui Breeze
  demoTwo: "Demo1235"   // Future demo reservation
} as const;

export const DEMO_GUESTS = {
  johnSarah: {
    reservationId: DEMO_RESERVATIONS.demoOne,
    guestName: "John & Sarah Smith",
    guestEmail: "john.smith@example.com",
    guestPhone: "+1-555-0123",
    numberOfGuests: 2,
    villa: "Villa Samui Breeze",
    villaId: 1,
    checkInDate: "2025-01-03",
    checkOutDate: "2025-01-10",
    stayDuration: 7, // nights
    depositAmount: 8000,
    depositCurrency: "THB",
    electricityStartReading: 10500,
    electricityRate: 7, // THB per kWh
  }
} as const;

export const DEMO_PROPERTY_DETAILS = {
  villaSamuiBreeze: {
    id: 1,
    name: "Villa Samui Breeze",
    address: "123 Beach Road, Chaweng, Koh Samui, Thailand 84320",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    wifiCode: "SamuiBreeze2025",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    emergencyContact: "Manager Khun Som: +66-77-123-4567",
    houseRules: [
      "No smoking inside the villa",
      "Pool hours: 6:00 AM - 10:00 PM", 
      "Quiet hours: 10:00 PM - 8:00 AM",
      "Maximum 8 guests allowed",
      "No parties or events without prior approval"
    ],
    amenities: [
      { name: "Private Pool", type: "recreation", wifiCode: null },
      { name: "WiFi", type: "connectivity", wifiCode: "SamuiBreeze2025" },
      { name: "Air Conditioning", type: "comfort", wifiCode: null },
      { name: "Beach Access", type: "location", wifiCode: null },
      { name: "Chef Kitchen", type: "dining", wifiCode: null }
    ]
  }
} as const;

// Demo service timeline - all dates within stay period (Jan 3-10, 2025)
export const DEMO_SERVICES = [
  {
    id: 1,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "cleaning",
    serviceName: "Pool Cleaning & Maintenance",
    scheduledDate: "2025-01-08",
    scheduledTime: "15:00",
    estimatedDuration: "45 minutes",
    serviceProvider: "Chai (Pool Specialist)",
    status: "scheduled",
    notes: "Weekly pool cleaning and chemical balance check"
  },
  {
    id: 2,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "cleaning", 
    serviceName: "Villa Cleaning During Stay",
    scheduledDate: "2025-01-09",
    scheduledTime: "10:00",
    estimatedDuration: "2 hours",
    serviceProvider: "Dao (Housekeeping)",
    status: "scheduled",
    notes: "Mid-stay cleaning service, fresh linens and towels"
  },
  {
    id: 3,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "dining",
    serviceName: "Private Chef Dinner",
    scheduledDate: "2025-01-08",
    scheduledTime: "20:00", 
    estimatedDuration: "3 hours",
    serviceProvider: "Chef Phyo (Thai Cuisine)",
    status: "confirmed",
    notes: "Traditional Thai seafood dinner for 2 guests, including fresh catch of the day"
  },
  {
    id: 4,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "maintenance",
    serviceName: "Garden & Landscape Service",
    scheduledDate: "2025-01-09",
    scheduledTime: "14:00",
    estimatedDuration: "1 hour",
    serviceProvider: "Nye (Landscaping)",
    status: "scheduled", 
    notes: "Weekly garden maintenance and plant watering"
  }
] as const;

// Demo electricity billing
export const DEMO_ELECTRICITY = {
  reservationId: DEMO_RESERVATIONS.demoOne,
  checkIn: {
    checkInReading: 10500,
    checkInPhoto: "https://your-image-url.com/meter-photo.jpg",
    checkInMethod: "ocr_automatic",
    checkInDate: "2025-01-03",
    checkInTime: "15:00"
  },
  checkOut: {
    checkOutReading: null, // Will be set at checkout
    checkOutPhoto: null,
    checkOutMethod: null,
    checkOutDate: null,
    checkOutTime: null,
    electricityUsed: null,
    ratePerKwh: 7.0,
    totalCharge: null,
    paymentStatus: "not_charged_yet",
    billingStatus: "To be charged to guest"
  },
  included: false,
  chargedTo: "guest",
  hasData: true
} as const;

// Demo deposit information
export const DEMO_DEPOSIT = {
  reservationId: DEMO_RESERVATIONS.demoOne,
  depositType: "cash",
  depositAmount: 8000.00,
  depositCurrency: "THB", 
  depositReceiptPhoto: "https://via.placeholder.com/300x200?text=Cash+Deposit+Receipt+8000+THB",
  refundAmount: 8000.00,
  refundCurrency: "THB",
  refundMethod: "cash",
  refundStatus: "received",
  refundReceiptPhoto: null,
  discountAmount: 0.00,
  discountReason: null,
  notes: "Cash deposit of 8,000 THB received and held until checkout completion and final inspection."
} as const;

// Helper function to bind all demo data to reservation
export function bindDemoDataToReservation(reservationId: string) {
  console.log(`✅ Demo data bound to reservation: ${reservationId}`);
  
  // This function serves as documentation for the demo data binding
  // All storage methods should reference DEMO_RESERVATIONS for consistency
  
  return {
    reservationId,
    guest: DEMO_GUESTS.johnSarah,
    property: DEMO_PROPERTY_DETAILS.villaSamuiBreeze,
    services: DEMO_SERVICES,
    electricity: DEMO_ELECTRICITY,
    deposit: DEMO_DEPOSIT
  };
}

// Call the binding function for Demo1234 as requested
bindDemoDataToReservation(DEMO_RESERVATIONS.demoOne);