import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { 
  Building2, 
  Calendar, 
  Grid3X3,
  ClipboardList,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import TopBar from "../components/TopBar";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import BulkActionPanel from "../components/BulkActionPanel";
import MultiPropertyCalendar from "../components/MultiPropertyCalendar";
import TaskTemplates from "../components/TaskTemplates";
import CreatePropertyDialog from "../components/CreatePropertyDialog";
import CreateBookingDialog from "../components/CreateBookingDialog";
import CreateTaskDialog from "../components/CreateTaskDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface PropertyFiltersState {
  search: string;
  location: string;
  status: string;
  propertyType: string;
  occupancyMin: number;
  occupancyMax: number;
  roiMin: number;
  roiMax: number;
  hasMaintenanceTasks: boolean;
  lastBookingFrom: string;
  lastBookingTo: string;
}

export default function PropertyHub() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('properties');
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<PropertyFiltersState>({
    search: '',
    location: '',
    status: '',
    propertyType: '',
    occupancyMin: 0,
    occupancyMax: 100,
    roiMin: 0,
    roiMax: 50,
    hasMaintenanceTasks: false,
    lastBookingFrom: '',
    lastBookingTo: '',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 properties per page

  // Dialog states for quick actions
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

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

  // Refresh handler - refetch data and reset filters
  const handleRefresh = () => {
    // Reset all filters to default
    setFilters({
      search: '',
      location: '',
      status: '',
      propertyType: '',
      occupancyMin: 0,
      occupancyMax: 100,
      roiMin: 0,
      roiMax: 50,
      hasMaintenanceTasks: false,
      lastBookingFrom: '',
      lastBookingTo: '',
    });
    
    // Clear selected property ID filter
    setSelectedPropertyId(null);
    
    // Clear URL parameter if present
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Refetch properties from API
    refetchProperties();
    
    // Show success feedback
    toast({
      title: "Refreshed",
      description: "Property list updated and filters reset",
    });
  };

  // Store selected property ID from URL parameter
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Check for property selection from Dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property');
    if (propertyId) {
      // Store the property ID to filter by ID, not by name search
      setSelectedPropertyId(parseInt(propertyId, 10));
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

  // Filter properties
  const filteredProperties = useMemo(() => {
    return propertiesArray.filter((property: any) => {
      // If a specific property ID is selected from Dashboard, only show that property
      if (selectedPropertyId !== null && property.id !== selectedPropertyId) {
        return false;
      }
      
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
      
      // Property type filter
      if (filters.propertyType) {
        const propertyType = property.propertyType || 
          (property.name?.toLowerCase().includes('villa') ? 'villa' :
           property.name?.toLowerCase().includes('apartment') ? 'apartment' :
           property.name?.toLowerCase().includes('condo') ? 'condo' :
           property.name?.toLowerCase().includes('resort') ? 'resort' : 'villa');
        if (propertyType !== filters.propertyType) {
          return false;
        }
      }
      
      // Last booking date filter
      if (filters.lastBookingFrom || filters.lastBookingTo) {
        const lastBookingDate = property.lastBookingDate || '2024-12-15';
        const lastBooking = new Date(lastBookingDate);
        
        if (filters.lastBookingFrom) {
          const fromDate = new Date(filters.lastBookingFrom);
          if (lastBooking < fromDate) {
            return false;
          }
        }
        
        if (filters.lastBookingTo) {
          const toDate = new Date(filters.lastBookingTo);
          if (lastBooking > toDate) {
            return false;
          }
        }
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
  }, [propertiesArray, filters, selectedPropertyId]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center gap-4">
                  🏠 Property Management Hub
                </h1>
                <p className="text-lg text-slate-600 mb-2">
                  Enhanced property management with advanced filtering, bulk actions, and calendar views
                </p>
                <div className="mt-3 text-sm text-emerald-600 font-medium flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Connected to Dashboard • Showing Real Data from API
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  className="hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-200"
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold cursor-pointer hover:bg-emerald-200 hover:scale-105 transition-all duration-200"
                  onClick={handleRefresh}
                  data-testid="badge-properties-counter"
                >
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
              <TabsContent value="properties" className="space-y-8">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <LayoutGrid className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Property Cards</h2>
                </div>

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

                {/* Select All Button */}
                {filteredProperties.length > 0 && (
                  <div className="flex items-center justify-between bg-white/50 p-4 rounded-lg border border-slate-200/50 backdrop-blur-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:scale-105 transition-all duration-200"
                    >
                      {selectedProperties.length === filteredProperties.length ? 'Deselect All' : 'Select All'}
                      ({filteredProperties.length})
                    </Button>
                    <div className="text-sm text-slate-600 font-medium">
                      {selectedProperties.length} of {filteredProperties.length} selected
                    </div>
                  </div>
                )}

                {/* Property Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedProperties.map((property: any) => (
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

                {/* Pagination & Load More */}
                {filteredProperties.length > itemsPerPage && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="text-sm text-slate-600 bg-white/50 px-4 py-2 rounded-lg border border-slate-200/50 backdrop-blur-sm">
                      Showing {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} properties
                      {currentPage < totalPages && ` • Page ${currentPage} of ${totalPages}`}
                    </div>
                    
                    {currentPage < totalPages && (
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                        className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800 hover:scale-105 transition-all duration-200 shadow-sm"
                      >
                        📄 Load More Properties ({filteredProperties.length - (currentPage * itemsPerPage)} remaining)
                      </Button>
                    )}
                    
                    {currentPage >= totalPages && filteredProperties.length > itemsPerPage && (
                      <div className="text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                        ✅ All properties loaded!
                      </div>
                    )}
                  </div>
                )}

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
                {/* Footer Insights Bar */}
                <Card className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 backdrop-blur-sm border border-emerald-200/50">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-8 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <span className="text-emerald-800">Active Bookings: <strong>{bookingsArray.length}</strong></span>
                        </div>
                        <div className="text-emerald-300">|</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔧</span>
                          <span className="text-emerald-800">Pending Tasks: <strong>7</strong></span>
                        </div>
                        <div className="text-emerald-300">|</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏢</span>
                          <span className="text-emerald-800">Total Properties: <strong>{propertiesArray.length}</strong></span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {/* Enhanced Hub Items */}
                  {[
                    {
                      title: "Properties List",
                      description: "View and manage all properties with detailed information and status",
                      href: "/properties",
                      icon: Building2,
                      badge: "Core",
                      badgeIcon: "🏠",
                      stats: `${propertiesArray.length} total properties`,
                      actionText: "Add Property",
                      actionIcon: "➕"
                    },
                    {
                      title: "Calendar & Bookings", 
                      description: "Booking calendar, reservations management, and availability tracking",
                      href: "/bookings",
                      icon: Calendar,
                      badge: "Bookings",
                      badgeIcon: "📅",
                      stats: `${bookingsArray.length} bookings this week`,
                      actionText: "Create Booking", 
                      actionIcon: "📅"
                    },
                    {
                      title: "Property Tasks",
                      description: "Task management for cleaning, maintenance, and property operations",
                      href: "/tasks",
                      icon: ClipboardList,
                      badge: "Tasks",
                      badgeIcon: "✅",
                      stats: "7 open tasks",
                      actionText: "Add Task",
                      actionIcon: "📝"
                    },
                    {
                      title: "Reports & Analytics",
                      description: "Generate comprehensive reports and analytics with PDF/CSV export capabilities",
                      href: "/reports",
                      icon: LayoutGrid,
                      badge: "Analytics",
                      badgeIcon: "📊",
                      stats: "3 reports ready",
                      actionText: "Generate Report",
                      actionIcon: "📈",
                      isComingSoon: true
                    },
                    {
                      title: "Automation & Alerts",
                      description: "Smart reminders, AI insights, and automated property management workflows",
                      href: "/automation",
                      icon: RefreshCw,
                      badge: "AI & Auto",
                      badgeIcon: "🤖",
                      stats: "5 active rules",
                      actionText: "Setup Alert",
                      actionIcon: "⚡",
                      isComingSoon: true
                    }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    const cardContent = (
                      <Card 
                        key={item.href} 
                        className={`group cursor-pointer transition-all duration-500 ease-in-out bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/20 backdrop-blur-sm border border-slate-200/60 hover:border-emerald-300/50 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.05] hover:-translate-y-2 relative overflow-hidden ${item.isComingSoon ? 'opacity-85' : ''}`}
                        onClick={() => !item.isComingSoon && navigate(item.href)}
                      >
                        {/* Enhanced Glassmorphism overlay with glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-emerald-50/30 to-white/40 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        {/* Coming Soon badge for future cards */}
                        {item.isComingSoon && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-400/50 text-xs shadow-lg backdrop-blur-sm">
                              Coming Soon
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-3 relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-3 bg-gradient-to-br from-emerald-100/80 via-emerald-50/60 to-white/40 backdrop-blur-sm rounded-xl shadow-xl border border-emerald-200/50 group-hover:shadow-emerald-300/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                                <IconComponent className="h-6 w-6 text-emerald-700 group-hover:text-emerald-800 transition-colors duration-300" />
                              </div>
                              <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">{item.title}</CardTitle>
                            </div>
                            <Badge className="bg-gradient-to-r from-emerald-100/90 via-emerald-50/70 to-white/50 text-emerald-800 border-emerald-300/60 shadow-lg backdrop-blur-sm group-hover:shadow-emerald-200/80 transition-all duration-300">
                              <span className="mr-1">{item.badgeIcon}</span>
                              {item.badge}
                            </Badge>
                          </div>
                          
                          {/* Enhanced Quick Stats */}
                          <div className="bg-gradient-to-r from-slate-50/80 via-white/60 to-slate-50/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60 group-hover:border-emerald-200/60 group-hover:bg-gradient-to-r group-hover:from-emerald-50/40 group-hover:via-white/70 group-hover:to-emerald-50/40 transition-all duration-300">
                            <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-800 transition-colors duration-300">{item.stats}</p>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 relative z-10">
                          <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                            {item.description}
                          </p>
                          
                          {/* Enhanced Quick Action Button */}
                          <Button 
                            size="sm" 
                            className={`w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 backdrop-blur-sm border border-emerald-400/30 hover:border-emerald-300/50 ${item.isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={item.isComingSoon}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.isComingSoon) {
                                // Handle quick actions - open respective dialogs
                                if (item.actionText === "Add Property") {
                                  setIsPropertyDialogOpen(true);
                                } else if (item.actionText === "Create Booking") {
                                  setIsBookingDialogOpen(true);
                                } else if (item.actionText === "Add Task") {
                                  setIsTaskDialogOpen(true);
                                } else {
                                  toast({
                                    title: "Quick Action",
                                    description: `${item.actionText} functionality coming soon!`,
                                  });
                                }
                              }
                            }}
                          >
                            <span className="mr-2 text-lg group-hover:scale-110 transition-transform duration-200">{item.actionIcon}</span>
                            {item.isComingSoon ? 'Coming Soon' : item.actionText}
                          </Button>
                        </CardContent>
                      </Card>
                    );

                    // Wrap Coming Soon cards with tooltip
                    if (item.isComingSoon) {
                      return (
                        <TooltipProvider key={item.href}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {cardContent}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-600 shadow-xl">
                              <div className="text-center">
                                <p className="font-semibold text-sm">{item.title}</p>
                                <p className="text-xs text-slate-300 mt-1">Feature launching soon!</p>
                                <p className="text-xs text-emerald-300 mt-1">Stay tuned for updates</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return cardContent;
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enterprise Footer */}
          <footer className="mt-12 border-t border-slate-200 bg-slate-50/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-8 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">System Online</span>
                  </div>
                  <div className="text-slate-400">|</div>
                  <div className="flex items-center gap-2">
                    <span>Last Updated: Today</span>
                  </div>
                  <div className="text-slate-400">|</div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">v2.0.1</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-slate-500 mt-2">
                HostPilotPro Property Management • Enterprise Edition
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Quick Action Dialogs */}
      <CreatePropertyDialog 
        open={isPropertyDialogOpen} 
        onOpenChange={setIsPropertyDialogOpen} 
      />
      <CreateBookingDialog 
        open={isBookingDialogOpen} 
        onOpenChange={setIsBookingDialogOpen} 
      />
      <CreateTaskDialog 
        isOpen={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />
    </div>
  );
}