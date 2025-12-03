import { db } from "../db";
import { 
  commissionPayouts,
  portfolioAssignments,
  pmCommissionBalance,
  pmPayoutRequests,
  bookings,
  properties
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

interface CalculateCommissionParams {
  organizationId: string;
  managerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  propertyId?: string; // optional filter
}

interface CommissionBreakdown {
  propertyId: number;
  propertyName: string;
  commission: number;
  bookingCount: number;
  totalRevenue: number;
}

interface CalculateCommissionResult {
  totalCommission: number;
  currency: string;
  breakdownByProperty: CommissionBreakdown[];
  rawItems: any[];
}

/**
 * Calculate manager commission for a specific period
 * Uses commissionPayouts table to get commission records
 */
export async function calculateManagerCommissionForPeriod(
  params: CalculateCommissionParams
): Promise<CalculateCommissionResult> {
  const { organizationId, managerId, startDate, endDate, propertyId } = params;

  // Build the query conditions
  const conditions = [
    eq(commissionPayouts.organizationId, organizationId),
    eq(commissionPayouts.userId, managerId),
    eq(commissionPayouts.userRole, "portfolio-manager"),
  ];

  if (propertyId) {
    conditions.push(eq(commissionPayouts.propertyId, parseInt(propertyId)));
  }

  // Get all commission records for the period (period is in YYYY-MM format)
  const startMonth = startDate.substring(0, 7);
  const endMonth = endDate.substring(0, 7);
  
  conditions.push(gte(commissionPayouts.period, startMonth));
  conditions.push(lte(commissionPayouts.period, endMonth));

  // Get all commission records
  const commissionRecords = await db
    .select({
      id: commissionPayouts.id,
      propertyId: commissionPayouts.propertyId,
      commissionAmount: commissionPayouts.finalPayoutAmount,
      status: commissionPayouts.status,
      period: commissionPayouts.period,
    })
    .from(commissionPayouts)
    .where(and(...conditions));

  // Get property details for breakdown
  const propertyIds = [...new Set(commissionRecords.map(r => r.propertyId).filter(Boolean))];
  
  let propertyData: any[] = [];
  if (propertyIds.length > 0) {
    propertyData = await db
      .select({
        id: properties.id,
        name: properties.name,
      })
      .from(properties)
      .where(
        and(
          eq(properties.organizationId, organizationId),
          sql`${properties.id} = ANY(${propertyIds})`
        )
      );
  }

  const propertyMap = new Map(propertyData.map(p => [p.id, p.name || `Property #${p.id}`]));

  // Calculate breakdown by property
  const breakdownMap = new Map<number, CommissionBreakdown>();

  for (const record of commissionRecords) {
    const { propertyId, commissionAmount } = record;
    
    if (!propertyId) continue;
    
    if (!breakdownMap.has(propertyId)) {
      breakdownMap.set(propertyId, {
        propertyId,
        propertyName: propertyMap.get(propertyId) || `Property #${propertyId}`,
        commission: 0,
        bookingCount: 0,
        totalRevenue: 0,
      });
    }

    const breakdown = breakdownMap.get(propertyId)!;
    breakdown.commission += parseFloat(commissionAmount || "0");
    breakdown.bookingCount += 1;
  }

  const breakdownByProperty = Array.from(breakdownMap.values());
  const totalCommission = breakdownByProperty.reduce((sum, b) => sum + b.commission, 0);

  return {
    totalCommission,
    currency: "USD",
    breakdownByProperty,
    rawItems: commissionRecords.map(r => ({
      bookingId: null,
      propertyId: r.propertyId || 0,
      commissionAmount: parseFloat(r.commissionAmount || "0"),
      status: r.status || "pending",
      commissionType: "monthly",
    })),
  };
}

/**
 * Get portfolio manager's properties
 */
export async function getPortfolioManagerProperties(
  organizationId: string,
  managerId: string
) {
  const assignments = await db
    .select({
      id: portfolioAssignments.id,
      propertyId: portfolioAssignments.propertyId,
      isActive: portfolioAssignments.isActive,
      propertyName: properties.name,
      propertyAddress: properties.address,
      propertyStatus: properties.status,
    })
    .from(portfolioAssignments)
    .leftJoin(properties, eq(portfolioAssignments.propertyId, properties.id))
    .where(
      and(
        eq(portfolioAssignments.organizationId, organizationId),
        eq(portfolioAssignments.managerId, managerId),
        eq(portfolioAssignments.isActive, true)
      )
    );

  return assignments;
}

/**
 * Calculate monthly earnings trend
 */
export async function calculateMonthlyTrend(
  organizationId: string,
  managerId: string,
  months: number = 6
): Promise<Array<{ period: string; earnings: number }>> {
  // Calculate last N months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const trends: Array<{ period: string; earnings: number }> = [];

  for (let i = 0; i < months; i++) {
    const periodDate = new Date(startDate);
    periodDate.setMonth(periodDate.getMonth() + i);
    const period = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;

    const commissions = await db
      .select({
        total: sql<number>`SUM(CAST(${commissionPayouts.finalPayoutAmount} AS NUMERIC))`,
      })
      .from(commissionPayouts)
      .where(
        and(
          eq(commissionPayouts.organizationId, organizationId),
          eq(commissionPayouts.userId, managerId),
          eq(commissionPayouts.userRole, "portfolio-manager"),
          eq(commissionPayouts.period, period)
        )
      );

    trends.push({
      period,
      earnings: parseFloat(commissions[0]?.total?.toString() || "0"),
    });
  }

  return trends;
}

/**
 * Get commission balance summary
 */
export async function getCommissionBalance(
  organizationId: string,
  managerId: string
): Promise<{
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  lastPayoutDate?: string;
}> {
  // Try to get balance from pmCommissionBalance table
  const [balanceRecord] = await db
    .select()
    .from(pmCommissionBalance)
    .where(
      and(
        eq(pmCommissionBalance.organizationId, organizationId),
        eq(pmCommissionBalance.managerId, managerId)
      )
    );

  if (balanceRecord) {
    return {
      totalEarned: parseFloat(balanceRecord.totalEarned || "0"),
      totalPaid: parseFloat(balanceRecord.totalPaid || "0"),
      currentBalance: parseFloat(balanceRecord.currentBalance || "0"),
      lastPayoutDate: balanceRecord.lastPayoutDate?.toISOString(),
    };
  }

  // If no balance record exists, calculate from commission payouts
  const earned = await db
    .select({
      total: sql<number>`SUM(CAST(${commissionPayouts.finalPayoutAmount} AS NUMERIC))`,
    })
    .from(commissionPayouts)
    .where(
      and(
        eq(commissionPayouts.organizationId, organizationId),
        eq(commissionPayouts.userId, managerId),
        eq(commissionPayouts.userRole, "portfolio-manager")
      )
    );

  const totalEarned = parseFloat(earned[0]?.total?.toString() || "0");

  // Get total paid from payout requests
  const paid = await db
    .select({
      total: sql<number>`SUM(CAST(${pmPayoutRequests.amount} AS NUMERIC))`,
    })
    .from(pmPayoutRequests)
    .where(
      and(
        eq(pmPayoutRequests.organizationId, organizationId),
        eq(pmPayoutRequests.managerId, managerId),
        eq(pmPayoutRequests.status, "paid")
      )
    );

  const totalPaid = parseFloat(paid[0]?.total?.toString() || "0");

  return {
    totalEarned,
    totalPaid,
    currentBalance: totalEarned - totalPaid,
    lastPayoutDate: undefined,
  };
}
