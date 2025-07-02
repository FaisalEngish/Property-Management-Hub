import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ===== MULTI-TENANT ARCHITECTURE =====
// Organizations table for multi-tenant support
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().notNull(), // UUID or company slug
  name: varchar("name").notNull(),
  domain: varchar("domain").unique().notNull(), // company.hostpilotpro.com
  subdomain: varchar("subdomain").unique().notNull(), // company
  companyLogo: varchar("company_logo"),
  settings: jsonb("settings"), // Company-specific settings
  subscriptionTier: varchar("subscription_tier").default("basic"), // basic, pro, enterprise
  maxUsers: integer("max_users").default(10),
  maxProperties: integer("max_properties").default(50),
  isActive: boolean("is_active").default(true),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys per organization (encrypted storage for security)
export const organizationApiKeys = pgTable("organization_api_keys", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  provider: varchar("provider").notNull(), // hostaway, pea, stripe, twilio, etc.
  keyName: varchar("key_name").notNull(), // api_key, secret_key, account_sid, etc.
  encryptedValue: text("encrypted_value").notNull(),
  description: varchar("description"), // Human-readable description
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_api_key_org").on(table.organizationId),
  index("IDX_api_key_provider").on(table.provider),
]);

// Session storage table for Replit Auth with tenant isolation
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
    organizationId: varchar("organization_id").references(() => organizations.id),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire),
    index("IDX_session_org").on(table.organizationId),
  ],
);

// User storage table for Replit Auth with organization membership
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("guest"), // admin, portfolio-manager, owner, staff, retail-agent, referral-agent, guest
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_user_org").on(table.organizationId),
  index("IDX_user_email_org").on(table.email, table.organizationId),
]);

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  externalId: varchar("external_id"), // ID from external system (Hostaway, etc.)
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  maxGuests: integer("max_guests"),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("AUD"),
  status: varchar("status").notNull().default("active"), // active, inactive, maintenance
  amenities: text("amenities").array(),
  images: text("images").array(),
  hostawayId: varchar("hostaway_id"),
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_property_org").on(table.organizationId),
  index("IDX_property_owner").on(table.ownerId),
  index("IDX_property_external").on(table.externalId),
]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // cleaning, maintenance, pool-service, garden, inspection
  department: varchar("department"), // housekeeping, maintenance, landscaping, pool, guest-services
  status: varchar("status").notNull().default("pending"), // pending, in-progress, completed, cancelled, skipped, rescheduled
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, urgent
  propertyId: integer("property_id").references(() => properties.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type"), // daily, weekly, monthly, yearly
  recurringInterval: integer("recurring_interval").default(1),
  nextDueDate: timestamp("next_due_date"),
  parentTaskId: integer("parent_task_id").references(() => tasks.id),
  // New staff management fields
  completionNotes: text("completion_notes"),
  skipReason: text("skip_reason"),
  rescheduleReason: text("reschedule_reason"),
  rescheduledDate: timestamp("rescheduled_date"),
  evidencePhotos: text("evidence_photos").array().default([]),
  issuesFound: text("issues_found").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskHistory = pgTable("task_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  action: varchar("action").notNull(), // created, assigned, started, completed, skipped, rescheduled, cancelled
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status"),
  performedBy: varchar("performed_by").references(() => users.id),
  notes: text("notes"),
  evidencePhotos: text("evidence_photos").array().default([]),
  issuesFound: text("issues_found").array().default([]),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_task_history_task").on(table.taskId),
  index("IDX_task_history_property").on(table.propertyId),
  index("IDX_task_history_user").on(table.performedBy),
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  externalId: varchar("external_id"), // ID from external system (Hostaway, etc.)
  propertyId: integer("property_id").references(() => properties.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("AUD"),
  status: varchar("status").notNull().default("confirmed"), // pending, confirmed, checked-in, checked-out, cancelled
  hostawayId: varchar("hostaway_id"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  type: varchar("type").notNull(), // income, expense, commission, fee, payout
  source: varchar("source").notNull(), // guest-payment, owner-charge, company-expense, complimentary
  sourceType: varchar("source_type"), // owner-gift, company-gift (for complimentary records)
  category: varchar("category").notNull(), // booking-payment, cleaning, maintenance, utilities, commission, add-on-service, etc.
  subcategory: varchar("subcategory"), // cleaning-fee, pool-service, massage, chef-service, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  status: varchar("status").notNull().default("pending"), // pending, paid, overdue, scheduled
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type"), // monthly, quarterly, yearly
  nextDueDate: date("next_due_date"),
  ownerId: varchar("owner_id").references(() => users.id),
  agentId: varchar("agent_id").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id), // user who created/processed the record
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  referenceNumber: varchar("reference_number"), // external reference (invoice, receipt, etc.)
  attachmentUrl: varchar("attachment_url"), // receipt/invoice attachment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  itemName: varchar("item_name").notNull(),
  category: varchar("category").notNull(), // welcome-pack, cleaning-supplies, maintenance, amenities
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  supplier: varchar("supplier"),
  lastRestocked: timestamp("last_restocked"),
  usageTracking: boolean("usage_tracking").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-on services for guests
export const addonServices = pgTable("addon_services", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // cleaning, massage, chef, transportation, activities, concierge
  pricingModel: varchar("pricing_model").notNull().default("fixed"), // fixed, variable, complimentary
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  minimumCharge: decimal("minimum_charge", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in minutes for fixed services
  isActive: boolean("is_active").default(true),
  availableProperties: integer("available_properties").array(),
  maxAdvanceBookingDays: integer("max_advance_booking_days").default(30),
  requiresApproval: boolean("requires_approval").default(false),
  allowGuestBooking: boolean("allow_guest_booking").default(true),
  allowManagerBooking: boolean("allow_manager_booking").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings for add-on services
export const addonBookings = pgTable("addon_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  serviceId: integer("service_id").references(() => addonServices.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration"), // actual duration for variable pricing
  quantity: integer("quantity").default(1), // for multiple units
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  billingType: varchar("billing_type").notNull(), // auto-bill-guest, auto-bill-owner, owner-gift, company-gift
  chargedTo: varchar("charged_to"), // guest, owner, company (derived from billingType)
  giftReason: text("gift_reason"), // reason for gift bookings
  bookedBy: varchar("booked_by").references(() => users.id).notNull(), // user who made the booking
  bookedByRole: varchar("booked_by_role").notNull(), // manager, guest, staff
  approvedBy: varchar("approved_by").references(() => users.id), // for services requiring approval
  approvalStatus: varchar("approval_status").default("auto-approved"), // pending, approved, denied, auto-approved
  notes: text("notes"),
  internalNotes: text("internal_notes"), // staff-only notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility bills and recurring expenses
export const utilityBills = pgTable("utility_bills", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  type: varchar("type").notNull(), // electricity, water, gas, internet, maintenance
  provider: varchar("provider"),
  accountNumber: varchar("account_number"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  dueDate: date("due_date").notNull(),
  billPeriodStart: date("bill_period_start"),
  billPeriodEnd: date("bill_period_end"),
  status: varchar("status").notNull().default("pending"), // pending, uploaded, paid, overdue
  receiptUrl: varchar("receipt_url"),
  reminderSent: boolean("reminder_sent").default(false),
  isRecurring: boolean("is_recurring").default(true),
  nextDueDate: date("next_due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform settings for admin configuration
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key").unique().notNull(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type").notNull(), // string, number, boolean, json
  category: varchar("category").notNull(), // currency, commission, billing, automation, api
  description: text("description"),
  isSecret: boolean("is_secret").default(false), // for API keys
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Welcome pack inventory items
export const welcomePackItems = pgTable("welcome_pack_items", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // toiletries, beverages, snacks, amenities
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  supplier: varchar("supplier"),
  restockThreshold: integer("restock_threshold").default(10),
  currentStock: integer("current_stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Welcome pack templates per property
export const welcomePackTemplates = pgTable("welcome_pack_templates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  itemId: integer("item_id").notNull().references(() => welcomePackItems.id),
  defaultQuantity: integer("default_quantity").notNull(),
  isComplimentary: boolean("is_complimentary").default(false), // if true, no cost to guest
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Welcome pack usage tracking
export const welcomePackUsage = pgTable("welcome_pack_usage", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  itemId: integer("item_id").notNull().references(() => welcomePackItems.id),
  quantityUsed: integer("quantity_used").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  billingOption: varchar("billing_option").notNull().default("owner_bill"), // owner_bill, guest_bill, complimentary
  processedBy: varchar("processed_by"),
  usageDate: date("usage_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedProperties: many(properties),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  tasks: many(tasks),
  bookings: many(bookings),
  finances: many(finances),
  inventory: many(inventory),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  property: one(properties, { fields: [tasks.propertyId], references: [properties.id] }),
  assignee: one(users, { fields: [tasks.assignedTo], references: [users.id], relationName: "assignedTasks" }),
  creator: one(users, { fields: [tasks.createdBy], references: [users.id], relationName: "createdTasks" }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  finances: many(finances),
}));

export const financesRelations = relations(finances, ({ one }) => ({
  property: one(properties, { fields: [finances.propertyId], references: [properties.id] }),
  booking: one(bookings, { fields: [finances.bookingId], references: [bookings.id] }),
  owner: one(users, { fields: [finances.ownerId], references: [users.id], relationName: "ownerFinances" }),
  agent: one(users, { fields: [finances.agentId], references: [users.id], relationName: "agentFinances" }),
  processedByUser: one(users, { fields: [finances.processedBy], references: [users.id], relationName: "processedFinances" }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  property: one(properties, { fields: [inventory.propertyId], references: [properties.id] }),
}));

export const addonServicesRelations = relations(addonServices, ({ many }) => ({
  bookings: many(addonBookings),
}));

export const addonBookingsRelations = relations(addonBookings, ({ one }) => ({
  service: one(addonServices, { fields: [addonBookings.serviceId], references: [addonServices.id] }),
  booking: one(bookings, { fields: [addonBookings.bookingId], references: [bookings.id] }),
  property: one(properties, { fields: [addonBookings.propertyId], references: [properties.id] }),
}));

export const utilityBillsRelations = relations(utilityBills, ({ one }) => ({
  property: one(properties, { fields: [utilityBills.propertyId], references: [properties.id] }),
}));

export const platformSettingsRelations = relations(platformSettings, ({ one }) => ({
  updatedByUser: one(users, { fields: [platformSettings.updatedBy], references: [users.id] }),
}));

export const welcomePackItemsRelations = relations(welcomePackItems, ({ many }) => ({
  templates: many(welcomePackTemplates),
  usage: many(welcomePackUsage),
}));

export const welcomePackTemplatesRelations = relations(welcomePackTemplates, ({ one }) => ({
  property: one(properties, { fields: [welcomePackTemplates.propertyId], references: [properties.id] }),
  item: one(welcomePackItems, { fields: [welcomePackTemplates.itemId], references: [welcomePackItems.id] }),
}));

export const welcomePackUsageRelations = relations(welcomePackUsage, ({ one }) => ({
  property: one(properties, { fields: [welcomePackUsage.propertyId], references: [properties.id] }),
  booking: one(bookings, { fields: [welcomePackUsage.bookingId], references: [bookings.id] }),
  item: one(welcomePackItems, { fields: [welcomePackUsage.itemId], references: [welcomePackItems.id] }),
}));

// Owner Payouts
export const ownerPayouts = pgTable("owner_payouts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  ownerId: varchar("owner_id").notNull(), // User ID of the owner
  propertyId: integer("property_id"), // Optional: specific property or all properties
  requestedAmount: varchar("requested_amount").notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'paid', 'completed', 'rejected'
  
  // Request details
  requestDate: timestamp("request_date").defaultNow(),
  requestedBy: varchar("requested_by").notNull(), // Usually same as ownerId
  requestNotes: text("request_notes"),
  
  // Admin approval
  approvedBy: varchar("approved_by"), // Admin user ID
  approvedDate: timestamp("approved_date"),
  approvalNotes: text("approval_notes"),
  
  // Payment details
  paymentMethod: varchar("payment_method"), // 'bank_transfer', 'check', 'other'
  paymentReference: varchar("payment_reference"), // Reference number
  paymentDate: timestamp("payment_date"),
  paidBy: varchar("paid_by"), // Admin user ID who processed payment
  
  // Receipt management
  receiptUrl: varchar("receipt_url"), // URL to uploaded receipt
  receiptUploadedBy: varchar("receipt_uploaded_by"), // Admin user ID
  receiptUploadedDate: timestamp("receipt_uploaded_date"),
  
  // Owner confirmation
  confirmedBy: varchar("confirmed_by"), // Owner user ID
  confirmedDate: timestamp("confirmed_date"),
  
  // Financial period covered
  periodStartDate: varchar("period_start_date"),
  periodEndDate: varchar("period_end_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ownerPayoutsRelations = relations(ownerPayouts, ({ one }) => ({
  owner: one(users, { fields: [ownerPayouts.ownerId], references: [users.id], relationName: "ownerPayouts" }),
  property: one(properties, { fields: [ownerPayouts.propertyId], references: [properties.id] }),
  requestedByUser: one(users, { fields: [ownerPayouts.requestedBy], references: [users.id], relationName: "payoutRequests" }),
  approvedByUser: one(users, { fields: [ownerPayouts.approvedBy], references: [users.id], relationName: "payoutApprovals" }),
  paidByUser: one(users, { fields: [ownerPayouts.paidBy], references: [users.id], relationName: "payoutPayments" }),
  receiptUploadedByUser: one(users, { fields: [ownerPayouts.receiptUploadedBy], references: [users.id], relationName: "payoutReceiptUploads" }),
  confirmedByUser: one(users, { fields: [ownerPayouts.confirmedBy], references: [users.id], relationName: "payoutConfirmations" }),
}));

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // task_assignment, booking_update, payout_action, maintenance_approval
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("related_entity_type"), // task, booking, payout, property
  relatedEntityId: integer("related_entity_id"),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url"), // optional URL for action buttons
  actionLabel: varchar("action_label"), // optional label for action button
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // optional expiration for time-sensitive notifications
});

// Notification preferences for users
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  enableInApp: boolean("enable_in_app").default(true),
  enableEmail: boolean("enable_email").default(true),
  enableSms: boolean("enable_sms").default(false),
  enableWhatsapp: boolean("enable_whatsapp").default(false),
  enableLine: boolean("enable_line").default(false),
  taskAssignments: boolean("task_assignments").default(true),
  bookingUpdates: boolean("booking_updates").default(true),
  payoutActions: boolean("payout_actions").default(true),
  maintenanceApprovals: boolean("maintenance_approvals").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  createdByUser: one(users, { fields: [notifications.createdBy], references: [users.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

// Financial & Invoice Toolkit Tables

// Staff salaries table
export const staffSalaries = pgTable("staff_salaries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").notNull(),
  monthlySalary: decimal("monthly_salary", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  bonusStructure: jsonb("bonus_structure"), // Store bonus rules as JSON
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0"), // Percentage
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission earnings table
export const commissionEarnings = pgTable("commission_earnings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").notNull(), // Staff/PM receiving commission
  sourceType: varchar("source_type").notNull(), // 'booking', 'service', 'referral'
  sourceId: integer("source_id"), // Reference to booking/service/etc
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  period: varchar("period").notNull(), // 'YYYY-MM' format
  status: varchar("status").default("pending"), // pending, approved, paid
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  invoiceNumber: varchar("invoice_number").notNull(),
  senderType: varchar("sender_type").notNull(), // 'user', 'organization', 'external'
  senderId: varchar("sender_id"), // User ID or external party
  senderName: varchar("sender_name").notNull(),
  senderAddress: text("sender_address"),
  receiverType: varchar("receiver_type").notNull(), // 'user', 'organization', 'external'
  receiverId: varchar("receiver_id"), // User ID or external party
  receiverName: varchar("receiver_name").notNull(),
  receiverAddress: text("receiver_address"),
  invoiceType: varchar("invoice_type").notNull(), // 'rental_commission', 'service_fee', 'maintenance', 'payout_request'
  description: text("description").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: varchar("status").default("draft"), // draft, sent, paid, overdue, cancelled
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  referenceNumber: varchar("reference_number"), // Booking ID, etc.
  notes: text("notes"),
  attachments: jsonb("attachments"), // File URLs
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice line items table
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  referenceId: varchar("reference_id"), // Property ID, booking ID, etc.
  referenceType: varchar("reference_type"), // 'property', 'booking', 'service'
});

// Portfolio manager assignments table
export const portfolioAssignments = pgTable("portfolio_assignments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(), // Portfolio manager user ID
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("50"), // Default 50%
  assignedAt: timestamp("assigned_at").defaultNow(),
  unassignedAt: timestamp("unassigned_at"),
  isActive: boolean("is_active").default(true),
});

// Relations for new tables
export const staffSalariesRelations = relations(staffSalaries, ({ one }) => ({
  user: one(users, { fields: [staffSalaries.userId], references: [users.id] }),
}));

export const commissionEarningsRelations = relations(commissionEarnings, ({ one }) => ({
  user: one(users, { fields: [commissionEarnings.userId], references: [users.id] }),
  processedByUser: one(users, { fields: [commissionEarnings.processedBy], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  createdByUser: one(users, { fields: [invoices.createdBy], references: [users.id] }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
}));

export const portfolioAssignmentsRelations = relations(portfolioAssignments, ({ one }) => ({
  manager: one(users, { fields: [portfolioAssignments.managerId], references: [users.id] }),
  property: one(properties, { fields: [portfolioAssignments.propertyId], references: [properties.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinanceSchema = createInsertSchema(finances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonServiceSchema = createInsertSchema(addonServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonBookingSchema = createInsertSchema(addonBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillSchema = createInsertSchema(utilityBills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWelcomePackItemSchema = createInsertSchema(welcomePackItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWelcomePackTemplateSchema = createInsertSchema(welcomePackTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWelcomePackUsageSchema = createInsertSchema(welcomePackUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerPayoutSchema = createInsertSchema(ownerPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Organization schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationApiKeySchema = createInsertSchema(organizationApiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types - Multi-tenant
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganizationApiKey = z.infer<typeof insertOrganizationApiKeySchema>;
export type OrganizationApiKey = typeof organizationApiKeys.$inferSelect;

// Types - Core entities
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = typeof finances.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertAddonService = z.infer<typeof insertAddonServiceSchema>;
export type AddonService = typeof addonServices.$inferSelect;
export type InsertAddonBooking = z.infer<typeof insertAddonBookingSchema>;
export type AddonBooking = typeof addonBookings.$inferSelect;
export type InsertUtilityBill = z.infer<typeof insertUtilityBillSchema>;
export type UtilityBill = typeof utilityBills.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertWelcomePackItem = z.infer<typeof insertWelcomePackItemSchema>;
export type WelcomePackItem = typeof welcomePackItems.$inferSelect;
export type InsertWelcomePackTemplate = z.infer<typeof insertWelcomePackTemplateSchema>;
export type WelcomePackTemplate = typeof welcomePackTemplates.$inferSelect;
export type InsertWelcomePackUsage = z.infer<typeof insertWelcomePackUsageSchema>;
export type WelcomePackUsage = typeof welcomePackUsage.$inferSelect;
export type InsertOwnerPayout = z.infer<typeof insertOwnerPayoutSchema>;
export type OwnerPayout = typeof ownerPayouts.$inferSelect;

// Task History schemas and types
export const insertTaskHistorySchema = createInsertSchema(taskHistory);
export type InsertTaskHistory = z.infer<typeof insertTaskHistorySchema>;
export type TaskHistory = typeof taskHistory.$inferSelect;

// Notification schemas and types
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

// Financial & Invoice Toolkit schemas and types
export const insertStaffSalarySchema = createInsertSchema(staffSalaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionEarningSchema = createInsertSchema(commissionEarnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
});

export const insertPortfolioAssignmentSchema = createInsertSchema(portfolioAssignments).omit({
  id: true,
  assignedAt: true,
});

export type InsertStaffSalary = z.infer<typeof insertStaffSalarySchema>;
export type StaffSalary = typeof staffSalaries.$inferSelect;
export type InsertCommissionEarning = z.infer<typeof insertCommissionEarningSchema>;
export type CommissionEarning = typeof commissionEarnings.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertPortfolioAssignment = z.infer<typeof insertPortfolioAssignmentSchema>;
export type PortfolioAssignment = typeof portfolioAssignments.$inferSelect;
