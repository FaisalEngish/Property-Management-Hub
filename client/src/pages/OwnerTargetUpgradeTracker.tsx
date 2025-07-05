import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Lightbulb,
  Star,
  Eye,
  X,
  Home,
  Sofa,
  Tv,
  Utensils,
  Wifi,
  Wrench,
} from "lucide-react";

// Form schemas
const targetFormSchema = z.object({
  propertyId: z.number(),
  targetYear: z.number().min(2024).max(2030),
  targetQuarter: z.number().min(1).max(4).optional(),
  targetAmount: z.string().min(1, "Target amount is required"),
  currency: z.string().default("THB"),
  description: z.string().min(1, "Description is required"),
});

const upgradeFormSchema = z.object({
  propertyId: z.number(),
  targetId: z.number(),
  upgradeName: z.string().min(1, "Upgrade name is required"),
  description: z.string().min(1, "Description is required"),
  triggerAmount: z.string().min(1, "Trigger amount is required"),
  estimatedCost: z.string().optional(),
  currency: z.string().default("THB"),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["furniture", "appliances", "outdoor", "technology", "renovation"]),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type TargetFormData = z.infer<typeof targetFormSchema>;
type UpgradeFormData = z.infer<typeof upgradeFormSchema>;

const categoryIcons: Record<string, any> = {
  furniture: Sofa,
  appliances: Home,
  outdoor: Target,
  technology: Tv,
  renovation: Wrench,
};

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  planned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const suggestionTypeIcons: Record<string, any> = {
  price_increase: TrendingUp,
  promotion: Star,
  upgrade_timing: Calendar,
  performance_alert: AlertCircle,
};

export default function OwnerTargetUpgradeTracker() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any>(null);
  const [editingUpgrade, setEditingUpgrade] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/target-dashboard", selectedPropertyId],
    queryFn: () => {
      const url = selectedPropertyId 
        ? `/api/target-dashboard?propertyId=${selectedPropertyId}`
        : "/api/target-dashboard";
      return fetch(url).then(res => res.json());
    },
  });

  const { data: targets = [], isLoading: isTargetsLoading } = useQuery({
    queryKey: ["/api/targets/demo"],
  });

  const { data: upgrades = [], isLoading: isUpgradesLoading } = useQuery({
    queryKey: ["/api/upgrades/demo"],
  });

  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ["/api/target-suggestions/demo"],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Mutations
  const createTargetMutation = useMutation({
    mutationFn: (data: TargetFormData) =>
      fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/target-dashboard"] });
      setIsTargetDialogOpen(false);
      toast({ title: "Revenue target created successfully" });
    },
  });

  const createUpgradeMutation = useMutation({
    mutationFn: (data: UpgradeFormData) =>
      fetch("/api/upgrades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upgrades"] });
      setIsUpgradeDialogOpen(false);
      toast({ title: "Upgrade item created successfully" });
    },
  });

  const markSuggestionAsReadMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/target-suggestions/${id}/read`, {
        method: "POST",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-suggestions"] });
    },
  });

  const dismissSuggestionMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/target-suggestions/${id}/dismiss`, {
        method: "POST",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/target-suggestions"] });
      toast({ title: "Suggestion dismissed" });
    },
  });

  const approveUpgradeMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/upgrades/${id}/approve`, {
        method: "POST",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upgrades"] });
      toast({ title: "Upgrade approved successfully" });
    },
  });

  const completeUpgradeMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/upgrades/${id}/complete`, {
        method: "POST",
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upgrades"] });
      toast({ title: "Upgrade marked as completed" });
    },
  });

  // Forms
  const targetForm = useForm<TargetFormData>({
    resolver: zodResolver(targetFormSchema),
    defaultValues: {
      targetYear: new Date().getFullYear(),
      currency: "THB",
    },
  });

  const upgradeForm = useForm<UpgradeFormData>({
    resolver: zodResolver(upgradeFormSchema),
    defaultValues: {
      currency: "THB",
      priority: "medium",
      category: "furniture",
    },
  });

  const onTargetSubmit = (data: TargetFormData) => {
    createTargetMutation.mutate(data);
  };

  const onUpgradeSubmit = (data: UpgradeFormData) => {
    createUpgradeMutation.mutate(data);
  };

  const formatCurrency = (amount: string, currency: string = "THB") => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const calculateProgress = (current: string, target: string) => {
    const currentNum = parseFloat(current);
    const targetNum = parseFloat(target);
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  if (isDashboardLoading || isTargetsLoading || isUpgradesLoading || isSuggestionsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Owner Target & Upgrade Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Set revenue goals, plan property upgrades, and track progress with AI insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTargetDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Target
          </Button>
          <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Upgrade
          </Button>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Targets</p>
                  <p className="text-2xl font-bold">{dashboard.activeTargets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">On Track</p>
                  <p className="text-2xl font-bold">{dashboard.targetsOnTrack}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Upgrades</p>
                  <p className="text-2xl font-bold">{dashboard.pendingUpgrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{dashboard.completedUpgrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Suggestions</p>
                  <p className="text-2xl font-bold">{dashboard.unreadSuggestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="targets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="targets">Revenue Targets</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrade Wishlist</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Revenue Targets Tab */}
        <TabsContent value="targets" className="space-y-4">
          <div className="grid gap-4">
            {targets.map((target: any) => {
              const progress = calculateProgress(target.currentRevenue, target.targetAmount);
              const isOnTrack = progress >= 80;
              
              return (
                <Card key={target.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          {target.propertyName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{target.description}</p>
                      </div>
                      <Badge variant={isOnTrack ? "default" : "secondary"}>
                        {target.targetQuarter ? `Q${target.targetQuarter} ${target.targetYear}` : target.targetYear}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(target.currentRevenue, target.currency)} current</span>
                        <span>{formatCurrency(target.targetAmount, target.currency)} target</span>
                      </div>
                    </div>
                    {isOnTrack && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        On track to meet target
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Upgrade Wishlist Tab */}
        <TabsContent value="upgrades" className="space-y-4">
          <div className="grid gap-4">
            {upgrades.map((upgrade: any) => {
              const CategoryIcon = categoryIcons[upgrade.category] || Home;
              
              return (
                <Card key={upgrade.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CategoryIcon className="h-5 w-5" />
                          {upgrade.upgradeName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={priorityColors[upgrade.priority]}>
                          {upgrade.priority}
                        </Badge>
                        <Badge className={statusColors[upgrade.status]}>
                          {upgrade.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Property:</span>
                        <p className="font-medium">{upgrade.propertyName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trigger Amount:</span>
                        <p className="font-medium">{formatCurrency(upgrade.triggerAmount, upgrade.currency)}</p>
                      </div>
                      {upgrade.estimatedCost && (
                        <div>
                          <span className="text-muted-foreground">Estimated Cost:</span>
                          <p className="font-medium">{formatCurrency(upgrade.estimatedCost, upgrade.currency)}</p>
                        </div>
                      )}
                      {upgrade.deadline && (
                        <div>
                          <span className="text-muted-foreground">Deadline:</span>
                          <p className="font-medium">{new Date(upgrade.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    {upgrade.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{upgrade.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {upgrade.status === "planned" && (
                        <Button
                          size="sm"
                          onClick={() => approveUpgradeMutation.mutate(upgrade.id)}
                          disabled={approveUpgradeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {upgrade.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => completeUpgradeMutation.mutate(upgrade.id)}
                          disabled={completeUpgradeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4">
            {suggestions.map((suggestion: any) => {
              const SuggestionIcon = suggestionTypeIcons[suggestion.suggestionType] || Lightbulb;
              const confidence = parseFloat(suggestion.confidence || "0");
              
              return (
                <Card key={suggestion.id} className={`${suggestion.isRead ? "opacity-75" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SuggestionIcon className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        {!suggestion.isRead && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {(confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        <div className="flex gap-1">
                          {!suggestion.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markSuggestionAsReadMutation.mutate(suggestion.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissSuggestionMutation.mutate(suggestion.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{suggestion.message}</p>
                    {suggestion.suggestedAction && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Suggested Action:
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {suggestion.suggestedAction}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(suggestion.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Targets</span>
                    <span className="font-bold">{dashboard?.totalTargets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Targets</span>
                    <span className="font-bold text-blue-600">{dashboard?.activeTargets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>On Track</span>
                    <span className="font-bold text-green-600">{dashboard?.targetsOnTrack || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upgrade Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Upgrades</span>
                    <span className="font-bold">{dashboard?.totalUpgrades || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <span className="font-bold text-orange-600">{dashboard?.pendingUpgrades || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <span className="font-bold text-green-600">{dashboard?.completedUpgrades || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Target Dialog */}
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Revenue Target</DialogTitle>
          </DialogHeader>
          <Form {...targetForm}>
            <form onSubmit={targetForm.handleSubmit(onTargetSubmit)} className="space-y-4">
              <FormField
                control={targetForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={targetForm.control}
                  name="targetYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={targetForm.control}
                  name="targetQuarter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarter (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={targetForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="3000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={targetForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="3M THB annual revenue target" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTargetMutation.isPending}>
                  Create Target
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Upgrade Item</DialogTitle>
          </DialogHeader>
          <Form {...upgradeForm}>
            <form onSubmit={upgradeForm.handleSubmit(onUpgradeSubmit)} className="space-y-4">
              <FormField
                control={upgradeForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
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
                control={upgradeForm.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targets.map((target: any) => (
                          <SelectItem key={target.id} value={target.id.toString()}>
                            {target.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={upgradeForm.control}
                name="upgradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upgrade Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Sunbeds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={upgradeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Replace old pool loungers with luxury teak sunbeds" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={upgradeForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="appliances">Appliances</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="renovation">Renovation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={upgradeForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={upgradeForm.control}
                name="triggerAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="2500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={upgradeForm.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="180000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={upgradeForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUpgradeMutation.isPending}>
                  Create Upgrade
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}