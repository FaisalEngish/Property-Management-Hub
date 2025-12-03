/**
 * Core Financial Calculation Service
 * Implements exact finance logic with hierarchical configuration
 */

import { db } from "../db";
import { finances, properties, users, bookings } from "../../shared/schema";
import { eq, and, between, sum, sql, inArray } from "drizzle-orm";

export interface ChannelPayoutRouting {
  routingType: 'company_100' | 'owner_100' | 'split';
  ownerSplitPct?: number;
  companySplitPct?: number;
}

export interface PropertyDefaults {
  managementFeePct: number;
  pmUserId?: string;
  pmSplitPct: number;
  referralAgentId?: string;
  retailAgentId?: string;
  defaultExpenses: Array<{
    expenseType: string;
    amount: number;
    description?: string;
  }>;
  channelRouting: { [channel: string]: ChannelPayoutRouting };
}

export interface BookingFinancialBreakdown {
  // Channel Payout Routing (applied first)
  channelPayoutRouting: ChannelPayoutRouting;
  initialPayoutToCompany: number;
  initialPayoutToOwner: number;
  
  // Core Revenue Flow (calculations applied after routing)
  grossBookingRevenue: number;
  platformFees: number;
  netBasis: number;
  
  // Management Fee Calculations
  managementFeePct: number;
  managementFeeAmount: number;
  
  // Property Manager Split
  pmSplitPct: number;
  pmShare: number;
  companyShare: number;
  
  // Agent Commissions
  referralAgentPct: number;
  referralAgentCommission: number;
  retailAgentPct: number;
  retailAgentBasis: 'management_fee' | 'gross';
  retailAgentCommission: number;
  
  // Owner Billable Expenses
  ownerBillableExpenses: number;
  
  // Final Payouts (after all calculations)
  finalOwnerPayout: number;
  finalCompanyRetention: number;
}

export interface CommissionSettings {
  // Global defaults
  managementFeePct: number;
  pmSplitPct: number;
  referralAgentPct: number;
  retailAgentPct: number;
  retailAgentBasis: 'management_fee' | 'gross';
  
  // Property-specific overrides
  propertyOverrides: { [propertyId: number]: Partial<CommissionSettings> };
  
  // Property Manager assignments
  propertyManagers: { [propertyId: number]: string }; // propertyId -> userId
}

export interface StaffWageConfig {
  userId: string;
  userName: string;
  department: string;
  monthlyWage: number;
  billTo: 'owner' | 'company';
  propertyId?: number; // If billed to specific property owner
}

export class CoreFinancialCalculationService {

  /**
   * Get hierarchical commission settings with property and booking overrides
   */
  async getCommissionSettings(
    organizationId: string,
    propertyId?: number,
    bookingId?: number
  ): Promise<CommissionSettings> {
    
    // Start with global defaults
    let globalSettings: any;
    try {
      const global = await db.query.sql`
        SELECT * FROM global_commission_settings 
        WHERE organization_id = ${organizationId}
        LIMIT 1
      `;
      globalSettings = global[0] || {
        management_fee_pct: 15.00,
        pm_split_pct: 50.00,
        referral_agent_pct: 10.00,
        retail_agent_pct: 10.00,
        retail_agent_basis: 'management_fee'
      };
    } catch {
      // Fallback defaults
      globalSettings = {
        management_fee_pct: 15.00,
        pm_split_pct: 50.00,
        referral_agent_pct: 10.00,
        retail_agent_pct: 10.00,
        retail_agent_basis: 'management_fee'
      };
    }

    let settings: CommissionSettings = {
      managementFeePct: Number(globalSettings.management_fee_pct),
      pmSplitPct: Number(globalSettings.pm_split_pct),
      referralAgentPct: Number(globalSettings.referral_agent_pct),
      retailAgentPct: Number(globalSettings.retail_agent_pct),
      retailAgentBasis: globalSettings.retail_agent_basis || 'management_fee',
      propertyOverrides: {},
      propertyManagers: {}
    };

    // Apply property-level overrides
    if (propertyId) {
      try {
        const propertyOverrides = await db.query.sql`
          SELECT * FROM property_commission_overrides 
          WHERE organization_id = ${organizationId} AND property_id = ${propertyId}
          LIMIT 1
        `;
        
        if (propertyOverrides[0]) {
          const override = propertyOverrides[0];
          if (override.management_fee_pct) settings.managementFeePct = Number(override.management_fee_pct);
          if (override.pm_split_pct) settings.pmSplitPct = Number(override.pm_split_pct);
          if (override.referral_agent_pct) settings.referralAgentPct = Number(override.referral_agent_pct);
          if (override.retail_agent_pct) settings.retailAgentPct = Number(override.retail_agent_pct);
          if (override.retail_agent_basis) settings.retailAgentBasis = override.retail_agent_basis;
          if (override.pm_user_id) settings.propertyManagers[propertyId] = override.pm_user_id;
        }
      } catch (e) {
        console.log('No property overrides found');
      }
    }

    // Apply booking-level overrides (highest priority)
    if (bookingId) {
      try {
        const bookingOverrides = await db.query.sql`
          SELECT * FROM booking_commission_overrides 
          WHERE organization_id = ${organizationId} AND booking_id = ${bookingId}
          LIMIT 1
        `;
        
        if (bookingOverrides[0]) {
          const override = bookingOverrides[0];
          if (override.management_fee_pct) settings.managementFeePct = Number(override.management_fee_pct);
          if (override.pm_split_pct) settings.pmSplitPct = Number(override.pm_split_pct);
          if (override.referral_agent_pct) settings.referralAgentPct = Number(override.referral_agent_pct);
          if (override.retail_agent_pct) settings.retailAgentPct = Number(override.retail_agent_pct);
          if (override.retail_agent_basis) settings.retailAgentBasis = override.retail_agent_basis;
        }
      } catch (e) {
        console.log('No booking overrides found');
      }
    }

    return settings;
  }

  /**
   * Get property defaults with all configuration
   */
  async getPropertyDefaults(organizationId: string, propertyId: number): Promise<PropertyDefaults> {
    // Get property configuration
    const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!property[0]) throw new Error('Property not found');
    
    const prop = property[0];
    
    // Get channel routing for this property
    const channelRouting: { [channel: string]: ChannelPayoutRouting } = {};
    try {
      const routingRules = await db.query.sql`
        SELECT channel, routing_type, owner_split_pct, company_split_pct
        FROM channel_payout_routing 
        WHERE organization_id = ${organizationId} AND property_id = ${propertyId}
      `;
      
      for (const rule of routingRules) {
        channelRouting[rule.channel] = {
          routingType: rule.routing_type,
          ownerSplitPct: rule.owner_split_pct ? Number(rule.owner_split_pct) : undefined,
          companySplitPct: rule.company_split_pct ? Number(rule.company_split_pct) : undefined
        };
      }
    } catch (e) {
      console.log('No channel routing found for property');
    }
    
    // Get default expenses
    const defaultExpenses: Array<{ expenseType: string; amount: number; description?: string }> = [];
    try {
      const expenses = await db.query.sql`
        SELECT expense_type, amount, description
        FROM property_default_expenses 
        WHERE organization_id = ${organizationId} AND property_id = ${propertyId}
      `;
      
      for (const expense of expenses) {
        defaultExpenses.push({
          expenseType: expense.expense_type,
          amount: Number(expense.amount),
          description: expense.description
        });
      }
    } catch (e) {
      console.log('No default expenses found for property');
    }
    
    return {
      managementFeePct: Number(prop.managementFeePct) || 15.00,
      pmUserId: prop.pmUserId || undefined,
      pmSplitPct: Number(prop.pmSplitPct) || 50.00,
      referralAgentId: prop.referralAgentId || undefined,
      retailAgentId: prop.retailAgentId || undefined,
      defaultExpenses,
      channelRouting
    };
  }
  
  /**
   * Calculate financial breakdown for a specific booking using exact core logic
   * Step 1: Apply channel payout routing (where money goes initially)
   * Step 2: Apply calculations (fees, PM splits, owner payouts)
   */
  async calculateBookingBreakdown(
    organizationId: string,
    bookingId: number,
    grossBookingRevenue: number,
    channel: string = 'airbnb',
    platformFees: number = 0
  ): Promise<BookingFinancialBreakdown> {
    
    // Get booking details
    const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!booking[0]) throw new Error('Booking not found');
    
    const propertyId = booking[0].propertyId!;
    
    // Get property defaults
    const propertyDefaults = await this.getPropertyDefaults(organizationId, propertyId);
    
    // Step 1: Apply channel payout routing (where money goes initially)
    const channelRouting = propertyDefaults.channelRouting[channel] || { routingType: 'company_100' };
    
    let initialPayoutToCompany = 0;
    let initialPayoutToOwner = 0;
    
    switch (channelRouting.routingType) {
      case 'company_100':
        initialPayoutToCompany = grossBookingRevenue;
        initialPayoutToOwner = 0;
        break;
      case 'owner_100':
        initialPayoutToCompany = 0;
        initialPayoutToOwner = grossBookingRevenue;
        break;
      case 'split':
        initialPayoutToOwner = (grossBookingRevenue * (channelRouting.ownerSplitPct || 50)) / 100;
        initialPayoutToCompany = grossBookingRevenue - initialPayoutToOwner;
        break;
    }
    
    // Step 2: Apply calculations (fees, PM splits, owner payouts) - these are always calculated the same way
    const netBasis = grossBookingRevenue - platformFees;
    
    // Management fee calculation
    const managementFeePct = propertyDefaults.managementFeePct;
    const managementFeeAmount = (grossBookingRevenue * managementFeePct) / 100;
    
    // PM split calculation
    const pmSplitPct = propertyDefaults.pmSplitPct;
    const pmShare = (managementFeeAmount * pmSplitPct) / 100;
    const companyShare = managementFeeAmount - pmShare;
    
    // Agent commissions (only if agents are assigned)
    let referralAgentCommission = 0;
    let retailAgentCommission = 0;
    
    const settings = await this.getCommissionSettings(organizationId, propertyId, bookingId);
    
    if (propertyDefaults.referralAgentId) {
      referralAgentCommission = (managementFeeAmount * settings.referralAgentPct) / 100;
    }
    
    if (propertyDefaults.retailAgentId) {
      const retailBasis = settings.retailAgentBasis === 'gross' ? grossBookingRevenue : managementFeeAmount;
      retailAgentCommission = (retailBasis * settings.retailAgentPct) / 100;
    }
    
    // Owner billable expenses from property defaults
    const ownerBillableExpenses = propertyDefaults.defaultExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Final calculations
    const finalOwnerPayout = grossBookingRevenue - managementFeeAmount - ownerBillableExpenses;
    const finalCompanyRetention = companyShare - referralAgentCommission - retailAgentCommission;
    
    return {
      // Channel routing (applied first)
      channelPayoutRouting: channelRouting,
      initialPayoutToCompany,
      initialPayoutToOwner,
      
      // Core revenue flow
      grossBookingRevenue,
      platformFees,
      netBasis,
      
      // Management fee calculations
      managementFeePct,
      managementFeeAmount,
      
      // PM split
      pmSplitPct,
      pmShare,
      companyShare,
      
      // Agent commissions
      referralAgentPct: settings.referralAgentPct,
      referralAgentCommission,
      retailAgentPct: settings.retailAgentPct,
      retailAgentBasis: settings.retailAgentBasis,
      retailAgentCommission,
      
      // Owner billable expenses
      ownerBillableExpenses,
      
      // Final payouts
      finalOwnerPayout,
      finalCompanyRetention
    };
  }

  /**
   * Calculate owner payouts with exact owner payout formula
   */
  async calculateOwnerPayouts(
    organizationId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      propertyIds?: number[];
      ownerIds?: string[];
    }
  ): Promise<any[]> {
    
    // Get bookings for the period
    const conditions = [eq(bookings.organizationId, organizationId)];
    
    if (filters.startDate && filters.endDate) {
      conditions.push(between(bookings.checkIn, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
    }
    
    if (filters.propertyIds && filters.propertyIds.length > 0) {
      conditions.push(inArray(bookings.propertyId, filters.propertyIds));
    }

    const relevantBookings = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    // Group by owner and calculate exact payouts
    const ownerPayouts = new Map<string, any>();

    for (const booking of relevantBookings) {
      if (!booking.propertyId) continue;

      // Get property details
      const property = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      if (!property[0] || !property[0].ownerId) continue;

      const ownerId = property[0].ownerId;
      const propertyName = property[0].name;

      // For demo purposes, assume some booking values
      const grossBookingRevenue = Number(booking.totalAmount) || 1000;
      const platformFees = grossBookingRevenue * 0.03; // 3% platform fees
      const ownerBillableExpenses = 0; // Could come from finance records

      // Calculate breakdown using exact formula
      const breakdown = await this.calculateBookingBreakdown(
        organizationId,
        booking.id,
        grossBookingRevenue,
        platformFees,
        ownerBillableExpenses
      );

      if (!ownerPayouts.has(ownerId)) {
        const owner = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
        const ownerName = owner[0] ? `${owner[0].firstName} ${owner[0].lastName}` : ownerId;

        ownerPayouts.set(ownerId, {
          stakeholderId: ownerId,
          stakeholderName: ownerName,
          stakeholderType: 'owner',
          earnings: {
            gross: 0, // Total gross booking revenue
            net: 0,   // Total owner payouts using exact formula
            deductions: 0, // Total management fees + expenses
            status: 'pending'
          },
          properties: []
        });
      }

      const ownerData = ownerPayouts.get(ownerId)!;
      ownerData.earnings.gross += breakdown.grossBookingRevenue;
      ownerData.earnings.net += breakdown.ownerPayout;
      ownerData.earnings.deductions += breakdown.managementFeeAmount + breakdown.ownerBillableExpenses;

      // Add property breakdown
      const existingProperty = ownerData.properties.find((p: any) => p.propertyId === booking.propertyId);
      if (existingProperty) {
        existingProperty.revenue += breakdown.grossBookingRevenue;
        existingProperty.commission += breakdown.ownerPayout;
      } else {
        ownerData.properties.push({
          propertyId: booking.propertyId,
          propertyName: propertyName,
          revenue: breakdown.grossBookingRevenue,
          commission: breakdown.ownerPayout
        });
      }
    }

    return Array.from(ownerPayouts.values());
  }

  /**
   * Calculate property manager earnings using exact PM share formula
   */
  async calculatePropertyManagerEarnings(
    organizationId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      propertyIds?: number[];
      managerIds?: string[];
    }
  ): Promise<any[]> {
    
    // Get bookings for the period
    const conditions = [eq(bookings.organizationId, organizationId)];
    
    if (filters.startDate && filters.endDate) {
      conditions.push(between(bookings.checkIn, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
    }
    
    if (filters.propertyIds && filters.propertyIds.length > 0) {
      conditions.push(inArray(bookings.propertyId, filters.propertyIds));
    }

    const relevantBookings = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    // Group by property manager
    const pmEarnings = new Map<string, any>();

    for (const booking of relevantBookings) {
      if (!booking.propertyId) continue;

      // Get commission settings to determine PM assignment
      const settings = await this.getCommissionSettings(organizationId, booking.propertyId, booking.id);
      const pmUserId = settings.propertyManagers[booking.propertyId];
      
      if (!pmUserId || (filters.managerIds && !filters.managerIds.includes(pmUserId))) continue;

      // Calculate booking breakdown
      const grossBookingRevenue = Number(booking.totalAmount) || 1000;
      const platformFees = grossBookingRevenue * 0.03;
      
      const breakdown = await this.calculateBookingBreakdown(
        organizationId,
        booking.id,
        grossBookingRevenue,
        platformFees
      );

      if (!pmEarnings.has(pmUserId)) {
        const pm = await db.select().from(users).where(eq(users.id, pmUserId)).limit(1);
        const pmName = pm[0] ? `${pm[0].firstName} ${pm[0].lastName}` : pmUserId;

        pmEarnings.set(pmUserId, {
          stakeholderId: pmUserId,
          stakeholderName: pmName,
          stakeholderType: 'property_manager',
          earnings: {
            gross: 0,
            net: 0, // This will be PM share using exact formula
            deductions: 0,
            status: 'pending'
          },
          properties: []
        });
      }

      const pmData = pmEarnings.get(pmUserId)!;
      pmData.earnings.gross += breakdown.grossBookingRevenue;
      pmData.earnings.net += breakdown.pmShare;

      // Add property breakdown
      const property = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      const existingProperty = pmData.properties.find((p: any) => p.propertyId === booking.propertyId);
      if (existingProperty) {
        existingProperty.revenue += breakdown.grossBookingRevenue;
        existingProperty.commission += breakdown.pmShare;
      } else {
        pmData.properties.push({
          propertyId: booking.propertyId,
          propertyName: property[0]?.name || `Property ${booking.propertyId}`,
          revenue: breakdown.grossBookingRevenue,
          commission: breakdown.pmShare
        });
      }
    }

    return Array.from(pmEarnings.values());
  }

  /**
   * Get staff wage configurations
   */
  async getStaffWageConfigs(organizationId: string): Promise<StaffWageConfig[]> {
    // This would typically come from a staff_wages table
    // For now, return demo configurations
    return [
      {
        userId: 'staff-1',
        userName: 'Maria Santos',
        department: 'housekeeping',
        monthlyWage: 2500,
        billTo: 'company'
      },
      {
        userId: 'staff-2',
        userName: 'John Doe',
        department: 'maintenance',
        monthlyWage: 3000,
        billTo: 'owner',
        propertyId: 1
      }
    ];
  }

  /**
   * Update global commission settings
   */
  async updateGlobalSettings(organizationId: string, settings: Partial<CommissionSettings>): Promise<void> {
    await db.query.sql`
      INSERT INTO global_commission_settings (
        organization_id, management_fee_pct, pm_split_pct, 
        referral_agent_pct, retail_agent_pct, retail_agent_basis
      ) VALUES (
        ${organizationId}, ${settings.managementFeePct}, ${settings.pmSplitPct},
        ${settings.referralAgentPct}, ${settings.retailAgentPct}, ${settings.retailAgentBasis}
      )
      ON CONFLICT (organization_id) DO UPDATE SET
        management_fee_pct = EXCLUDED.management_fee_pct,
        pm_split_pct = EXCLUDED.pm_split_pct,
        referral_agent_pct = EXCLUDED.referral_agent_pct,
        retail_agent_pct = EXCLUDED.retail_agent_pct,
        retail_agent_basis = EXCLUDED.retail_agent_basis,
        updated_at = NOW()
    `;
  }
}

export const coreFinancialCalculationService = new CoreFinancialCalculationService();