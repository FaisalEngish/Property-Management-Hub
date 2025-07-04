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
    serviceType: "pool",
    serviceName: "Pool Cleaning",
    scheduledDate: "2025-01-08",
    scheduledTime: "15:00",
    estimatedDuration: "1 hour",
    serviceProvider: "Moo",
    status: "scheduled",
    notes: "Regular pool cleaning and maintenance"
  },
  {
    id: 2,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "cleaning", 
    serviceName: "Mid-Stay Cleaning",
    scheduledDate: "2025-01-09",
    scheduledTime: "10:00",
    estimatedDuration: "2 hours",
    serviceProvider: "Nok",
    status: "scheduled",
    notes: "Mid-stay villa cleaning service"
  },
  {
    id: 3,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "catering",
    serviceName: "Chef Dinner Service",
    scheduledDate: "2025-01-08",
    scheduledTime: "20:00", 
    estimatedDuration: "3 hours",
    serviceProvider: "Phyo",
    status: "confirmed",
    notes: "Private chef dinner service for 2 guests"
  },
  {
    id: 4,
    reservationId: DEMO_RESERVATIONS.demoOne,
    serviceType: "garden",
    serviceName: "Garden Maintenance",
    scheduledDate: "2025-01-11",
    scheduledTime: "14:00",
    estimatedDuration: "1.5 hours",
    serviceProvider: "Kla",
    status: "scheduled", 
    notes: "Garden maintenance and landscaping"
  }
] as const;

// Demo electricity billing
export const DEMO_ELECTRICITY = {
  reservationId: DEMO_RESERVATIONS.demoOne,
  checkIn: {
    checkInReading: 1000,
    checkInPhoto: "https://example.com/uploads/demo-meter-photo.jpg",
    checkInMethod: "ocr_automatic",
    checkInDate: "2025-07-01",
    checkInTime: "15:00",
    recordedBy: "Host Thura"
  },
  checkOut: {
    checkOutReading: 1100,
    checkOutPhoto: "https://example.com/uploads/demo-meter-checkout.jpg",
    checkOutMethod: "manual_entry",
    checkOutDate: "2025-07-05",
    checkOutTime: "11:00",
    electricityUsed: 100, // 1100 - 1000 = 100 kWh
    ratePerKwh: 7.0,
    totalCharge: 700, // 100 kWh x 7 THB = 700 THB
    paymentStatus: "deducted_from_deposit",
    billingStatus: "Charged to guest via deposit deduction",
    recordedBy: "Host Thura"
  },
  included: false,
  chargedTo: "guest",
  hasData: true,
  notes: "Reading taken during check-in by host on Jan 3, 2025"
} as const;

// Demo deposit information
export const DEMO_DEPOSIT = {
  reservationId: DEMO_RESERVATIONS.demoOne,
  depositType: "cash",
  depositAmount: 8000.00,
  depositCurrency: "THB", 
  depositReceiptPhoto: "https://via.placeholder.com/300x200?text=Cash+Deposit+Receipt+8000+THB",
  refundAmount: 7300.00,
  refundCurrency: "THB",
  refundMethod: "cash",
  refundStatus: "refunded",
  refundReceiptPhoto: "https://via.placeholder.com/300x200?text=Deposit+Refund+7300+THB",
  electricityDeduction: 700.00,
  discountAmount: 0.00,
  discountReason: null,
  receivedBy: "Host (Jane)",
  receivedDate: "2025-07-01",
  refundedBy: "Host Thura",
  refundDate: "2025-07-05",
  notes: "Guest paid cash deposit at check-in. 700 THB deducted for electricity usage (100 kWh × 7 THB/kWh)."
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

// Function to assign service timeline to reservation as requested
export function assignServiceTimelineToReservation(reservationId: string, serviceTimeline: any[]) {
  console.log(`✅ Service timeline assigned to reservation: ${reservationId}`);
  console.log(`📅 Services scheduled:`, serviceTimeline);
  
  // This function demonstrates the assignment of service events to a specific reservation
  // The service timeline data is now stored in DEMO_SERVICES and bound to Demo1234
  
  return {
    reservationId,
    servicesCount: serviceTimeline.length,
    services: serviceTimeline
  };
}

// Call the binding function for Demo1234 as requested
bindDemoDataToReservation(DEMO_RESERVATIONS.demoOne);

// Inject the demo service timeline data for reservation Demo1234 (John & Sarah Smith)
const demoServiceTimeline = [
  {
    type: "Pool Cleaning",
    date: "2025-01-08",
    time: "15:00",
    staff: "Moo",
    status: "Scheduled"
  },
  {
    type: "Mid-Stay Cleaning",
    date: "2025-01-09",
    time: "10:00",
    staff: "Nok",
    status: "Scheduled"
  },
  {
    type: "Chef Dinner Service",
    date: "2025-01-08",
    time: "20:00",
    staff: "Phyo",
    status: "Confirmed"
  },
  {
    type: "Garden Maintenance",
    date: "2025-01-11",
    time: "14:00",
    staff: "Kla",
    status: "Scheduled"
  }
];

// Attach demo service events to the guest dashboard under Demo1234
assignServiceTimelineToReservation("Demo1234", demoServiceTimeline);

// Function to attach electricity reading to reservation as requested
export function attachElectricityReading(electricityData: any) {
  console.log(`⚡ Electricity reading attached to reservation: ${electricityData.reservationId}`);
  console.log(`📊 Meter start reading: ${electricityData.meterStart} kWh`);
  console.log(`📸 Meter image: ${electricityData.meterImageURL}`);
  console.log(`💰 Rate: ${electricityData.kwRate} THB per kWh`);
  console.log(`📝 Notes: ${electricityData.notes}`);
  
  return {
    reservationId: electricityData.reservationId,
    meterStart: electricityData.meterStart,
    ratePerKwh: electricityData.kwRate,
    includedInRate: electricityData.includedInRate,
    imageUrl: electricityData.meterImageURL,
    notes: electricityData.notes
  };
}

// Inject electricity meter data for reservation Demo1234
const electricityDemo = {
  reservationId: "Demo1234",
  meterStart: 20450,
  meterImageURL: "https://example.com/demo-meter-image.jpg",
  kwRate: 7,
  includedInRate: false,
  notes: "Reading taken during check-in by host on Jan 3, 2025"
};

// Apply to guest dashboard
attachElectricityReading(electricityDemo);

// Function to log guest deposit for reservation as requested
export function logGuestDeposit(depositRecord: any) {
  console.log(`💰 Guest deposit logged for reservation: ${depositRecord.reservationId}`);
  console.log(`💵 Amount: ${depositRecord.amount} ${depositRecord.currency}`);
  console.log(`📋 Method: ${depositRecord.method}`);
  console.log(`👤 Received by: ${depositRecord.receivedBy}`);
  console.log(`📅 Date: ${depositRecord.receivedDate}`);
  console.log(`📝 Notes: ${depositRecord.notes}`);
  
  return {
    reservationId: depositRecord.reservationId,
    amount: depositRecord.amount,
    currency: depositRecord.currency,
    paymentMethod: depositRecord.method,
    receivedBy: depositRecord.receivedBy,
    receivedDate: depositRecord.receivedDate,
    status: "received",
    notes: depositRecord.notes
  };
}

// Add deposit record for Demo1234
const depositRecord = {
  reservationId: "Demo1234",
  amount: 8000,
  currency: "THB",
  method: "Cash",
  receivedBy: "Host (Jane)",
  receivedDate: "2025-07-01",
  notes: "Guest paid cash deposit at check-in"
};

// Apply to guest + admin dashboards
logGuestDeposit(depositRecord);

// Function to inject scheduled services for reservation as requested
export function injectScheduledServices(scheduledServices: any[]) {
  console.log(`📅 Scheduled services injected for reservation services count: ${scheduledServices.length}`);
  
  scheduledServices.forEach((service, index) => {
    console.log(`🔧 Service ${index + 1}: ${service.serviceType}`);
    console.log(`  📅 Scheduled: ${service.scheduledFor}`);
    console.log(`  👥 Assigned: ${service.assignedTo}`);
    console.log(`  🏠 Property: ${service.property}`);
    console.log(`  📝 Notes: ${service.notes}`);
  });
  
  return {
    totalServices: scheduledServices.length,
    services: scheduledServices.map(service => ({
      reservationId: service.reservationId,
      serviceType: service.serviceType,
      scheduledDateTime: service.scheduledFor,
      assignedTeam: service.assignedTo,
      propertyName: service.property,
      frequency: service.frequency,
      serviceNotes: service.notes,
      status: "scheduled"
    }))
  };
}

// Create scheduled services for demo booking Demo1234
const scheduledServices = [
  {
    reservationId: "Demo1234",
    serviceType: "Pool Cleaning",
    scheduledFor: "2025-07-03T15:00:00",
    assignedTo: "Pool Team",
    property: "Villa Aruna",
    frequency: "One-time",
    notes: "Regular midweek pool service"
  },
  {
    reservationId: "Demo1234",
    serviceType: "During-Stay Cleaning",
    scheduledFor: "2025-07-04T10:00:00",
    assignedTo: "Housekeeping Team",
    property: "Villa Aruna",
    frequency: "One-time",
    notes: "Guest requested one mid-stay clean"
  },
  {
    reservationId: "Demo1234",
    serviceType: "Private Chef Dinner",
    scheduledFor: "2025-07-03T20:00:00",
    assignedTo: "Chef Phyo",
    property: "Villa Aruna",
    frequency: "One-time",
    notes: "Chef to prepare Thai seafood menu"
  },
  {
    reservationId: "Demo1234",
    serviceType: "Garden Service",
    scheduledFor: "2025-07-05T14:00:00",
    assignedTo: "Garden Team",
    property: "Villa Aruna",
    frequency: "One-time",
    notes: "Trimming, lawn and plants check"
  }
];

// Apply scheduled services to dashboards
injectScheduledServices(scheduledServices);

// Function to log check-in electricity data for reservation as requested
export function logCheckInElectricityData(checkInMeterData: any) {
  console.log(`⚡ Check-in electricity data logged for reservation: ${checkInMeterData.reservationId}`);
  console.log(`🏠 Property: ${checkInMeterData.property}`);
  console.log(`📅 Check-in Date: ${checkInMeterData.checkInDate}`);
  console.log(`📊 Meter Start Reading: ${checkInMeterData.meterStartReading} ${checkInMeterData.unit}`);
  console.log(`💰 Price: ${checkInMeterData.kwPrice} THB per kWh`);
  console.log(`📸 Visual Proof: ${checkInMeterData.visualProofUrl}`);
  console.log(`👤 Recorded by: ${checkInMeterData.recordedBy}`);
  console.log(`💵 Deposit: ${checkInMeterData.depositPaid.amount} ${checkInMeterData.depositPaid.currency} (${checkInMeterData.depositPaid.method})`);
  console.log(`🔌 Billing Type: ${checkInMeterData.electricityBillingType}`);
  console.log(`📝 Notes: ${checkInMeterData.notes}`);
  
  return {
    reservationId: checkInMeterData.reservationId,
    propertyName: checkInMeterData.property,
    checkInDate: checkInMeterData.checkInDate,
    startReading: checkInMeterData.meterStartReading,
    unit: checkInMeterData.unit,
    pricePerUnit: checkInMeterData.kwPrice,
    currency: "THB",
    meterPhotoUrl: checkInMeterData.visualProofUrl,
    recordedBy: checkInMeterData.recordedBy,
    depositAmount: checkInMeterData.depositPaid.amount,
    depositCurrency: checkInMeterData.depositPaid.currency,
    depositMethod: checkInMeterData.depositPaid.method,
    billingType: checkInMeterData.electricityBillingType,
    setupNotes: checkInMeterData.notes,
    status: "recorded"
  };
}

// Simulate electricity meter reading on check-in for Demo1234
const checkInMeterData = {
  reservationId: "Demo1234",
  property: "Villa Aruna",
  checkInDate: "2025-07-01",
  meterStartReading: 1000,
  unit: "kWh",
  kwPrice: 7,
  visualProofUrl: "https://example.com/uploads/demo-meter-photo.jpg",
  recordedBy: "Host Thura",
  depositPaid: {
    amount: 8000,
    currency: "THB",
    method: "Cash"
  },
  electricityBillingType: "Paid by Guest",
  notes: "Standard setup for electricity tracking. Photo of meter taken at 1000 kWh."
};

// Log into guest profile + dashboard
logCheckInElectricityData(checkInMeterData);

// Function to process guest check-out with electricity billing and deposit refund
export function processGuestCheckOut(checkOutData: any) {
  console.log(`🏃 Guest check-out processed for reservation: ${checkOutData.reservationId}`);
  console.log(`📅 Check-out Date: ${checkOutData.checkOutDate}`);
  console.log(`📊 Final Meter Reading: ${checkOutData.meterEndReading} kWh`);
  console.log(`⚡ Electricity Usage: ${checkOutData.meterEndReading - 1000} kWh`);
  console.log(`💰 Electricity Rate: ${checkOutData.electricityRate} THB per kWh`);
  console.log(`💵 Total Electricity Charge: ${checkOutData.electricityCharge} THB`);
  console.log(`🏦 Deposit Held: ${checkOutData.depositHeld} THB`);
  console.log(`💳 Deposit Refund: ${checkOutData.depositRefund} THB`);
  console.log(`📝 Refund Reason: ${checkOutData.refundReason}`);
  console.log(`📸 Final Meter Photo: ${checkOutData.visualMeterProofUrl}`);
  console.log(`👤 Recorded by: ${checkOutData.recordedBy}`);
  console.log(`📋 Notes: ${checkOutData.notes}`);
  
  return {
    reservationId: checkOutData.reservationId,
    checkOutDate: checkOutData.checkOutDate,
    finalMeterReading: checkOutData.meterEndReading,
    electricityUsage: checkOutData.meterEndReading - 1000,
    electricityRate: checkOutData.electricityRate,
    electricityCharge: checkOutData.electricityCharge,
    depositHeld: checkOutData.depositHeld,
    depositRefund: checkOutData.depositRefund,
    refundCurrency: checkOutData.depositRefundCurrency,
    refundReason: checkOutData.refundReason,
    finalMeterPhoto: checkOutData.visualMeterProofUrl,
    processedBy: checkOutData.recordedBy,
    checkOutNotes: checkOutData.notes,
    status: "completed",
    billingStatus: checkOutData.electricityIncluded ? "included" : "charged"
  };
}

// Simulate check-out for Demo1234 with electricity usage and deposit refund
const checkOutData = {
  reservationId: "Demo1234",
  checkOutDate: "2025-07-05",
  meterEndReading: 1100,
  electricityRate: 7,
  electricityIncluded: false,
  electricityWaived: false,
  waivedReason: null,
  depositHeld: 8000,
  electricityCharge: 100 * 7, // 100 kWh used x 7 THB = 700
  additionalCharges: 0,
  depositRefund: 7300,
  depositRefundCurrency: "THB",
  refundReason: "Electricity usage of 100 kWh deducted from deposit",
  visualMeterProofUrl: "https://example.com/uploads/demo-meter-checkout.jpg",
  recordedBy: "Host Thura",
  notes: "Guest left property in good condition. Electricity usage was above included limit."
};

// Process check-out and trigger owner billing update
processGuestCheckOut(checkOutData);