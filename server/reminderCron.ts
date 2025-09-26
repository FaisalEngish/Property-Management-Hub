/**
 * Smart Reminder System Automated Cron Jobs
 * Daily automation for utility bills and payslip reminders
 * Multi-channel notification scheduling and processing
 */

import * as cron from 'node-cron';
import { DatabaseStorage } from './storage.js';
import { notificationService } from './services/NotificationService.js';

class SmartReminderCron {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  /**
   * Initialize all cron jobs for the reminder system
   */
  initializeCronJobs() {
    console.log('🕐 Initializing Smart Reminder System cron jobs...');

    // Daily reminder check - runs every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Running daily reminder check...');
      await this.runDailyReminderCheck();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Hourly notification processing - runs every hour
    cron.schedule('0 * * * *', async () => {
      console.log('📨 Processing pending notifications...');
      await this.processPendingNotifications();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Weekly escalation check - runs every Monday at 10 AM  
    cron.schedule('0 10 * * 1', async () => {
      console.log('🚨 Running weekly escalation check...');
      await this.runWeeklyEscalationCheck();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('✅ Smart Reminder System cron jobs initialized successfully');
  }

  /**
   * Daily reminder check - identify overdue items and create reminders
   */
  private async runDailyReminderCheck() {
    try {
      console.log('📋 Starting daily reminder check...');
      
      // Get all organizations (in a real multi-tenant app, this would be a proper query)
      const organizationId = 'hostpilotpro-demo'; // Demo organization
      
      // Generate daily reminders for this organization
      const result = await this.storage.generateDailyReminders(organizationId);
      
      console.log(`✅ Daily reminder check completed: ${result.created} reminders created, ${result.scheduled} notifications scheduled`);
      
      // If reminders were created, process them immediately for urgent items
      if (result.created > 0) {
        await this.processPendingNotifications();
      }
      
    } catch (error) {
      console.error('❌ Error in daily reminder check:', error);
    }
  }

  /**
   * Process all pending notifications across all channels
   */
  private async processPendingNotifications() {
    try {
      console.log('📤 Processing pending notifications...');
      
      const result = await notificationService.processPendingNotifications();
      
      console.log(`✅ Notification processing completed: ${result.processed} sent, ${result.failed} failed`);
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} notifications failed to send - check logs for details`);
      }
      
    } catch (error) {
      console.error('❌ Error processing pending notifications:', error);
    }
  }

  /**
   * Weekly escalation check - identify severely overdue items and escalate
   */
  private async runWeeklyEscalationCheck() {
    try {
      console.log('🚨 Starting weekly escalation check...');
      
      const organizationId = 'hostpilotpro-demo'; // Demo organization
      
      // Check for overdue reminders
      const overdueItems = await this.storage.checkOverdueReminders(organizationId);
      
      let escalationCount = 0;
      
      // Create escalation notifications for utility bills overdue by more than 7 days
      for (const utilityBill of overdueItems.utility) {
        const daysSinceCreation = Math.floor((Date.now() - new Date(utilityBill.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation >= 7) {
          try {
            // Get property and user details for context
            const property = await this.storage.getProperty(utilityBill.propertyId);
            const users = await this.storage.getUsers(); // Get all users to find the assignee
            const assignedUser = users.find(u => u.role === 'admin' || u.role === 'portfolio-manager');
            
            if (assignedUser && property) {
              const escalationContext = {
                organizationId,
                reminderType: 'utility_bill' as const,
                reminderItemId: utilityBill.id,
                recipientUserId: assignedUser.id,
                urgency: 'overdue' as const,
                data: {
                  billType: utilityBill.utilityType,
                  propertyName: property.name,
                  dueDate: new Date(utilityBill.dueDate).toLocaleDateString(),
                  estimatedAmount: utilityBill.estimatedAmount || '0',
                  currency: utilityBill.currency || 'USD'
                }
              };
              
              await notificationService.createEscalationNotification(escalationContext);
              escalationCount++;
            }
          } catch (escalationError) {
            console.error(`❌ Error creating utility bill escalation for ${utilityBill.id}:`, escalationError);
          }
        }
      }
      
      // Create escalation notifications for payslips overdue by more than 3 days  
      for (const payslipReminder of overdueItems.payslip) {
        const daysSinceCreation = Math.floor((Date.now() - new Date(payslipReminder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation >= 3) {
          try {
            const escalationContext = {
              organizationId,
              reminderType: 'payslip' as const,
              reminderItemId: payslipReminder.id,
              recipientUserId: payslipReminder.staffId,
              urgency: 'overdue' as const,
              data: {
                staffName: payslipReminder.staffName,
                period: payslipReminder.payPeriod,
                dueDate: new Date(payslipReminder.dueDate).toLocaleDateString(),
                amount: payslipReminder.amount || '0',
                currency: payslipReminder.currency || 'USD'
              }
            };
            
            await notificationService.createEscalationNotification(escalationContext);
            escalationCount++;
          } catch (escalationError) {
            console.error(`❌ Error creating payslip escalation for ${payslipReminder.id}:`, escalationError);
          }
        }
      }
      
      console.log(`✅ Weekly escalation check completed: ${escalationCount} escalation notifications created`);
      
      // Process the escalation notifications immediately
      if (escalationCount > 0) {
        await this.processPendingNotifications();
      }
      
    } catch (error) {
      console.error('❌ Error in weekly escalation check:', error);
    }
  }

  /**
   * Manual trigger for immediate reminder processing (useful for testing)
   */
  async triggerImmediateCheck(organizationId: string = 'hostpilotpro-demo') {
    console.log('🔥 Triggering immediate reminder check...');
    
    try {
      // Run daily check
      const dailyResult = await this.storage.generateDailyReminders(organizationId);
      console.log(`Daily check: ${dailyResult.created} reminders created, ${dailyResult.scheduled} notifications scheduled`);
      
      // Process notifications
      const notificationResult = await notificationService.processPendingNotifications();
      console.log(`Notifications: ${notificationResult.processed} sent, ${notificationResult.failed} failed`);
      
      return {
        remindersCreated: dailyResult.created,
        notificationsScheduled: dailyResult.scheduled,
        notificationsSent: notificationResult.processed,
        notificationsFailed: notificationResult.failed
      };
    } catch (error) {
      console.error('❌ Error in immediate reminder check:', error);
      throw error;
    }
  }

  /**
   * Get cron job status and next run times
   */
  getCronStatus() {
    return {
      dailyReminderCheck: {
        schedule: '0 9 * * *', // Daily at 9 AM
        description: 'Check for overdue bills and create reminders',
        nextRun: 'Daily at 09:00 UTC'
      },
      hourlyNotifications: {
        schedule: '0 * * * *', // Every hour
        description: 'Process pending notifications across all channels',
        nextRun: 'Every hour at :00 minutes'
      },
      weeklyEscalation: {
        schedule: '0 10 * * 1', // Monday at 10 AM
        description: 'Create escalation notifications for severely overdue items',
        nextRun: 'Every Monday at 10:00 UTC'
      }
    };
  }
}

// Create and export the global instance
export const smartReminderCron = new SmartReminderCron();

// Auto-initialize cron jobs when the module is imported
smartReminderCron.initializeCronJobs();