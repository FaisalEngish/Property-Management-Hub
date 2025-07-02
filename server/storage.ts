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
  welcomePackItems,
  welcomePackTemplates,
  welcomePackUsage,
  ownerPayouts,
  notifications,
  notificationPreferences,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

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

  // Utility bills operations
  getUtilityBills(): Promise<UtilityBill[]>;
  getUtilityBillsByProperty(propertyId: number): Promise<UtilityBill[]>;
  getUtilityBill(id: number): Promise<UtilityBill | undefined>;
  createUtilityBill(bill: InsertUtilityBill): Promise<UtilityBill>;
  updateUtilityBill(id: number, bill: Partial<InsertUtilityBill>): Promise<UtilityBill | undefined>;
  deleteUtilityBill(id: number): Promise<boolean>;

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
}

export const storage = new DatabaseStorage();
