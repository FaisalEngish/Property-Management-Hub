// Optimized API routes for Finance Hub and System Hub
// Server-side pagination and combined endpoints for better performance

import { Router } from 'express';
import { storage } from './storage';
import { isDemoAuthenticated } from './demoAuth';

const router = Router();

// Finance Hub Summary Endpoint - Single API call with paginated data
router.get('/api/finance-hub/summary', isDemoAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get analytics summary (fast aggregated data)
    const [finances, analytics] = await Promise.all([
      storage.getFinances({ 
        organizationId: req.user?.organizationId || 'default-org',
        limit: Number(limit),
        offset,
        type: type as string
      }),
      storage.getFinanceAnalytics({ organizationId: req.user?.organizationId || 'default-org' })
    ]);

    // Get total count for pagination
    const totalCount = await storage.getFinanceCount({ 
      organizationId: req.user?.organizationId || 'default-org',
      type: type as string
    });

    res.json({
      summary: {
        totalRevenue: analytics.totalRevenue || 0,
        totalExpenses: analytics.totalExpenses || 0,
        netProfit: (analytics.totalRevenue || 0) - (analytics.totalExpenses || 0),
        monthlyGrowth: analytics.monthlyGrowth || 0,
        transactionCount: totalCount
      },
      transactions: finances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        hasNext: offset + Number(limit) < totalCount,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Finance hub summary error:', error);
    res.status(500).json({ message: 'Failed to fetch finance summary' });
  }
});

// Utility Tracker Summary with pagination
router.get('/api/utilities-hub/summary', isDemoAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [utilities, summary] = await Promise.all([
      storage.getUtilities({ 
        organizationId: req.user?.organizationId || 'default-org',
        limit: Number(limit),
        offset,
        status: status as string,
        type: type as string
      }),
      storage.getUtilitySummary({ organizationId: req.user?.organizationId || 'default-org' })
    ]);

    const totalCount = await storage.getUtilityCount({ 
      organizationId: req.user?.organizationId || 'default-org',
      status: status as string,
      type: type as string
    });

    res.json({
      summary: {
        totalPaid: summary.totalPaid || 0,
        totalPending: summary.totalPending || 0,
        totalOverdue: summary.totalOverdue || 0,
        monthlyAverage: summary.monthlyAverage || 0,
        utilityCount: totalCount
      },
      utilities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        hasNext: offset + Number(limit) < totalCount,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Utilities hub summary error:', error);
    res.status(500).json({ message: 'Failed to fetch utilities summary' });
  }
});

// Invoice Generator Summary with pagination
router.get('/api/invoices-hub/summary', isDemoAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [invoices, summary] = await Promise.all([
      storage.getInvoices({ 
        organizationId: req.user?.organizationId || 'default-org',
        limit: Number(limit),
        offset,
        status: status as string
      }),
      storage.getInvoiceSummary({ organizationId: req.user?.organizationId || 'default-org' })
    ]);

    const totalCount = await storage.getInvoiceCount({ 
      organizationId: req.user?.organizationId || 'default-org',
      status: status as string
    });

    res.json({
      summary: {
        totalInvoices: totalCount,
        totalPaid: summary.totalPaid || 0,
        totalPending: summary.totalPending || 0,
        totalOverdue: summary.totalOverdue || 0,
        averageInvoiceValue: summary.averageValue || 0
      },
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        hasNext: offset + Number(limit) < totalCount,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Invoices hub summary error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices summary' });
  }
});

// System Hub Summary - Combined system stats
router.get('/api/system-hub/summary', isDemoAuthenticated, async (req, res) => {
  try {
    const [userStats, systemStats, recentActivity] = await Promise.all([
      storage.getUserStats({ organizationId: req.user?.organizationId || 'default-org' }),
      storage.getSystemStats({ organizationId: req.user?.organizationId || 'default-org' }),
      storage.getRecentActivity({ 
        organizationId: req.user?.organizationId || 'default-org',
        limit: 10
      })
    ]);

    res.json({
      userStats: {
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        newUsersThisMonth: userStats.newUsersThisMonth || 0,
        usersByRole: userStats.usersByRole || {}
      },
      systemStats: {
        totalProperties: systemStats.totalProperties || 0,
        activeTasks: systemStats.activeTasks || 0,
        systemUptime: systemStats.uptime || '99.9%',
        apiCallsToday: systemStats.apiCallsToday || 0
      },
      recentActivity
    });
  } catch (error) {
    console.error('System hub summary error:', error);
    res.status(500).json({ message: 'Failed to fetch system summary' });
  }
});

// Chart data endpoints - loaded on demand
router.get('/api/charts/finance-trends', isDemoAuthenticated, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const trends = await storage.getFinanceTrends({ 
      organizationId: req.user?.organizationId || 'default-org',
      period: period as string
    });
    
    res.json(trends);
  } catch (error) {
    console.error('Finance trends error:', error);
    res.status(500).json({ message: 'Failed to fetch finance trends' });
  }
});

router.get('/api/charts/utility-usage', isDemoAuthenticated, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const usage = await storage.getUtilityUsageTrends({ 
      organizationId: req.user?.organizationId || 'default-org',
      period: period as string
    });
    
    res.json(usage);
  } catch (error) {
    console.error('Utility usage error:', error);
    res.status(500).json({ message: 'Failed to fetch utility usage' });
  }
});

router.get('/api/charts/system-performance', isDemoAuthenticated, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const performance = await storage.getSystemPerformance({ 
      organizationId: req.user?.organizationId || 'default-org',
      period: period as string
    });
    
    res.json(performance);
  } catch (error) {
    console.error('System performance error:', error);
    res.status(500).json({ message: 'Failed to fetch system performance' });
  }
});

export default router;