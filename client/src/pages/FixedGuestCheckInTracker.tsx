import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Building, CheckCircle, AlertCircle, Luggage, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { RoleBackButton } from "@/components/BackButton";

interface GuestReservation {
  id: string;
  guestName: string;
  property: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'upcoming' | 'checked_in' | 'checked_out';
  assignedHost: string;
  guestCount: number;
  linkedTasks: string[];
  phone?: string;
  email?: string;
  specialRequests?: string;
}

export default function FixedGuestCheckInTracker() {
  const [selectedReservation, setSelectedReservation] = useState<GuestReservation | null>(null);
  const [dateFilter, setDateFilter] = useState("current_and_next_7");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Mock data for current + next 7 days reservations
  const mockReservations: GuestReservation[] = [
    {
      id: "RES001",
      guestName: "John & Sarah Smith",
      property: "Villa Samui Breeze",
      checkInDate: "2025-01-05",
      checkOutDate: "2025-01-12",
      status: "checked_in",
      assignedHost: "Jane Doe",
      guestCount: 2,
      linkedTasks: ["Welcome basket delivered", "Check-in form completed", "Key handover done"],
      phone: "+1-555-0123",
      email: "john.smith@email.com",
      specialRequests: "Late check-in requested (8 PM)"
    },
    {
      id: "RES002",
      guestName: "Robert Wilson",
      property: "Villa Tropical Paradise",
      checkInDate: "2025-01-07",
      checkOutDate: "2025-01-14",
      status: "upcoming",
      assignedHost: "Mike Johnson",
      guestCount: 4,
      linkedTasks: ["Welcome basket preparation", "Property inspection pending"],
      phone: "+44-7700-900123",
      email: "r.wilson@email.com",
      specialRequests: "Airport pickup required"
    },
    {
      id: "RES003",
      guestName: "Lisa Chen",
      property: "Villa Ocean View",
      checkInDate: "2025-01-08",
      checkOutDate: "2025-01-15",
      status: "upcoming",
      assignedHost: "Sarah Lee",
      guestCount: 3,
      linkedTasks: ["Welcome basket preparation", "Pool cleaning scheduled"],
      phone: "+65-8123-4567",
      email: "lisa.chen@email.com"
    },
    {
      id: "RES004",
      guestName: "James Miller",
      property: "Villa Sunset Dreams",
      checkInDate: "2025-01-10",
      checkOutDate: "2025-01-17",
      status: "upcoming",
      assignedHost: "Tom Brown",
      guestCount: 2,
      linkedTasks: ["Property preparation", "Welcome basket pending"],
      phone: "+1-555-0789",
      email: "james.miller@email.com",
      specialRequests: "Vegetarian welcome basket"
    },
    {
      id: "RES005",
      guestName: "Emma Davis",
      property: "Villa Balinese Charm",
      checkInDate: "2025-01-02",
      checkOutDate: "2025-01-05",
      status: "checked_out",
      assignedHost: "Jane Doe",
      guestCount: 2,
      linkedTasks: ["Check-out completed", "Final cleaning done", "Deposit refunded"],
      phone: "+61-412-345-678",
      email: "emma.davis@email.com"
    }
  ];

  const [filteredReservations, setFilteredReservations] = useState<GuestReservation[]>(mockReservations);

  useEffect(() => {
    let filtered = [...mockReservations];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    // Apply date filter
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    if (dateFilter === "current_and_next_7") {
      filtered = filtered.filter(res => {
        const checkInDate = new Date(res.checkInDate);
        const checkOutDate = new Date(res.checkOutDate);
        return (checkInDate <= nextWeek && checkOutDate >= today);
      });
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(res =>
        res.guestName.toLowerCase().includes(searchLower) ||
        res.property.toLowerCase().includes(searchLower) ||
        res.assignedHost.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReservations(filtered);
  }, [statusFilter, dateFilter, searchText]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'checked_in': return 'default';
      case 'upcoming': return 'secondary';
      case 'checked_out': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked_in': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'checked_out': return <Luggage className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RoleBackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Check-In Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor current and upcoming guest arrivals and departures</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredReservations.length} reservations
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Guest name, property, host..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_and_next_7">Current + Next 7 Days</SelectItem>
                  <SelectItem value="all">All Dates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchText("");
                  setDateFilter("current_and_next_7");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Guest Reservations ({filteredReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReservation?.id === reservation.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(reservation.status)}
                          <h3 className="font-semibold text-lg">{reservation.guestName}</h3>
                          <Badge variant={getStatusBadgeVariant(reservation.status)}>
                            {reservation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {reservation.property}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Host: {reservation.assignedHost}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reservation.guestCount} guest{reservation.guestCount > 1 ? 's' : ''}
                          </div>
                        </div>

                        {reservation.linkedTasks.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Linked Tasks:</p>
                            <div className="flex flex-wrap gap-1">
                              {reservation.linkedTasks.slice(0, 3).map((task, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {task}
                                </Badge>
                              ))}
                              {reservation.linkedTasks.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{reservation.linkedTasks.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredReservations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Luggage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No reservations found</p>
                    <p className="text-sm">Try adjusting your filters to see more results</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservation Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedReservation ? 'Reservation Details' : 'Select a Reservation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReservation ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedReservation.guestName}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(selectedReservation.status)}
                      <Badge variant={getStatusBadgeVariant(selectedReservation.status)}>
                        {selectedReservation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Property:</span>
                      <span>{selectedReservation.property}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Assigned Host:</span>
                      <span>{selectedReservation.assignedHost}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Check-in:</span>
                      <span>{formatDate(selectedReservation.checkInDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Check-out:</span>
                      <span>{formatDate(selectedReservation.checkOutDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Guest Count:</span>
                      <span>{selectedReservation.guestCount}</span>
                    </div>

                    {selectedReservation.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedReservation.phone}</span>
                      </div>
                    )}

                    {selectedReservation.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span className="text-blue-600">{selectedReservation.email}</span>
                      </div>
                    )}

                    {selectedReservation.specialRequests && (
                      <div className="mt-4">
                        <div className="flex items-start gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Special Requests:</span>
                            <p className="text-gray-600 mt-1">{selectedReservation.specialRequests}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedReservation.linkedTasks.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Linked Tasks:</h4>
                      <div className="space-y-2">
                        {selectedReservation.linkedTasks.map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    {selectedReservation.status === 'upcoming' && (
                      <Button className="w-full" size="sm">
                        Start Check-In Process
                      </Button>
                    )}
                    {selectedReservation.status === 'checked_in' && (
                      <Button className="w-full" variant="outline" size="sm">
                        Start Check-Out Process
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" size="sm">
                      Contact Guest
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a reservation to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}