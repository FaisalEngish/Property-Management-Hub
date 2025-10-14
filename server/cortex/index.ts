/**
 * Captain Cortex AI - Main orchestrator
 * Combines all modules to provide intelligent, data-grounded answers
 */

import { detectIntent, isActionableIntent } from './intent';
import { extractEntities } from './extract';
import { groundQuestion } from './grounder';
import { generateAnswer, AnswerResult } from './answer';
import { generateCacheKey, getFromCache, setToCache } from './cache';
import { logger } from '../logger';

export interface CortexRequest {
  question: string;
  organizationId: string;
  userId?: string;
}

export interface CortexResponse extends AnswerResult {
  question: string;
  organizationId: string;
}

/**
 * Process a question and return an AI-grounded answer
 */
export async function processQuestion(request: CortexRequest): Promise<CortexResponse> {
  const startTime = Date.now();
  const { question, organizationId, userId } = request;

  try {
    // Check cache first
    const cacheKey = generateCacheKey(question, organizationId);
    const cachedResult = getFromCache<AnswerResult>(cacheKey);
    
    if (cachedResult) {
      logger.info('[CORTEX] Cache hit', {
        question: question.substring(0, 100),
        organizationId,
        userId,
        latency: Date.now() - startTime
      });
      
      return {
        ...cachedResult,
        cached: true,
        question,
        organizationId
      };
    }

    // Step 1: Detect intent
    const intent = detectIntent(question);
    
    if (!isActionableIntent(intent)) {
      logger.warn('[CORTEX] Low confidence intent', {
        question: question.substring(0, 100),
        intent: intent.type,
        confidence: intent.confidence
      });
      
      return {
        answer: `I'm not entirely sure how to help with that question. Could you please rephrase it to be more specific about:\n- Which property/villa you're asking about\n- What information you need (bills, tasks, bookings, finances)\n- The time period or dates if relevant\n\nExample questions:\n- "Is Villa Samui's October electricity bill paid?"\n- "How many pending tasks does Test Villa have?"\n- "What's the net profit for September 2025?"\n- "Is Test Villa booked next weekend?"`,
        sources: [],
        latency: Date.now() - startTime,
        cached: false,
        intent: intent.type,
        confidence: intent.confidence,
        question,
        organizationId
      };
    }

    // Step 2: Extract entities
    const entities = extractEntities(question);
    
    logger.info('[CORTEX] Processing', {
      question: question.substring(0, 100),
      intent: intent.type,
      confidence: intent.confidence,
      entities,
      organizationId,
      userId
    });

    // Step 3: Ground the question with real data
    const groundedData = await groundQuestion(intent, entities, organizationId);

    // Step 4: Generate AI answer
    const answerResult = await generateAnswer(question, intent, groundedData);

    // Cache the result
    setToCache(cacheKey, answerResult);

    const totalLatency = Date.now() - startTime;
    
    logger.info('[CORTEX] Complete', {
      question: question.substring(0, 100),
      organizationId,
      userId,
      intent: intent.type,
      routes: answerResult.sources.map(s => s.route),
      latency: totalLatency,
      cacheHit: false
    });

    return {
      ...answerResult,
      question,
      organizationId,
      latency: totalLatency
    };
  } catch (error: any) {
    logger.error('[CORTEX] Error', {
      question: question.substring(0, 100),
      organizationId,
      userId,
      error: error.message,
      latency: Date.now() - startTime
    });
    
    throw error;
  }
}

// Export cache invalidation for use in other routes
export { invalidateCache } from './cache';
