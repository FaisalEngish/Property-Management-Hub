import { storage } from "./storage";
import { logger } from "./logger";

export interface BookingConfirmationData {
  bookingId: number;
  propertyId: number;
  netRevenue: number; // Total booking revenue after platform fees
  managementFee: number; // Management company fee
  currency: string;
  agentId?: string; // Retail agent who made the booking
  referralAgentId?: string; // Referral agent for the property
  organizationId: string;
}

export class CommissionAutomation {
  
  /**
   * Main entry point for automatic commission calculation when booking is confirmed
   */
  static async processBookingCommissions(bookingData: BookingConfirmationData): Promise<void> {
    try {
      logger.info(`Processing commissions for booking ${bookingData.bookingId}`);
      
      // Process retail agent commission (if booking made by retail agent)
      if (bookingData.agentId) {
        await this.calculateRetailAgentCommission(bookingData);
      }
      
      // Process referral agent commission (property referral commission)
      if (bookingData.referralAgentId) {
        await this.calculateReferralAgentCommission(bookingData);
      }
      
      // Check for auto-payout triggers
      await this.checkAutoPayoutThresholds(bookingData.organizationId);
      
      logger.info(`Successfully processed commissions for booking ${bookingData.bookingId}`);
    } catch (error) {
      logger.error(`Error processing commissions for booking ${bookingData.bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate and store retail agent commission (10% of net revenue)
   */
  private static async calculateRetailAgentCommission(bookingData: BookingConfirmationData): Promise<void> {
    try {
      // Get agent's commission rate (default 10%)
      const agent = await storage.getUserById(bookingData.agentId!);
      if (!agent || agent.role !== 'retail-agent') {
        logger.warn(`Agent ${bookingData.agentId} not found or not retail agent`);
        return;
      }

      // Get commission rate (configurable per agent, default 10%)
      const commissionRate = 10; // TODO: Make this configurable per agent
      const commissionAmount = (bookingData.netRevenue * commissionRate) / 100;

      // Create commission log entry
      const commissionLog = await storage.createCommissionLog({
        organizationId: bookingData.organizationId,
        agentId: bookingData.agentId!,
        agentType: 'retail-agent',
        propertyId: bookingData.propertyId,
        bookingId: bookingData.bookingId,
        referenceNumber: `RB${bookingData.bookingId}`,
        baseAmount: bookingData.netRevenue,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        currency: bookingData.currency,
        status: 'pending'
      });

      // Update agent balance
      await this.updateAgentBalance(bookingData.agentId!, commissionAmount, 'retail-agent', bookingData.organizationId);

      logger.info(`Retail agent commission calculated: ${commissionAmount} ${bookingData.currency} for agent ${bookingData.agentId}`);
    } catch (error) {
      logger.error(`Error calculating retail agent commission:`, error);
      throw error;
    }
  }

  /**
   * Calculate and store referral agent commission (10% of management fee)
   */
  private static async calculateReferralAgentCommission(bookingData: BookingConfirmationData): Promise<void> {
    try {
      // Get referral agent
      const agent = await storage.getUserById(bookingData.referralAgentId!);
      if (!agent || agent.role !== 'referral-agent') {
        logger.warn(`Referral agent ${bookingData.referralAgentId} not found or not referral agent`);
        return;
      }

      // Calculate 10% of management fee
      const commissionRate = 10;
      const commissionAmount = (bookingData.managementFee * commissionRate) / 100;

      // Create commission log entry
      const commissionLog = await storage.createCommissionLog({
        organizationId: bookingData.organizationId,
        agentId: bookingData.referralAgentId!,
        agentType: 'referral-agent',
        propertyId: bookingData.propertyId,
        bookingId: bookingData.bookingId,
        referenceNumber: `RF${bookingData.bookingId}`,
        baseAmount: bookingData.managementFee,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        currency: bookingData.currency,
        status: 'pending'
      });

      // Update referral agent commission log
      await storage.createReferralCommissionLog({
        organizationId: bookingData.organizationId,
        agentId: bookingData.referralAgentId!,
        propertyId: bookingData.propertyId,
        propertyName: `Property ${bookingData.propertyId}`, // TODO: Get actual property name
        managementRevenue: bookingData.managementFee,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        commissionPeriod: new Date().toISOString().substring(0, 7), // YYYY-MM
        commissionYear: new Date().getFullYear(),
        commissionMonth: new Date().getMonth() + 1,
        paymentStatus: 'pending'
      });

      // Update agent balance
      await this.updateAgentBalance(bookingData.referralAgentId!, commissionAmount, 'referral-agent', bookingData.organizationId);

      logger.info(`Referral agent commission calculated: ${commissionAmount} ${bookingData.currency} for agent ${bookingData.referralAgentId}`);
    } catch (error) {
      logger.error(`Error calculating referral agent commission:`, error);
      throw error;
    }
  }

  /**
   * Update agent's balance with new commission
   */
  private static async updateAgentBalance(agentId: string, commissionAmount: number, agentType: 'retail-agent' | 'referral-agent', organizationId: string): Promise<void> {
    try {
      // Get current balance or create new one
      let balance = await storage.getAgentBalance(agentId, organizationId);
      
      if (!balance) {
        balance = await storage.createAgentBalance({
          organizationId,
          agentId,
          agentType,
          totalEarned: commissionAmount,
          totalPaid: 0,
          currentBalance: commissionAmount,
          pendingCommissions: commissionAmount
        });
      } else {
        // Update existing balance
        await storage.updateAgentBalance(agentId, organizationId, {
          totalEarned: balance.totalEarned + commissionAmount,
          currentBalance: balance.currentBalance + commissionAmount,
          pendingCommissions: balance.pendingCommissions + commissionAmount
        });
      }

      logger.info(`Updated agent balance for ${agentId}: +${commissionAmount}`);
    } catch (error) {
      logger.error(`Error updating agent balance:`, error);
      throw error;
    }
  }

  /**
   * Check if any agents have reached auto-payout thresholds
   */
  private static async checkAutoPayoutThresholds(organizationId: string): Promise<void> {
    try {
      const DEFAULT_THRESHOLD = 1000; // Default threshold in local currency
      
      // Get all agents with balances above threshold
      const agents = await storage.getAgentsAboveThreshold(organizationId, DEFAULT_THRESHOLD);
      
      for (const agent of agents) {
        // Check if auto-payout is enabled for this agent
        const autoPayoutEnabled = true; // TODO: Make this configurable per agent
        
        if (autoPayoutEnabled && agent.currentBalance >= DEFAULT_THRESHOLD) {
          await this.triggerAutoPayout(agent.agentId, agent.currentBalance, organizationId);
        }
      }
    } catch (error) {
      logger.error(`Error checking auto-payout thresholds:`, error);
    }
  }

  /**
   * Trigger automatic payout for agent
   */
  private static async triggerAutoPayout(agentId: string, amount: number, organizationId: string): Promise<void> {
    try {
      // Create payout request
      const payout = await storage.createAgentPayout({
        organizationId,
        agentId,
        payoutAmount: amount,
        payoutType: 'auto',
        payoutStatus: 'pending',
        requestedBy: 'system',
        requestNotes: `Auto-payout triggered for balance exceeding threshold`
      });

      // Create notification for admin
      await storage.createNotification({
        organizationId,
        title: 'Auto-Payout Triggered',
        message: `Agent ${agentId} auto-payout of ${amount} triggered and pending approval`,
        type: 'payout_request',
        recipientRole: 'admin',
        severity: 'info'
      });

      logger.info(`Auto-payout triggered for agent ${agentId}: ${amount}`);
    } catch (error) {
      logger.error(`Error triggering auto-payout:`, error);
      throw error;
    }
  }
}

/**
 * Booking confirmation webhook handler
 */
export async function handleBookingConfirmation(bookingId: number, organizationId: string): Promise<void> {
  try {
    // Get booking details
    const booking = await storage.getBookingById(bookingId, organizationId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Get property details for referral agent
    const property = await storage.getPropertyById(booking.propertyId, organizationId);
    if (!property) {
      throw new Error(`Property ${booking.propertyId} not found`);
    }

    // Calculate net revenue and management fee
    const totalAmount = parseFloat(booking.totalAmount);
    const managementFeePercent = 15; // TODO: Make configurable
    const managementFee = (totalAmount * managementFeePercent) / 100;
    const netRevenue = totalAmount; // After platform fees are already deducted

    // Get referral agent for property (if any)
    const referralAgent = await storage.getPropertyReferralAgent(booking.propertyId, organizationId);

    const bookingData: BookingConfirmationData = {
      bookingId: booking.id,
      propertyId: booking.propertyId,
      netRevenue: netRevenue,
      managementFee: managementFee,
      currency: 'THB', // TODO: Get from booking
      agentId: booking.createdBy, // If booking was made by retail agent
      referralAgentId: referralAgent?.agentId,
      organizationId: organizationId
    };

    // Process commissions
    await CommissionAutomation.processBookingCommissions(bookingData);

  } catch (error) {
    logger.error(`Error handling booking confirmation:`, error);
    throw error;
  }
}