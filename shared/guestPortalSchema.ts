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
  chargeToGuest: boolean("charge_to_guest").default(false),
  
  // Completion
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  guestSatisfaction: integer("guest_satisfaction"), // 1-5 rating
  guestFeedback: text("guest_feedback"),
  
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