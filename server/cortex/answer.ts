/**
 * Answer Generation for Captain Cortex AI
 * Uses GPT-4 mini to generate data-grounded responses
 */

import OpenAI from 'openai';
import { GroundedData, normalizeDataForLLM } from './grounder';
import { DetectedIntent } from './intent';
import { logger } from '../logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are Captain Cortex for HostPilotPro, an intelligent property management assistant.

CRITICAL RULES:
1. Only answer using the provided internal data (properties/tasks/utility/finance/bookings).
2. If data is missing or ambiguous, ask for the missing fields or clearly state you cannot find it.
3. Provide concise, actionable summaries. No speculation or assumptions.
4. Always mention specific data points (dates, amounts, statuses) when available.
5. Use a professional, helpful tone.

When answering:
- Be specific: Use actual property names, dates, amounts from the data
- Be helpful: Provide context and next steps when relevant
- Be honest: If data is incomplete or missing, say so clearly
- Be concise: Keep responses focused and actionable`;

export interface AnswerResult {
  answer: string;
  sources: Array<{
    route: string;
    params: Record<string, any>;
  }>;
  latency: number;
  cached: boolean;
  intent: string;
  confidence: number;
}

/**
 * Generate answer using GPT-4 mini with grounded data
 */
export async function generateAnswer(
  question: string,
  intent: DetectedIntent,
  groundedData: GroundedData
): Promise<AnswerResult> {
  const startTime = Date.now();

  try {
    // Normalize data for LLM
    const dataContext = normalizeDataForLLM(groundedData);
    
    // Check if we have any data
    const hasData = dataContext !== 'NO DATA FOUND - The system could not find any relevant data for this query.';
    
    let answer: string;
    
    if (!hasData) {
      // Fallback for missing data
      answer = `I couldn't find any relevant information in the internal system for your question: "${question}"\n\nThis could be because:\n- The property name might be spelled differently\n- The data hasn't been uploaded yet\n- The time period specified doesn't have any records\n\nPlease check the property name, dates, or other details and try again.`;
    } else {
      // Generate AI answer with grounded data
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o mini for cost efficiency
        temperature: 0.2, // Low temperature for factual responses
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `QUESTION: ${question}\n\nINTERNAL DATA:\n${dataContext}\n\nProvide a concise, data-grounded answer using ONLY the information above.`
          }
        ]
      });

      answer = completion.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response. Please try again.';
    }

    const latency = Date.now() - startTime;

    logger.info('[CORTEX] Answer generated', {
      question: question.substring(0, 100),
      intent: intent.type,
      confidence: intent.confidence,
      hasData,
      latency
    });

    return {
      answer,
      sources: groundedData.metadata.sources.map(s => ({
        route: s.route,
        params: s.params
      })),
      latency,
      cached: false,
      intent: intent.type,
      confidence: intent.confidence
    };
  } catch (error: any) {
    logger.error('[CORTEX] Answer generation error:', error);
    
    // Graceful error handling
    return {
      answer: `I encountered an error processing your question. This might be due to:\n- A temporary system issue\n- Complex query requiring manual review\n\nPlease try rephrasing your question or contact support if the issue persists.\n\nError: ${error.message}`,
      sources: groundedData.metadata.sources.map(s => ({
        route: s.route,
        params: s.params
      })),
      latency: Date.now() - startTime,
      cached: false,
      intent: intent.type,
      confidence: intent.confidence
    };
  }
}
