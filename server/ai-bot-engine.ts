/**
 * Captain Cortex AI Bot Engine
 * The Smart Co-Pilot for Property Management by HostPilotPro
 * Provides intelligent access to all property management data
 */

import OpenAI from 'openai';
import { DatabaseStorage } from './storage.js';
import { generateRoleBasedSystemPrompt, filterResponseByRole, getAllowedDataQueries, getRoleBasedGreeting } from './captainCortexRoleSystem';

interface QueryContext {
  organizationId: string;
  userRole: string;
  userId: string;
}

interface DataQuery {
  type: 'tasks' | 'revenue' | 'expenses' | 'bookings' | 'properties' | 'general';
  filters: {
    property?: string;
    dateRange?: { start: string; end: string };
    status?: string;
    category?: string;
  };
  question: string;
}

export class AIBotEngine {
  private openai: OpenAI;
  private storage: DatabaseStorage;
  private cache: Map<string, { response: string; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for AI Bot functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.storage = new DatabaseStorage();
    console.log('🤖 AI Bot Engine initialized successfully');
  }

  /**
   * Main entry point for AI bot queries
   */
  async processQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log(`🤖 AI Bot processing: "${question}" for org: ${context.organizationId}`);

      // Check cache first
      const cacheKey = `${context.organizationId}:${question.toLowerCase().trim()}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        console.log('💨 Cache hit - returning cached response');
        return cached.response;
      }

      // Use fast single-call approach for better performance
      const response = await this.processQueryFast(question, context);
      
      // Cache the response
      this.cache.set(cacheKey, { response, timestamp: Date.now() });
      
      // Clear old cache entries periodically
      this.cleanupCache();
      
      return response;

    } catch (error: any) {
      console.error('❌ AI Bot error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        question: question,
        context: context
      });
      return `Sorry, I encountered an issue while processing your question: ${error?.message || 'Unknown error'}. The technical team has been notified.`;
    }
  }

  /**
   * Fast single-call query processing with role-based permissions
   */
  private async processQueryFast(question: string, context: QueryContext): Promise<string> {
    console.log(`🔍 Processing query: "${question}" for role: ${context.userRole}`);
    
    try {
      // Get allowed data queries based on user role
      const allowedQueries = getAllowedDataQueries(context.userRole);
      console.log(`📋 Allowed queries for ${context.userRole}:`, allowedQueries);
    
    // Fetch data based on role permissions
    const dataPromises: Promise<any>[] = [];
    
    if (allowedQueries.includes('properties')) {
      dataPromises.push(this.storage.getProperties());
    } else {
      dataPromises.push(Promise.resolve([]));
    }
    
    if (allowedQueries.includes('tasks')) {
      dataPromises.push(this.storage.getTasks());
    } else {
      dataPromises.push(Promise.resolve([]));
    }
    
    if (allowedQueries.includes('bookings')) {
      dataPromises.push(this.storage.getBookings());
    } else {
      dataPromises.push(Promise.resolve([]));
    }
    
    if (allowedQueries.includes('finances')) {
      dataPromises.push(this.storage.getFinances());
    } else {
      dataPromises.push(Promise.resolve([]));
    }

    const [properties, tasks, bookings, finances] = await Promise.all(dataPromises);
    console.log(`📊 Data fetched - Properties: ${properties?.length || 0}, Tasks: ${tasks?.length || 0}, Bookings: ${bookings?.length || 0}, Finances: ${finances?.length || 0}`);

    // Filter by organization and show only main demo properties for clean demo experience
    const mainDemoPropertyNames = [
      'Villa Samui Breeze',
      'Villa Ocean View', 
      'Villa Aruna (Demo)',
      'Villa Tropical Paradise'
    ];
    
    // Build organization data based on role permissions
    const organizationData: any = {};
    
    if (allowedQueries.includes('properties')) {
      organizationData.properties = properties
        .filter((p: any) => p.organizationId === context.organizationId)
        .filter((p: any) => mainDemoPropertyNames.includes(p.name))
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          maxGuests: p.maxGuests,
          pricePerNight: allowedQueries.includes('finances') ? p.pricePerNight : '[RESTRICTED]',
          currency: p.currency,
          status: p.status,
          address: p.address
        }));
    }
    
    if (allowedQueries.includes('tasks')) {
      organizationData.tasks = tasks.filter((t: any) => t.organizationId === context.organizationId);
      console.log(`📅 Filtered tasks for org ${context.organizationId}: ${organizationData.tasks.length} tasks`);
      
      // If question is about tomorrow's tasks, add date filtering
      if (question.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        console.log(`🗓️ Looking for tasks for tomorrow: ${tomorrowStr}`);
        
        organizationData.tomorrowTasks = organizationData.tasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const taskDueDate = new Date(task.dueDate).toISOString().split('T')[0];
          return taskDueDate === tomorrowStr;
        });
        console.log(`📋 Found ${organizationData.tomorrowTasks.length} tasks for tomorrow`);
      }
    }
    
    if (allowedQueries.includes('bookings')) {
      organizationData.bookings = bookings.filter((b: any) => b.organizationId === context.organizationId);
    }
    
    if (allowedQueries.includes('finances')) {
      organizationData.finances = finances.filter((f: any) => f.organizationId === context.organizationId);
    }

    console.log(`📋 Data fetched for ${context.userRole}:`, Object.keys(organizationData));

    // Generate role-based system prompt
    const systemPrompt = generateRoleBasedSystemPrompt(context.userRole);
    
    const dataContextPrompt = `
Current date: ${new Date().toISOString().split('T')[0]}

Available data summary:
${organizationData.properties ? `- Properties: ${organizationData.properties.length} main demo properties` : '- Properties: [NO ACCESS]'}
${organizationData.tasks ? `- Tasks: ${organizationData.tasks.length} tasks` : '- Tasks: [NO ACCESS]'}
${organizationData.bookings ? `- Bookings: ${organizationData.bookings.length} bookings` : '- Bookings: [NO ACCESS]'}
${organizationData.finances ? `- Financial records: ${organizationData.finances.length} records` : '- Financial records: [NO ACCESS]'}

Focus on the main 4 demo properties when available: Villa Samui Breeze, Villa Ocean View, Villa Aruna (Demo), and Villa Tropical Paradise`;

    const userPrompt = `Question: "${question}"

Available data (filtered by your role permissions):
${JSON.stringify(organizationData, null, 2)}

Please analyze this question and provide a helpful response using only the available data within your role permissions.`;

    console.log(`🤖 Sending to OpenAI with data keys: ${Object.keys(organizationData)}`);
    console.log('🤖 System prompt length:', (systemPrompt + dataContextPrompt).length);
    console.log('🤖 User prompt length:', userPrompt.length);
    
    let response: string;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt + dataContextPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response to your question.";
      console.log('✅ OpenAI response received, length:', response.length);
    } catch (openaiError: any) {
      console.error('❌ OpenAI API Error:', openaiError);
      console.error('❌ OpenAI Error Details:', {
        message: openaiError?.message,
        status: openaiError?.status,
        code: openaiError?.code,
        type: openaiError?.type
      });
      throw new Error(`OpenAI API failed: ${openaiError?.message || 'Unknown OpenAI error'}`);
    }
    
    // Apply role-based filtering to the response
    response = filterResponseByRole(response, context.userRole);
    
    console.log(`✅ AI response generated for ${context.userRole}`);
    return response;

    } catch (error: any) {
      console.error('❌ processQueryFast error:', error);
      throw new Error(`Fast query processing failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Clear cache (for maintenance)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 AI Bot cache cleared');
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Analyze the user question to determine what data to fetch
   */
  private async analyzeQuestion(question: string): Promise<DataQuery> {
    const systemPrompt = `You are a data analyst for a property management system. Analyze the user's question and return a JSON object with the query structure.

Available data types: tasks, revenue, expenses, bookings, properties, general
Available filters: property (property name), dateRange (start/end dates), status, category

Examples:
- "What tasks do we have for tomorrow?" → {"type": "tasks", "filters": {"dateRange": {"start": "tomorrow", "end": "tomorrow"}}}
- "Revenue from Villa Tropical Paradise in March 2025" → {"type": "revenue", "filters": {"property": "Villa Tropical Paradise", "dateRange": {"start": "2025-03-01", "end": "2025-03-31"}}}
- "Electric charges for Villa Aruna in May" → {"type": "expenses", "filters": {"property": "Villa Aruna", "category": "electric", "dateRange": {"start": "2025-05-01", "end": "2025-05-31"}}}

Return only valid JSON.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    try {
      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      analysis.question = question;
      return analysis;
    } catch (error) {
      // Fallback analysis if JSON parsing fails
      return {
        type: 'general',
        filters: {},
        question: question
      };
    }
  }

  /**
   * Fetch relevant data based on query analysis
   */
  private async fetchRelevantData(query: DataQuery, context: QueryContext): Promise<any> {
    const data: any = {};

    try {
      // Always fetch properties for reference
      data.properties = await this.storage.getProperties();

      // Fetch specific data based on query type and filter by organization
      switch (query.type) {
        case 'tasks':
          const allTasks = await this.storage.getTasks();
          data.tasks = allTasks.filter((task: any) => task.organizationId === context.organizationId);
          if (query.filters.dateRange) {
            data.tasks = this.filterByDateRange(data.tasks, query.filters.dateRange, 'dueDate');
          }
          break;

        case 'revenue':
        case 'expenses':
          const allFinances = await this.storage.getFinances();
          data.finance = allFinances.filter((finance: any) => finance.organizationId === context.organizationId);
          if (query.filters.property) {
            const property = this.findPropertyByName(data.properties, query.filters.property);
            if (property) {
              data.finance = data.finance.filter((f: any) => f.propertyId === property.id);
            }
          }
          if (query.filters.dateRange) {
            data.finance = this.filterByDateRange(data.finance, query.filters.dateRange, 'date');
          }
          if (query.type === 'revenue') {
            data.finance = data.finance.filter((f: any) => f.type === 'income');
          } else if (query.type === 'expenses') {
            data.finance = data.finance.filter((f: any) => f.type === 'expense');
            if (query.filters.category) {
              data.finance = data.finance.filter((f: any) => 
                f.category?.toLowerCase().includes(query.filters.category?.toLowerCase())
              );
            }
          }
          break;

        case 'bookings':
          const allBookings = await this.storage.getBookings();
          data.bookings = allBookings.filter((booking: any) => booking.organizationId === context.organizationId);
          if (query.filters.property) {
            const property = this.findPropertyByName(data.properties, query.filters.property);
            if (property) {
              data.bookings = data.bookings.filter((b: any) => b.propertyId === property.id);
            }
          }
          if (query.filters.dateRange) {
            data.bookings = this.filterByDateRange(data.bookings, query.filters.dateRange, 'checkInDate');
          }
          break;

        case 'general':
          // Fetch all data for general questions and filter by organization
          const allTasksGeneral = await this.storage.getTasks();
          data.tasks = allTasksGeneral.filter((task: any) => task.organizationId === context.organizationId);
          
          const allFinancesGeneral = await this.storage.getFinances();
          data.finance = allFinancesGeneral.filter((finance: any) => finance.organizationId === context.organizationId);
          
          const allBookingsGeneral = await this.storage.getBookings();
          data.bookings = allBookingsGeneral.filter((booking: any) => booking.organizationId === context.organizationId);
          break;
      }

      return data;

    } catch (error) {
      console.error('Error fetching data:', error);
      return { error: 'Failed to fetch data', properties: data.properties || [] };
    }
  }

  /**
   * Generate intelligent response using OpenAI
   */
  private async generateResponse(question: string, data: any, query: DataQuery): Promise<string> {
    const systemPrompt = `You are MR Pilot, an AI assistant for a property management company. You have access to real property management data and should provide helpful, accurate answers.

Key guidelines:
1. Be conversational and helpful
2. Use specific data from the provided context
3. Format numbers clearly (use Thai Baht ฿ for money)
4. If no data is found, explain why and suggest alternatives
5. For date-related queries, be specific about the time period
6. Always mention property names when relevant
7. Keep responses concise but informative

Data available: ${JSON.stringify(Object.keys(data))}

Current date context: ${new Date().toISOString().split('T')[0]}`;

    const userPrompt = `Question: "${question}"

Available data:
${JSON.stringify(data, null, 2)}

Please provide a helpful response based on this data.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return completion.choices[0].message.content || "I apologize, but I couldn't generate a response to your question.";
  }

  /**
   * Helper: Find property by name (fuzzy matching)
   */
  private findPropertyByName(properties: any[], propertyName: string): any {
    const name = propertyName.toLowerCase();
    return properties.find(p => 
      p.name.toLowerCase().includes(name) || 
      name.includes(p.name.toLowerCase())
    );
  }

  /**
   * Helper: Filter data by date range
   */
  private filterByDateRange(data: any[], dateRange: any, dateField: string): any[] {
    if (!dateRange.start && !dateRange.end) return data;

    const start = this.parseDate(dateRange.start);
    const end = this.parseDate(dateRange.end);

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return false;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  }

  /**
   * Helper: Parse various date formats including "tomorrow", "today", etc.
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    switch (dateStr.toLowerCase()) {
      case 'today':
        return today;
      case 'tomorrow':
        return tomorrow;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return yesterday;
      default:
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  /**
   * Get suggested questions based on available data
   */
  async getSuggestedQuestions(context: QueryContext): Promise<string[]> {
    return [
      "What tasks do we have for tomorrow?",
      "Show me revenue for this month",
      "What are the pending bookings?",
      "What were the expenses for Villa Tropical Paradise last month?",
      "How many properties are currently active?",
      "What tasks are overdue?",
      "Show me electric charges for May 2025",
      "What's our total revenue for this year?",
      "Which properties have bookings this week?",
      "What maintenance tasks are scheduled?"
    ];
  }
}

export const aiBotEngine = new AIBotEngine();