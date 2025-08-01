import { db } from "./db";
import { propertyUtilityAccounts, utilityBills, utilityBillReminders } from "@shared/schema";

export async function seedUtilityData() {
  console.log("Seeding utility tracker data...");

  try {
    // Check if utility accounts already exist
    const existingAccounts = await db.select().from(propertyUtilityAccounts).limit(1);
    if (existingAccounts.length > 0) {
      console.log("Utility data already exists, skipping seed.");
      return;
    }

    // Get existing properties
    const properties = await db.query.properties.findMany();
    if (properties.length === 0) {
      console.log("No properties found, skipping utility seed.");
      return;
    }

    const organizationId = "demo-org-1";

    // Create utility accounts for each property
    const utilityAccounts = [];
    
    for (const property of properties) {
      // Electricity account
      const electricityAccount = await db.insert(propertyUtilityAccounts).values({
        organizationId,
        propertyId: property.id,
        utilityType: "electricity",
        provider: "PEA (Provincial Electricity Authority)",
        accountNumber: `EA${property.id}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        packageInfo: "Residential Standard Rate",
        expectedBillDay: 15,
        isActive: true,
      }).returning();
      utilityAccounts.push(electricityAccount[0]);

      // Water account
      const waterAccount = await db.insert(propertyUtilityAccounts).values({
        organizationId,
        propertyId: property.id,
        utilityType: "water",
        provider: "Water Authority",
        accountNumber: `WA${property.id}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        packageInfo: "Standard Water Supply",
        expectedBillDay: 20,
        isActive: true,
      }).returning();
      utilityAccounts.push(waterAccount[0]);

      // Internet account
      const internetAccount = await db.insert(propertyUtilityAccounts).values({
        organizationId,
        propertyId: property.id,
        utilityType: "internet",
        provider: "AIS",
        accountNumber: `INT${property.id}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        packageInfo: "AIS Fiber 100/50 Mbps",
        expectedBillDay: 5,
        isActive: true,
      }).returning();
      utilityAccounts.push(internetAccount[0]);

      // Gas account (for some properties)
      if (Math.random() > 0.5) {
        const gasAccount = await db.insert(propertyUtilityAccounts).values({
          organizationId,
          propertyId: property.id,
          utilityType: "gas",
          provider: "PTT Gas",
          accountNumber: `GAS${property.id}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          packageInfo: "Standard Gas Supply",
          expectedBillDay: 10,
          isActive: true,
        }).returning();
        utilityAccounts.push(gasAccount[0]);
      }
    }

    // Create sample utility bills
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).toISOString().slice(0, 7);

    const sampleBills = [];

    for (const account of utilityAccounts) {
      // Current month bill (pending)
      const currentBillAmount = getRandomBillAmount(account.utilityType);
      const currentBill = await db.insert(utilityBills).values({
        organizationId,
        propertyId: account.propertyId,
        utilityAccountId: account.id,
        type: account.utilityType,
        provider: account.provider,
        accountNumber: account.accountNumber,
        amount: currentBillAmount.toString(),
        currency: "THB",
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), account.expectedBillDay).toISOString().split('T')[0],
        billPeriodStart: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().split('T')[0],
        billPeriodEnd: new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString().split('T')[0],
        billingMonth: currentMonth,
        status: Math.random() > 0.3 ? "pending" : "uploaded",
        isRecurring: true,
        nextDueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, account.expectedBillDay).toISOString().split('T')[0],
        responsibleParty: Math.random() > 0.2 ? "owner" : "company",
        isOwnerBillable: true,
        notes: `${account.utilityType} bill for ${currentMonth}`,
      }).returning();
      sampleBills.push(currentBill[0]);

      // Last month bill (paid)
      const lastBillAmount = getRandomBillAmount(account.utilityType);
      const lastBill = await db.insert(utilityBills).values({
        organizationId,
        propertyId: account.propertyId,
        utilityAccountId: account.id,
        type: account.utilityType,
        provider: account.provider,
        accountNumber: account.accountNumber,
        amount: lastBillAmount.toString(),
        currency: "THB",
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, account.expectedBillDay).toISOString().split('T')[0],
        billPeriodStart: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1).toISOString().split('T')[0],
        billPeriodEnd: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0).toISOString().split('T')[0],
        billingMonth: lastMonth,
        status: "paid",
        isRecurring: true,
        responsibleParty: Math.random() > 0.2 ? "owner" : "company",
        isOwnerBillable: true,
        notes: `${account.utilityType} bill for ${lastMonth}`,
        uploadedBy: "demo-admin",
        uploadedAt: new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      }).returning();
      sampleBills.push(lastBill[0]);

      // Create some overdue bills for demonstration
      if (Math.random() > 0.7) {
        const overdueBillAmount = getRandomBillAmount(account.utilityType);
        const overdueBill = await db.insert(utilityBills).values({
          organizationId,
          propertyId: account.propertyId,
          utilityAccountId: account.id,
          type: account.utilityType,
          provider: account.provider,
          accountNumber: account.accountNumber,
          amount: overdueBillAmount.toString(),
          currency: "THB",
          dueDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
          billPeriodStart: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1).toISOString().split('T')[0],
          billPeriodEnd: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0).toISOString().split('T')[0],
          billingMonth: lastMonth,
          status: "overdue",
          isRecurring: true,
          responsibleParty: "owner",
          isOwnerBillable: true,
          notes: `Overdue ${account.utilityType} bill`,
        }).returning();
        sampleBills.push(overdueBill[0]);
      }
    }

    // Create some reminders for overdue bills
    const overdueBills = sampleBills.filter(bill => bill.status === "overdue");
    for (const overdueBill of overdueBills) {
      await db.insert(utilityBillReminders).values({
        organizationId,
        utilityBillId: overdueBill.id,
        reminderType: "overdue",
        sentTo: "demo-admin",
        reminderMessage: `Utility bill for ${overdueBill.type} is overdue. Amount: ฿${parseFloat(overdueBill.amount || "0").toLocaleString()}`,
        isRead: false,
      });
    }

    // Create some pending reminders
    const pendingBills = sampleBills.filter(bill => bill.status === "pending").slice(0, 2);
    for (const pendingBill of pendingBills) {
      await db.insert(utilityBillReminders).values({
        organizationId,
        utilityBillId: pendingBill.id,
        reminderType: "due_soon",
        sentTo: "demo-admin",
        reminderMessage: `${pendingBill.type} bill is due soon. Expected on ${pendingBill.dueDate}`,
        isRead: Math.random() > 0.5,
      });
    }

    console.log(`Seeded ${utilityAccounts.length} utility accounts, ${sampleBills.length} bills, and ${overdueBills.length + pendingBills.length} reminders`);
    
  } catch (error) {
    console.error("Error seeding utility data:", error);
  }
}

function getRandomBillAmount(utilityType: string): number {
  const ranges = {
    electricity: { min: 800, max: 2500 },   // THB
    water: { min: 200, max: 800 },          // THB  
    internet: { min: 590, max: 1200 },      // THB
    gas: { min: 300, max: 900 },            // THB
  };
  
  const range = ranges[utilityType as keyof typeof ranges] || { min: 100, max: 500 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}