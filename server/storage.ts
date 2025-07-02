import {
  users,
  properties,
  tasks,
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
}

export const storage = new DatabaseStorage();
