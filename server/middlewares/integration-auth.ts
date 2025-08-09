import { Request, Response, NextFunction } from 'express';
import { integrationStore } from '../services/integrationStore';

export interface IntegrationRequest extends Request {
  integration?: any;
  organizationId?: string;
}

export function requireIntegration(provider?: string) {
  return async (req: IntegrationRequest, res: Response, next: NextFunction) => {
    try {
      // In a real app, extract organizationId from user session or token
      // For now, using a default organization
      const organizationId = req.organizationId || 'default-org';
      
      const integration = await integrationStore.getIntegration(organizationId);
      
      if (!integration) {
        return res.status(400).json({
          error: 'No integration configured',
          message: 'Please connect a PMS integration first'
        });
      }

      if (!integration.isActive) {
        return res.status(400).json({
          error: 'Integration inactive',
          message: 'PMS integration is not active'
        });
      }

      if (provider && integration.provider !== provider) {
        return res.status(400).json({
          error: 'Wrong provider',
          message: `Expected ${provider}, but ${integration.provider} is configured`
        });
      }

      req.integration = integration;
      req.organizationId = organizationId;
      next();
    } catch (error) {
      console.error('Integration auth error:', error);
      res.status(500).json({
        error: 'Integration error',
        message: 'Failed to verify integration'
      });
    }
  };
}

export function extractOrganizationId(req: IntegrationRequest, res: Response, next: NextFunction) {
  // In a real app, this would extract from JWT token or session
  // For demo purposes, using a default organization
  req.organizationId = 'default-org';
  next();
}