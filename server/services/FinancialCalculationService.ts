/**
 * Unified Financial Calculation Service
 * 
 * This service ensures that Owner payouts, Property Manager earnings, 
 * Agent commissions, and Staff wages all stay perfectly aligned with 
 * the company's actual revenue, percentages, and contracts.
 */

import { db } from "../db";
import { finances, properties, users, bookings, propertyCommissionRules } from "../../shared/schema";
import { eq, and, between, sum, sql, inArray } from "drizzle-orm";

export interface FinancialBreakdown {
  totalRevenue: number;
  managementFeeEarned: number;
  ownerPayout: number;
  propertyManagerEarning: number;
  agentCommission: number;
  staffWages: number;
  companyRetention: number;
}

export interface StakeholderEarning {
  stakeholderId: string;
  stakeholderName: string;
  stakeholderType: 'owner' | 'property_manager' | 'agent_referral' | 'agent_retail' | 'staff';
  earnings: {
    gross: number;
    net: number;
    deductions: number;
    status: 'pending' | 'queued' | 'paid';
  };
  properties: Array<{
    propertyId: number;
    propertyName: string;
    revenue: number;
    commission: number;
  }>;
}

export interface CommissionSettings {
  propertyManagerSplits: Record<string, { // userId -> split config
    splitPercentage: number; // e.g., 50 for 50/50 split
    properties: number[]; // properties they manage
  }>;
  ownerContractRates: Record<number, number>; // propertyId -> management fee percentage
  agentCommissionRates: {
    referral: number;
    retail: number;
  };
  staffWageRates: Record<string, number>; // userId -> hourly/monthly rate
}

export class FinancialCalculationService {
  
  /**
   * Calculate complete financial breakdown for a given period
   */
  async calculateFinancialBreakdown(
    organizationId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      propertyIds?: number[];
    }
  ): Promise<FinancialBreakdown> {
    
    // Build query conditions
    const conditions = [eq(finances.organizationId, organizationId)];
    
    if (filters.startDate && filters.endDate) {
      conditions.push(between(finances.date, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
    }
    
    if (filters.propertyIds && filters.propertyIds.length > 0) {
      conditions.push(inArray(finances.propertyId, filters.propertyIds));
    }

    // Get all financial records for the period
    const financialRecords = await db
      .select()
      .from(finances)
      .where(and(...conditions));

    // Calculate totals
    const totalRevenue = financialRecords
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Management fees earned (company's share)
    const managementFeeEarned = financialRecords
      .filter(f => f.category === 'management_fee' && f.type === 'income')
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Owner payouts (net amount to owners after management fees)
    const ownerPayout = financialRecords
      .filter(f => f.type === 'payout' && f.category === 'owner_payout')
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Property manager earnings (their share of management fees)
    const propertyManagerEarning = financialRecords
      .filter(f => f.type === 'commission' && f.category === 'property_manager_commission')
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Agent commissions
    const agentCommission = financialRecords
      .filter(f => f.type === 'commission' && (f.category === 'agent_referral' || f.category === 'agent_retail'))
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Staff wages
    const staffWages = financialRecords
      .filter(f => f.type === 'expense' && f.category === 'staff_wages')
      .reduce((sum, f) => sum + Number(f.amount), 0);

    // Company retention (what's left after all payouts)
    const companyRetention = managementFeeEarned - propertyManagerEarning - agentCommission;

    return {
      totalRevenue,
      managementFeeEarned,
      ownerPayout,
      propertyManagerEarning,
      agentCommission,
      staffWages,
      companyRetention
    };
  }

  /**
   * Calculate owner payouts with property breakdown
   */
  async calculateOwnerPayouts(
    organizationId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      propertyIds?: number[];
      ownerIds?: string[];
    }
  ): Promise<StakeholderEarning[]> {
    
    // Get properties with their owners
    let propertiesQuery = db
      .select({
        id: properties.id,
        name: properties.name,
        ownerId: properties.ownerId,
        contractRate: properties.managementFeePercentage
      })
      .from(properties)
      .where(eq(properties.organizationId, organizationId));

    if (filters.propertyIds && filters.propertyIds.length > 0) {
      propertiesQuery = propertiesQuery.where(inArray(properties.id, filters.propertyIds));
    }

    const propertiesData = await propertiesQuery;

    // Get financial data for these properties
    const conditions = [
      eq(finances.organizationId, organizationId),
      eq(finances.type, 'income')
    ];

    if (filters.startDate && filters.endDate) {
      conditions.push(between(finances.date, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
    }

    const revenues = await db
      .select()
      .from(finances)
      .where(and(...conditions));

    // Group by owner
    const ownerPayouts = new Map<string, StakeholderEarning>();

    for (const property of propertiesData) {
      if (!property.ownerId) continue;

      const propertyRevenues = revenues.filter(r => r.propertyId === property.id);
      const grossRevenue = propertyRevenues.reduce((sum, r) => sum + Number(r.amount), 0);
      
      // Calculate management fee and net payout
      const contractRate = Number(property.contractRate) || 15; // Default 15%
      const managementFee = (grossRevenue * contractRate) / 100;
      const netPayout = grossRevenue - managementFee;

      if (!ownerPayouts.has(property.ownerId)) {
        // Get owner details
        const owner = await db.select().from(users).where(eq(users.id, property.ownerId)).limit(1);
        const ownerName = owner[0] ? `${owner[0].firstName} ${owner[0].lastName}` : property.ownerId;

        ownerPayouts.set(property.ownerId, {
          stakeholderId: property.ownerId,
          stakeholderName: ownerName,
          stakeholderType: 'owner',
          earnings: {
            gross: 0,
            net: 0,
            deductions: 0,
            status: 'pending'
          },
          properties: []
        });
      }

      const ownerData = ownerPayouts.get(property.ownerId)!;
      ownerData.earnings.gross += grossRevenue;
      ownerData.earnings.net += netPayout;
      ownerData.earnings.deductions += managementFee;
      
      ownerData.properties.push({
        propertyId: property.id,
        propertyName: property.name,
        revenue: grossRevenue,
        commission: netPayout
      });
    }

    return Array.from(ownerPayouts.values());
  }

  /**
   * Calculate property manager earnings
   */
  async calculatePropertyManagerEarnings(
    organizationId: string,
    settings: CommissionSettings,
    filters: {
      startDate?: Date;
      endDate?: Date;
      propertyIds?: number[];
      managerIds?: string[];
    }
  ): Promise<StakeholderEarning[]> {
    
    const earnings = new Map<string, StakeholderEarning>();

    // For each property manager in settings
    for (const [managerId, config] of Object.entries(settings.propertyManagerSplits)) {
      if (filters.managerIds && !filters.managerIds.includes(managerId)) continue;

      const managerProperties = config.properties.filter(pid => 
        !filters.propertyIds || filters.propertyIds.includes(pid)
      );

      let totalManagerEarnings = 0;
      const propertyBreakdown = [];

      for (const propertyId of managerProperties) {
        // Get property revenue
        const conditions = [
          eq(finances.organizationId, organizationId),
          eq(finances.propertyId, propertyId),
          eq(finances.type, 'income')
        ];

        if (filters.startDate && filters.endDate) {
          conditions.push(between(finances.date, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
        }

        const propertyRevenue = await db
          .select()
          .from(finances)
          .where(and(...conditions));

        const grossRevenue = propertyRevenue.reduce((sum, r) => sum + Number(r.amount), 0);
        
        // Get owner contract rate for this property
        const ownerContractRate = settings.ownerContractRates[propertyId] || 15;
        const managementFeeTotal = (grossRevenue * ownerContractRate) / 100;
        
        // Manager's share based on their split
        const managerShare = (managementFeeTotal * config.splitPercentage) / 100;
        totalManagerEarnings += managerShare;

        const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
        
        propertyBreakdown.push({
          propertyId,
          propertyName: property[0]?.name || `Property ${propertyId}`,
          revenue: grossRevenue,
          commission: managerShare
        });
      }

      // Get manager details
      const manager = await db.select().from(users).where(eq(users.id, managerId)).limit(1);
      const managerName = manager[0] ? `${manager[0].firstName} ${manager[0].lastName}` : managerId;

      earnings.set(managerId, {
        stakeholderId: managerId,
        stakeholderName: managerName,
        stakeholderType: 'property_manager',
        earnings: {
          gross: totalManagerEarnings,
          net: totalManagerEarnings, // Assuming no deductions for now
          deductions: 0,
          status: 'pending'
        },
        properties: propertyBreakdown
      });
    }

    return Array.from(earnings.values());
  }

  /**
   * Calculate agent commission earnings
   */
  async calculateAgentEarnings(
    organizationId: string,
    agentType: 'referral' | 'retail',
    filters: {
      startDate?: Date;
      endDate?: Date;
      agentIds?: string[];
    }
  ): Promise<StakeholderEarning[]> {
    
    const conditions = [
      eq(finances.organizationId, organizationId),
      eq(finances.type, 'commission'),
      eq(finances.category, `agent_${agentType}`)
    ];

    if (filters.startDate && filters.endDate) {
      conditions.push(between(finances.date, filters.startDate.toISOString().split('T')[0], filters.endDate.toISOString().split('T')[0]));
    }

    if (filters.agentIds && filters.agentIds.length > 0) {
      conditions.push(inArray(finances.agentId, filters.agentIds));
    }

    const commissions = await db
      .select()
      .from(finances)
      .where(and(...conditions));

    // Group by agent
    const agentEarnings = new Map<string, StakeholderEarning>();

    for (const commission of commissions) {
      if (!commission.agentId) continue;

      if (!agentEarnings.has(commission.agentId)) {
        const agent = await db.select().from(users).where(eq(users.id, commission.agentId)).limit(1);
        const agentName = agent[0] ? `${agent[0].firstName} ${agent[0].lastName}` : commission.agentId;

        agentEarnings.set(commission.agentId, {
          stakeholderId: commission.agentId,
          stakeholderName: agentName,
          stakeholderType: `agent_${agentType}` as 'agent_referral' | 'agent_retail',
          earnings: {
            gross: 0,
            net: 0,
            deductions: 0,
            status: 'pending'
          },
          properties: []
        });
      }

      const agentData = agentEarnings.get(commission.agentId)!;
      const commissionAmount = Number(commission.amount);
      agentData.earnings.gross += commissionAmount;
      agentData.earnings.net += commissionAmount;

      // Add property breakdown if exists
      if (commission.propertyId) {
        const existingProperty = agentData.properties.find(p => p.propertyId === commission.propertyId);
        if (existingProperty) {
          existingProperty.commission += commissionAmount;
        } else {
          const property = await db.select().from(properties).where(eq(properties.id, commission.propertyId)).limit(1);
          agentData.properties.push({
            propertyId: commission.propertyId,
            propertyName: property[0]?.name || `Property ${commission.propertyId}`,
            revenue: 0, // We'd need to calculate this from bookings
            commission: commissionAmount
          });
        }
      }
    }

    return Array.from(agentEarnings.values());
  }

  /**
   * Get default commission settings
   */
  async getCommissionSettings(organizationId: string): Promise<CommissionSettings> {
    // This would typically come from a settings table
    // For now, return some defaults that can be configured
    return {
      propertyManagerSplits: {
        'adam-user-id': { splitPercentage: 50, properties: [1, 2, 3] },
        'chen-user-id': { splitPercentage: 60, properties: [4, 5] },
        'yankee-user-id': { splitPercentage: 45, properties: [6, 7, 8] }
      },
      ownerContractRates: {
        1: 15, // Villa Majesta: 15%
        2: 12,
        3: 18,
        4: 15,
        5: 20
      },
      agentCommissionRates: {
        referral: 5, // 5% of booking value
        retail: 7   // 7% of booking value
      },
      staffWageRates: {
        'staff-1': 2500, // Monthly salary
        'staff-2': 3000,
        'staff-3': 2200
      }
    };
  }
}

export const financialCalculationService = new FinancialCalculationService();