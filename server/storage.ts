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
  guestPortalSessions,
  guestActivityTimeline,
  guestChatMessages,
  guestAiFaqKnowledge,
  guestAddonServiceRequests,
  guestPropertyLocalInfo,
  guestMaintenanceReports,
  recurringServices,
  recurringServiceBills,
  billReminders,
  servicePerformance,
  commissionLog,
  commissionInvoices,
  commissionInvoiceItems,
  agentBookings,
  agentPayouts,
  referralEarnings,
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
  balanceResetAudit,
  type BalanceResetAudit,
  type InsertBalanceResetAudit,
  utilityProviders,
  customExpenseCategories,
  propertyUtilitySettings,
  propertyCustomExpenses,
  type UtilityProvider,
  type InsertUtilityProvider,
  type CustomExpenseCategory,
  type InsertCustomExpenseCategory,
  type PropertyUtilitySettings,
  type InsertPropertyUtilitySettings,
  type PropertyCustomExpenses,
  type InsertPropertyCustomExpenses,
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
  agentPayouts,
  type AgentPayout,
  type InsertAgentPayout,
  staffPayrollRecords,
  portfolioManagerCommissions,
  referralAgentCommissionLogs,
  universalInvoices,
  universalInvoiceLineItems,
  paymentConfirmations,
  type StaffPayrollRecord,
  type InsertStaffPayrollRecord,
  type PortfolioManagerCommission,
  type InsertPortfolioManagerCommission,
  type ReferralAgentCommissionLog,
  type InsertReferralAgentCommissionLog,
  type UniversalInvoice,
  type InsertUniversalInvoice,
  type UniversalInvoiceLineItem,
  type InsertUniversalInvoiceLineItem,
  type PaymentConfirmation,
  type InsertPaymentConfirmation,
  liveBookingCalendar,
  propertyAvailability,
  agentSearchPreferences,
  propertySearchIndex,
  agentBookingEnquiries,
  bookingPlatformSync,
  propertyOccupancyAnalytics,
  type LiveBookingCalendar,
  type InsertLiveBookingCalendar,
  type PropertyAvailability,
  type InsertPropertyAvailability,
  type AgentSearchPreferences,
  type InsertAgentSearchPreferences,
  type PropertySearchIndex,
  type InsertPropertySearchIndex,
  type AgentBookingEnquiries,
  type InsertAgentBookingEnquiries,
  type BookingPlatformSync,
  type InsertBookingPlatformSync,
  type PropertyOccupancyAnalytics,
  type InsertPropertyOccupancyAnalytics,
  type GuestPortalSession,
  type InsertGuestPortalSession,
  type GuestActivityTimeline,
  type InsertGuestActivityTimeline,
  type GuestChatMessage,
  type InsertGuestChatMessage,
  type GuestAiFaqKnowledge,
  type InsertGuestAiFaqKnowledge,
  type GuestAddonServiceRequest,
  type InsertGuestAddonServiceRequest,
  type GuestPropertyLocalInfo,
  type InsertGuestPropertyLocalInfo,
  type GuestMaintenanceReport,
  type InsertGuestMaintenanceReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lt, gte, lte, isNull, sql, sum, count, avg, max } from "drizzle-orm";

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
  getBookingByReferenceAndEmail(bookingReference: string, guestEmail: string): Promise<Booking | undefined>;
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
  
  // Balance reset operations (Admin only)
  getUsersForBalanceReset(organizationId: string, userType?: string): Promise<User[]>;
  getUserBalanceSummary(userId: string): Promise<{ currentBalance: number; userType: string }>;
  resetUserBalance(userId: string, adminUserId: string, resetReason?: string, propertyId?: number): Promise<BalanceResetAudit>;
  getBalanceResetAuditLog(organizationId: string, filters?: { userId?: string; fromDate?: Date; toDate?: Date }): Promise<BalanceResetAudit[]>;

  // Guest Portal Interface operations
  createGuestPortalSession(session: InsertGuestPortalSession): Promise<GuestPortalSession>;
  getGuestPortalSession(accessToken: string): Promise<GuestPortalSession | undefined>;
  updateGuestPortalSessionActivity(accessToken: string): Promise<void>;
  getGuestBookingOverview(guestSessionId: number): Promise<{
    upcomingStays: any[];
    currentStay: any;
    pastStays: any[];
  }>;
  
  // Guest Activity Timeline
  getGuestActivityTimeline(guestSessionId: number): Promise<GuestActivityTimeline[]>;
  createGuestActivityRecord(activity: InsertGuestActivityTimeline): Promise<GuestActivityTimeline>;
  updateGuestActivityStatus(id: number, status: string, completedAt?: Date): Promise<GuestActivityTimeline | undefined>;
  
  // Guest Chat & AI Operations
  getGuestChatMessages(guestSessionId: number, limit?: number): Promise<GuestChatMessage[]>;
  createGuestChatMessage(message: InsertGuestChatMessage): Promise<GuestChatMessage>;
  processGuestMessageWithAI(messageId: number): Promise<{
    detectedIssue: string | null;
    severity: string | null;
    autoCreatedTaskId: number | null;
    aiResponse: string | null;
  }>;
  getGuestAiFaqResponses(organizationId: string, propertyId?: number): Promise<GuestAiFaqKnowledge[]>;
  
  // Guest Add-On Service Requests
  getAvailableAddonServices(organizationId: string, propertyId: number): Promise<GuestAddonService[]>;
  createGuestAddonServiceRequest(request: InsertGuestAddonServiceRequest): Promise<GuestAddonServiceRequest>;
  getGuestAddonServiceRequests(guestSessionId: number): Promise<GuestAddonServiceRequest[]>;
  updateAddonServiceRequestStatus(id: number, status: string, confirmedBy?: string): Promise<GuestAddonServiceRequest | undefined>;
  completeAddonServiceRequest(id: number, completionNotes: string, rating?: number, review?: string): Promise<GuestAddonServiceRequest | undefined>;
  
  // Guest Property Local Information
  getGuestPropertyLocalInfo(propertyId: number, locationType?: string): Promise<GuestPropertyLocalInfo[]>;
  createPropertyLocalInfo(info: InsertGuestPropertyLocalInfo): Promise<GuestPropertyLocalInfo>;
  updatePropertyLocalInfo(id: number, info: Partial<InsertGuestPropertyLocalInfo>): Promise<GuestPropertyLocalInfo | undefined>;
  
  // Guest Maintenance Reports
  createGuestMaintenanceReport(report: InsertGuestMaintenanceReport): Promise<GuestMaintenanceReport>;
  getGuestMaintenanceReports(guestSessionId: number): Promise<GuestMaintenanceReport[]>;
  updateMaintenanceReportStatus(id: number, status: string, assignedTo?: string): Promise<GuestMaintenanceReport | undefined>;
  completeMaintenanceReport(id: number, resolutionNotes: string, images?: string[]): Promise<GuestMaintenanceReport | undefined>;
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

  async getBookingByReferenceAndEmail(bookingReference: string, guestEmail: string): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.bookingReference, bookingReference),
        eq(bookings.guestEmail, guestEmail)
      ));
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

  // ==================== BALANCE RESET OPERATIONS (ADMIN ONLY) ====================

  async getUsersForBalanceReset(organizationId: string, userType?: string): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.organizationId, organizationId));
    
    if (userType) {
      query = query.where(eq(users.role, userType));
    } else {
      // Only include user types that can have balances
      query = query.where(
        or(
          eq(users.role, 'owner'),
          eq(users.role, 'portfolio-manager'),
          eq(users.role, 'referral-agent'),
          eq(users.role, 'retail-agent')
        )
      );
    }
    
    return await query.orderBy(asc(users.email));
  }

  async getUserBalanceSummary(userId: string): Promise<{ currentBalance: number; userType: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate current balance based on user type
    let currentBalance = 0;
    
    if (user.role === 'owner') {
      // For owners: sum of unpaid payouts
      const ownerPayouts = await db
        .select()
        .from(ownerPayouts)
        .where(and(
          eq(ownerPayouts.ownerId, userId),
          eq(ownerPayouts.status, 'pending')
        ));
      currentBalance = ownerPayouts.reduce((sum, payout) => sum + parseFloat(payout.amount.toString()), 0);
    } else if (user.role === 'referral-agent' || user.role === 'retail-agent') {
      // For agents: sum of unpaid commissions
      const agentPayouts = await db
        .select()
        .from(agentPayouts)
        .where(and(
          eq(agentPayouts.agentId, userId),
          eq(agentPayouts.status, 'pending')
        ));
      currentBalance = agentPayouts.reduce((sum, payout) => sum + parseFloat(payout.amount.toString()), 0);
    } else if (user.role === 'portfolio-manager') {
      // For portfolio managers: sum of unpaid commission earnings
      const commissions = await db
        .select()
        .from(commissionEarnings)
        .where(and(
          eq(commissionEarnings.userId, userId),
          eq(commissionEarnings.status, 'pending')
        ));
      currentBalance = commissions.reduce((sum, comm) => sum + parseFloat(comm.amount.toString()), 0);
    }

    return {
      currentBalance,
      userType: user.role
    };
  }

  async resetUserBalance(userId: string, adminUserId: string, resetReason?: string, propertyId?: number): Promise<BalanceResetAudit> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceSummary = await this.getUserBalanceSummary(userId);
    const previousBalance = balanceSummary.currentBalance;

    // Reset balances based on user type
    if (user.role === 'owner') {
      // Reset owner payouts
      await db
        .update(ownerPayouts)
        .set({ 
          status: 'reset',
          adminNotes: `Balance reset by admin: ${resetReason || 'No reason provided'}`,
          updatedAt: new Date()
        })
        .where(and(
          eq(ownerPayouts.ownerId, userId),
          eq(ownerPayouts.status, 'pending')
        ));
    } else if (user.role === 'referral-agent' || user.role === 'retail-agent') {
      // Reset agent payouts
      await db
        .update(agentPayouts)
        .set({ 
          status: 'reset',
          notes: `Balance reset by admin: ${resetReason || 'No reason provided'}`,
          updatedAt: new Date()
        })
        .where(and(
          eq(agentPayouts.agentId, userId),
          eq(agentPayouts.status, 'pending')
        ));
    } else if (user.role === 'portfolio-manager') {
      // Reset portfolio manager commission earnings
      await db
        .update(commissionEarnings)
        .set({ 
          status: 'reset',
          updatedAt: new Date()
        })
        .where(and(
          eq(commissionEarnings.userId, userId),
          eq(commissionEarnings.status, 'pending')
        ));
    }

    // Create audit log entry
    const auditData: InsertBalanceResetAudit = {
      organizationId: user.organizationId,
      userId,
      userType: user.role,
      previousBalance: previousBalance.toString(),
      newBalance: '0.00',
      resetReason,
      adminUserId,
      propertyId
    };

    const [auditRecord] = await db.insert(balanceResetAudit).values(auditData).returning();
    return auditRecord;
  }

  async getBalanceResetAuditLog(organizationId: string, filters?: { userId?: string; fromDate?: Date; toDate?: Date }): Promise<BalanceResetAudit[]> {
    const adminUsers = users.as('adminUsers');
    
    let query = db
      .select({
        id: balanceResetAudit.id,
        organizationId: balanceResetAudit.organizationId,
        userId: balanceResetAudit.userId,
        userType: balanceResetAudit.userType,
        previousBalance: balanceResetAudit.previousBalance,
        newBalance: balanceResetAudit.newBalance,
        resetReason: balanceResetAudit.resetReason,
        adminUserId: balanceResetAudit.adminUserId,
        propertyId: balanceResetAudit.propertyId,
        createdAt: balanceResetAudit.createdAt,
        // Include related user information
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        adminEmail: adminUsers.email,
        adminFirstName: adminUsers.firstName,
        adminLastName: adminUsers.lastName,
      })
      .from(balanceResetAudit)
      .leftJoin(users, eq(balanceResetAudit.userId, users.id))
      .leftJoin(adminUsers, eq(balanceResetAudit.adminUserId, adminUsers.id))
      .where(eq(balanceResetAudit.organizationId, organizationId));

    if (filters?.userId) {
      query = query.where(eq(balanceResetAudit.userId, filters.userId));
    }
    
    if (filters?.fromDate) {
      query = query.where(gte(balanceResetAudit.createdAt, filters.fromDate));
    }
    
    if (filters?.toDate) {
      query = query.where(lte(balanceResetAudit.createdAt, filters.toDate));
    }

    return await query.orderBy(desc(balanceResetAudit.createdAt)) as BalanceResetAudit[];
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

  // ====== RETAIL AGENT INTERFACE OPERATIONS ======

  // Agent Bookings Operations  
  async createAgentBooking(booking: any): Promise<any> {
    const [newBooking] = await db.insert(agentBookings).values(booking).returning();
    return newBooking;
  }

  async getAgentBookings(organizationId: string, agentId?: string, filters?: {
    status?: string;
    propertyId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = db
      .select({
        id: agentBookings.id,
        organizationId: agentBookings.organizationId,
        retailAgentId: agentBookings.retailAgentId,
        propertyId: agentBookings.propertyId,
        bookingId: agentBookings.bookingId,
        guestName: agentBookings.guestName,
        guestEmail: agentBookings.guestEmail,
        guestPhone: agentBookings.guestPhone,
        checkIn: agentBookings.checkIn,
        checkOut: agentBookings.checkOut,
        totalAmount: agentBookings.totalAmount,
        commissionRate: agentBookings.commissionRate,
        commissionAmount: agentBookings.commissionAmount,
        bookingStatus: agentBookings.bookingStatus,
        commissionStatus: agentBookings.commissionStatus,
        hostawayBookingId: agentBookings.hostawayBookingId,
        notes: agentBookings.notes,
        createdAt: agentBookings.createdAt,
        updatedAt: agentBookings.updatedAt,
        propertyName: properties.name,
      })
      .from(agentBookings)
      .leftJoin(properties, eq(agentBookings.propertyId, properties.id))
      .where(eq(agentBookings.organizationId, organizationId));

    if (agentId) {
      query = query.where(eq(agentBookings.retailAgentId, agentId));
    }
    if (filters?.status) {
      query = query.where(eq(agentBookings.bookingStatus, filters.status));
    }
    if (filters?.propertyId) {
      query = query.where(eq(agentBookings.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      query = query.where(gte(agentBookings.checkIn, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(agentBookings.checkOut, filters.endDate));
    }

    return query.orderBy(desc(agentBookings.createdAt));
  }

  async updateAgentBooking(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db
      .update(agentBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agentBookings.id, id))
      .returning();
    return updated;
  }

  // Agent Payouts Operations
  async createAgentPayout(payout: any): Promise<any> {
    const [newPayout] = await db.insert(agentPayouts).values(payout).returning();
    return newPayout;
  }

  async getAgentPayouts(organizationId: string, agentId?: string, filters?: {
    status?: string;
    agentType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = db
      .select()
      .from(agentPayouts)
      .where(eq(agentPayouts.organizationId, organizationId));

    if (agentId) {
      query = query.where(eq(agentPayouts.agentId, agentId));
    }
    if (filters?.status) {
      query = query.where(eq(agentPayouts.payoutStatus, filters.status));
    }
    if (filters?.agentType) {
      query = query.where(eq(agentPayouts.agentType, filters.agentType));
    }
    if (filters?.startDate) {
      query = query.where(gte(agentPayouts.requestedAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(agentPayouts.requestedAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(agentPayouts.requestedAt));
  }

  async updateAgentPayout(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db
      .update(agentPayouts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agentPayouts.id, id))
      .returning();
    return updated;
  }

  // Property Commission Rules Operations
  async getPropertyCommissionRules(organizationId: string, propertyId?: number): Promise<any[]> {
    let query = db
      .select()
      .from(propertyCommissionRules)
      .where(eq(propertyCommissionRules.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(propertyCommissionRules.propertyId, propertyId));
    }

    return query.where(eq(propertyCommissionRules.isActive, true));
  }

  async createPropertyCommissionRule(rule: any): Promise<any> {
    const [newRule] = await db.insert(propertyCommissionRules).values(rule).returning();
    return newRule;
  }

  async updatePropertyCommissionRule(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db
      .update(propertyCommissionRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyCommissionRules.id, id))
      .returning();
    return updated;
  }

  // Property Marketing Media Operations
  async getPropertyMarketingMedia(organizationId: string, propertyId?: number, filters?: {
    mediaType?: string;
    category?: string;
    agentAccessLevel?: string;
  }): Promise<any[]> {
    let query = db
      .select()
      .from(propertyMarketingMedia)
      .where(eq(propertyMarketingMedia.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(propertyMarketingMedia.propertyId, propertyId));
    }
    if (filters?.mediaType) {
      query = query.where(eq(propertyMarketingMedia.mediaType, filters.mediaType));
    }
    if (filters?.category) {
      query = query.where(eq(propertyMarketingMedia.category, filters.category));
    }
    if (filters?.agentAccessLevel) {
      query = query.where(eq(propertyMarketingMedia.agentAccessLevel, filters.agentAccessLevel));
    }

    return query
      .where(eq(propertyMarketingMedia.isPublic, true))
      .orderBy(propertyMarketingMedia.sortOrder, propertyMarketingMedia.createdAt);
  }

  async createPropertyMarketingMedia(media: any): Promise<any> {
    const [newMedia] = await db.insert(propertyMarketingMedia).values(media).returning();
    return newMedia;
  }

  async updatePropertyMarketingMedia(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db
      .update(propertyMarketingMedia)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyMarketingMedia.id, id))
      .returning();
    return updated;
  }

  // Agent Booking Requests Operations
  async createAgentBookingRequest(request: any): Promise<any> {
    const [newRequest] = await db.insert(agentBookingRequests).values(request).returning();
    return newRequest;
  }

  async getAgentBookingRequests(organizationId: string, agentId?: string, filters?: {
    status?: string;
    propertyId?: number;
    urgencyLevel?: string;
  }): Promise<any[]> {
    let query = db
      .select({
        ...agentBookingRequests,
        propertyName: properties.name,
      })
      .from(agentBookingRequests)
      .leftJoin(properties, eq(agentBookingRequests.propertyId, properties.id))
      .where(eq(agentBookingRequests.organizationId, organizationId));

    if (agentId) {
      query = query.where(eq(agentBookingRequests.agentId, agentId));
    }
    if (filters?.status) {
      query = query.where(eq(agentBookingRequests.status, filters.status));
    }
    if (filters?.propertyId) {
      query = query.where(eq(agentBookingRequests.propertyId, filters.propertyId));
    }
    if (filters?.urgencyLevel) {
      query = query.where(eq(agentBookingRequests.urgencyLevel, filters.urgencyLevel));
    }

    return query.orderBy(desc(agentBookingRequests.submittedAt));
  }

  async updateAgentBookingRequest(id: number, updates: any): Promise<any | undefined> {
    const [updated] = await db
      .update(agentBookingRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agentBookingRequests.id, id))
      .returning();
    return updated;
  }

  // Agent Commission Summary Operations
  async getAgentCommissionSummary(organizationId: string, agentId: string): Promise<any> {
    // Get total commission earned from bookings
    const [commissionStats] = await db
      .select({
        totalEarned: sum(agentBookings.commissionAmount),
        totalBookings: count(agentBookings.id),
        avgCommission: avg(agentBookings.commissionAmount),
      })
      .from(agentBookings)
      .where(and(
        eq(agentBookings.organizationId, organizationId),
        eq(agentBookings.retailAgentId, agentId),
        eq(agentBookings.commissionStatus, 'approved')
      ));

    // Get total paid out
    const [payoutStats] = await db
      .select({
        totalPaid: sum(agentPayouts.payoutAmount),
        totalPayouts: count(agentPayouts.id),
      })
      .from(agentPayouts)
      .where(and(
        eq(agentPayouts.organizationId, organizationId),
        eq(agentPayouts.agentId, agentId),
        eq(agentPayouts.payoutStatus, 'paid')
      ));

    // Get pending commissions
    const [pendingStats] = await db
      .select({
        pendingCommissions: sum(agentBookings.commissionAmount),
        pendingBookings: count(agentBookings.id),
      })
      .from(agentBookings)
      .where(and(
        eq(agentBookings.organizationId, organizationId),
        eq(agentBookings.retailAgentId, agentId),
        eq(agentBookings.commissionStatus, 'pending')
      ));

    return {
      totalEarned: commissionStats?.totalEarned || 0,
      totalPaid: payoutStats?.totalPaid || 0,
      currentBalance: (commissionStats?.totalEarned || 0) - (payoutStats?.totalPaid || 0),
      pendingCommissions: pendingStats?.pendingCommissions || 0,
      totalBookings: commissionStats?.totalBookings || 0,
      totalPayouts: payoutStats?.totalPayouts || 0,
      avgCommissionPerBooking: commissionStats?.avgCommission || 0,
    };
  }

  // Agent Properties with Live Data (for booking engine)
  async getAgentAvailableProperties(organizationId: string, filters?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    bedrooms?: number;
    priceMin?: number;
    priceMax?: number;
    amenities?: string[];
  }): Promise<any[]> {
    let query = db
      .select({
        id: properties.id,
        organizationId: properties.organizationId,
        name: properties.name,
        description: properties.description,
        address: properties.address,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        maxGuests: properties.maxGuests,
        pricePerNight: properties.pricePerNight,
        currency: properties.currency,
        status: properties.status,
        amenities: properties.amenities,
        images: properties.images,
        commission: propertyCommissionRules.defaultCommissionRate,
        commissionRules: propertyCommissionRules,
      })
      .from(properties)
      .leftJoin(propertyCommissionRules, eq(properties.id, propertyCommissionRules.propertyId))
      .where(and(
        eq(properties.organizationId, organizationId),
        eq(properties.status, 'active')
      ));

    if (filters?.guests) {
      query = query.where(gte(properties.maxGuests, filters.guests));
    }
    if (filters?.bedrooms) {
      query = query.where(gte(properties.bedrooms, filters.bedrooms));
    }
    if (filters?.priceMin) {
      query = query.where(gte(properties.pricePerNight, filters.priceMin.toString()));
    }
    if (filters?.priceMax) {
      query = query.where(lte(properties.pricePerNight, filters.priceMax.toString()));
    }

    const propertiesResult = await query.orderBy(properties.name);

    // For each property, check availability and get marketing media
    const propertiesWithAvailability = await Promise.all(
      propertiesResult.map(async (property) => {
        // Check if property is available for the requested dates
        let isAvailable = true;
        if (filters?.checkIn && filters?.checkOut) {
          const conflictingBookings = await db
            .select()
            .from(bookings)
            .where(and(
              eq(bookings.propertyId, property.id),
              eq(bookings.status, 'confirmed'),
              or(
                and(
                  lte(bookings.startDate, filters.checkIn),
                  gte(bookings.endDate, filters.checkIn)
                ),
                and(
                  lte(bookings.startDate, filters.checkOut),
                  gte(bookings.endDate, filters.checkOut)
                ),
                and(
                  gte(bookings.startDate, filters.checkIn),
                  lte(bookings.endDate, filters.checkOut)
                )
              )
            ));
          
          isAvailable = conflictingBookings.length === 0;
        }

        // Get marketing media for this property
        const marketingMedia = await this.getPropertyMarketingMedia(
          organizationId, 
          property.id, 
          { agentAccessLevel: 'all' }
        );

        return {
          ...property,
          isAvailable,
          marketingMedia,
        };
      })
    );

    return propertiesWithAvailability.filter(property => 
      !filters?.checkIn || property.isAvailable
    );
  }

  // ===== REFERRAL AGENT OPERATIONS =====

  // Get referral agent's assigned properties
  async getReferralAgentProperties(organizationId: string, referralAgentId: string): Promise<any[]> {
    const referralProperties = await db
      .select({
        id: propertyReferrals.id,
        propertyId: propertyReferrals.propertyId,
        propertyName: properties.name,
        portfolioManagerId: propertyReferrals.portfolioManagerId,
        portfolioManagerName: users.firstName,
        commissionRate: propertyReferrals.commissionRate,
        referralDate: propertyReferrals.referralDate,
        isActive: propertyReferrals.isActive,
        notes: propertyReferrals.notes,
      })
      .from(propertyReferrals)
      .leftJoin(properties, eq(propertyReferrals.propertyId, properties.id))
      .leftJoin(users, eq(propertyReferrals.portfolioManagerId, users.id))
      .where(and(
        eq(propertyReferrals.organizationId, organizationId),
        eq(propertyReferrals.referralAgentId, referralAgentId),
        eq(propertyReferrals.isActive, true)
      ))
      .orderBy(propertyReferrals.referralDate);

    return referralProperties;
  }

  // Get referral earnings for specific month/year
  async getReferralEarnings(organizationId: string, referralAgentId: string, filters?: {
    month?: number;
    year?: number;
    propertyId?: number;
    status?: string;
  }): Promise<any[]> {
    let query = db
      .select({
        id: referralEarnings.id,
        propertyId: referralEarnings.propertyId,
        propertyName: properties.name,
        month: referralEarnings.month,
        year: referralEarnings.year,
        grossRentalIncome: referralEarnings.grossRentalIncome,
        managementFeeTotal: referralEarnings.managementFeeTotal,
        referralCommissionEarned: referralEarnings.referralCommissionEarned,
        occupancyRate: referralEarnings.occupancyRate,
        averageReviewScore: referralEarnings.averageReviewScore,
        totalBookings: referralEarnings.totalBookings,
        status: referralEarnings.status,
        calculatedAt: referralEarnings.calculatedAt,
        paidAt: referralEarnings.paidAt,
      })
      .from(referralEarnings)
      .leftJoin(properties, eq(referralEarnings.propertyId, properties.id))
      .where(and(
        eq(referralEarnings.organizationId, organizationId),
        eq(referralEarnings.referralAgentId, referralAgentId)
      ));

    if (filters?.month) {
      query = query.where(eq(referralEarnings.month, filters.month));
    }
    if (filters?.year) {
      query = query.where(eq(referralEarnings.year, filters.year));
    }
    if (filters?.propertyId) {
      query = query.where(eq(referralEarnings.propertyId, filters.propertyId));
    }
    if (filters?.status) {
      query = query.where(eq(referralEarnings.status, filters.status));
    }

    return query.orderBy(desc(referralEarnings.year), desc(referralEarnings.month));
  }

  // Create referral earnings record
  async createReferralEarnings(earnings: InsertReferralEarnings): Promise<any> {
    const [newEarnings] = await db.insert(referralEarnings).values(earnings).returning();
    return newEarnings;
  }

  // Update referral earnings
  async updateReferralEarnings(id: number, updates: Partial<InsertReferralEarnings>): Promise<any | undefined> {
    const [updated] = await db
      .update(referralEarnings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referralEarnings.id, id))
      .returning();
    return updated;
  }

  // Get referral agent commission summary
  async getReferralCommissionSummary(organizationId: string, referralAgentId: string): Promise<any> {
    // Get total earnings across all properties
    const [totalEarnings] = await db
      .select({
        totalEarned: sum(referralEarnings.referralCommissionEarned),
        totalPaidAmount: sum(sql`CASE WHEN ${referralEarnings.status} = 'paid' THEN ${referralEarnings.referralCommissionEarned} ELSE 0 END`),
        totalPendingAmount: sum(sql`CASE WHEN ${referralEarnings.status} = 'pending' THEN ${referralEarnings.referralCommissionEarned} ELSE 0 END`),
        totalProperties: count(sql`DISTINCT ${referralEarnings.propertyId}`),
      })
      .from(referralEarnings)
      .where(and(
        eq(referralEarnings.organizationId, organizationId),
        eq(referralEarnings.referralAgentId, referralAgentId)
      ));

    // Get payouts summary
    const [payoutSummary] = await db
      .select({
        totalPaidOut: sum(agentPayouts.payoutAmount),
        lastPayoutDate: max(agentPayouts.paidAt),
      })
      .from(agentPayouts)
      .where(and(
        eq(agentPayouts.organizationId, organizationId),
        eq(agentPayouts.agentId, referralAgentId),
        eq(agentPayouts.agentType, 'referral-agent'),
        eq(agentPayouts.payoutStatus, 'paid')
      ));

    const totalEarned = Number(totalEarnings?.totalEarned || 0);
    const totalPaid = Number(payoutSummary?.totalPaidOut || 0);
    const currentBalance = totalEarned - totalPaid;

    return {
      totalEarned,
      totalPaid,
      currentBalance,
      totalPendingCommissions: Number(totalEarnings?.totalPendingAmount || 0),
      totalProperties: totalEarnings?.totalProperties || 0,
      lastPayoutDate: payoutSummary?.lastPayoutDate,
    };
  }

  // Get referral agent payouts
  async getReferralPayouts(organizationId: string, referralAgentId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = db
      .select()
      .from(agentPayouts)
      .where(and(
        eq(agentPayouts.organizationId, organizationId),
        eq(agentPayouts.agentId, referralAgentId),
        eq(agentPayouts.agentType, 'referral-agent')
      ));

    if (filters?.status) {
      query = query.where(eq(agentPayouts.payoutStatus, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(agentPayouts.requestedAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(agentPayouts.requestedAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(agentPayouts.requestedAt));
  }

  // Create referral payout request
  async createReferralPayout(payout: InsertAgentPayout): Promise<any> {
    const [newPayout] = await db.insert(agentPayouts).values(payout).returning();
    return newPayout;
  }

  // Get referral program rules
  async getReferralProgramRules(organizationId: string, filters?: {
    ruleType?: string;
    isActive?: boolean;
  }): Promise<any[]> {
    let query = db
      .select({
        id: referralProgramRules.id,
        title: referralProgramRules.title,
        description: referralProgramRules.description,
        ruleType: referralProgramRules.ruleType,
        ruleContent: referralProgramRules.ruleContent,
        isActive: referralProgramRules.isActive,
        effectiveDate: referralProgramRules.effectiveDate,
        createdAt: referralProgramRules.createdAt,
        createdByName: users.firstName,
      })
      .from(referralProgramRules)
      .leftJoin(users, eq(referralProgramRules.createdBy, users.id))
      .where(eq(referralProgramRules.organizationId, organizationId));

    if (filters?.ruleType) {
      query = query.where(eq(referralProgramRules.ruleType, filters.ruleType));
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(referralProgramRules.isActive, filters.isActive));
    }

    return query.orderBy(referralProgramRules.effectiveDate, referralProgramRules.createdAt);
  }

  // Create referral program rule
  async createReferralProgramRule(rule: InsertReferralProgramRule): Promise<any> {
    const [newRule] = await db.insert(referralProgramRules).values(rule).returning();
    return newRule;
  }

  // Update referral program rule
  async updateReferralProgramRule(id: number, updates: Partial<InsertReferralProgramRule>): Promise<any | undefined> {
    const [updated] = await db
      .update(referralProgramRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referralProgramRules.id, id))
      .returning();
    return updated;
  }

  // Get property performance analytics for referral agent
  async getPropertyPerformanceAnalytics(organizationId: string, referralAgentId: string, filters?: {
    propertyId?: number;
    startMonth?: number;
    startYear?: number;
    endMonth?: number;
    endYear?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        propertyId: referralEarnings.propertyId,
        propertyName: properties.name,
        month: referralEarnings.month,
        year: referralEarnings.year,
        grossRentalIncome: referralEarnings.grossRentalIncome,
        managementFeeTotal: referralEarnings.managementFeeTotal,
        referralCommissionEarned: referralEarnings.referralCommissionEarned,
        occupancyRate: referralEarnings.occupancyRate,
        averageReviewScore: referralEarnings.averageReviewScore,
        totalBookings: referralEarnings.totalBookings,
      })
      .from(referralEarnings)
      .leftJoin(properties, eq(referralEarnings.propertyId, properties.id))
      .where(and(
        eq(referralEarnings.organizationId, organizationId),
        eq(referralEarnings.referralAgentId, referralAgentId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(referralEarnings.propertyId, filters.propertyId));
    }
    if (filters?.startYear && filters?.startMonth) {
      query = query.where(
        or(
          gt(referralEarnings.year, filters.startYear),
          and(
            eq(referralEarnings.year, filters.startYear),
            gte(referralEarnings.month, filters.startMonth)
          )
        )
      );
    }
    if (filters?.endYear && filters?.endMonth) {
      query = query.where(
        or(
          lt(referralEarnings.year, filters.endYear),
          and(
            eq(referralEarnings.year, filters.endYear),
            lte(referralEarnings.month, filters.endMonth)
          )
        )
      );
    }

    return query.orderBy(referralEarnings.year, referralEarnings.month, properties.name);
  }

  // Add property referral
  async addPropertyReferral(referral: InsertPropertyReferral): Promise<any> {
    const [newReferral] = await db.insert(propertyReferrals).values(referral).returning();
    return newReferral;
  }

  // Update property referral
  async updatePropertyReferral(id: number, updates: Partial<InsertPropertyReferral>): Promise<any | undefined> {
    const [updated] = await db
      .update(propertyReferrals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyReferrals.id, id))
      .returning();
    return updated;
  }
  // ===== STAFF DASHBOARD STORAGE METHODS =====

  // Staff Dashboard Overview
  async getStaffDashboardOverview(organizationId: string, staffId: string, department?: string): Promise<any> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get today's tasks
    let todayTasksQuery = db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId),
        eq(tasks.dueDate, new Date(todayStr)),
        or(
          eq(tasks.status, 'pending'),
          eq(tasks.status, 'in-progress')
        )
      ));

    if (department) {
      todayTasksQuery = todayTasksQuery.where(eq(tasks.department, department));
    }

    const todayTasks = await todayTasksQuery;

    // Get overdue tasks
    let overdueTasksQuery = db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId),
        lt(tasks.dueDate, new Date(todayStr)),
        or(
          eq(tasks.status, 'pending'),
          eq(tasks.status, 'in-progress')
        )
      ));

    if (department) {
      overdueTasksQuery = overdueTasksQuery.where(eq(tasks.department, department));
    }

    const overdueTasks = await overdueTasksQuery;

    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    let upcomingTasksQuery = db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId),
        gt(tasks.dueDate, new Date(todayStr)),
        lte(tasks.dueDate, nextWeek),
        eq(tasks.status, 'pending')
      ));

    if (department) {
      upcomingTasksQuery = upcomingTasksQuery.where(eq(tasks.department, department));
    }

    const upcomingTasks = await upcomingTasksQuery;

    // Get completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let completedTasksQuery = db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId),
        gte(tasks.dueDate, thirtyDaysAgo),
        eq(tasks.status, 'completed')
      ));

    let totalTasksQuery = db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId),
        gte(tasks.dueDate, thirtyDaysAgo)
      ));

    if (department) {
      completedTasksQuery = completedTasksQuery.where(eq(tasks.department, department));
      totalTasksQuery = totalTasksQuery.where(eq(tasks.department, department));
    }

    const completedTasks = await completedTasksQuery;
    const totalTasks = await totalTasksQuery;
    
    const completionRate = totalTasks.length > 0 ? (completedTasks.length / totalTasks.length) * 100 : 0;

    return {
      todayTasks: todayTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      completionRate: Math.round(completionRate),
      todayTasksList: todayTasks,
      overdueTasksList: overdueTasks,
      upcomingTasksList: upcomingTasks,
    };
  }

  // Get staff tasks with optional filtering
  async getStaffTasks(organizationId: string, staffId: string, filters?: {
    department?: string;
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    propertyId?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        type: tasks.type,
        department: tasks.department,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        estimatedCost: tasks.estimatedCost,
        actualCost: tasks.actualCost,
        completionNotes: tasks.completionNotes,
        evidencePhotos: tasks.evidencePhotos,
        issuesFound: tasks.issuesFound,
        propertyId: tasks.propertyId,
        propertyName: properties.name,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(properties, eq(tasks.propertyId, properties.id))
      .where(and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId)
      ));

    if (filters?.department) {
      query = query.where(eq(tasks.department, filters.department));
    }
    if (filters?.status) {
      query = query.where(eq(tasks.status, filters.status));
    }
    if (filters?.priority) {
      query = query.where(eq(tasks.priority, filters.priority));
    }
    if (filters?.propertyId) {
      query = query.where(eq(tasks.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      query = query.where(gte(tasks.dueDate, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(tasks.dueDate, new Date(filters.endDate)));
    }

    return query.orderBy(desc(tasks.dueDate));
  }

  // Get task checklist for a specific task type
  async getTaskChecklist(organizationId: string, taskType: string, propertyId?: number): Promise<any | null> {
    let query = db
      .select()
      .from(taskChecklists)
      .where(and(
        eq(taskChecklists.organizationId, organizationId),
        eq(taskChecklists.taskType, taskType),
        eq(taskChecklists.isActive, true)
      ));

    // Check for property-specific checklist first
    if (propertyId) {
      const propertySpecific = await query.where(eq(taskChecklists.propertyId, propertyId)).limit(1);
      if (propertySpecific.length > 0) {
        return propertySpecific[0];
      }
    }

    // Fall back to default checklist
    const defaultChecklist = await query.where(isNull(taskChecklists.propertyId)).limit(1);
    return defaultChecklist.length > 0 ? defaultChecklist[0] : null;
  }

  // Start a task (update status and record start time)
  async startTask(organizationId: string, taskId: number, staffId: string): Promise<any> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'in-progress',
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId)
      ))
      .returning();

    // Record task history
    await db.insert(taskHistory).values({
      organizationId,
      taskId,
      propertyId: updatedTask.propertyId,
      action: 'started',
      previousStatus: 'pending',
      newStatus: 'in-progress',
      performedBy: staffId,
      notes: 'Task started by staff member',
    });

    return updatedTask;
  }

  // Complete task with all evidence and completion data
  async completeTask(organizationId: string, taskId: number, staffId: string, completionData: {
    completionNotes?: string;
    evidencePhotos?: string[];
    issuesFound?: string[];
    completedItems?: any;
    expenses?: any[];
    duration?: number;
    checklistId?: number;
  }): Promise<any> {
    const totalExpenseAmount = completionData.expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0) || 0;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completionNotes: completionData.completionNotes,
        evidencePhotos: completionData.evidencePhotos || [],
        issuesFound: completionData.issuesFound || [],
        actualCost: totalExpenseAmount.toString(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId)
      ))
      .returning();

    // Record task completion
    await db.insert(taskCompletions).values({
      organizationId,
      taskId,
      staffId,
      propertyId: updatedTask.propertyId,
      completedAt: new Date(),
      duration: completionData.duration,
      checklistId: completionData.checklistId,
      completedItems: completionData.completedItems,
      evidencePhotos: completionData.evidencePhotos || [],
      completionNotes: completionData.completionNotes,
      issuesFound: completionData.issuesFound || [],
      expenses: completionData.expenses,
      totalExpenseAmount: totalExpenseAmount.toString(),
    });

    // Record expenses if any
    if (completionData.expenses && completionData.expenses.length > 0) {
      for (const expense of completionData.expenses) {
        await db.insert(staffExpenses).values({
          organizationId,
          staffId,
          taskId,
          propertyId: updatedTask.propertyId,
          item: expense.item,
          amount: expense.amount,
          currency: expense.currency || 'THB',
          category: expense.category,
          description: expense.description,
        });
      }
    }

    // Record task history
    await db.insert(taskHistory).values({
      organizationId,
      taskId,
      propertyId: updatedTask.propertyId,
      action: 'completed',
      previousStatus: 'in-progress',
      newStatus: 'completed',
      performedBy: staffId,
      notes: completionData.completionNotes || 'Task completed by staff member',
      evidencePhotos: completionData.evidencePhotos || [],
      issuesFound: completionData.issuesFound || [],
    });

    // Create notification for managers
    await this.createNotification({
      organizationId,
      title: 'Task Completed',
      message: `Task "${updatedTask.title}" has been completed by staff member`,
      type: 'task_completion',
      userId: updatedTask.createdBy || 'admin',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      priority: 'medium',
    });

    return updatedTask;
  }

  // Staff salary methods
  async getStaffSalary(organizationId: string, staffId: string, period?: string): Promise<any[]> {
    let query = db
      .select()
      .from(staffSalaries)
      .where(and(
        eq(staffSalaries.organizationId, organizationId),
        eq(staffSalaries.staffId, staffId)
      ));

    if (period) {
      query = query.where(eq(staffSalaries.salaryPeriod, period));
    }

    return query.orderBy(desc(staffSalaries.salaryPeriod));
  }

  async createStaffSalary(salaryData: any): Promise<any> {
    const [newSalary] = await db.insert(staffSalaries).values(salaryData).returning();
    return newSalary;
  }

  // Staff expenses methods
  async getStaffExpenses(organizationId: string, staffId: string, filters?: {
    taskId?: number;
    category?: string;
    approved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = db
      .select({
        id: staffExpenses.id,
        item: staffExpenses.item,
        amount: staffExpenses.amount,
        currency: staffExpenses.currency,
        category: staffExpenses.category,
        description: staffExpenses.description,
        receiptUrl: staffExpenses.receiptUrl,
        isApproved: staffExpenses.isApproved,
        reimbursementStatus: staffExpenses.reimbursementStatus,
        taskId: staffExpenses.taskId,
        taskTitle: tasks.title,
        propertyId: staffExpenses.propertyId,
        propertyName: properties.name,
        createdAt: staffExpenses.createdAt,
      })
      .from(staffExpenses)
      .leftJoin(tasks, eq(staffExpenses.taskId, tasks.id))
      .leftJoin(properties, eq(staffExpenses.propertyId, properties.id))
      .where(and(
        eq(staffExpenses.organizationId, organizationId),
        eq(staffExpenses.staffId, staffId)
      ));

    if (filters?.taskId) {
      query = query.where(eq(staffExpenses.taskId, filters.taskId));
    }
    if (filters?.category) {
      query = query.where(eq(staffExpenses.category, filters.category));
    }
    if (filters?.approved !== undefined) {
      query = query.where(eq(staffExpenses.isApproved, filters.approved));
    }
    if (filters?.startDate) {
      query = query.where(gte(staffExpenses.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(staffExpenses.createdAt, new Date(filters.endDate)));
    }

    return query.orderBy(desc(staffExpenses.createdAt));
  }

  async createStaffExpense(expenseData: any): Promise<any> {
    const [newExpense] = await db.insert(staffExpenses).values(expenseData).returning();
    return newExpense;
  }

  // Get staff task completion history
  async getStaffTaskHistory(organizationId: string, staffId: string, filters?: {
    startDate?: string;
    endDate?: string;
    propertyId?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        id: taskCompletions.id,
        taskId: taskCompletions.taskId,
        taskTitle: tasks.title,
        taskType: tasks.type,
        department: tasks.department,
        propertyId: taskCompletions.propertyId,
        propertyName: properties.name,
        startedAt: taskCompletions.startedAt,
        completedAt: taskCompletions.completedAt,
        duration: taskCompletions.duration,
        evidencePhotos: taskCompletions.evidencePhotos,
        completionNotes: taskCompletions.completionNotes,
        issuesFound: taskCompletions.issuesFound,
        totalExpenseAmount: taskCompletions.totalExpenseAmount,
        qualityRating: taskCompletions.qualityRating,
        managerNotes: taskCompletions.managerNotes,
        createdAt: taskCompletions.createdAt,
      })
      .from(taskCompletions)
      .leftJoin(tasks, eq(taskCompletions.taskId, tasks.id))
      .leftJoin(properties, eq(taskCompletions.propertyId, properties.id))
      .where(and(
        eq(taskCompletions.organizationId, organizationId),
        eq(taskCompletions.staffId, staffId)
      ));

    if (filters?.startDate) {
      query = query.where(gte(taskCompletions.completedAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(taskCompletions.completedAt, new Date(filters.endDate)));
    }
    if (filters?.propertyId) {
      query = query.where(eq(taskCompletions.propertyId, filters.propertyId));
    }

    return query.orderBy(desc(taskCompletions.completedAt));
  }

  // Skip task with reason
  async skipTask(organizationId: string, taskId: number, staffId: string, reason: string): Promise<any> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'skipped',
        skipReason: reason,
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId)
      ))
      .returning();

    // Record task history
    await db.insert(taskHistory).values({
      organizationId,
      taskId,
      propertyId: updatedTask.propertyId,
      action: 'skipped',
      previousStatus: 'pending',
      newStatus: 'skipped',
      performedBy: staffId,
      notes: reason,
    });

    return updatedTask;
  }

  // Reschedule task
  async rescheduleTask(organizationId: string, taskId: number, staffId: string, newDate: Date, reason: string): Promise<any> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: 'rescheduled',
        rescheduleReason: reason,
        rescheduledDate: newDate,
        dueDate: newDate,
        updatedAt: new Date(),
      })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.organizationId, organizationId),
        eq(tasks.assignedTo, staffId)
      ))
      .returning();

    // Record task history
    await db.insert(taskHistory).values({
      organizationId,
      taskId,
      propertyId: updatedTask.propertyId,
      action: 'rescheduled',
      previousStatus: 'pending',
      newStatus: 'rescheduled',
      performedBy: staffId,
      notes: `Rescheduled to ${newDate.toISOString().split('T')[0]}: ${reason}`,
    });

    return updatedTask;
  }

  // Enhanced Owner Dashboard Features - AI Suggestions
  async getOwnerAISuggestions(organizationId: string, ownerId: string, filters?: { propertyId?: number }): Promise<any[]> {
    // This will return AI-generated suggestions based on guest reviews and property data
    // For now, returning mock data that integrates with existing guest feedback
    const suggestions = [
      {
        id: 1,
        type: 'maintenance',
        title: 'Pool Cleaning Improvement',
        description: 'Multiple guests mentioned pool cleanliness issues. Consider increasing cleaning frequency.',
        estimatedCost: 250,
        priority: 'high',
        confidence: 0.85,
        sourceType: 'guest_reviews',
        sourceCount: 3,
        propertyId: filters?.propertyId || 1,
        createdAt: new Date(),
        status: 'pending',
        aiAnalysis: 'Analyzed 5 recent reviews with keywords: "pool", "dirty", "maintenance"'
      },
      {
        id: 2,
        type: 'amenity',
        title: 'WiFi Speed Upgrade',
        description: 'Guests frequently complain about slow internet. Upgrade to fiber recommended.',
        estimatedCost: 150,
        priority: 'medium',
        confidence: 0.75,
        sourceType: 'guest_reviews',
        sourceCount: 7,
        propertyId: filters?.propertyId || 1,
        createdAt: new Date(),
        status: 'pending',
        aiAnalysis: 'Analyzed 7 reviews mentioning WiFi speed issues'
      }
    ];

    return suggestions;
  }

  async respondToAISuggestion(suggestionId: number, action: string, notes: string, userId: string): Promise<any> {
    // Handle AI suggestion responses - approve, reject, or request quote
    return {
      id: suggestionId,
      action,
      notes,
      respondedBy: userId,
      respondedAt: new Date(),
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'quote_requested'
    };
  }

  async getOwnerBookingInsights(organizationId: string, ownerId: string, filters?: { propertyId?: number }): Promise<any> {
    // Enhanced booking insights with OTA sync status
    return {
      totalBookings: 24,
      revenue: {
        thisMonth: 12500,
        lastMonth: 11200,
        growth: 11.6
      },
      sources: {
        airbnb: { bookings: 12, revenue: 6800, syncStatus: 'connected' },
        vrbo: { bookings: 8, revenue: 4200, syncStatus: 'connected' },
        direct: { bookings: 4, revenue: 1500, syncStatus: 'n/a' }
      },
      occupancyRate: 78,
      averageRating: 4.7,
      responseRate: 95,
      otaConnectionStatus: {
        hostaway: 'connected',
        lastSync: new Date(),
        errorCount: 0
      }
    };
  }

  // Enhanced Activity Timeline with Photos and AI Insights
  async getOwnerActivityTimeline(organizationId: string, ownerId: string, filters?: { propertyId?: number; days?: number }): Promise<any[]> {
    const activities = [
      {
        id: 1,
        activityType: 'check_in',
        title: 'Guest Check-in',
        description: 'Sarah & Mike Johnson checked into Villa Serena',
        propertyName: 'Villa Serena',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: {
          guestName: 'Sarah Johnson',
          photos: ['/api/placeholder-checkin-1.jpg']
        }
      },
      {
        id: 2,
        activityType: 'ai_suggestion',
        title: 'AI Maintenance Suggestion',
        description: 'Pool cleaning frequency should be increased based on guest feedback',
        propertyName: 'Villa Serena',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: {
          aiConfidence: 0.85,
          cost: 250
        }
      },
      {
        id: 3,
        activityType: 'task_completed',
        title: 'Maintenance Task Completed',
        description: 'Pool skimmer repair completed by maintenance team',
        propertyName: 'Villa Serena',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        metadata: {
          taskId: 15,
          photos: ['/api/placeholder-pool-1.jpg', '/api/placeholder-pool-2.jpg']
        }
      },
      {
        id: 4,
        activityType: 'guest_feedback',
        title: 'New Guest Review',
        description: '5-star review: "Beautiful property with amazing pool!"',
        propertyName: 'Villa Serena',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        metadata: {
          reviewSource: 'Airbnb',
          guestName: 'Emma Davis'
        }
      },
      {
        id: 5,
        activityType: 'check_out',
        title: 'Guest Check-out',
        description: 'Emma Davis checked out of Villa Serena',
        propertyName: 'Villa Serena',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        metadata: {
          guestName: 'Emma Davis',
          photos: ['/api/placeholder-checkout-1.jpg']
        }
      }
    ];

    return activities;
  }

  // ==================== UTILITY PROVIDERS & CUSTOM EXPENSE MANAGEMENT ====================

  async getUtilityProviders(organizationId: string, utilityType?: string): Promise<UtilityProvider[]> {
    let query = db
      .select()
      .from(utilityProviders)
      .where(eq(utilityProviders.organizationId, organizationId));

    if (utilityType) {
      query = query.where(eq(utilityProviders.utilityType, utilityType));
    }

    return await query
      .orderBy(asc(utilityProviders.displayOrder), asc(utilityProviders.providerName));
  }

  async createUtilityProvider(data: InsertUtilityProvider): Promise<UtilityProvider> {
    const [provider] = await db.insert(utilityProviders).values(data).returning();
    return provider;
  }

  async updateUtilityProvider(id: number, data: Partial<InsertUtilityProvider>): Promise<UtilityProvider> {
    const [provider] = await db
      .update(utilityProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(utilityProviders.id, id))
      .returning();
    return provider;
  }

  async deleteUtilityProvider(id: number): Promise<void> {
    await db.delete(utilityProviders).where(eq(utilityProviders.id, id));
  }

  async getCustomExpenseCategories(organizationId: string): Promise<CustomExpenseCategory[]> {
    return await db
      .select()
      .from(customExpenseCategories)
      .where(eq(customExpenseCategories.organizationId, organizationId))
      .orderBy(asc(customExpenseCategories.displayOrder), asc(customExpenseCategories.categoryName));
  }

  async createCustomExpenseCategory(data: InsertCustomExpenseCategory): Promise<CustomExpenseCategory> {
    const [category] = await db.insert(customExpenseCategories).values(data).returning();
    return category;
  }

  async updateCustomExpenseCategory(id: number, data: Partial<InsertCustomExpenseCategory>): Promise<CustomExpenseCategory> {
    const [category] = await db
      .update(customExpenseCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customExpenseCategories.id, id))
      .returning();
    return category;
  }

  async deleteCustomExpenseCategory(id: number): Promise<void> {
    await db.delete(customExpenseCategories).where(eq(customExpenseCategories.id, id));
  }

  async getPropertyUtilitySettings(organizationId: string, propertyId?: number): Promise<PropertyUtilitySettings[]> {
    let query = db
      .select()
      .from(propertyUtilitySettings)
      .where(eq(propertyUtilitySettings.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(propertyUtilitySettings.propertyId, propertyId));
    }

    return await query.orderBy(asc(propertyUtilitySettings.utilityType));
  }

  async createPropertyUtilitySettings(data: InsertPropertyUtilitySettings): Promise<PropertyUtilitySettings> {
    const [settings] = await db.insert(propertyUtilitySettings).values(data).returning();
    return settings;
  }

  async updatePropertyUtilitySettings(id: number, data: Partial<InsertPropertyUtilitySettings>): Promise<PropertyUtilitySettings> {
    const [settings] = await db
      .update(propertyUtilitySettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyUtilitySettings.id, id))
      .returning();
    return settings;
  }

  async deletePropertyUtilitySettings(id: number): Promise<void> {
    await db.delete(propertyUtilitySettings).where(eq(propertyUtilitySettings.id, id));
  }

  async getPropertyCustomExpenses(organizationId: string, propertyId?: number): Promise<PropertyCustomExpenses[]> {
    let query = db
      .select()
      .from(propertyCustomExpenses)
      .where(eq(propertyCustomExpenses.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(propertyCustomExpenses.propertyId, propertyId));
    }

    return await query.orderBy(asc(propertyCustomExpenses.propertyId));
  }

  async createPropertyCustomExpenses(data: InsertPropertyCustomExpenses): Promise<PropertyCustomExpenses> {
    const [expense] = await db.insert(propertyCustomExpenses).values(data).returning();
    return expense;
  }

  async updatePropertyCustomExpenses(id: number, data: Partial<InsertPropertyCustomExpenses>): Promise<PropertyCustomExpenses> {
    const [expense] = await db
      .update(propertyCustomExpenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyCustomExpenses.id, id))
      .returning();
    return expense;
  }

  async deletePropertyCustomExpenses(id: number): Promise<void> {
    await db.delete(propertyCustomExpenses).where(eq(propertyCustomExpenses.id, id));
  }

  async seedDefaultUtilityProviders(organizationId: string, createdBy: string): Promise<void> {
    const defaultProviders = [
      // Internet providers (Thailand)
      { utilityType: 'internet', providerName: 'True Online', country: 'Thailand', isDefault: true, displayOrder: 1 },
      { utilityType: 'internet', providerName: '3BB', country: 'Thailand', displayOrder: 2 },
      { utilityType: 'internet', providerName: 'NT', country: 'Thailand', displayOrder: 3 },
      { utilityType: 'internet', providerName: 'CAT', country: 'Thailand', displayOrder: 4 },
      { utilityType: 'internet', providerName: 'TOT', country: 'Thailand', displayOrder: 5 },
      { utilityType: 'internet', providerName: 'AIS', country: 'Thailand', displayOrder: 6 },
      
      // Electric providers (Thailand)
      { utilityType: 'electricity', providerName: 'PEA', country: 'Thailand', isDefault: true, displayOrder: 1 },
      
      // Water providers (Thailand)
      { utilityType: 'water', providerName: 'Government', country: 'Thailand', isDefault: true, displayOrder: 1 },
      { utilityType: 'water', providerName: 'Deepwell', country: 'Thailand', displayOrder: 2 },
    ];

    for (const provider of defaultProviders) {
      await this.createUtilityProvider({
        organizationId,
        createdBy,
        ...provider
      });
    }
  }

  async seedDefaultCustomExpenseCategories(organizationId: string, createdBy: string): Promise<void> {
    const defaultCategories = [
      { categoryName: 'Gas', description: 'Cooking gas and propane cylinders', billingCycle: 'monthly', defaultAmount: '500', currency: 'THB', displayOrder: 1 },
      { categoryName: 'Pest Control', description: 'Regular pest control services', billingCycle: 'monthly', defaultAmount: '800', currency: 'THB', displayOrder: 2 },
      { categoryName: 'Residence Fee', description: 'Building or community fees', billingCycle: 'monthly', defaultAmount: '1200', currency: 'THB', displayOrder: 3 },
      { categoryName: 'Security Service', description: 'Security guard or monitoring service', billingCycle: 'monthly', defaultAmount: '2000', currency: 'THB', displayOrder: 4 },
      { categoryName: 'Landscaping', description: 'Garden maintenance and landscaping', billingCycle: 'monthly', defaultAmount: '1500', currency: 'THB', displayOrder: 5 },
    ];

    for (const category of defaultCategories) {
      await this.createCustomExpenseCategory({
        organizationId,
        createdBy,
        ...category
      });
    }
  }

  // ===== ENHANCED COMMISSION MANAGEMENT SYSTEM =====

  // Commission Log Operations
  async createCommissionLog(commission: typeof commissionLog.$inferInsert): Promise<typeof commissionLog.$inferSelect> {
    const [newCommission] = await db.insert(commissionLog).values(commission).returning();
    return newCommission;
  }

  async getCommissionLog(organizationId: string, filters?: {
    agentId?: string;
    agentType?: 'retail-agent' | 'referral-agent';
    propertyId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<(typeof commissionLog.$inferSelect & { 
    propertyName?: string; 
    agentName?: string;
    agentEmail?: string;
  })[]> {
    let query = db
      .select({
        ...commissionLog,
        propertyName: properties.name,
        agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        agentEmail: users.email,
      })
      .from(commissionLog)
      .leftJoin(properties, eq(commissionLog.propertyId, properties.id))
      .leftJoin(users, eq(commissionLog.agentId, users.id))
      .where(eq(commissionLog.organizationId, organizationId));

    if (filters?.agentId) {
      query = query.where(eq(commissionLog.agentId, filters.agentId));
    }
    if (filters?.agentType) {
      query = query.where(eq(commissionLog.agentType, filters.agentType));
    }
    if (filters?.propertyId) {
      query = query.where(eq(commissionLog.propertyId, filters.propertyId));
    }
    if (filters?.status) {
      query = query.where(eq(commissionLog.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(commissionLog.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(commissionLog.createdAt, new Date(filters.endDate)));
    }

    return query
      .orderBy(desc(commissionLog.createdAt))
      .limit(filters?.limit || 100);
  }

  async updateCommissionLog(id: number, updates: Partial<typeof commissionLog.$inferSelect>): Promise<typeof commissionLog.$inferSelect | undefined> {
    const [updated] = await db
      .update(commissionLog)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commissionLog.id, id))
      .returning();
    return updated;
  }

  // Agent Commission Summary with KPIs
  async getAgentCommissionSummary(organizationId: string, agentId: string, agentType: 'retail-agent' | 'referral-agent'): Promise<{
    totalEarned: number;
    pendingCommissions: number;
    paidCommissions: number;
    currentBalance: number;
    totalBookings?: number;
    thisMonthEarnings: number;
    averageCommissionRate: number;
    lastPaymentDate?: Date;
  }> {
    // Get commission totals from commission log
    const [commissionStats] = await db
      .select({
        totalEarned: sum(commissionLog.commissionAmount),
        pendingAmount: sum(sql`CASE WHEN ${commissionLog.status} = 'pending' THEN ${commissionLog.commissionAmount} ELSE 0 END`),
        paidAmount: sum(sql`CASE WHEN ${commissionLog.status} = 'paid' THEN ${commissionLog.commissionAmount} ELSE 0 END`),
        avgRate: avg(commissionLog.commissionRate),
        totalTransactions: count(commissionLog.id),
      })
      .from(commissionLog)
      .where(and(
        eq(commissionLog.organizationId, organizationId),
        eq(commissionLog.agentId, agentId),
        eq(commissionLog.agentType, agentType)
      ));

    // Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [thisMonthStats] = await db
      .select({
        thisMonthEarnings: sum(commissionLog.commissionAmount),
      })
      .from(commissionLog)
      .where(and(
        eq(commissionLog.organizationId, organizationId),
        eq(commissionLog.agentId, agentId),
        eq(commissionLog.agentType, agentType),
        gte(commissionLog.createdAt, startOfMonth)
      ));

    // Get last payment date from payouts
    const [lastPayment] = await db
      .select({ lastPaymentDate: max(agentPayouts.paidAt) })
      .from(agentPayouts)
      .where(and(
        eq(agentPayouts.organizationId, organizationId),
        eq(agentPayouts.agentId, agentId),
        eq(agentPayouts.agentType, agentType),
        eq(agentPayouts.payoutStatus, 'paid')
      ));

    // Get total bookings for retail agents
    let totalBookings = 0;
    if (agentType === 'retail-agent') {
      const [bookingStats] = await db
        .select({ count: count() })
        .from(agentBookings)
        .where(and(
          eq(agentBookings.organizationId, organizationId),
          eq(agentBookings.retailAgentId, agentId)
        ));
      totalBookings = bookingStats?.count || 0;
    }

    return {
      totalEarned: Number(commissionStats?.totalEarned || 0),
      pendingCommissions: Number(commissionStats?.pendingAmount || 0),
      paidCommissions: Number(commissionStats?.paidAmount || 0),
      currentBalance: Number(commissionStats?.totalEarned || 0) - Number(commissionStats?.paidAmount || 0),
      totalBookings: agentType === 'retail-agent' ? totalBookings : undefined,
      thisMonthEarnings: Number(thisMonthStats?.thisMonthEarnings || 0),
      averageCommissionRate: Number(commissionStats?.avgRate || 0),
      lastPaymentDate: lastPayment?.lastPaymentDate,
    };
  }

  // Admin Commission Management Functions
  async markCommissionAsPaid(id: number, adminId: string, notes?: string): Promise<typeof commissionLog.$inferSelect | undefined> {
    const [updated] = await db
      .update(commissionLog)
      .set({
        status: 'paid',
        processedBy: adminId,
        processedAt: new Date(),
        adminNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(commissionLog.id, id))
      .returning();
    return updated;
  }

  async adjustCommissionAmount(
    id: number, 
    newAmount: number, 
    adminId: string, 
    reason: string
  ): Promise<{ original: typeof commissionLog.$inferSelect; adjustment: typeof commissionLog.$inferSelect }> {
    // Get original commission
    const [original] = await db
      .select()
      .from(commissionLog)
      .where(eq(commissionLog.id, id));

    if (!original) {
      throw new Error('Commission not found');
    }

    // Update original as cancelled
    const [updatedOriginal] = await db
      .update(commissionLog)
      .set({
        status: 'cancelled',
        processedBy: adminId,
        processedAt: new Date(),
        adminNotes: `Original commission cancelled due to adjustment: ${reason}`,
        updatedAt: new Date(),
      })
      .where(eq(commissionLog.id, id))
      .returning();

    // Create adjustment commission
    const [adjustment] = await db
      .insert(commissionLog)
      .values({
        organizationId: original.organizationId,
        agentId: original.agentId,
        agentType: original.agentType,
        propertyId: original.propertyId,
        bookingId: original.bookingId,
        referenceNumber: original.referenceNumber,
        baseAmount: original.baseAmount,
        commissionRate: original.commissionRate,
        commissionAmount: newAmount.toString(),
        currency: original.currency,
        status: 'pending',
        isAdjustment: true,
        originalCommissionId: original.id,
        adjustmentReason: reason,
        processedBy: adminId,
        processedAt: new Date(),
        commissionMonth: original.commissionMonth,
        commissionYear: original.commissionYear,
      })
      .returning();

    return { original: updatedOriginal, adjustment };
  }

  // Commission Invoice Operations
  async createCommissionInvoice(invoice: typeof commissionInvoices.$inferInsert): Promise<typeof commissionInvoices.$inferSelect> {
    const [newInvoice] = await db.insert(commissionInvoices).values(invoice).returning();
    return newInvoice;
  }

  async getAgentInvoices(organizationId: string, agentId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<typeof commissionInvoices.$inferSelect[]> {
    let query = db
      .select()
      .from(commissionInvoices)
      .where(and(
        eq(commissionInvoices.organizationId, organizationId),
        eq(commissionInvoices.agentId, agentId)
      ));

    if (filters?.status) {
      query = query.where(eq(commissionInvoices.status, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(commissionInvoices.invoiceDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(commissionInvoices.invoiceDate, filters.endDate));
    }

    return query.orderBy(desc(commissionInvoices.createdAt));
  }

  async generateInvoiceNumber(organizationId: string, agentType: 'retail-agent' | 'referral-agent'): Promise<string> {
    const prefix = agentType === 'retail-agent' ? 'INV-RA' : 'INV-RF';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of invoices this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const [count] = await db
      .select({ count: count() })
      .from(commissionInvoices)
      .where(and(
        eq(commissionInvoices.organizationId, organizationId),
        eq(commissionInvoices.agentType, agentType),
        gte(commissionInvoices.createdAt, startOfMonth),
        lte(commissionInvoices.createdAt, endOfMonth)
      ));

    const sequence = ((count?.count || 0) + 1).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  async submitInvoiceForApproval(id: number, agentId: string): Promise<typeof commissionInvoices.$inferSelect | undefined> {
    const [updated] = await db
      .update(commissionInvoices)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(commissionInvoices.id, id),
        eq(commissionInvoices.agentId, agentId)
      ))
      .returning();
    return updated;
  }

  async approveInvoice(id: number, adminId: string, notes?: string): Promise<typeof commissionInvoices.$inferSelect | undefined> {
    const [updated] = await db
      .update(commissionInvoices)
      .set({
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        adminNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(commissionInvoices.id, id))
      .returning();
    return updated;
  }

  async rejectInvoice(id: number, adminId: string, reason: string): Promise<typeof commissionInvoices.$inferSelect | undefined> {
    const [updated] = await db
      .update(commissionInvoices)
      .set({
        status: 'rejected',
        rejectedReason: reason,
        adminNotes: reason,
        updatedAt: new Date(),
      })
      .where(eq(commissionInvoices.id, id))
      .returning();
    return updated;
  }

  // Commission Invoice Line Items
  async createInvoiceLineItem(item: typeof commissionInvoiceItems.$inferInsert): Promise<typeof commissionInvoiceItems.$inferSelect> {
    const [newItem] = await db.insert(commissionInvoiceItems).values(item).returning();
    return newItem;
  }

  async getInvoiceLineItems(invoiceId: number): Promise<typeof commissionInvoiceItems.$inferSelect[]> {
    return db
      .select()
      .from(commissionInvoiceItems)
      .where(eq(commissionInvoiceItems.invoiceId, invoiceId))
      .orderBy(commissionInvoiceItems.commissionDate);
  }

  // Admin Commission Overview for CSV Export
  async getCommissionOverviewForExport(organizationId: string, filters?: {
    agentType?: 'retail-agent' | 'referral-agent';
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{
    organizationId: string;
    agentId: string;
    agentName: string;
    agentEmail: string;
    agentType: string;
    propertyName: string;
    referenceNumber: string;
    commissionDate: Date;
    baseAmount: string;
    commissionRate: string;
    commissionAmount: string;
    currency: string;
    status: string;
    processedBy?: string;
    processedAt?: Date;
  }[]> {
    let query = db
      .select({
        organizationId: commissionLog.organizationId,
        agentId: commissionLog.agentId,
        agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        agentEmail: users.email,
        agentType: commissionLog.agentType,
        propertyName: properties.name,
        referenceNumber: commissionLog.referenceNumber,
        commissionDate: commissionLog.createdAt,
        baseAmount: commissionLog.baseAmount,
        commissionRate: commissionLog.commissionRate,
        commissionAmount: commissionLog.commissionAmount,
        currency: commissionLog.currency,
        status: commissionLog.status,
        processedBy: commissionLog.processedBy,
        processedAt: commissionLog.processedAt,
      })
      .from(commissionLog)
      .leftJoin(users, eq(commissionLog.agentId, users.id))
      .leftJoin(properties, eq(commissionLog.propertyId, properties.id))
      .where(eq(commissionLog.organizationId, organizationId));

    if (filters?.agentType) {
      query = query.where(eq(commissionLog.agentType, filters.agentType));
    }
    if (filters?.startDate) {
      query = query.where(gte(commissionLog.createdAt, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      query = query.where(lte(commissionLog.createdAt, new Date(filters.endDate)));
    }
    if (filters?.status) {
      query = query.where(eq(commissionLog.status, filters.status));
    }

    return query.orderBy(desc(commissionLog.createdAt));
  }

  // Trigger Payout Process
  async triggerCommissionPayout(agentId: string, organizationId: string, amount: number, agentType: 'retail-agent' | 'referral-agent', adminId: string): Promise<typeof agentPayouts.$inferSelect> {
    const [payout] = await db
      .insert(agentPayouts)
      .values({
        organizationId,
        agentId,
        agentType,
        payoutAmount: amount.toString(),
        payoutStatus: 'pending',
        requestedAt: new Date(),
        requestedBy: adminId,
        currency: 'THB',
      })
      .returning();

    // Update related commission log entries as being paid out
    await db
      .update(commissionLog)
      .set({
        payoutId: payout.id,
        updatedAt: new Date(),
      })
      .where(and(
        eq(commissionLog.organizationId, organizationId),
        eq(commissionLog.agentId, agentId),
        eq(commissionLog.agentType, agentType),
        eq(commissionLog.status, 'pending')
      ));

    return payout;
  }

  // Agent-specific commission methods
  async getRetailAgentBookingCommissions(organizationId: string, agentId: string, filters?: {
    propertyId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<(typeof agentBookings.$inferSelect & { propertyName?: string })[]> {
    let query = db
      .select({
        ...agentBookings,
        propertyName: properties.name,
      })
      .from(agentBookings)
      .leftJoin(properties, eq(agentBookings.propertyId, properties.id))
      .where(and(
        eq(agentBookings.organizationId, organizationId),
        eq(agentBookings.retailAgentId, agentId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(agentBookings.propertyId, filters.propertyId));
    }
    if (filters?.status) {
      query = query.where(eq(agentBookings.commissionStatus, filters.status));
    }
    if (filters?.startDate) {
      query = query.where(gte(agentBookings.checkIn, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(agentBookings.checkOut, filters.endDate));
    }

    return query.orderBy(desc(agentBookings.createdAt));
  }

  async getReferralAgentCommissions(organizationId: string, agentId: string, filters?: {
    propertyId?: number;
    year?: number;
    month?: number;
    status?: string;
  }): Promise<(typeof referralEarnings.$inferSelect & { propertyName?: string })[]> {
    let query = db
      .select({
        ...referralEarnings,
        propertyName: properties.name,
      })
      .from(referralEarnings)
      .leftJoin(properties, eq(referralEarnings.propertyId, properties.id))
      .where(and(
        eq(referralEarnings.organizationId, organizationId),
        eq(referralEarnings.referralAgentId, agentId)
      ));

    if (filters?.propertyId) {
      query = query.where(eq(referralEarnings.propertyId, filters.propertyId));
    }
    if (filters?.year) {
      query = query.where(eq(referralEarnings.year, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(referralEarnings.month, filters.month));
    }
    if (filters?.status) {
      query = query.where(eq(referralEarnings.status, filters.status));
    }

    return query.orderBy(desc(referralEarnings.year), desc(referralEarnings.month));
  }

  // Guest Add-On Service operations
  async getGuestAddonServices(organizationId: string): Promise<GuestAddonService[]> {
    return await db.select()
      .from(guestAddonServices)
      .where(eq(guestAddonServices.organizationId, organizationId))
      .orderBy(desc(guestAddonServices.createdAt));
  }

  async getActiveGuestAddonServices(organizationId: string): Promise<GuestAddonService[]> {
    return await db.select()
      .from(guestAddonServices)
      .where(
        and(
          eq(guestAddonServices.organizationId, organizationId),
          eq(guestAddonServices.isActive, true)
        )
      )
      .orderBy(desc(guestAddonServices.createdAt));
  }

  async createGuestAddonService(service: InsertGuestAddonService): Promise<GuestAddonService> {
    const [created] = await db.insert(guestAddonServices)
      .values(service)
      .returning();
    return created;
  }

  async updateGuestAddonService(id: number, organizationId: string, updates: Partial<InsertGuestAddonService>): Promise<GuestAddonService | undefined> {
    const [updated] = await db.update(guestAddonServices)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(guestAddonServices.id, id),
          eq(guestAddonServices.organizationId, organizationId)
        )
      )
      .returning();
    return updated;
  }

  // Guest Add-On Booking operations
  async getGuestAddonBookings(organizationId: string): Promise<(GuestAddonBooking & { serviceName: string; propertyName: string })[]> {
    return await db.select({
      id: guestAddonBookings.id,
      serviceId: guestAddonBookings.serviceId,
      propertyId: guestAddonBookings.propertyId,
      guestName: guestAddonBookings.guestName,
      guestEmail: guestAddonBookings.guestEmail,
      guestPhone: guestAddonBookings.guestPhone,
      bookingDate: guestAddonBookings.bookingDate,
      serviceDate: guestAddonBookings.serviceDate,
      specialRequests: guestAddonBookings.specialRequests,
      totalAmount: guestAddonBookings.totalAmount,
      currency: guestAddonBookings.currency,
      status: guestAddonBookings.status,
      billingRoute: guestAddonBookings.billingRoute,
      complimentaryType: guestAddonBookings.complimentaryType,
      paymentStatus: guestAddonBookings.paymentStatus,
      paymentMethod: guestAddonBookings.paymentMethod,
      internalNotes: guestAddonBookings.internalNotes,
      bookedBy: guestAddonBookings.bookedBy,
      confirmedBy: guestAddonBookings.confirmedBy,
      cancelledBy: guestAddonBookings.cancelledBy,
      cancellationReason: guestAddonBookings.cancellationReason,
      organizationId: guestAddonBookings.organizationId,
      createdAt: guestAddonBookings.createdAt,
      updatedAt: guestAddonBookings.updatedAt,
      serviceName: guestAddonServices.serviceName,
      propertyName: properties.name
    })
    .from(guestAddonBookings)
    .leftJoin(guestAddonServices, eq(guestAddonBookings.serviceId, guestAddonServices.id))
    .leftJoin(properties, eq(guestAddonBookings.propertyId, properties.id))
    .where(eq(guestAddonBookings.organizationId, organizationId))
    .orderBy(desc(guestAddonBookings.createdAt));
  }

  async createGuestAddonBooking(booking: InsertGuestAddonBooking): Promise<GuestAddonBooking> {
    const [created] = await db.insert(guestAddonBookings)
      .values(booking)
      .returning();
    return created;
  }

  async updateGuestAddonBooking(id: number, organizationId: string, updates: Partial<InsertGuestAddonBooking>): Promise<GuestAddonBooking | undefined> {
    const [updated] = await db.update(guestAddonBookings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(guestAddonBookings.id, id),
          eq(guestAddonBookings.organizationId, organizationId)
        )
      )
      .returning();
    return updated;
  }

  async getGuestAddonBookingById(id: number, organizationId: string): Promise<GuestAddonBooking | undefined> {
    const [booking] = await db.select()
      .from(guestAddonBookings)
      .where(
        and(
          eq(guestAddonBookings.id, id),
          eq(guestAddonBookings.organizationId, organizationId)
        )
      );
    return booking;
  }

  // ===== LOYALTY & REPEAT GUEST TRACKER + SMART MESSAGING SYSTEM =====

  // Guest Loyalty Profile operations
  async getGuestLoyaltyProfile(organizationId: string, guestEmail: string): Promise<GuestLoyaltyProfile | undefined> {
    const [profile] = await db.select()
      .from(guestLoyaltyProfiles)
      .where(
        and(
          eq(guestLoyaltyProfiles.organizationId, organizationId),
          eq(guestLoyaltyProfiles.guestEmail, guestEmail)
        )
      );
    return profile;
  }

  async createOrUpdateGuestLoyaltyProfile(profile: InsertGuestLoyaltyProfile): Promise<GuestLoyaltyProfile> {
    const existingProfile = await this.getGuestLoyaltyProfile(profile.organizationId, profile.guestEmail);
    
    if (existingProfile) {
      // Update existing profile
      const [updated] = await db.update(guestLoyaltyProfiles)
        .set({
          ...profile,
          updatedAt: new Date(),
        })
        .where(eq(guestLoyaltyProfiles.id, existingProfile.id))
        .returning();
      return updated;
    } else {
      // Create new profile
      const [created] = await db.insert(guestLoyaltyProfiles)
        .values(profile)
        .returning();
      return created;
    }
  }

  async getAllGuestLoyaltyProfiles(organizationId: string): Promise<GuestLoyaltyProfile[]> {
    return await db.select()
      .from(guestLoyaltyProfiles)
      .where(eq(guestLoyaltyProfiles.organizationId, organizationId))
      .orderBy(desc(guestLoyaltyProfiles.lastStayDate));
  }

  async getRepeatGuests(organizationId: string): Promise<GuestLoyaltyProfile[]> {
    return await db.select()
      .from(guestLoyaltyProfiles)
      .where(
        and(
          eq(guestLoyaltyProfiles.organizationId, organizationId),
          gt(guestLoyaltyProfiles.totalStays, 1)
        )
      )
      .orderBy(desc(guestLoyaltyProfiles.totalStays));
  }

  // Loyalty Tier operations
  async getLoyaltyTiers(organizationId: string): Promise<LoyaltyTier[]> {
    return await db.select()
      .from(loyaltyTiers)
      .where(
        and(
          eq(loyaltyTiers.organizationId, organizationId),
          eq(loyaltyTiers.isActive, true)
        )
      )
      .orderBy(loyaltyTiers.minStays);
  }

  async createLoyaltyTier(tier: InsertLoyaltyTier): Promise<LoyaltyTier> {
    const [created] = await db.insert(loyaltyTiers)
      .values(tier)
      .returning();
    return created;
  }

  // Guest Messages operations
  async getGuestMessages(organizationId: string, threadId?: string): Promise<GuestMessage[]> {
    let query = db.select()
      .from(guestMessages)
      .where(eq(guestMessages.organizationId, organizationId));

    if (threadId) {
      query = query.where(eq(guestMessages.threadId, threadId));
    }

    return await query.orderBy(desc(guestMessages.createdAt));
  }

  async createGuestMessage(message: InsertGuestMessage): Promise<GuestMessage> {
    const [created] = await db.insert(guestMessages)
      .values(message)
      .returning();
    return created;
  }

  async markMessageAsRead(messageId: number, readBy: string): Promise<void> {
    await db.update(guestMessages)
      .set({
        isRead: true,
        readAt: new Date(),
        readBy,
      })
      .where(eq(guestMessages.id, messageId));
  }

  async getUnreadMessagesCount(organizationId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(guestMessages)
      .where(
        and(
          eq(guestMessages.organizationId, organizationId),
          eq(guestMessages.isRead, false),
          ne(guestMessages.senderType, 'system')
        )
      );
    return result[0]?.count || 0;
  }

  // Messaging Triggers operations
  async getMessagingTriggers(organizationId: string): Promise<MessagingTrigger[]> {
    return await db.select()
      .from(messagingTriggers)
      .where(
        and(
          eq(messagingTriggers.organizationId, organizationId),
          eq(messagingTriggers.isActive, true)
        )
      );
  }

  async createMessagingTrigger(trigger: InsertMessagingTrigger): Promise<MessagingTrigger> {
    const [created] = await db.insert(messagingTriggers)
      .values(trigger)
      .returning();
    return created;
  }

  // Smart Reply Suggestions operations
  async getSmartReplySuggestions(organizationId: string, category?: string): Promise<SmartReplySuggestion[]> {
    let query = db.select()
      .from(smartReplySuggestions)
      .where(
        and(
          eq(smartReplySuggestions.organizationId, organizationId),
          eq(smartReplySuggestions.isActive, true)
        )
      );

    if (category) {
      query = query.where(eq(smartReplySuggestions.category, category));
    }

    return await query.orderBy(desc(smartReplySuggestions.useCount));
  }

  async createSmartReplySuggestion(suggestion: InsertSmartReplySuggestion): Promise<SmartReplySuggestion> {
    const [created] = await db.insert(smartReplySuggestions)
      .values(suggestion)
      .returning();
    return created;
  }

  async incrementSmartReplyUsage(suggestionId: number): Promise<void> {
    await db.update(smartReplySuggestions)
      .set({
        useCount: sql`${smartReplySuggestions.useCount} + 1`,
        lastUsed: new Date(),
      })
      .where(eq(smartReplySuggestions.id, suggestionId));
  }

  // AI Message Analysis operations
  async createAiMessageAnalysis(analysis: InsertAiMessageAnalysis): Promise<AiMessageAnalysis> {
    const [created] = await db.insert(aiMessageAnalysis)
      .values(analysis)
      .returning();
    return created;
  }

  async getAiMessageAnalysis(organizationId: string, messageId: number): Promise<AiMessageAnalysis[]> {
    return await db.select()
      .from(aiMessageAnalysis)
      .where(
        and(
          eq(aiMessageAnalysis.organizationId, organizationId),
          eq(aiMessageAnalysis.messageId, messageId)
        )
      );
  }

  // Message Delivery Tracking operations
  async createMessageDelivery(delivery: InsertMessageDelivery): Promise<MessageDelivery> {
    const [created] = await db.insert(messageDeliveries)
      .values(delivery)
      .returning();
    return created;
  }

  async updateMessageDeliveryStatus(deliveryId: number, status: string, failureReason?: string): Promise<void> {
    await db.update(messageDeliveries)
      .set({
        deliveryStatus: status,
        deliveredAt: status === 'delivered' ? new Date() : undefined,
        failureReason,
      })
      .where(eq(messageDeliveries.id, deliveryId));
  }

  // Utility methods for repeat guest identification
  async identifyRepeatGuest(organizationId: string, guestEmail: string, guestName: string, guestPhone?: string): Promise<{ isRepeat: boolean; profile?: GuestLoyaltyProfile }> {
    // Try to find by email first
    let profile = await this.getGuestLoyaltyProfile(organizationId, guestEmail);

    // If not found by email, try by phone (if provided)
    if (!profile && guestPhone) {
      const [phoneProfile] = await db.select()
        .from(guestLoyaltyProfiles)
        .where(
          and(
            eq(guestLoyaltyProfiles.organizationId, organizationId),
            eq(guestLoyaltyProfiles.guestPhone, guestPhone)
          )
        );
      profile = phoneProfile;
    }

    // If still not found, try by name similarity
    if (!profile) {
      const [nameProfile] = await db.select()
        .from(guestLoyaltyProfiles)
        .where(
          and(
            eq(guestLoyaltyProfiles.organizationId, organizationId),
            ilike(guestLoyaltyProfiles.guestName, `%${guestName}%`)
          )
        );
      profile = nameProfile;
    }

    return {
      isRepeat: !!profile && profile.totalStays > 0,
      profile
    };
  }

  // Update guest loyalty on new booking
  async updateGuestLoyaltyOnBooking(
    organizationId: string, 
    guestEmail: string, 
    guestName: string, 
    guestPhone: string | undefined,
    propertyId: number,
    bookingAmount: number,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<GuestLoyaltyProfile> {
    const { profile } = await this.identifyRepeatGuest(organizationId, guestEmail, guestName, guestPhone);
    
    const stayDuration = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (profile) {
      // Update existing profile
      const newTotalStays = profile.totalStays + 1;
      const newTotalSpent = parseFloat(profile.totalSpent) + bookingAmount;
      const newAverageStayDuration = Math.round(
        ((profile.averageStayDuration || 0) * profile.totalStays + stayDuration) / newTotalStays
      );

      // Determine loyalty tier based on total stays
      const tiers = await this.getLoyaltyTiers(organizationId);
      let newTier = 'new';
      for (const tier of tiers.reverse()) { // Start from highest tier
        if (newTotalStays >= tier.minStays) {
          newTier = tier.tierName.toLowerCase();
          break;
        }
      }

      const [updated] = await db.update(guestLoyaltyProfiles)
        .set({
          totalStays: newTotalStays,
          totalSpent: newTotalSpent.toString(),
          averageStayDuration: newAverageStayDuration,
          lastStayDate: checkInDate,
          loyaltyTier: newTier,
          updatedAt: new Date(),
        })
        .where(eq(guestLoyaltyProfiles.id, profile.id))
        .returning();
      
      return updated;
    } else {
      // Create new profile
      const newProfile: InsertGuestLoyaltyProfile = {
        organizationId,
        guestEmail,
        guestName,
        guestPhone,
        totalStays: 1,
        firstStayDate: checkInDate,
        lastStayDate: checkInDate,
        loyaltyTier: 'new',
        totalSpent: bookingAmount.toString(),
        averageStayDuration: stayDuration,
        preferredProperties: [propertyId.toString()],
        loyaltyPoints: 0,
        isVip: false,
      };

      return await this.createOrUpdateGuestLoyaltyProfile(newProfile);
    }
  }

  // ===== COMPREHENSIVE PAYROLL, COMMISSION & INVOICE MANAGEMENT SYSTEM =====

  // ===== STAFF PAYROLL MANAGEMENT =====

  // Create payroll record for staff
  async createStaffPayrollRecord(record: InsertStaffPayrollRecord): Promise<StaffPayrollRecord> {
    const [newRecord] = await db.insert(staffPayrollRecords).values(record).returning();
    return newRecord;
  }

  // Get staff payroll records with filters
  async getStaffPayrollRecords(organizationId: string, filters?: {
    staffId?: string;
    payrollPeriod?: string;
    paymentStatus?: string;
    year?: number;
    month?: number;
  }): Promise<StaffPayrollRecord[]> {
    let query = db
      .select()
      .from(staffPayrollRecords)
      .where(eq(staffPayrollRecords.organizationId, organizationId));

    if (filters?.staffId) {
      query = query.where(eq(staffPayrollRecords.staffId, filters.staffId));
    }
    if (filters?.payrollPeriod) {
      query = query.where(eq(staffPayrollRecords.payrollPeriod, filters.payrollPeriod));
    }
    if (filters?.paymentStatus) {
      query = query.where(eq(staffPayrollRecords.paymentStatus, filters.paymentStatus));
    }
    if (filters?.year) {
      query = query.where(eq(staffPayrollRecords.payrollYear, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(staffPayrollRecords.payrollMonth, filters.month));
    }

    return query.orderBy(desc(staffPayrollRecords.payrollYear), desc(staffPayrollRecords.payrollMonth));
  }

  // Update staff payroll record
  async updateStaffPayrollRecord(id: number, updates: Partial<InsertStaffPayrollRecord>): Promise<StaffPayrollRecord | undefined> {
    const [updated] = await db
      .update(staffPayrollRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(staffPayrollRecords.id, id))
      .returning();
    return updated;
  }

  // Mark payroll as paid
  async markPayrollAsPaid(id: number, adminId: string, paymentDetails: {
    paymentMethod: string;
    paymentReference?: string;
    paymentSlipUrl?: string;
    notes?: string;
  }): Promise<StaffPayrollRecord | undefined> {
    const [updated] = await db
      .update(staffPayrollRecords)
      .set({
        paymentStatus: 'paid',
        paymentDate: new Date(),
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        paymentSlipUrl: paymentDetails.paymentSlipUrl,
        processedBy: adminId,
        notes: paymentDetails.notes,
        updatedAt: new Date(),
      })
      .where(eq(staffPayrollRecords.id, id))
      .returning();
    return updated;
  }

  // Get staff payroll summary
  async getStaffPayrollSummary(organizationId: string, staffId: string, year?: number): Promise<{
    totalPaid: number;
    totalPending: number;
    averageMonthly: number;
    latestPayment?: StaffPayrollRecord;
  }> {
    let query = db
      .select()
      .from(staffPayrollRecords)
      .where(and(
        eq(staffPayrollRecords.organizationId, organizationId),
        eq(staffPayrollRecords.staffId, staffId)
      ));

    if (year) {
      query = query.where(eq(staffPayrollRecords.payrollYear, year));
    }

    const records = await query;
    
    const totalPaid = records
      .filter(r => r.paymentStatus === 'paid')
      .reduce((sum, r) => sum + parseFloat(r.netPay), 0);
    
    const totalPending = records
      .filter(r => r.paymentStatus === 'pending')
      .reduce((sum, r) => sum + parseFloat(r.netPay), 0);
    
    const averageMonthly = records.length > 0 ? totalPaid / records.length : 0;
    
    const latestPayment = records
      .filter(r => r.paymentStatus === 'paid')
      .sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime())[0];

    return {
      totalPaid,
      totalPending,
      averageMonthly,
      latestPayment,
    };
  }

  // ===== PORTFOLIO MANAGER COMMISSION TRACKING =====

  // Create portfolio manager commission record
  async createPortfolioManagerCommission(commission: InsertPortfolioManagerCommission): Promise<PortfolioManagerCommission> {
    const [newCommission] = await db.insert(portfolioManagerCommissions).values(commission).returning();
    return newCommission;
  }

  // Get portfolio manager commissions
  async getPortfolioManagerCommissions(organizationId: string, managerId?: string, filters?: {
    year?: number;
    month?: number;
    payoutStatus?: string;
  }): Promise<PortfolioManagerCommission[]> {
    let query = db
      .select()
      .from(portfolioManagerCommissions)
      .where(eq(portfolioManagerCommissions.organizationId, organizationId));

    if (managerId) {
      query = query.where(eq(portfolioManagerCommissions.managerId, managerId));
    }
    if (filters?.year) {
      query = query.where(eq(portfolioManagerCommissions.commissionYear, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(portfolioManagerCommissions.commissionMonth, filters.month));
    }
    if (filters?.payoutStatus) {
      query = query.where(eq(portfolioManagerCommissions.payoutStatus, filters.payoutStatus));
    }

    return query.orderBy(desc(portfolioManagerCommissions.commissionYear), desc(portfolioManagerCommissions.commissionMonth));
  }

  // Request portfolio manager payout
  async requestPortfolioManagerPayout(commissionId: number): Promise<PortfolioManagerCommission | undefined> {
    const [updated] = await db
      .update(portfolioManagerCommissions)
      .set({
        payoutStatus: 'pending',
        payoutRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(portfolioManagerCommissions.id, commissionId))
      .returning();
    return updated;
  }

  // Approve portfolio manager payout
  async approvePortfolioManagerPayout(commissionId: number, adminId: string, notes?: string): Promise<PortfolioManagerCommission | undefined> {
    const [updated] = await db
      .update(portfolioManagerCommissions)
      .set({
        payoutStatus: 'approved',
        payoutApprovedAt: new Date(),
        approvedBy: adminId,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(portfolioManagerCommissions.id, commissionId))
      .returning();
    return updated;
  }

  // Generate invoice for portfolio manager commission
  async generatePortfolioManagerInvoice(commissionId: number, invoiceNumber: string, invoicePdfUrl: string): Promise<PortfolioManagerCommission | undefined> {
    const [updated] = await db
      .update(portfolioManagerCommissions)
      .set({
        invoiceGenerated: true,
        invoiceNumber,
        invoicePdfUrl,
        updatedAt: new Date(),
      })
      .where(eq(portfolioManagerCommissions.id, commissionId))
      .returning();
    return updated;
  }

  // ===== REFERRAL AGENT COMMISSION LOGS =====

  // Create referral agent commission log
  async createReferralAgentCommissionLog(log: InsertReferralAgentCommissionLog): Promise<ReferralAgentCommissionLog> {
    const [newLog] = await db.insert(referralAgentCommissionLogs).values(log).returning();
    return newLog;
  }

  // Get referral agent commission logs
  async getReferralAgentCommissionLogs(organizationId: string, agentId?: string, filters?: {
    year?: number;
    month?: number;
    propertyId?: number;
    paymentStatus?: string;
  }): Promise<ReferralAgentCommissionLog[]> {
    let query = db
      .select()
      .from(referralAgentCommissionLogs)
      .where(eq(referralAgentCommissionLogs.organizationId, organizationId));

    if (agentId) {
      query = query.where(eq(referralAgentCommissionLogs.agentId, agentId));
    }
    if (filters?.year) {
      query = query.where(eq(referralAgentCommissionLogs.commissionYear, filters.year));
    }
    if (filters?.month) {
      query = query.where(eq(referralAgentCommissionLogs.commissionMonth, filters.month));
    }
    if (filters?.propertyId) {
      query = query.where(eq(referralAgentCommissionLogs.propertyId, filters.propertyId));
    }
    if (filters?.paymentStatus) {
      query = query.where(eq(referralAgentCommissionLogs.paymentStatus, filters.paymentStatus));
    }

    return query.orderBy(desc(referralAgentCommissionLogs.commissionYear), desc(referralAgentCommissionLogs.commissionMonth));
  }

  // Request referral agent payment
  async requestReferralAgentPayment(logId: number): Promise<ReferralAgentCommissionLog | undefined> {
    const [updated] = await db
      .update(referralAgentCommissionLogs)
      .set({
        paymentStatus: 'requested',
        paymentRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(referralAgentCommissionLogs.id, logId))
      .returning();
    return updated;
  }

  // Confirm referral agent payment
  async confirmReferralAgentPayment(logId: number, adminId: string, paymentSlipUrl?: string, notes?: string): Promise<ReferralAgentCommissionLog | undefined> {
    const [updated] = await db
      .update(referralAgentCommissionLogs)
      .set({
        paymentStatus: 'paid',
        paymentConfirmedAt: new Date(),
        paymentSlipUrl,
        processedBy: adminId,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(referralAgentCommissionLogs.id, logId))
      .returning();
    return updated;
  }

  // ===== UNIVERSAL INVOICE GENERATOR =====

  // Create universal invoice
  async createUniversalInvoice(invoice: InsertUniversalInvoice): Promise<UniversalInvoice> {
    const [newInvoice] = await db.insert(universalInvoices).values(invoice).returning();
    return newInvoice;
  }

  // Add line items to invoice
  async addInvoiceLineItems(lineItems: InsertUniversalInvoiceLineItem[]): Promise<UniversalInvoiceLineItem[]> {
    const newItems = await db.insert(universalInvoiceLineItems).values(lineItems).returning();
    return newItems;
  }

  // Get universal invoices with line items
  async getUniversalInvoices(organizationId: string, filters?: {
    createdBy?: string;
    invoiceType?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<(UniversalInvoice & { lineItems: UniversalInvoiceLineItem[] })[]> {
    let query = db
      .select()
      .from(universalInvoices)
      .where(eq(universalInvoices.organizationId, organizationId));

    if (filters?.createdBy) {
      query = query.where(eq(universalInvoices.createdBy, filters.createdBy));
    }
    if (filters?.invoiceType) {
      query = query.where(eq(universalInvoices.invoiceType, filters.invoiceType));
    }
    if (filters?.status) {
      query = query.where(eq(universalInvoices.status, filters.status));
    }
    if (filters?.fromDate) {
      query = query.where(gte(universalInvoices.invoiceDate, filters.fromDate));
    }
    if (filters?.toDate) {
      query = query.where(lte(universalInvoices.invoiceDate, filters.toDate));
    }

    const invoices = await query.orderBy(desc(universalInvoices.createdAt));

    // Get line items for each invoice
    const invoicesWithLineItems = await Promise.all(
      invoices.map(async (invoice) => {
        const lineItems = await db
          .select()
          .from(universalInvoiceLineItems)
          .where(eq(universalInvoiceLineItems.invoiceId, invoice.id));
        
        return { ...invoice, lineItems };
      })
    );

    return invoicesWithLineItems;
  }

  // Update universal invoice
  async updateUniversalInvoice(id: number, updates: Partial<InsertUniversalInvoice>): Promise<UniversalInvoice | undefined> {
    const [updated] = await db
      .update(universalInvoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(universalInvoices.id, id))
      .returning();
    return updated;
  }

  // Generate invoice number
  async generateInvoiceNumber(organizationId: string, type: string): Promise<string> {
    const year = new Date().getFullYear();
    const typePrefix = type.toUpperCase().substr(0, 3);
    
    // Get count of invoices this year
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(universalInvoices)
      .where(and(
        eq(universalInvoices.organizationId, organizationId),
        like(universalInvoices.invoiceNumber, `${typePrefix}-${year}-%`)
      ));

    const nextNumber = (count[0]?.count || 0) + 1;
    return `${typePrefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  // ===== PAYMENT CONFIRMATIONS =====

  // Create payment confirmation
  async createPaymentConfirmation(confirmation: InsertPaymentConfirmation): Promise<PaymentConfirmation> {
    const [newConfirmation] = await db.insert(paymentConfirmations).values(confirmation).returning();
    return newConfirmation;
  }

  // Get payment confirmations
  async getPaymentConfirmations(organizationId: string, filters?: {
    paymentType?: string;
    referenceEntityType?: string;
    referenceEntityId?: number;
    confirmationStatus?: string;
  }): Promise<PaymentConfirmation[]> {
    let query = db
      .select()
      .from(paymentConfirmations)
      .where(eq(paymentConfirmations.organizationId, organizationId));

    if (filters?.paymentType) {
      query = query.where(eq(paymentConfirmations.paymentType, filters.paymentType));
    }
    if (filters?.referenceEntityType) {
      query = query.where(eq(paymentConfirmations.referenceEntityType, filters.referenceEntityType));
    }
    if (filters?.referenceEntityId) {
      query = query.where(eq(paymentConfirmations.referenceEntityId, filters.referenceEntityId));
    }
    if (filters?.confirmationStatus) {
      query = query.where(eq(paymentConfirmations.confirmationStatus, filters.confirmationStatus));
    }

    return query.orderBy(desc(paymentConfirmations.createdAt));
  }

  // Confirm payment
  async confirmPayment(confirmationId: number, userId: string): Promise<PaymentConfirmation | undefined> {
    const [updated] = await db
      .update(paymentConfirmations)
      .set({
        confirmationStatus: 'confirmed',
        confirmedBy: userId,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentConfirmations.id, confirmationId))
      .returning();
    return updated;
  }

  // ===== FINANCIAL DASHBOARD ANALYTICS =====

  // Get staff salary analytics
  async getStaffSalaryAnalytics(organizationId: string): Promise<{
    totalMonthlyPayroll: number;
    totalPendingPayments: number;
    staffCount: number;
    averageSalary: number;
    departmentBreakdown: { department: string; totalSalary: number; staffCount: number }[];
  }> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get current month payroll
    const currentPayroll = await db
      .select()
      .from(staffPayrollRecords)
      .where(and(
        eq(staffPayrollRecords.organizationId, organizationId),
        eq(staffPayrollRecords.payrollYear, currentYear),
        eq(staffPayrollRecords.payrollMonth, currentMonth)
      ));

    const totalMonthlyPayroll = currentPayroll.reduce((sum, record) => sum + parseFloat(record.netPay), 0);
    const totalPendingPayments = currentPayroll
      .filter(record => record.paymentStatus === 'pending')
      .reduce((sum, record) => sum + parseFloat(record.netPay), 0);

    const staffCount = new Set(currentPayroll.map(record => record.staffId)).size;
    const averageSalary = staffCount > 0 ? totalMonthlyPayroll / staffCount : 0;

    // Department breakdown would require joining with user data for department info
    const departmentBreakdown: { department: string; totalSalary: number; staffCount: number }[] = [];

    return {
      totalMonthlyPayroll,
      totalPendingPayments,
      staffCount,
      averageSalary,
      departmentBreakdown,
    };
  }

  // Get commission analytics
  async getCommissionAnalytics(organizationId: string): Promise<{
    totalCommissionsPending: number;
    totalCommissionsPaid: number;
    portfolioManagerEarnings: number;
    referralAgentEarnings: number;
    monthlyGrowth: number;
  }> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Portfolio Manager commissions
    const pmCommissions = await db
      .select()
      .from(portfolioManagerCommissions)
      .where(and(
        eq(portfolioManagerCommissions.organizationId, organizationId),
        eq(portfolioManagerCommissions.commissionYear, currentYear),
        eq(portfolioManagerCommissions.commissionMonth, currentMonth)
      ));

    // Referral Agent commissions
    const raCommissions = await db
      .select()
      .from(referralAgentCommissionLogs)
      .where(and(
        eq(referralAgentCommissionLogs.organizationId, organizationId),
        eq(referralAgentCommissionLogs.commissionYear, currentYear),
        eq(referralAgentCommissionLogs.commissionMonth, currentMonth)
      ));

    const portfolioManagerEarnings = pmCommissions.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);
    const referralAgentEarnings = raCommissions.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);

    const totalCommissionsPending = pmCommissions
      .filter(comm => comm.payoutStatus === 'pending')
      .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0) +
      raCommissions
        .filter(comm => comm.paymentStatus === 'pending')
        .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);

    const totalCommissionsPaid = pmCommissions
      .filter(comm => comm.payoutStatus === 'paid')
      .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0) +
      raCommissions
        .filter(comm => comm.paymentStatus === 'paid')
        .reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0);

    // Calculate monthly growth (simplified)
    const monthlyGrowth = 5.2; // This would need more complex calculation

    return {
      totalCommissionsPending,
      totalCommissionsPaid,
      portfolioManagerEarnings,
      referralAgentEarnings,
      monthlyGrowth,
    };
  }

  // ===== LIVE BOOKING CALENDAR SYSTEM =====

  // Create booking entry
  async createBookingEntry(booking: InsertLiveBookingCalendar): Promise<LiveBookingCalendar> {
    const [newBooking] = await db.insert(liveBookingCalendar).values(booking).returning();
    return newBooking;
  }

  // Get bookings for calendar view
  async getBookingCalendar(organizationId: string, filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    bookingStatus?: string;
    bookingSource?: string;
  }): Promise<LiveBookingCalendar[]> {
    let query = db
      .select()
      .from(liveBookingCalendar)
      .where(eq(liveBookingCalendar.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(liveBookingCalendar.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      query = query.where(gte(liveBookingCalendar.checkInDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(liveBookingCalendar.checkOutDate, filters.endDate));
    }
    if (filters?.bookingStatus) {
      query = query.where(eq(liveBookingCalendar.bookingStatus, filters.bookingStatus));
    }
    if (filters?.bookingSource) {
      query = query.where(eq(liveBookingCalendar.bookingSource, filters.bookingSource));
    }

    return query.orderBy(asc(liveBookingCalendar.checkInDate));
  }

  // Get upcoming bookings for a property
  async getUpcomingBookings(organizationId: string, propertyId: number, days: number = 30): Promise<LiveBookingCalendar[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureString = futureDate.toISOString().split('T')[0];

    return db
      .select()
      .from(liveBookingCalendar)
      .where(
        and(
          eq(liveBookingCalendar.organizationId, organizationId),
          eq(liveBookingCalendar.propertyId, propertyId),
          gte(liveBookingCalendar.checkInDate, today),
          lte(liveBookingCalendar.checkInDate, futureString),
          eq(liveBookingCalendar.bookingStatus, 'confirmed')
        )
      )
      .orderBy(asc(liveBookingCalendar.checkInDate));
  }

  // Update booking from API sync
  async updateBookingFromAPI(externalBookingId: string, updateData: Partial<InsertLiveBookingCalendar>): Promise<LiveBookingCalendar | undefined> {
    const [updated] = await db
      .update(liveBookingCalendar)
      .set({
        ...updateData,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(liveBookingCalendar.externalBookingId, externalBookingId))
      .returning();
    return updated;
  }

  // Get booking analytics for dashboard
  async getBookingAnalytics(organizationId: string, propertyId?: number): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    averageStayDuration: number;
    platformBreakdown: { platform: string; bookings: number; revenue: number }[];
  }> {
    let query = db
      .select()
      .from(liveBookingCalendar)
      .where(eq(liveBookingCalendar.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(liveBookingCalendar.propertyId, propertyId));
    }

    const bookings = await query;

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
    const averageStayDuration = bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + b.nightCount, 0) / bookings.length 
      : 0;

    // Calculate platform breakdown
    const platformBreakdown = Object.entries(
      bookings.reduce((acc, booking) => {
        const platform = booking.bookingSource;
        if (!acc[platform]) {
          acc[platform] = { bookings: 0, revenue: 0 };
        }
        acc[platform].bookings++;
        acc[platform].revenue += parseFloat(booking.totalAmount);
        return acc;
      }, {} as Record<string, { bookings: number; revenue: number }>)
    ).map(([platform, data]) => ({ platform, ...data }));

    // Calculate occupancy rate (simplified)
    const occupancyRate = confirmedBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

    return {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      occupancyRate,
      averageStayDuration,
      platformBreakdown,
    };
  }

  // ===== PROPERTY AVAILABILITY MANAGEMENT =====

  // Create availability entry
  async createPropertyAvailability(availability: InsertPropertyAvailability): Promise<PropertyAvailability> {
    const [newAvailability] = await db.insert(propertyAvailability).values(availability).returning();
    return newAvailability;
  }

  // Get property availability
  async getPropertyAvailability(organizationId: string, filters?: {
    propertyId?: number;
    startDate?: string;
    endDate?: string;
    availabilityType?: string;
  }): Promise<PropertyAvailability[]> {
    let query = db
      .select()
      .from(propertyAvailability)
      .where(eq(propertyAvailability.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(propertyAvailability.propertyId, filters.propertyId));
    }
    if (filters?.startDate) {
      query = query.where(gte(propertyAvailability.startDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(propertyAvailability.endDate, filters.endDate));
    }
    if (filters?.availabilityType) {
      query = query.where(eq(propertyAvailability.availabilityType, filters.availabilityType));
    }

    return query.orderBy(asc(propertyAvailability.startDate));
  }

  // Check if property is available for dates
  async checkPropertyAvailability(propertyId: number, checkIn: string, checkOut: string): Promise<boolean> {
    // Check for existing bookings
    const existingBookings = await db
      .select()
      .from(liveBookingCalendar)
      .where(
        and(
          eq(liveBookingCalendar.propertyId, propertyId),
          eq(liveBookingCalendar.bookingStatus, 'confirmed'),
          or(
            and(
              gte(liveBookingCalendar.checkInDate, checkIn),
              lt(liveBookingCalendar.checkInDate, checkOut)
            ),
            and(
              gt(liveBookingCalendar.checkOutDate, checkIn),
              lte(liveBookingCalendar.checkOutDate, checkOut)
            ),
            and(
              lte(liveBookingCalendar.checkInDate, checkIn),
              gte(liveBookingCalendar.checkOutDate, checkOut)
            )
          )
        )
      );

    // Check for blocked dates
    const blockedDates = await db
      .select()
      .from(propertyAvailability)
      .where(
        and(
          eq(propertyAvailability.propertyId, propertyId),
          eq(propertyAvailability.availabilityType, 'blocked'),
          or(
            and(
              gte(propertyAvailability.startDate, checkIn),
              lt(propertyAvailability.startDate, checkOut)
            ),
            and(
              gt(propertyAvailability.endDate, checkIn),
              lte(propertyAvailability.endDate, checkOut)
            ),
            and(
              lte(propertyAvailability.startDate, checkIn),
              gte(propertyAvailability.endDate, checkOut)
            )
          )
        )
      );

    return existingBookings.length === 0 && blockedDates.length === 0;
  }

  // ===== AGENT SEARCH AND PREFERENCES =====

  // Get/create agent search preferences
  async getAgentSearchPreferences(organizationId: string, agentId: string): Promise<AgentSearchPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(agentSearchPreferences)
      .where(
        and(
          eq(agentSearchPreferences.organizationId, organizationId),
          eq(agentSearchPreferences.agentId, agentId)
        )
      );
    return preferences;
  }

  async updateAgentSearchPreferences(organizationId: string, agentId: string, preferences: Partial<InsertAgentSearchPreferences>): Promise<AgentSearchPreferences> {
    const existing = await this.getAgentSearchPreferences(organizationId, agentId);
    
    if (existing) {
      const [updated] = await db
        .update(agentSearchPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(agentSearchPreferences.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(agentSearchPreferences)
        .values({ organizationId, agentId, ...preferences })
        .returning();
      return created;
    }
  }

  // ===== PROPERTY SEARCH INDEX FOR AGENTS =====

  // Get available properties for agent search
  async searchPropertiesForAgents(organizationId: string, filters?: {
    location?: string;
    zone?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    checkIn?: string;
    checkOut?: string;
    maxGuests?: number;
  }): Promise<PropertySearchIndex[]> {
    let query = db
      .select()
      .from(propertySearchIndex)
      .where(
        and(
          eq(propertySearchIndex.organizationId, organizationId),
          eq(propertySearchIndex.isActive, true)
        )
      );

    if (filters?.location) {
      query = query.where(eq(propertySearchIndex.province, filters.location));
    }
    if (filters?.zone) {
      query = query.where(eq(propertySearchIndex.zone, filters.zone));
    }
    if (filters?.minBedrooms) {
      query = query.where(gte(propertySearchIndex.bedrooms, filters.minBedrooms));
    }
    if (filters?.maxBedrooms) {
      query = query.where(lte(propertySearchIndex.bedrooms, filters.maxBedrooms));
    }
    if (filters?.minPrice) {
      query = query.where(gte(propertySearchIndex.baseNightlyRate, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      query = query.where(lte(propertySearchIndex.baseNightlyRate, filters.maxPrice.toString()));
    }
    if (filters?.maxGuests) {
      query = query.where(gte(propertySearchIndex.maxGuests, filters.maxGuests));
    }

    const results = await query.orderBy(desc(propertySearchIndex.popularityScore));

    // If date range is provided, filter by availability
    if (filters?.checkIn && filters?.checkOut) {
      const availableProperties = [];
      for (const property of results) {
        const isAvailable = await this.checkPropertyAvailability(property.propertyId, filters.checkIn, filters.checkOut);
        if (isAvailable) {
          availableProperties.push(property);
        }
      }
      return availableProperties;
    }

    return results;
  }

  // Create/update property search index
  async updatePropertySearchIndex(propertyId: number, indexData: Partial<InsertPropertySearchIndex>): Promise<PropertySearchIndex> {
    const existing = await db
      .select()
      .from(propertySearchIndex)
      .where(eq(propertySearchIndex.propertyId, propertyId));

    if (existing.length > 0) {
      const [updated] = await db
        .update(propertySearchIndex)
        .set({ ...indexData, lastIndexedAt: new Date() })
        .where(eq(propertySearchIndex.propertyId, propertyId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(propertySearchIndex)
        .values({ propertyId, ...indexData })
        .returning();
      return created;
    }
  }

  // ===== AGENT BOOKING ENQUIRIES =====

  // Create booking enquiry
  async createBookingEnquiry(enquiry: InsertAgentBookingEnquiries): Promise<AgentBookingEnquiries> {
    const [newEnquiry] = await db.insert(agentBookingEnquiries).values(enquiry).returning();
    return newEnquiry;
  }

  // Get agent booking enquiries
  async getAgentBookingEnquiries(organizationId: string, filters?: {
    agentId?: string;
    propertyId?: number;
    enquiryStatus?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<AgentBookingEnquiries[]> {
    let query = db
      .select()
      .from(agentBookingEnquiries)
      .where(eq(agentBookingEnquiries.organizationId, organizationId));

    if (filters?.agentId) {
      query = query.where(eq(agentBookingEnquiries.agentId, filters.agentId));
    }
    if (filters?.propertyId) {
      query = query.where(eq(agentBookingEnquiries.propertyId, filters.propertyId));
    }
    if (filters?.enquiryStatus) {
      query = query.where(eq(agentBookingEnquiries.enquiryStatus, filters.enquiryStatus));
    }
    if (filters?.dateRange) {
      query = query.where(
        and(
          gte(agentBookingEnquiries.requestedCheckIn, filters.dateRange.start.toISOString().split('T')[0]),
          lte(agentBookingEnquiries.requestedCheckOut, filters.dateRange.end.toISOString().split('T')[0])
        )
      );
    }

    return query.orderBy(desc(agentBookingEnquiries.createdAt));
  }

  // Update enquiry status
  async updateEnquiryStatus(enquiryId: number, status: string, processedBy?: string): Promise<AgentBookingEnquiries | undefined> {
    const [updated] = await db
      .update(agentBookingEnquiries)
      .set({
        enquiryStatus: status,
        processedBy,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentBookingEnquiries.id, enquiryId))
      .returning();
    return updated;
  }

  // Convert enquiry to booking
  async convertEnquiryToBooking(enquiryId: number, bookingData: InsertLiveBookingCalendar): Promise<{ enquiry: AgentBookingEnquiries; booking: LiveBookingCalendar }> {
    const booking = await this.createBookingEntry(bookingData);
    
    const [updatedEnquiry] = await db
      .update(agentBookingEnquiries)
      .set({
        convertedToBooking: true,
        bookingId: booking.id,
        conversionDate: new Date(),
        enquiryStatus: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(agentBookingEnquiries.id, enquiryId))
      .returning();

    return { enquiry: updatedEnquiry, booking };
  }

  // ===== BOOKING PLATFORM SYNC =====

  // Create/update platform sync configuration
  async updateBookingPlatformSync(organizationId: string, syncData: Partial<InsertBookingPlatformSync>): Promise<BookingPlatformSync> {
    const existing = await db
      .select()
      .from(bookingPlatformSync)
      .where(
        and(
          eq(bookingPlatformSync.organizationId, organizationId),
          eq(bookingPlatformSync.platformName, syncData.platformName!)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(bookingPlatformSync)
        .set({ ...syncData, updatedAt: new Date() })
        .where(eq(bookingPlatformSync.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(bookingPlatformSync)
        .values({ organizationId, ...syncData })
        .returning();
      return created;
    }
  }

  // Get platform sync configurations
  async getBookingPlatformSyncs(organizationId: string, isActive?: boolean): Promise<BookingPlatformSync[]> {
    let query = db
      .select()
      .from(bookingPlatformSync)
      .where(eq(bookingPlatformSync.organizationId, organizationId));

    if (isActive !== undefined) {
      query = query.where(eq(bookingPlatformSync.isActive, isActive));
    }

    return query.orderBy(asc(bookingPlatformSync.platformName));
  }

  // Update sync status
  async updateSyncStatus(syncId: number, status: string, error?: string): Promise<BookingPlatformSync | undefined> {
    const [updated] = await db
      .update(bookingPlatformSync)
      .set({
        syncStatus: status,
        lastSyncAt: new Date(),
        lastError: error || null,
        errorCount: error ? sql`${bookingPlatformSync.errorCount} + 1` : 0,
        updatedAt: new Date(),
      })
      .where(eq(bookingPlatformSync.id, syncId))
      .returning();
    return updated;
  }

  // ===== OCCUPANCY ANALYTICS =====

  // Create/update occupancy analytics
  async updateOccupancyAnalytics(analytics: InsertPropertyOccupancyAnalytics): Promise<PropertyOccupancyAnalytics> {
    const existing = await db
      .select()
      .from(propertyOccupancyAnalytics)
      .where(
        and(
          eq(propertyOccupancyAnalytics.propertyId, analytics.propertyId!),
          eq(propertyOccupancyAnalytics.periodType, analytics.periodType!),
          eq(propertyOccupancyAnalytics.periodDate, analytics.periodDate!)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(propertyOccupancyAnalytics)
        .set({ ...analytics, calculatedAt: new Date() })
        .where(eq(propertyOccupancyAnalytics.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(propertyOccupancyAnalytics)
        .values(analytics)
        .returning();
      return created;
    }
  }

  // Get occupancy analytics
  async getOccupancyAnalytics(organizationId: string, filters?: {
    propertyId?: number;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PropertyOccupancyAnalytics[]> {
    let query = db
      .select()
      .from(propertyOccupancyAnalytics)
      .where(eq(propertyOccupancyAnalytics.organizationId, organizationId));

    if (filters?.propertyId) {
      query = query.where(eq(propertyOccupancyAnalytics.propertyId, filters.propertyId));
    }
    if (filters?.periodType) {
      query = query.where(eq(propertyOccupancyAnalytics.periodType, filters.periodType));
    }
    if (filters?.startDate) {
      query = query.where(gte(propertyOccupancyAnalytics.periodDate, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(propertyOccupancyAnalytics.periodDate, filters.endDate));
    }

    return query.orderBy(desc(propertyOccupancyAnalytics.periodDate));
  }
  // ===== GUEST PORTAL INTERFACE METHODS =====
  
  // Guest Portal Sessions
  async createGuestPortalSession(session: InsertGuestPortalSession): Promise<GuestPortalSession> {
    const [newSession] = await db.insert(guestPortalSessions).values(session).returning();
    return newSession;
  }

  async getGuestPortalSession(accessToken: string): Promise<GuestPortalSession | undefined> {
    const [session] = await db
      .select()
      .from(guestPortalSessions)
      .where(and(
        eq(guestPortalSessions.accessToken, accessToken),
        eq(guestPortalSessions.isActive, true),
        gte(guestPortalSessions.expiresAt, new Date())
      ));
    return session;
  }

  async updateGuestPortalSessionActivity(accessToken: string): Promise<void> {
    await db
      .update(guestPortalSessions)
      .set({ lastAccessed: new Date() })
      .where(eq(guestPortalSessions.accessToken, accessToken));
  }

  async getGuestBookingOverview(guestSessionId: number): Promise<{
    upcomingStays: any[];
    currentStay: any;
    pastStays: any[];
  }> {
    const session = await db
      .select()
      .from(guestPortalSessions)
      .where(eq(guestPortalSessions.id, guestSessionId))
      .limit(1);
    
    if (!session[0]) {
      return { upcomingStays: [], currentStay: null, pastStays: [] };
    }

    const currentDate = new Date();
    const checkInDate = session[0].checkInDate;
    const checkOutDate = session[0].checkOutDate;
    
    // Determine if current stay
    const isCurrentStay = currentDate >= checkInDate && currentDate <= checkOutDate;
    
    return {
      upcomingStays: isCurrentStay ? [] : [session[0]],
      currentStay: isCurrentStay ? session[0] : null,
      pastStays: currentDate > checkOutDate ? [session[0]] : []
    };
  }

  // Guest Activity Timeline
  async getGuestActivityTimeline(guestSessionId: number): Promise<GuestActivityTimeline[]> {
    return await db
      .select()
      .from(guestActivityTimeline)
      .where(and(
        eq(guestActivityTimeline.guestSessionId, guestSessionId),
        eq(guestActivityTimeline.isVisible, true)
      ))
      .orderBy(desc(guestActivityTimeline.requestedAt));
  }

  async createGuestActivityRecord(activity: InsertGuestActivityTimeline): Promise<GuestActivityTimeline> {
    const [newActivity] = await db.insert(guestActivityTimeline).values(activity).returning();
    return newActivity;
  }

  async updateGuestActivityStatus(id: number, status: string, completedAt?: Date): Promise<GuestActivityTimeline | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (completedAt) updateData.completedAt = completedAt;
    
    const [updated] = await db
      .update(guestActivityTimeline)
      .set(updateData)
      .where(eq(guestActivityTimeline.id, id))
      .returning();
    return updated;
  }

  // Guest Chat & AI Operations
  async getGuestChatMessages(guestSessionId: number, limit: number = 50): Promise<GuestChatMessage[]> {
    return await db
      .select()
      .from(guestChatMessages)
      .where(eq(guestChatMessages.guestSessionId, guestSessionId))
      .orderBy(desc(guestChatMessages.sentAt))
      .limit(limit);
  }

  async createGuestChatMessage(message: InsertGuestChatMessage): Promise<GuestChatMessage> {
    const [newMessage] = await db.insert(guestChatMessages).values(message).returning();
    return newMessage;
  }

  async processGuestMessageWithAI(messageId: number): Promise<{
    detectedIssue: string | null;
    severity: string | null;
    autoCreatedTaskId: number | null;
    aiResponse: string | null;
  }> {
    // This is a placeholder for AI processing logic
    // In production, this would integrate with OpenAI or similar service
    const [message] = await db
      .select()
      .from(guestChatMessages)
      .where(eq(guestChatMessages.id, messageId));
    
    if (!message) {
      return { detectedIssue: null, severity: null, autoCreatedTaskId: null, aiResponse: null };
    }

    // Simple keyword detection (to be replaced with AI)
    const content = message.messageContent.toLowerCase();
    let detectedIssue: string | null = null;
    let severity: string | null = null;
    let aiResponse = "Thank you for your message. Our team will respond shortly.";

    if (content.includes('broken') || content.includes('not working') || content.includes('problem')) {
      detectedIssue = 'maintenance';
      severity = content.includes('urgent') || content.includes('emergency') ? 'urgent' : 'medium';
      aiResponse = "I understand there's a maintenance issue. I've notified our team and they'll address this shortly.";
    } else if (content.includes('dirty') || content.includes('clean')) {
      detectedIssue = 'cleaning';
      severity = 'medium';
      aiResponse = "I'll arrange for additional cleaning service right away.";
    }

    // Update message with AI processing results
    await db
      .update(guestChatMessages)
      .set({
        aiProcessed: true,
        detectedIssue,
        issueSeverity: severity,
        requiresStaffResponse: detectedIssue !== null
      })
      .where(eq(guestChatMessages.id, messageId));

    return { detectedIssue, severity, autoCreatedTaskId: null, aiResponse };
  }

  async getGuestAiFaqResponses(organizationId: string, propertyId?: number): Promise<GuestAiFaqKnowledge[]> {
    const conditions = [eq(guestAiFaqKnowledge.organizationId, organizationId)];
    
    if (propertyId) {
      conditions.push(eq(guestAiFaqKnowledge.propertyId, propertyId));
    }
    
    return await db
      .select()
      .from(guestAiFaqKnowledge)
      .where(and(...conditions))
      .orderBy(desc(guestAiFaqKnowledge.priority));
  }

  // Guest Add-On Service Requests
  async getAvailableAddonServices(organizationId: string, propertyId: number): Promise<GuestAddonService[]> {
    return await db
      .select()
      .from(guestAddonServices)
      .where(and(
        eq(guestAddonServices.organizationId, organizationId),
        eq(guestAddonServices.isActive, true)
      ))
      .orderBy(asc(guestAddonServices.serviceName));
  }

  async createGuestAddonServiceRequest(request: InsertGuestAddonServiceRequest): Promise<GuestAddonServiceRequest> {
    const [newRequest] = await db.insert(guestAddonServiceRequests).values(request).returning();
    return newRequest;
  }

  async getGuestAddonServiceRequests(guestSessionId: number): Promise<GuestAddonServiceRequest[]> {
    return await db
      .select()
      .from(guestAddonServiceRequests)
      .where(eq(guestAddonServiceRequests.guestSessionId, guestSessionId))
      .orderBy(desc(guestAddonServiceRequests.createdAt));
  }

  async updateAddonServiceRequestStatus(id: number, status: string, confirmedBy?: string): Promise<GuestAddonServiceRequest | undefined> {
    const updateData: any = { requestStatus: status, updatedAt: new Date() };
    if (confirmedBy) {
      updateData.confirmedBy = confirmedBy;
      updateData.confirmedAt = new Date();
    }
    
    const [updated] = await db
      .update(guestAddonServiceRequests)
      .set(updateData)
      .where(eq(guestAddonServiceRequests.id, id))
      .returning();
    return updated;
  }

  async completeAddonServiceRequest(id: number, completionNotes: string, rating?: number, review?: string): Promise<GuestAddonServiceRequest | undefined> {
    const updateData: any = {
      requestStatus: 'completed',
      completedAt: new Date(),
      completionNotes,
      updatedAt: new Date()
    };
    
    if (rating) updateData.guestRating = rating;
    if (review) updateData.guestReview = review;
    
    const [updated] = await db
      .update(guestAddonServiceRequests)
      .set(updateData)
      .where(eq(guestAddonServiceRequests.id, id))
      .returning();
    return updated;
  }

  // Guest Property Local Information
  async getGuestPropertyLocalInfo(propertyId: number, locationType?: string): Promise<GuestPropertyLocalInfo[]> {
    const conditions = [
      eq(guestPropertyLocalInfo.propertyId, propertyId),
      eq(guestPropertyLocalInfo.isActive, true)
    ];
    
    if (locationType) {
      conditions.push(eq(guestPropertyLocalInfo.locationType, locationType));
    }
    
    return await db
      .select()
      .from(guestPropertyLocalInfo)
      .where(and(...conditions))
      .orderBy(asc(guestPropertyLocalInfo.displayOrder), desc(guestPropertyLocalInfo.recommendationScore));
  }

  async createPropertyLocalInfo(info: InsertGuestPropertyLocalInfo): Promise<GuestPropertyLocalInfo> {
    const [newInfo] = await db.insert(guestPropertyLocalInfo).values(info).returning();
    return newInfo;
  }

  async updatePropertyLocalInfo(id: number, info: Partial<InsertGuestPropertyLocalInfo>): Promise<GuestPropertyLocalInfo | undefined> {
    const [updated] = await db
      .update(guestPropertyLocalInfo)
      .set({ ...info, updatedAt: new Date() })
      .where(eq(guestPropertyLocalInfo.id, id))
      .returning();
    return updated;
  }

  // Guest Maintenance Reports
  async createGuestMaintenanceReport(report: InsertGuestMaintenanceReport): Promise<GuestMaintenanceReport> {
    const [newReport] = await db.insert(guestMaintenanceReports).values(report).returning();
    return newReport;
  }

  async getGuestMaintenanceReports(guestSessionId: number): Promise<GuestMaintenanceReport[]> {
    return await db
      .select()
      .from(guestMaintenanceReports)
      .where(eq(guestMaintenanceReports.guestSessionId, guestSessionId))
      .orderBy(desc(guestMaintenanceReports.reportedAt));
  }

  async updateMaintenanceReportStatus(id: number, status: string, assignedTo?: string): Promise<GuestMaintenanceReport | undefined> {
    const updateData: any = { reportStatus: status, updatedAt: new Date() };
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      updateData.assignedAt = new Date();
    }
    
    const [updated] = await db
      .update(guestMaintenanceReports)
      .set(updateData)
      .where(eq(guestMaintenanceReports.id, id))
      .returning();
    return updated;
  }

  async completeMaintenanceReport(id: number, resolutionNotes: string, images?: string[]): Promise<GuestMaintenanceReport | undefined> {
    const updateData: any = {
      reportStatus: 'resolved',
      actualResolutionTime: new Date(),
      resolutionNotes,
      updatedAt: new Date()
    };
    
    if (images) updateData.resolutionImages = images;
    
    const [updated] = await db
      .update(guestMaintenanceReports)
      .set(updateData)
      .where(eq(guestMaintenanceReports.id, id))
      .returning();
    return updated;
  }

  // Finance Engine Methods
  async getOwnerBalances(organizationId: string): Promise<any[]> {
    return await db.select({
      id: ownerBalances.id,
      ownerId: ownerBalances.ownerId,
      ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      currentBalance: ownerBalances.currentBalance,
      totalEarnings: ownerBalances.totalEarnings,
      totalExpenses: ownerBalances.totalExpenses,
      thisMonthEarnings: ownerBalances.thisMonthEarnings,
      thisMonthExpenses: ownerBalances.thisMonthExpenses,
      thisMonthNet: ownerBalances.thisMonthNet,
      lastCalculated: ownerBalances.lastCalculated,
    })
    .from(ownerBalances)
    .leftJoin(users, eq(users.id, ownerBalances.ownerId))
    .where(eq(ownerBalances.organizationId, organizationId));
  }

  async getOwnerPayoutRequests(organizationId: string): Promise<any[]> {
    return await db.select({
      id: ownerPayoutRequests.id,
      ownerId: ownerPayoutRequests.ownerId,
      ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      amount: ownerPayoutRequests.amount,
      currency: ownerPayoutRequests.currency,
      status: ownerPayoutRequests.status,
      requestNotes: ownerPayoutRequests.requestNotes,
      adminNotes: ownerPayoutRequests.adminNotes,
      transferMethod: ownerPayoutRequests.transferMethod,
      transferReference: ownerPayoutRequests.transferReference,
      transferReceiptUrl: ownerPayoutRequests.transferReceiptUrl,
      ownerConfirmed: ownerPayoutRequests.ownerConfirmed,
      requestedAt: ownerPayoutRequests.requestedAt,
      approvedAt: ownerPayoutRequests.approvedAt,
      transferredAt: ownerPayoutRequests.transferredAt,
      completedAt: ownerPayoutRequests.completedAt,
    })
    .from(ownerPayoutRequests)
    .leftJoin(users, eq(users.id, ownerPayoutRequests.ownerId))
    .where(eq(ownerPayoutRequests.organizationId, organizationId))
    .orderBy(desc(ownerPayoutRequests.requestedAt));
  }

  async createOwnerPayoutRequest(data: any): Promise<any> {
    const [payout] = await db.insert(ownerPayoutRequests).values(data).returning();
    return payout;
  }

  async updateOwnerPayoutRequest(id: number, data: any): Promise<any> {
    const [payout] = await db.update(ownerPayoutRequests)
      .set(data)
      .where(eq(ownerPayoutRequests.id, id))
      .returning();
    return payout;
  }

  async getOwnerChargeRequests(organizationId: string): Promise<any[]> {
    return await db.select({
      id: ownerChargeRequests.id,
      ownerId: ownerChargeRequests.ownerId,
      ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      chargedBy: ownerChargeRequests.chargedBy,
      amount: ownerChargeRequests.amount,
      currency: ownerChargeRequests.currency,
      reason: ownerChargeRequests.reason,
      description: ownerChargeRequests.description,
      status: ownerChargeRequests.status,
      paymentMethod: ownerChargeRequests.paymentMethod,
      paymentReference: ownerChargeRequests.paymentReference,
      chargedAt: ownerChargeRequests.chargedAt,
      paidAt: ownerChargeRequests.paidAt,
    })
    .from(ownerChargeRequests)
    .leftJoin(users, eq(users.id, ownerChargeRequests.ownerId))
    .where(eq(ownerChargeRequests.organizationId, organizationId))
    .orderBy(desc(ownerChargeRequests.chargedAt));
  }

  async createOwnerChargeRequest(data: any): Promise<any> {
    const [charge] = await db.insert(ownerChargeRequests).values(data).returning();
    return charge;
  }

  async getUtilityAccounts(organizationId: string): Promise<any[]> {
    try {
      return await db.select({
        id: propertyUtilityAccountsNew.id,
        propertyId: propertyUtilityAccountsNew.propertyId,
        propertyName: properties.name,
        utilityType: propertyUtilityAccountsNew.utilityType,
        providerName: propertyUtilityAccountsNew.providerName,
        accountNumber: propertyUtilityAccountsNew.accountNumber,
        expectedBillDate: propertyUtilityAccountsNew.expectedBillDate,
        averageMonthlyAmount: propertyUtilityAccountsNew.averageMonthlyAmount,
        autoRemindersEnabled: propertyUtilityAccountsNew.autoRemindersEnabled,
        isActive: propertyUtilityAccountsNew.isActive,
      })
      .from(propertyUtilityAccountsNew)
      .leftJoin(properties, eq(properties.id, propertyUtilityAccountsNew.propertyId))
      .where(eq(propertyUtilityAccountsNew.organizationId, organizationId));
    } catch (error) {
      console.error('Error fetching utility accounts:', error);
      return [];
    }
  }

  async createUtilityAccount(data: any): Promise<any> {
    const [account] = await db.insert(propertyUtilityAccountsNew).values(data).returning();
    return account;
  }

  async getRecurringServices(organizationId: string): Promise<any[]> {
    try {
      return await db.select({
        id: recurringServiceCharges.id,
        propertyId: recurringServiceCharges.propertyId,
        propertyName: properties.name,
        serviceName: recurringServiceCharges.serviceName,
        serviceCategory: recurringServiceCharges.serviceCategory,
        monthlyRate: recurringServiceCharges.monthlyRate,
        chargeAssignment: recurringServiceCharges.chargeAssignment,
        serviceFrequency: recurringServiceCharges.serviceFrequency,
        isActive: recurringServiceCharges.isActive,
        startDate: recurringServiceCharges.startDate,
        nextChargeDate: recurringServiceCharges.nextChargeDate,
      })
      .from(recurringServiceCharges)
      .leftJoin(properties, eq(properties.id, recurringServiceCharges.propertyId))
      .where(eq(recurringServiceCharges.organizationId, organizationId));
    } catch (error) {
      console.error('Error fetching recurring services:', error);
      return [];
    }
  }

  async createRecurringService(data: any): Promise<any> {
    const [service] = await db.insert(recurringServiceCharges).values(data).returning();
    return service;
  }

  async getFinancialTransactions(organizationId: string): Promise<any[]> {
    try {
      return await db.select()
        .from(financialTransactions)
        .where(eq(financialTransactions.organizationId, organizationId))
        .orderBy(desc(financialTransactions.createdAt));
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      return [];
    }
  }

  async createFinancialTransaction(data: any): Promise<any> {
    const [transaction] = await db.insert(financialTransactions).values(data).returning();
    return transaction;
  }

  async getOwnersForSelection(organizationId: string): Promise<any[]> {
    return await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(and(
      eq(users.organizationId, organizationId),
      eq(users.role, 'owner')
    ));
  }

  // ===== ENHANCED MAINTENANCE TASK SYSTEM METHODS =====

  // Task Checklists
  async getTaskChecklists(organizationId: string) {
    // Mock data for now - would query task_checklists table
    return [
      {
        id: 1,
        taskType: "cleaning",
        department: "cleaning",
        checklistName: "Standard Room Cleaning",
        checklistItems: [
          "Strip and remake beds with fresh linens",
          "Clean and disinfect all surfaces",
          "Vacuum carpets and mop floors",
          "Restock toiletries and towels",
          "Check and replace light bulbs",
          "Empty trash and replace liners",
          "Clean windows and mirrors",
          "Inspect for damages"
        ],
        isDefault: true,
        propertyId: null
      },
      {
        id: 2,
        taskType: "pool-service",
        department: "pool",
        checklistName: "Pool Maintenance",
        checklistItems: [
          "Test pH and chlorine levels",
          "Skim surface debris",
          "Brush pool walls and floor",
          "Empty skimmer baskets",
          "Clean pool equipment",
          "Check filtration system",
          "Document chemical readings"
        ],
        isDefault: true,
        propertyId: null
      },
      {
        id: 3,
        taskType: "garden",
        department: "garden",
        checklistName: "Garden Maintenance",
        checklistItems: [
          "Water plants and trees",
          "Trim overgrown vegetation",
          "Remove weeds",
          "Check irrigation system",
          "Collect fallen leaves",
          "Inspect for pest damage",
          "Fertilize as needed"
        ],
        isDefault: true,
        propertyId: null
      }
    ];
  }

  // Property Guides
  async getPropertyGuides(organizationId: string) {
    // Mock data for now - would query property_guides table
    return [
      {
        id: 1,
        propertyId: 1,
        guideName: "Villa Sunset Pool Maintenance Guide",
        guideContent: `Weekly Pool Service Procedure:

1. Test water chemistry (pH 7.2-7.8, Free Chlorine 1.0-3.0 ppm)
2. Skim surface and empty leaf baskets
3. Brush walls, steps, and waterline
4. Vacuum pool floor
5. Backwash filter if pressure gauge reads 8-10 psi above clean reading
6. Add chemicals as needed
7. Document all readings and actions taken

Special Notes:
- Pool heater timer set for 6am-10pm
- Waterfall feature runs on separate pump
- Emergency shut-off valve located behind pool equipment`,
        category: "Pool Service",
        department: "pool",
        attachments: ["pool_schematic.pdf", "chemical_chart.jpg"]
      },
      {
        id: 2,
        propertyId: 1,
        guideName: "Garden Irrigation System",
        guideContent: `Automated Irrigation Schedule:
- Zone 1 (Front Garden): Daily 6am, 15 minutes
- Zone 2 (Pool Area): Daily 7am, 10 minutes  
- Zone 3 (Back Garden): Daily 6pm, 20 minutes

Manual Override:
- Controller located in utility room
- Emergency shut-off at main water line
- Seasonal adjustments: Reduce 30% in rainy season

Plant Care:
- Bougainvillea: Trim monthly to maintain shape
- Palm trees: Remove dead fronds only
- Orchids: Water 2x weekly, fertilize monthly`,
        category: "Garden Care",
        department: "garden",
        attachments: ["irrigation_map.png"]
      }
    ];
  }

  // AI Task Suggestions
  async getAiTaskSuggestions(organizationId: string) {
    // Mock data for now - would query ai_task_suggestions table
    return [
      {
        id: 1,
        propertyId: 1,
        suggestedTaskType: "pool-service",
        department: "pool",
        priority: "high",
        reason: "Guest reported cloudy water. Immediate pool service recommended.",
        status: "pending",
        suggestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        propertyId: 2,
        suggestedTaskType: "maintenance",
        department: "maintenance",
        priority: "medium",
        reason: "Air conditioning filter due for replacement based on usage data.",
        status: "pending",
        suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        propertyId: 1,
        suggestedTaskType: "cleaning",
        department: "cleaning",
        priority: "urgent",
        reason: "Check-in in 2 hours. Final cleaning verification needed.",
        status: "pending",
        suggestedDate: new Date().toISOString()
      }
    ];
  }

  // Start Task
  async startTask(taskId: number, userId: string) {
    // Mock implementation - would update task status and record start time
    const startTime = new Date().toISOString();
    
    // In real implementation, this would:
    // 1. Update task status to 'in-progress'
    // 2. Set startedAt timestamp
    // 3. Record user who started the task
    // 4. Create task_history entry
    
    return {
      id: taskId,
      status: "in-progress",
      startedAt: startTime,
      startedBy: userId
    };
  }

  // Complete Task
  async completeTask(taskId: number, completionData: {
    completionNotes?: string;
    evidencePhotos?: string[];
    issuesFound?: string[];
    completedBy: string;
  }) {
    const completedAt = new Date().toISOString();
    
    // Mock implementation - would:
    // 1. Update task status to 'completed'
    // 2. Set completedAt timestamp
    // 3. Save completion notes, photos, and issues
    // 4. Create task_history entry
    // 5. Trigger any follow-up actions
    
    return {
      id: taskId,
      status: "completed",
      completedAt,
      completionNotes: completionData.completionNotes,
      evidencePhotos: completionData.evidencePhotos,
      issuesFound: completionData.issuesFound,
      completedBy: completionData.completedBy
    };
  }

  // Accept AI Suggestion
  async acceptAiSuggestion(suggestionId: number, userId: string) {
    // Mock implementation - would:
    // 1. Create new task from AI suggestion
    // 2. Update AI suggestion status to 'accepted'
    // 3. Record who accepted the suggestion
    
    const newTaskId = Math.floor(Math.random() * 1000) + 100;
    
    return {
      suggestionId,
      newTaskId,
      status: "accepted",
      acceptedBy: userId,
      acceptedAt: new Date().toISOString()
    };
  }

  // Export Tasks PDF
  async exportTasksPdf(organizationId: string, month: string) {
    // Mock implementation - would generate PDF report
    const exportId = `export_${month}_${Date.now()}`;
    
    return {
      id: exportId,
      month,
      organizationId,
      status: "processing",
      createdAt: new Date().toISOString()
    };
  }

  // ==================== ENHANCED FINANCE ENGINE ====================

  // Owner Balance Tracker Management
  async getOwnerBalanceTracker(organizationId: string, ownerId: string, propertyId?: number): Promise<OwnerBalanceTracker | undefined> {
    let query = db
      .select()
      .from(ownerBalanceTracker)
      .where(
        and(
          eq(ownerBalanceTracker.organizationId, organizationId),
          eq(ownerBalanceTracker.ownerId, ownerId)
        )
      );

    if (propertyId) {
      query = query.where(eq(ownerBalanceTracker.propertyId, propertyId));
    }

    const [balance] = await query;
    return balance;
  }

  async updateOwnerBalanceTracker(organizationId: string, ownerId: string, updates: Partial<InsertOwnerBalanceTracker>): Promise<OwnerBalanceTracker> {
    const [updated] = await db
      .update(ownerBalanceTracker)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(ownerBalanceTracker.organizationId, organizationId),
          eq(ownerBalanceTracker.ownerId, ownerId)
        )
      )
      .returning();
    return updated;
  }

  async createOwnerBalanceTracker(balance: InsertOwnerBalanceTracker): Promise<OwnerBalanceTracker> {
    const [newBalance] = await db.insert(ownerBalanceTracker).values(balance).returning();
    return newBalance;
  }

  // Payout Routing Rules Management
  async getPayoutRoutingRules(organizationId: string, propertyId?: number): Promise<PayoutRoutingRule[]> {
    let query = db
      .select()
      .from(payoutRoutingRules)
      .where(eq(payoutRoutingRules.organizationId, organizationId));

    if (propertyId) {
      query = query.where(eq(payoutRoutingRules.propertyId, propertyId));
    }

    return query.where(eq(payoutRoutingRules.isActive, true));
  }

  async createPayoutRoutingRule(rule: InsertPayoutRoutingRule): Promise<PayoutRoutingRule> {
    const [newRule] = await db.insert(payoutRoutingRules).values(rule).returning();
    return newRule;
  }

  async updatePayoutRoutingRule(id: number, updates: Partial<InsertPayoutRoutingRule>): Promise<PayoutRoutingRule | undefined> {
    const [updated] = await db
      .update(payoutRoutingRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payoutRoutingRules.id, id))
      .returning();
    return updated;
  }

  // Utility Bill Processing Management
  async getUtilityBillProcessing(organizationId: string, filters?: {
    utilityBillId?: number;
    processingStatus?: string;
  }): Promise<UtilityBillProcessing[]> {
    let query = db
      .select()
      .from(utilityBillProcessing)
      .where(eq(utilityBillProcessing.organizationId, organizationId));

    if (filters?.utilityBillId) {
      query = query.where(eq(utilityBillProcessing.utilityBillId, filters.utilityBillId));
    }
    if (filters?.processingStatus) {
      query = query.where(eq(utilityBillProcessing.processingStatus, filters.processingStatus));
    }

    return query.orderBy(desc(utilityBillProcessing.createdAt));
  }

  async createUtilityBillProcessing(processing: InsertUtilityBillProcessing): Promise<UtilityBillProcessing> {
    const [newProcessing] = await db.insert(utilityBillProcessing).values(processing).returning();
    return newProcessing;
  }

  async updateUtilityBillProcessing(id: number, updates: Partial<InsertUtilityBillProcessing>): Promise<UtilityBillProcessing | undefined> {
    const [updated] = await db
      .update(utilityBillProcessing)
      .set(updates)
      .where(eq(utilityBillProcessing.id, id))
      .returning();
    return updated;
  }

  // Enhanced Finance Transaction Logs
  async getEnhancedFinanceTransactionLogs(organizationId: string, filters?: {
    transactionType?: string;
    relatedTableName?: string;
    processedBy?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<EnhancedFinanceTransactionLog[]> {
    let query = db
      .select()
      .from(enhancedFinanceTransactionLogs)
      .where(eq(enhancedFinanceTransactionLogs.organizationId, organizationId));

    if (filters?.transactionType) {
      query = query.where(eq(enhancedFinanceTransactionLogs.transactionType, filters.transactionType));
    }
    if (filters?.relatedTableName) {
      query = query.where(eq(enhancedFinanceTransactionLogs.relatedTableName, filters.relatedTableName));
    }
    if (filters?.processedBy) {
      query = query.where(eq(enhancedFinanceTransactionLogs.processedBy, filters.processedBy));
    }
    if (filters?.fromDate) {
      query = query.where(gte(enhancedFinanceTransactionLogs.transactionDate, filters.fromDate));
    }
    if (filters?.toDate) {
      query = query.where(lte(enhancedFinanceTransactionLogs.transactionDate, filters.toDate));
    }

    return query.orderBy(desc(enhancedFinanceTransactionLogs.transactionDate));
  }

  async createEnhancedFinanceTransactionLog(transaction: InsertEnhancedFinanceTransactionLog): Promise<EnhancedFinanceTransactionLog> {
    const [newTransaction] = await db
      .insert(enhancedFinanceTransactionLogs)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Enhanced Finance Analytics
  async getOwnerFinancialSummary(organizationId: string, ownerId: string): Promise<{
    currentBalance: number;
    thisMonthEarnings: number;
    thisMonthExpenses: number;
    netIncome: number;
    pendingPayouts: number;
    totalLifetimeEarnings: number;
    recentTransactions: EnhancedFinanceTransactionLog[];
  }> {
    const balance = await this.getOwnerBalanceTracker(organizationId, ownerId);
    
    // Get recent transactions for this owner (filter by related to owner payouts)
    const recentTransactions = await this.getEnhancedFinanceTransactionLogs(organizationId, {
      relatedTableName: 'owner_payouts',
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
    });

    // Get pending payouts from existing owner_payouts table
    const pendingPayouts = await db
      .select()
      .from(ownerPayouts)
      .where(
        and(
          eq(ownerPayouts.organizationId, organizationId),
          eq(ownerPayouts.ownerId, ownerId),
          eq(ownerPayouts.status, 'pending')
        )
      );

    const totalPendingPayouts = pendingPayouts.reduce((sum, payout) => 
      sum + parseFloat(payout.amount.toString()), 0);

    return {
      currentBalance: parseFloat(balance?.currentBalance?.toString() || '0'),
      thisMonthEarnings: parseFloat(balance?.thisMonthEarnings?.toString() || '0'),
      thisMonthExpenses: parseFloat(balance?.thisMonthExpenses?.toString() || '0'),
      netIncome: parseFloat(balance?.thisMonthEarnings?.toString() || '0') - parseFloat(balance?.thisMonthExpenses?.toString() || '0'),
      pendingPayouts: totalPendingPayouts,
      totalLifetimeEarnings: parseFloat(balance?.totalLifetimeEarnings?.toString() || '0'),
      recentTransactions,
    };
  }

  async getPlatformPayoutBreakdown(organizationId: string, propertyId: number): Promise<{
    platform: string;
    ownerPercentage: number;
    managementPercentage: number;
    platformFeePercentage: number;
    routingType: string;
  }[]> {
    const rules = await this.getPayoutRoutingRules(organizationId, propertyId);
    
    return rules.map(rule => ({
      platform: rule.platform,
      ownerPercentage: parseFloat(rule.ownerPercentage.toString()),
      managementPercentage: parseFloat(rule.managementPercentage.toString()),
      platformFeePercentage: parseFloat(rule.platformFeePercentage?.toString() || '0'),
      routingType: rule.routingType,
    }));
  }

  // Process utility bill with enhanced routing
  async processUtilityBillWithRouting(billId: number, routingDecision: string, processedBy: string, notes?: string): Promise<{
    success: boolean;
    message: string;
    processing?: UtilityBillProcessing;
    transaction?: EnhancedFinanceTransactionLog;
  }> {
    try {
      // Get the utility bill
      const [bill] = await db
        .select()
        .from(utilityBills)
        .where(eq(utilityBills.id, billId));

      if (!bill) {
        return { success: false, message: 'Utility bill not found' };
      }

      // Create processing record
      const processing = await this.createUtilityBillProcessing({
        organizationId: bill.organizationId,
        utilityBillId: billId,
        processedBy,
        processingStatus: 'processed',
        routingDecision,
        processingNotes: notes,
        processedAt: new Date(),
      });

      // Create enhanced finance transaction log
      const transaction = await this.createEnhancedFinanceTransactionLog({
        organizationId: bill.organizationId,
        transactionType: 'utility_charge',
        relatedTableId: billId,
        relatedTableName: 'utility_bills',
        amount: bill.amount || '0',
        currency: bill.currency || 'AUD',
        description: `Utility bill processed - ${bill.type} for property ${bill.propertyId}`,
        processedBy,
        processingNotes: `Routing: ${routingDecision}. ${notes || ''}`,
      });

      return {
        success: true,
        message: 'Utility bill processed successfully',
        processing,
        transaction,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error processing utility bill: ${error}`,
      };
    }
  }

  // ==================== TASK CHECKLIST & PROOF SYSTEM ====================

  // Mock Task Checklists - Stub implementation for MVP
  async getTaskChecklists(organizationId: string, filters?: {
    propertyId?: number;
    taskType?: string;
  }): Promise<any[]> {
    // Return mock checklists for demonstration
    const mockChecklists = [
      {
        id: 1,
        organizationId,
        taskType: "cleaning",
        checklistName: "Checkout Clean",
        checklistItems: [
          { task: "Vacuum all floors", required: true, safetyNote: "Check for small objects", tools: ["Vacuum"] },
          { task: "Clean bathrooms", required: true, safetyNote: "Use gloves", tools: ["Disinfectant", "Gloves"] },
          { task: "Change bed linens", required: true, safetyNote: "Check for damage", tools: ["Fresh linens"] }
        ],
        isDefault: true,
        propertyId: filters?.propertyId || null,
        estimatedMinutes: 120,
        safetyNotes: "Always wear gloves when handling chemicals",
        version: "1.0",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        organizationId,
        taskType: "pool",
        checklistName: "Pool Maintenance",
        checklistItems: [
          { task: "Test water chemistry", required: true, safetyNote: "Handle chemicals carefully", tools: ["Test strips"] },
          { task: "Skim surface debris", required: true, safetyNote: "Use proper skimmer", tools: ["Pool skimmer"] },
          { task: "Empty skimmer baskets", required: true, safetyNote: "Wear gloves", tools: ["Gloves"] }
        ],
        isDefault: true,
        propertyId: filters?.propertyId || null,
        estimatedMinutes: 60,
        safetyNotes: "Never mix different chemicals",
        version: "1.0",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    return mockChecklists.filter(checklist => 
      (!filters?.taskType || checklist.taskType === filters.taskType) &&
      (!filters?.propertyId || checklist.propertyId === filters.propertyId || checklist.propertyId === null)
    );
  }

  async createTaskChecklist(checklist: any): Promise<any> {
    // Mock implementation - would create in database
    return {
      id: Math.floor(Math.random() * 1000),
      ...checklist,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Mock Property Guides - Stub implementation for MVP
  async getPropertyGuides(organizationId: string, filters?: {
    propertyId?: number;
    taskCategory?: string;
  }): Promise<any[]> {
    const mockGuides = [
      {
        id: 1,
        organizationId,
        propertyId: 1,
        guideName: "Pool Equipment Guide",
        taskCategory: "pool",
        instructions: "The pool has a special salt water system that requires weekly cleaning of the salt cell. Turn off power before maintenance.",
        specialEquipment: ["Salt water chlorinator", "Salt cell cleaning tool"],
        safetyWarnings: "Always turn off power before accessing electrical components",
        frequency: "weekly",
        version: "1.0",
        isActive: true,
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    return mockGuides.filter(guide => 
      (!filters?.propertyId || guide.propertyId === filters.propertyId) &&
      (!filters?.taskCategory || guide.taskCategory === filters.taskCategory)
    );
  }

  async createPropertyGuide(guide: any): Promise<any> {
    // Mock implementation - would create in database
    return {
      id: Math.floor(Math.random() * 1000),
      ...guide,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Mock Task Completions - Stub implementation for MVP
  async getTaskCompletions(organizationId: string, filters?: {
    propertyId?: number;
    taskId?: number;
  }): Promise<any[]> {
    const mockCompletions = [
      {
        id: 1,
        organizationId,
        taskId: 1,
        propertyId: 1,
        completedBy: "staff@test.com",
        completionNotes: "All cleaning tasks completed successfully. Found minor issue with bathroom faucet.",
        issuesFound: ["Bathroom faucet dripping slightly"],
        expenseAmount: 25.00,
        expenseDescription: "Replacement faucet washer",
        proofPhotos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
        reviewStatus: "approved",
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        organizationId,
        taskId: 2,
        propertyId: 1,
        completedBy: "staff@test.com",
        completionNotes: "Pool maintenance completed. Chemical levels balanced.",
        issuesFound: [],
        expenseAmount: 0,
        expenseDescription: "",
        proofPhotos: ["pool1.jpg", "pool2.jpg"],
        reviewStatus: "pending",
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    ];

    return mockCompletions.filter(completion => 
      (!filters?.propertyId || completion.propertyId === filters.propertyId) &&
      (!filters?.taskId || completion.taskId === filters.taskId)
    );
  }

  // Mock Monthly Exports - Stub implementation for MVP
  async getMonthlyExports(organizationId: string, filters?: {
    propertyId?: number;
    exportMonth?: string;
  }): Promise<any[]> {
    const mockExports = [
      {
        id: 1,
        organizationId,
        propertyId: 1,
        exportMonth: "2024-12",
        exportType: "full-report",
        fileName: "task-report-2024-12.pdf",
        fileUrl: "/exports/task-report-2024-12.pdf",
        fileSize: 2048576, // 2MB
        taskCount: 25,
        photoCount: 45,
        exportStatus: "completed",
        exportedAt: new Date().toISOString(),
        exportedBy: "admin@test.com",
      },
      {
        id: 2,
        organizationId,
        propertyId: 1,
        exportMonth: "2024-11",
        exportType: "full-report",
        fileName: "task-report-2024-11.pdf",
        fileUrl: "/exports/task-report-2024-11.pdf",
        fileSize: 1876543,
        taskCount: 22,
        photoCount: 38,
        exportStatus: "completed",
        exportedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        exportedBy: "admin@test.com",
      }
    ];

    return mockExports.filter(exportLog => 
      (!filters?.propertyId || exportLog.propertyId === filters.propertyId) &&
      (!filters?.exportMonth || exportLog.exportMonth === filters.exportMonth)
    );
  }

  async createMonthlyExport(exportData: any): Promise<any> {
    // Mock implementation - would create in database and start export process
    return {
      id: Math.floor(Math.random() * 1000),
      ...exportData,
      exportStatus: "processing",
      fileName: `task-report-${exportData.exportMonth}.pdf`,
      fileUrl: `/exports/task-report-${exportData.exportMonth}.pdf`,
      fileSize: 0,
      taskCount: 0,
      photoCount: 0,
      exportedAt: new Date().toISOString(),
      exportedBy: exportData.exportedBy || "system",
    };
  }
}

export const storage = new DatabaseStorage();
