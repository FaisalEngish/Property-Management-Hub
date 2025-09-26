/**
 * Captain Cortex AI Bot Engine
 * The Smart Co-Pilot for Property Management by HostPilotPro
 * Provides intelligent access to all property management data
 */

import OpenAI from 'openai';
import { DatabaseStorage } from './storage.js';

interface QueryContext {
  organizationId: string;
  userRole: string;
  userId: string;
}

interface DataQuery {
  type: 'tasks' | 'revenue' | 'expenses' | 'bookings' | 'properties' | 'staff' | 'finance' | 'general';
  filters: {
    property?: string;
    dateRange?: { start: string; end: string };
    status?: string;
    category?: string;
    department?: string;
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
      return `I apologize, but I encountered an error while processing your question: ${error?.message || 'Unknown error'}. Please try rephrasing your question or contact support if the issue persists.`;
    }
  }

  /**
   * Fast single-call query processing
   */
  private async processQueryFast(question: string, context: QueryContext): Promise<string> {
    // Check for specific query types and route accordingly
    if (this.isStaffQuery(question)) {
      return await this.processStaffQuery(question, context);
    }
    
    if (this.isFinanceQuery(question)) {
      return await this.processFinanceQuery(question, context);
    }
    
    if (this.isPropertyQuery(question)) {
      return await this.processPropertyQuery(question, context);
    }

    // Fetch all relevant data upfront for general queries
    const [properties, tasks, bookings, finances] = await Promise.all([
      this.storage.getProperties(),
      this.storage.getTasks(),
      this.storage.getBookings(),
      this.storage.getFinances()
    ]);

    // Filter by organization and show only main demo properties for clean demo experience
    const mainDemoPropertyNames = [
      'Villa Samui Breeze',
      'Villa Ocean View', 
      'Villa Aruna (Demo)',
      'Villa Tropical Paradise'
    ];
    
    // Filter and limit data to prevent token overflow
    const filteredProperties = properties
      .filter((p: any) => p.organizationId === context.organizationId)
      .filter((p: any) => mainDemoPropertyNames.includes(p.name))
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        pricePerNight: p.pricePerNight,
        currency: p.currency,
        status: p.status
      }));

    // Limit data to prevent context overflow - take only recent/relevant items
    const recentTasks = tasks
      .filter((t: any) => t.organizationId === context.organizationId)
      .slice(0, 20) // Limit to 20 most recent tasks
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        propertyName: t.propertyName,
        dueDate: t.dueDate
      }));

    const recentBookings = bookings
      .filter((b: any) => b.organizationId === context.organizationId)
      .slice(0, 15) // Limit to 15 most recent bookings
      .map((b: any) => ({
        id: b.id,
        guestName: b.guestName,
        propertyName: b.propertyName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        totalAmount: b.totalAmount,
        status: b.status
      }));

    const recentFinances = finances
      .filter((f: any) => f.organizationId === context.organizationId)
      .slice(0, 20) // Limit to 20 most recent finance records
      .map((f: any) => ({
        id: f.id,
        type: f.type,
        category: f.category,
        amount: f.amount,
        currency: f.currency,
        date: f.date,
        propertyId: f.propertyId
      }));

    const organizationData = {
      properties: filteredProperties,
      tasks: recentTasks,
      bookings: recentBookings,
      finances: recentFinances
    };

    console.log('📋 Data fetched:', Object.keys(organizationData));

    // OpenAI Assistant Configuration
    const ASSISTANT_ID = "asst_OATIDMTgutnkdOJpTrQ9Mf7u";
    
    // Single AI call with combined analysis and response
    const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro, an AI assistant for a Thai property management company. Analyze the user's question and provide a helpful response using the available data.

Guidelines:
1. Be conversational and helpful
2. Use specific data from the provided context
3. Format numbers clearly (use Thai Baht ฿ for money)
4. If no data is found, explain why and suggest alternatives
5. For date-related queries, be specific about the time period
6. Always mention property names when relevant
7. Keep responses concise but informative
8. Focus on the main 4 demo properties: Villa Samui Breeze, Villa Ocean View, Villa Aruna (Demo), and Villa Tropical Paradise

Current date: ${new Date().toISOString().split('T')[0]}

Available data summary:
- Properties: ${organizationData.properties.length} main demo properties
- Recent Tasks: ${organizationData.tasks.length} tasks (last 20)
- Recent Bookings: ${organizationData.bookings.length} bookings (last 15)
- Recent Financial records: ${organizationData.finances.length} records (last 20)`;

    // Create a more concise data summary to reduce token usage
    const dataSummary = `Properties (${organizationData.properties.length}):
${organizationData.properties.map(p => `- ${p.name}: ${p.bedrooms}BR/${p.bathrooms}BA, ฿${p.pricePerNight}/night, ${p.status}`).join('\n')}

Recent Tasks (${organizationData.tasks.length}):
${organizationData.tasks.map(t => `- ${t.title} (${t.status}, ${t.priority}, ${t.propertyName}, due: ${t.dueDate})`).join('\n')}

Recent Bookings (${organizationData.bookings.length}):
${organizationData.bookings.map(b => `- ${b.guestName} at ${b.propertyName} (${b.checkIn} to ${b.checkOut}), ฿${b.totalAmount}, ${b.status}`).join('\n')}

Recent Finance Records (${organizationData.finances.length}):
${organizationData.finances.map(f => `- ${f.type}: ${f.category} ฿${f.amount} (${f.date})`).join('\n')}`;

    const userPrompt = `Question: "${question}"

Available data:
${dataSummary}

Please provide a helpful response based on this data.`;

    // Try to use the OpenAI Assistant first, fallback to direct completion
    let response;
    try {
      // Create a thread for the assistant
      const thread = await this.openai.beta.threads.create();
      
      // Add the user's message to the thread
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `${systemPrompt}\n\n${userPrompt}`
      });
      
      // Run the assistant
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID
      });
      
      // Poll for completion (simplified version)
      let runStatus = run;
      for (let i = 0; i < 30; i++) { // Max 30 seconds wait
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
        if (runStatus.status === 'completed') break;
        if (runStatus.status === 'failed') throw new Error('Assistant run failed');
      }
      
      if (runStatus.status === 'completed') {
        const messages = await this.openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];
        if (lastMessage.content[0].type === 'text') {
          response = lastMessage.content[0].text.value;
        }
      }
    } catch (assistantError) {
      console.log('Assistant failed, falling back to direct completion');
    }
    
    // Fallback to direct completion if assistant fails
    if (!response) {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      });
      response = completion.choices[0].message.content;
    }

    return response || "I apologize, but I couldn't generate a response to your question.";
  }

  /**
   * Check if the query is asking for staff information
   */
  private isStaffQuery(question: string): boolean {
    const staffKeywords = [
      'staff', 'employee', 'worker', 'payroll', 'salary', 'wages', 
      'team member', 'personnel', 'pending', 'payment', 'overtime'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return staffKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('show all staff') ||
           lowerQuestion.includes('staff list') ||
           lowerQuestion.includes('pending salaries') ||
           lowerQuestion.includes('who works here');
  }

  /**
   * Process staff-specific queries with live API data
   */
  private async processStaffQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log('🧑‍💼 Processing staff query:', question);
      
      // Fetch live staff data from the new API endpoints
      const [staffResponse, pendingResponse] = await Promise.all([
        this.fetchStaffData(context),
        this.fetchPendingPayrollData(context)
      ]);

      const staffData = {
        staff: staffResponse.staff || [],
        pending: pendingResponse.pending || [],
        totalStaff: staffResponse.total || 0,
        pendingPayments: pendingResponse.total || 0,
        totalPendingAmount: pendingResponse.totalAmount || 0
      };

      // Use OpenAI to analyze the question and provide intelligent response
      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live staff and payroll data. Analyze the user's question and provide a helpful response.

Guidelines:
1. Be conversational and helpful - act like a smart assistant who knows the business
2. Use specific data from the provided staff context
3. Format responses clearly with proper structure (tables, lists, etc.)
4. Use Thai Baht ฿ for money amounts
5. If asked about "staff list" or "all staff", show a formatted table
6. If asked about "pending" payments/salaries, focus on pending items
7. Provide actionable insights when possible
8. Be professional but friendly

Current date: ${new Date().toISOString().split('T')[0]}

Staff data available:
- Total staff members: ${staffData.totalStaff}
- Pending payments: ${staffData.pendingPayments}
- Total pending amount: ฿${staffData.totalPendingAmount?.toLocaleString()}`;

      const userPrompt = `Question: "${question}"

Staff Data:
${JSON.stringify({
        totalStaff: staffData.totalStaff,
        staffMembers: staffData.staff.map(s => ({
          name: s.name,
          position: s.position,
          department: s.department,
          salary: `฿${s.salary?.toLocaleString()}`,
          status: s.status
        })),
        pendingPayments: staffData.pending.map(p => ({
          staffName: p.staffName,
          position: p.position,
          period: p.period,
          netAmount: `฿${p.net?.toLocaleString()}`,
          status: p.status,
          dueDate: p.dueDate
        }))
      }, null, 2)}

Please provide a helpful response based on this live staff data.`;

      // Use OpenAI Assistant or fallback
      let response;
      try {
        const ASSISTANT_ID = "asst_OATIDMTgutnkdOJpTrQ9Mf7u";
        const thread = await this.openai.beta.threads.create();
        
        await this.openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: `${systemPrompt}\n\n${userPrompt}`
        });
        
        const run = await this.openai.beta.threads.runs.create(thread.id, {
          assistant_id: ASSISTANT_ID
        });
        
        let runStatus = run;
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
          if (runStatus.status === 'completed') break;
          if (runStatus.status === 'failed') throw new Error('Assistant run failed');
        }
        
        if (runStatus.status === 'completed') {
          const messages = await this.openai.beta.threads.messages.list(thread.id);
          const lastMessage = messages.data[0];
          if (lastMessage.content[0].type === 'text') {
            response = lastMessage.content[0].text.value;
          }
        }
      } catch (assistantError) {
        console.log('Staff query: Assistant failed, using fallback');
      }
      
      if (!response) {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 800,
        });
        response = completion.choices[0].message.content;
      }

      return response || "I apologize, but I couldn't process your staff query at the moment.";

    } catch (error) {
      console.error('Error processing staff query:', error);
      return `I apologize, but I encountered an error while fetching staff information: ${error.message}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Fetch live staff data from the API
   */
  private async fetchStaffData(context: QueryContext): Promise<any> {
    try {
      // Make internal API call to our new endpoint
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/staff/list`, {
        headers: {
          'Authorization': `Bearer internal`,
          'X-Organization-ID': context.organizationId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff data:', error);
      // Fallback to storage method if API fails
      const users = await this.storage.getUsers();
      const staffMembers = users
        .filter(user => user.organizationId === context.organizationId)
        .map(user => ({
          id: user.id,
          name: user.name,
          position: user.role,
          department: user.role === 'admin' ? 'Operations' : 'General',
          salary: 35000,
          status: 'Active'
        }));
      
      return { staff: staffMembers, total: staffMembers.length };
    }
  }

  /**
   * Fetch live pending payroll data from the API
   */
  private async fetchPendingPayrollData(context: QueryContext): Promise<any> {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/staff/pending`, {
        headers: {
          'Authorization': `Bearer internal`,
          'X-Organization-ID': context.organizationId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending payroll data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending payroll data:', error);
      // Fallback
      return { pending: [], total: 0, totalAmount: 0 };
    }
  }

  /**
   * Check if the query is asking for finance information
   */
  private isFinanceQuery(question: string): boolean {
    const financeKeywords = [
      'finance', 'financial', 'revenue', 'income', 'expense', 'cost', 'profit', 
      'budget', 'money', 'payment', 'transaction', 'balance', 'payout', 'commission'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return financeKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('how much money') ||
           lowerQuestion.includes('financial summary') ||
           lowerQuestion.includes('revenue report') ||
           lowerQuestion.includes('expense breakdown');
  }

  /**
   * Process finance-specific queries with live API data
   */
  private async processFinanceQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log('💰 Processing finance query:', question);
      
      // Fetch live finance data from multiple endpoints
      const [financeData, analyticsData] = await Promise.all([
        this.fetchFinanceData(context),
        this.fetchFinanceAnalytics(context)
      ]);

      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live financial data and analytics. Analyze the user's question and provide a helpful response.

Guidelines:
1. Be conversational and helpful - act like a smart financial assistant who understands the business
2. Use specific data from the provided financial context
3. Format responses clearly with proper structure (tables, summaries, key insights)
4. Use Thai Baht ฿ for money amounts
5. Provide actionable financial insights when possible
6. Be professional but friendly
7. If asked about revenue, expenses, or profit, focus on those metrics
8. Include trends and comparisons when relevant

Current date: ${new Date().toISOString().split('T')[0]}

Financial data available:
- Total Revenue: ฿${analyticsData.totalRevenue?.toLocaleString()}
- Total Expenses: ฿${analyticsData.totalExpenses?.toLocaleString()}
- Net Profit: ฿${(analyticsData.totalRevenue - analyticsData.totalExpenses)?.toLocaleString()}
- Recent Transactions: ${financeData.length} records`;

      const userPrompt = `Question: "${question}"

Financial Data Summary:
${JSON.stringify({
        totalRevenue: `฿${analyticsData.totalRevenue?.toLocaleString()}`,
        totalExpenses: `฿${analyticsData.totalExpenses?.toLocaleString()}`,
        netProfit: `฿${(analyticsData.totalRevenue - analyticsData.totalExpenses)?.toLocaleString()}`,
        recentTransactions: financeData.slice(0, 10).map(tx => ({
          type: tx.type,
          amount: `฿${tx.amount?.toLocaleString()}`,
          category: tx.category,
          date: tx.date,
          propertyName: tx.propertyName
        }))
      }, null, 2)}

Please provide a helpful financial analysis based on this live data.`;

      return await this.generateAIResponse(systemPrompt, userPrompt);

    } catch (error) {
      console.error('Error processing finance query:', error);
      return `I apologize, but I encountered an error while fetching financial information: ${error.message}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Check if the query is asking for property information
   */
  private isPropertyQuery(question: string): boolean {
    const propertyKeywords = [
      'property', 'properties', 'villa', 'house', 'apartment', 'building',
      'location', 'occupancy', 'availability', 'booking', 'guest'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return propertyKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('property list') ||
           lowerQuestion.includes('available properties') ||
           lowerQuestion.includes('property details') ||
           lowerQuestion.includes('villa samui');
  }

  /**
   * Process property-specific queries with live API data
   */
  private async processPropertyQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log('🏠 Processing property query:', question);
      
      // Fetch live property data
      const propertiesData = await this.fetchPropertiesData(context);

      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live property data and details. Analyze the user's question and provide a helpful response.

Guidelines:
1. Be conversational and helpful - act like a smart property management assistant
2. Use specific data from the provided property context
3. Format responses clearly with proper structure (lists, property details, summaries)
4. Include property names, locations, and key details
5. Provide actionable property insights when possible
6. Be professional but friendly
7. If asked about specific properties, focus on those details
8. Include occupancy, availability, and booking information when relevant

Current date: ${new Date().toISOString().split('T')[0]}

Property portfolio:
- Total Properties: ${propertiesData.length}
- Active Properties: ${propertiesData.filter(p => p.isActive).length}`;

      const userPrompt = `Question: "${question}"

Properties Data:
${JSON.stringify({
        totalProperties: propertiesData.length,
        activeProperties: propertiesData.filter(p => p.isActive).length,
        properties: propertiesData.slice(0, 10).map(property => ({
          name: property.name,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          maxGuests: property.maxGuests,
          isActive: property.isActive,
          status: property.status
        }))
      }, null, 2)}

Please provide helpful property information based on this live data.`;

      return await this.generateAIResponse(systemPrompt, userPrompt);

    } catch (error) {
      console.error('Error processing property query:', error);
      return `I apologize, but I encountered an error while fetching property information: ${error.message}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Fetch live finance data from API
   */
  private async fetchFinanceData(context: QueryContext): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/finance`, {
        headers: {
          'Authorization': `Bearer internal`,
          'X-Organization-ID': context.organizationId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch finance data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Fallback to storage method
      return await this.storage.getFinances();
    }
  }

  /**
   * Fetch live finance analytics from API
   */
  private async fetchFinanceAnalytics(context: QueryContext): Promise<any> {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/finance/analytics`, {
        headers: {
          'Authorization': `Bearer internal`,
          'X-Organization-ID': context.organizationId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch finance analytics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching finance analytics:', error);
      // Fallback
      return { totalRevenue: 0, totalExpenses: 0 };
    }
  }

  /**
   * Fetch live properties data from API
   */
  private async fetchPropertiesData(context: QueryContext): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/properties`, {
        headers: {
          'Authorization': `Bearer internal`,
          'X-Organization-ID': context.organizationId
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch properties data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties data:', error);
      // Fallback to storage method
      return await this.storage.getProperties();
    }
  }

  /**
   * Generate AI response using OpenAI Assistant or fallback
   */
  private async generateAIResponse(systemPrompt: string, userPrompt: string): Promise<string> {
    let response;
    try {
      const ASSISTANT_ID = "asst_OATIDMTgutnkdOJpTrQ9Mf7u";
      const thread = await this.openai.beta.threads.create();
      
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `${systemPrompt}\n\n${userPrompt}`
      });
      
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID
      });
      
      let runStatus = run;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
        if (runStatus.status === 'completed') break;
        if (runStatus.status === 'failed') throw new Error('Assistant run failed');
      }
      
      if (runStatus.status === 'completed') {
        const messages = await this.openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];
        if (lastMessage.content[0].type === 'text') {
          response = lastMessage.content[0].text.value;
        }
      }
    } catch (assistantError) {
      console.log('Query processing: Assistant failed, using fallback');
    }
    
    if (!response) {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });
      response = completion.choices[0].message.content;
    }

    return response || "I apologize, but I couldn't process your query at the moment.";
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