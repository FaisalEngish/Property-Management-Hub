import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  MapPin,
  Bed,
  Bath,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Settings
} from "lucide-react";
import GlobalFilters, { useGlobalFilters, applyGlobalFilters } from "@/components/GlobalFilters";

import TopBar from "@/components/TopBar";

export default function FilteredPropertyDashboard() {
  const [globalFilters, setGlobalFilters] = useGlobalFilters("property-dashboard-filters");

  // Fetch all property-related data
  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: maintenanceIssues = [] } = useQuery({
    queryKey: ["/api/maintenance-issues"],
  });

  const { data: utilityBills = [] } = useQuery({
    queryKey: ["/api/utility-bills"],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Apply global filters to properties
  const filteredProperties = applyGlobalFilters(properties, globalFilters, {
    propertyIdField: "id",
    ownerIdField: "ownerId",
    portfolioManagerIdField: "portfolioManagerId",
    areaField: "address",
    bedroomCountField: "bedrooms",
    statusField: "status",
    searchFields: ["name", "address", "description"],
  });

  // Calculate property statistics
  const activeProperties = filteredProperties.filter(p => p.status === "active").length;
  const inactiveProperties = filteredProperties.filter(p => p.status === "inactive").length;
  const totalCapacity = filteredProperties.reduce((sum, p) => sum + (p.capacity || 0), 0);
  const avgRating = filteredProperties.length > 0 
    ? filteredProperties.reduce((sum, p) => sum + (p.rating || 4.5), 0) / filteredProperties.length 
    : 0;

  // Get property-specific data
  const getPropertyMaintenanceIssues = (propertyId: number) => 
    maintenanceIssues.filter((issue: any) => issue.propertyId === propertyId);

  const getPropertyUtilityBills = (propertyId: number) => 
    utilityBills.filter((bill: any) => bill.propertyId === propertyId && bill.paymentStatus === "pending");

  const getPropertyBookings = (propertyId: number) => {
    const currentDate = new Date();
    return bookings.filter((booking: any) => 
      booking.propertyId === propertyId && 
      new Date(booking.checkOut) >= currentDate
    );
  };

  if (loadingProperties) {
    return (
      <div className="min-h-screen flex bg-background">

        <div className="flex-1 flex flex-col lg:ml-0">
          <TopBar title="Property Dashboard" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">

      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Property Dashboard" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Global Filters */}
          <GlobalFilters
            filters={globalFilters}
            onFiltersChange={setGlobalFilters}
            placeholder="Search properties..."
            showFilters={{
              property: true,
              owner: true,
              portfolioManager: true,
              area: true,
              bedrooms: true,
              status: true,
              search: true,
            }}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                <Building className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {inactiveProperties} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalCapacity}</div>
                <p className="text-xs text-muted-foreground">
                  guests across all properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {avgRating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  out of 5.0 stars
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {maintenanceIssues.filter((issue: any) => issue.status === "open").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  maintenance issues
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Property Grid */}
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Issues</TabsTrigger>
              <TabsTrigger value="utilities">Utility Bills</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property: any) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    maintenanceIssues={getPropertyMaintenanceIssues(property.id)}
                    utilityBills={getPropertyUtilityBills(property.id)}
                    bookings={getPropertyBookings(property.id)}
                  />
                ))}
                {filteredProperties.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No properties found with current filters
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <PropertyListTable properties={filteredProperties} />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceIssuesTable 
                issues={maintenanceIssues.filter((issue: any) => 
                  filteredProperties.some(p => p.id === issue.propertyId)
                )} 
              />
            </TabsContent>

            <TabsContent value="utilities">
              <UtilityBillsTable 
                bills={utilityBills.filter((bill: any) => 
                  filteredProperties.some(p => p.id === bill.propertyId)
                )} 
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function PropertyCard({ 
  property, 
  maintenanceIssues, 
  utilityBills, 
  bookings 
}: { 
  property: any;
  maintenanceIssues: any[];
  utilityBills: any[];
  bookings: any[];
}) {
  const pendingIssues = maintenanceIssues.filter(issue => issue.status === "open").length;
  const pendingBills = utilityBills.length;
  const upcomingBookings = bookings.length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {property.address}
            </div>
          </div>
          <Badge variant={property.status === "active" ? "default" : "secondary"}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{property.capacity} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{property.rating || 4.5}</span>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {pendingIssues > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {pendingIssues} open issue{pendingIssues !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
          
          {pendingBills > 0 && (
            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {pendingBills} pending bill{pendingBills !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {upcomingBookings > 0 && (
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-md">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  {upcomingBookings} upcoming booking{upcomingBookings !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-1" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PropertyListTable({ properties }: { properties: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Location</th>
                <th className="text-left p-2">Bedrooms</th>
                <th className="text-left p-2">Capacity</th>
                <th className="text-left p-2">Rating</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{property.name}</td>
                  <td className="p-2 text-sm text-muted-foreground">{property.address}</td>
                  <td className="p-2 text-sm">{property.bedrooms}</td>
                  <td className="p-2 text-sm">{property.capacity}</td>
                  <td className="p-2 text-sm">{property.rating || 4.5}</td>
                  <td className="p-2">
                    <Badge variant={property.status === "active" ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceIssuesTable({ issues }: { issues: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Property</th>
                <th className="text-left p-2">Issue</th>
                <th className="text-left p-2">Priority</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{issue.propertyName}</td>
                  <td className="p-2 text-sm">{issue.description}</td>
                  <td className="p-2">
                    <Badge variant={issue.urgency === "High" ? "destructive" : "secondary"}>
                      {issue.urgency}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={issue.status === "open" ? "destructive" : "default"}>
                      {issue.status}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">{new Date(issue.reportedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function UtilityBillsTable({ bills }: { bills: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utility Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Property</th>
                <th className="text-left p-2">Bill Type</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-left p-2">Due Date</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{bill.propertyName}</td>
                  <td className="p-2 text-sm">{bill.billType}</td>
                  <td className="p-2 text-sm text-right font-medium">
                    ฿{parseFloat(bill.amount).toLocaleString()}
                  </td>
                  <td className="p-2 text-sm">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <Badge variant={bill.paymentStatus === "paid" ? "default" : "destructive"}>
                      {bill.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}