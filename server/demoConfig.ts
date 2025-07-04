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

// Function to load Villa Aruna maintenance and utility history
export function loadVillaMaintenanceAndUtilities(villaArunaHistory: any) {
  console.log(`🏠 Loading maintenance & utilities for property: ${villaArunaHistory.propertyId}`);
  console.log(`📋 Reference reservation: ${villaArunaHistory.reservationRef}`);
  
  // Log maintenance history
  console.log(`🔧 Maintenance Log (${villaArunaHistory.maintenanceLog.length} entries):`);
  villaArunaHistory.maintenanceLog.forEach((entry: any, index: number) => {
    console.log(`   ${index + 1}. ${entry.type || entry.description}`);
    if (entry.lastService) console.log(`      📅 Last Service: ${entry.lastService}`);
    if (entry.nextDue) console.log(`      ⏰ Next Due: ${entry.nextDue}`);
    if (entry.date) console.log(`      📅 Date: ${entry.date}`);
    if (entry.technician) console.log(`      👨‍🔧 Technician: ${entry.technician}`);
    if (entry.provider) console.log(`      🏢 Provider: ${entry.provider}`);
    if (entry.resolvedBy) console.log(`      ✅ Resolved By: ${entry.resolvedBy}`);
    if (entry.cost) console.log(`      💰 Cost: ${entry.cost} THB (${entry.coveredBy})`);
    if (entry.notes) console.log(`      📝 Notes: ${entry.notes}`);
  });
  
  // Log utility bills
  console.log(`⚡ Utility Bills (${villaArunaHistory.utilityBills.length} accounts):`);
  villaArunaHistory.utilityBills.forEach((bill: any, index: number) => {
    console.log(`   ${index + 1}. ${bill.utility} (${bill.provider})`);
    console.log(`      🏦 Account: ${bill.accountNumber}`);
    console.log(`      📅 Period: ${bill.month}`);
    console.log(`      💰 Amount: ${bill.amount} THB`);
    console.log(`      📅 Due: ${bill.dueDate}`);
    console.log(`      📊 Status: ${bill.status}`);
    if (bill.receipt) console.log(`      📄 Receipt: ${bill.receipt}`);
  });
  
  return {
    propertyId: villaArunaHistory.propertyId,
    reservationRef: villaArunaHistory.reservationRef,
    maintenanceCount: villaArunaHistory.maintenanceLog.length,
    utilityCount: villaArunaHistory.utilityBills.length,
    totalUtilityCost: villaArunaHistory.utilityBills.reduce((sum: number, bill: any) => sum + bill.amount, 0),
    maintenanceCost: villaArunaHistory.maintenanceLog
      .filter((entry: any) => entry.cost)
      .reduce((sum: number, entry: any) => sum + entry.cost, 0),
    status: "loaded"
  };
}

// Villa Aruna maintenance & utility log for Demo1234 context
const villaArunaHistory = {
  propertyId: "villa-aruna",
  reservationRef: "Demo1234",
  maintenanceLog: [
    {
      type: "AC Service",
      lastService: "2025-06-01",
      nextDue: "2025-12-01",
      technician: "AC Team - Chai",
      notes: "Standard 6-month servicing"
    },
    {
      type: "Pest Control",
      lastService: "2025-06-15",
      nextDue: "2025-08-15",
      provider: "Samui PestCare",
      notes: "No cockroach activity detected"
    },
    {
      type: "Pool Pump Replacement",
      date: "2025-05-20",
      description: "Emergency replacement due to malfunction during guest stay",
      resolvedBy: "Technician - Nye",
      cost: 4500,
      coveredBy: "Owner"
    }
  ],
  utilityBills: [
    {
      utility: "Electricity",
      provider: "PEA",
      accountNumber: "987654321",
      month: "2025-06",
      amount: 2100,
      dueDate: "2025-07-17",
      status: "Pending Upload"
    },
    {
      utility: "Water",
      provider: "Local Waterworks",
      accountNumber: "123456789",
      month: "2025-06",
      amount: 380,
      dueDate: "2025-07-14",
      status: "Paid",
      receipt: "receipt_water_2025_06.pdf"
    },
    {
      utility: "Internet",
      provider: "AIS",
      accountNumber: "AIS-99288",
      month: "2025-06",
      amount: 699,
      dueDate: "2025-07-05",
      status: "Paid",
      receipt: "receipt_ais_2025_06.pdf"
    }
  ]
};

// Inject simulated data
loadVillaMaintenanceAndUtilities(villaArunaHistory);

// Function to setup utility notifications and alerts
export function setupUtilityNotifications(config: any) {
  console.log(`🔔 Setting up utility notifications for property: ${config.propertyId}`);
  console.log(`📋 Reference reservation: ${config.reservationRef}`);
  
  config.utilities.forEach((utility: any, index: number) => {
    console.log(`   ${index + 1}. ${utility.type} (${utility.provider})`);
    console.log(`      📅 Due Day: ${utility.dueDayOfMonth} of each month`);
    console.log(`      ⏰ Alert Trigger: ${utility.alertTriggerDays} days after due`);
    console.log(`      👥 Notify Roles: ${utility.notifyRoles.join(", ")}`);
    console.log(`      📤 Owner Upload: ${utility.ownerCanUpload ? "Enabled" : "Disabled"}`);
    console.log(`      🤖 AI Bill Reading: ${utility.aiAutoReadBillAmount ? "Enabled" : "Disabled"}`);
  });
  
  return {
    propertyId: config.propertyId,
    alertsConfigured: config.utilities.length,
    status: "active"
  };
}

// Function to setup guest departure survey
export function setupGuestSurvey(config: any) {
  console.log(`📝 Setting up guest survey for booking: ${config.bookingId}`);
  console.log(`👤 Guest: ${config.guestName}`);
  console.log(`🏠 Property: ${config.villa}`);
  console.log(`📊 Dashboard Display: ${config.showOnDashboard ? "Enabled" : "Disabled"}`);
  
  console.log(`📋 Survey Categories (${config.categories.length}):`);
  config.categories.forEach((category: string, index: number) => {
    console.log(`   ${index + 1}. ${category}`);
  });
  
  console.log(`⚠️ Internal Note: ${config.internalUseNote}`);
  console.log(`📧 Send Reminder: ${config.sendReminder ? "Yes" : "No"}`);
  console.log(`🎯 Feedback Target: ${config.feedbackTarget.join(", ")}`);
  
  return {
    bookingId: config.bookingId,
    categoriesCount: config.categories.length,
    targetRoles: config.feedbackTarget,
    status: "configured"
  };
}

// Function to enable property timeline tracking
export function enableTimelineTracking(config: any) {
  console.log(`📈 Enabling timeline tracking for property: ${config.propertyId}`);
  console.log(`👥 Visible to Roles: ${config.showToRoles.join(", ")}`);
  console.log(`📊 Dashboard Display: ${config.showOnPropertyDashboard ? "Enabled" : "Disabled"}`);
  
  console.log(`📋 Tracked Modules (${config.modules.length}):`);
  config.modules.forEach((module: string, index: number) => {
    console.log(`   ${index + 1}. ${module}`);
  });
  
  return {
    propertyId: config.propertyId,
    modulesTracked: config.modules.length,
    visibleRoles: config.showToRoles,
    status: "enabled"
  };
}

// AI Alerts & Owner Utility Confirmation Flow for Demo Property
setupUtilityNotifications({
  propertyId: "villa-aruna",
  reservationRef: "Demo1234",
  utilities: [
    {
      type: "Electricity",
      provider: "PEA",
      dueDayOfMonth: 17,
      alertTriggerDays: 3, // Alert admin/manager on day 20 if no bill uploaded
      notifyRoles: ["Admin", "PortfolioManager"],
      ownerCanUpload: true,
      aiAutoReadBillAmount: true
    },
    {
      type: "Water",
      provider: "Local Waterworks",
      dueDayOfMonth: 14,
      alertTriggerDays: 2,
      notifyRoles: ["Admin"],
      ownerCanUpload: true,
      aiAutoReadBillAmount: true
    },
    {
      type: "Internet",
      provider: "AIS",
      dueDayOfMonth: 5,
      alertTriggerDays: 2,
      notifyRoles: ["Admin", "Owner"],
      ownerCanUpload: true,
      aiAutoReadBillAmount: false
    }
  ]
});

// Guest Departure Survey Trigger (Demo1234)
setupGuestSurvey({
  bookingId: "Demo1234",
  guestName: "John Doe",
  villa: "Villa Aruna",
  showOnDashboard: true,
  categories: [
    "Check-In Process",
    "Cleanliness",
    "Property Condition",
    "Team Friendliness",
    "Location Satisfaction",
    "Service Accuracy",
    "Suggestions / Complaints"
  ],
  internalUseNote:
    "If score < 4 stars on any topic, trigger guest-relations follow-up before Airbnb review prompt.",
  sendReminder: true,
  feedbackTarget: ["Owner", "Manager", "Admin"]
});

// Property Timeline Logging Module (for Villa Aruna)
enableTimelineTracking({
  propertyId: "villa-aruna",
  showToRoles: ["Admin", "PortfolioManager", "Owner"],
  showOnPropertyDashboard: true,
  modules: [
    "Maintenance History",
    "Utility Payment Log",
    "Guest Check-In/Out Log",
    "Extra Services Timeline",
    "Deposit & Compensation Notes"
  ]
});

// Function to setup check-out wizard for host/manager roles
export function setupCheckOutWizard(config: any) {
  console.log(`🧙‍♂️ Setting up check-out wizard for property: ${config.propertyId}`);
  console.log(`📋 Booking ID: ${config.bookingId}`);
  console.log(`👥 Enabled for Roles: ${config.enabledForRoles.join(", ")}`);
  
  console.log(`📝 Wizard Steps (${config.steps.length}):`);
  config.steps.forEach((step: any, index: number) => {
    console.log(`   ${index + 1}. ${step.name}`);
    
    if (step.actions) {
      console.log(`      📋 Actions:`);
      step.actions.forEach((action: string, actionIndex: number) => {
        console.log(`         ${actionIndex + 1}. ${action}`);
      });
    }
    
    if (step.fields) {
      console.log(`      📊 Fields:`);
      step.fields.forEach((field: any, fieldIndex: number) => {
        console.log(`         ${fieldIndex + 1}. ${field.label}`);
        if (field.valueFrom) console.log(`            📍 Source: ${field.valueFrom}`);
        if (field.readonly) console.log(`            🔒 Read-only: ${field.readonly}`);
        if (field.required) console.log(`            ⚠️ Required: ${field.required}`);
        if (field.validation) console.log(`            ✅ Validation: ${field.validation}`);
      });
    }
    
    if (step.calculations) {
      console.log(`      🧮 Calculations:`);
      step.calculations.forEach((calc: any, calcIndex: number) => {
        console.log(`         ${calcIndex + 1}. ${calc.field}: ${calc.formula}`);
        if (calc.displayAs) console.log(`            💰 Display: ${calc.displayAs}`);
      });
    }
    
    if (step.confirmations) {
      console.log(`      ✅ Confirmations:`);
      step.confirmations.forEach((confirmation: string, confIndex: number) => {
        console.log(`         ${confIndex + 1}. ${confirmation}`);
      });
    }
  });
  
  return {
    propertyId: config.propertyId,
    bookingId: config.bookingId,
    stepsCount: config.steps.length,
    enabledRoles: config.enabledForRoles,
    status: "configured"
  };
}

// Check-Out Wizard for Scheduled Tasks (Used by Host/Manager)
setupCheckOutWizard({
  enabledForRoles: ["Host", "Manager", "Admin"],
  propertyId: "villa-aruna",
  bookingId: "Demo1234",
  steps: [
    {
      name: "Confirm Guest Departure",
      actions: [
        "Confirm all guests have vacated the villa",
        "Take a photo of passport page again (for legal compliance)"
      ]
    },
    {
      name: "Electricity Meter Capture",
      fields: [
        {
          label: "Check-In Meter (Auto Synced)",
          valueFrom: "GuestProfile.electricity.startReading", // 1000 kWh
          readonly: true
        },
        {
          label: "Check-Out Meter Reading",
          required: true,
          validation: "Must be >= check-in reading"
        },
        {
          label: "Meter Photo Evidence",
          required: true,
          type: "file_upload"
        }
      ],
      calculations: [
        {
          field: "Total Usage (kWh)",
          formula: "checkOutReading - checkInReading",
          displayAs: "100 kWh"
        },
        {
          field: "Electricity Cost",
          formula: "usage * ratePerKwh",
          displayAs: "700 THB (100 kWh × 7 THB/kWh)"
        }
      ]
    },
    {
      name: "Deposit Settlement",
      fields: [
        {
          label: "Original Deposit",
          valueFrom: "GuestProfile.deposit.amount", // 8000 THB
          readonly: true
        },
        {
          label: "Electricity Deduction",
          valueFrom: "calculated.electricityCost", // 700 THB
          readonly: true
        },
        {
          label: "Additional Damages/Costs",
          required: false,
          defaultValue: 0
        },
        {
          label: "Cleaning Fee Override",
          required: false,
          defaultValue: 0
        }
      ],
      calculations: [
        {
          field: "Total Deductions",
          formula: "electricityCost + damages + cleaningFee",
          displayAs: "700 THB"
        },
        {
          field: "Refund Amount",
          formula: "originalDeposit - totalDeductions",
          displayAs: "7,300 THB"
        }
      ]
    },
    {
      name: "Final Confirmations",
      confirmations: [
        "Guest has received deposit refund (if applicable)",
        "All villa keys have been returned",
        "Property condition documented with photos",
        "Guest departure logged in system timeline"
      ]
    }
  ]
});