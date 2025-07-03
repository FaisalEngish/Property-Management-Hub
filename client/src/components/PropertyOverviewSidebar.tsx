import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  DollarSign, 
  FileText, 
  Wrench, 
  Star,
  MapPin,
  Bed,
  Bath,
  Users,
  Zap,
  Droplets,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

interface PropertyOverviewSidebarProps {
  propertyId: string;
  userRole?: "owner" | "admin" | "portfolio-manager";
}

export default function PropertyOverviewSidebar({ propertyId, userRole = "owner" }: PropertyOverviewSidebarProps) {
  const { data: propertyDetails } = useQuery({
    queryKey: ["/api/property-overview", propertyId],
  });

  const { data: utilitySetup } = useQuery({
    queryKey: ["/api/property-utilities", propertyId],
  });

  const { data: financialOverview } = useQuery({
    queryKey: ["/api/property-finances", propertyId],
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/property-documents", propertyId],
  });

  const { data: serviceHistory } = useQuery({
    queryKey: ["/api/property-service-history", propertyId],
  });

  const { data: guestReviews } = useQuery({
    queryKey: ["/api/property-reviews", propertyId],
  });

  if (!propertyDetails) {
    return (
      <div className="w-80 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      maintenance: "secondary", 
      inactive: "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const getUtilityStatus = (utilities: any) => {
    if (!utilities) return { setup: 0, total: 3 };
    let setup = 0;
    if (utilities.electricity) setup++;
    if (utilities.water) setup++;
    if (utilities.internet) setup++;
    return { setup, total: 3 };
  };

  const getDocumentStatus = (docs: any) => {
    if (!docs) return { complete: 0, required: 7 };
    const requiredCategories = ["ownership", "license", "insurance"];
    const complete = requiredCategories.filter(cat => 
      docs.some((doc: any) => doc.category === cat && doc.status === "approved")
    ).length;
    return { complete, required: requiredCategories.length };
  };

  const utilityStatus = getUtilityStatus(utilitySetup);
  const documentStatus = getDocumentStatus(documents);

  return (
    <div className="w-80 space-y-4">
      {/* Property Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Home className="h-5 w-5" />
            <span>Property Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(propertyDetails.status)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{propertyDetails.propertyType || "Villa"}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Bed className="h-3 w-3" />
                <span>{propertyDetails.bedrooms} bed</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-3 w-3" />
                <span>{propertyDetails.bathrooms} bath</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{propertyDetails.maxGuests} guests</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-xs text-muted-foreground">{propertyDetails.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Utilities Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Zap className="h-5 w-5" />
            <span>Utilities Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Configuration</span>
            <Badge variant={utilityStatus.setup === utilityStatus.total ? "default" : "secondary"}>
              {utilityStatus.setup}/{utilityStatus.total} Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Electricity</span>
              </div>
              {utilitySetup?.electricity ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Water</span>
              </div>
              {utilitySetup?.water ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">Internet</span>
              </div>
              {utilitySetup?.internet ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {userRole !== "owner" && (
            <Button variant="outline" size="sm" className="w-full">
              Configure Utilities
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <DollarSign className="h-5 w-5" />
            <span>Financial Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-xs text-muted-foreground">This Month</div>
              <div className="text-lg font-bold text-green-600">
                ฿{financialOverview?.monthlyRevenue?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-xs text-muted-foreground">YTD Total</div>
              <div className="text-lg font-bold text-blue-600">
                ฿{financialOverview?.yearlyRevenue?.toLocaleString() || "0"}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Occupancy Rate</span>
              <span className="font-medium">{financialOverview?.occupancyRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Nightly Rate</span>
              <span className="font-medium">฿{financialOverview?.avgNightlyRate?.toLocaleString() || "0"}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>
              {financialOverview?.trend === "up" ? "↗ Increasing" : 
               financialOverview?.trend === "down" ? "↘ Decreasing" : 
               "→ Stable"} from last month
            </span>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            View Full Report
          </Button>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Required Docs</span>
            <Badge variant={documentStatus.complete === documentStatus.required ? "default" : "secondary"}>
              {documentStatus.complete}/{documentStatus.required} Complete
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs">
            {["Ownership Proof", "Rental License", "Insurance"].map((doc, index) => {
              const isComplete = documents?.some((d: any) => 
                d.category === doc.toLowerCase().replace(" ", "_") && d.status === "approved"
              );
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{doc}</span>
                  {isComplete ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>

          <Button variant="outline" size="sm" className="w-full">
            Manage Documents
          </Button>
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Wrench className="h-5 w-5" />
            <span>Service History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold">{serviceHistory?.thisMonth || 0}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600">{serviceHistory?.completed || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-sm font-bold text-yellow-600">{serviceHistory?.pending || 0}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {serviceHistory?.recent && serviceHistory.recent.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div className="text-xs font-medium">Recent Activity</div>
              {serviceHistory.recent.slice(0, 3).map((service: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {service.type} - {new Date(service.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full">
            View All Tasks
          </Button>
        </CardContent>
      </Card>

      {/* Guest Reviews */}
      {guestReviews && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Star className="h-5 w-5" />
              <span>Guest Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Rating</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{guestReviews.averageRating?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="font-medium">{guestReviews.totalReviews || 0}</div>
                <div className="text-muted-foreground">Total Reviews</div>
              </div>
              <div>
                <div className="font-medium">{guestReviews.thisMonth || 0}</div>
                <div className="text-muted-foreground">This Month</div>
              </div>
            </div>

            {guestReviews.recentReview && (
              <div className="text-xs">
                <div className="font-medium">Latest Review:</div>
                <div className="text-muted-foreground italic truncate">
                  "{guestReviews.recentReview.excerpt}"
                </div>
                <div className="text-muted-foreground">
                  - {guestReviews.recentReview.guestName}
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full">
              View All Reviews
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions (Role-based) */}
      {userRole !== "owner" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Wrench className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}