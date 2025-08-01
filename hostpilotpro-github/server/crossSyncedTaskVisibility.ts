import { db } from "./db";
import { eq, and, gte, lte, asc, desc, like, or, isNull, isNotNull } from "drizzle-orm";
import {
  guestServiceRequests,
  guestConfirmedServices,
  bookingLinkedTasks,
  tasks,
  bookings,
  properties,
  users,
  addonBookings,
  type GuestServiceRequest,
  type InsertGuestServiceRequest,
  type GuestConfirmedService,
  type InsertGuestConfirmedService,
  type BookingLinkedTask,
  type InsertBookingLinkedTask,
  type Task,
  type Booking,
  type Property,
} from "@shared/schema";

export class CrossSyncedTaskVisibilityStorage {
  organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // ===== GUEST SERVICE REQUESTS =====

  async getGuestServiceRequests(filters?: {
    bookingId?: number;
    reservationId?: string;
    propertyId?: number;
    status?: string;
    requestType?: string;
    assignedDepartment?: string;
    isVisible?: boolean;
  }): Promise<GuestServiceRequest[]> {
    let query = db
      .select()
      .from(guestServiceRequests)
      .where(eq(guestServiceRequests.organizationId, this.organizationId));

    if (filters?.bookingId) {
      query = query.where(eq(guestServiceRequests.bookingId, filters.bookingId));
    }
    if (filters?.reservationId) {
      query = query.where(eq(guestServiceRequests.reservationId, filters.reservationId));
    }
    if (filters?.propertyId) {
      query = query.where(eq(guestServiceRequests.propertyId, filters.propertyId));
    }
    if (filters?.status) {
      query = query.where(eq(guestServiceRequests.status, filters.status));
    }
    if (filters?.requestType) {
      query = query.where(eq(guestServiceRequests.requestType, filters.requestType));
    }
    if (filters?.assignedDepartment) {
      query = query.where(eq(guestServiceRequests.assignedDepartment, filters.assignedDepartment));
    }
    if (filters?.isVisible !== undefined) {
      query = query.where(eq(guestServiceRequests.isVisible, filters.isVisible));
    }

    return query.orderBy(desc(guestServiceRequests.createdAt));
  }

  async getGuestServiceRequest(id: number): Promise<GuestServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(guestServiceRequests)
      .where(and(
        eq(guestServiceRequests.id, id),
        eq(guestServiceRequests.organizationId, this.organizationId)
      ));
    return request;
  }

  async createGuestServiceRequest(request: InsertGuestServiceRequest): Promise<GuestServiceRequest> {
    const [newRequest] = await db
      .insert(guestServiceRequests)
      .values({ ...request, organizationId: this.organizationId })
      .returning();
    return newRequest;
  }

  async updateGuestServiceRequest(id: number, updates: Partial<InsertGuestServiceRequest>): Promise<GuestServiceRequest | undefined> {
    const [updated] = await db
      .update(guestServiceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(guestServiceRequests.id, id),
        eq(guestServiceRequests.organizationId, this.organizationId)
      ))
      .returning();
    return updated;
  }

  async deleteGuestServiceRequest(id: number): Promise<boolean> {
    const result = await db
      .delete(guestServiceRequests)
      .where(and(
        eq(guestServiceRequests.id, id),
        eq(guestServiceRequests.organizationId, this.organizationId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // ===== GUEST CONFIRMED SERVICES =====

  async getGuestConfirmedServices(filters?: {
    bookingId?: number;
    reservationId?: string;
    propertyId?: number;
    serviceType?: string;
    scheduledDate?: string;
    isActive?: boolean;
    isCompleted?: boolean;
  }): Promise<GuestConfirmedService[]> {
    let query = db
      .select()
      .from(guestConfirmedServices)
      .where(eq(guestConfirmedServices.organizationId, this.organizationId));

    if (filters?.bookingId) {
      query = query.where(eq(guestConfirmedServices.bookingId, filters.bookingId));
    }
    if (filters?.reservationId) {
      query = query.where(eq(guestConfirmedServices.reservationId, filters.reservationId));
    }
    if (filters?.propertyId) {
      query = query.where(eq(guestConfirmedServices.propertyId, filters.propertyId));
    }
    if (filters?.serviceType) {
      query = query.where(eq(guestConfirmedServices.serviceType, filters.serviceType));
    }
    if (filters?.scheduledDate) {
      query = query.where(eq(guestConfirmedServices.scheduledDate, filters.scheduledDate));
    }
    if (filters?.isActive !== undefined) {
      query = query.where(eq(guestConfirmedServices.isActive, filters.isActive));
    }
    if (filters?.isCompleted !== undefined) {
      query = query.where(eq(guestConfirmedServices.isCompleted, filters.isCompleted));
    }

    return query.orderBy(asc(guestConfirmedServices.scheduledDate));
  }

  async getGuestConfirmedService(id: number): Promise<GuestConfirmedService | undefined> {
    const [service] = await db
      .select()
      .from(guestConfirmedServices)
      .where(and(
        eq(guestConfirmedServices.id, id),
        eq(guestConfirmedServices.organizationId, this.organizationId)
      ));
    return service;
  }

  async createGuestConfirmedService(service: InsertGuestConfirmedService): Promise<GuestConfirmedService> {
    const [newService] = await db
      .insert(guestConfirmedServices)
      .values({ ...service, organizationId: this.organizationId })
      .returning();
    return newService;
  }

  async updateGuestConfirmedService(id: number, updates: Partial<InsertGuestConfirmedService>): Promise<GuestConfirmedService | undefined> {
    const [updated] = await db
      .update(guestConfirmedServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(guestConfirmedServices.id, id),
        eq(guestConfirmedServices.organizationId, this.organizationId)
      ))
      .returning();
    return updated;
  }

  async deleteGuestConfirmedService(id: number): Promise<boolean> {
    const result = await db
      .delete(guestConfirmedServices)
      .where(and(
        eq(guestConfirmedServices.id, id),
        eq(guestConfirmedServices.organizationId, this.organizationId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // ===== BOOKING LINKED TASKS =====

  async getBookingLinkedTasks(filters?: {
    taskId?: number;
    bookingId?: number;
    reservationId?: string;
    taskCategory?: string;
    isGuestVisible?: boolean;
    isServiceGenerated?: boolean;
  }): Promise<BookingLinkedTask[]> {
    let query = db
      .select()
      .from(bookingLinkedTasks)
      .where(eq(bookingLinkedTasks.organizationId, this.organizationId));

    if (filters?.taskId) {
      query = query.where(eq(bookingLinkedTasks.taskId, filters.taskId));
    }
    if (filters?.bookingId) {
      query = query.where(eq(bookingLinkedTasks.bookingId, filters.bookingId));
    }
    if (filters?.reservationId) {
      query = query.where(eq(bookingLinkedTasks.reservationId, filters.reservationId));
    }
    if (filters?.taskCategory) {
      query = query.where(eq(bookingLinkedTasks.taskCategory, filters.taskCategory));
    }
    if (filters?.isGuestVisible !== undefined) {
      query = query.where(eq(bookingLinkedTasks.isGuestVisible, filters.isGuestVisible));
    }
    if (filters?.isServiceGenerated !== undefined) {
      query = query.where(eq(bookingLinkedTasks.isServiceGenerated, filters.isServiceGenerated));
    }

    return query.orderBy(desc(bookingLinkedTasks.createdAt));
  }

  async getBookingLinkedTask(id: number): Promise<BookingLinkedTask | undefined> {
    const [linkedTask] = await db
      .select()
      .from(bookingLinkedTasks)
      .where(and(
        eq(bookingLinkedTasks.id, id),
        eq(bookingLinkedTasks.organizationId, this.organizationId)
      ));
    return linkedTask;
  }

  async createBookingLinkedTask(linkedTask: InsertBookingLinkedTask): Promise<BookingLinkedTask> {
    const [newLinkedTask] = await db
      .insert(bookingLinkedTasks)
      .values({ ...linkedTask, organizationId: this.organizationId })
      .returning();
    return newLinkedTask;
  }

  async updateBookingLinkedTask(id: number, updates: Partial<InsertBookingLinkedTask>): Promise<BookingLinkedTask | undefined> {
    const [updated] = await db
      .update(bookingLinkedTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(bookingLinkedTasks.id, id),
        eq(bookingLinkedTasks.organizationId, this.organizationId)
      ))
      .returning();
    return updated;
  }

  async deleteBookingLinkedTask(id: number): Promise<boolean> {
    const result = await db
      .delete(bookingLinkedTasks)
      .where(and(
        eq(bookingLinkedTasks.id, id),
        eq(bookingLinkedTasks.organizationId, this.organizationId)
      ));
    return (result.rowCount || 0) > 0;
  }

  // ===== COMPREHENSIVE CROSS-SYNCED VIEWS =====

  async getGuestVisibleTasks(reservationId: string): Promise<Array<{
    id: number;
    type: 'task' | 'service' | 'addon';
    title: string;
    description: string;
    scheduledDate?: string;
    scheduledTime?: string;
    status: string;
    department?: string;
    isCompleted: boolean;
    estimatedCost?: number;
    linkedId?: number;
  }>> {
    // Get guest visible tasks for this reservation
    const linkedTasks = await db
      .select({
        linkedTask: bookingLinkedTasks,
        task: tasks,
      })
      .from(bookingLinkedTasks)
      .leftJoin(tasks, eq(bookingLinkedTasks.taskId, tasks.id))
      .where(and(
        eq(bookingLinkedTasks.organizationId, this.organizationId),
        eq(bookingLinkedTasks.reservationId, reservationId),
        eq(bookingLinkedTasks.isGuestVisible, true)
      ));

    // Get confirmed services for this reservation
    const confirmedServices = await this.getGuestConfirmedServices({ 
      reservationId, 
      isActive: true 
    });

    // Get service requests for this reservation
    const serviceRequests = await this.getGuestServiceRequests({
      reservationId,
      isVisible: true,
      status: 'approved'
    });

    const result: Array<{
      id: number;
      type: 'task' | 'service' | 'addon';
      title: string;
      description: string;
      scheduledDate?: string;
      scheduledTime?: string;
      status: string;
      department?: string;
      isCompleted: boolean;
      estimatedCost?: number;
      linkedId?: number;
    }> = [];

    // Add guest-visible tasks
    linkedTasks.forEach(({ linkedTask, task }) => {
      if (task) {
        result.push({
          id: linkedTask.id,
          type: 'task',
          title: linkedTask.guestDescription || task.title,
          description: linkedTask.guestDescription || task.description || '',
          scheduledDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
          status: task.status,
          department: task.department || undefined,
          isCompleted: task.status === 'completed',
          estimatedCost: task.estimatedCost ? parseFloat(task.estimatedCost.toString()) : undefined,
          linkedId: task.id
        });
      }
    });

    // Add confirmed services
    confirmedServices.forEach(service => {
      result.push({
        id: service.id,
        type: 'service',
        title: service.serviceName,
        description: service.serviceDescription || '',
        scheduledDate: service.scheduledDate ? new Date(service.scheduledDate).toISOString().split('T')[0] : undefined,
        scheduledTime: service.scheduledTime || undefined,
        status: service.isCompleted ? 'completed' : 'scheduled',
        isCompleted: service.isCompleted,
        linkedId: service.linkedTaskId || undefined
      });
    });

    // Add approved service requests
    serviceRequests.forEach(request => {
      result.push({
        id: request.id,
        type: 'service',
        title: request.serviceName,
        description: request.description || '',
        scheduledDate: request.requestedDate ? new Date(request.requestedDate).toISOString().split('T')[0] : undefined,
        scheduledTime: request.requestedTime || undefined,
        status: request.status,
        department: request.assignedDepartment || undefined,
        isCompleted: request.status === 'completed',
        estimatedCost: request.estimatedCost ? parseFloat(request.estimatedCost.toString()) : undefined,
        linkedId: request.createdTaskId || undefined
      });
    });

    // Sort by scheduled date
    return result.sort((a, b) => {
      if (!a.scheduledDate && !b.scheduledDate) return 0;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });
  }

  async getStaffTasksForReservation(reservationId: string, staffRole?: string): Promise<Array<{
    id: number;
    type: 'task' | 'service_request';
    title: string;
    description: string;
    status: string;
    priority?: string;
    department?: string;
    assignedTo?: string;
    dueDate?: Date;
    estimatedCost?: number;
    isFromGuestRequest: boolean;
    guestVisible: boolean;
    serviceRequestId?: number;
  }>> {
    // Get all tasks linked to this reservation
    const linkedTasks = await db
      .select({
        linkedTask: bookingLinkedTasks,
        task: tasks,
        assignedUser: users,
      })
      .from(bookingLinkedTasks)
      .leftJoin(tasks, eq(bookingLinkedTasks.taskId, tasks.id))
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(and(
        eq(bookingLinkedTasks.organizationId, this.organizationId),
        eq(bookingLinkedTasks.reservationId, reservationId)
      ));

    // Get service requests that need staff attention
    const serviceRequests = await db
      .select({
        request: guestServiceRequests,
        assignedUser: users,
      })
      .from(guestServiceRequests)
      .leftJoin(users, eq(guestServiceRequests.assignedTo, users.id))
      .where(and(
        eq(guestServiceRequests.organizationId, this.organizationId),
        eq(guestServiceRequests.reservationId, reservationId),
        or(
          eq(guestServiceRequests.status, 'requested'),
          eq(guestServiceRequests.status, 'approved'),
          eq(guestServiceRequests.status, 'in_progress')
        )
      ));

    const result: Array<{
      id: number;
      type: 'task' | 'service_request';
      title: string;
      description: string;
      status: string;
      priority?: string;
      department?: string;
      assignedTo?: string;
      dueDate?: Date;
      estimatedCost?: number;
      isFromGuestRequest: boolean;
      guestVisible: boolean;
      serviceRequestId?: number;
    }> = [];

    // Add linked tasks
    linkedTasks.forEach(({ linkedTask, task, assignedUser }) => {
      if (task) {
        result.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority || undefined,
          department: task.department || undefined,
          assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          estimatedCost: task.estimatedCost ? parseFloat(task.estimatedCost.toString()) : undefined,
          isFromGuestRequest: linkedTask.isServiceGenerated,
          guestVisible: linkedTask.isGuestVisible,
          serviceRequestId: linkedTask.serviceRequestId || undefined
        });
      }
    });

    // Add service requests
    serviceRequests.forEach(({ request, assignedUser }) => {
      result.push({
        id: request.id,
        type: 'service_request',
        title: request.serviceName,
        description: request.description || '',
        status: request.status,
        department: request.assignedDepartment || undefined,
        assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : undefined,
        dueDate: request.requestedDate ? new Date(request.requestedDate) : undefined,
        estimatedCost: request.estimatedCost ? parseFloat(request.estimatedCost.toString()) : undefined,
        isFromGuestRequest: true,
        guestVisible: request.isVisible
      });
    });

    // Filter by staff role if provided
    if (staffRole) {
      return result.filter(item => 
        !item.department || 
        item.department.toLowerCase().includes(staffRole.toLowerCase()) ||
        staffRole === 'admin' || 
        staffRole === 'portfolio-manager'
      );
    }

    return result.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  // ===== SERVICE REQUEST PROCESSING =====

  async processServiceRequest(
    requestId: number, 
    action: 'approve' | 'reject' | 'complete',
    data: {
      approvedBy?: string;
      finalCost?: number;
      assignedTo?: string;
      assignedDepartment?: string;
      staffNotes?: string;
      createTask?: boolean;
      taskTitle?: string;
      taskDescription?: string;
      scheduledDate?: Date;
    }
  ): Promise<{ success: boolean; taskId?: number; message?: string }> {
    const request = await this.getGuestServiceRequest(requestId);
    if (!request) {
      return { success: false, message: 'Service request not found' };
    }

    const updateData: Partial<InsertGuestServiceRequest> = {
      staffNotes: data.staffNotes,
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.approvedBy = data.approvedBy;
      updateData.approvedAt = new Date();
      updateData.finalCost = data.finalCost;
      updateData.assignedTo = data.assignedTo;
      updateData.assignedDepartment = data.assignedDepartment;

      // Create task if requested
      if (data.createTask) {
        const [newTask] = await db
          .insert(tasks)
          .values({
            organizationId: this.organizationId,
            title: data.taskTitle || request.serviceName,
            description: data.taskDescription || request.description || '',
            type: 'service-request',
            department: data.assignedDepartment || 'guest-services',
            status: 'pending',
            priority: 'medium',
            propertyId: request.propertyId,
            assignedTo: data.assignedTo,
            createdBy: data.approvedBy,
            dueDate: data.scheduledDate,
            estimatedCost: data.finalCost
          })
          .returning();

        updateData.createdTaskId = newTask.id;

        // Link task to booking
        await this.createBookingLinkedTask({
          taskId: newTask.id,
          bookingId: request.bookingId,
          reservationId: request.reservationId,
          taskCategory: 'during_stay',
          isGuestVisible: true,
          guestDescription: `${request.serviceName} - Your request has been scheduled`,
          serviceRequestId: requestId,
          isServiceGenerated: true
        });

        await this.updateGuestServiceRequest(requestId, updateData);
        return { success: true, taskId: newTask.id, message: 'Service request approved and task created' };
      }
    } else if (action === 'reject') {
      updateData.status = 'cancelled';
      updateData.approvedBy = data.approvedBy;
      updateData.approvedAt = new Date();
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      updateData.finalCost = data.finalCost;
    }

    await this.updateGuestServiceRequest(requestId, updateData);
    return { success: true, message: `Service request ${action}d successfully` };
  }

  // ===== ANALYTICS AND REPORTING =====

  async getReservationTaskSummary(reservationId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    serviceRequests: number;
    completedServiceRequests: number;
    estimatedTotalCost: number;
    departmentBreakdown: Record<string, number>;
  }> {
    const [tasksData, serviceRequestsData] = await Promise.all([
      this.getStaffTasksForReservation(reservationId),
      this.getGuestServiceRequests({ reservationId })
    ]);

    const totalTasks = tasksData.filter(t => t.type === 'task').length;
    const completedTasks = tasksData.filter(t => t.type === 'task' && t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;

    const serviceRequests = serviceRequestsData.length;
    const completedServiceRequests = serviceRequestsData.filter(r => r.status === 'completed').length;

    const estimatedTotalCost = [...tasksData, ...serviceRequestsData].reduce((sum, item) => {
      const cost = 'estimatedCost' in item ? item.estimatedCost : item.estimatedCost;
      return sum + (cost ? parseFloat(cost.toString()) : 0);
    }, 0);

    const departmentBreakdown: Record<string, number> = {};
    [...tasksData, ...serviceRequestsData].forEach(item => {
      const dept = ('department' in item ? item.department : item.assignedDepartment) || 'unassigned';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      serviceRequests,
      completedServiceRequests,
      estimatedTotalCost,
      departmentBreakdown
    };
  }
}