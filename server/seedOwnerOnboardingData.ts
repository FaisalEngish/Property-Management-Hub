import { db } from "./db";
import { 
  ownerOnboardingProcesses, 
  onboardingStepDetails, 
  ownerDocuments,
  properties
} from "@shared/schema";

export async function seedOwnerOnboardingData() {
  console.log("Seeding Owner Onboarding data...");

  // Check if data already exists
  try {
    const existingProcesses = await db.select().from(ownerOnboardingProcesses).limit(1);
    if (existingProcesses.length > 0) {
      console.log("Owner Onboarding data already exists, skipping seed.");
      return;
    }
  } catch (error) {
    console.log("Owner Onboarding table not found or has schema mismatch, proceeding with seeding...");
  }

  const organizationId = "demo-org";

  // First get some existing properties to link to
  const existingProperties = await db.select().from(properties).limit(5);
  
  // Create sample onboarding processes using the correct schema structure
  const processesData = [
    {
      organizationId,
      ownerId: "owner-001",
      propertyId: existingProperties[0]?.id || null,
      
      // Step completion booleans (steps 1-6 completed, working on step 7)
      step1OwnerContactInfo: true,
      step2PropertyBasics: true,
      step3LocationMapping: true,
      step4PhotoUploads: true,
      step5PropertyDescription: true,
      step6UtilityInfo: true,
      step7LegalDocuments: false,
      step8SecurityAccess: false,
      step9ServicesSetup: false,
      
      // Progress tracking
      totalSteps: 9,
      completedSteps: 6,
      progressPercentage: "66.67",
      currentStep: 7,
      
      // Deadline and priority
      onboardingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      priority: "high",
      estimatedDaysRemaining: 14,
      isOverdue: false,
      
      // Tracking info
      adminNotes: "High priority new owner onboarding. Owner is very responsive and motivated to complete quickly.",
      ownerInstructions: "Please upload legal documents to complete your onboarding process.",
      lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      organizationId,
      ownerId: "owner-002",
      propertyId: existingProperties[1]?.id || null,
      
      // All steps completed
      step1OwnerContactInfo: true,
      step2PropertyBasics: true,
      step3LocationMapping: true,
      step4PhotoUploads: true,
      step5PropertyDescription: true,
      step6UtilityInfo: true,
      step7LegalDocuments: true,
      step8SecurityAccess: true,
      step9ServicesSetup: true,
      
      // Progress tracking
      totalSteps: 9,
      completedSteps: 9,
      progressPercentage: "100.00",
      currentStep: 9,
      
      // Deadline and priority
      onboardingDeadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      priority: "medium",
      estimatedDaysRemaining: 0,
      isOverdue: false,
      
      // Tracking info
      adminNotes: "Successfully completed onboarding. Owner very satisfied with the process and ready to start hosting guests.",
      lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      organizationId,
      ownerId: "owner-003",
      propertyId: existingProperties[2]?.id || null,
      
      // No steps completed yet
      step1OwnerContactInfo: false,
      step2PropertyBasics: false,
      step3LocationMapping: false,
      step4PhotoUploads: false,
      step5PropertyDescription: false,
      step6UtilityInfo: false,
      step7LegalDocuments: false,
      step8SecurityAccess: false,
      step9ServicesSetup: false,
      
      // Progress tracking
      totalSteps: 9,
      completedSteps: 0,
      progressPercentage: "0.00",
      currentStep: 1,
      
      // Deadline and priority
      onboardingDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      priority: "low",
      estimatedDaysRemaining: 21,
      isOverdue: false,
      
      // Tracking info
      adminNotes: "New property acquisition. Owner traveling currently, will start process next week.",
      ownerInstructions: "Welcome! Please start by completing your contact information.",
      lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      organizationId,
      ownerId: "owner-004",
      propertyId: existingProperties[3]?.id || null,
      
      // Steps 1-6 completed, stuck on 7 and overdue
      step1OwnerContactInfo: true,
      step2PropertyBasics: true,
      step3LocationMapping: true,
      step4PhotoUploads: true,
      step5PropertyDescription: true,
      step6UtilityInfo: true,
      step7LegalDocuments: false,
      step8SecurityAccess: false,
      step9ServicesSetup: false,
      
      // Progress tracking
      totalSteps: 9,
      completedSteps: 6,
      progressPercentage: "66.67",
      currentStep: 7,
      
      // Deadline and priority (overdue)
      onboardingDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days overdue
      priority: "urgent",
      estimatedDaysRemaining: -7,
      isOverdue: true,
      
      // Tracking info
      adminNotes: "URGENT: Overdue on legal documentation. Need to follow up with owner immediately. Blocking property listing.",
      ownerInstructions: "URGENT: Please upload your legal documents immediately to complete onboarding.",
      lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    }
  ];

  // Insert processes
  const insertedProcesses = await db.insert(ownerOnboardingProcesses).values(processesData).returning();

  console.log("Owner Onboarding data seeded successfully!");
  console.log(`Created ${insertedProcesses.length} onboarding processes`);
}