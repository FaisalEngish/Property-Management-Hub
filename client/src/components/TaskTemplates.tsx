import React, { useState, useMemo } from 'react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
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
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap
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
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [expandedInstructions, setExpandedInstructions] = useState<Set<string>>(new Set());
  const [showQuickCreate, setShowQuickCreate] = useState(false);
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
      case 'high': return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300 shadow-red-100';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-300 shadow-yellow-100';
      case 'low': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-300 shadow-blue-100';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-300 shadow-gray-100';
    }
  };
  
  const getPriorityColorFull = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
  
  const toggleInstructionsExpansion = (templateId: string) => {
    const newExpanded = new Set(expandedInstructions);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedInstructions(newExpanded);
  };
  
  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    return commonTemplates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || template.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      
      let matchesDuration = true;
      if (durationFilter === 'short') matchesDuration = template.estimatedDuration <= 60;
      else if (durationFilter === 'medium') matchesDuration = template.estimatedDuration > 60 && template.estimatedDuration <= 120;
      else if (durationFilter === 'long') matchesDuration = template.estimatedDuration > 120;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesDuration;
    });
  }, [searchTerm, priorityFilter, categoryFilter, durationFilter]);
  
  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(commonTemplates.map(t => t.category)));
  }, []);
  
  // Priority insights
  const priorityStats = useMemo(() => {
    const stats = { high: 0, medium: 0, low: 0 };
    filteredTemplates.forEach(template => {
      stats[template.priority]++;
    });
    return stats;
  }, [filteredTemplates]);

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
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm border border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Task Templates
            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-300">
              {filteredTemplates.length} of {commonTemplates.length} templates
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search templates by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 bg-white/50 backdrop-blur-sm border-slate-200/50">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-white/50 backdrop-blur-sm border-slate-200/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="w-32 bg-white/50 backdrop-blur-sm border-slate-200/50">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="short">{'≤'} 1 hour</SelectItem>
                  <SelectItem value="medium">1-2 hours</SelectItem>
                  <SelectItem value="long">{'>'} 2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white via-white to-slate-50/30 backdrop-blur-sm border border-slate-200/50 relative overflow-hidden">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/30 pointer-events-none" />
              
              {/* Priority accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 ${getPriorityColorFull(template.priority)} opacity-80`} />
              
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1 text-slate-800">{template.title}</h4>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getPriorityColor(template.priority)} shadow-sm transition-all duration-200 hover:scale-105 animate-pulse`}
                      >
                        {getPriorityIcon(template.priority)}
                        <span className="capitalize font-medium">{template.priority}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.estimatedDuration}min
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 relative">
                <div className="space-y-4">
                  <div className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100">
                    <span className="text-xs text-emerald-700 font-medium">Category: </span>
                    <span className="text-xs font-semibold text-emerald-800">{template.category}</span>
                  </div>
                  
                  <div>
                    <Collapsible 
                      open={expandedInstructions.has(template.id)}
                      onOpenChange={() => toggleInstructionsExpansion(template.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-between p-2 h-auto bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/50"
                        >
                          <span className="text-xs font-medium text-slate-700">
                            Instructions ({template.instructions.length} steps)
                          </span>
                          {expandedInstructions.has(template.id) ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2">
                        <ul className="text-xs text-slate-600 space-y-2 max-h-32 overflow-y-auto bg-white/50 rounded-lg p-3 border border-slate-200/50">
                          {template.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <span className="text-[10px] font-medium text-emerald-700">{index + 1}</span>
                              </div>
                              <span className="leading-relaxed">{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                      
                      {!expandedInstructions.has(template.id) && (
                        <div className="mt-2">
                          <ul className="text-xs text-slate-600 space-y-1">
                            {template.instructions.slice(0, 2).map((instruction, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-emerald-500 font-medium">•</span>
                                <span className="truncate">{instruction}</span>
                              </li>
                            ))}
                            {template.instructions.length > 2 && (
                              <li className="text-slate-400 text-xs font-medium">
                                +{template.instructions.length - 2} more steps...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </Collapsible>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 hover:scale-105"
                    disabled={selectedProperties.length === 0}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Task
                  </Button>
                  
                  {selectedProperties.length === 0 && (
                    <p className="text-xs text-slate-500 text-center bg-yellow-50 border border-yellow-200 rounded p-2">
                      💡 Select properties to create tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No templates found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Priority Insights Footer */}
      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800">Task Template Insights</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-slate-700">High Priority: {priorityStats.high}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-slate-700">Medium Priority: {priorityStats.medium}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-slate-700">Low Priority: {priorityStats.low}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Floating Quick Create Button */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={() => setShowQuickCreate(true)}
            className="rounded-full shadow-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-4 border-white hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <Zap className="h-5 w-5 mr-2" />
            Quick Create
          </Button>
        </div>
      )}
      
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
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => {
                    setSelectedPropertyId(value);
                    setValue('propertyId', value);
                  }}
                >
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
    </div>
  );
};

export default TaskTemplates;