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
  real,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Guest Portal schemas from separate file to avoid conflicts
export * from "./guestPortalSchema";
import { relations, gte, lte, and, isNotNull, isNull } from "drizzle-orm";

// ===== MULTI-TENANT ARCHITECTURE =====
// Organizations table for multi-tenant support
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().notNull(), // UUID or company slug
  name: varchar("name").notNull(),
  domain: varchar("domain").unique().notNull(), // company.hostpilotpro.com
  subdomain: varchar("subdomain").unique().notNull(), // company
  companyLogo: varchar("company_logo"),
  customDomain: varchar("custom_domain"), // client's custom domain like myproperty.com
  brandingLogoUrl: text("branding_logo_url"), // client's custom branding logo
  themeColor: varchar("theme_color").default("#0066ff"), // client's custom theme color
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

// API connections configuration for SaaS multi-tenant
export const apiConnections = pgTable("api_connections", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  service: varchar("service").notNull(), // stripe, hostaway, openai, twilio
  name: varchar("name").notNull(),
  status: varchar("status").default("disconnected"), // connected, disconnected, error
  lastTested: timestamp("last_tested"),
  lastError: text("last_error"),
  isActive: boolean("is_active").default(true),
  hasCredentials: boolean("has_credentials").default(false),
  configuration: jsonb("configuration"), // service-specific settings
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_api_connections_org").on(table.organizationId),
  index("IDX_api_connections_service").on(table.service),
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
  password: text("password"), // For secure authentication
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

// ===== COMPREHENSIVE USER MANAGEMENT SYSTEM =====

// Enhanced User table with comprehensive role-based access control
export const userManagement = pgTable("user_management", {
  id: varchar("id").primaryKey().notNull(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  
  // Role System
  primaryRole: varchar("primary_role").notNull(), // admin, portfolio_manager, owner, retail_agent, referral_agent, housekeeping, maintenance, supervisor
  subRole: varchar("sub_role"), // Additional role specificity
  
  // Listing Access Control
  listingsAccess: jsonb("listings_access").default([]), // Array of villa IDs: ["villa_majesta", "villa_tramonto"]
  
  // Groups System
  groups: jsonb("groups").default([]), // Custom groups: ["Property Owners", "Adam Portfolio"]
  
  // Notification Preferences
  dashboardAlerts: boolean("dashboard_alerts").default(true),
  emailAlerts: boolean("email_alerts").default(true),
  smsAlerts: boolean("sms_alerts").default(false),
  
  // Status and Activity
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  lastSeenAt: timestamp("last_seen_at"),
  
  // Security and Audit
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_user_mgmt_org").on(table.organizationId),
  index("IDX_user_mgmt_email").on(table.email),
  index("IDX_user_mgmt_role").on(table.primaryRole),
]);

// User Permission Matrix
export const userPermissionsMatrix = pgTable("user_permissions_matrix", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  
  // Module Permissions
  module: varchar("module").notNull(), // listings, reservations, owner_stays, calendar, booking_engine, financial_reporting, expenses_extras, owner_statements, channel_manager
  
  // Access Level Permissions
  canView: boolean("can_view").default(false),
  canModify: boolean("can_modify").default(false),
  canCreate: boolean("can_create").default(false),
  canDelete: boolean("can_delete").default(false),
  
  // Special Permissions
  canImpersonate: boolean("can_impersonate").default(false), // God mode for admins
  canAccessAllListings: boolean("can_access_all_listings").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_permissions_user").on(table.userId),
  index("IDX_permissions_module").on(table.module),
  index("IDX_permissions_org").on(table.organizationId),
]);

// User Groups for organizing users
export const userGroups = pgTable("user_groups", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  color: varchar("color").default("#3B82F6"), // Hex color for UI
  icon: varchar("icon").default("Users"), // Lucide icon name
  
  // Group-specific settings
  defaultPermissions: jsonb("default_permissions").default({}),
  listingsAccess: jsonb("listings_access").default([]),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_groups_org").on(table.organizationId),
  index("IDX_groups_name").on(table.name),
]);

// User Group Memberships
export const userGroupMemberships = pgTable("user_group_memberships", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  groupId: integer("group_id").references(() => userGroups.id).notNull(),
  role: varchar("role").default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  index("IDX_membership_user").on(table.userId),
  index("IDX_membership_group").on(table.groupId),
  index("IDX_membership_org").on(table.organizationId),
]);

// User Activity Logs for auditing
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id),
  impersonatedUserId: varchar("impersonated_user_id").references(() => userManagement.id), // For God mode tracking
  
  action: varchar("action").notNull(), // login, logout, view, create, update, delete, impersonate
  module: varchar("module"), // Which module was accessed
  resourceId: varchar("resource_id"), // ID of the resource that was acted upon
  resourceType: varchar("resource_type"), // Type of resource (listing, reservation, etc.)
  
  details: jsonb("details"), // Additional context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_activity_user").on(table.userId),
  index("IDX_activity_timestamp").on(table.timestamp),
  index("IDX_activity_org").on(table.organizationId),
]);

// User roles and sub-roles (keeping existing for compatibility)
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  primaryRole: varchar("primary_role").notNull(), // admin, portfolio-manager, owner, staff, retail-agent, referral-agent, freelancer
  subRole: varchar("sub_role"), // For staff: housekeeping, host, supervisor, gardener, handyman, pool, pest; For freelancer: electrician, contractor, plumber, pest, chef, spa, nanny, maid
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_user_role_org").on(table.organizationId),
  index("IDX_user_role_user").on(table.userId),
]);

// Role definitions and permissions
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  roleId: varchar("role_id").notNull(), // admin, portfolio-manager, owner, staff, etc.
  roleName: varchar("role_name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // Module permissions object
  isCustom: boolean("is_custom").default(false), // Whether it's a custom role
  userCount: integer("user_count").default(0), // Number of users with this role
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_role_perm_org").on(table.organizationId),
  index("IDX_role_perm_role").on(table.roleId),
]);

// User-specific permission overrides
export const userPermissionOverrides = pgTable("user_permission_overrides", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  moduleCategory: varchar("module_category").notNull(), // financials, maintenance, bookings, documents, addons
  moduleName: varchar("module_name").notNull(), // specific module name
  permission: varchar("permission").notNull(), // none, view, edit
  isOverride: boolean("is_override").default(true), // true if overriding default role permission
  grantedBy: varchar("granted_by").references(() => userManagement.id),
  reason: text("reason"), // Why this override was granted
  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_perm_override_org").on(table.organizationId),
  index("IDX_perm_override_user").on(table.userId),
  index("IDX_perm_override_module").on(table.moduleCategory, table.moduleName),
]);

// Staff-specific permissions for task creation and management
export const staffTaskPermissions = pgTable("staff_task_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffUserId: varchar("staff_user_id").references(() => users.id).notNull(),
  canCreateTasks: boolean("can_create_tasks").default(false),
  canEditOwnTasks: boolean("can_edit_own_tasks").default(true),
  canDeleteOwnTasks: boolean("can_delete_own_tasks").default(false),
  canViewAllTasks: boolean("can_view_all_tasks").default(true),
  maxTasksPerDay: integer("max_tasks_per_day").default(5),
  allowedDepartments: jsonb("allowed_departments"), // Array of departments staff can create tasks for
  requiresApproval: boolean("requires_approval").default(true), // Whether staff-created tasks need admin approval
  grantedBy: varchar("granted_by").references(() => users.id).notNull(),
  reason: text("reason"), // Why this permission was granted
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_staff_task_perm_org").on(table.organizationId),
  index("IDX_staff_task_perm_user").on(table.staffUserId),
  index("IDX_staff_task_perm_active").on(table.isActive),
]);

// Permission presets/templates for quick role assignment
export const permissionPresets = pgTable("permission_presets", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  presetName: varchar("preset_name").notNull(),
  description: text("description"),
  targetRole: varchar("target_role").notNull(), // which role this preset is for
  permissions: jsonb("permissions").notNull(), // Complete permissions structure
  isDefault: boolean("is_default").default(false), // Whether this is the default for the role
  createdBy: varchar("created_by").references(() => userManagement.id),
  usageCount: integer("usage_count").default(0), // How many times it's been applied
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_perm_preset_org").on(table.organizationId),
  index("IDX_perm_preset_role").on(table.targetRole),
]);

// User permissions for granular access control
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleAccess: jsonb("module_access").notNull(), // JSON object with permission flags
  // Module access includes: bookingsView, financialReports, taskAccess, guestChat, 
  // utilitiesView, propertyEditor, documentsModule, calendarAccess, salaryVisibility,
  // photoSubmission, maintenanceLogs, fileUpload, notifications, reservationNotes, chatWall
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
}, (table) => [
  index("IDX_user_perm_org").on(table.organizationId),
  index("IDX_user_perm_user").on(table.userId),
]);

// Property assignments for users
export const userPropertyAssignments = pgTable("user_property_assignments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  assignmentType: varchar("assignment_type").notNull(), // permanent, temporary, project-based
  startDate: date("start_date"),
  endDate: date("end_date"), // NULL for permanent assignments
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("IDX_user_prop_org").on(table.organizationId),
  index("IDX_user_prop_user").on(table.userId),
  index("IDX_user_prop_property").on(table.propertyId),
]);

// Freelancer availability calendar
export const freelancerAvailability = pgTable("freelancer_availability", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  freelancerId: varchar("freelancer_id").references(() => users.id).notNull(),
  availableDate: date("available_date").notNull(),
  timeSlots: jsonb("time_slots").notNull(), // Array of available time slots
  isAvailable: boolean("is_available").default(true),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_freelancer_avail_org").on(table.organizationId),
  index("IDX_freelancer_avail_user").on(table.freelancerId),
  index("IDX_freelancer_avail_date").on(table.availableDate),
]);

// Freelancer task requests
export const freelancerTaskRequests = pgTable("freelancer_task_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  freelancerId: varchar("freelancer_id").references(() => users.id).notNull(),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  taskTitle: varchar("task_title").notNull(),
  taskDescription: text("task_description"),
  serviceCategory: varchar("service_category").notNull(), // electrician, plumber, chef, etc.
  proposedDate: date("proposed_date").notNull(),
  proposedTimeStart: varchar("proposed_time_start").notNull(), // HH:MM format
  proposedTimeEnd: varchar("proposed_time_end").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  status: varchar("status").default("pending"), // pending, confirmed, declined, counter_proposed, completed
  freelancerResponse: text("freelancer_response"),
  counterProposedDate: date("counter_proposed_date"),
  counterProposedTimeStart: varchar("counter_proposed_time_start"),
  counterProposedTimeEnd: varchar("counter_proposed_time_end"),
  confirmedDate: date("confirmed_date"),
  confirmedTimeStart: varchar("confirmed_time_start"),
  confirmedTimeEnd: varchar("confirmed_time_end"),
  completedAt: timestamp("completed_at"),
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_freelancer_req_org").on(table.organizationId),
  index("IDX_freelancer_req_freelancer").on(table.freelancerId),
  index("IDX_freelancer_req_requester").on(table.requestedBy),
  index("IDX_freelancer_req_status").on(table.status),
]);

// ===== PROPERTY VISIBILITY CONTROL SYSTEM =====

// Property access permissions for granular user control
export const propertyAccessControl = pgTable("property_access_control", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Access levels
  canView: boolean("can_view").default(false),
  canManage: boolean("can_manage").default(false),
  canReceiveTasks: boolean("can_receive_tasks").default(false),
  
  // Owner-specific module toggles
  hasFinancialAccess: boolean("has_financial_access").default(true),
  hasMaintenanceAccess: boolean("has_maintenance_access").default(true),
  hasGuestBookingAccess: boolean("has_guest_booking_access").default(true),
  hasUtilitiesAccess: boolean("has_utilities_access").default(true),
  hasPropertyInfoAccess: boolean("has_property_info_access").default(true),
  hasServiceOrderAccess: boolean("has_service_order_access").default(true),
  
  assignedBy: varchar("assigned_by").references(() => userManagement.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_property_access_org").on(table.organizationId),
  index("IDX_property_access_user").on(table.userId),
  index("IDX_property_access_property").on(table.propertyId),
]);

// Bulk access control templates for role-based assignments
export const propertyAccessTemplates = pgTable("property_access_templates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  templateName: varchar("template_name").notNull(),
  targetRole: varchar("target_role").notNull(), // owner, staff, manager, agent
  description: text("description"),
  
  // Default permissions for this template
  defaultCanView: boolean("default_can_view").default(false),
  defaultCanManage: boolean("default_can_manage").default(false),
  defaultCanReceiveTasks: boolean("default_can_receive_tasks").default(false),
  
  // Owner-specific defaults
  defaultFinancialAccess: boolean("default_financial_access").default(true),
  defaultMaintenanceAccess: boolean("default_maintenance_access").default(true),
  defaultGuestBookingAccess: boolean("default_guest_booking_access").default(true),
  defaultUtilitiesAccess: boolean("default_utilities_access").default(true),
  defaultPropertyInfoAccess: boolean("default_property_info_access").default(true),
  defaultServiceOrderAccess: boolean("default_service_order_access").default(true),
  
  createdBy: varchar("created_by").references(() => userManagement.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_access_template_org").on(table.organizationId),
  index("IDX_access_template_role").on(table.targetRole),
]);

// Property visibility matrix for admin dashboard display
export const propertyVisibilityMatrix = pgTable("property_visibility_matrix", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  
  // Computed fields for dashboard display
  propertiesLinked: jsonb("properties_linked").default([]), // Array of property IDs
  accessLevel: varchar("access_level").default("read-only"), // read-only, partial, full
  lastUpdated: timestamp("last_updated").defaultNow(),
  lastUpdatedBy: varchar("last_updated_by").references(() => userManagement.id),
  
  // Quick action flags
  hasFullAccess: boolean("has_full_access").default(false),
  hasRestrictedAccess: boolean("has_restricted_access").default(false),
  requiresReview: boolean("requires_review").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_visibility_matrix_org").on(table.organizationId),
  index("IDX_visibility_matrix_user").on(table.userId),
  index("IDX_visibility_matrix_access").on(table.accessLevel),
]);

// User session permissions cache for real-time sync
export const userSessionPermissions = pgTable("user_session_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => userManagement.id).notNull(),
  sessionId: varchar("session_id"), // For real-time updates
  
  // Cached permission data for fast access
  permissionsCache: jsonb("permissions_cache").notNull(), // Full permissions object
  propertyAccessCache: jsonb("property_access_cache").notNull(), // Property-specific permissions
  
  // Sync tracking
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  syncVersion: integer("sync_version").default(1),
  isActive: boolean("is_active").default(true),
  
  expiresAt: timestamp("expires_at"), // Session expiration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_session_perm_org").on(table.organizationId),
  index("IDX_session_perm_user").on(table.userId),
  index("IDX_session_perm_session").on(table.sessionId),
  index("IDX_session_perm_expires").on(table.expiresAt),
]);

// User activity audit log
export const userActivityAudit = pgTable("user_activity_audit", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // login, logout, role_change, permission_update, property_assignment
  details: jsonb("details"), // Additional details about the action
  oldValue: text("old_value"), // For tracking changes
  newValue: text("new_value"),
  performedBy: varchar("performed_by").references(() => users.id), // Who made the change
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("IDX_audit_org").on(table.organizationId),
  index("IDX_audit_user").on(table.userId),
  index("IDX_audit_action").on(table.action),
  index("IDX_audit_timestamp").on(table.timestamp),
]);

// User invitations for freelancers and new users
export const userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  email: varchar("email").notNull(),
  inviteCode: varchar("invite_code").notNull().unique(),
  roleAssignment: varchar("role_assignment").notNull(), // The role they'll get when they accept
  subRoleAssignment: varchar("sub_role_assignment"), // Sub-role for staff/freelancer
  propertyAssignments: jsonb("property_assignments"), // Array of property IDs to assign
  modulePermissions: jsonb("module_permissions"), // Permissions they'll get
  expiresAt: timestamp("expires_at"), // Optional expiration
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedByUserId: varchar("accepted_by_user_id").references(() => users.id),
  status: varchar("status").default("pending"), // pending, accepted, expired, revoked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_invite_org").on(table.organizationId),
  index("IDX_invite_email").on(table.email),
  index("IDX_invite_code").on(table.inviteCode),
  index("IDX_invite_status").on(table.status),
]);

// User performance tracking
export const userPerformanceMetrics = pgTable("user_performance_metrics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  periodMonth: integer("period_month").notNull(), // 1-12
  periodYear: integer("period_year").notNull(),
  tasksCompleted: integer("tasks_completed").default(0),
  tasksOnTime: integer("tasks_on_time").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Out of 5.00
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }),
  responseTimeHours: decimal("response_time_hours", { precision: 5, scale: 2 }),
  clientSatisfactionScore: decimal("client_satisfaction_score", { precision: 3, scale: 2 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
}, (table) => [
  index("IDX_perf_org").on(table.organizationId),
  index("IDX_perf_user").on(table.userId),
  index("IDX_perf_period").on(table.periodYear, table.periodMonth),
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
  googleMapsLink: text("google_maps_link"), // Custom Google Maps link or embed HTML
  ownerId: varchar("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_property_org").on(table.organizationId),
  index("IDX_property_owner").on(table.ownerId),
  index("IDX_property_external").on(table.externalId),
]);

export const tasks: any = pgTable("tasks", {
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

// Task Checklists for different task types
export const taskChecklists = pgTable("task_checklists", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskType: varchar("task_type").notNull(), // cleaning, maintenance, pool, garden, inspection
  department: varchar("department").notNull(), // cleaning, maintenance, pool, garden, general
  checklistName: varchar("checklist_name").notNull(),
  checklistItems: text("checklist_items").array().notNull(), // Array of checklist items
  isDefault: boolean("is_default").default(false), // Whether this is the default checklist for this type
  propertyId: integer("property_id").references(() => properties.id), // NULL for organization-wide, specific for property-specific
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property-specific guides (e.g., special equipment instructions)
export const propertyGuides = pgTable("property_guides", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guideName: varchar("guide_name").notNull(),
  guideContent: text("guide_content").notNull(),
  category: varchar("category").notNull(), // equipment, procedures, safety, special-instructions
  department: varchar("department"), // cleaning, maintenance, pool, garden, general
  attachments: text("attachments").array().default([]), // File paths for images/documents
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-suggested tasks based on bookings, feedback, etc.
export const aiTaskSuggestions = pgTable("ai_task_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  suggestedTaskType: varchar("suggested_task_type").notNull(),
  department: varchar("department").notNull(),
  priority: varchar("priority").notNull().default("medium"),
  reason: text("reason").notNull(), // Why AI suggested this task
  triggerData: text("trigger_data"), // JSON data about what triggered the suggestion
  suggestedDate: timestamp("suggested_date"),
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, auto-created
  createdTaskId: integer("created_task_id").references(() => tasks.id), // If suggestion was accepted
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced AI Task Suggestions with Review Analysis
export const enhancedAiSuggestions = pgTable("enhanced_ai_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  suggestionType: varchar("suggestion_type").notNull(), // 'review-feedback', 'long-stay', 'maintenance-due', 'manual'
  sourceData: jsonb("source_data"), // original review/feedback data
  suggestedTaskType: varchar("suggested_task_type").notNull(),
  suggestedTitle: varchar("suggested_title").notNull(),
  suggestedDescription: text("suggested_description"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  urgencyLevel: varchar("urgency_level").default("medium"), // 'low', 'medium', 'high', 'urgent'
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  aiAnalysis: text("ai_analysis"),
  notificationRouting: jsonb("notification_routing"), // who to notify (roles/specific users)
  escalationLevel: integer("escalation_level").default(0), // 0=new, 1=24hr, 2=48hr, 3=escalated
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected', 'auto-created'
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdTaskId: integer("created_task_id").references(() => tasks.id),
  triggerKeywords: jsonb("trigger_keywords"), // keywords that triggered the suggestion
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Timeline Feed (Logbook)
export const propertyTimeline = pgTable("property_timeline", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  eventType: varchar("event_type").notNull(), // 'checkin', 'checkout', 'cleaning', 'maintenance', 'garden', 'suggestion', 'manual-note'
  title: varchar("title").notNull(),
  description: text("description"),
  emoji: varchar("emoji"), // for visual representation
  linkedId: integer("linked_id"), // booking_id, task_id, or suggestion_id
  linkedType: varchar("linked_type"), // 'booking', 'task', 'suggestion', 'manual'
  attachments: jsonb("attachments"), // photos, documents
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdByRole: varchar("created_by_role"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== INVENTORY MANAGEMENT SYSTEM =====
// Inventory Items - Master list of supplies and materials
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  itemName: varchar("item_name").notNull(),
  itemType: varchar("item_type"), // linens, cleaning-supplies, toiletries, food-beverage, maintenance, electronics, welcome-packs
  unit: varchar("unit").notNull().default("unit"), // unit, bottle, liter, kg, meter, roll, pack
  defaultPrice: decimal("default_price", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_inventory_items_org").on(table.organizationId),
  index("IDX_inventory_items_type").on(table.itemType),
  index("IDX_inventory_items_active").on(table.isActive),
]);

// Inventory Usage Logs - Track usage of items during tasks
export const inventoryUsageLogs = pgTable("inventory_usage_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  propertyId: integer("property_id").references(() => properties.id),
  itemId: integer("item_id").references(() => inventoryItems.id),
  quantityUsed: integer("quantity_used").notNull(),
  costTotal: decimal("cost_total", { precision: 10, scale: 2 }),
  usedBy: varchar("used_by").references(() => users.id),
  usageType: varchar("usage_type").default("checkout-clean"), // checkout-clean, maintenance, guest-amenity, welcome-pack, emergency
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_inventory_usage_org").on(table.organizationId),
  index("IDX_inventory_usage_task").on(table.taskId),
  index("IDX_inventory_usage_property").on(table.propertyId),
  index("IDX_inventory_usage_item").on(table.itemId),
  index("IDX_inventory_usage_user").on(table.usedBy),
  index("IDX_inventory_usage_type").on(table.usageType),
]);

// Smart Notification Routing
export const smartNotifications = pgTable("smart_notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  recipientId: varchar("recipient_id").references(() => users.id).notNull(),
  recipientRole: varchar("recipient_role").notNull(),
  notificationType: varchar("notification_type").notNull(), // 'ai-suggestion', 'escalation', 'approval-request', 'timeline-update'
  title: varchar("title").notNull(),
  message: text("message"),
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  sourceId: integer("source_id"), // ai_suggestion_id, task_id, etc.
  sourceType: varchar("source_type"), // 'ai_suggestion', 'task', 'timeline'
  actionRequired: boolean("action_required").default(false),
  actionButtons: jsonb("action_buttons"), // approve/reject buttons with actions
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  autoEscalateAt: timestamp("auto_escalate_at"), // when to escalate if no action
  createdAt: timestamp("created_at").defaultNow(),
});

// Fast Action Suggestions & Approvals
export const fastActionSuggestions = pgTable("fast_action_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  suggestedBy: varchar("suggested_by").references(() => users.id).notNull(),
  suggestedByRole: varchar("suggested_by_role").notNull(),
  actionType: varchar("action_type").notNull(), // 'purchase', 'repair', 'replace', 'service'
  title: varchar("title").notNull(),
  description: text("description"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  urgency: varchar("urgency").default("medium"),
  attachments: jsonb("attachments"), // photos, quotes
  requiresApproval: boolean("requires_approval").default(true),
  approvalLevel: varchar("approval_level").default("manager"), // 'owner', 'manager', 'admin'
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected', 'completed'
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task expenses tracking
export const taskExpenses = pgTable("task_expenses", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  itemName: varchar("item_name").notNull(),
  category: varchar("category").notNull(), // supplies, tools, materials, services
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("THB"),
  receipt: varchar("receipt"), // File path for receipt image
  notes: text("notes"),
  addedBy: varchar("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task archiving for performance and PDF export
export const archivedTasks = pgTable("archived_tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  originalTaskId: integer("original_task_id").notNull(),
  taskData: text("task_data").notNull(), // JSON serialized task data
  archiveMonth: varchar("archive_month").notNull(), // YYYY-MM format
  propertyId: integer("property_id"),
  archivedAt: timestamp("archived_at").defaultNow(),
  pdfExported: boolean("pdf_exported").default(false),
  exportedAt: timestamp("exported_at"),
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

// Task Proof Uploads
export const taskProofUploads = pgTable("task_proof_uploads", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  uploadType: varchar("upload_type").notNull(), // before, after, evidence, receipt
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
}, (table) => [
  index("IDX_task_proof_task").on(table.taskId),
  index("IDX_task_proof_property").on(table.propertyId),
  index("IDX_task_proof_date").on(table.uploadedAt),
]);

// Monthly Export Logs
export const monthlyExportLogs = pgTable("monthly_export_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  exportMonth: varchar("export_month").notNull(), // YYYY-MM format
  exportType: varchar("export_type").notNull(), // task-logs, maintenance-report, full-report
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"), // in bytes
  taskCount: integer("task_count").default(0),
  photoCount: integer("photo_count").default(0),
  exportStatus: varchar("export_status").default("processing"), // processing, completed, failed
  errorMessage: text("error_message"),
  cloudStorageUrl: varchar("cloud_storage_url"), // Google Drive URL
  exportedBy: varchar("exported_by").references(() => users.id),
  exportedAt: timestamp("exported_at").defaultNow(),
  retentionDate: timestamp("retention_date"), // when to delete from local storage
}, (table) => [
  index("IDX_monthly_exports_property").on(table.propertyId),
  index("IDX_monthly_exports_month").on(table.exportMonth),
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  externalId: varchar("external_id"), // ID from external system (Hostaway, etc.)
  bookingReference: varchar("booking_reference").unique(), // Guest portal access reference
  propertyId: integer("property_id").references(() => properties.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  
  // OTA Dual Commission Tracking
  guestTotalPrice: decimal("guest_total_price", { precision: 10, scale: 2 }), // What guest paid to OTA
  platformPayout: decimal("platform_payout", { precision: 10, scale: 2 }), // What host receives after OTA commission
  otaCommissionAmount: decimal("ota_commission_amount", { precision: 10, scale: 2 }), // OTA commission deducted
  otaCommissionPercentage: decimal("ota_commission_percentage", { precision: 5, scale: 2 }), // OTA commission rate
  bookingPlatform: varchar("booking_platform").default("direct"), // airbnb, vrbo, booking_com, direct
  
  // Revenue Transparency Fields
  stripeFees: decimal("stripe_fees", { precision: 10, scale: 2 }), // Payment processing fees
  netHostPayout: decimal("net_host_payout", { precision: 10, scale: 2 }), // Final amount after all fees
  manualOverride: boolean("manual_override").default(false), // True if manually entered
  overrideReason: text("override_reason"), // Why manual entry was needed
  revenueVerified: boolean("revenue_verified").default(false), // Verified against bank/Stripe
  
  // Legacy field for backward compatibility
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }), // Will map to platformPayout for existing data
  
  currency: varchar("currency").default("AUD"),
  status: varchar("status").notNull().default("confirmed"), // pending, confirmed, checked-in, checked-out, cancelled
  hostawayId: varchar("hostaway_id"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Service Requests linked to bookings
export const guestServiceRequests = pgTable("guest_service_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  reservationId: varchar("reservation_id").notNull(), // e.g., Demo1234
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Request Details
  requestType: varchar("request_type").notNull(), // extra_bed, baby_cot, early_checkin, late_checkout, massage, chef, cleaning, amenities
  serviceName: varchar("service_name").notNull(),
  description: text("description"),
  requestedDate: date("requested_date"),
  requestedTime: varchar("requested_time"),
  
  // Billing and Assignment
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  billingAssignment: varchar("billing_assignment").default("guest"), // guest, owner, company, complimentary
  
  // Status and Processing
  status: varchar("status").default("requested"), // requested, approved, scheduled, in_progress, completed, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  
  // Task Integration
  createdTaskId: integer("created_task_id").references(() => tasks.id),
  assignedDepartment: varchar("assigned_department"), // housekeeping, spa, kitchen, host
  assignedTo: varchar("assigned_to").references(() => users.id),
  
  // Guest Communication
  guestNotes: text("guest_notes"),
  staffNotes: text("staff_notes"),
  isVisible: boolean("is_visible").default(true), // Visible to guest
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_guest_service_booking").on(table.bookingId),
  index("IDX_guest_service_reservation").on(table.reservationId),
  index("IDX_guest_service_property").on(table.propertyId),
]);

// Confirmed Services & Requests visible to guests
export const guestConfirmedServices = pgTable("guest_confirmed_services", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  reservationId: varchar("reservation_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Service Information
  serviceType: varchar("service_type").notNull(), // request, addon_service, property_service
  serviceName: varchar("service_name").notNull(),
  serviceDescription: text("service_description"),
  
  // Scheduling
  scheduledDate: date("scheduled_date"),
  scheduledTime: varchar("scheduled_time"),
  duration: integer("duration"), // in minutes
  
  // Visibility and Status
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  
  // Integration
  linkedTaskId: integer("linked_task_id").references(() => tasks.id),
  linkedServiceRequestId: integer("linked_service_request_id").references(() => guestServiceRequests.id),
  linkedAddonBookingId: integer("linked_addon_booking_id").references(() => addonBookings.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_confirmed_service_booking").on(table.bookingId),
  index("IDX_confirmed_service_reservation").on(table.reservationId),
  index("IDX_confirmed_service_date").on(table.scheduledDate),
]);

// Enhanced Tasks with Booking Integration
export const bookingLinkedTasks = pgTable("booking_linked_tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  reservationId: varchar("reservation_id"), // e.g., Demo1234
  
  // Task-Booking Relationship
  taskCategory: varchar("task_category").notNull(), // pre_arrival, checkin, during_stay, checkout, post_departure
  isGuestVisible: boolean("is_guest_visible").default(false),
  guestDescription: text("guest_description"), // Guest-friendly description
  
  // Service Request Integration
  serviceRequestId: integer("service_request_id").references(() => guestServiceRequests.id),
  isServiceGenerated: boolean("is_service_generated").default(false), // Created from guest request
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_booking_task_booking").on(table.bookingId),
  index("IDX_booking_task_reservation").on(table.reservationId),
  index("IDX_booking_task_category").on(table.taskCategory),
]);

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

// OTA Payout Logic - Smart Revenue Tracking
export const otaPayoutRules = pgTable("ota_payout_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  otaPlatform: varchar("ota_platform").notNull(), // airbnb, booking_com, vrbo, direct
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }), // Platform's typical commission %
  useHostawayPayout: boolean("use_hostaway_payout").default(true),
  manualPayoutOverride: boolean("manual_payout_override").default(false),
  alertOnPayoutMissing: boolean("alert_on_payout_missing").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const otaBookingPayouts = pgTable("ota_booking_payouts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  reservationCode: varchar("reservation_code").notNull(),
  guestName: varchar("guest_name").notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  otaPlatform: varchar("ota_platform").notNull(), // airbnb, booking_com, vrbo, direct
  guestPaidAmount: decimal("guest_paid_amount", { precision: 10, scale: 2 }).notNull(),
  netPayoutAmount: decimal("net_payout_amount", { precision: 10, scale: 2 }).notNull(),
  otaCommissionAmount: decimal("ota_commission_amount", { precision: 10, scale: 2 }).notNull(),
  otaCommissionRate: decimal("ota_commission_rate", { precision: 5, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  payoutStatus: varchar("payout_status").notNull().default("pending"), // pending, confirmed, received, discrepancy
  payoutConfirmedAt: timestamp("payout_confirmed_at"),
  payoutConfirmedBy: varchar("payout_confirmed_by").references(() => users.id),
  hostawaySync: boolean("hostaway_sync").default(false),
  emailParsed: boolean("email_parsed").default(false),
  manualOverride: boolean("manual_override").default(false),
  overrideReason: text("override_reason"),
  overrideBy: varchar("override_by").references(() => users.id),
  overrideAt: timestamp("override_at"),
  notes: text("notes"),
  alertGenerated: boolean("alert_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const otaPayoutAlerts = pgTable("ota_payout_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  bookingPayoutId: integer("booking_payout_id").references(() => otaBookingPayouts.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type").notNull(), // payout_missing, payout_discrepancy, manual_review_needed
  alertMessage: text("alert_message").notNull(),
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otaRevenueReports = pgTable("ota_revenue_reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  reportPeriod: varchar("report_period").notNull(), // monthly, quarterly, yearly
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalGrossRevenue: decimal("total_gross_revenue", { precision: 12, scale: 2 }).notNull(),
  totalNetPayout: decimal("total_net_payout", { precision: 12, scale: 2 }).notNull(),
  totalOtaCommissions: decimal("total_ota_commissions", { precision: 12, scale: 2 }).notNull(),
  totalBookings: integer("total_bookings").notNull(),
  averageOtaCommissionRate: decimal("average_ota_commission_rate", { precision: 5, scale: 2 }),
  platformBreakdown: json("platform_breakdown"), // JSON with per-platform stats
  generatedBy: varchar("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow(),
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

// Emergency Water Truck Deliveries
export const emergencyWaterDeliveries = pgTable("emergency_water_deliveries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  deliveryDate: date("delivery_date").notNull(),
  volumeLiters: integer("volume_liters").notNull(), // Volume in liters
  costTHB: decimal("cost_thb", { precision: 10, scale: 2 }).notNull(), // Cost in THB
  costPerLiter: decimal("cost_per_liter", { precision: 10, scale: 4 }).notNull(), // Auto-calculated THB per liter
  supplierName: varchar("supplier_name"), // Optional supplier/company name
  receiptUrl: varchar("receipt_url"), // File upload URL
  notes: text("notes"), // Additional notes
  linkedGuestBooking: varchar("linked_guest_booking"), // Optional guest association
  linkedEvent: varchar("linked_event"), // Optional event association
  deliveryType: varchar("delivery_type").notNull().default("unexpected"), // "unexpected", "preventable", "planned"
  billingType: varchar("billing_type").notNull().default("owner_billable"), // "owner_billable", "company_expense", "guest_billable"
  processedBy: varchar("processed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id), // Manager/Admin approval
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "billed", "completed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Water Delivery Alerts and Recommendations
export const waterDeliveryAlerts = pgTable("water_delivery_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  alertType: varchar("alert_type").notNull(), // "frequent_delivery", "upgrade_suggestion", "cost_warning"
  alertTitle: varchar("alert_title").notNull(),
  alertMessage: text("alert_message").notNull(),
  severity: varchar("severity").notNull().default("medium"), // "low", "medium", "high", "critical"
  triggerCount: integer("trigger_count").notNull(), // Number of deliveries that triggered this alert
  triggerPeriodDays: integer("trigger_period_days").notNull(), // Period in days (30, 60, 90)
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }), // Total cost during trigger period
  recommendationAI: text("recommendation_ai"), // AI-generated recommendation
  isAcknowledged: boolean("is_acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Water Infrastructure Upgrade Suggestions
export const waterUpgradeSuggestions = pgTable("water_upgrade_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  upgradeType: varchar("upgrade_type").notNull(), // "deep_well", "tank_expansion", "water_conservation", "filtration_system"
  currentIssue: text("current_issue").notNull(),
  suggestedSolution: text("suggested_solution").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  estimatedSavingsPerYear: decimal("estimated_savings_per_year", { precision: 10, scale: 2 }),
  paybackPeriodMonths: integer("payback_period_months"),
  priority: varchar("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  basedOnDeliveries: integer("based_on_deliveries").notNull(), // Number of deliveries that triggered this suggestion
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // AI confidence 0.00-1.00
  status: varchar("status").notNull().default("new"), // "new", "reviewed", "approved", "implemented", "rejected"
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
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

export const emergencyWaterDeliveriesRelations = relations(emergencyWaterDeliveries, ({ one }) => ({
  property: one(properties, { fields: [emergencyWaterDeliveries.propertyId], references: [properties.id] }),
  processedByUser: one(users, { fields: [emergencyWaterDeliveries.processedBy], references: [users.id] }),
  approvedByUser: one(users, { fields: [emergencyWaterDeliveries.approvedBy], references: [users.id] }),
}));

export const waterDeliveryAlertsRelations = relations(waterDeliveryAlerts, ({ one }) => ({
  property: one(properties, { fields: [waterDeliveryAlerts.propertyId], references: [properties.id] }),
  acknowledgedByUser: one(users, { fields: [waterDeliveryAlerts.acknowledgedBy], references: [users.id] }),
}));

export const waterUpgradeSuggestionsRelations = relations(waterUpgradeSuggestions, ({ one }) => ({
  property: one(properties, { fields: [waterUpgradeSuggestions.propertyId], references: [properties.id] }),
  reviewedByUser: one(users, { fields: [waterUpgradeSuggestions.reviewedBy], references: [users.id] }),
}));

// Water Utility Emergency Truck Refill Log
export const waterUtilityRefills = pgTable("water_utility_refills", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Delivery details
  deliveryDate: timestamp("delivery_date").notNull(),
  litersDelivered: integer("liters_delivered").notNull(),
  costAmount: decimal("cost_amount", { precision: 10, scale: 2 }).notNull(),
  costPerLiter: decimal("cost_per_liter", { precision: 10, scale: 4 }).notNull(),
  
  // Supplier information
  supplierName: varchar("supplier_name"),
  supplierContact: varchar("supplier_contact"),
  
  // Classification
  waterType: varchar("water_type").notNull().default("emergency_truck"), // 'government', 'deepwell', 'emergency_truck'
  billingRoute: varchar("billing_route").notNull(), // 'guest_billable', 'owner_billable', 'company_expense'
  
  // Additional details
  notes: text("notes"),
  status: varchar("status").notNull().default("delivered"), // 'delivered', 'cancelled', 'refunded'
  
  // Audit trail
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waterRefillAlerts = pgTable("water_refill_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Alert details
  alertType: varchar("alert_type").notNull(), // 'frequency_alert', 'cost_alert', 'volume_alert'
  alertMessage: text("alert_message").notNull(),
  triggerCount: integer("trigger_count").notNull(),
  triggerPeriodDays: integer("trigger_period_days").notNull().default(30),
  severity: varchar("severity").notNull().default("medium"), // 'low', 'medium', 'high'
  recommendations: text("recommendations"),
  
  // Status
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const waterRefillBills = pgTable("water_refill_bills", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  refillId: integer("refill_id").notNull(),
  
  // Bill details
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
  billingRoute: varchar("billing_route").notNull(),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date"),
  
  // Status
  paymentStatus: varchar("payment_status").notNull().default("pending"), // 'pending', 'paid', 'overdue'
  paidAt: timestamp("paid_at"),
  paidBy: varchar("paid_by"),
  
  // Integration with water bills
  waterBillId: integer("water_bill_id"), // Reference to existing water bill if added as line item
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const waterUtilityRefillsRelations = relations(waterUtilityRefills, ({ one, many }) => ({
  property: one(properties, { fields: [waterUtilityRefills.propertyId], references: [properties.id] }),
  createdByUser: one(users, { fields: [waterUtilityRefills.createdBy], references: [users.id] }),
  bills: many(waterRefillBills),
}));

export const waterRefillAlertsRelations = relations(waterRefillAlerts, ({ one }) => ({
  property: one(properties, { fields: [waterRefillAlerts.propertyId], references: [properties.id] }),
  acknowledgedByUser: one(users, { fields: [waterRefillAlerts.acknowledgedBy], references: [users.id] }),
}));

export const waterRefillBillsRelations = relations(waterRefillBills, ({ one }) => ({
  property: one(properties, { fields: [waterRefillBills.propertyId], references: [properties.id] }),
  refill: one(waterUtilityRefills, { fields: [waterRefillBills.refillId], references: [waterUtilityRefills.id] }),
  paidByUser: one(users, { fields: [waterRefillBills.paidBy], references: [users.id] }),
}));

// Types
export type WaterUtilityRefill = typeof waterUtilityRefills.$inferSelect;
export type InsertWaterUtilityRefill = typeof waterUtilityRefills.$inferInsert;

export type WaterRefillAlert = typeof waterRefillAlerts.$inferSelect;
export type InsertWaterRefillAlert = typeof waterRefillAlerts.$inferInsert;

export type WaterRefillBill = typeof waterRefillBills.$inferSelect;
export type InsertWaterRefillBill = typeof waterRefillBills.$inferInsert;

// Emergency Water Delivery Types (existing)
export type EmergencyWaterDelivery = typeof emergencyWaterDeliveries.$inferSelect;
export type InsertEmergencyWaterDelivery = typeof emergencyWaterDeliveries.$inferInsert;

export type WaterDeliveryAlert = typeof waterDeliveryAlerts.$inferSelect;
export type InsertWaterDeliveryAlert = typeof waterDeliveryAlerts.$inferInsert;

export type WaterUpgradeSuggestion = typeof waterUpgradeSuggestions.$inferSelect;
export type InsertWaterUpgradeSuggestion = typeof waterUpgradeSuggestions.$inferInsert;

// Enhanced Water Utility Management
export const propertyWaterSources = pgTable("property_water_sources", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Water source details
  sourceType: varchar("source_type").notNull(), // 'government', 'deepwell', 'emergency_truck'
  sourceName: varchar("source_name"), // Custom name for the source
  isActive: boolean("is_active").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false), // One primary source per property
  
  // Source-specific settings
  billingCycle: varchar("billing_cycle"), // 'monthly', 'quarterly' for government/deepwell
  accountNumber: varchar("account_number"), // For government/deepwell
  supplierName: varchar("supplier_name"), // For emergency truck
  contactNumber: varchar("contact_number"),
  
  // Cost tracking
  averageCostPerLiter: decimal("average_cost_per_liter", { precision: 8, scale: 4 }),
  currency: varchar("currency").notNull().default("THB"),
  
  // Setup and notes
  setupDate: timestamp("setup_date"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waterConsumptionEntries = pgTable("water_consumption_entries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  sourceId: integer("source_id").notNull(), // References property_water_sources
  
  // Entry details
  entryType: varchar("entry_type").notNull(), // 'bill', 'emergency_delivery', 'regular_delivery'
  entryDate: timestamp("entry_date").notNull(),
  
  // Volume and cost
  volumeLiters: integer("volume_liters"), // For deliveries
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  costPerLiter: decimal("cost_per_liter", { precision: 8, scale: 4 }),
  currency: varchar("currency").notNull().default("THB"),
  
  // Bill-specific fields
  billDate: timestamp("bill_date"),
  dueDate: timestamp("due_date"),
  billNumber: varchar("bill_number"),
  units: varchar("units"), // m3, liters, etc.
  unitRate: decimal("unit_rate", { precision: 8, scale: 4 }),
  
  // Delivery-specific fields
  supplierName: varchar("supplier_name"),
  deliveryType: varchar("delivery_type"), // 'scheduled', 'emergency', 'top_up'
  driverName: varchar("driver_name"),
  truckLicensePlate: varchar("truck_license_plate"),
  
  // Payment and status
  paidBy: varchar("paid_by"), // 'owner', 'management', 'other'
  paidByCustom: varchar("paid_by_custom"), // When 'other' is selected
  paymentStatus: varchar("payment_status").notNull().default("pending"), // 'pending', 'paid', 'overdue'
  paidAt: timestamp("paid_at"),
  
  // Emergency and priority
  isEmergency: boolean("is_emergency").notNull().default(false),
  urgencyLevel: varchar("urgency_level"), // 'low', 'medium', 'high', 'critical'
  emergencyReason: text("emergency_reason"),
  
  // Receipt and documentation
  receiptUrl: varchar("receipt_url"),
  proofOfDeliveryUrl: varchar("proof_of_delivery_url"),
  notes: text("notes"),
  
  // Audit
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waterConsumptionAlerts = pgTable("water_consumption_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  
  // Alert details
  alertType: varchar("alert_type").notNull(), // 'no_entry_dry_season', 'frequent_emergency', 'cost_spike', 'overdue_bill'
  alertMessage: text("alert_message").notNull(),
  severity: varchar("severity").notNull().default("medium"), // 'low', 'medium', 'high', 'critical'
  
  // Alert triggers
  triggerCount: integer("trigger_count"), // For frequency-based alerts
  triggerPeriodDays: integer("trigger_period_days").notNull().default(30),
  daysSinceLastEntry: integer("days_since_last_entry"),
  
  // Alert metadata
  sourceType: varchar("source_type"), // Which source type triggered the alert
  recommendations: text("recommendations"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const waterSuppliers = pgTable("water_suppliers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  
  // Supplier details
  supplierName: varchar("supplier_name").notNull(),
  contactPerson: varchar("contact_person"),
  phoneNumber: varchar("phone_number"),
  alternatePhone: varchar("alternate_phone"),
  email: varchar("email"),
  
  // Service details
  serviceAreas: text("service_areas"), // JSON array of areas they serve
  vehicleTypes: text("vehicle_types"), // JSON array of truck types/sizes
  minimumOrder: integer("minimum_order"), // Minimum liters
  maximumCapacity: integer("maximum_capacity"), // Maximum liters per delivery
  
  // Pricing
  pricePerLiter: decimal("price_per_liter", { precision: 8, scale: 4 }),
  emergencyUpcharge: decimal("emergency_upcharge", { precision: 5, scale: 2 }), // Percentage
  currency: varchar("currency").notNull().default("THB"),
  
  // Performance tracking
  averageResponseTime: integer("average_response_time"), // Hours
  reliabilityRating: decimal("reliability_rating", { precision: 3, scale: 2 }), // 1-5 scale
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  
  // Status and notes
  isActive: boolean("is_active").notNull().default(true),
  isPreferred: boolean("is_preferred").notNull().default(false),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for enhanced water utility system
export const propertyWaterSourcesRelations = relations(propertyWaterSources, ({ one, many }) => ({
  property: one(properties, { fields: [propertyWaterSources.propertyId], references: [properties.id] }),
  consumptionEntries: many(waterConsumptionEntries),
}));

export const waterConsumptionEntriesRelations = relations(waterConsumptionEntries, ({ one }) => ({
  property: one(properties, { fields: [waterConsumptionEntries.propertyId], references: [properties.id] }),
  source: one(propertyWaterSources, { fields: [waterConsumptionEntries.sourceId], references: [propertyWaterSources.id] }),
  createdByUser: one(users, { fields: [waterConsumptionEntries.createdBy], references: [users.id] }),
}));

export const waterConsumptionAlertsRelations = relations(waterConsumptionAlerts, ({ one }) => ({
  property: one(properties, { fields: [waterConsumptionAlerts.propertyId], references: [properties.id] }),
  acknowledgedByUser: one(users, { fields: [waterConsumptionAlerts.acknowledgedBy], references: [users.id] }),
}));

export const waterSuppliersRelations = relations(waterSuppliers, ({ many }) => ({
  // No direct relations, but can be referenced by supplier name in consumption entries
}));

// Types for enhanced water utility system
export type PropertyWaterSource = typeof propertyWaterSources.$inferSelect;
export type InsertPropertyWaterSource = typeof propertyWaterSources.$inferInsert;

export type WaterConsumptionEntry = typeof waterConsumptionEntries.$inferSelect;
export type InsertWaterConsumptionEntry = typeof waterConsumptionEntries.$inferInsert;

export type WaterConsumptionAlert = typeof waterConsumptionAlerts.$inferSelect;
export type InsertWaterConsumptionAlert = typeof waterConsumptionAlerts.$inferInsert;

export type WaterSupplier = typeof waterSuppliers.$inferSelect;
export type InsertWaterSupplier = typeof waterSuppliers.$inferInsert;

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

// Enhanced Guest Dashboard Tables

// Guest Bookings with check-in/out details
export const guestBookings = pgTable("guest_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  guestPhone: varchar("guest_phone"),
  numberOfGuests: integer("number_of_guests").notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  bookingStatus: varchar("booking_status").default("confirmed"), // confirmed, checked_in, checked_out, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }),
  depositStatus: varchar("deposit_status").default("pending"), // pending, paid, refunded
  emergencyContact: varchar("emergency_contact"),
  specialRequests: text("special_requests"),
  wifiCode: varchar("wifi_code"),
  welcomePackInclusions: jsonb("welcome_pack_inclusions"),
  managerContact: varchar("manager_contact"),
  houseRules: text("house_rules"),
  checkInInstructions: text("check_in_instructions"),
  checkOutInstructions: text("check_out_instructions"),
  propertyInfo: jsonb("property_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Recommendations for guests
export const guestAiRecommendations = pgTable("guest_ai_recommendations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestBookingId: integer("guest_booking_id").references(() => guestBookings.id),
  recommendationType: varchar("recommendation_type").notNull(), // restaurant, attraction, tour, weather, service
  title: varchar("title").notNull(),
  description: text("description"),
  location: varchar("location"),
  distance: varchar("distance"), // e.g., "2.5 km away"
  rating: decimal("rating", { precision: 3, scale: 1 }), // 4.5/5.0
  priceRange: varchar("price_range"), // $, $$, $$$, $$$$
  operatingHours: varchar("operating_hours"),
  website: varchar("website"),
  phone: varchar("phone"),
  imageUrl: varchar("image_url"),
  category: varchar("category"), // thai_food, seafood, beach, temple, tour_company
  aiConfidenceScore: decimal("ai_confidence_score", { precision: 5, scale: 2 }),
  weatherData: jsonb("weather_data"), // for weather recommendations
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Service Timeline
export const guestServiceTimeline = pgTable("guest_service_timeline", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  guestBookingId: integer("guest_booking_id").references(() => guestBookings.id),
  serviceType: varchar("service_type").notNull(), // cleaning, pool, garden, pest_control, maintenance
  serviceName: varchar("service_name").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  estimatedTime: varchar("estimated_time"), // "2-3 hours"
  serviceProvider: varchar("service_provider"),
  status: varchar("status").default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  guestVisible: boolean("guest_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property amenities and features for guest display
export const propertyAmenities = pgTable("property_amenities", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  amenityName: varchar("amenity_name").notNull(),
  amenityType: varchar("amenity_type").notNull(), // wifi, pool, kitchen, parking, ac, etc.
  description: text("description"),
  isAvailable: boolean("is_available").default(true),
  instructions: text("instructions"), // how to use
  wifiCode: varchar("wifi_code"),
  emergencyInfo: text("emergency_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for guest booking system
export const guestBookingsRelations = relations(guestBookings, ({ one, many }) => ({
  property: one(properties, { fields: [guestBookings.propertyId], references: [properties.id] }),
  aiRecommendations: many(guestAiRecommendations),
  serviceTimeline: many(guestServiceTimeline),
}));

export const guestAiRecommendationsRelations = relations(guestAiRecommendations, ({ one }) => ({
  property: one(properties, { fields: [guestAiRecommendations.propertyId], references: [properties.id] }),
  guestBooking: one(guestBookings, { fields: [guestAiRecommendations.guestBookingId], references: [guestBookings.id] }),
}));

export const guestServiceTimelineRelations = relations(guestServiceTimeline, ({ one }) => ({
  property: one(properties, { fields: [guestServiceTimeline.propertyId], references: [properties.id] }),
  guestBooking: one(guestBookings, { fields: [guestServiceTimeline.guestBookingId], references: [guestBookings.id] }),
}));

export const propertyAmenitiesRelations = relations(propertyAmenities, ({ one }) => ({
  property: one(properties, { fields: [propertyAmenities.propertyId], references: [properties.id] }),
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

// Note: Invoice tables moved to comprehensive Invoice Generator System below

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

// Invoice relations moved to comprehensive Invoice Generator System

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
  assignedAt: timestamp("assigned_at").defaultNow(),
  completionNotes: text("completion_notes"),
});

// ===== COMPREHENSIVE FINANCE ENGINE =====

// Owner Financial Balances - Real-time balance tracking
export const ownerBalances = pgTable("owner_balances", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0"),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default("0"),
  totalPayoutsRequested: decimal("total_payouts_requested", { precision: 12, scale: 2 }).default("0"),
  totalPayoutsPaid: decimal("total_payouts_paid", { precision: 12, scale: 2 }).default("0"),
  thisMonthEarnings: decimal("this_month_earnings", { precision: 12, scale: 2 }).default("0"),
  thisMonthExpenses: decimal("this_month_expenses", { precision: 12, scale: 2 }).default("0"),
  thisMonthNet: decimal("this_month_net", { precision: 12, scale: 2 }).default("0"),
  lastCalculated: timestamp("last_calculated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Removed duplicate table - using enhanced version below

// Reverse Payments - When owner owes management
export const ownerChargeRequests = pgTable("owner_charge_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  chargedBy: varchar("charged_by").references(() => users.id).notNull(), // Admin/PM creating charge
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  reason: text("reason").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  
  // Payment tracking
  paymentMethod: varchar("payment_method"), // bank, paypal, cash, offset
  paymentReference: varchar("payment_reference"),
  paymentReceiptUrl: varchar("payment_receipt_url"),
  
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  
  // Workflow timestamps
  chargedAt: timestamp("charged_at").defaultNow(),
  paidAt: timestamp("paid_at"),
  processedBy: varchar("processed_by"), // Admin who confirmed payment
});



// Enhanced Property Utility Accounts - Complete utility tracking
export const propertyUtilityAccountsNew = pgTable("property_utility_accounts_new", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  
  // Utility details
  utilityType: varchar("utility_type").notNull(), // electricity, water, internet, gas, custom
  providerName: varchar("provider_name").notNull(), // PEA, 3BB, CAT, AIS, True, NT, Deepwell
  accountNumber: varchar("account_number").notNull(),
  contractHolder: varchar("contract_holder"), // Owner name or company
  
  // Billing schedule
  expectedBillDate: integer("expected_bill_date").notNull(), // Day of month (1-31)
  billingCycle: varchar("billing_cycle").default("monthly"), // monthly, quarterly
  averageMonthlyAmount: decimal("average_monthly_amount", { precision: 10, scale: 2 }),
  
  // Contact info
  customerServicePhone: varchar("customer_service_phone"),
  onlinePortalUrl: varchar("online_portal_url"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // Auto-reminder settings
  autoRemindersEnabled: boolean("auto_reminders_enabled").default(true),
  reminderDaysAfterDue: integer("reminder_days_after_due").default(4),
  
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Utility Bills - Complete bill tracking with auto-reminders
export const utilityBillsNew = pgTable("utility_bills_new", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  utilityAccountId: integer("utility_account_id").references(() => propertyUtilityAccountsNew.id),
  
  // Bill details
  billNumber: varchar("bill_number"),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  
  // Usage tracking
  currentReading: varchar("current_reading"),
  previousReading: varchar("previous_reading"),
  unitsUsed: decimal("units_used", { precision: 10, scale: 2 }),
  ratePerUnit: decimal("rate_per_unit", { precision: 10, scale: 4 }),
  
  // Status tracking
  status: varchar("status").default("pending"), // pending, uploaded, paid, overdue
  billScanUrl: varchar("bill_scan_url"), // Uploaded bill image
  paymentReceiptUrl: varchar("payment_receipt_url"), // Payment proof
  paymentMethod: varchar("payment_method"), // bank, online, cash, auto-debit
  
  // Payment details
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  paidDate: date("paid_date"),
  paymentReference: varchar("payment_reference"),
  
  // Assignment
  responsibleParty: varchar("responsible_party").default("owner"), // owner, company
  uploadedBy: varchar("uploaded_by"), // User who uploaded bill
  paidBy: varchar("paid_by"), // User who confirmed payment
  
  // Auto-tracking
  autoReminderSent: boolean("auto_reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Service Charges - Auto-deducted property services
export const recurringServiceCharges = pgTable("recurring_service_charges", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  
  // Service details
  serviceName: varchar("service_name").notNull(), // Pool, Garden, Pest, Cleaning, Staff
  serviceCategory: varchar("service_category").notNull(), // maintenance, cleaning, security, utilities
  providerName: varchar("provider_name"),
  providerContact: varchar("provider_contact"),
  
  // Billing details
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  billingDay: integer("billing_day").default(1), // Day of month to charge
  
  // Assignment rules
  chargeAssignment: varchar("charge_assignment").default("owner"), // owner, company
  autoDeduct: boolean("auto_deduct").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Service schedule
  serviceFrequency: varchar("service_frequency").default("weekly"), // daily, weekly, bi-weekly, monthly
  serviceDay: varchar("service_day"), // monday, tuesday, etc.
  serviceTime: varchar("service_time"), // "morning", "afternoon", specific time
  
  // Status tracking
  isActive: boolean("is_active").default(true),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // Contract end date
  lastChargedDate: date("last_charged_date"),
  nextChargeDate: date("next_charge_date"),
  
  notes: text("notes"),
  contractUrl: varchar("contract_url"), // Service contract document
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Transaction Log - All money movements
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  
  // Transaction basics
  transactionType: varchar("transaction_type").notNull(), // earning, expense, payout, charge, refund
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  
  // Parties involved
  fromParty: varchar("from_party"), // user_id or 'company' or external party
  toParty: varchar("to_party"), // user_id or 'company' or external party
  
  // Reference tracking
  referenceType: varchar("reference_type"), // booking, property, service, payout, bill
  referenceId: integer("reference_id"),
  bookingReference: varchar("booking_reference"),
  
  // Platform tracking
  sourceplatform: varchar("source_platform"), // airbnb, vrbo, booking, direct, stripe
  platformBookingId: varchar("platform_booking_id"),
  
  // Details
  description: text("description").notNull(),
  category: varchar("category"), // commission, maintenance, utility, service, management_fee
  
  // Status and processing
  status: varchar("status").default("pending"), // pending, completed, failed, cancelled
  processedBy: varchar("processed_by"), // User who processed transaction
  processedAt: timestamp("processed_at"),
  
  // Document attachments
  receiptUrl: varchar("receipt_url"),
  invoiceUrl: varchar("invoice_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Emergency Water Delivery schemas
export const insertEmergencyWaterDeliverySchema = createInsertSchema(emergencyWaterDeliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWaterDeliveryAlertSchema = createInsertSchema(waterDeliveryAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertWaterUpgradeSuggestionSchema = createInsertSchema(waterUpgradeSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertOwnerPayoutSchema = createInsertSchema(ownerPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Finance Engine schemas
export const insertOwnerBalanceSchema = createInsertSchema(ownerBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertOwnerChargeRequestSchema = createInsertSchema(ownerChargeRequests).omit({
  id: true,
  chargedAt: true,
});

export const insertRecurringServiceChargeSchema = createInsertSchema(recurringServiceCharges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== COMMUNICATION SYSTEM TABLES =====

// Internal Staff & PM Communication Channels
export const communicationChannels = pgTable("communication_channels", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  channelType: varchar("channel_type").notNull(), // 'department', 'property', 'general', 'admin'
  department: varchar("department"), // 'cleaning', 'maintenance', 'pool', 'garden', 'general'
  propertyId: integer("property_id").references(() => properties.id),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Channel Members
export const channelMembers = pgTable("channel_members", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  channelId: integer("channel_id").references(() => communicationChannels.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member"), // 'admin', 'moderator', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

// Internal Messages
export const internalMessages = pgTable("internal_messages", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  channelId: integer("channel_id").references(() => communicationChannels.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // 'text', 'image', 'file', 'task_link', 'property_update'
  attachmentUrl: varchar("attachment_url"),
  attachmentType: varchar("attachment_type"), // 'image', 'pdf', 'document'
  replyToMessageId: integer("reply_to_message_id").references(() => internalMessages.id),
  isImportant: boolean("is_important").default(false),
  logToPropertyTimeline: boolean("log_to_property_timeline").default(false),
  relatedTaskId: integer("related_task_id"),
  relatedPropertyId: integer("related_property_id"),
  sentAt: timestamp("sent_at").defaultNow(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
});

// Owner ↔ PM Communication (Property Notes & Updates)
export const ownerPmCommunication = pgTable("owner_pm_communication", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  senderId: varchar("sender_id").notNull(), // User ID
  senderType: varchar("sender_type").notNull(), // 'owner', 'pm', 'admin'
  recipientId: varchar("recipient_id").notNull(),
  recipientType: varchar("recipient_type").notNull(),
  subject: varchar("subject"),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("update"), // 'update', 'approval_request', 'maintenance_suggestion', 'task_summary'
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  status: varchar("status").default("sent"), // 'sent', 'read', 'replied', 'approved', 'rejected'
  attachmentUrl: varchar("attachment_url"),
  attachmentType: varchar("attachment_type"),
  requiresApproval: boolean("requires_approval").default(false),
  approvalStatus: varchar("approval_status"), // 'pending', 'approved', 'rejected'
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  relatedTaskId: integer("related_task_id"),
  relatedInvoiceId: integer("related_invoice_id"),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  repliedAt: timestamp("replied_at"),
});

// Guest Smart Requests (No chat - just smart form submissions)
export const guestSmartRequests = pgTable("guest_smart_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  requestCategory: varchar("request_category").notNull(), // 'ac_water_electricity', 'extra_cleaning', 'order_services', 'other'
  requestSubcategory: varchar("request_subcategory"), // 'ac_issue', 'water_issue', 'electricity_issue', 'massage', 'chef', 'taxi'
  urgencyLevel: varchar("urgency_level").default("medium"), // 'low', 'medium', 'high', 'emergency'
  description: text("description").notNull(),
  aiAnalysis: text("ai_analysis"), // AI-generated analysis/routing suggestion
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  routedToDepartment: varchar("routed_to_department"), // 'maintenance', 'cleaning', 'concierge'
  assignedToUserId: varchar("assigned_to_user_id"),
  status: varchar("status").default("submitted"), // 'submitted', 'acknowledged', 'in_progress', 'resolved', 'escalated'
  autoReplyMessage: text("auto_reply_message"), // Generated smart reply
  estimatedResolutionTime: varchar("estimated_resolution_time"), // "2 hours", "24 hours", etc.
  actualResolutionTime: timestamp("actual_resolution_time"),
  guestSatisfactionRating: integer("guest_satisfaction_rating"), // 1-5 stars
  guestFeedback: text("guest_feedback"),
  internalNotes: text("internal_notes"),
  relatedTaskId: integer("related_task_id"),
  whatsappMessageSent: boolean("whatsapp_message_sent").default(false),
  emailAlertSent: boolean("email_alert_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
});

// Communication Logs (Timeline Integration)
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  logType: varchar("log_type").notNull(), // 'property_activity', 'guest_stay', 'task_log', 'internal_chat'
  sourceType: varchar("source_type").notNull(), // 'internal_message', 'owner_pm_communication', 'guest_request'
  sourceId: integer("source_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  taskId: integer("task_id"),
  userId: varchar("user_id").notNull(),
  summary: text("summary").notNull(),
  details: text("details"),
  attachmentUrl: varchar("attachment_url"),
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Smart Request Templates & AI Configuration
export const smartRequestConfig = pgTable("smart_request_config", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  category: varchar("category").notNull(),
  subcategory: varchar("subcategory"),
  routingDepartment: varchar("routing_department").notNull(),
  autoReplyTemplate: text("auto_reply_template").notNull(),
  estimatedResponseTime: varchar("estimated_response_time").notNull(),
  priorityLevel: varchar("priority_level").default("medium"),
  requiresImmediateAlert: boolean("requires_immediate_alert").default(false),
  whatsappTemplate: text("whatsapp_template"),
  emailTemplate: text("email_template"),
  aiKeywords: text("ai_keywords").array(), // Keywords for AI routing
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== PROPERTY UTILITIES & MAINTENANCE CYCLE TRACKING =====

// Enhanced Property Utility Accounts with comprehensive tracking
export const propertyUtilityAccountsEnhanced = pgTable("property_utility_accounts_enhanced", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  
  // Utility details
  utilityType: varchar("utility_type").notNull(), // electricity, water, internet, pest_control, gas, hoa_fee, other
  customUtilityName: varchar("custom_utility_name"), // For "other" type
  providerName: varchar("provider_name").notNull(), // PEA, CAT, AIS, True, 3BB, etc.
  accountNumber: varchar("account_number").notNull(),
  contractHolder: varchar("contract_holder"), // Owner name or company
  
  // Billing schedule
  paymentFrequency: varchar("payment_frequency").notNull().default("monthly"), // monthly, quarterly, yearly
  defaultDueDate: integer("default_due_date").notNull(), // Day of month (1-31)
  monthlyCostEstimate: decimal("monthly_cost_estimate", { precision: 10, scale: 2 }),
  
  // Contact and account info
  customerServicePhone: varchar("customer_service_phone"),
  onlinePortalUrl: varchar("online_portal_url"),
  loginCredentialsNotes: text("login_credentials_notes"), // Encrypted storage notes
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // AI reminder settings
  autoRemindersEnabled: boolean("auto_reminders_enabled").default(true),
  reminderDaysAfterDue: integer("reminder_days_after_due").default(3),
  predictiveRemindersEnabled: boolean("predictive_reminders_enabled").default(true),
  
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Bill Log System with OCR support
export const utilityBillLogsEnhanced = pgTable("utility_bill_logs_enhanced", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityAccountId: integer("utility_account_id").references(() => propertyUtilityAccountsEnhanced.id),
  
  // Bill details
  billingMonth: varchar("billing_month").notNull(), // YYYY-MM format
  billNumber: varchar("bill_number"),
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  dueDate: date("due_date").notNull(),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  
  // Usage tracking (for utilities with meter readings)
  currentReading: varchar("current_reading"),
  previousReading: varchar("previous_reading"),
  unitsUsed: decimal("units_used", { precision: 10, scale: 2 }),
  ratePerUnit: decimal("rate_per_unit", { precision: 10, scale: 4 }),
  
  // File uploads and OCR
  billScanUrl: varchar("bill_scan_url"), // Scanned bill image/PDF
  billScanFilename: varchar("bill_scan_filename"),
  ocrExtractedText: text("ocr_extracted_text"), // OCR extracted text
  ocrConfidence: decimal("ocr_confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  
  paymentReceiptUrl: varchar("payment_receipt_url"), // Payment receipt
  paymentReceiptFilename: varchar("payment_receipt_filename"),
  
  // Payment tracking
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, overdue
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  paidDate: date("paid_date"),
  paymentMethod: varchar("payment_method"), // bank_transfer, online, cash, auto_debit
  paymentReference: varchar("payment_reference"),
  
  // Manual override and status
  manualOverride: boolean("manual_override").default(false),
  manualOverrideReason: text("manual_override_reason"),
  statusResetBy: varchar("status_reset_by").references(() => users.id),
  statusResetAt: timestamp("status_reset_at"),
  
  // Uploads and processing
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Reminder System for utilities
export const utilityAiReminders = pgTable("utility_ai_reminders", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityAccountId: integer("utility_account_id").references(() => propertyUtilityAccountsEnhanced.id),
  
  // Reminder details
  reminderType: varchar("reminder_type").notNull(), // predictive, overdue, missing_receipt
  expectedBillDate: date("expected_bill_date"), // AI-predicted bill arrival date
  daysPastPattern: integer("days_past_pattern"), // Days past usual bill arrival pattern
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  
  // AI analysis
  aiAnalysis: text("ai_analysis"), // AI reasoning for the reminder
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  basedOnHistory: boolean("based_on_history").default(true),
  
  // Status and delivery
  status: varchar("status").notNull().default("pending"), // pending, sent, acknowledged, resolved
  sentTo: varchar("sent_to").references(() => users.id), // Admin or PM
  sentAt: timestamp("sent_at"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  
  // Message content
  reminderMessage: text("reminder_message").notNull(),
  actionRequired: text("action_required"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Maintenance History System
export const propertyMaintenanceHistory = pgTable("property_maintenance_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  
  // Service details
  serviceType: varchar("service_type").notNull(), // renovation, ac_clean, septic_pump, pool_deep_clean, garden_overhaul, pest_control, roof_inspection, custom
  customServiceName: varchar("custom_service_name"), // For custom service types
  serviceProvider: varchar("service_provider"), // Company or technician name
  serviceProviderContact: varchar("service_provider_contact"),
  
  // Service execution
  serviceDate: date("service_date").notNull(),
  serviceCost: decimal("service_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("THB"),
  invoiceNumber: varchar("invoice_number"),
  receiptUrl: varchar("receipt_url"),
  
  // Service details and results
  workDescription: text("work_description").notNull(),
  issuesFound: text("issues_found"),
  warrantyPeriod: varchar("warranty_period"), // "6 months", "1 year", etc.
  warrantyExpiryDate: date("warranty_expiry_date"),
  
  // Photo documentation
  beforePhotos: text("before_photos").array(),
  afterPhotos: text("after_photos").array(),
  
  // Quality tracking
  qualityRating: integer("quality_rating"), // 1-5 stars
  qualityNotes: text("quality_notes"),
  recommendForFuture: boolean("recommend_for_future").default(true),
  
  // Manual entry vs system generated
  entryType: varchar("entry_type").notNull().default("manual"), // manual, auto_generated
  loggedBy: varchar("logged_by").references(() => users.id).notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance Service Intervals Configuration
export const maintenanceServiceIntervals = pgTable("maintenance_service_intervals", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id), // null = global default
  serviceType: varchar("service_type").notNull(),
  
  // Interval configuration
  intervalMonths: integer("interval_months").notNull(), // Service interval in months
  warningDaysBefore: integer("warning_days_before").default(7), // Warn X days before due
  criticalDaysAfter: integer("critical_days_after").default(7), // Critical X days after due
  
  // Seasonal preferences
  preferredMonths: text("preferred_months").array(), // ["03", "04", "10", "11"] for seasonal services
  avoidMonths: text("avoid_months").array(), // Months to avoid
  
  // Cost estimates
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  costCurrency: varchar("cost_currency", { length: 3 }).default("THB"),
  
  // AI suggestions
  aiSuggestionsEnabled: boolean("ai_suggestions_enabled").default(true),
  autoCreateTasks: boolean("auto_create_tasks").default(false),
  
  isActive: boolean("is_active").default(true),
  setBy: varchar("set_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-Generated Maintenance Suggestions
export const maintenanceAiSuggestions = pgTable("maintenance_ai_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Suggestion details
  serviceType: varchar("service_type").notNull(),
  suggestedDate: date("suggested_date").notNull(),
  urgencyLevel: varchar("urgency_level").notNull().default("medium"), // low, medium, high, critical
  
  // AI analysis
  aiReasoning: text("ai_reasoning").notNull(), // Why this service is suggested
  basedOnHistory: boolean("based_on_history").default(true),
  daysPastDue: integer("days_past_due"), // If already overdue
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // 0.00-1.00
  
  // Cost estimation
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  costCurrency: varchar("cost_currency", { length: 3 }).default("THB"),
  
  // Status tracking
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, scheduled, completed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Task creation
  taskCreated: boolean("task_created").default(false),
  relatedTaskId: integer("related_task_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert Dashboard for missing bills and overdue maintenance
export const propertyAlerts = pgTable("property_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Alert details
  alertType: varchar("alert_type").notNull(), // missing_utility_bill, overdue_maintenance, missing_receipt
  alertCategory: varchar("alert_category").notNull(), // utility, maintenance, financial
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  
  // Content
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  actionRequired: text("action_required"),
  
  // Related entities
  relatedUtilityAccountId: integer("related_utility_account_id").references(() => propertyUtilityAccountsEnhanced.id),
  relatedBillLogId: integer("related_bill_log_id").references(() => utilityBillLogsEnhanced.id),
  relatedMaintenanceId: integer("related_maintenance_id").references(() => propertyMaintenanceHistory.id),
  
  // Status tracking
  status: varchar("status").notNull().default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  dismissedBy: varchar("dismissed_by").references(() => users.id),
  dismissedAt: timestamp("dismissed_at"),
  
  // Auto-resolution
  autoResolvable: boolean("auto_resolvable").default(false),
  autoResolvedAt: timestamp("auto_resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Permission system schemas
export const insertUserPermissionOverrideSchema = createInsertSchema(userPermissionOverrides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionPresetSchema = createInsertSchema(permissionPresets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Permission system types
export type InsertUserPermissionOverride = z.infer<typeof insertUserPermissionOverrideSchema>;
export type UserPermissionOverride = typeof userPermissionOverrides.$inferSelect;
export type InsertPermissionPreset = z.infer<typeof insertPermissionPresetSchema>;
export type PermissionPreset = typeof permissionPresets.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

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

// Emergency Water Delivery types
export type InsertEmergencyWaterDelivery = z.infer<typeof insertEmergencyWaterDeliverySchema>;
export type EmergencyWaterDelivery = typeof emergencyWaterDeliveries.$inferSelect;
export type InsertWaterDeliveryAlert = z.infer<typeof insertWaterDeliveryAlertSchema>;
export type WaterDeliveryAlert = typeof waterDeliveryAlerts.$inferSelect;
export type InsertWaterUpgradeSuggestion = z.infer<typeof insertWaterUpgradeSuggestionSchema>;
export type WaterUpgradeSuggestion = typeof waterUpgradeSuggestions.$inferSelect;

// ===== PROPERTY GOALS & INVESTMENT PLANS =====
// Property improvement goals and investment planning
export const propertyGoals = pgTable("property_goals", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Goal Details
  goalTitle: varchar("goal_title").notNull(),
  goalDescription: text("goal_description"),
  upgradeType: varchar("upgrade_type").notNull(), // Furniture, Electronics, Decor, Maintenance, etc.
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("THB"),
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, critical
  
  // Trigger Conditions
  triggerType: varchar("trigger_type").notNull(), // date, revenue, occupancy, custom
  targetDate: date("target_date"),
  revenueTarget: decimal("revenue_target", { precision: 10, scale: 2 }),
  occupancyTarget: decimal("occupancy_target", { precision: 5, scale: 2 }),
  occupancyDuration: integer("occupancy_duration"), // months
  customTrigger: text("custom_trigger"),
  
  // Status & Progress
  status: varchar("status").notNull().default("not_started"), // not_started, in_progress, completed, cancelled
  completionDate: date("completion_date"),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  
  // Permissions & Approval
  proposedBy: varchar("proposed_by").notNull(),
  approvedBy: varchar("approved_by"),
  approvedDate: date("approved_date"),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Goal Attachments
export const propertyGoalAttachments = pgTable("property_goal_attachments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  goalId: integer("goal_id").references(() => propertyGoals.id).notNull(),
  
  // File Details
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, image, link, document
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  description: varchar("description"),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property Goal Progress Tracking
export const propertyGoalProgress = pgTable("property_goal_progress", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  goalId: integer("goal_id").references(() => propertyGoals.id).notNull(),
  
  // Progress Details
  progressDate: date("progress_date").notNull(),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).notNull(),
  milestoneDescription: text("milestone_description"),
  notes: text("notes"),
  
  // Metadata
  recordedBy: varchar("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== BOOKING REVENUE & PAYOUT TRACKING =====
// Comprehensive OTA booking revenue tracking with commission transparency
export const bookingRevenue = pgTable("booking_revenue", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Reservation Details
  reservationCode: varchar("reservation_code").notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  numberOfNights: integer("number_of_nights").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  
  // OTA Platform Information
  otaName: varchar("ota_name").notNull(), // Airbnb, Booking.com, VRBO, Direct, etc.
  bookingType: varchar("booking_type").notNull().default("OTA"), // OTA, Direct
  
  // Financial Details (Core OTA Commission Logic)
  guestBookingPrice: decimal("guest_booking_price", { precision: 10, scale: 2 }).notNull(), // Total paid by guest
  otaPlatformFee: decimal("ota_platform_fee", { precision: 10, scale: 2 }).notNull(), // OTA commission
  finalPayoutAmount: decimal("final_payout_amount", { precision: 10, scale: 2 }).notNull(), // Net received from OTA
  currency: varchar("currency").notNull().default("THB"),
  
  // Payment & Status
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, cancelled
  payoutDate: date("payout_date"),
  
  // Commission Settings
  isCommissionable: boolean("is_commissionable").default(true),
  managementCommissionRate: decimal("management_commission_rate", { precision: 5, scale: 2 }).default("15.00"),
  
  // Integration Fields
  hostAwayReservationId: varchar("hostaway_reservation_id"),
  externalReservationId: varchar("external_reservation_id"),
  
  // Metadata
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking Revenue Commission Calculations
export const bookingRevenueCommissions = pgTable("booking_revenue_commissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingRevenueId: integer("booking_revenue_id").references(() => bookingRevenue.id).notNull(),
  
  // Commission Breakdown (All calculated from finalPayoutAmount only)
  managementCommissionAmount: decimal("management_commission_amount", { precision: 10, scale: 2 }).notNull(),
  portfolioManagerCommissionAmount: decimal("portfolio_manager_commission_amount", { precision: 10, scale: 2 }).default("0.00"),
  referralAgentCommissionAmount: decimal("referral_agent_commission_amount", { precision: 10, scale: 2 }).default("0.00"),
  ownerNetAmount: decimal("owner_net_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Commission Recipients
  portfolioManagerId: varchar("portfolio_manager_id").references(() => users.id),
  referralAgentId: varchar("referral_agent_id").references(() => users.id),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  
  // Calculation Details
  calculationDate: timestamp("calculation_date").defaultNow(),
  calculatedBy: varchar("calculated_by").notNull(),
  isFinalized: boolean("is_finalized").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTA Platform Settings (for commission rate management)
export const otaPlatformSettings = pgTable("ota_platform_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  otaName: varchar("ota_name").notNull(),
  isActive: boolean("is_active").default(true),
  
  // Commission Configuration
  expectedCommissionRate: decimal("expected_commission_rate", { precision: 5, scale: 2 }).notNull(), // Expected OTA commission %
  minimumPayoutThreshold: decimal("minimum_payout_threshold", { precision: 10, scale: 2 }).default("0.00"),
  
  // API Integration
  apiConnectionStatus: varchar("api_connection_status").default("disconnected"), // connected, disconnected, error
  lastSyncDate: timestamp("last_sync_date"),
  autoSyncEnabled: boolean("auto_sync_enabled").default(false),
  
  // Settings
  defaultCurrency: varchar("default_currency").default("THB"),
  payoutFrequency: varchar("payout_frequency").default("monthly"), // daily, weekly, monthly
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking Revenue Relations
export const bookingRevenueRelations = relations(bookingRevenue, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bookingRevenue.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [bookingRevenue.propertyId],
    references: [properties.id],
  }),
  commissions: many(bookingRevenueCommissions),
}));

export const bookingRevenueCommissionsRelations = relations(bookingRevenueCommissions, ({ one }) => ({
  organization: one(organizations, {
    fields: [bookingRevenueCommissions.organizationId],
    references: [organizations.id],
  }),
  bookingRevenue: one(bookingRevenue, {
    fields: [bookingRevenueCommissions.bookingRevenueId],
    references: [bookingRevenue.id],
  }),
  portfolioManager: one(users, {
    fields: [bookingRevenueCommissions.portfolioManagerId],
    references: [users.id],
  }),
  referralAgent: one(users, {
    fields: [bookingRevenueCommissions.referralAgentId],
    references: [users.id],
  }),
  owner: one(users, {
    fields: [bookingRevenueCommissions.ownerId],
    references: [users.id],
  }),
}));

export const otaPlatformSettingsRelations = relations(otaPlatformSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [otaPlatformSettings.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [otaPlatformSettings.propertyId],
    references: [properties.id],
  }),
}));

// Insert Schemas
export const insertBookingRevenueSchema = createInsertSchema(bookingRevenue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingRevenueCommissionsSchema = createInsertSchema(bookingRevenueCommissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtaPlatformSettingsSchema = createInsertSchema(otaPlatformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertBookingRevenue = z.infer<typeof insertBookingRevenueSchema>;
export type BookingRevenue = typeof bookingRevenue.$inferSelect;
export type InsertBookingRevenueCommissions = z.infer<typeof insertBookingRevenueCommissionsSchema>;
export type BookingRevenueCommissions = typeof bookingRevenueCommissions.$inferSelect;
export type InsertOtaPlatformSettings = z.infer<typeof insertOtaPlatformSettingsSchema>;
export type OtaPlatformSettings = typeof otaPlatformSettings.$inferSelect;

export type InsertOwnerPayout = z.infer<typeof insertOwnerPayoutSchema>;
export type OwnerPayout = typeof ownerPayouts.$inferSelect;

// ===== CURRENCY AND TAX MANAGEMENT TABLES =====

// Currency rates table for exchange rate management
export const currencyRates = pgTable("currency_rates", {
  id: serial("id").primaryKey(),
  baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_currency_rates_base_target").on(table.baseCurrency, table.targetCurrency),
]);

// Tax rules table for VAT/GST/WHT rates by region
export const taxRules = pgTable("tax_rules", {
  id: serial("id").primaryKey(),
  region: varchar("region").notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }),
  whtRate: decimal("wht_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_tax_rules_region").on(table.region),
]);

// ===== OFFLINE TASK CACHE FOR STAFF PRODUCTIVITY =====

// Offline Task Cache for staff working without internet connectivity
export const offlineTaskCache = pgTable("offline_task_cache", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  staffId: varchar("staff_id").notNull(),
  propertyId: integer("property_id"),
  taskData: json("task_data").notNull(),
  synced: boolean("synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  syncedAt: timestamp("synced_at"),
}, (table) => [
  index("IDX_offline_task_cache_org").on(table.organizationId),
  index("IDX_offline_task_cache_staff").on(table.staffId),
  index("IDX_offline_task_cache_synced").on(table.synced),
]);

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

// Currency and Tax schemas
export const insertCurrencyRateSchema = createInsertSchema(currencyRates).omit({
  id: true,
  updatedAt: true,
});

export const insertTaxRuleSchema = createInsertSchema(taxRules).omit({
  id: true,
  createdAt: true,
});

export type InsertCurrencyRate = z.infer<typeof insertCurrencyRateSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;
export type InsertTaxRule = z.infer<typeof insertTaxRuleSchema>;
export type TaxRule = typeof taxRules.$inferSelect;

// Offline Task Cache schemas
export const insertOfflineTaskCacheSchema = createInsertSchema(offlineTaskCache).omit({
  id: true,
  createdAt: true,
  syncedAt: true,
});

export type InsertOfflineTaskCache = z.infer<typeof insertOfflineTaskCacheSchema>;
export type OfflineTaskCache = typeof offlineTaskCache.$inferSelect;

// ===== SHARED COSTS MANAGEMENT SYSTEM =====

// Shared costs for multi-property buildings
export const sharedCosts = pgTable("shared_costs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  buildingId: varchar("building_id").notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  costType: varchar("cost_type").default("electricity"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_shared_costs_org").on(table.organizationId),
  index("IDX_shared_costs_building").on(table.buildingId),
  index("IDX_shared_costs_type").on(table.costType),
]);

// Cost splits for individual properties/owners
export const sharedCostSplits = pgTable("shared_cost_splits", {
  id: serial("id").primaryKey(),
  sharedCostId: integer("shared_cost_id").references(() => sharedCosts.id, { onDelete: "cascade" }).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  ownerId: varchar("owner_id"),
  splitAmount: decimal("split_amount", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  index("IDX_shared_cost_splits_cost").on(table.sharedCostId),
  index("IDX_shared_cost_splits_property").on(table.propertyId),
  index("IDX_shared_cost_splits_owner").on(table.ownerId),
]);

// Shared costs schemas
export const insertSharedCostSchema = createInsertSchema(sharedCosts).omit({
  id: true,
  createdAt: true,
});

export const insertSharedCostSplitSchema = createInsertSchema(sharedCostSplits).omit({
  id: true,
});

export type InsertSharedCost = z.infer<typeof insertSharedCostSchema>;
export type SharedCost = typeof sharedCosts.$inferSelect;
export type InsertSharedCostSplit = z.infer<typeof insertSharedCostSplitSchema>;
export type SharedCostSplit = typeof sharedCostSplits.$inferSelect;

// ===== TASK AI SCAN RESULTS SYSTEM =====

// AI scan results for task photo analysis
export const taskAiScanResults = pgTable("task_ai_scan_results", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  aiFindings: json("ai_findings"),
  confidenceScore: decimal("confidence_score", { precision: 4, scale: 2 }),
  flagged: boolean("flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_task_ai_scan_task").on(table.taskId),
  index("IDX_task_ai_scan_flagged").on(table.flagged),
  index("IDX_task_ai_scan_confidence").on(table.confidenceScore),
]);

// AI scan results schemas
export const insertTaskAiScanResultSchema = createInsertSchema(taskAiScanResults).omit({
  id: true,
  createdAt: true,
});

export type InsertTaskAiScanResult = z.infer<typeof insertTaskAiScanResultSchema>;
export type TaskAiScanResult = typeof taskAiScanResults.$inferSelect;

// ===== PROPERTY INVESTMENTS SYSTEM =====

// Property investments for tracking capital investments and ROI
export const propertyInvestments = pgTable("property_investments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  investmentType: varchar("investment_type"),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  investmentDate: date("investment_date"),
  expectedRoi: decimal("expected_roi", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_property_investments_org").on(table.organizationId),
  index("IDX_property_investments_property").on(table.propertyId),
  index("IDX_property_investments_type").on(table.investmentType),
  index("IDX_property_investments_date").on(table.investmentDate),
]);

// Property investments schemas
export const insertPropertyInvestmentSchema = createInsertSchema(propertyInvestments).omit({
  id: true,
  createdAt: true,
});

export type InsertPropertyInvestment = z.infer<typeof insertPropertyInvestmentSchema>;
export type PropertyInvestment = typeof propertyInvestments.$inferSelect;

// ===== DYNAMIC PRICING RECOMMENDATIONS SYSTEM =====

// Dynamic pricing recommendations for intelligent rate optimization
export const dynamicPricingRecommendations = pgTable("dynamic_pricing_recommendations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  currentRate: decimal("current_rate", { precision: 10, scale: 2 }),
  recommendedRate: decimal("recommended_rate", { precision: 10, scale: 2 }),
  marketSource: varchar("market_source"),
  confidenceScore: decimal("confidence_score", { precision: 4, scale: 2 }),
  generatedAt: timestamp("generated_at").defaultNow(),
}, (table) => [
  index("IDX_dynamic_pricing_org").on(table.organizationId),
  index("IDX_dynamic_pricing_property").on(table.propertyId),
  index("IDX_dynamic_pricing_source").on(table.marketSource),
  index("IDX_dynamic_pricing_generated").on(table.generatedAt),
]);

// Dynamic pricing recommendations schemas
export const insertDynamicPricingRecommendationSchema = createInsertSchema(dynamicPricingRecommendations).omit({
  id: true,
  generatedAt: true,
});

export type InsertDynamicPricingRecommendation = z.infer<typeof insertDynamicPricingRecommendationSchema>;
export type DynamicPricingRecommendation = typeof dynamicPricingRecommendations.$inferSelect;

// ===== PROPERTY CHAT MESSAGES SYSTEM =====

// Property chat messages for multi-language communication
export const propertyChatMessages = pgTable("property_chat_messages", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"),
  role: varchar("role").notNull(), // owner, staff, admin
  message: text("message").notNull(),
  translatedMessage: text("translated_message"),
  languageDetected: varchar("language_detected", { length: 5 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_property_chat_org").on(table.organizationId),
  index("IDX_property_chat_property").on(table.propertyId),
  index("IDX_property_chat_sender").on(table.senderId),
  index("IDX_property_chat_recipient").on(table.recipientId),
  index("IDX_property_chat_created").on(table.createdAt),
]);

// Property chat messages schemas
export const insertPropertyChatMessageSchema = createInsertSchema(propertyChatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertPropertyChatMessage = z.infer<typeof insertPropertyChatMessageSchema>;
export type PropertyChatMessage = typeof propertyChatMessages.$inferSelect;

// ===== PROPERTY DOCUMENTS SYSTEM =====

// Property documents for comprehensive document management
export const propertyDocuments = pgTable("property_documents", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  docType: varchar("doc_type").notNull(), // contract, license, invoice, insurance, warranty, maintenance, other
  fileUrl: text("file_url").notNull(),
  expiryDate: date("expiry_date"),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_property_docs_org").on(table.organizationId),
  index("IDX_property_docs_property").on(table.propertyId),
  index("IDX_property_docs_type").on(table.docType),
  index("IDX_property_docs_expiry").on(table.expiryDate),
  index("IDX_property_docs_created").on(table.createdAt),
]);

// Property documents schemas
export const insertPropertyDocumentSchema = createInsertSchema(propertyDocuments).omit({
  id: true,
  createdAt: true,
});

export type InsertPropertyDocument = z.infer<typeof insertPropertyDocumentSchema>;
export type PropertyDocument = typeof propertyDocuments.$inferSelect;

// ===== UPSELL RECOMMENDATIONS SYSTEM =====

// Upsell recommendations for guest service enhancement and revenue optimization
export const upsellRecommendations = pgTable("upsell_recommendations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  guestId: varchar("guest_id"),
  propertyId: integer("property_id").references(() => properties.id),
  recommendationType: varchar("recommendation_type"), // extra_cleaning, private_chef, spa_service, tour_guide, grocery_delivery, laundry_service, transportation, other
  message: text("message"),
  status: varchar("status").default("pending"), // pending, sent, accepted, declined, expired
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_upsell_org").on(table.organizationId),
  index("IDX_upsell_guest").on(table.guestId),
  index("IDX_upsell_property").on(table.propertyId),
  index("IDX_upsell_type").on(table.recommendationType),
  index("IDX_upsell_status").on(table.status),
  index("IDX_upsell_created").on(table.createdAt),
]);

// Upsell recommendations schemas
export const insertUpsellRecommendationSchema = createInsertSchema(upsellRecommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertUpsellRecommendation = z.infer<typeof insertUpsellRecommendationSchema>;
export type UpsellRecommendation = typeof upsellRecommendations.$inferSelect;

// Financial & Invoice Toolkit schemas and types

export const insertCommissionEarningSchema = createInsertSchema(commissionEarnings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Invoice insert schemas moved to comprehensive Invoice Generator System

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

export const insertApiConnectionSchema = createInsertSchema(apiConnections).omit({
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

// Goals & Improvement Plan Module Tables - using the comprehensive schema defined earlier

export const propertyPlannedUpgrades = pgTable("property_planned_upgrades", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Upgrade Details
  upgradeType: varchar("upgrade_type").notNull(), // furniture, appliance, renovation, decor, safety
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  suggestedBudget: decimal("suggested_budget", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("THB"),
  targetDate: date("target_date"),
  priorityLevel: varchar("priority_level").notNull().default("medium"), // low, medium, high
  
  // Files and attachments
  attachmentUrl: varchar("attachment_url"), // Image/file attachment
  attachmentFilename: varchar("attachment_filename"),
  
  // Conditional trigger
  hasConditionTrigger: boolean("has_condition_trigger").default(false),
  conditionAmount: decimal("condition_amount", { precision: 12, scale: 2 }),
  conditionDescription: text("condition_description"), // e.g., "Only if revenue > X THB"
  
  // Status tracking
  status: varchar("status").notNull().default("pending"), // pending, approved, in_progress, completed, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyGoalsNotes = pgTable("property_goals_notes", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Note content
  noteText: text("note_text").notNull(),
  noteType: varchar("note_type").default("general"), // general, milestone, concern, suggestion
  
  // Permissions
  isOwnerVisible: boolean("is_owner_visible").default(true),
  isStaffVisible: boolean("is_staff_visible").default(false),
  
  // Timestamps and authorship
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyGoalsComments = pgTable("property_goals_comments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  relatedNoteId: integer("related_note_id").references(() => propertyGoalsNotes.id),
  
  // Comment content
  commentText: text("comment_text").notNull(),
  
  // Timestamps and authorship
  createdBy: varchar("created_by").references(() => users.id),
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

// ===== AUTOMATED INVOICE CREATOR TOOL =====

// Invoice Templates and Configuration
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  templateName: varchar("template_name").notNull(),
  templateType: varchar("template_type").notNull(), // booking_commission, monthly_summary, portfolio_manager, service_fee, expense_reimbursement
  
  // Template Configuration
  defaultSender: varchar("default_sender").notNull(), // management, owner, portfolio_manager
  defaultReceiver: varchar("default_receiver").notNull(), // management, owner, portfolio_manager
  autoIncludeItems: jsonb("auto_include_items"), // JSON array of what to include
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default(0),
  taxEnabled: boolean("tax_enabled").default(false),
  
  // Template Styling
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color").default("#000000"),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  
  // Status
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated Invoices
export const generatedInvoices = pgTable("generated_invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  templateId: integer("template_id").references(() => invoiceTemplates.id),
  
  // Parties
  senderType: varchar("sender_type").notNull(), // management, owner, portfolio_manager
  senderId: varchar("sender_id"), // User ID if applicable
  senderName: varchar("sender_name").notNull(),
  senderEmail: varchar("sender_email"),
  senderAddress: text("sender_address"),
  
  receiverType: varchar("receiver_type").notNull(), // management, owner, portfolio_manager
  receiverId: varchar("receiver_id"), // User ID if applicable
  receiverName: varchar("receiver_name").notNull(),
  receiverEmail: varchar("receiver_email"),
  receiverAddress: text("receiver_address"),
  
  // Invoice Details
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  
  // Financial
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default(0),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  
  // Status and Payment
  status: varchar("status").default("draft"), // draft, sent, paid, overdue, cancelled
  paymentStatus: varchar("payment_status").default("unpaid"), // unpaid, partial, paid
  paymentMethod: varchar("payment_method"), // bank_transfer, stripe, cash, manual
  paymentReference: varchar("payment_reference"),
  paymentDate: date("payment_date"),
  
  // Attachments and Notes
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  attachmentUrls: jsonb("attachment_urls"), // Array of receipt/document URLs
  
  // PDF Generation
  pdfUrl: varchar("pdf_url"),
  pdfGeneratedAt: timestamp("pdf_generated_at"),
  
  // Audit Trail
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  sentBy: varchar("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at"),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice Line Items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => generatedInvoices.id).notNull(),
  
  // Line Item Details
  itemType: varchar("item_type").notNull(), // booking_revenue, commission, addon_service, expense, adjustment, tax
  description: text("description").notNull(),
  itemReference: varchar("item_reference"), // booking ID, service ID, etc.
  
  // Pricing
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  
  // Categorization
  category: varchar("category"), // revenue, commission, service, expense, adjustment
  subcategory: varchar("subcategory"), // cleaning, transport, management_fee, etc.
  
  // Source Tracking
  sourceType: varchar("source_type"), // booking, addon_service, manual, commission
  sourceId: integer("source_id"), // ID of source record
  
  // Manual Adjustments
  isManualEntry: boolean("is_manual_entry").default(false),
  adjustmentReason: text("adjustment_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice Booking Links - Track which bookings are included in each invoice
export const invoiceBookingLinks = pgTable("invoice_booking_links", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => generatedInvoices.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  
  // Financial Breakdown for this booking
  bookingRevenue: decimal("booking_revenue", { precision: 12, scale: 2 }).notNull(),
  managementCommission: decimal("management_commission", { precision: 12, scale: 2 }).default(0),
  portfolioManagerCommission: decimal("portfolio_manager_commission", { precision: 12, scale: 2 }).default(0),
  ownerPayout: decimal("owner_payout", { precision: 12, scale: 2 }).default(0),
  
  // Add-on Services for this booking
  addonServicesTotal: decimal("addon_services_total", { precision: 12, scale: 2 }).default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice Service Links - Track which add-on services are included
export const invoiceServiceLinks = pgTable("invoice_service_links", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => generatedInvoices.id).notNull(),
  serviceBookingId: integer("service_booking_id").references(() => guestAddonBookings.id).notNull(),
  
  // Service Details
  serviceName: varchar("service_name").notNull(),
  serviceAmount: decimal("service_amount", { precision: 10, scale: 2 }).notNull(),
  billingRoute: varchar("billing_route").notNull(), // guest_billable, owner_billable, company_expense
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice Generation History and Analytics
export const invoiceGenerationLog = pgTable("invoice_generation_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Generation Details
  generationType: varchar("generation_type").notNull(), // manual, scheduled, api_triggered
  templateUsed: varchar("template_used"),
  generatedBy: varchar("generated_by").references(() => users.id),
  
  // Scope
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  propertiesIncluded: jsonb("properties_included"), // Array of property IDs
  
  // Results
  invoicesGenerated: integer("invoices_generated").default(0),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default(0),
  
  // Status
  status: varchar("status").default("completed"), // in_progress, completed, failed
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for Invoice System
export const invoiceTemplatesRelations = relations(invoiceTemplates, ({ many }) => ({
  generatedInvoices: many(generatedInvoices),
}));

export const generatedInvoicesRelations = relations(generatedInvoices, ({ one, many }) => ({
  template: one(invoiceTemplates, {
    fields: [generatedInvoices.templateId],
    references: [invoiceTemplates.id],
  }),
  lineItems: many(invoiceLineItems),
  bookingLinks: many(invoiceBookingLinks),
  serviceLinks: many(invoiceServiceLinks),
  creator: one(users, {
    fields: [generatedInvoices.createdBy],
    references: [users.id],
  }),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(generatedInvoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [generatedInvoices.id],
  }),
}));

export const invoiceBookingLinksRelations = relations(invoiceBookingLinks, ({ one }) => ({
  invoice: one(generatedInvoices, {
    fields: [invoiceBookingLinks.invoiceId],
    references: [generatedInvoices.id],
  }),
  booking: one(bookings, {
    fields: [invoiceBookingLinks.bookingId],
    references: [bookings.id],
  }),
}));

export const invoiceServiceLinksRelations = relations(invoiceServiceLinks, ({ one }) => ({
  invoice: one(generatedInvoices, {
    fields: [invoiceServiceLinks.invoiceId],
    references: [generatedInvoices.id],
  }),
  serviceBooking: one(guestAddonBookings, {
    fields: [invoiceServiceLinks.serviceBookingId],
    references: [guestAddonBookings.id],
  }),
}));

// Insert Schemas for Invoice System
export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeneratedInvoiceSchema = createInsertSchema(generatedInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceBookingLinkSchema = createInsertSchema(invoiceBookingLinks).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceServiceLinkSchema = createInsertSchema(invoiceServiceLinks).omit({
  id: true,
  createdAt: true,
});

// Type exports for Invoice System
export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;

export type GeneratedInvoice = typeof generatedInvoices.$inferSelect;
export type InsertGeneratedInvoice = z.infer<typeof insertGeneratedInvoiceSchema>;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type InvoiceBookingLink = typeof invoiceBookingLinks.$inferSelect;
export type InsertInvoiceBookingLink = z.infer<typeof insertInvoiceBookingLinkSchema>;

export type InvoiceServiceLink = typeof invoiceServiceLinks.$inferSelect;
export type InsertInvoiceServiceLink = z.infer<typeof insertInvoiceServiceLinkSchema>;

// ===== EXTENDED UTILITIES MANAGEMENT SYSTEM =====

// Property utility master setup - Admin management of who pays for what utilities
export const propertyUtilitiesMaster = pgTable("property_utilities_master", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityType: varchar("utility_type").notNull(), // electricity, water, internet, pest_control, garden, pool
  providerName: varchar("provider_name").notNull(), // PEA, TOT, 3BB, Local Water, etc.
  accountNumber: varchar("account_number").notNull(),
  whoPays: varchar("who_pays").notNull().default("management"), // owner, management, guest, other
  whoPayssOtherExplanation: text("who_pays_other_explanation"), // For "other" option
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_util_master_org").on(table.organizationId),
  index("IDX_util_master_property").on(table.propertyId),
  index("IDX_util_master_type").on(table.utilityType),
]);

// Utility bills tracking - 6 month history with receipt management
export const utilityBillsExtended = pgTable("utility_bills_extended", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  utilityMasterId: integer("utility_master_id").references(() => propertyUtilitiesMaster.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  billingMonth: varchar("billing_month").notNull(), // YYYY-MM format
  billingPeriodStart: date("billing_period_start").notNull(),
  billingPeriodEnd: date("billing_period_end").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  isPaid: boolean("is_paid").default(false),
  paidDate: date("paid_date"),
  receiptUploaded: boolean("receipt_uploaded").default(false),
  receiptFileUrl: varchar("receipt_file_url"), // URL to uploaded receipt
  receiptFileName: varchar("receipt_file_name"),
  dueDate: date("due_date"),
  expectedArrivalDate: date("expected_arrival_date"), // AI prediction
  isLate: boolean("is_late").default(false), // Auto-computed based on arrival patterns
  lateReason: text("late_reason"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_util_bills_org").on(table.organizationId),
  index("IDX_util_bills_utility").on(table.utilityMasterId),
  index("IDX_util_bills_property").on(table.propertyId),
  index("IDX_util_bills_month").on(table.billingMonth),
]);

// Editable access permissions for Manager/Owner roles
export const utilityAccessPermissions = pgTable("utility_access_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  utilityMasterId: integer("utility_master_id").references(() => propertyUtilitiesMaster.id).notNull(),
  userRole: varchar("user_role").notNull(), // manager, owner
  canEditProviderInfo: boolean("can_edit_provider_info").default(false),
  canEditAccountNumber: boolean("can_edit_account_number").default(false),
  canUploadBills: boolean("can_upload_bills").default(false),
  canViewBills: boolean("can_view_bills").default(true),
  canSetReminders: boolean("can_set_reminders").default(false),
  canViewAccountNumber: boolean("can_view_account_number").default(false), // Show full account vs masked
  setBy: varchar("set_by").references(() => users.id).notNull(), // Admin who set permissions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_util_perms_org").on(table.organizationId),
  index("IDX_util_perms_utility").on(table.utilityMasterId),
  index("IDX_util_perms_role").on(table.userRole),
]);

// AI predictions and notifications for utility bills
export const utilityAiPredictions = pgTable("utility_ai_predictions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  utilityMasterId: integer("utility_master_id").references(() => propertyUtilitiesMaster.id).notNull(),
  predictionType: varchar("prediction_type").notNull(), // arrival_date, late_alert, amount_estimate
  predictedDate: date("predicted_date"), // For arrival predictions
  predictedAmount: decimal("predicted_amount", { precision: 10, scale: 2 }), // For amount estimates
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }), // 0.00 to 1.00
  basedOnMonths: integer("based_on_months").default(6), // How many months of data used
  lastBillDate: date("last_bill_date"), // Most recent bill for comparison
  averageArrivalDay: integer("average_arrival_day"), // Typical day of month bills arrive
  notes: text("notes"), // AI explanation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_pred_org").on(table.organizationId),
  index("IDX_ai_pred_utility").on(table.utilityMasterId),
  index("IDX_ai_pred_type").on(table.predictionType),
]);

// Notification system for late uploads and owner reminders
export const utilityNotifications = pgTable("utility_notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  utilityMasterId: integer("utility_master_id").references(() => propertyUtilitiesMaster.id).notNull(),
  notificationType: varchar("notification_type").notNull(), // late_upload_alert, owner_reminder, payment_due
  recipientRole: varchar("recipient_role").notNull(), // admin, manager, owner
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  message: text("message").notNull(),
  severity: varchar("severity").notNull().default("normal"), // low, normal, high, critical
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  sentAt: timestamp("sent_at"),
  relatedBillId: integer("related_bill_id").references(() => utilityBillsExtended.id),
  actionRequired: boolean("action_required").default(false),
  actionTaken: boolean("action_taken").default(false),
  actionTakenBy: varchar("action_taken_by").references(() => users.id),
  actionTakenAt: timestamp("action_taken_at"),
  actionNotes: text("action_notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_util_notif_org").on(table.organizationId),
  index("IDX_util_notif_utility").on(table.utilityMasterId),
  index("IDX_util_notif_recipient").on(table.recipientUserId),
  index("IDX_util_notif_type").on(table.notificationType),
]);


// ===== OWNER STATEMENT EXPORTS =====
export const ownerStatementExports = pgTable("owner_statement_exports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  
  // Export parameters
  exportType: varchar("export_type").notNull(), // "pdf", "csv"
  dateRangeType: varchar("date_range_type").notNull(), // "month", "custom"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  
  // Property selection
  propertyIds: jsonb("property_ids").notNull(), // Array of property IDs for bulk export
  
  // Export options
  includeNotes: boolean("include_notes").default(false),
  includeServiceLogs: boolean("include_service_logs").default(false),
  includeBranding: boolean("include_branding").default(true),
  
  // Generated file info
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"), // in bytes
  fileUrl: varchar("file_url"), // S3 URL or file path
  
  // Summary data (for quick display)
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).default(0),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default(0),
  managementCommission: decimal("management_commission", { precision: 15, scale: 2 }).default(0),
  netBalance: decimal("net_balance", { precision: 15, scale: 2 }).default(0),
  
  // Status
  status: varchar("status").default("generating"), // generating, completed, failed
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations for Owner Statement Exports
export const ownerStatementExportsRelations = relations(ownerStatementExports, ({ one }) => ({
  organization: one(organizations, {
    fields: [ownerStatementExports.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [ownerStatementExports.ownerId],
    references: [users.id],
  }),
}));

// Insert Schema for Owner Statement Exports
export const insertOwnerStatementExportSchema = createInsertSchema(ownerStatementExports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Type exports for Owner Statement Exports
export type OwnerStatementExport = typeof ownerStatementExports.$inferSelect;
export type InsertOwnerStatementExport = z.infer<typeof insertOwnerStatementExportSchema>;

// ===== PROPERTY UTILITIES & MAINTENANCE SCHEMAS =====

// Insert schemas for utility and maintenance tables
export const insertPropertyUtilityAccountEnhancedSchema = createInsertSchema(propertyUtilityAccountsEnhanced).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillLogEnhancedSchema = createInsertSchema(utilityBillLogsEnhanced).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityAiReminderSchema = createInsertSchema(utilityAiReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyMaintenanceHistorySchema = createInsertSchema(propertyMaintenanceHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceServiceIntervalSchema = createInsertSchema(maintenanceServiceIntervals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceAiSuggestionSchema = createInsertSchema(maintenanceAiSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== CROSS-SYNCED TASK VISIBILITY SCHEMAS =====

// Insert schemas for cross-synced task visibility
export const insertGuestServiceRequestSchema = createInsertSchema(guestServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestConfirmedServiceSchema = createInsertSchema(guestConfirmedServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingLinkedTaskSchema = createInsertSchema(bookingLinkedTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for cross-synced task visibility
export type GuestServiceRequest = typeof guestServiceRequests.$inferSelect;
export type InsertGuestServiceRequest = z.infer<typeof insertGuestServiceRequestSchema>;

export type GuestConfirmedService = typeof guestConfirmedServices.$inferSelect;
export type InsertGuestConfirmedService = z.infer<typeof insertGuestConfirmedServiceSchema>;

export type BookingLinkedTask = typeof bookingLinkedTasks.$inferSelect;
export type InsertBookingLinkedTask = z.infer<typeof insertBookingLinkedTaskSchema>;

export const insertPropertyAlertSchema = createInsertSchema(propertyAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for utility and maintenance
export type PropertyUtilityAccountEnhanced = typeof propertyUtilityAccountsEnhanced.$inferSelect;
export type InsertPropertyUtilityAccountEnhanced = z.infer<typeof insertPropertyUtilityAccountEnhancedSchema>;

export type UtilityBillLogEnhanced = typeof utilityBillLogsEnhanced.$inferSelect;
export type InsertUtilityBillLogEnhanced = z.infer<typeof insertUtilityBillLogEnhancedSchema>;

export type UtilityAiReminder = typeof utilityAiReminders.$inferSelect;
export type InsertUtilityAiReminder = z.infer<typeof insertUtilityAiReminderSchema>;

export type PropertyMaintenanceHistory = typeof propertyMaintenanceHistory.$inferSelect;
export type InsertPropertyMaintenanceHistory = z.infer<typeof insertPropertyMaintenanceHistorySchema>;

export type MaintenanceServiceInterval = typeof maintenanceServiceIntervals.$inferSelect;
export type InsertMaintenanceServiceInterval = z.infer<typeof insertMaintenanceServiceIntervalSchema>;

export type MaintenanceAiSuggestion = typeof maintenanceAiSuggestions.$inferSelect;
export type InsertMaintenanceAiSuggestion = z.infer<typeof insertMaintenanceAiSuggestionSchema>;

export type PropertyAlert = typeof propertyAlerts.$inferSelect;
export type InsertPropertyAlert = z.infer<typeof insertPropertyAlertSchema>;

// ===== DOCUMENT CENTER SYSTEM (Removed - Enhanced version in Owner Onboarding System) =====

// Document Access Logs for audit trail
export const documentAccessLogs = pgTable("document_access_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  documentId: integer("document_id").references(() => propertyDocuments.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Access Details
  actionType: varchar("action_type").notNull(), // view, download, upload, edit, delete, share
  accessMethod: varchar("access_method").default("web"), // web, mobile, api
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  // Additional Context
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  sessionId: varchar("session_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_access_logs_document").on(table.documentId),
  index("IDX_access_logs_user").on(table.userId),
  index("IDX_access_logs_action").on(table.actionType),
]);

// Owner Onboarding Checklist
export const ownerOnboardingChecklists = pgTable("owner_onboarding_checklists", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Checklist Progress
  overallProgress: integer("overall_progress").default(0), // percentage 0-100
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  
  // Document Upload Tasks
  passportIdUploaded: boolean("passport_id_uploaded").default(false),
  proofOfOwnershipUploaded: boolean("proof_of_ownership_uploaded").default(false),
  rentalLicenseUploaded: boolean("rental_license_uploaded").default(false),
  floorPlansUploaded: boolean("floor_plans_uploaded").default(false),
  houseManualUploaded: boolean("house_manual_uploaded").default(false),
  inventoryListUploaded: boolean("inventory_list_uploaded").default(false),
  insuranceDocsUploaded: boolean("insurance_docs_uploaded").default(false),
  utilityAccountsUploaded: boolean("utility_accounts_uploaded").default(false),
  
  // Setup Tasks
  propertyDetailsCompleted: boolean("property_details_completed").default(false),
  bankDetailsProvided: boolean("bank_details_provided").default(false),
  contactInfoCompleted: boolean("contact_info_completed").default(false),
  preferencesSet: boolean("preferences_set").default(false),
  welcomePackConfigured: boolean("welcome_pack_configured").default(false),
  
  // Communication Tasks
  introductionCallScheduled: boolean("introduction_call_scheduled").default(false),
  introductionCallCompleted: boolean("introduction_call_completed").default(false),
  
  // Administrative Tasks
  contractSigned: boolean("contract_signed").default(false),
  firstPayoutScheduled: boolean("first_payout_scheduled").default(false),
  
  // Task Completion Dates
  taskCompletionDates: jsonb("task_completion_dates"), // Store completion timestamps for each task
  
  // Onboarding Management
  assignedTo: varchar("assigned_to").references(() => users.id), // PM or admin handling onboarding
  notes: text("notes"),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_onboarding_owner").on(table.ownerId),
  index("IDX_onboarding_property").on(table.propertyId),
  index("IDX_onboarding_progress").on(table.overallProgress),
]);

// Document Categories configuration
export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Category Details
  categoryKey: varchar("category_key").notNull(), // contracts, licenses, etc.
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  icon: varchar("icon").default("file-text"),
  
  // Category Configuration
  isRequired: boolean("is_required").default(false),
  maxFiles: integer("max_files").default(10),
  allowedFileTypes: text("allowed_file_types").array().default(['pdf', 'jpg', 'jpeg', 'png']),
  maxFileSize: integer("max_file_size").default(10485760), // 10MB in bytes
  
  // Access Rules
  defaultVisibility: varchar("default_visibility").default("admin_pm_only"),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Organization Customization
  customInstructions: text("custom_instructions"),
  exampleDocuments: text("example_documents").array(),
  
  // Category Management
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_doc_categories_org").on(table.organizationId),
  index("IDX_doc_categories_key").on(table.categoryKey),
]);

// File Upload Progress tracking
export const fileUploadSessions = pgTable("file_upload_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  
  // Session Details
  sessionId: varchar("session_id").notNull().unique(),
  totalFiles: integer("total_files").default(0),
  completedFiles: integer("completed_files").default(0),
  failedFiles: integer("failed_files").default(0),
  
  // Upload Progress
  status: varchar("status").default("in_progress"), // in_progress, completed, failed, cancelled
  totalBytes: integer("total_bytes").default(0),
  uploadedBytes: integer("uploaded_bytes").default(0),
  
  // Session Management
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  errorDetails: jsonb("error_details"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_upload_sessions_user").on(table.uploadedBy),
  index("IDX_upload_sessions_status").on(table.status),
]);

// Insert Schemas for Owner Onboarding System (already defined above)

// ===== MAINTENANCE LOG, WARRANTY TRACKER & AI REPAIR CYCLE ALERTS =====

// Maintenance Log - comprehensive repair and service tracking
export const maintenanceLog = pgTable("maintenance_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Task Details
  taskTitle: varchar("task_title").notNull(),
  repairDate: date("repair_date").notNull(),
  department: varchar("department").notNull(), // maintenance, pool, garden, ac, pest, electrical, plumbing, hvac, landscaping
  itemArea: varchar("item_area").notNull(), // specific item or area repaired
  issueDescription: text("issue_description").notNull(),
  actionTaken: text("action_taken").notNull(),
  
  // Assignment & Cost
  technicianAssigned: varchar("technician_assigned").references(() => users.id),
  technicianName: varchar("technician_name"), // For external technicians
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency").default("THB"),
  invoiceUrl: text("invoice_url"), // Upload path for invoice
  
  // Status & Progress
  status: varchar("status").default("in_progress"), // finished, in_progress, awaiting_approval, scheduled
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  // Media & Documentation
  linkedImages: text("linked_images").array().default([]), // Array of image URLs
  notes: text("notes"),
  
  // Warranty Information
  hasWarranty: boolean("has_warranty").default(false),
  warrantyDuration: integer("warranty_duration"), // in months
  warrantyExpirationDate: date("warranty_expiration_date"),
  warrantyReceiptUrl: text("warranty_receipt_url"),
  warrantyContactInfo: text("warranty_contact_info"),
  warrantyClaimStatus: varchar("warranty_claim_status").default("none"), // none, pending, approved, denied
  
  // AI Service Cycle Tracking
  isRecurringService: boolean("is_recurring_service").default(false),
  serviceCycleMonths: integer("service_cycle_months"), // e.g., 4 for every 4 months
  nextServiceDate: date("next_service_date"),
  lastServiceDate: date("last_service_date"),
  
  // Audit Trail
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  completedBy: varchar("completed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  approvedAt: timestamp("approved_at"),
}, (table) => [
  index("IDX_maintenance_log_property").on(table.propertyId),
  index("IDX_maintenance_log_department").on(table.department),
  index("IDX_maintenance_log_status").on(table.status),
  index("IDX_maintenance_log_technician").on(table.technicianAssigned),
  index("IDX_maintenance_log_warranty_exp").on(table.warrantyExpirationDate),
]);

// Warranty Alerts - automated reminders for warranty expiration
export const warrantyAlerts = pgTable("warranty_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  maintenanceLogId: integer("maintenance_log_id").references(() => maintenanceLog.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Alert Details
  alertType: varchar("alert_type").notNull(), // warranty_expiring, warranty_expired, service_due
  alertMessage: text("alert_message").notNull(),
  daysUntilExpiration: integer("days_until_expiration"),
  
  // Alert Status
  isActive: boolean("is_active").default(true),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_warranty_alerts_property").on(table.propertyId),
  index("IDX_warranty_alerts_scheduled").on(table.scheduledFor),
  index("IDX_warranty_alerts_active").on(table.isActive),
]);

// AI Service Cycle Predictions - learns patterns and suggests future maintenance
export const aiServiceCyclePredictions = pgTable("ai_service_cycle_predictions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Service Pattern Recognition
  department: varchar("department").notNull(),
  itemArea: varchar("item_area").notNull(),
  averageCycleMonths: decimal("average_cycle_months", { precision: 5, scale: 2 }),
  lastServiceDates: jsonb("last_service_dates"), // Array of last service dates for pattern analysis
  
  // AI Prediction
  predictedNextServiceDate: date("predicted_next_service_date"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }), // 0.0 to 1.0
  basedOnHistoricalCount: integer("based_on_historical_count").default(0),
  
  // Suggestion Management
  suggestionStatus: varchar("suggestion_status").default("pending"), // pending, accepted, dismissed, converted_to_task
  suggestedBy: varchar("suggested_by").default("ai_system"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Task Conversion
  convertedToTaskId: integer("converted_to_task_id"), // Reference to created task
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_ai_predictions_property").on(table.propertyId),
  index("IDX_ai_predictions_department").on(table.department),
  index("IDX_ai_predictions_status").on(table.suggestionStatus),
  index("IDX_ai_predictions_next_service").on(table.predictedNextServiceDate),
]);

// Maintenance Cost Analytics - track spending patterns
export const maintenanceCostAnalytics = pgTable("maintenance_cost_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Time Period
  periodType: varchar("period_type").notNull(), // monthly, quarterly, yearly
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  
  // Cost Breakdown by Department
  maintenanceCost: decimal("maintenance_cost", { precision: 10, scale: 2 }).default("0.00"),
  poolCost: decimal("pool_cost", { precision: 10, scale: 2 }).default("0.00"),
  gardenCost: decimal("garden_cost", { precision: 10, scale: 2 }).default("0.00"),
  acCost: decimal("ac_cost", { precision: 10, scale: 2 }).default("0.00"),
  pestCost: decimal("pest_cost", { precision: 10, scale: 2 }).default("0.00"),
  electricalCost: decimal("electrical_cost", { precision: 10, scale: 2 }).default("0.00"),
  plumbingCost: decimal("plumbing_cost", { precision: 10, scale: 2 }).default("0.00"),
  hvacCost: decimal("hvac_cost", { precision: 10, scale: 2 }).default("0.00"),
  landscapingCost: decimal("landscaping_cost", { precision: 10, scale: 2 }).default("0.00"),
  otherCost: decimal("other_cost", { precision: 10, scale: 2 }).default("0.00"),
  
  // Summary Analytics
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0.00"),
  totalJobs: integer("total_jobs").default(0),
  averageJobCost: decimal("average_job_cost", { precision: 10, scale: 2 }).default("0.00"),
  
  // Comparison Metrics
  previousPeriodCost: decimal("previous_period_cost", { precision: 10, scale: 2 }).default("0.00"),
  costChangePercentage: decimal("cost_change_percentage", { precision: 5, scale: 2 }).default("0.00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_cost_analytics_property").on(table.propertyId),
  index("IDX_cost_analytics_period").on(table.periodStart, table.periodEnd),
]);

// Technician Performance Tracking
export const technicianPerformance = pgTable("technician_performance", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  technicianId: varchar("technician_id").references(() => users.id).notNull(),
  
  // Performance Metrics
  totalJobsCompleted: integer("total_jobs_completed").default(0),
  averageJobDuration: decimal("average_job_duration", { precision: 5, scale: 2 }).default("0.00"), // in days
  averageCustomerRating: decimal("average_customer_rating", { precision: 3, scale: 2 }).default("0.00"), // 1-5 scale
  onTimeCompletionRate: decimal("on_time_completion_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  
  // Specialization Areas
  specializations: text("specializations").array().default([]), // departments they work in
  certifications: text("certifications").array().default([]),
  
  // Period Tracking
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_technician_performance_tech").on(table.technicianId),
  index("IDX_technician_performance_period").on(table.periodStart, table.periodEnd),
]);

// Insert Schemas
export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  approvedAt: true,
});

export const insertWarrantyAlertSchema = createInsertSchema(warrantyAlerts).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  acknowledgedAt: true,
});

export const insertAiServiceCyclePredictionSchema = createInsertSchema(aiServiceCyclePredictions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export const insertMaintenanceCostAnalyticsSchema = createInsertSchema(maintenanceCostAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicianPerformanceSchema = createInsertSchema(technicianPerformance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type Definitions
export type MaintenanceLog = typeof maintenanceLog.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;

export type WarrantyAlert = typeof warrantyAlerts.$inferSelect;
export type InsertWarrantyAlert = z.infer<typeof insertWarrantyAlertSchema>;

export type AiServiceCyclePrediction = typeof aiServiceCyclePredictions.$inferSelect;
export type InsertAiServiceCyclePrediction = z.infer<typeof insertAiServiceCyclePredictionSchema>;

export type MaintenanceCostAnalytics = typeof maintenanceCostAnalytics.$inferSelect;
export type InsertMaintenanceCostAnalytics = z.infer<typeof insertMaintenanceCostAnalyticsSchema>;

export type TechnicianPerformance = typeof technicianPerformance.$inferSelect;
export type InsertTechnicianPerformance = z.infer<typeof insertTechnicianPerformanceSchema>;

// ===== CHECK-IN/CHECK-OUT WORKFLOW SYSTEM =====

// Guest check-in records with passport photos and deposit tracking
export const guestCheckIns = pgTable("guest_check_ins", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Staff Assignment
  assignedToStaff: varchar("assigned_to_staff").references(() => users.id).notNull(),
  completedByStaff: varchar("completed_by_staff").references(() => users.id),
  
  // Passport Documentation
  passportPhotos: text("passport_photos").array(), // Array of photo URLs
  guestNames: text("guest_names").array(), // Names from passports
  passportNumbers: text("passport_numbers").array(), // Passport numbers
  
  // Deposit Information
  depositType: varchar("deposit_type").default("none"), // none, cash, digital
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  depositCurrency: varchar("deposit_currency").default("THB"),
  depositReceiptPhoto: varchar("deposit_receipt_photo"),
  
  // Electric Meter Reading
  electricMeterPhoto: varchar("electric_meter_photo").notNull(),
  electricMeterReading: decimal("electric_meter_reading", { precision: 10, scale: 3 }), // kWh reading
  meterReadingMethod: varchar("meter_reading_method").default("manual"), // manual, ocr_auto, ocr_manual_override
  
  // Task Completion
  status: varchar("status").default("pending"), // pending, in_progress, completed
  completionNotes: text("completion_notes"),
  
  // Timestamps
  scheduledDate: date("scheduled_date").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_checkin_booking").on(table.bookingId),
  index("IDX_checkin_property").on(table.propertyId),
  index("IDX_checkin_staff").on(table.assignedToStaff),
  index("IDX_checkin_date").on(table.scheduledDate),
]);

// Guest check-out records with electricity usage and billing
export const guestCheckOuts = pgTable("guest_check_outs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  checkInId: integer("check_in_id").references(() => guestCheckIns.id).notNull(),
  
  // Staff Assignment
  assignedToStaff: varchar("assigned_to_staff").references(() => users.id).notNull(),
  completedByStaff: varchar("completed_by_staff").references(() => users.id),
  
  // Electric Meter Reading (Checkout)
  electricMeterPhoto: varchar("electric_meter_photo").notNull(),
  electricMeterReading: decimal("electric_meter_reading", { precision: 10, scale: 3 }), // Final kWh reading
  meterReadingMethod: varchar("meter_reading_method").default("manual"), // manual, ocr_auto, ocr_manual_override
  
  // Electricity Usage Calculation
  electricityUsed: decimal("electricity_used", { precision: 10, scale: 3 }), // kWh used (checkout - checkin)
  electricityRatePerKwh: decimal("electricity_rate_per_kwh", { precision: 8, scale: 4 }).default("7.0000"), // THB per kWh
  totalElectricityCharge: decimal("total_electricity_charge", { precision: 10, scale: 2 }), // Total charge in THB
  
  // Payment Status
  paymentStatus: varchar("payment_status").notNull(), // included, paid_by_guest, not_charged
  notChargedReason: text("not_charged_reason"), // Reason if not_charged
  paymentMethod: varchar("payment_method"), // cash, digital, deducted_from_deposit
  paymentReceiptPhoto: varchar("payment_receipt_photo"),
  
  // Discount and Comments
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountReason: text("discount_reason"), // e.g., "Power outage", "Goodwill gesture"
  handlerComments: text("handler_comments"), // Comments from checkout handler
  
  // Task Completion
  status: varchar("status").default("pending"), // pending, in_progress, completed
  completionNotes: text("completion_notes"),
  
  // Timestamps
  scheduledDate: date("scheduled_date").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_checkout_booking").on(table.bookingId),
  index("IDX_checkout_property").on(table.propertyId),
  index("IDX_checkout_checkin").on(table.checkInId),
  index("IDX_checkout_staff").on(table.assignedToStaff),
  index("IDX_checkout_date").on(table.scheduledDate),
]);

// Property-specific electricity rates
export const propertyElectricitySettings = pgTable("property_electricity_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Rate Configuration
  ratePerKwh: decimal("rate_per_kwh", { precision: 8, scale: 4 }).default("7.0000"), // THB per kWh
  currency: varchar("currency").default("THB"),
  
  // Billing Rules
  includedInStay: boolean("included_in_stay").default(false), // True if electricity is included
  minimumCharge: decimal("minimum_charge", { precision: 10, scale: 2 }).default("0.00"),
  maximumCharge: decimal("maximum_charge", { precision: 10, scale: 2 }), // Optional cap
  
  // Settings
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_electricity_property").on(table.propertyId),
]);

// Check-in/check-out workflow demo tasks
export const checkInOutDemoTasks = pgTable("checkin_checkout_demo_tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Task Information
  taskType: varchar("task_type").notNull(), // check_in, check_out, pool_cleaning, checkout_cleaning
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  department: varchar("department").notNull(), // management, housekeeping, pool, maintenance
  
  // Assignment
  assignedRole: varchar("assigned_role").notNull(), // staff, manager, host
  assignedToUser: varchar("assigned_to_user").references(() => users.id),
  
  // Property and Booking Reference
  propertyId: integer("property_id").references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  checkInId: integer("check_in_id").references(() => guestCheckIns.id),
  
  // Status and Priority
  status: varchar("status").default("pending"), // pending, in_progress, completed
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  
  // Due Date
  dueDate: timestamp("due_date").notNull(),
  estimatedDuration: integer("estimated_duration"), // minutes
  
  // Completion Data
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  evidencePhotos: text("evidence_photos").array(),
  
  // Demo Data Flags
  isDemoTask: boolean("is_demo_task").default(true),
  demoUserType: varchar("demo_user_type"), // pool_staff, housekeeper, host, manager
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_demo_tasks_type").on(table.taskType),
  index("IDX_demo_tasks_role").on(table.assignedRole),
  index("IDX_demo_tasks_property").on(table.propertyId),
  index("IDX_demo_tasks_due").on(table.dueDate),
]);

// Relations for Check-in/Check-out System
export const guestCheckInsRelations = relations(guestCheckIns, ({ one }) => ({
  organization: one(organizations, {
    fields: [guestCheckIns.organizationId],
    references: [organizations.id],
  }),
  booking: one(bookings, {
    fields: [guestCheckIns.bookingId],
    references: [bookings.id],
  }),
  property: one(properties, {
    fields: [guestCheckIns.propertyId],
    references: [properties.id],
  }),
  assignedStaff: one(users, {
    fields: [guestCheckIns.assignedToStaff],
    references: [users.id],
  }),
  completedByUser: one(users, {
    fields: [guestCheckIns.completedByStaff],
    references: [users.id],
  }),
}));

export const guestCheckOutsRelations = relations(guestCheckOuts, ({ one }) => ({
  organization: one(organizations, {
    fields: [guestCheckOuts.organizationId],
    references: [organizations.id],
  }),
  booking: one(bookings, {
    fields: [guestCheckOuts.bookingId],
    references: [bookings.id],
  }),
  property: one(properties, {
    fields: [guestCheckOuts.propertyId],
    references: [properties.id],
  }),
  checkIn: one(guestCheckIns, {
    fields: [guestCheckOuts.checkInId],
    references: [guestCheckIns.id],
  }),
  assignedStaff: one(users, {
    fields: [guestCheckOuts.assignedToStaff],
    references: [users.id],
  }),
  completedByUser: one(users, {
    fields: [guestCheckOuts.completedByStaff],
    references: [users.id],
  }),
}));

export const propertyElectricitySettingsRelations = relations(propertyElectricitySettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [propertyElectricitySettings.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [propertyElectricitySettings.propertyId],
    references: [properties.id],
  }),
}));

export const checkInOutDemoTasksRelations = relations(checkInOutDemoTasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [checkInOutDemoTasks.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [checkInOutDemoTasks.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [checkInOutDemoTasks.bookingId],
    references: [bookings.id],
  }),
  checkIn: one(guestCheckIns, {
    fields: [checkInOutDemoTasks.checkInId],
    references: [guestCheckIns.id],
  }),
  assignedUser: one(users, {
    fields: [checkInOutDemoTasks.assignedToUser],
    references: [users.id],
  }),
}));

// Insert Schemas for Check-in/Check-out System
export const insertGuestCheckInSchema = createInsertSchema(guestCheckIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestCheckOutSchema = createInsertSchema(guestCheckOuts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyElectricitySettingsSchema = createInsertSchema(propertyElectricitySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCheckInOutDemoTaskSchema = createInsertSchema(checkInOutDemoTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for Check-in/Check-out System
export type GuestCheckIn = typeof guestCheckIns.$inferSelect;
export type InsertGuestCheckIn = z.infer<typeof insertGuestCheckInSchema>;

export type GuestCheckOut = typeof guestCheckOuts.$inferSelect;
export type InsertGuestCheckOut = z.infer<typeof insertGuestCheckOutSchema>;

export type PropertyElectricitySettings = typeof propertyElectricitySettings.$inferSelect;
export type InsertPropertyElectricitySettings = z.infer<typeof insertPropertyElectricitySettingsSchema>;

export type CheckInOutDemoTask = typeof checkInOutDemoTasks.$inferSelect;
export type InsertCheckInOutDemoTask = z.infer<typeof insertCheckInOutDemoTaskSchema>;

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
// Invoice types moved to comprehensive Invoice Generator System below
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
  
  // Enhanced Commission System
  commissionType: varchar("commission_type").default("fixed_percentage"), // fixed_percentage, custom_topup
  netPrice: decimal("net_price", { precision: 10, scale: 2 }), // Net cost price from property
  topupAmount: decimal("topup_amount", { precision: 10, scale: 2 }), // Custom amount topped up by agent
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

// ===== ADD-ON SERVICES ENGINE WITH BILLING RULES =====

// Service catalog that guests can book
export const addonServiceCatalog = pgTable("addon_service_catalog", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceName: varchar("service_name").notNull(),
  category: varchar("category").notNull(), // tours, chef, transport, massage, rental, grocery, baby, photography, airport, events
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  duration: integer("duration"), // in minutes
  imageUrl: varchar("image_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  isAvailableOnline: boolean("is_available_online").default(true),
  maxGuests: integer("max_guests").default(10),
  advanceBookingHours: integer("advance_booking_hours").default(24), // min hours before service
  cancellationPolicy: text("cancellation_policy"),
  specialRequirements: text("special_requirements"),
  providerName: varchar("provider_name"), // external service provider
  providerContact: varchar("provider_contact"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"), // % for internal tracking
  tags: text("tags").array(),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest bookings for addon services
export const addonServiceBookings = pgTable("addon_service_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => addonServiceCatalog.id, { onDelete: "cascade" }).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  guestCount: integer("guest_count").default(1),
  serviceDate: date("service_date").notNull(),
  serviceTime: varchar("service_time"), // HH:MM format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Billing Flexibility
  billingRule: varchar("billing_rule").notNull(), // guest_charged, owner_charged, company_expense, complimentary
  billingType: varchar("billing_type").notNull(), // charged, owner_gift, company_gift, complimentary
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, cancelled, refunded
  paymentMethod: varchar("payment_method"), // cash, card, online, bank_transfer
  
  status: varchar("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  specialRequests: text("special_requests"),
  internalNotes: text("internal_notes"),
  cancellationReason: text("cancellation_reason"),
  
  // Financial Tracking
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).default("0.00"),
  commissionPaidToStaff: boolean("commission_paid_to_staff").default(false),
  receiptUrl: varchar("receipt_url"), // Upload receipt/proof
  referenceNumber: varchar("reference_number"),
  
  // Booking Metadata
  bookedBy: varchar("booked_by").references(() => users.id), // staff who made booking
  confirmedBy: varchar("confirmed_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service category configuration and billing rules
export const addonServiceCategories = pgTable("addon_service_categories", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  categoryName: varchar("category_name").notNull(),
  categoryIcon: varchar("category_icon"),
  categoryColor: varchar("category_color"),
  defaultBillingRule: varchar("default_billing_rule").default("guest_charged"),
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commission tracking and staff bonus calculations
export const addonServiceCommissions = pgTable("addon_service_commissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => addonServiceBookings.id, { onDelete: "cascade" }).notNull(),
  serviceId: integer("service_id").references(() => addonServiceCatalog.id).notNull(),
  category: varchar("category").notNull(),
  staffId: varchar("staff_id").references(() => users.id),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, cancelled
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Monthly service category reports and analytics
export const addonServiceReports = pgTable("addon_service_reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  reportMonth: varchar("report_month").notNull(), // YYYY-MM format
  category: varchar("category").notNull(),
  totalBookings: integer("total_bookings").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0.00"),
  totalCommissions: decimal("total_commissions", { precision: 10, scale: 2 }).default("0.00"),
  guestChargedRevenue: decimal("guest_charged_revenue", { precision: 10, scale: 2 }).default("0.00"),
  ownerChargedRevenue: decimal("owner_charged_revenue", { precision: 10, scale: 2 }).default("0.00"),
  companyExpenseAmount: decimal("company_expense_amount", { precision: 10, scale: 2 }).default("0.00"),
  complimentaryAmount: decimal("complimentary_amount", { precision: 10, scale: 2 }).default("0.00"),
  averageBookingValue: decimal("average_booking_value", { precision: 10, scale: 2 }).default("0.00"),
  topService: varchar("top_service"),
  reportGeneratedAt: timestamp("report_generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service availability and booking slots
export const addonServiceAvailability = pgTable("addon_service_availability", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => addonServiceCatalog.id, { onDelete: "cascade" }).notNull(),
  availableDate: date("available_date").notNull(),
  timeSlots: jsonb("time_slots"), // Array of available time slots
  maxCapacity: integer("max_capacity").default(1),
  currentBookings: integer("current_bookings").default(0),
  isBlocked: boolean("is_blocked").default(false),
  blockReason: text("block_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing rule configurations
export const addonBillingRules = pgTable("addon_billing_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ruleName: varchar("rule_name").notNull(),
  category: varchar("category"), // applies to specific category or null for all
  billingRule: varchar("billing_rule").notNull(), // guest_charged, owner_charged, company_expense, complimentary
  billingType: varchar("billing_type").notNull(), // charged, owner_gift, company_gift, complimentary
  autoApply: boolean("auto_apply").default(false),
  conditions: jsonb("conditions"), // Conditions for auto-application
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Removed duplicate - using comprehensive version below

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

// ===== ENHANCED FINANCE ENGINE =====
// Working with existing tables, not duplicating them
// Enhanced owner balance tracking - extends existing owner_payouts table
export const ownerBalanceTracker = pgTable("owner_balance_tracker", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0.00"),
  pendingEarnings: decimal("pending_earnings", { precision: 12, scale: 2 }).default("0.00"),
  thisMonthEarnings: decimal("this_month_earnings", { precision: 12, scale: 2 }).default("0.00"),
  thisMonthExpenses: decimal("this_month_expenses", { precision: 12, scale: 2 }).default("0.00"),
  lastPayoutAmount: decimal("last_payout_amount", { precision: 12, scale: 2 }),
  lastPayoutDate: timestamp("last_payout_date"),
  totalLifetimeEarnings: decimal("total_lifetime_earnings", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced payout routing configuration
export const payoutRoutingRules = pgTable("payout_routing_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  platform: varchar("platform").notNull(), // airbnb, vrbo, booking_com, direct, stripe
  ownerPercentage: decimal("owner_percentage", { precision: 5, scale: 2 }).notNull(),
  managementPercentage: decimal("management_percentage", { precision: 5, scale: 2 }).notNull(),
  platformFeePercentage: decimal("platform_fee_percentage", { precision: 5, scale: 2 }).default("0.00"),
  routingType: varchar("routing_type").notNull(), // split_payout, management_only, owner_direct
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced utility bill processing - extends existing utility_bills table
export const utilityBillProcessing = pgTable("utility_bill_processing", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  utilityBillId: integer("utility_bill_id").references(() => utilityBills.id).notNull(),
  processedBy: varchar("processed_by").references(() => users.id),
  processingStatus: varchar("processing_status").default("pending"), // pending, processed, error
  routingDecision: varchar("routing_decision"), // owner_charge, company_expense
  processingNotes: text("processing_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced finance transaction logs
export const enhancedFinanceTransactionLogs = pgTable("enhanced_finance_transaction_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  transactionType: varchar("transaction_type").notNull(), // owner_balance_update, payout_routing, utility_charge
  relatedTableId: integer("related_table_id").notNull(),
  relatedTableName: varchar("related_table_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  description: text("description").notNull(),
  processedBy: varchar("processed_by").references(() => users.id).notNull(),
  processingNotes: text("processing_notes"),
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for Enhanced Finance Engine
export const ownerBalanceTrackerRelations = relations(ownerBalanceTracker, ({ one }) => ({
  organization: one(organizations, { fields: [ownerBalanceTracker.organizationId], references: [organizations.id] }),
  owner: one(users, { fields: [ownerBalanceTracker.ownerId], references: [users.id] }),
  property: one(properties, { fields: [ownerBalanceTracker.propertyId], references: [properties.id] }),
}));

export const payoutRoutingRulesRelations = relations(payoutRoutingRules, ({ one }) => ({
  organization: one(organizations, { fields: [payoutRoutingRules.organizationId], references: [organizations.id] }),
  property: one(properties, { fields: [payoutRoutingRules.propertyId], references: [properties.id] }),
  createdByUser: one(users, { fields: [payoutRoutingRules.createdBy], references: [users.id] }),
}));

export const utilityBillProcessingRelations = relations(utilityBillProcessing, ({ one }) => ({
  organization: one(organizations, { fields: [utilityBillProcessing.organizationId], references: [organizations.id] }),
  utilityBill: one(utilityBills, { fields: [utilityBillProcessing.utilityBillId], references: [utilityBills.id] }),
  processedByUser: one(users, { fields: [utilityBillProcessing.processedBy], references: [users.id] }),
}));

export const enhancedFinanceTransactionLogsRelations = relations(enhancedFinanceTransactionLogs, ({ one }) => ({
  organization: one(organizations, { fields: [enhancedFinanceTransactionLogs.organizationId], references: [organizations.id] }),
  processedByUser: one(users, { fields: [enhancedFinanceTransactionLogs.processedBy], references: [users.id] }),
}));

// Insert schemas for Enhanced Finance Engine
// Note: insertOwnerBalanceTrackerSchema declared later with comprehensive owner balance system

export const insertPayoutRoutingRuleSchema = createInsertSchema(payoutRoutingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillProcessingSchema = createInsertSchema(utilityBillProcessing).omit({
  id: true,
  createdAt: true,
});

export const insertEnhancedFinanceTransactionLogSchema = createInsertSchema(enhancedFinanceTransactionLogs).omit({
  id: true,
  transactionDate: true,
  createdAt: true,
});

// Type exports for Enhanced Finance Engine
export type PayoutRoutingRule = typeof payoutRoutingRules.$inferSelect;
export type InsertPayoutRoutingRule = z.infer<typeof insertPayoutRoutingRuleSchema>;

export type UtilityBillProcessing = typeof utilityBillProcessing.$inferSelect;
export type InsertUtilityBillProcessing = z.infer<typeof insertUtilityBillProcessingSchema>;

export type EnhancedFinanceTransactionLog = typeof enhancedFinanceTransactionLogs.$inferSelect;
export type InsertEnhancedFinanceTransactionLog = z.infer<typeof insertEnhancedFinanceTransactionLogSchema>;

// Owner Dashboard types
export type OwnerActivityTimeline = typeof ownerActivityTimeline.$inferSelect;
export type InsertOwnerActivityTimeline = z.infer<typeof insertOwnerActivityTimelineSchema>;
export type OwnerInvoice = typeof ownerInvoices.$inferSelect;
export type InsertOwnerInvoice = z.infer<typeof insertOwnerInvoiceSchema>;

// ===== TASK ENGINE SMART SCHEDULING & AI SUGGESTIONS =====

// Enhanced Task Scheduling Calendar
export const taskSchedule = pgTable("task_schedule", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledStartTime: varchar("scheduled_start_time"), // HH:MM format
  scheduledEndTime: varchar("scheduled_end_time"), // HH:MM format
  timeBlockDuration: integer("time_block_duration").default(60), // minutes
  assignedStaffId: varchar("assigned_staff_id").references(() => users.id),
  autoAssigned: boolean("auto_assigned").default(false), // true if system auto-assigned
  scheduleType: varchar("schedule_type").notNull(), // auto-generated, recurring, manual, ai-suggested
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  status: varchar("status").default("scheduled"), // scheduled, in-progress, completed, missed, rescheduled
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  rescheduleReason: text("reschedule_reason"),
  scheduledBy: varchar("scheduled_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Auto-Generation Rules
export const taskAutoGenRules = pgTable("task_auto_gen_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ruleName: varchar("rule_name").notNull(),
  ruleType: varchar("rule_type").notNull(), // checkout-clean, recurring-service, maintenance-followup
  triggerEvent: varchar("trigger_event").notNull(), // guest-checkout, booking-start, schedule-time, condition-met
  department: varchar("department").notNull(), // cleaning, pool, garden, maintenance, general
  taskType: varchar("task_type").notNull(),
  taskTitle: varchar("task_title").notNull(),
  taskDescription: text("task_description"),
  estimatedDuration: integer("estimated_duration").default(60), // minutes
  defaultPriority: varchar("default_priority").default("medium"),
  autoAssign: boolean("auto_assign").default(true),
  preferredStaffRole: varchar("preferred_staff_role"), // staff, maintenance, cleaning
  billingRule: varchar("billing_rule").notNull(), // owner-billable, guest-billable, company-expense, complimentary
  billingAmount: decimal("billing_amount", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  conditions: jsonb("conditions"), // Additional trigger conditions (occupancy, booking duration, etc.)
  recurringPattern: jsonb("recurring_pattern"), // For recurring tasks (daily, weekly, monthly)
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property-Specific Task Billing Rules
export const propertyTaskBilling = pgTable("property_task_billing", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  taskType: varchar("task_type").notNull(), // checkout-clean, pool-service, garden-service, pest-control
  department: varchar("department").notNull(),
  billingRate: decimal("billing_rate", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  billingCycle: varchar("billing_cycle").default("per-occurrence"), // per-occurrence, monthly, weekly
  chargeToParty: varchar("charge_to_party").notNull(), // owner, guest, company
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Task Generation Engine
export const aiTaskEngine = pgTable("ai_task_engine", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  triggerSource: varchar("trigger_source").notNull(), // guest-review, guest-message, booking-conditions, maintenance-alert
  sourceId: integer("source_id"), // feedback_id, message_id, booking_id
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  aiAnalysis: text("ai_analysis").notNull(), // AI's analysis of the trigger
  suggestedTaskType: varchar("suggested_task_type").notNull(),
  suggestedDepartment: varchar("suggested_department").notNull(),
  suggestedPriority: varchar("suggested_priority").default("medium"),
  suggestedTitle: varchar("suggested_title").notNull(),
  suggestedDescription: text("suggested_description"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // AI confidence score 0-100
  keywords: text("keywords").array(), // Keywords that triggered the suggestion
  status: varchar("status").default("pending"), // pending, approved, rejected, auto-created
  createdTaskId: integer("created_task_id").references(() => tasks.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Department Performance Analytics
export const taskDepartmentStats = pgTable("task_department_stats", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  department: varchar("department").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  reportMonth: varchar("report_month").notNull(), // YYYY-MM format
  totalTasks: integer("total_tasks").default(0),
  completedTasks: integer("completed_tasks").default(0),
  overdueTasks: integer("overdue_tasks").default(0),
  avgCompletionTime: decimal("avg_completion_time", { precision: 8, scale: 2 }), // hours
  totalCosts: decimal("total_costs", { precision: 12, scale: 2 }).default("0"),
  ownerBillable: decimal("owner_billable", { precision: 12, scale: 2 }).default("0"),
  guestBillable: decimal("guest_billable", { precision: 12, scale: 2 }).default("0"),
  companyExpense: decimal("company_expense", { precision: 12, scale: 2 }).default("0"),
  aiGeneratedTasks: integer("ai_generated_tasks").default(0),
  emergencyTasks: integer("emergency_tasks").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Task Evidence with Before/After Photos
export const taskEvidence = pgTable("task_evidence", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  evidenceType: varchar("evidence_type").notNull(), // before-photo, after-photo, receipt, document, note
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  fileSize: integer("file_size"), // bytes
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isRequired: boolean("is_required").default(false), // if this evidence is mandatory for task completion
});

// Task Completion Notifications & Escalations
export const taskNotificationRules = pgTable("task_notification_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ruleType: varchar("rule_type").notNull(), // overdue, missing-evidence, emergency, completion
  department: varchar("department"), // null = applies to all departments
  triggerCondition: varchar("trigger_condition").notNull(), // hours-overdue, no-photo-after-hours, priority-urgent
  triggerValue: integer("trigger_value"), // hours, days, etc.
  notifyRoles: text("notify_roles").array(), // admin, portfolio-manager, staff
  notificationMethod: varchar("notification_method").default("in-app"), // in-app, email, sms
  escalationChain: jsonb("escalation_chain"), // sequence of users to notify
  messageTemplate: text("message_template"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== TASK ENGINE INSERT SCHEMAS =====

export const insertTaskScheduleSchema = createInsertSchema(taskSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskAutoGenRuleSchema = createInsertSchema(taskAutoGenRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyTaskBillingSchema = createInsertSchema(propertyTaskBilling).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiTaskEngineSchema = createInsertSchema(aiTaskEngine).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskDepartmentStatsSchema = createInsertSchema(taskDepartmentStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskEvidenceSchema = createInsertSchema(taskEvidence).omit({
  id: true,
  uploadedAt: true,
});

export const insertTaskNotificationRuleSchema = createInsertSchema(taskNotificationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== TASK ENGINE TYPES =====

export type TaskSchedule = typeof taskSchedule.$inferSelect;
export type InsertTaskSchedule = z.infer<typeof insertTaskScheduleSchema>;
export type TaskAutoGenRule = typeof taskAutoGenRules.$inferSelect;
export type InsertTaskAutoGenRule = z.infer<typeof insertTaskAutoGenRuleSchema>;
export type PropertyTaskBilling = typeof propertyTaskBilling.$inferSelect;
export type InsertPropertyTaskBilling = z.infer<typeof insertPropertyTaskBillingSchema>;
export type AiTaskEngine = typeof aiTaskEngine.$inferSelect;
export type InsertAiTaskEngine = z.infer<typeof insertAiTaskEngineSchema>;
export type TaskDepartmentStats = typeof taskDepartmentStats.$inferSelect;
export type InsertTaskDepartmentStats = z.infer<typeof insertTaskDepartmentStatsSchema>;
export type TaskEvidence = typeof taskEvidence.$inferSelect;
export type InsertTaskEvidence = z.infer<typeof insertTaskEvidenceSchema>;
export type TaskNotificationRule = typeof taskNotificationRules.$inferSelect;
export type InsertTaskNotificationRule = z.infer<typeof insertTaskNotificationRuleSchema>;
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

// Enhanced task checklists will use the earlier definition

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

// ===== TASK CHECKLISTS & PROOF UPLOAD TYPES =====

// Task Checklists
export const insertTaskChecklistSchema = createInsertSchema(taskChecklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TaskChecklist = typeof taskChecklists.$inferSelect;
export type InsertTaskChecklist = z.infer<typeof insertTaskChecklistSchema>;

// Property Guides
export const insertPropertyGuideSchema = createInsertSchema(propertyGuides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PropertyGuide = typeof propertyGuides.$inferSelect;
export type InsertPropertyGuide = z.infer<typeof insertPropertyGuideSchema>;

// Task Proof Uploads
export const insertTaskProofUploadSchema = createInsertSchema(taskProofUploads).omit({
  id: true,
  uploadedAt: true,
  isArchived: true,
  archivedAt: true,
});

export type TaskProofUpload = typeof taskProofUploads.$inferSelect;
export type InsertTaskProofUpload = z.infer<typeof insertTaskProofUploadSchema>;

// Task Completions
export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

// Monthly Export Logs
export const insertMonthlyExportLogSchema = createInsertSchema(monthlyExportLogs).omit({
  id: true,
  exportedAt: true,
});

export type MonthlyExportLog = typeof monthlyExportLogs.$inferSelect;
export type InsertMonthlyExportLog = z.infer<typeof insertMonthlyExportLogSchema>;
export type SmartReplySuggestion = typeof smartReplySuggestions.$inferSelect;
export type InsertSmartReplySuggestion = z.infer<typeof insertSmartReplySuggestionSchema>;
export type AiMessageAnalysis = typeof aiMessageAnalysis.$inferSelect;
export type InsertAiMessageAnalysis = z.infer<typeof insertAiMessageAnalysisSchema>;
export type MessageDelivery = typeof messageDeliveries.$inferSelect;
export type InsertMessageDelivery = z.infer<typeof insertMessageDeliverySchema>;

// ===== STAFF PROFILE & PAYROLL LOGGING SYSTEM =====

// Staff Profile with Department & Performance Tracking
export const staffProfiles = pgTable("staff_profiles", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Personal Information
  employeeNumber: varchar("employee_number").unique(),
  department: varchar("department").notNull(), // cleaning, pool, maintenance, garden, office
  position: varchar("position").notNull(),
  hireDate: date("hire_date"),
  
  // Employment Details
  employmentType: varchar("employment_type").default("full_time"), // full_time, part_time, contract
  payType: varchar("pay_type").default("monthly"), // monthly, daily, hourly
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  
  // Performance Metrics
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"), // Average star rating
  totalHoursWorked: decimal("total_hours_worked", { precision: 10, scale: 2 }).default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_staff_profiles_org").on(table.organizationId),
  index("IDX_staff_profiles_dept").on(table.department),
]);

// Monthly Payroll Records with Detailed Tracking
export const monthlyPayrollRecords = pgTable("monthly_payroll_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Period Information
  payrollPeriod: varchar("payroll_period").notNull(), // "2025-01" format
  payrollYear: integer("payroll_year").notNull(),
  payrollMonth: integer("payroll_month").notNull(),
  
  // Salary Components
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).default("0"),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  taskBonuses: decimal("task_bonuses", { precision: 10, scale: 2 }).default("0"),
  commissions: decimal("commissions", { precision: 10, scale: 2 }).default("0"), // bike rentals, tour sales, etc.
  otherBonuses: decimal("other_bonuses", { precision: 10, scale: 2 }).default("0"),
  
  // Deductions
  advanceSalaryDeductions: decimal("advance_salary_deductions", { precision: 10, scale: 2 }).default("0"),
  fines: decimal("fines", { precision: 10, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0"),
  
  // Totals
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).default("0"),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).default("0"),
  
  // Payment Status
  status: varchar("status").default("pending"), // pending, approved, paid
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method"), // bank_transfer, cash, mobile_payment
  paymentReference: varchar("payment_reference"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_payroll_records_period").on(table.payrollPeriod),
  index("IDX_payroll_records_staff").on(table.staffId),
]);

// Task-Based Performance Logs
export const taskPerformanceLogs = pgTable("task_performance_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Performance Details
  timeliness: varchar("timeliness").default("on_time"), // early, on_time, late
  qualityRating: integer("quality_rating"), // 1-5 stars
  imageUploads: integer("image_uploads").default(0),
  completionTime: integer("completion_time"), // minutes
  
  // Feedback Sources
  portfolioManagerRating: integer("portfolio_manager_rating"), // 1-5 stars
  portfolioManagerFeedback: text("portfolio_manager_feedback"),
  ownerRating: integer("owner_rating"), // 1-5 stars  
  ownerFeedback: text("owner_feedback"),
  guestRating: integer("guest_rating"), // 1-5 stars
  guestFeedback: text("guest_feedback"),
  
  // Task completion details
  completedAt: timestamp("completed_at"),
  evidencePhotos: text("evidence_photos").array().default([]),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_performance_logs_staff").on(table.staffId),
  index("IDX_performance_logs_task").on(table.taskId),
]);

// Attendance & Shift Records
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Date & Shift Information
  workDate: date("work_date").notNull(),
  shiftType: varchar("shift_type").default("regular"), // regular, overtime, holiday, emergency
  
  // Clock In/Out
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  scheduledStartTime: timestamp("scheduled_start_time"),
  scheduledEndTime: timestamp("scheduled_end_time"),
  
  // Attendance Status
  status: varchar("status").default("present"), // present, absent, late, early_leave, missed_clock_out
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  
  // Notes & Explanations
  notes: text("notes"),
  absenceReason: varchar("absence_reason"), // sick, personal, vacation, emergency
  lateReason: text("late_reason"),
  
  // Approval for absences/adjustments
  requiresApproval: boolean("requires_approval").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_attendance_staff_date").on(table.staffId, table.workDate),
  index("IDX_attendance_date").on(table.workDate),
]);

// Leave & Vacation Requests
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Leave Details
  leaveType: varchar("leave_type").notNull(), // vacation, sick, personal, emergency, maternity
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  
  // Request Information
  reason: text("reason"),
  description: text("description"),
  emergencyContact: varchar("emergency_contact"),
  
  // Approval Workflow
  status: varchar("status").default("pending"), // pending, approved, rejected, cancelled
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Coverage Information
  coverageArranged: boolean("coverage_arranged").default(false),
  coverageNotes: text("coverage_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_leave_requests_staff").on(table.staffId),
  index("IDX_leave_requests_dates").on(table.startDate, table.endDate),
]);

// Commission & Bonus Tracking (bike rentals, tour sales, etc.)
export const staffCommissions = pgTable("staff_commissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Commission Details
  type: varchar("type").notNull(), // bike_rental, tour_booking, spa_service, other
  description: text("description").notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }), // e.g., 0.10 for 10%
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  
  // Reference Information
  referenceId: varchar("reference_id"), // booking ID, rental ID, etc.
  propertyId: integer("property_id").references(() => properties.id),
  
  // Period & Payment
  earnedDate: date("earned_date").notNull(),
  payrollPeriod: varchar("payroll_period"), // Which payroll period this belongs to
  isPaid: boolean("is_paid").default(false),
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_staff_commissions_staff").on(table.staffId),
  index("IDX_staff_commissions_period").on(table.payrollPeriod),
]);

// Downloadable Pay Slips
export const paySlips = pgTable("pay_slips", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  payrollRecordId: integer("payroll_record_id").references(() => monthlyPayrollRecords.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Pay Slip Details
  paySlipNumber: varchar("pay_slip_number").unique().notNull(),
  period: varchar("period").notNull(), // "January 2025", "2025-01"
  issuedDate: date("issued_date").notNull(),
  
  // File Information
  pdfUrl: varchar("pdf_url"), // URL to generated PDF
  generatedBy: varchar("generated_by").references(() => users.id),
  
  // Status
  status: varchar("status").default("draft"), // draft, issued, sent
  sentAt: timestamp("sent_at"),
  viewedByStaff: boolean("viewed_by_staff").default(false),
  viewedAt: timestamp("viewed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_pay_slips_staff").on(table.staffId),
  index("IDX_pay_slips_period").on(table.period),
]);

// Insert schemas for Staff Profile & Payroll Logging
export const insertStaffProfileSchema = createInsertSchema(staffProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyPayrollRecordSchema = createInsertSchema(monthlyPayrollRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskPerformanceLogSchema = createInsertSchema(taskPerformanceLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffCommissionSchema = createInsertSchema(staffCommissions).omit({
  id: true,
  createdAt: true,
});

export const insertPaySlipSchema = createInsertSchema(paySlips).omit({
  id: true,
  createdAt: true,
});

// Type definitions for Staff Profile & Payroll Logging
export type StaffProfile = typeof staffProfiles.$inferSelect;
export type InsertStaffProfile = z.infer<typeof insertStaffProfileSchema>;
export type MonthlyPayrollRecord = typeof monthlyPayrollRecords.$inferSelect;
export type InsertMonthlyPayrollRecord = z.infer<typeof insertMonthlyPayrollRecordSchema>;
export type TaskPerformanceLog = typeof taskPerformanceLogs.$inferSelect;
export type InsertTaskPerformanceLog = z.infer<typeof insertTaskPerformanceLogSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type StaffCommission = typeof staffCommissions.$inferSelect;
export type InsertStaffCommission = z.infer<typeof insertStaffCommissionSchema>;
export type PaySlip = typeof paySlips.$inferSelect;
export type InsertPaySlip = z.infer<typeof insertPaySlipSchema>;

// ===== STAFF ADVANCE & OVERTIME TRACKING SYSTEM =====

// Staff Salary Advance Requests
export const staffAdvanceRequests = pgTable("staff_advance_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Request Details
  requestAmount: decimal("request_amount", { precision: 10, scale: 2 }).notNull(),
  requestReason: text("request_reason").notNull(),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  proofAttachment: varchar("proof_attachment"), // Optional file URL
  
  // Approval Workflow
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Admin/PM who reviewed
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Payment Tracking
  paymentStatus: varchar("payment_status").default("not_paid"), // not_paid, paid, deducted
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  paidDate: timestamp("paid_date"),
  deductionSchedule: jsonb("deduction_schedule"), // Array of monthly deductions
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_advance_staff").on(table.staffId),
  index("IDX_advance_org").on(table.organizationId),
  index("IDX_advance_status").on(table.status),
]);

// Staff Clock Entries with GPS Tracking
export const staffClockEntries = pgTable("staff_clock_entries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Task Information
  taskId: integer("task_id").references(() => tasks.id), // Optional link to task
  propertyId: integer("property_id").references(() => properties.id), // Optional property link
  taskDescription: text("task_description").notNull(),
  
  // Clock In/Out Timing
  clockInTime: varchar("clock_in_time").notNull(), // HH:mm:ss format
  clockOutTime: varchar("clock_out_time"), // HH:mm:ss format, null if active
  workDate: date("work_date").defaultNow().notNull(),
  
  // GPS Tracking
  gpsLocationIn: text("gps_location_in"), // "lat,lng" format
  gpsLocationOut: text("gps_location_out"), // "lat,lng" format 
  locationAccuracy: decimal("location_accuracy", { precision: 6, scale: 2 }), // meters
  
  // Overtime Tracking
  isOvertime: boolean("is_overtime").default(false),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0.00"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  
  // Evidence and Approval
  photoEvidence: text("photo_evidence"), // Base64 or URL
  isEmergency: boolean("is_emergency").default(false),
  emergencyReason: text("emergency_reason"),
  supervisorApproved: boolean("supervisor_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Status Tracking
  status: varchar("status").default("active").notNull(), // active, completed, emergency
  completedAt: timestamp("completed_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_clock_staff").on(table.staffId),
  index("IDX_clock_org").on(table.organizationId),
  index("IDX_clock_date").on(table.workDate),
  index("IDX_clock_status").on(table.status),
]);

// Staff Overtime & Emergency Task Logs
export const staffOvertimeLogs = pgTable("staff_overtime_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Time Tracking
  workDate: date("work_date").notNull(),
  timeIn: varchar("time_in").notNull(), // HH:MM format
  timeOut: varchar("time_out").notNull(),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }).notNull(),
  
  // Task Details
  taskType: varchar("task_type").notNull(), // emergency_pool_fix, late_check_in, maintenance_urgent, etc.
  taskDescription: text("task_description").notNull(),
  isEmergency: boolean("is_emergency").default(false),
  
  // Evidence & Proof
  photoEvidence: jsonb("photo_evidence"), // Array of photo URLs
  guestSignature: varchar("guest_signature"), // Digital signature URL
  additionalNotes: text("additional_notes"),
  
  // Approval & Compensation
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvalNotes: text("approval_notes"),
  
  // Compensation Type
  compensationType: varchar("compensation_type"), // overtime_pay, time_off_credit
  compensationAmount: decimal("compensation_amount", { precision: 10, scale: 2 }),
  timeOffHours: decimal("time_off_hours", { precision: 4, scale: 2 }),
  
  // Payment Status
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, credited
  paidDate: timestamp("paid_date"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_overtime_staff").on(table.staffId),
  index("IDX_overtime_org").on(table.organizationId),
  index("IDX_overtime_date").on(table.workDate),
  index("IDX_overtime_status").on(table.status),
]);

// Staff Overtime Settings & Rates
export const staffOvertimeSettings = pgTable("staff_overtime_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id),
  
  // Global or Per-Staff Settings
  isGlobalSetting: boolean("is_global_setting").default(false),
  
  // Overtime Rules
  regularHourlyRate: decimal("regular_hourly_rate", { precision: 10, scale: 2 }),
  overtimeMultiplier: decimal("overtime_multiplier", { precision: 3, scale: 2 }).default("1.5"), // 1.5x rate
  emergencyMultiplier: decimal("emergency_multiplier", { precision: 3, scale: 2 }).default("2.0"), // 2x rate
  
  // Work Hour Definitions
  standardWorkStart: varchar("standard_work_start").default("08:00"),
  standardWorkEnd: varchar("standard_work_end").default("18:00"),
  afterHoursThreshold: varchar("after_hours_threshold").default("20:00"), // After 8 PM = overtime
  
  // Compensation Preferences
  defaultCompensationType: varchar("default_compensation_type").default("overtime_pay"), // overtime_pay, time_off_credit
  allowStaffChoice: boolean("allow_staff_choice").default(true),
  
  // Time Off Credit Rules
  timeOffCreditRate: decimal("time_off_credit_rate", { precision: 3, scale: 2 }).default("1.0"), // 1:1 ratio
  maxTimeOffAccumulation: decimal("max_time_off_accumulation", { precision: 4, scale: 2 }).default("40.0"), // 40 hours max
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_overtime_settings_org").on(table.organizationId),
  index("IDX_overtime_settings_staff").on(table.staffId),
]);

// Staff Monthly Summary (for dashboard display)
export const staffMonthlySummary = pgTable("staff_monthly_summary", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Period
  summaryYear: integer("summary_year").notNull(),
  summaryMonth: integer("summary_month").notNull(),
  summaryPeriod: varchar("summary_period").notNull(), // "2025-01" format
  
  // Advance Summary
  totalAdvanceRequests: integer("total_advance_requests").default(0),
  approvedAdvances: decimal("approved_advances", { precision: 10, scale: 2 }).default("0"),
  pendingAdvances: decimal("pending_advances", { precision: 10, scale: 2 }).default("0"),
  remainingAdvanceBalance: decimal("remaining_advance_balance", { precision: 10, scale: 2 }).default("0"),
  
  // Overtime Summary
  totalOvertimeHours: decimal("total_overtime_hours", { precision: 4, scale: 2 }).default("0"),
  approvedOvertimeHours: decimal("approved_overtime_hours", { precision: 4, scale: 2 }).default("0"),
  pendingOvertimeHours: decimal("pending_overtime_hours", { precision: 4, scale: 2 }).default("0"),
  overtimeEarnings: decimal("overtime_earnings", { precision: 10, scale: 2 }).default("0"),
  timeOffCredits: decimal("time_off_credits", { precision: 4, scale: 2 }).default("0"),
  
  // Task Summary
  emergencyTasks: integer("emergency_tasks").default(0),
  afterHoursTasks: integer("after_hours_tasks").default(0),
  
  // Auto-calculated
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  index("IDX_monthly_summary_staff").on(table.staffId),
  index("IDX_monthly_summary_period").on(table.summaryPeriod),
]);

// Schema and Type Definitions for Advance & Overtime System
export const insertStaffAdvanceRequestSchema = createInsertSchema(staffAdvanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffClockEntrySchema = createInsertSchema(staffClockEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  approvedAt: true,
});

export const insertStaffOvertimeLogSchema = createInsertSchema(staffOvertimeLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffOvertimeSettingsSchema = createInsertSchema(staffOvertimeSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffMonthlySummarySchema = createInsertSchema(staffMonthlySummary).omit({
  id: true,
  lastUpdated: true,
});

// Type definitions for Staff Advance & Overtime System
export type StaffAdvanceRequest = typeof staffAdvanceRequests.$inferSelect;
export type InsertStaffAdvanceRequest = z.infer<typeof insertStaffAdvanceRequestSchema>;
export type StaffClockEntry = typeof staffClockEntries.$inferSelect;
export type InsertStaffClockEntry = z.infer<typeof insertStaffClockEntrySchema>;
export type StaffOvertimeLog = typeof staffOvertimeLogs.$inferSelect;
export type InsertStaffOvertimeLog = z.infer<typeof insertStaffOvertimeLogSchema>;
export type StaffOvertimeSettings = typeof staffOvertimeSettings.$inferSelect;
export type InsertStaffOvertimeSettings = z.infer<typeof insertStaffOvertimeSettingsSchema>;
export type StaffMonthlySummary = typeof staffMonthlySummary.$inferSelect;
export type InsertStaffMonthlySummary = z.infer<typeof insertStaffMonthlySummarySchema>;

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

// ===== ADD-ON SERVICES ENGINE SCHEMAS AND TYPES =====

// Insert schemas for Add-On Services Engine
export const insertAddonServiceCatalogSchema = createInsertSchema(addonServiceCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonServiceBookingSchema = createInsertSchema(addonServiceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonServiceCategorySchema = createInsertSchema(addonServiceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAddonServiceCommissionSchema = createInsertSchema(addonServiceCommissions).omit({
  id: true,
  createdAt: true,
});

export const insertAddonServiceReportSchema = createInsertSchema(addonServiceReports).omit({
  id: true,
  createdAt: true,
  reportGeneratedAt: true,
});

export const insertAddonServiceAvailabilitySchema = createInsertSchema(addonServiceAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddonBillingRuleSchema = createInsertSchema(addonBillingRules).omit({
  id: true,
  createdAt: true,
});

// Type definitions for Add-On Services Engine
export type AddonServiceCatalog = typeof addonServiceCatalog.$inferSelect;
export type InsertAddonServiceCatalog = z.infer<typeof insertAddonServiceCatalogSchema>;
export type AddonServiceBooking = typeof addonServiceBookings.$inferSelect;
export type InsertAddonServiceBooking = z.infer<typeof insertAddonServiceBookingSchema>;
export type AddonServiceCategory = typeof addonServiceCategories.$inferSelect;
export type InsertAddonServiceCategory = z.infer<typeof insertAddonServiceCategorySchema>;
export type AddonServiceCommission = typeof addonServiceCommissions.$inferSelect;
export type InsertAddonServiceCommission = z.infer<typeof insertAddonServiceCommissionSchema>;
export type AddonServiceReport = typeof addonServiceReports.$inferSelect;
export type InsertAddonServiceReport = z.infer<typeof insertAddonServiceReportSchema>;
export type AddonServiceAvailability = typeof addonServiceAvailability.$inferSelect;
export type InsertAddonServiceAvailability = z.infer<typeof insertAddonServiceAvailabilitySchema>;
export type AddonBillingRule = typeof addonBillingRules.$inferSelect;
export type InsertAddonBillingRule = z.infer<typeof insertAddonBillingRuleSchema>;

// ===== LIVE BOOKING CALENDAR & AGENT SYSTEM =====

// Live booking calendar with API connectivity
export const liveBookingCalendar = pgTable("live_booking_calendar", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Booking Details
  bookingReference: varchar("booking_reference").notNull(), // External booking ID
  externalBookingId: varchar("external_booking_id"), // Hostaway/Airbnb/etc ID
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  
  // Dates and Duration
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  nightCount: integer("night_count").notNull(),
  guestCount: integer("guest_count").default(2),
  
  // Financial Information
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("THB"),
  cleaningFee: decimal("cleaning_fee", { precision: 10, scale: 2 }).default("0.00"),
  
  // Booking Status and Source
  bookingStatus: varchar("booking_status").notNull(), // confirmed, cancelled, completed, no-show
  bookingSource: varchar("booking_source").notNull(), // airbnb, vrbo, booking.com, direct, etc.
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0.00"),
  
  // Revenue Split Configuration
  ownerSplit: decimal("owner_split", { precision: 5, scale: 2 }).default("70.00"), // percentage
  managementSplit: decimal("management_split", { precision: 5, scale: 2 }).default("30.00"), // percentage
  splitRoutingNotes: text("split_routing_notes"), // Explanation for routing decision
  
  // API Integration
  apiSource: varchar("api_source").default("hostaway"), // hostaway, hostify, ownerrez
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  syncStatus: varchar("sync_status").default("active"), // active, failed, manual
  apiBookingData: jsonb("api_booking_data"), // Raw API response for debugging
  
  // Property Details
  bedroomCount: integer("bedroom_count"),
  bathroomCount: integer("bathroom_count"),
  maxGuests: integer("max_guests"),
  
  // Special Requirements
  specialRequests: text("special_requests"),
  guestNotes: text("guest_notes"),
  internalNotes: text("internal_notes"), // Staff/PM notes
  
  // Commission Tracking
  agentCommissionApplicable: boolean("agent_commission_applicable").default(false),
  referralAgentId: varchar("referral_agent_id").references(() => users.id),
  retailAgentId: varchar("retail_agent_id").references(() => users.id),
  agentCommissionAmount: decimal("agent_commission_amount", { precision: 10, scale: 2 }).default("0.00"),
  agentCommissionStatus: varchar("agent_commission_status").default("pending"), // pending, approved, paid
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Property availability calendar (blocked dates, maintenance, etc.)
export const propertyAvailability = pgTable("property_availability", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Date Range
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  
  // Availability Status
  availabilityType: varchar("availability_type").notNull(), // blocked, maintenance, available, booked
  blockReason: varchar("block_reason"), // owner_personal, maintenance, cleaning, buffer
  
  // Pricing Information
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  weekendPrice: decimal("weekend_price", { precision: 10, scale: 2 }),
  holidayPrice: decimal("holiday_price", { precision: 10, scale: 2 }),
  minimumStay: integer("minimum_stay").default(1),
  
  // API Sync
  externalCalendarId: varchar("external_calendar_id"), // From booking platforms
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  
  // Notes
  internalNotes: text("internal_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Agent search filters and preferences
export const agentSearchPreferences = pgTable("agent_search_preferences", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  
  // Saved Filter Preferences
  preferredLocations: jsonb("preferred_locations"), // Array of location/zone preferences
  preferredBedroomRange: jsonb("preferred_bedroom_range"), // {min: 2, max: 5}
  preferredPriceRange: jsonb("preferred_price_range"), // {min: 1000, max: 5000}
  preferredAmenities: jsonb("preferred_amenities"), // Array of amenity IDs
  
  // Search Behavior
  defaultSearchRadius: integer("default_search_radius").default(50), // km
  showCommissionUpfront: boolean("show_commission_upfront").default(true),
  autoRefreshResults: boolean("auto_refresh_results").default(true),
  
  // Notification Preferences
  newListingAlerts: boolean("new_listing_alerts").default(true),
  priceDropAlerts: boolean("price_drop_alerts").default(false),
  availabilityAlerts: boolean("availability_alerts").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property search index for agents
export const propertySearchIndex = pgTable("property_search_index", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Enhanced Property Information
  propertyTitle: varchar("property_title").notNull(),
  propertyDescription: text("property_description"),
  shortDescription: varchar("short_description"), // For search results
  
  // Location Details
  country: varchar("country").default("Thailand"),
  province: varchar("province"), // Phuket, Bangkok, etc.
  district: varchar("district"),
  zone: varchar("zone"), // Patong, Kata, etc.
  coordinates: jsonb("coordinates"), // {lat: 7.8804, lng: 98.3923}
  
  // Property Features
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  maxGuests: integer("max_guests").notNull(),
  propertySize: integer("property_size"), // sqm
  
  // Amenities and Features
  amenities: jsonb("amenities"), // Pool, WiFi, Kitchen, etc.
  specialFeatures: jsonb("special_features"), // Sea view, private beach, etc.
  
  // Pricing Information
  baseNightlyRate: decimal("base_nightly_rate", { precision: 10, scale: 2 }).notNull(),
  weekendRate: decimal("weekend_rate", { precision: 10, scale: 2 }),
  peakSeasonRate: decimal("peak_season_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("THB"),
  
  // Commission Structure
  standardCommissionRate: decimal("standard_commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  specialCommissionRate: decimal("special_commission_rate", { precision: 5, scale: 2 }),
  commissionNotes: text("commission_notes"),
  
  // Media and Marketing
  primaryImageUrl: varchar("primary_image_url"),
  imageGallery: jsonb("image_gallery"), // Array of image URLs
  virtualTourUrl: varchar("virtual_tour_url"),
  propertyFactSheetUrl: varchar("property_fact_sheet_url"),
  
  // Availability and Booking
  isActive: boolean("is_active").default(true),
  minimumBookingNotice: integer("minimum_booking_notice").default(1), // days
  maximumBookingAdvance: integer("maximum_booking_advance").default(365), // days
  instantBookingEnabled: boolean("instant_booking_enabled").default(false),
  
  // Search Optimization
  searchTags: jsonb("search_tags"), // Additional search keywords
  popularityScore: integer("popularity_score").default(0), // Based on booking frequency
  lastBookingDate: date("last_booking_date"),
  averageOccupancyRate: decimal("average_occupancy_rate", { precision: 5, scale: 2 }),
  averageReviewScore: decimal("average_review_score", { precision: 3, scale: 2 }),
  
  // API Integration
  hostawayPropertyId: varchar("hostaway_property_id"),
  airbnbListingId: varchar("airbnb_listing_id"),
  vrboListingId: varchar("vrbo_listing_id"),
  bookingComListingId: varchar("booking_com_listing_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastIndexedAt: timestamp("last_indexed_at").defaultNow(),
});

// Agent booking enquiries and interactions
export const agentBookingEnquiries = pgTable("agent_booking_enquiries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  agentId: varchar("agent_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Enquiry Details
  enquiryType: varchar("enquiry_type").notNull(), // booking_request, availability_check, price_quote
  enquiryReference: varchar("enquiry_reference").notNull(), // Agent reference number
  
  // Guest Information
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  guestPhone: varchar("guest_phone"),
  guestNationality: varchar("guest_nationality"),
  
  // Booking Request Details
  requestedCheckIn: date("requested_check_in").notNull(),
  requestedCheckOut: date("requested_check_out").notNull(),
  guestCount: integer("guest_count").notNull(),
  specialRequests: text("special_requests"),
  
  // Pricing and Commission
  quotedPrice: decimal("quoted_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("THB"),
  calculatedCommission: decimal("calculated_commission", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  
  // Status and Processing
  enquiryStatus: varchar("enquiry_status").default("pending"), // pending, quoted, confirmed, cancelled, expired
  responseDeadline: timestamp("response_deadline"),
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  
  // Communication
  agentNotes: text("agent_notes"),
  internalNotes: text("internal_notes"),
  communicationHistory: jsonb("communication_history"), // Array of messages/emails
  
  // Booking Conversion
  convertedToBooking: boolean("converted_to_booking").default(false),
  bookingId: integer("booking_id").references(() => liveBookingCalendar.id),
  conversionDate: timestamp("conversion_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking platform sync configuration
export const bookingPlatformSync = pgTable("booking_platform_sync", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Platform Configuration
  platformName: varchar("platform_name").notNull(), // hostaway, hostify, ownerrez
  apiEndpoint: varchar("api_endpoint").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(), // Encrypted API key
  isActive: boolean("is_active").default(true),
  
  // Sync Settings
  syncFrequency: integer("sync_frequency").default(15), // minutes
  lastSyncAt: timestamp("last_sync_at"),
  nextSyncAt: timestamp("next_sync_at"),
  syncStatus: varchar("sync_status").default("pending"), // pending, syncing, completed, failed
  
  // Error Handling
  lastError: text("last_error"),
  errorCount: integer("error_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  // Sync Statistics
  totalBookingsImported: integer("total_bookings_imported").default(0),
  lastImportCount: integer("last_import_count").default(0),
  totalSyncTime: integer("total_sync_time").default(0), // milliseconds
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Property occupancy analytics
export const propertyOccupancyAnalytics = pgTable("property_occupancy_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Time Period
  periodType: varchar("period_type").notNull(), // daily, weekly, monthly, yearly
  periodDate: date("period_date").notNull(), // Start date of the period
  
  // Occupancy Metrics
  totalNights: integer("total_nights").notNull(),
  bookedNights: integer("booked_nights").notNull(),
  blockedNights: integer("blocked_nights").default(0),
  maintenanceNights: integer("maintenance_nights").default(0),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).notNull(),
  
  // Revenue Metrics
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  averageNightlyRate: decimal("average_nightly_rate", { precision: 10, scale: 2 }).default("0.00"),
  revenuePerAvailableNight: decimal("revenue_per_available_night", { precision: 10, scale: 2 }).default("0.00"),
  
  // Booking Metrics
  totalBookings: integer("total_bookings").default(0),
  averageStayDuration: decimal("average_stay_duration", { precision: 4, scale: 2 }).default("0.00"),
  averageGuestCount: decimal("average_guest_count", { precision: 4, scale: 2 }).default("0.00"),
  
  // Platform Breakdown
  platformBreakdown: jsonb("platform_breakdown"), // {airbnb: {bookings: 5, revenue: 25000}, vrbo: {...}}
  
  // Performance Indicators
  bookingLeadTime: decimal("booking_lead_time", { precision: 5, scale: 2 }).default("0.00"), // days
  cancellationRate: decimal("cancellation_rate", { precision: 5, scale: 2 }).default("0.00"),
  reviewScore: decimal("review_score", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// ===== RELATIONSHIPS =====

export const liveBookingCalendarRelations = relations(liveBookingCalendar, ({ one }) => ({
  property: one(properties, {
    fields: [liveBookingCalendar.propertyId],
    references: [properties.id],
  }),
  referralAgent: one(users, {
    fields: [liveBookingCalendar.referralAgentId],
    references: [users.id],
  }),
  retailAgent: one(users, {
    fields: [liveBookingCalendar.retailAgentId],
    references: [users.id],
  }),
}));

export const propertyAvailabilityRelations = relations(propertyAvailability, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAvailability.propertyId],
    references: [properties.id],
  }),
}));

export const propertySearchIndexRelations = relations(propertySearchIndex, ({ one }) => ({
  property: one(properties, {
    fields: [propertySearchIndex.propertyId],
    references: [properties.id],
  }),
}));

export const agentBookingEnquiriesRelations = relations(agentBookingEnquiries, ({ one }) => ({
  agent: one(users, {
    fields: [agentBookingEnquiries.agentId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [agentBookingEnquiries.propertyId],
    references: [properties.id],
  }),
  booking: one(liveBookingCalendar, {
    fields: [agentBookingEnquiries.bookingId],
    references: [liveBookingCalendar.id],
  }),
}));

// ===== INSERT SCHEMAS =====

export const insertLiveBookingCalendarSchema = createInsertSchema(liveBookingCalendar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyAvailabilitySchema = createInsertSchema(propertyAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSearchPreferencesSchema = createInsertSchema(agentSearchPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySearchIndexSchema = createInsertSchema(propertySearchIndex).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentBookingEnquiriesSchema = createInsertSchema(agentBookingEnquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingPlatformSyncSchema = createInsertSchema(bookingPlatformSync).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyOccupancyAnalyticsSchema = createInsertSchema(propertyOccupancyAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== TYPE EXPORTS =====

export type LiveBookingCalendar = typeof liveBookingCalendar.$inferSelect;
export type InsertLiveBookingCalendar = z.infer<typeof insertLiveBookingCalendarSchema>;
export type PropertyAvailability = typeof propertyAvailability.$inferSelect;
export type InsertPropertyAvailability = z.infer<typeof insertPropertyAvailabilitySchema>;
export type AgentSearchPreferences = typeof agentSearchPreferences.$inferSelect;
export type InsertAgentSearchPreferences = z.infer<typeof insertAgentSearchPreferencesSchema>;
export type PropertySearchIndex = typeof propertySearchIndex.$inferSelect;
export type InsertPropertySearchIndex = z.infer<typeof insertPropertySearchIndexSchema>;
export type AgentBookingEnquiries = typeof agentBookingEnquiries.$inferSelect;
export type InsertAgentBookingEnquiries = z.infer<typeof insertAgentBookingEnquiriesSchema>;
export type BookingPlatformSync = typeof bookingPlatformSync.$inferSelect;
export type InsertBookingPlatformSync = z.infer<typeof insertBookingPlatformSyncSchema>;
export type PropertyOccupancyAnalytics = typeof propertyOccupancyAnalytics.$inferSelect;
export type InsertPropertyOccupancyAnalytics = z.infer<typeof insertPropertyOccupancyAnalyticsSchema>;

// ===== GUEST PORTAL INTERFACE TABLES =====

// Guest Portal Sessions - Secure guest access tokens for bookings
export const guestPortalSessions = pgTable("guest_portal_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  guestEmail: varchar("guest_email").notNull(),
  accessToken: varchar("access_token").unique().notNull(), // Secure token for guest access
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  guestName: varchar("guest_name").notNull(),
  guestPhone: varchar("guest_phone"),
  isActive: boolean("is_active").default(true),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Expires after checkout + 30 days
  createdAt: timestamp("created_at").defaultNow(),
});

// Guest Activity Timeline - Track guest service requests and bookings
export const guestActivityTimeline = pgTable("guest_activity_timeline", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  guestSessionId: integer("guest_session_id").references(() => guestPortalSessions.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  activityType: varchar("activity_type").notNull(), // service_request, cleaning_request, message, addon_booking
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, cancelled
  requestedAt: timestamp("requested_at").defaultNow(),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  chargeAssignment: varchar("charge_assignment").default("guest"), // guest, owner, company
  isVisible: boolean("is_visible").default(true), // Visible to guest in portal
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// (Guest Chat Messages schema will be defined later in the file to avoid duplicates)

// Guest AI FAQ Knowledge Base - Pre-configured responses for common questions
export const guestAiFaqKnowledge = pgTable("guest_ai_faq_knowledge", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  categoryType: varchar("category_type").notNull(), // property_info, amenities, local_area, policies, troubleshooting
  questionKeywords: jsonb("question_keywords").notNull(), // Array of keywords that trigger this FAQ
  standardQuestion: varchar("standard_question").notNull(),
  standardAnswer: text("standard_answer").notNull(),
  propertySpecific: boolean("property_specific").default(false),
  propertyId: integer("property_id").references(() => properties.id), // Null for general FAQ
  priority: integer("priority").default(1), // 1-10, higher priority responses shown first
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Add-On Service Requests - Services like cleaning, chef, massage, transport
export const guestAddonServiceRequests = pgTable("guest_addon_service_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  guestSessionId: integer("guest_session_id").references(() => guestPortalSessions.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  serviceId: integer("service_id").references(() => guestAddonServices.id).notNull(),
  
  // Service Details
  serviceName: varchar("service_name").notNull(),
  serviceType: varchar("service_type").notNull(), // cleaning, chef, massage, transport, babysitting, laundry
  requestedDate: date("requested_date").notNull(),
  requestedTime: varchar("requested_time"), // Preferred time slot
  duration: integer("duration"), // Duration in minutes/hours
  guestCount: integer("guest_count").default(1), // Number of people for service
  
  // Pricing and Assignment
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  chargeAssignment: varchar("charge_assignment").default("guest"), // guest, owner, company
  assignmentReason: text("assignment_reason"), // Why charged to owner/company
  
  // Status and Processing
  requestStatus: varchar("request_status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  confirmedBy: varchar("confirmed_by").references(() => users.id), // Staff who confirmed
  confirmedAt: timestamp("confirmed_at"),
  scheduledDateTime: timestamp("scheduled_date_time"),
  completedAt: timestamp("completed_at"),
  
  // Service Provider
  serviceProviderId: varchar("service_provider_id").references(() => users.id), // Staff assigned
  providerNotes: text("provider_notes"),
  completionNotes: text("completion_notes"),
  guestRating: integer("guest_rating"), // 1-5 stars
  guestReview: text("guest_review"),
  
  // Special Requirements
  specialRequests: text("special_requests"),
  guestNotes: text("guest_notes"),
  adminNotes: text("admin_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Property Info & Local Areas - Interactive maps and recommendations
export const guestPropertyLocalInfo = pgTable("guest_property_local_info", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Location Details
  locationName: varchar("location_name").notNull(),
  locationType: varchar("location_type").notNull(), // beach, restaurant, pharmacy, convenience_store, activity, tour
  description: text("description"),
  address: text("address"),
  
  // Geographic Data
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  distanceFromProperty: decimal("distance_from_property", { precision: 5, scale: 2 }), // km
  walkingTime: integer("walking_time"), // minutes
  drivingTime: integer("driving_time"), // minutes
  
  // Contact and Booking
  phoneNumber: varchar("phone_number"),
  website: varchar("website"),
  openingHours: jsonb("opening_hours"), // {monday: "09:00-18:00", tuesday: "09:00-18:00"}
  isPartner: boolean("is_partner").default(false), // Partner locations get commission
  bookingRequired: boolean("booking_required").default(false),
  
  // Display and Recommendations
  displayOrder: integer("display_order").default(0),
  recommendationScore: integer("recommendation_score").default(1), // 1-10
  imageUrl: varchar("image_url"),
  tags: jsonb("tags"), // Array of tags: ["family_friendly", "romantic", "budget", "luxury"]
  priceRange: varchar("price_range"), // budget, moderate, expensive, luxury
  
  // Status
  isActive: boolean("is_active").default(true),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Maintenance Reports - Direct reporting with auto-task creation
export const guestMaintenanceReports = pgTable("guest_maintenance_reports", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  guestSessionId: integer("guest_session_id").references(() => guestPortalSessions.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Issue Details
  issueType: varchar("issue_type").notNull(), // electrical, plumbing, appliance, cleaning, amenity, safety
  issueTitle: varchar("issue_title").notNull(),
  issueDescription: text("issue_description").notNull(),
  locationInProperty: varchar("location_in_property"), // bedroom_1, kitchen, pool_area, garden
  severityLevel: varchar("severity_level").default("medium"), // low, medium, high, urgent
  
  // Media Evidence
  reportImages: jsonb("report_images"), // Array of image URLs uploaded by guest
  reportVideos: jsonb("report_videos"), // Array of video URLs if applicable
  
  // Processing and Assignment
  reportStatus: varchar("report_status").default("submitted"), // submitted, acknowledged, assigned, in_progress, resolved, closed
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id), // First staff to see report
  acknowledgedAt: timestamp("acknowledged_at"),
  autoCreatedTaskId: integer("auto_created_task_id").references(() => tasks.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  
  // Resolution
  estimatedResolutionTime: varchar("estimated_resolution_time"), // "within_24h", "1-3_days", "3-7_days"
  actualResolutionTime: timestamp("actual_resolution_time"),
  resolutionNotes: text("resolution_notes"),
  resolutionImages: jsonb("resolution_images"), // Before/after photos
  
  // Follow-up
  guestSatisfied: boolean("guest_satisfied"),
  guestFeedback: text("guest_feedback"),
  followUpRequired: boolean("follow_up_required").default(false),
  
  // Staff Communication
  staffNotes: text("staff_notes"),
  internalComments: text("internal_comments"), // Not visible to guest
  
  reportedAt: timestamp("reported_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== GUEST PORTAL INSERT SCHEMAS =====

export const insertGuestPortalSessionSchema = createInsertSchema(guestPortalSessions).omit({
  id: true,
  createdAt: true,
});

export const insertGuestActivityTimelineSchema = createInsertSchema(guestActivityTimeline).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertGuestAiFaqKnowledgeSchema = createInsertSchema(guestAiFaqKnowledge).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestAddonServiceRequestSchema = createInsertSchema(guestAddonServiceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestPropertyLocalInfoSchema = createInsertSchema(guestPropertyLocalInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestMaintenanceReportSchema = createInsertSchema(guestMaintenanceReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== GUEST PORTAL TYPES =====

export type GuestPortalSession = typeof guestPortalSessions.$inferSelect;
export type InsertGuestPortalSession = z.infer<typeof insertGuestPortalSessionSchema>;
export type GuestActivityTimeline = typeof guestActivityTimeline.$inferSelect;
export type InsertGuestActivityTimeline = z.infer<typeof insertGuestActivityTimelineSchema>;

export type GuestAiFaqKnowledge = typeof guestAiFaqKnowledge.$inferSelect;
export type InsertGuestAiFaqKnowledge = z.infer<typeof insertGuestAiFaqKnowledgeSchema>;
export type GuestAddonServiceRequest = typeof guestAddonServiceRequests.$inferSelect;
export type InsertGuestAddonServiceRequest = z.infer<typeof insertGuestAddonServiceRequestSchema>;
export type GuestPropertyLocalInfo = typeof guestPropertyLocalInfo.$inferSelect;
export type InsertGuestPropertyLocalInfo = z.infer<typeof insertGuestPropertyLocalInfoSchema>;
export type GuestMaintenanceReport = typeof guestMaintenanceReports.$inferSelect;
export type InsertGuestMaintenanceReport = z.infer<typeof insertGuestMaintenanceReportSchema>;

// ===== ENHANCED MAINTENANCE TASK SYSTEM TYPES =====

export type TaskChecklist = typeof taskChecklists.$inferSelect;
export type InsertTaskChecklist = typeof taskChecklists.$inferInsert;
export type PropertyGuide = typeof propertyGuides.$inferSelect; 
export type InsertPropertyGuide = typeof propertyGuides.$inferInsert;
export type AiTaskSuggestion = typeof aiTaskSuggestions.$inferSelect;
export type InsertAiTaskSuggestion = typeof aiTaskSuggestions.$inferInsert;
export type TaskExpense = typeof taskExpenses.$inferSelect;
export type InsertTaskExpense = typeof taskExpenses.$inferInsert;
export type ArchivedTask = typeof archivedTasks.$inferSelect;
export type InsertArchivedTask = typeof archivedTasks.$inferInsert;
export type EnhancedAiSuggestion = typeof enhancedAiSuggestions.$inferSelect;
export type InsertEnhancedAiSuggestion = typeof enhancedAiSuggestions.$inferInsert;
export type PropertyTimeline = typeof propertyTimeline.$inferSelect;
export type InsertPropertyTimeline = typeof propertyTimeline.$inferInsert;
export type SmartNotification = typeof smartNotifications.$inferSelect;
export type InsertSmartNotification = typeof smartNotifications.$inferInsert;
export type FastActionSuggestion = typeof fastActionSuggestions.$inferSelect;
export type InsertFastActionSuggestion = typeof fastActionSuggestions.$inferInsert;

// ===== OWNER BALANCE & PAYMENT SYSTEM =====

// Owner Balance Tracker - Live balance calculation per property
export const ownerBalanceTrackers = pgTable("owner_balance_trackers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Balance Components
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0.00"),
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default("0.00"),
  totalCommissions: decimal("total_commissions", { precision: 12, scale: 2 }).default("0.00"),
  netBalance: decimal("net_balance", { precision: 12, scale: 2 }).default("0.00"),
  
  // Calculation Period
  calculationPeriod: varchar("calculation_period").default("monthly"), // monthly, bi_weekly, quarterly
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  
  // Status
  balanceStatus: varchar("balance_status").default("current"), // current, pending_payout, processing, paid
  lastPayoutDate: timestamp("last_payout_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Owner Payout Requests - Workflow management
export const ownerPayoutRequests = pgTable("owner_payout_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  balanceTrackerId: integer("balance_tracker_id").references(() => ownerBalanceTrackers.id),
  
  // Request Details
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  requestType: varchar("request_type").default("balance_payout"), // balance_payout, partial_payout, advance_request
  requestNotes: text("request_notes"),
  
  // Workflow Status
  requestStatus: varchar("request_status").default("pending"), // pending, approved, paid, confirmed, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  
  // Admin/PM Approval
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvalNotes: text("approval_notes"),
  
  // Payment Processing
  paymentSlipUrl: varchar("payment_slip_url"), // Upload receipt of transfer
  paidBy: varchar("paid_by").references(() => users.id),
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method"), // bank_transfer, cash, check, digital_wallet
  paymentReference: varchar("payment_reference"),
  
  // Owner Confirmation
  confirmedBy: varchar("confirmed_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  confirmationNotes: text("confirmation_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Owner Payment Logs - Complete audit trail
export const ownerPaymentLogs = pgTable("owner_payment_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  payoutRequestId: integer("payout_request_id").references(() => ownerPayoutRequests.id),
  
  // Payment Details
  paymentType: varchar("payment_type").notNull(), // payout_to_owner, payment_from_owner, balance_adjustment, admin_correction
  paymentDirection: varchar("payment_direction").notNull(), // outgoing, incoming
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  
  // Transaction Details
  transactionReference: varchar("transaction_reference"),
  paymentMethod: varchar("payment_method"),
  receiptUrl: varchar("receipt_url"),
  
  // Processing Info
  processedBy: varchar("processed_by").references(() => users.id).notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
  
  // Balance Impact
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }),
  
  // Status and Verification
  logStatus: varchar("log_status").default("confirmed"), // pending, confirmed, disputed, resolved
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Owner Debt Tracking - When owner owes company
export const ownerDebtTrackers = pgTable("owner_debt_trackers", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Debt Details
  debtAmount: decimal("debt_amount", { precision: 12, scale: 2 }).notNull(),
  debtReason: text("debt_reason").notNull(),
  debtType: varchar("debt_type").notNull(), // utility_overpay, damage_charge, service_charge, advance_repayment
  
  // Status and Payment
  debtStatus: varchar("debt_status").default("outstanding"), // outstanding, partial_paid, paid, disputed, forgiven
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0.00"),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).notNull(),
  
  // Payment from Owner
  ownerPaymentProofUrl: varchar("owner_payment_proof_url"),
  ownerPaidAt: timestamp("owner_paid_at"),
  adminConfirmedBy: varchar("admin_confirmed_by").references(() => users.id),
  adminConfirmedAt: timestamp("admin_confirmed_at"),
  
  // Due Date and Terms
  dueDate: date("due_date"),
  paymentTerms: varchar("payment_terms"), // immediate, 30_days, 60_days, installment
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Payout Frequency Settings
export const propertyPayoutSettings = pgTable("property_payout_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Payout Frequency Configuration
  ownerPayoutFrequency: varchar("owner_payout_frequency").default("monthly"), // monthly, bi_weekly, quarterly
  pmPayoutFrequency: varchar("pm_payout_frequency").default("monthly"),
  referralAgentPayoutFrequency: varchar("referral_agent_payout_frequency").default("monthly"),
  
  // Next Scheduled Payouts
  nextOwnerPayoutDate: date("next_owner_payout_date"),
  nextPmPayoutDate: date("next_pm_payout_date"),
  nextReferralAgentPayoutDate: date("next_referral_agent_payout_date"),
  
  // Automatic Processing
  autoProcessPayouts: boolean("auto_process_payouts").default(false),
  minimumPayoutAmount: decimal("minimum_payout_amount", { precision: 8, scale: 2 }).default("100.00"),
  
  // Notification Settings
  notifyOwnerBeforePayout: boolean("notify_owner_before_payout").default(true),
  notifyDaysBefore: integer("notify_days_before").default(3),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== OWNER BALANCE & PAYMENT INSERT SCHEMAS =====

export const insertOwnerBalanceTrackerSchema = createInsertSchema(ownerBalanceTrackers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerPayoutRequestSchema = createInsertSchema(ownerPayoutRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerPaymentLogSchema = createInsertSchema(ownerPaymentLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerDebtTrackerSchema = createInsertSchema(ownerDebtTrackers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyPayoutSettingsSchema = createInsertSchema(propertyPayoutSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== OWNER BALANCE & PAYMENT TYPES =====

export type OwnerBalanceTracker = typeof ownerBalanceTrackers.$inferSelect;
export type InsertOwnerBalanceTracker = z.infer<typeof insertOwnerBalanceTrackerSchema>;
export type OwnerPayoutRequest = typeof ownerPayoutRequests.$inferSelect;
export type InsertOwnerPayoutRequest = z.infer<typeof insertOwnerPayoutRequestSchema>;
export type OwnerPaymentLog = typeof ownerPaymentLogs.$inferSelect;
export type InsertOwnerPaymentLog = z.infer<typeof insertOwnerPaymentLogSchema>;
export type OwnerDebtTracker = typeof ownerDebtTrackers.$inferSelect;
export type InsertOwnerDebtTracker = z.infer<typeof insertOwnerDebtTrackerSchema>;
export type PropertyPayoutSettings = typeof propertyPayoutSettings.$inferSelect;
export type InsertPropertyPayoutSettings = z.infer<typeof insertPropertyPayoutSettingsSchema>;

// ===== PLATFORM-BASED REVENUE ROUTING RULES =====

// Global platform routing rules (admin configurable defaults)
export const platformRoutingRules = pgTable("platform_routing_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Platform Information
  platformName: varchar("platform_name").notNull(), // airbnb, booking_com, vrbo, direct_stripe, marriott, expedia
  platformDisplayName: varchar("platform_display_name").notNull(),
  
  // Default Routing Settings
  defaultOwnerPercentage: decimal("default_owner_percentage", { precision: 5, scale: 2 }).notNull(), // 70.00 for 70%
  defaultManagementPercentage: decimal("default_management_percentage", { precision: 5, scale: 2 }).notNull(), // 30.00 for 30%
  
  // Platform Settings
  isActive: boolean("is_active").default(true),
  supportsSplitPayout: boolean("supports_split_payout").default(false), // Airbnb supports this
  platformFeePercentage: decimal("platform_fee_percentage", { precision: 5, scale: 2 }).default("0.00"), // e.g., 5% for Stripe
  
  // Routing Options
  routingType: varchar("routing_type").notNull(), // split_payout, full_to_owner, full_to_management
  paymentMethod: varchar("payment_method"), // automatic, manual_invoice, direct_transfer
  
  // Admin Settings
  adminNotes: text("admin_notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property-specific platform routing overrides
export const propertyPlatformRules = pgTable("property_platform_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  platformRuleId: integer("platform_rule_id").references(() => platformRoutingRules.id).notNull(),
  
  // Override Settings
  overrideOwnerPercentage: decimal("override_owner_percentage", { precision: 5, scale: 2 }),
  overrideManagementPercentage: decimal("override_management_percentage", { precision: 5, scale: 2 }),
  overrideRoutingType: varchar("override_routing_type"), // split_payout, full_to_owner, full_to_management
  
  // Property-specific settings
  isActive: boolean("is_active").default(true),
  specialInstructions: text("special_instructions"),
  
  // Audit
  setBy: varchar("set_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking-specific routing overrides (for special arrangements)
export const bookingPlatformRouting = pgTable("booking_platform_routing", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  platformRuleId: integer("platform_rule_id").references(() => platformRoutingRules.id).notNull(),
  
  // Booking-specific override
  actualOwnerPercentage: decimal("actual_owner_percentage", { precision: 5, scale: 2 }).notNull(),
  actualManagementPercentage: decimal("actual_management_percentage", { precision: 5, scale: 2 }).notNull(),
  actualRoutingType: varchar("actual_routing_type").notNull(),
  
  // Financial Breakdown
  totalBookingAmount: decimal("total_booking_amount", { precision: 12, scale: 2 }).notNull(),
  ownerAmount: decimal("owner_amount", { precision: 12, scale: 2 }).notNull(),
  managementAmount: decimal("management_amount", { precision: 12, scale: 2 }).notNull(),
  platformFeeAmount: decimal("platform_fee_amount", { precision: 12, scale: 2 }).default("0.00"),
  
  // Override Reason (if different from default)
  overrideReason: text("override_reason"),
  isOverride: boolean("is_override").default(false),
  
  // Processing Status
  routingStatus: varchar("routing_status").default("pending"), // pending, processed, disputed, corrected
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  
  // Audit Trail
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Routing audit log for transparency
export const routingAuditLog = pgTable("routing_audit_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Reference
  relatedType: varchar("related_type").notNull(), // platform_rule, property_rule, booking_routing
  relatedId: integer("related_id").notNull(),
  
  // Action Details
  actionType: varchar("action_type").notNull(), // created, updated, override_applied, routing_processed
  previousValues: jsonb("previous_values"),
  newValues: jsonb("new_values"),
  changeReason: text("change_reason"),
  
  // Impact
  impactedBookings: integer("impacted_bookings").default(0),
  financialImpact: decimal("financial_impact", { precision: 12, scale: 2 }).default("0.00"),
  
  // Audit
  performedBy: varchar("performed_by").references(() => users.id).notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== STAFF CLOCK-IN & WORKDAY TRACKING TABLES =====

// Staff daily work clocks (general workday tracking)
export const staffWorkClocks = pgTable("staff_work_clocks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  staffName: varchar("staff_name").notNull(),
  
  // Clock In/Out Times
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  
  // Clock Type
  clockType: varchar("clock_type").notNull().default("workday"), // workday, task, emergency_visit
  
  // Work Details
  totalMinutesWorked: integer("total_minutes_worked").default(0),
  breakMinutes: integer("break_minutes").default(0),
  netWorkMinutes: integer("net_work_minutes").default(0),
  
  // Location & Notes
  clockInLocation: varchar("clock_in_location"),
  clockOutLocation: varchar("clock_out_location"),
  clockInNotes: text("clock_in_notes"),
  clockOutNotes: text("clock_out_notes"),
  
  // Emergency/Overtime Flags
  isEmergencyVisit: boolean("is_emergency_visit").default(false),
  isOvertimeShift: boolean("is_overtime_shift").default(false),
  emergencyReason: varchar("emergency_reason"),
  
  // Auto-Detection Flags
  isOutsideNormalHours: boolean("is_outside_normal_hours").default(false),
  isWeekendWork: boolean("is_weekend_work").default(false),
  isHolidayWork: boolean("is_holiday_work").default(false),
  
  // Linked Tasks (for task-based clocks)
  linkedTaskIds: jsonb("linked_task_ids"), // Array of task IDs worked during this clock
  
  // Admin Override
  manualAdjustment: boolean("manual_adjustment").default(false),
  adjustmentReason: text("adjustment_reason"),
  adjustedBy: varchar("adjusted_by").references(() => users.id),
  adjustedAt: timestamp("adjusted_at"),
  
  // Status
  status: varchar("status").default("active"), // active, completed, disputed, adjusted
  approvalStatus: varchar("approval_status").default("pending"), // pending, approved, disputed
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff clock management settings
export const staffClockSettings = pgTable("staff_clock_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Work Hour Definitions
  standardWorkStartTime: varchar("standard_work_start_time").default("08:00"), // HH:MM format
  standardWorkEndTime: varchar("standard_work_end_time").default("17:00"),
  standardWorkDays: jsonb("standard_work_days").default('["monday","tuesday","wednesday","thursday","friday"]'),
  
  // Overtime & Emergency Rates
  overtimeMultiplier: decimal("overtime_multiplier", { precision: 3, scale: 2 }).default("1.5"),
  emergencyCalloutRate: decimal("emergency_callout_rate", { precision: 8, scale: 2 }).default("50.00"),
  weekendWorkMultiplier: decimal("weekend_work_multiplier", { precision: 3, scale: 2 }).default("1.25"),
  holidayWorkMultiplier: decimal("holiday_work_multiplier", { precision: 3, scale: 2 }).default("2.0"),
  
  // Clock Policies
  allowGeolocationTracking: boolean("allow_geolocation_tracking").default(false),
  requireClockOutNotes: boolean("require_clock_out_notes").default(false),
  autoClockOutAfterHours: integer("auto_clock_out_after_hours").default(12), // Hours
  allowManualTimeAdjustment: boolean("allow_manual_time_adjustment").default(true),
  
  // Approval Requirements
  requireOvertimeApproval: boolean("require_overtime_approval").default(true),
  requireEmergencyApproval: boolean("require_emergency_approval").default(true),
  autoApproveRegularHours: boolean("auto_approve_regular_hours").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly staff time summaries
export const staffTimeSummaries = pgTable("staff_time_summaries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  staffName: varchar("staff_name").notNull(),
  
  // Period
  monthYear: varchar("month_year").notNull(), // YYYY-MM format
  
  // Regular Hours Summary
  totalRegularMinutes: integer("total_regular_minutes").default(0),
  totalOvertimeMinutes: integer("total_overtime_minutes").default(0),
  totalEmergencyMinutes: integer("total_emergency_minutes").default(0),
  totalBreakMinutes: integer("total_break_minutes").default(0),
  
  // Work Pattern Analysis
  totalWorkDays: integer("total_work_days").default(0),
  weekendWorkDays: integer("weekend_work_days").default(0),
  holidayWorkDays: integer("holiday_work_days").default(0),
  emergencyCallouts: integer("emergency_callouts").default(0),
  
  // Task-related Statistics
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  averageTaskDuration: integer("average_task_duration").default(0), // Minutes
  
  // Financial Calculations
  regularHoursPay: decimal("regular_hours_pay", { precision: 10, scale: 2 }).default("0.00"),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0.00"),
  emergencyPay: decimal("emergency_pay", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  
  // Status
  status: varchar("status").default("draft"), // draft, submitted, approved, paid
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clock audit log for compliance and tracking
export const staffClockAuditLog = pgTable("staff_clock_audit_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Reference
  clockId: integer("clock_id").references(() => staffWorkClocks.id),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Action Details
  actionType: varchar("action_type").notNull(), // clock_in, clock_out, manual_adjustment, approval, dispute
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  changeReason: text("change_reason"),
  
  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  geolocation: jsonb("geolocation"), // lat, lng, accuracy
  
  // Audit
  performedBy: varchar("performed_by").references(() => users.id).notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== PLATFORM ROUTING INSERT SCHEMAS =====

export const insertPlatformRoutingRuleSchema = createInsertSchema(platformRoutingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyPlatformRuleSchema = createInsertSchema(propertyPlatformRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingPlatformRoutingSchema = createInsertSchema(bookingPlatformRouting).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoutingAuditLogSchema = createInsertSchema(routingAuditLog).omit({
  id: true,
  createdAt: true,
});

// ===== STAFF CLOCK-IN INSERT SCHEMAS =====

export const insertStaffWorkClockSchema = createInsertSchema(staffWorkClocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffClockSettingsSchema = createInsertSchema(staffClockSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffTimeSummarySchema = createInsertSchema(staffTimeSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffClockAuditLogSchema = createInsertSchema(staffClockAuditLog).omit({
  id: true,
  createdAt: true,
});

// ===== STAFF CLOCK-IN TYPE DEFINITIONS =====

export type StaffWorkClock = typeof staffWorkClocks.$inferSelect;
export type InsertStaffWorkClock = z.infer<typeof insertStaffWorkClockSchema>;

export type StaffClockSettings = typeof staffClockSettings.$inferSelect;
export type InsertStaffClockSettings = z.infer<typeof insertStaffClockSettingsSchema>;

export type StaffTimeSummary = typeof staffTimeSummaries.$inferSelect;
export type InsertStaffTimeSummary = z.infer<typeof insertStaffTimeSummarySchema>;

export type StaffClockAuditLog = typeof staffClockAuditLog.$inferSelect;
export type InsertStaffClockAuditLog = z.infer<typeof insertStaffClockAuditLogSchema>;

// ===== MAINTENANCE SUGGESTIONS & APPROVAL FLOW =====

// Maintenance suggestions submitted by admin/PM for owner approval
export const maintenanceSuggestions = pgTable("maintenance_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Suggestion Details
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  maintenanceType: varchar("maintenance_type").notNull(), // repair, replacement, upgrade, other
  urgencyLevel: varchar("urgency_level").default("normal"), // low, normal, high, urgent
  
  // Cost Information
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("AUD"),
  costBreakdown: jsonb("cost_breakdown"), // Array of cost items with descriptions
  whoPaysCost: varchar("who_pays_cost").default("owner"), // owner, management, shared, guest
  
  // Attachments & Evidence
  attachments: text("attachments").array(), // Array of file URLs/paths
  evidencePhotos: text("evidence_photos").array(),
  supportingDocuments: text("supporting_documents").array(),
  
  // Submission Information
  submittedBy: varchar("submitted_by").references(() => users.id).notNull(),
  submittedByRole: varchar("submitted_by_role").notNull(), // admin, portfolio-manager
  submissionReason: text("submission_reason"),
  
  // Owner Response
  ownerResponse: varchar("owner_response"), // approved, declined, request_more_info
  ownerComments: text("owner_comments"),
  ownerRespondedAt: timestamp("owner_responded_at"),
  
  // Status Tracking
  status: varchar("status").default("pending"), // pending, approved, declined, in_progress, completed, cancelled
  approvalDeadline: timestamp("approval_deadline"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  
  // Task Creation (if approved)
  taskCreated: boolean("task_created").default(false),
  createdTaskId: integer("created_task_id").references(() => tasks.id),
  taskCreatedAt: timestamp("task_created_at"),
  
  // Completion Information
  completedAt: timestamp("completed_at"),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  completionNotes: text("completion_notes"),
  completionPhotos: text("completion_photos").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval flow logs for maintenance suggestions
export const maintenanceApprovalLogs = pgTable("maintenance_approval_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  suggestionId: integer("suggestion_id").references(() => maintenanceSuggestions.id).notNull(),
  
  // Log Details
  actionType: varchar("action_type").notNull(), // submitted, approved, declined, commented, reminded, completed
  actionBy: varchar("action_by").references(() => users.id).notNull(),
  actionByRole: varchar("action_by_role").notNull(),
  
  // Action Details
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status"),
  comments: text("comments"),
  
  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings for maintenance suggestion system
export const maintenanceSuggestionSettings = pgTable("maintenance_suggestion_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Approval Timeouts
  defaultApprovalTimeoutDays: integer("default_approval_timeout_days").default(7),
  urgentApprovalTimeoutDays: integer("urgent_approval_timeout_days").default(3),
  reminderIntervalDays: integer("reminder_interval_days").default(3),
  maxReminders: integer("max_reminders").default(3),
  
  // Auto-approval Thresholds
  enableAutoApproval: boolean("enable_auto_approval").default(false),
  autoApprovalThreshold: decimal("auto_approval_threshold", { precision: 10, scale: 2 }).default("100.00"),
  autoApprovalTypes: text("auto_approval_types").array(), // repair, maintenance, etc.
  
  // Notification Settings
  notifyOwnersViaEmail: boolean("notify_owners_via_email").default(true),
  notifyOwnersViaSms: boolean("notify_owners_via_sms").default(false),
  notifyManagersOnApproval: boolean("notify_managers_on_approval").default(true),
  notifyStaffOnTaskCreation: boolean("notify_staff_on_task_creation").default(true),
  
  // Cost Management
  requireCostBreakdown: boolean("require_cost_breakdown").default(true),
  requireMultipleQuotes: boolean("require_multiple_quotes").default(false),
  multipleQuotesThreshold: decimal("multiple_quotes_threshold", { precision: 10, scale: 2 }).default("500.00"),
  
  // Documentation Requirements
  requirePhotos: boolean("require_photos").default(true),
  requireDetailedDescription: boolean("require_detailed_description").default(true),
  maxAttachmentSize: integer("max_attachment_size").default(10485760), // 10MB in bytes
  allowedFileTypes: text("allowed_file_types").array().default('["jpg","jpeg","png","pdf","doc","docx"]'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================================
// SERVICE MARKETPLACE & VENDOR BOOKING SYSTEM
// ========================================

// Service Providers/Vendors
export const serviceVendors = pgTable("service_vendors", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Vendor Information
  name: varchar("name").notNull(),
  description: text("description"),
  logo: varchar("logo"),
  vendorType: varchar("vendor_type").notNull(), // internal, external, partner
  
  // Contact Information
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  website: varchar("website"),
  
  // Business Details
  businessLicense: varchar("business_license"),
  taxId: varchar("tax_id"),
  bankDetails: text("bank_details"),
  
  // Performance & Settings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  responseTime: integer("response_time_hours").default(24),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  
  // Status & Availability
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  availableDays: text("available_days").array(), // ["monday", "tuesday", ...]
  workingHours: jsonb("working_hours"), // {start: "09:00", end: "18:00"}
  
  // Financial Terms
  paymentTerms: varchar("payment_terms").default("net_30"), // immediate, net_7, net_30
  preferredPaymentMethod: varchar("preferred_payment_method").default("bank_transfer"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Categories
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").default("service"),
  color: varchar("color").default("#3B82F6"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Available Services
export const marketplaceServices = pgTable("marketplace_services", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  vendorId: integer("vendor_id").references(() => serviceVendors.id).notNull(),
  categoryId: integer("category_id").references(() => serviceCategories.id).notNull(),
  
  // Service Details
  name: varchar("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  photos: text("photos").array(),
  
  // Pricing
  pricingType: varchar("pricing_type").notNull(), // flat_rate, hourly, quote_based
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  priceNotes: text("price_notes"),
  
  // Booking Rules
  requiresApproval: boolean("requires_approval").default(false),
  requiresPrePayment: boolean("requires_pre_payment").default(false),
  cancellationFee: decimal("cancellation_fee", { precision: 10, scale: 2 }).default("0.00"),
  cancellationHours: integer("cancellation_hours").default(24),
  
  // Duration & Scheduling
  estimatedDuration: integer("estimated_duration_minutes"),
  minimumNotice: integer("minimum_notice_hours").default(24),
  maximumAdvance: integer("maximum_advance_days").default(30),
  
  // Commission & Billing
  commissionTo: varchar("commission_to").default("company"), // company, portfolio_manager
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  defaultBillingTo: varchar("default_billing_to").default("guest"), // guest, owner, company
  
  // Settings
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  tags: text("tags").array(),
  requirements: text("requirements"),
  
  // Analytics
  bookingCount: integer("booking_count").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("5.00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Bookings
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => marketplaceServices.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Booking Reference
  bookingNumber: varchar("booking_number").notNull(),
  
  // Guest Information
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  guestNotes: text("guest_notes"),
  
  // Booking Details
  requestedDate: date("requested_date"),
  requestedTime: varchar("requested_time"), // stored as "HH:MM" format
  estimatedDuration: integer("estimated_duration_minutes"),
  
  // Pricing & Billing
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  billingAssignment: varchar("billing_assignment").notNull(), // guest_billable, owner_expense, company_expense
  
  // Status Tracking
  status: varchar("status").default("pending"), // pending, confirmed, in_progress, completed, cancelled
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  
  // Workflow
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  requestedByRole: varchar("requested_by_role").notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Vendor Communication
  vendorNotified: boolean("vendor_notified").default(false),
  vendorNotifiedAt: timestamp("vendor_notified_at"),
  vendorConfirmed: boolean("vendor_confirmed").default(false),
  vendorConfirmedAt: timestamp("vendor_confirmed_at"),
  vendorNotes: text("vendor_notes"),
  
  // Service Execution
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  completionNotes: text("completion_notes"),
  completionPhotos: text("completion_photos").array(),
  
  // Quality & Feedback
  guestRating: integer("guest_rating"), // 1-5 stars
  guestFeedback: text("guest_feedback"),
  internalNotes: text("internal_notes"),
  
  // Special Instructions
  specialRequirements: text("special_requirements"),
  accessInstructions: text("access_instructions"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Reviews & Ratings
export const serviceReviews = pgTable("service_reviews", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  serviceId: integer("service_id").references(() => marketplaceServices.id).notNull(),
  bookingId: integer("booking_id").references(() => serviceBookings.id).notNull(),
  vendorId: integer("vendor_id").references(() => serviceVendors.id).notNull(),
  
  // Review Details
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  review: text("review"),
  
  // Reviewer Information
  reviewerType: varchar("reviewer_type").notNull(), // guest, staff, manager
  reviewerName: varchar("reviewer_name"),
  isAnonymous: boolean("is_anonymous").default(false),
  
  // Review Categories
  qualityRating: integer("quality_rating"), // 1-5
  timelinessRating: integer("timeliness_rating"), // 1-5
  valueRating: integer("value_rating"), // 1-5
  communicationRating: integer("communication_rating"), // 1-5
  
  // Review Status
  isApproved: boolean("is_approved").default(true),
  isPublic: boolean("is_public").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Performance Analytics
export const serviceAnalytics = pgTable("service_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Time Period
  periodType: varchar("period_type").notNull(), // daily, weekly, monthly
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  
  // Service/Vendor Analytics
  serviceId: integer("service_id").references(() => marketplaceServices.id),
  vendorId: integer("vendor_id").references(() => serviceVendors.id),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  
  // Metrics
  totalBookings: integer("total_bookings").default(0),
  completedBookings: integer("completed_bookings").default(0),
  cancelledBookings: integer("cancelled_bookings").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  totalCommission: decimal("total_commission", { precision: 12, scale: 2 }).default("0.00"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  averageResponseTime: integer("average_response_time_hours"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timeline entries for maintenance suggestions (for property timeline integration)
export const maintenanceTimelineEntries = pgTable("maintenance_timeline_entries", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  suggestionId: integer("suggestion_id").references(() => maintenanceSuggestions.id).notNull(),
  
  // Timeline Entry Details
  entryType: varchar("entry_type").notNull(), // suggestion_submitted, approved, declined, completed, reminder_sent
  entryTitle: varchar("entry_title").notNull(),
  entryDescription: text("entry_description"),
  entryIcon: varchar("entry_icon").default("wrench"), // icon identifier
  
  // Visibility Settings
  visibleToOwner: boolean("visible_to_owner").default(true),
  visibleToStaff: boolean("visible_to_staff").default(true),
  visibleToGuests: boolean("visible_to_guests").default(false),
  
  // Associated Users
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  affectsUsers: text("affects_users").array(), // Array of user IDs who should see this
  
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== MAINTENANCE SUGGESTIONS INSERT SCHEMAS =====

export const insertMaintenanceSuggestionSchema = createInsertSchema(maintenanceSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceApprovalLogSchema = createInsertSchema(maintenanceApprovalLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceSuggestionSettingsSchema = createInsertSchema(maintenanceSuggestionSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceTimelineEntrySchema = createInsertSchema(maintenanceTimelineEntries).omit({
  id: true,
  createdAt: true,
});

// ===== MAINTENANCE SUGGESTIONS TYPE DEFINITIONS =====

export type MaintenanceSuggestion = typeof maintenanceSuggestions.$inferSelect;
export type InsertMaintenanceSuggestion = z.infer<typeof insertMaintenanceSuggestionSchema>;

export type MaintenanceApprovalLog = typeof maintenanceApprovalLogs.$inferSelect;
export type InsertMaintenanceApprovalLog = z.infer<typeof insertMaintenanceApprovalLogSchema>;

export type MaintenanceSuggestionSettings = typeof maintenanceSuggestionSettings.$inferSelect;
export type InsertMaintenanceSuggestionSettings = z.infer<typeof insertMaintenanceSuggestionSettingsSchema>;

export type MaintenanceTimelineEntry = typeof maintenanceTimelineEntries.$inferSelect;
export type InsertMaintenanceTimelineEntry = z.infer<typeof insertMaintenanceTimelineEntrySchema>;

// ===== SERVICE MARKETPLACE INSERT SCHEMAS =====

export const insertServiceVendorSchema = createInsertSchema(serviceVendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceServiceSchema = createInsertSchema(marketplaceServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceReviewSchema = createInsertSchema(serviceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceAnalyticsSchema = createInsertSchema(serviceAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== SERVICE MARKETPLACE TYPE DEFINITIONS =====

export type ServiceVendor = typeof serviceVendors.$inferSelect;
export type InsertServiceVendor = z.infer<typeof insertServiceVendorSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type MarketplaceService = typeof marketplaceServices.$inferSelect;
export type InsertMarketplaceService = z.infer<typeof insertMarketplaceServiceSchema>;

export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;

export type ServiceReview = typeof serviceReviews.$inferSelect;
export type InsertServiceReview = z.infer<typeof insertServiceReviewSchema>;

export type ServiceAnalytics = typeof serviceAnalytics.$inferSelect;
export type InsertServiceAnalytics = z.infer<typeof insertServiceAnalyticsSchema>;

// ===== ENHANCED GUEST DASHBOARD TYPES =====

// Guest Bookings Zod schemas
export const insertGuestBookingSchema = createInsertSchema(guestBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestAiRecommendationSchema = createInsertSchema(guestAiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestServiceTimelineSchema = createInsertSchema(guestServiceTimeline).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyAmenitySchema = createInsertSchema(propertyAmenities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions
export type GuestBooking = typeof guestBookings.$inferSelect;
export type InsertGuestBooking = z.infer<typeof insertGuestBookingSchema>;

export type GuestAiRecommendation = typeof guestAiRecommendations.$inferSelect;
export type InsertGuestAiRecommendation = z.infer<typeof insertGuestAiRecommendationSchema>;

export type GuestServiceTimeline = typeof guestServiceTimeline.$inferSelect;
export type InsertGuestServiceTimeline = z.infer<typeof insertGuestServiceTimelineSchema>;

export type PropertyAmenity = typeof propertyAmenities.$inferSelect;
export type InsertPropertyAmenity = z.infer<typeof insertPropertyAmenitySchema>;

// ===== GUEST CHECKOUT SURVEY TABLES =====

// Guest checkout surveys
export const guestCheckoutSurveys = pgTable("guest_checkout_surveys", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().default("default"),
  guestId: varchar("guest_id").notNull(),
  bookingId: integer("booking_id"),
  propertyId: integer("property_id"),
  surveyType: varchar("survey_type").notNull().default("checkout"), // checkout, post_checkin, feedback
  
  // Rating questions (1-5 stars)
  ratingCheckIn: integer("rating_check_in"),
  ratingCleanliness: integer("rating_cleanliness"),
  ratingProperty: integer("rating_property"),
  ratingLocation: integer("rating_location"),
  ratingTeam: integer("rating_team"),
  ratingCommunication: integer("rating_communication"),
  ratingOverall: integer("rating_overall"),
  
  // Text feedback
  improvementSuggestions: text("improvement_suggestions"),
  wouldRecommend: text("would_recommend"),
  additionalComments: text("additional_comments"),
  
  // AI analysis
  sentimentScore: real("sentiment_score"), // -1 to 1
  sentimentCategory: varchar("sentiment_category"), // positive, neutral, negative
  averageRating: real("average_rating"),
  flaggedForReview: boolean("flagged_for_review").default(false),
  
  // Status and metadata
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
  
  // Incentive tracking
  incentiveOffered: varchar("incentive_offered"),
  incentiveRedeemed: boolean("incentive_redeemed").default(false),
  incentiveRedeemedAt: timestamp("incentive_redeemed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Survey response templates and settings
export const surveySettings = pgTable("survey_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().default("default"),
  propertyId: integer("property_id"),
  
  // Survey triggers
  enablePreCheckout: boolean("enable_pre_checkout").default(true),
  enablePostCheckin: boolean("enable_post_checkin").default(false),
  enablePermanentFeedback: boolean("enable_permanent_feedback").default(true),
  
  // Timing settings
  preCheckoutDays: integer("pre_checkout_days").default(1),
  postCheckinDays: integer("post_checkin_days").default(1),
  
  // Review platform links
  airbnbReviewLink: varchar("airbnb_review_link"),
  bookingReviewLink: varchar("booking_review_link"),
  googleReviewLink: varchar("google_review_link"),
  
  // Sentiment thresholds
  positiveThreshold: real("positive_threshold").default(4.5),
  negativeThreshold: real("negative_threshold").default(3.0),
  
  // Incentive settings
  incentiveType: varchar("incentive_type"), // coupon, early_checkin, late_checkout, discount
  incentiveValue: varchar("incentive_value"),
  incentiveDescription: text("incentive_description"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Survey alerts and notifications
export const surveyAlerts = pgTable("survey_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().default("default"),
  surveyId: integer("survey_id").references(() => guestCheckoutSurveys.id),
  
  alertType: varchar("alert_type").notNull(), // negative_feedback, low_rating, flagged_review
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  
  recipientRoles: json("recipient_roles").$type<string[]>().default([]), // admin, portfolio-manager, staff
  notificationSent: boolean("notification_sent").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  
  alertMessage: text("alert_message"),
  actionRequired: boolean("action_required").default(false),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Survey analytics and reporting
export const surveyAnalytics = pgTable("survey_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull().default("default"),
  propertyId: integer("property_id"),
  
  period: varchar("period").notNull(), // daily, weekly, monthly, yearly
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  
  totalSurveys: integer("total_surveys").default(0),
  completedSurveys: integer("completed_surveys").default(0),
  completionRate: real("completion_rate").default(0),
  
  averageOverallRating: real("average_overall_rating").default(0),
  averageCheckInRating: real("average_check_in_rating").default(0),
  averageCleanlinessRating: real("average_cleanliness_rating").default(0),
  averagePropertyRating: real("average_property_rating").default(0),
  averageLocationRating: real("average_location_rating").default(0),
  averageTeamRating: real("average_team_rating").default(0),
  averageCommunicationRating: real("average_communication_rating").default(0),
  
  positiveFeedbackCount: integer("positive_feedback_count").default(0),
  neutralFeedbackCount: integer("neutral_feedback_count").default(0),
  negativeFeedbackCount: integer("negative_feedback_count").default(0),
  
  publicReviewsGenerated: integer("public_reviews_generated").default(0),
  internalFlagsCreated: integer("internal_flags_created").default(0),
  incentivesOffered: integer("incentives_offered").default(0),
  incentivesRedeemed: integer("incentives_redeemed").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== GUEST CHECKOUT SURVEY ZOD SCHEMAS =====

export const insertGuestCheckoutSurveySchema = createInsertSchema(guestCheckoutSurveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveySettingsSchema = createInsertSchema(surveySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyAlertSchema = createInsertSchema(surveyAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyAnalyticsSchema = createInsertSchema(surveyAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== GUEST CHECKOUT SURVEY TYPE DEFINITIONS =====

export type GuestCheckoutSurvey = typeof guestCheckoutSurveys.$inferSelect;
export type InsertGuestCheckoutSurvey = z.infer<typeof insertGuestCheckoutSurveySchema>;

export type SurveySettings = typeof surveySettings.$inferSelect;
export type InsertSurveySettings = z.infer<typeof insertSurveySettingsSchema>;

export type SurveyAlert = typeof surveyAlerts.$inferSelect;
export type InsertSurveyAlert = z.infer<typeof insertSurveyAlertSchema>;

export type SurveyAnalytics = typeof surveyAnalytics.$inferSelect;
export type InsertSurveyAnalytics = z.infer<typeof insertSurveyAnalyticsSchema>;

// ===== PLATFORM ROUTING TYPES =====

export type PlatformRoutingRule = typeof platformRoutingRules.$inferSelect;
export type InsertPlatformRoutingRule = z.infer<typeof insertPlatformRoutingRuleSchema>;
export type PropertyPlatformRule = typeof propertyPlatformRules.$inferSelect;
export type InsertPropertyPlatformRule = z.infer<typeof insertPropertyPlatformRuleSchema>;
export type BookingPlatformRouting = typeof bookingPlatformRouting.$inferSelect;
export type InsertBookingPlatformRouting = z.infer<typeof insertBookingPlatformRoutingSchema>;
export type RoutingAuditLog = typeof routingAuditLog.$inferSelect;
export type InsertRoutingAuditLog = z.infer<typeof insertRoutingAuditLogSchema>;

// ===== INVOICE GENERATOR SYSTEM =====

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  guestId: varchar("guest_id").notNull(),
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email"),
  bookingId: integer("booking_id"),
  propertyId: integer("property_id"),
  messageContent: text("message_content").notNull(),
  messageType: varchar("message_type").notNull(), // chat, request, feedback, complaint
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  status: varchar("status").default("new"), // new, acknowledged, in_progress, resolved
  aiProcessed: boolean("ai_processed").default(false),
  aiKeywords: text("ai_keywords").array(),
  aiSentiment: varchar("ai_sentiment"), // positive, neutral, negative
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  aiSuggestions: text("ai_suggestions").array(),
  staffResponse: text("staff_response"),
  respondedBy: varchar("responded_by"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-Generated Tasks from Guest Messages
export const aiGeneratedTasks = pgTable("ai_generated_tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  messageId: integer("message_id").references(() => guestMessages.id),
  taskId: integer("task_id"), // Reference to main tasks table
  guestId: varchar("guest_id").notNull(),
  propertyId: integer("property_id").notNull(),
  department: varchar("department").notNull(), // cleaning, maintenance, pool, garden, general
  taskType: varchar("task_type").notNull(), // issue_report, service_request, complaint
  urgency: varchar("urgency").notNull(), // low, medium, high, critical
  aiDescription: text("ai_description").notNull(),
  aiKeywords: text("ai_keywords").array(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected, completed
  assignedTo: varchar("assigned_to"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Guest Dashboard Analytics
export const guestDashboardAnalytics = pgTable("guest_dashboard_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").notNull(),
  month: varchar("month").notNull(), // YYYY-MM format
  totalMessages: integer("total_messages").default(0),
  totalServiceRequests: integer("total_service_requests").default(0),
  averageResponseTime: decimal("average_response_time", { precision: 10, scale: 2 }), // in minutes
  guestSatisfactionScore: decimal("guest_satisfaction_score", { precision: 3, scale: 2 }),
  topRequestedServices: text("top_requested_services").array(),
  commonIssues: text("common_issues").array(),
  aiTaskCreationRate: decimal("ai_task_creation_rate", { precision: 5, scale: 2 }),
  resolutionRate: decimal("resolution_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Smart Suggestions
export const aiSmartSuggestions = pgTable("ai_smart_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id"),
  suggestionType: varchar("suggestion_type").notNull(), // service_upsell, maintenance_improvement, guest_experience
  targetAudience: varchar("target_audience").notNull(), // guest, owner, staff, admin
  suggestionTitle: varchar("suggestion_title").notNull(),
  suggestionDescription: text("suggestion_description").notNull(),
  basedOnData: varchar("based_on_data").notNull(), // guest_reviews, message_analysis, service_patterns
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  potentialRevenue: decimal("potential_revenue", { precision: 10, scale: 2 }),
  implementationCost: decimal("implementation_cost", { precision: 10, scale: 2 }),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("pending"), // pending, reviewed, approved, implemented, rejected
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== ENHANCED FINANCIAL CONTROLS SYSTEM =====
// Note: Enhanced versions of existing invoice and portfolio manager tables for comprehensive financial controls

// ===== STAFF SALARY, OVERTIME & EMERGENCY TRACKER =====

// Staff Salary Settings
export const staffSalarySettings = pgTable("staff_salary_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  staffId: varchar("staff_id").notNull(), // references users.id
  staffName: varchar("staff_name").notNull(),
  department: varchar("department").notNull(), // housekeeping, pool, maintenance, security, general
  fixedMonthlySalary: decimal("fixed_monthly_salary", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  hourlyOvertime: decimal("hourly_overtime", { precision: 10, scale: 2 }),
  emergencyTaskBonus: decimal("emergency_task_bonus", { precision: 10, scale: 2 }),
  regularShiftStart: varchar("regular_shift_start"), // HH:MM format
  regularShiftEnd: varchar("regular_shift_end"), // HH:MM format
  workingDays: text("working_days").array(), // ["monday", "tuesday", ...]
  bankAccountDetails: jsonb("bank_account_details"), // encrypted bank details
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Clock In/Out Log
export const staffClockLog = pgTable("staff_clock_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  staffId: varchar("staff_id").notNull(),
  staffName: varchar("staff_name").notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  clockInReason: varchar("clock_in_reason"), // regular_shift, overtime_requested, emergency_call
  clockOutReason: varchar("clock_out_reason"), // shift_end, emergency_complete, overtime_complete
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }),
  regularHours: decimal("regular_hours", { precision: 10, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }),
  overtimeType: varchar("overtime_type"), // pre_approved, emergency, requested
  overtimeApprovalStatus: varchar("overtime_approval_status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  location: jsonb("location"), // GPS coordinates if available
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency Task Bonuses
export const emergencyTaskBonuses = pgTable("emergency_task_bonuses", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  taskId: integer("task_id").notNull(), // references tasks.id
  staffId: varchar("staff_id").notNull(),
  staffName: varchar("staff_name").notNull(),
  emergencyType: varchar("emergency_type").notNull(), // water_leak, electrical, security, guest_emergency
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  taskCompletedAt: timestamp("task_completed_at"),
  bonusApprovalStatus: varchar("bonus_approval_status").default("pending"), // pending, approved, paid
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  paymentReference: varchar("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Local & Emergency Contacts for Guest Dashboard
export const propertyLocalContacts = pgTable("property_local_contacts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  category: varchar("category").notNull(), // emergency_health, on_site_staff, transportation, wellness_spa, culinary_services, tours_experiences, convenience_delivery
  contactName: varchar("contact_name").notNull(),
  contactType: varchar("contact_type").notNull(), // hospital, police, host, housekeeper, taxi, spa_therapist, chef, tour_operator, delivery_app
  phoneNumber: varchar("phone_number"),
  whatsappNumber: varchar("whatsapp_number"),
  email: varchar("email"),
  address: text("address"),
  googleMapsLink: text("google_maps_link"),
  websiteUrl: text("website_url"),
  bookingUrl: text("booking_url"),
  menuUrl: text("menu_url"),
  qrCodeUrl: text("qr_code_url"),
  appStoreLink: text("app_store_link"),
  playStoreLink: text("play_store_link"),
  servicesOffered: text("services_offered"), // JSON string or comma-separated
  specialNotes: text("special_notes"),
  availabilityHours: varchar("availability_hours"),
  requiresManagerConfirmation: boolean("requires_manager_confirmation").default(false),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Templates for quick setup by zone
export const contactTemplateZones = pgTable("contact_template_zones", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  zoneName: varchar("zone_name").notNull(), // "North Samui", "Bangkok condos", etc.
  templateName: varchar("template_name").notNull(),
  isDefault: boolean("is_default").default(false),
  contactsData: text("contacts_data").notNull(), // JSON string of default contacts
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly Payroll
export const monthlyPayroll = pgTable("monthly_payroll", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  staffId: varchar("staff_id").notNull(),
  staffName: varchar("staff_name").notNull(),
  payrollMonth: varchar("payroll_month").notNull(), // YYYY-MM format
  fixedSalary: decimal("fixed_salary", { precision: 10, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }).default("0"),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  emergencyBonuses: decimal("emergency_bonuses", { precision: 10, scale: 2 }).default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull(),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, overdue
  paymentMethod: varchar("payment_method"), // bank_transfer, cash, cheque
  paymentDate: date("payment_date"),
  paymentReference: varchar("payment_reference"),
  paymentReceiptUrl: varchar("payment_receipt_url"),
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at"),
  staffConfirmed: boolean("staff_confirmed").default(false),
  staffConfirmedAt: timestamp("staff_confirmed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll Summaries for Admin Dashboard
export const payrollSummary = pgTable("payroll_summary", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  summaryMonth: varchar("summary_month").notNull(), // YYYY-MM format
  totalStaff: integer("total_staff").notNull(),
  totalFixedSalaries: decimal("total_fixed_salaries", { precision: 10, scale: 2 }).notNull(),
  totalOvertimePay: decimal("total_overtime_pay", { precision: 10, scale: 2 }).default("0"),
  totalEmergencyBonuses: decimal("total_emergency_bonuses", { precision: 10, scale: 2 }).default("0"),
  totalPayroll: decimal("total_payroll", { precision: 10, scale: 2 }).notNull(),
  departmentBreakdown: jsonb("department_breakdown"), // {housekeeping: 5000, pool: 2000, ...}
  overtimeHoursBreakdown: jsonb("overtime_hours_breakdown"),
  emergencyTasksCount: integer("emergency_tasks_count").default(0),
  paymentCompletionRate: decimal("payment_completion_rate", { precision: 5, scale: 2 }),
  averageOvertimeHours: decimal("average_overtime_hours", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest Communication Notifications
export const guestCommunicationNotifications = pgTable("guest_communication_notifications", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  messageId: integer("message_id").references(() => guestMessages.id),
  serviceRequestId: integer("service_request_id").references(() => guestAddonServiceRequests.id),
  taskId: integer("task_id").references(() => aiGeneratedTasks.id),
  recipientId: varchar("recipient_id").notNull(),
  recipientRole: varchar("recipient_role").notNull(), // staff, manager, admin
  notificationType: varchar("notification_type").notNull(), // new_message, urgent_issue, service_request, task_created
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guest Portal Settings
export const guestPortalSettings = pgTable("guest_portal_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id"),
  enableGuestPortal: boolean("enable_guest_portal").default(true),
  enableAiAssistant: boolean("enable_ai_assistant").default(true),
  enableServiceBooking: boolean("enable_service_booking").default(true),
  enableChatSystem: boolean("enable_chat_system").default(true),
  autoCreateTasks: boolean("auto_create_tasks").default(true),
  aiConfidenceThreshold: decimal("ai_confidence_threshold", { precision: 3, scale: 2 }).default("0.75"),
  responseTimeTarget: integer("response_time_target").default(30), // in minutes
  welcomeMessage: text("welcome_message"),
  contactInfo: text("contact_info"),
  emergencyContact: varchar("emergency_contact"),
  checkInInstructions: text("check_in_instructions"),
  checkOutInstructions: text("check_out_instructions"),
  wifiPassword: varchar("wifi_password"),
  localRecommendations: text("local_recommendations").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== AI GUEST PORTAL RELATIONS =====

export const guestMessagesRelations = relations(guestMessages, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [guestMessages.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [guestMessages.propertyId],
    references: [properties.id],
  }),
  aiGeneratedTasks: many(aiGeneratedTasks),
  notifications: many(guestCommunicationNotifications),
}));

export const aiGeneratedTasksRelations = relations(aiGeneratedTasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiGeneratedTasks.organizationId],
    references: [organizations.id],
  }),
  message: one(guestMessages, {
    fields: [aiGeneratedTasks.messageId],
    references: [guestMessages.id],
  }),
  property: one(properties, {
    fields: [aiGeneratedTasks.propertyId],
    references: [properties.id],
  }),
}));



export const aiSmartSuggestionsRelations = relations(aiSmartSuggestions, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiSmartSuggestions.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [aiSmartSuggestions.propertyId],
    references: [properties.id],
  }),
}));

export const guestCommunicationNotificationsRelations = relations(guestCommunicationNotifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [guestCommunicationNotifications.organizationId],
    references: [organizations.id],
  }),
  message: one(guestMessages, {
    fields: [guestCommunicationNotifications.messageId],
    references: [guestMessages.id],
  }),
  serviceRequest: one(guestAddonServiceRequests, {
    fields: [guestCommunicationNotifications.serviceRequestId],
    references: [guestAddonServiceRequests.id],
  }),
  aiTask: one(aiGeneratedTasks, {
    fields: [guestCommunicationNotifications.taskId],
    references: [aiGeneratedTasks.id],
  }),
}));

export const guestPortalSettingsRelations = relations(guestPortalSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [guestPortalSettings.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [guestPortalSettings.propertyId],
    references: [properties.id],
  }),
}));

// ===== BOOKING INCOME RULES, ROUTING & COMMISSION STRUCTURE =====

// Property-specific payout rules for each OTA platform
export const propertyPayoutRules = pgTable("property_payout_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  platform: varchar("platform").notNull(), // airbnb, direct, booking_com, vrbo, agoda, marriott
  ownerPercentage: decimal("owner_percentage", { precision: 5, scale: 2 }).default("70.00"), // 70%
  managementPercentage: decimal("management_percentage", { precision: 5, scale: 2 }).default("30.00"), // 30%
  stripeFeePercentage: decimal("stripe_fee_percentage", { precision: 5, scale: 2 }).default("5.00"), // 5%
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_payout_rules_org").on(table.organizationId),
  index("IDX_payout_rules_property").on(table.propertyId),
  index("IDX_payout_rules_platform").on(table.platform),
]);

// Booking income tracking with routing applied
export const bookingIncomeRecords = pgTable("booking_income_records", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  sourceChannel: varchar("source_channel").notNull(), // airbnb, direct, booking_com, etc.
  guestName: varchar("guest_name").notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  
  // OTA Dual Commission Tracking
  guestTotalPrice: decimal("guest_total_price", { precision: 10, scale: 2 }).notNull(), // What guest paid to OTA
  platformPayout: decimal("platform_payout", { precision: 10, scale: 2 }).notNull(), // What host receives after OTA commission
  otaCommissionAmount: decimal("ota_commission_amount", { precision: 10, scale: 2 }).default("0.00"), // OTA commission deducted
  
  // Legacy field for backward compatibility
  totalRentalIncome: decimal("total_rental_income", { precision: 10, scale: 2 }).notNull(), // Will map to platformPayout
  
  routingApplied: varchar("routing_applied").notNull(), // rule_id reference or 'manual_override'
  ownerAmount: decimal("owner_amount", { precision: 10, scale: 2 }).notNull(),
  managementAmount: decimal("management_amount", { precision: 10, scale: 2 }).notNull(),
  stripeFeeAmount: decimal("stripe_fee_amount", { precision: 10, scale: 2 }).default("0.00"),
  managementFeePercentage: decimal("management_fee_percentage", { precision: 5, scale: 2 }).notNull(),
  actualAmountReceived: decimal("actual_amount_received", { precision: 10, scale: 2 }),
  payoutStatus: varchar("payout_status").default("pending"), // pending, processed, disputed
  notes: text("notes"),
  processedBy: varchar("processed_by"), // admin/PM user id
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_booking_income_org").on(table.organizationId),
  index("IDX_booking_income_property").on(table.propertyId),
  index("IDX_booking_income_channel").on(table.sourceChannel),
  index("IDX_booking_income_dates").on(table.checkInDate, table.checkOutDate),
]);

// Owner balance requests and payout workflow
export const ownerBalanceRequests = pgTable("owner_balance_requests", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  requestType: varchar("request_type").notNull(), // payout_request, invoice_payment
  requestedAmount: decimal("requested_amount", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, approved, payment_uploaded, confirmed, completed
  portfolioManagerId: varchar("portfolio_manager_id").references(() => users.id),
  adminId: varchar("admin_id").references(() => users.id),
  paymentSlipUrl: varchar("payment_slip_url"),
  uploadedBy: varchar("uploaded_by"), // admin/PM user id
  confirmedBy: varchar("confirmed_by"), // owner user id
  notes: text("notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  paymentUploadedAt: timestamp("payment_uploaded_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_balance_requests_org").on(table.organizationId),
  index("IDX_balance_requests_owner").on(table.ownerId),
  index("IDX_balance_requests_status").on(table.status),
]);

// Commission tracking for agents and portfolio managers
export const commissionPayouts = pgTable("commission_payouts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userRole: varchar("user_role").notNull(), // referral_agent, portfolio_manager
  propertyId: integer("property_id").references(() => properties.id),
  period: varchar("period").notNull(), // YYYY-MM format
  baseCommissionAmount: decimal("base_commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).notNull(), // 10% or 50%
  finalPayoutAmount: decimal("final_payout_amount", { precision: 10, scale: 2 }).notNull(),
  payoutCycle: varchar("payout_cycle").default("monthly"), // monthly, bi_weekly, custom
  status: varchar("status").default("pending"), // pending, approved, paid
  notes: text("notes"),
  approvedBy: varchar("approved_by"), // admin user id
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_commission_payouts_org").on(table.organizationId),
  index("IDX_commission_payouts_user").on(table.userId),
  index("IDX_commission_payouts_period").on(table.period),
]);

// Property timeline logging for transparency
export const propertyTimelineEvents = pgTable("property_timeline_events", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  eventType: varchar("event_type").notNull(), // booking_income, payout_request, commission_payout, invoice_payment
  eventTitle: varchar("event_title").notNull(),
  eventDescription: text("event_description"),
  relatedRecordId: integer("related_record_id"), // reference to booking_income_records, owner_balance_requests, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }),
  userId: varchar("user_id").references(() => users.id), // who performed the action
  metadata: jsonb("metadata"), // additional event data
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_timeline_org").on(table.organizationId),
  index("IDX_timeline_property").on(table.propertyId),
  index("IDX_timeline_type").on(table.eventType),
  index("IDX_timeline_date").on(table.createdAt),
]);

// Platform analytics and reporting data
export const platformAnalytics = pgTable("platform_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  analyticsType: varchar("analytics_type").notNull(), // monthly_summary, platform_breakdown, commission_summary
  period: varchar("period").notNull(), // YYYY-MM format
  platform: varchar("platform"), // airbnb, direct, booking_com, etc.
  totalRentalIncome: decimal("total_rental_income", { precision: 10, scale: 2 }).default("0.00"),
  totalCommissionEarned: decimal("total_commission_earned", { precision: 10, scale: 2 }).default("0.00"),
  totalAddonServices: decimal("total_addon_services", { precision: 10, scale: 2 }).default("0.00"),
  averageNightlyRate: decimal("average_nightly_rate", { precision: 10, scale: 2 }).default("0.00"),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  bookingCount: integer("booking_count").default(0),
  metadata: jsonb("metadata"), // additional analytics data
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_analytics_org").on(table.organizationId),
  index("IDX_analytics_property").on(table.propertyId),
  index("IDX_analytics_period").on(table.period),
  index("IDX_analytics_type").on(table.analyticsType),
]);

// Relations for booking income system
export const propertyPayoutRulesRelations = relations(propertyPayoutRules, ({ one }) => ({
  organization: one(organizations, {
    fields: [propertyPayoutRules.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [propertyPayoutRules.propertyId],
    references: [properties.id],
  }),
}));

export const bookingIncomeRecordsRelations = relations(bookingIncomeRecords, ({ one }) => ({
  organization: one(organizations, {
    fields: [bookingIncomeRecords.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [bookingIncomeRecords.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [bookingIncomeRecords.bookingId],
    references: [bookings.id],
  }),
}));

export const ownerBalanceRequestsRelations = relations(ownerBalanceRequests, ({ one }) => ({
  organization: one(organizations, {
    fields: [ownerBalanceRequests.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [ownerBalanceRequests.ownerId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [ownerBalanceRequests.propertyId],
    references: [properties.id],
  }),
  portfolioManager: one(users, {
    fields: [ownerBalanceRequests.portfolioManagerId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [ownerBalanceRequests.adminId],
    references: [users.id],
  }),
}));

export const commissionPayoutsRelations = relations(commissionPayouts, ({ one }) => ({
  organization: one(organizations, {
    fields: [commissionPayouts.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [commissionPayouts.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [commissionPayouts.propertyId],
    references: [properties.id],
  }),
}));

export const propertyTimelineEventsRelations = relations(propertyTimelineEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [propertyTimelineEvents.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [propertyTimelineEvents.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [propertyTimelineEvents.userId],
    references: [users.id],
  }),
}));

export const platformAnalyticsRelations = relations(platformAnalytics, ({ one }) => ({
  organization: one(organizations, {
    fields: [platformAnalytics.organizationId],
    references: [organizations.id],
  }),
  property: one(properties, {
    fields: [platformAnalytics.propertyId],
    references: [properties.id],
  }),
}));

// Type exports for booking income system
export type PropertyPayoutRule = typeof propertyPayoutRules.$inferSelect;
export type InsertPropertyPayoutRule = typeof propertyPayoutRules.$inferInsert;

export type BookingIncomeRecord = typeof bookingIncomeRecords.$inferSelect;
export type InsertBookingIncomeRecord = typeof bookingIncomeRecords.$inferInsert;

export type OwnerBalanceRequest = typeof ownerBalanceRequests.$inferSelect;
export type InsertOwnerBalanceRequest = typeof ownerBalanceRequests.$inferInsert;

export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type InsertCommissionPayout = typeof commissionPayouts.$inferInsert;

export type PropertyTimelineEvent = typeof propertyTimelineEvents.$inferSelect;
export type InsertPropertyTimelineEvent = typeof propertyTimelineEvents.$inferInsert;

export type PlatformAnalytics = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytics = typeof platformAnalytics.$inferInsert;

// Zod schemas for validation
export const insertPropertyPayoutRuleSchema = createInsertSchema(propertyPayoutRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingIncomeRecordSchema = createInsertSchema(bookingIncomeRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerBalanceRequestSchema = createInsertSchema(ownerBalanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionPayoutSchema = createInsertSchema(commissionPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyTimelineEventSchema = createInsertSchema(propertyTimelineEvents).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformAnalyticsSchema = createInsertSchema(platformAnalytics).omit({
  id: true,
  createdAt: true,
});

// ===== STAFF ADVANCE SALARY & OVERTIME TRACKER =====

// Staff overtime sessions tracking
export const staffOvertimeSessions = pgTable("staff_overtime_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  
  // Session Details
  sessionDate: date("session_date").notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  
  // Task Information
  taskId: integer("task_id").references(() => tasks.id),
  taskDescription: text("task_description"), // Manual description if no task linked
  workLocation: varchar("work_location"), // Villa X, Property Y, etc.
  workType: varchar("work_type").default("overtime"), // overtime, emergency, special_project
  
  // Emergency/After Hours
  isEmergency: boolean("is_emergency").default(false),
  isAfterHours: boolean("is_after_hours").default(false), // Auto-set for work after 8 PM
  emergencyReason: text("emergency_reason"),
  
  // Approval and Compensation
  status: varchar("status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  compensationType: varchar("compensation_type"), // paid, time_off, pending
  compensationAmount: decimal("compensation_amount", { precision: 10, scale: 2 }),
  compensationRate: decimal("compensation_rate", { precision: 5, scale: 2 }), // Hourly rate for overtime
  
  // Notes and Proof
  staffNotes: text("staff_notes"),
  adminNotes: text("admin_notes"),
  proofImages: jsonb("proof_images"), // Array of image URLs for verification
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_overtime_sessions_staff").on(table.staffId),
  index("IDX_overtime_sessions_date").on(table.sessionDate),
  index("IDX_overtime_sessions_status").on(table.status),
]);

// ===== MULTI-CURRENCY FINANCE + QUICKBOOKS INTEGRATION =====

// Currency exchange rates tracking
export const currencyExchangeRates = pgTable("currency_exchange_rates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Rate Details
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(), // USD, EUR, GBP, etc.
  toCurrency: varchar("to_currency", { length: 3 }).notNull(), // THB is base
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).notNull(),
  rateDate: date("rate_date").notNull(),
  
  // Rate Source
  rateSource: varchar("rate_source").default("manual"), // manual, api, bank
  apiProvider: varchar("api_provider"), // xe.com, currencyapi.com, etc.
  
  // Metadata
  isActive: boolean("is_active").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_exchange_rates_org").on(table.organizationId),
  index("IDX_exchange_rates_currencies").on(table.fromCurrency, table.toCurrency),
  index("IDX_exchange_rates_date").on(table.rateDate),
]);

// Enhanced financial records with multi-currency support
export const multiCurrencyFinances = pgTable("multi_currency_finances", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Transaction Details
  transactionDate: date("transaction_date").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // income, expense, transfer
  subcategory: varchar("subcategory"), // booking, utilities, maintenance, etc.
  
  // Multi-Currency Support
  originalCurrency: varchar("original_currency", { length: 3 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 12, scale: 2 }).notNull(),
  thbAmount: decimal("thb_amount", { precision: 12, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).notNull(),
  exchangeRateId: integer("exchange_rate_id").references(() => currencyExchangeRates.id),
  
  // Associations
  propertyId: integer("property_id").references(() => properties.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  ownerId: varchar("owner_id").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id),
  
  // Export and Integration
  exportedToQuickbooks: boolean("exported_to_quickbooks").default(false),
  quickbooksId: varchar("quickbooks_id"),
  exportedToGoogleSheets: boolean("exported_to_google_sheets").default(false),
  googleSheetsRowId: varchar("google_sheets_row_id"),
  
  // Attachments and Proof
  receiptUrl: varchar("receipt_url"),
  invoiceNumber: varchar("invoice_number"),
  referenceNumber: varchar("reference_number"),
  
  // Status and Approval
  status: varchar("status").default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_multi_currency_org").on(table.organizationId),
  index("IDX_multi_currency_date").on(table.transactionDate),
  index("IDX_multi_currency_property").on(table.propertyId),
  index("IDX_multi_currency_owner").on(table.ownerId),
  index("IDX_multi_currency_currency").on(table.originalCurrency),
]);

// QuickBooks integration settings
export const quickbooksIntegration = pgTable("quickbooks_integration", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // QuickBooks Credentials (encrypted)
  companyId: varchar("company_id").notNull(),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  realmId: varchar("realm_id"),
  
  // Integration Settings
  isActive: boolean("is_active").default(false),
  autoSync: boolean("auto_sync").default(false),
  syncFrequency: varchar("sync_frequency").default("daily"), // manual, daily, weekly
  lastSyncAt: timestamp("last_sync_at"),
  
  // Sync Configuration
  syncIncome: boolean("sync_income").default(true),
  syncExpenses: boolean("sync_expenses").default(true),
  syncInvoices: boolean("sync_invoices").default(true),
  syncPayments: boolean("sync_payments").default(true),
  
  // Error Tracking
  lastError: text("last_error"),
  errorCount: integer("error_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_quickbooks_org").on(table.organizationId),
]);

// Property-specific finance settings
export const propertyFinanceSettings = pgTable("property_finance_settings", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  
  // Output Preferences
  financeOutputMode: varchar("finance_output_mode").default("system_reports"), // system_reports, google_sheets, both
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("THB"),
  
  // QuickBooks Settings
  enableQuickbooksSync: boolean("enable_quickbooks_sync").default(false),
  quickbooksCustomerId: varchar("quickbooks_customer_id"),
  quickbooksItemId: varchar("quickbooks_item_id"),
  
  // Google Sheets Settings
  googleSheetsUrl: varchar("google_sheets_url"),
  googleSheetsTabName: varchar("google_sheets_tab_name").default("Finances"),
  lastGoogleSheetsSync: timestamp("last_google_sheets_sync"),
  
  // Report Settings
  includeInMonthlyReports: boolean("include_in_monthly_reports").default(true),
  emailReportsTo: varchar("email_reports_to"),
  reportFrequency: varchar("report_frequency").default("monthly"), // weekly, monthly, quarterly
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_property_finance_org").on(table.organizationId),
  index("IDX_property_finance_property").on(table.propertyId),
  index("IDX_property_finance_owner").on(table.ownerId),
]);

// Export logs for tracking report generation
export const financeExportLogs = pgTable("finance_export_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Export Details
  exportType: varchar("export_type").notNull(), // excel, csv, pdf, quickbooks, google_sheets
  exportFormat: varchar("export_format"), // monthly_summary, annual_report, detailed_breakdown
  dateRange: varchar("date_range").notNull(), // 2025-01, 2025-Q1, 2025
  
  // Filters Applied
  propertyIds: jsonb("property_ids"), // Array of property IDs
  ownerIds: jsonb("owner_ids"), // Array of owner IDs
  currencies: jsonb("currencies"), // Array of currencies included
  categories: jsonb("categories"), // Array of categories
  
  // Export Results
  status: varchar("status").default("pending"), // pending, completed, failed
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  fileSize: integer("file_size"), // In bytes
  recordCount: integer("record_count"),
  
  // Error Handling
  errorMessage: text("error_message"),
  
  // User and Timing
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // When file download expires
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_export_logs_org").on(table.organizationId),
  index("IDX_export_logs_type").on(table.exportType),
  index("IDX_export_logs_user").on(table.requestedBy),
  index("IDX_export_logs_date").on(table.dateRange),
]);

// Financial report templates
export const financeReportTemplates = pgTable("finance_report_templates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Template Details
  templateName: varchar("template_name").notNull(),
  templateType: varchar("template_type").notNull(), // monthly_summary, annual_report, owner_statement
  description: text("description"),
  
  // Configuration
  includedFields: jsonb("included_fields").notNull(), // Array of field names
  groupBy: jsonb("group_by"), // Array of grouping fields
  sortBy: jsonb("sort_by"), // Array of sorting fields
  filters: jsonb("filters"), // Default filters to apply
  
  // Formatting
  currency: varchar("currency", { length: 3 }).default("THB"),
  dateFormat: varchar("date_format").default("DD/MM/YYYY"),
  numberFormat: varchar("number_format").default("en-US"),
  
  // Branding
  includeLogo: boolean("include_logo").default(true),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  
  // Sharing
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false), // Can be used by other orgs
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_report_templates_org").on(table.organizationId),
  index("IDX_report_templates_type").on(table.templateType),
  index("IDX_report_templates_creator").on(table.createdBy),
]);

// Occupancy rate tracking for reports
export const occupancyRates = pgTable("occupancy_rates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Time Period
  periodType: varchar("period_type").notNull(), // daily, weekly, monthly, quarterly, yearly
  periodValue: varchar("period_value").notNull(), // 2025-01-15, 2025-W03, 2025-01, 2025-Q1, 2025
  
  // Occupancy Data
  totalDays: integer("total_days").notNull(),
  occupiedDays: integer("occupied_days").notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }).notNull(), // Percentage
  
  // Revenue Data
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("THB"),
  averageDailyRate: decimal("average_daily_rate", { precision: 8, scale: 2 }),
  revenuePerAvailableRoom: decimal("revenue_per_available_room", { precision: 8, scale: 2 }),
  
  // Booking Data
  totalBookings: integer("total_bookings").default(0),
  averageStayLength: decimal("average_stay_length", { precision: 4, scale: 1 }),
  
  // Auto-calculated
  calculatedAt: timestamp("calculated_at").defaultNow(),
  calculatedBy: varchar("calculated_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_occupancy_org").on(table.organizationId),
  index("IDX_occupancy_property").on(table.propertyId),
  index("IDX_occupancy_period").on(table.periodType, table.periodValue),
]);

// Type definitions for multi-currency finance tables
export type CurrencyExchangeRate = typeof currencyExchangeRates.$inferSelect;
export type InsertCurrencyExchangeRate = typeof currencyExchangeRates.$inferInsert;

export type MultiCurrencyFinance = typeof multiCurrencyFinances.$inferSelect;
export type InsertMultiCurrencyFinance = typeof multiCurrencyFinances.$inferInsert;

export type QuickbooksIntegration = typeof quickbooksIntegration.$inferSelect;
export type InsertQuickbooksIntegration = typeof quickbooksIntegration.$inferInsert;

export type PropertyFinanceSettings = typeof propertyFinanceSettings.$inferSelect;
export type InsertPropertyFinanceSettings = typeof propertyFinanceSettings.$inferInsert;

export type FinanceExportLog = typeof financeExportLogs.$inferSelect;
export type InsertFinanceExportLog = typeof financeExportLogs.$inferInsert;

export type FinanceReportTemplate = typeof financeReportTemplates.$inferSelect;
export type InsertFinanceReportTemplate = typeof financeReportTemplates.$inferInsert;

export type OccupancyRate = typeof occupancyRates.$inferSelect;
export type InsertOccupancyRate = typeof occupancyRates.$inferInsert;

// Zod schemas for validation
export const insertCurrencyExchangeRateSchema = createInsertSchema(currencyExchangeRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMultiCurrencyFinanceSchema = createInsertSchema(multiCurrencyFinances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuickbooksIntegrationSchema = createInsertSchema(quickbooksIntegration).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyFinanceSettingsSchema = createInsertSchema(propertyFinanceSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinanceExportLogSchema = createInsertSchema(financeExportLogs).omit({
  id: true,
  createdAt: true,
});

export const insertFinanceReportTemplateSchema = createInsertSchema(financeReportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOccupancyRateSchema = createInsertSchema(occupancyRates).omit({
  id: true,
  createdAt: true,
});

// ===== COMMUNICATION SYSTEM TYPES =====

// Communication channel schemas
export const insertCommunicationChannelSchema = createInsertSchema(communicationChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelMemberSchema = createInsertSchema(channelMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertInternalMessageSchema = createInsertSchema(internalMessages).omit({
  id: true,
  sentAt: true,
});

export const insertOwnerPmCommunicationSchema = createInsertSchema(ownerPmCommunication).omit({
  id: true,
  sentAt: true,
});

export const insertGuestSmartRequestSchema = createInsertSchema(guestSmartRequests).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSmartRequestConfigSchema = createInsertSchema(smartRequestConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Communication system types
export type CommunicationChannel = typeof communicationChannels.$inferSelect;
export type InsertCommunicationChannel = z.infer<typeof insertCommunicationChannelSchema>;
export type ChannelMember = typeof channelMembers.$inferSelect;
export type InsertChannelMember = z.infer<typeof insertChannelMemberSchema>;
export type InternalMessage = typeof internalMessages.$inferSelect;
export type InsertInternalMessage = z.infer<typeof insertInternalMessageSchema>;
export type OwnerPmCommunication = typeof ownerPmCommunication.$inferSelect;
export type InsertOwnerPmCommunication = z.infer<typeof insertOwnerPmCommunicationSchema>;
export type GuestSmartRequest = typeof guestSmartRequests.$inferSelect;
export type InsertGuestSmartRequest = z.infer<typeof insertGuestSmartRequestSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type SmartRequestConfig = typeof smartRequestConfig.$inferSelect;
export type InsertSmartRequestConfig = z.infer<typeof insertSmartRequestConfigSchema>;

// ===== AUDIT TRAIL & ADMIN OVERRIDE CONTROLS =====

// Audit Trail for all administrative actions
export const auditTrail = pgTable("audit_trail", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").notNull(), // ID of user performing action
  userRole: varchar("user_role").notNull(), // admin, portfolio-manager, etc.
  userName: varchar("user_name").notNull(), // Name of user performing action
  actionType: varchar("action_type").notNull(), // create, update, delete, approve, override, impersonate
  entityType: varchar("entity_type").notNull(), // task, booking, finance, user, property, etc.
  entityId: varchar("entity_id").notNull(), // ID of affected entity
  entityDescription: varchar("entity_description"), // Human readable description
  oldValues: jsonb("old_values"), // Previous state before change
  newValues: jsonb("new_values"), // New state after change
  changeReason: text("change_reason"), // Reason for the change
  impersonatedUserId: varchar("impersonated_user_id"), // If action was performed via impersonation
  ipAddress: varchar("ip_address"), // IP address of user
  userAgent: text("user_agent"), // Browser/client info
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  isOverride: boolean("is_override").default(false), // Was this an admin override?
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audit_org_user").on(table.organizationId, table.userId),
  index("IDX_audit_entity").on(table.entityType, table.entityId),
  index("IDX_audit_action_type").on(table.actionType),
  index("IDX_audit_date").on(table.createdAt),
]);

// Admin Override Permissions
export const adminOverridePermissions = pgTable("admin_override_permissions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").notNull(), // User with override permissions
  userRole: varchar("user_role").notNull(), // admin, portfolio-manager
  entityType: varchar("entity_type").notNull(), // task, finance, booking, property, user
  canCreate: boolean("can_create").default(false),
  canRead: boolean("can_read").default(true),
  canUpdate: boolean("can_update").default(false),
  canDelete: boolean("can_delete").default(false),
  canApprove: boolean("can_approve").default(false),
  canOverride: boolean("can_override").default(false), // Can override system restrictions
  canImpersonate: boolean("can_impersonate").default(false), // Can act as other users
  propertyRestrictions: jsonb("property_restrictions"), // Array of property IDs for PM restrictions
  isActive: boolean("is_active").default(true),
  grantedBy: varchar("granted_by").notNull(), // ID of admin who granted permission
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration
  notes: text("notes"), // Administrative notes
}, (table) => [
  index("IDX_override_user").on(table.organizationId, table.userId),
  index("IDX_override_entity").on(table.entityType),
]);

// User Impersonation Sessions
export const impersonationSessions = pgTable("impersonation_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  adminUserId: varchar("admin_user_id").notNull(), // Admin performing impersonation
  targetUserId: varchar("target_user_id").notNull(), // User being impersonated
  targetUserRole: varchar("target_user_role").notNull(),
  sessionToken: varchar("session_token").unique().notNull(), // Unique session identifier
  reason: text("reason").notNull(), // Required reason for impersonation
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"), // When session ended
  isActive: boolean("is_active").default(true),
  actionsPerformed: jsonb("actions_performed"), // Log of actions during impersonation
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
}, (table) => [
  index("IDX_impersonate_admin").on(table.organizationId, table.adminUserId),
  index("IDX_impersonate_target").on(table.targetUserId),
  index("IDX_impersonate_session").on(table.sessionToken),
]);

// Balance Override History (for admin balance resets)
export const balanceOverrideHistory = pgTable("balance_override_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  targetUserId: varchar("target_user_id").notNull(), // User whose balance was reset
  targetUserRole: varchar("target_user_role").notNull(),
  adminUserId: varchar("admin_user_id").notNull(), // Admin performing reset
  adminUserName: varchar("admin_user_name").notNull(),
  overrideType: varchar("override_type").notNull(), // balance_reset, balance_adjustment, payout_override
  entityType: varchar("entity_type").notNull(), // owner_balance, agent_commission, pm_balance
  entityId: varchar("entity_id"), // Reference to specific balance record
  previousValue: decimal("previous_value", { precision: 12, scale: 2 }).notNull(),
  newValue: decimal("new_value", { precision: 12, scale: 2 }).notNull(),
  adjustmentAmount: decimal("adjustment_amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason").notNull(), // Required justification
  approvalRequired: boolean("approval_required").default(false),
  approvedBy: varchar("approved_by"), // For high-value adjustments
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_balance_override_user").on(table.organizationId, table.targetUserId),
  index("IDX_balance_override_admin").on(table.adminUserId),
  index("IDX_balance_override_type").on(table.overrideType),
]);

// Portfolio Manager Property Assignments (for PM restrictions)
export const portfolioManagerAssignments = pgTable("portfolio_manager_assignments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  managerId: varchar("manager_id").notNull(), // Portfolio Manager user ID
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  assignedBy: varchar("assigned_by").notNull(), // Admin who made assignment
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions"), // Specific permissions for this property
  notes: text("notes"),
}, (table) => [
  index("IDX_pm_assignment_manager").on(table.organizationId, table.managerId),
  index("IDX_pm_assignment_property").on(table.propertyId),
]);

// Insert schemas for audit trail tables
export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  createdAt: true,
});

export const insertAdminOverridePermissionSchema = createInsertSchema(adminOverridePermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertImpersonationSessionSchema = createInsertSchema(impersonationSessions).omit({
  id: true,
  startedAt: true,
});

export const insertBalanceOverrideHistorySchema = createInsertSchema(balanceOverrideHistory).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioManagerAssignmentSchema = createInsertSchema(portfolioManagerAssignments).omit({
  id: true,
  assignedAt: true,
});

// Types for audit trail and admin controls
export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type AdminOverridePermission = typeof adminOverridePermissions.$inferSelect;
export type InsertAdminOverridePermission = z.infer<typeof insertAdminOverridePermissionSchema>;
export type ImpersonationSession = typeof impersonationSessions.$inferSelect;
export type InsertImpersonationSession = z.infer<typeof insertImpersonationSessionSchema>;
export type BalanceOverrideHistory = typeof balanceOverrideHistory.$inferSelect;
export type InsertBalanceOverrideHistory = z.infer<typeof insertBalanceOverrideHistorySchema>;
export type PortfolioManagerAssignment = typeof portfolioManagerAssignments.$inferSelect;
export type InsertPortfolioManagerAssignment = z.infer<typeof insertPortfolioManagerAssignmentSchema>;

// ===== PROPERTY ACCESS MANAGEMENT =====

// Property Access Credentials - Store all access methods for each property
export const propertyAccessCredentials = pgTable("property_access_credentials", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Access Details
  accessType: varchar("access_type").notNull(), // door_lock, safe_box, wifi, smart_lock, alarm, gate, parking
  accessName: varchar("access_name").notNull(), // "Front Door Lock", "Master Bedroom Safe", "WiFi Network"
  accessDetails: jsonb("access_details").notNull(), // Code, PIN, password, URL, etc.
  
  // Smart Lock Integration
  smartLockProvider: varchar("smart_lock_provider"), // ttlock, igloohome, august, schlage
  smartLockApiData: jsonb("smart_lock_api_data"), // API-specific data for sync
  isApiEnabled: boolean("is_api_enabled").default(false),
  
  // Visibility Controls
  visibleTo: jsonb("visible_to").notNull(), // ["admin", "pm", "staff", "owner", "guest"]
  guestAccessWindow: boolean("guest_access_window").default(false), // Show to guests only during stay
  
  // Photos and Documentation
  photoUrl: varchar("photo_url"), // URL to photo of key location/lockbox
  instructions: text("instructions"), // Special instructions for access
  location: varchar("location"), // "Behind the bush", "Under the mat"
  
  // Security and Maintenance
  lastUpdated: timestamp("last_updated").defaultNow(),
  codeRotationDays: integer("code_rotation_days").default(90), // Days until code should be rotated
  nextRotationDate: timestamp("next_rotation_date"),
  rotationRemindersEnabled: boolean("rotation_reminders_enabled").default(true),
  
  // Audit
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Access Photos - Store multiple photos per access credential
export const propertyAccessPhotos = pgTable("property_access_photos", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  credentialId: integer("credential_id").references(() => propertyAccessCredentials.id).notNull(),
  
  // Photo Details
  photoUrl: varchar("photo_url").notNull(),
  photoDescription: varchar("photo_description"), // "Lockbox behind bush", "Key safe location"
  photoType: varchar("photo_type").default("location"), // location, instruction, reference
  
  // Metadata
  fileName: varchar("file_name"),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Access Change Log - Track all changes to access credentials
export const accessChangeLog = pgTable("access_change_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  credentialId: integer("credential_id").references(() => propertyAccessCredentials.id).notNull(),
  
  // Change Details
  changeType: varchar("change_type").notNull(), // created, updated, rotated, deactivated, deleted
  fieldChanged: varchar("field_changed"), // access_details, visibility, instructions
  oldValue: text("old_value"), // Previous value (encrypted)
  newValue: text("new_value"), // New value (encrypted)
  changeReason: varchar("change_reason"), // scheduled_rotation, security_breach, guest_checkout, manual_update
  
  // Context
  triggeredBy: varchar("triggered_by"), // manual, scheduled, api_sync, security_event
  relatedBookingId: integer("related_booking_id").references(() => bookings.id),
  
  // Audit
  changedBy: varchar("changed_by").references(() => users.id).notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
});

// Guest Access Sessions - Track when guests access credentials during stays
export const guestAccessSessions = pgTable("guest_access_sessions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  credentialId: integer("credential_id").references(() => propertyAccessCredentials.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  
  // Access Session
  guestName: varchar("guest_name").notNull(),
  guestEmail: varchar("guest_email").notNull(),
  accessGrantedAt: timestamp("access_granted_at").defaultNow(),
  accessExpiresAt: timestamp("access_expires_at").notNull(),
  
  // Access Method
  accessMethod: varchar("access_method").notNull(), // qr_code, email_link, sms_link, manual_share
  accessToken: varchar("access_token"), // Unique token for digital access
  qrCodeUrl: varchar("qr_code_url"), // URL to generated QR code
  
  // Usage Tracking
  viewCount: integer("view_count").default(0),
  lastViewed: timestamp("last_viewed"),
  deviceInfo: jsonb("device_info"), // Device details when accessed
  
  // Status
  isActive: boolean("is_active").default(true),
  revokedAt: timestamp("revoked_at"),
  revokedBy: varchar("revoked_by").references(() => users.id),
  revokedReason: varchar("revoked_reason"),
});

// Smart Lock API Sync Log - Track API synchronization with smart lock providers
export const smartLockSyncLog = pgTable("smart_lock_sync_log", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  credentialId: integer("credential_id").references(() => propertyAccessCredentials.id).notNull(),
  
  // Sync Details
  provider: varchar("provider").notNull(), // ttlock, igloohome, august
  syncType: varchar("sync_type").notNull(), // update_code, create_temp_code, revoke_access, sync_status
  syncDirection: varchar("sync_direction").notNull(), // to_provider, from_provider, bidirectional
  
  // API Response
  apiRequest: jsonb("api_request"), // Request payload sent to provider
  apiResponse: jsonb("api_response"), // Response received from provider
  status: varchar("status").notNull(), // success, failed, pending, timeout
  errorMessage: text("error_message"),
  httpStatusCode: integer("http_status_code"),
  
  // Timing
  syncInitiatedBy: varchar("sync_initiated_by").references(() => users.id),
  syncStartedAt: timestamp("sync_started_at").defaultNow(),
  syncCompletedAt: timestamp("sync_completed_at"),
  responseTimeMs: integer("response_time_ms"),
  
  // Context
  triggeredBy: varchar("triggered_by"), // manual, scheduled, booking_event, code_rotation
  relatedBookingId: integer("related_booking_id").references(() => bookings.id),
});

// Code Rotation Schedule - Manage automatic code rotation
export const codeRotationSchedule = pgTable("code_rotation_schedule", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  credentialId: integer("credential_id").references(() => propertyAccessCredentials.id).notNull(),
  
  // Rotation Settings
  rotationFrequencyDays: integer("rotation_frequency_days").default(90),
  lastRotationDate: timestamp("last_rotation_date"),
  nextRotationDate: timestamp("next_rotation_date").notNull(),
  
  // Notification Settings
  reminderDaysBefore: integer("reminder_days_before").default(7), // Remind 7 days before rotation
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  // Automation
  autoRotationEnabled: boolean("auto_rotation_enabled").default(false),
  autoNotifyStaff: boolean("auto_notify_staff").default(true),
  autoNotifyOwner: boolean("auto_notify_owner").default(false),
  
  // Status
  isActive: boolean("is_active").default(true),
  pausedUntil: timestamp("paused_until"), // Temporarily pause rotation
  pauseReason: varchar("pause_reason"), // high_occupancy, maintenance, owner_request
  
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for Property Access Management
export const insertPropertyAccessCredentialSchema = createInsertSchema(propertyAccessCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyAccessPhotoSchema = createInsertSchema(propertyAccessPhotos).omit({
  id: true,
  uploadedAt: true,
});

export const insertAccessChangeLogSchema = createInsertSchema(accessChangeLog).omit({
  id: true,
  changedAt: true,
});

export const insertGuestAccessSessionSchema = createInsertSchema(guestAccessSessions).omit({
  id: true,
  accessGrantedAt: true,
});

export const insertSmartLockSyncLogSchema = createInsertSchema(smartLockSyncLog).omit({
  id: true,
  syncStartedAt: true,
});

export const insertCodeRotationScheduleSchema = createInsertSchema(codeRotationSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for Property Access Management
export type PropertyAccessCredential = typeof propertyAccessCredentials.$inferSelect;
export type InsertPropertyAccessCredential = z.infer<typeof insertPropertyAccessCredentialSchema>;
export type PropertyAccessPhoto = typeof propertyAccessPhotos.$inferSelect;
export type InsertPropertyAccessPhoto = z.infer<typeof insertPropertyAccessPhotoSchema>;
export type AccessChangeLog = typeof accessChangeLog.$inferSelect;
export type InsertAccessChangeLog = z.infer<typeof insertAccessChangeLogSchema>;
export type GuestAccessSession = typeof guestAccessSessions.$inferSelect;
export type InsertGuestAccessSession = z.infer<typeof insertGuestAccessSessionSchema>;
export type SmartLockSyncLog = typeof smartLockSyncLog.$inferSelect;
export type InsertSmartLockSyncLog = z.infer<typeof insertSmartLockSyncLogSchema>;
export type CodeRotationSchedule = typeof codeRotationSchedule.$inferSelect;
export type InsertCodeRotationSchedule = z.infer<typeof insertCodeRotationScheduleSchema>;

// ===== DAILY OPERATIONS DASHBOARD =====

// Daily Operations Summary - Aggregated data for specific dates
export const dailyOperationsSummary = pgTable("daily_operations_summary", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  operationDate: date("operation_date").notNull(),
  
  // Department Task Counts
  cleaningTasks: integer("cleaning_tasks").default(0),
  cleaningCompleted: integer("cleaning_completed").default(0),
  poolTasks: integer("pool_tasks").default(0),
  poolCompleted: integer("pool_completed").default(0),
  gardenTasks: integer("garden_tasks").default(0),
  gardenCompleted: integer("garden_completed").default(0),
  maintenanceTasks: integer("maintenance_tasks").default(0),
  maintenanceCompleted: integer("maintenance_completed").default(0),
  generalTasks: integer("general_tasks").default(0),
  generalCompleted: integer("general_completed").default(0),
  
  // Urgency Metrics
  overdueTasks: integer("overdue_tasks").default(0),
  tasksWithoutProof: integer("tasks_without_proof").default(0),
  uncleanedCheckinProperties: integer("uncleaned_checkin_properties").default(0),
  unassignedTasks: integer("unassigned_tasks").default(0),
  
  // Staff Metrics
  totalStaffScheduled: integer("total_staff_scheduled").default(0),
  totalTasksAssigned: integer("total_tasks_assigned").default(0),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_daily_ops_org_date").on(table.organizationId, table.operationDate),
]);

// Daily Staff Assignments - Who is working on what date
export const dailyStaffAssignments = pgTable("daily_staff_assignments", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  operationDate: date("operation_date").notNull(),
  
  // Shift Information
  shiftStart: varchar("shift_start"), // e.g., "08:00"
  shiftEnd: varchar("shift_end"), // e.g., "17:00"
  isAvailable: boolean("is_available").default(true),
  unavailableReason: varchar("unavailable_reason"), // sick, vacation, training
  
  // Task Assignment Summary
  totalTasksAssigned: integer("total_tasks_assigned").default(0),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  departmentFocus: varchar("department_focus"), // primary department for the day
  
  // Performance Metrics
  avgTaskCompletionTime: integer("avg_task_completion_time"), // in minutes
  taskCompletionRate: decimal("task_completion_rate", { precision: 5, scale: 2 }), // percentage
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_staff_assign_date").on(table.operationDate),
  index("IDX_staff_assign_staff").on(table.staffId),
]);

// Daily Property Operations - Tasks and events per property per day
export const dailyPropertyOperations = pgTable("daily_property_operations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  operationDate: date("operation_date").notNull(),
  
  // Check-in/Check-out Status
  hasCheckin: boolean("has_checkin").default(false),
  checkinTime: varchar("checkin_time"),
  hasCheckout: boolean("has_checkout").default(false),
  checkoutTime: varchar("checkout_time"),
  
  // Cleaning Status
  needsCleaning: boolean("needs_cleaning").default(false),
  cleaningCompleted: boolean("cleaning_completed").default(false),
  cleaningCompletedAt: timestamp("cleaning_completed_at"),
  cleaningStaffId: varchar("cleaning_staff_id").references(() => users.id),
  
  // Maintenance Tasks
  maintenanceTasks: integer("maintenance_tasks").default(0),
  maintenanceCompleted: integer("maintenance_completed").default(0),
  maintenanceOverdue: integer("maintenance_overdue").default(0),
  
  // Recurring Services
  recurringServices: integer("recurring_services").default(0),
  recurringCompleted: integer("recurring_completed").default(0),
  
  // Urgency Flags
  isUrgent: boolean("is_urgent").default(false),
  urgencyReason: varchar("urgency_reason"), // overdue_cleaning, overdue_maintenance, guest_complaint
  
  // Status Summary
  operationStatus: varchar("operation_status").default("scheduled"), // scheduled, in_progress, completed, delayed
  statusNotes: text("status_notes"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_prop_ops_date").on(table.operationDate),
  index("IDX_prop_ops_property").on(table.propertyId),
  index("IDX_prop_ops_urgent").on(table.isUrgent),
]);

// Insert schemas for daily operations
export const insertDailyOperationsSummarySchema = createInsertSchema(dailyOperationsSummary).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertDailyStaffAssignmentsSchema = createInsertSchema(dailyStaffAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyPropertyOperationsSchema = createInsertSchema(dailyPropertyOperations).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Types for Daily Operations Dashboard
export type DailyOperationsSummary = typeof dailyOperationsSummary.$inferSelect;
export type InsertDailyOperationsSummary = z.infer<typeof insertDailyOperationsSummarySchema>;
export type DailyStaffAssignments = typeof dailyStaffAssignments.$inferSelect;
export type InsertDailyStaffAssignments = z.infer<typeof insertDailyStaffAssignmentsSchema>;
export type DailyPropertyOperations = typeof dailyPropertyOperations.$inferSelect;
export type InsertDailyPropertyOperations = z.infer<typeof insertDailyPropertyOperationsSchema>;

// ===== ENHANCED FINANCIAL CONTROLS TYPE EXPORTS =====
// Note: Using existing invoice tables with enhanced functionality for comprehensive financial controls

// ===== MAINTENANCE, UTILITIES & RENOVATION TRACKER =====

// Maintenance Log & Backlog
export const maintenanceIssues = pgTable("maintenance_issues", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Issue Details
  issueTitle: varchar("issue_title").notNull(),
  issueDescription: text("issue_description").notNull(),
  issueType: varchar("issue_type").notNull(), // AC, Electrical, Plumbing, Pool, Garden, General
  urgencyLevel: varchar("urgency_level").notNull(), // Low, Normal, Urgent
  currentStatus: varchar("current_status").default("open"), // open, in_progress, resolved, closed
  
  // Assignment & Tracking
  reportedBy: varchar("reported_by").references(() => users.id).notNull(),
  reportedByName: varchar("reported_by_name").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedToName: varchar("assigned_to_name"),
  assignedToType: varchar("assigned_to_type"), // staff, contractor, external
  
  // Resolution Details
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedByName: varchar("resolved_by_name"),
  resolutionDate: timestamp("resolution_date"),
  resolutionNotes: text("resolution_notes"),
  resolutionPhotos: text("resolution_photos").array(),
  
  // Financial
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  receipts: text("receipts").array(), // Array of receipt file URLs
  currency: varchar("currency").default("THB"),
  
  // Tracking
  dueDateEstimate: timestamp("due_date_estimate"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Renovation & Service Timeline
export const propertyServiceHistory = pgTable("property_service_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Service Details
  serviceType: varchar("service_type").notNull(), // renovation, ac_service, pest_control, deep_clean, pool_inspection, septic_service, landscaping
  serviceName: varchar("service_name").notNull(),
  serviceDescription: text("service_description"),
  serviceDate: date("service_date").notNull(),
  
  // Provider Information
  serviceProvider: varchar("service_provider"),
  providerContact: varchar("provider_contact"),
  serviceCategory: varchar("service_category").notNull(), // major_renovation, routine_maintenance, emergency_repair
  
  // Documentation
  serviceNotes: text("service_notes"),
  attachments: text("attachments").array(), // Photos, documents, receipts
  serviceCost: decimal("service_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  
  // Quality & Follow-up
  qualityRating: integer("quality_rating"), // 1-5 stars
  followUpRequired: boolean("follow_up_required").default(false),
  nextServiceDue: date("next_service_due"),
  serviceWarranty: varchar("service_warranty"), // warranty period
  
  // Tracking
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdByName: varchar("created_by_name").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-Driven Future Task Suggestions
export const maintenanceTaskSuggestions = pgTable("maintenance_task_suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Suggestion Details
  suggestionType: varchar("suggestion_type").notNull(), // recurring_service, overdue_maintenance, predictive_alert
  taskType: varchar("task_type").notNull(), // AC, Electrical, Plumbing, Pool, Pest Control, etc.
  suggestionTitle: varchar("suggestion_title").notNull(),
  suggestionDescription: text("suggestion_description").notNull(),
  
  // AI Analysis
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }), // 0-100%
  basedOnData: varchar("based_on_data").notNull(), // historical_pattern, days_since_last, industry_standard
  lastServiceDate: date("last_service_date"),
  daysSinceLastService: integer("days_since_last_service"),
  recommendedInterval: integer("recommended_interval"), // days
  
  // Priority & Timing
  priorityLevel: varchar("priority_level").notNull(), // low, medium, high, urgent
  suggestedDueDate: date("suggested_due_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  
  // Status & Actions
  suggestionStatus: varchar("suggestion_status").default("pending"), // pending, approved, dismissed, task_created
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  dismissedBy: varchar("dismissed_by").references(() => users.id),
  dismissedAt: timestamp("dismissed_at"),
  dismissalReason: text("dismissal_reason"),
  taskCreatedId: integer("task_created_id"), // Reference to created task
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utilities Tracking & Bill Alerts
export const propertyUtilities = pgTable("property_utilities", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Utility Details
  utilityType: varchar("utility_type").notNull(), // electricity, water, internet, pest_control, gas, hoa_fee, custom
  customUtilityName: varchar("custom_utility_name"), // For custom utilities
  provider: varchar("provider").notNull(),
  accountNumber: varchar("account_number").notNull(),
  
  // Billing Information
  billingCycle: varchar("billing_cycle").notNull(), // monthly, quarterly, annually
  averageBillAmount: decimal("average_bill_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("THB"),
  
  // Alert Settings
  expectedBillDate: integer("expected_bill_date"), // Day of month (e.g., 17 for 17th)
  alertDaysAfter: integer("alert_days_after").default(4), // Alert if no bill after X days
  autoRemindersEnabled: boolean("auto_reminders_enabled").default(true),
  
  // Contact & Access
  providerContact: varchar("provider_contact"),
  onlinePortal: varchar("online_portal"),
  loginCredentials: text("login_credentials"), // Encrypted
  
  // Status
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility Bill History
export const utilityBillHistory = pgTable("utility_bill_history", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityId: integer("utility_id").references(() => propertyUtilities.id).notNull(),
  
  // Bill Details
  billingMonth: varchar("billing_month").notNull(), // YYYY-MM format
  billAmount: decimal("bill_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("THB"),
  billDueDate: date("bill_due_date"),
  billReceivedDate: date("bill_received_date"),
  
  // Payment Status
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, overdue, disputed
  paidDate: date("paid_date"),
  paidBy: varchar("paid_by").references(() => users.id),
  paidByName: varchar("paid_by_name"),
  
  // Documentation
  receiptUrl: varchar("receipt_url"), // Uploaded bill/receipt
  paymentReceiptUrl: varchar("payment_receipt_url"),
  notes: text("notes"),
  
  // Alerts
  alertSent: boolean("alert_sent").default(false),
  alertSentDate: timestamp("alert_sent_date"),
  alertSentTo: text("alert_sent_to").array(), // Array of user IDs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Utility Bill Alerts Log
export const utilityBillAlerts = pgTable("utility_bill_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  utilityId: integer("utility_id").references(() => propertyUtilities.id).notNull(),
  
  // Alert Details
  alertType: varchar("alert_type").notNull(), // overdue_bill, missing_receipt, payment_reminder
  alertTitle: varchar("alert_title").notNull(),
  alertMessage: text("alert_message").notNull(),
  alertSeverity: varchar("alert_severity").notNull(), // info, warning, urgent
  
  // Recipients
  sentTo: text("sent_to").array(), // Array of user IDs
  sentToRoles: text("sent_to_roles").array(), // Array of roles (admin, pm, owner)
  
  // Status
  alertStatus: varchar("alert_status").default("active"), // active, acknowledged, resolved
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Property Info Sidebar Cache
export const propertyInfoSummary = pgTable("property_info_summary", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Utility Status Summary
  totalUtilities: integer("total_utilities").default(0),
  utilitiesWithUnpaidBills: integer("utilities_with_unpaid_bills").default(0),
  utilitiesWithOverdueBills: integer("utilities_with_overdue_bills").default(0),
  totalMonthlyUtilityCost: decimal("total_monthly_utility_cost", { precision: 10, scale: 2 }),
  
  // Maintenance Summary
  openMaintenanceIssues: integer("open_maintenance_issues").default(0),
  urgentMaintenanceIssues: integer("urgent_maintenance_issues").default(0),
  totalMaintenanceCostThisYear: decimal("total_maintenance_cost_this_year", { precision: 10, scale: 2 }),
  
  // Recent Activity
  lastMaintenanceDate: date("last_maintenance_date"),
  lastServiceDate: date("last_service_date"),
  lastUtilityBillDate: date("last_utility_bill_date"),
  
  // AI Suggestions
  activeSuggestions: integer("active_suggestions").default(0),
  urgentSuggestions: integer("urgent_suggestions").default(0),
  
  // Cache Control
  lastUpdated: timestamp("last_updated").defaultNow(),
  cacheVersion: integer("cache_version").default(1),
});

// ===== MAINTENANCE TRACKER INSERT SCHEMAS =====

export const insertMaintenanceIssueSchema = createInsertSchema(maintenanceIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyServiceHistorySchema = createInsertSchema(propertyServiceHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceTaskSuggestionSchema = createInsertSchema(maintenanceTaskSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyUtilitySchema = createInsertSchema(propertyUtilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillHistorySchema = createInsertSchema(utilityBillHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilityBillAlertSchema = createInsertSchema(utilityBillAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyInfoSummarySchema = createInsertSchema(propertyInfoSummary).omit({
  id: true,
  lastUpdated: true,
});

// ===== MAINTENANCE TRACKER TYPE DEFINITIONS =====

export type MaintenanceIssue = typeof maintenanceIssues.$inferSelect;
export type InsertMaintenanceIssue = z.infer<typeof insertMaintenanceIssueSchema>;

export type PropertyServiceHistory = typeof propertyServiceHistory.$inferSelect;
export type InsertPropertyServiceHistory = z.infer<typeof insertPropertyServiceHistorySchema>;

export type MaintenanceTaskSuggestion = typeof maintenanceTaskSuggestions.$inferSelect;
export type InsertMaintenanceTaskSuggestion = z.infer<typeof insertMaintenanceTaskSuggestionSchema>;

export type PropertyUtility = typeof propertyUtilities.$inferSelect;
export type InsertPropertyUtility = z.infer<typeof insertPropertyUtilitySchema>;

export type UtilityBillHistory = typeof utilityBillHistory.$inferSelect;
export type InsertUtilityBillHistory = z.infer<typeof insertUtilityBillHistorySchema>;

export type UtilityBillAlert = typeof utilityBillAlerts.$inferSelect;
export type InsertUtilityBillAlert = z.infer<typeof insertUtilityBillAlertSchema>;

export type PropertyInfoSummary = typeof propertyInfoSummary.$inferSelect;
export type InsertPropertyInfoSummary = z.infer<typeof insertPropertyInfoSummarySchema>;

// ===== AUTO-SCHEDULING RULES & RECURRING TASK GENERATOR =====

// Auto-scheduling rules for recurring tasks
export const taskSchedulingRules = pgTable("task_scheduling_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Rule Definition
  ruleName: varchar("rule_name").notNull(),
  ruleDescription: text("rule_description"),
  taskTemplate: varchar("task_template").notNull(), // Template for generated tasks
  department: varchar("department").notNull(), // Pool, Garden, Housekeeping, Maintenance, etc.
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  // Scheduling Configuration
  scheduleType: varchar("schedule_type").notNull(), // daily, weekly, monthly, every_x_days, custom_dates
  scheduleValue: integer("schedule_value"), // For every_x_days (e.g., 3 for every 3 days)
  weeklyDay: integer("weekly_day"), // 0-6 for Sunday-Saturday
  monthlyDate: integer("monthly_date"), // 1-31 for monthly tasks
  customDates: text("custom_dates").array(), // Array of custom dates like ["5", "20"] for 5th and 20th
  
  // Assignment Rules
  assignmentType: varchar("assignment_type").default("auto"), // auto, specific_user
  assignedUserId: varchar("assigned_user_id").references(() => users.id),
  
  // Task Duration & Timing
  estimatedDuration: integer("estimated_duration"), // Minutes
  preferredStartTime: varchar("preferred_start_time"), // HH:MM format
  
  // Booking-based Rules
  bookingTrigger: boolean("booking_trigger").default(false),
  minBookingDays: integer("min_booking_days"), // Minimum booking length to trigger
  triggerDay: integer("trigger_day"), // Which day of booking to trigger (e.g., day 3)
  
  // Rule Status
  isActive: boolean("is_active").default(true),
  nextScheduledDate: date("next_scheduled_date"),
  lastGeneratedDate: date("last_generated_date"),
  
  // Created By
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_scheduling_property").on(table.propertyId),
  index("IDX_scheduling_department").on(table.department),
  index("IDX_scheduling_next_date").on(table.nextScheduledDate),
]);

// Generated recurring tasks
export const recurringTasks = pgTable("recurring_tasks", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  ruleId: integer("rule_id").references(() => taskSchedulingRules.id).notNull(),
  
  // Task Details
  taskTitle: varchar("task_title").notNull(),
  taskDescription: text("task_description"),
  department: varchar("department").notNull(),
  priority: varchar("priority").default("normal"),
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedBy: varchar("assigned_by").references(() => users.id),
  
  // Scheduling
  scheduledDate: date("scheduled_date").notNull(),
  dueDate: date("due_date"),
  estimatedDuration: integer("estimated_duration"),
  
  // Status Tracking
  status: varchar("status").default("scheduled"), // scheduled, today, in_progress, completed, missed, skipped
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  
  // Evidence & Proof
  evidencePhotos: text("evidence_photos").array(),
  issuesFound: text("issues_found").array(),
  
  // Booking Association (if applicable)
  bookingId: integer("booking_id").references(() => bookings.id),
  bookingDay: integer("booking_day"), // Which day of the booking this was scheduled for
  
  // Skip/Miss Tracking
  skipReason: text("skip_reason"),
  missedReason: text("missed_reason"),
  rescheduledDate: date("rescheduled_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_recurring_property").on(table.propertyId),
  index("IDX_recurring_rule").on(table.ruleId),
  index("IDX_recurring_assigned").on(table.assignedTo),
  index("IDX_recurring_scheduled").on(table.scheduledDate),
  index("IDX_recurring_status").on(table.status),
]);

// Task generation logs
export const taskGenerationLogs = pgTable("task_generation_logs", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  
  // Generation Details
  generationDate: date("generation_date").notNull(),
  rulesProcessed: integer("rules_processed").default(0),
  tasksGenerated: integer("tasks_generated").default(0),
  errorsEncountered: integer("errors_encountered").default(0),
  
  // Rule Processing Results
  ruleResults: jsonb("rule_results"), // Detailed results per rule
  errorDetails: text("error_details").array(),
  
  // Performance Metrics
  processingTimeMs: integer("processing_time_ms"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Recurring task performance analytics
export const recurringTaskAnalytics = pgTable("recurring_task_analytics", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  
  // Analytics Period
  periodMonth: integer("period_month").notNull(), // 1-12
  periodYear: integer("period_year").notNull(),
  department: varchar("department").notNull(),
  
  // Performance Metrics
  totalScheduled: integer("total_scheduled").default(0),
  totalCompleted: integer("total_completed").default(0),
  totalMissed: integer("total_missed").default(0),
  totalSkipped: integer("total_skipped").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // Percentage
  
  // Timing Analytics
  avgCompletionTime: decimal("avg_completion_time", { precision: 10, scale: 2 }), // Minutes
  avgDelay: decimal("avg_delay", { precision: 10, scale: 2 }), // Days delayed from scheduled
  
  // Quality Metrics
  issuesFoundCount: integer("issues_found_count").default(0),
  photoEvidenceRate: decimal("photo_evidence_rate", { precision: 5, scale: 2 }),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  index("IDX_analytics_property_period").on(table.propertyId, table.periodYear, table.periodMonth),
  index("IDX_analytics_department").on(table.department),
]);

// Task scheduling alerts
export const taskSchedulingAlerts = pgTable("task_scheduling_alerts", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  
  // Alert Details
  alertType: varchar("alert_type").notNull(), // rule_disabled, task_overdue, pattern_missed, ai_suggestion
  alertTitle: varchar("alert_title").notNull(),
  alertDescription: text("alert_description"),
  severity: varchar("severity").default("medium"), // low, medium, high, critical
  
  // References
  ruleId: integer("rule_id").references(() => taskSchedulingRules.id),
  taskId: integer("task_id").references(() => recurringTasks.id),
  
  // Alert Status
  status: varchar("status").default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  
  // AI Suggestions (if applicable)
  aiSuggestion: text("ai_suggestion"),
  suggestionConfidence: decimal("suggestion_confidence", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_alerts_property").on(table.propertyId),
  index("IDX_alerts_status").on(table.status),
  index("IDX_alerts_severity").on(table.severity),
]);

// ===== AUTO-SCHEDULING INSERT SCHEMAS =====

export const insertTaskSchedulingRuleSchema = createInsertSchema(taskSchedulingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecurringTaskSchema = createInsertSchema(recurringTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskGenerationLogSchema = createInsertSchema(taskGenerationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertRecurringTaskAnalyticsSchema = createInsertSchema(recurringTaskAnalytics).omit({
  id: true,
  lastUpdated: true,
});

export const insertTaskSchedulingAlertSchema = createInsertSchema(taskSchedulingAlerts).omit({
  id: true,
  createdAt: true,
});

// ===== AUTO-SCHEDULING TYPE DEFINITIONS =====

export type TaskSchedulingRule = typeof taskSchedulingRules.$inferSelect;
export type InsertTaskSchedulingRule = z.infer<typeof insertTaskSchedulingRuleSchema>;

export type RecurringTask = typeof recurringTasks.$inferSelect;
export type InsertRecurringTask = z.infer<typeof insertRecurringTaskSchema>;

export type TaskGenerationLog = typeof taskGenerationLogs.$inferSelect;
export type InsertTaskGenerationLog = z.infer<typeof insertTaskGenerationLogSchema>;

export type RecurringTaskAnalytics = typeof recurringTaskAnalytics.$inferSelect;
export type InsertRecurringTaskAnalytics = z.infer<typeof insertRecurringTaskAnalyticsSchema>;

export type TaskSchedulingAlert = typeof taskSchedulingAlerts.$inferSelect;
export type InsertTaskSchedulingAlert = z.infer<typeof insertTaskSchedulingAlertSchema>;

// ===== PROPERTY APPLIANCES MANAGEMENT =====

export const propertyAppliances = pgTable("property_appliances", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").references(() => organizations.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  applianceType: varchar("appliance_type").notNull(), // refrigerator, washing_machine, air_conditioner, etc.
  brand: varchar("brand"),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  installDate: date("install_date"),
  warrantyExpiry: date("warranty_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_appliances_property").on(table.propertyId),
  index("IDX_appliances_type").on(table.applianceType),
  index("IDX_appliances_warranty").on(table.warrantyExpiry),
]);

export const applianceRepairs = pgTable("appliance_repairs", {
  id: serial("id").primaryKey(),
  applianceId: integer("appliance_id").references(() => propertyAppliances.id),
  issueReported: text("issue_reported").notNull(),
  fixDescription: text("fix_description"),
  technicianName: varchar("technician_name"),
  repairCost: decimal("repair_cost", { precision: 10, scale: 2 }),
  receiptUrl: text("receipt_url"),
  repairedAt: timestamp("repaired_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_repairs_appliance").on(table.applianceId),
  index("IDX_repairs_date").on(table.repairedAt),
]);

// ===== APPLIANCES INSERT SCHEMAS =====

export const insertPropertyApplianceSchema = createInsertSchema(propertyAppliances).omit({
  id: true,
  createdAt: true,
});

export const insertApplianceRepairSchema = createInsertSchema(applianceRepairs).omit({
  id: true,
  createdAt: true,
});

// ===== APPLIANCES TYPE DEFINITIONS =====

export type PropertyAppliance = typeof propertyAppliances.$inferSelect;
export type InsertPropertyAppliance = z.infer<typeof insertPropertyApplianceSchema>;

export type ApplianceRepair = typeof applianceRepairs.$inferSelect;
export type InsertApplianceRepair = z.infer<typeof insertApplianceRepairSchema>;

// ===== ALERT MANAGEMENT SYSTEM TABLES =====

export const alertRules = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  name: varchar("name").notNull(),
  triggerType: varchar("trigger_type").notNull(), // warranty_expiration, repair_overdue, cost_threshold, maintenance_due, etc.
  conditionJson: json("condition_json").notNull(), // JSON configuration for alert conditions
  alertLevel: varchar("alert_level").default("warning"), // info, warning, critical, urgent
  sendTo: varchar("send_to").array(), // array of user IDs or email addresses
  isActive: boolean("is_active").default(true),
  description: text("description"), // Human-readable description of the alert rule
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_alert_rules_org").on(table.organizationId),
  index("IDX_alert_rules_trigger").on(table.triggerType),
  index("IDX_alert_rules_active").on(table.isActive),
]);

export const alertLogs = pgTable("alert_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => alertRules.id),
  triggeredAt: timestamp("triggered_at").defaultNow(),
  message: text("message"),
  status: varchar("status").default("open"), // open, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  metadataJson: json("metadata_json"), // Additional context data (property ID, appliance ID, etc.)
  alertLevel: varchar("alert_level").default("warning"), // Copied from rule for historical tracking
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_alert_logs_rule").on(table.ruleId),
  index("IDX_alert_logs_status").on(table.status),
  index("IDX_alert_logs_triggered").on(table.triggeredAt),
]);

// ===== ALERT MANAGEMENT INSERT SCHEMAS =====

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertLogSchema = createInsertSchema(alertLogs).omit({
  id: true,
  createdAt: true,
});

// ===== ALERT MANAGEMENT TYPE DEFINITIONS =====

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;

export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = z.infer<typeof insertAlertLogSchema>;

// ===== LEGAL TEMPLATES SYSTEM =====

export const legalTemplates = pgTable("legal_templates", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  docType: varchar("doc_type", { length: 100 }).notNull(), // contract, deposit_rules, terms_conditions
  templateText: text("template_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLegalTemplateSchema = createInsertSchema(legalTemplates).omit({
  id: true,
  createdAt: true,
});

export type LegalTemplate = typeof legalTemplates.$inferSelect;
export type InsertLegalTemplate = z.infer<typeof insertLegalTemplateSchema>;

// ===== PROPERTY STATUS SYSTEM =====

export const propertyStatus = pgTable("property_status", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  status: varchar("status").notNull(), // occupied, vacant, urgent-maintenance, cleaning-due
  lastUpdate: timestamp("last_update").defaultNow(),
  notes: text("notes"),
}, (table) => [
  index("IDX_property_status_org").on(table.organizationId),
  index("IDX_property_status_property").on(table.propertyId),
  index("IDX_property_status_status").on(table.status),
]);

export const insertPropertyStatusSchema = createInsertSchema(propertyStatus).omit({
  id: true,
  lastUpdate: true,
});

export type PropertyStatus = typeof propertyStatus.$inferSelect;
export type InsertPropertyStatus = z.infer<typeof insertPropertyStatusSchema>;
