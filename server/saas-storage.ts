// server/saas-storage.ts
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

/**
 * Lazy initialize the Neon + Drizzle client.
 * This prevents calling neon() during module evaluation before env vars are loaded.
 */
let masterDbInstance: ReturnType<typeof drizzle> | null = null;
export function getMasterDb() {
  if (masterDbInstance) return masterDbInstance;

  const conn = (
    process.env.MASTER_DATABASE_URL ||
    process.env.DATABASE_URL ||
    ""
  ).trim();
  if (!conn) {
    throw new Error(
      "No database connection string found. Set MASTER_DATABASE_URL or DATABASE_URL in your environment (e.g. .env)."
    );
  }

  masterDbInstance = drizzle(neon(conn));
  return masterDbInstance;
}

export class SaasStorage {
  // ===== SIGNUP REQUESTS =====
  async createSignupRequest(request: NewSignupRequest): Promise<SignupRequest> {
    const db = getMasterDb();
    const [created] = await db
      .insert(signupRequests)
      .values(request)
      .returning();
    return created;
  }

  async getSignupRequests(status?: string): Promise<SignupRequest[]> {
    const db = getMasterDb();
    const query = status
      ? db
          .select()
          .from(signupRequests)
          .where(eq(signupRequests.status, status))
      : db.select().from(signupRequests);

    return await query.orderBy(desc(signupRequests.submittedAt));
  }

  async getSignupRequest(id: string): Promise<SignupRequest | null> {
    const db = getMasterDb();
    const [request] = await db
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
    const db = getMasterDb();
    const [updated] = await db
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
    const db = getMasterDb();
    const [created] = await db
      .insert(clientOrganizations)
      .values(tenant)
      .returning();
    return created;
  }

  async getTenantOrganizations(): Promise<ClientOrganization[]> {
    const db = getMasterDb();
    return await db
      .select()
      .from(clientOrganizations)
      .orderBy(desc(clientOrganizations.createdAt));
  }

  async getTenantBySubdomain(
    subdomain: string
  ): Promise<ClientOrganization | null> {
    const db = getMasterDb();
    const [tenant] = await db
      .select()
      .from(clientOrganizations)
      .where(eq(clientOrganizations.subdomain, subdomain));
    return tenant || null;
  }

  async getTenantByOrganizationId(
    organizationId: string
  ): Promise<ClientOrganization | null> {
    const db = getMasterDb();
    const [tenant] = await db
      .select()
      .from(clientOrganizations)
      .where(eq(clientOrganizations.organizationId, organizationId));
    return tenant || null;
  }

  async updateTenantStatus(
    organizationId: string,
    status: "active" | "suspended" | "terminated"
  ): Promise<ClientOrganization> {
    const db = getMasterDb();
    const updateData: any = { status };

    if (status === "suspended") updateData.suspendedAt = new Date();
    if (status === "terminated") updateData.terminatedAt = new Date();
    if (status === "active") {
      updateData.suspendedAt = null;
      updateData.terminatedAt = null;
    }

    const [updated] = await db
      .update(clientOrganizations)
      .set(updateData)
      .where(eq(clientOrganizations.organizationId, organizationId))
      .returning();

    return updated;
  }

  // ===== TENANT (CLIENT) API KEYS =====
  async setTenantApiKey(
    organizationId: string,
    service: string,
    keyName: string,
    apiKey: string
  ): Promise<ClientApiKey> {
    const db = getMasterDb();
    const encryptedKey = this.encryptApiKey(apiKey);

    // Check if key exists and update, otherwise create
    const existing = await db
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
      const [updated] = await db
        .update(clientApiKeys)
        .set({ encryptedKey, lastUsed: new Date() })
        .where(eq(clientApiKeys.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(clientApiKeys)
        .values({
          organizationId,
          service,
          keyName,
          encryptedKey,
        } as NewClientApiKey)
        .returning();
      return created;
    }
  }

  async getTenantApiKey(
    organizationId: string,
    service: string,
    keyName: string
  ): Promise<string | null> {
    const db = getMasterDb();
    const [result] = await db
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
    await db
      .update(clientApiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(clientApiKeys.id, result.id));

    return this.decryptApiKey(result.encryptedKey);
  }

  async getTenantApiKeys(organizationId: string): Promise<ClientApiKey[]> {
    const db = getMasterDb();
    return await db
      .select()
      .from(clientApiKeys)
      .where(
        and(
          eq(clientApiKeys.organizationId, organizationId),
          eq(clientApiKeys.isActive, true)
        )
      );
  }

  // ===== TENANT (CLIENT) DEPLOYMENTS =====
  async createTenantDeployment(
    deployment: NewClientDeployment
  ): Promise<ClientDeployment> {
    const db = getMasterDb();
    const [created] = await db
      .insert(clientDeployments)
      .values(deployment)
      .returning();
    return created;
  }

  async updateTenantDeployment(
    id: string,
    updates: Partial<ClientDeployment>
  ): Promise<ClientDeployment> {
    const db = getMasterDb();
    const [updated] = await db
      .update(clientDeployments)
      .set(updates)
      .where(eq(clientDeployments.id, id))
      .returning();
    return updated;
  }

  async getTenantDeployment(
    organizationId: string
  ): Promise<ClientDeployment | null> {
    const db = getMasterDb();
    const [deployment] = await db
      .select()
      .from(clientDeployments)
      .where(eq(clientDeployments.organizationId, organizationId))
      .orderBy(desc(clientDeployments.createdAt));

    return deployment || null;
  }

  // ===== AUDIT LOGGING =====
  async logSaasAction(log: NewSaasAuditLog): Promise<SaasAuditLog> {
    const db = getMasterDb();
    const [created] = await db.insert(saasAuditLog).values(log).returning();
    return created;
  }

  async getSaasAuditLogs(organizationId?: string): Promise<SaasAuditLog[]> {
    const db = getMasterDb();
    const query = organizationId
      ? db
          .select()
          .from(saasAuditLog)
          .where(eq(saasAuditLog.organizationId, organizationId))
      : db.select().from(saasAuditLog);

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
