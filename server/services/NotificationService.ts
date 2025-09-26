/**
 * Smart Reminder Notification Service
 * Multi-channel notification system for utility bills and payslip reminders
 * Supports: in-app, email, SMS, WhatsApp, Slack notifications
 */

import { DatabaseStorage } from '../storage.js';
import { ReminderNotification, InsertReminderNotification, ReminderSettings } from '@shared/schema';

interface NotificationChannel {
  send(recipient: string, message: string, subject?: string): Promise<{ success: boolean; externalId?: string; error?: string }>;
}

interface NotificationContext {
  organizationId: string;
  reminderType: 'utility_bill' | 'payslip';
  reminderItemId: number;
  recipientUserId: string;
  urgency: 'normal' | 'urgent' | 'overdue';
  data: any; // Context data for the reminder
}

export class NotificationService {
  private storage: DatabaseStorage;
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    this.storage = new DatabaseStorage();
    this.initializeChannels();
  }

  /**
   * Initialize all available notification channels
   */
  private initializeChannels() {
    // In-App Notification Channel
    this.channels.set('in_app', {
      send: async (recipient: string, message: string, subject?: string) => {
        try {
          // For in-app notifications, we just create the notification record
          // The frontend will poll for notifications via /api/notifications
          return { success: true, externalId: `in-app-${Date.now()}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });

    // Email Notification Channel (placeholder - would integrate with SendGrid, etc.)
    this.channels.set('email', {
      send: async (recipient: string, message: string, subject?: string) => {
        try {
          // TODO: Integrate with email service (SendGrid, SES, etc.)
          console.log(`📧 EMAIL: To: ${recipient}, Subject: ${subject}, Message: ${message}`);
          return { success: true, externalId: `email-${Date.now()}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });

    // SMS Notification Channel (placeholder - would integrate with Twilio, etc.)
    this.channels.set('sms', {
      send: async (recipient: string, message: string) => {
        try {
          // TODO: Integrate with SMS service (Twilio, etc.)
          console.log(`📱 SMS: To: ${recipient}, Message: ${message}`);
          return { success: true, externalId: `sms-${Date.now()}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });

    // WhatsApp Notification Channel (placeholder - would integrate with WhatsApp Business API)
    this.channels.set('whatsapp', {
      send: async (recipient: string, message: string) => {
        try {
          // TODO: Integrate with WhatsApp Business API
          console.log(`📲 WHATSAPP: To: ${recipient}, Message: ${message}`);
          return { success: true, externalId: `whatsapp-${Date.now()}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });

    // Slack Notification Channel (placeholder - would integrate with Slack API)
    this.channels.set('slack', {
      send: async (recipient: string, message: string) => {
        try {
          // TODO: Integrate with Slack API
          console.log(`💬 SLACK: To: ${recipient}, Message: ${message}`);
          return { success: true, externalId: `slack-${Date.now()}` };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    });
  }

  /**
   * Send reminder notification via specified channel
   */
  async sendReminder(context: NotificationContext, channel: string): Promise<ReminderNotification> {
    const { organizationId, reminderType, reminderItemId, recipientUserId } = context;

    // Get reminder settings to check if channel is enabled
    const settings = await this.storage.getReminderSettingsByType(organizationId, reminderType);
    if (!settings || !settings.isActive) {
      throw new Error(`Reminder settings not found or disabled for ${reminderType}`);
    }

    const channelConfig = settings.channels as any;
    if (!channelConfig[channel === 'in_app' ? 'inApp' : channel]) {
      throw new Error(`${channel} notifications are disabled for ${reminderType} reminders`);
    }

    // Generate message content
    const messageContent = this.generateMessage(context);
    const subject = this.generateSubject(context);

    // Get recipient details
    const recipient = await this.storage.getUser(recipientUserId);
    if (!recipient) {
      throw new Error(`Recipient user not found: ${recipientUserId}`);
    }

    // Create notification record
    const notificationData: InsertReminderNotification = {
      organizationId,
      reminderType,
      reminderItemId,
      recipientUserId,
      notificationChannel: channel,
      status: 'pending',
      messageContent,
    };

    const notification = await this.storage.createReminderNotification(notificationData);

    // Send via appropriate channel
    const channelHandler = this.channels.get(channel);
    if (!channelHandler) {
      await this.storage.markReminderNotificationFailed(notification.id, `Unsupported channel: ${channel}`);
      throw new Error(`Unsupported notification channel: ${channel}`);
    }

    try {
      const recipientAddress = this.getRecipientAddress(recipient, channel);
      const result = await channelHandler.send(recipientAddress, messageContent, subject);

      if (result.success) {
        return await this.storage.markReminderNotificationSent(notification.id, result.externalId);
      } else {
        return await this.storage.markReminderNotificationFailed(notification.id, result.error || 'Unknown error');
      }
    } catch (error) {
      return await this.storage.markReminderNotificationFailed(notification.id, error.message);
    }
  }

  /**
   * Send reminder to all enabled channels for a user
   */
  async sendReminderAllChannels(context: NotificationContext): Promise<ReminderNotification[]> {
    const { organizationId, reminderType } = context;

    // Get reminder settings
    const settings = await this.storage.getReminderSettingsByType(organizationId, reminderType);
    if (!settings || !settings.isActive) {
      throw new Error(`Reminder settings not found or disabled for ${reminderType}`);
    }

    const channels = settings.channels as any;
    const results: ReminderNotification[] = [];

    // Send to each enabled channel
    const channelPromises = [];

    if (channels.inApp) {
      channelPromises.push(this.sendReminder(context, 'in_app'));
    }
    if (channels.email) {
      channelPromises.push(this.sendReminder(context, 'email'));
    }
    if (channels.sms) {
      channelPromises.push(this.sendReminder(context, 'sms'));
    }
    if (channels.whatsapp) {
      channelPromises.push(this.sendReminder(context, 'whatsapp'));
    }
    if (channels.slack) {
      channelPromises.push(this.sendReminder(context, 'slack'));
    }

    // Execute all channel notifications concurrently
    const channelResults = await Promise.allSettled(channelPromises);
    
    channelResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Channel notification failed:', result.reason);
      }
    });

    return results;
  }

  /**
   * Generate message content based on reminder context
   */
  private generateMessage(context: NotificationContext): string {
    const { reminderType, urgency, data } = context;

    const urgencyPrefix = {
      normal: '📋',
      urgent: '⚠️',
      overdue: '🚨 OVERDUE'
    };

    const prefix = urgencyPrefix[urgency];

    if (reminderType === 'utility_bill') {
      const { billType, propertyName, dueDate, estimatedAmount, currency } = data;
      if (urgency === 'overdue') {
        return `${prefix} URGENT: ${billType} bill for ${propertyName} was due on ${dueDate}. Please upload the bill receipt immediately. Estimated amount: ${currency} ${estimatedAmount}`;
      }
      return `${prefix} Reminder: ${billType} bill for ${propertyName} is due on ${dueDate}. Please upload the bill receipt. Estimated amount: ${currency} ${estimatedAmount}`;
    }

    if (reminderType === 'payslip') {
      const { staffName, period, dueDate, amount, currency } = data;
      if (urgency === 'overdue') {
        return `${prefix} URGENT: Payslip for ${staffName} (${period}) was due on ${dueDate}. Please upload payslip and proof of payment immediately. Amount: ${currency} ${amount}`;
      }
      return `${prefix} Reminder: Payslip for ${staffName} (${period}) is due on ${dueDate}. Please upload payslip and proof of payment. Amount: ${currency} ${amount}`;
    }

    return `${prefix} Reminder: Please check your pending ${reminderType} items.`;
  }

  /**
   * Generate subject line for email notifications
   */
  private generateSubject(context: NotificationContext): string {
    const { reminderType, urgency, data } = context;

    const urgencyPrefix = urgency === 'overdue' ? '[OVERDUE] ' : '';

    if (reminderType === 'utility_bill') {
      const { billType, propertyName } = data;
      return `${urgencyPrefix}${billType} Bill Reminder - ${propertyName}`;
    }

    if (reminderType === 'payslip') {
      const { staffName, period } = data;
      return `${urgencyPrefix}Payslip Upload Reminder - ${staffName} (${period})`;
    }

    return `${urgencyPrefix}HostPilotPro Reminder`;
  }

  /**
   * Get recipient address based on channel
   */
  private getRecipientAddress(user: any, channel: string): string {
    switch (channel) {
      case 'email':
        return user.email || '';
      case 'sms':
      case 'whatsapp':
        return user.phoneNumber || user.mobile || '';
      case 'slack':
        return user.slackUserId || user.email || '';
      case 'in_app':
        return user.id;
      default:
        return user.email || user.id;
    }
  }

  /**
   * Process all pending notifications
   */
  async processPendingNotifications(): Promise<{ processed: number; failed: number }> {
    const pendingNotifications = await this.storage.getPendingReminderNotifications();
    
    let processed = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      try {
        const channel = this.channels.get(notification.notificationChannel);
        if (!channel) {
          await this.storage.markReminderNotificationFailed(notification.id, 'Unsupported channel');
          failed++;
          continue;
        }

        const recipient = await this.storage.getUser(notification.recipientUserId);
        if (!recipient) {
          await this.storage.markReminderNotificationFailed(notification.id, 'Recipient not found');
          failed++;
          continue;
        }

        const recipientAddress = this.getRecipientAddress(recipient, notification.notificationChannel);
        const result = await channel.send(recipientAddress, notification.messageContent);

        if (result.success) {
          await this.storage.markReminderNotificationSent(notification.id, result.externalId);
          processed++;
        } else {
          await this.storage.markReminderNotificationFailed(notification.id, result.error || 'Unknown error');
          failed++;
        }
      } catch (error) {
        await this.storage.markReminderNotificationFailed(notification.id, error.message);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Create escalation notification for overdue items
   */
  async createEscalationNotification(context: NotificationContext): Promise<ReminderNotification[]> {
    // Set urgency to overdue for escalation
    const escalationContext = { ...context, urgency: 'overdue' as const };
    
    // Send via all enabled channels for maximum visibility
    return await this.sendReminderAllChannels(escalationContext);
  }
}

export const notificationService = new NotificationService();