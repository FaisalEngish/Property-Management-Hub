import { Router } from "express";
import { db } from "./db";
import { tasks, properties, users, bookings } from "@shared/schema";
import { and, eq, gte, lte, sql, isNull, or } from "drizzle-orm";
import { isDemoAuthenticated } from "./demoAuth";

const router = Router();

// Helper function to get date range for a given date
function getDateRange(dateString: string) {
  const date = new Date(dateString);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
}

// GET /api/daily-operations/summary/:date
// Returns high-level summary of operations for a specific date
router.get("/summary/:date", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { date } = req.params;
    const { organizationId } = req.user;
    const { startOfDay, endOfDay } = getDateRange(date);

    // Fetch all tasks for the date
    const dateTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      );

    // Calculate department-specific metrics
    const cleaningTasks = dateTasks.filter(t => 
      t.department?.toLowerCase() === 'cleaning' || 
      t.department?.toLowerCase() === 'housekeeping' ||
      t.type?.toLowerCase() === 'cleaning'
    );
    const poolTasks = dateTasks.filter(t => 
      t.department?.toLowerCase() === 'pool' ||
      t.type?.toLowerCase() === 'pool-service'
    );
    const gardenTasks = dateTasks.filter(t => 
      t.department?.toLowerCase() === 'garden' || 
      t.department?.toLowerCase() === 'landscaping' ||
      t.type?.toLowerCase() === 'garden'
    );
    const maintenanceTasks = dateTasks.filter(t => 
      t.department?.toLowerCase() === 'maintenance' ||
      t.type?.toLowerCase() === 'maintenance'
    );
    const generalTasks = dateTasks.filter(t => 
      !['cleaning', 'housekeeping', 'pool', 'garden', 'landscaping', 'maintenance'].includes(t.department?.toLowerCase() || '') &&
      !['cleaning', 'pool-service', 'garden', 'maintenance'].includes(t.type?.toLowerCase() || '')
    );

    // Count completed tasks by department
    const cleaningCompleted = cleaningTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const poolCompleted = poolTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const gardenCompleted = gardenTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const maintenanceCompleted = maintenanceTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const generalCompleted = generalTasks.filter(t => t.status?.toLowerCase() === 'completed').length;

    // Calculate urgency metrics
    const now = new Date();
    const overdueTasks = dateTasks.filter(t => 
      t.status?.toLowerCase() !== 'completed' && 
      t.status?.toLowerCase() !== 'cancelled' &&
      t.dueDate && new Date(t.dueDate) < now
    ).length;

    const tasksWithoutProof = dateTasks.filter(t => 
      t.status?.toLowerCase() === 'completed' &&
      (!t.evidencePhotos || t.evidencePhotos.length === 0)
    ).length;

    const unassignedTasks = dateTasks.filter(t => !t.assignedTo).length;

    // Check for uncleaned check-in properties
    const checkInsToday = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.organizationId, organizationId),
          gte(bookings.checkIn, startOfDay),
          lte(bookings.checkIn, endOfDay)
        )
      );

    let uncleanedCheckinProperties = 0;
    if (checkInsToday.length > 0) {
      // Check if there are cleaning tasks for these properties
      for (const booking of checkInsToday) {
        const cleaningTask = dateTasks.find(t => 
          t.propertyId === booking.propertyId &&
          (t.type?.toLowerCase() === 'cleaning' || t.department?.toLowerCase() === 'cleaning') &&
          t.status?.toLowerCase() === 'completed'
        );
        if (!cleaningTask) {
          uncleanedCheckinProperties++;
        }
      }
    }

    // Get unique staff assigned
    const uniqueStaff = new Set(dateTasks.map(t => t.assignedTo).filter(Boolean));
    const totalStaffScheduled = uniqueStaff.size;

    const summary = {
      id: 1, // Dummy ID for consistency
      organizationId,
      operationDate: date,
      cleaningTasks: cleaningTasks.length,
      cleaningCompleted,
      poolTasks: poolTasks.length,
      poolCompleted,
      gardenTasks: gardenTasks.length,
      gardenCompleted,
      maintenanceTasks: maintenanceTasks.length,
      maintenanceCompleted,
      generalTasks: generalTasks.length,
      generalCompleted,
      overdueTasks,
      tasksWithoutProof,
      uncleanedCheckinProperties,
      unassignedTasks,
      totalStaffScheduled,
      totalTasksAssigned: dateTasks.length,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    res.json(summary);
  } catch (error: any) {
    console.error("Error fetching daily operations summary:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/daily-operations/staff/:date
// Returns staff assignments and performance for a specific date
router.get("/staff/:date", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { date } = req.params;
    const { organizationId } = req.user;
    const { startOfDay, endOfDay } = getDateRange(date);

    // Fetch all tasks for the date
    const dateTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      );

    // Get all staff members who have tasks
    const staffIds = [...new Set(dateTasks.map(t => t.assignedTo).filter(Boolean))];

    // Fetch staff details
    const staffDetails = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.organizationId, organizationId),
          sql`${users.id} = ANY(${staffIds})`
        )
      );

    // Build staff assignments
    const staffAssignments = staffIds.map((staffId, index) => {
      const staffTasks = dateTasks.filter(t => t.assignedTo === staffId);
      const completedTasks = staffTasks.filter(t => t.status?.toLowerCase() === 'completed');
      const staff = staffDetails.find(s => s.id === staffId);

      // Determine department focus
      const deptCounts: { [key: string]: number } = {};
      staffTasks.forEach(t => {
        const dept = t.department || 'general';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      const departmentFocus = Object.keys(deptCounts).length > 0 
        ? Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

      // Calculate average completion time
      const completedWithTimes = completedTasks.filter(t => t.completedAt);
      let avgCompletionTime = null;
      if (completedWithTimes.length > 0) {
        const totalTime = completedWithTimes.reduce((sum, t) => {
          const created = new Date(t.createdAt!).getTime();
          const completed = new Date(t.completedAt!).getTime();
          return sum + (completed - created);
        }, 0);
        avgCompletionTime = Math.round(totalTime / completedWithTimes.length / (1000 * 60)); // minutes
      }

      const completionRate = staffTasks.length > 0
        ? ((completedTasks.length / staffTasks.length) * 100).toFixed(1) + '%'
        : '0%';

      return {
        id: index + 1,
        organizationId,
        staffId: staffId!,
        staffName: staff ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.email : `Staff ${staffId}`,
        operationDate: date,
        shiftStart: null, // Could be enhanced with actual shift data
        shiftEnd: null,
        isAvailable: true,
        unavailableReason: null,
        totalTasksAssigned: staffTasks.length,
        totalTasksCompleted: completedTasks.length,
        departmentFocus,
        avgTaskCompletionTime: avgCompletionTime,
        taskCompletionRate: completionRate,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    res.json(staffAssignments);
  } catch (error: any) {
    console.error("Error fetching staff assignments:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/daily-operations/properties/:date
// Returns property operations for a specific date
router.get("/properties/:date", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { date } = req.params;
    const { organizationId } = req.user;
    const { startOfDay, endOfDay } = getDateRange(date);

    // Fetch all tasks for the date
    const dateTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      );

    // Get unique properties with tasks
    const propertyIds = [...new Set(dateTasks.map(t => t.propertyId).filter(Boolean))];

    // Fetch property details
    const propertiesData = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.organizationId, organizationId),
          sql`${properties.id} = ANY(${propertyIds})`
        )
      );

    // Fetch bookings for these properties on this date
    const propertyBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.organizationId, organizationId),
          or(
            and(
              gte(bookings.checkIn, startOfDay),
              lte(bookings.checkIn, endOfDay)
            ),
            and(
              gte(bookings.checkOut, startOfDay),
              lte(bookings.checkOut, endOfDay)
            )
          )
        )
      );

    // Build property operations
    const propertyOps = propertyIds.map((propId, index) => {
      const property = propertiesData.find(p => p.id === propId);
      const propTasks = dateTasks.filter(t => t.propertyId === propId);
      const propBookings = propertyBookings.filter(b => b.propertyId === propId);

      // Check for check-in/check-out
      const hasCheckin = propBookings.some(b => {
        const checkIn = new Date(b.checkIn);
        return checkIn >= startOfDay && checkIn <= endOfDay;
      });
      const hasCheckout = propBookings.some(b => {
        const checkOut = new Date(b.checkOut);
        return checkOut >= startOfDay && checkOut <= endOfDay;
      });

      const checkinTime = hasCheckin 
        ? propBookings.find(b => new Date(b.checkIn) >= startOfDay && new Date(b.checkIn) <= endOfDay)?.checkIn 
        : null;
      const checkoutTime = hasCheckout 
        ? propBookings.find(b => new Date(b.checkOut) >= startOfDay && new Date(b.checkOut) <= endOfDay)?.checkOut 
        : null;

      // Cleaning status
      const cleaningTasks = propTasks.filter(t => 
        t.type?.toLowerCase() === 'cleaning' || 
        t.department?.toLowerCase() === 'cleaning' ||
        t.department?.toLowerCase() === 'housekeeping'
      );
      const needsCleaning = hasCheckin || hasCheckout || cleaningTasks.length > 0;
      const cleaningCompleted = cleaningTasks.some(t => t.status?.toLowerCase() === 'completed');
      const cleaningCompletedAt = cleaningTasks.find(t => t.status?.toLowerCase() === 'completed')?.completedAt;
      const cleaningStaffId = cleaningTasks.find(t => t.status?.toLowerCase() === 'completed')?.assignedTo;

      // Maintenance tasks
      const maintenanceTasks = propTasks.filter(t => 
        t.type?.toLowerCase() === 'maintenance' || 
        t.department?.toLowerCase() === 'maintenance'
      );
      const maintenanceCompleted = maintenanceTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
      const now = new Date();
      const maintenanceOverdue = maintenanceTasks.filter(t => 
        t.status?.toLowerCase() !== 'completed' && 
        t.dueDate && new Date(t.dueDate) < now
      ).length;

      // Recurring services
      const recurringTasks = propTasks.filter(t => t.isRecurring);
      const recurringCompleted = recurringTasks.filter(t => t.status?.toLowerCase() === 'completed').length;

      // Urgency check
      const isUrgent = (hasCheckin && !cleaningCompleted) || maintenanceOverdue > 0;
      const urgencyReason = isUrgent
        ? hasCheckin && !cleaningCompleted
          ? 'Check-in today but cleaning not completed'
          : 'Overdue maintenance tasks'
        : null;

      // Operation status
      let operationStatus = 'on-track';
      if (isUrgent) operationStatus = 'urgent';
      else if (propTasks.length > 0 && propTasks.every(t => t.status?.toLowerCase() === 'completed')) {
        operationStatus = 'completed';
      } else if (propTasks.some(t => t.status?.toLowerCase() === 'in-progress')) {
        operationStatus = 'in-progress';
      }

      return {
        id: index + 1,
        organizationId,
        propertyId: propId!,
        propertyName: property?.name || `Property ${propId}`,
        propertyAddress: property?.address || '',
        operationDate: date,
        hasCheckin,
        checkinTime: checkinTime ? new Date(checkinTime).toISOString() : null,
        hasCheckout,
        checkoutTime: checkoutTime ? new Date(checkoutTime).toISOString() : null,
        needsCleaning,
        cleaningCompleted,
        cleaningCompletedAt: cleaningCompletedAt ? new Date(cleaningCompletedAt).toISOString() : null,
        cleaningStaffId,
        maintenanceTasks: maintenanceTasks.length,
        maintenanceCompleted,
        maintenanceOverdue,
        recurringServices: recurringTasks.length,
        recurringCompleted,
        isUrgent,
        urgencyReason,
        operationStatus,
        statusNotes: null,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    });

    res.json(propertyOps);
  } catch (error: any) {
    console.error("Error fetching property operations:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/daily-operations/tasks/:date
// Returns detailed task list for a specific date
router.get("/tasks/:date", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { date } = req.params;
    const { organizationId } = req.user;
    const { startOfDay, endOfDay } = getDateRange(date);

    // Fetch all tasks for the date with joins
    const dateTasks = await db
      .select({
        task: tasks,
        property: properties,
        assignee: users,
      })
      .from(tasks)
      .leftJoin(properties, eq(tasks.propertyId, properties.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(
        and(
          eq(tasks.organizationId, organizationId),
          gte(tasks.dueDate, startOfDay),
          lte(tasks.dueDate, endOfDay)
        )
      );

    const now = new Date();

    const formattedTasks = dateTasks.map(({ task, property, assignee }) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      department: task.department,
      propertyId: task.propertyId,
      propertyName: property?.name || null,
      assignedTo: task.assignedTo,
      assignedUserName: assignee 
        ? `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email
        : null,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      evidencePhotos: task.evidencePhotos || [],
      createdAt: new Date(task.createdAt!).toISOString(),
      isOverdue: task.status?.toLowerCase() !== 'completed' && 
                 task.status?.toLowerCase() !== 'cancelled' &&
                 task.dueDate ? new Date(task.dueDate) < now : false,
      hasProof: task.evidencePhotos && task.evidencePhotos.length > 0,
    }));

    res.json(formattedTasks);
  } catch (error: any) {
    console.error("Error fetching daily tasks:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/daily-operations/refresh/:date
// Force refresh/recalculate data for a specific date
router.post("/refresh/:date", isDemoAuthenticated, async (req: any, res) => {
  try {
    const { date } = req.params;
    
    // In a real implementation, this might trigger background jobs
    // or clear caches. For now, we'll just return success
    // The frontend will refetch the data automatically
    
    res.json({ 
      success: true, 
      message: 'Data refresh triggered',
      date 
    });
  } catch (error: any) {
    console.error("Error refreshing daily operations:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
