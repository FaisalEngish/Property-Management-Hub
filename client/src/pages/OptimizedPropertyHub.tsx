import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Calendar, 
  Settings, 
  Plus,
  Filter,
  Search,
  MapPin,
  TrendingUp,
  DollarSign,
  CheckCircle
} from "lucide-react";

// Pre-loaded property data for instant display
const DEMO_PROPERTIES = [
  {
    id: 17,
    name: "Villa Samui Breeze",
    location: "Koh Samui, Thailand",
    bedrooms: 3,
    bathrooms: 2,
    capacity: 6,
    status: "active",
    lastBooking: "2 days ago",
    occupancy: 85,
    monthlyRevenue: 120000,
    roi: 12.5,
    maintenanceTasks: 2,
    image: "🏖️"
  },
  {
    id: 18,
    name: "Villa Ocean View",
    location: "Phuket, Thailand", 
    bedrooms: 2,
    bathrooms: 2,
    capacity: 4,
    status: "active",
    lastBooking: "1 day ago",
    occupancy: 92,
    monthlyRevenue: 95000,
    roi: 14.2,
    maintenanceTasks: 1,
    image: "🌊"
  },
  {
    id: 19,
    name: "Villa Tropical Paradise",
    location: "Krabi, Thailand",
    bedrooms: 4,
    bathrooms: 3,
    capacity: 8,
    status: "active",
    lastBooking: "3 days ago",
    occupancy: 78,
    monthlyRevenue: 150000,
    roi: 11.8,
    maintenanceTasks: 3,
    image: "🌴"
  },
  {
    id: 20,
    name: "Villa Aruna Demo",
    location: "Koh Phi Phi, Thailand",
    bedrooms: 4,
    bathrooms: 4,
    capacity: 8,
    status: "maintenance",
    lastBooking: "1 week ago",
    occupancy: 65,
    monthlyRevenue: 180000,
    roi: 15.1,
    maintenanceTasks: 5,
    image: "🏝️"
  }
];

const QUICK_ACTIONS = [
  { 
    id: "add-property", 
    label: "Add New Property", 
    icon: Plus, 
    color: "bg-blue-600 hover:bg-blue-700",
    route: "/properties/new"
  },
  { 
    id: "bulk-management", 
    label: "Bulk Management", 
    icon: Settings, 
    color: "bg-green-600 hover:bg-green-700",
    route: "/properties/bulk"
  },
  { 
    id: "calendar-view", 
    label: "Calendar View", 
    icon: Calendar, 
    color: "bg-purple-600 hover:bg-purple-700",
    route: "/multi-property-calendar"
  },
  { 
    id: "performance", 
    label: "Performance Report", 
    icon: TrendingUp, 
    color: "bg-orange-600 hover:bg-orange-700",
    route: "/property-performance"
  }
];

export default function OptimizedPropertyHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  // Fast, instant filtering
  const filteredProperties = useMemo(() => {
    return DEMO_PROPERTIES.filter(property => {
      const matchesSearch = searchTerm === "" || 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handlePropertySelect = (propertyId: number) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  // Summary stats
  const totalProperties = filteredProperties.length;
  const activeProperties = filteredProperties.filter(p => p.status === "active").length;
  const totalRevenue = filteredProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const avgOccupancy = filteredProperties.reduce((sum, p) => sum + p.occupancy, 0) / totalProperties;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8 text-blue-600" />
            Property Hub
          </h1>
          <p className="text-gray-600 mt-1">Manage your property portfolio</p>
        </div>
        <div className="flex gap-2">
          {QUICK_ACTIONS.slice(0, 2).map((action) => (
            <Button 
              key={action.id}
              onClick={() => handleNavigation(action.route)}
              className={action.color}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-blue-600">{totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Properties</p>
                <p className="text-2xl font-bold text-green-600">{activeProperties}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ฿{totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Occupancy</p>
                <p className="text-2xl font-bold text-orange-600">{avgOccupancy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {selectedProperties.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedProperties.length} selected
                </Badge>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">{property.image}</div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => handlePropertySelect(property.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {property.location}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrooms:</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{property.capacity} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Booking:</span>
                  <span className="font-medium">{property.lastBooking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-medium text-green-600">{property.occupancy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue:</span>
                  <span className="font-medium text-purple-600">
                    ฿{property.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className="font-medium text-orange-600">{property.roi}%</span>
                </div>
              </div>

              {property.maintenanceTasks > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    {property.maintenanceTasks} pending maintenance task{property.maintenanceTasks > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleNavigation(`/property/${property.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleNavigation(`/property/${property.id}/edit`)}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => handleNavigation(action.route)}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Selection Controls */}
      {filteredProperties.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProperties.length === filteredProperties.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium">
              Select All ({filteredProperties.length})
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredProperties.length} of {DEMO_PROPERTIES.length} properties
          </div>
        </div>
      )}
    </div>
  );
}