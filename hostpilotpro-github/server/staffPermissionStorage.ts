interface StaffTaskPermission {
  id: number;
  organizationId: string;
  staffUserId: string;
  canCreateTasks: boolean;
  canEditOwnTasks: boolean;
  canDeleteOwnTasks: boolean;
  canViewAllTasks: boolean;
  maxTasksPerDay: number;
  allowedDepartments: string[];
  requiresApproval: boolean;
  grantedBy: string;
  reason: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class StaffPermissionStorage {
  private permissions: Map<string, StaffTaskPermission> = new Map();
  private taskCreationCount: Map<string, { date: string; count: number }> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize demo permissions for staff-pool user
    const demoPermission: StaffTaskPermission = {
      id: 1,
      organizationId: 'default-org',
      staffUserId: 'staff-pool',
      canCreateTasks: false, // Initially disabled - admin must enable
      canEditOwnTasks: true,
      canDeleteOwnTasks: false,
      canViewAllTasks: true,
      maxTasksPerDay: 3,
      allowedDepartments: ['cleaning', 'maintenance', 'general'],
      requiresApproval: true,
      grantedBy: 'admin',
      reason: 'Standard staff permissions',
      isActive: true,
      expiresAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.permissions.set('staff-pool', demoPermission);
  }

  // Get staff task permissions
  getStaffPermissions(staffUserId: string): StaffTaskPermission | null {
    return this.permissions.get(staffUserId) || null;
  }

  // Check if staff can create tasks
  canStaffCreateTasks(staffUserId: string): boolean {
    const permission = this.getStaffPermissions(staffUserId);
    if (!permission || !permission.isActive) return false;
    
    // Check if permission has expired
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      return false;
    }
    
    return permission.canCreateTasks;
  }

  // Check daily task limit
  canStaffCreateMoreTasks(staffUserId: string): boolean {
    const permission = this.getStaffPermissions(staffUserId);
    if (!permission) return false;

    const today = new Date().toISOString().split('T')[0];
    const countData = this.taskCreationCount.get(staffUserId);
    
    if (!countData || countData.date !== today) {
      // Reset count for new day
      this.taskCreationCount.set(staffUserId, { date: today, count: 0 });
      return true;
    }
    
    return countData.count < permission.maxTasksPerDay;
  }

  // Increment task creation count
  incrementTaskCount(staffUserId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const countData = this.taskCreationCount.get(staffUserId);
    
    if (!countData || countData.date !== today) {
      this.taskCreationCount.set(staffUserId, { date: today, count: 1 });
    } else {
      countData.count++;
    }
  }

  // Check if staff can create tasks for specific department
  canStaffCreateTaskForDepartment(staffUserId: string, department: string): boolean {
    const permission = this.getStaffPermissions(staffUserId);
    if (!permission) return false;
    
    return permission.allowedDepartments.includes(department) || 
           permission.allowedDepartments.includes('all');
  }

  // Update staff permissions (admin only)
  updateStaffPermissions(staffUserId: string, updates: Partial<StaffTaskPermission>, updatedBy: string): StaffTaskPermission {
    const existing = this.getStaffPermissions(staffUserId);
    
    const updated: StaffTaskPermission = {
      ...(existing || {
        id: Date.now(),
        organizationId: 'default-org',
        staffUserId,
        canCreateTasks: false,
        canEditOwnTasks: true,
        canDeleteOwnTasks: false,
        canViewAllTasks: true,
        maxTasksPerDay: 3,
        allowedDepartments: ['general'],
        requiresApproval: true,
        grantedBy: updatedBy,
        reason: 'Permission update',
        isActive: true,
        createdAt: new Date(),
      }),
      ...updates,
      updatedAt: new Date(),
    };

    this.permissions.set(staffUserId, updated);
    return updated;
  }

  // Get all staff permissions (admin only)
  getAllStaffPermissions(): StaffTaskPermission[] {
    return Array.from(this.permissions.values());
  }

  // Grant task creation permission to staff
  grantTaskCreationPermission(
    staffUserId: string, 
    grantedBy: string, 
    reason: string,
    departments: string[] = ['general'],
    maxTasksPerDay: number = 3,
    expiresAt?: Date
  ): StaffTaskPermission {
    return this.updateStaffPermissions(staffUserId, {
      canCreateTasks: true,
      allowedDepartments: departments,
      maxTasksPerDay,
      grantedBy,
      reason,
      expiresAt,
      isActive: true,
    }, grantedBy);
  }

  // Revoke task creation permission
  revokeTaskCreationPermission(staffUserId: string, revokedBy: string, reason: string): StaffTaskPermission {
    return this.updateStaffPermissions(staffUserId, {
      canCreateTasks: false,
      grantedBy: revokedBy,
      reason,
      isActive: false,
    }, revokedBy);
  }
}

export const staffPermissionStorage = new StaffPermissionStorage();