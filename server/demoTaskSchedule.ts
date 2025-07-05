// Comprehensive Task Scheduling Demo Data for HostPilotPro
// This file contains task scheduling data that integrates with the centralized demo configuration

export interface DemoTask {
  id: number;
  reservationId: string;
  taskType: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  assignedRole: string;
  assignedTo: string;
  property: string;
  propertyId: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  evidenceRequired: boolean;
  guestVisible: boolean;
  requiresPhotoUpload?: boolean;
  photoFields?: string[];
  checkInDetails?: any;
  checkOutDetails?: any;
}

// Comprehensive task schedule for all demo reservations
export const COMPREHENSIVE_TASK_SCHEDULE: DemoTask[] = [
  // Demo1234 - John Doe (July 6-10, 2025) at Villa Aruna
  {
    id: 1,
    reservationId: "Demo1234",
    taskType: "housekeeping",
    title: "Pre-Clean for John Doe Check-in",
    description: "Complete pre-arrival cleaning and preparation",
    scheduledDate: "2025-07-06",
    scheduledTime: "12:00",
    duration: "2 hours",
    assignedRole: "housekeeping",
    assignedTo: "Housekeeping Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "high",
    evidenceRequired: true,
    guestVisible: false,
    checkInDetails: {
      guestName: "John Doe",
      checkInTime: "15:00",
      numberOfGuests: 2
    }
  },
  {
    id: 2,
    reservationId: "Demo1234",
    taskType: "host",
    title: "Guest Check-in - John Doe",
    description: "Conduct check-in process with meter reading and deposit collection",
    scheduledDate: "2025-07-06",
    scheduledTime: "15:00",
    duration: "30 minutes",
    assignedRole: "host",
    assignedTo: "Host Manager",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "critical",
    evidenceRequired: true,
    guestVisible: false,
    requiresPhotoUpload: true,
    photoFields: ["passport", "electricity_meter"],
    checkInDetails: {
      guestName: "John Doe",
      depositAmount: 8000,
      depositCurrency: "THB",
      electricityStartReading: 1000
    }
  },
  {
    id: 3,
    reservationId: "Demo1234",
    taskType: "pool",
    title: "Pool Service - Villa Aruna",
    description: "Regular pool cleaning and chemical balancing",
    scheduledDate: "2025-07-07",
    scheduledTime: "15:00",
    duration: "1 hour",
    assignedRole: "pool-staff",
    assignedTo: "Pool Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "normal",
    evidenceRequired: true,
    guestVisible: true
  },
  {
    id: 4,
    reservationId: "Demo1234",
    taskType: "garden",
    title: "Garden Maintenance - Villa Aruna",
    description: "Garden trimming and landscape maintenance",
    scheduledDate: "2025-07-08",
    scheduledTime: "14:00",
    duration: "1.5 hours",
    assignedRole: "garden-staff",
    assignedTo: "Garden Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "normal",
    evidenceRequired: true,
    guestVisible: true
  },
  {
    id: 5,
    reservationId: "Demo1234",
    taskType: "pest-control",
    title: "Pest Control Service",
    description: "Monthly pest control and prevention treatment",
    scheduledDate: "2025-07-09",
    scheduledTime: "13:00",
    duration: "45 minutes",
    assignedRole: "maintenance",
    assignedTo: "Pest Control Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "normal",
    evidenceRequired: true,
    guestVisible: false
  },
  {
    id: 6,
    reservationId: "Demo1234",
    taskType: "housekeeping",
    title: "Checkout Clean - John Doe",
    description: "Post-departure cleaning and property inspection",
    scheduledDate: "2025-07-10",
    scheduledTime: "12:00",
    duration: "2 hours",
    assignedRole: "housekeeping",
    assignedTo: "Housekeeping Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "high",
    evidenceRequired: true,
    guestVisible: false,
    checkOutDetails: {
      guestName: "John Doe",
      checkOutTime: "11:00",
      finalElectricityReading: 1100
    }
  },

  // Demo1235 - Maria Smith (July 8-12, 2025) at Villa Aruna
  {
    id: 7,
    reservationId: "Demo1235",
    taskType: "housekeeping",
    title: "Pre-Clean for Maria Smith Check-in",
    description: "Complete pre-arrival cleaning and preparation",
    scheduledDate: "2025-07-08",
    scheduledTime: "10:00",
    duration: "2 hours",
    assignedRole: "housekeeping",
    assignedTo: "Housekeeping Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "high",
    evidenceRequired: true,
    guestVisible: false,
    checkInDetails: {
      guestName: "Maria Smith",
      checkInTime: "15:00",
      numberOfGuests: 4
    }
  },
  {
    id: 8,
    reservationId: "Demo1235",
    taskType: "host",
    title: "Guest Check-in - Maria Smith",
    description: "Conduct check-in process with meter reading and deposit collection",
    scheduledDate: "2025-07-08",
    scheduledTime: "15:00",
    duration: "30 minutes",
    assignedRole: "host",
    assignedTo: "Host Manager",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "critical",
    evidenceRequired: true,
    guestVisible: false,
    requiresPhotoUpload: true,
    photoFields: ["passport", "electricity_meter"],
    checkInDetails: {
      guestName: "Maria Smith",
      depositAmount: 8000,
      depositCurrency: "THB",
      electricityStartReading: 1100
    }
  },
  {
    id: 9,
    reservationId: "Demo1235",
    taskType: "pool",
    title: "Pool Service - Villa Aruna",
    description: "Regular pool cleaning and chemical balancing",
    scheduledDate: "2025-07-09",
    scheduledTime: "10:00",
    duration: "1 hour",
    assignedRole: "pool-staff",
    assignedTo: "Pool Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "normal",
    evidenceRequired: true,
    guestVisible: true
  },
  {
    id: 10,
    reservationId: "Demo1235",
    taskType: "garden",
    title: "Garden Maintenance - Villa Aruna",
    description: "Garden trimming and landscape maintenance",
    scheduledDate: "2025-07-10",
    scheduledTime: "16:00",
    duration: "1.5 hours",
    assignedRole: "garden-staff",
    assignedTo: "Garden Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "normal",
    evidenceRequired: true,
    guestVisible: true
  },
  {
    id: 11,
    reservationId: "Demo1235",
    taskType: "housekeeping",
    title: "Checkout Clean - Maria Smith",
    description: "Post-departure cleaning and property inspection",
    scheduledDate: "2025-07-12",
    scheduledTime: "12:00",
    duration: "2 hours",
    assignedRole: "housekeeping",
    assignedTo: "Housekeeping Team",
    property: "Villa Aruna",
    propertyId: 2,
    status: "scheduled",
    priority: "high",
    evidenceRequired: true,
    guestVisible: false,
    checkOutDetails: {
      guestName: "Maria Smith",
      checkOutTime: "11:00",
      finalElectricityReading: 1200
    }
  }
];

// Helper functions for task management
export function getTasksByRole(role: string, date?: string): DemoTask[] {
  let filteredTasks = COMPREHENSIVE_TASK_SCHEDULE;

  // Filter by role
  if (role !== 'admin' && role !== 'portfolio-manager') {
    filteredTasks = filteredTasks.filter(task => 
      task.assignedRole === role || task.assignedRole === 'staff'
    );
  }

  // Filter by date if specified
  if (date) {
    filteredTasks = filteredTasks.filter(task => task.scheduledDate === date);
  }

  return filteredTasks.sort((a, b) => 
    new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime() - 
    new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime()
  );
}

export function getGuestVisibleTasks(reservationId: string): DemoTask[] {
  return COMPREHENSIVE_TASK_SCHEDULE.filter(task => 
    task.reservationId === reservationId && task.guestVisible === true
  );
}

export function getTasksByReservation(reservationId: string): DemoTask[] {
  return COMPREHENSIVE_TASK_SCHEDULE.filter(task => 
    task.reservationId === reservationId
  );
}

export function getTasksByProperty(propertyId: number): DemoTask[] {
  return COMPREHENSIVE_TASK_SCHEDULE.filter(task => 
    task.propertyId === propertyId
  );
}

export function getTasksByDateRange(startDate: string, endDate: string): DemoTask[] {
  return COMPREHENSIVE_TASK_SCHEDULE.filter(task => {
    const taskDate = new Date(task.scheduledDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return taskDate >= start && taskDate <= end;
  });
}

export function updateTaskStatus(taskId: number, status: DemoTask['status']): DemoTask | null {
  const taskIndex = COMPREHENSIVE_TASK_SCHEDULE.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    COMPREHENSIVE_TASK_SCHEDULE[taskIndex].status = status;
    return COMPREHENSIVE_TASK_SCHEDULE[taskIndex];
  }
  return null;
}