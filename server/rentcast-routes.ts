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
 * Search market by City/State - Get comprehensive market intelligence for a location
 * Returns properties, market data, and rental listings for the specified city/state
 */
router.get('/market/search', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const city = req.query.city as string;
    const state = req.query.state as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!city || !state) {
      return res.status(400).json({
        success: false,
        message: 'City and state are required parameters',
      });
    }

    console.log(`[RentCast] Market search: ${city}, ${state}`);

    // Fetch comprehensive market data in parallel
    const [properties, marketData, rentalListings] = await Promise.allSettled([
      // 1. Search properties in the area
      rentcast.searchProperties({
        city,
        state,
        limit,
      }),
      
      // 2. Get market statistics
      rentcast.getMarketData({
        city,
        state,
      }),
      
      // 3. Get rental listings
      rentcast.searchRentalListings({
        city,
        state,
        limit,
      }),
    ]);

    const response: any = {
      city,
      state,
      searchedAt: new Date().toISOString(),
    };

    // Properties
    if (properties.status === 'fulfilled' && properties.value.length > 0) {
      response.properties = properties.value.map((prop: any) => ({
        id: prop.id,
        address: prop.formattedAddress,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zipCode,
        propertyType: prop.propertyType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFootage: prop.squareFootage,
        lotSize: prop.lotSize,
        yearBuilt: prop.yearBuilt,
        lastSalePrice: prop.lastSalePrice,
        lastSaleDate: prop.lastSaleDate,
        assessedValue: prop.assessedValue,
        latitude: prop.latitude,
        longitude: prop.longitude,
      }));
      response.propertiesCount = properties.value.length;
    } else {
      response.properties = [];
      response.propertiesCount = 0;
    }

    // Market data
    if (marketData.status === 'fulfilled') {
      response.marketData = {
        averageRent: marketData.value.averageRent,
        medianRent: marketData.value.medianRent,
        averagePrice: marketData.value.averagePrice,
        medianPrice: marketData.value.medianPrice,
        totalListings: marketData.value.listings?.total,
        forSale: marketData.value.listings?.forSale,
        forRent: marketData.value.listings?.forRent,
        trends: marketData.value.trends,
      };
    }

    // Rental listings
    if (rentalListings.status === 'fulfilled' && rentalListings.value.length > 0) {
      response.rentalListings = rentalListings.value.map((listing: any) => ({
        id: listing.id,
        address: listing.formattedAddress,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        price: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        propertyType: listing.propertyType,
        daysOnMarket: listing.daysOnMarket,
        status: listing.status,
      }));
      response.rentalListingsCount = rentalListings.value.length;
    } else {
      response.rentalListings = [];
      response.rentalListingsCount = 0;
    }

    console.log(`[RentCast] Market search complete: ${response.propertiesCount} properties, ${response.rentalListingsCount} listings`);
    res.json(response);
  } catch (error: any) {
    console.error('[RentCast API] Market search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search market',
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
/**
 * Get comprehensive property enrichment data by property ID
 * Returns detailed rent/value estimates, comparables, nearby listings, and market data
 */
router.get('/properties/:id/enrich', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const propertyId = req.params.id;

    // First, get the basic property data
    const property = await rentcast.getProperty(propertyId);

    // Fetch comprehensive enrichment data in parallel
    const [rentEstimate, valueEstimate, rentalListings, marketData] = await Promise.allSettled([
      // 1. Rent Estimate (AVM)
      rentcast.getRentEstimate({
        address: property.formattedAddress,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        compCount: 5,
      }),
      
      // 2. Value Estimate (AVM)
      rentcast.getValueEstimate({
        address: property.formattedAddress,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        compCount: 5,
      }),
      
      // 3. Nearby Rental Listings
      rentcast.searchRentalListings({
        city: property.city,
        state: property.state,
        bedrooms: property.bedrooms,
        limit: 5,
      }),
      
      // 4. Market Data
      rentcast.getMarketData({
        city: property.city,
        state: property.state,
      }),
    ]);

    const enrichmentData: any = {
      propertyId,
      lastUpdated: new Date().toISOString(),
      propertyDetails: {
        id: property.id,
        formattedAddress: property.formattedAddress,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        county: property.county,
        propertyType: property.propertyType,
        squareFootage: property.squareFootage,
        lotSize: property.lotSize,
        yearBuilt: property.yearBuilt,
        lastSaleDate: property.lastSaleDate,
        lastSalePrice: property.lastSalePrice,
        assessedValue: property.assessedValue,
      },
    };

    // Rent estimate data
    if (rentEstimate.status === 'fulfilled') {
      enrichmentData.rentEstimate = {
        estimatedRent: rentEstimate.value.price,
        rentRangeLow: rentEstimate.value.priceRangeLow,
        rentRangeHigh: rentEstimate.value.priceRangeHigh,
        comparablesCount: rentEstimate.value.comparables?.length || 0,
        comparables: rentEstimate.value.comparables?.slice(0, 5),
      };
    }

    // Value estimate data
    if (valueEstimate.status === 'fulfilled') {
      enrichmentData.valueEstimate = {
        estimatedValue: valueEstimate.value.price,
        valueRangeLow: valueEstimate.value.priceRangeLow,
        valueRangeHigh: valueEstimate.value.priceRangeHigh,
        comparablesCount: valueEstimate.value.comparables?.length || 0,
        comparables: valueEstimate.value.comparables?.slice(0, 5),
      };
    }

    // Nearby rental listings
    if (rentalListings.status === 'fulfilled' && rentalListings.value.length > 0) {
      enrichmentData.nearbyRentals = {
        count: rentalListings.value.length,
        listings: rentalListings.value.slice(0, 5).map((listing: any) => ({
          address: listing.formattedAddress,
          price: listing.price,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          squareFootage: listing.squareFootage,
          daysOnMarket: listing.daysOnMarket,
        })),
      };
    }

    // Market data
    if (marketData.status === 'fulfilled') {
      enrichmentData.marketData = {
        averageRent: marketData.value.averageRent,
        medianRent: marketData.value.medianRent,
        averagePrice: marketData.value.averagePrice,
        medianPrice: marketData.value.medianPrice,
        inventoryCount: marketData.value.listings?.total,
      };
    }

    res.json(enrichmentData);
  } catch (error: any) {
    console.error('[RentCast API] Property enrichment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enrich property',
    });
  }
});

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
/**
 * Get comprehensive rental listing enrichment data by listing ID
 * Returns detailed listing info, comparable listings, and market data
 */
router.get('/listings/rental/:id/enrich', async (req, res) => {
  try {
    const organizationId = (req.user as any)?.organizationId || 'default-org';
    const apiKey = await getRentCastApiKey(organizationId);
    const rentcast = getRentCastService(apiKey, organizationId);
    
    const listingId = req.params.id;

    // Get the rental listing details
    const listing = await rentcast.getRentalListing(listingId);

    // Fetch comprehensive enrichment data in parallel
    const [comparableListings, marketData, valueEstimate] = await Promise.allSettled([
      // 1. Comparable rental listings
      rentcast.searchRentalListings({
        city: listing.city,
        state: listing.state,
        bedrooms: listing.bedrooms,
        limit: 5,
      }),
      
      // 2. Market data
      rentcast.getMarketData({
        city: listing.city,
        state: listing.state,
      }),
      
      // 3. Property value estimate (if we have the address)
      listing.formattedAddress ? rentcast.getValueEstimate({
        address: listing.formattedAddress,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        compCount: 5,
      }) : Promise.reject(new Error('No address for value estimate')),
    ]);

    const enrichmentData: any = {
      listingId,
      lastUpdated: new Date().toISOString(),
      listingDetails: {
        id: listing.id,
        address: listing.formattedAddress,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        price: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        propertyType: listing.propertyType,
        daysOnMarket: listing.daysOnMarket,
        status: listing.status,
        listedDate: listing.listedDate,
      },
    };

    // Comparable listings
    if (comparableListings.status === 'fulfilled' && comparableListings.value.length > 0) {
      enrichmentData.comparableListings = comparableListings.value
        .filter((comp: any) => comp.id !== listingId) // Exclude the current listing
        .slice(0, 5)
        .map((comp: any) => ({
          address: comp.formattedAddress,
          price: comp.price,
          bedrooms: comp.bedrooms,
          bathrooms: comp.bathrooms,
          squareFootage: comp.squareFootage,
          daysOnMarket: comp.daysOnMarket,
        }));
    }

    // Market data
    if (marketData.status === 'fulfilled') {
      enrichmentData.marketData = {
        averageRent: marketData.value.averageRent,
        medianRent: marketData.value.medianRent,
        averagePrice: marketData.value.averagePrice,
        medianPrice: marketData.value.medianPrice,
        inventoryCount: marketData.value.listings?.total,
      };
    }

    // Value estimate
    if (valueEstimate.status === 'fulfilled') {
      enrichmentData.valueEstimate = {
        estimatedValue: valueEstimate.value.price,
        valueRangeLow: valueEstimate.value.priceRangeLow,
        valueRangeHigh: valueEstimate.value.priceRangeHigh,
      };
    }

    res.json(enrichmentData);
  } catch (error: any) {
    console.error('[RentCast API] Listing enrichment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enrich listing',
    });
  }
});

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
 * Auto Property Enrichment - Fetch ALL RentCast data for all organization properties
 * GET endpoint for easy integration with React Query
 * Returns: rent/value estimates, property details, comparables, nearby listings, market data
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

    // Enrich each property with comprehensive RentCast data (max 10 properties to respect API limits)
    const propertiesToEnrich = propertyList.slice(0, 10);
    const enrichedProperties = await Promise.allSettled(
      propertiesToEnrich.map(async (prop: any) => {
        try {
          // Parse address for better API calls
          const addressParts = prop.address?.split(',').map((part: string) => part.trim()) || [];
          
          // Fetch ALL RentCast data in parallel
          const [rentEstimate, valueEstimate, propertySearch, rentalListings, marketData] = await Promise.allSettled([
            // 1. Rent Estimate (AVM)
            rentcast.getRentEstimate({
              address: prop.address,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              compCount: 5,
            }),
            
            // 2. Value Estimate (AVM)
            rentcast.getValueEstimate({
              address: prop.address,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              compCount: 5,
            }),
            
            // 3. Property Details (search to get full property data)
            rentcast.searchProperties({
              address: prop.address,
              limit: 1,
            }),
            
            // 4. Nearby Rental Listings (comparables)
            addressParts.length >= 2 ? rentcast.searchRentalListings({
              city: addressParts[1],
              state: addressParts[2]?.split(' ')[0], // Extract state abbreviation
              bedrooms: prop.bedrooms,
              limit: 5,
            }) : Promise.reject(new Error('Insufficient address data for listings')),
            
            // 5. Market Data (if we have city/state)
            addressParts.length >= 3 ? rentcast.getMarketData({
              city: addressParts[1],
              state: addressParts[2]?.split(' ')[0], // Extract state abbreviation
            }) : Promise.reject(new Error('Insufficient address data for market stats')),
          ]);

          // Build comprehensive enrichment object
          const enrichmentData: any = {
            propertyId: prop.id,
            lastUpdated: new Date().toISOString(),
          };

          // Rent estimate data
          if (rentEstimate.status === 'fulfilled') {
            enrichmentData.rentEstimate = {
              estimatedRent: rentEstimate.value.price,
              rentRangeLow: rentEstimate.value.priceRangeLow,
              rentRangeHigh: rentEstimate.value.priceRangeHigh,
              latitude: rentEstimate.value.latitude,
              longitude: rentEstimate.value.longitude,
              comparablesCount: rentEstimate.value.comparables?.length || 0,
              comparables: rentEstimate.value.comparables?.slice(0, 3),
            };
          }

          // Value estimate data
          if (valueEstimate.status === 'fulfilled') {
            enrichmentData.valueEstimate = {
              estimatedValue: valueEstimate.value.price,
              valueRangeLow: valueEstimate.value.priceRangeLow,
              valueRangeHigh: valueEstimate.value.priceRangeHigh,
              comparablesCount: valueEstimate.value.comparables?.length || 0,
              comparables: valueEstimate.value.comparables?.slice(0, 3),
            };
          }

          // Property details
          if (propertySearch.status === 'fulfilled' && propertySearch.value.length > 0) {
            const propDetails = propertySearch.value[0];
            enrichmentData.propertyDetails = {
              id: propDetails.id,
              formattedAddress: propDetails.formattedAddress,
              city: propDetails.city,
              state: propDetails.state,
              zipCode: propDetails.zipCode,
              county: propDetails.county,
              propertyType: propDetails.propertyType,
              squareFootage: propDetails.squareFootage,
              lotSize: propDetails.lotSize,
              yearBuilt: propDetails.yearBuilt,
              lastSaleDate: propDetails.lastSaleDate,
              lastSalePrice: propDetails.lastSalePrice,
              assessedValue: propDetails.assessedValue,
              taxAmount: propDetails.taxAmount,
            };
          }

          // Nearby rental listings
          if (rentalListings.status === 'fulfilled') {
            enrichmentData.nearbyRentals = {
              count: rentalListings.value.length,
              listings: rentalListings.value.slice(0, 3).map((listing: any) => ({
                address: listing.formattedAddress,
                price: listing.price,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                squareFootage: listing.squareFootage,
                daysOnMarket: listing.daysOnMarket,
              })),
            };
          }

          // Market data
          if (marketData.status === 'fulfilled') {
            enrichmentData.marketData = {
              averageRent: marketData.value.averageRent,
              medianRent: marketData.value.medianRent,
              averagePrice: marketData.value.averagePrice,
              medianPrice: marketData.value.medianPrice,
              inventoryCount: marketData.value.listings?.total,
            };
          }

          return enrichmentData;
        } catch (error) {
          console.warn(`[RentCast] Failed to enrich property ${prop.id}:`, error);
          return null;
        }
      })
    );

    // Build result object keyed by property ID
    const results: Record<number, any> = {};
    enrichedProperties.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results[result.value.propertyId] = result.value;
      }
    });

    console.log(`[RentCast] Enriched ${Object.keys(results).length} properties with comprehensive data`);
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
