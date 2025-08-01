import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  ClipboardList, 
  Plus, 
  Wrench, 
  Sparkles, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '../hooks/use-toast';

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  category: string;
  instructions: string[];
  isCommon: boolean;
}

interface TaskTemplatesProps {
  onCreateTask: (template: TaskTemplate, propertyId: number) => void;
  selectedProperties: any[];
}

export function TaskTemplates({ onCreateTask, selectedProperties }: TaskTemplatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const commonTemplates: TaskTemplate[] = [
    {
      id: 'clean-checkin',
      title: 'Pre-Arrival Deep Clean',
      description: 'Complete cleaning and preparation for guest arrival',
      type: 'cleaning',
      priority: 'high',
      estimatedDuration: 120,
      category: 'Guest Services',
      instructions: [
        'Deep clean all rooms including bathrooms',
        'Change all bed linens and towels',
        'Stock amenities and toiletries',
        'Check and clean pool area',
        'Inspect all appliances and electronics',
        'Final walkthrough and photo documentation'
      ],
      isCommon: true
    },
    {
      id: 'maintenance-ac',
      title: 'Air Conditioning Maintenance',
      description: 'Routine AC system inspection and maintenance',
      type: 'maintenance',
      priority: 'medium',
      estimatedDuration: 90,
      category: 'Maintenance',
      instructions: [
        'Check and replace air filters',
        'Clean condenser coils',
        'Inspect refrigerant levels',
        'Test thermostat functionality',
        'Clean drainage system',
        'Document findings and recommendations'
      ],
      isCommon: true
    },
    {
      id: 'pool-weekly',
      title: 'Weekly Pool Maintenance',
      description: 'Comprehensive pool cleaning and chemical balance',
      type: 'maintenance',
      priority: 'medium',
      estimatedDuration: 60,
      category: 'Pool & Spa',
      instructions: [
        'Test and balance water chemistry',
        'Skim surface and empty baskets',
        'Brush walls and vacuum pool',
        'Clean pool deck and furniture',
        'Inspect equipment and filters',
        'Update maintenance log'
      ],
      isCommon: true
    },
    {
      id: 'security-check',
      title: 'Security & Safety Inspection',
      description: 'Monthly security and safety systems check',
      type: 'inspection',
      priority: 'high',
      estimatedDuration: 45,
      category: 'Security',
      instructions: [
        'Test all door and window locks',
        'Check security cameras and lighting',
        'Inspect fire safety equipment',
        'Verify alarm system functionality',
        'Test smoke and carbon monoxide detectors',
        'Document any security concerns'
      ],
      isCommon: true
    },
    {
      id: 'garden-maintenance',
      title: 'Garden & Landscaping',
      description: 'Regular garden maintenance and landscaping',
      type: 'maintenance',
      priority: 'low',
      estimatedDuration: 120,
      category: 'Landscaping',
      instructions: [
        'Trim and prune plants and trees',
        'Water all plants and gardens',
        'Remove weeds and dead vegetation',
        'Fertilize plants as needed',
        'Clean outdoor furniture and decorations',
        'Inspect irrigation system'
      ],
      isCommon: true
    },
    {
      id: 'checkout-inspection',
      title: 'Post-Checkout Inspection',
      description: 'Property inspection after guest departure',
      type: 'inspection',
      priority: 'high',
      estimatedDuration: 30,
      category: 'Guest Services',
      instructions: [
        'Complete room-by-room inspection',
        'Document any damages or issues',
        'Check inventory and missing items',
        'Take photos of property condition',
        'Report maintenance needs',
        'Prepare damage assessment if needed'
      ],
      isCommon: true
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const handleCreateFromTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    if (!selectedTemplate) return;

    const propertyId = parseInt(data.propertyId);
    if (propertyId && selectedTemplate) {
      onCreateTask(selectedTemplate, propertyId);
      toast({
        title: "Task Created",
        description: `"${selectedTemplate.title}" has been created for the selected property.`,
      });
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Task Templates
          <Badge variant="secondary" className="ml-2">
            {commonTemplates.length} templates
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{template.title}</h4>
                    <p className="text-xs text-slate-600 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(template.priority)}>
                        {getPriorityIcon(template.priority)}
                        {template.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.estimatedDuration}min
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-600">Category: </span>
                    <span className="text-xs font-medium">{template.category}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Instructions:</span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {template.instructions.slice(0, 3).map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-slate-400">•</span>
                          <span className="truncate">{instruction}</span>
                        </li>
                      ))}
                      {template.instructions.length > 3 && (
                        <li className="text-slate-400 text-xs">
                          +{template.instructions.length - 3} more steps
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full"
                    disabled={selectedProperties.length === 0}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Task
                  </Button>
                  
                  {selectedProperties.length === 0 && (
                    <p className="text-xs text-slate-500 text-center">
                      Select properties to create tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Task from Template</DialogTitle>
              <DialogDescription>
                {selectedTemplate && `Create "${selectedTemplate.title}" for a selected property.`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Property</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose property" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="hidden" 
                  {...register('propertyId', { required: true })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Assign To</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff1">John Smith (Maintenance)</SelectItem>
                    <SelectItem value="staff2">Sarah Johnson (Cleaning)</SelectItem>
                    <SelectItem value="staff3">Mike Chen (General)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input 
                  type="date" 
                  {...register('dueDate', { required: true })}
                  defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                <Textarea 
                  placeholder="Any specific instructions or requirements..."
                  {...register('notes')}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TaskTemplates;