import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

// Task creation schema based on database structure
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  type: z.string().min(1, 'Task type is required'),
  department: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  propertyId: z.number().min(1, 'Property is required'),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedCost: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringInterval: z.number().min(1).default(1).optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const TASK_TYPES = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'pool-service', label: 'Pool Service' },
  { value: 'garden', label: 'Garden Care' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'technology', label: 'Technology' },
  { value: 'security', label: 'Security' },
  { value: 'guest-service', label: 'Guest Service' }
];

const DEPARTMENTS = [
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'pool', label: 'Pool Service' },
  { value: 'guest-services', label: 'Guest Services' },
  { value: 'security', label: 'Security' },
  { value: 'technology', label: 'Technology' }
];

export default function CreateTaskDialog({ isOpen, onOpenChange, trigger }: CreateTaskDialogProps) {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for selection
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      department: '',
      priority: 'medium',
      propertyId: 0,
      assignedTo: 'unassigned',
      estimatedCost: 0,
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
        assignedTo: taskData.assignedTo === 'unassigned' ? null : taskData.assignedTo,
        description: taskData.description || null,
        department: taskData.department || null,
        recurringType: taskData.isRecurring ? taskData.recurringType : null,
        recurringInterval: taskData.isRecurring ? taskData.recurringInterval : null,
      };

      console.log('Creating task with data:', apiData);
      
      const response = await apiRequest('POST', '/api/tasks', apiData);
      return response;
    },
    onSuccess: (newTask) => {
      // Invalidate tasks cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      toast({
        title: 'Success',
        description: `Task "${newTask.title}" created successfully`,
      });
      
      // Reset form and close dialog
      form.reset();
      setDate(undefined);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Task creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateTaskForm) => {
    console.log('Form submitted with data:', data);
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
                  <Input placeholder="e.g. Pool cleaning and chemical balancing" {...field} />
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
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      {users.filter((user: any) => user.role === 'staff' || user.role === 'admin').map((user: any) => (
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
                      {date ? (
                        format(date, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
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
              <FormDescription>
                Optional deadline for this task
              </FormDescription>
            </FormItem>
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
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
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