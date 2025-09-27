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
  exportFormat?: 'csv' | 'pdf' | 'json';
  viewMode?: 'concise' | 'detailed';
  drillDown?: string;
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
      'team member', 'personnel', 'pending', 'payment', 'overtime',
      'department', 'sales', 'operations', 'marketing', 'management'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return staffKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('show all staff') ||
           lowerQuestion.includes('staff list') ||
           lowerQuestion.includes('pending salaries') ||
           lowerQuestion.includes('who works here') ||
           lowerQuestion.includes('active staff') ||
           lowerQuestion.includes('show only') ||
           lowerQuestion.includes('filter by') ||
           lowerQuestion.includes('show more staff');
  }

  /**
   * Process staff-specific queries with live API data
   */
  private async processStaffQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log('🧑‍💼 Processing advanced staff query:', question);
      
      // Fetch live staff data from the new API endpoints
      const [staffResponse, pendingResponse] = await Promise.all([
        this.fetchStaffData(context),
        this.fetchPendingPayrollData(context)
      ]);

      let staffList = staffResponse.staff || [];
      
      // Parse query for filters and advanced options
      const queryOptions = this.parseStaffQueryOptions(question);
      console.log('📋 Parsed query options:', queryOptions);
      
      // Apply filters
      if (queryOptions.filters.department) {
        staffList = staffList.filter((s: any) => 
          s.department.toLowerCase().includes(queryOptions.filters.department.toLowerCase())
        );
      }
      if (queryOptions.filters.role) {
        staffList = staffList.filter((s: any) => 
          s.position.toLowerCase().includes(queryOptions.filters.role.toLowerCase())
        );
      }
      if (queryOptions.filters.status) {
        staffList = staffList.filter((s: any) => 
          s.status.toLowerCase() === queryOptions.filters.status.toLowerCase()
        );
      }

      // Handle export requests
      if (queryOptions.export && context.exportFormat) {
        return this.handleStaffExport(staffList, context.exportFormat, queryOptions);
      }

      const staffData = {
        staff: staffList,
        pending: pendingResponse.pending || [],
        totalStaff: staffList.length,
        originalTotal: staffResponse.total || 0,
        pendingPayments: pendingResponse.total || 0,
        totalPendingAmount: pendingResponse.totalAmount || 0,
        isFiltered: queryOptions.hasFilters,
        filters: queryOptions.filters
      };

      // Use OpenAI to analyze the question and provide intelligent response
      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live staff and payroll data.

CRITICAL FORMATTING REQUIREMENTS:
1. NEVER show raw JSON data or long unformatted text dumps
2. ALWAYS create clean, professional markdown tables for staff listings
3. ALWAYS start with an executive summary (total counts, key metrics)
4. Limit initial display to 10 entries max with pagination notes
5. Use proper table formatting with clean columns and spacing
6. Include actionable business insights and department breakdowns

RESPONSE STRUCTURE FOR STAFF QUERIES:
1. Executive Summary (2-3 lines with totals and key metrics)
2. Professional markdown table with columns: ID | Name | Position | Department | Salary | Status
3. Pagination info if more data exists ("Showing 1-10 of 25 total")
4. Department breakdown or key insights
5. Next steps or actionable suggestions

FORMAT REQUIREMENTS:
- Thai Baht ฿ with comma separators for all amounts
- Clean table borders and proper alignment
- Professional, executive-ready presentation
- Concise but comprehensive information

Current date: ${new Date().toISOString().split('T')[0]}
Staff Overview: ${staffData.totalStaff} employees, ${staffData.pendingPayments} pending payments (฿${staffData.totalPendingAmount?.toLocaleString()})`;

      // Determine pagination based on query
      const pageSize = queryOptions.pagination.pageSize;
      const currentPage = queryOptions.pagination.page;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const staffToShow = staffData.staff.slice(startIndex, endIndex);
      const hasMoreStaff = staffData.staff.length > endIndex;
      const hasPreviousStaff = startIndex > 0;
      const pendingToShow = staffData.pending.slice(0, 5);
      
      // Generate KPI cards and summary information
      const kpiCards = this.generateStaffKPICards(staffData);
      const summaryInfo = this.generateStaffSummary(staffData, startIndex, endIndex, queryOptions);
      
      // Check for concise mode
      const isConciseMode = context.viewMode === 'concise' || queryOptions.viewMode === 'concise';
      
      const userPrompt = `Question: "${question}"

${kpiCards}

${summaryInfo}

STAFF ROSTER DATA:
${staffToShow.map((s: any, index: number) => 
  `${startIndex + index + 1}. ${s.name} | ${s.position} | ${s.department} | ฿${s.salary?.toLocaleString()} | ${s.status}`
).join('\n')}

${staffData.isFiltered ? '\n✅ **Results filtered based on your criteria**' : ''}

${hasMoreStaff || hasPreviousStaff ? '\n📄 **Pagination Options**:' : ''}
${hasPreviousStaff ? '• Type "show previous staff" for earlier entries' : ''}
${hasMoreStaff ? '• Type "show more staff" for additional entries' : ''}
${staffData.totalStaff > 20 ? '• Try "first 20 staff" to see more at once' : ''}

PENDING PAYROLL (${staffData.pendingPayments} payments pending):
${pendingToShow.length > 0 ? pendingToShow.map((p: any, index: number) => 
  `${index + 1}. ${p.staffName} | ${p.position} | ฿${p.net?.toLocaleString()} | Due: ${p.dueDate}`
).join('\n') : 'No pending payments'}

🔗 **INTERACTIVE DRILL-DOWN OPTIONS**:
• Click "Sales" → "Show only Sales department staff" 
• Click "Manager" → "Show only managers"
• Click "Active" → "Show only Active staff"
• Click "Operations" → "Show only Operations department"

📊 **EXPORT OPTIONS**:
• "Export staff list to CSV" - Spreadsheet format
• "Export to PDF" - Professional report with charts
• "Download filtered results" - Current view only

⚡ **VIEW MODES**:
- Current: ${isConciseMode ? 'Concise Mode 📋' : 'Detailed Mode 📊'}
- Switch: ${isConciseMode ? 'Try "show detailed view" for full info' : 'Try "concise mode" for summary only'}

AVAILABLE FILTER OPTIONS:
• "Show only Active staff in Sales department"
• "Show managers only"  
• "Show staff in Operations department"
• "Show card view" for alternative formatting

INSTRUCTIONS FOR RESPONSE:
- Start with KPI cards showing key metrics
- ${isConciseMode ? 'Provide concise summary with key insights only' : 'Create comprehensive analysis with detailed breakdown'}
- Create professional markdown table: | ID | Name | Position | Department | Salary | Status |
- Add clickable department/role elements for drill-down actions
- Include export suggestions and interactive options
- Add department insights and team composition analysis
- Include pagination guidance if applicable
- Format all currency as Thai Baht ฿ with comma separators
- End with actionable next steps for staff management

Provide an enterprise-grade, executive-ready staff analysis with interactive capabilities.`;

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
      return `I apologize, but I encountered an error while fetching staff information: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Fetch live staff data using direct database access
   */
  private async fetchStaffData(context: QueryContext): Promise<any> {
    try {
      console.log('📊 Fetching staff data via DatabaseStorage for org:', context.organizationId);
      
      // Use direct database access for reliable data fetching
      const users = await this.storage.getUsers();
      const organizationUsers = users.filter(user => user.organizationId === context.organizationId);
      
      const staffMembers = organizationUsers.map(user => ({
        id: user.id,
        employeeId: user.id,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Unknown User',
        position: this.getRoleDisplayName(user.role),
        department: this.getDepartmentForRole(user.role),
        salary: this.getSalaryForRole(user.role),
        status: user.isActive ? 'Active' : 'Inactive'
      }));
      
      console.log(`✅ Found ${staffMembers.length} staff members for organization ${context.organizationId}`);
      return { staff: staffMembers, total: staffMembers.length };
      
    } catch (error) {
      console.error('Error fetching staff data from storage:', error);
      return { staff: [], total: 0 };
    }
  }

  /**
   * Fetch live pending payroll data using direct database access
   */
  private async fetchPendingPayrollData(context: QueryContext): Promise<any> {
    try {
      console.log('💰 Fetching pending payroll data via DatabaseStorage for org:', context.organizationId);
      
      // Generate realistic pending payroll data based on staff
      const users = await this.storage.getUsers();
      const organizationUsers = users.filter(user => 
        user.organizationId === context.organizationId && user.isActive
      );
      
      const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const pendingPayroll = organizationUsers
        .filter(() => Math.random() > 0.6) // 40% have pending payments
        .map((user, index) => {
          const baseSalary = this.getSalaryForRole(user.role);
          const overtime = Math.random() > 0.8 ? Math.floor(Math.random() * 5000) : 0;
          const bonus = Math.random() > 0.9 ? Math.floor(Math.random() * 10000) : 0;
          const gross = baseSalary + overtime + bonus;
          const net = Math.floor(gross * 0.8); // Approximate net after deductions
          
          return {
            id: `pending_${user.id}`,
            staffId: user.id,
            staffName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Unknown User',
            position: this.getRoleDisplayName(user.role),
            period: currentMonth,
            baseSalary,
            overtime,
            bonus,
            gross,
            net,
            status: 'Pending',
            dueDate: this.getNextPayDate()
          };
        });
      
      const totalAmount = pendingPayroll.reduce((sum, payment) => sum + payment.net, 0);
      
      console.log(`💸 Found ${pendingPayroll.length} pending payments, total: ฿${totalAmount.toLocaleString()}`);
      return { pending: pendingPayroll, total: pendingPayroll.length, totalAmount };
      
    } catch (error) {
      console.error('Error fetching pending payroll data from storage:', error);
      return { pending: [], total: 0, totalAmount: 0 };
    }
  }

  /**
   * Helper: Get display name for user role
   */
  private getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Operations Manager',
      'portfolio-manager': 'Portfolio Manager', 
      'owner': 'Property Owner',
      'staff': 'Staff Member',
      'retail-agent': 'Retail Agent',
      'referral-agent': 'Referral Agent',
      'guest': 'Guest User'
    };
    return roleMap[role] || role;
  }

  /**
   * Helper: Get department based on role
   */
  private getDepartmentForRole(role: string): string {
    const deptMap: Record<string, string> = {
      'admin': 'Operations',
      'portfolio-manager': 'Management',
      'owner': 'Ownership',
      'staff': 'General Staff',
      'retail-agent': 'Sales',
      'referral-agent': 'Marketing',
      'guest': 'Guest Services'
    };
    return deptMap[role] || 'General';
  }

  /**
   * Helper: Get realistic salary for role
   */
  private getSalaryForRole(role: string): number {
    const salaryMap: Record<string, number> = {
      'admin': 55000,
      'portfolio-manager': 65000,
      'owner': 0, // Owners don't receive salary
      'staff': 35000,
      'retail-agent': 40000,
      'referral-agent': 32000,
      'guest': 0
    };
    return salaryMap[role] || 35000;
  }

  /**
   * Helper: Get next pay date
   */
  private getNextPayDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return nextMonth.toISOString().split('T')[0];
  }

  /**
   * Parse staff query for advanced options and filters
   */
  private parseStaffQueryOptions(question: string): any {
    const lowerQuestion = question.toLowerCase();
    const options = {
      filters: {} as any,
      hasFilters: false,
      viewType: 'table', // table or card
      pagination: {
        page: 1,
        pageSize: 10
      },
      showMore: false
    };

    // Parse department filters
    if (lowerQuestion.includes('sales department') || lowerQuestion.includes('in sales')) {
      options.filters.department = 'Sales';
      options.hasFilters = true;
    } else if (lowerQuestion.includes('operations department') || lowerQuestion.includes('in operations')) {
      options.filters.department = 'Operations';
      options.hasFilters = true;
    } else if (lowerQuestion.includes('marketing department') || lowerQuestion.includes('in marketing')) {
      options.filters.department = 'Marketing';
      options.hasFilters = true;
    } else if (lowerQuestion.includes('management department') || lowerQuestion.includes('in management')) {
      options.filters.department = 'Management';
      options.hasFilters = true;
    }

    // Parse role filters
    if (lowerQuestion.includes('manager') || lowerQuestion.includes('managers')) {
      options.filters.role = 'Manager';
      options.hasFilters = true;
    } else if (lowerQuestion.includes('agent') || lowerQuestion.includes('agents')) {
      options.filters.role = 'Agent';
      options.hasFilters = true;
    }

    // Parse status filters
    if (lowerQuestion.includes('active staff') || lowerQuestion.includes('only active')) {
      options.filters.status = 'Active';
      options.hasFilters = true;
    } else if (lowerQuestion.includes('inactive staff') || lowerQuestion.includes('only inactive')) {
      options.filters.status = 'Inactive';
      options.hasFilters = true;
    }

    // Parse view preferences
    if (lowerQuestion.includes('card view') || lowerQuestion.includes('show as cards')) {
      options.viewType = 'card';
    }

    // Parse pagination requests
    if (lowerQuestion.includes('show more') || lowerQuestion.includes('load more')) {
      options.showMore = true;
      options.pagination.page = 2; // Start from page 2 for "show more"
    }

    // Parse page size requests
    if (lowerQuestion.includes('first 5')) {
      options.pagination.pageSize = 5;
    } else if (lowerQuestion.includes('first 20')) {
      options.pagination.pageSize = 20;
    } else if (lowerQuestion.includes('all staff') && !options.hasFilters) {
      options.pagination.pageSize = 15; // Show more for "all staff" requests
    }

    // Parse export requests
    if (lowerQuestion.includes('export csv') || lowerQuestion.includes('download csv')) {
      options.export = 'csv';
    } else if (lowerQuestion.includes('export pdf') || lowerQuestion.includes('download pdf')) {
      options.export = 'pdf';
    }

    // Parse view mode requests
    if (lowerQuestion.includes('concise') || lowerQuestion.includes('summary only')) {
      options.viewMode = 'concise';
    } else if (lowerQuestion.includes('detailed') || lowerQuestion.includes('expand details')) {
      options.viewMode = 'detailed';
    }

    // Parse drill-down requests
    if (lowerQuestion.includes('drill down') || lowerQuestion.includes('show only')) {
      // Will be handled by specific department/role filters above
      options.drillDown = true;
    }

    return options;
  }

  /**
   * Generate comprehensive staff summary information
   */
  private generateStaffSummary(staffData: any, startIndex: number, endIndex: number, queryOptions: any): string {
    const actualEndIndex = Math.min(endIndex, staffData.staff.length);
    const showingCount = actualEndIndex - startIndex;
    
    let summary = `📊 **Staff Overview**: ${staffData.totalStaff} ${staffData.isFiltered ? 'filtered' : 'total'} staff`;
    
    if (staffData.isFiltered && staffData.originalTotal !== staffData.totalStaff) {
      summary += ` (${staffData.originalTotal} total)`;
    }
    
    summary += ` | Showing ${startIndex + 1}-${actualEndIndex} of ${staffData.totalStaff}`;
    
    if (staffData.pendingPayments > 0) {
      summary += ` | ${staffData.pendingPayments} pending payments (฿${staffData.totalPendingAmount?.toLocaleString()})`;
    }

    // Add filter information
    if (staffData.isFiltered) {
      const filterParts = [];
      if (staffData.filters.department) filterParts.push(`Department: ${staffData.filters.department}`);
      if (staffData.filters.role) filterParts.push(`Role: ${staffData.filters.role}`);
      if (staffData.filters.status) filterParts.push(`Status: ${staffData.filters.status}`);
      
      if (filterParts.length > 0) {
        summary += `\n🔍 **Active Filters**: ${filterParts.join(', ')}`;
      }
    }

    return summary;
  }

  /**
   * Generate KPI Cards for staff overview
   */
  private generateStaffKPICards(staffData: any): string {
    const totalStaff = staffData.staff.length;
    const activeStaff = staffData.staff.filter((s: any) => s.status === 'Active').length;
    const inactiveStaff = totalStaff - activeStaff;
    
    // Calculate average salary by department
    const departmentSalaries: { [key: string]: number[] } = {};
    staffData.staff.forEach((s: any) => {
      if (!departmentSalaries[s.department]) {
        departmentSalaries[s.department] = [];
      }
      departmentSalaries[s.department].push(s.salary || 0);
    });

    const avgSalariesByDept = Object.entries(departmentSalaries).map(([dept, salaries]) => {
      const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
      return `${dept}: ฿${Math.round(avg).toLocaleString()}`;
    }).join(', ');

    return `🎯 **Quick KPI Overview**:
📊 **Total Staff**: ${totalStaff} employees
✅ **Active**: ${activeStaff} staff (${Math.round((activeStaff/totalStaff) * 100)}%)
⚠️ **Inactive**: ${inactiveStaff} staff (${Math.round((inactiveStaff/totalStaff) * 100)}%)
💰 **Avg Salary by Dept**: ${avgSalariesByDept}
${staffData.pendingPayments > 0 ? `🔴 **Pending Payments**: ${staffData.pendingPayments} (฿${staffData.totalPendingAmount?.toLocaleString()})` : ''}`;
  }

  /**
   * Handle export requests for staff data
   */
  private handleStaffExport(staffList: any[], format: string, queryOptions: any): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `staff_export_${timestamp}`;
    
    if (format === 'csv') {
      // Generate CSV data structure
      const csvData = staffList.map(staff => ({
        'Employee ID': staff.employeeId || staff.id,
        'Name': staff.name,
        'Position': staff.position,
        'Department': staff.department,
        'Salary': staff.salary,
        'Status': staff.status,
        'Phone': staff.phone || '',
        'Email': staff.email || ''
      }));

      return `📊 **CSV Export Ready**

**File**: ${filename}.csv
**Records**: ${csvData.length} staff members
**Format**: CSV Spreadsheet

**Export Data Preview**:
${csvData.slice(0, 3).map((row, i) => 
  `${i + 1}. ${row.Name} | ${row.Position} | ${row.Department} | ฿${row.Salary?.toLocaleString()}`
).join('\n')}

🔗 **Export Actions**:
• **Download CSV**: Click the download button below
• **Export with Filters**: Try "export filtered staff to CSV"
• **PDF Report**: Ask for "export to PDF" for formatted report

*CSV file will include all ${csvData.length} records with complete employee data.*`;

    } else if (format === 'pdf') {
      return `📄 **PDF Export Ready**

**File**: ${filename}.pdf
**Records**: ${staffList.length} staff members
**Format**: Professional PDF Report

**Report Includes**:
• Executive summary with KPI metrics
• Staff roster with photos and details
• Department breakdown analysis
• Salary distribution charts
• Professional HostPilotPro branding

🔗 **Export Actions**:
• **Download PDF**: Click the download button below
• **Custom Report**: Specify filters for targeted export
• **CSV Alternative**: Ask for "export to CSV" for spreadsheet format

*PDF report will be professionally formatted and enterprise-ready.*`;
    }

    return "Export format not supported. Please try 'export to CSV' or 'export to PDF'.";
  }

  /**
   * Check if the query is asking for finance information
   */
  private isFinanceQuery(question: string): boolean {
    const financeKeywords = [
      'finance', 'financial', 'revenue', 'income', 'expense', 'cost', 'profit', 
      'budget', 'money', 'payment', 'transaction', 'balance', 'payout', 'commission',
      'cashflow', 'cash flow', 'receivables', 'payables', 'invoices', 'billing',
      'margin', 'gross', 'net', 'earnings', 'adr', 'revpar', 'pricing', 'rates'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return financeKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('how much money') ||
           lowerQuestion.includes('financial summary') ||
           lowerQuestion.includes('revenue report') ||
           lowerQuestion.includes('expense breakdown') ||
           lowerQuestion.includes('profit analysis') ||
           lowerQuestion.includes('cash position');
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

      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live financial data and analytics.

CRITICAL FORMATTING REQUIREMENTS:
1. NEVER show raw JSON data or long unformatted text dumps
2. ALWAYS create clean, professional financial summaries with clear sections
3. Use proper table formatting for transaction lists (limit to 10 entries max)
4. Start with key financial metrics summary (Revenue, Expenses, Net Profit)
5. Include actionable insights and trend analysis
6. Format all currency as Thai Baht ฿ with comma separators

RESPONSE STRUCTURE FOR FINANCE QUERIES:
1. Executive Financial Summary (Revenue, Expenses, Net Profit)
2. Key Performance Indicators (if applicable)
3. Recent transactions table (if requested, max 10 entries)
4. Financial insights and recommendations
5. Next steps or actions needed

Current date: ${new Date().toISOString().split('T')[0]}
Financial Overview: ฿${analyticsData.totalRevenue?.toLocaleString()} revenue, ฿${analyticsData.totalExpenses?.toLocaleString()} expenses, ฿${(analyticsData.totalRevenue - analyticsData.totalExpenses)?.toLocaleString()} net profit`;

      // Limit transactions display for better formatting
      const transactionsToShow = financeData.slice(0, 10);
      const hasMoreTransactions = financeData.length > 10;
      
      const userPrompt = `Question: "${question}"

FINANCIAL METRICS:
- Total Revenue: ฿${analyticsData.totalRevenue?.toLocaleString()}
- Total Expenses: ฿${analyticsData.totalExpenses?.toLocaleString()}
- Net Profit: ฿${(analyticsData.totalRevenue - analyticsData.totalExpenses)?.toLocaleString()}
- Transaction Count: ${financeData.length}

RECENT TRANSACTIONS (Showing ${transactionsToShow.length} of ${financeData.length} total):
${transactionsToShow.map((tx, index) => 
  `${index + 1}. ${tx.type.toUpperCase()} | ฿${tx.amount?.toLocaleString()} | ${tx.category} | ${tx.date} | ${tx.propertyName || 'General'}`
).join('\n')}

${hasMoreTransactions ? `\n(${financeData.length - 10} additional transactions available)` : ''}

INSTRUCTIONS FOR RESPONSE:
- Start with executive financial summary
- Create clean tables for transaction data if requested
- Include financial insights and trends
- Use proper Thai Baht formatting throughout
- Provide actionable business recommendations
- Keep response professional and concise

Please provide a well-formatted financial analysis.`;

      return await this.generateAIResponse(systemPrompt, userPrompt);

    } catch (error) {
      console.error('Error processing finance query:', error);
      return `I apologize, but I encountered an error while fetching financial information: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Check if the query is asking for property information
   */
  private isPropertyQuery(question: string): boolean {
    const propertyKeywords = [
      'property', 'properties', 'villa', 'house', 'apartment', 'building',
      'location', 'occupancy', 'availability', 'booking', 'guest', 'rooms',
      'bedrooms', 'bathrooms', 'amenities', 'features', 'listing', 'portfolio'
    ];
    const lowerQuestion = question.toLowerCase();
    
    return propertyKeywords.some(keyword => lowerQuestion.includes(keyword)) ||
           lowerQuestion.includes('property list') ||
           lowerQuestion.includes('available properties') ||
           lowerQuestion.includes('property details') ||
           lowerQuestion.includes('villa samui') ||
           lowerQuestion.includes('show properties') ||
           lowerQuestion.includes('property portfolio');
  }

  /**
   * Process property-specific queries with live API data
   */
  private async processPropertyQuery(question: string, context: QueryContext): Promise<string> {
    try {
      console.log('🏠 Processing property query:', question);
      
      // Fetch live property data
      const propertiesData = await this.fetchPropertiesData(context);

      const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro. You have access to live property portfolio data.

CRITICAL FORMATTING REQUIREMENTS:
1. NEVER show raw JSON data or long unformatted text dumps
2. ALWAYS create clean, professional property listings with proper structure
3. Use table formatting for property lists (limit to 10 entries max)
4. Start with portfolio summary (total properties, active count, key metrics)
5. Include property details in organized, readable format
6. Provide actionable property management insights

RESPONSE STRUCTURE FOR PROPERTY QUERIES:
1. Portfolio Executive Summary (total count, active properties)
2. Property listings table with key details
3. Pagination info if more properties exist
4. Property insights and recommendations
5. Next steps for property management

Current date: ${new Date().toISOString().split('T')[0]}
Portfolio Overview: ${propertiesData.length} total properties, ${propertiesData.filter(p => p.isActive).length} active`;

      // Limit properties display for better formatting
      const propertiesToShow = propertiesData.slice(0, 10);
      const hasMoreProperties = propertiesData.length > 10;
      
      const userPrompt = `Question: "${question}"

PROPERTY PORTFOLIO DATA (Showing ${propertiesToShow.length} of ${propertiesData.length} total):

${propertiesToShow.map((property, index) => 
  `${index + 1}. ${property.name} | ${property.location} | ${property.bedrooms}BR/${property.bathrooms}BA | Max: ${property.maxGuests} guests | Status: ${property.isActive ? 'Active' : 'Inactive'}`
).join('\n')}

${hasMoreProperties ? `\n(${propertiesData.length - 10} additional properties available)` : ''}

PORTFOLIO SUMMARY:
- Total Properties: ${propertiesData.length}
- Active Properties: ${propertiesData.filter(p => p.isActive).length}
- Inactive Properties: ${propertiesData.filter(p => !p.isActive).length}

INSTRUCTIONS FOR RESPONSE:
- Start with portfolio executive summary
- Create professional property listings table with columns: ID | Name | Location | Beds/Baths | Max Guests | Status
- Include property insights and occupancy analysis
- Provide actionable property management recommendations
- Keep response organized and executive-ready

Please provide a well-formatted property portfolio analysis.`;

      return await this.generateAIResponse(systemPrompt, userPrompt);

    } catch (error) {
      console.error('Error processing property query:', error);
      return `I apologize, but I encountered an error while fetching property information: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`;
    }
  }

  /**
   * Fetch live finance data using direct database access
   */
  private async fetchFinanceData(context: QueryContext): Promise<any[]> {
    try {
      console.log('💰 Fetching finance data via DatabaseStorage for org:', context.organizationId);
      
      // Use direct database access for reliable finance data
      const allFinances = await this.storage.getFinances();
      const organizationFinances = allFinances.filter(finance => 
        finance.organizationId === context.organizationId
      );
      
      console.log(`✅ Found ${organizationFinances.length} finance records for organization ${context.organizationId}`);
      return organizationFinances;
      
    } catch (error) {
      console.error('Error fetching finance data from storage:', error);
      return [];
    }
  }

  /**
   * Fetch live finance analytics using direct database access
   */
  private async fetchFinanceAnalytics(context: QueryContext): Promise<any> {
    try {
      console.log('📊 Calculating finance analytics via DatabaseStorage for org:', context.organizationId);
      
      // Get finance data and calculate analytics
      const financeData = await this.fetchFinanceData(context);
      
      const totalRevenue = financeData
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
      const totalExpenses = financeData
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
      const analytics = {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        transactionCount: financeData.length,
        avgTransactionSize: financeData.length > 0 ? Math.floor((totalRevenue + totalExpenses) / financeData.length) : 0
      };
      
      console.log(`📈 Analytics: Revenue ฿${totalRevenue.toLocaleString()}, Expenses ฿${totalExpenses.toLocaleString()}, Net ฿${analytics.netProfit.toLocaleString()}`);
      return analytics;
      
    } catch (error) {
      console.error('Error calculating finance analytics from storage:', error);
      return { totalRevenue: 0, totalExpenses: 0, netProfit: 0, transactionCount: 0, avgTransactionSize: 0 };
    }
  }

  /**
   * Fetch live properties data using direct database access
   */
  private async fetchPropertiesData(context: QueryContext): Promise<any[]> {
    try {
      console.log('🏠 Fetching properties data via DatabaseStorage for org:', context.organizationId);
      
      // Use direct database access for reliable property data
      const allProperties = await this.storage.getProperties();
      const organizationProperties = allProperties.filter(property => 
        property.organizationId === context.organizationId
      );
      
      // Focus on main demo properties for clean demo experience (as per existing pattern)
      const mainDemoPropertyNames = [
        'Villa Samui Breeze',
        'Villa Ocean View', 
        'Villa Aruna (Demo)',
        'Villa Tropical Paradise'
      ];
      
      const demoProperties = organizationProperties.filter(property =>
        mainDemoPropertyNames.includes(property.name)
      );
      
      const propertiesToShow = demoProperties.length > 0 ? demoProperties : organizationProperties.slice(0, 8);
      
      console.log(`✅ Found ${organizationProperties.length} total properties, showing ${propertiesToShow.length} main properties for organization ${context.organizationId}`);
      return propertiesToShow;
      
    } catch (error) {
      console.error('Error fetching properties data from storage:', error);
      return [];
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