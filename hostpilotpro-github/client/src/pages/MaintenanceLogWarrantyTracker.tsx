import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Shield, AlertTriangle, CheckCircle, Clock, Calendar, DollarSign, FileText, Plus, Search } from "lucide-react";

export default function MaintenanceLogWarrantyTracker() {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const maintenanceRecords = [
    {
      id: 1,
      property: "Villa Samui Breeze",
      category: "HVAC",
      description: "Air conditioning system service and filter replacement",
      date: "2025-01-20",
      technician: "Somchai HVAC Services",
      cost: 2500,
      status: "completed",
      warrantyExpiry: "2025-07-20",
      nextService: "2025-04-20",
      priority: "medium",
      photos: ["ac_service_1.jpg", "filter_replacement.jpg"]
    },
    {
      id: 2,
      property: "Villa Aruna",
      category: "Pool",
      description: "Pool pump replacement and chemical balancing",
      date: "2025-01-18",
      technician: "AquaTech Pool Services",
      cost: 4200,
      status: "completed",
      warrantyExpiry: "2026-01-18",
      nextService: "2025-02-18",
      priority: "high",
      photos: ["pool_pump_before.jpg", "pool_pump_after.jpg"]
    },
    {
      id: 3,
      property: "Villa Paradise",
      category: "Plumbing",
      description: "Kitchen sink faucet repair and pipe inspection",
      date: "2025-01-15",
      technician: "Thailand Plumbing Co.",
      cost: 800,
      status: "completed",
      warrantyExpiry: "2025-06-15",
      nextService: "2025-07-15",
      priority: "low",
      photos: ["faucet_repair.jpg"]
    },
    {
      id: 4,
      property: "Villa Samui Breeze",
      category: "Electrical",
      description: "Main electrical panel upgrade and safety inspection",
      date: "2025-01-12",
      technician: "PowerTech Electrical",
      cost: 6500,
      status: "in_progress",
      warrantyExpiry: "2027-01-12",
      nextService: "2025-06-12",
      priority: "high",
      photos: ["electrical_panel_new.jpg"]
    },
    {
      id: 5,
      property: "Villa Aruna",
      category: "Garden",
      description: "Irrigation system installation and landscaping",
      date: "2025-01-10",
      technician: "Green Gardens Thailand",
      cost: 3200,
      status: "scheduled",
      warrantyExpiry: "2025-12-10",
      nextService: "2025-03-10",
      priority: "medium",
      photos: []
    }
  ];

  const warrantyAlerts = [
    {
      id: 1,
      property: "Villa Paradise",
      item: "Water heater unit",
      category: "Plumbing",
      purchaseDate: "2024-01-15",
      warrantyExpiry: "2025-01-15",
      daysUntilExpiry: -7,
      status: "expired",
      vendor: "Rheem Thailand",
      cost: 8500
    },
    {
      id: 2,
      property: "Villa Samui Breeze",
      item: "Refrigerator - Kitchen",
      category: "Appliances",
      purchaseDate: "2023-06-20",
      warrantyExpiry: "2025-06-20",
      daysUntilExpiry: 149,
      status: "warning",
      vendor: "Samsung Electronics",
      cost: 15000
    },
    {
      id: 3,
      property: "Villa Aruna",
      item: "Solar panel system",
      category: "Electrical",
      purchaseDate: "2022-11-10",
      warrantyExpiry: "2027-11-10",
      daysUntilExpiry: 1024,
      status: "active",
      vendor: "Thai Solar Solutions",
      cost: 45000
    }
  ];

  const aiPredictions = [
    {
      id: 1,
      property: "Villa Samui Breeze",
      prediction: "Pool pump replacement recommended",
      confidence: 87,
      category: "Pool",
      estimatedCost: 4500,
      timeframe: "2-3 months",
      reasoning: "Based on usage patterns and similar equipment lifecycle",
      priority: "medium"
    },
    {
      id: 2,
      property: "Villa Paradise",
      prediction: "HVAC system deep cleaning required",
      confidence: 92,
      category: "HVAC",
      estimatedCost: 1200,
      timeframe: "1 month",
      reasoning: "Seasonal maintenance due and efficiency monitoring indicates need",
      priority: "high"
    },
    {
      id: 3,
      property: "Villa Aruna",
      prediction: "Roof inspection and minor repairs",
      confidence: 74,
      category: "Structure",
      estimatedCost: 2800,
      timeframe: "6 months",
      reasoning: "Age of property and recent weather patterns suggest preventive maintenance",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWarrantyStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const summaryStats = {
    totalRecords: maintenanceRecords.length,
    completedTasks: maintenanceRecords.filter(r => r.status === "completed").length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + r.cost, 0),
    warrantyAlerts: warrantyAlerts.filter(w => w.status === "warning" || w.status === "expired").length
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            Maintenance Log & Warranty Tracker
          </h1>
          <p className="text-gray-600">Track maintenance records, warranty status, and AI-powered service predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Maintenance
          </Button>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="maintenance">Maintenance Log</TabsTrigger>
          <TabsTrigger value="warranty">Warranty Tracker</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold">{summaryStats.totalRecords}</p>
                  </div>
                  <Wrench className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.completedTasks}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(summaryStats.totalCost)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Warranty Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{summaryStats.warrantyAlerts}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="villa-samui">Villa Samui Breeze</SelectItem>
                    <SelectItem value="villa-aruna">Villa Aruna</SelectItem>
                    <SelectItem value="villa-paradise">Villa Paradise</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="pool">Pool</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="garden">Garden</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search maintenance..." className="pl-10" />
                </div>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium">{record.description}</h4>
                          <p className="text-sm text-gray-600">{record.property} • {record.category}</p>
                          <p className="text-xs text-gray-500">Technician: {record.technician}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{record.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cost</p>
                        <p className="font-medium text-green-600">{formatCurrency(record.cost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Warranty Until</p>
                        <p className="font-medium">{record.warrantyExpiry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next Service</p>
                        <p className="font-medium">{record.nextService}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Photos</p>
                        <p className="font-medium">{record.photos.length} attachments</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Category: {record.category} • Priority: {record.priority}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Photos</Button>
                        <Button variant="outline" size="sm">Edit Record</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Warranty Alerts</span>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Warranty
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warrantyAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{alert.item}</p>
                        <p className="text-sm text-gray-600">{alert.property} • {alert.category}</p>
                        <p className="text-xs text-gray-500">
                          Vendor: {alert.vendor} • Cost: {formatCurrency(alert.cost)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getWarrantyStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {alert.daysUntilExpiry < 0 
                          ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                          : `${alert.daysUntilExpiry} days remaining`
                        }
                      </p>
                      <p className="text-xs text-gray-500">Expires: {alert.warrantyExpiry}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Maintenance Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiPredictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">{prediction.prediction}</h4>
                          <p className="text-sm text-gray-600">{prediction.property} • {prediction.category}</p>
                          <p className="text-xs text-gray-500">{prediction.reasoning}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(prediction.priority)}>
                          {prediction.priority}
                        </Badge>
                        <span className="text-sm font-bold text-blue-600">
                          {prediction.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Estimated Cost</p>
                        <p className="font-medium text-orange-600">{formatCurrency(prediction.estimatedCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Timeframe</p>
                        <p className="font-medium">{prediction.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: `${prediction.confidence}%`}}
                            ></div>
                          </div>
                          <span className="text-sm">{prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        AI Recommendation • {prediction.category} • {prediction.priority} priority
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Schedule Maintenance</Button>
                        <Button variant="outline" size="sm">Dismiss</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>HVAC Systems</span>
                  <span className="font-bold">{formatCurrency(2500)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pool Maintenance</span>
                  <span className="font-bold">{formatCurrency(4200)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Electrical Work</span>
                  <span className="font-bold">{formatCurrency(6500)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Garden & Landscaping</span>
                  <span className="font-bold">{formatCurrency(3200)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Plumbing</span>
                  <span className="font-bold">{formatCurrency(800)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Villa Aruna - Pool Service</span>
                  <span className="text-sm font-medium">Feb 18, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Villa Paradise - HVAC Service</span>
                  <span className="text-sm font-medium">Mar 10, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Villa Samui - Pool Service</span>
                  <span className="text-sm font-medium">Apr 20, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Villa Aruna - Electrical Inspection</span>
                  <span className="text-sm font-medium">Jun 12, 2025</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Warranty expiry alerts (days before)</span>
                      <Input type="number" defaultValue="30" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Maintenance due reminders</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI prediction notifications</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">AI Prediction Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Minimum confidence threshold</span>
                      <Input type="number" defaultValue="75" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enable predictive maintenance</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto-schedule high confidence predictions</span>
                      <input type="checkbox" />
                    </div>
                  </div>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}