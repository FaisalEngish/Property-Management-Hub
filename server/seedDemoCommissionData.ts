import { db } from "./db";
import { commissionLog, commissionInvoices, commissionInvoiceItems } from "@shared/schema";

export async function seedDemoCommissionData() {
  try {
    console.log("Seeding demo commission data...");

    // Check if commission data already exists
    const existingCommissions = await db.select().from(commissionLog).limit(1);
    if (existingCommissions.length > 0) {
      console.log("Commission data already exists, skipping seed.");
      return;
    }

    const organizationId = "default-org";
    const retailAgentId = "demo-agent";
    const referralAgentId = "demo-referral-agent";

    // Create sample commission log entries for retail agent
    const retailCommissions = [
      {
        organizationId,
        agentId: retailAgentId,
        agentType: "retail-agent" as const,
        propertyId: 1,
        bookingId: 1,
        referenceNumber: "BKG-001-2024",
        baseAmount: "15000.00",
        commissionRate: "10.0",
        commissionAmount: "1500.00",
        currency: "THB",
        status: "pending",
        commissionMonth: 12,
        commissionYear: 2024,
      },
      {
        organizationId,
        agentId: retailAgentId,
        agentType: "retail-agent" as const,
        propertyId: 2,
        bookingId: 2,
        referenceNumber: "BKG-002-2024",
        baseAmount: "12000.00",
        commissionRate: "8.5",
        commissionAmount: "1020.00",
        currency: "THB",
        status: "paid",
        commissionMonth: 11,
        commissionYear: 2024,
        processedBy: "demo-admin",
        processedAt: new Date("2024-11-15"),
      },
      {
        organizationId,
        agentId: retailAgentId,
        agentType: "retail-agent" as const,
        propertyId: 1,
        bookingId: 3,
        referenceNumber: "BKG-003-2024",
        baseAmount: "18000.00",
        commissionRate: "10.0",
        commissionAmount: "1800.00",
        currency: "THB",
        status: "pending",
        commissionMonth: 12,
        commissionYear: 2024,
      },
      {
        organizationId,
        agentId: retailAgentId,
        agentType: "retail-agent" as const,
        propertyId: 2,
        bookingId: 4,
        referenceNumber: "BKG-004-2024",
        baseAmount: "22000.00",
        commissionRate: "12.0",
        commissionAmount: "2640.00",
        currency: "THB",
        status: "paid",
        commissionMonth: 10,
        commissionYear: 2024,
        processedBy: "demo-admin",
        processedAt: new Date("2024-10-20"),
      },
    ];

    // Create sample commission log entries for referral agent
    const referralCommissions = [
      {
        organizationId,
        agentId: referralAgentId,
        agentType: "referral-agent" as const,
        propertyId: 1,
        referenceNumber: "REF-001-2024",
        baseAmount: "25000.00",
        commissionRate: "5.0",
        commissionAmount: "1250.00",
        currency: "THB",
        status: "pending",
        commissionMonth: 12,
        commissionYear: 2024,
      },
      {
        organizationId,
        agentId: referralAgentId,
        agentType: "referral-agent" as const,
        propertyId: 2,
        referenceNumber: "REF-002-2024",
        baseAmount: "30000.00",
        commissionRate: "6.0",
        commissionAmount: "1800.00",
        currency: "THB",
        status: "paid",
        commissionMonth: 11,
        commissionYear: 2024,
        processedBy: "demo-admin",
        processedAt: new Date("2024-11-25"),
      },
      {
        organizationId,
        agentId: referralAgentId,
        agentType: "referral-agent" as const,
        propertyId: 1,
        referenceNumber: "REF-003-2024",
        baseAmount: "20000.00",
        commissionRate: "5.5",
        commissionAmount: "1100.00",
        currency: "THB",
        status: "pending",
        commissionMonth: 12,
        commissionYear: 2024,
      },
    ];

    // Insert commission log entries
    for (const commission of [...retailCommissions, ...referralCommissions]) {
      await db.insert(commissionLog).values(commission);
    }

    // Create sample invoices
    const sampleInvoice = {
      organizationId,
      agentId: retailAgentId,
      agentType: "retail-agent" as const,
      invoiceNumber: "INV-RA-2411-001",
      invoiceDate: "2024-11-30",
      periodStart: "2024-11-01",
      periodEnd: "2024-11-30",
      totalCommissions: "1020.00",
      currency: "THB",
      description: "November 2024 commission payout",
      agentNotes: "Payment for booking commissions earned in November",
      status: "approved",
      submittedAt: new Date("2024-11-30"),
      approvedAt: new Date("2024-12-01"),
      approvedBy: "demo-admin",
      generatedBy: retailAgentId,
    };

    const [invoice] = await db.insert(commissionInvoices).values(sampleInvoice).returning();

    // Create invoice line item
    await db.insert(commissionInvoiceItems).values({
      organizationId,
      invoiceId: invoice.id,
      commissionLogId: 2, // Links to the paid retail commission
      description: "Commission for Luxury Villa Booking - BKG-002-2024",
      propertyName: "Luxury Villa Phuket",
      referenceNumber: "BKG-002-2024",
      commissionDate: "2024-11-15",
      commissionAmount: "1020.00",
    });

    console.log("Demo commission data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo commission data:", error);
  }
}