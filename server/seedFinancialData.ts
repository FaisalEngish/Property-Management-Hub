import { DatabaseStorage } from "./storage";

const storage = new DatabaseStorage();

export async function seedFinancialData() {
  try {
    console.log("Seeding financial toolkit demo data...");

    const organizationId = "default-org";
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Seed staff payroll records
    const staffPayrollData = [
      {
        organizationId,
        staffId: "demo-staff",
        payrollPeriod: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
        baseSalary: "25000.00",
        bonuses: "3000.00",
        deductions: "2500.00",
        grossPay: "28000.00",
        netPay: "25500.00",
        paymentStatus: "pending",
        currency: "THB",
        payrollNotes: "Monthly salary - Demo Staff",
        processedBy: "demo-admin",
      },
      {
        organizationId,
        staffId: "demo-staff",
        payrollPeriod: `${currentYear}-${(currentMonth - 1).toString().padStart(2, '0')}`,
        baseSalary: "25000.00",
        bonuses: "2000.00",
        deductions: "2500.00",
        grossPay: "27000.00",
        netPay: "24500.00",
        paymentStatus: "paid",
        currency: "THB",
        payrollNotes: "Monthly salary - Demo Staff",
        paymentDate: new Date(currentYear, currentMonth - 2, 28),
        paymentMethod: "bank_transfer",
        paymentReference: "PAY-STAFF-001",
        processedBy: "demo-admin",
      },
    ];

    for (const payroll of staffPayrollData) {
      await storage.createStaffPayrollRecord(payroll);
    }

    // Seed portfolio manager commissions
    const portfolioCommissions = [
      {
        organizationId,
        managerId: "demo-portfolio-manager",
        totalRevenue: "50000.00",
        commissionRate: "50.00",
        commissionAmount: "25000.00",
        totalProperties: 5,
        commissionPeriod: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
        payoutStatus: "pending",
        currency: "THB",
        commissionNotes: "Monthly commission - Portfolio Manager",
        processedBy: "demo-admin",
      },
      {
        organizationId,
        managerId: "demo-portfolio-manager",
        totalRevenue: "45000.00",
        commissionRate: "50.00",
        commissionAmount: "22500.00",
        totalProperties: 5,
        commissionPeriod: `${currentYear}-${(currentMonth - 1).toString().padStart(2, '0')}`,
        payoutStatus: "paid",
        currency: "THB",
        commissionNotes: "Monthly commission - Portfolio Manager",
        payoutDate: new Date(currentYear, currentMonth - 2, 25),
        invoiceNumber: "INV-PM-001",
        invoicePdfUrl: "/invoices/INV-PM-001.pdf",
        processedBy: "demo-admin",
      },
    ];

    for (const commission of portfolioCommissions) {
      await storage.createPortfolioManagerCommission(commission);
    }

    // Seed referral agent commission logs
    const referralCommissions = [
      {
        organizationId,
        agentId: "demo-referral-agent",
        propertyId: 1,
        propertyName: "Demo Villa Phuket",
        commissionAmount: "1500.00",
        managementFeeBase: "15000.00",
        commissionRate: "10.00",
        commissionMonth: currentMonth,
        commissionYear: currentYear,
        occupancyRate: "85.5",
        averageReviewScore: "4.8",
        bookingCount: 12,
        paymentStatus: "pending",
        currency: "THB",
        commissionNotes: "Monthly referral commission",
        processedBy: "demo-admin",
      },
      {
        organizationId,
        agentId: "demo-referral-agent",
        propertyId: 2,
        propertyName: "Demo Condo Bangkok",
        commissionAmount: "1200.00",
        managementFeeBase: "12000.00",
        commissionRate: "10.00",
        commissionMonth: currentMonth - 1,
        commissionYear: currentYear,
        occupancyRate: "78.2",
        averageReviewScore: "4.6",
        bookingCount: 8,
        paymentStatus: "paid",
        currency: "THB",
        commissionNotes: "Monthly referral commission",
        paymentDate: new Date(currentYear, currentMonth - 2, 20),
        paymentSlipUrl: "/payment-slips/RA-002.pdf",
        processedBy: "demo-admin",
      },
    ];

    for (const commission of referralCommissions) {
      await storage.createReferralAgentCommissionLog(commission);
    }

    // Seed universal invoices
    const universalInvoices = [
      {
        organizationId,
        invoiceNumber: "INV-2025-001",
        invoiceType: "commission",
        fromName: "HostPilot Pro",
        fromEmail: "admin@hostpilotpro.com",
        fromAddress: "123 Business Park, Bangkok, Thailand",
        toName: "Demo Portfolio Manager",
        toEmail: "pm@demo.com",
        toAddress: "456 Manager Street, Bangkok, Thailand",
        description: "Monthly portfolio management commission",
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: "25000.00",
        totalAmount: "25000.00",
        currency: "THB",
        status: "sent",
        paymentTerms: "Net 30",
        tags: ["commission", "portfolio-manager"],
        createdBy: "demo-admin",
      },
      {
        organizationId,
        invoiceNumber: "INV-2025-002",
        invoiceType: "service",
        fromName: "Demo Service Provider",
        fromEmail: "service@demo.com",
        fromAddress: "789 Service Street, Bangkok, Thailand",
        toName: "HostPilot Pro",
        toEmail: "admin@hostpilotpro.com",
        toAddress: "123 Business Park, Bangkok, Thailand",
        description: "Property maintenance services",
        invoiceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
        subtotal: "8500.00",
        totalAmount: "8500.00",
        currency: "THB",
        status: "paid",
        paymentTerms: "Net 30",
        tags: ["maintenance", "service"],
        createdBy: "demo-admin",
      },
    ];

    for (const invoice of universalInvoices) {
      const createdInvoice = await storage.createUniversalInvoice(invoice);
      
      // Add line items for the first invoice
      if (invoice.invoiceNumber === "INV-2025-001") {
        await storage.addInvoiceLineItems([
          {
            organizationId,
            invoiceId: createdInvoice.id,
            description: "Portfolio Management Commission - 5 Properties",
            quantity: "1.00",
            unitPrice: "25000.00",
            lineTotal: "25000.00",
            category: "commission",
          },
        ]);
      }
      
      // Add line items for the second invoice
      if (invoice.invoiceNumber === "INV-2025-002") {
        await storage.addInvoiceLineItems([
          {
            organizationId,
            invoiceId: createdInvoice.id,
            description: "Property cleaning service",
            quantity: "3.00",
            unitPrice: "1500.00",
            lineTotal: "4500.00",
            category: "cleaning",
          },
          {
            organizationId,
            invoiceId: createdInvoice.id,
            description: "Garden maintenance",
            quantity: "2.00",
            unitPrice: "2000.00",
            lineTotal: "4000.00",
            category: "maintenance",
          },
        ]);
      }
    }

    // Seed payment confirmations
    const paymentConfirmations = [
      {
        organizationId,
        paymentType: "staff_salary",
        referenceEntityType: "staff_payroll",
        referenceEntityId: 1,
        confirmationStatus: "confirmed",
        paymentSlipUrl: "/payment-slips/STAFF-001.pdf",
        uploadedBy: "demo-admin",
        confirmationNotes: "Bank transfer completed",
        confirmedBy: "demo-admin",
        confirmedDate: new Date(),
      },
      {
        organizationId,
        paymentType: "referral_commission",
        referenceEntityType: "referral_commission_log",
        referenceEntityId: 2,
        confirmationStatus: "pending",
        paymentSlipUrl: "/payment-slips/RA-002.pdf",
        uploadedBy: "demo-admin",
        confirmationNotes: "Awaiting bank confirmation",
      },
    ];

    for (const confirmation of paymentConfirmations) {
      await storage.createPaymentConfirmation(confirmation);
    }

    console.log("✅ Financial toolkit demo data seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding financial data:", error);
    throw error;
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFinancialData()
    .then(() => {
      console.log("Financial data seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Financial data seeding failed:", error);
      process.exit(1);
    });
}