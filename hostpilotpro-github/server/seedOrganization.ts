import { db } from "./db";
import { organizations, users, organizationApiKeys } from "@shared/schema";
import { DEFAULT_ORG_SETTINGS, ApiKeyManager } from "./multiTenant";
import { eq } from "drizzle-orm";

interface CreateOrganizationParams {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
  adminUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  apiKeys?: {
    provider: string;
    keyName: string;
    value: string;
    description?: string;
  }[];
}

export async function createOrganization(params: CreateOrganizationParams) {
  const {
    id,
    name,
    subdomain,
    domain = `${subdomain}.hostpilotpro.com`,
    subscriptionTier = 'basic',
    adminUser,
    apiKeys = []
  } = params;

  try {
    // Check if organization already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (existingOrg.length > 0) {
      console.log(`Organization ${id} already exists`);
      return existingOrg[0];
    }

    // Create organization
    const [organization] = await db
      .insert(organizations)
      .values({
        id,
        name,
        domain,
        subdomain,
        subscriptionTier,
        settings: {
          ...DEFAULT_ORG_SETTINGS,
          branding: {
            ...DEFAULT_ORG_SETTINGS.branding,
            companyName: name,
          }
        },
        maxUsers: subscriptionTier === 'basic' ? 10 : subscriptionTier === 'pro' ? 50 : 200,
        maxProperties: subscriptionTier === 'basic' ? 50 : subscriptionTier === 'pro' ? 200 : 1000,
        isActive: true,
      })
      .returning();

    console.log(`Created organization: ${organization.name} (${organization.id})`);

    // Create admin user if provided
    if (adminUser) {
      const [user] = await db
        .insert(users)
        .values({
          id: adminUser.id,
          organizationId: organization.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: 'admin',
          isActive: true,
        })
        .returning();

      console.log(`Created admin user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    // Add API keys if provided
    for (const apiKey of apiKeys) {
      const encryptedValue = ApiKeyManager.encrypt(apiKey.value);
      
      await db
        .insert(organizationApiKeys)
        .values({
          organizationId: organization.id,
          provider: apiKey.provider,
          keyName: apiKey.keyName,
          encryptedValue,
          description: apiKey.description || `${apiKey.provider} ${apiKey.keyName}`,
          isActive: true,
        });

      console.log(`Added API key: ${apiKey.provider}/${apiKey.keyName}`);
    }

    console.log(`Organization setup complete for: ${organization.name}`);
    return organization;

  } catch (error) {
    console.error(`Failed to create organization ${id}:`, error);
    throw error;
  }
}

// Demo organization seeder
export async function seedDemoOrganization() {
  console.log("Seeding demo organization...");
  
  return await createOrganization({
    id: 'demo',
    name: 'Demo Property Management',
    subdomain: 'demo',
    subscriptionTier: 'pro',
    adminUser: {
      id: 'demo-admin',
      email: 'admin@demo.hostpilotpro.com',
      firstName: 'Demo',
      lastName: 'Admin'
    },
    apiKeys: [
      {
        provider: 'hostaway',
        keyName: 'api_key',
        value: 'demo-hostaway-key',
        description: 'Hostaway API integration for demo'
      },
      {
        provider: 'stripe',
        keyName: 'secret_key',
        value: 'sk_test_demo_key',
        description: 'Stripe payment processing for demo'
      }
    ]
  });
}

// Production organization creator
export async function createProductionOrganization(
  companyName: string,
  subdomain: string,
  adminEmail: string,
  adminFirstName: string,
  adminLastName: string,
  tier: 'basic' | 'pro' | 'enterprise' = 'basic'
) {
  const orgId = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  return await createOrganization({
    id: orgId,
    name: companyName,
    subdomain: subdomain.toLowerCase(),
    subscriptionTier: tier,
    adminUser: {
      id: `${orgId}-admin`,
      email: adminEmail,
      firstName: adminFirstName,
      lastName: adminLastName,
    }
  });
}

// CLI script runner
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'demo':
      seedDemoOrganization()
        .then(() => {
          console.log("Demo organization seeded successfully");
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to seed demo organization:", error);
          process.exit(1);
        });
      break;
      
    case 'create':
      const [, , , name, subdomain, email, firstName, lastName, tier] = process.argv;
      
      if (!name || !subdomain || !email || !firstName || !lastName) {
        console.error("Usage: npm run seed:org create 'Company Name' subdomain admin@email.com FirstName LastName [basic|pro|enterprise]");
        process.exit(1);
      }
      
      createProductionOrganization(name, subdomain, email, firstName, lastName, tier as any)
        .then((org) => {
          console.log(`Organization created successfully: ${org.name}`);
          console.log(`Domain: ${org.domain}`);
          console.log(`Admin can log in at: https://${org.domain}/api/login`);
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to create organization:", error);
          process.exit(1);
        });
      break;
      
    default:
      console.log("Available commands:");
      console.log("  npm run seed:org demo");
      console.log("  npm run seed:org create 'Company Name' subdomain admin@email.com FirstName LastName [tier]");
      process.exit(1);
  }
}