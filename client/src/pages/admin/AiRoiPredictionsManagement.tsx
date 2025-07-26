import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarDays, TrendingUp, DollarSign, Target, Brain, Sparkles, BarChart3, PlusCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

// Form schemas
const aiRoiPredictionSchema = z.object({
  propertyId: z.number().min(1, "Property is required"),
  forecastStart: z.string().min(1, "Forecast start date is required"),
  forecastEnd: z.string().min(1, "Forecast end date is required"),
  predictedRoi: z.number().min(0, "ROI must be positive").max(100, "ROI cannot exceed 100%"),
  predictedOccupancy: z.number().min(0, "Occupancy must be positive").max(100, "Occupancy cannot exceed 100%"),
  aiNotes: z.string().min(10, "AI notes must be at least 10 characters"),
});

type AiRoiPredictionFormData = z.infer<typeof aiRoiPredictionSchema>;

interface AiRoiPrediction {
  id: number;
  organizationId: string;
  propertyId: number;
  forecastStart: string;
  forecastEnd: string;
  predictedRoi: number;
  predictedOccupancy: number;
  aiNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: number;
  name: string;
  bedrooms: number;
  address: string;
}

function CreatePredictionDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AiRoiPredictionFormData>({
    resolver: zodResolver(aiRoiPredictionSchema),
    defaultValues: {
      propertyId: 0,
      forecastStart: "",
      forecastEnd: "",
      predictedRoi: 15.0,
      predictedOccupancy: 75.0,
      aiNotes: "",
    },
  });

  // Get properties for dropdown
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const createMutation = useMutation({
    mutationFn: (data: AiRoiPredictionFormData) =>
      apiRequest("POST", "/api/ai-roi-predictions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-roi-predictions"] });
      setOpen(false);
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "AI ROI prediction created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create AI ROI prediction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AiRoiPredictionFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Prediction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Create AI ROI Prediction
          </DialogTitle>
          <DialogDescription>
            Generate a new AI-powered ROI forecast for a property
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name} ({property.bedrooms}BR)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="forecastStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="forecastEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="predictedRoi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Predicted ROI (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="predictedOccupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Predicted Occupancy (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Analysis Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="AI-generated market analysis and recommendations..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Prediction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PredictionCard({ prediction, properties }: { prediction: AiRoiPrediction; properties: Property[] }) {
  const property = properties.find(p => p.id === prediction.propertyId);
  
  const getRoiColor = (roi: number) => {
    if (roi >= 20) return "bg-green-500";
    if (roi >= 15) return "bg-blue-500";
    if (roi >= 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return "text-green-600";
    if (occupancy >= 75) return "text-blue-600";
    if (occupancy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            {property?.name || `Property ${prediction.propertyId}`}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(prediction.forecastStart)} - {formatDate(prediction.forecastEnd)}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {property?.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Predicted ROI</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {prediction.predictedRoi.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={prediction.predictedRoi} 
                className="h-2"
                max={30}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Predicted Occupancy</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getOccupancyColor(prediction.predictedOccupancy)}`}>
                  {prediction.predictedOccupancy.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={prediction.predictedOccupancy} 
                className="h-2"
                max={100}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">AI Analysis</span>
          </div>
          <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-lg border">
            {prediction.aiNotes}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Created: {formatDate(prediction.createdAt)}</span>
          <Badge variant="secondary" className="text-xs">AI Generated</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AiRoiPredictionsManagement() {
  const { toast } = useToast();

  // Get AI ROI predictions
  const { data: predictions = [], isLoading } = useQuery<AiRoiPrediction[]>({
    queryKey: ["/api/ai-roi-predictions"],
  });

  // Get properties for reference
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Get analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/ai-roi-predictions/analytics"],
  });

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "AI ROI prediction operation completed successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              AI ROI Predictions
            </h1>
            <p className="text-muted-foreground">AI-powered investment return forecasting and market analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI ROI Predictions
            <Badge variant="secondary" className="ml-2">Advanced</Badge>
          </h1>
          <p className="text-muted-foreground">AI-powered investment return forecasting and market analysis</p>
        </div>
        <CreatePredictionDialog onSuccess={handleSuccess} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                  <Brain className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview?.totalPredictions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    AI-generated forecasts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.overview?.avgRoi?.toFixed(1) || "0.0"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Portfolio average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.overview?.avgOccupancy?.toFixed(1) || "0.0"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected occupancy
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.propertyCount || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    With predictions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {predictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI ROI Predictions</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first AI-powered ROI prediction to start forecasting investment returns.
                </p>
                <CreatePredictionDialog onSuccess={handleSuccess} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <PredictionCard 
                  key={prediction.id} 
                  prediction={prediction} 
                  properties={properties}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  ROI Distribution
                </CardTitle>
                <CardDescription>Predicted returns across portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.roiDistribution ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.roiDistribution).map(([range, count]) => (
                      <div key={range} className="flex items-center justify-between">
                        <span className="text-sm">{range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count as number / predictions.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No distribution data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Occupancy Ranges
                </CardTitle>
                <CardDescription>Expected occupancy distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.occupancyDistribution ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.occupancyDistribution).map(([range, count]) => (
                      <div key={range} className="flex items-center justify-between">
                        <span className="text-sm">{range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(count as number / predictions.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No distribution data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}