import { storage } from "./storage";
import { logger } from "./logger";
import cron from 'node-cron';

export interface UtilityAlertData {
  propertyId: number;
  propertyName: string;
  utilityType: string; // electricity, water, internet
  dueDay: number; // Day of month (1-31)
  organizationId: string;
  ownerId?: string;
  lastReceiptDate?: Date;
}

export class UtilityAlertAutomation {
  private static isRunning = false;

  /**
   * Initialize the daily utility alert cron job
   */
  static initializeCronJob(): void {
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      if (this.isRunning) {
        logger.info('Utility alert check already running, skipping');
        return;
      }

      this.isRunning = true;
      try {
        await this.performDailyUtilityCheck();
      } catch (error) {
        logger.error('Error in daily utility check:', error);
      } finally {
        this.isRunning = false;
      }
    });

    logger.info('Utility alert automation cron job initialized (daily at 9:00 AM)');
  }

  /**
   * Main daily check function - examines all properties for missing utility bills
   */
  private static async performDailyUtilityCheck(): Promise<void> {
    try {
      logger.info('Starting daily utility alert check');
      
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      // Get all organizations
      const organizations = await storage.getAllOrganizations();

      for (const org of organizations) {
        await this.checkOrganizationUtilities(org.id, currentDay, currentMonth, currentYear);
      }

      logger.info('Completed daily utility alert check');
    } catch (error) {
      logger.error('Error in daily utility check:', error);
      throw error;
    }
  }

  /**
   * Check utilities for a specific organization
   */
  private static async checkOrganizationUtilities(
    organizationId: string, 
    currentDay: number, 
    currentMonth: number, 
    currentYear: number
  ): Promise<void> {
    try {
      // Get all properties with utility settings for this organization
      const propertiesWithUtilities = await storage.getPropertiesWithUtilitySettings(organizationId);

      for (const property of propertiesWithUtilities) {
        await this.checkPropertyUtilities(property, currentDay, currentMonth, currentYear);
      }
    } catch (error) {
      logger.error(`Error checking utilities for organization ${organizationId}:`, error);
    }
  }

  /**
   * Check utilities for a specific property
   */
  private static async checkPropertyUtilities(
    property: any,
    currentDay: number,
    currentMonth: number,
    currentYear: number
  ): Promise<void> {
    try {
      // Get utility settings for this property
      const utilities = await storage.getPropertyUtilities(property.id, property.organizationId);

      for (const utility of utilities) {
        // Check if today matches the due day for this utility
        if (utility.dueDay === currentDay) {
          await this.checkUtilityBillStatus(property, utility, currentMonth, currentYear);
        }
      }
    } catch (error) {
      logger.error(`Error checking utilities for property ${property.id}:`, error);
    }
  }

  /**
   * Check if utility bill receipt exists for current month
   */
  private static async checkUtilityBillStatus(
    property: any,
    utility: any,
    currentMonth: number,
    currentYear: number
  ): Promise<void> {
    try {
      // Check if receipt exists for current month
      const hasCurrentMonthReceipt = await storage.hasUtilityReceiptForMonth(
        property.id,
        utility.id,
        currentMonth,
        currentYear,
        property.organizationId
      );

      if (!hasCurrentMonthReceipt) {
        // Generate alert for missing bill
        await this.generateMissingBillAlert(property, utility, currentMonth, currentYear);
      }
    } catch (error) {
      logger.error(`Error checking utility bill status:`, error);
    }
  }

  /**
   * Generate alert for missing utility bill
   */
  private static async generateMissingBillAlert(
    property: any,
    utility: any,
    currentMonth: number,
    currentYear: number
  ): Promise<void> {
    try {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const alertTitle = `Missing ${utility.utilityType} Bill - ${property.name}`;
      const alertMessage = `⚠️ Villa ${property.name} is missing the ${utility.utilityType} bill for ${monthNames[currentMonth - 1]} ${currentYear}. Please upload or confirm payment.`;

      // Create alert record
      const alert = await storage.createUtilityBillAlert({
        organizationId: property.organizationId,
        propertyId: property.id,
        utilityId: utility.id,
        alertType: 'missing_receipt',
        alertTitle: alertTitle,
        alertMessage: alertMessage,
        alertSeverity: 'warning',
        sentToRoles: ['admin', 'portfolio-manager', 'owner'],
        alertStatus: 'active'
      });

      // Send notifications to relevant users
      await this.sendAlertNotifications(property, utility, alertMessage, alertTitle);

      logger.info(`Generated missing bill alert for ${property.name} - ${utility.utilityType}`);
    } catch (error) {
      logger.error(`Error generating missing bill alert:`, error);
    }
  }

  /**
   * Send notifications to admin, manager, and owner
   */
  private static async sendAlertNotifications(
    property: any,
    utility: any,
    alertMessage: string,
    alertTitle: string
  ): Promise<void> {
    try {
      // Get admin and portfolio managers
      const admins = await storage.getUsersByRole('admin', property.organizationId);
      const portfolioManagers = await storage.getUsersByRole('portfolio-manager', property.organizationId);
      
      // Get property owner
      const owner = property.ownerId ? await storage.getUserById(property.ownerId) : null;

      // Send notifications to all relevant users
      const recipients = [...admins, ...portfolioManagers];
      if (owner) recipients.push(owner);

      for (const user of recipients) {
        await storage.createNotification({
          organizationId: property.organizationId,
          userId: user.id,
          title: alertTitle,
          message: alertMessage,
          type: 'utility_alert',
          severity: 'warning',
          relatedEntityType: 'property',
          relatedEntityId: property.id,
          isRead: false
        });
      }

      // Log email sending (integrate with actual email service here)
      logger.info(`Sent utility alert notifications to ${recipients.length} recipients for ${property.name}`);
      
      // TODO: Integrate with actual email/SMS service
      // await this.sendEmailNotifications(recipients, alertTitle, alertMessage);
      
    } catch (error) {
      logger.error(`Error sending alert notifications:`, error);
    }
  }

  /**
   * Manual trigger for utility check (for testing)
   */
  static async triggerManualCheck(organizationId: string): Promise<void> {
    try {
      logger.info(`Manual utility check triggered for organization ${organizationId}`);
      
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      await this.checkOrganizationUtilities(organizationId, currentDay, currentMonth, currentYear);
      
      logger.info(`Manual utility check completed for organization ${organizationId}`);
    } catch (error) {
      logger.error(`Error in manual utility check:`, error);
      throw error;
    }
  }

  /**
   * Check for overdue bills (run weekly)
   */
  static initializeOverdueCheck(): void {
    // Run weekly on Mondays at 10:00 AM
    cron.schedule('0 10 * * 1', async () => {
      try {
        await this.checkOverdueBills();
      } catch (error) {
        logger.error('Error in overdue bills check:', error);
      }
    });

    logger.info('Overdue bills check cron job initialized (weekly on Mondays)');
  }

  /**
   * Check for bills that are overdue
   */
  private static async checkOverdueBills(): Promise<void> {
    try {
      logger.info('Starting overdue bills check');
      
      const organizations = await storage.getAllOrganizations();
      
      for (const org of organizations) {
        const overdueBills = await storage.getOverdueUtilityBills(org.id);
        
        for (const bill of overdueBills) {
          await this.generateOverdueAlert(bill);
        }
      }
      
      logger.info('Completed overdue bills check');
    } catch (error) {
      logger.error('Error in overdue bills check:', error);
    }
  }

  /**
   * Generate alert for overdue bill
   */
  private static async generateOverdueAlert(bill: any): Promise<void> {
    try {
      const daysOverdue = Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      const alertTitle = `Overdue ${bill.utilityType} Bill - ${bill.propertyName}`;
      const alertMessage = `🚨 URGENT: ${bill.propertyName} ${bill.utilityType} bill is ${daysOverdue} days overdue. Immediate action required to avoid service disconnection.`;

      await storage.createUtilityBillAlert({
        organizationId: bill.organizationId,
        propertyId: bill.propertyId,
        utilityId: bill.utilityId,
        alertType: 'overdue_bill',
        alertTitle: alertTitle,
        alertMessage: alertMessage,
        alertSeverity: 'urgent',
        sentToRoles: ['admin', 'portfolio-manager', 'owner'],
        alertStatus: 'active'
      });

      logger.info(`Generated overdue alert for ${bill.propertyName} - ${bill.utilityType} (${daysOverdue} days)`);
    } catch (error) {
      logger.error(`Error generating overdue alert:`, error);
    }
  }
}

/**
 * Initialize all utility alert automation
 */
export function initializeUtilityAutomation(): void {
  UtilityAlertAutomation.initializeCronJob();
  UtilityAlertAutomation.initializeOverdueCheck();
  logger.info('Utility alert automation initialized');
}