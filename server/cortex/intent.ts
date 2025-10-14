/**
 * Intent Detection for Captain Cortex AI
 * Detects user intent from natural language questions
 */

export type IntentType = 
  | 'property_query'
  | 'utility_query'
  | 'task_query'
  | 'booking_query'
  | 'finance_query'
  | 'general_query'
  | 'unknown';

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  keywords: string[];
  rawQuestion: string;
}

const INTENT_PATTERNS = {
  property_query: [
    'property', 'villa', 'properties', 'building', 'estate', 'unit',
    'house', 'apartment', 'residence'
  ],
  utility_query: [
    'utility', 'bill', 'electricity', 'water', 'internet', 'gas',
    'electric', 'wifi', 'broadband', 'power', 'consumption',
    'meter', 'reading', 'usage', 'paid', 'unpaid', 'due', 'overdue',
    'payslip', 'receipt', 'proof of payment'
  ],
  task_query: [
    'task', 'maintenance', 'repair', 'cleaning', 'inspection',
    'work order', 'job', 'pending', 'completed', 'assigned',
    'scheduled', 'overdue', 'priority'
  ],
  booking_query: [
    'booking', 'reservation', 'guest', 'check-in', 'checkout',
    'occupied', 'vacant', 'available', 'booked', 'reserved',
    'arrival', 'departure', 'stay'
  ],
  finance_query: [
    'finance', 'revenue', 'expense', 'income', 'profit', 'loss',
    'payment', 'transaction', 'commission', 'payout', 'invoice',
    'cost', 'earning', 'budget', 'financial'
  ]
};

/**
 * Detect intent from natural language question
 */
export function detectIntent(question: string): DetectedIntent {
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Check each intent type
  const scores: Array<{ type: IntentType; score: number; keywords: string[] }> = [];
  
  for (const [intentType, keywords] of Object.entries(INTENT_PATTERNS)) {
    const matchedKeywords: string[] = [];
    let score = 0;
    
    for (const keyword of keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        // Weight longer keywords higher (more specific)
        score += keyword.split(' ').length;
      }
    }
    
    if (score > 0) {
      scores.push({
        type: intentType as IntentType,
        score,
        keywords: matchedKeywords
      });
    }
  }
  
  // Sort by score and return highest
  if (scores.length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      keywords: [],
      rawQuestion: question
    };
  }
  
  scores.sort((a, b) => b.score - a.score);
  const topIntent = scores[0];
  
  // Calculate confidence (0-1)
  const totalWords = normalizedQuestion.split(/\s+/).length;
  const confidence = Math.min(topIntent.score / totalWords, 1);
  
  return {
    type: topIntent.type,
    confidence,
    keywords: topIntent.keywords,
    rawQuestion: question
  };
}

/**
 * Check if intent is actionable (high enough confidence)
 */
export function isActionableIntent(intent: DetectedIntent): boolean {
  return intent.confidence >= 0.15 && intent.type !== 'unknown';
}
