/**
 * Admin Finance Routes
 * Unified finance endpoints for the multi-tab admin interface
 */

import { Router } from 'express';
import { coreFinancialCalculationService } from '../services/CoreFinancialCalculationService';
import { requireAuth } from '../secureAuth';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

/**
 * GET /admin/finance/overview
 * Complete financial breakdown for dashboard
 */
router.get('/overview', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, propertyIds } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (propertyIds) filters.propertyIds = (propertyIds as string).split(',').map(Number);

    // Calculate overview using new core logic
    // For now, return demo data - would aggregate from all bookings
    const breakdown = {
      totalRevenue: 50000,
      managementFeeEarned: 7500, // 15% of revenue
      ownerPayout: 42500, // Revenue - management fee
      propertyManagerEarning: 3750, // 50% of management fee
      agentCommission: 750, // 10% of management fee
      staffWages: 5500,
      companyRetention: 3000 // Management fee - PM share - agent commission
    };

    res.json(breakdown);
  } catch (error) {
    console.error('Error calculating financial overview:', error);
    res.status(500).json({ error: 'Failed to calculate financial overview' });
  }
});

/**
 * GET /admin/finance/owner-payouts
 * Owner payout calculations with property breakdown
 */
router.get('/owner-payouts', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, propertyIds, ownerIds } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (propertyIds) filters.propertyIds = (propertyIds as string).split(',').map(Number);
    if (ownerIds) filters.ownerIds = (ownerIds as string).split(',');

    const ownerPayouts = await coreFinancialCalculationService.calculateOwnerPayouts(
      organizationId,
      filters
    );

    res.json(ownerPayouts);
  } catch (error) {
    console.error('Error calculating owner payouts:', error);
    res.status(500).json({ error: 'Failed to calculate owner payouts' });
  }
});

/**
 * GET /admin/finance/pm-earnings
 * Property manager earnings calculations
 */
router.get('/pm-earnings', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, propertyIds, managerIds } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (propertyIds) filters.propertyIds = (propertyIds as string).split(',').map(Number);
    if (managerIds) filters.managerIds = (managerIds as string).split(',');

    const pmEarnings = await coreFinancialCalculationService.calculatePropertyManagerEarnings(
      organizationId,
      filters
    );

    res.json(pmEarnings);
  } catch (error) {
    console.error('Error calculating PM earnings:', error);
    res.status(500).json({ error: 'Failed to calculate PM earnings' });
  }
});

/**
 * GET /admin/finance/agent-referral
 * Agent referral commission calculations
 */
router.get('/agent-referral', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, agentIds } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (agentIds) filters.agentIds = (agentIds as string).split(',');

    // For now, return demo data - would calculate from actual agent referrals
    const agentEarnings = [
      {
        stakeholderId: 'referral-agent-1',
        stakeholderName: 'Sarah Johnson',
        stakeholderType: 'agent_referral',
        earnings: {
          gross: 5000,
          net: 500, // 10% of management fee
          deductions: 0,
          status: 'pending'
        },
        properties: [
          {
            propertyId: 1,
            propertyName: 'Villa Majesta',
            revenue: 5000,
            commission: 500
          }
        ]
      }
    ];

    res.json(agentEarnings);
  } catch (error) {
    console.error('Error calculating agent referral earnings:', error);
    res.status(500).json({ error: 'Failed to calculate agent referral earnings' });
  }
});

/**
 * GET /admin/finance/agent-retail
 * Agent retail commission calculations
 */
router.get('/agent-retail', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const { startDate, endDate, agentIds } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (agentIds) filters.agentIds = (agentIds as string).split(',');

    // For now, return demo data - would calculate from actual retail bookings
    const agentEarnings = [
      {
        stakeholderId: 'retail-agent-1',
        stakeholderName: 'Mike Chen',
        stakeholderType: 'agent_retail',
        earnings: {
          gross: 8000,
          net: 800, // 10% of management fee or gross (configurable)
          deductions: 0,
          status: 'pending'
        },
        properties: [
          {
            propertyId: 2,
            propertyName: 'Villa Paradise',
            revenue: 8000,
            commission: 800
          }
        ]
      }
    ];

    res.json(agentEarnings);
  } catch (error) {
    console.error('Error calculating agent retail earnings:', error);
    res.status(500).json({ error: 'Failed to calculate agent retail earnings' });
  }
});

/**
 * GET /admin/finance/staff-wages
 * Staff wage calculations
 */
router.get('/staff-wages', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    
    // Get staff wage configurations using new core logic
    const staffConfigs = await coreFinancialCalculationService.getStaffWageConfigs(organizationId);
    
    const staffWages = staffConfigs.map(config => ({
      stakeholderId: config.userId,
      stakeholderName: config.userName,
      stakeholderType: 'staff',
      department: config.department,
      earnings: {
        gross: config.monthlyWage,
        net: config.monthlyWage, // Simplified - would subtract deductions
        deductions: 0,
        status: 'pending'
      },
      billTo: config.billTo,
      propertyId: config.propertyId,
      properties: config.propertyId ? [
        { propertyId: config.propertyId, propertyName: `Property ${config.propertyId}` }
      ] : []
    }));

    res.json(staffWages);
  } catch (error) {
    console.error('Error calculating staff wages:', error);
    res.status(500).json({ error: 'Failed to calculate staff wages' });
  }
});

/**
 * GET /admin/finance/commission-settings
 * Get current commission settings
 */
router.get('/commission-settings', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const settings = await coreFinancialCalculationService.getCommissionSettings(organizationId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    res.status(500).json({ error: 'Failed to fetch commission settings' });
  }
});

/**
 * PUT /admin/finance/commission-settings
 * Update commission settings
 */
router.put('/commission-settings', async (req, res) => {
  try {
    const { organizationId } = req.user!;
    const settings = req.body;

    // In a real implementation, you'd save these to a database table
    // For now, just return the settings as confirmation
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating commission settings:', error);
    res.status(500).json({ error: 'Failed to update commission settings' });
  }
});

/**
 * POST /admin/finance/mark-paid
 * Mark a payout/commission as paid
 */
router.post('/mark-paid', async (req, res) => {
  try {
    const { stakeholderId, stakeholderType, amount, paymentMethod, receiptUrl, notes } = req.body;

    // In a real implementation, you'd update the database records and create payment records
    // For now, just return success
    res.json({
      success: true,
      paymentId: `payment_${Date.now()}`,
      paidAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ error: 'Failed to mark payment as paid' });
  }
});

/**
 * GET /admin/finance/export/:type
 * Export financial data as CSV
 */
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query;

    // Generate CSV export data
    let csvData = '';
    let filename = '';

    switch (type) {
      case 'owner-payouts':
        csvData = 'Owner,Property,Revenue,Management Fee,Net Payout,Status\n';
        filename = 'owner-payouts.csv';
        break;
      case 'pm-earnings':
        csvData = 'Property Manager,Property,Revenue,Commission Rate,Earnings,Status\n';
        filename = 'pm-earnings.csv';
        break;
      case 'agent-referral':
        csvData = 'Agent,Referrals,Commission Rate,Earnings,Status\n';
        filename = 'agent-referral.csv';
        break;
      case 'agent-retail':
        csvData = 'Agent,Bookings,Commission Rate,Earnings,Status\n';
        filename = 'agent-retail.csv';
        break;
      case 'staff-wages':
        csvData = 'Staff Member,Position,Hours,Rate,Gross,Deductions,Net,Status\n';
        filename = 'staff-wages.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;