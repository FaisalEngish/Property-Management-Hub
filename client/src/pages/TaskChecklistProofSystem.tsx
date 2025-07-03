import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import { 
  CheckSquare, 
  Upload, 
  Camera, 
  FileText, 
  Download, 
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash,
  Edit,
  Plus,
  Settings,
  Star,
  MapPin,
  Activity,
  Archive,
  RefreshCw,
  Shield,
  Wrench,
  Sparkles,
  Droplets,
  Leaf,
  Bug,
  Home,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Icons for different task types
const taskTypeIcons = {
  cleaning: Sparkles,
  maintenance: Wrench,
  pool: Droplets,
  garden: Leaf,
  "pest-control": Bug,
  inspection: Eye,
  general: Home,
};

// Default checklists for each task type
const defaultChecklists = {
  cleaning: {
    name: "Checkout Clean",
    items: [
      { task: "Vacuum all floors and carpets", required: true, safetyNote: "Check for small objects", tools: ["Vacuum", "Attachments"] },
      { task: "Mop hard floors", required: true, safetyNote: "Use appropriate cleaner", tools: ["Mop", "Floor cleaner"] },
      { task: "Clean and disinfect bathrooms", required: true, safetyNote: "Wear gloves", tools: ["Disinfectant", "Gloves", "Toilet brush"] },
      { task: "Change bed linens", required: true, safetyNote: "Check for damage", tools: ["Fresh linens"] },
      { task: "Clean kitchen and appliances", required: true, safetyNote: "Unplug before cleaning", tools: ["Degreaser", "Microfiber cloths"] },
      { task: "Empty all trash bins", required: true, safetyNote: "Tie bags securely", tools: ["Trash bags"] },
      { task: "Wipe down surfaces and furniture", required: true, safetyNote: "Use appropriate cleaner", tools: ["Multi-surface cleaner", "Cloths"] },
      { task: "Check and replace toiletries", required: false, safetyNote: "", tools: ["Toiletries inventory"] }
    ],
    estimatedMinutes: 120,
    safetyNotes: "Always wear gloves when handling chemicals. Ensure proper ventilation."
  },
  maintenance: {
    name: "General Maintenance",
    items: [
      { task: "Check air conditioning filters", required: true, safetyNote: "Turn off AC before checking", tools: ["Replacement filters"] },
      { task: "Test smoke detectors", required: true, safetyNote: "Use test button only", tools: ["Step ladder"] },
      { task: "Inspect plumbing for leaks", required: true, safetyNote: "Turn off water if major leak found", tools: ["Flashlight"] },
      { task: "Check light bulbs and fixtures", required: true, safetyNote: "Turn off power before replacing", tools: ["Replacement bulbs"] },
      { task: "Inspect doors and windows", required: true, safetyNote: "Check locks and handles", tools: ["Lubricant"] },
      { task: "Test electrical outlets", required: true, safetyNote: "Use outlet tester", tools: ["Outlet tester"] },
      { task: "Check hot water system", required: false, safetyNote: "Do not attempt repairs", tools: ["Thermometer"] }
    ],
    estimatedMinutes: 90,
    safetyNotes: "Always turn off power when working with electrical components. Do not attempt major repairs."
  },
  pool: {
    name: "Pool Maintenance",
    items: [
      { task: "Test water chemistry", required: true, safetyNote: "Handle chemicals carefully", tools: ["Test strips", "Chemical kit"] },
      { task: "Skim surface debris", required: true, safetyNote: "Use proper skimmer", tools: ["Pool skimmer"] },
      { task: "Empty skimmer baskets", required: true, safetyNote: "Wear gloves", tools: ["Gloves"] },
      { task: "Brush pool walls and floor", required: true, safetyNote: "Use appropriate brush", tools: ["Pool brush"] },
      { task: "Vacuum pool", required: true, safetyNote: "Follow manufacturer instructions", tools: ["Pool vacuum"] },
      { task: "Check pump and filter", required: true, safetyNote: "Turn off power before inspection", tools: ["Replacement filter"] },
      { task: "Add chemicals if needed", required: false, safetyNote: "Follow exact measurements", tools: ["Pool chemicals", "Measuring cup"] }
    ],
    estimatedMinutes: 60,
    safetyNotes: "Never mix different chemicals. Always add chemicals to water, not water to chemicals."
  },
  garden: {
    name: "Garden Maintenance",
    items: [
      { task: "Water plants and lawn", required: true, safetyNote: "Check soil moisture first", tools: ["Hose", "Watering can"] },
      { task: "Remove weeds", required: true, safetyNote: "Wear gloves", tools: ["Gloves", "Weeding tool"] },
      { task: "Prune dead branches", required: true, safetyNote: "Use sharp, clean tools", tools: ["Pruning shears"] },
      { task: "Mow lawn", required: true, safetyNote: "Check for obstacles", tools: ["Lawn mower"] },
      { task: "Clean garden beds", required: true, safetyNote: "Watch for insects", tools: ["Rake", "Garden fork"] },
      { task: "Check irrigation system", required: false, safetyNote: "Look for leaks or blockages", tools: ["Replacement sprinklers"] }
    ],
    estimatedMinutes: 75,
    safetyNotes: "Wear protective clothing. Be aware of poisonous plants and insects."
  },
  "pest-control": {
    name: "Pest Control",
    items: [
      { task: "Inspect for ant trails", required: true, safetyNote: "Look around entry points", tools: ["Flashlight"] },
      { task: "Check for cockroach signs", required: true, safetyNote: "Look in dark, warm areas", tools: ["Flashlight"] },
      { task: "Inspect for rodent droppings", required: true, safetyNote: "Wear gloves and mask", tools: ["Gloves", "Mask"] },
      { task: "Check window and door seals", required: true, safetyNote: "Look for gaps", tools: ["Sealant"] },
      { task: "Set traps if needed", required: false, safetyNote: "Follow manufacturer instructions", tools: ["Traps", "Bait"] },
      { task: "Apply treatment if authorized", required: false, safetyNote: "Only use approved products", tools: ["Approved pesticides", "Sprayer"] }
    ],
    estimatedMinutes: 45,
    safetyNotes: "Always wear protective equipment. Only use approved chemicals."
  }
};

interface ChecklistItem {
  task: string;
  required: boolean;
  safetyNote: string;
  tools: string[];
  completed?: boolean;
}

interface TaskChecklist {
  id: number;
  taskType: string;
  checklistName: string;
  checklistItems: ChecklistItem[];
  isDefault: boolean;
  propertyId?: number;
  estimatedMinutes: number;
  safetyNotes: string;
  version: string;
}

interface PropertyGuide {
  id: number;
  propertyId: number;
  guideName: string;
  taskCategory: string;
  instructions: string;
  specialEquipment: string[];
  safetyWarnings: string;
  frequency: string;
  version: string;
}

interface TaskCompletion {
  id: number;
  taskId: number;
  propertyId: number;
  completedBy: string;
  completionNotes: string;
  issuesFound: string[];
  expenseAmount: number;
  expenseDescription: string;
  proofPhotos: string[];
  reviewStatus: string;
  completedAt: string;
}

interface MonthlyExport {
  id: number;
  propertyId: number;
  exportMonth: string;
  exportType: string;
  fileName: string;
  fileUrl: string;
  taskCount: number;
  photoCount: number;
  exportStatus: string;
  exportedAt: string;
}

export default function TaskChecklistProofSystem() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("checklists");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string>("all");
  const [isCreateChecklistOpen, setIsCreateChecklistOpen] = useState(false);
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [isViewCompletionOpen, setIsViewCompletionOpen] = useState(false);
  const [selectedCompletion, setSelectedCompletion] = useState<TaskCompletion | null>(null);

  // Fetch data
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
    queryKey: ["/api/task-checklists", selectedProperty, selectedTaskType],
  });

  const { data: propertyGuides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ["/api/property-guides", selectedProperty],
  });

  const { data: taskCompletions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ["/api/task-completions", selectedProperty],
  });

  const { data: monthlyExports = [], isLoading: exportsLoading } = useQuery({
    queryKey: ["/api/monthly-exports", selectedProperty],
  });

  // Create checklist mutation
  const createChecklistMutation = useMutation({
    mutationFn: async (checklistData: any) => {
      return apiRequest("POST", "/api/task-checklists", checklistData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/task-checklists"] });
      setIsCreateChecklistOpen(false);
      toast({
        title: "Checklist Created",
        description: "Task checklist has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create checklist",
        variant: "destructive",
      });
    },
  });

  // Create property guide mutation
  const createGuideMutation = useMutation({
    mutationFn: async (guideData: any) => {
      return apiRequest("POST", "/api/property-guides", guideData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-guides"] });
      setIsCreateGuideOpen(false);
      toast({
        title: "Property Guide Created",
        description: "Property guide has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property guide",
        variant: "destructive",
      });
    },
  });

  // Export monthly data mutation
  const exportMonthlyMutation = useMutation({
    mutationFn: async (exportData: any) => {
      return apiRequest("POST", "/api/monthly-exports", exportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-exports"] });
      toast({
        title: "Export Started",
        description: "Monthly export has been initiated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start export",
        variant: "destructive",
      });
    },
  });

  const handleCreateDefaultChecklist = (taskType: string) => {
    const defaultChecklist = defaultChecklists[taskType as keyof typeof defaultChecklists];
    if (defaultChecklist) {
      createChecklistMutation.mutate({
        taskType,
        checklistName: defaultChecklist.name,
        checklistItems: defaultChecklist.items,
        isDefault: true,
        propertyId: selectedProperty,
        estimatedMinutes: defaultChecklist.estimatedMinutes,
        safetyNotes: defaultChecklist.safetyNotes,
        version: "1.0",
      });
    }
  };

  const handleExportMonthly = (propertyId: number) => {
    const currentMonth = format(new Date(), "yyyy-MM");
    exportMonthlyMutation.mutate({
      propertyId,
      exportMonth: currentMonth,
      exportType: "full-report",
    });
  };

  const filteredChecklists = checklists.filter((checklist: TaskChecklist) => 
    selectedTaskType === "all" || checklist.taskType === selectedTaskType
  );

  const isAdmin = user?.role === "admin" || user?.role === "portfolio-manager";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <CheckSquare className="mr-3 h-7 w-7" />
                Task Checklist & Proof System
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage checklists, property guides, proof uploads, and monthly exports
              </p>
            </div>
            {isAdmin && (
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setIsCreateChecklistOpen(true)}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Checklist
                </Button>
                <Button 
                  onClick={() => setIsCreateGuideOpen(true)}
                  variant="outline"
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Guide
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="property-select">Property</Label>
              <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {properties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-type-select">Task Type</Label>
              <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Task Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Task Types</SelectItem>
                  <SelectItem value="cleaning">🧹 Cleaning</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="pool">🏊 Pool</SelectItem>
                  <SelectItem value="garden">🌿 Garden</SelectItem>
                  <SelectItem value="pest-control">🧯 Pest Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {selectedProperty && (
                <Button 
                  onClick={() => handleExportMonthly(selectedProperty)}
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  disabled={exportMonthlyMutation.isPending}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Monthly Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checklists">📋 Checklists</TabsTrigger>
            <TabsTrigger value="guides">📖 Property Guides</TabsTrigger>
            <TabsTrigger value="completions">✅ Task Completions</TabsTrigger>
            <TabsTrigger value="proof">📷 Proof Gallery</TabsTrigger>
            <TabsTrigger value="exports">📄 Monthly Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChecklists.map((checklist: TaskChecklist) => {
                const TaskIcon = taskTypeIcons[checklist.taskType as keyof typeof taskTypeIcons] || Home;
                return (
                  <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-lg">
                          <TaskIcon className="mr-2 h-5 w-5" />
                          {checklist.checklistName}
                        </CardTitle>
                        {checklist.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {checklist.taskType.charAt(0).toUpperCase() + checklist.taskType.slice(1)} • 
                        {checklist.estimatedMinutes} mins • 
                        {checklist.checklistItems.length} items
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Safety Notes:</strong> {checklist.safetyNotes}
                        </div>
                        <div className="space-y-2">
                          {checklist.checklistItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              {item.task}
                              {item.required && <span className="ml-1 text-red-500">*</span>}
                            </div>
                          ))}
                          {checklist.checklistItems.length > 3 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              +{checklist.checklistItems.length - 3} more items
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <Badge variant="outline" className="text-xs">
                            v{checklist.version}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            View Full
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Quick Create Default Checklists */}
              {isAdmin && (
                <Card className="border-dashed border-2 hover:border-blue-500 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Create Default Checklists</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                      Generate default checklists for all task types
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(defaultChecklists).map((taskType) => {
                        const TaskIcon = taskTypeIcons[taskType as keyof typeof taskTypeIcons];
                        return (
                          <Button
                            key={taskType}
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateDefaultChecklist(taskType)}
                            disabled={createChecklistMutation.isPending}
                            className="flex items-center"
                          >
                            <TaskIcon className="mr-1 h-3 w-3" />
                            {taskType.charAt(0).toUpperCase() + taskType.slice(1)}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyGuides.map((guide: PropertyGuide) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="mr-2 h-5 w-5" />
                      {guide.guideName}
                    </CardTitle>
                    <CardDescription>
                      {guide.taskCategory.charAt(0).toUpperCase() + guide.taskCategory.slice(1)} • 
                      {guide.frequency}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {guide.instructions}
                      </div>
                      {guide.specialEquipment.length > 0 && (
                        <div>
                          <strong className="text-sm">Special Equipment:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {guide.specialEquipment.slice(0, 3).map((equipment, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {equipment}
                              </Badge>
                            ))}
                            {guide.specialEquipment.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{guide.specialEquipment.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {guide.safetyWarnings && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md">
                          <div className="flex items-center text-sm text-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            <strong>Safety Warning:</strong>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {guide.safetyWarnings}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline" className="text-xs">
                          v{guide.version}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completions" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {taskCompletions.map((completion: TaskCompletion) => (
                <Card key={completion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                        Task Completion #{completion.id}
                      </CardTitle>
                      <Badge 
                        variant={
                          completion.reviewStatus === "approved" ? "default" :
                          completion.reviewStatus === "rejected" ? "destructive" :
                          "secondary"
                        }
                      >
                        {completion.reviewStatus.charAt(0).toUpperCase() + completion.reviewStatus.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Completed {format(parseISO(completion.completedAt), "PPP")} by {completion.completedBy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {completion.completionNotes && (
                        <div>
                          <strong className="text-sm">Completion Notes:</strong>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {completion.completionNotes}
                          </p>
                        </div>
                      )}
                      
                      {completion.issuesFound.length > 0 && (
                        <div>
                          <strong className="text-sm">Issues Found:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {completion.issuesFound.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {completion.expenseAmount > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm">Expense Incurred:</strong>
                            <Badge variant="outline">฿{completion.expenseAmount}</Badge>
                          </div>
                          {completion.expenseDescription && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {completion.expenseDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {completion.proofPhotos.length > 0 && (
                        <div>
                          <strong className="text-sm">Proof Photos ({completion.proofPhotos.length}):</strong>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {completion.proofPhotos.slice(0, 4).map((photo, index) => (
                              <div key={index} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            ))}
                            {completion.proofPhotos.length > 4 && (
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-xs">
                                +{completion.proofPhotos.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCompletion(completion);
                            setIsViewCompletionOpen(true);
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proof" className="space-y-6">
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proof Photo Gallery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Photo gallery with before/after images and evidence uploads will be displayed here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyExports.map((exportLog: MonthlyExport) => (
                <Card key={exportLog.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Archive className="mr-2 h-5 w-5" />
                      {exportLog.exportMonth} Export
                    </CardTitle>
                    <CardDescription>
                      {exportLog.exportType.replace("-", " ").toUpperCase()} • 
                      {exportLog.taskCount} tasks • 
                      {exportLog.photoCount} photos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            exportLog.exportStatus === "completed" ? "default" :
                            exportLog.exportStatus === "failed" ? "destructive" :
                            "secondary"
                          }
                        >
                          {exportLog.exportStatus.charAt(0).toUpperCase() + exportLog.exportStatus.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {(exportLog.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Exported on {format(parseISO(exportLog.exportedAt), "PPP")}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-500">{exportLog.fileName}</span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Completion Dialog */}
      <Dialog open={isViewCompletionOpen} onOpenChange={setIsViewCompletionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Completion Details</DialogTitle>
            <DialogDescription>
              Complete information about task completion and proof
            </DialogDescription>
          </DialogHeader>
          {selectedCompletion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Completed By</Label>
                  <p className="text-sm font-medium">{selectedCompletion.completedBy}</p>
                </div>
                <div>
                  <Label>Completion Date</Label>
                  <p className="text-sm font-medium">{format(parseISO(selectedCompletion.completedAt), "PPP")}</p>
                </div>
              </div>
              
              {selectedCompletion.completionNotes && (
                <div>
                  <Label>Completion Notes</Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md mt-1">
                    {selectedCompletion.completionNotes}
                  </p>
                </div>
              )}

              {selectedCompletion.proofPhotos.length > 0 && (
                <div>
                  <Label>Proof Photos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {selectedCompletion.proofPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}