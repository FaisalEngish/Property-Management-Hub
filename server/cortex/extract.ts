/**
 * Entity Extraction for Captain Cortex AI
 * Extracts entities like property names, dates, utility types from questions
 */

export interface ExtractedEntities {
  propertyName?: string;
  propertyId?: number;
  utilityType?: 'electricity' | 'water' | 'internet' | 'gas' | 'waste' | 'security';
  month?: string; // "October", "Oct", "10"
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: 'pending' | 'completed' | 'in-progress' | 'cancelled';
  taskType?: 'maintenance' | 'cleaning' | 'inspection';
  financeType?: 'income' | 'expense';
  timeframe?: 'today' | 'week' | 'month' | 'year';
}

const MONTH_PATTERNS = {
  january: '1', jan: '1',
  february: '2', feb: '2',
  march: '3', mar: '3',
  april: '4', apr: '4',
  may: '5',
  june: '6', jun: '6',
  july: '7', jul: '7',
  august: '8', aug: '8',
  september: '9', sep: '9', sept: '9',
  october: '10', oct: '10',
  november: '11', nov: '11',
  december: '12', dec: '12'
};

const UTILITY_TYPES = ['electricity', 'water', 'internet', 'gas', 'waste', 'security'];
const TASK_STATUSES = ['pending', 'completed', 'in-progress', 'cancelled'];
const TASK_TYPES = ['maintenance', 'cleaning', 'inspection'];
const FINANCE_TYPES = ['income', 'expense', 'revenue', 'cost'];

/**
 * Extract property name from question
 */
function extractPropertyName(question: string): string | undefined {
  const normalizedQuestion = question.toLowerCase();
  
  // Pattern 1: "Villa [Name]" or "villa [name]"
  const villaMatch = normalizedQuestion.match(/villa\s+([a-z0-9\s]+?)(?:\s+|,|\.|\?|$)/i);
  if (villaMatch) {
    return `Villa ${villaMatch[1].trim().split(/\s+/).map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ')}`;
  }
  
  // Pattern 2: Quoted property name
  const quotedMatch = question.match(/"([^"]+)"/);
  if (quotedMatch) {
    return quotedMatch[1];
  }
  
  return undefined;
}

/**
 * Extract utility type from question
 */
function extractUtilityType(question: string): ExtractedEntities['utilityType'] {
  const normalizedQuestion = question.toLowerCase();
  
  for (const utilityType of UTILITY_TYPES) {
    if (normalizedQuestion.includes(utilityType)) {
      return utilityType as ExtractedEntities['utilityType'];
    }
  }
  
  // Check for aliases
  if (normalizedQuestion.includes('electric') || normalizedQuestion.includes('power')) {
    return 'electricity';
  }
  if (normalizedQuestion.includes('wifi') || normalizedQuestion.includes('broadband')) {
    return 'internet';
  }
  
  return undefined;
}

/**
 * Extract month and year from question
 */
function extractMonthYear(question: string): { month?: string; year?: number } {
  const normalizedQuestion = question.toLowerCase();
  
  // Extract month
  let month: string | undefined;
  for (const [monthName, monthNum] of Object.entries(MONTH_PATTERNS)) {
    if (normalizedQuestion.includes(monthName)) {
      month = monthNum;
      break;
    }
  }
  
  // Check for numeric month (e.g., "10" or "10th")
  if (!month) {
    const numericMonthMatch = normalizedQuestion.match(/\b(1[0-2]|[1-9])(th|st|nd|rd)?\b/);
    if (numericMonthMatch) {
      month = numericMonthMatch[1];
    }
  }
  
  // Extract year
  const yearMatch = question.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined;
  
  // Default to current month/year if asking about "this month" or "current"
  if (normalizedQuestion.includes('this month') || normalizedQuestion.includes('current month')) {
    const now = new Date();
    month = (now.getMonth() + 1).toString();
    return { month, year: now.getFullYear() };
  }
  
  return { month, year };
}

/**
 * Extract date range from question
 */
function extractDateRange(question: string): { dateFrom?: string; dateTo?: string } {
  const normalizedQuestion = question.toLowerCase();
  
  // "Next weekend"
  if (normalizedQuestion.includes('next weekend')) {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    
    return {
      dateFrom: saturday.toISOString().split('T')[0],
      dateTo: sunday.toISOString().split('T')[0]
    };
  }
  
  // "This week"
  if (normalizedQuestion.includes('this week')) {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      dateFrom: monday.toISOString().split('T')[0],
      dateTo: sunday.toISOString().split('T')[0]
    };
  }
  
  return {};
}

/**
 * Extract task status from question
 */
function extractTaskStatus(question: string): ExtractedEntities['status'] {
  const normalizedQuestion = question.toLowerCase();
  
  for (const status of TASK_STATUSES) {
    if (normalizedQuestion.includes(status)) {
      return status as ExtractedEntities['status'];
    }
  }
  
  return undefined;
}

/**
 * Extract finance type from question
 */
function extractFinanceType(question: string): ExtractedEntities['financeType'] {
  const normalizedQuestion = question.toLowerCase();
  
  if (normalizedQuestion.includes('revenue') || normalizedQuestion.includes('income') || normalizedQuestion.includes('earning')) {
    return 'income';
  }
  if (normalizedQuestion.includes('expense') || normalizedQuestion.includes('cost') || normalizedQuestion.includes('spending')) {
    return 'expense';
  }
  
  return undefined;
}

/**
 * Main entity extraction function
 */
export function extractEntities(question: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  
  // Extract property name
  entities.propertyName = extractPropertyName(question);
  
  // Extract utility type
  entities.utilityType = extractUtilityType(question);
  
  // Extract month and year
  const { month, year } = extractMonthYear(question);
  entities.month = month;
  entities.year = year;
  
  // Extract date range
  const { dateFrom, dateTo } = extractDateRange(question);
  entities.dateFrom = dateFrom;
  entities.dateTo = dateTo;
  
  // Extract task status
  entities.status = extractTaskStatus(question);
  
  // Extract finance type
  entities.financeType = extractFinanceType(question);
  
  return entities;
}
