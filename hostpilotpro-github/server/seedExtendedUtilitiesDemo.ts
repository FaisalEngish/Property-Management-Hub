import { ExtendedUtilitiesStorage } from "./extendedUtilitiesStorage";
import { storage } from "./storage";

export async function seedExtendedUtilitiesDemo(organizationId: string = "default-org") {
  const utilStorage = new ExtendedUtilitiesStorage(organizationId);
  
  try {
    console.log("🏠 Seeding Extended Utilities Management Demo Data...");

    // Get properties for Villa Aruna and other demo properties
    const properties = await storage.getProperties();
    const villaAruna = properties.find(p => p.name.includes("Villa Aruna") || p.name.includes("Aruna"));
    
    if (!villaAruna) {
      console.log("⚠️ Villa Aruna not found, skipping utilities demo data");
      return;
    }

    // ===== UTILITY MASTER SETUP FOR VILLA ARUNA =====
    
    // 1. Electricity (PEA) - Management Company pays
    const electricityUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "electricity",
      providerName: "PEA (Provincial Electricity Authority)",
      accountNumber: "41-2024-789012",
      whoPays: "management",
      whoPayssOtherExplanation: null,
      isActive: true,
    });

    // 2. Water (Local Water Authority) - Owner pays
    const waterUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "water",
      providerName: "Koh Samui Water Authority",
      accountNumber: "KS-0078-4591",
      whoPays: "owner",
      whoPayssOtherExplanation: null,
      isActive: true,
    });

    // 3. Internet (3BB) - Management Company pays
    const internetUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "internet",
      providerName: "3BB (Triple T Broadband)",
      accountNumber: "3BB-SM-012456",
      whoPays: "management",
      whoPayssOtherExplanation: null,
      isActive: true,
    });

    // 4. Pest Control (Local Service) - Owner pays
    const pestControlUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "pest_control",
      providerName: "Samui Pest Solutions",
      accountNumber: "SPS-VA-789",
      whoPays: "owner",
      whoPayssOtherExplanation: null,
      isActive: true,
    });

    // 5. Pool Maintenance (Service) - Management pays
    const poolUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "pool",
      providerName: "Tropical Pool Services",
      accountNumber: "TPS-2024-156",
      whoPays: "management",
      whoPayssOtherExplanation: null,
      isActive: true,
    });

    // 6. Garden Service (Landscape) - Split 50/50
    const gardenUtility = await utilStorage.createPropertyUtility({
      propertyId: villaAruna.id,
      utilityType: "garden",
      providerName: "Samui Landscape Pro",
      accountNumber: "SLP-VA-2024",
      whoPays: "other",
      whoPayssOtherExplanation: "50% Owner, 50% Management Company",
      isActive: true,
    });

    console.log("✅ Created 6 utility accounts for Villa Aruna");

    // ===== 6-MONTH BILL HISTORY =====

    const currentDate = new Date();
    const months = [
      { month: "2025-01", start: "2025-01-01", end: "2025-01-31", displayMonth: "January 2025" },
      { month: "2024-12", start: "2024-12-01", end: "2024-12-31", displayMonth: "December 2024" },
      { month: "2024-11", start: "2024-11-01", end: "2024-11-30", displayMonth: "November 2024" },
      { month: "2024-10", start: "2024-10-01", end: "2024-10-31", displayMonth: "October 2024" },
      { month: "2024-09", start: "2024-09-01", end: "2024-09-30", displayMonth: "September 2024" },
      { month: "2024-08", start: "2024-08-01", end: "2024-08-31", displayMonth: "August 2024" },
    ];

    // Create bills for each utility and month
    let billsCreated = 0;

    for (const monthData of months) {
      // Electricity bills (typically high in hot months)
      const electricityAmount = monthData.month === "2024-12" ? 4850 : // December (high season)
                               monthData.month === "2025-01" ? 5120 : // January (peak season)
                               monthData.month === "2024-11" ? 4200 : // November
                               monthData.month === "2024-10" ? 3800 : // October
                               monthData.month === "2024-09" ? 4100 : // September
                               3950; // August

      const electricityBill = await utilStorage.createUtilityBill({
        utilityMasterId: electricityUtility.id,
        propertyId: villaAruna.id,
        billingMonth: monthData.month,
        billingPeriodStart: monthData.start,
        billingPeriodEnd: monthData.end,
        amount: electricityAmount.toString(),
        currency: "THB",
        isPaid: monthData.month !== "2025-01", // January bill not paid yet
        paidDate: monthData.month !== "2025-01" ? new Date(monthData.end) : null,
        receiptUploaded: monthData.month !== "2025-01",
        receiptFileUrl: monthData.month !== "2025-01" ? `https://demo-receipts.s3.com/electricity-${monthData.month}-villa-aruna.pdf` : null,
        receiptFileName: monthData.month !== "2025-01" ? `PEA_Bill_${monthData.displayMonth}_Villa_Aruna.pdf` : null,
        dueDate: new Date(monthData.end),
        expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after month end
        isLate: monthData.month === "2025-01", // January bill is late
        lateReason: monthData.month === "2025-01" ? "Bill arrived 3 days later than expected" : null,
        uploadedBy: monthData.month !== "2025-01" ? "demo-admin" : null,
        uploadedAt: monthData.month !== "2025-01" ? new Date(monthData.end) : null,
        notes: monthData.month === "2024-12" ? "High usage during holiday season" : 
               monthData.month === "2025-01" ? "Pending upload - bill arrived late" : null,
      });
      billsCreated++;

      // Water bills (relatively stable)
      const waterAmount = Math.floor(Math.random() * 500) + 800; // 800-1300 THB range
      const waterBill = await utilStorage.createUtilityBill({
        utilityMasterId: waterUtility.id,
        propertyId: villaAruna.id,
        billingMonth: monthData.month,
        billingPeriodStart: monthData.start,
        billingPeriodEnd: monthData.end,
        amount: waterAmount.toString(),
        currency: "THB",
        isPaid: true,
        paidDate: new Date(monthData.end),
        receiptUploaded: true,
        receiptFileUrl: `https://demo-receipts.s3.com/water-${monthData.month}-villa-aruna.pdf`,
        receiptFileName: `Water_Bill_${monthData.displayMonth}_Villa_Aruna.pdf`,
        dueDate: new Date(monthData.end),
        expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after month end
        isLate: false,
        lateReason: null,
        uploadedBy: "demo-admin",
        uploadedAt: new Date(monthData.end),
        notes: "Stable water usage",
      });
      billsCreated++;

      // Internet bills (fixed monthly rate)
      const internetBill = await utilStorage.createUtilityBill({
        utilityMasterId: internetUtility.id,
        propertyId: villaAruna.id,
        billingMonth: monthData.month,
        billingPeriodStart: monthData.start,
        billingPeriodEnd: monthData.end,
        amount: "1590", // Fixed 1590 THB per month
        currency: "THB",
        isPaid: true,
        paidDate: new Date(monthData.end),
        receiptUploaded: true,
        receiptFileUrl: `https://demo-receipts.s3.com/internet-${monthData.month}-villa-aruna.pdf`,
        receiptFileName: `3BB_Bill_${monthData.displayMonth}_Villa_Aruna.pdf`,
        dueDate: new Date(monthData.end),
        expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after month end
        isLate: false,
        lateReason: null,
        uploadedBy: "demo-admin",
        uploadedAt: new Date(monthData.end),
        notes: "High-speed fiber package 500/500 Mbps",
      });
      billsCreated++;

      // Pool maintenance (every month)
      const poolAmount = 2800; // Fixed monthly pool maintenance
      if (monthData.month !== "2025-01") { // Skip January for demo variety
        const poolBill = await utilStorage.createUtilityBill({
          utilityMasterId: poolUtility.id,
          propertyId: villaAruna.id,
          billingMonth: monthData.month,
          billingPeriodStart: monthData.start,
          billingPeriodEnd: monthData.end,
          amount: poolAmount.toString(),
          currency: "THB",
          isPaid: true,
          paidDate: new Date(monthData.end),
          receiptUploaded: true,
          receiptFileUrl: `https://demo-receipts.s3.com/pool-${monthData.month}-villa-aruna.pdf`,
          receiptFileName: `Pool_Service_${monthData.displayMonth}_Villa_Aruna.pdf`,
          dueDate: new Date(monthData.end),
          expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day after month end
          isLate: false,
          lateReason: null,
          uploadedBy: "demo-admin",
          uploadedAt: new Date(monthData.end),
          notes: "Weekly cleaning, chemical balancing, equipment check",
        });
        billsCreated++;
      }

      // Pest control (quarterly)
      if (["2024-12", "2024-09"].includes(monthData.month)) {
        const pestBill = await utilStorage.createUtilityBill({
          utilityMasterId: pestControlUtility.id,
          propertyId: villaAruna.id,
          billingMonth: monthData.month,
          billingPeriodStart: monthData.start,
          billingPeriodEnd: monthData.end,
          amount: "1200",
          currency: "THB",
          isPaid: true,
          paidDate: new Date(monthData.end),
          receiptUploaded: true,
          receiptFileUrl: `https://demo-receipts.s3.com/pest-${monthData.month}-villa-aruna.pdf`,
          receiptFileName: `Pest_Control_${monthData.displayMonth}_Villa_Aruna.pdf`,
          dueDate: new Date(monthData.end),
          expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after month end
          isLate: false,
          lateReason: null,
          uploadedBy: "demo-admin",
          uploadedAt: new Date(monthData.end),
          notes: "Quarterly treatment - termites, ants, and general pest prevention",
        });
        billsCreated++;
      }

      // Garden service (monthly)
      if (monthData.month !== "2024-08") { // Skip August for demo variety
        const gardenBill = await utilStorage.createUtilityBill({
          utilityMasterId: gardenUtility.id,
          propertyId: villaAruna.id,
          billingMonth: monthData.month,
          billingPeriodStart: monthData.start,
          billingPeriodEnd: monthData.end,
          amount: "3500",
          currency: "THB",
          isPaid: monthData.month !== "2025-01",
          paidDate: monthData.month !== "2025-01" ? new Date(monthData.end) : null,
          receiptUploaded: monthData.month !== "2025-01",
          receiptFileUrl: monthData.month !== "2025-01" ? `https://demo-receipts.s3.com/garden-${monthData.month}-villa-aruna.pdf` : null,
          receiptFileName: monthData.month !== "2025-01" ? `Garden_Service_${monthData.displayMonth}_Villa_Aruna.pdf` : null,
          dueDate: new Date(monthData.end),
          expectedArrivalDate: new Date(new Date(monthData.end).getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days after month end
          isLate: monthData.month === "2025-01",
          lateReason: monthData.month === "2025-01" ? "Awaiting owner approval for January service" : null,
          uploadedBy: monthData.month !== "2025-01" ? "demo-admin" : null,
          uploadedAt: monthData.month !== "2025-01" ? new Date(monthData.end) : null,
          notes: monthData.month === "2025-01" ? "Pending owner confirmation for ongoing service" : "Lawn maintenance, tree trimming, plant care",
        });
        billsCreated++;
      }
    }

    console.log(`✅ Created ${billsCreated} utility bills across 6 months`);

    // ===== ACCESS PERMISSIONS SETUP =====
    
    // Set permissions for Owners on each utility
    const utilities = [electricityUtility, waterUtility, internetUtility, pestControlUtility, poolUtility, gardenUtility];
    
    for (const utility of utilities) {
      // Owner permissions - view only for management-paid utilities, full access for owner-paid utilities
      const ownerCanEdit = ["owner", "other"].includes(utility.whoPays);
      
      await utilStorage.createUtilityPermission({
        utilityMasterId: utility.id,
        userRole: "owner",
        canEditProviderInfo: ownerCanEdit,
        canEditAccountNumber: false, // Admin only
        canUploadBills: ownerCanEdit,
        canViewBills: true,
        canSetReminders: ownerCanEdit,
        canViewAccountNumber: false, // Show masked account numbers
        setBy: "demo-admin",
      });

      // Manager permissions - full access to everything
      await utilStorage.createUtilityPermission({
        utilityMasterId: utility.id,
        userRole: "manager",
        canEditProviderInfo: true,
        canEditAccountNumber: true,
        canUploadBills: true,
        canViewBills: true,
        canSetReminders: true,
        canViewAccountNumber: true,
        setBy: "demo-admin",
      });
    }

    console.log("✅ Created access permissions for Owner and Manager roles");

    // ===== AI PREDICTIONS =====
    
    // Generate AI predictions for electricity (shows pattern analysis)
    const electricityPrediction = await utilStorage.generateArrivalPrediction(electricityUtility.id);
    await utilStorage.createUtilityAiPrediction({
      utilityMasterId: electricityUtility.id,
      predictionType: "arrival_date",
      predictedDate: electricityPrediction.predictedDate,
      confidenceScore: electricityPrediction.confidenceScore.toString(),
      basedOnMonths: 6,
      averageArrivalDay: electricityPrediction.averageArrivalDay,
      notes: electricityPrediction.notes,
    });

    // Generate prediction for water utility
    const waterPrediction = await utilStorage.generateArrivalPrediction(waterUtility.id);
    await utilStorage.createUtilityAiPrediction({
      utilityMasterId: waterUtility.id,
      predictionType: "arrival_date",
      predictedDate: waterPrediction.predictedDate,
      confidenceScore: waterPrediction.confidenceScore.toString(),
      basedOnMonths: 6,
      averageArrivalDay: waterPrediction.averageArrivalDay,
      notes: waterPrediction.notes,
    });

    console.log("✅ Generated AI arrival predictions for utilities");

    // ===== NOTIFICATIONS SYSTEM =====
    
    // Create late payment alerts
    await utilStorage.createUtilityNotification({
      organizationId,
      utilityMasterId: electricityUtility.id,
      notificationType: "late_upload_alert",
      recipientRole: "admin",
      recipientUserId: "demo-admin",
      message: "Electricity bill for January 2025 is 3 days overdue. Expected arrival was January 5th.",
      severity: "high",
      isRead: false,
      sentAt: new Date(),
      actionRequired: true,
      actionTaken: false,
    });

    await utilStorage.createUtilityNotification({
      organizationId,
      utilityMasterId: gardenUtility.id,
      notificationType: "owner_reminder",
      recipientRole: "owner",
      recipientUserId: "demo-owner",
      message: "Garden service bill for January 2025 requires your approval before processing.",
      severity: "normal",
      isRead: false,
      sentAt: new Date(),
      actionRequired: true,
      actionTaken: false,
    });

    // Upcoming bill reminder
    await utilStorage.createUtilityNotification({
      organizationId,
      utilityMasterId: internetUtility.id,
      notificationType: "payment_due",
      recipientRole: "admin",
      recipientUserId: "demo-admin",
      message: "3BB Internet bill for February 2025 will be due in 5 days. Expected amount: 1,590 THB.",
      severity: "low",
      isRead: false,
      sentAt: new Date(),
      actionRequired: false,
      actionTaken: false,
    });

    console.log("✅ Created utility notifications for admin and owner");

    // ===== CREATE DEMO DATA FOR DEMO1234 AND DEMO1235 RESERVATIONS =====
    
    // Link electricity usage to Demo1234 reservation (John Doe, July 6-10)
    await utilStorage.createUtilityNotification({
      organizationId,
      utilityMasterId: electricityUtility.id,
      notificationType: "guest_usage_tracking",
      recipientRole: "admin",
      recipientUserId: "demo-admin",
      message: "High electricity usage detected during Demo1234 reservation (John Doe, July 6-10). Consider implementing energy-saving measures for future guests.",
      severity: "normal",
      isRead: true,
      readAt: new Date("2025-07-11"),
      sentAt: new Date("2025-07-10"),
      actionRequired: false,
      actionTaken: true,
      actionTakenBy: "demo-admin",
      actionTakenAt: new Date("2025-07-11"),
      actionNotes: "Added energy-saving tips to guest welcome package",
    });

    // Link water usage alert to Demo1235 reservation (Maria Smith, July 8-12)
    await utilStorage.createUtilityNotification({
      organizationId,
      utilityMasterId: waterUtility.id,
      notificationType: "guest_usage_tracking",
      recipientRole: "admin",
      recipientUserId: "demo-admin",
      message: "Pool refill required during Demo1235 reservation (Maria Smith, July 8-12) due to extended pool usage.",
      severity: "low",
      isRead: true,
      readAt: new Date("2025-07-13"),
      sentAt: new Date("2025-07-12"),
      actionRequired: false,
      actionTaken: true,
      actionTakenBy: "demo-admin",
      actionTakenAt: new Date("2025-07-13"),
      actionNotes: "Scheduled pool maintenance and water top-up",
    });

    console.log("✅ Created guest-specific utility tracking for Demo1234 and Demo1235");

    console.log("🎉 Extended Utilities Management Demo Data seeded successfully!");
    console.log(`📊 Summary:
    - 6 Utility accounts created for Villa Aruna
    - ${billsCreated} Bills across 6 months (Aug 2024 - Jan 2025)
    - 12 Access permission rules (Owner & Manager roles)
    - 2 AI arrival predictions
    - 5 Notifications (alerts, reminders, guest tracking)
    - Demo data linked to reservations Demo1234 & Demo1235
    `);

  } catch (error) {
    console.error("❌ Error seeding Extended Utilities demo data:", error);
    throw error;
  }
}