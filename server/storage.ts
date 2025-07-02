import {
  users,
  properties,
  tasks,
  taskHistory,
  bookings,
  finances,
  inventory,
  platformSettings,
  addonServices,
  addonBookings,
  utilityBills,
  propertyUtilityAccounts,
  utilityBillReminders,
  welcomePackItems,
  welcomePackTemplates,
  welcomePackUsage,
  ownerPayouts,
  notifications,
  notificationPreferences,
  guestAddonServices,
  guestAddonBookings,
  guestPortalAccess,
  recurringServices,
  recurringServiceBills,
  billReminders,
  servicePerformance,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Task,
  type InsertTask,
  type Booking,
  type InsertBooking,
  type Finance,
  type InsertFinance,
  type Inventory,
  type InsertInventory,
  type PlatformSetting,
  type InsertPlatformSetting,
  type AddonService,
  type InsertAddonService,
  type AddonBooking,
  type InsertAddonBooking,
  type UtilityBill,
  type InsertUtilityBill,
  type PropertyUtilityAccount,
  type InsertPropertyUtilityAccount,
  type UtilityBillReminder,
  type InsertUtilityBillReminder,
  type WelcomePackItem,
  type InsertWelcomePackItem,
  type WelcomePackTemplate,
  type InsertWelcomePackTemplate,
  type WelcomePackUsage,
  type InsertWelcomePackUsage,
  type OwnerPayout,
  type InsertOwnerPayout,
  type TaskHistory,
  type InsertTaskHistory,
  type Notification,
  type InsertNotification,
  type NotificationPreference,
  type InsertNotificationPreference,
  staffSalaries,
  commissionEarnings,
  invoices,
  invoiceLineItems,
  portfolioAssignments,
  type StaffSalary,
  type InsertStaffSalary,
  type CommissionEarning,
  type InsertCommissionEarning,
  type Invoice,
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type PortfolioAssignment,
  type InsertPortfolioAssignment,
  type RecurringService,
  type InsertRecurringService,
  type RecurringServiceBill,
  type InsertRecurringServiceBill,
  type BillReminder,
  type InsertBillReminder,
  type ServicePerformance,
  type InsertServicePerformance,
  guestFeedback,
  aiTaskRules,
  feedbackProcessingLog,
  aiConfiguration,
  type GuestFeedback,
  type InsertGuestFeedback,
  type AiTaskRule,
  type InsertAiTaskRule,
  type FeedbackProcessingLog,
  type InsertFeedbackProcessingLog,
  type AiConfiguration,
  type InsertAiConfiguration,
  type GuestAddonService,
  type InsertGuestAddonService,
  type GuestAddonBooking,
  type InsertGuestAddonBooking,
  type GuestPortalAccess,
  type InsertGuestPortalAccess,
  propertyMedia,
  propertyInternalNotes,
  agentMediaAccess,
  type PropertyMedia,
  type InsertPropertyMedia,
  type PropertyInternalNotes,
  type InsertPropertyInternalNotes,
  type AgentMediaAccess,
  type InsertAgentMediaAccess,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lt, gte, lte, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Property operations
  getProperties(): Promise<Property[]>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTasksByProperty(propertyId: number): Promise<Task[]>;
  getTasksByAssignee(assigneeId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Enhanced staff task management
  completeTask(id: number, userId: string, evidencePhotos: string[], issuesFound: string[], notes?: string): Promise<Task | undefined>;
  skipTask(id: number, userId: string, reason: string): Promise<Task | undefined>;
  rescheduleTask(id: number, userId: string, newDate: Date, reason: string): Promise<Task | undefined>;
  startTask(id: number, userId: string): Promise<Task | undefined>;
  
  // Task history operations
  getTaskHistory(taskId: number): Promise<TaskHistory[]>;
  getTaskHistoryByProperty(propertyId: number): Promise<TaskHistory[]>;
  createTaskHistory(history: InsertTaskHistory): Promise<TaskHistory>;

  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;

  // Finance operations
  getFinances(): Promise<Finance[]>;
  getFinancesByProperty(propertyId: number): Promise<Finance[]>;
  createFinance(finance: InsertFinance): Promise<Finance>;
  updateFinance(id: number, finance: Partial<InsertFinance>): Promise<Finance | undefined>;

  // Inventory operations
  getInventoryByProperty(propertyId: number): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;

  // Platform settings operations
  getPlatformSettings(): Promise<PlatformSetting[]>;
  getPlatformSettingsByCategory(category: string): Promise<PlatformSetting[]>;
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  upsertPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting>;
  deletePlatformSetting(key: string): Promise<boolean>;

  // Add-on services operations
  getAddonServices(): Promise<AddonService[]>;
  getAddonServicesByCategory(category: string): Promise<AddonService[]>;
  getAddonService(id: number): Promise<AddonService | undefined>;
  createAddonService(service: InsertAddonService): Promise<AddonService>;
  updateAddonService(id: number, service: Partial<InsertAddonService>): Promise<AddonService | undefined>;
  deleteAddonService(id: number): Promise<boolean>;

  // Add-on bookings operations
  getAddonBookings(): Promise<AddonBooking[]>;
  getAddonBookingsByProperty(propertyId: number): Promise<AddonBooking[]>;
  getAddonBookingsByService(serviceId: number): Promise<AddonBooking[]>;
  getAddonBooking(id: number): Promise<AddonBooking | undefined>;
  createAddonBooking(booking: InsertAddonBooking): Promise<AddonBooking>;
  updateAddonBooking(id: number, booking: Partial<InsertAddonBooking>): Promise<AddonBooking | undefined>;
  deleteAddonBooking(id: number): Promise<boolean>;

  // Property utility accounts operations
  getPropertyUtilityAccounts(): Promise<PropertyUtilityAccount[]>;
  getPropertyUtilityAccountsByProperty(propertyId: number): Promise<PropertyUtilityAccount[]>;
  getPropertyUtilityAccount(id: number): Promise<PropertyUtilityAccount | undefined>;
  createPropertyUtilityAccount(account: InsertPropertyUtilityAccount): Promise<PropertyUtilityAccount>;
  updatePropertyUtilityAccount(id: number, account: Partial<InsertPropertyUtilityAccount>): Promise<PropertyUtilityAccount | undefined>;
  deletePropertyUtilityAccount(id: number): Promise<boolean>;

  // Utility bills operations
  getUtilityBills(): Promise<UtilityBill[]>;
  getUtilityBillsByProperty(propertyId: number): Promise<UtilityBill[]>;
  getUtilityBillsByMonth(billingMonth: string): Promise<UtilityBill[]>;
  getOverdueUtilityBills(): Promise<UtilityBill[]>;
  getPendingUtilityBills(): Promise<UtilityBill[]>;
  getUtilityBill(id: number): Promise<UtilityBill | undefined>;
  createUtilityBill(bill: InsertUtilityBill): Promise<UtilityBill>;
  updateUtilityBill(id: number, bill: Partial<InsertUtilityBill>): Promise<UtilityBill | undefined>;
  uploadUtilityBillReceipt(id: number, receiptUrl: string, filename: string, uploadedBy: string): Promise<UtilityBill | undefined>;
  markUtilityBillPaid(id: number, paidBy: string): Promise<UtilityBill | undefined>;
  deleteUtilityBill(id: number): Promise<boolean>;

  // Utility bill reminder operations
  getUtilityBillReminders(): Promise<UtilityBillReminder[]>;
  getUtilityBillRemindersByUser(userId: string): Promise<UtilityBillReminder[]>;
  getUnreadUtilityBillReminders(userId: string): Promise<UtilityBillReminder[]>;
  createUtilityBillReminder(reminder: InsertUtilityBillReminder): Promise<UtilityBillReminder>;
  markUtilityBillReminderRead(id: number): Promise<UtilityBillReminder | undefined>;
  
  // Utility automation operations
  generateUtilityBillReminders(organizationId: string): Promise<UtilityBillReminder[]>;
  getUtilityExpensesByProperty(propertyId: number, fromDate?: Date, toDate?: Date): Promise<any>;
  getUtilityExpensesByOwner(ownerId: string, fromDate?: Date, toDate?: Date): Promise<any>;

  // Welcome pack inventory operations
  getWelcomePackItems(): Promise<WelcomePackItem[]>;
  getWelcomePackItem(id: number): Promise<WelcomePackItem | undefined>;
  createWelcomePackItem(item: InsertWelcomePackItem): Promise<WelcomePackItem>;
  updateWelcomePackItem(id: number, item: Partial<InsertWelcomePackItem>): Promise<WelcomePackItem | undefined>;
  deleteWelcomePackItem(id: number): Promise<boolean>;

  // Welcome pack templates operations
  getWelcomePackTemplates(): Promise<WelcomePackTemplate[]>;
  getWelcomePackTemplatesByProperty(propertyId: number): Promise<WelcomePackTemplate[]>;
  createWelcomePackTemplate(template: InsertWelcomePackTemplate): Promise<WelcomePackTemplate>;
  updateWelcomePackTemplate(id: number, template: Partial<InsertWelcomePackTemplate>): Promise<WelcomePackTemplate | undefined>;
  deleteWelcomePackTemplate(id: number): Promise<boolean>;

  // Welcome pack usage operations
  getWelcomePackUsage(): Promise<WelcomePackUsage[]>;
  getWelcomePackUsageByProperty(propertyId: number): Promise<WelcomePackUsage[]>;
  getWelcomePackUsageByBooking(bookingId: number): Promise<WelcomePackUsage[]>;
  createWelcomePackUsage(usage: InsertWelcomePackUsage): Promise<WelcomePackUsage>;
  updateWelcomePackUsage(id: number, usage: Partial<InsertWelcomePackUsage>): Promise<WelcomePackUsage | undefined>;

  // Welcome pack automation operations
  logWelcomePackUsageFromCheckout(bookingId: number, propertyId: number, processedBy: string): Promise<WelcomePackUsage[]>;
  
  // Inventory analytics operations
  getInventoryStats(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any>;
  getDetailedWelcomePackUsage(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any[]>;

  // Owner payout operations
  getOwnerPayouts(): Promise<OwnerPayout[]>;
  getOwnerPayoutsByOwner(ownerId: string): Promise<OwnerPayout[]>;
  getOwnerPayoutsByProperty(propertyId: number): Promise<OwnerPayout[]>;
  getOwnerPayoutsByStatus(status: string): Promise<OwnerPayout[]>;
  getOwnerPayout(id: number): Promise<OwnerPayout | undefined>;
  createOwnerPayout(payout: InsertOwnerPayout): Promise<OwnerPayout>;
  updateOwnerPayout(id: number, payout: Partial<InsertOwnerPayout>): Promise<OwnerPayout | undefined>;
  approveOwnerPayout(id: number, approvedBy: string, approvalNotes?: string): Promise<OwnerPayout | undefined>;
  markOwnerPayoutPaid(id: number, paidBy: string, paymentMethod: string, paymentReference?: string): Promise<OwnerPayout | undefined>;
  uploadOwnerPayoutReceipt(id: number, receiptUrl: string, uploadedBy: string): Promise<OwnerPayout | undefined>;
  confirmOwnerPayoutReceived(id: number, confirmedBy: string): Promise<OwnerPayout | undefined>;
  calculateOwnerBalance(ownerId: string, propertyId?: number, startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    commissionDeductions: number;
    pendingPayouts: number;
  }>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  getNotificationsByType(userId: string, type: string): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;
  markAllNotificationsRead(userId: string): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Notification preferences operations
  getUserNotificationPreferences(userId: string): Promise<NotificationPreference | undefined>;
  upsertNotificationPreferences(preferences: InsertNotificationPreference): Promise<NotificationPreference>;
  
  // Notification trigger methods
  notifyTaskAssignment(taskId: number, assigneeId: string, assignedBy: string): Promise<void>;
  notifyBookingUpdate(bookingId: number, userIds: string[], updateType: string, message: string): Promise<void>;
  notifyPayoutAction(payoutId: number, userId: string, action: string, actionBy: string): Promise<void>;
  notifyMaintenanceApproval(taskId: number, requesterId: string, approverIds: string[]): Promise<void>;

  // Inventory analytics operations
  getInventoryStats(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any>;
  getDetailedWelcomePackUsage(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any[]>;

  // Financial & Invoice Toolkit operations
  // Staff salary operations
  getStaffSalary(userId: string): Promise<StaffSalary | undefined>;
  createStaffSalary(salary: InsertStaffSalary): Promise<StaffSalary>;
  updateStaffSalary(id: number, salary: Partial<InsertStaffSalary>): Promise<StaffSalary | undefined>;
  
  // Commission earnings operations
  getCommissionEarnings(userId: string, period?: string): Promise<CommissionEarning[]>;
  createCommissionEarning(earning: InsertCommissionEarning): Promise<CommissionEarning>;
  updateCommissionEarning(id: number, earning: Partial<InsertCommissionEarning>): Promise<CommissionEarning | undefined>;
  getPortfolioManagerEarnings(managerId: string, period?: string): Promise<any>;
  
  // Portfolio assignment operations
  getPortfolioAssignments(managerId: string): Promise<PortfolioAssignment[]>;
  assignPortfolioProperty(assignment: InsertPortfolioAssignment): Promise<PortfolioAssignment>;
  unassignPortfolioProperty(managerId: string, propertyId: number): Promise<boolean>;
  
  // Invoice operations
  getInvoices(organizationId: string, filters?: { userId?: string; type?: string; status?: string }): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  generateInvoiceNumber(organizationId: string): Promise<string>;

  // AI Feedback System operations
  getGuestFeedback(organizationId: string, filters?: { propertyId?: number; processed?: boolean; requiresAction?: boolean }): Promise<GuestFeedback[]>;
  getGuestFeedbackById(id: number): Promise<GuestFeedback | undefined>;
  createGuestFeedback(feedback: InsertGuestFeedback): Promise<GuestFeedback>;
  processGuestFeedback(id: number, processedBy: string, processingNotes?: string, assignedTaskId?: number): Promise<GuestFeedback | undefined>;
  markFeedbackRequiresAction(id: number, requiresAction: boolean): Promise<GuestFeedback | undefined>;

  // AI Task Rules operations
  getAiTaskRules(organizationId: string, filters?: { isActive?: boolean; department?: string }): Promise<AiTaskRule[]>;
  getAiTaskRuleById(id: number): Promise<AiTaskRule | undefined>;
  createAiTaskRule(rule: InsertAiTaskRule): Promise<AiTaskRule>;
  updateAiTaskRule(id: number, rule: Partial<InsertAiTaskRule>): Promise<AiTaskRule | undefined>;
  deleteAiTaskRule(id: number): Promise<boolean>;
  incrementRuleTriggerCount(id: number): Promise<void>;

  // Feedback Processing operations
  createProcessingLog(log: InsertFeedbackProcessingLog): Promise<FeedbackProcessingLog>;
  getProcessingLogs(organizationId: string, feedbackId?: number): Promise<FeedbackProcessingLog[]>;

  // AI Configuration operations
  getAiConfiguration(organizationId: string): Promise<AiConfiguration | undefined>;
  upsertAiConfiguration(config: InsertAiConfiguration): Promise<AiConfiguration>;

  // Core AI processing methods
  processMessageForKeywords(message: string, organizationId: string): Promise<{
    matchedRules: AiTaskRule[];
    detectedKeywords: string[];
    recommendedActions: string[];
  }>;
  createTaskFromFeedback(feedbackId: number, ruleId: number, assignedTo?: string): Promise<Task>;

  // Guest Add-On Service Booking Platform operations
  getGuestAddonServices(organizationId: string, filters?: { category?: string; isActive?: boolean }): Promise<GuestAddonService[]>;
  getGuestAddonServiceById(id: number): Promise<GuestAddonService | undefined>;
  createGuestAddonService(service: InsertGuestAddonService): Promise<GuestAddonService>;
  updateGuestAddonService(id: number, service: Partial<InsertGuestAddonService>): Promise<GuestAddonService | undefined>;
  deleteGuestAddonService(id: number): Promise<boolean>;
  
  // Guest add-on booking operations
  getGuestAddonBookings(organizationId: string, filters?: { propertyId?: number; status?: string; billingRoute?: string }): Promise<GuestAddonBooking[]>;
  getGuestAddonBookingById(id: number): Promise<GuestAddonBooking | undefined>;
  createGuestAddonBooking(booking: InsertGuestAddonBooking): Promise<GuestAddonBooking>;
  updateGuestAddonBooking(id: number, booking: Partial<InsertGuestAddonBooking>): Promise<GuestAddonBooking | undefined>;
  confirmGuestAddonBooking(id: number, confirmedBy: string): Promise<GuestAddonBooking | undefined>;
  cancelGuestAddonBooking(id: number, cancelledBy: string, reason?: string): Promise<GuestAddonBooking | undefined>;
  updateBookingPaymentStatus(id: number, paymentStatus: string, paymentMethod?: string, stripePaymentIntentId?: string): Promise<GuestAddonBooking | undefined>;
  
  // Guest portal access operations
  getGuestPortalAccess(accessToken: string): Promise<GuestPortalAccess | undefined>;
  createGuestPortalAccess(access: InsertGuestPortalAccess): Promise<GuestPortalAccess>;
  updateGuestPortalAccessActivity(accessToken: string): Promise<void>;
  deactivateGuestPortalAccess(accessToken: string): Promise<boolean>;
  
  // Guest add-on service analytics
  getGuestAddonServiceAnalytics(organizationId: string, filters?: { fromDate?: Date; toDate?: Date }): Promise<{
    totalBookings: number;
    totalRevenue: number;
    popularServices: Array<{ serviceName: string; bookingCount: number; revenue: number }>;
    billingRouteBreakdown: Record<string, number>;
    monthlyStats: Array<{ month: string; bookings: number; revenue: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId)).orderBy(desc(properties.createdAt));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByProperty(propertyId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.propertyId, propertyId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, assigneeId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Enhanced staff task management
  async completeTask(id: number, userId: string, evidencePhotos: string[], issuesFound: string[], notes?: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completionNotes: notes,
        evidencePhotos,
        issuesFound,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Create task history entry
    await this.createTaskHistory({
      organizationId: task.organizationId,
      taskId: id,
      propertyId: task.propertyId,
      action: 'completed',
      previousStatus: task.status,
      newStatus: 'completed',
      performedBy: userId,
      notes,
      evidencePhotos,
      issuesFound,
    });

    return updatedTask;
  }

  async skipTask(id: number, userId: string, reason: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'skipped',
        skipReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Create task history entry
    await this.createTaskHistory({
      organizationId: task.organizationId,
      taskId: id,
      propertyId: task.propertyId,
      action: 'skipped',
      previousStatus: task.status,
      newStatus: 'skipped',
      performedBy: userId,
      notes: reason,
      evidencePhotos: [],
      issuesFound: [],
    });

    return updatedTask;
  }

  async rescheduleTask(id: number, userId: string, newDate: Date, reason: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'rescheduled',
        rescheduledDate: newDate,
        rescheduleReason: reason,
        dueDate: newDate,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Create task history entry
    await this.createTaskHistory({
      organizationId: task.organizationId,
      taskId: id,
      propertyId: task.propertyId,
      action: 'rescheduled',
      previousStatus: task.status,
      newStatus: 'rescheduled',
      performedBy: userId,
      notes: `Rescheduled to ${newDate.toISOString()}: ${reason}`,
      evidencePhotos: [],
      issuesFound: [],
    });

    return updatedTask;
  }

  async startTask(id: number, userId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'in-progress',
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    // Create task history entry
    await this.createTaskHistory({
      organizationId: task.organizationId,
      taskId: id,
      propertyId: task.propertyId,
      action: 'started',
      previousStatus: task.status,
      newStatus: 'in-progress',
      performedBy: userId,
      notes: 'Task started',
      evidencePhotos: [],
      issuesFound: [],
    });

    return updatedTask;
  }

  // Task history operations
  async getTaskHistory(taskId: number): Promise<TaskHistory[]> {
    return await db.select().from(taskHistory).where(eq(taskHistory.taskId, taskId)).orderBy(desc(taskHistory.timestamp));
  }

  async getTaskHistoryByProperty(propertyId: number): Promise<TaskHistory[]> {
    return await db.select().from(taskHistory).where(eq(taskHistory.propertyId, propertyId)).orderBy(desc(taskHistory.timestamp));
  }

  async createTaskHistory(history: InsertTaskHistory): Promise<TaskHistory> {
    const [newHistory] = await db.insert(taskHistory).values(history).returning();
    return newHistory;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.propertyId, propertyId)).orderBy(asc(bookings.checkIn));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  // Finance operations
  async getFinances(): Promise<Finance[]> {
    return await db.select().from(finances).orderBy(desc(finances.date));
  }

  async getFinancesByProperty(propertyId: number): Promise<Finance[]> {
    return await db.select().from(finances).where(eq(finances.propertyId, propertyId)).orderBy(desc(finances.date));
  }

  async createFinance(finance: InsertFinance): Promise<Finance> {
    const [newFinance] = await db.insert(finances).values(finance).returning();
    return newFinance;
  }

  async updateFinance(id: number, finance: Partial<InsertFinance>): Promise<Finance | undefined> {
    const [updatedFinance] = await db
      .update(finances)
      .set({ ...finance, updatedAt: new Date() })
      .where(eq(finances.id, id))
      .returning();
    return updatedFinance;
  }

  // Inventory operations
  async getInventoryByProperty(propertyId: number): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.propertyId, propertyId)).orderBy(asc(inventory.itemName));
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [updatedItem] = await db
      .update(inventory)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return updatedItem;
  }

  // Platform settings operations
  async getPlatformSettings(): Promise<PlatformSetting[]> {
    return await db.select().from(platformSettings).orderBy(asc(platformSettings.category), asc(platformSettings.settingKey));
  }

  async getPlatformSettingsByCategory(category: string): Promise<PlatformSetting[]> {
    return await db.select().from(platformSettings).where(eq(platformSettings.category, category)).orderBy(asc(platformSettings.settingKey));
  }

  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    const [setting] = await db.select().from(platformSettings).where(eq(platformSettings.settingKey, key));
    return setting;
  }

  async upsertPlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const [newSetting] = await db
      .insert(platformSettings)
      .values({ ...setting, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: platformSettings.settingKey,
        set: {
          settingValue: setting.settingValue,
          settingType: setting.settingType,
          category: setting.category,
          description: setting.description,
          isSecret: setting.isSecret,
          updatedBy: setting.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newSetting;
  }

  async deletePlatformSetting(key: string): Promise<boolean> {
    const result = await db.delete(platformSettings).where(eq(platformSettings.settingKey, key));
    return result.rowCount! > 0;
  }

  // Add-on services operations
  async getAddonServices(): Promise<AddonService[]> {
    return await db.select().from(addonServices).orderBy(addonServices.category, addonServices.name);
  }

  async getAddonServicesByCategory(category: string): Promise<AddonService[]> {
    return await db.select().from(addonServices)
      .where(eq(addonServices.category, category))
      .orderBy(addonServices.name);
  }

  async getAddonService(id: number): Promise<AddonService | undefined> {
    const [service] = await db.select().from(addonServices).where(eq(addonServices.id, id));
    return service;
  }

  async createAddonService(service: InsertAddonService): Promise<AddonService> {
    const [newService] = await db
      .insert(addonServices)
      .values(service)
      .returning();
    return newService;
  }

  async updateAddonService(id: number, service: Partial<InsertAddonService>): Promise<AddonService | undefined> {
    const [updatedService] = await db
      .update(addonServices)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(addonServices.id, id))
      .returning();
    return updatedService;
  }

  async deleteAddonService(id: number): Promise<boolean> {
    const result = await db.delete(addonServices).where(eq(addonServices.id, id));
    return result.rowCount! > 0;
  }

  // Add-on bookings operations
  async getAddonBookings(): Promise<AddonBooking[]> {
    return await db.select().from(addonBookings).orderBy(addonBookings.scheduledDate);
  }

  async getAddonBookingsByProperty(propertyId: number): Promise<AddonBooking[]> {
    return await db.select().from(addonBookings)
      .where(eq(addonBookings.propertyId, propertyId))
      .orderBy(addonBookings.scheduledDate);
  }

  async getAddonBookingsByService(serviceId: number): Promise<AddonBooking[]> {
    return await db.select().from(addonBookings)
      .where(eq(addonBookings.serviceId, serviceId))
      .orderBy(addonBookings.scheduledDate);
  }

  async getAddonBooking(id: number): Promise<AddonBooking | undefined> {
    const [booking] = await db.select().from(addonBookings).where(eq(addonBookings.id, id));
    return booking;
  }

  async createAddonBooking(booking: InsertAddonBooking): Promise<AddonBooking> {
    const [newBooking] = await db
      .insert(addonBookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateAddonBooking(id: number, booking: Partial<InsertAddonBooking>): Promise<AddonBooking | undefined> {
    const [updatedBooking] = await db
      .update(addonBookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(addonBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteAddonBooking(id: number): Promise<boolean> {
    const result = await db.delete(addonBookings).where(eq(addonBookings.id, id));
    return result.rowCount! > 0;
  }

  // Utility bills operations
  async getUtilityBills(): Promise<UtilityBill[]> {
    return await db.select().from(utilityBills).orderBy(utilityBills.dueDate);
  }

  async getUtilityBillsByProperty(propertyId: number): Promise<UtilityBill[]> {
    return await db.select().from(utilityBills)
      .where(eq(utilityBills.propertyId, propertyId))
      .orderBy(utilityBills.dueDate);
  }

  async getUtilityBill(id: number): Promise<UtilityBill | undefined> {
    const [bill] = await db.select().from(utilityBills).where(eq(utilityBills.id, id));
    return bill;
  }

  async createUtilityBill(bill: InsertUtilityBill): Promise<UtilityBill> {
    const [newBill] = await db
      .insert(utilityBills)
      .values(bill)
      .returning();
    return newBill;
  }

  async updateUtilityBill(id: number, bill: Partial<InsertUtilityBill>): Promise<UtilityBill | undefined> {
    const [updatedBill] = await db
      .update(utilityBills)
      .set({ ...bill, updatedAt: new Date() })
      .where(eq(utilityBills.id, id))
      .returning();
    return updatedBill;
  }

  async deleteUtilityBill(id: number): Promise<boolean> {
    const result = await db.delete(utilityBills).where(eq(utilityBills.id, id));
    return result.rowCount! > 0;
  }

  // Welcome pack inventory operations
  async getWelcomePackItems(): Promise<WelcomePackItem[]> {
    return await db.select().from(welcomePackItems);
  }

  async getWelcomePackItem(id: number): Promise<WelcomePackItem | undefined> {
    const [item] = await db.select().from(welcomePackItems).where(eq(welcomePackItems.id, id));
    return item;
  }

  async createWelcomePackItem(item: InsertWelcomePackItem): Promise<WelcomePackItem> {
    const [newItem] = await db
      .insert(welcomePackItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateWelcomePackItem(id: number, item: Partial<InsertWelcomePackItem>): Promise<WelcomePackItem | undefined> {
    const [updatedItem] = await db
      .update(welcomePackItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(welcomePackItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteWelcomePackItem(id: number): Promise<boolean> {
    const result = await db.delete(welcomePackItems).where(eq(welcomePackItems.id, id));
    return result.rowCount! > 0;
  }

  // Welcome pack templates operations
  async getWelcomePackTemplates(): Promise<WelcomePackTemplate[]> {
    return await db.select().from(welcomePackTemplates);
  }

  async getWelcomePackTemplatesByProperty(propertyId: number): Promise<WelcomePackTemplate[]> {
    return await db.select().from(welcomePackTemplates).where(eq(welcomePackTemplates.propertyId, propertyId));
  }

  async createWelcomePackTemplate(template: InsertWelcomePackTemplate): Promise<WelcomePackTemplate> {
    const [newTemplate] = await db
      .insert(welcomePackTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateWelcomePackTemplate(id: number, template: Partial<InsertWelcomePackTemplate>): Promise<WelcomePackTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(welcomePackTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(welcomePackTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteWelcomePackTemplate(id: number): Promise<boolean> {
    const result = await db.delete(welcomePackTemplates).where(eq(welcomePackTemplates.id, id));
    return result.rowCount! > 0;
  }

  // Welcome pack usage operations
  async getWelcomePackUsage(): Promise<WelcomePackUsage[]> {
    return await db.select().from(welcomePackUsage);
  }

  async getWelcomePackUsageByProperty(propertyId: number): Promise<WelcomePackUsage[]> {
    return await db.select().from(welcomePackUsage).where(eq(welcomePackUsage.propertyId, propertyId));
  }

  async getWelcomePackUsageByBooking(bookingId: number): Promise<WelcomePackUsage[]> {
    return await db.select().from(welcomePackUsage).where(eq(welcomePackUsage.bookingId, bookingId));
  }

  async createWelcomePackUsage(usage: InsertWelcomePackUsage): Promise<WelcomePackUsage> {
    const [newUsage] = await db
      .insert(welcomePackUsage)
      .values(usage)
      .returning();
    return newUsage;
  }

  async updateWelcomePackUsage(id: number, usage: Partial<InsertWelcomePackUsage>): Promise<WelcomePackUsage | undefined> {
    const [updatedUsage] = await db
      .update(welcomePackUsage)
      .set({ ...usage, updatedAt: new Date() })
      .where(eq(welcomePackUsage.id, id))
      .returning();
    return updatedUsage;
  }

  // Welcome pack automation - logs default welcome pack usage from checkout
  async logWelcomePackUsageFromCheckout(bookingId: number, propertyId: number, processedBy: string): Promise<WelcomePackUsage[]> {
    // Get the default welcome pack template for this property
    const templates = await this.getWelcomePackTemplatesByProperty(propertyId);
    const usageRecords = [];

    for (const template of templates) {
      const item = await this.getWelcomePackItem(template.itemId);
      if (!item) continue;

      const totalCost = template.isComplimentary ? 0 : (template.defaultQuantity * Number(item.unitCost));
      
      const usage = await this.createWelcomePackUsage({
        organizationId: item.organizationId,
        propertyId: propertyId,
        bookingId: bookingId,
        itemId: template.itemId,
        quantityUsed: template.defaultQuantity,
        unitCost: item.unitCost,
        totalCost: totalCost.toString(),
        billingOption: template.isComplimentary ? 'complimentary' : 'owner_bill',
        processedBy: processedBy,
        usageDate: new Date().toISOString().split('T')[0],
        notes: 'Auto-logged from checkout'
      });
      
      usageRecords.push(usage);
    }

    return usageRecords;
  }

  // Inventory analytics operations
  async getInventoryStats(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any> {
    const { pool } = await import('./db');
    
    let query = `
      SELECT 
        COUNT(DISTINCT wi.id) as total_items,
        COALESCE(SUM(wu.quantity_used), 0) as total_usage,
        COALESCE(SUM(CAST(wu.total_cost AS DECIMAL)), 0) as total_cost,
        COUNT(CASE WHEN wi.current_stock <= wi.restock_threshold THEN 1 END) as low_stock_alerts
      FROM welcome_pack_items wi
      LEFT JOIN welcome_pack_usage wu ON wi.id = wu.item_id
      WHERE wi.organization_id = $1
    `;
    
    const params = [organizationId];
    let paramIndex = 2;
    
    if (filters?.propertyId) {
      query += ` AND wu.property_id = $${paramIndex}`;
      params.push(filters.propertyId);
      paramIndex++;
    }
    
    if (filters?.staffId) {
      query += ` AND wu.processed_by = $${paramIndex}`;
      params.push(filters.staffId);
      paramIndex++;
    }
    
    if (filters?.fromDate) {
      query += ` AND wu.usage_date >= $${paramIndex}`;
      params.push(filters.fromDate.toISOString().split('T')[0]);
      paramIndex++;
    }
    
    if (filters?.toDate) {
      query += ` AND wu.usage_date <= $${paramIndex}`;
      params.push(filters.toDate.toISOString().split('T')[0]);
      paramIndex++;
    }
    
    const result = await pool.query(query, params);
    const stats = result.rows[0];
    
    // Get top used items
    const topItemsQuery = `
      SELECT 
        wi.name as item_name,
        wi.category,
        SUM(wu.quantity_used) as total_used,
        SUM(CAST(wu.total_cost AS DECIMAL)) as total_cost
      FROM welcome_pack_usage wu
      JOIN welcome_pack_items wi ON wu.item_id = wi.id
      WHERE wi.organization_id = $1
      ${filters?.propertyId ? `AND wu.property_id = '${filters.propertyId}'` : ''}
      ${filters?.staffId ? `AND wu.processed_by = '${filters.staffId}'` : ''}
      ${filters?.fromDate ? `AND wu.usage_date >= '${filters.fromDate.toISOString().split('T')[0]}'` : ''}
      ${filters?.toDate ? `AND wu.usage_date <= '${filters.toDate.toISOString().split('T')[0]}'` : ''}
      GROUP BY wi.id, wi.name, wi.category
      ORDER BY total_used DESC
      LIMIT 10
    `;
    
    const topItemsResult = await pool.query(topItemsQuery, [organizationId]);
    
    // Get top properties
    const topPropertiesQuery = `
      SELECT 
        p.name as property_name,
        SUM(wu.quantity_used) as total_usage,
        SUM(CAST(wu.total_cost AS DECIMAL)) as total_cost
      FROM welcome_pack_usage wu
      JOIN properties p ON wu.property_id = p.id
      JOIN welcome_pack_items wi ON wu.item_id = wi.id
      WHERE wi.organization_id = $1
      ${filters?.staffId ? `AND wu.processed_by = '${filters.staffId}'` : ''}
      ${filters?.fromDate ? `AND wu.usage_date >= '${filters.fromDate.toISOString().split('T')[0]}'` : ''}
      ${filters?.toDate ? `AND wu.usage_date <= '${filters.toDate.toISOString().split('T')[0]}'` : ''}
      GROUP BY p.id, p.name
      ORDER BY total_usage DESC
      LIMIT 10
    `;
    
    const topPropertiesResult = await pool.query(topPropertiesQuery, [organizationId]);
    
    // Get staff usage
    const staffUsageQuery = `
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) as staff_name,
        SUM(wu.quantity_used) as total_usage,
        SUM(CAST(wu.total_cost AS DECIMAL)) as total_cost
      FROM welcome_pack_usage wu
      JOIN users u ON wu.processed_by = u.id
      JOIN welcome_pack_items wi ON wu.item_id = wi.id
      WHERE wi.organization_id = $1
      ${filters?.propertyId ? `AND wu.property_id = '${filters.propertyId}'` : ''}
      ${filters?.fromDate ? `AND wu.usage_date >= '${filters.fromDate.toISOString().split('T')[0]}'` : ''}
      ${filters?.toDate ? `AND wu.usage_date <= '${filters.toDate.toISOString().split('T')[0]}'` : ''}
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_usage DESC
      LIMIT 10
    `;
    
    const staffUsageResult = await pool.query(staffUsageQuery, [organizationId]);
    
    return {
      totalItems: parseInt(stats.total_items) || 0,
      totalUsage: parseInt(stats.total_usage) || 0,
      totalCost: parseFloat(stats.total_cost) || 0,
      lowStockAlerts: parseInt(stats.low_stock_alerts) || 0,
      topUsedItems: topItemsResult.rows || [],
      topProperties: topPropertiesResult.rows || [],
      staffUsage: staffUsageResult.rows || [],
      monthlyUsage: []
    };
  }

  async getDetailedWelcomePackUsage(organizationId: string, filters?: { propertyId?: string; staffId?: string; fromDate?: Date; toDate?: Date }): Promise<any[]> {
    const { pool } = await import('./db');
    
    let query = `
      SELECT 
        wu.*,
        wi.name as item_name,
        p.name as property_name,
        CONCAT(u.first_name, ' ', u.last_name) as staff_name
      FROM welcome_pack_usage wu
      JOIN welcome_pack_items wi ON wu.item_id = wi.id
      LEFT JOIN properties p ON wu.property_id = p.id
      LEFT JOIN users u ON wu.processed_by = u.id
      WHERE wi.organization_id = $1
    `;
    
    const params = [organizationId];
    let paramIndex = 2;
    
    if (filters?.propertyId) {
      query += ` AND wu.property_id = $${paramIndex}`;
      params.push(filters.propertyId);
      paramIndex++;
    }
    
    if (filters?.staffId) {
      query += ` AND wu.processed_by = $${paramIndex}`;
      params.push(filters.staffId);
      paramIndex++;
    }
    
    if (filters?.fromDate) {
      query += ` AND wu.usage_date >= $${paramIndex}`;
      params.push(filters.fromDate.toISOString().split('T')[0]);
      paramIndex++;
    }
    
    if (filters?.toDate) {
      query += ` AND wu.usage_date <= $${paramIndex}`;
      params.push(filters.toDate.toISOString().split('T')[0]);
      paramIndex++;
    }
    
    query += ` ORDER BY wu.usage_date DESC, wu.created_at DESC`;
    
    const result = await pool.query(query, params);
    return result.rows || [];
  }

  // Financial & Invoice Toolkit operations
  
  // Staff salary operations
  async getStaffSalary(userId: string): Promise<StaffSalary | undefined> {
    const [salary] = await db.select().from(staffSalaries)
      .where(and(eq(staffSalaries.userId, userId), eq(staffSalaries.isActive, true)))
      .orderBy(desc(staffSalaries.effectiveFrom));
    return salary;
  }

  async createStaffSalary(salary: InsertStaffSalary): Promise<StaffSalary> {
    const [newSalary] = await db.insert(staffSalaries).values(salary).returning();
    return newSalary;
  }

  async updateStaffSalary(id: number, salary: Partial<InsertStaffSalary>): Promise<StaffSalary | undefined> {
    const [updatedSalary] = await db
      .update(staffSalaries)
      .set({ ...salary, updatedAt: new Date() })
      .where(eq(staffSalaries.id, id))
      .returning();
    return updatedSalary;
  }

  // Commission earnings operations
  async getCommissionEarnings(userId: string, period?: string): Promise<CommissionEarning[]> {
    const conditions = [eq(commissionEarnings.userId, userId)];
    
    if (period) {
      conditions.push(eq(commissionEarnings.period, period));
    }
    
    return await db.select().from(commissionEarnings)
      .where(and(...conditions))
      .orderBy(desc(commissionEarnings.createdAt));
  }

  async createCommissionEarning(earning: InsertCommissionEarning): Promise<CommissionEarning> {
    const [newEarning] = await db.insert(commissionEarnings).values(earning).returning();
    return newEarning;
  }

  async updateCommissionEarning(id: number, earning: Partial<InsertCommissionEarning>): Promise<CommissionEarning | undefined> {
    const [updatedEarning] = await db
      .update(commissionEarnings)
      .set({ ...earning, updatedAt: new Date() })
      .where(eq(commissionEarnings.id, id))
      .returning();
    return updatedEarning;
  }

  async getPortfolioManagerEarnings(managerId: string, period?: string): Promise<any> {
    const currentPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get assigned properties
    const assignments = await db.select({
      propertyId: portfolioAssignments.propertyId,
      commissionRate: portfolioAssignments.commissionRate,
      propertyName: properties.name,
    })
    .from(portfolioAssignments)
    .leftJoin(properties, eq(portfolioAssignments.propertyId, properties.id))
    .where(and(
      eq(portfolioAssignments.managerId, managerId),
      eq(portfolioAssignments.isActive, true)
    ));

    // Get commission earnings for the period
    const earnings = await db.select().from(commissionEarnings)
      .where(and(
        eq(commissionEarnings.userId, managerId),
        eq(commissionEarnings.period, currentPeriod)
      ));

    // Calculate rental revenue from bookings for assigned properties
    const propertyIds = assignments.map(a => a.propertyId).filter(Boolean) as number[];
    let rentalRevenue = 0;
    
    if (propertyIds.length > 0) {
      const { pool } = await import('./db');
      const revenueQuery = `
        SELECT COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue
        FROM bookings 
        WHERE property_id = ANY($1)
        AND status = 'confirmed'
        AND DATE_TRUNC('month', check_in) = $2
      `;
      
      const result = await pool.query(revenueQuery, [propertyIds, `${currentPeriod}-01`]);
      rentalRevenue = parseFloat(result.rows[0]?.total_revenue) || 0;
    }

    return {
      assignedProperties: assignments,
      currentPeriod,
      rentalRevenue,
      commissionEarnings: earnings,
      totalCommission: earnings.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0),
    };
  }

  // Portfolio assignment operations
  async getPortfolioAssignments(managerId: string): Promise<PortfolioAssignment[]> {
    return await db.select().from(portfolioAssignments)
      .where(and(
        eq(portfolioAssignments.managerId, managerId),
        eq(portfolioAssignments.isActive, true)
      ));
  }

  async assignPortfolioProperty(assignment: InsertPortfolioAssignment): Promise<PortfolioAssignment> {
    const [newAssignment] = await db.insert(portfolioAssignments).values(assignment).returning();
    return newAssignment;
  }

  async unassignPortfolioProperty(managerId: string, propertyId: number): Promise<boolean> {
    const result = await db
      .update(portfolioAssignments)
      .set({ isActive: false, unassignedAt: new Date() })
      .where(and(
        eq(portfolioAssignments.managerId, managerId),
        eq(portfolioAssignments.propertyId, propertyId)
      ));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Invoice operations
  async getInvoices(organizationId: string, filters?: { userId?: string; type?: string; status?: string }): Promise<Invoice[]> {
    const conditions = [eq(invoices.organizationId, organizationId)];
    
    if (filters?.userId) {
      conditions.push(eq(invoices.senderId, filters.userId));
    }
    if (filters?.type) {
      conditions.push(eq(invoices.invoiceType, filters.type));
    }
    if (filters?.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    
    return await db.select().from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice, lineItems: InsertInvoiceLineItem[]): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    if (lineItems.length > 0) {
      const itemsWithInvoiceId = lineItems.map(item => ({
        ...item,
        invoiceId: newInvoice.id,
      }));
      await db.insert(invoiceLineItems).values(itemsWithInvoiceId);
    }
    
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async generateInvoiceNumber(organizationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Count invoices for this month
    const count = await db.select().from(invoices)
      .where(and(
        eq(invoices.organizationId, organizationId),
        eq(invoices.createdAt, new Date(year, today.getMonth(), 1))
      ));
    
    const sequence = String(count.length + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  // Owner payout operations
  async getOwnerPayouts(): Promise<OwnerPayout[]> {
    return await db.select().from(ownerPayouts).orderBy(desc(ownerPayouts.createdAt));
  }

  async getOwnerPayoutsByOwner(ownerId: string): Promise<OwnerPayout[]> {
    return await db.select().from(ownerPayouts)
      .where(eq(ownerPayouts.ownerId, ownerId))
      .orderBy(desc(ownerPayouts.createdAt));
  }

  async getOwnerPayoutsByProperty(propertyId: number): Promise<OwnerPayout[]> {
    return await db.select().from(ownerPayouts)
      .where(eq(ownerPayouts.propertyId, propertyId))
      .orderBy(desc(ownerPayouts.createdAt));
  }

  async getOwnerPayoutsByStatus(status: string): Promise<OwnerPayout[]> {
    return await db.select().from(ownerPayouts)
      .where(eq(ownerPayouts.status, status))
      .orderBy(desc(ownerPayouts.createdAt));
  }

  async getOwnerPayout(id: number): Promise<OwnerPayout | undefined> {
    const [payout] = await db.select().from(ownerPayouts).where(eq(ownerPayouts.id, id));
    return payout;
  }

  async createOwnerPayout(payout: InsertOwnerPayout): Promise<OwnerPayout> {
    const [newPayout] = await db.insert(ownerPayouts).values(payout).returning();
    return newPayout;
  }

  async updateOwnerPayout(id: number, payout: Partial<InsertOwnerPayout>): Promise<OwnerPayout | undefined> {
    const [updatedPayout] = await db.update(ownerPayouts)
      .set({ ...payout, updatedAt: new Date() })
      .where(eq(ownerPayouts.id, id))
      .returning();
    return updatedPayout;
  }

  async approveOwnerPayout(id: number, approvedBy: string, approvalNotes?: string): Promise<OwnerPayout | undefined> {
    const [updatedPayout] = await db.update(ownerPayouts)
      .set({
        status: 'approved',
        approvedBy: approvedBy,
        approvedDate: new Date(),
        approvalNotes: approvalNotes,
        updatedAt: new Date()
      })
      .where(eq(ownerPayouts.id, id))
      .returning();
    return updatedPayout;
  }

  async markOwnerPayoutPaid(id: number, paidBy: string, paymentMethod: string, paymentReference?: string): Promise<OwnerPayout | undefined> {
    const [updatedPayout] = await db.update(ownerPayouts)
      .set({
        status: 'paid',
        paidBy: paidBy,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        paymentDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ownerPayouts.id, id))
      .returning();
    return updatedPayout;
  }

  async uploadOwnerPayoutReceipt(id: number, receiptUrl: string, uploadedBy: string): Promise<OwnerPayout | undefined> {
    const [updatedPayout] = await db.update(ownerPayouts)
      .set({
        receiptUrl: receiptUrl,
        receiptUploadedBy: uploadedBy,
        receiptUploadedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ownerPayouts.id, id))
      .returning();
    return updatedPayout;
  }

  async confirmOwnerPayoutReceived(id: number, confirmedBy: string): Promise<OwnerPayout | undefined> {
    const [updatedPayout] = await db.update(ownerPayouts)
      .set({
        status: 'completed',
        confirmedBy: confirmedBy,
        confirmedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(ownerPayouts.id, id))
      .returning();
    return updatedPayout;
  }

  async calculateOwnerBalance(ownerId: string, propertyId?: number, startDate?: string, endDate?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    commissionDeductions: number;
    pendingPayouts: number;
  }> {
    let whereConditions = [eq(finances.ownerId, ownerId)];
    
    if (propertyId) {
      whereConditions.push(eq(finances.propertyId, propertyId));
    }
    
    if (startDate && endDate) {
      // Add date range conditions if needed
    }

    // Get income records
    const incomeRecords = await db.select().from(finances)
      .where(and(...whereConditions, eq(finances.type, 'income')));
    
    // Get expense records  
    const expenseRecords = await db.select().from(finances)
      .where(and(...whereConditions, eq(finances.type, 'expense')));

    // Get commission deductions
    const commissionRecords = await db.select().from(finances)
      .where(and(...whereConditions, eq(finances.type, 'commission')));

    // Get pending payouts
    let payoutConditions = [eq(ownerPayouts.ownerId, ownerId), eq(ownerPayouts.status, 'pending')];
    if (propertyId) {
      payoutConditions.push(eq(ownerPayouts.propertyId, propertyId));
    }
    
    const pendingPayouts = await db.select().from(ownerPayouts)
      .where(and(...payoutConditions));

    const totalIncome = incomeRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const totalExpenses = expenseRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const commissionDeductions = commissionRecords.reduce((sum, record) => sum + parseFloat(record.amount), 0);
    const pendingPayoutAmount = pendingPayouts.reduce((sum, payout) => sum + parseFloat(payout.requestedAmount), 0);

    return {
      totalIncome,
      totalExpenses,
      commissionDeductions,
      pendingPayouts: pendingPayoutAmount,
      netBalance: totalIncome - totalExpenses - commissionDeductions
    };
  }
  
  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.type, type)
      ))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(eq(notifications.id, id));
    return result.rowCount! > 0;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return result.rowCount! > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    return result.rowCount! > 0;
  }

  // Notification preferences operations
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async upsertNotificationPreferences(preferences: InsertNotificationPreference): Promise<NotificationPreference> {
    const [upserted] = await db
      .insert(notificationPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // Notification trigger methods
  async notifyTaskAssignment(taskId: number, assigneeId: string, assignedBy: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) return;

    const property = await this.getProperty(task.propertyId);
    const notification: InsertNotification = {
      organizationId: task.organizationId,
      userId: assigneeId,
      type: 'task_assignment',
      title: 'New Task Assigned',
      message: `You have been assigned a new ${task.type} task at ${property?.name || 'Property'}: ${task.title}`,
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      priority: task.priority === 'high' ? 'high' : 'normal',
      actionUrl: `/tasks`,
      actionLabel: 'View Task',
      createdBy: assignedBy,
    };

    await this.createNotification(notification);
  }

  async notifyBookingUpdate(bookingId: number, userIds: string[], updateType: string, message: string): Promise<void> {
    const booking = await this.getBooking(bookingId);
    if (!booking) return;

    const property = await this.getProperty(booking.propertyId);
    
    for (const userId of userIds) {
      const notification: InsertNotification = {
        organizationId: booking.organizationId,
        userId,
        type: 'booking_update',
        title: `Booking ${updateType}`,
        message: `${message} for ${booking.guestName} at ${property?.name || 'Property'}`,
        relatedEntityType: 'booking',
        relatedEntityId: bookingId,
        priority: updateType === 'cancelled' ? 'high' : 'normal',
        actionUrl: `/bookings`,
        actionLabel: 'View Booking',
      };

      await this.createNotification(notification);
    }
  }

  async notifyPayoutAction(payoutId: number, userId: string, action: string, actionBy: string): Promise<void> {
    const payout = await this.getOwnerPayout(payoutId);
    if (!payout) return;

    const actionMessages = {
      approved: 'Your payout request has been approved',
      paid: 'Your payout has been processed',
      completed: 'Your payout has been completed',
      rejected: 'Your payout request has been rejected',
    };

    const notification: InsertNotification = {
      organizationId: payout.organizationId,
      userId,
      type: 'payout_action',
      title: `Payout ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: actionMessages[action as keyof typeof actionMessages] || `Payout status changed to ${action}`,
      relatedEntityType: 'payout',
      relatedEntityId: payoutId,
      priority: action === 'rejected' ? 'high' : 'normal',
      actionUrl: `/payouts`,
      actionLabel: 'View Payout',
      createdBy: actionBy,
    };

    await this.createNotification(notification);
  }

  async notifyMaintenanceApproval(taskId: number, requesterId: string, approverIds: string[]): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) return;

    const property = await this.getProperty(task.propertyId);
    
    for (const approverId of approverIds) {
      const notification: InsertNotification = {
        organizationId: task.organizationId,
        userId: approverId,
        type: 'maintenance_approval',
        title: 'Maintenance Approval Required',
        message: `${task.type} task at ${property?.name || 'Property'} requires approval: ${task.title}`,
        relatedEntityType: 'task',
        relatedEntityId: taskId,
        priority: 'high',
        actionUrl: `/tasks`,
        actionLabel: 'Review Task',
        createdBy: requesterId,
      };

      await this.createNotification(notification);
    }
  }

  // Property utility accounts operations
  async getPropertyUtilityAccounts(): Promise<PropertyUtilityAccount[]> {
    return await db.select().from(propertyUtilityAccounts);
  }

  async getPropertyUtilityAccountsByProperty(propertyId: number): Promise<PropertyUtilityAccount[]> {
    return await db.select()
      .from(propertyUtilityAccounts)
      .where(eq(propertyUtilityAccounts.propertyId, propertyId));
  }

  async getPropertyUtilityAccount(id: number): Promise<PropertyUtilityAccount | undefined> {
    const [account] = await db.select()
      .from(propertyUtilityAccounts)
      .where(eq(propertyUtilityAccounts.id, id));
    return account;
  }

  async createPropertyUtilityAccount(account: InsertPropertyUtilityAccount): Promise<PropertyUtilityAccount> {
    const [created] = await db.insert(propertyUtilityAccounts)
      .values(account)
      .returning();
    return created;
  }

  async updatePropertyUtilityAccount(id: number, account: Partial<InsertPropertyUtilityAccount>): Promise<PropertyUtilityAccount | undefined> {
    const [updated] = await db.update(propertyUtilityAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(propertyUtilityAccounts.id, id))
      .returning();
    return updated;
  }

  async deletePropertyUtilityAccount(id: number): Promise<boolean> {
    const result = await db.delete(propertyUtilityAccounts)
      .where(eq(propertyUtilityAccounts.id, id));
    return result.rowCount! > 0;
  }

  // Enhanced utility bills operations
  async getUtilityBillsByMonth(billingMonth: string): Promise<UtilityBill[]> {
    return await db.select()
      .from(utilityBills)
      .where(eq(utilityBills.billingMonth, billingMonth))
      .orderBy(utilityBills.dueDate);
  }

  async getOverdueUtilityBills(): Promise<UtilityBill[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select()
      .from(utilityBills)
      .where(
        and(
          lt(utilityBills.dueDate, today),
          eq(utilityBills.status, 'pending')
        )
      )
      .orderBy(utilityBills.dueDate);
  }

  async getPendingUtilityBills(): Promise<UtilityBill[]> {
    return await db.select()
      .from(utilityBills)
      .where(eq(utilityBills.status, 'pending'))
      .orderBy(utilityBills.dueDate);
  }

  async uploadUtilityBillReceipt(id: number, receiptUrl: string, filename: string, uploadedBy: string): Promise<UtilityBill | undefined> {
    const [updated] = await db.update(utilityBills)
      .set({
        receiptUrl,
        receiptFilename: filename,
        uploadedBy,
        uploadedAt: new Date(),
        status: 'uploaded',
        updatedAt: new Date()
      })
      .where(eq(utilityBills.id, id))
      .returning();
    return updated;
  }

  async markUtilityBillPaid(id: number, paidBy: string): Promise<UtilityBill | undefined> {
    const [updated] = await db.update(utilityBills)
      .set({
        status: 'paid',
        updatedAt: new Date()
      })
      .where(eq(utilityBills.id, id))
      .returning();
    return updated;
  }

  // Utility bill reminder operations
  async getUtilityBillReminders(): Promise<UtilityBillReminder[]> {
    return await db.select().from(utilityBillReminders)
      .orderBy(desc(utilityBillReminders.sentAt));
  }

  async getUtilityBillRemindersByUser(userId: string): Promise<UtilityBillReminder[]> {
    return await db.select()
      .from(utilityBillReminders)
      .where(eq(utilityBillReminders.sentTo, userId))
      .orderBy(desc(utilityBillReminders.sentAt));
  }

  async getUnreadUtilityBillReminders(userId: string): Promise<UtilityBillReminder[]> {
    return await db.select()
      .from(utilityBillReminders)
      .where(
        and(
          eq(utilityBillReminders.sentTo, userId),
          eq(utilityBillReminders.isRead, false)
        )
      )
      .orderBy(desc(utilityBillReminders.sentAt));
  }

  async createUtilityBillReminder(reminder: InsertUtilityBillReminder): Promise<UtilityBillReminder> {
    const [created] = await db.insert(utilityBillReminders)
      .values(reminder)
      .returning();
    return created;
  }

  async markUtilityBillReminderRead(id: number): Promise<UtilityBillReminder | undefined> {
    const [updated] = await db.update(utilityBillReminders)
      .set({ isRead: true })
      .where(eq(utilityBillReminders.id, id))
      .returning();
    return updated;
  }

  // Utility automation operations
  async generateUtilityBillReminders(organizationId: string): Promise<UtilityBillReminder[]> {
    const today = new Date();
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(today.getDate() - 4);

    // Find bills that are overdue by 4+ days without receipts
    const overdueBills = await db.select()
      .from(utilityBills)
      .where(
        and(
          eq(utilityBills.organizationId, organizationId),
          eq(utilityBills.status, 'pending'),
          lt(utilityBills.dueDate, fourDaysAgo.toISOString().split('T')[0]),
          isNull(utilityBills.receiptUrl)
        )
      );

    const reminders: UtilityBillReminder[] = [];

    // Get admin users to send reminders to
    const adminUsers = await db.select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, organizationId),
          eq(users.role, 'admin')
        )
      );

    for (const bill of overdueBills) {
      for (const admin of adminUsers) {
        // Check if reminder already sent for this bill
        const existingReminder = await db.select()
          .from(utilityBillReminders)
          .where(
            and(
              eq(utilityBillReminders.utilityBillId, bill.id),
              eq(utilityBillReminders.sentTo, admin.id)
            )
          );

        if (existingReminder.length === 0) {
          const reminder = await this.createUtilityBillReminder({
            organizationId,
            utilityBillId: bill.id,
            reminderType: 'missing_receipt',
            sentTo: admin.id,
            reminderMessage: `Utility bill for ${bill.type} at property ${bill.propertyId} is overdue by ${Math.ceil((today.getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days. Please upload receipt.`,
            isRead: false
          });
          reminders.push(reminder);
        }
      }
    }

    return reminders;
  }

  async getUtilityExpensesByProperty(propertyId: number, fromDate?: Date, toDate?: Date): Promise<any> {
    let query = db.select({
      type: utilityBills.type,
      totalAmount: sql<number>`SUM(${utilityBills.amount})`,
      billCount: sql<number>`COUNT(*)`,
      avgAmount: sql<number>`AVG(${utilityBills.amount})`,
      responsibleParty: utilityBills.responsibleParty
    })
    .from(utilityBills)
    .where(eq(utilityBills.propertyId, propertyId))
    .groupBy(utilityBills.type, utilityBills.responsibleParty);

    if (fromDate) {
      query = query.where(gte(utilityBills.billPeriodStart, fromDate.toISOString().split('T')[0]));
    }
    if (toDate) {
      query = query.where(lte(utilityBills.billPeriodEnd, toDate.toISOString().split('T')[0]));
    }

    return await query;
  }

  async getUtilityExpensesByOwner(ownerId: string, fromDate?: Date, toDate?: Date): Promise<any> {
    let query = db.select({
      propertyName: properties.name,
      propertyId: properties.id,
      type: utilityBills.type,
      totalAmount: sql<number>`SUM(${utilityBills.amount})`,
      billCount: sql<number>`COUNT(*)`,
      responsibleParty: utilityBills.responsibleParty
    })
    .from(utilityBills)
    .innerJoin(properties, eq(utilityBills.propertyId, properties.id))
    .where(
      and(
        eq(properties.ownerId, ownerId),
        eq(utilityBills.isOwnerBillable, true)
      )
    )
    .groupBy(properties.id, properties.name, utilityBills.type, utilityBills.responsibleParty);

    if (fromDate) {
      query = query.where(gte(utilityBills.billPeriodStart, fromDate.toISOString().split('T')[0]));
    }
    if (toDate) {
      query = query.where(lte(utilityBills.billPeriodEnd, toDate.toISOString().split('T')[0]));
    }

    return await query;
  }

  // ===== AI FEEDBACK SYSTEM METHODS =====

  // Guest feedback operations
  async getGuestFeedback(organizationId: string, filters?: { propertyId?: number; processed?: boolean; requiresAction?: boolean }): Promise<GuestFeedback[]> {
    let query = db.select().from(guestFeedback).where(eq(guestFeedback.organizationId, organizationId));
    
    if (filters?.propertyId) {
      query = query.where(eq(guestFeedback.propertyId, filters.propertyId));
    }
    if (filters?.processed !== undefined) {
      query = query.where(eq(guestFeedback.isProcessed, filters.processed));
    }
    if (filters?.requiresAction !== undefined) {
      query = query.where(eq(guestFeedback.requiresAction, filters.requiresAction));
    }
    
    return await query.orderBy(desc(guestFeedback.receivedAt));
  }

  async getGuestFeedbackById(id: number): Promise<GuestFeedback | undefined> {
    const [feedback] = await db.select().from(guestFeedback).where(eq(guestFeedback.id, id));
    return feedback;
  }

  async createGuestFeedback(feedback: InsertGuestFeedback): Promise<GuestFeedback> {
    const [newFeedback] = await db.insert(guestFeedback).values(feedback).returning();
    return newFeedback;
  }

  async processGuestFeedback(id: number, processedBy: string, processingNotes?: string, assignedTaskId?: number): Promise<GuestFeedback | undefined> {
    const [updatedFeedback] = await db
      .update(guestFeedback)
      .set({
        isProcessed: true,
        processedBy,
        processingNotes,
        assignedTaskId,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(guestFeedback.id, id))
      .returning();
    return updatedFeedback;
  }

  async markFeedbackRequiresAction(id: number, requiresAction: boolean): Promise<GuestFeedback | undefined> {
    const [updatedFeedback] = await db
      .update(guestFeedback)
      .set({
        requiresAction,
        updatedAt: new Date(),
      })
      .where(eq(guestFeedback.id, id))
      .returning();
    return updatedFeedback;
  }

  // AI Task Rules operations
  async getAiTaskRules(organizationId: string, filters?: { isActive?: boolean; department?: string }): Promise<AiTaskRule[]> {
    let query = db.select().from(aiTaskRules).where(eq(aiTaskRules.organizationId, organizationId));
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(aiTaskRules.isActive, filters.isActive));
    }
    if (filters?.department) {
      query = query.where(eq(aiTaskRules.assignToDepartment, filters.department));
    }
    
    return await query.orderBy(desc(aiTaskRules.createdAt));
  }

  async getAiTaskRuleById(id: number): Promise<AiTaskRule | undefined> {
    const [rule] = await db.select().from(aiTaskRules).where(eq(aiTaskRules.id, id));
    return rule;
  }

  async createAiTaskRule(rule: InsertAiTaskRule): Promise<AiTaskRule> {
    const [newRule] = await db.insert(aiTaskRules).values(rule).returning();
    return newRule;
  }

  async updateAiTaskRule(id: number, rule: Partial<InsertAiTaskRule>): Promise<AiTaskRule | undefined> {
    const [updatedRule] = await db
      .update(aiTaskRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(aiTaskRules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteAiTaskRule(id: number): Promise<boolean> {
    const result = await db.delete(aiTaskRules).where(eq(aiTaskRules.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementRuleTriggerCount(id: number): Promise<void> {
    await db
      .update(aiTaskRules)
      .set({
        triggerCount: sql`${aiTaskRules.triggerCount} + 1`,
        lastTriggered: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiTaskRules.id, id));
  }

  // Feedback processing operations
  async createProcessingLog(log: InsertFeedbackProcessingLog): Promise<FeedbackProcessingLog> {
    const [newLog] = await db.insert(feedbackProcessingLog).values(log).returning();
    return newLog;
  }

  async getProcessingLogs(organizationId: string, feedbackId?: number): Promise<FeedbackProcessingLog[]> {
    let query = db.select().from(feedbackProcessingLog).where(eq(feedbackProcessingLog.organizationId, organizationId));
    
    if (feedbackId) {
      query = query.where(eq(feedbackProcessingLog.feedbackId, feedbackId));
    }
    
    return await query.orderBy(desc(feedbackProcessingLog.createdAt));
  }

  // AI Configuration operations
  async getAiConfiguration(organizationId: string): Promise<AiConfiguration | undefined> {
    const [config] = await db.select().from(aiConfiguration).where(eq(aiConfiguration.organizationId, organizationId));
    return config;
  }

  async upsertAiConfiguration(config: InsertAiConfiguration): Promise<AiConfiguration> {
    const [newConfig] = await db
      .insert(aiConfiguration)
      .values(config)
      .onConflictDoUpdate({
        target: aiConfiguration.organizationId,
        set: {
          ...config,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newConfig;
  }

  // Core AI processing methods
  async processMessageForKeywords(message: string, organizationId: string): Promise<{
    matchedRules: AiTaskRule[];
    detectedKeywords: string[];
    recommendedActions: string[];
  }> {
    // Get active AI task rules for the organization
    const activeRules = await this.getAiTaskRules(organizationId, { isActive: true });
    
    const matchedRules: AiTaskRule[] = [];
    const detectedKeywords: string[] = [];
    const recommendedActions: string[] = [];
    
    const lowerMessage = message.toLowerCase();
    
    for (const rule of activeRules) {
      const keywords = (rule.keywords as string[]) || [];
      const matchedKeywords = keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        matchedRules.push(rule);
        detectedKeywords.push(...matchedKeywords);
        
        const actionDescription = `Create ${rule.taskType} task: ${rule.taskTitle}`;
        if (rule.assignToDepartment) {
          recommendedActions.push(`${actionDescription} (${rule.assignToDepartment} department)`);
        } else {
          recommendedActions.push(actionDescription);
        }
      }
    }
    
    return {
      matchedRules,
      detectedKeywords: [...new Set(detectedKeywords)], // Remove duplicates
      recommendedActions,
    };
  }

  async createTaskFromFeedback(feedbackId: number, ruleId: number, assignedTo?: string): Promise<Task> {
    // Get the feedback and rule
    const feedback = await this.getGuestFeedbackById(feedbackId);
    const rule = await this.getAiTaskRuleById(ruleId);
    
    if (!feedback || !rule) {
      throw new Error("Feedback or rule not found");
    }
    
    // Create task based on rule template
    const taskData: InsertTask = {
      organizationId: feedback.organizationId,
      propertyId: feedback.propertyId,
      title: rule.taskTitle.replace('{guest_name}', feedback.guestName),
      description: `${rule.taskDescription || ''}\n\nOriginal guest message: "${feedback.originalMessage}"`,
      type: rule.taskType,
      department: rule.assignToDepartment || 'maintenance',
      priority: rule.priority,
      status: 'pending',
      assignedTo: assignedTo || rule.defaultAssignee || undefined,
      createdBy: 'AI_SYSTEM',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };
    
    const task = await this.createTask(taskData);
    
    // Update feedback with assigned task
    await this.processGuestFeedback(
      feedbackId,
      'AI_SYSTEM',
      `Task automatically created from AI rule: ${rule.ruleName}`,
      task.id
    );
    
    // Increment rule trigger count
    await this.incrementRuleTriggerCount(ruleId);
    
    // Log the processing
    await this.createProcessingLog({
      organizationId: feedback.organizationId,
      feedbackId,
      processingType: 'auto',
      triggeredRuleId: ruleId,
      matchedKeywords: feedback.detectedKeywords || [],
      confidenceScore: 0.85, // Default confidence for keyword matching
      actionTaken: 'task_created',
      createdTaskId: task.id,
      processedBy: 'AI_SYSTEM',
      processingTime: 100, // milliseconds (simulated)
    });
    
    return task;
  }

  // Guest Add-On Service Booking Platform operations
  async getGuestAddonServices(organizationId: string, filters?: { category?: string; isActive?: boolean }): Promise<GuestAddonService[]> {
    let query = db.select().from(guestAddonServices).where(eq(guestAddonServices.organizationId, organizationId));
    
    if (filters?.category) {
      query = query.where(eq(guestAddonServices.category, filters.category));
    }
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(guestAddonServices.isActive, filters.isActive));
    }
    
    return await query.orderBy(asc(guestAddonServices.serviceName));
  }

  async getGuestAddonServiceById(id: number): Promise<GuestAddonService | undefined> {
    const [service] = await db.select().from(guestAddonServices).where(eq(guestAddonServices.id, id));
    return service;
  }

  async createGuestAddonService(service: InsertGuestAddonService): Promise<GuestAddonService> {
    const [newService] = await db.insert(guestAddonServices).values(service).returning();
    return newService;
  }

  async updateGuestAddonService(id: number, service: Partial<InsertGuestAddonService>): Promise<GuestAddonService | undefined> {
    const [updatedService] = await db
      .update(guestAddonServices)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(guestAddonServices.id, id))
      .returning();
    return updatedService;
  }

  async deleteGuestAddonService(id: number): Promise<boolean> {
    const result = await db.delete(guestAddonServices).where(eq(guestAddonServices.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Guest add-on booking operations
  async getGuestAddonBookings(organizationId: string, filters?: { propertyId?: number; status?: string; billingRoute?: string }): Promise<GuestAddonBooking[]> {
    let query = db.select().from(guestAddonBookings).where(eq(guestAddonBookings.organizationId, organizationId));
    
    if (filters?.propertyId) {
      query = query.where(eq(guestAddonBookings.propertyId, filters.propertyId));
    }
    
    if (filters?.status) {
      query = query.where(eq(guestAddonBookings.status, filters.status));
    }
    
    if (filters?.billingRoute) {
      query = query.where(eq(guestAddonBookings.billingRoute, filters.billingRoute));
    }
    
    return await query.orderBy(desc(guestAddonBookings.bookingDate));
  }

  async getGuestAddonBookingById(id: number): Promise<GuestAddonBooking | undefined> {
    const [booking] = await db.select().from(guestAddonBookings).where(eq(guestAddonBookings.id, id));
    return booking;
  }

  async createGuestAddonBooking(booking: InsertGuestAddonBooking): Promise<GuestAddonBooking> {
    const [newBooking] = await db.insert(guestAddonBookings).values(booking).returning();
    
    // Auto-create task if service requires it
    if (booking.assignedTaskId) {
      const service = await this.getGuestAddonServiceById(booking.serviceId);
      if (service?.autoCreateTask) {
        const task = await this.createTask({
          organizationId: booking.organizationId,
          type: service.taskType || 'addon_service',
          title: `${service.serviceName} - ${booking.guestName}`,
          description: `Service: ${service.serviceName}\nGuest: ${booking.guestName}\nDate: ${booking.serviceDate}\nProperty: ${booking.propertyId}`,
          status: 'pending',
          priority: service.taskPriority || 'medium',
          propertyId: booking.propertyId,
          assignedTo: null, // Will be assigned by manager
          department: service.taskType,
        });

        // Update booking with task ID
        await db
          .update(guestAddonBookings)
          .set({ assignedTaskId: task.id })
          .where(eq(guestAddonBookings.id, newBooking.id));
        
        newBooking.assignedTaskId = task.id;
      }
    }
    
    return newBooking;
  }

  async updateGuestAddonBooking(id: number, booking: Partial<InsertGuestAddonBooking>): Promise<GuestAddonBooking | undefined> {
    const [updatedBooking] = await db
      .update(guestAddonBookings)
      .set(booking)
      .where(eq(guestAddonBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async confirmGuestAddonBooking(id: number, confirmedBy: string): Promise<GuestAddonBooking | undefined> {
    const [updatedBooking] = await db
      .update(guestAddonBookings)
      .set({ 
        status: 'confirmed',
        internalNotes: `Confirmed by ${confirmedBy} at ${new Date().toISOString()}`
      })
      .where(eq(guestAddonBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async cancelGuestAddonBooking(id: number, cancelledBy: string, reason?: string): Promise<GuestAddonBooking | undefined> {
    const [updatedBooking] = await db
      .update(guestAddonBookings)
      .set({ 
        status: 'cancelled',
        internalNotes: `Cancelled by ${cancelledBy}: ${reason || 'No reason provided'}`
      })
      .where(eq(guestAddonBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updateBookingPaymentStatus(id: number, paymentStatus: string, paymentMethod?: string, stripePaymentIntentId?: string): Promise<GuestAddonBooking | undefined> {
    const updateData: any = { paymentStatus };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (stripePaymentIntentId) updateData.stripePaymentIntentId = stripePaymentIntentId;
    
    const [updatedBooking] = await db
      .update(guestAddonBookings)
      .set(updateData)
      .where(eq(guestAddonBookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Guest portal access operations
  async getGuestPortalAccess(accessToken: string): Promise<GuestPortalAccess | undefined> {
    const [access] = await db.select().from(guestPortalAccess).where(eq(guestPortalAccess.accessToken, accessToken));
    return access;
  }

  async createGuestPortalAccess(access: InsertGuestPortalAccess): Promise<GuestPortalAccess> {
    const [newAccess] = await db.insert(guestPortalAccess).values(access).returning();
    return newAccess;
  }

  async updateGuestPortalAccessActivity(accessToken: string): Promise<void> {
    await db
      .update(guestPortalAccess)
      .set({ lastAccessedAt: new Date() })
      .where(eq(guestPortalAccess.accessToken, accessToken));
  }

  async deactivateGuestPortalAccess(accessToken: string): Promise<boolean> {
    const result = await db
      .update(guestPortalAccess)
      .set({ isActive: false })
      .where(eq(guestPortalAccess.accessToken, accessToken));
    return (result.rowCount || 0) > 0;
  }

  // Guest add-on service analytics
  async getGuestAddonServiceAnalytics(organizationId: string, filters?: { fromDate?: Date; toDate?: Date }): Promise<{
    totalBookings: number;
    totalRevenue: number;
    popularServices: Array<{ serviceName: string; bookingCount: number; revenue: number }>;
    billingRouteBreakdown: Record<string, number>;
    monthlyStats: Array<{ month: string; bookings: number; revenue: number }>;
  }> {
    let bookingQuery = db.select().from(guestAddonBookings).where(eq(guestAddonBookings.organizationId, organizationId));
    
    if (filters?.fromDate) {
      bookingQuery = bookingQuery.where(gte(guestAddonBookings.bookingDate, filters.fromDate));
    }
    
    if (filters?.toDate) {
      bookingQuery = bookingQuery.where(lte(guestAddonBookings.bookingDate, filters.toDate));
    }
    
    const bookings = await bookingQuery;
    
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount.toString()), 0);
    
    // Calculate popular services
    const serviceStats = new Map<string, { bookingCount: number; revenue: number }>();
    const billingRouteBreakdown: Record<string, number> = {};
    const monthlyStatsMap = new Map<string, { bookings: number; revenue: number }>();
    
    for (const booking of bookings) {
      // Get service name for this booking
      const service = await this.getGuestAddonServiceById(booking.serviceId);
      const serviceName = service?.serviceName || 'Unknown Service';
      
      // Update service stats
      const existing = serviceStats.get(serviceName) || { bookingCount: 0, revenue: 0 };
      existing.bookingCount++;
      existing.revenue += parseFloat(booking.totalAmount.toString());
      serviceStats.set(serviceName, existing);
      
      // Update billing route breakdown
      billingRouteBreakdown[booking.billingRoute] = (billingRouteBreakdown[booking.billingRoute] || 0) + 1;
      
      // Update monthly stats
      const month = booking.bookingDate.toISOString().slice(0, 7); // YYYY-MM format
      const monthlyExisting = monthlyStatsMap.get(month) || { bookings: 0, revenue: 0 };
      monthlyExisting.bookings++;
      monthlyExisting.revenue += parseFloat(booking.totalAmount.toString());
      monthlyStatsMap.set(month, monthlyExisting);
    }
    
    const popularServices = Array.from(serviceStats.entries())
      .map(([serviceName, stats]) => ({ serviceName, ...stats }))
      .sort((a, b) => b.bookingCount - a.bookingCount);
    
    const monthlyStats = Array.from(monthlyStatsMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      totalBookings,
      totalRevenue,
      popularServices,
      billingRouteBreakdown,
      monthlyStats,
    };
  }

  // ==================== RECURRING SERVICES & BILLS MANAGEMENT ====================

  // Recurring Services Operations
  async getRecurringServices(organizationId: string, filters?: {
    propertyId?: number;
    serviceCategory?: string;
    isActive?: boolean;
  }): Promise<RecurringService[]> {
    let query = db.select().from(recurringServices).where(eq(recurringServices.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(recurringServices.propertyId, filters.propertyId));
    }
    if (filters?.serviceCategory) {
      query = query.where(eq(recurringServices.serviceCategory, filters.serviceCategory));
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(recurringServices.isActive, filters.isActive));
    }

    return query.orderBy(recurringServices.nextBillingDate);
  }

  async getRecurringService(id: number): Promise<RecurringService | undefined> {
    const [service] = await db.select().from(recurringServices).where(eq(recurringServices.id, id));
    return service;
  }

  async createRecurringService(service: InsertRecurringService): Promise<RecurringService> {
    const [newService] = await db.insert(recurringServices).values(service).returning();
    return newService;
  }

  async updateRecurringService(id: number, updates: Partial<InsertRecurringService>): Promise<RecurringService | undefined> {
    const [updated] = await db
      .update(recurringServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(recurringServices.id, id))
      .returning();
    return updated;
  }

  async deleteRecurringService(id: number): Promise<boolean> {
    const result = await db.delete(recurringServices).where(eq(recurringServices.id, id));
    return result.rowCount > 0;
  }

  // Recurring Service Bills Operations
  async getRecurringServiceBills(organizationId: string, filters?: {
    serviceId?: number;
    propertyId?: number;
    status?: string;
    billingRoute?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<RecurringServiceBill[]> {
    let query = db.select().from(recurringServiceBills).where(eq(recurringServiceBills.organizationId, organizationId));

    if (filters?.serviceId) {
      query = query.where(eq(recurringServiceBills.serviceId, filters.serviceId));
    }
    if (filters?.propertyId) {
      query = query.where(eq(recurringServiceBills.propertyId, filters.propertyId));
    }
    if (filters?.status) {
      query = query.where(eq(recurringServiceBills.status, filters.status));
    }
    if (filters?.billingRoute) {
      query = query.where(eq(recurringServiceBills.billingRoute, filters.billingRoute));
    }
    if (filters?.fromDate) {
      query = query.where(gte(recurringServiceBills.billDate, filters.fromDate));
    }
    if (filters?.toDate) {
      query = query.where(lte(recurringServiceBills.billDate, filters.toDate));
    }

    return query.orderBy(desc(recurringServiceBills.billDate));
  }

  async getRecurringServiceBill(id: number): Promise<RecurringServiceBill | undefined> {
    const [bill] = await db.select().from(recurringServiceBills).where(eq(recurringServiceBills.id, id));
    return bill;
  }

  async createRecurringServiceBill(bill: InsertRecurringServiceBill): Promise<RecurringServiceBill> {
    const [newBill] = await db.insert(recurringServiceBills).values(bill).returning();
    return newBill;
  }

  async updateRecurringServiceBill(id: number, updates: Partial<InsertRecurringServiceBill>): Promise<RecurringServiceBill | undefined> {
    const [updated] = await db
      .update(recurringServiceBills)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(recurringServiceBills.id, id))
      .returning();
    return updated;
  }

  async markBillAsPaid(billId: number, paymentDetails: {
    paidAmount: number;
    paymentDate: Date;
    paymentMethod: string;
    paymentReference?: string;
    processedBy: string;
  }): Promise<RecurringServiceBill | undefined> {
    const [updated] = await db
      .update(recurringServiceBills)
      .set({
        status: 'paid',
        paidAmount: paymentDetails.paidAmount.toString(),
        paymentDate: paymentDetails.paymentDate,
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        processedBy: paymentDetails.processedBy,
        updatedAt: new Date(),
      })
      .where(eq(recurringServiceBills.id, billId))
      .returning();
    return updated;
  }

  // Bill Reminders Operations
  async getBillReminders(organizationId: string, filters?: {
    reminderType?: string;
    status?: string;
    recipientUser?: string;
  }): Promise<BillReminder[]> {
    let query = db.select().from(billReminders).where(eq(billReminders.organizationId, organizationId));

    if (filters?.reminderType) {
      query = query.where(eq(billReminders.reminderType, filters.reminderType));
    }
    if (filters?.status) {
      query = query.where(eq(billReminders.status, filters.status));
    }
    if (filters?.recipientUser) {
      query = query.where(eq(billReminders.recipientUser, filters.recipientUser));
    }

    return query.orderBy(billReminders.reminderDate);
  }

  async createBillReminder(reminder: InsertBillReminder): Promise<BillReminder> {
    const [newReminder] = await db.insert(billReminders).values(reminder).returning();
    return newReminder;
  }

  async markReminderAsSent(reminderId: number): Promise<BillReminder | undefined> {
    const [updated] = await db
      .update(billReminders)
      .set({
        status: 'sent',
        sentAt: new Date(),
      })
      .where(eq(billReminders.id, reminderId))
      .returning();
    return updated;
  }

  async getOverdueBills(organizationId: string): Promise<RecurringServiceBill[]> {
    const today = new Date();
    return db
      .select()
      .from(recurringServiceBills)
      .where(
        and(
          eq(recurringServiceBills.organizationId, organizationId),
          eq(recurringServiceBills.status, 'pending'),
          lt(recurringServiceBills.dueDate, today)
        )
      )
      .orderBy(recurringServiceBills.dueDate);
  }

  async getUpcomingBills(organizationId: string, daysAhead: number = 7): Promise<RecurringServiceBill[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return db
      .select()
      .from(recurringServiceBills)
      .where(
        and(
          eq(recurringServiceBills.organizationId, organizationId),
          eq(recurringServiceBills.status, 'pending'),
          gte(recurringServiceBills.dueDate, today),
          lte(recurringServiceBills.dueDate, futureDate)
        )
      )
      .orderBy(recurringServiceBills.dueDate);
  }

  // Service Performance Operations
  async getServicePerformance(organizationId: string, filters?: {
    serviceId?: number;
    propertyId?: number;
    performanceMonth?: string;
  }): Promise<ServicePerformance[]> {
    let query = db.select().from(servicePerformance).where(eq(servicePerformance.organizationId, organizationId));

    if (filters?.serviceId) {
      query = query.where(eq(servicePerformance.serviceId, filters.serviceId));
    }
    if (filters?.propertyId) {
      query = query.where(eq(servicePerformance.propertyId, filters.propertyId));
    }
    if (filters?.performanceMonth) {
      query = query.where(eq(servicePerformance.performanceMonth, filters.performanceMonth));
    }

    return query.orderBy(desc(servicePerformance.performanceMonth));
  }

  async createServicePerformance(performance: InsertServicePerformance): Promise<ServicePerformance> {
    const [newPerformance] = await db.insert(servicePerformance).values(performance).returning();
    return newPerformance;
  }

  async updateServicePerformance(id: number, updates: Partial<InsertServicePerformance>): Promise<ServicePerformance | undefined> {
    const [updated] = await db
      .update(servicePerformance)
      .set(updates)
      .where(eq(servicePerformance.id, id))
      .returning();
    return updated;
  }

  // Analytics for Recurring Services
  async getRecurringServicesAnalytics(organizationId: string, filters?: {
    fromDate?: Date;
    toDate?: Date;
    propertyId?: number;
  }): Promise<{
    totalServices: number;
    totalMonthlyBilling: number;
    servicesByCategory: { category: string; count: number; totalBilling: number }[];
    upcomingBills: { count: number; totalAmount: number };
    overdueBills: { count: number; totalAmount: number };
    billingRouteBreakdown: { route: string; count: number; totalAmount: number }[];
    performanceAverages: {
      qualityRating: number;
      timelinessRating: number;
      costEffectiveness: number;
      customerSatisfaction: number;
    };
  }> {
    const [totalServices] = await db
      .select({ count: count() })
      .from(recurringServices)
      .where(
        and(
          eq(recurringServices.organizationId, organizationId),
          eq(recurringServices.isActive, true),
          filters?.propertyId ? eq(recurringServices.propertyId, filters.propertyId) : undefined
        )
      );

    const [totalMonthlyBilling] = await db
      .select({ total: sum(recurringServices.billingAmount) })
      .from(recurringServices)
      .where(
        and(
          eq(recurringServices.organizationId, organizationId),
          eq(recurringServices.isActive, true),
          eq(recurringServices.billingFrequency, 'monthly'),
          filters?.propertyId ? eq(recurringServices.propertyId, filters.propertyId) : undefined
        )
      );

    const servicesByCategory = await db
      .select({
        category: recurringServices.serviceCategory,
        count: count(),
        totalBilling: sum(recurringServices.billingAmount),
      })
      .from(recurringServices)
      .where(
        and(
          eq(recurringServices.organizationId, organizationId),
          eq(recurringServices.isActive, true),
          filters?.propertyId ? eq(recurringServices.propertyId, filters.propertyId) : undefined
        )
      )
      .groupBy(recurringServices.serviceCategory);

    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const [upcomingBills] = await db
      .select({
        count: count(),
        totalAmount: sum(recurringServiceBills.billAmount),
      })
      .from(recurringServiceBills)
      .where(
        and(
          eq(recurringServiceBills.organizationId, organizationId),
          eq(recurringServiceBills.status, 'pending'),
          gte(recurringServiceBills.dueDate, today),
          lte(recurringServiceBills.dueDate, next7Days)
        )
      );

    const [overdueBills] = await db
      .select({
        count: count(),
        totalAmount: sum(recurringServiceBills.billAmount),
      })
      .from(recurringServiceBills)
      .where(
        and(
          eq(recurringServiceBills.organizationId, organizationId),
          eq(recurringServiceBills.status, 'pending'),
          lt(recurringServiceBills.dueDate, today)
        )
      );

    const billingRouteBreakdown = await db
      .select({
        route: recurringServiceBills.billingRoute,
        count: count(),
        totalAmount: sum(recurringServiceBills.billAmount),
      })
      .from(recurringServiceBills)
      .where(eq(recurringServiceBills.organizationId, organizationId))
      .groupBy(recurringServiceBills.billingRoute);

    const [performanceAverages] = await db
      .select({
        qualityRating: avg(servicePerformance.qualityRating),
        timelinessRating: avg(servicePerformance.timelinessRating),
        costEffectiveness: avg(servicePerformance.costEffectiveness),
        customerSatisfaction: avg(servicePerformance.customerSatisfaction),
      })
      .from(servicePerformance)
      .where(eq(servicePerformance.organizationId, organizationId));

    return {
      totalServices: totalServices.count || 0,
      totalMonthlyBilling: parseFloat(totalMonthlyBilling.total || '0'),
      servicesByCategory: servicesByCategory.map(cat => ({
        category: cat.category,
        count: cat.count,
        totalBilling: parseFloat(cat.totalBilling || '0'),
      })),
      upcomingBills: {
        count: upcomingBills.count || 0,
        totalAmount: parseFloat(upcomingBills.totalAmount || '0'),
      },
      overdueBills: {
        count: overdueBills.count || 0,
        totalAmount: parseFloat(overdueBills.totalAmount || '0'),
      },
      billingRouteBreakdown: billingRouteBreakdown.map(route => ({
        route: route.route,
        count: route.count,
        totalAmount: parseFloat(route.totalAmount || '0'),
      })),
      performanceAverages: {
        qualityRating: parseFloat(performanceAverages.qualityRating || '0'),
        timelinessRating: parseFloat(performanceAverages.timelinessRating || '0'),
        costEffectiveness: parseFloat(performanceAverages.costEffectiveness || '0'),
        customerSatisfaction: parseFloat(performanceAverages.customerSatisfaction || '0'),
      },
    };
  }

  // ==================== PROPERTY MEDIA LIBRARY ====================

  // Property Media Operations
  async getPropertyMedia(organizationId: string, filters?: {
    propertyId?: number;
    mediaType?: string;
    isAgentApproved?: boolean;
  }): Promise<PropertyMedia[]> {
    let query = db.select().from(propertyMedia).where(eq(propertyMedia.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(propertyMedia.propertyId, filters.propertyId));
    }
    if (filters?.mediaType) {
      query = query.where(eq(propertyMedia.mediaType, filters.mediaType));
    }
    if (filters?.isAgentApproved !== undefined) {
      query = query.where(eq(propertyMedia.isAgentApproved, filters.isAgentApproved));
    }

    return query.orderBy(propertyMedia.displayOrder, propertyMedia.createdAt);
  }

  async getPropertyMediaById(id: number): Promise<PropertyMedia | undefined> {
    const [media] = await db.select().from(propertyMedia).where(eq(propertyMedia.id, id));
    return media;
  }

  async createPropertyMedia(media: InsertPropertyMedia): Promise<PropertyMedia> {
    const [newMedia] = await db.insert(propertyMedia).values(media).returning();
    return newMedia;
  }

  async updatePropertyMedia(id: number, updates: Partial<InsertPropertyMedia>): Promise<PropertyMedia | undefined> {
    const [updated] = await db
      .update(propertyMedia)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyMedia.id, id))
      .returning();
    return updated;
  }

  async deletePropertyMedia(id: number): Promise<void> {
    await db.delete(propertyMedia).where(eq(propertyMedia.id, id));
  }

  async approveMediaForAgents(id: number, approvedBy: string): Promise<PropertyMedia | undefined> {
    const [updated] = await db
      .update(propertyMedia)
      .set({ 
        isAgentApproved: true, 
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(propertyMedia.id, id))
      .returning();
    return updated;
  }

  // Property Internal Notes Operations
  async getPropertyInternalNotes(organizationId: string, filters?: {
    propertyId?: number;
    category?: string;
    isVisibleToAgents?: boolean;
  }): Promise<PropertyInternalNotes[]> {
    let query = db.select().from(propertyInternalNotes).where(eq(propertyInternalNotes.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(propertyInternalNotes.propertyId, filters.propertyId));
    }
    if (filters?.category) {
      query = query.where(eq(propertyInternalNotes.category, filters.category));
    }
    if (filters?.isVisibleToAgents !== undefined) {
      query = query.where(eq(propertyInternalNotes.isVisibleToAgents, filters.isVisibleToAgents));
    }

    return query.orderBy(desc(propertyInternalNotes.createdAt));
  }

  async createPropertyInternalNote(note: InsertPropertyInternalNotes): Promise<PropertyInternalNotes> {
    const [newNote] = await db.insert(propertyInternalNotes).values(note).returning();
    return newNote;
  }

  async updatePropertyInternalNote(id: number, updates: Partial<InsertPropertyInternalNotes>): Promise<PropertyInternalNotes | undefined> {
    const [updated] = await db
      .update(propertyInternalNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyInternalNotes.id, id))
      .returning();
    return updated;
  }

  async deletePropertyInternalNote(id: number): Promise<void> {
    await db.delete(propertyInternalNotes).where(eq(propertyInternalNotes.id, id));
  }

  // Agent Media Access Operations
  async trackAgentMediaAccess(access: InsertAgentMediaAccess): Promise<AgentMediaAccess> {
    const [newAccess] = await db.insert(agentMediaAccess).values(access).returning();
    return newAccess;
  }

  async updateAgentMediaLastViewed(agentId: string, mediaId: number): Promise<void> {
    await db
      .update(agentMediaAccess)
      .set({ lastViewedAt: new Date() })
      .where(and(
        eq(agentMediaAccess.agentId, agentId),
        eq(agentMediaAccess.mediaId, mediaId)
      ));
  }

  async incrementCopyCount(agentId: string, mediaId: number): Promise<void> {
    // First try to increment existing record
    const existing = await db
      .select()
      .from(agentMediaAccess)
      .where(and(
        eq(agentMediaAccess.agentId, agentId),
        eq(agentMediaAccess.mediaId, mediaId)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(agentMediaAccess)
        .set({ copyCount: existing[0].copyCount + 1 })
        .where(eq(agentMediaAccess.id, existing[0].id));
    }
  }

  // Agent Media Library Dashboard
  async getAgentMediaLibraryData(organizationId: string, agentId: string, filters?: {
    propertyStatus?: string;
    mediaType?: string;
  }) {
    // Get properties accessible to this agent (based on role and assignments)
    const user = await this.getUser(agentId);
    let propertiesQuery;

    if (user?.role === 'retail-agent' || user?.role === 'referral-agent') {
      // Agents can only see approved media for properties they have access to
      propertiesQuery = db
        .select({
          id: properties.id,
          name: properties.name,
          status: properties.status,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          maxGuests: properties.maxGuests,
          pricePerNight: properties.pricePerNight,
          commissionRate: properties.commissionRate,
        })
        .from(properties)
        .where(eq(properties.organizationId, organizationId));

      if (filters?.propertyStatus) {
        propertiesQuery = propertiesQuery.where(eq(properties.status, filters.propertyStatus));
      }
    } else {
      // Admins and PMs can see all properties
      propertiesQuery = db
        .select({
          id: properties.id,
          name: properties.name,
          status: properties.status,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          maxGuests: properties.maxGuests,
          pricePerNight: properties.pricePerNight,
          commissionRate: properties.commissionRate,
        })
        .from(properties)
        .where(eq(properties.organizationId, organizationId));
    }

    const propertiesList = await propertiesQuery;

    // Get approved media for these properties
    const mediaData = await Promise.all(
      propertiesList.map(async (property) => {
        let mediaQuery = db
          .select()
          .from(propertyMedia)
          .where(and(
            eq(propertyMedia.organizationId, organizationId),
            eq(propertyMedia.propertyId, property.id),
            eq(propertyMedia.isAgentApproved, true)
          ));

        if (filters?.mediaType) {
          mediaQuery = mediaQuery.where(eq(propertyMedia.mediaType, filters.mediaType));
        }

        const media = await mediaQuery.orderBy(propertyMedia.displayOrder);

        // Get internal notes visible to agents
        const notes = await db
          .select()
          .from(propertyInternalNotes)
          .where(and(
            eq(propertyInternalNotes.organizationId, organizationId),
            eq(propertyInternalNotes.propertyId, property.id),
            eq(propertyInternalNotes.isVisibleToAgents, true)
          ))
          .orderBy(desc(propertyInternalNotes.createdAt));

        return {
          property,
          media,
          notes,
        };
      })
    );

    return mediaData;
  }

  // ===== OWNER DASHBOARD PLATFORM =====

  // Owner Activity Timeline Operations
  async createOwnerActivityTimeline(activity: InsertOwnerActivityTimeline): Promise<OwnerActivityTimeline> {
    const [newActivity] = await db.insert(ownerActivityTimeline).values(activity).returning();
    return newActivity;
  }

  async getOwnerActivityTimeline(organizationId: string, ownerId: string, filters?: {
    propertyId?: number;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<OwnerActivityTimeline[]> {
    let query = db
      .select({
        id: ownerActivityTimeline.id,
        organizationId: ownerActivityTimeline.organizationId,
        propertyId: ownerActivityTimeline.propertyId,
        ownerId: ownerActivityTimeline.ownerId,
        activityType: ownerActivityTimeline.activityType,
        title: ownerActivityTimeline.title,
        description: ownerActivityTimeline.description,
        metadata: ownerActivityTimeline.metadata,
        referenceId: ownerActivityTimeline.referenceId,
        referenceType: ownerActivityTimeline.referenceType,
        createdAt: ownerActivityTimeline.createdAt,
        createdBy: ownerActivityTimeline.createdBy,
        propertyName: properties.name,
      })
      .from(ownerActivityTimeline)
      .leftJoin(properties, eq(ownerActivityTimeline.propertyId, properties.id))
      .where(and(
        eq(ownerActivityTimeline.organizationId, organizationId),
        eq(ownerActivityTimeline.ownerId, ownerId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(ownerActivityTimeline.propertyId, filters.propertyId));
    }
    if (filters?.activityType) {
      query = query.where(eq(ownerActivityTimeline.activityType, filters.activityType));
    }
    if (filters?.startDate) {
      query = query.where(gte(ownerActivityTimeline.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(ownerActivityTimeline.createdAt, new Date(filters.endDate)));
    }

    const result = await query
      .orderBy(desc(ownerActivityTimeline.createdAt))
      .limit(filters?.limit || 50);

    return result as OwnerActivityTimeline[];
  }

  // Owner Payout Request Operations
  async createOwnerPayoutRequest(request: InsertOwnerPayoutRequest): Promise<OwnerPayoutRequest> {
    const [newRequest] = await db.insert(ownerPayoutRequests).values(request).returning();
    return newRequest;
  }

  async getOwnerPayoutRequests(organizationId: string, ownerId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OwnerPayoutRequest[]> {
    let query = db
      .select()
      .from(ownerPayoutRequests)
      .where(and(
        eq(ownerPayoutRequests.organizationId, organizationId),
        eq(ownerPayoutRequests.ownerId, ownerId)
      ));

    if (filters?.status) {
      query = query.where(eq(ownerPayoutRequests.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(ownerPayoutRequests.requestedAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(ownerPayoutRequests.requestedAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(ownerPayoutRequests.requestedAt));
  }

  async updateOwnerPayoutRequest(id: number, updates: Partial<OwnerPayoutRequest>): Promise<OwnerPayoutRequest | undefined> {
    const [updated] = await db
      .update(ownerPayoutRequests)
      .set(updates)
      .where(eq(ownerPayoutRequests.id, id))
      .returning();
    return updated;
  }

  async approvePayoutRequest(id: number, approvedBy: string, notes?: string): Promise<OwnerPayoutRequest | undefined> {
    const [updated] = await db
      .update(ownerPayoutRequests)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy,
        adminNotes: notes,
      })
      .where(eq(ownerPayoutRequests.id, id))
      .returning();
    return updated;
  }

  async completePayoutRequest(id: number, completedBy: string, paymentData: {
    paymentMethod?: string;
    paymentReference?: string;
    paymentReceiptUrl?: string;
  }): Promise<OwnerPayoutRequest | undefined> {
    const [updated] = await db
      .update(ownerPayoutRequests)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completedBy,
        paymentUploadedAt: new Date(),
        paymentUploadedBy: completedBy,
        ...paymentData,
      })
      .where(eq(ownerPayoutRequests.id, id))
      .returning();
    return updated;
  }

  // Owner Invoice Operations
  async createOwnerInvoice(invoice: InsertOwnerInvoice): Promise<OwnerInvoice> {
    const [newInvoice] = await db.insert(ownerInvoices).values(invoice).returning();
    return newInvoice;
  }

  async getOwnerInvoices(organizationId: string, ownerId: string, filters?: {
    propertyId?: number;
    invoiceType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OwnerInvoice[]> {
    let query = db
      .select({
        ...ownerInvoices,
        propertyName: properties.name,
      })
      .from(ownerInvoices)
      .leftJoin(properties, eq(ownerInvoices.propertyId, properties.id))
      .where(and(
        eq(ownerInvoices.organizationId, organizationId),
        eq(ownerInvoices.ownerId, ownerId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(ownerInvoices.propertyId, filters.propertyId));
    }
    if (filters?.invoiceType) {
      query = query.where(eq(ownerInvoices.invoiceType, filters.invoiceType));
    }
    if (filters?.status) {
      query = query.where(eq(ownerInvoices.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(ownerInvoices.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(ownerInvoices.createdAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(ownerInvoices.createdAt));
  }

  async updateOwnerInvoice(id: number, updates: Partial<InsertOwnerInvoice>): Promise<OwnerInvoice | undefined> {
    const [updated] = await db
      .update(ownerInvoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ownerInvoices.id, id))
      .returning();
    return updated;
  }

  // Owner Preferences Operations
  async getOwnerPreferences(organizationId: string, ownerId: string): Promise<OwnerPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(ownerPreferences)
      .where(and(
        eq(ownerPreferences.organizationId, organizationId),
        eq(ownerPreferences.ownerId, ownerId)
      ));
    return preferences;
  }

  async upsertOwnerPreferences(preferences: InsertOwnerPreferences): Promise<OwnerPreferences> {
    const [result] = await db
      .insert(ownerPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: ownerPreferences.ownerId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Owner Dashboard Analytics
  async getOwnerDashboardStats(organizationId: string, ownerId: string, filters?: {
    startDate?: string;
    endDate?: string;
    propertyId?: number;
  }) {
    // Get owner's properties
    const ownerProperties = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.organizationId, organizationId),
        eq(properties.ownerId, ownerId)
      ));

    const propertyIds = ownerProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        upcomingBookings: 0,
        completedTasks: 0,
        pendingPayouts: 0,
        recentActivity: [],
      };
    }

    // Get booking stats
    let bookingsQuery = db
      .select({
        count: count(),
        totalAmount: sum(finances.amount),
      })
      .from(bookings)
      .leftJoin(finances, eq(bookings.id, finances.bookingId))
      .where(and(
        eq(bookings.organizationId, organizationId),
        inArray(bookings.propertyId, propertyIds)
      ));

    if (filters?.startDate) {
      bookingsQuery = bookingsQuery.where(gte(bookings.startDate, filters.startDate));
    }
    if (filters?.endDate) {
      bookingsQuery = bookingsQuery.where(lte(bookings.endDate, filters.endDate));
    }

    const [bookingStats] = await bookingsQuery;

    // Get completed tasks count
    const [taskStats] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        inArray(tasks.propertyId, propertyIds),
        eq(tasks.status, 'completed')
      ));

    // Get pending payouts
    const [payoutStats] = await db
      .select({ 
        count: count(),
        totalAmount: sum(ownerPayoutRequests.amount)
      })
      .from(ownerPayoutRequests)
      .where(and(
        eq(ownerPayoutRequests.organizationId, organizationId),
        eq(ownerPayoutRequests.ownerId, ownerId),
        eq(ownerPayoutRequests.status, 'pending')
      ));

    // Get upcoming bookings (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [upcomingStats] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.organizationId, organizationId),
        inArray(bookings.propertyId, propertyIds),
        gte(bookings.startDate, new Date().toISOString()),
        lte(bookings.startDate, thirtyDaysFromNow.toISOString())
      ));

    return {
      totalRevenue: Number(bookingStats?.totalAmount || 0),
      totalBookings: bookingStats?.count || 0,
      upcomingBookings: upcomingStats?.count || 0,
      completedTasks: taskStats?.count || 0,
      pendingPayouts: payoutStats?.count || 0,
      pendingPayoutAmount: Number(payoutStats?.totalAmount || 0),
      properties: ownerProperties,
    };
  }

  // Financial Summary for Owner
  async getOwnerFinancialSummary(organizationId: string, ownerId: string, filters?: {
    startDate?: string;
    endDate?: string;
    propertyId?: number;
    currency?: string;
  }) {
    // Get owner's properties
    const ownerProperties = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.organizationId, organizationId),
        eq(properties.ownerId, ownerId)
      ));

    const propertyIds = ownerProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return {
        rentalIncome: 0,
        managementFees: 0,
        addonRevenue: 0,
        utilityDeductions: 0,
        serviceDeductions: 0,
        netBalance: 0,
        breakdown: [],
      };
    }

    let financeQuery = db
      .select({
        type: finances.type,
        source: finances.source,
        category: finances.category,
        totalAmount: sum(finances.amount),
        count: count(),
      })
      .from(finances)
      .where(and(
        eq(finances.organizationId, organizationId),
        inArray(finances.propertyId, propertyIds)
      ));

    if (filters?.startDate) {
      financeQuery = financeQuery.where(gte(finances.date, filters.startDate));
    }
    if (filters?.endDate) {
      financeQuery = financeQuery.where(lte(finances.date, filters.endDate));
    }
    if (filters?.propertyId) {
      financeQuery = financeQuery.where(eq(finances.propertyId, filters.propertyId));
    }

    const breakdown = await financeQuery
      .groupBy(finances.type, finances.source, finances.category)
      .orderBy(finances.type, finances.category);

    let rentalIncome = 0;
    let managementFees = 0;
    let addonRevenue = 0;
    let utilityDeductions = 0;
    let serviceDeductions = 0;

    breakdown.forEach(item => {
      const amount = Number(item.totalAmount || 0);
      
      if (item.type === 'income') {
        if (item.source === 'booking_payment') {
          rentalIncome += amount;
        } else if (item.category?.startsWith('addon_')) {
          addonRevenue += amount;
        }
      } else if (item.type === 'expense') {
        if (item.category === 'management_fee') {
          managementFees += amount;
        } else if (item.category?.startsWith('utility_')) {
          utilityDeductions += amount;
        } else if (item.category?.includes('service')) {
          serviceDeductions += amount;
        }
      }
    });

    const netBalance = rentalIncome + addonRevenue - managementFees - utilityDeductions - serviceDeductions;

    return {
      rentalIncome,
      managementFees,
      addonRevenue,
      utilityDeductions,
      serviceDeductions,
      netBalance,
      breakdown: breakdown.map(item => ({
        ...item,
        totalAmount: Number(item.totalAmount || 0)
      })),
    };
  }

  // ===== PORTFOLIO MANAGER DASHBOARD PLATFORM =====

  // PM Commission Balance Operations
  async getPMCommissionBalance(organizationId: string, managerId: string): Promise<typeof pmCommissionBalance.$inferSelect | undefined> {
    const [balance] = await db
      .select()
      .from(pmCommissionBalance)
      .where(and(
        eq(pmCommissionBalance.organizationId, organizationId),
        eq(pmCommissionBalance.managerId, managerId)
      ));
    return balance;
  }

  async updatePMCommissionBalance(organizationId: string, managerId: string, updates: {
    totalEarned?: number;
    totalPaid?: number;
    currentBalance?: number;
    lastPayoutDate?: Date;
  }): Promise<typeof pmCommissionBalance.$inferSelect> {
    const [updated] = await db
      .insert(pmCommissionBalance)
      .values({
        organizationId,
        managerId,
        ...updates,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [pmCommissionBalance.organizationId, pmCommissionBalance.managerId],
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }

  // PM Payout Request Operations
  async createPMPayoutRequest(request: typeof pmPayoutRequests.$inferInsert): Promise<typeof pmPayoutRequests.$inferSelect> {
    const [newRequest] = await db.insert(pmPayoutRequests).values(request).returning();
    return newRequest;
  }

  async getPMPayoutRequests(organizationId: string, managerId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<typeof pmPayoutRequests.$inferSelect[]> {
    let query = db
      .select()
      .from(pmPayoutRequests)
      .where(and(
        eq(pmPayoutRequests.organizationId, organizationId),
        eq(pmPayoutRequests.managerId, managerId)
      ));

    if (filters?.status) {
      query = query.where(eq(pmPayoutRequests.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(pmPayoutRequests.requestedAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(pmPayoutRequests.requestedAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(pmPayoutRequests.requestedAt));
  }

  async updatePMPayoutRequest(id: number, updates: Partial<typeof pmPayoutRequests.$inferSelect>): Promise<typeof pmPayoutRequests.$inferSelect | undefined> {
    const [updated] = await db
      .update(pmPayoutRequests)
      .set(updates)
      .where(eq(pmPayoutRequests.id, id))
      .returning();
    return updated;
  }

  async markPMPaymentReceived(id: number, managerId: string): Promise<typeof pmPayoutRequests.$inferSelect | undefined> {
    const [updated] = await db
      .update(pmPayoutRequests)
      .set({
        status: 'paid',
        paidAt: new Date(),
      })
      .where(and(
        eq(pmPayoutRequests.id, id),
        eq(pmPayoutRequests.managerId, managerId)
      ))
      .returning();
    return updated;
  }

  // PM Task Logs Operations
  async createPMTaskLog(log: typeof pmTaskLogs.$inferInsert): Promise<typeof pmTaskLogs.$inferSelect> {
    const [newLog] = await db.insert(pmTaskLogs).values(log).returning();
    return newLog;
  }

  async getPMTaskLogs(organizationId: string, managerId: string, filters?: {
    propertyId?: number;
    department?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<(typeof pmTaskLogs.$inferSelect & { propertyName?: string })[]> {
    let query = db
      .select({
        ...pmTaskLogs,
        propertyName: properties.name,
      })
      .from(pmTaskLogs)
      .leftJoin(properties, eq(pmTaskLogs.propertyId, properties.id))
      .where(and(
        eq(pmTaskLogs.organizationId, organizationId),
        eq(pmTaskLogs.managerId, managerId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(pmTaskLogs.propertyId, filters.propertyId));
    }
    if (filters?.department) {
      query = query.where(eq(pmTaskLogs.department, filters.department));
    }
    if (filters?.status) {
      query = query.where(eq(pmTaskLogs.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(pmTaskLogs.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(pmTaskLogs.createdAt, new Date(filters.endDate)));
    }

    const result = await query
      .orderBy(desc(pmTaskLogs.createdAt))
      .limit(filters?.limit || 100);

    return result;
  }

  // PM Property Performance Operations
  async getPMPropertyPerformance(organizationId: string, managerId: string, filters?: {
    propertyId?: number;
    period?: string;
    startPeriod?: string;
    endPeriod?: string;
  }): Promise<(typeof pmPropertyPerformance.$inferSelect & { propertyName?: string })[]> {
    let query = db
      .select({
        ...pmPropertyPerformance,
        propertyName: properties.name,
      })
      .from(pmPropertyPerformance)
      .leftJoin(properties, eq(pmPropertyPerformance.propertyId, properties.id))
      .where(and(
        eq(pmPropertyPerformance.organizationId, organizationId),
        eq(pmPropertyPerformance.managerId, managerId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(pmPropertyPerformance.propertyId, filters.propertyId));
    }
    if (filters?.period) {
      query = query.where(eq(pmPropertyPerformance.period, filters.period));
    }
    if (filters?.startPeriod) {
      query = query.where(gte(pmPropertyPerformance.period, filters.startPeriod));
    }
    if (filters?.endPeriod) {
      query = query.where(lte(pmPropertyPerformance.period, filters.endPeriod));
    }

    return query.orderBy(desc(pmPropertyPerformance.period));
  }

  async upsertPMPropertyPerformance(performance: typeof pmPropertyPerformance.$inferInsert): Promise<typeof pmPropertyPerformance.$inferSelect> {
    const [result] = await db
      .insert(pmPropertyPerformance)
      .values(performance)
      .onConflictDoUpdate({
        target: [pmPropertyPerformance.organizationId, pmPropertyPerformance.managerId, pmPropertyPerformance.propertyId, pmPropertyPerformance.period],
        set: {
          ...performance,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // PM Notifications Operations
  async createPMNotification(notification: typeof pmNotifications.$inferInsert): Promise<typeof pmNotifications.$inferSelect> {
    const [newNotification] = await db.insert(pmNotifications).values(notification).returning();
    return newNotification;
  }

  async getPMNotifications(organizationId: string, managerId: string, filters?: {
    type?: string;
    severity?: string;
    isRead?: boolean;
    actionRequired?: boolean;
    limit?: number;
  }): Promise<typeof pmNotifications.$inferSelect[]> {
    let query = db
      .select()
      .from(pmNotifications)
      .where(and(
        eq(pmNotifications.organizationId, organizationId),
        eq(pmNotifications.managerId, managerId)
      ));

    if (filters?.type) {
      query = query.where(eq(pmNotifications.type, filters.type));
    }
    if (filters?.severity) {
      query = query.where(eq(pmNotifications.severity, filters.severity));
    }
    if (filters?.isRead !== undefined) {
      query = query.where(eq(pmNotifications.isRead, filters.isRead));
    }
    if (filters?.actionRequired !== undefined) {
      query = query.where(eq(pmNotifications.actionRequired, filters.actionRequired));
    }

    return query
      .orderBy(desc(pmNotifications.createdAt))
      .limit(filters?.limit || 50);
  }

  async markPMNotificationAsRead(id: number, managerId: string): Promise<typeof pmNotifications.$inferSelect | undefined> {
    const [updated] = await db
      .update(pmNotifications)
      .set({ isRead: true })
      .where(and(
        eq(pmNotifications.id, id),
        eq(pmNotifications.managerId, managerId)
      ))
      .returning();
    return updated;
  }

  async markAllPMNotificationsAsRead(organizationId: string, managerId: string): Promise<void> {
    await db
      .update(pmNotifications)
      .set({ isRead: true })
      .where(and(
        eq(pmNotifications.organizationId, organizationId),
        eq(pmNotifications.managerId, managerId),
        eq(pmNotifications.isRead, false)
      ));
  }

  // PM Portfolio Operations
  async getPMPortfolioProperties(organizationId: string, managerId: string): Promise<any[]> {
    const result = await db
      .select({
        ...properties,
        commissionRate: portfolioAssignments.commissionRate,
        assignedAt: portfolioAssignments.assignedAt,
      })
      .from(properties)
      .innerJoin(portfolioAssignments, and(
        eq(portfolioAssignments.propertyId, properties.id),
        eq(portfolioAssignments.managerId, managerId),
        eq(portfolioAssignments.isActive, true)
      ))
      .where(eq(properties.organizationId, organizationId));

    return result;
  }

  async assignPMToProperty(organizationId: string, managerId: string, propertyId: number, commissionRate: number = 50): Promise<typeof portfolioAssignments.$inferSelect> {
    // First deactivate any existing assignment
    await db
      .update(portfolioAssignments)
      .set({ 
        isActive: false,
        unassignedAt: new Date()
      })
      .where(and(
        eq(portfolioAssignments.propertyId, propertyId),
        eq(portfolioAssignments.isActive, true)
      ));

    // Create new assignment
    const [assignment] = await db
      .insert(portfolioAssignments)
      .values({
        organizationId,
        managerId,
        propertyId,
        commissionRate,
      })
      .returning();

    return assignment;
  }

  // PM Financial Overview
  async getPMFinancialOverview(organizationId: string, managerId: string, filters?: {
    startDate?: string;
    endDate?: string;
    propertyId?: number;
  }) {
    // Get PM's portfolio properties
    const portfolioProperties = await this.getPMPortfolioProperties(organizationId, managerId);
    const propertyIds = portfolioProperties.map(p => p.id);

    if (propertyIds.length === 0) {
      return {
        totalCommissionEarnings: 0,
        propertyBreakdown: [],
        monthlyTrend: [],
        pendingBalance: 0,
      };
    }

    // Get commission earnings from management fees
    let commissionsQuery = db
      .select({
        propertyId: finances.propertyId,
        propertyName: properties.name,
        totalRevenue: sum(finances.amount),
        count: count(),
        period: sql<string>`TO_CHAR(${finances.date}, 'YYYY-MM')`.as('period'),
      })
      .from(finances)
      .leftJoin(properties, eq(finances.propertyId, properties.id))
      .where(and(
        eq(finances.organizationId, organizationId),
        inArray(finances.propertyId, propertyIds),
        eq(finances.type, 'income'),
        eq(finances.source, 'booking_payment')
      ));

    if (filters?.startDate) {
      commissionsQuery = commissionsQuery.where(gte(finances.date, filters.startDate));
    }
    if (filters?.endDate) {
      commissionsQuery = commissionsQuery.where(lte(finances.date, filters.endDate));
    }
    if (filters?.propertyId) {
      commissionsQuery = commissionsQuery.where(eq(finances.propertyId, filters.propertyId));
    }

    const revenueData = await commissionsQuery
      .groupBy(finances.propertyId, properties.name, sql`TO_CHAR(${finances.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${finances.date}, 'YYYY-MM')`, properties.name);

    // Calculate commission earnings (typically 10% of management fees, which are ~20% of revenue)
    const propertyBreakdown = new Map();
    const monthlyTrend = new Map();
    let totalCommissionEarnings = 0;

    revenueData.forEach(item => {
      const revenue = Number(item.totalRevenue || 0);
      const managementFee = revenue * 0.20; // 20% management fee
      const commission = managementFee * 0.10; // 10% of management fee goes to PM

      totalCommissionEarnings += commission;

      // Property breakdown
      const propertyKey = `${item.propertyId}-${item.propertyName}`;
      if (!propertyBreakdown.has(propertyKey)) {
        propertyBreakdown.set(propertyKey, {
          propertyId: item.propertyId,
          propertyName: item.propertyName,
          totalRevenue: 0,
          commissionEarned: 0,
          bookingCount: 0,
        });
      }
      const propertyData = propertyBreakdown.get(propertyKey);
      propertyData.totalRevenue += revenue;
      propertyData.commissionEarned += commission;
      propertyData.bookingCount += Number(item.count || 0);

      // Monthly trend
      if (!monthlyTrend.has(item.period)) {
        monthlyTrend.set(item.period, 0);
      }
      monthlyTrend.set(item.period, monthlyTrend.get(item.period) + commission);
    });

    // Get pending balance
    const balance = await this.getPMCommissionBalance(organizationId, managerId);

    return {
      totalCommissionEarnings,
      propertyBreakdown: Array.from(propertyBreakdown.values()),
      monthlyTrend: Array.from(monthlyTrend.entries()).map(([period, earnings]) => ({
        period,
        earnings,
      })),
      pendingBalance: Number(balance?.currentBalance || 0),
    };
  }
}

export const storage = new DatabaseStorage();
