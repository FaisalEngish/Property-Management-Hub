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

// Property utility accounts for tracking provider details
export const propertyUtilityAccounts = pgTable("property_utility_accounts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  utilityType: varchar("utility_type").notNull(), // electricity, water, internet, gas
  provider: varchar("provider").notNull(),
  accountNumber: varchar("account_number").notNull(),
  packageInfo: text("package_info"), // For internet plans, service details
  expectedBillDay: integer("expected_bill_day").notNull(), // Day of month (1-31)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility bills and recurring expenses (enhanced)
export const utilityBills = pgTable("utility_bills", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityAccountId: integer("utility_account_id").references(() => propertyUtilityAccounts.id),
  type: varchar("type").notNull(), // electricity, water, gas, internet, maintenance
  provider: varchar("provider"),
  accountNumber: varchar("account_number"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("AUD"),
  dueDate: date("due_date").notNull(),
  billPeriodStart: date("bill_period_start"),
  billPeriodEnd: date("bill_period_end"),
  billingMonth: varchar("billing_month").notNull(), // YYYY-MM format
  status: varchar("status").notNull().default("pending"), // pending, uploaded, paid, overdue
  receiptUrl: varchar("receipt_url"),
  receiptFilename: varchar("receipt_filename"),
  reminderSent: boolean("reminder_sent").default(false),
  isRecurring: boolean("is_recurring").default(true),
  nextDueDate: date("next_due_date"),
  responsibleParty: varchar("responsible_party").notNull().default("owner"), // owner, company
  isOwnerBillable: boolean("is_owner_billable").default(true),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility bill reminders and notifications
export const utilityBillReminders = pgTable("utility_bill_reminders", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  utilityBillId: integer("utility_bill_id").references(() => utilityBills.id, { onDelete: "cascade" }),
  reminderType: varchar("reminder_type").notNull(), // overdue, due_soon, missing_receipt
  sentAt: timestamp("sent_at").defaultNow(),
  sentTo: varchar("sent_to").notNull(), // user ID
  reminderMessage: text("reminder_message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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

export const propertyUtilityAccountsRelations = relations(propertyUtilityAccounts, ({ one, many }) => ({
  property: one(properties, { fields: [propertyUtilityAccounts.propertyId], references: [properties.id] }),
  bills: many(utilityBills),
}));

export const utilityBillsRelations = relations(utilityBills, ({ one, many }) => ({
  property: one(properties, { fields: [utilityBills.propertyId], references: [properties.id] }),
  utilityAccount: one(propertyUtilityAccounts, { fields: [utilityBills.utilityAccountId], references: [propertyUtilityAccounts.id] }),
  uploadedByUser: one(users, { fields: [utilityBills.uploadedBy], references: [users.id] }),
  reminders: many(utilityBillReminders),
}));

export const utilityBillRemindersRelations = relations(utilityBillReminders, ({ one }) => ({
  utilityBill: one(utilityBills, { fields: [utilityBillReminders.utilityBillId], references: [utilityBills.id] }),
  sentToUser: one(users, { fields: [utilityBillReminders.sentTo], references: [users.id] }),
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

// Balance reset audit log for tracking admin actions
export const balanceResetAudit = pgTable("balance_reset_audit", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").notNull(), // User whose balance was reset
  userType: varchar("user_type").notNull(), // owner, portfolio-manager, referral-agent, retail-agent
  previousBalance: decimal("previous_balance", { precision: 10, scale: 2 }).notNull(),
  newBalance: decimal("new_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  resetReason: text("reset_reason"),
  adminUserId: varchar("admin_user_id").notNull(), // Admin who performed the reset
  propertyId: integer("property_id"), // Optional: if reset is property-specific
  createdAt: timestamp("created_at").defaultNow(),
});

// Global Utility Providers and Custom Expense Categories for Multi-Country Support
export const utilityProviders = pgTable("utility_providers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  utilityType: varchar("utility_type").notNull(), // internet, electricity, water, gas, etc.
  providerName: varchar("provider_name").notNull(),
  country: varchar("country").default("Thailand"),
  region: varchar("region"), // state, province, city for regional providers
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  contactInfo: text("contact_info"), // phone, website, email
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, quarterly, annual
  notes: text("notes"),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customExpenseCategories = pgTable("custom_expense_categories", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  categoryName: varchar("category_name").notNull(),
  description: text("description"),
  isRecurring: boolean("is_recurring").default(true),
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, quarterly, annual, one-time
  defaultAmount: decimal("default_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  autoReminder: boolean("auto_reminder").default(true),
  reminderDays: integer("reminder_days").default(5), // days before due
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyUtilitySettings = pgTable("property_utility_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  utilityType: varchar("utility_type").notNull(), // internet, electricity, water
  providerId: integer("provider_id"), // references utilityProviders.id
  customProviderName: varchar("custom_provider_name"), // for "Other" option
  accountNumber: varchar("account_number"),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyCustomExpenses = pgTable("property_custom_expenses", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  categoryId: integer("category_id").notNull(), // references customExpenseCategories.id
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }),
  nextDueDate: timestamp("next_due_date"),
  lastBillDate: timestamp("last_bill_date"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
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

// Portfolio Manager Commission Balance Table
export const pmCommissionBalance = pgTable("pm_commission_balance", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(),
  totalEarned: decimal("total_earned", { precision: 12, scale: 2 }).default("0"),
  totalPaid: decimal("total_paid", { precision: 12, scale: 2 }).default("0"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0"),
  lastPayoutDate: timestamp("last_payout_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Manager Payout Requests Table
export const pmPayoutRequests = pgTable("pm_payout_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  requestNotes: text("request_notes"),
  adminNotes: text("admin_notes"),
  status: varchar("status").default("pending"), // pending, approved, paid, rejected
  receiptUrl: varchar("receipt_url"), // Admin uploaded receipt
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  processedBy: varchar("processed_by"),
});

// Portfolio Manager Task Logs Table
export const pmTaskLogs = pgTable("pm_task_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  propertyId: integer("property_id").references(() => properties.id),
  taskTitle: varchar("task_title").notNull(),
  department: varchar("department").notNull(),
  staffAssigned: varchar("staff_assigned"),
  status: varchar("status").notNull(),
  completedAt: timestamp("completed_at"),
  evidencePhotos: jsonb("evidence_photos"), // Array of photo URLs
  receipts: jsonb("receipts"), // Array of receipt URLs
  result: text("result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio Manager Property Performance Table
export const pmPropertyPerformance = pgTable("pm_property_performance", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  period: varchar("period").notNull(), // YYYY-MM format
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  commissionEarned: decimal("commission_earned", { precision: 12, scale: 2 }).default("0"),
  bookingCount: integer("booking_count").default(0),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).default("0"), // Percentage
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  taskCount: integer("task_count").default(0),
  issueCount: integer("issue_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Manager Notifications Table
export const pmNotifications = pgTable("pm_notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  managerId: varchar("manager_id").notNull(),
  type: varchar("type").notNull(), // guest_issue, owner_approval, bill_upload, system_suggestion
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  severity: varchar("severity").default("info"), // info, warning, urgent
  relatedType: varchar("related_type"), // property, booking, task
  relatedId: varchar("related_id"),
  actionRequired: boolean("action_required").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for PM tables
export const pmCommissionBalanceRelations = relations(pmCommissionBalance, ({ one }) => ({
  manager: one(users, { fields: [pmCommissionBalance.managerId], references: [users.id] }),
}));

export const pmPayoutRequestsRelations = relations(pmPayoutRequests, ({ one }) => ({
  manager: one(users, { fields: [pmPayoutRequests.managerId], references: [users.id] }),
  processedByUser: one(users, { fields: [pmPayoutRequests.processedBy], references: [users.id] }),
}));

export const pmTaskLogsRelations = relations(pmTaskLogs, ({ one }) => ({
  manager: one(users, { fields: [pmTaskLogs.managerId], references: [users.id] }),
  task: one(tasks, { fields: [pmTaskLogs.taskId], references: [tasks.id] }),
  property: one(properties, { fields: [pmTaskLogs.propertyId], references: [properties.id] }),
}));

export const pmPropertyPerformanceRelations = relations(pmPropertyPerformance, ({ one }) => ({
  manager: one(users, { fields: [pmPropertyPerformance.managerId], references: [users.id] }),
  property: one(properties, { fields: [pmPropertyPerformance.propertyId], references: [properties.id] }),
}));

export const pmNotificationsRelations = relations(pmNotifications, ({ one }) => ({
  manager: one(users, { fields: [pmNotifications.managerId], references: [users.id] }),
}));

// Guest Add-On Service Booking Platform
export const guestAddonServices = pgTable("guest_addon_services", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceName: varchar("service_name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // wellness, transport, cleaning, catering, etc.
  pricingType: varchar("pricing_type").notNull(), // fixed, variable, hourly
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  isActive: boolean("is_active").default(true),
  requiresTimeSlot: boolean("requires_time_slot").default(false),
  maxAdvanceBookingDays: integer("max_advance_booking_days").default(30),
  cancellationPolicyHours: integer("cancellation_policy_hours").default(24),
  autoCreateTask: boolean("auto_create_task").default(true),
  taskType: varchar("task_type"), // cleaning, transport, catering, etc.
  taskPriority: varchar("task_priority").default("medium"), // high, medium, low
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guestAddonBookings = pgTable("guest_addon_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => guestAddonServices.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  bookingDate: timestamp("booking_date").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  billingRoute: varchar("billing_route").notNull(), // guest_billable, owner_billable, company_expense, complimentary
  complimentaryType: varchar("complimentary_type"), // owner_gift, company_gift
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, partial, failed
  paymentMethod: varchar("payment_method"), // stripe, cash, bank_transfer, manual
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  specialRequests: text("special_requests"),
  internalNotes: text("internal_notes"),
  assignedTaskId: integer("assigned_task_id").references(() => tasks.id), // auto-created task
  bookedBy: varchar("booked_by").references(() => users.id).notNull(), // user ID who made the booking
  confirmedBy: varchar("confirmed_by").references(() => users.id), // staff who confirmed
  cancelledBy: varchar("cancelled_by").references(() => users.id), // who cancelled
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guestPortalAccess = pgTable("guest_portal_access", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  accessToken: varchar("access_token").notNull().unique(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(), // staff who created access
  lastAccessedAt: timestamp("last_accessed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guest Add-On Service Relations
export const guestAddonServicesRelations = relations(guestAddonServices, ({ one, many }) => ({
  organization: one(organizations, { fields: [guestAddonServices.organizationId], references: [organizations.id] }),
  createdByUser: one(users, { fields: [guestAddonServices.createdBy], references: [users.id] }),
  bookings: many(guestAddonBookings),
}));

export const guestAddonBookingsRelations = relations(guestAddonBookings, ({ one }) => ({
  organization: one(organizations, { fields: [guestAddonBookings.organizationId], references: [organizations.id] }),
  service: one(guestAddonServices, { fields: [guestAddonBookings.serviceId], references: [guestAddonServices.id] }),
  property: one(properties, { fields: [guestAddonBookings.propertyId], references: [properties.id] }),
  bookedByUser: one(users, { fields: [guestAddonBookings.bookedBy], references: [users.id] }),
  confirmedByUser: one(users, { fields: [guestAddonBookings.confirmedBy], references: [users.id] }),
  cancelledByUser: one(users, { fields: [guestAddonBookings.cancelledBy], references: [users.id] }),
  assignedTask: one(tasks, { fields: [guestAddonBookings.assignedTaskId], references: [tasks.id] }),
}));

export const guestPortalAccessRelations = relations(guestPortalAccess, ({ one }) => ({
  organization: one(organizations, { fields: [guestPortalAccess.organizationId], references: [organizations.id] }),
  property: one(properties, { fields: [guestPortalAccess.propertyId], references: [properties.id] }),
  createdByUser: one(users, { fields: [guestPortalAccess.createdBy], references: [users.id] }),
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

export const insertPropertyUtilityAccountSchema = createInsertSchema(propertyUtilityAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillSchema = createInsertSchema(utilityBills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillReminderSchema = createInsertSchema(utilityBillReminders).omit({
  id: true,
  createdAt: true,
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
export type InsertPropertyUtilityAccount = z.infer<typeof insertPropertyUtilityAccountSchema>;
export type PropertyUtilityAccount = typeof propertyUtilityAccounts.$inferSelect;
export type InsertUtilityBill = z.infer<typeof insertUtilityBillSchema>;
export type UtilityBill = typeof utilityBills.$inferSelect;
export type InsertUtilityBillReminder = z.infer<typeof insertUtilityBillReminderSchema>;
export type UtilityBillReminder = typeof utilityBillReminders.$inferSelect;
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

// Guest Add-On Service Insert schemas  
export const insertGuestAddonServiceSchema = createInsertSchema(guestAddonServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestAddonBookingSchema = createInsertSchema(guestAddonBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ================================
// RETAIL AGENT INTERFACE ADDITIONAL SCHEMAS
// ================================

// Property Marketing Media - Links to marketing assets
export const propertyMarketingMedia = pgTable("property_marketing_media", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Media Information
  mediaType: varchar("media_type").notNull(), // photo_folder, video_link, virtual_tour, brochure
  title: varchar("title").notNull(),
  description: text("description"),
  
  // Links and Access
  mediaUrl: varchar("media_url").notNull(), // Google Drive link, etc.
  thumbnailUrl: varchar("thumbnail_url"),
  accessPassword: varchar("access_password"), // If protected
  
  // Organization
  category: varchar("category"), // interior, exterior, amenities, location, etc.
  sortOrder: integer("sort_order").default(0),
  
  // Visibility and Access Control
  isPublic: boolean("is_public").default(true),
  agentAccessLevel: varchar("agent_access_level").default("all"), // all, specific, restricted
  
  // Usage Tracking
  viewCount: integer("view_count").default(0),
  lastAccessed: timestamp("last_accessed"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Commission Rules - Customizable commission rates per property
export const propertyCommissionRules = pgTable("property_commission_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Commission Configuration
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }).default(10.0),
  seasonalRates: jsonb("seasonal_rates"), // JSON for date-based rates
  minimumStayCommission: decimal("minimum_stay_commission", { precision: 5, scale: 2 }),
  weeklyCommissionBonus: decimal("weekly_commission_bonus", { precision: 5, scale: 2 }),
  monthlyCommissionBonus: decimal("monthly_commission_bonus", { precision: 5, scale: 2 }),
  
  // Agent-Specific Rules
  agentSpecificRules: jsonb("agent_specific_rules"), // JSON for agent-specific rates
  
  // Rules and Conditions
  minimumBookingValue: decimal("minimum_booking_value", { precision: 10, scale: 2 }),
  maximumCommissionCap: decimal("maximum_commission_cap", { precision: 10, scale: 2 }),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Booking Requests - For properties not directly bookable
export const agentBookingRequests = pgTable("agent_booking_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Guest Information
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  guestPhone: varchar("guest_phone"),
  guestCountry: varchar("guest_country"),
  
  // Requested Booking Details
  requestedCheckIn: timestamp("requested_check_in").notNull(),
  requestedCheckOut: timestamp("requested_check_out").notNull(),
  requestedGuests: integer("requested_guests").default(1),
  budgetRange: varchar("budget_range"),
  
  // Request Details
  specialRequests: text("special_requests"),
  agentNotes: text("agent_notes"),
  urgencyLevel: varchar("urgency_level").default("normal"), // low, normal, high, urgent
  
  // Admin Response
  adminResponse: text("admin_response"),
  adminNotes: text("admin_notes"),
  alternativeOffers: jsonb("alternative_offers"), // JSON array of alternative property suggestions
  
  // Status Tracking
  status: varchar("status").default("pending"), // pending, under_review, approved, declined, converted_to_booking
  
  // Workflow Timestamps
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
  respondedAt: timestamp("responded_at"),
  
  // Conversion Tracking
  convertedToBookingId: integer("converted_to_booking_id"), // Links to agent_bookings if converted
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new agent tables
export const propertyMarketingMediaRelations = relations(propertyMarketingMedia, ({ one }) => ({
  property: one(properties, {
    fields: [propertyMarketingMedia.propertyId],
    references: [properties.id],
  }),
}));

export const propertyCommissionRulesRelations = relations(propertyCommissionRules, ({ one }) => ({
  property: one(properties, {
    fields: [propertyCommissionRules.propertyId],
    references: [properties.id],
  }),
}));

export const agentBookingRequestsRelations = relations(agentBookingRequests, ({ one }) => ({
  property: one(properties, {
    fields: [agentBookingRequests.propertyId],
    references: [properties.id],
  }),
  agent: one(users, {
    fields: [agentBookingRequests.agentId],
    references: [users.id],
  }),
}));

// Additional Insert Schemas
export const insertPropertyMarketingMediaSchema = createInsertSchema(propertyMarketingMedia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyCommissionRuleSchema = createInsertSchema(propertyCommissionRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentBookingRequestSchema = createInsertSchema(agentBookingRequests).omit({
  id: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestPortalAccessSchema = createInsertSchema(guestPortalAccess).omit({
  id: true,
  createdAt: true,
});

export type InsertStaffSalary = z.infer<typeof insertStaffSalariesSchema>;
export type StaffSalary = typeof staffSalaries.$inferSelect;
export type InsertCommissionEarning = z.infer<typeof insertCommissionEarningSchema>;
export type CommissionEarning = typeof commissionEarnings.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertPortfolioAssignment = z.infer<typeof insertPortfolioAssignmentSchema>;
export type PortfolioAssignment = typeof portfolioAssignments.$inferSelect;

// Guest Add-On Service types
export type InsertGuestAddonService = z.infer<typeof insertGuestAddonServiceSchema>;
export type GuestAddonService = typeof guestAddonServices.$inferSelect;
export type InsertGuestAddonBooking = z.infer<typeof insertGuestAddonBookingSchema>;
export type GuestAddonBooking = typeof guestAddonBookings.$inferSelect;
export type InsertGuestPortalAccess = z.infer<typeof insertGuestPortalAccessSchema>;
export type GuestPortalAccess = typeof guestPortalAccess.$inferSelect;

// ===== AGENT COMMISSION SYSTEM =====

// Property referral assignments (which referral agent brought which property)
export const propertyReferrals = pgTable("property_referrals", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  referralAgentId: varchar("referral_agent_id").references(() => users.id).notNull(),
  portfolioManagerId: varchar("portfolio_manager_id").references(() => users.id),
  referralDate: timestamp("referral_date").defaultNow(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // 10% default
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral agent earnings tracking (monthly commission calculations)
export const referralEarnings = pgTable("referral_earnings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  referralAgentId: varchar("referral_agent_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  
  // Revenue Data
  grossRentalIncome: decimal("gross_rental_income", { precision: 10, scale: 2 }).default("0.00"),
  managementFeeTotal: decimal("management_fee_total", { precision: 10, scale: 2 }).default("0.00"),
  referralCommissionEarned: decimal("referral_commission_earned", { precision: 10, scale: 2 }).default("0.00"),
  
  // Performance Data
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"), // 0-100%
  averageReviewScore: decimal("average_review_score", { precision: 3, scale: 1 }).default("0.0"), // 0-5.0
  totalBookings: integer("total_bookings").default(0),
  
  // Status
  status: varchar("status").default("pending"), // pending, calculated, paid
  calculatedAt: timestamp("calculated_at"),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent payouts (both retail and referral agents)
export const agentPayouts = pgTable("agent_payouts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  agentType: varchar("agent_type").notNull(), // 'retail-agent' or 'referral-agent'
  
  // Payout Details
  payoutAmount: decimal("payout_amount", { precision: 10, scale: 2 }).notNull(),
  payoutMethod: varchar("payout_method").notNull(), // 'bank_transfer', 'paypal', 'check'
  agentBankDetails: text("agent_bank_details"),
  requestNotes: text("request_notes"),
  
  // Status Tracking
  payoutStatus: varchar("payout_status").default("pending"), // pending, approved, paid, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
  paidAt: timestamp("paid_at"),
  receiptUrl: varchar("receipt_url"), // Admin uploads receipt
  receiptConfirmedAt: timestamp("receipt_confirmed_at"), // Agent confirms receipt
  
  // Admin Notes
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral program rules and settings
export const referralProgramRules = pgTable("referral_program_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Program Rules
  title: varchar("title").notNull(),
  description: text("description"),
  ruleType: varchar("rule_type").notNull(), // 'commission', 'payout', 'qualification'
  ruleContent: text("rule_content").notNull(),
  
  // Settings
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Property agent assignments (links properties to agents for access)
export const propertyAgents = pgTable("property_agents", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  agentType: varchar("agent_type").notNull(), // 'retail-agent' or 'referral-agent'
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Retail agent bookings (commission tracking)
export const agentBookings = pgTable("agent_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  retailAgentId: varchar("retail_agent_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  guestPhone: varchar("guest_phone"),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  bookingStatus: varchar("booking_status").default("confirmed"), // confirmed, cancelled, completed
  commissionStatus: varchar("commission_status").default("pending"), // pending, approved, paid
  hostawayBookingId: varchar("hostaway_booking_id"), // Integration with Hostaway
  
  // Admin Management Fields
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed commission
  processedAt: timestamp("processed_at"),
  adjustmentReason: text("adjustment_reason"), // Reason for manual adjustments
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }), // Original amount before adjustments
  bookingReference: varchar("booking_reference"), // External booking reference
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Log - Unified tracking for all agent commission activities
export const commissionLog = pgTable("commission_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  agentType: varchar("agent_type").notNull(), // retail-agent, referral-agent
  
  // Transaction Details
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  referenceNumber: varchar("reference_number").notNull(), // B1245, R1167, etc.
  
  // Commission Calculation
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(), // Original booking/rental amount
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  
  // Status and Processing
  status: varchar("status").default("pending"), // pending, approved, paid, cancelled
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed
  processedAt: timestamp("processed_at"),
  payoutId: integer("payout_id"), // Reference to agent_payouts when paid
  
  // Adjustments and Notes
  isAdjustment: boolean("is_adjustment").default(false),
  adjustmentReason: text("adjustment_reason"),
  originalCommissionId: integer("original_commission_id"), // Reference to original commission if adjustment
  adminNotes: text("admin_notes"),
  
  // Period tracking (for referral agents)
  commissionMonth: integer("commission_month"), // 1-12 for monthly referral tracking
  commissionYear: integer("commission_year"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Invoices - Agent-generated invoices for commission payouts  
export const commissionInvoices = pgTable("commission_invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  agentType: varchar("agent_type").notNull(), // retail-agent, referral-agent
  
  // Invoice Details
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  
  // Commission Period
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  
  // Financial Summary
  totalCommissions: decimal("total_commissions", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  
  // Status Management
  status: varchar("status").default("draft"), // draft, submitted, approved, paid, rejected
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"),
  
  // Invoice Content
  description: text("description"),
  agentNotes: text("agent_notes"),
  adminNotes: text("admin_notes"),
  
  // File Management
  invoiceFileUrl: varchar("invoice_file_url"), // PDF file path
  generatedBy: varchar("generated_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission Invoice Line Items - Individual commission entries in invoices
export const commissionInvoiceItems = pgTable("commission_invoice_items", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  invoiceId: integer("invoice_id").references(() => commissionInvoices.id).notNull(),
  commissionLogId: integer("commission_log_id").references(() => commissionLog.id).notNull(),
  
  // Line Item Details
  description: text("description").notNull(),
  propertyName: varchar("property_name").notNull(),
  referenceNumber: varchar("reference_number").notNull(),
  commissionDate: date("commission_date").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});





// ===== AI SMART TASK TRIGGERS & FEEDBACK MONITOR =====

// Guest feedback log - stores all guest messages/reviews for AI processing
export const guestFeedback = pgTable("guest_feedback", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  propertyId: integer("property_id").references(() => properties.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  feedbackType: varchar("feedback_type").notNull(), // review, message, complaint, compliment
  feedbackChannel: varchar("feedback_channel").default("portal"), // portal, email, phone, sms
  originalMessage: text("original_message").notNull(),
  detectedKeywords: jsonb("detected_keywords"), // Array of matched keywords
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }), // -1.0 to 1.0 (future AI)
  urgencyLevel: varchar("urgency_level").default("medium"), // low, medium, high, critical
  isProcessed: boolean("is_processed").default(false),
  requiresAction: boolean("requires_action").default(false),
  assignedTaskId: integer("assigned_task_id").references(() => tasks.id),
  processedBy: varchar("processed_by").references(() => users.id),
  processingNotes: text("processing_notes"),
  receivedAt: timestamp("received_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI task generation rules - configurable keyword mapping to task types
export const aiTaskRules = pgTable("ai_task_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ruleName: varchar("rule_name").notNull(),
  keywords: jsonb("keywords").notNull(), // Array of trigger keywords
  taskType: varchar("task_type").notNull(),
  taskTitle: varchar("task_title").notNull(), // Template for task title
  taskDescription: text("task_description"), // Template for task description
  assignToDepartment: varchar("assign_to_department"), // cleaning, maintenance, front_desk
  defaultAssignee: varchar("default_assignee").references(() => users.id),
  priority: varchar("priority").default("medium"), // high, medium, low
  autoAssign: boolean("auto_assign").default(true),
  isActive: boolean("is_active").default(true),
  triggerCount: integer("trigger_count").default(0), // How many times this rule has triggered
  lastTriggered: timestamp("last_triggered"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback processing log - audit trail for AI decisions
export const feedbackProcessingLog = pgTable("feedback_processing_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  feedbackId: integer("feedback_id").references(() => guestFeedback.id).notNull(),
  processingType: varchar("processing_type").notNull(), // auto, manual, ai_nlp
  triggeredRuleId: integer("triggered_rule_id").references(() => aiTaskRules.id),
  matchedKeywords: jsonb("matched_keywords"), // Which keywords triggered the rule
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // AI confidence
  actionTaken: varchar("action_taken").notNull(), // task_created, escalated, ignored
  createdTaskId: integer("created_task_id").references(() => tasks.id),
  processedBy: varchar("processed_by").references(() => users.id),
  aiModel: varchar("ai_model"), // gpt-4, claude, etc. (future)
  processingTime: integer("processing_time"), // milliseconds
  errorMessage: text("error_message"), // If processing failed
  createdAt: timestamp("created_at").defaultNow(),
});

// AI configuration per organization
export const aiConfiguration = pgTable("ai_configuration", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  autoProcessingEnabled: boolean("auto_processing_enabled").default(true),
  aiProvider: varchar("ai_provider").default("keyword"), // keyword, openai, claude, etc.
  confidenceThreshold: decimal("confidence_threshold", { precision: 3, scale: 2 }).default("0.75"),
  autoTaskCreation: boolean("auto_task_creation").default(true),
  requireManagerApproval: boolean("require_manager_approval").default(false),
  notificationSettings: jsonb("notification_settings"), // Who gets notified when
  processingCooldown: integer("processing_cooldown").default(300), // seconds between processing same type
  debugMode: boolean("debug_mode").default(false),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Services - Property management services that bill monthly/quarterly
export const recurringServices = pgTable("recurring_services", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  serviceName: varchar("service_name").notNull(),
  serviceCategory: varchar("service_category").notNull(), // cleaning, maintenance, security, landscaping, pool, management
  providerName: varchar("provider_name").notNull(),
  providerContact: varchar("provider_contact"),
  providerEmail: varchar("provider_email"),
  billingFrequency: varchar("billing_frequency").notNull(), // monthly, quarterly, bi-annual, annual
  billingAmount: decimal("billing_amount", { precision: 10, scale: 2 }).notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  lastBillingDate: timestamp("last_billing_date"),
  autoPayEnabled: boolean("auto_pay_enabled").default(false),
  paymentMethod: varchar("payment_method"), // card, bank_transfer, check, cash
  billingRoute: varchar("billing_route").notNull().default("company_expense"), // company_expense, owner_charge
  assignedPropertyOwner: varchar("assigned_property_owner").references(() => users.id),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  contractDocument: varchar("contract_document"), // URL to contract file
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Service Bills - Track actual bills received
export const recurringServiceBills = pgTable("recurring_service_bills", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => recurringServices.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  billNumber: varchar("bill_number"),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status").notNull().default("pending"), // pending, paid, overdue, disputed, cancelled
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method"),
  paymentReference: varchar("payment_reference"),
  billDocument: varchar("bill_document"), // URL to bill/invoice file
  receiptDocument: varchar("receipt_document"), // URL to payment receipt
  billingRoute: varchar("billing_route").notNull(), // company_expense, owner_charge
  chargedToOwner: varchar("charged_to_owner").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id),
  isDisputed: boolean("is_disputed").default(false),
  disputeReason: text("dispute_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bill Reminders & Notifications
export const billReminders = pgTable("bill_reminders", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  billId: integer("bill_id").references(() => recurringServiceBills.id),
  serviceId: integer("service_id").references(() => recurringServices.id),
  reminderType: varchar("reminder_type").notNull(), // upcoming_bill, overdue_payment, contract_renewal
  reminderDate: timestamp("reminder_date").notNull(),
  daysBeforeDue: integer("days_before_due"), // For upcoming bills
  daysOverdue: integer("days_overdue"), // For overdue payments
  recipientUser: varchar("recipient_user").references(() => users.id),
  recipientEmail: varchar("recipient_email"),
  status: varchar("status").default("pending"), // pending, sent, acknowledged
  sentAt: timestamp("sent_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  emailSubject: varchar("email_subject"),
  emailBody: text("email_body"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Performance Tracking
export const servicePerformance = pgTable("service_performance", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => recurringServices.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  performanceMonth: varchar("performance_month").notNull(), // YYYY-MM
  qualityRating: integer("quality_rating"), // 1-5 stars
  timelinessRating: integer("timeliness_rating"), // 1-5 stars
  costEffectiveness: integer("cost_effectiveness"), // 1-5 stars
  issuesReported: integer("issues_reported").default(0),
  maintenanceTasksGenerated: integer("maintenance_tasks_generated").default(0),
  customerSatisfaction: integer("customer_satisfaction"), // 1-5 stars from guests
  serviceNotes: text("service_notes"),
  improvementSuggestions: text("improvement_suggestions"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property Media Library System
export const propertyMedia = pgTable("property_media", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  mediaType: varchar("media_type").notNull(), // 'photo', 'video', 'document'
  title: varchar("title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(), // URL or file path
  thumbnailUrl: text("thumbnail_url"), // For videos and documents
  fileSize: integer("file_size"), // File size in bytes
  mimeType: varchar("mime_type"), // MIME type of the file
  isAgentApproved: boolean("is_agent_approved").default(false),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  displayOrder: integer("display_order").default(0),
  tags: text("tags").array(), // Searchable tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyInternalNotes = pgTable("property_internal_notes", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  category: varchar("category").notNull(), // 'commission', 'restrictions', 'booking_instructions', 'other'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isVisibleToAgents: boolean("is_visible_to_agents").default(true),
  priority: varchar("priority").default("medium"), // 'high', 'medium', 'low'
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agentMediaAccess = pgTable("agent_media_access", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").references(() => propertyMedia.id, { onDelete: "cascade" }),
  accessGrantedBy: varchar("access_granted_by").references(() => users.id).notNull(),
  accessedAt: timestamp("accessed_at").defaultNow(),
  lastViewedAt: timestamp("last_viewed_at"),
  copyCount: integer("copy_count").default(0), // Track how many times links were copied
});

// Insert and Select schemas for Recurring Services
export const insertRecurringServiceSchema = createInsertSchema(recurringServices);
export const insertRecurringServiceBillSchema = createInsertSchema(recurringServiceBills);
export const insertBillReminderSchema = createInsertSchema(billReminders);
export const insertServicePerformanceSchema = createInsertSchema(servicePerformance);

// Insert and Select schemas for Property Media Library
export const insertPropertyMediaSchema = createInsertSchema(propertyMedia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyInternalNotesSchema = createInsertSchema(propertyInternalNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentMediaAccessSchema = createInsertSchema(agentMediaAccess).omit({
  id: true,
  accessedAt: true,
});

export type RecurringService = typeof recurringServices.$inferSelect;
export type InsertRecurringService = typeof recurringServices.$inferInsert;
export type RecurringServiceBill = typeof recurringServiceBills.$inferSelect;
export type InsertRecurringServiceBill = typeof recurringServiceBills.$inferInsert;
export type BillReminder = typeof billReminders.$inferSelect;
export type InsertBillReminder = typeof billReminders.$inferInsert;
export type ServicePerformance = typeof servicePerformance.$inferSelect;
export type InsertServicePerformance = typeof servicePerformance.$inferInsert;

// Insert and Select schemas for AI Feedback System
export const insertGuestFeedbackSchema = createInsertSchema(guestFeedback);
export const insertAiTaskRuleSchema = createInsertSchema(aiTaskRules);
export const insertFeedbackProcessingLogSchema = createInsertSchema(feedbackProcessingLog);
export const insertAiConfigurationSchema = createInsertSchema(aiConfiguration);

export type GuestFeedback = typeof guestFeedback.$inferSelect;
export type InsertGuestFeedback = typeof guestFeedback.$inferInsert;
export type AiTaskRule = typeof aiTaskRules.$inferSelect;
export type InsertAiTaskRule = typeof aiTaskRules.$inferInsert;
export type FeedbackProcessingLog = typeof feedbackProcessingLog.$inferSelect;
export type InsertFeedbackProcessingLog = typeof feedbackProcessingLog.$inferInsert;
export type AiConfiguration = typeof aiConfiguration.$inferSelect;
export type InsertAiConfiguration = typeof aiConfiguration.$inferInsert;

// Property Media Library types
export type InsertPropertyMedia = z.infer<typeof insertPropertyMediaSchema>;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type InsertPropertyInternalNotes = z.infer<typeof insertPropertyInternalNotesSchema>;
export type PropertyInternalNotes = typeof propertyInternalNotes.$inferSelect;
export type InsertAgentMediaAccess = z.infer<typeof insertAgentMediaAccessSchema>;
export type AgentMediaAccess = typeof agentMediaAccess.$inferSelect;

// ===== LOYALTY & REPEAT GUEST TRACKER + SMART MESSAGING SYSTEM =====

// Guest loyalty profile and repeat guest tracking
export const guestLoyaltyProfiles = pgTable("guest_loyalty_profiles", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  guestEmail: varchar("guest_email").notNull(),
  guestName: varchar("guest_name").notNull(),
  guestPhone: varchar("guest_phone"),
  totalStays: integer("total_stays").default(0),
  firstStayDate: timestamp("first_stay_date"),
  lastStayDate: timestamp("last_stay_date"),
  loyaltyTier: varchar("loyalty_tier").default("new"), // new, silver, gold, platinum
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  averageStayDuration: integer("average_stay_duration"), // in days
  preferredProperties: text("preferred_properties").array(),
  specialPreferences: text("special_preferences"), // dietary, accessibility, etc
  communicationPreferences: jsonb("communication_preferences"), // email, sms, preferences
  loyaltyPoints: integer("loyalty_points").default(0),
  isVip: boolean("is_vip").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loyalty tier definitions and benefits
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  tierName: varchar("tier_name").notNull(), // Silver, Gold, Platinum
  minStays: integer("min_stays").notNull(),
  tierColor: varchar("tier_color").default("#6B7280"), // hex color for badges
  benefits: text("benefits").array(), // array of benefit descriptions
  perks: jsonb("perks"), // structured perks data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest messaging threads and conversations
export const guestMessages = pgTable("guest_messages", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  threadId: varchar("thread_id").notNull(), // unique thread identifier
  guestLoyaltyId: integer("guest_loyalty_id").references(() => guestLoyaltyProfiles.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  propertyId: integer("property_id").references(() => properties.id),
  senderId: varchar("sender_id"), // user id or 'guest' or 'system'
  senderType: varchar("sender_type").notNull(), // guest, staff, admin, system
  senderName: varchar("sender_name").notNull(),
  messageContent: text("message_content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, file, automated
  attachments: text("attachments").array(), // file URLs
  isAutomated: boolean("is_automated").default(false),
  urgencyLevel: varchar("urgency_level").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  readBy: varchar("read_by").references(() => users.id),
  relatedTaskId: integer("related_task_id").references(() => tasks.id),
  aiAnalysis: jsonb("ai_analysis"), // AI sentiment, topic classification, etc
  createdAt: timestamp("created_at").defaultNow(),
});

// Automated messaging triggers and rules
export const messagingTriggers = pgTable("messaging_triggers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  triggerName: varchar("trigger_name").notNull(),
  triggerType: varchar("trigger_type").notNull(), // check_in, check_out, post_stay, follow_up
  triggerCondition: varchar("trigger_condition").notNull(), // after_check_in, before_check_out, 3_months_later
  delayMinutes: integer("delay_minutes").default(0), // delay before sending
  messageTemplate: text("message_template").notNull(),
  isActive: boolean("is_active").default(true),
  loyaltyTierTargets: text("loyalty_tier_targets").array(), // which tiers to target
  propertyTargets: text("property_targets").array(), // which properties
  lastTriggered: timestamp("last_triggered"),
  triggerCount: integer("trigger_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Smart reply suggestions for staff
export const smartReplySuggestions = pgTable("smart_reply_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  category: varchar("category").notNull(), // greeting, confirmation, apology, upsell, etc
  trigger: varchar("trigger"), // keywords that trigger this suggestion
  messageTemplate: text("message_template").notNull(),
  useCount: integer("use_count").default(0),
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true),
  userRole: varchar("user_role"), // staff, admin, all
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI feedback analysis and task generation
export const aiMessageAnalysis = pgTable("ai_message_analysis", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  messageId: integer("message_id").references(() => guestMessages.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  analysisType: varchar("analysis_type").notNull(), // sentiment, issue_detection, task_generation
  sentiment: varchar("sentiment"), // positive, neutral, negative
  detectedIssues: text("detected_issues").array(), // hot_water, pool_dirty, breakfast_quality
  suggestedActions: text("suggested_actions").array(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  taskGenerated: boolean("task_generated").default(false),
  generatedTaskId: integer("generated_task_id").references(() => tasks.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message delivery tracking
export const messageDeliveries = pgTable("message_deliveries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  messageId: integer("message_id").references(() => guestMessages.id),
  deliveryMethod: varchar("delivery_method").notNull(), // email, sms, whatsapp, in_app
  recipientEmail: varchar("recipient_email"),
  recipientPhone: varchar("recipient_phone"),
  deliveryStatus: varchar("delivery_status").default("pending"), // pending, sent, delivered, failed
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== OWNER DASHBOARD PLATFORM =====

// Owner Activity Timeline
export const ownerActivityTimeline = pgTable("owner_activity_timeline", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  activityType: varchar("activity_type").notNull(), // check_in, check_out, task_completed, guest_feedback, addon_booking, bill_uploaded
  title: varchar("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional data specific to activity type
  referenceId: integer("reference_id"), // ID of related record (booking, task, etc)
  referenceType: varchar("reference_type"), // booking, task, guest_addon_booking, etc
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Owner Payout Requests
export const ownerPayoutRequests = pgTable("owner_payout_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, processing, completed
  requestNotes: text("request_notes"),
  adminNotes: text("admin_notes"),
  paymentReceiptUrl: varchar("payment_receipt_url"),
  paymentMethod: varchar("payment_method"),
  paymentReference: varchar("payment_reference"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  paymentUploadedAt: timestamp("payment_uploaded_at"),
  paymentUploadedBy: varchar("payment_uploaded_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
});

// Owner Invoices
export const ownerInvoices = pgTable("owner_invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  invoiceType: varchar("invoice_type").notNull(), // monthly_summary, utility_cost, service_charge, management_fee
  title: varchar("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  dueDate: date("due_date"),
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  pdfUrl: varchar("pdf_url"),
  metadata: jsonb("metadata"), // Breakdown details
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Owner Preferences
export const ownerPreferences = pgTable("owner_preferences", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  taskApprovalRequired: boolean("task_approval_required").default(false),
  maintenanceAlerts: boolean("maintenance_alerts").default(true),
  guestAddonNotifications: boolean("guest_addon_notifications").default(true),
  financialNotifications: boolean("financial_notifications").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  preferredCurrency: varchar("preferred_currency").default("AUD"),
  notificationEmail: varchar("notification_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for owner dashboard
export const insertOwnerActivityTimelineSchema = createInsertSchema(ownerActivityTimeline).omit({
  id: true,
  createdAt: true,
});

export const insertOwnerPayoutRequestSchema = createInsertSchema(ownerPayoutRequests).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
  paymentUploadedAt: true,
  completedAt: true,
});

export const insertOwnerInvoiceSchema = createInsertSchema(ownerInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerPreferencesSchema = createInsertSchema(ownerPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Owner Dashboard types
export type OwnerActivityTimeline = typeof ownerActivityTimeline.$inferSelect;
export type InsertOwnerActivityTimeline = z.infer<typeof insertOwnerActivityTimelineSchema>;
export type OwnerPayoutRequest = typeof ownerPayoutRequests.$inferSelect;
export type InsertOwnerPayoutRequest = z.infer<typeof insertOwnerPayoutRequestSchema>;
export type OwnerInvoice = typeof ownerInvoices.$inferSelect;
export type InsertOwnerInvoice = z.infer<typeof insertOwnerInvoiceSchema>;
export type OwnerPreferences = typeof ownerPreferences.$inferSelect;
export type InsertOwnerPreferences = z.infer<typeof insertOwnerPreferencesSchema>;

// ===== REFERRAL AGENT SCHEMA RELATIONS =====

export const propertyReferralsRelations = relations(propertyReferrals, ({ one }) => ({
  property: one(properties, {
    fields: [propertyReferrals.propertyId],
    references: [properties.id],
  }),
  referralAgent: one(users, {
    fields: [propertyReferrals.referralAgentId],
    references: [users.id],
  }),
  portfolioManager: one(users, {
    fields: [propertyReferrals.portfolioManagerId],
    references: [users.id],
  }),
}));

export const referralEarningsRelations = relations(referralEarnings, ({ one }) => ({
  property: one(properties, {
    fields: [referralEarnings.propertyId],
    references: [properties.id],
  }),
  referralAgent: one(users, {
    fields: [referralEarnings.referralAgentId],
    references: [users.id],
  }),
}));

export const agentPayoutsRelations = relations(agentPayouts, ({ one }) => ({
  agent: one(users, {
    fields: [agentPayouts.agentId],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [agentPayouts.approvedBy],
    references: [users.id],
  }),
}));

export const referralProgramRulesRelations = relations(referralProgramRules, ({ one }) => ({
  createdByUser: one(users, {
    fields: [referralProgramRules.createdBy],
    references: [users.id],
  }),
}));

export const propertyAgentsRelations = relations(propertyAgents, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAgents.propertyId],
    references: [properties.id],
  }),
  agent: one(users, {
    fields: [propertyAgents.agentId],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [propertyAgents.assignedBy],
    references: [users.id],
  }),
}));

// ===== REFERRAL AGENT INSERT SCHEMAS =====

export const insertPropertyReferralSchema = createInsertSchema(propertyReferrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralEarningsSchema = createInsertSchema(referralEarnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentPayoutsSchema = createInsertSchema(agentPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralProgramRulesSchema = createInsertSchema(referralProgramRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyAgentsSchema = createInsertSchema(propertyAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== STAFF DASHBOARD PLATFORM =====

// Staff Salary & Commission Tracking
export const staffSalaries = pgTable("staff_salaries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Salary Information
  monthlySalary: decimal("monthly_salary", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  payrollPeriod: varchar("payroll_period").notNull(), // monthly, weekly, bi-weekly
  department: varchar("department"), // cleaning, pool, garden, maintenance, general
  
  // Task-based bonuses
  taskBonusEnabled: boolean("task_bonus_enabled").default(false),
  taskBonusAmount: decimal("task_bonus_amount", { precision: 10, scale: 2 }).default("0"),
  taskBonusType: varchar("task_bonus_type").default("per_task"), // per_task, percentage
  
  // Tips and Additional Income
  tipsReceived: decimal("tips_received", { precision: 10, scale: 2 }).default("0"),
  additionalIncome: decimal("additional_income", { precision: 10, scale: 2 }).default("0"),
  additionalIncomeNotes: text("additional_income_notes"),
  
  // Period Information
  salaryPeriod: varchar("salary_period").notNull(), // "2025-01" format for monthly
  paidAt: timestamp("paid_at"),
  paidBy: varchar("paid_by").references(() => users.id),
  paymentReference: varchar("payment_reference"),
  paymentMethod: varchar("payment_method"), // bank_transfer, cash, paypal
  
  // Status
  status: varchar("status").default("pending"), // pending, paid, late
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Checklists & Guides
export const taskChecklists = pgTable("task_checklists", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Checklist Configuration
  name: varchar("name").notNull(),
  taskType: varchar("task_type").notNull(), // cleaning, pool-service, garden, maintenance, inspection
  department: varchar("department").notNull(), // cleaning, pool, garden, maintenance, general
  
  // Checklist Items
  items: jsonb("items").notNull(), // Array of checklist items with descriptions
  estimatedTime: integer("estimated_time"), // In minutes
  requiredPhotos: integer("required_photos").default(1),
  requiresComments: boolean("requires_comments").default(true),
  
  // Guides and Instructions
  instructions: text("instructions"),
  guideImageUrls: text("guide_image_urls").array().default([]),
  guidePdfUrl: varchar("guide_pdf_url"),
  safetyNotes: text("safety_notes"),
  
  // Property-specific customization
  propertyId: integer("property_id").references(() => properties.id), // null for default, specific for property override
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Completion Records with Enhanced Tracking
export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Completion Details
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // In minutes
  
  // Checklist Progress
  checklistId: integer("checklist_id").references(() => taskChecklists.id),
  completedItems: jsonb("completed_items"), // Array of completed checklist item IDs
  
  // Evidence & Documentation
  evidencePhotos: text("evidence_photos").array().default([]),
  completionNotes: text("completion_notes"),
  issuesFound: text("issues_found").array().default([]),
  
  // Expenses
  expenses: jsonb("expenses"), // Array of expense objects {item, amount, description}
  totalExpenseAmount: decimal("total_expense_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Quality & Rating
  qualityRating: integer("quality_rating"), // 1-5 rating if reviewed
  managerNotes: text("manager_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff Expense Tracking
export const staffExpenses = pgTable("staff_expenses", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Expense Details
  item: varchar("item").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  category: varchar("category").notNull(), // cleaning_supplies, tools, materials, fuel, other
  description: text("description"),
  
  // Receipt & Verification
  receiptUrl: varchar("receipt_url"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Reimbursement
  reimbursementStatus: varchar("reimbursement_status").default("pending"), // pending, approved, paid, rejected
  reimbursedAt: timestamp("reimbursed_at"),
  reimbursedBy: varchar("reimbursed_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for staff platform
export const insertStaffSalariesSchema = createInsertSchema(staffSalaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskChecklistsSchema = createInsertSchema(taskChecklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskCompletionsSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  createdAt: true,
});

export const insertStaffExpensesSchema = createInsertSchema(staffExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== REFERRAL AGENT TYPES =====

export type PropertyReferral = typeof propertyReferrals.$inferSelect;
export type InsertPropertyReferral = z.infer<typeof insertPropertyReferralSchema>;
export type ReferralEarnings = typeof referralEarnings.$inferSelect;
export type InsertReferralEarnings = z.infer<typeof insertReferralEarningsSchema>;
export type AgentPayout = typeof agentPayouts.$inferSelect;
export type InsertAgentPayout = z.infer<typeof insertAgentPayoutsSchema>;
export type ReferralProgramRule = typeof referralProgramRules.$inferSelect;
export type InsertReferralProgramRule = z.infer<typeof insertReferralProgramRulesSchema>;
export type PropertyAgent = typeof propertyAgents.$inferSelect;
export type InsertPropertyAgent = z.infer<typeof insertPropertyAgentsSchema>;

// Balance reset audit relations
export const balanceResetAuditRelations = relations(balanceResetAudit, ({ one }) => ({
  user: one(users, { fields: [balanceResetAudit.userId], references: [users.id], relationName: "balanceResets" }),
  adminUser: one(users, { fields: [balanceResetAudit.adminUserId], references: [users.id], relationName: "adminBalanceResets" }),
  property: one(properties, { fields: [balanceResetAudit.propertyId], references: [properties.id] }),
}));

// Balance reset audit insert schema and types
export const insertBalanceResetAuditSchema = createInsertSchema(balanceResetAudit).omit({
  id: true,
  createdAt: true,
});

export type BalanceResetAudit = typeof balanceResetAudit.$inferSelect;
export type InsertBalanceResetAudit = z.infer<typeof insertBalanceResetAuditSchema>;

// Utility Providers Relations
export const utilityProvidersRelations = relations(utilityProviders, ({ one, many }) => ({
  organization: one(organizations, { fields: [utilityProviders.organizationId], references: [organizations.id] }),
  createdByUser: one(users, { fields: [utilityProviders.createdBy], references: [users.id] }),
  propertySettings: many(propertyUtilitySettings),
}));

// Custom Expense Categories Relations
export const customExpenseCategoriesRelations = relations(customExpenseCategories, ({ one, many }) => ({
  organization: one(organizations, { fields: [customExpenseCategories.organizationId], references: [organizations.id] }),
  createdByUser: one(users, { fields: [customExpenseCategories.createdBy], references: [users.id] }),
  propertyExpenses: many(propertyCustomExpenses),
}));

// Property Utility Settings Relations
export const propertyUtilitySettingsRelations = relations(propertyUtilitySettings, ({ one }) => ({
  organization: one(organizations, { fields: [propertyUtilitySettings.organizationId], references: [organizations.id] }),
  property: one(properties, { fields: [propertyUtilitySettings.propertyId], references: [properties.id] }),
  provider: one(utilityProviders, { fields: [propertyUtilitySettings.providerId], references: [utilityProviders.id] }),
  createdByUser: one(users, { fields: [propertyUtilitySettings.createdBy], references: [users.id] }),
}));

// Property Custom Expenses Relations
export const propertyCustomExpensesRelations = relations(propertyCustomExpenses, ({ one }) => ({
  organization: one(organizations, { fields: [propertyCustomExpenses.organizationId], references: [organizations.id] }),
  property: one(properties, { fields: [propertyCustomExpenses.propertyId], references: [properties.id] }),
  category: one(customExpenseCategories, { fields: [propertyCustomExpenses.categoryId], references: [customExpenseCategories.id] }),
  createdByUser: one(users, { fields: [propertyCustomExpenses.createdBy], references: [users.id] }),
}));

// Utility and Custom Expense Insert Schemas
export const insertUtilityProviderSchema = createInsertSchema(utilityProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomExpenseCategorySchema = createInsertSchema(customExpenseCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyUtilitySettingsSchema = createInsertSchema(propertyUtilitySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyCustomExpensesSchema = createInsertSchema(propertyCustomExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Utility and Custom Expense Types
export type UtilityProvider = typeof utilityProviders.$inferSelect;
export type InsertUtilityProvider = z.infer<typeof insertUtilityProviderSchema>;
export type CustomExpenseCategory = typeof customExpenseCategories.$inferSelect;
export type InsertCustomExpenseCategory = z.infer<typeof insertCustomExpenseCategorySchema>;
export type PropertyUtilitySettings = typeof propertyUtilitySettings.$inferSelect;
export type InsertPropertyUtilitySettings = z.infer<typeof insertPropertyUtilitySettingsSchema>;
export type PropertyCustomExpenses = typeof propertyCustomExpenses.$inferSelect;
export type InsertPropertyCustomExpenses = z.infer<typeof insertPropertyCustomExpensesSchema>;

// ===== COMMISSION SYSTEM SCHEMAS AND TYPES =====

// Commission Log schema
export const insertCommissionLogSchema = createInsertSchema(commissionLog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Commission Invoice schemas
export const insertCommissionInvoicesSchema = createInsertSchema(commissionInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionInvoiceItemsSchema = createInsertSchema(commissionInvoiceItems).omit({
  id: true,
  createdAt: true,
});

// Commission types
export type CommissionLog = typeof commissionLog.$inferSelect;
export type InsertCommissionLog = z.infer<typeof insertCommissionLogSchema>;
export type CommissionInvoice = typeof commissionInvoices.$inferSelect;
export type InsertCommissionInvoice = z.infer<typeof insertCommissionInvoicesSchema>;
export type CommissionInvoiceItem = typeof commissionInvoiceItems.$inferSelect;
export type InsertCommissionInvoiceItem = z.infer<typeof insertCommissionInvoiceItemsSchema>;

// Enhanced Agent Booking type (with new fields)
export type AgentBooking = typeof agentBookings.$inferSelect;
export type InsertAgentBooking = typeof agentBookings.$inferInsert;

// ===== LOYALTY & MESSAGING SYSTEM SCHEMAS AND TYPES =====

// Insert schemas for loyalty system
export const insertGuestLoyaltyProfileSchema = createInsertSchema(guestLoyaltyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoyaltyTierSchema = createInsertSchema(loyaltyTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestMessageSchema = createInsertSchema(guestMessages).omit({
  id: true,
  createdAt: true,
});

export const insertMessagingTriggerSchema = createInsertSchema(messagingTriggers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmartReplySuggestionSchema = createInsertSchema(smartReplySuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertAiMessageAnalysisSchema = createInsertSchema(aiMessageAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertMessageDeliverySchema = createInsertSchema(messageDeliveries).omit({
  id: true,
  createdAt: true,
});

// Type definitions for loyalty system
export type GuestLoyaltyProfile = typeof guestLoyaltyProfiles.$inferSelect;
export type InsertGuestLoyaltyProfile = z.infer<typeof insertGuestLoyaltyProfileSchema>;
export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = z.infer<typeof insertLoyaltyTierSchema>;
export type GuestMessage = typeof guestMessages.$inferSelect;
export type InsertGuestMessage = z.infer<typeof insertGuestMessageSchema>;
export type MessagingTrigger = typeof messagingTriggers.$inferSelect;
export type InsertMessagingTrigger = z.infer<typeof insertMessagingTriggerSchema>;
export type SmartReplySuggestion = typeof smartReplySuggestions.$inferSelect;
export type InsertSmartReplySuggestion = z.infer<typeof insertSmartReplySuggestionSchema>;
export type AiMessageAnalysis = typeof aiMessageAnalysis.$inferSelect;
export type InsertAiMessageAnalysis = z.infer<typeof insertAiMessageAnalysisSchema>;
export type MessageDelivery = typeof messageDeliveries.$inferSelect;
export type InsertMessageDelivery = z.infer<typeof insertMessageDeliverySchema>;

// ===== PAYROLL, COMMISSION & INVOICE MANAGEMENT SYSTEM =====

// Enhanced Staff Payroll Tracking
export const staffPayrollRecords = pgTable("staff_payroll_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Payroll Period
  payrollPeriod: varchar("payroll_period").notNull(), // "2025-01" format
  payrollYear: integer("payroll_year").notNull(),
  payrollMonth: integer("payroll_month").notNull(),
  
  // Salary Components
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  taskBonuses: decimal("task_bonuses", { precision: 10, scale: 2 }).default("0"),
  commissionEarned: decimal("commission_earned", { precision: 10, scale: 2 }).default("0"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  tips: decimal("tips", { precision: 10, scale: 2 }).default("0"),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  
  // Deductions
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).default("0"),
  socialSecurity: decimal("social_security", { precision: 10, scale: 2 }).default("0"),
  
  // Total Calculations
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  
  // Payment Details
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, overdue
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method"), // bank_transfer, cash, check
  paymentReference: varchar("payment_reference"),
  paymentSlipUrl: varchar("payment_slip_url"),
  
  // Admin Actions
  processedBy: varchar("processed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio Manager Commission Tracking
export const portfolioManagerCommissions = pgTable("portfolio_manager_commissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  managerId: varchar("manager_id").references(() => users.id).notNull(),
  
  // Commission Period
  commissionPeriod: varchar("commission_period").notNull(), // "2025-01"
  commissionYear: integer("commission_year").notNull(),
  commissionMonth: integer("commission_month").notNull(),
  
  // Property Portfolio
  propertyIds: varchar("property_ids").array().notNull(),
  totalProperties: integer("total_properties").notNull(),
  
  // Revenue Data
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  managementFees: decimal("management_fees", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("50"), // 50%
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Performance Metrics
  averageOccupancy: decimal("average_occupancy", { precision: 5, scale: 2 }),
  averageReviewScore: decimal("average_review_score", { precision: 3, scale: 2 }),
  totalBookings: integer("total_bookings").default(0),
  
  // Payment Status
  payoutStatus: varchar("payout_status").default("pending"), // pending, approved, paid
  payoutRequestedAt: timestamp("payout_requested_at"),
  payoutApprovedAt: timestamp("payout_approved_at"),
  payoutPaidAt: timestamp("payout_paid_at"),
  
  // Invoice Generation
  invoiceGenerated: boolean("invoice_generated").default(false),
  invoiceNumber: varchar("invoice_number"),
  invoicePdfUrl: varchar("invoice_pdf_url"),
  
  // Admin Actions
  approvedBy: varchar("approved_by").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral Agent Commission Logs
export const referralAgentCommissionLogs = pgTable("referral_agent_commission_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  
  // Commission Period
  commissionPeriod: varchar("commission_period").notNull(), // "2025-01"
  commissionYear: integer("commission_year").notNull(),
  commissionMonth: integer("commission_month").notNull(),
  
  // Property Referrals
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  propertyName: varchar("property_name").notNull(),
  
  // Revenue Data
  managementRevenue: decimal("management_revenue", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10"), // 10%
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Property Performance
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }),
  averageReviewScore: decimal("average_review_score", { precision: 3, scale: 2 }),
  monthlyBookings: integer("monthly_bookings").default(0),
  
  // Payment Tracking
  paymentStatus: varchar("payment_status").default("pending"), // pending, requested, paid
  paymentRequestedAt: timestamp("payment_requested_at"),
  paymentConfirmedAt: timestamp("payment_confirmed_at"),
  paymentSlipUrl: varchar("payment_slip_url"),
  
  // Admin Actions
  processedBy: varchar("processed_by").references(() => users.id),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Universal Invoice Generator
export const universalInvoices = pgTable("universal_invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Invoice Details
  invoiceNumber: varchar("invoice_number").unique().notNull(),
  invoiceType: varchar("invoice_type").notNull(), // payroll, commission, service, reimbursement, custom
  
  // Parties
  fromName: varchar("from_name").notNull(),
  fromAddress: text("from_address"),
  fromEmail: varchar("from_email"),
  fromPhone: varchar("from_phone"),
  
  toName: varchar("to_name").notNull(),
  toAddress: text("to_address"),
  toEmail: varchar("to_email"),
  toPhone: varchar("to_phone"),
  
  // Invoice Content
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date"),
  description: text("description"),
  
  // Financial Details
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Currency & Payment
  currency: varchar("currency").default("THB"),
  paymentTerms: varchar("payment_terms"),
  paymentMethod: varchar("payment_method"),
  
  // Status
  status: varchar("status").default("draft"), // draft, sent, paid, overdue, cancelled
  
  // File Attachments
  invoicePdfUrl: varchar("invoice_pdf_url"),
  receiptUrl: varchar("receipt_url"),
  attachmentUrls: varchar("attachment_urls").array(),
  
  // Metadata
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  tags: varchar("tags").array(),
  relatedEntityType: varchar("related_entity_type"), // payroll, commission, property, booking
  relatedEntityId: varchar("related_entity_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice Line Items
export const universalInvoiceLineItems = pgTable("universal_invoice_line_items", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  invoiceId: integer("invoice_id").references(() => universalInvoices.id).notNull(),
  
  // Line Item Details
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  
  // Categorization
  category: varchar("category"), // cleaning, maintenance, commission, salary, bonus, reimbursement
  tags: varchar("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Confirmations & Slips
export const paymentConfirmations = pgTable("payment_confirmations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Payment Reference
  paymentType: varchar("payment_type").notNull(), // payroll, commission, invoice
  referenceEntityType: varchar("reference_entity_type").notNull(), // payroll_record, commission, invoice
  referenceEntityId: integer("reference_entity_id").notNull(),
  
  // Payment Details
  paymentAmount: decimal("payment_amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentReference: varchar("payment_reference"),
  
  // Bank/Transfer Details
  bankName: varchar("bank_name"),
  accountNumber: varchar("account_number"),
  transactionId: varchar("transaction_id"),
  
  // File Uploads
  paymentSlipUrl: varchar("payment_slip_url"),
  receiptUrl: varchar("receipt_url"),
  
  // Status & Confirmation
  confirmationStatus: varchar("confirmation_status").default("pending"), // pending, confirmed, disputed
  confirmedBy: varchar("confirmed_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== PAYROLL, COMMISSION & INVOICE SYSTEM SCHEMAS AND TYPES =====

// Insert schemas for payroll system
export const insertStaffPayrollRecordSchema = createInsertSchema(staffPayrollRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioManagerCommissionSchema = createInsertSchema(portfolioManagerCommissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralAgentCommissionLogSchema = createInsertSchema(referralAgentCommissionLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUniversalInvoiceSchema = createInsertSchema(universalInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUniversalInvoiceLineItemSchema = createInsertSchema(universalInvoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentConfirmationSchema = createInsertSchema(paymentConfirmations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for payroll system
export type StaffPayrollRecord = typeof staffPayrollRecords.$inferSelect;
export type InsertStaffPayrollRecord = z.infer<typeof insertStaffPayrollRecordSchema>;
export type PortfolioManagerCommission = typeof portfolioManagerCommissions.$inferSelect;
export type InsertPortfolioManagerCommission = z.infer<typeof insertPortfolioManagerCommissionSchema>;
export type ReferralAgentCommissionLog = typeof referralAgentCommissionLogs.$inferSelect;
export type InsertReferralAgentCommissionLog = z.infer<typeof insertReferralAgentCommissionLogSchema>;
export type UniversalInvoice = typeof universalInvoices.$inferSelect;
export type InsertUniversalInvoice = z.infer<typeof insertUniversalInvoiceSchema>;
export type UniversalInvoiceLineItem = typeof universalInvoiceLineItems.$inferSelect;
export type InsertUniversalInvoiceLineItem = z.infer<typeof insertUniversalInvoiceLineItemSchema>;
export type PaymentConfirmation = typeof paymentConfirmations.$inferSelect;
export type InsertPaymentConfirmation = z.infer<typeof insertPaymentConfirmationSchema>;

// ===== STAFF DASHBOARD TYPES =====


