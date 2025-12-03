import { storage } from "./storage";

export async function seedAiDemoData() {
  console.log("Seeding AI demo data...");

  try {
    const organizationId = "demo-org";

    // Create demo AI task rules
    const poolRule = await storage.createAiTaskRule({
      organizationId,
      ruleName: "Pool Cleaning Detection",
      keywords: ["pool dirty", "pool clean", "pool maintenance", "pool water", "pool chemical"],
      taskType: "maintenance",
      taskTitle: "Clean pool - Guest: {guest_name}",
      taskDescription: "Pool cleaning and maintenance required based on guest feedback. Check chemical levels, skim surface, and clean filters.",
      assignToDepartment: "maintenance",
      priority: "high",
      defaultAssignee: "demo-staff",
      isActive: true,
      createdBy: "demo-admin",
      triggerCount: 3,
    });

    const heatingRule = await storage.createAiTaskRule({
      organizationId,
      ruleName: "HVAC & Heating Issues",
      keywords: ["too cold", "too hot", "heating", "air conditioning", "ac", "temperature"],
      taskType: "maintenance",
      taskTitle: "HVAC Maintenance - {guest_name}",
      taskDescription: "Check heating/cooling system, replace filters, and verify thermostat settings.",
      assignToDepartment: "maintenance",
      priority: "medium",
      defaultAssignee: "demo-staff",
      isActive: true,
      createdBy: "demo-admin",
      triggerCount: 1,
    });

    const cleaningRule = await storage.createAiTaskRule({
      organizationId,
      ruleName: "Cleaning & Housekeeping",
      keywords: ["dirty", "messy", "stained", "not clean", "smells", "needs cleaning"],
      taskType: "cleaning",
      taskTitle: "Deep cleaning required - {guest_name}",
      taskDescription: "Comprehensive cleaning of property based on guest feedback.",
      assignToDepartment: "housekeeping",
      priority: "medium",
      defaultAssignee: "demo-staff",
      isActive: true,
      createdBy: "demo-admin",
      triggerCount: 2,
    });

    const amenityRule = await storage.createAiTaskRule({
      organizationId,
      ruleName: "Amenity Issues",
      keywords: ["wifi", "internet", "tv", "television", "remote", "not working", "broken"],
      taskType: "repair",
      taskTitle: "Amenity repair - {guest_name}",
      taskDescription: "Check and repair amenities mentioned in guest feedback.",
      assignToDepartment: "maintenance",
      priority: "low",
      defaultAssignee: "demo-staff",
      isActive: true,
      createdBy: "demo-admin",
      triggerCount: 0,
    });

    // Create demo guest feedback entries
    const feedback1 = await storage.createGuestFeedback({
      organizationId,
      guestName: "Sarah Johnson",
      propertyId: 1,
      originalMessage: "The pool water looks really dirty and needs cleaning. There are leaves floating on the surface and the water is cloudy.",
      feedbackType: "complaint",
      detectedKeywords: ["pool dirty", "pool water", "needs cleaning"],
      aiConfidence: 0.92,
      requiresAction: true,
      isProcessed: false,
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    const feedback2 = await storage.createGuestFeedback({
      organizationId,
      guestName: "Michael Chen",
      propertyId: 2,
      originalMessage: "It's really cold in here! The heating doesn't seem to be working properly. Can someone check the thermostat?",
      feedbackType: "complaint",
      detectedKeywords: ["too cold", "heating", "thermostat"],
      aiConfidence: 0.88,
      requiresAction: true,
      isProcessed: false,
      receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    });

    const feedback3 = await storage.createGuestFeedback({
      organizationId,
      guestName: "Emma Davis",
      propertyId: 1,
      originalMessage: "Thank you for the lovely stay! Everything was perfect and the property was very clean.",
      feedbackType: "compliment",
      detectedKeywords: [],
      aiConfidence: 0.15,
      requiresAction: false,
      isProcessed: true,
      processedBy: "demo-admin",
      processingNotes: "Positive feedback - no action required",
      receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      processedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    });

    const feedback4 = await storage.createGuestFeedback({
      organizationId,
      guestName: "James Wilson",
      propertyId: 3,
      originalMessage: "The wifi is not working and the TV remote seems to be broken. We can't connect to the internet or watch anything.",
      feedbackType: "complaint",
      detectedKeywords: ["wifi", "internet", "tv", "remote", "not working", "broken"],
      aiConfidence: 0.95,
      requiresAction: true,
      isProcessed: false,
      receivedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    });

    const feedback5 = await storage.createGuestFeedback({
      organizationId,
      guestName: "Lisa Thompson",
      propertyId: 2,
      originalMessage: "The bathroom needs a deep clean - there are stains on the shower and it smells a bit musty.",
      feedbackType: "complaint",
      detectedKeywords: ["needs cleaning", "stained", "smells"],
      aiConfidence: 0.87,
      requiresAction: true,
      isProcessed: true,
      processedBy: "demo-pm",
      processingNotes: "Created cleaning task for housekeeping team",
      assignedTaskId: 1,
      receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
    });

    // Create demo processing logs
    await storage.createProcessingLog({
      organizationId,
      feedbackId: feedback1.id.toString(),
      processingType: "auto",
      triggeredRuleId: poolRule.id.toString(),
      matchedKeywords: ["pool dirty", "pool water", "needs cleaning"],
      confidenceScore: 0.92,
      actionTaken: "requires_review",
      processedBy: "demo-admin",
      processingTime: 150,
    });

    await storage.createProcessingLog({
      organizationId,
      feedbackId: feedback2.id.toString(),
      processingType: "auto",
      triggeredRuleId: heatingRule.id.toString(),
      matchedKeywords: ["too cold", "heating"],
      confidenceScore: 0.88,
      actionTaken: "requires_review",
      processedBy: "demo-admin",
      processingTime: 120,
    });

    await storage.createProcessingLog({
      organizationId,
      feedbackId: feedback5.id.toString(),
      processingType: "manual",
      triggeredRuleId: cleaningRule.id.toString(),
      matchedKeywords: ["needs cleaning", "stained", "smells"],
      confidenceScore: 0.87,
      actionTaken: "task_created",
      createdTaskId: "1",
      processedBy: "demo-pm",
      processingTime: 5000,
    });

    // Create AI configuration
    await storage.upsertAiConfiguration({
      organizationId,
      isEnabled: true,
      autoTaskCreation: false, // Manual approval for demo
      confidenceThreshold: 0.7,
      enabledDepartments: ["maintenance", "housekeeping", "front-desk"],
      openaiApiKey: null,
      customPrompts: {
        analysis: "Analyze guest feedback for maintenance issues, cleanliness concerns, and amenity problems.",
        classification: "Classify feedback as requiring immediate action, routine maintenance, or no action needed.",
      },
    });

    console.log("AI demo data seeded successfully!");
    console.log(`Created ${4} AI task rules`);
    console.log(`Created ${5} guest feedback entries`);
    console.log(`Created ${3} processing logs`);
    console.log("AI configuration set up");

  } catch (error) {
    console.error("Error seeding AI demo data:", error);
  }
}