import { storage } from "./storage";

// Thailand default utility providers
const THAILAND_PROVIDERS = [
  // Internet Providers
  { utilityType: "internet", providerName: "True Online", country: "Thailand", isDefault: true, displayOrder: 1 },
  { utilityType: "internet", providerName: "3BB", country: "Thailand", isDefault: false, displayOrder: 2 },
  { utilityType: "internet", providerName: "NT", country: "Thailand", isDefault: false, displayOrder: 3 },
  { utilityType: "internet", providerName: "CAT Telecom", country: "Thailand", isDefault: false, displayOrder: 4 },
  { utilityType: "internet", providerName: "TOT", country: "Thailand", isDefault: false, displayOrder: 5 },
  { utilityType: "internet", providerName: "AIS Fibre", country: "Thailand", isDefault: false, displayOrder: 6 },
  
  // Electricity Providers
  { utilityType: "electricity", providerName: "PEA (Provincial Electricity Authority)", country: "Thailand", isDefault: true, displayOrder: 1 },
  { utilityType: "electricity", providerName: "MEA (Metropolitan Electricity Authority)", country: "Thailand", isDefault: false, displayOrder: 2 },
  
  // Water Providers
  { utilityType: "water", providerName: "Deepwell", country: "Thailand", isDefault: true, displayOrder: 1 },
  { utilityType: "water", providerName: "Government Water", country: "Thailand", isDefault: false, displayOrder: 2 },
  { utilityType: "water", providerName: "Private Water Company", country: "Thailand", isDefault: false, displayOrder: 3 },
  
  // Gas Providers  
  { utilityType: "gas", providerName: "PTT LPG", country: "Thailand", isDefault: true, displayOrder: 1 },
  { utilityType: "gas", providerName: "Shell Gas", country: "Thailand", isDefault: false, displayOrder: 2 },
  { utilityType: "gas", providerName: "Unique Gas", country: "Thailand", isDefault: false, displayOrder: 3 },
];

// Default custom expense categories for Thailand
const THAILAND_CUSTOM_CATEGORIES = [
  {
    categoryName: "Pest Control",
    description: "Monthly pest control and fumigation services",
    billingCycle: "monthly",
    defaultAmount: "800",
    currency: "THB",
    displayOrder: 1,
  },
  {
    categoryName: "Security Service",
    description: "Building security guard or monitoring service",
    billingCycle: "monthly", 
    defaultAmount: "2500",
    currency: "THB",
    displayOrder: 2,
  },
  {
    categoryName: "Maintenance Fee",
    description: "Condominium or building maintenance fees",
    billingCycle: "monthly",
    defaultAmount: "1500",
    currency: "THB",
    displayOrder: 3,
  },
  {
    categoryName: "Parking Fee",
    description: "Monthly parking space rental fee",
    billingCycle: "monthly",
    defaultAmount: "1000",
    currency: "THB",
    displayOrder: 4,
  },
  {
    categoryName: "Landscaping",
    description: "Garden maintenance and landscaping services",
    billingCycle: "monthly",
    defaultAmount: "1200",
    currency: "THB",
    displayOrder: 5,
  },
];

export async function seedThailandUtilityProviders(organizationId: string = "default-org") {
  try {
    console.log("Seeding Thailand utility providers...");
    
    // Check if providers already exist - but handle potential schema mismatch
    try {
      const existingProviders = await storage.getUtilityProviders(organizationId);
      if (existingProviders.length > 0) {
        console.log("Utility providers already exist, skipping seed.");
        return;
      }
    } catch (error) {
      // Table might not exist yet, continue with seeding
      console.log("Utility providers table not ready, continuing with seed:", error.message);
    }

    // Seed utility providers
    for (const provider of THAILAND_PROVIDERS) {
      await storage.createUtilityProvider({
        ...provider,
        organizationId,
        createdBy: "system-seed",
        isActive: true,
      });
    }

    // Check if custom categories already exist
    const existingCategories = await storage.getCustomExpenseCategories(organizationId);
    if (existingCategories.length > 0) {
      console.log("Custom expense categories already exist, skipping seed.");
      return;
    }

    // Seed custom expense categories
    for (const category of THAILAND_CUSTOM_CATEGORIES) {
      await storage.createCustomExpenseCategory({
        ...category,
        organizationId,
        createdBy: "system-seed",
        isRecurring: true,
        autoReminder: true,
        reminderDays: 5,
        isActive: true,
      });
    }

    console.log(`Seeded ${THAILAND_PROVIDERS.length} utility providers and ${THAILAND_CUSTOM_CATEGORIES.length} custom expense categories for Thailand`);
  } catch (error) {
    console.error("Error seeding Thailand utility providers:", error);
  }
}