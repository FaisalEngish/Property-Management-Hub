import { Router } from 'express';
import { db } from './db';
import { organizationApiKeys, properties } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { getRentCastService } from './rentcast-service';

const router = Router();

/**
 * Multi-tenant API key loader for RentCast
 * Loads from database per organization, with env var fallback for testing
 * 
 * PRODUCTION SECURITY NOTE:
 * - API keys in database should be encrypted at rest (AES-256)
 * - Use secure key management service (AWS KMS, HashiCorp Vault, etc.)
 * - Implement key rotation policies
 */
async function getRentCastApiKey(organizationId: string): Promise<string> {
  try {
    // Load from database - keys stored in encryptedValue field (plaintext for dev, encrypted for production)
    const result = await db
      .select()
      .from(organizationApiKeys)
      .where(
        and(
          eq(organizationApiKeys.organizationId, organizationId),
          eq(organizationApiKeys.provider, 'rentcast'),
          eq(organizationApiKeys.isActive, true)
        )
      )
      .limit(1);

    if (result.length > 0 && result[0].encryptedValue) {
      // TODO PRODUCTION: Decrypt the value using secure key management
      // Currently storing plaintext for development - MUST encrypt before production deployment
      console.log(`[RentCast] Using database API key for organization: ${organizationId}`);
      return result[0].encryptedValue;
    }

    // Fallback to environment variable (testing/development only)
    const envKey = process.env.RENTCAST_API_KEY;
    if (envKey) {
      console.warn(`[RentCast] WARNING: Using fallback environment variable for org ${organizationId}. Configure org-specific key in production.`);
      return envKey;
    }

    throw new Error('RentCast API key not configured. Please add it in API Connections settings.');
  } catch (error) {
    console.error('[RentCast] Error loading API key:', error);
    throw error;
  }
}

/**
 * Test RentCast API connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const result = await rentcast.testConnection();
    res.json(result);
  } catch (error: any) {
    console.error('[RentCast API] Test connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to test connection' 
    });
  }
});

/**
 * Search properties by address, city, state, or zip
 */
router.get('/properties/search', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const properties = await rentcast.searchProperties({
      address: req.query.address as string,
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      propertyType: req.query.propertyType as string,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
    });

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error: any) {
    console.error('[RentCast API] Property search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search properties',
    });
  }
});

/**
 * Get property details by ID
 */
router.get('/properties/:id', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const property = await rentcast.getProperty(req.params.id);

    res.json({
      success: true,
      property,
    });
  } catch (error: any) {
    console.error('[RentCast API] Get property error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get property',
    });
  }
});

/**
 * Get rent estimate (AVM) for a property
 */
router.get('/avm/rent', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const estimate = await rentcast.getRentEstimate({
      address: req.query.address as string,
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      propertyType: req.query.propertyType as string,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
      squareFootage: req.query.squareFootage ? parseInt(req.query.squareFootage as string) : undefined,
      compCount: req.query.compCount ? parseInt(req.query.compCount as string) : 10,
    });

    res.json({
      success: true,
      estimate,
    });
  } catch (error: any) {
    console.error('[RentCast API] Rent estimate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rent estimate',
    });
  }
});

/**
 * Get home value estimate (AVM)
 */
router.get('/avm/value', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const estimate = await rentcast.getValueEstimate({
      address: req.query.address as string,
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      propertyType: req.query.propertyType as string,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
      squareFootage: req.query.squareFootage ? parseInt(req.query.squareFootage as string) : undefined,
      compCount: req.query.compCount ? parseInt(req.query.compCount as string) : 10,
    });

    res.json({
      success: true,
      estimate,
    });
  } catch (error: any) {
    console.error('[RentCast API] Value estimate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get value estimate',
    });
  }
});

/**
 * Search long-term rental listings
 */
router.get('/listings/rental', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const listings = await rentcast.searchRentalListings({
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      propertyType: req.query.propertyType as string,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
    });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    console.error('[RentCast API] Rental listings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search rental listings',
    });
  }
});

/**
 * Get specific rental listing
 */
router.get('/listings/rental/:id', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const listing = await rentcast.getRentalListing(req.params.id);

    res.json({
      success: true,
      listing,
    });
  } catch (error: any) {
    console.error('[RentCast API] Get rental listing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rental listing',
    });
  }
});

/**
 * Search for-sale listings
 */
router.get('/listings/sale', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const listings = await rentcast.searchSaleListings({
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      propertyType: req.query.propertyType as string,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
    });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    console.error('[RentCast API] Sale listings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search sale listings',
    });
  }
});

/**
 * Get specific sale listing
 */
router.get('/listings/sale/:id', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const listing = await rentcast.getSaleListing(req.params.id);

    res.json({
      success: true,
      listing,
    });
  } catch (error: any) {
    console.error('[RentCast API] Get sale listing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sale listing',
    });
  }
});

/**
 * Get market data by zip code
 */
router.get('/markets', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const marketData = await rentcast.getMarketData({
      zipCode: req.query.zipCode as string,
      city: req.query.city as string,
      state: req.query.state as string,
    });

    res.json({
      success: true,
      marketData,
    });
  } catch (error: any) {
    console.error('[RentCast API] Market data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get market data',
    });
  }
});

/**
 * Property Enrichment - Fetch rental estimate for a specific property
 * Use property address and details to get automated valuation model (AVM) data
 */
router.post('/enrich-property', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const { address, city, state, zipCode, propertyType, bedrooms, bathrooms, squareFootage } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Property address is required for enrichment',
      });
    }

    // Fetch both rent estimate and value estimate in parallel
    const [rentEstimate, valueEstimate] = await Promise.allSettled([
      rentcast.getRentEstimate({
        address,
        city,
        state,
        zipCode,
        propertyType,
        bedrooms,
        bathrooms,
        squareFootage,
        compCount: 5, // Get 5 comparables
      }),
      rentcast.getValueEstimate({
        address,
        city,
        state,
        zipCode,
        propertyType,
        bedrooms,
        bathrooms,
        squareFootage,
        compCount: 5,
      }),
    ]);

    const enrichmentData: any = {
      success: true,
      address,
      timestamp: new Date().toISOString(),
    };

    // Add rent estimate data if successful
    if (rentEstimate.status === 'fulfilled') {
      enrichmentData.rentEstimate = {
        estimatedRent: rentEstimate.value.price,
        rentRangeLow: rentEstimate.value.priceRangeLow,
        rentRangeHigh: rentEstimate.value.priceRangeHigh,
        comparablesCount: rentEstimate.value.comparables?.length || 0,
        comparables: rentEstimate.value.comparables?.slice(0, 5), // Top 5 comparables
      };
    } else {
      enrichmentData.rentEstimateError = (rentEstimate.reason as Error).message;
    }

    // Add value estimate data if successful
    if (valueEstimate.status === 'fulfilled') {
      enrichmentData.valueEstimate = {
        estimatedValue: valueEstimate.value.price,
        valueRangeLow: valueEstimate.value.priceRangeLow,
        valueRangeHigh: valueEstimate.value.priceRangeHigh,
        comparablesCount: valueEstimate.value.comparables?.length || 0,
        comparables: valueEstimate.value.comparables?.slice(0, 5), // Top 5 comparables
      };
    } else {
      enrichmentData.valueEstimateError = (valueEstimate.reason as Error).message;
    }

    res.json(enrichmentData);
  } catch (error: any) {
    console.error('[RentCast API] Property enrichment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enrich property data',
    });
  }
});

/**
 * Auto Property Enrichment - Fetch rental estimates for all organization properties
 * GET endpoint for easy integration with React Query
 */
router.get('/enrich-properties', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    // Fetch all properties for the organization from database
    const propertyList = await db
      .select()
      .from(properties)
      .where(eq(properties.organizationId, organizationId));

    if (!Array.isArray(propertyList) || propertyList.length === 0) {
      return res.json({});
    }

    // Enrich each property with rate limiting (max 50)
    const propertiesToEnrich = propertyList.slice(0, 50);
    const enrichedProperties = await Promise.allSettled(
      propertiesToEnrich.map(async (prop: any) => {
        try {
          const rentEstimate = await rentcast.getRentEstimate({
            address: prop.address,
            city: prop.address?.split(',')[1]?.trim(),
            state: prop.address?.split(',')[2]?.trim(),
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            compCount: 3,
          });

          return {
            propertyId: prop.id,
            rent: rentEstimate.price,
            rentRangeLow: rentEstimate.priceRangeLow,
            rentRangeHigh: rentEstimate.priceRangeHigh,
          };
        } catch (error) {
          console.warn(`[RentCast] Failed to enrich property ${prop.id}:`, error);
          return null;
        }
      })
    );

    // Build result object keyed by property ID
    const results: Record<number, any> = {};
    enrichedProperties.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results[result.value.propertyId] = result.value;
      }
    });

    res.json(results);
  } catch (error: any) {
    console.error('[RentCast API] Auto enrichment error:', error);
    // Return empty object on error to avoid breaking the UI
    res.json({});
  }
});

/**
 * Bulk Property Enrichment - Fetch rental estimates for multiple properties
 * Useful for enriching entire portfolio at once
 */
router.post('/enrich-properties-bulk', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const { properties } = req.body;

    if (!Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Properties array is required',
      });
    }

    if (properties.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 properties can be enriched at once',
      });
    }

    // Enrich each property with rate limiting
    const enrichedProperties = await Promise.allSettled(
      properties.map(async (prop: any) => {
        const rentEstimate = await rentcast.getRentEstimate({
          address: prop.address,
          city: prop.city,
          state: prop.state,
          zipCode: prop.zipCode,
          propertyType: prop.propertyType,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareFootage: prop.squareFootage,
          compCount: 3,
        });

        return {
          propertyId: prop.id,
          address: prop.address,
          estimatedRent: rentEstimate.price,
          rentRangeLow: rentEstimate.priceRangeLow,
          rentRangeHigh: rentEstimate.priceRangeHigh,
        };
      })
    );

    const results = enrichedProperties.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          propertyId: properties[index].id,
          address: properties[index].address,
          error: (result.reason as Error).message,
        };
      }
    });

    res.json({
      success: true,
      totalProperties: properties.length,
      successCount: results.filter(r => !('error' in r)).length,
      failureCount: results.filter(r => 'error' in r).length,
      results,
    });
  } catch (error: any) {
    console.error('[RentCast API] Bulk enrichment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enrich properties',
    });
  }
});

export default router;
