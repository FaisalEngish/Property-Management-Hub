/**
 * Data Grounder for Captain Cortex AI
 * Merges and normalizes data from multiple connectors
 */

import { DetectedIntent } from './intent';
import { ExtractedEntities } from './extract';
import { 
  fetchProperties, 
  fetchUtilityBills, 
  fetchTasks, 
  fetchBookings, 
  fetchFinances,
  ConnectorResult 
} from './connectors';
import { logger } from '../logger';

export interface GroundedData {
  properties?: any[];
  utilityBills?: any[];
  tasks?: any[];
  bookings?: any[];
  finances?: any[];
  metadata: {
    sources: Array<{
      route: string;
      params: Record<string, any>;
      success: boolean;
      latency: number;
    }>;
    totalLatency: number;
    cacheHit: boolean;
  };
}

/**
 * Ground the question with real data from the database
 */
export async function groundQuestion(
  intent: DetectedIntent,
  entities: ExtractedEntities,
  organizationId: string
): Promise<GroundedData> {
  const startTime = Date.now();
  const sources: GroundedData['metadata']['sources'] = [];
  const groundedData: GroundedData = {
    metadata: {
      sources: [],
      totalLatency: 0,
      cacheHit: false
    }
  };

  try {
    // Fetch property data if property name is mentioned or property query
    if (entities.propertyName || intent.type === 'property_query') {
      const propertyResult = await fetchProperties({
        organizationId,
        name: entities.propertyName
      });
      
      sources.push({
        route: propertyResult.route,
        params: propertyResult.params,
        success: propertyResult.success,
        latency: propertyResult.latency
      });
      
      if (propertyResult.success && propertyResult.data) {
        groundedData.properties = Array.isArray(propertyResult.data) 
          ? propertyResult.data 
          : [propertyResult.data];
        
        // Extract propertyId for other queries
        if (groundedData.properties.length === 1) {
          entities.propertyId = groundedData.properties[0].id;
        }
      }
    }

    // Fetch utility bills if utility query
    if (intent.type === 'utility_query' || entities.utilityType) {
      const utilityResult = await fetchUtilityBills({
        organizationId,
        propertyId: entities.propertyId,
        type: entities.utilityType,
        month: entities.month,
        year: entities.year
      });
      
      sources.push({
        route: utilityResult.route,
        params: utilityResult.params,
        success: utilityResult.success,
        latency: utilityResult.latency
      });
      
      if (utilityResult.success) {
        groundedData.utilityBills = utilityResult.data || [];
      }
    }

    // Fetch tasks if task query
    if (intent.type === 'task_query') {
      const taskResult = await fetchTasks({
        organizationId,
        status: entities.status,
        propertyId: entities.propertyId
      });
      
      sources.push({
        route: taskResult.route,
        params: taskResult.params,
        success: taskResult.success,
        latency: taskResult.latency
      });
      
      if (taskResult.success) {
        groundedData.tasks = taskResult.data || [];
      }
    }

    // Fetch bookings if booking query
    if (intent.type === 'booking_query') {
      const bookingResult = await fetchBookings({
        organizationId,
        propertyId: entities.propertyId,
        dateFrom: entities.dateFrom,
        dateTo: entities.dateTo
      });
      
      sources.push({
        route: bookingResult.route,
        params: bookingResult.params,
        success: bookingResult.success,
        latency: bookingResult.latency
      });
      
      if (bookingResult.success) {
        groundedData.bookings = bookingResult.data || [];
      }
    }

    // Fetch finances if finance query
    if (intent.type === 'finance_query') {
      const financeResult = await fetchFinances({
        organizationId,
        type: entities.financeType,
        month: entities.month,
        year: entities.year
      });
      
      sources.push({
        route: financeResult.route,
        params: financeResult.params,
        success: financeResult.success,
        latency: financeResult.latency
      });
      
      if (financeResult.success) {
        groundedData.finances = financeResult.data || [];
      }
    }

    groundedData.metadata = {
      sources,
      totalLatency: Date.now() - startTime,
      cacheHit: false
    };

    logger.info('[CORTEX]', {
      intent: intent.type,
      organizationId,
      routes: sources.map(s => s.route),
      latency: groundedData.metadata.totalLatency,
      dataFetched: {
        properties: groundedData.properties?.length || 0,
        utilityBills: groundedData.utilityBills?.length || 0,
        tasks: groundedData.tasks?.length || 0,
        bookings: groundedData.bookings?.length || 0,
        finances: groundedData.finances?.length || 0
      }
    });

    return groundedData;
  } catch (error) {
    logger.error('[CORTEX] Grounding error:', error);
    throw error;
  }
}

/**
 * Normalize data for LLM consumption
 */
export function normalizeDataForLLM(groundedData: GroundedData): string {
  const parts: string[] = [];

  if (groundedData.properties && groundedData.properties.length > 0) {
    parts.push('PROPERTIES DATA:');
    groundedData.properties.forEach(p => {
      parts.push(`- ${p.name} (ID: ${p.id}, Status: ${p.status}, Owner: ${p.ownerId || 'N/A'})`);
    });
  }

  if (groundedData.utilityBills && groundedData.utilityBills.length > 0) {
    parts.push('\nUTILITY BILLS DATA:');
    groundedData.utilityBills.forEach(b => {
      const billDate = new Date(b.billMonth).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      parts.push(`- ${b.utilityType} bill for ${billDate}: Amount ฿${b.amount}, Status: ${b.paymentStatus}, ${b.proofOfPayment ? 'Proof uploaded' : 'No proof'}`);
    });
  }

  if (groundedData.tasks && groundedData.tasks.length > 0) {
    parts.push('\nTASKS DATA:');
    groundedData.tasks.forEach(t => {
      parts.push(`- ${t.title} (ID: ${t.id}, Status: ${t.status}, Priority: ${t.priority}, Assigned to: ${t.assignedTo || 'Unassigned'})`);
    });
  }

  if (groundedData.bookings && groundedData.bookings.length > 0) {
    parts.push('\nBOOKINGS DATA:');
    groundedData.bookings.forEach(b => {
      parts.push(`- Guest: ${b.guestName}, Check-in: ${b.checkInDate}, Check-out: ${b.checkOutDate}, Status: ${b.status}`);
    });
  }

  if (groundedData.finances && groundedData.finances.length > 0) {
    parts.push('\nFINANCE DATA:');
    const income = groundedData.finances.filter(f => f.type === 'income');
    const expenses = groundedData.finances.filter(f => f.type === 'expense');
    
    if (income.length > 0) {
      const totalIncome = income.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      parts.push(`- Total Income: ฿${totalIncome.toFixed(2)} (${income.length} transactions)`);
    }
    
    if (expenses.length > 0) {
      const totalExpenses = expenses.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      parts.push(`- Total Expenses: ฿${totalExpenses.toFixed(2)} (${expenses.length} transactions)`);
    }
    
    if (income.length > 0 && expenses.length > 0) {
      const totalIncome = income.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      const totalExpenses = expenses.reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);
      const netProfit = totalIncome - totalExpenses;
      parts.push(`- Net Profit: ฿${netProfit.toFixed(2)}`);
    }
  }

  if (parts.length === 0) {
    return 'NO DATA FOUND - The system could not find any relevant data for this query.';
  }

  return parts.join('\n');
}
