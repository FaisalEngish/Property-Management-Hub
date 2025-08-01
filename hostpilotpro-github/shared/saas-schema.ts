import { pgTable, text, integer, timestamp, boolean, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Master database tables for SaaS framework management

export const signupRequests = pgTable("signup_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country").notNull(),
  website: text("website"),
  propertyCount: integer("property_count"),
  requestedFeatures: jsonb("requested_features").$type<string[]>(),
  businessType: text("business_type"), // hotel, villa, resort, apartment
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  rejectionReason: text("rejection_reason"),
});

export const clientOrganizations = pgTable("client_organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id").notNull().unique(), // client_12345
  companyName: text("company_name").notNull(),
  subdomain: text("subdomain").notNull().unique(), // acme.hostpilotpro.com
  databaseUrl: text("database_url").notNull(),
  schemaName: text("schema_name").notNull(),
  planType: text("plan_type").notNull().default("basic"), // basic, pro, enterprise
  status: text("status").notNull().default("active"), // active, suspended, terminated
  createdAt: timestamp("created_at").defaultNow(),
  activatedAt: timestamp("activated_at"),
  suspendedAt: timestamp("suspended_at"),
  terminatedAt: timestamp("terminated_at"),
  maxProperties: integer("max_properties").default(10),
  maxUsers: integer("max_users").default(5),
  features: jsonb("features").$type<string[]>(),
  adminUserId: text("admin_user_id"),
  contactEmail: text("contact_email").notNull(),
  billingEmail: text("billing_email"),
});

export const clientApiKeys = pgTable("client_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id").notNull(),
  service: text("service").notNull(), // hostaway, stripe, twilio, openai
  keyName: text("key_name").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const clientDeployments = pgTable("client_deployments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id").notNull(),
  deploymentStatus: text("deployment_status").notNull(), // provisioning, ready, failed
  environmentUrl: text("environment_url"),
  databaseStatus: text("database_status"), // creating, migrating, ready, failed
  seedDataStatus: text("seed_data_status"), // pending, seeding, completed, failed
  deploymentLogs: jsonb("deployment_logs").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorLogs: jsonb("error_logs").$type<string[]>(),
});

export const saasAuditLog = pgTable("saas_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(), // signup_request, approval, rejection, deployment, suspension
  organizationId: text("organization_id"),
  performedBy: text("performed_by").notNull(),
  details: jsonb("details").$type<Record<string, any>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertSignupRequestSchema = createInsertSchema(signupRequests);
export const insertClientOrganizationSchema = createInsertSchema(clientOrganizations);
export const insertClientApiKeySchema = createInsertSchema(clientApiKeys);
export const insertClientDeploymentSchema = createInsertSchema(clientDeployments);
export const insertSaasAuditLogSchema = createInsertSchema(saasAuditLog);

// Types
export type SignupRequest = typeof signupRequests.$inferSelect;
export type NewSignupRequest = z.infer<typeof insertSignupRequestSchema>;
export type ClientOrganization = typeof clientOrganizations.$inferSelect;
export type NewClientOrganization = z.infer<typeof insertClientOrganizationSchema>;
export type ClientApiKey = typeof clientApiKeys.$inferSelect;
export type NewClientApiKey = z.infer<typeof insertClientApiKeySchema>;
export type ClientDeployment = typeof clientDeployments.$inferSelect;
export type NewClientDeployment = z.infer<typeof insertClientDeploymentSchema>;
export type SaasAuditLog = typeof saasAuditLog.$inferSelect;
export type NewSaasAuditLog = z.infer<typeof insertSaasAuditLogSchema>;