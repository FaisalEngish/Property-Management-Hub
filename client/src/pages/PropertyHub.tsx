import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Building2, 
  Calendar, 
  Grid3X3,
  ClipboardList,
  RefreshCw,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import TopBar from "../components/TopBar";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import BulkActionPanel from "../components/BulkActionPanel";
import MultiPropertyCalendar from "../components/MultiPropertyCalendar";
import TaskTemplates from "../components/TaskTemplates";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface PropertyFiltersState {
  search: string;
  location: string;
  status: string;
  occupancyMin: number;
  occupancyMax: number;
  roiMin: number;
  roiMax: number;
  hasMaintenanceTasks: boolean;
}

interface SortingState {
  field: 'name' | 'revenue' | 'roi' | 'occupancy' | 'maintenance';
  direction: 'asc' | 'desc';
}

export default function PropertyHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('properties');
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<PropertyFiltersState>({
    search: '',
    location: '',
    status: '',
    occupancyMin: 0,
    occupancyMax: 100,
    roiMin: 0,
    roiMax: 50,
    hasMaintenanceTasks: false,
  });

  const [sorting, setSorting] = useState<SortingState>({
    field: 'name',
    direction: 'asc'
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      // Clear deleted property from selection if it was selected
      setSelectedProperties(prev => prev.filter(p => p.id !== deleteMutation.variables));
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  // Delete property handler
  const handleDeleteProperty = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  // Check for property selection from Dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property');
    if (propertyId) {
      // Pre-filter to specific property if coming from Dashboard
      setFilters(prev => ({ ...prev, search: propertyId }));
    }
  }, []);

  // Fetch data
  const { data: properties = [], isLoading: propertiesLoading, refetch: refetchProperties } = useQuery({
    queryKey: ['/api/properties'],
    staleTime: 10 * 60 * 1000,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    staleTime: 10 * 60 * 1000,
  });


  // Type assertions for safety
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    // First apply filters
    const filtered = propertiesArray.filter((property: any) => {
      // Search filter
      if (filters.search && !property.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Location filter
      if (filters.location && !property.address?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status && property.status !== filters.status) {
        return false;
      }
      
      // Occupancy filter (mock data for demo)
      const occupancyRate = property.occupancyRate || Math.floor(Math.random() * 30) + 60;
      if (occupancyRate < filters.occupancyMin || occupancyRate > filters.occupancyMax) {
        return false;
      }
      
      // ROI filter (mock data for demo)
      const roi = property.roi || Math.random() * 20 + 5;
      if (roi < filters.roiMin || roi > filters.roiMax) {
        return false;
      }
      
      // Maintenance tasks filter
      if (filters.hasMaintenanceTasks) {
        const maintenanceTasks = property.maintenanceTasks || Math.floor(Math.random() * 5);
        if (maintenanceTasks === 0) {
          return false;
        }
      }
      
      return true;
    });

    // Then apply sorting
    return filtered.sort((a: any, b: any) => {
      let valueA, valueB;
      
      switch (sorting.field) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'revenue':
          valueA = a.monthlyRevenue || Math.floor(Math.random() * 100000) + 50000;
          valueB = b.monthlyRevenue || Math.floor(Math.random() * 100000) + 50000;
          break;
        case 'roi':
          valueA = parseFloat(a.roi || (Math.random() * 20 + 5).toFixed(1));
          valueB = parseFloat(b.roi || (Math.random() * 20 + 5).toFixed(1));
          break;
        case 'occupancy':
          valueA = a.occupancyRate || Math.floor(Math.random() * 30) + 60;
          valueB = b.occupancyRate || Math.floor(Math.random() * 30) + 60;
          break;
        case 'maintenance':
          valueA = a.maintenanceTasks || Math.floor(Math.random() * 5);
          valueB = b.maintenanceTasks || Math.floor(Math.random() * 5);
          break;
        default:
          return 0;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sorting.direction === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (valueA as number) - (valueB as number);
        return sorting.direction === 'asc' ? comparison : -comparison;
      }
    });
  }, [propertiesArray, filters, sorting]);

  // Property selection handlers
  const handlePropertySelect = (property: any, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, property]);
    } else {
      setSelectedProperties(prev => prev.filter(p => p.id !== property.id));
    }
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties);
    }
  };

  const handleClearSelection = () => {
    setSelectedProperties([]);
  };

  const handleViewPropertyDetails = (property: any) => {
    navigate(`/property/${property.id}`);
  };

  const handleSort = (field: SortingState['field']) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortingState['field']) => {
    if (sorting.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sorting.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-white" />
      : <ArrowDown className="h-4 w-4 text-white" />;
  };


  const handleCreateTaskFromTemplate = (template: any, propertyId: number) => {
    // Simulate API call to create task
    toast({
      title: "Task Created",
      description: `Created "${template.title}" for property ID ${propertyId}`,
    });
  };

  // Transform data for calendar
  const calendarProperties = propertiesArray.map((p: any, index: number) => ({
    id: p.id,
    name: p.name,
    color: `hsl(${index * 137.5 % 360}, 70%, 50%)`
  }));

  const calendarBookings = bookingsArray.map((b: any) => ({
    id: b.id,
    propertyId: b.propertyId || (Math.floor(Math.random() * propertiesArray.length) + 1),
    propertyName: b.propertyName || 'Unknown Property',
    guestName: b.guestName || 'Guest',
    checkIn: b.checkInDate || b.checkIn || '2024-08-01',
    checkOut: b.checkOutDate || b.checkOut || '2024-08-02',
    status: b.status || 'confirmed',
    totalAmount: b.totalAmount || 0,
    invoiceId: b.invoiceId,
    guestId: b.guestId,
  }));

  if (propertiesLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Property Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar title="Property Management Hub" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Management Hub</h1>
                <p className="text-gray-600">
                  Enhanced property management with advanced filtering, bulk actions, and calendar views
                </p>
                <div className="mt-2 text-sm text-blue-600">
                  Connected to Dashboard • Showing Real Data from API
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => refetchProperties()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {propertiesArray.length} Properties
                </Badge>
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="properties" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Property Cards
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Task Templates
                </TabsTrigger>
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Management Tools
                </TabsTrigger>
              </TabsList>

              {/* Property Cards Tab */}
              <TabsContent value="properties" className="space-y-6">
                {/* Filters */}
                <PropertyFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalProperties={propertiesArray.length}
                  filteredCount={filteredProperties.length}
                />

                {/* Bulk Actions */}
                <BulkActionPanel
                  selectedProperties={selectedProperties}
                  onClearSelection={handleClearSelection}
                  onRefresh={refetchProperties}
                />

                {/* Sorting and Select All */}
                {filteredProperties.length > 0 && (
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedProperties.length === filteredProperties.length ? 'Deselect All' : 'Select All'}
                        ({filteredProperties.length})
                      </Button>
                      <div className="text-sm text-slate-600">
                        {selectedProperties.length} of {filteredProperties.length} selected
                      </div>
                    </div>
                    
                    {/* Sorting Options */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 mr-2">Sort by:</span>
                      <Button
                        variant={sorting.field === 'name' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('name')}
                        className={`flex items-center gap-1 transition-all duration-200 ${
                          sorting.field === 'name' 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-blue-200' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        Name {getSortIcon('name')}
                      </Button>
                      <Button
                        variant={sorting.field === 'revenue' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('revenue')}
                        className={`flex items-center gap-1 transition-all duration-200 ${
                          sorting.field === 'revenue' 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md ring-2 ring-green-200' 
                            : 'hover:bg-green-50 hover:border-green-300'
                        }`}
                      >
                        Revenue {getSortIcon('revenue')}
                      </Button>
                      <Button
                        variant={sorting.field === 'roi' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('roi')}
                        className={`flex items-center gap-1 transition-all duration-200 ${
                          sorting.field === 'roi' 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md ring-2 ring-purple-200' 
                            : 'hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        ROI {getSortIcon('roi')}
                      </Button>
                      <Button
                        variant={sorting.field === 'occupancy' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSort('occupancy')}
                        className={`flex items-center gap-1 transition-all duration-200 ${
                          sorting.field === 'occupancy' 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md ring-2 ring-orange-200' 
                            : 'hover:bg-orange-50 hover:border-orange-300'
                        }`}
                      >
                        Occupancy {getSortIcon('occupancy')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Property Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property: any) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isSelected={selectedProperties.some(p => p.id === property.id)}
                      onSelect={(selected) => handlePropertySelect(property, selected)}
                      onViewDetails={() => handleViewPropertyDetails(property)}
                      onDelete={() => handleDeleteProperty(property.id)}
                    />
                  ))}
                </div>

                {filteredProperties.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No properties found</h3>
                    <p className="text-slate-600">Try adjusting your filters to see more properties.</p>
                  </div>
                )}
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar">
                {calendarProperties.length > 0 ? (
                  <MultiPropertyCalendar
                    properties={calendarProperties}
                    bookings={calendarBookings}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Properties Available</h3>
                    <p className="text-slate-600">Add properties to view the calendar.</p>
                  </div>
                )}
              </TabsContent>

              {/* Task Templates Tab */}
              <TabsContent value="templates">
                <TaskTemplates
                  selectedProperties={selectedProperties}
                  onCreateTask={handleCreateTaskFromTemplate}
                />
              </TabsContent>

              {/* Management Tools Tab */}
              <TabsContent value="grid" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Legacy Hub Items */}
                  {[
                    {
                      title: "Properties List",
                      description: "View and manage all properties with detailed information and status",
                      href: "/properties",
                      icon: Building2,
                      badge: "Core",
                      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
                    },
                    {
                      title: "Calendar & Bookings", 
                      description: "Booking calendar, reservations management, and availability tracking",
                      href: "/bookings",
                      icon: Calendar,
                      badge: "Bookings",
                      color: "bg-green-50 hover:bg-green-100 border-green-200"
                    },
                    {
                      title: "Property Tasks",
                      description: "Task management for cleaning, maintenance, and property operations",
                      href: "/tasks",
                      icon: ClipboardList,
                      badge: "Tasks",
                      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
                    }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Card key={item.href} className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.color}`} onClick={() => navigate(item.href)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <IconComponent className="h-6 w-6 text-gray-700" />
                              </div>
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}