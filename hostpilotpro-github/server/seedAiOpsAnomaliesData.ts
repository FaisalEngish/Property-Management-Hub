import { db } from "./db";
import { aiOpsAnomalies } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedAiOpsAnomaliesData() {
  try {
    console.log("Seeding AI Operations Anomalies demo data...");

    // Check if data already exists
    const existingAnomalies = await db.select().from(aiOpsAnomalies).limit(1);
    if (existingAnomalies.length > 0) {
      console.log("AI Ops Anomalies data already exists, skipping seed.");
      return;
    }

    const anomaliesSample = [
      {
        organizationId: "default-org",
        propertyId: 17, // Villa Samui Breeze
        anomalyType: "missing-task",
        severity: "high",
        status: "resolved",
        details: {
          description: "Pool cleaning task missing for Villa Samui Breeze",
          expectedTask: "Pool cleaning and chemical balance check",
          lastCompleted: "2025-01-20",
          daysOverdue: 5,
          recommendations: ["Schedule immediate pool cleaning", "Set up recurring weekly maintenance"],
          affectedAreas: ["pool", "water quality"]
        },
        autoFixed: true,
        fixAction: "Automatically created pool cleaning task for today with high priority",
        detectedAt: new Date("2025-01-25T08:30:00Z"),
        resolvedAt: new Date("2025-01-25T08:35:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organizationId: "default-org",
        propertyId: 18, // Villa Ocean View
        anomalyType: "payout-mismatch",
        severity: "critical",
        status: "open",
        details: {
          description: "Owner payout calculation mismatch detected",
          expectedPayout: 45000,
          actualPayout: 42500,
          discrepancy: 2500,
          currency: "THB",
          bookingId: "BK-2025-001",
          month: "January 2025",
          recommendations: ["Review commission calculations", "Verify OTA fees", "Check for missing charges"]
        },
        autoFixed: false,
        detectedAt: new Date("2025-01-25T10:15:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organizationId: "default-org",
        propertyId: 19, // Villa Aruna Demo
        anomalyType: "overdue-maintenance",
        severity: "medium",
        status: "in-progress",
        details: {
          description: "HVAC system maintenance overdue by 12 days",
          maintenanceType: "HVAC Annual Service",
          lastService: "2024-01-10",
          nextDue: "2025-01-10",
          daysOverdue: 12,
          priority: "medium",
          estimatedCost: 8500,
          recommendations: ["Schedule HVAC technician visit", "Check air filters", "Inspect cooling efficiency"]
        },
        autoFixed: true,
        fixAction: "Created maintenance task and contacted preferred HVAC vendor",
        detectedAt: new Date("2025-01-22T14:20:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organizationId: "default-org",
        propertyId: 20, // Villa Tropical Paradise
        anomalyType: "booking-conflict",
        severity: "high",
        status: "resolved",
        details: {
          description: "Double booking detected for February 14-16",
          conflictingBookings: ["BK-2025-014", "BK-2025-015"],
          dates: ["2025-02-14", "2025-02-15", "2025-02-16"],
          platform1: "Airbnb",
          platform2: "Booking.com",
          recommendations: ["Contact guests to resolve", "Update calendar sync", "Implement buffer time"]
        },
        autoFixed: true,
        fixAction: "Automatically blocked dates on all platforms and notified property manager",
        detectedAt: new Date("2025-01-24T16:45:00Z"),
        resolvedAt: new Date("2025-01-24T17:30:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organizationId: "default-org",
        anomalyType: "system-performance",
        severity: "low",
        status: "open",
        details: {
          description: "API response times elevated above normal threshold",
          averageResponseTime: 1250,
          normalThreshold: 800,
          affectedEndpoints: ["/api/bookings", "/api/properties"],
          duration: "2 hours",
          recommendations: ["Monitor database performance", "Check server load", "Review recent deployments"]
        },
        autoFixed: false,
        detectedAt: new Date("2025-01-25T11:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organizationId: "default-org",
        propertyId: 17, // Villa Samui Breeze
        anomalyType: "financial-discrepancy",
        severity: "medium",
        status: "resolved",
        details: {
          description: "Utility bill amount higher than predicted",
          category: "electricity",
          actualAmount: 3200,
          predictedAmount: 2400,
          variance: 800,
          currency: "THB",
          month: "December 2024",
          possibleCauses: ["Increased AC usage", "Guest activities", "Equipment malfunction"],
          recommendations: ["Inspect AC units", "Review guest feedback", "Check electrical systems"]
        },
        autoFixed: true,
        fixAction: "Created maintenance inspection task and updated cost predictions",
        detectedAt: new Date("2025-01-23T09:15:00Z"),
        resolvedAt: new Date("2025-01-23T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample anomalies
    await db.insert(aiOpsAnomalies).values(anomaliesSample);
    console.log(`✅ Created ${anomaliesSample.length} AI Ops Anomalies demo records`);

  } catch (error) {
    console.error("❌ Error seeding AI Ops Anomalies data:", error);
  }
}