import { storage } from "./storage";
import { hashPassword } from "./secureAuth";

export async function seedProductionAdmin() {
  const adminEmail = "admin@test.com";
  const adminPassword = "admin123";
  const adminId = "prod-admin-001";
  
  console.log("🔐 Checking for production admin user...");
  
  try {
    // Check if admin already exists by email
    const existingUser = await storage.getUserByEmail(adminEmail);
    
    if (existingUser) {
      console.log("✅ Production admin user already exists");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      
      // Verify password is set correctly (re-hash if needed)
      if (!existingUser.password || existingUser.password.length < 10) {
        console.log("⚠️ Admin password needs to be reset, updating...");
        const hashedPassword = await hashPassword(adminPassword);
        await storage.upsertUser({
          ...existingUser,
          password: hashedPassword,
        });
        console.log("✅ Admin password updated");
      }
      return;
    }
    
    // Create new admin user
    console.log("📝 Creating production admin user...");
    const hashedPassword = await hashPassword(adminPassword);
    
    await storage.upsertUser({
      id: adminId,
      email: adminEmail,
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      role: "admin",
      primaryRole: "admin",
      organizationId: "default-org",
      profileImageUrl: null,
      isActive: true,
    });
    
    // Verify creation
    const verifyUser = await storage.getUserByEmail(adminEmail);
    if (verifyUser) {
      console.log("✅ Production admin user created successfully");
      console.log("   ┌──────────────────────────────────────");
      console.log("   │ Email: admin@test.com");
      console.log("   │ Password: admin123");
      console.log("   │ Role: admin");
      console.log("   └──────────────────────────────────────");
    } else {
      console.error("❌ Failed to verify admin user creation");
    }
  } catch (error) {
    console.error("❌ Failed to seed production admin:", error);
  }
}
