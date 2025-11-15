import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";

// Task creation schema based on database structure
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  type: z.string().min(1, "Task type is required"),
  department: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  propertyId: z.number().min(1, "Property is required"),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedCost: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  recurringInterval: z.number().min(1).default(1).optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onCreated?: (newTask?: any) => void; // ✅ add this
}

const TASK_TYPES = [
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
  { value: "pool-service", label: "Pool Service" },
  { value: "garden", label: "Garden Care" },
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Repair" },
  { value: "landscaping", label: "Landscaping" },
  { value: "technology", label: "Technology" },
  { value: "security", label: "Security" },
  { value: "guest-service", label: "Guest Service" },
];

const DEPARTMENTS = [
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "landscaping", label: "Landscaping" },
  { value: "pool", label: "Pool Service" },
  { value: "guest-services", label: "Guest Services" },
  { value: "security", label: "Security" },
  { value: "technology", label: "Technology" },
];

const TASK_TEMPLATES = [
  {
    name: "Deep Clean",
    title: "Deep Cleaning Service",
    description:
      "Complete deep cleaning including floors, windows, bathrooms, kitchen, furniture, and all surfaces. Remove all stains and sanitize all areas.",
    type: "cleaning",
    department: "housekeeping",
    priority: "medium" as const,
    estimatedCost: 150,
  },
  {
    name: "Steam Clean",
    title: "Steam Cleaning Service",
    description:
      "Professional steam cleaning of carpets, upholstery, mattresses, and curtains. Deep sanitization using high-temperature steam.",
    type: "cleaning",
    department: "housekeeping",
    priority: "medium" as const,
    estimatedCost: 120,
  },
  {
    name: "General Maintenance",
    title: "General Property Maintenance",
    description:
      "Routine maintenance check including plumbing, electrical, HVAC, locks, doors, windows, and general property condition assessment.",
    type: "maintenance",
    department: "maintenance",
    priority: "low" as const,
    estimatedCost: 80,
  },
  {
    name: "Pool Service",
    title: "Pool Cleaning & Maintenance",
    description:
      "Complete pool service including water testing, chemical balancing, skimming, vacuuming, filter cleaning, and equipment check.",
    type: "pool-service",
    department: "pool",
    priority: "medium" as const,
    estimatedCost: 100,
  },
  {
    name: "Garden Care",
    title: "Garden Maintenance",
    description:
      "Lawn mowing, hedge trimming, weeding, plant care, and general garden tidying to keep property landscape pristine.",
    type: "garden",
    department: "landscaping",
    priority: "low" as const,
    estimatedCost: 90,
  },
];

export default function CreateTaskDialog({
  isOpen,
  onOpenChange,
  trigger,
  onCreated, // ✅ receive it
}: CreateTaskDialogProps) {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug: Log when dialog open state changes
  React.useEffect(() => {
    console.log("CreateTaskDialog - isOpen changed to:", isOpen);
  }, [isOpen]);

  // Fetch properties for selection
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Type assertions for safety
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const usersArray = Array.isArray(users) ? users : [];
  console.log("usersArray", usersArray);
  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      department: "",
      priority: "medium",
      propertyId: 0,
      assignedTo: "unassigned",
      estimatedCost: undefined, // Blank by default instead of 0
      isRecurring: false,
      recurringInterval: 1,
    },
  });

  // Task creation mutation with proper API call
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskForm) => {
      // Format the data for API
      const apiData = {
        ...taskData,
        dueDate: date ? date.toISOString() : null,
        estimatedCost: taskData.estimatedCost || null,
        assignedTo:
          taskData.assignedTo === "unassigned" ? null : taskData.assignedTo,
        description: taskData.description || null,
        department: taskData.department || null,
        recurringType: taskData.isRecurring ? taskData.recurringType : null,
        recurringInterval: taskData.isRecurring
          ? taskData.recurringInterval
          : null,
      };

      console.log("Creating task with data:", apiData);

      return await apiRequest("POST", "/api/tasks", apiData);
    },
    onSuccess: (newTask) => {
      console.log("Task created successfully:", newTask);

      // Invalidate ALL task-related queries to ensure refresh
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/dashboard/recent-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dashboard/task-stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      // Force refetch tasks immediately
      queryClient.refetchQueries({ queryKey: ["/api/tasks"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/recent-tasks"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/task-stats"] });

      toast({
        title: "Success",
        description: `Task "${newTask.title || "New task"}" created successfully`,
      });

      // ✅ notify parent page
      onCreated?.(newTask);

      // Reset form and close dialog
      form.reset();
      setDate(undefined);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const applyTemplate = (templateName: string) => {
    const template = TASK_TEMPLATES.find((t) => t.name === templateName);
    if (template) {
      form.setValue("title", template.title);
      form.setValue("description", template.description);
      form.setValue("type", template.type);
      form.setValue("department", template.department);
      form.setValue("priority", template.priority);
      form.setValue("estimatedCost", template.estimatedCost);

      toast({
        title: "Template Applied",
        description: `"${template.name}" template has been applied. You can still modify the fields.`,
      });
    }
  };

  const onSubmit = (data: CreateTaskForm) => {
    console.log("Form submitted with data:", data);
    createTaskMutation.mutate(data);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>
          Add a new task to be assigned and tracked in the system.
        </DialogDescription>
      </DialogHeader>

      {/* Task Templates Section */}
      <div className="border-b pb-4 mb-2">
        <label className="text-sm font-medium mb-2 block">
          Quick Templates
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TASK_TEMPLATES.map((template) => (
            <Button
              key={template.name}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(template.name)}
              className="text-xs h-auto py-2"
              data-testid={`button-template-${template.name.toLowerCase().replace(" ", "-")}`}
            >
              {template.name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click a template to auto-fill the form
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Pool cleaning and chemical balancing"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the task..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertiesArray.map((property: any) => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                        >
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type *</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Department and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Assignee and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {usersArray
                        .filter(
                          (user: any) =>
                            user.role === "staff" || user.role === "admin",
                        )
                        .map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full pl-3 text-left font-normal"
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Optional deadline for this task</FormDescription>
            </FormItem>
          </div>

          {/* Recurring Task Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Task</FormLabel>
                    <FormDescription>
                      Create a task that repeats on a schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("isRecurring") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurringType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Every</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("recurringType") === "daily" && "day(s)"}
                        {form.watch("recurringType") === "weekly" && "week(s)"}
                        {form.watch("recurringType") === "monthly" &&
                          "month(s)"}
                        {form.watch("recurringType") === "yearly" && "year(s)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Estimated Cost */}
          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost (THB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Optional estimated cost in Thai Baht
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
