import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, DollarSign, Calendar, Users, Building } from "lucide-react";

export default function OwnerTargetUpgradeTracker() {
  const [selectedPeriod, setSelectedPeriod] = useState("2025");

  const ownerTargets = [
    {
      id: 1,
      owner: "Alice Owner",
      property: "Villa Samui Breeze",
      currentRevenue: 85000,
      targetRevenue: 120000,
      progress: 71,
      upgradePlan: "Premium Package",
      status: "in-progress",
      deadline: "2025-06-30"
    },
    {
      id: 2,
      owner: "Bob Johnson", 
      property: "Villa Aruna",
      currentRevenue: 45000,
      targetRevenue: 60000,
      progress: 75,
      upgradePlan: "Standard Plus",
      status: "on-track",
      deadline: "2025-08-15"
    },
    {
      id: 3,
      owner: "Carol Smith",
      property: "Villa Paradise",
      currentRevenue: 25000,
      targetRevenue: 80000,
      progress: 31,
      upgradePlan: "Full Renovation",
      status: "at-risk",
      deadline: "2025-12-31"
    }
  ];

  const upgradePlans = [
    {
      name: "Premium Package",
      features: ["Professional Photography", "Enhanced Listings", "Concierge Service"],
      estimatedIncrease: "40-60%",
      cost: "$5,000"
    },
    {
      name: "Standard Plus",
      features: ["Updated Amenities", "Marketing Boost", "Guest Experience"],
      estimatedIncrease: "25-35%", 
      cost: "$3,000"
    },
    {
      name: "Full Renovation",
      features: ["Complete Makeover", "Premium Furnishing", "Smart Home"],
      estimatedIncrease: "80-120%",
      cost: "$15,000"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "at-risk": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8" />
            Owner Targets & Upgrades
          </h1>
          <p className="text-gray-600">Track revenue targets and upgrade progress for property owners</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Target className="w-4 h-4 mr-2" />
            Set New Target
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targets">Revenue Targets</TabsTrigger>
          <TabsTrigger value="upgrades">Upgrade Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Owners</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Track</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">At Risk</p>
                    <p className="text-2xl font-bold text-red-600">3</p>
                  </div>
                  <Target className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold">67%</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Owner Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownerTargets.map((target) => (
                  <div key={target.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{target.owner}</p>
                          <p className="text-sm text-gray-600">{target.property}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(target.status)}>
                          {target.status.replace('-', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">Due: {target.deadline}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Revenue</p>
                        <p className="font-semibold">${target.currentRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target Revenue</p>
                        <p className="font-semibold">${target.targetRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Upgrade Plan</p>
                        <p className="font-semibold">{target.upgradePlan}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{target.progress}%</span>
                      </div>
                      <Progress value={target.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Targets Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input placeholder="Owner name" />
                  <Input placeholder="Target amount" type="number" />
                  <Input placeholder="Deadline" type="date" />
                  <Button>Set Target</Button>
                </div>

                <div className="space-y-3">
                  {ownerTargets.map((target) => (
                    <div key={target.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{target.owner}</p>
                          <p className="text-sm text-gray-600">{target.property}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${target.targetRevenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{target.deadline}</p>
                        </div>
                        <Progress value={target.progress} className="w-24 h-2" />
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Plans & Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upgradePlans.map((plan, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-2xl font-bold text-green-600">{plan.cost}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Expected Increase</p>
                          <p className="font-semibold text-green-600">{plan.estimatedIncrease}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Features Included:</p>
                          <ul className="space-y-1">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button className="w-full mt-4">Select Plan</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Achievement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">67%</p>
                    <p className="text-gray-600">Average Progress</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Q1 2025</span>
                      <span className="font-semibold">72%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q2 2025</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q3 2025</span>
                      <span className="font-semibold">61%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upgrade ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">156%</p>
                    <p className="text-gray-600">Average ROI</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Premium Package</span>
                      <span className="font-semibold text-green-600">180%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard Plus</span>
                      <span className="font-semibold text-green-600">145%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Renovation</span>
                      <span className="font-semibold text-blue-600">142%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}