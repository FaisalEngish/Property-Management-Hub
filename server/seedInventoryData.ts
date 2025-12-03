import { db } from "./db";
import { inventoryItems, inventoryUsageLogs } from "@shared/schema";

// Demo inventory items for different categories
const DEMO_INVENTORY_ITEMS = [
  // Linens Category
  {
    organizationId: "default-org",
    itemName: "Bath Towel",
    itemType: "linens", 
    unit: "piece",
    defaultPrice: "150.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Bed Sheet Set",
    itemType: "linens",
    unit: "set", 
    defaultPrice: "350.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Pillow Case",
    itemType: "linens",
    unit: "piece",
    defaultPrice: "75.00", 
    isActive: true
  },

  // Cleaning Supplies Category
  {
    organizationId: "default-org",
    itemName: "All-Purpose Cleaner",
    itemType: "cleaning-supplies",
    unit: "bottle",
    defaultPrice: "85.00",
    isActive: true
  },
  {
    organizationId: "default-org", 
    itemName: "Toilet Paper",
    itemType: "cleaning-supplies",
    unit: "roll",
    defaultPrice: "15.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Glass Cleaner",
    itemType: "cleaning-supplies", 
    unit: "bottle",
    defaultPrice: "65.00",
    isActive: true
  },

  // Toiletries Category  
  {
    organizationId: "default-org",
    itemName: "Shampoo",
    itemType: "toiletries",
    unit: "bottle",
    defaultPrice: "120.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Body Soap",
    itemType: "toiletries", 
    unit: "bar",
    defaultPrice: "45.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Toothbrush",
    itemType: "toiletries",
    unit: "piece", 
    defaultPrice: "25.00",
    isActive: true
  },

  // Food & Beverage Category
  {
    organizationId: "default-org",
    itemName: "Welcome Water Bottle",
    itemType: "food-beverage",
    unit: "bottle",
    defaultPrice: "35.00", 
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Coffee Capsules",
    itemType: "food-beverage",
    unit: "pack",
    defaultPrice: "180.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Welcome Fruit Basket", 
    itemType: "food-beverage",
    unit: "basket",
    defaultPrice: "450.00",
    isActive: true
  },

  // Maintenance Category
  {
    organizationId: "default-org",
    itemName: "Light Bulb LED",
    itemType: "maintenance",
    unit: "piece",
    defaultPrice: "120.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Pool Chlorine", 
    itemType: "maintenance",
    unit: "kg",
    defaultPrice: "380.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "Air Filter",
    itemType: "maintenance",
    unit: "piece", 
    defaultPrice: "250.00",
    isActive: true
  },

  // Electronics Category
  {
    organizationId: "default-org",
    itemName: "TV Remote Battery",
    itemType: "electronics",
    unit: "pack",
    defaultPrice: "85.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "WiFi Router",
    itemType: "electronics", 
    unit: "unit",
    defaultPrice: "2500.00",
    isActive: true
  },

  // Welcome Packs Category  
  {
    organizationId: "default-org",
    itemName: "Standard Welcome Pack",
    itemType: "welcome-packs",
    unit: "pack",
    defaultPrice: "750.00",
    isActive: true
  },
  {
    organizationId: "default-org",
    itemName: "VIP Welcome Pack",
    itemType: "welcome-packs", 
    unit: "pack",
    defaultPrice: "1500.00",
    isActive: true
  }
];

// Demo usage logs for different scenarios
const DEMO_USAGE_LOGS = [
  // Recent checkout cleaning at Property
  {
    organizationId: "default-org",
    taskId: 1, // Cleaning task
    propertyId: 1, // Property
    itemId: 1, // Bath Towel
    quantityUsed: 4,
    costTotal: "600.00", // 4 × 150
    usedBy: "demo-staff",
    usageType: "checkout-clean"
  },
  {
    organizationId: "default-org", 
    taskId: 1,
    propertyId: 1,
    itemId: 2, // Bed Sheet Set
    quantityUsed: 2,
    costTotal: "700.00", // 2 × 350
    usedBy: "demo-staff",
    usageType: "checkout-clean"
  },
  {
    organizationId: "default-org",
    taskId: 1, 
    propertyId: 1,
    itemId: 4, // All-Purpose Cleaner
    quantityUsed: 1,
    costTotal: "85.00",
    usedBy: "demo-staff",
    usageType: "checkout-clean"
  },

  // Maintenance work at Property
  {
    organizationId: "default-org",
    taskId: 2, // Maintenance task
    propertyId: 2, // Property  
    itemId: 13, // Light Bulb LED
    quantityUsed: 3,
    costTotal: "360.00", // 3 × 120
    usedBy: "demo-staff",
    usageType: "maintenance"
  },
  {
    organizationId: "default-org",
    taskId: 2,
    propertyId: 2,
    itemId: 14, // Pool Chlorine
    quantityUsed: 2,
    costTotal: "760.00", // 2 × 380
    usedBy: "demo-staff", 
    usageType: "maintenance"
  },

  // Guest amenity at Property
  {
    organizationId: "default-org",
    taskId: null, // Not linked to a task
    propertyId: 3, // Property
    itemId: 10, // Welcome Water Bottle
    quantityUsed: 6,
    costTotal: "210.00", // 6 × 35
    usedBy: "demo-staff",
    usageType: "guest-amenity"
  },
  {
    organizationId: "default-org",
    taskId: null,
    propertyId: 3,
    itemId: 18, // Standard Welcome Pack
    quantityUsed: 1,
    costTotal: "750.00",
    usedBy: "demo-staff",
    usageType: "welcome-pack"
  },

  // Emergency repair at Property
  {
    organizationId: "default-org",
    taskId: 3, // Emergency repair task
    propertyId: 4, // Property
    itemId: 17, // WiFi Router
    quantityUsed: 1,
    costTotal: "2500.00",
    usedBy: "demo-staff", 
    usageType: "emergency"
  }
];

export async function seedInventoryData() {
  try {
    console.log("Seeding inventory data...");

    // Check if inventory items already exist
    const existingItems = await db.select().from(inventoryItems).limit(1);
    
    if (existingItems.length > 0) {
      console.log("Inventory data already exists, skipping seed.");
      return;
    }

    // Insert inventory items
    console.log("Inserting demo inventory items...");
    await db.insert(inventoryItems).values(DEMO_INVENTORY_ITEMS);

    // Insert usage logs 
    console.log("Inserting demo usage logs...");
    await db.insert(inventoryUsageLogs).values(DEMO_USAGE_LOGS);

    console.log("✅ Inventory data seeded successfully!");
    console.log(`- Created ${DEMO_INVENTORY_ITEMS.length} inventory items`);
    console.log(`- Created ${DEMO_USAGE_LOGS.length} usage log entries`);

  } catch (error) {
    console.error("❌ Error seeding inventory data:", error);
  }
}