/**
 * Data Connectors for Captain Cortex AI
 * Read-only fetch helpers with timeout, retry, and orgId filtering
 */

import { storage } from '../storage';
import { logger } from '../logger';

export interface ConnectorOptions {
  organizationId: string;
  timeout?: number; // milliseconds
  maxRetries?: number;
}

export interface ConnectorResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  route: string;
  params: Record<string, any>;
  latency: number;
  fromCache?: boolean;
}

const DEFAULT_TIMEOUT = 3000; // 3 seconds
const DEFAULT_MAX_RETRIES = 2;

/**
 * Execute with timeout and retry logic
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  timeout: number = DEFAULT_TIMEOUT
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
      });
      
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Unknown error');
}

/**
 * Fetch properties
 */
export async function fetchProperties(
  options: ConnectorOptions & { name?: string; id?: number }
): Promise<ConnectorResult> {
  const startTime = Date.now();
  const route = '/api/properties';
  const params = { 
    organizationId: options.organizationId,
    name: options.name,
    id: options.id
  };
  
  try {
    const data = await executeWithRetry(async () => {
      if (options.id) {
        return await storage.getProperty(options.id, options.organizationId);
      } else if (options.name) {
        const allProperties = await storage.getAllProperties(options.organizationId);
        return allProperties.filter(p => 
          p.name.toLowerCase().includes(options.name!.toLowerCase())
        );
      } else {
        return await storage.getAllProperties(options.organizationId);
      }
    }, options.maxRetries, options.timeout);
    
    return {
      success: true,
      data,
      route,
      params,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    logger.error('[CORTEX] Property connector error:', error);
    return {
      success: false,
      error: error.message,
      route,
      params,
      latency: Date.now() - startTime
    };
  }
}

/**
 * Fetch utility bills
 */
export async function fetchUtilityBills(
  options: ConnectorOptions & { 
    propertyId?: number; 
    type?: string; 
    month?: string;
    year?: number;
  }
): Promise<ConnectorResult> {
  const startTime = Date.now();
  const route = '/api/utility-bills';
  const params = { 
    organizationId: options.organizationId,
    propertyId: options.propertyId,
    type: options.type,
    month: options.month,
    year: options.year
  };
  
  try {
    const data = await executeWithRetry(async () => {
      const allBills = await storage.getAllUtilityBills(options.organizationId);
      
      let filtered = allBills;
      
      if (options.propertyId) {
        filtered = filtered.filter(b => b.propertyId === options.propertyId);
      }
      
      if (options.type) {
        filtered = filtered.filter(b => 
          b.utilityType?.toLowerCase() === options.type?.toLowerCase()
        );
      }
      
      if (options.month && options.year) {
        filtered = filtered.filter(b => {
          const billDate = new Date(b.billMonth);
          return (
            billDate.getMonth() + 1 === parseInt(options.month!) &&
            billDate.getFullYear() === options.year
          );
        });
      }
      
      return filtered;
    }, options.maxRetries, options.timeout);
    
    return {
      success: true,
      data,
      route,
      params,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    logger.error('[CORTEX] Utility bill connector error:', error);
    return {
      success: false,
      error: error.message,
      route,
      params,
      latency: Date.now() - startTime
    };
  }
}

/**
 * Fetch tasks
 */
export async function fetchTasks(
  options: ConnectorOptions & { 
    status?: string; 
    assignedTo?: string; 
    propertyId?: number;
  }
): Promise<ConnectorResult> {
  const startTime = Date.now();
  const route = '/api/tasks';
  const params = { 
    organizationId: options.organizationId,
    status: options.status,
    assignedTo: options.assignedTo,
    propertyId: options.propertyId
  };
  
  try {
    const data = await executeWithRetry(async () => {
      const allTasks = await storage.getAllTasks(options.organizationId);
      
      let filtered = allTasks;
      
      if (options.status) {
        filtered = filtered.filter(t => t.status === options.status);
      }
      
      if (options.assignedTo) {
        filtered = filtered.filter(t => t.assignedTo === options.assignedTo);
      }
      
      if (options.propertyId) {
        filtered = filtered.filter(t => t.propertyId === options.propertyId);
      }
      
      return filtered;
    }, options.maxRetries, options.timeout);
    
    return {
      success: true,
      data,
      route,
      params,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    logger.error('[CORTEX] Task connector error:', error);
    return {
      success: false,
      error: error.message,
      route,
      params,
      latency: Date.now() - startTime
    };
  }
}

/**
 * Fetch bookings
 */
export async function fetchBookings(
  options: ConnectorOptions & { 
    propertyId?: number; 
    dateFrom?: string; 
    dateTo?: string;
  }
): Promise<ConnectorResult> {
  const startTime = Date.now();
  const route = '/api/bookings';
  const params = { 
    organizationId: options.organizationId,
    propertyId: options.propertyId,
    dateFrom: options.dateFrom,
    dateTo: options.dateTo
  };
  
  try {
    const data = await executeWithRetry(async () => {
      const allBookings = await storage.getAllBookings(options.organizationId);
      
      let filtered = allBookings;
      
      if (options.propertyId) {
        filtered = filtered.filter(b => b.propertyId === options.propertyId);
      }
      
      if (options.dateFrom && options.dateTo) {
        const from = new Date(options.dateFrom);
        const to = new Date(options.dateTo);
        
        filtered = filtered.filter(b => {
          const checkIn = new Date(b.checkInDate);
          const checkOut = new Date(b.checkOutDate);
          
          // Check if booking overlaps with the date range
          return checkIn <= to && checkOut >= from;
        });
      }
      
      return filtered;
    }, options.maxRetries, options.timeout);
    
    return {
      success: true,
      data,
      route,
      params,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    logger.error('[CORTEX] Booking connector error:', error);
    return {
      success: false,
      error: error.message,
      route,
      params,
      latency: Date.now() - startTime
    };
  }
}

/**
 * Fetch finances
 */
export async function fetchFinances(
  options: ConnectorOptions & { 
    type?: 'income' | 'expense'; 
    month?: string;
    year?: number;
  }
): Promise<ConnectorResult> {
  const startTime = Date.now();
  const route = '/api/finances';
  const params = { 
    organizationId: options.organizationId,
    type: options.type,
    month: options.month,
    year: options.year
  };
  
  try {
    const data = await executeWithRetry(async () => {
      const allFinances = await storage.getAllFinances(options.organizationId);
      
      let filtered = allFinances;
      
      if (options.type) {
        filtered = filtered.filter(f => f.type === options.type);
      }
      
      if (options.month && options.year) {
        filtered = filtered.filter(f => {
          const financeDate = new Date(f.date);
          return (
            financeDate.getMonth() + 1 === parseInt(options.month!) &&
            financeDate.getFullYear() === options.year
          );
        });
      }
      
      return filtered;
    }, options.maxRetries, options.timeout);
    
    return {
      success: true,
      data,
      route,
      params,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    logger.error('[CORTEX] Finance connector error:', error);
    return {
      success: false,
      error: error.message,
      route,
      params,
      latency: Date.now() - startTime
    };
  }
}
