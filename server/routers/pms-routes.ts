import { Express, Response } from 'express';
import { requireIntegration, IntegrationRequest } from '../middlewares/integration-auth';
import { HostawayClient } from '../integrations/hostaway';

export default function mountPmsRoutes(app: Express) {

  // Get all listings from connected PMS
  app.get('/api/pms/listings', requireIntegration(), async (req: IntegrationRequest, res: Response) => {
    try {
      const { integration } = req;
      
      if (integration.provider === 'hostaway') {
        const client = new HostawayClient(integration.credentials as { apiKey: string; accountId: string });
        const listings = await client.getListings();
        
        res.json({
          success: true,
          provider: integration.provider,
          listings
        });
      } else {
        res.status(400).json({
          error: 'Unsupported provider',
          message: `Provider ${integration.provider} is not supported yet`
        });
      }
    } catch (error) {
      console.error('Error fetching PMS listings:', error);
      res.status(500).json({
        error: 'Failed to fetch listings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get availability for a specific listing
  app.get('/api/pms/availability', requireIntegration(), async (req: IntegrationRequest, res: Response) => {
    try {
      const { listingId, start, end } = req.query;
      const { integration } = req;

      if (!listingId || !start || !end) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'listingId, start, and end parameters are required'
        });
      }

      if (integration.provider === 'hostaway') {
        const client = new HostawayClient(integration.credentials as { apiKey: string; accountId: string });
        const availability = await client.getAvailability(
          parseInt(listingId as string),
          start as string,
          end as string
        );
        
        res.json({
          success: true,
          provider: integration.provider,
          listingId: parseInt(listingId as string),
          period: { start, end },
          availability
        });
      } else {
        res.status(400).json({
          error: 'Unsupported provider',
          message: `Provider ${integration.provider} is not supported yet`
        });
      }
    } catch (error) {
      console.error('Error fetching PMS availability:', error);
      res.status(500).json({
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync all data from PMS (future feature)
  app.post('/api/pms/sync', requireIntegration(), async (req: IntegrationRequest, res: Response) => {
    try {
      const { integration, organizationId } = req;
      
      // This would sync all listings, bookings, availability etc.
      // For now, just update the last sync time
      
      res.json({
        success: true,
        message: `Sync initiated for ${integration.provider}`,
        provider: integration.provider,
        syncedAt: new Date()
      });
    } catch (error) {
      console.error('Error syncing PMS data:', error);
      res.status(500).json({
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sync status
  app.get('/api/pms/sync-status', requireIntegration(), async (req: IntegrationRequest, res: Response) => {
    try {
      const { integration } = req;
      
      res.json({
        provider: integration.provider,
        lastSyncAt: integration.lastSyncAt || null,
        isActive: integration.isActive,
        connectedAt: integration.connectedAt
      });
    } catch (error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}