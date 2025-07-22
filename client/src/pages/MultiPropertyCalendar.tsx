import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Bed, User } from "lucide-react";

const sampleData = [
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
      { guest: 'Alice', checkin: '2025-07-23', checkout: '2025-07-24', status: 'Confirmed' },
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

export default function MultiPropertyCalendar() {
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterManager, setFilterManager] = useState('');

  const filtered = sampleData.filter(
    p =>
      p.property.toLowerCase().includes(search.toLowerCase()) &&
      (filterArea === 'all' || !filterArea || p.area === filterArea) &&
      (filterManager === 'all' || !filterManager || p.manager === filterManager)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Multi Property Calendar</h1>
          <Badge variant="outline" className="text-blue-600">
            Demo Mode
          </Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Property</label>
                <Input
                  type="text"
                  placeholder="Search property name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Area</label>
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
                <label className="text-sm font-medium">Filter by Manager</label>
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
            </div>
          </CardContent>
        </Card>

        {/* Property Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No properties found matching your filters</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((villa, i) => (
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
            ))
          )}
        </div>

        {/* Summary */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {sampleData.length} properties</span>
              <span>Total bookings: {filtered.reduce((sum, villa) => sum + villa.bookings.length, 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}