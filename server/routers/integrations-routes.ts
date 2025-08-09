import { Express, Request, Response } from 'express';
import { saveIntegration, removeIntegration, getIntegrationForOrg, encrypt } from '../services/integrationStore';
import { extractOrganizationId, IntegrationRequest } from '../middlewares/integration-auth';
import { getPMSClient } from '../integrations/clientFactory';
import { requireRole, requireManagerOrAbove, requireAnyAuthenticated } from '../middlewares/role-auth';

export default function mountIntegrationRoutes(app: Express) {
  
  // Get current integration status
  app.get('/api/integrations/me', requireAnyAuthenticated(), extractOrganizationId, async (req: IntegrationRequest, res: Response) => {
    try {
      const integration = await getIntegrationForOrg(req.organizationId!);
      
      if (!integration) {
        return res.json({ provider: null });
      }

      // Return integration info without sensitive credentials
      res.json({
        provider: integration.provider,
        authType: integration.authType,
        isActive: integration.isActive,
        connectedAt: integration.connectedAt,
        lastSyncAt: integration.lastSyncAt
      });
    } catch (error) {
      console.error('Error getting integration:', error);
      res.status(500).json({ error: 'Failed to get integration status' });
    }
  });

  // Connect a new integration
  app.post('/api/integrations/connect', requireManagerOrAbove(), extractOrganizationId, async (req: IntegrationRequest, res: Response) => {
    try {
      const { provider, authType, apiKey, accountId, accessToken } = req.body;

      if (!provider || !authType) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          message: 'Provider and authType are required' 
        });
      }

      // Validate provider is supported
      const supportedProviders = ['demo', 'hostaway'];
      if (!supportedProviders.includes(provider)) {
        return res.status(400).json({
          error: 'Unsupported provider',
          message: `Provider ${provider} is not supported. Supported: ${supportedProviders.join(', ')}`
        });
      }

      // Validate required credentials for provider
      if (provider === 'hostaway') {
        if (!accountId) {
          return res.status(400).json({
            error: 'Missing credentials',
            message: 'Hostaway requires accountId'
          });
        }
        if (!apiKey && !accessToken) {
          return res.status(400).json({
            error: 'Missing credentials', 
            message: 'Hostaway requires either apiKey or accessToken'
          });
        }
      }

      // Test the connection (skip for demo)
      if (provider !== 'demo') {
        try {
          // Create temporary integration for testing
          const tempIntegration = {
            provider,
            authType,
            apiKeyEnc: apiKey ? encrypt(apiKey) : undefined,
            accessTokenEnc: accessToken ? encrypt(accessToken) : undefined,
            accountId,
            isActive: true,
            connectedAt: new Date()
          };
          
          // Save temporarily to test
          await saveIntegration(req.organizationId!, tempIntegration);
          
          // Test connection using the client factory
          const client = await getPMSClient(req.organizationId!);
          const isValid = await (client as any).testConnection?.();
          
          if (isValid === false) {
            // Remove failed integration
            await removeIntegration(req.organizationId!);
            return res.status(400).json({
              error: 'Invalid credentials',
              message: `Could not connect to ${provider} with provided credentials`
            });
          }
        } catch (testError) {
          // Remove failed integration
          await removeIntegration(req.organizationId!);
          return res.status(400).json({
            error: 'Connection test failed',
            message: testError instanceof Error ? testError.message : 'Unknown error'
          });
        }
      }

      // Save the integration with encrypted credentials
      const integration = {
        provider,
        authType,
        apiKeyEnc: apiKey ? encrypt(apiKey) : undefined,
        accessTokenEnc: accessToken ? encrypt(accessToken) : undefined,
        accountId
      };

      await saveIntegration(req.organizationId!, integration);

      res.json({
        success: true,
        message: `Successfully connected to ${provider}`,
        provider: integration.provider,
        connectedAt: integration.connectedAt
      });
    } catch (error) {
      console.error('Error connecting integration:', error);
      res.status(500).json({ 
        error: 'Connection failed',
        message: 'Failed to connect integration'
      });
    }
  });

  // Disconnect integration
  app.delete('/api/integrations/disconnect', requireManagerOrAbove(), extractOrganizationId, async (req: IntegrationRequest, res: Response) => {
    try {
      await removeIntegration(req.organizationId!);
      res.json({ 
        success: true, 
        message: 'Integration disconnected successfully' 
      });
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      res.status(500).json({ error: 'Failed to disconnect integration' });
    }
  });

  // Test current integration
  app.post('/api/integrations/test', requireAnyAuthenticated(), extractOrganizationId, async (req: IntegrationRequest, res: Response) => {
    try {
      const integration = await getIntegrationForOrg(req.organizationId!);
      
      if (!integration) {
        return res.status(400).json({ 
          error: 'No integration configured',
          message: 'Please connect an integration first'
        });
      }

      let testResult = false;
      
      try {
        const client = await getPMSClient(req.organizationId!);
        testResult = await (client as any).testConnection?.() || false;
      } catch (error) {
        console.error('Connection test error:', error);
        testResult = false;
      }

      if (testResult) {
        // Update last sync timestamp would go here in full implementation
      }

      res.json({
        success: testResult,
        provider: integration.provider,
        message: testResult ? 'Connection successful' : 'Connection failed'
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      res.status(500).json({ error: 'Failed to test integration' });
    }
  });

  // Debug endpoint - list all integrations (remove in production)
  app.get('/api/integrations/debug', async (req: Request, res: Response) => {
    try {
      res.json({ message: 'Debug endpoint - file-based store', status: 'ok' });
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      res.status(500).json({ error: 'Debug failed' });
    }
  });
}