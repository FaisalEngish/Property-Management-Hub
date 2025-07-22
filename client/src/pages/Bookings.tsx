import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bed, 
  User, 
  Plus,
  Filter,
  Grid,
  List,
  Search,
  Clock,
  Eye
} from "lucide-react";

const sampleBookings = [
  {
    id: 1,
    property: 'Villa Aruna',
    manager: 'Dean',
    area: 'Bophut',
    bedrooms: 3,
    guest: 'John Smith',
    checkin: '2025-07-21',
    checkout: '2025-07-26',
    status: 'Confirmed',
    amount: 2500,
    nights: 5,
    guests: 4
  },
  {
    id: 2,
    property: 'Villa Tramonto',
    manager: 'Jane',
    area: 'Lamai',
    bedrooms: 2,
    guest: 'Sarah Johnson',
    checkin: '2025-07-27',
    checkout: '2025-07-30',
    status: 'Pending',
    amount: 1800,
    nights: 3,
    guests: 2
  },
  {
    id: 3,
    property: 'Villa Samui Breeze',
    manager: 'Dean',
    area: 'Chaweng',
    bedrooms: 4,
    guest: 'Michael Brown',
    checkin: '2025-07-22',
    checkout: '2025-07-25',
    status: 'Confirmed',
    amount: 3200,
    nights: 3,
    guests: 6
  },
  {
    id: 4,
    property: 'Villa Paradise',
    manager: 'Jane',
    area: 'Bophut',
    bedrooms: 5,
    guest: 'Emma Davis',
    checkin: '2025-07-28',
    checkout: '2025-08-01',
    status: 'Pending',
    amount: 4000,
    nights: 4,
    guests: 8
  },
];

const sampleProperties = [
  {
    property: 'Villa Aruna',
    manager: 'Dean',
    area: 'Bophut',
    bedrooms: 3,
    bookings: [
      { guest: 'John Smith', checkin: '2025-07-21', checkout: '2025-07-26', status: 'Confirmed' },
      { guest: 'Sarah Johnson', checkin: '2025-07-27', checkout: '2025-07-30', status: 'Pending' },
    ],
  },
  {
    property: 'Villa Tramonto',
    manager: 'Jane',
    area: 'Lamai',
    bedrooms: 2,
    bookings: [
      { guest: 'Alice Cooper', checkin: '2025-07-23', checkout: '2025-07-24', status: 'Confirmed' },
    ],
  },
  {
    property: 'Villa Samui Breeze',
    manager: 'Dean',
    area: 'Chaweng',
    bedrooms: 4,
    bookings: [
      { guest: 'Michael Brown', checkin: '2025-07-22', checkout: '2025-07-25', status: 'Confirmed' },
      { guest: 'Emma Davis', checkin: '2025-07-28', checkout: '2025-08-01', status: 'Pending' },
    ],
  },
  {
    property: 'Villa Paradise',
    manager: 'Jane',
    area: 'Bophut',
    bedrooms: 5,
    bookings: [
      { guest: 'Robert Wilson', checkin: '2025-07-24', checkout: '2025-07-27', status: 'Confirmed' },
    ],
  },
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterManager, setFilterManager] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = sampleBookings.filter(booking =>
    (search === '' || 
     booking.property.toLowerCase().includes(search.toLowerCase()) ||
     booking.guest.toLowerCase().includes(search.toLowerCase())) &&
    (filterArea === 'all' || booking.area === filterArea) &&
    (filterManager === 'all' || booking.manager === filterManager) &&
    (filterStatus === 'all' || booking.status === filterStatus)
  );

  const filteredProperties = sampleProperties.filter(property =>
    (search === '' || property.property.toLowerCase().includes(search.toLowerCase())) &&
    (filterArea === 'all' || property.area === filterArea) &&
    (filterManager === 'all' || property.manager === filterManager)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Unified Calendar & Bookings</h1>
              <p className="text-muted-foreground">Manage all bookings, calendars, and property schedules</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Live Calendar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search property or guest..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="Bophut">Bophut</SelectItem>
                    <SelectItem value="Lamai">Lamai</SelectItem>
                    <SelectItem value="Chaweng">Chaweng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Manager</label>
                <Select value={filterManager} onValueChange={setFilterManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Managers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Managers</SelectItem>
                    <SelectItem value="Dean">Dean</SelectItem>
                    <SelectItem value="Jane">Jane</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">View Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings" className="gap-2">
              <List className="w-4 h-4" />
              Booking List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Multi-Property Calendar
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Clock className="w-4 h-4" />
              Live Calendar
            </TabsTrigger>
          </TabsList>

          {/* Booking List View */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Individual Bookings ({filteredBookings.length})</h3>
              <Badge variant="outline">
                Total Revenue: ฿{filteredBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
              </Badge>
            </div>

            {viewMode === "list" ? (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{booking.guest}</h4>
                            <p className="text-sm text-muted-foreground">{booking.property}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.area}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{booking.bedrooms} BR</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{booking.manager}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">฿{booking.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{booking.nights} nights</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm">{booking.checkin} → {booking.checkout}</p>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{booking.guest}</CardTitle>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">{booking.property}</p>
                          <p className="text-sm text-muted-foreground">{booking.area} • {booking.bedrooms} BR</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Check-in:</span>
                          <span className="text-sm font-medium">{booking.checkin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Check-out:</span>
                          <span className="text-sm font-medium">{booking.checkout}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Amount:</span>
                          <span className="text-sm font-medium">฿{booking.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Multi-Property Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Multi-Property Calendar ({filteredProperties.length} properties)</h3>
              <Badge variant="outline">
                Total Bookings: {filteredProperties.reduce((sum, villa) => sum + villa.bookings.length, 0)}
              </Badge>
            </div>

            <div className="space-y-4">
              {filteredProperties.map((villa, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{villa.property}</CardTitle>
                      <Badge variant="secondary">{villa.bookings.length} Booking{villa.bookings.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Manager: {villa.manager}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Area: {villa.area}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{villa.bedrooms} Bedrooms</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {villa.bookings.map((booking, j) => (
                        <div key={j} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{booking.guest}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.checkin} → {booking.checkout}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Calendar View */}
          <TabsContent value="live" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Live Booking Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Interactive Calendar View</h3>
                  <p className="text-muted-foreground mb-4">
                    Full calendar interface with drag-and-drop booking management, 
                    availability checking, and real-time updates would be implemented here.
                  </p>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Launch Full Calendar Interface
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Footer */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {activeTab === 'bookings' ? filteredBookings.length : filteredProperties.length} 
                {activeTab === 'bookings' ? ' bookings' : ' properties'}
              </span>
              <span>
                {activeTab === 'bookings' 
                  ? `Total Revenue: ฿${filteredBookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`
                  : `Total Properties: ${filteredProperties.length}`
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}