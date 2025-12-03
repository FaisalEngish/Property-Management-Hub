import { db } from "./db";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import {
  propertyAccessControl,
  propertyAccessTemplates,
  propertyVisibilityMatrix,
  userSessionPermissions,
  userManagement,
  properties,
  type PropertyAccessControl,
  type InsertPropertyAccessControl,
  type PropertyAccessTemplate,
  type InsertPropertyAccessTemplate,
  type PropertyVisibilityMatrix,
  type InsertPropertyVisibilityMatrix,
  type UserSessionPermissions,
  type InsertUserSessionPermissions,
} from "@shared/schema";

export class PropertyVisibilityStorage {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== PROPERTY ACCESS CONTROL =====

  async getPropertyAccessControl(filters?: {
    userId?: string;
    propertyId?: number;
    canView?: boolean;
    canManage?: boolean;
  }): Promise<(PropertyAccessControl & { 
    userName?: string; 
    propertyName?: string; 
  })[]> {
    let query = db
      .select({
        ...propertyAccessControl,
        userName: sql<string>`${userManagement.firstName} || ' ' || ${userManagement.lastName}`,
        propertyName: properties.name,
      })
      .from(propertyAccessControl)
      .leftJoin(userManagement, eq(propertyAccessControl.userId, userManagement.id))
      .leftJoin(properties, eq(propertyAccessControl.propertyId, properties.id))
      .where(eq(propertyAccessControl.organizationId, this.organizationId));

    if (filters?.userId) {
      query = query.where(and(
        eq(propertyAccessControl.organizationId, this.organizationId),
        eq(propertyAccessControl.userId, filters.userId)
      ));
    }

    if (filters?.propertyId) {
      query = query.where(and(
        eq(propertyAccessControl.organizationId, this.organizationId),
        eq(propertyAccessControl.propertyId, filters.propertyId)
      ));
    }

    if (filters?.canView !== undefined) {
      query = query.where(and(
        eq(propertyAccessControl.organizationId, this.organizationId),
        eq(propertyAccessControl.canView, filters.canView)
      ));
    }

    if (filters?.canManage !== undefined) {
      query = query.where(and(
        eq(propertyAccessControl.organizationId, this.organizationId),
        eq(propertyAccessControl.canManage, filters.canManage)
      ));
    }

    return await query.orderBy(desc(propertyAccessControl.updatedAt));
  }

  async getPropertyAccessById(id: number): Promise<PropertyAccessControl | undefined> {
    const [result] = await db
      .select()
      .from(propertyAccessControl)
      .where(and(
        eq(propertyAccessControl.id, id),
        eq(propertyAccessControl.organizationId, this.organizationId)
      ));
    return result;
  }

  async createPropertyAccess(data: Omit<InsertPropertyAccessControl, "organizationId">): Promise<PropertyAccessControl> {
    const [result] = await db
      .insert(propertyAccessControl)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    
    // Update visibility matrix after creating access
    await this.updateVisibilityMatrix(data.userId);
    
    return result;
  }

  async updatePropertyAccess(
    id: number, 
    data: Partial<InsertPropertyAccessControl>
  ): Promise<PropertyAccessControl | undefined> {
    const [result] = await db
      .update(propertyAccessControl)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(propertyAccessControl.id, id),
        eq(propertyAccessControl.organizationId, this.organizationId)
      ))
      .returning();

    if (result) {
      // Update visibility matrix after updating access
      await this.updateVisibilityMatrix(result.userId);
    }

    return result;
  }

  async deletePropertyAccess(id: number): Promise<boolean> {
    const accessRecord = await this.getPropertyAccessById(id);
    
    const result = await db
      .delete(propertyAccessControl)
      .where(and(
        eq(propertyAccessControl.id, id),
        eq(propertyAccessControl.organizationId, this.organizationId)
      ));

    if (accessRecord && result.rowCount && result.rowCount > 0) {
      // Update visibility matrix after deleting access
      await this.updateVisibilityMatrix(accessRecord.userId);
      return true;
    }
    
    return false;
  }

  async bulkUpdatePropertyAccess(
    userId: string,
    propertyIds: number[],
    accessData: Partial<Omit<InsertPropertyAccessControl, "userId" | "propertyId" | "organizationId">>
  ): Promise<PropertyAccessControl[]> {
    const results: PropertyAccessControl[] = [];

    for (const propertyId of propertyIds) {
      // Check if access record exists
      const [existing] = await db
        .select()
        .from(propertyAccessControl)
        .where(and(
          eq(propertyAccessControl.userId, userId),
          eq(propertyAccessControl.propertyId, propertyId),
          eq(propertyAccessControl.organizationId, this.organizationId)
        ));

      if (existing) {
        // Update existing record
        const [updated] = await db
          .update(propertyAccessControl)
          .set({
            ...accessData,
            updatedAt: new Date(),
          })
          .where(eq(propertyAccessControl.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        // Create new record
        const [created] = await db
          .insert(propertyAccessControl)
          .values({
            userId,
            propertyId,
            organizationId: this.organizationId,
            ...accessData,
          })
          .returning();
        results.push(created);
      }
    }

    // Update visibility matrix after bulk operation
    await this.updateVisibilityMatrix(userId);

    return results;
  }

  // ===== PROPERTY ACCESS TEMPLATES =====

  async getAccessTemplates(targetRole?: string): Promise<PropertyAccessTemplate[]> {
    let query = db
      .select()
      .from(propertyAccessTemplates)
      .where(eq(propertyAccessTemplates.organizationId, this.organizationId));

    if (targetRole) {
      query = query.where(and(
        eq(propertyAccessTemplates.organizationId, this.organizationId),
        eq(propertyAccessTemplates.targetRole, targetRole)
      ));
    }

    return await query.orderBy(desc(propertyAccessTemplates.createdAt));
  }

  async createAccessTemplate(data: Omit<InsertPropertyAccessTemplate, "organizationId">): Promise<PropertyAccessTemplate> {
    const [result] = await db
      .insert(propertyAccessTemplates)
      .values({
        ...data,
        organizationId: this.organizationId,
      })
      .returning();
    return result;
  }

  async applyTemplateToUser(templateId: number, userId: string, propertyIds: number[]): Promise<PropertyAccessControl[]> {
    const template = await db
      .select()
      .from(propertyAccessTemplates)
      .where(and(
        eq(propertyAccessTemplates.id, templateId),
        eq(propertyAccessTemplates.organizationId, this.organizationId)
      ));

    if (!template[0]) {
      throw new Error("Template not found");
    }

    const templateData = template[0];
    const accessData = {
      canView: templateData.defaultCanView,
      canManage: templateData.defaultCanManage,
      canReceiveTasks: templateData.defaultCanReceiveTasks,
      hasFinancialAccess: templateData.defaultFinancialAccess,
      hasMaintenanceAccess: templateData.defaultMaintenanceAccess,
      hasGuestBookingAccess: templateData.defaultGuestBookingAccess,
      hasUtilitiesAccess: templateData.defaultUtilitiesAccess,
      hasPropertyInfoAccess: templateData.defaultPropertyInfoAccess,
      hasServiceOrderAccess: templateData.defaultServiceOrderAccess,
      assignedBy: templateData.createdBy,
    };

    return await this.bulkUpdatePropertyAccess(userId, propertyIds, accessData);
  }

  // ===== PROPERTY VISIBILITY MATRIX =====

  async getVisibilityMatrix(filters?: {
    userId?: string;
    accessLevel?: string;
    hasFullAccess?: boolean;
  }): Promise<(PropertyVisibilityMatrix & { 
    userName?: string;
    userRole?: string;
    userEmail?: string;
    lastLoginAt?: Date | null;
  })[]> {
    let query = db
      .select({
        ...propertyVisibilityMatrix,
        userName: sql<string>`${userManagement.firstName} || ' ' || ${userManagement.lastName}`,
        userRole: userManagement.primaryRole,
        userEmail: userManagement.email,
        lastLoginAt: userManagement.lastLoginAt,
      })
      .from(propertyVisibilityMatrix)
      .leftJoin(userManagement, eq(propertyVisibilityMatrix.userId, userManagement.id))
      .where(eq(propertyVisibilityMatrix.organizationId, this.organizationId));

    if (filters?.userId) {
      query = query.where(and(
        eq(propertyVisibilityMatrix.organizationId, this.organizationId),
        eq(propertyVisibilityMatrix.userId, filters.userId)
      ));
    }

    if (filters?.accessLevel) {
      query = query.where(and(
        eq(propertyVisibilityMatrix.organizationId, this.organizationId),
        eq(propertyVisibilityMatrix.accessLevel, filters.accessLevel)
      ));
    }

    if (filters?.hasFullAccess !== undefined) {
      query = query.where(and(
        eq(propertyVisibilityMatrix.organizationId, this.organizationId),
        eq(propertyVisibilityMatrix.hasFullAccess, filters.hasFullAccess)
      ));
    }

    return await query.orderBy(desc(propertyVisibilityMatrix.lastUpdated));
  }

  async updateVisibilityMatrix(userId: string): Promise<PropertyVisibilityMatrix> {
    // Get all property access records for this user
    const accessRecords = await this.getPropertyAccessControl({ userId });

    // Calculate visibility matrix data
    const propertiesLinked = accessRecords.map(record => record.propertyId);
    const hasFullAccess = accessRecords.every(record => 
      record.canView && record.canManage && record.canReceiveTasks
    );
    const hasRestrictedAccess = accessRecords.some(record => 
      !record.hasFinancialAccess || 
      !record.hasMaintenanceAccess || 
      !record.hasGuestBookingAccess ||
      !record.hasUtilitiesAccess ||
      !record.hasPropertyInfoAccess ||
      !record.hasServiceOrderAccess
    );

    let accessLevel = "read-only";
    if (hasFullAccess && !hasRestrictedAccess) {
      accessLevel = "full";
    } else if (accessRecords.some(record => record.canManage)) {
      accessLevel = "partial";
    }

    // Upsert visibility matrix record
    const [existing] = await db
      .select()
      .from(propertyVisibilityMatrix)
      .where(and(
        eq(propertyVisibilityMatrix.userId, userId),
        eq(propertyVisibilityMatrix.organizationId, this.organizationId)
      ));

    if (existing) {
      const [updated] = await db
        .update(propertyVisibilityMatrix)
        .set({
          propertiesLinked: JSON.stringify(propertiesLinked),
          accessLevel,
          hasFullAccess,
          hasRestrictedAccess,
          lastUpdated: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(propertyVisibilityMatrix.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(propertyVisibilityMatrix)
        .values({
          userId,
          organizationId: this.organizationId,
          propertiesLinked: JSON.stringify(propertiesLinked),
          accessLevel,
          hasFullAccess,
          hasRestrictedAccess,
          lastUpdated: new Date(),
        })
        .returning();
      return created;
    }
  }

  // ===== USER SESSION PERMISSIONS =====

  async getUserSessionPermissions(userId: string, sessionId?: string): Promise<UserSessionPermissions | undefined> {
    let query = db
      .select()
      .from(userSessionPermissions)
      .where(and(
        eq(userSessionPermissions.userId, userId),
        eq(userSessionPermissions.organizationId, this.organizationId),
        eq(userSessionPermissions.isActive, true)
      ));

    if (sessionId) {
      query = query.where(and(
        eq(userSessionPermissions.userId, userId),
        eq(userSessionPermissions.organizationId, this.organizationId),
        eq(userSessionPermissions.sessionId, sessionId),
        eq(userSessionPermissions.isActive, true)
      ));
    }

    const [result] = await query.orderBy(desc(userSessionPermissions.lastSyncAt));
    return result;
  }

  async syncUserSessionPermissions(
    userId: string, 
    sessionId: string
  ): Promise<UserSessionPermissions> {
    // Get current property access for user
    const accessRecords = await this.getPropertyAccessControl({ userId });
    
    // Build permissions cache
    const permissionsCache = {
      properties: accessRecords.reduce((acc, record) => {
        acc[record.propertyId] = {
          canView: record.canView,
          canManage: record.canManage,
          canReceiveTasks: record.canReceiveTasks,
          hasFinancialAccess: record.hasFinancialAccess,
          hasMaintenanceAccess: record.hasMaintenanceAccess,
          hasGuestBookingAccess: record.hasGuestBookingAccess,
          hasUtilitiesAccess: record.hasUtilitiesAccess,
          hasPropertyInfoAccess: record.hasPropertyInfoAccess,
          hasServiceOrderAccess: record.hasServiceOrderAccess,
        };
        return acc;
      }, {} as Record<number, any>),
      lastSyncAt: new Date().toISOString(),
    };

    const propertyAccessCache = accessRecords.reduce((acc, record) => {
      acc[record.propertyId] = record;
      return acc;
    }, {} as Record<number, PropertyAccessControl>);

    // Update or create session permissions
    const [existing] = await db
      .select()
      .from(userSessionPermissions)
      .where(and(
        eq(userSessionPermissions.userId, userId),
        eq(userSessionPermissions.sessionId, sessionId),
        eq(userSessionPermissions.organizationId, this.organizationId)
      ));

    if (existing) {
      const [updated] = await db
        .update(userSessionPermissions)
        .set({
          permissionsCache: JSON.stringify(permissionsCache),
          propertyAccessCache: JSON.stringify(propertyAccessCache),
          lastSyncAt: new Date(),
          syncVersion: existing.syncVersion + 1,
          updatedAt: new Date(),
        })
        .where(eq(userSessionPermissions.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSessionPermissions)
        .values({
          userId,
          sessionId,
          organizationId: this.organizationId,
          permissionsCache: JSON.stringify(permissionsCache),
          propertyAccessCache: JSON.stringify(propertyAccessCache),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        })
        .returning();
      return created;
    }
  }

  // ===== DEMO DATA METHODS =====

  async getDemoVisibilityMatrix(): Promise<(PropertyVisibilityMatrix & { 
    userName?: string;
    userRole?: string;
    userEmail?: string;
    lastLoginAt?: Date | null;
  })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        userId: "demo-owner",
        propertiesLinked: JSON.stringify([3, 4]),
        accessLevel: "partial",
        lastUpdated: new Date("2025-01-05T10:00:00Z"),
        lastUpdatedBy: "demo-admin",
        hasFullAccess: false,
        hasRestrictedAccess: true,
        requiresReview: false,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T10:00:00Z"),
        userName: "John Owner",
        userRole: "owner",
        userEmail: "demo-owner@demo.com",
        lastLoginAt: new Date("2025-01-05T09:30:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        userId: "demo-staff",
        propertiesLinked: JSON.stringify([3, 4, 5]),
        accessLevel: "read-only",
        lastUpdated: new Date("2025-01-05T11:00:00Z"),
        lastUpdatedBy: "demo-admin",
        hasFullAccess: false,
        hasRestrictedAccess: false,
        requiresReview: false,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T11:00:00Z"),
        userName: "Jane Staff",
        userRole: "staff",
        userEmail: "demo-staff@demo.com",
        lastLoginAt: new Date("2025-01-05T08:15:00Z"),
      },
      {
        id: 3,
        organizationId: this.organizationId,
        userId: "demo-agent-retail",
        propertiesLinked: JSON.stringify([3, 4, 5, 6]),
        accessLevel: "full",
        lastUpdated: new Date("2025-01-05T12:00:00Z"),
        lastUpdatedBy: "demo-admin",
        hasFullAccess: true,
        hasRestrictedAccess: false,
        requiresReview: false,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T12:00:00Z"),
        userName: "Mike Agent",
        userRole: "retail-agent",
        userEmail: "demo-agent-retail@demo.com",
        lastLoginAt: new Date("2025-01-05T07:45:00Z"),
      },
    ];
  }

  async getDemoPropertyAccess(): Promise<(PropertyAccessControl & { 
    userName?: string; 
    propertyName?: string; 
  })[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        userId: "demo-owner",
        propertyId: 3,
        canView: true,
        canManage: true,
        canReceiveTasks: false,
        hasFinancialAccess: true,
        hasMaintenanceAccess: false, // Restricted
        hasGuestBookingAccess: true,
        hasUtilitiesAccess: true,
        hasPropertyInfoAccess: true,
        hasServiceOrderAccess: false, // Restricted
        assignedBy: "demo-admin",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T10:00:00Z"),
        userName: "John Owner",
        propertyName: "Property",
      },
      {
        id: 2,
        organizationId: this.organizationId,
        userId: "demo-staff",
        propertyId: 3,
        canView: true,
        canManage: false,
        canReceiveTasks: true,
        hasFinancialAccess: false,
        hasMaintenanceAccess: true,
        hasGuestBookingAccess: true,
        hasUtilitiesAccess: false,
        hasPropertyInfoAccess: true,
        hasServiceOrderAccess: true,
        assignedBy: "demo-admin",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T11:00:00Z"),
        userName: "Jane Staff",
        propertyName: "Property",
      },
      {
        id: 3,
        organizationId: this.organizationId,
        userId: "demo-agent-retail",
        propertyId: 3,
        canView: true,
        canManage: true,
        canReceiveTasks: false,
        hasFinancialAccess: true,
        hasMaintenanceAccess: true,
        hasGuestBookingAccess: true,
        hasUtilitiesAccess: true,
        hasPropertyInfoAccess: true,
        hasServiceOrderAccess: true,
        assignedBy: "demo-admin",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-05T12:00:00Z"),
        userName: "Mike Agent",
        propertyName: "Property",
      },
    ];
  }

  async getDemoAccessTemplates(): Promise<PropertyAccessTemplate[]> {
    return [
      {
        id: 1,
        organizationId: this.organizationId,
        templateName: "Owner Default",
        targetRole: "owner",
        description: "Default permissions for property owners",
        defaultCanView: true,
        defaultCanManage: true,
        defaultCanReceiveTasks: false,
        defaultFinancialAccess: true,
        defaultMaintenanceAccess: true,
        defaultGuestBookingAccess: true,
        defaultUtilitiesAccess: true,
        defaultPropertyInfoAccess: true,
        defaultServiceOrderAccess: true,
        createdBy: "demo-admin",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
      },
      {
        id: 2,
        organizationId: this.organizationId,
        templateName: "Staff Standard",
        targetRole: "staff",
        description: "Standard permissions for staff members",
        defaultCanView: true,
        defaultCanManage: false,
        defaultCanReceiveTasks: true,
        defaultFinancialAccess: false,
        defaultMaintenanceAccess: true,
        defaultGuestBookingAccess: true,
        defaultUtilitiesAccess: false,
        defaultPropertyInfoAccess: true,
        defaultServiceOrderAccess: true,
        createdBy: "demo-admin",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
      },
    ];
  }
}