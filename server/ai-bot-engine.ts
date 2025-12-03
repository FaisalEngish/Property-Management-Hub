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
  private CACHE_TTL = 0; // DISABLED - Always fetch real-time data from database

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for AI Bot functionality');
    }
    
    // Clean the API key by trimming whitespace and removing any leading dashes
    const apiKey = process.env.OPENAI_API_KEY.trim().replace(/^-+/, '');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OPENAI_API_KEY format. Expected key to start with "sk-"');
    }
    
    this.openai = new OpenAI({
      apiKey,
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
    // Fetch all relevant data upfront from ALL modules
    const [
      properties, 
      tasks, 
      bookings, 
      finances, 
      financeAnalytics, 
      users,
      staffSalaries,
      utilityBills,
      ownerPayouts,
      propertyDocuments,
      expiringDocuments,
      invoices,
      utilityAccounts
    ] = await Promise.all([
      this.storage.getProperties(),
      this.storage.getTasks(),
      this.storage.getBookings(context.organizationId),
      this.storage.getFinances(),
      this.storage.getFinanceAnalytics().catch(() => null),
      this.storage.getUsers().catch(() => []),
      this.storage.getAllStaffSalaries(context.organizationId).catch(() => []),
      this.storage.getUtilityBills().catch(() => []),
      this.storage.getOwnerPayouts().catch(() => []),
      this.storage.getPropertyDocuments(context.organizationId).catch(() => []),
      this.storage.getExpiringDocuments(context.organizationId, 30).catch(() => []),
      this.storage.getInvoices(context.organizationId).catch(() => []),
      this.storage.getPropertyUtilityAccounts().catch(() => [])
    ]);
    
    console.log('📊 Raw data counts:', {
      properties: properties.length,
      tasks: tasks.length,
      bookings: bookings.length,
      finances: finances.length,
      users: users.length,
      staffSalaries: staffSalaries.length,
      utilityBills: utilityBills.length,
      ownerPayouts: ownerPayouts.length,
      propertyDocuments: propertyDocuments.length,
      expiringDocuments: expiringDocuments.length,
      invoices: invoices.length,
      utilityAccounts: utilityAccounts.length,
      hasFinanceAnalytics: !!financeAnalytics
    });
    
    // Debug: Show what property IDs exist in bookings and finances
    const bookingPropertyIds = [...new Set(bookings.map((b: any) => b.propertyId))].filter(id => id);
    const financePropertyIds = [...new Set(finances.map((f: any) => f.propertyId))].filter(id => id);
    console.log('🔍 Unique booking propertyIds:', bookingPropertyIds);
    console.log('🔍 Unique finance propertyIds:', financePropertyIds.slice(0, 10));
    
    // Log finance analytics summary if available
    if (financeAnalytics) {
      console.log('💰 Finance Analytics:', {
        totalRevenue: financeAnalytics.totalRevenue,
        totalExpenses: financeAnalytics.totalExpenses,
        netProfit: financeAnalytics.netProfit,
        transactionCount: financeAnalytics.transactionCount
      });
    }

    // Filter by organization and include ALL real properties with comprehensive data
    const filteredProperties = properties
      .filter((p: any) => p.organizationId === context.organizationId)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        pricePerNight: p.pricePerNight,
        currency: p.currency,
        status: p.status,
        location: p.location,
        propertyType: p.propertyType,
        externalId: p.externalId,
        listingUrl: p.listingUrl
      }));

    // Calculate summary statistics from ALL data BEFORE limiting
    const allOrgTasks = tasks.filter((t: any) => t.organizationId === context.organizationId);
    const allOrgBookings = bookings.filter((b: any) => b.organizationId === context.organizationId);
    const allOrgFinances = finances.filter((f: any) => f.organizationId === context.organizationId);
    
    const taskStats = {
      total: allOrgTasks.length,
      completed: allOrgTasks.filter((t: any) => t.status === 'completed').length,
      pending: allOrgTasks.filter((t: any) => t.status === 'pending').length,
      inProgress: allOrgTasks.filter((t: any) => t.status === 'in-progress').length,
      approved: allOrgTasks.filter((t: any) => t.status === 'approved').length,
      highPriority: allOrgTasks.filter((t: any) => t.priority === 'high').length,
      overdue: allOrgTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    };
    
    const bookingStats = {
      total: allOrgBookings.length,
      confirmed: allOrgBookings.filter((b: any) => b.status === 'confirmed').length,
      pending: allOrgBookings.filter((b: any) => b.status === 'pending').length,
      completed: allOrgBookings.filter((b: any) => b.status === 'completed').length,
      cancelled: allOrgBookings.filter((b: any) => b.status === 'cancelled').length
    };
    
    // Calculate booking revenue (synchronized with dashboards)
    const activeBookings = allOrgBookings.filter((b: any) => b.status !== 'cancelled');
    const totalBookingRevenue = activeBookings.reduce((sum: number, b: any) => {
      const revenue = b.platformPayout || b.totalAmount || 0;
      return sum + parseFloat(revenue.toString());
    }, 0);
    
    // Calculate pending payments (confirmed bookings with future check-in) - synchronized with dashboard
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const pendingPayments = allOrgBookings.filter((b: any) => {
      if (b.status !== 'confirmed') return false;
      const checkInDate = new Date(b.checkIn);
      const checkInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
      return checkInDay > startOfToday;
    });
    const totalPendingAmount = pendingPayments.reduce((sum: number, b: any) => {
      const amount = b.platformPayout || b.totalAmount || 0;
      return sum + parseFloat(amount.toString());
    }, 0);
    
    // Calculate current month booking revenue and occupancy - synchronized with dashboard
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const monthEndExclusive = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const daysInMonth = currentMonthEnd.getDate();
    
    const currentMonthBookings = activeBookings.filter((b: any) => {
      const checkIn = new Date(b.checkIn);
      const checkInDay = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOut = new Date(b.checkOut);
      const checkOutDay = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      return checkInDay < monthEndExclusive && checkOutDay > currentMonthStart;
    });
    
    const currentMonthRevenue = currentMonthBookings.reduce((sum: number, b: any) => {
      const revenue = b.platformPayout || b.totalAmount || 0;
      return sum + parseFloat(revenue.toString());
    }, 0);
    
    // Calculate occupancy rate for current month - synchronized with dashboard
    const totalBookingDays = currentMonthBookings.reduce((sum: number, b: any) => {
      const checkIn = new Date(b.checkIn);
      const checkInDay = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const checkOut = new Date(b.checkOut);
      const checkOutDay = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      
      const overlapStart = checkInDay > currentMonthStart ? checkInDay : currentMonthStart;
      const overlapEnd = checkOutDay < monthEndExclusive ? checkOutDay : monthEndExclusive;
      
      if (overlapStart < overlapEnd) {
        const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);
    
    const propertyCount = filteredProperties.length;
    const totalAvailableDays = propertyCount * daysInMonth;
    const occupancyRate = totalAvailableDays > 0 ? Math.round((totalBookingDays / totalAvailableDays) * 100) : 0;
    
    const financeStats = {
      total: allOrgFinances.length,
      income: allOrgFinances.filter((f: any) => f.type === 'income').length,
      expense: allOrgFinances.filter((f: any) => f.type === 'expense').length,
      totalIncome: allOrgFinances.filter((f: any) => f.type === 'income').reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0),
      totalExpense: allOrgFinances.filter((f: any) => f.type === 'expense').reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0),
      // Booking revenue (synchronized with dashboards)
      totalBookingRevenue,
      currentMonthRevenue,
      pendingPaymentsCount: pendingPayments.length,
      totalPendingAmount,
      occupancyRate
    };
    
    const allOrgUtilityBills = utilityBills.filter((u: any) => u.organizationId === context.organizationId);
    const utilityStats = {
      total: allOrgUtilityBills.length,
      electricity: allOrgUtilityBills.filter((u: any) => u.utilityType === 'electricity').length,
      water: allOrgUtilityBills.filter((u: any) => u.utilityType === 'water').length,
      internet: allOrgUtilityBills.filter((u: any) => u.utilityType === 'internet').length,
      gas: allOrgUtilityBills.filter((u: any) => u.utilityType === 'gas').length,
      paid: allOrgUtilityBills.filter((u: any) => u.paymentStatus === 'paid').length,
      pending: allOrgUtilityBills.filter((u: any) => u.paymentStatus === 'pending').length,
      overdue: allOrgUtilityBills.filter((u: any) => u.paymentStatus === 'overdue').length
    };
    
    // Calculate document statistics
    const allOrgDocuments = propertyDocuments.filter((d: any) => d.organizationId === context.organizationId);
    const now = new Date();
    const documentStats = {
      total: allOrgDocuments.length,
      expiring: expiringDocuments.length,
      expired: expiringDocuments.filter((d: any) => d.expirationDate && new Date(d.expirationDate) < now).length,
      expiringNames: expiringDocuments.map((d: any) => d.title || d.originalFilename).join(', ')
    };
    
    console.log('📊 LIVE DATABASE STATS:', { taskStats, bookingStats, financeStats, utilityStats, documentStats });

    // Limit data to prevent context overflow - take only recent/relevant items for details
    const recentTasks = allOrgTasks
      .slice(0, 20) // Limit to 20 most recent tasks
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        propertyName: t.propertyName,
        dueDate: t.dueDate
      }));

    const recentBookings = allOrgBookings
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

    const recentFinances = allOrgFinances
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

    // Filter new module data by organization
    const filteredSalaries = staffSalaries.slice(0, 15);
    const filteredUtilityBills = utilityBills
      .filter((u: any) => u.organizationId === context.organizationId)
      .slice(0, 15);
    const filteredOwnerPayouts = ownerPayouts
      .filter((p: any) => p.organizationId === context.organizationId)
      .slice(0, 15);
    const filteredDocuments = propertyDocuments.slice(0, 10);
    const filteredInvoices = invoices.slice(0, 15);
    const filteredUtilityAccounts = utilityAccounts
      .filter((a: any) => a.organizationId === context.organizationId)
      .slice(0, 10);

    // Calculate property metrics (occupancy, ROI, revenue, last booking) using ALL data
    const propertyMetrics = filteredProperties.map((property: any, index: number) => {
      // Get ALL bookings for this property - match by propertyId only
      const propertyBookings = bookings.filter((b: any) => 
        b.propertyId === property.id
      );
      
      // Get ALL finances for this property - match by propertyId only  
      const propertyFinances = finances.filter((f: any) => 
        f.propertyId === property.id
      );
      
      // Debug first property
      if (index === 0) {
        console.log(`🔍 Matching for property ${property.id} (${property.name}):`, {
          bookingsFound: propertyBookings.length,
          financesFound: propertyFinances.length,
          sampleBooking: propertyBookings[0] ? { id: propertyBookings[0].id, propertyId: propertyBookings[0].propertyId } : 'none',
          sampleFinance: propertyFinances[0] ? { id: propertyFinances[0].id, propertyId: propertyFinances[0].propertyId, amount: propertyFinances[0].amount } : 'none'
        });
      }
      
      // Calculate booking revenue (synchronized with dashboards)
      const activePropertyBookings = propertyBookings.filter((b: any) => b.status !== 'cancelled');
      const bookingRevenue = activePropertyBookings.reduce((sum: number, b: any) => {
        const revenue = b.platformPayout || b.totalAmount || 0;
        return sum + parseFloat(revenue.toString());
      }, 0);
      
      // Calculate total revenue from finance transactions (all time)
      const totalRevenue = propertyFinances
        .filter((f: any) => f.type === 'income')
        .reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0);
      
      // Calculate monthly revenue (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const monthlyRevenue = propertyFinances
        .filter((f: any) => f.type === 'income' && new Date(f.date) >= thirtyDaysAgo)
        .reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0);
      
      // Calculate last booking date
      const lastBooking = propertyBookings.length > 0
        ? propertyBookings.sort((a: any, b: any) => 
            new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
          )[0]
        : null;
      
      // Calculate occupancy rate (based on last 30 days bookings)
      const recentBookings = propertyBookings.filter((b: any) => 
        new Date(b.checkIn) >= thirtyDaysAgo
      );
      const bookedDays = recentBookings.reduce((sum: number, b: any) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);
      const occupancyRate = Math.min(100, Math.round((bookedDays / 30) * 100));
      
      // Calculate ROI (profit margin)
      const totalExpenses = propertyFinances
        .filter((f: any) => f.type === 'expense')
        .reduce((sum: number, f: any) => sum + parseFloat(f.amount || 0), 0);
      const roi = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0;
      
      return {
        ...property,
        occupancyRate,
        monthlyRevenue,
        totalRevenue,
        bookingRevenue, // Total booking revenue (synchronized with dashboards)
        lastBookingDate: lastBooking ? lastBooking.checkIn : null,
        roi: Math.round(roi * 10) / 10,
        bookingCount: propertyBookings.length,
        recentBookingCount: recentBookings.length
      };
    });

    const organizationData = {
      properties: propertyMetrics,
      tasks: recentTasks,
      bookings: recentBookings,
      finances: recentFinances,
      financeAnalytics: financeAnalytics,
      taskStats: taskStats,
      bookingStats: bookingStats,
      financeStats: financeStats,
      utilityStats: utilityStats,
      documentStats: documentStats,
      staffSalaries: filteredSalaries,
      utilityBills: filteredUtilityBills,
      ownerPayouts: filteredOwnerPayouts,
      propertyDocuments: filteredDocuments,
      expiringDocuments: expiringDocuments,
      invoices: filteredInvoices,
      utilityAccounts: filteredUtilityAccounts
    };

    console.log('📋 Data fetched:', Object.keys(organizationData));

    // OpenAI Assistant Configuration
    const ASSISTANT_ID = "asst_OATIDMTgutnkdOJpTrQ9Mf7u";
    
    // Single AI call with combined analysis and response
    const systemPrompt = `You are Captain Cortex, the Smart Co-Pilot for Property Management by HostPilotPro, an AI assistant for a comprehensive hospitality management platform. Analyze the user's question and provide helpful responses using ALL available data from multiple modules.

Guidelines:
1. Be conversational and helpful with real-time data
2. Use specific numbers and metrics from the provided context
3. Format money in Thai Baht (฿) with proper formatting
4. Provide property-level breakdowns when relevant (occupancy rate, ROI, monthly revenue, last booking date)
5. For date-related queries, be specific about time periods
6. Always mention property names when relevant
7. Keep responses concise but data-rich
8. Use ALL real property data including comprehensive metrics (occupancy, ROI, revenue, bookings)
9. Cross-reference data between modules (e.g., property revenue + utility costs + staff salaries)
10. For revenue questions, ALWAYS use Booking Revenue (Real-Time) data - it's synchronized with the financial dashboards
11. For pending payments, use the Pending Payments count and total amount
12. For occupancy questions, use the Current Occupancy Rate stat

Current date: ${new Date().toISOString().split('T')[0]}

Available data across ALL modules (LIVE DATABASE COUNTS):
- Properties: ${organizationData.properties.length} total properties (${organizationData.properties.filter((p: any) => p.status === 'active').length} active, ${organizationData.properties.filter((p: any) => p.status === 'inactive').length} inactive)
- Tasks: ${taskStats.total} TOTAL tasks (${taskStats.completed} completed, ${taskStats.pending} pending, ${taskStats.inProgress} in-progress, ${taskStats.approved} approved, ${taskStats.highPriority} high priority, ${taskStats.overdue} overdue)
- Bookings: ${bookingStats.total} TOTAL bookings (${bookingStats.confirmed} confirmed, ${bookingStats.pending} pending, ${bookingStats.completed} completed, ${bookingStats.cancelled} cancelled)
- Finance: ${financeStats.total} TOTAL transactions (${financeStats.income} income: ฿${financeStats.totalIncome.toLocaleString()}, ${financeStats.expense} expense: ฿${financeStats.totalExpense.toLocaleString()}, Net: ฿${(financeStats.totalIncome - financeStats.totalExpense).toLocaleString()})
- Booking Revenue (Real-Time): Total All-Time: ฿${financeStats.totalBookingRevenue.toLocaleString()}, Current Month: ฿${financeStats.currentMonthRevenue.toLocaleString()}
- Pending Payments: ${financeStats.pendingPaymentsCount} bookings awaiting payment (Total: ฿${financeStats.totalPendingAmount.toLocaleString()})
- Current Occupancy Rate: ${financeStats.occupancyRate}% across all properties
- Finance Analytics: ${financeAnalytics ? `Revenue: ฿${financeAnalytics.totalRevenue?.toLocaleString()}, Expenses: ฿${financeAnalytics.totalExpenses?.toLocaleString()}, Net Profit: ฿${financeAnalytics.netProfit?.toLocaleString()}` : 'Not available'}
- Utility Bills: ${utilityStats.total} TOTAL utility bills (${utilityStats.electricity} electricity, ${utilityStats.water} water, ${utilityStats.internet} internet, ${utilityStats.gas} gas | Payment: ${utilityStats.paid} paid, ${utilityStats.pending} pending, ${utilityStats.overdue} overdue)
- Utility Accounts: ${organizationData.utilityAccounts.length} utility accounts
- Staff Members: ${organizationData.staffSalaries.length} staff members (from salary & staff management)
- Owner Payouts: ${organizationData.ownerPayouts.length} payout records
- Property Documents: ${documentStats.total} TOTAL documents (${documentStats.expiring} expiring within 30 days, ${documentStats.expired} already expired)
- Expiring Documents: ${documentStats.expiringNames || 'None'}
- Invoices: ${organizationData.invoices.length} invoices

IMPORTANT: When answering questions about TOTALS or COUNTS, use the statistics above (e.g., ${taskStats.total} total tasks, ${taskStats.completed} completed tasks). The detailed task/booking/finance lists below are LIMITED SAMPLES for context only.`;

    // Log property metrics for debugging
    console.log('🏠 Property Metrics Sample:', organizationData.properties.slice(0, 3).map((p: any) => ({
      name: p.name,
      occupancy: p.occupancyRate,
      roi: p.roi,
      monthlyRevenue: p.monthlyRevenue,
      totalRevenue: p.totalRevenue,
      bookingRevenue: p.bookingRevenue,
      bookings: p.bookingCount
    })));

    // Create a more concise data summary to reduce token usage
    const dataSummary = `Properties (${organizationData.properties.length}):
${organizationData.properties.map((p: any) => `- ${p.name}: ${p.bedrooms}BR/${p.bathrooms}BA, ฿${p.pricePerNight?.toLocaleString()}/night, Status: ${p.status}, Occupancy: ${p.occupancyRate}%, ROI: ${p.roi}%, Monthly Revenue: ฿${p.monthlyRevenue?.toLocaleString()}, Total Revenue: ฿${p.totalRevenue?.toLocaleString()}, Booking Revenue: ฿${p.bookingRevenue?.toLocaleString()}, Last Booking: ${p.lastBookingDate || 'None'}, Total Bookings: ${p.bookingCount}, Recent Bookings (30d): ${p.recentBookingCount}`).join('\n')}

Recent Tasks (${organizationData.tasks.length}):
${organizationData.tasks.map(t => `- ${t.title} (${t.status}, ${t.priority}, ${t.propertyName}, due: ${t.dueDate})`).join('\n')}

Recent Bookings (${organizationData.bookings.length}):
${organizationData.bookings.map(b => `- ${b.guestName} at ${b.propertyName} (${b.checkIn} to ${b.checkOut}), ฿${b.totalAmount}, ${b.status}`).join('\n')}

Recent Finance Records (${organizationData.finances.length}):
${organizationData.finances.map(f => `- ${f.type}: ${f.category} ฿${f.amount} (${f.date})`).join('\n')}

Finance Analytics Summary:
${financeAnalytics ? `- Total Revenue: ฿${financeAnalytics.totalRevenue?.toLocaleString() || 0}
- Total Expenses: ฿${financeAnalytics.totalExpenses?.toLocaleString() || 0}
- Net Profit: ฿${financeAnalytics.netProfit?.toLocaleString() || 0}
- Profit Margin: ${(financeAnalytics.netProfit && financeAnalytics.totalRevenue) ? ((financeAnalytics.netProfit / financeAnalytics.totalRevenue) * 100).toFixed(1) : 0}%
- Total Transactions: ${financeAnalytics.transactionCount || 0}` : 'Finance analytics not available'}

Staff Members (${organizationData.staffSalaries.length}):
${organizationData.staffSalaries.length > 0 ? organizationData.staffSalaries.map((s: any) => `- ${s.firstName} ${s.lastName} (${s.employeeId}): ${s.position} in ${s.department}, Salary: ฿${s.monthlySalary || s.hourlyRate || 0}/month, Email: ${s.email || 'N/A'}, Status: ${s.status || 'active'}, Started: ${s.startDate || 'N/A'}`).join('\n') : 'No staff members found'}

Utility Bills (${organizationData.utilityBills.length}):
${organizationData.utilityBills.length > 0 ? organizationData.utilityBills.map((u: any) => `- ${u.utilityType}: ฿${u.amount}, Property: ${u.propertyName || u.propertyId}, Status: ${u.status}, Due: ${u.dueDate}`).join('\n') : 'No utility bills found'}

Utility Accounts (${organizationData.utilityAccounts.length}):
${organizationData.utilityAccounts.length > 0 ? organizationData.utilityAccounts.map((a: any) => `- ${a.utilityType}: ${a.accountNumber}, Property: ${a.propertyName || a.propertyId}, Provider: ${a.providerName}`).join('\n') : 'No utility accounts found'}

Owner Payouts (${organizationData.ownerPayouts.length}):
${organizationData.ownerPayouts.length > 0 ? organizationData.ownerPayouts.map((p: any) => `- Owner: ${p.ownerName || p.ownerId}, ฿${p.amount}, Period: ${p.period}, Status: ${p.status}`).join('\n') : 'No owner payouts found'}

Property Documents (${organizationData.propertyDocuments.length}):
${organizationData.propertyDocuments.length > 0 ? organizationData.propertyDocuments.map((d: any) => `- ${d.documentType}: ${d.documentName}, Property: ${d.propertyName || d.propertyId}, Expires: ${d.expiryDate || 'N/A'}`).join('\n') : 'No documents found'}

Expiring Documents within 30 days (${organizationData.expiringDocuments.length}):
${organizationData.expiringDocuments.length > 0 ? organizationData.expiringDocuments.map((d: any) => `- ${d.title || d.originalFilename} (Category: ${d.category}, Expires: ${d.expirationDate}, Property: ${d.propertyId})`).join('\n') : 'No expiring documents'}

Invoices (${organizationData.invoices.length}):
${organizationData.invoices.length > 0 ? organizationData.invoices.map((i: any) => `- #${i.invoiceNumber}: ฿${i.totalAmount}, Type: ${i.type}, Status: ${i.status}, Due: ${i.dueDate}`).join('\n') : 'No invoices found'}`;

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
- "Revenue from [property name] in March 2025" → {"type": "revenue", "filters": {"property": "[property name]", "dateRange": {"start": "2025-03-01", "end": "2025-03-31"}}}
- "Electric charges for [property name] in May" → {"type": "expenses", "filters": {"property": "[property name]", "category": "electric", "dateRange": {"start": "2025-05-01", "end": "2025-05-31"}}}

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
      "What were our total expenses last month?",
      "How many properties are currently active?",
      "What tasks are overdue?",
      "Show me electric charges for this year",
      "What's our total revenue for this year?",
      "Which properties have bookings this week?",
      "What maintenance tasks are scheduled?"
    ];
  }
}

export const aiBotEngine = new AIBotEngine();