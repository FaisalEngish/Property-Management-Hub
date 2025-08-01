import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Home, Calendar, DollarSign, Wrench, MessageSquare, FileText, Users } from "lucide-react";

export default function VillaSamuiDemo() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const response = await apiRequest("POST", "/api/seed-villa-samui-demo");
      const data = await response.json();
      
      toast({
        title: "Demo Data Seeded Successfully!",
        description: "Villa Samui Breeze is ready for evaluation.",
      });
      
      setIsSeeded(true);
      console.log("Demo seeding details:", data.details);
    } catch (error) {
      console.error("Error seeding demo:", error);
      toast({
        title: "Seeding Failed",
        description: "Could not seed Villa Samui demo data.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const demoData = {
    property: {
      name: "Villa Samui Breeze",
      bedrooms: 3,
      bathrooms: 3,
      maxGuests: 6,
      location: "Koh Samui, Thailand",
      amenities: ["Pool", "Garden", "WiFi", "Air Conditioning", "Kitchen"]
    },
    booking: {
      guest: "John Doe",
      platform: "Airbnb",
      checkIn: "July 1, 2025",
      checkOut: "July 5, 2025",
      nights: 4,
      income: "32,000 THB",
      deposit: "5,000 THB (Cash)"
    },
    services: [
      { name: "Airport Pickup", cost: "700 THB" },
      { name: "Private Chef Dinner", cost: "2,000 THB" },
      { name: "Mid-stay Cleaning", cost: "850 THB" }
    ],
    workflow: {
      checkInBy: "Nye",
      checkOutBy: "Thura",
      electricityUsage: "100 kWh",
      electricityCost: "700 THB",
      refund: "750 THB"
    },
    financials: {
      ownerShare: "22,400 THB (70%)",
      companyShare: "9,600 THB (30%)",
      pmCommission: "4,800 THB (Adam)"
    },
    tasks: [
      "Pre-arrival cleaning",
      "Pool service (2x during stay)",
      "AC maintenance (AI-triggered)"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Home className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Villa Samui Breeze Demo Flow</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete working demonstration of all HostPilotPro modules using realistic property operations data
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleSeedDemo}
              disabled={isSeeding || isSeeded}
              size="lg"
              className="px-8"
            >
              {isSeeding ? "Seeding Demo Data..." : isSeeded ? "Demo Data Ready!" : "Seed Demo Data"}
              {isSeeded && <CheckCircle className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Demo Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{demoData.property.name}</h4>
                <p className="text-sm text-gray-600">{demoData.property.location}</p>
              </div>
              <div className="flex gap-2 text-sm">
                <Badge variant="secondary">{demoData.property.bedrooms} BR</Badge>
                <Badge variant="secondary">{demoData.property.bathrooms} BA</Badge>
                <Badge variant="secondary">{demoData.property.maxGuests} Guests</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {demoData.property.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Live Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{demoData.booking.guest}</h4>
                <p className="text-sm text-gray-600">{demoData.booking.platform}</p>
              </div>
              <div className="text-sm">
                <p><strong>Check-in:</strong> {demoData.booking.checkIn}</p>
                <p><strong>Check-out:</strong> {demoData.booking.checkOut}</p>
                <p><strong>Revenue:</strong> {demoData.booking.income}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">{demoData.booking.nights} nights confirmed</Badge>
            </CardContent>
          </Card>

          {/* Financial Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                Financial Split
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Owner Share:</span>
                  <span className="font-semibold text-green-600">{demoData.financials.ownerShare}</span>
                </div>
                <div className="flex justify-between">
                  <span>Company Share:</span>
                  <span className="font-semibold">{demoData.financials.companyShare}</span>
                </div>
                <div className="flex justify-between">
                  <span>PM Commission:</span>
                  <span className="font-semibold text-blue-600">{demoData.financials.pmCommission}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Add-on Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoData.services.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="font-semibold">{service.cost}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Services:</span>
                <span>3,550 THB</span>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Check-in/out Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Check-in by:</span>
                <span className="font-semibold">{demoData.workflow.checkInBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out by:</span>
                <span className="font-semibold">{demoData.workflow.checkOutBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Electricity:</span>
                <span className="font-semibold">{demoData.workflow.electricityUsage}</span>
              </div>
              <div className="flex justify-between">
                <span>Final Refund:</span>
                <span className="font-semibold text-green-600">{demoData.workflow.refund}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-red-600" />
                Generated Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoData.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{task}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Demo Evaluation Instructions
            </CardTitle>
            <CardDescription>
              After seeding, explore these modules to see the complete workflow:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Property Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Properties → Villa Samui Breeze</li>
                  <li>• Check-in/Check-out Workflow</li>
                  <li>• Maintenance Task System</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Financial Modules</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Finance Engine → Owner Balances</li>
                  <li>• Booking Income Rules</li>
                  <li>• Invoice Generator</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Guest Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add-on Services Booking</li>
                  <li>• Guest Portal (John Doe)</li>
                  <li>• Guest Communication Center</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">User Dashboards</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Owner Dashboard (Michael)</li>
                  <li>• Portfolio Manager (Adam)</li>
                  <li>• Staff Tasks (Nye, Thura)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {isSeeded && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Demo Ready!</span>
                <span className="text-sm">Navigate to any module to see Villa Samui Breeze data in action.</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}