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
  status: varchar("status").notNull().default("pending"), // pending, in-progress, completed, cancelled
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
