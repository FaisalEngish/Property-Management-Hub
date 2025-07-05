export const DEMO_PM_DATA = {
  // Demo Portfolio Manager User
  portfolioManager: {
    id: "manager@test.com",
    email: "manager@test.com",
    role: "portfolio-manager",
    firstName: "Portfolio",
    lastName: "Manager",
    organizationId: "default-org"
  },

  // Demo Property assigned to Portfolio Manager
  demoProperty: {
    id: 999,
    name: "Villa Demo1234",
    address: "123 Demo Street, Samui, Thailand",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 250,
    currency: "USD",
    isActive: true,
    organizationId: "default-org",
    ownerId: "owner@demo.com",
    description: "Luxury 4-bedroom villa with private pool and ocean views",
    amenities: ["Pool", "WiFi", "Air Conditioning", "Kitchen", "Parking"],
    checkInTime: "15:00",
    checkOutTime: "11:00",
    coordinates: "9.5012, 100.0074",
    houseRules: "No smoking, No pets, Quiet hours 10PM-8AM",
    wifiPassword: "Demo1234Wifi",
    safeCode: "4567",
    emergencyContact: "+66 123 456 789"
  },

  // Portfolio Manager Assignment
  assignment: {
    id: 1,
    organizationId: "default-org",
    managerId: "manager@test.com",
    propertyId: 999,
    assignedBy: "admin@test.com",
    assignedAt: "2024-01-01",
    isActive: true
  },

  // Demo Financial Overview
  financialOverview: {
    totalCommissionEarnings: 15750.00,
    propertyBreakdown: [
      {
        propertyId: 999,
        propertyName: "Villa Demo1234",
        commissionEarned: 15750.00,
        bookingCount: 12,
        totalRevenue: 52500.00,
        commissionRate: 30
      }
    ],
    monthlyTrend: [
      { month: "Jan 2024", earnings: 2500.00, bookings: 2 },
      { month: "Feb 2024", earnings: 3250.00, bookings: 3 },
      { month: "Mar 2024", earnings: 2750.00, bookings: 2 },
      { month: "Apr 2024", earnings: 3500.00, bookings: 3 },
      { month: "May 2024", earnings: 1875.00, bookings: 1 },
      { month: "Jun 2024", earnings: 1875.00, bookings: 1 }
    ]
  },

  // Demo Task Logs
  taskLogs: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      taskType: "cleaning",
      title: "Post-checkout cleaning",
      description: "Deep clean villa after guest departure",
      assignedTo: "Cleaning Team",
      status: "completed",
      priority: "normal",
      scheduledDate: "2024-07-01",
      completedDate: "2024-07-01",
      completedBy: "pm@demo.com",
      notes: "Cleaned thoroughly, ready for next guest"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      taskType: "maintenance",
      title: "Pool maintenance",
      description: "Weekly pool cleaning and chemical balance",
      assignedTo: "Pool Service",
      status: "completed",
      priority: "normal",
      scheduledDate: "2024-07-02",
      completedDate: "2024-07-02",
      completedBy: "pool@service.com",
      notes: "Pool cleaned and balanced"
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      taskType: "inspection",
      title: "Pre-arrival inspection",
      description: "Check villa before guest check-in",
      assignedTo: "pm@demo.com",
      status: "pending",
      priority: "high",
      scheduledDate: "2024-07-05",
      completedDate: null,
      completedBy: null,
      notes: "Scheduled for tomorrow"
    }
  ],

  // Demo Notifications
  notifications: [
    {
      id: 1,
      title: "New Booking Confirmed",
      message: "Villa Demo1234 has a new booking for July 10-15",
      type: "booking",
      priority: "normal",
      isRead: false,
      createdAt: "2024-07-04T10:30:00Z",
      propertyId: 999
    },
    {
      id: 2,
      title: "Maintenance Required",
      message: "Air conditioning service due for Villa Demo1234",
      type: "maintenance",
      priority: "high",
      isRead: false,
      createdAt: "2024-07-03T14:15:00Z",
      propertyId: 999
    },
    {
      id: 3,
      title: "Commission Payment Processed",
      message: "Your June commission of $1,875 has been processed",
      type: "financial",
      priority: "normal",
      isRead: true,
      createdAt: "2024-07-01T09:00:00Z",
      propertyId: null
    }
  ],

  // Demo Invoices
  invoices: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      invoiceNumber: "INV-2024-001",
      ownerName: "Sarah Wilson",
      totalAmount: 2500.00,
      commissionAmount: 750.00,
      commissionRate: 30,
      period: "June 2024",
      status: "paid",
      dueDate: "2024-07-15",
      paidDate: "2024-07-10",
      currency: "USD"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      invoiceNumber: "INV-2024-002",
      ownerName: "Sarah Wilson",
      totalAmount: 3500.00,
      commissionAmount: 1050.00,
      commissionRate: 30,
      period: "July 2024",
      status: "pending",
      dueDate: "2024-08-15",
      paidDate: null,
      currency: "USD"
    }
  ],

  // Demo Balance
  balance: {
    currentBalance: 4250.00,
    pendingCommissions: 1050.00,
    totalEarned: 15750.00,
    lastPayoutAmount: 3500.00,
    lastPayoutDate: "2024-06-30",
    currency: "USD"
  },

  // Demo Documents
  documents: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      fileName: "Villa_Demo1234_Management_Contract.pdf",
      fileType: "contract",
      category: "Contracts",
      uploadedBy: "admin@test.com",
      uploadedAt: "2024-01-15",
      fileSize: "2.4 MB",
      accessLevel: "view",
      url: "/documents/villa-demo1234-contract.pdf"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      fileName: "House_Rules_Villa_Demo1234.pdf",
      fileType: "rules",
      category: "House Rules",
      uploadedBy: "pm@demo.com",
      uploadedAt: "2024-02-01",
      fileSize: "1.2 MB",
      accessLevel: "edit",
      url: "/documents/villa-demo1234-rules.pdf"
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      fileName: "Appliance_Manual_AC_System.pdf",
      fileType: "manual",
      category: "Manuals",
      uploadedBy: "maintenance@demo.com",
      uploadedAt: "2024-03-10",
      fileSize: "5.8 MB",
      accessLevel: "view",
      url: "/documents/villa-demo1234-ac-manual.pdf"
    }
  ],

  // Demo Maintenance Tasks
  maintenanceTasks: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      type: "AC",
      title: "AC System Service",
      description: "Annual AC system service and filter replacement",
      status: "scheduled",
      priority: "normal",
      scheduledDate: "2024-07-15",
      estimatedCost: 250.00,
      assignedTo: "AC Repair Co.",
      contactInfo: "+66 123 456 789",
      notes: "Schedule during vacancy period"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      type: "Pool",
      title: "Pool Equipment Check",
      description: "Monthly pool pump and filtration system inspection",
      status: "completed",
      priority: "normal",
      scheduledDate: "2024-07-01",
      completedDate: "2024-07-01",
      actualCost: 150.00,
      assignedTo: "Pool Service Pro",
      contactInfo: "+66 987 654 321",
      notes: "All equipment working properly"
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      type: "Garden",
      title: "Garden Maintenance",
      description: "Weekly garden maintenance and landscaping",
      status: "recurring",
      priority: "low",
      nextScheduledDate: "2024-07-08",
      estimatedCost: 100.00,
      assignedTo: "Green Thumb Gardens",
      contactInfo: "+66 555 777 888",
      notes: "Weekly service every Monday"
    }
  ],

  // Demo Service Timeline
  serviceTimeline: [
    {
      id: 1,
      propertyId: 999,
      serviceType: "Pest Control",
      lastServiceDate: "2024-06-15",
      nextDueDate: "2024-09-15",
      status: "current",
      provider: "Pest Away Co.",
      cost: 200.00,
      notes: "Quarterly pest control service"
    },
    {
      id: 2,
      propertyId: 999,
      serviceType: "AC Service",
      lastServiceDate: "2024-05-01",
      nextDueDate: "2024-07-15",
      status: "due_soon",
      provider: "AC Repair Co.",
      cost: 250.00,
      notes: "Overdue by 5 days - contact for appointment"
    },
    {
      id: 3,
      propertyId: 999,
      serviceType: "Pool Service",
      lastServiceDate: "2024-07-01",
      nextDueDate: "2024-08-01",
      status: "current",
      provider: "Pool Service Pro",
      cost: 150.00,
      notes: "Monthly pool maintenance"
    }
  ],

  // Demo property access data
  propertyAccess: {
    properties: [
      {
        id: 999,
        name: "Villa Demo1234",
        address: "123 Ocean View Drive, Samui, Thailand",
        assignedManager: "manager@test.com",
        lastUpdated: "2024-06-15",
        accessCodes: {
          wifi: {
            network: "Villa_Demo_5G",
            password: "OceanView2024!",
            lastUpdated: "2024-06-01"
          },
          safe: {
            code: "8851",
            location: "Master bedroom closet",
            lastUpdated: "2024-05-15"
          },
          gate: {
            code: "1234#",
            type: "Keypad entry",
            lastUpdated: "2024-06-10"
          },
          parking: {
            code: "9876*",
            spaces: "2 covered spaces",
            lastUpdated: "2024-06-10"
          }
        },
        contacts: {
          owner: {
            name: "John & Sarah Smith",
            email: "owners@villademo.com",
            phone: "+66 81 234 5678",
            emergencyContact: true
          },
          cleaner: {
            name: "Mai Cleaning Services",
            phone: "+66 89 876 5432",
            schedule: "Check-out days, 2PM"
          },
          maintenance: {
            name: "Villa Maintenance Co.",
            phone: "+66 82 345 6789",
            emergency: "+66 91 234 5678"
          },
          security: {
            name: "Island Security",
            phone: "+66 85 567 8901",
            available: "24/7"
          }
        },
        emergencyInfo: {
          police: "191",
          fire: "199", 
          medical: "1669",
          hospital: "Bangkok Hospital Samui: +66 77 429 500",
          electricity: "PEA Samui: +66 77 421 114"
        }
      }
    ]
  },

  // Demo documents data
  documents: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      name: "Villa Ownership Certificate",
      type: "Ownership Proof",
      description: "Official ownership documentation for Villa Demo1234",
      status: "approved",
      uploadedAt: "2024-06-15",
      fileSize: "2.4 MB",
      uploadedBy: "admin@test.com",
      approvedBy: "admin@test.com",
      url: "/documents/ownership_999.pdf"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      name: "Property Insurance Policy",
      type: "Insurance",
      description: "Current insurance policy covering property damage and liability",
      status: "approved",
      uploadedAt: "2024-06-10",
      fileSize: "1.8 MB",
      uploadedBy: "manager@test.com",
      approvedBy: "admin@test.com",
      url: "/documents/insurance_999.pdf"
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      name: "Rental License",
      type: "Rental License",
      description: "Government issued short-term rental license",
      status: "pending",
      uploadedAt: "2024-07-01",
      fileSize: "1.2 MB",
      uploadedBy: "manager@test.com",
      approvedBy: null,
      url: "/documents/license_999.pdf"
    },
    {
      id: 4,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      name: "Villa Floor Plan",
      type: "Floor Plan",
      description: "Detailed architectural floor plan with room layouts",
      status: "approved",
      uploadedAt: "2024-05-20",
      fileSize: "3.1 MB",
      uploadedBy: "admin@test.com",
      approvedBy: "admin@test.com",
      url: "/documents/floorplan_999.pdf"
    },
    {
      id: 5,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      name: "Safety Certificate",
      type: "Safety Certificate",
      description: "Fire safety and electrical safety certification",
      status: "approved",
      uploadedAt: "2024-06-25",
      fileSize: "890 KB",
      uploadedBy: "manager@test.com",
      approvedBy: "admin@test.com",
      url: "/documents/safety_999.pdf"
    }
  ],

  // Demo maintenance tasks
  maintenanceTasks: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      title: "AC System Check",
      description: "Regular maintenance check for main AC unit",
      category: "HVAC",
      priority: "normal",
      status: "pending",
      createdAt: "2024-07-01",
      dueDate: "2024-07-15",
      assignedTo: "maintenance@demo.com",
      estimatedCost: 150.00,
      actualCost: null,
      notes: "Annual maintenance check due"
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      title: "Pool Pump Repair",
      description: "Pool pump making unusual noise, needs inspection",
      category: "Pool",
      priority: "high",
      status: "in_progress",
      createdAt: "2024-06-25",
      dueDate: "2024-07-10",
      assignedTo: "maintenance@demo.com",
      estimatedCost: 300.00,
      actualCost: 275.00,
      notes: "Technician scheduled for July 8th"
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      title: "Garden Maintenance",
      description: "Quarterly garden maintenance and landscaping",
      category: "Landscaping",
      priority: "low",
      status: "completed",
      createdAt: "2024-06-01",
      dueDate: "2024-06-30",
      assignedTo: "garden@demo.com",
      estimatedCost: 200.00,
      actualCost: 180.00,
      notes: "Completed ahead of schedule"
    }
  ],

  // Demo invoices
  invoices: [
    {
      id: 1,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      invoiceNumber: "INV-2024-001",
      type: "Commission",
      amount: 1250.00,
      currency: "USD",
      status: "paid",
      dueDate: "2024-06-15",
      paidDate: "2024-06-10",
      description: "Commission for June 2024 bookings",
      items: [
        { description: "Booking commission (5 nights × $250)", amount: 1250.00 }
      ]
    },
    {
      id: 2,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      invoiceNumber: "INV-2024-002",
      type: "Maintenance",
      amount: 450.00,
      currency: "USD",
      status: "pending",
      dueDate: "2024-07-15",
      paidDate: null,
      description: "Property maintenance expenses",
      items: [
        { description: "Pool pump repair", amount: 275.00 },
        { description: "Garden maintenance", amount: 175.00 }
      ]
    },
    {
      id: 3,
      propertyId: 999,
      propertyName: "Villa Demo1234",
      invoiceNumber: "INV-2024-003",
      type: "Utilities",
      amount: 320.00,
      currency: "USD",
      status: "overdue",
      dueDate: "2024-06-30",
      paidDate: null,
      description: "Monthly utility bills",
      items: [
        { description: "Electricity", amount: 180.00 },
        { description: "Water", amount: 85.00 },
        { description: "Internet", amount: 55.00 }
      ]
    }
  ]
};

// Helper functions for demo data
export function getDemoPortfolioData(managerId: string) {
  if (managerId === "manager@test.com") {
    return DEMO_PM_DATA;
  }
  return null;
}

export function getDemoPropertyAccess(managerId: string, propertyId?: number) {
  const demoData = getDemoPortfolioData(managerId);
  if (!demoData) return [];
  
  if (propertyId && propertyId !== 999) return [];
  
  return [{
    ...demoData.demoProperty,
    ownerName: "Sarah Wilson",
    ownerEmail: "sarah.wilson@email.com",
    ownerPhone: "+1 555 123 4567",
    currentGuest: "John Smith",
    guestEmail: "john.smith@email.com",
    guestPhone: "+1 555 987 6543",
    checkInDate: "2024-07-05",
    checkOutDate: "2024-07-10",
    accessCodes: {
      wifi: "Demo1234Wifi",
      safe: "4567",
      gate: "1234",
      parking: "5678"
    }
  }];
}