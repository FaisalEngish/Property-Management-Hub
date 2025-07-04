import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  DollarSign,
  CheckSquare,
  Droplet,
  Leaf,
  Bug,
  ChefHat,
  ShoppingBag,
  Link,
  Users,
  Building,
  Eye,
  Settings,
  Zap,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Villa Aruna Demo Data Configuration
const DEMO_VILLA_DATA = {
  villa: {
    id: 1,
    name: "Villa Aruna",
    location: "Koh Samui, Thailand",
    address: "123 Beach Road, Bophut, Koh Samui 84320"
  },
  reservation: {
    code: "DEMO1234",
    guest: "John Doe",
    checkIn: "2025-07-06",
    checkOut: "2025-07-11",
    nights: 5,
    pricePerNight: 10000,
    totalAmount: 50000,
    currency: "THB",
    deposit: 8000,
    electricityStartMeter: 1000,
    electricityRate: 7
  },
  services: [
    {
      id: 1,
      name: "Pool Cleaning",
      date: "2025-07-03",
      time: "15:00",
      staff: "Pool Team",
      status: "scheduled",
      department: "pool"
    },
    {
      id: 2,
      name: "Garden Service", 
      date: "2025-07-05",
      time: "14:00",
      staff: "Garden Team",
      status: "scheduled",
      department: "garden"
    },
    {
      id: 3,
      name: "During-Stay Cleaning",
      date: "2025-07-08",
      time: "10:00", 
      staff: "Housekeeping Team",
      status: "scheduled",
      department: "housekeeping"
    },
    {
      id: 4,
      name: "Chef Dinner Service",
      date: "2025-07-07",
      time: "19:00",
      staff: "Chef Team", 
      status: "scheduled",
      department: "catering"
    },
    {
      id: 5,
      name: "Pest Control",
      date: "2025-07-04",
      time: "11:00",
      staff: "Pest Control Team",
      status: "scheduled", 
      department: "pest"
    }
  ],
  staffTasks: {
    housekeeping: [
      { date: "2025-07-06", task: "Pre-clean for Villa Aruna", status: "scheduled" },
      { date: "2025-07-08", task: "During-stay cleaning", status: "scheduled" },
      { date: "2025-07-11", task: "Check-out clean", status: "scheduled" }
    ],
    garden: [
      { date: "2025-07-05", task: "Garden Service @ Villa Aruna", time: "14:00", status: "scheduled" }
    ],
    pool: [
      { date: "2025-07-03", task: "Pool Service @ Villa Aruna", time: "15:00", status: "scheduled" }
    ],
    pest: [
      { date: "2025-07-04", task: "Pest Control @ Villa Aruna", time: "11:00", status: "scheduled" }
    ],
    host: [
      { date: "2025-07-06", task: "Check-in - Villa Aruna", type: "check-in", status: "scheduled" },
      { date: "2025-07-11", task: "Check-out - Villa Aruna", type: "check-out", status: "scheduled" }
    ]
  },
  agents: {
    retail: {
      property: "Villa Aruna",
      dates: "6-11 July",
      nights: 5,
      pricePerNight: 10000,
      totalAmount: 50000,
      commission: 10,
      commissionAmount: 5000
    },
    referral: {
      property: "Villa Aruna", 
      managementFee: 10000, // 20% of 50,000
      commission: 10,
      commissionAmount: 1000
    }
  }
};

// Demo User Types
const DEMO_USERS = [
  { id: "guest", name: "Guest (John Doe)", icon: User, color: "bg-blue-500" },
  { id: "housekeeping", name: "Housekeeping Staff", icon: Home, color: "bg-green-500" },
  { id: "pool", name: "Pool Staff", icon: Droplet, color: "bg-cyan-500" },
  { id: "garden", name: "Garden Staff", icon: Leaf, color: "bg-emerald-500" },
  { id: "pest", name: "Pest Control", icon: Bug, color: "bg-orange-500" },
  { id: "host", name: "Host/Manager", icon: Building, color: "bg-purple-500" },
  { id: "retail", name: "Retail Agent", icon: ShoppingBag, color: "bg-pink-500" },
  { id: "referral", name: "Referral Agent", icon: Link, color: "bg-indigo-500" }
];

export default function SystemWideDemoIntegration() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>("guest");
  const [viewFilter, setViewFilter] = useState<string>("daily");

  // Get current date for demo purposes
  const currentDate = new Date().toISOString().split('T')[0];

  const renderGuestDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Reservation Code</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.reservation.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.villa.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.reservation.checkIn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.reservation.checkOut}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Electricity Meter (Check-in)</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.reservation.electricityStartMeter} kWh</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deposit Held</p>
              <p className="font-semibold">{DEMO_VILLA_DATA.reservation.deposit.toLocaleString()} THB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Confirmed Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DEMO_VILLA_DATA.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{service.date} at {service.time}</p>
                </div>
                <Badge variant="outline">{service.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">Address</p>
          <p className="mb-4">{DEMO_VILLA_DATA.villa.address}</p>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View House Rules & AI Suggestions
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffDashboard = (department: string) => {
    const tasks = DEMO_VILLA_DATA.staffTasks[department as keyof typeof DEMO_VILLA_DATA.staffTasks] || [];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule - {department.charAt(0).toUpperCase() + department.slice(1)} Department
            </CardTitle>
            <CardDescription>
              Filter: 
              <select 
                value={viewFilter} 
                onChange={(e) => setViewFilter(e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.date} {task.time && `at ${task.time}`}
                    </p>
                    <p className="text-xs text-blue-600">Linked to: {DEMO_VILLA_DATA.reservation.code}</p>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium">{DEMO_VILLA_DATA.villa.name}</p>
              <p className="text-sm text-muted-foreground">{DEMO_VILLA_DATA.villa.location}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHostDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Check-in/Check-out Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DEMO_VILLA_DATA.staffTasks.host.map((task, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-muted-foreground">{task.date}</p>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
                
                {task.type === "check-in" && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Check-in Requirements:</p>
                    <ul className="text-sm space-y-1">
                      <li>✓ Confirm deposit: {DEMO_VILLA_DATA.reservation.deposit.toLocaleString()} THB</li>
                      <li>✓ Record electricity meter: {DEMO_VILLA_DATA.reservation.electricityStartMeter} kWh</li>
                      <li>✓ Upload meter photo</li>
                    </ul>
                  </div>
                )}
                
                {task.type === "check-out" && (
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Check-out Calculations:</p>
                    <div className="text-sm space-y-1">
                      <p>Electricity usage: 120 kWh = 840 THB</p>
                      <p>Refundable deposit: {DEMO_VILLA_DATA.reservation.deposit} - 840 = 7,160 THB</p>
                      <div className="mt-2">
                        <label className="block text-xs">Payment Status:</label>
                        <select className="border rounded px-2 py-1 text-xs">
                          <option>Electricity paid by guest</option>
                          <option>Included</option>
                          <option>Complimentary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRetailAgentDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Demo Booking Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">{DEMO_VILLA_DATA.agents.retail.property}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dates</p>
                <p className="font-medium">{DEMO_VILLA_DATA.agents.retail.dates}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nights</p>
                <p className="font-medium">{DEMO_VILLA_DATA.agents.retail.nights}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price per night</p>
                <p className="font-medium">{DEMO_VILLA_DATA.agents.retail.pricePerNight.toLocaleString()} THB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium">{DEMO_VILLA_DATA.agents.retail.totalAmount.toLocaleString()} THB</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-100 rounded">
              <p className="text-sm font-medium text-green-800">Commission Preview</p>
              <p className="text-lg font-bold text-green-700">
                {DEMO_VILLA_DATA.agents.retail.commission}% = {DEMO_VILLA_DATA.agents.retail.commissionAmount.toLocaleString()} THB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Properties Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{DEMO_VILLA_DATA.villa.name}</p>
            <p className="text-sm text-muted-foreground">{DEMO_VILLA_DATA.villa.location}</p>
            <Badge className="mt-2">Available for booking</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReferralAgentDashboard = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Referral Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Registered Property: {DEMO_VILLA_DATA.agents.referral.property}</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Management Fee (20% of booking)</p>
                <p className="font-medium">{DEMO_VILLA_DATA.agents.referral.managementFee.toLocaleString()} THB</p>
              </div>
              
              <div className="p-3 bg-indigo-100 rounded">
                <p className="text-sm font-medium text-indigo-800">Your Commission</p>
                <p className="text-lg font-bold text-indigo-700">
                  {DEMO_VILLA_DATA.agents.referral.commission}% = {DEMO_VILLA_DATA.agents.referral.commissionAmount.toLocaleString()} THB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Villas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">{DEMO_VILLA_DATA.villa.name}</p>
            <p className="text-sm text-muted-foreground">{DEMO_VILLA_DATA.villa.location}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">Active</Badge>
              <Badge variant="outline">10% Commission</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => {
    switch (selectedUser) {
      case "guest":
        return renderGuestDashboard();
      case "housekeeping":
      case "pool":
      case "garden":
      case "pest":
        return renderStaffDashboard(selectedUser);
      case "host":
        return renderHostDashboard();
      case "retail":
        return renderRetailAgentDashboard();
      case "referral":
        return renderReferralAgentDashboard();
      default:
        return <div>Select a user type to view their dashboard</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                System-Wide Demo Data Integration
              </CardTitle>
              <CardDescription className="text-lg">
                Test all user types with Villa Aruna reservation DEMO1234 - John Doe (July 6-11, 2025)
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Type Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select User Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_USERS.map((user) => {
                  const IconComponent = user.icon;
                  return (
                    <Button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      variant={selectedUser === user.id ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <div className={`w-3 h-3 rounded-full ${user.color} mr-3`} />
                      <IconComponent className="h-4 w-4 mr-2" />
                      {user.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Villa Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Demo Villa Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Villa</p>
                  <p className="font-medium">{DEMO_VILLA_DATA.villa.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reservation</p>
                  <p className="font-medium">{DEMO_VILLA_DATA.reservation.code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Guest</p>
                  <p className="font-medium">{DEMO_VILLA_DATA.reservation.guest}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dates</p>
                  <p className="font-medium">{DEMO_VILLA_DATA.reservation.checkIn} to {DEMO_VILLA_DATA.reservation.checkOut}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {DEMO_USERS.find(u => u.id === selectedUser)?.icon && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const user = DEMO_USERS.find(u => u.id === selectedUser);
                        if (user) {
                          const IconComponent = user.icon;
                          return (
                            <>
                              <div className={`w-4 h-4 rounded-full ${user.color}`} />
                              <IconComponent className="h-5 w-5" />
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  {DEMO_USERS.find(u => u.id === selectedUser)?.name} Dashboard
                </CardTitle>
                <CardDescription>
                  Simulated view for {DEMO_USERS.find(u => u.id === selectedUser)?.name} - All data visible for evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDashboard()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services Schedule Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Complete Service Schedule - Villa Aruna (DEMO1234)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {DEMO_VILLA_DATA.services.map((service) => (
                <Card key={service.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {service.department === "pool" && <Droplet className="h-4 w-4 text-cyan-500" />}
                      {service.department === "garden" && <Leaf className="h-4 w-4 text-green-500" />}
                      {service.department === "housekeeping" && <Home className="h-4 w-4 text-blue-500" />}
                      {service.department === "catering" && <ChefHat className="h-4 w-4 text-orange-500" />}
                      {service.department === "pest" && <Bug className="h-4 w-4 text-red-500" />}
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {service.department}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.date}</p>
                    <p className="text-xs text-muted-foreground">{service.time}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {service.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}