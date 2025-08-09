import crypto from 'crypto';

export interface Integration {
  provider: string;
  authType: 'api_key' | 'oauth';
  credentials: Record<string, any>;
  isActive: boolean;
  connectedAt: Date;
  lastSyncAt?: Date;
}

interface IntegrationData {
  organizationId: string;
  integration: Integration | null;
}

// Simple in-memory store - will be replaced with Drizzle tables later
class IntegrationStore {
  private store: Map<string, IntegrationData> = new Map();
  private cryptKey: string;

  constructor() {
    this.cryptKey = process.env.INTEGRATION_CRYPT_KEY || 'dev-dev-dev-dev-dev-dev-dev-dev';
    if (this.cryptKey.length !== 32) {
      throw new Error('INTEGRATION_CRYPT_KEY must be exactly 32 characters');
    }
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.cryptKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.cryptKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getIntegration(organizationId: string): Promise<Integration | null> {
    const data = this.store.get(organizationId);
    if (!data?.integration) return null;

    // Decrypt sensitive credentials
    const integration = { ...data.integration };
    if (integration.credentials) {
      const decryptedCreds: Record<string, any> = {};
      for (const [key, value] of Object.entries(integration.credentials)) {
        if (typeof value === 'string' && key.toLowerCase().includes('key')) {
          decryptedCreds[key] = this.decrypt(value);
        } else {
          decryptedCreds[key] = value;
        }
      }
      integration.credentials = decryptedCreds;
    }

    return integration;
  }

  async saveIntegration(organizationId: string, integration: Integration): Promise<void> {
    // Encrypt sensitive credentials
    const encryptedIntegration = { ...integration };
    if (integration.credentials) {
      const encryptedCreds: Record<string, any> = {};
      for (const [key, value] of Object.entries(integration.credentials)) {
        if (typeof value === 'string' && key.toLowerCase().includes('key')) {
          encryptedCreds[key] = this.encrypt(value);
        } else {
          encryptedCreds[key] = value;
        }
      }
      encryptedIntegration.credentials = encryptedCreds;
    }

    this.store.set(organizationId, {
      organizationId,
      integration: encryptedIntegration
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