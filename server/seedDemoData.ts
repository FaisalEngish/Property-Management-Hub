import { db } from "./db";
import { 
  users, 
  properties, 
  tasks, 
  bookings, 
  finances,
  addonServices,
  type InsertUser,
  type InsertProperty,
  type InsertTask,
  type InsertBooking,
  type InsertFinance,
  type InsertAddonService
} from "@shared/schema";
import { seedAiDemoData } from "./seedAiDemoData";
import { syncHostawayData } from "./hostaway";
import { seedGuestAddonServices } from "./seedGuestAddonServices";
import { storage } from "./storage";
import type { Request } from "express";

const DEMO_ORG_ID = 'demo';

export async function seedDemoData(): Promise<void> {
  console.log("Seeding comprehensive demo data...");
  
  try {
    // Create users: 3 owners, 4 staff, 2 agents
    console.log("Creating demo users...");
    
    // Owners
    const owners: InsertUser[] = [
      {
        id: 'owner-1',
        organizationId: DEMO_ORG_ID,
        email: 'sarah.mitchell@email.com',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        role: 'owner',
        phone: '+61 412 123 456',
        isActive: true,
      },
      {
        id: 'owner-2',
        organizationId: DEMO_ORG_ID,
        email: 'james.brown@email.com',
        firstName: 'James',
        lastName: 'Brown',
        role: 'owner',
        phone: '+61 423 234 567',
        isActive: true,
      },
      {
        id: 'owner-3',
        organizationId: DEMO_ORG_ID,
        email: 'maria.garcia@email.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'owner',
        phone: '+61 434 345 678',
        isActive: true,
      }
    ];
    
    // Staff
    const staff: InsertUser[] = [
      {
        id: 'staff-1',
        organizationId: DEMO_ORG_ID,
        email: 'alex.johnson@demo.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        role: 'staff',
        phone: '+61 445 456 789',
        isActive: true,
      },
      {
        id: 'staff-2',
        organizationId: DEMO_ORG_ID,
        email: 'emma.wilson@demo.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'staff',
        phone: '+61 456 567 890',
        isActive: true,
      },
      {
        id: 'staff-3',
        organizationId: DEMO_ORG_ID,
        email: 'michael.lee@demo.com',
        firstName: 'Michael',
        lastName: 'Lee',
        role: 'staff',
        phone: '+61 467 678 901',
        isActive: true,
      },
      {
        id: 'staff-4',
        organizationId: DEMO_ORG_ID,
        email: 'lisa.chen@demo.com',
        firstName: 'Lisa',
        lastName: 'Chen',
        role: 'staff',
        phone: '+61 478 789 012',
        isActive: true,
      }
    ];
    
    // Agents
    const agents: InsertUser[] = [
      {
        id: 'agent-1',
        organizationId: DEMO_ORG_ID,
        email: 'david.taylor@realestate.com',
        firstName: 'David',
        lastName: 'Taylor',
        role: 'retail-agent',
        phone: '+61 489 890 123',
        isActive: true,
      },
      {
        id: 'agent-2',
        organizationId: DEMO_ORG_ID,
        email: 'sophie.anderson@referrals.com',
        firstName: 'Sophie',
        lastName: 'Anderson',
        role: 'referral-agent',
        phone: '+61 490 901 234',
        isActive: true,
      }
    ];
    
    // Insert all users
    const allUsers = [...owners, ...staff, ...agents];
    await db.insert(users).values(allUsers);
    console.log(`Created ${allUsers.length} demo users`);
    
    // Create 5 properties (assigned to different owners)
    console.log("Creating demo properties...");
    
    const demoProperties: InsertProperty[] = [
      {
        organizationId: DEMO_ORG_ID,
        externalId: '1001',
        name: 'Sunset Villa Bondi',
        address: '123 Ocean View Drive, Bondi Beach, NSW 2026',
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        pricePerNight: 450,
        currency: 'AUD',
        status: 'active',
        ownerId: 'owner-1',
        description: 'Stunning beachfront villa with panoramic ocean views. Perfect for families and groups.',
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: '1002',
        name: 'City Penthouse Melbourne',
        address: '456 Collins Street, Melbourne, VIC 3000',
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 380,
        currency: 'AUD',
        status: 'active',
        ownerId: 'owner-1',
        description: 'Luxury penthouse in the heart of Melbourne CBD with skyline views.',
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: '1003',
        name: 'Harbour View Apartment',
        address: '789 Circular Quay, Sydney, NSW 2000',
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        pricePerNight: 320,
        currency: 'AUD',
        status: 'active',
        ownerId: 'owner-2',
        description: 'Modern apartment overlooking Sydney Harbour Bridge and Opera House.',
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: '1004',
        name: 'Byron Bay Beach House',
        address: '321 Beachfront Road, Byron Bay, NSW 2481',
        bedrooms: 5,
        bathrooms: 4,
        maxGuests: 10,
        pricePerNight: 520,
        currency: 'AUD',
        status: 'active',
        ownerId: 'owner-2',
        description: 'Spacious beach house steps from the sand. Ideal for large groups and events.',
      },
      {
        organizationId: DEMO_ORG_ID,
        externalId: '1005',
        name: 'Gold Coast High-Rise',
        address: '654 Surfers Paradise Blvd, Gold Coast, QLD 4217',
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 290,
        currency: 'AUD',
        status: 'active',
        ownerId: 'owner-3',
        description: 'Modern high-rise apartment with beach access and resort facilities.',
      }
    ];
    
    await db.insert(properties).values(demoProperties);
    console.log(`Created ${demoProperties.length} demo properties`);
    
    // Get property IDs for task assignment
    const createdProperties = await db.query.properties.findMany({
      where: (props, { eq }) => eq(props.organizationId, DEMO_ORG_ID)
    });
    
    // Create tasks for properties
    console.log("Creating demo tasks...");
    
    const demoTasks: InsertTask[] = [
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[0].id,
        title: 'Deep clean before guest arrival',
        description: 'Complete deep cleaning including windows, carpets, and bathrooms',
        type: 'cleaning',
        priority: 'high',
        status: 'pending',
        assigneeId: 'staff-1',
        dueDate: new Date('2025-01-14'),
        department: 'housekeeping',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[0].id,
        title: 'Check pool equipment',
        description: 'Test pool pump, heater, and chemical levels',
        type: 'maintenance',
        priority: 'medium',
        status: 'in_progress',
        assigneeId: 'staff-2',
        dueDate: new Date('2025-01-16'),
        department: 'maintenance',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[1].id,
        title: 'Replace air conditioning filter',
        description: 'Install new HEPA filter in main AC unit',
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        assigneeId: 'staff-3',
        dueDate: new Date('2025-01-20'),
        department: 'maintenance',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[2].id,
        title: 'Stock welcome amenities',
        description: 'Restock coffee, tea, toiletries, and welcome basket',
        type: 'maintenance',
        priority: 'low',
        status: 'completed',
        assigneeId: 'staff-4',
        dueDate: new Date('2025-01-10'),
        department: 'housekeeping',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[3].id,
        title: 'Garden maintenance',
        description: 'Trim hedges, water plants, clean outdoor furniture',
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        assigneeId: 'staff-1',
        dueDate: new Date('2025-01-18'),
        department: 'landscaping',
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[4].id,
        title: 'WiFi troubleshooting',
        description: 'Test internet connection and reset router if needed',
        type: 'maintenance',
        priority: 'high',
        status: 'in_progress',
        assigneeId: 'staff-2',
        dueDate: new Date('2025-01-15'),
        department: 'technical',
      }
    ];
    
    await db.insert(tasks).values(demoTasks);
    console.log(`Created ${demoTasks.length} demo tasks`);
    
    // Create addon services
    console.log("Creating addon services...");
    
    const addonServicesList: InsertAddonService[] = [
      {
        organizationId: DEMO_ORG_ID,
        name: 'Airport Transfer',
        description: 'Premium airport pickup and drop-off service',
        price: 80,
        currency: 'AUD',
        category: 'transport',
        isActive: true,
      },
      {
        organizationId: DEMO_ORG_ID,
        name: 'In-House Massage',
        description: 'Professional massage therapy in your accommodation',
        price: 150,
        currency: 'AUD',
        category: 'wellness',
        isActive: true,
      },
      {
        organizationId: DEMO_ORG_ID,
        name: 'Grocery Pre-Stocking',
        description: 'Pre-arrival grocery shopping and stocking service',
        price: 50,
        currency: 'AUD',
        category: 'convenience',
        isActive: true,
      },
      {
        organizationId: DEMO_ORG_ID,
        name: 'Private Chef Service',
        description: 'Personal chef for in-home dining experience',
        price: 300,
        currency: 'AUD',
        category: 'dining',
        isActive: true,
      },
      {
        organizationId: DEMO_ORG_ID,
        name: 'Pet Sitting',
        description: 'Professional pet care during your stay',
        price: 40,
        currency: 'AUD',
        category: 'pet-care',
        isActive: true,
      }
    ];
    
    await db.insert(addonServices).values(addonServicesList);
    console.log(`Created ${addonServicesList.length} addon services`);
    
    // Create manual finance records (commission examples)
    console.log("Creating demo finance records...");
    
    const demoFinances: InsertFinance[] = [
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[0].id,
        type: 'income',
        source: 'guest_payment',
        amount: 1200,
        currency: 'AUD',
        description: 'Direct booking payment - December stay',
        referenceNumber: 'DB-2024-001',
        processedBy: 'staff-1',
        date: new Date('2024-12-15'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[0].id,
        type: 'expense',
        source: 'company_expense',
        amount: 180,
        currency: 'AUD',
        description: 'Retail agent commission - December booking',
        referenceNumber: 'COMM-2024-001',
        processedBy: 'staff-1',
        date: new Date('2024-12-15'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[1].id,
        type: 'expense',
        source: 'owner_charge',
        amount: 250,
        currency: 'AUD',
        description: 'Property maintenance - AC service',
        referenceNumber: 'MAINT-2024-002',
        processedBy: 'staff-2',
        date: new Date('2024-12-20'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[2].id,
        type: 'income',
        source: 'complimentary',
        amount: 100,
        currency: 'AUD',
        description: 'Owner gift - Welcome basket upgrade',
        referenceNumber: 'GIFT-2024-001',
        processedBy: 'staff-3',
        date: new Date('2024-12-18'),
      },
      {
        organizationId: DEMO_ORG_ID,
        propertyId: createdProperties[3].id,
        type: 'expense',
        source: 'company_expense',
        amount: 75,
        currency: 'AUD',
        description: 'Marketing campaign - Google Ads',
        referenceNumber: 'MKT-2024-003',
        processedBy: 'agent-1',
        date: new Date('2024-12-22'),
      }
    ];
    
    await db.insert(finances).values(demoFinances);
    console.log(`Created ${demoFinances.length} demo finance records`);
    
    // Seed AI demo data
    await seedAiDemoData();
    
    // Seed Guest Add-On Services
    await seedGuestAddonServices(DEMO_ORG_ID);
    
    // Seed Local Emergency Contacts for Villa Aruna
    await storage.seedDemoLocalContacts(DEMO_ORG_ID);
    
    console.log("Demo data seeding completed successfully!");
    
    return;
    
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

// Mock request object for Hostaway sync
function createMockRequest(organizationId: string): Request {
  return {
    hostname: `${organizationId}.hostpilotpro.com`,
    headers: {
      host: `${organizationId}.hostpilotpro.com`
    }
  } as Request;
}

export async function seedHostawayData(): Promise<void> {
  console.log("Syncing Hostaway demo data...");
  
  try {
    const mockReq = createMockRequest(DEMO_ORG_ID);
    
    // Use demo admin as the sync user
    const syncResult = await syncHostawayData(mockReq, 'demo-admin');
    
    console.log(`Hostaway sync completed:
      - Properties synced: ${syncResult.propertiesSync}
      - Bookings synced: ${syncResult.bookingsSync}
      - Finance records created: ${syncResult.financesSync}`);
    
  } catch (error) {
    console.error('Error syncing Hostaway data:', error);
    throw error;
  }
}

// CLI script runner
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'all':
      Promise.all([
        seedDemoData(),
        seedHostawayData()
      ])
        .then(() => {
          console.log("Complete demo data seeded successfully");
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to seed demo data:", error);
          process.exit(1);
        });
      break;
      
    case 'users':
      seedDemoData()
        .then(() => {
          console.log("Demo users and properties seeded successfully");
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to seed demo data:", error);
          process.exit(1);
        });
      break;
      
    case 'hostaway':
      seedHostawayData()
        .then(() => {
          console.log("Hostaway data synced successfully");
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to sync Hostaway data:", error);
          process.exit(1);
        });
      break;
      
    default:
      console.log("Available commands:");
      console.log("  npm run seed:demo all     - Seed all demo data");
      console.log("  npm run seed:demo users   - Seed users and properties only");
      console.log("  npm run seed:demo hostaway - Sync Hostaway data only");
      process.exit(1);
  }
}