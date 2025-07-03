import { db } from "./db";
import { invoiceTemplates, generatedInvoices, invoiceLineItems, invoiceBookingLinks, invoiceServiceLinks } from "@shared/schema";

export async function seedInvoiceData() {
  console.log("🧾 Seeding invoice data...");

  try {
    // Seed Invoice Templates
    const templates = [
      {
        organizationId: "demo-org",
        templateName: "Monthly Booking Commission",
        templateType: "booking_commission",
        defaultSender: "management",
        defaultReceiver: "owner",
        taxEnabled: true,
        taxRate: 10,
        headerText: "Monthly booking revenue and commission summary",
        footerText: "Payment due within 14 days. Thank you for your business.",
        isActive: true,
      },
      {
        organizationId: "demo-org",
        templateName: "Portfolio Manager Commission",
        templateType: "portfolio_manager",
        defaultSender: "management",
        defaultReceiver: "portfolio_manager",
        taxEnabled: false,
        taxRate: 0,
        headerText: "Portfolio management commission payment",
        footerText: "Commission based on 50% of management fees collected.",
        isActive: true,
      },
      {
        organizationId: "demo-org",
        templateName: "Service Fee Invoice",
        templateType: "service_fee",
        defaultSender: "management",
        defaultReceiver: "owner",
        taxEnabled: true,
        taxRate: 10,
        headerText: "Additional services and maintenance charges",
        footerText: "Services provided as per agreement.",
        isActive: true,
      },
      {
        organizationId: "demo-org",
        templateName: "Monthly Summary",
        templateType: "monthly_summary",
        defaultSender: "management",
        defaultReceiver: "owner",
        taxEnabled: true,
        taxRate: 10,
        headerText: "Comprehensive monthly property performance summary",
        footerText: "All amounts in AUD unless specified otherwise.",
        isActive: true,
      },
      {
        organizationId: "demo-org",
        templateName: "Expense Reimbursement",
        templateType: "expense_reimbursement",
        defaultSender: "owner",
        defaultReceiver: "management",
        taxEnabled: false,
        taxRate: 0,
        headerText: "Property expense reimbursement request",
        footerText: "Receipts attached for verification.",
        isActive: true,
      },
    ];

    console.log("📋 Creating invoice templates...");
    for (const template of templates) {
      await db.insert(invoiceTemplates).values(template).onConflictDoNothing();
    }

    // Generate sample invoices for the past 3 months
    const today = new Date();
    const sampleInvoices = [];
    
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const invoiceDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const periodStart = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
      const periodEnd = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0);
      
      // Owner Invoice
      const ownerInvoiceNumber = `INV-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(1000 + monthOffset).padStart(4, '0')}`;
      sampleInvoices.push({
        organizationId: "demo-org",
        invoiceNumber: ownerInvoiceNumber,
        templateId: 1, // Monthly Booking Commission template
        senderType: "management",
        senderId: "mgmt-1",
        senderName: "HostPilot Management",
        senderEmail: "management@hostpilot.com",
        receiverType: "owner",
        receiverId: "owner-1",
        receiverName: "John Property Owner",
        receiverEmail: "john@example.com",
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        dueDate: new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        subtotal: (8500 - (monthOffset * 1000)).toString(), // Decreasing revenue over months
        taxAmount: (850 - (monthOffset * 100)).toString(),
        totalAmount: (9350 - (monthOffset * 1100)).toString(),
        currency: "AUD",
        status: monthOffset === 0 ? "sent" : "paid",
        paymentStatus: monthOffset === 0 ? "unpaid" : "paid",
        paymentMethod: monthOffset === 0 ? null : "bank_transfer",
        paymentDate: monthOffset === 0 ? null : new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Monthly booking revenue summary for ${periodStart.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`,
        createdBy: "admin-1",
      });

      // Portfolio Manager Invoice
      const pmInvoiceNumber = `INV-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(2000 + monthOffset).padStart(4, '0')}`;
      sampleInvoices.push({
        organizationId: "demo-org",
        invoiceNumber: pmInvoiceNumber,
        templateId: 2, // Portfolio Manager Commission template
        senderType: "management",
        senderId: "mgmt-1",
        senderName: "HostPilot Management",
        senderEmail: "management@hostpilot.com",
        receiverType: "portfolio_manager",
        receiverId: "pm-1",
        receiverName: "Sarah Portfolio Manager",
        receiverEmail: "sarah@hostpilot.com",
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        dueDate: new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        subtotal: (1275 - (monthOffset * 150)).toString(), // 15% of booking revenue (50% of 30% management fee)
        taxAmount: "0",
        totalAmount: (1275 - (monthOffset * 150)).toString(),
        currency: "AUD",
        status: "paid",
        paymentStatus: "paid",
        paymentMethod: "bank_transfer",
        paymentDate: new Date(invoiceDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Portfolio management commission for ${periodStart.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`,
        createdBy: "admin-1",
      });
    }

    console.log("🧾 Creating sample invoices...");
    const createdInvoices = [];
    for (const invoice of sampleInvoices) {
      const [createdInvoice] = await db.insert(generatedInvoices).values(invoice).returning();
      createdInvoices.push(createdInvoice);
    }

    // Create line items for each invoice
    console.log("📝 Creating invoice line items...");
    for (let i = 0; i < createdInvoices.length; i++) {
      const invoice = createdInvoices[i];
      const monthOffset = Math.floor(i / 2); // Two invoices per month
      const isOwnerInvoice = invoice.receiverType === "owner";
      
      if (isOwnerInvoice) {
        // Owner invoice line items
        const bookingRevenue = 10000 - (monthOffset * 1000);
        const managementCommission = bookingRevenue * 0.30;
        const netAmount = bookingRevenue - managementCommission;

        // Booking revenue line item
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          itemType: "booking_revenue",
          description: "Accommodation Booking Revenue",
          quantity: "1",
          unitPrice: bookingRevenue.toString(),
          lineTotal: bookingRevenue.toString(),
          category: "revenue",
          subcategory: "accommodation",
        });

        // Management commission deduction
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          itemType: "commission",
          description: "Management Commission (30%)",
          quantity: "1",
          unitPrice: (-managementCommission).toString(),
          lineTotal: (-managementCommission).toString(),
          category: "commission",
          subcategory: "management_fee",
        });

        // Add-on services
        const addonAmount = 500 - (monthOffset * 50);
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          itemType: "addon_service",
          description: "Guest Add-on Services (Cleaning, Massage)",
          quantity: "1",
          unitPrice: addonAmount.toString(),
          lineTotal: addonAmount.toString(),
          category: "service",
          subcategory: "guest_services",
        });

        // Tax line item
        const taxAmount = (netAmount + addonAmount) * 0.10;
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          itemType: "tax",
          description: "GST (10%)",
          quantity: "1",
          unitPrice: taxAmount.toString(),
          lineTotal: taxAmount.toString(),
          category: "tax",
          isManualEntry: true,
        });

      } else {
        // Portfolio Manager invoice line items
        const commissionAmount = 1275 - (monthOffset * 150);
        
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          itemType: "commission",
          description: "Portfolio Management Commission (50% of management fees)",
          quantity: "1",
          unitPrice: commissionAmount.toString(),
          lineTotal: commissionAmount.toString(),
          category: "commission",
          subcategory: "portfolio_manager_share",
        });
      }
    }

    // Create booking links for owner invoices
    console.log("🔗 Creating booking links...");
    const ownerInvoices = createdInvoices.filter(inv => inv.receiverType === "owner");
    for (let i = 0; i < ownerInvoices.length; i++) {
      const invoice = ownerInvoices[i];
      const monthOffset = i;
      const bookingRevenue = 10000 - (monthOffset * 1000);
      
      // Create sample booking links
      for (let bookingIndex = 1; bookingIndex <= 3; bookingIndex++) {
        const bookingAmount = (bookingRevenue / 3);
        await db.insert(invoiceBookingLinks).values({
          invoiceId: invoice.id,
          bookingId: (bookingIndex + (monthOffset * 3)), // Simulated booking IDs
          bookingRevenue: bookingAmount.toString(),
          managementCommission: (bookingAmount * 0.30).toString(),
          portfolioManagerCommission: (bookingAmount * 0.15).toString(),
          ownerPayout: (bookingAmount * 0.70).toString(),
          addonServicesTotal: "0",
        });
      }
    }

    // Create service links for invoices with add-on services
    console.log("🛎️ Creating service links...");
    for (let i = 0; i < ownerInvoices.length; i++) {
      const invoice = ownerInvoices[i];
      const monthOffset = i;
      
      // Add cleaning service link
      await db.insert(invoiceServiceLinks).values({
        invoiceId: invoice.id,
        serviceBookingId: (100 + monthOffset * 10 + 1), // Simulated service booking ID
        serviceName: "Premium Cleaning Service",
        serviceAmount: (300 - (monthOffset * 30)).toString(),
        billingRoute: "owner_billable",
      });

      // Add massage service link
      await db.insert(invoiceServiceLinks).values({
        invoiceId: invoice.id,
        serviceBookingId: (100 + monthOffset * 10 + 2),
        serviceName: "In-Villa Massage",
        serviceAmount: (200 - (monthOffset * 20)).toString(),
        billingRoute: "owner_billable",
      });
    }

    console.log("✅ Invoice data seeded successfully!");
    
    // Print summary
    console.log(`📊 Created:`);
    console.log(`  - ${templates.length} invoice templates`);
    console.log(`  - ${sampleInvoices.length} sample invoices`);
    console.log(`  - Invoice line items and related data`);
    console.log(`  - Booking and service links`);

  } catch (error) {
    console.error("❌ Error seeding invoice data:", error);
    throw error;
  }
}

// Export individual functions for selective seeding
export async function seedInvoiceTemplates() {
  console.log("📋 Seeding invoice templates only...");
  
  const templates = [
    {
      organizationId: "demo-org",
      templateName: "Monthly Booking Commission",
      templateType: "booking_commission",
      defaultSender: "management",
      defaultReceiver: "owner",
      taxEnabled: true,
      taxRate: 10,
      headerText: "Monthly booking revenue and commission summary",
      footerText: "Payment due within 14 days. Thank you for your business.",
      isActive: true,
    },
    {
      organizationId: "demo-org",
      templateName: "Portfolio Manager Commission",
      templateType: "portfolio_manager",
      defaultSender: "management",
      defaultReceiver: "portfolio_manager",
      taxEnabled: false,
      taxRate: 0,
      headerText: "Portfolio management commission payment",
      footerText: "Commission based on 50% of management fees collected.",
      isActive: true,
    },
    {
      organizationId: "demo-org",
      templateName: "Service Fee Invoice",
      templateType: "service_fee",
      defaultSender: "management",
      defaultReceiver: "owner",
      taxEnabled: true,
      taxRate: 10,
      headerText: "Additional services and maintenance charges",
      footerText: "Services provided as per agreement.",
      isActive: true,
    },
    {
      organizationId: "demo-org",
      templateName: "Monthly Summary",
      templateType: "monthly_summary",
      defaultSender: "management",
      defaultReceiver: "owner",
      taxEnabled: true,
      taxRate: 10,
      headerText: "Comprehensive monthly property performance summary",
      footerText: "All amounts in AUD unless specified otherwise.",
      isActive: true,
    },
    {
      organizationId: "demo-org",
      templateName: "Expense Reimbursement",
      templateType: "expense_reimbursement",
      defaultSender: "owner",
      defaultReceiver: "management",
      taxEnabled: false,
      taxRate: 0,
      headerText: "Property expense reimbursement request",
      footerText: "Receipts attached for verification.",
      isActive: true,
    },
  ];

  for (const template of templates) {
    await db.insert(invoiceTemplates).values(template).onConflictDoNothing();
  }
  
  console.log(`✅ Created ${templates.length} invoice templates`);
}