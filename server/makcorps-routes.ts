import { Router, Request, Response } from 'express';
import { getMakcorpsService } from './makcorps-service';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { organizationApiKeys } from '@shared/schema';

const router = Router();

// Helper function to get organization from session
function getOrgId(req: Request): string {
  return (req.user as any)?.organizationId || 'default-org';
}

// Helper function to get Makcorps API key for organization
async function getMakcorpsApiKey(organizationId: string): Promise<string> {
  // PRODUCTION SECURITY REQUIREMENTS:
  // 1. API keys MUST be encrypted at rest using strong encryption (AES-256)
  // 2. Decryption keys MUST be stored in secure key management (e.g., AWS KMS, HashiCorp Vault)
  // 3. Fallback environment variable should ONLY be used in development/testing
  // 4. Each organization MUST have unique organizationId (never use 'default-org' in production)
  
  // First, try to get from organization API keys table
  const apiKeyRecord = await db.select()
    .from(organizationApiKeys)
    .where(
      and(
        eq(organizationApiKeys.organizationId, organizationId),
        eq(organizationApiKeys.provider, 'makcorps'),
        eq(organizationApiKeys.isActive, true)
      )
    )
    .limit(1);

  if (apiKeyRecord.length > 0 && apiKeyRecord[0].encryptedValue) {
    // TODO PRODUCTION: Decrypt the value using secure key management
    // Currently storing plaintext for development - MUST encrypt before production deployment
    console.log(`[Makcorps] Using database API key for organization: ${organizationId}`);
    return apiKeyRecord[0].encryptedValue;
  }

  // Fallback to environment variable for testing/development ONLY
  const envKey = process.env.MAKCORPS_API_KEY;
  if (envKey) {
    console.log(`[Makcorps] WARNING: Using fallback environment variable for org ${organizationId}. Configure org-specific key in production.`);
    return envKey;
  }

  throw new Error('Makcorps API key not configured. Please add it in API Connections settings.');
}

/**
 * Test Makcorps API connection
 */
router.get('/makcorps/test-connection', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    const result = await makcorps.testConnection();
    
    console.log('[Makcorps API] Connection test:', result);
    
    res.json(result);
  } catch (error: any) {
    console.error('[Makcorps API] Test connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Connection test failed' 
    });
  }
});

/**
 * Search for hotel or city IDs using the Mapping API
 */
router.get('/makcorps/mapping', async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: name',
      });
    }

    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    const results = await makcorps.searchMapping(name);
    
    console.log(`[Makcorps API] Mapping search for "${name}": Found ${results.length} results`);
    
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('[Makcorps API] Mapping search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to search mapping' 
    });
  }
});

/**
 * Search hotels by city ID with pricing comparison
 */
router.get('/makcorps/search-by-city', async (req: Request, res: Response) => {
  try {
    const { cityId, checkin, checkout, adults, rooms, currency, pagination, kids } = req.query;
    
    // Validate required parameters
    if (!cityId || !checkin || !checkout || !adults || !rooms || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: cityId, checkin, checkout, adults, rooms, currency',
      });
    }

    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    
    const results = await makcorps.searchByCity({
      cityId: cityId as string,
      checkin: checkin as string,
      checkout: checkout as string,
      adults: parseInt(adults as string),
      rooms: parseInt(rooms as string),
      currency: currency as string,
      pagination: pagination ? parseInt(pagination as string) : 0,
      kids: kids ? parseInt(kids as string) : 0,
    });
    
    console.log(`[Makcorps API] City search: Found ${results.length} hotels`);
    
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('[Makcorps API] City search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to search by city' 
    });
  }
});

/**
 * Get pricing for a specific hotel from 15+ vendors
 */
router.get('/makcorps/search-by-hotel', async (req: Request, res: Response) => {
  try {
    const { hotelId, checkin, checkout, adults, rooms, currency } = req.query;
    
    // Validate required parameters
    if (!hotelId || !checkin || !checkout || !adults || !rooms || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: hotelId, checkin, checkout, adults, rooms, currency',
      });
    }

    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    
    const result = await makcorps.searchByHotel({
      hotelId: hotelId as string,
      checkin: checkin as string,
      checkout: checkout as string,
      adults: parseInt(adults as string),
      rooms: parseInt(rooms as string),
      currency: currency as string,
    });
    
    console.log(`[Makcorps API] Hotel search: Found pricing data`);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Makcorps API] Hotel search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to search by hotel' 
    });
  }
});

/**
 * Get Booking.com specific pricing data
 */
router.get('/makcorps/booking-prices', async (req: Request, res: Response) => {
  try {
    const { country, hotelId, checkin, checkout, adults, rooms, currency, kids } = req.query;
    
    // Validate required parameters
    if (!country || !hotelId || !checkin || !checkout || !adults || !rooms || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: country, hotelId, checkin, checkout, adults, rooms, currency',
      });
    }

    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    
    const results = await makcorps.getBookingPrices({
      country: country as string,
      hotelId: hotelId as string,
      checkin: checkin as string,
      checkout: checkout as string,
      adults: parseInt(adults as string),
      rooms: parseInt(rooms as string),
      currency: currency as string,
      kids: kids ? parseInt(kids as string) : 0,
    });
    
    console.log(`[Makcorps API] Booking.com search: Found ${results.length} room options`);
    
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('[Makcorps API] Booking.com search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get Booking.com prices' 
    });
  }
});

/**
 * Get Expedia specific pricing data
 */
router.get('/makcorps/expedia-prices', async (req: Request, res: Response) => {
  try {
    const { hotelId, checkin, checkout, adults, rooms, currency, kids } = req.query;
    
    // Validate required parameters
    if (!hotelId || !checkin || !checkout || !adults || !rooms || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: hotelId, checkin, checkout, adults, rooms, currency',
      });
    }

    const orgId = getOrgId(req);
    const apiKey = await getMakcorpsApiKey(orgId);
    const makcorps = getMakcorpsService(apiKey, orgId);
    
    const results = await makcorps.getExpediaPrices({
      hotelId: hotelId as string,
      checkin: checkin as string,
      checkout: checkout as string,
      adults: parseInt(adults as string),
      rooms: parseInt(rooms as string),
      currency: currency as string,
      kids: kids ? parseInt(kids as string) : 0,
    });
    
    console.log(`[Makcorps API] Expedia search: Found pricing data`);
    
    res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('[Makcorps API] Expedia search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get Expedia prices' 
    });
  }
});

export default router;
