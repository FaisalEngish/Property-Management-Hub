import { db } from "./db";
import { 
  inventoryItems, 
  inventoryUsageLogs,
  type InventoryItem, 
  type InsertInventoryItem,
  type InventoryUsageLog,
  type InsertInventoryUsageLog 
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export class InventoryStorage {
  // ===== INVENTORY ITEMS MANAGEMENT =====
  
  async getAllInventoryItems(organizationId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.organizationId, organizationId))
      .orderBy(asc(inventoryItems.itemName));
  }

  async getActiveInventoryItems(organizationId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, organizationId),
          eq(inventoryItems.isActive, true)
        )
      )
      .orderBy(asc(inventoryItems.itemName));
  }

  async getInventoryItemsByType(organizationId: string, itemType: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, organizationId),
          eq(inventoryItems.itemType, itemType),
          eq(inventoryItems.isActive, true)
        )
      )
      .orderBy(asc(inventoryItems.itemName));
  }

  async getInventoryItemById(id: number, organizationId: string): Promise<InventoryItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.organizationId, organizationId)
        )
      );
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db
      .insert(inventoryItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: number, organizationId: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(updates)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.organizationId, organizationId)
        )
      )
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(inventoryItems)
      .where(
        and(
          eq(inventoryItems.id, id),
          eq(inventoryItems.organizationId, organizationId)
        )
      );
    return result.rowCount > 0;
  }

  // ===== INVENTORY USAGE LOGS =====
  
  async getAllUsageLogs(organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(eq(inventoryUsageLogs.organizationId, organizationId))
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async getUsageLogsByTask(taskId: number, organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.taskId, taskId),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async getUsageLogsByProperty(propertyId: number, organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.propertyId, propertyId),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async getUsageLogsByItem(itemId: number, organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.itemId, itemId),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async getUsageLogsByUser(userId: string, organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.usedBy, userId),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async getUsageLogsByType(usageType: string, organizationId: string): Promise<InventoryUsageLog[]> {
    return await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.usageType, usageType),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .orderBy(desc(inventoryUsageLogs.createdAt));
  }

  async createUsageLog(log: InsertInventoryUsageLog): Promise<InventoryUsageLog> {
    const [newLog] = await db
      .insert(inventoryUsageLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getUsageLogById(id: number, organizationId: string): Promise<InventoryUsageLog | undefined> {
    const [log] = await db
      .select()
      .from(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.id, id),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      );
    return log;
  }

  async updateUsageLog(id: number, organizationId: string, updates: Partial<InsertInventoryUsageLog>): Promise<InventoryUsageLog | undefined> {
    const [updatedLog] = await db
      .update(inventoryUsageLogs)
      .set(updates)
      .where(
        and(
          eq(inventoryUsageLogs.id, id),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      )
      .returning();
    return updatedLog;
  }

  async deleteUsageLog(id: number, organizationId: string): Promise<boolean> {
    const result = await db
      .delete(inventoryUsageLogs)
      .where(
        and(
          eq(inventoryUsageLogs.id, id),
          eq(inventoryUsageLogs.organizationId, organizationId)
        )
      );
    return result.rowCount > 0;
  }

  // ===== ANALYTICS & REPORTING =====
  
  async getItemUsageSummary(itemId: number, organizationId: string): Promise<{
    totalUsed: number;
    totalCost: number;
    usageCount: number;
    lastUsed: Date | null;
  }> {
    // This would be implemented with SQL aggregation functions
    // For now, we'll return a placeholder
    const logs = await this.getUsageLogsByItem(itemId, organizationId);
    
    const totalUsed = logs.reduce((sum, log) => sum + log.quantityUsed, 0);
    const totalCost = logs.reduce((sum, log) => sum + (log.costTotal ? parseFloat(log.costTotal as any) : 0), 0);
    const usageCount = logs.length;
    const lastUsed = logs.length > 0 ? logs[0].createdAt : null;

    return {
      totalUsed,
      totalCost,
      usageCount,
      lastUsed
    };
  }

  async getPropertyInventoryCosts(propertyId: number, organizationId: string): Promise<{
    totalCost: number;
    usageCount: number;
    lastMonth: number;
  }> {
    const logs = await this.getUsageLogsByProperty(propertyId, organizationId);
    
    const totalCost = logs.reduce((sum, log) => sum + (log.costTotal ? parseFloat(log.costTotal as any) : 0), 0);
    const usageCount = logs.length;
    
    // Calculate last month costs (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthLogs = logs.filter(log => log.createdAt && log.createdAt >= lastMonth);
    const lastMonthCost = lastMonthLogs.reduce((sum, log) => sum + (log.costTotal ? parseFloat(log.costTotal as any) : 0), 0);

    return {
      totalCost,
      usageCount,
      lastMonth: lastMonthCost
    };
  }
}

export const inventoryStorage = new InventoryStorage();