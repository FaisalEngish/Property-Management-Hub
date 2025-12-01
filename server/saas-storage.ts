import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and } from "drizzle-orm";
import {
  signupRequests,
  clientOrganizations,
  clientApiKeys,
  clientDeployments,
  saasAuditLog,
  type SignupRequest,
  type NewSignupRequest,
  type ClientOrganization,
  type NewClientOrganization,
  type ClientApiKey,
  type NewClientApiKey,
  type ClientDeployment,
  type NewClientDeployment,
  type SaasAuditLog,
  type NewSaasAuditLog,
} from "../shared/saas-schema";
import crypto from "crypto";

// Master database connection for SaaS framework
// const masterDb = drizzle(
//   neon(process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL!)
// );

// ---- FIX: load the correct DB URL ----
const conn =
  process.env.MASTER_DATABASE_URL ??
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!conn) {
  console.error("❌ Missing database connection string.");
  console.error(
    "Set MASTER_DATABASE_URL or NEON_DATABASE_URL or DATABASE_URL in your .env"
  );
  process.exit(1);
}

// ---- FIX: create the Neon client + drizzle instance ----
const sql = neon(conn);
const masterDb = drizzle(sql);

export class SaasStorage {
  // ===== SIGNUP REQUESTS =====
  async createSignupRequest(request: NewSignupRequest): Promise<SignupRequest> {
    const [created] = await masterDb
      .insert(signupRequests)
      .values(request)
      .returning();
    return created;
  }

  async getSignupRequests(status?: string): Promise<SignupRequest[]> {
    const query = status
      ? masterDb
          .select()
          .from(signupRequests)
          .where(eq(signupRequests.status, status))
      : masterDb.select().from(signupRequests);

    return await query.orderBy(desc(signupRequests.submittedAt));
  }

  async getSignupRequest(id: string): Promise<SignupRequest | null> {
    const [request] = await masterDb
      .select()
      .from(signupRequests)
      .where(eq(signupRequests.id, id));
    return request || null;
  }

  async updateSignupRequestStatus(
    id: string,
    status: "approved" | "rejected",
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<SignupRequest> {
    const [updated] = await masterDb
      .update(signupRequests)
      .set({
        status,
        reviewedAt: new Date(),
        reviewedBy,
        rejectionReason,
      })
      .where(eq(signupRequests.id, id))
      .returning();

    return updated;
  }

  // ===== TENANT ORGANIZATIONS =====
  async createTenantOrganization(
    tenant: NewClientOrganization
  ): Promise<ClientOrganization> {
    const [created] = await masterDb
      .insert(clientOrganizations)
      .values(tenant)
      .returning();
    return created;
  }

  async getTenantOrganizations(): Promise<ClientOrganization[]> {
    return await masterDb
      .select()
      .from(clientOrganizations)
      .orderBy(desc(clientOrganizations.createdAt));
  }

  async getTenantBySubdomain(
    subdomain: string
  ): Promise<ClientOrganization | null> {
    const [tenant] = await masterDb
      .select()
      .from(clientOrganizations)
      .where(eq(clientOrganizations.subdomain, subdomain));
    return tenant || null;
  }

  async getTenantByOrganizationId(
    organizationId: string
  ): Promise<ClientOrganization | null> {
    const [tenant] = await masterDb
      .select()
      .from(clientOrganizations)
      .where(eq(clientOrganizations.organizationId, organizationId));
    return tenant || null;
  }

  async updateTenantStatus(
    organizationId: string,
    status: "active" | "suspended" | "terminated"
  ): Promise<ClientOrganization> {
    const updateData: any = { status };

    if (status === "suspended") updateData.suspendedAt = new Date();
    if (status === "terminated") updateData.terminatedAt = new Date();
    if (status === "active") {
      updateData.suspendedAt = null;
      updateData.terminatedAt = null;
    }

    const [updated] = await masterDb
      .update(clientOrganizations)
      .set(updateData)
      .where(eq(clientOrganizations.organizationId, organizationId))
      .returning();

    return updated;
  }

  // ===== TENANT API KEYS =====
  async setTenantApiKey(
    organizationId: string,
    service: string,
    keyName: string,
    apiKey: string
  ): Promise<TenantApiKey> {
    const encryptedKey = this.encryptApiKey(apiKey);

    // Check if key exists and update, otherwise create
    const existing = await masterDb
      .select()
      .from(clientApiKeys)
      .where(
        and(
          eq(clientApiKeys.organizationId, organizationId),
          eq(clientApiKeys.service, service),
          eq(clientApiKeys.keyName, keyName)
        )
      );

    if (existing.length > 0) {
      const [updated] = await masterDb
        .update(clientApiKeys)
        .set({ encryptedKey, lastUsed: new Date() })
        .where(eq(clientApiKeys.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await masterDb
        .insert(clientApiKeys)
        .values({
          organizationId,
          service,
          keyName,
          encryptedKey,
        })
        .returning();
      return created;
    }
  }

  async getTenantApiKey(
    organizationId: string,
    service: string,
    keyName: string
  ): Promise<string | null> {
    const [result] = await masterDb
      .select()
      .from(clientApiKeys)
      .where(
        and(
          eq(clientApiKeys.organizationId, organizationId),
          eq(clientApiKeys.service, service),
          eq(clientApiKeys.keyName, keyName),
          eq(clientApiKeys.isActive, true)
        )
      );

    if (!result) return null;

    // Update last used timestamp
    await masterDb
      .update(tenantApiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(tenantApiKeys.id, result.id));

    return this.decryptApiKey(result.encryptedKey);
  }

  async getTenantApiKeys(organizationId: string): Promise<TenantApiKey[]> {
    return await masterDb
      .select()
      .from(tenantApiKeys)
      .where(
        and(
          eq(tenantApiKeys.organizationId, organizationId),
          eq(tenantApiKeys.isActive, true)
        )
      );
  }

  // ===== TENANT DEPLOYMENTS =====
  async createTenantDeployment(
    deployment: NewTenantDeployment
  ): Promise<TenantDeployment> {
    const [created] = await masterDb
      .insert(tenantDeployments)
      .values(deployment)
      .returning();
    return created;
  }

  async updateTenantDeployment(
    id: string,
    updates: Partial<TenantDeployment>
  ): Promise<TenantDeployment> {
    const [updated] = await masterDb
      .update(tenantDeployments)
      .set(updates)
      .where(eq(tenantDeployments.id, id))
      .returning();
    return updated;
  }

  async getTenantDeployment(
    organizationId: string
  ): Promise<TenantDeployment | null> {
    const [deployment] = await masterDb
      .select()
      .from(tenantDeployments)
      .where(eq(tenantDeployments.organizationId, organizationId))
      .orderBy(desc(tenantDeployments.createdAt));

    return deployment || null;
  }

  // ===== AUDIT LOGGING =====
  async logSaasAction(log: NewSaasAuditLog): Promise<SaasAuditLog> {
    const [created] = await masterDb
      .insert(saasAuditLog)
      .values(log)
      .returning();
    return created;
  }

  async getSaasAuditLogs(organizationId?: string): Promise<SaasAuditLog[]> {
    const query = organizationId
      ? masterDb
          .select()
          .from(saasAuditLog)
          .where(eq(saasAuditLog.organizationId, organizationId))
      : masterDb.select().from(saasAuditLog);

    return await query.orderBy(desc(saasAuditLog.createdAt));
  }

  // ===== UTILITY METHODS =====
  private encryptApiKey(apiKey: string): string {
    const cipher = crypto.createCipher(
      "aes192",
      process.env.ENCRYPTION_KEY || "default-key"
    );
    let encrypted = cipher.update(apiKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  private decryptApiKey(encryptedKey: string): string {
    const decipher = crypto.createDecipher(
      "aes192",
      process.env.ENCRYPTION_KEY || "default-key"
    );
    let decrypted = decipher.update(encryptedKey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  async generateOrganizationId(): Promise<string> {
    let organizationId: string;
    let attempts = 0;

    do {
      organizationId = `client_${crypto.randomBytes(4).toString("hex")}`;
      attempts++;

      const existing = await this.getTenantByOrganizationId(organizationId);
      if (!existing) break;
    } while (attempts < 10);

    return organizationId;
  }

  async generateSubdomain(companyName: string): Promise<string> {
    // Create subdomain from company name
    let baseSubdomain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20);

    let subdomain = baseSubdomain;
    let counter = 1;

    // Ensure uniqueness
    while (await this.getTenantBySubdomain(subdomain)) {
      subdomain = `${baseSubdomain}${counter}`;
      counter++;
    }

    return subdomain;
  }
}

export const saasStorage = new SaasStorage();
