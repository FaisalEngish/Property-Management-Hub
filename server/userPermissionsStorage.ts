import { db } from "./db";
import { userPermissionOverrides, permissionPresets, rolePermissions, userManagement, userRoles, properties } from "@shared/schema";
import { eq, and, or, isNull, inArray } from "drizzle-orm";
import type { 
  UserPermissionOverride, 
  InsertUserPermissionOverride,
  PermissionPreset,
  InsertPermissionPreset,
  RolePermission,
  InsertRolePermission
} from "@shared/schema";

// Define module categories and their specific modules
export const MODULE_CATEGORIES = {
  financials: {
    name: "Financials",
    modules: ["invoices", "payouts", "commissions", "booking-income", "owner-balances", "agent-earnings"]
  },
  maintenance: {
    name: "Maintenance",
    modules: ["tasks", "logs", "utilities", "property-maintenance", "warranty-tracker", "recurring-tasks"]
  },
  bookings: {
    name: "Bookings", 
    modules: ["calendar", "guest-info", "extras", "check-in-checkout", "guest-portal", "service-timeline"]
  },
  documents: {
    name: "Documents",
    modules: ["upload", "licenses", "contracts", "owner-documents", "property-documents", "compliance"]
  },
  addons: {
    name: "Add-ons",
    modules: ["service-requests", "chat", "feedback", "smart-requests", "ai-recommendations", "guest-surveys"]
  }
} as const;

// Permission levels
export type PermissionLevel = "none" | "view" | "edit";

// User permission structure with property assignments
export interface UserWithPermissions {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  subRole: string | null;
  status: "active" | "suspended";
  assignedProperties: Array<{
    id: number;
    name: string;
    assignmentType: string;
  }>;
  permissions: Record<string, Record<string, PermissionLevel>>;
  demoMode: boolean;
}

// Module permission details
export interface ModulePermission {
  moduleCategory: string;
  moduleName: string;
  permission: PermissionLevel;
  isOverride: boolean;
  reason?: string;
  expiresAt?: Date;
}

export class UserPermissionsStorage {
  
  // Get all users with their permissions and property assignments
  async getAllUsersWithPermissions(organizationId: string): Promise<UserWithPermissions[]> {
    // Get users with their roles
    const usersWithRoles = await db
      .select({
        id: userManagement.id,
        firstName: userManagement.firstName,
        lastName: userManagement.lastName,
        email: userManagement.email,
        role: userRoles.primaryRole,
        subRole: userRoles.subRole,
        demoMode: userManagement.demoMode,
        isActive: userRoles.isActive,
      })
      .from(userManagement)
      .leftJoin(userRoles, and(
        eq(userRoles.userId, userManagement.id),
        eq(userRoles.organizationId, organizationId)
      ))
      .where(eq(userManagement.organizationId, organizationId));

    // Get property assignments for each user
    const userIds = usersWithRoles.map(u => u.id);
    const propertyAssignments = userIds.length > 0 ? await db
      .select({
        userId: userManagement.id,
        propertyId: properties.id,
        propertyName: properties.name,
        assignmentType: userManagement.assignmentType || "permanent"
      })
      .from(userManagement)
      .leftJoin(properties, eq(properties.id, userManagement.propertyId))
      .where(and(
        inArray(userManagement.id, userIds),
        eq(userManagement.organizationId, organizationId)
      )) : [];

    // Get permission overrides for each user
    const permissionOverrides = userIds.length > 0 ? await db
      .select()
      .from(userPermissionOverrides)
      .where(and(
        inArray(userPermissionOverrides.userId, userIds),
        eq(userPermissionOverrides.organizationId, organizationId)
      )) : [];

    // Combine data
    return usersWithRoles.map(user => {
      const userProperties = propertyAssignments
        .filter(p => p.userId === user.id && p.propertyId)
        .map(p => ({
          id: p.propertyId!,
          name: p.propertyName || `Property ${p.propertyId}`,
          assignmentType: p.assignmentType
        }));

      const userOverrides = permissionOverrides.filter(p => p.userId === user.id);
      
      // Build permissions structure with defaults based on role
      const permissions = this.buildUserPermissions(user.role || "guest", userOverrides);

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || "guest",
        subRole: user.subRole,
        status: user.isActive ? "active" : "suspended",
        assignedProperties: userProperties,
        permissions,
        demoMode: user.demoMode || false
      };
    });
  }

  // Build permissions structure with defaults and overrides
  private buildUserPermissions(role: string, overrides: UserPermissionOverride[]): Record<string, Record<string, PermissionLevel>> {
    const permissions: Record<string, Record<string, PermissionLevel>> = {};
    
    // Initialize with default role permissions
    Object.entries(MODULE_CATEGORIES).forEach(([categoryKey, category]) => {
      permissions[categoryKey] = {};
      category.modules.forEach(module => {
        permissions[categoryKey][module] = this.getDefaultPermissionForRole(role, categoryKey, module);
      });
    });

    // Apply overrides
    overrides.forEach(override => {
      if (!permissions[override.moduleCategory]) {
        permissions[override.moduleCategory] = {};
      }
      permissions[override.moduleCategory][override.moduleName] = override.permission as PermissionLevel;
    });

    return permissions;
  }

  // Get default permission for a role/module combination
  private getDefaultPermissionForRole(role: string, category: string, module: string): PermissionLevel {
    const defaults: Record<string, Record<string, PermissionLevel>> = {
      admin: {
        financials: "edit",
        maintenance: "edit", 
        bookings: "edit",
        documents: "edit",
        addons: "edit"
      },
      "portfolio-manager": {
        financials: "edit",
        maintenance: "edit",
        bookings: "edit", 
        documents: "view",
        addons: "edit"
      },
      owner: {
        financials: "view",
        maintenance: "view",
        bookings: "view",
        documents: "view",
        addons: "none"
      },
      staff: {
        financials: "none",
        maintenance: "edit",
        bookings: "edit",
        documents: "view",
        addons: "edit"
      },
      "retail-agent": {
        financials: "view",
        maintenance: "none",
        bookings: "edit",
        documents: "none", 
        addons: "view"
      },
      "referral-agent": {
        financials: "view",
        maintenance: "none",
        bookings: "view",
        documents: "none",
        addons: "view"
      },
      freelancer: {
        financials: "none",
        maintenance: "edit",
        bookings: "view",
        documents: "none",
        addons: "none"
      },
      guest: {
        financials: "none",
        maintenance: "none", 
        bookings: "view",
        documents: "none",
        addons: "view"
      }
    };

    return defaults[role]?.[category] || "none";
  }

  // Update user permissions
  async updateUserPermissions(
    organizationId: string,
    userId: string,
    permissions: ModulePermission[],
    updatedBy: string
  ): Promise<void> {
    // Remove existing overrides
    await db
      .delete(userPermissionOverrides)
      .where(and(
        eq(userPermissionOverrides.organizationId, organizationId),
        eq(userPermissionOverrides.userId, userId)
      ));

    // Add new overrides
    if (permissions.length > 0) {
      await db.insert(userPermissionOverrides).values(
        permissions.map(perm => ({
          organizationId,
          userId,
          moduleCategory: perm.moduleCategory,
          moduleName: perm.moduleName,
          permission: perm.permission,
          isOverride: perm.isOverride,
          grantedBy: updatedBy,
          reason: perm.reason,
          expiresAt: perm.expiresAt
        }))
      );
    }
  }

  // Get permission presets for a role
  async getPermissionPresets(organizationId: string, targetRole?: string): Promise<PermissionPreset[]> {
    const query = db
      .select()
      .from(permissionPresets)
      .where(eq(permissionPresets.organizationId, organizationId));

    if (targetRole) {
      query.where(and(
        eq(permissionPresets.organizationId, organizationId),
        eq(permissionPresets.targetRole, targetRole)
      ));
    }

    return await query;
  }

  // Create permission preset
  async createPermissionPreset(preset: InsertPermissionPreset): Promise<PermissionPreset> {
    const [newPreset] = await db
      .insert(permissionPresets)
      .values(preset)
      .returning();
    
    return newPreset;
  }

  // Apply permission preset to user
  async applyPermissionPreset(
    organizationId: string,
    userId: string,
    presetId: number,
    appliedBy: string
  ): Promise<void> {
    const preset = await db
      .select()
      .from(permissionPresets)
      .where(and(
        eq(permissionPresets.id, presetId),
        eq(permissionPresets.organizationId, organizationId)
      ))
      .limit(1);

    if (preset.length === 0) {
      throw new Error("Permission preset not found");
    }

    const permissions = preset[0].permissions as Record<string, Record<string, PermissionLevel>>;
    const overrides: ModulePermission[] = [];

    // Convert preset permissions to overrides
    Object.entries(permissions).forEach(([category, modules]) => {
      Object.entries(modules).forEach(([module, permission]) => {
        overrides.push({
          moduleCategory: category,
          moduleName: module,
          permission,
          isOverride: true,
          reason: `Applied preset: ${preset[0].presetName}`
        });
      });
    });

    await this.updateUserPermissions(organizationId, userId, overrides, appliedBy);

    // Increment usage count
    await db
      .update(permissionPresets)
      .set({ 
        usageCount: preset[0].usageCount + 1,
        updatedAt: new Date()
      })
      .where(eq(permissionPresets.id, presetId));
  }

  // Clone permissions from one user to another
  async cloneUserPermissions(
    organizationId: string,
    fromUserId: string,
    toUserId: string,
    clonedBy: string
  ): Promise<void> {
    const sourceOverrides = await db
      .select()
      .from(userPermissionOverrides)
      .where(and(
        eq(userPermissionOverrides.organizationId, organizationId),
        eq(userPermissionOverrides.userId, fromUserId)
      ));

    if (sourceOverrides.length > 0) {
      const clonedOverrides: ModulePermission[] = sourceOverrides.map(override => ({
        moduleCategory: override.moduleCategory,
        moduleName: override.moduleName,
        permission: override.permission as PermissionLevel,
        isOverride: true,
        reason: `Cloned from user ${fromUserId}`
      }));

      await this.updateUserPermissions(organizationId, toUserId, clonedOverrides, clonedBy);
    }
  }

  // Toggle user demo mode
  async toggleUserDemoMode(organizationId: string, userId: string, demoMode: boolean): Promise<void> {
    await db
      .update(userManagement)
      .set({ 
        demoMode,
        updatedAt: new Date()
      })
      .where(and(
        eq(userManagement.id, userId),
        eq(userManagement.organizationId, organizationId)
      ));
  }

  // Suspend/activate user
  async updateUserStatus(organizationId: string, userId: string, isActive: boolean): Promise<void> {
    await db
      .update(userRoles)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.organizationId, organizationId)
      ));
  }

  // Get user's effective permissions (for sidebar filtering)
  async getUserEffectivePermissions(organizationId: string, userId: string): Promise<Record<string, Record<string, PermissionLevel>>> {
    // Get user role
    const userRole = await db
      .select({ role: userRoles.primaryRole })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.organizationId, organizationId)
      ))
      .limit(1);

    if (userRole.length === 0) {
      throw new Error("User role not found");
    }

    // Get permission overrides
    const overrides = await db
      .select()
      .from(userPermissionOverrides)
      .where(and(
        eq(userPermissionOverrides.userId, userId),
        eq(userPermissionOverrides.organizationId, organizationId),
        or(isNull(userPermissionOverrides.expiresAt), eq(userPermissionOverrides.expiresAt, new Date()))
      ));

    return this.buildUserPermissions(userRole[0].role, overrides);
  }
}

export const userPermissionsStorage = new UserPermissionsStorage();