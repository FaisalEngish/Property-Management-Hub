import { db } from "./db";
import { eq } from "drizzle-orm";
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

const DEMO_ORG_ID = 'default-org';

export async function seedDemoData(): Promise<void> {
  console.log("Seeding demo data (users, tasks, bookings) - properties handled separately...");
  
  try {
    // Skip property creation - handled by standardDemoProperties.ts
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
    
    // Insert all users with conflict handling
    const allUsers = [...owners, ...staff, ...agents];
    for (const user of allUsers) {
      await db.insert(users).values(user).onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isActive: user.isActive
        }
      });
    }
    console.log(`Created/updated ${allUsers.length} demo users`);
    
    // Properties are handled by standardDemoProperties.ts - skip property creation here
    console.log("Skipping property creation - using standardized DEMO properties...");
    
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
        category: 'booking-payment',
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
        category: 'commission',
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
        category: 'maintenance',
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
        category: 'add-on-service',
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
        category: 'commission',
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
    
    // Skip Guest Add-On Services for now to prevent conflicts
    // await seedGuestAddonServices(DEMO_ORG_ID);
    
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

// CLI script runner (disabled to avoid ES module issues)
if (false && require.main === module) {
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