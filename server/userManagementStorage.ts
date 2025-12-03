import { 
  UserManagement, 
  InsertUserManagement, 
  UserPermissionsMatrix, 
  InsertUserPermissionsMatrix,
  UserGroup,
  InsertUserGroup,
  UserGroupMembership,
  InsertUserGroupMembership,
  UserActivityLog,
  InsertUserActivityLog,
  UserManagementWithPermissions,
  userManagement,
  userPermissionsMatrix,
  userGroups,
  userGroupMemberships,
  userActivityLogs,
  USER_ROLES,
  PERMISSION_MODULES,
  ROLE_PERMISSION_TEMPLATES,
  UserRoleType,
  PermissionModule
} from "@shared/schema";
import { eq, and, inArray, desc, sql, count } from "drizzle-orm";

// Mock storage for development - replace with database in production
class UserManagementStorage {
  private users: UserManagement[] = [
    {
      id: "admin-001",
      organizationId: "org-001",
      email: "admin@hostpilotpro.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: null,
      primaryRole: "admin",
      subRole: null,
      listingsAccess: [],
      groups: ["System Administrators"],
      dashboardAlerts: true,
      emailAlerts: true,
      smsAlerts: false,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T17:30:00Z"),
      lastSeenAt: new Date("2025-01-05T17:30:00Z"),
      createdBy: null,
      updatedBy: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-05T17:30:00Z")
    },
    {
      id: "pm-001",
      organizationId: "org-001",
      email: "manager@hostpilotpro.com",
      firstName: "Portfolio",
      lastName: "Manager",
      profileImageUrl: null,
      primaryRole: "portfolio_manager",
      subRole: null,
      listingsAccess: ["villa_majesta", "villa_tramonto", "villa_solana"],
      groups: ["Portfolio Managers", "Adam Portfolio"],
      dashboardAlerts: true,
      emailAlerts: true,
      smsAlerts: true,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T16:45:00Z"),
      lastSeenAt: new Date("2025-01-05T16:45:00Z"),
      createdBy: "admin-001",
      updatedBy: "admin-001",
      createdAt: new Date("2025-01-02T10:00:00Z"),
      updatedAt: new Date("2025-01-05T16:45:00Z")
    },
    {
      id: "owner-001",
      organizationId: "org-001",
      email: "owner@hostpilotpro.com",
      firstName: "Property",
      lastName: "Owner",
      profileImageUrl: null,
      primaryRole: "owner",
      subRole: null,
      listingsAccess: ["villa_tramonto"],
      groups: ["Property Owners", "Tramonto Owners"],
      dashboardAlerts: true,
      emailAlerts: true,
      smsAlerts: false,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T15:20:00Z"),
      lastSeenAt: new Date("2025-01-05T15:20:00Z"),
      createdBy: "admin-001",
      updatedBy: "admin-001",
      createdAt: new Date("2025-01-03T14:00:00Z"),
      updatedAt: new Date("2025-01-05T15:20:00Z")
    },
    {
      id: "retail-001",
      organizationId: "org-001",
      email: "retail@hostpilotpro.com",
      firstName: "Retail",
      lastName: "Agent",
      profileImageUrl: null,
      primaryRole: "retail_agent",
      subRole: null,
      listingsAccess: ["villa_majesta", "villa_tramonto", "villa_solana", "villa_serenity"],
      groups: ["Sales Team"],
      dashboardAlerts: true,
      emailAlerts: true,
      smsAlerts: true,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T14:15:00Z"),
      lastSeenAt: new Date("2025-01-05T14:15:00Z"),
      createdBy: "admin-001",
      updatedBy: "pm-001",
      createdAt: new Date("2025-01-04T09:00:00Z"),
      updatedAt: new Date("2025-01-05T14:15:00Z")
    },
    {
      id: "referral-001",
      organizationId: "org-001",
      email: "referral@hostpilotpro.com",
      firstName: "Referral",
      lastName: "Agent",
      profileImageUrl: null,
      primaryRole: "referral_agent",
      subRole: null,
      listingsAccess: ["villa_majesta", "villa_solana"],
      groups: ["Sales Team"],
      dashboardAlerts: true,
      emailAlerts: false,
      smsAlerts: false,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T13:30:00Z"),
      lastSeenAt: new Date("2025-01-05T13:30:00Z"),
      createdBy: "admin-001",
      updatedBy: "pm-001",
      createdAt: new Date("2025-01-04T11:00:00Z"),
      updatedAt: new Date("2025-01-05T13:30:00Z")
    },
    {
      id: "housekeeping-001",
      organizationId: "org-001",
      email: "housekeeping@hostpilotpro.com",
      firstName: "Maria",
      lastName: "Housekeeper",
      profileImageUrl: null,
      primaryRole: "housekeeping",
      subRole: "lead_housekeeper",
      listingsAccess: ["villa_tramonto", "villa_solana"],
      groups: ["Staff", "Housekeeping Team"],
      dashboardAlerts: true,
      emailAlerts: false,
      smsAlerts: true,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T12:45:00Z"),
      lastSeenAt: new Date("2025-01-05T12:45:00Z"),
      createdBy: "pm-001",
      updatedBy: "pm-001",
      createdAt: new Date("2025-01-04T08:00:00Z"),
      updatedAt: new Date("2025-01-05T12:45:00Z")
    },
    {
      id: "maintenance-001",
      organizationId: "org-001",
      email: "maintenance@hostpilotpro.com",
      firstName: "John",
      lastName: "Maintenance",
      profileImageUrl: null,
      primaryRole: "maintenance",
      subRole: "handyman",
      listingsAccess: ["villa_majesta", "villa_tramonto", "villa_solana", "villa_serenity"],
      groups: ["Staff", "Maintenance Team"],
      dashboardAlerts: true,
      emailAlerts: false,
      smsAlerts: true,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T11:20:00Z"),
      lastSeenAt: new Date("2025-01-05T11:20:00Z"),
      createdBy: "pm-001",
      updatedBy: "pm-001",
      createdAt: new Date("2025-01-04T07:30:00Z"),
      updatedAt: new Date("2025-01-05T11:20:00Z")
    },
    {
      id: "supervisor-001",
      organizationId: "org-001",
      email: "supervisor@hostpilotpro.com",
      firstName: "Sarah",
      lastName: "Supervisor",
      profileImageUrl: null,
      primaryRole: "supervisor",
      subRole: "operations_manager",
      listingsAccess: ["villa_majesta", "villa_tramonto"],
      groups: ["Supervisors", "Adam Portfolio"],
      dashboardAlerts: true,
      emailAlerts: true,
      smsAlerts: true,
      isActive: true,
      lastLoginAt: new Date("2025-01-05T10:30:00Z"),
      lastSeenAt: new Date("2025-01-05T10:30:00Z"),
      createdBy: "admin-001",
      updatedBy: "admin-001",
      createdAt: new Date("2025-01-03T16:00:00Z"),
      updatedAt: new Date("2025-01-05T10:30:00Z")
    }
  ];

  private permissions: UserPermissionsMatrix[] = [];
  private groups: UserGroup[] = [
    {
      id: 1,
      organizationId: "org-001",
      name: "System Administrators",
      description: "Full system access for administrators",
      color: "#DC2626",
      icon: "Crown",
      defaultPermissions: {},
      listingsAccess: [],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 2,
      organizationId: "org-001",
      name: "Portfolio Managers",
      description: "Property portfolio management team",
      color: "#7C3AED",
      icon: "BarChart3",
      defaultPermissions: {},
      listingsAccess: [],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 3,
      organizationId: "org-001",
      name: "Property Owners",
      description: "Villa and property owners",
      color: "#2563EB",
      icon: "Building",
      defaultPermissions: {},
      listingsAccess: [],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 4,
      organizationId: "org-001",
      name: "Sales Team",
      description: "Retail and referral agents",
      color: "#059669",
      icon: "Users",
      defaultPermissions: {},
      listingsAccess: [],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 5,
      organizationId: "org-001",
      name: "Staff",
      description: "Property maintenance and housekeeping staff",
      color: "#6B7280",
      icon: "Wrench",
      defaultPermissions: {},
      listingsAccess: [],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 6,
      organizationId: "org-001",
      name: "Adam Portfolio",
      description: "Properties managed by Adam",
      color: "#F59E0B",
      icon: "Star",
      defaultPermissions: {},
      listingsAccess: ["villa_majesta", "villa_tramonto"],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    },
    {
      id: 7,
      organizationId: "org-001",
      name: "Tramonto Owners",
      description: "Owners of Villa Tramonto",
      color: "#EC4899",
      icon: "Home",
      defaultPermissions: {},
      listingsAccess: ["villa_tramonto"],
      createdBy: "admin-001",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z")
    }
  ];

  private groupMemberships: UserGroupMembership[] = [];
  private activityLogs: UserActivityLog[] = [];

  constructor() {
    // Initialize permissions for all users based on their roles
    this.initializeDefaultPermissions();
    
    // Initialize group memberships
    this.initializeGroupMemberships();
    
    // Initialize some activity logs
    this.initializeActivityLogs();
  }

  private initializeDefaultPermissions() {
    this.users.forEach(user => {
      PERMISSION_MODULES.forEach(module => {
        const roleTemplate = ROLE_PERMISSION_TEMPLATES[user.primaryRole as UserRoleType];
        if (roleTemplate && roleTemplate[module]) {
          const template = roleTemplate[module];
          this.permissions.push({
            id: this.permissions.length + 1,
            organizationId: user.organizationId,
            userId: user.id,
            module,
            canView: template.canView,
            canModify: template.canModify,
            canCreate: template.canCreate,
            canDelete: template.canDelete,
            canImpersonate: user.primaryRole === 'admin',
            canAccessAllListings: user.primaryRole === 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    });
  }

  private initializeGroupMemberships() {
    this.users.forEach(user => {
      user.groups.forEach(groupName => {
        const group = this.groups.find(g => g.name === groupName);
        if (group) {
          this.groupMemberships.push({
            id: this.groupMemberships.length + 1,
            organizationId: user.organizationId,
            userId: user.id,
            groupId: group.id,
            role: "member",
            joinedAt: new Date()
          });
        }
      });
    });
  }

  private initializeActivityLogs() {
    const activities = [
      { userId: "admin-001", action: "login", module: "dashboard", details: { ip: "192.168.1.100" } },
      { userId: "pm-001", action: "view", module: "listings", details: { resourceId: "villa_majesta" } },
      { userId: "owner-001", action: "view", module: "financial_reporting", details: { period: "monthly" } },
      { userId: "retail-001", action: "create", module: "reservations", details: { bookingId: "BK-001" } },
      { userId: "admin-001", action: "impersonate", module: "user_management", details: { targetUserId: "owner-001" } }
    ];

    activities.forEach((activity, index) => {
      this.activityLogs.push({
        id: index + 1,
        organizationId: "org-001",
        userId: activity.userId,
        impersonatedUserId: activity.action === "impersonate" ? activity.details.targetUserId : null,
        action: activity.action,
        module: activity.module,
        resourceId: activity.details.resourceId || null,
        resourceType: activity.module,
        details: activity.details,
        ipAddress: activity.details.ip || "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - Math.random() * 86400000) // Random time within last 24 hours
      });
    });
  }

  // User Management Methods
  async getAllUsers(organizationId: string): Promise<UserManagement[]> {
    return this.users.filter(user => user.organizationId === organizationId);
  }

  async getUserById(id: string, organizationId: string): Promise<UserManagement | undefined> {
    return this.users.find(user => user.id === id && user.organizationId === organizationId);
  }

  async getUserWithPermissions(id: string, organizationId: string): Promise<UserManagementWithPermissions | undefined> {
    const user = await this.getUserById(id, organizationId);
    if (!user) return undefined;

    const permissions = this.permissions.filter(p => p.userId === id);
    const userGroups = this.groupMemberships
      .filter(gm => gm.userId === id)
      .map(gm => this.groups.find(g => g.id === gm.groupId))
      .filter(Boolean) as UserGroup[];
    const activityLogs = this.activityLogs.filter(al => al.userId === id).slice(0, 10); // Last 10 activities

    return {
      ...user,
      permissions,
      groups: userGroups,
      activityLogs
    };
  }

  async createUser(userData: InsertUserManagement): Promise<UserManagement> {
    const newUser: UserManagement = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);

    // Initialize default permissions for the new user
    PERMISSION_MODULES.forEach(module => {
      const roleTemplate = ROLE_PERMISSION_TEMPLATES[userData.primaryRole as UserRoleType];
      if (roleTemplate && roleTemplate[module]) {
        const template = roleTemplate[module];
        this.permissions.push({
          id: this.permissions.length + 1,
          organizationId: userData.organizationId,
          userId: newUser.id,
          module,
          canView: template.canView,
          canModify: template.canModify,
          canCreate: template.canCreate,
          canDelete: template.canDelete,
          canImpersonate: userData.primaryRole === 'admin',
          canAccessAllListings: userData.primaryRole === 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    return newUser;
  }

  async updateUser(id: string, organizationId: string, updates: Partial<InsertUserManagement>): Promise<UserManagement | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id && user.organizationId === organizationId);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.users[userIndex];
  }

  async deleteUser(id: string, organizationId: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id && user.organizationId === organizationId);
    if (userIndex === -1) return false;

    // Remove user
    this.users.splice(userIndex, 1);
    
    // Remove associated permissions
    this.permissions = this.permissions.filter(p => p.userId !== id);
    
    // Remove group memberships
    this.groupMemberships = this.groupMemberships.filter(gm => gm.userId !== id);

    return true;
  }

  // Permission Methods
  async getUserPermissions(userId: string, organizationId: string): Promise<UserPermissionsMatrix[]> {
    return this.permissions.filter(p => p.userId === userId && p.organizationId === organizationId);
  }

  async updateUserPermission(userId: string, module: PermissionModule, permissions: Partial<UserPermissionsMatrix>): Promise<boolean> {
    const permissionIndex = this.permissions.findIndex(p => p.userId === userId && p.module === module);
    if (permissionIndex === -1) return false;

    this.permissions[permissionIndex] = {
      ...this.permissions[permissionIndex],
      ...permissions,
      updatedAt: new Date()
    };

    return true;
  }

  async bulkUpdateUserPermissions(userId: string, organizationId: string, permissionUpdates: Array<{ module: PermissionModule; permissions: Partial<UserPermissionsMatrix> }>): Promise<boolean> {
    try {
      for (const update of permissionUpdates) {
        await this.updateUserPermission(userId, update.module, update.permissions);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Group Methods
  async getAllGroups(organizationId: string): Promise<UserGroup[]> {
    return this.groups.filter(group => group.organizationId === organizationId);
  }

  async createGroup(groupData: InsertUserGroup): Promise<UserGroup> {
    const newGroup: UserGroup = {
      id: this.groups.length + 1,
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.groups.push(newGroup);
    return newGroup;
  }

  async addUserToGroup(userId: string, groupId: number, organizationId: string, role: string = "member"): Promise<boolean> {
    // Check if membership already exists
    const existingMembership = this.groupMemberships.find(
      gm => gm.userId === userId && gm.groupId === groupId
    );
    if (existingMembership) return false;

    this.groupMemberships.push({
      id: this.groupMemberships.length + 1,
      organizationId,
      userId,
      groupId,
      role,
      joinedAt: new Date()
    });

    return true;
  }

  async removeUserFromGroup(userId: string, groupId: number): Promise<boolean> {
    const membershipIndex = this.groupMemberships.findIndex(
      gm => gm.userId === userId && gm.groupId === groupId
    );
    if (membershipIndex === -1) return false;

    this.groupMemberships.splice(membershipIndex, 1);
    return true;
  }

  // Activity Log Methods
  async logActivity(activityData: InsertUserActivityLog): Promise<UserActivityLog> {
    const newActivity: UserActivityLog = {
      id: this.activityLogs.length + 1,
      ...activityData,
      timestamp: new Date()
    };

    this.activityLogs.push(newActivity);
    return newActivity;
  }

  async getUserActivityLogs(userId: string, organizationId: string, limit: number = 50): Promise<UserActivityLog[]> {
    return this.activityLogs
      .filter(log => log.userId === userId && log.organizationId === organizationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getSystemActivityLogs(organizationId: string, limit: number = 100): Promise<UserActivityLog[]> {
    return this.activityLogs
      .filter(log => log.organizationId === organizationId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Utility Methods
  async getUsersByRole(role: UserRoleType, organizationId: string): Promise<UserManagement[]> {
    return this.users.filter(user => user.primaryRole === role && user.organizationId === organizationId);
  }

  async getUsersByListingAccess(listingId: string, organizationId: string): Promise<UserManagement[]> {
    return this.users.filter(user => 
      user.organizationId === organizationId && 
      (user.listingsAccess.includes(listingId) || user.primaryRole === 'admin')
    );
  }

  async checkUserPermission(userId: string, module: PermissionModule, action: 'view' | 'modify' | 'create' | 'delete'): Promise<boolean> {
    const permission = this.permissions.find(p => p.userId === userId && p.module === module);
    if (!permission) return false;

    switch (action) {
      case 'view': return permission.canView;
      case 'modify': return permission.canModify;
      case 'create': return permission.canCreate;
      case 'delete': return permission.canDelete;
      default: return false;
    }
  }

  async canUserAccessListing(userId: string, listingId: string): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    // Admin can access all listings
    if (user.primaryRole === 'admin') return true;

    // Check if user has direct access to the listing
    return user.listingsAccess.includes(listingId);
  }

  // Statistics and Analytics
  async getUserStats(organizationId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentActivity: number;
  }> {
    const orgUsers = this.users.filter(u => u.organizationId === organizationId);
    const activeUsers = orgUsers.filter(u => u.isActive);
    
    const usersByRole = orgUsers.reduce((acc, user) => {
      acc[user.primaryRole] = (acc[user.primaryRole] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = this.activityLogs.filter(
      log => log.organizationId === organizationId && log.timestamp > twentyFourHoursAgo
    ).length;

    return {
      totalUsers: orgUsers.length,
      activeUsers: activeUsers.length,
      usersByRole,
      recentActivity
    };
  }
}

export const userManagementStorage = new UserManagementStorage();