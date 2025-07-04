import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./schema";

// ===== GUEST PORTAL SMART REQUESTS & AI CHAT SCHEMAS =====

// Guest Chat Conversations - Main conversation threads
export const guestChatConversations = pgTable("guest_chat_conversations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(), // Booking reference
  guestId: varchar("guest_id").notNull(), // Guest identifier
  propertyId: integer("property_id").notNull(),
  
  // Conversation details
  conversationTitle: varchar("conversation_title"),
  status: varchar("status").default("active"), // active, closed, archived
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  // AI settings
  aiEnabled: boolean("ai_enabled").default(true),
  aiLanguage: varchar("ai_language").default("en"),
  
  // Metadata
  lastMessageAt: timestamp("last_message_at"),
  unreadGuestMessages: integer("unread_guest_messages").default(0),
  unreadStaffMessages: integer("unread_staff_messages").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Chat Messages - Individual messages in conversations
export const guestChatMessages = pgTable("guest_chat_messages", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  conversationId: integer("conversation_id").references(() => guestChatConversations.id).notNull(),
  
  // Message details
  messageType: varchar("message_type").notNull(), // guest_message, ai_response, staff_response, system_message
  senderType: varchar("sender_type").notNull(), // guest, ai, staff, system
  senderId: varchar("sender_id"), // User ID if staff message
  messageContent: text("message_content").notNull(),
  
  // Message metadata
  isRead: boolean("is_read").default(false),
  readBy: varchar("read_by"), // User ID who read the message
  readAt: timestamp("read_at"),
  
  // AI processing
  aiProcessed: boolean("ai_processed").default(false),
  intentDetected: varchar("intent_detected"), // service_request, complaint, question, compliment
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }), // 0-100
  
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guest Service Requests - Generated from chat or direct requests
export const guestServiceRequests = pgTable("guest_service_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  conversationId: integer("conversation_id").references(() => guestChatConversations.id),
  messageId: integer("message_id").references(() => guestChatMessages.id), // Original message that triggered request
  reservationId: varchar("reservation_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Request details
  requestType: varchar("request_type").notNull(), // maintenance, housekeeping, amenity, transport, food, other
  category: varchar("category").notNull(), // cleaning, repair, delivery, booking, complaint
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  // Service details
  preferredDate: date("preferred_date"),
  preferredTime: varchar("preferred_time"),
  estimatedDuration: integer("estimated_duration"), // minutes
  guestCount: integer("guest_count").default(1),
  
  // Processing status
  status: varchar("status").default("pending"), // pending, approved, declined, in_progress, completed, cancelled
  approvedBy: varchar("approved_by"), // Staff member who approved
  approvedAt: timestamp("approved_at"),
  declinedBy: varchar("declined_by"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  
  // Assignment
  assignedDepartment: varchar("assigned_department"), // housekeeping, maintenance, concierge
  assignedTo: varchar("assigned_to"), // Staff member assigned
  assignedAt: timestamp("assigned_at"),
  
  // Costs and billing
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  billingType: varchar("billing_type").default("guest_billable"), // guest_billable, owner_billable, company_expense, complimentary, split_billing
  chargeToGuest: boolean("charge_to_guest").default(false),
  
  // Confirmation workflow
  awaitingConfirmation: boolean("awaiting_confirmation").default(false),
  guestConfirmedAt: timestamp("guest_confirmed_at"),
  adminConfirmedAt: timestamp("admin_confirmed_at"),
  confirmationToken: varchar("confirmation_token"), // For secure confirmations
  
  // Completion
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  guestSatisfaction: integer("guest_satisfaction"), // 1-5 rating
  guestFeedback: text("guest_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Request Notifications - Admin/Host notification system
export const serviceRequestNotifications = pgTable("service_request_notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceRequestId: integer("service_request_id").references(() => guestServiceRequests.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Notification details
  notificationType: varchar("notification_type").notNull(), // new_request, confirmation_needed, urgent, updated
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  // Recipients
  notifyRoles: jsonb("notify_roles"), // Array of roles to notify: ["admin", "portfolio-manager", "staff"]
  notifySpecificUsers: jsonb("notify_specific_users"), // Array of specific user IDs
  
  // Status
  status: varchar("status").default("unread"), // unread, read, acknowledged, resolved
  readBy: jsonb("read_by"), // Array of users who have read this notification
  acknowledgedBy: varchar("acknowledged_by"), // User who acknowledged/acted on notification
  acknowledgedAt: timestamp("acknowledged_at"),
  
  // Actions
  actionRequired: boolean("action_required").default(true),
  actionUrl: varchar("action_url"), // Direct link to review/approve screen
  actionLabel: varchar("action_label").default("Review & Confirm"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Pre-Arrival Information Collection
export const guestPreArrivalInfo = pgTable("guest_pre_arrival_info", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Arrival details
  arrivalDate: date("arrival_date").notNull(),
  estimatedArrivalTime: varchar("estimated_arrival_time"),
  flightNumber: varchar("flight_number"),
  transportMethod: varchar("transport_method"), // car, taxi, flight, transfer
  
  // Guest preferences
  dietaryRestrictions: jsonb("dietary_restrictions"), // Array of restrictions
  allergies: jsonb("allergies"), // Array of allergies
  specialRequests: text("special_requests"),
  accessibilityNeeds: text("accessibility_needs"),
  
  // Contact information
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  localContactNumber: varchar("local_contact_number"),
  
  // Pre-arrival services
  airportTransferRequested: boolean("airport_transfer_requested").default(false),
  groceryStockingRequested: boolean("grocery_stocking_requested").default(false),
  additionalCleaning: boolean("additional_cleaning").default(false),
  
  // Information status
  infoCompleted: boolean("info_completed").default(false),
  completedAt: timestamp("completed_at"),
  unlocked48hBefore: boolean("unlocked_48h_before").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Confirmed Extras - Services booked and confirmed
export const guestConfirmedExtras = pgTable("guest_confirmed_extras", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  serviceRequestId: integer("service_request_id").references(() => guestServiceRequests.id),
  
  // Service details
  serviceName: varchar("service_name").notNull(),
  serviceCategory: varchar("service_category").notNull(), // chef, cleaning, massage, transport
  serviceProvider: varchar("service_provider"),
  
  // Scheduling
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time").notNull(),
  duration: integer("duration"), // minutes
  
  // Pricing
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: varchar("status").default("confirmed"), // confirmed, in_progress, completed, cancelled
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  
  // Special instructions
  specialInstructions: text("special_instructions"),
  guestNotes: text("guest_notes"),
  providerNotes: text("provider_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reservation History Log - Activity timeline for guests
export const reservationHistoryLog = pgTable("reservation_history_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  
  // Activity details
  actionType: varchar("action_type").notNull(), // check_in, service_request, message, task_completion
  actionTitle: varchar("action_title").notNull(),
  actionDescription: text("action_description"),
  performedBy: varchar("performed_by"), // User ID
  performedByType: varchar("performed_by_type"), // guest, staff, system
  
  // Visibility
  visibleToGuest: boolean("visible_to_guest").default(true),
  
  // Metadata
  relatedEntityType: varchar("related_entity_type"), // task, service_request, message
  relatedEntityId: integer("related_entity_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat Intent Analysis - AI processing results
export const aiChatIntentAnalysis = pgTable("ai_chat_intent_analysis", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  messageId: integer("message_id").references(() => guestChatMessages.id).notNull(),
  
  // Analysis results
  detectedIntent: varchar("detected_intent").notNull(), // service_request, complaint, question, compliment
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }).notNull(), // 0-100
  
  // Extracted entities
  serviceCategory: varchar("service_category"), // maintenance, housekeeping, amenity
  urgency: varchar("urgency"), // low, normal, high, urgent
  sentiment: varchar("sentiment"), // positive, neutral, negative
  extractedEntities: jsonb("extracted_entities"), // JSON of extracted information
  
  // Suggested actions
  suggestedActions: jsonb("suggested_actions"), // Array of suggested responses/actions
  
  // Processing metadata
  aiModel: varchar("ai_model").default("gpt-4o"),
  processingTime: integer("processing_time"), // milliseconds
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== INSERT SCHEMAS =====

export const insertGuestChatConversationSchema = createInsertSchema(guestChatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestChatMessageSchema = createInsertSchema(guestChatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGuestServiceRequestSchema = createInsertSchema(guestServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestPreArrivalInfoSchema = createInsertSchema(guestPreArrivalInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestConfirmedExtrasSchema = createInsertSchema(guestConfirmedExtras).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReservationHistoryLogSchema = createInsertSchema(reservationHistoryLog).omit({
  id: true,
  createdAt: true,
});

export const insertAiChatIntentAnalysisSchema = createInsertSchema(aiChatIntentAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestNotificationSchema = createInsertSchema(serviceRequestNotifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== TYPES =====

export type GuestChatConversation = typeof guestChatConversations.$inferSelect;
export type InsertGuestChatConversation = z.infer<typeof insertGuestChatConversationSchema>;

export type GuestChatMessage = typeof guestChatMessages.$inferSelect;
export type InsertGuestChatMessage = z.infer<typeof insertGuestChatMessageSchema>;

export type GuestServiceRequest = typeof guestServiceRequests.$inferSelect;
export type InsertGuestServiceRequest = z.infer<typeof insertGuestServiceRequestSchema>;

export type GuestPreArrivalInfo = typeof guestPreArrivalInfo.$inferSelect;
export type InsertGuestPreArrivalInfo = z.infer<typeof insertGuestPreArrivalInfoSchema>;

export type GuestConfirmedExtras = typeof guestConfirmedExtras.$inferSelect;
export type InsertGuestConfirmedExtras = z.infer<typeof insertGuestConfirmedExtrasSchema>;

export type ReservationHistoryLog = typeof reservationHistoryLog.$inferSelect;
export type InsertReservationHistoryLog = z.infer<typeof insertReservationHistoryLogSchema>;

export type AiChatIntentAnalysis = typeof aiChatIntentAnalysis.$inferSelect;
export type InsertAiChatIntentAnalysis = z.infer<typeof insertAiChatIntentAnalysisSchema>;

export type ServiceRequestNotification = typeof serviceRequestNotifications.$inferSelect;
export type InsertServiceRequestNotification = z.infer<typeof insertServiceRequestNotificationSchema>;

// ===== GUEST ACTIVITY TRACKER & RECOMMENDATIONS AI SCHEMAS =====

// Property Activity Recommendations - Admin-managed recommendations per property
export const propertyActivityRecommendations = pgTable("property_activity_recommendations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Recommendation details
  category: varchar("category").notNull(), // restaurant, beach, tour, spa, market, viewpoint, activity
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 150 }),
  
  // Location and contact info
  address: text("address"),
  googleMapsLink: text("google_maps_link"),
  websiteUrl: text("website_url"),
  phoneNumber: varchar("phone_number"),
  whatsappNumber: varchar("whatsapp_number"),
  
  // Booking and pricing
  bookingUrl: text("booking_url"),
  estimatedPrice: varchar("estimated_price"), // e.g., "500-1000 THB per person"
  priceCategory: varchar("price_category"), // budget, moderate, luxury
  
  // Timing and availability
  operatingHours: varchar("operating_hours"),
  bestTimeToVisit: varchar("best_time_to_visit"), // morning, afternoon, evening, sunset
  durationNeeded: varchar("duration_needed"), // e.g., "2-3 hours", "Full day"
  
  // Target audience
  suitableFor: jsonb("suitable_for"), // ["couples", "families", "solo", "groups"]
  ageGroup: varchar("age_group"), // all_ages, adults_only, family_friendly
  activityLevel: varchar("activity_level"), // relaxing, moderate, active, adventure
  
  // Admin settings
  displayOrder: integer("display_order").default(1),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  requiresAdvanceBooking: boolean("requires_advance_booking").default(false),
  
  // Metadata
  tags: jsonb("tags"), // ["romantic", "sunset", "authentic", "hidden_gem"]
  imageUrl: text("image_url"),
  adminNotes: text("admin_notes"),
  createdBy: varchar("created_by").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Activity Preferences - Track guest interests and interactions
export const guestActivityPreferences = pgTable("guest_activity_preferences", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Preference categories
  preferredCategories: jsonb("preferred_categories"), // ["restaurant", "beach", "spa"]
  travelStyle: varchar("travel_style"), // romantic, family, adventure, relaxation, cultural
  budgetPreference: varchar("budget_preference"), // budget, moderate, luxury, no_preference
  
  // Activity preferences
  activityLevel: varchar("activity_level"), // relaxing, moderate, active, mixed
  groupSize: integer("group_size").default(2),
  hasChildren: boolean("has_children").default(false),
  mobilityRequirements: varchar("mobility_requirements"), // none, wheelchair_accessible, limited_walking
  
  // Dietary and special needs
  dietaryRestrictions: jsonb("dietary_restrictions"), // ["vegetarian", "gluten_free", "halal"]
  specialInterests: jsonb("special_interests"), // ["photography", "history", "nature", "shopping"]
  
  // Interaction tracking
  viewedRecommendations: jsonb("viewed_recommendations"), // Array of recommendation IDs
  clickedRecommendations: jsonb("clicked_recommendations"),
  bookedActivities: jsonb("booked_activities"),
  
  // Feedback
  lastUpdated: timestamp("last_updated").defaultNow(),
  preferencesSetBy: varchar("preferences_set_by"), // guest, staff, ai_inferred
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Recommendation Interactions - Track clicks, views, bookings
export const guestRecommendationInteractions = pgTable("guest_recommendation_interactions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  recommendationId: integer("recommendation_id").references(() => propertyActivityRecommendations.id).notNull(),
  
  // Interaction details
  interactionType: varchar("interaction_type").notNull(), // view, click, bookmark, book, rate
  sessionId: varchar("session_id"),
  deviceType: varchar("device_type"), // mobile, tablet, desktop
  
  // Context
  viewDuration: integer("view_duration"), // seconds spent viewing
  clickedElement: varchar("clicked_element"), // website, booking, maps, phone
  bookingStatus: varchar("booking_status"), // attempted, completed, cancelled
  
  // Feedback
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Recommendation Analytics - Track AI suggestion performance
export const aiRecommendationAnalytics = pgTable("ai_recommendation_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Analytics period
  analysisDate: date("analysis_date").notNull(),
  periodType: varchar("period_type").default("daily"), // daily, weekly, monthly
  
  // Performance metrics
  totalRecommendationsShown: integer("total_recommendations_shown").default(0),
  totalInteractions: integer("total_interactions").default(0),
  totalBookings: integer("total_bookings").default(0),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 4 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }),
  
  // Category performance
  topPerformingCategory: varchar("top_performing_category"),
  categoryMetrics: jsonb("category_metrics"), // {"restaurant": {"views": 50, "clicks": 10}}
  
  // Guest segmentation
  guestTypeMetrics: jsonb("guest_type_metrics"), // {"couples": {...}, "families": {...}}
  preferenceAccuracy: decimal("preference_accuracy", { precision: 5, scale: 4 }),
  
  // AI model performance
  modelVersion: varchar("model_version").default("v1.0"),
  algorithmUsed: varchar("algorithm_used").default("collaborative_filtering"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 4 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas and types for Guest Activity & Recommendations
export const insertPropertyActivityRecommendationSchema = createInsertSchema(propertyActivityRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestActivityPreferencesSchema = createInsertSchema(guestActivityPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestRecommendationInteractionSchema = createInsertSchema(guestRecommendationInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecommendationAnalyticsSchema = createInsertSchema(aiRecommendationAnalytics).omit({
  id: true,
  createdAt: true,
});

export type PropertyActivityRecommendation = typeof propertyActivityRecommendations.$inferSelect;
export type InsertPropertyActivityRecommendation = z.infer<typeof insertPropertyActivityRecommendationSchema>;

export type GuestActivityPreferences = typeof guestActivityPreferences.$inferSelect;
export type InsertGuestActivityPreferences = z.infer<typeof insertGuestActivityPreferencesSchema>;

export type GuestRecommendationInteraction = typeof guestRecommendationInteractions.$inferSelect;
export type InsertGuestRecommendationInteraction = z.infer<typeof insertGuestRecommendationInteractionSchema>;

export type AiRecommendationAnalytics = typeof aiRecommendationAnalytics.$inferSelect;
export type InsertAiRecommendationAnalytics = z.infer<typeof insertAiRecommendationAnalyticsSchema>;