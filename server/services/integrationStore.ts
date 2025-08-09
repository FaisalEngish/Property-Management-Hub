import crypto from 'crypto';

export interface Integration {
  provider: string;
  authType: 'api_key' | 'oauth';
  apiKeyEnc?: string;
  accessTokenEnc?: string;
  accountId?: string;
  isActive: boolean;
  connectedAt: Date;
  lastSyncAt?: Date;
}

interface IntegrationData {
  organizationId: string;
  integration: Integration | null;
}

// Encryption utilities
const cryptKey = process.env.INTEGRATION_CRYPT_KEY || 'dev-dev-dev-dev-dev-dev-dev-dev';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptKey), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Simple in-memory store - will be replaced with Drizzle tables later
class IntegrationStore {
  private store: Map<string, IntegrationData> = new Map();

  async getIntegration(organizationId: string): Promise<Integration | null> {
    const data = this.store.get(organizationId);
    return data?.integration || null;
  }

  async saveIntegration(organizationId: string, integration: Integration): Promise<void> {
    this.store.set(organizationId, {
      organizationId,
      integration
    });
  }

  async deleteIntegration(organizationId: string): Promise<void> {
    this.store.delete(organizationId);
  }

  async updateLastSync(organizationId: string): Promise<void> {
    const data = this.store.get(organizationId);
    if (data?.integration) {
      data.integration.lastSyncAt = new Date();
      this.store.set(organizationId, data);
    }
  }

  // Debug method - remove in production
  async getAllIntegrations(): Promise<Array<{ orgId: string; provider: string | null }>> {
    const result: Array<{ orgId: string; provider: string | null }> = [];
    for (const [orgId, data] of this.store.entries()) {
      result.push({
        orgId,
        provider: data.integration?.provider || null
      });
    }
    return result;
  }
}

export const integrationStore = new IntegrationStore();

// Helper function for getting integration by organization
export async function getIntegrationForOrg(organizationId: string): Promise<Integration | null> {
  return integrationStore.getIntegration(organizationId);
}