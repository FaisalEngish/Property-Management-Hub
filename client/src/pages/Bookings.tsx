// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Calendar,
//   MapPin,
//   Users,
//   Bed,
//   User,
//   Plus,
//   Filter,
//   Grid,
//   List,
//   Search,
//   Clock,
//   Eye
// } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { queryKeys } from "@/lib/queryKeys";
// import CreateBookingDialog from "@/components/CreateBookingDialog";
// import BookingCalendar from "@/components/BookingCalendar";
// import BookingDetailModal from "@/components/BookingDetailModal";

// // const sampleBookings = [
// //   {
// //     id: 1,
// //     property: 'Villa Aruna',
// //     manager: 'Dean',
// //     area: 'Bophut',
// //     bedrooms: 3,
// //     guest: 'John Smith',
// //     checkin: '2025-07-21',
// //     checkout: '2025-07-26',
// //     status: 'Confirmed',
// //     amount: 2500,
// //     nights: 5,
// //     guests: 4
// //   },
// //   {
// //     id: 2,
// //     property: 'Villa Tramonto',
// //     manager: 'Jane',
// //     area: 'Lamai',
// //     bedrooms: 2,
// //     guest: 'Sarah Johnson',
// //     checkin: '2025-07-27',
// //     checkout: '2025-07-30',
// //     status: 'Pending',
// //     amount: 1800,
// //     nights: 3,
// //     guests: 2
// //   },
// //   {
// //     id: 3,
// //     property: 'Villa Samui Breeze',
// //     manager: 'Dean',
// //     area: 'Chaweng',
// //     bedrooms: 4,
// //     guest: 'Michael Brown',
// //     checkin: '2025-07-22',
// //     checkout: '2025-07-25',
// //     status: 'Confirmed',
// //     amount: 3200,
// //     nights: 3,
// //     guests: 6
// //   },
// //   {
// //     id: 4,
// //     property: 'Villa Paradise',
// //     manager: 'Jane',
// //     area: 'Bophut',
// //     bedrooms: 5,
// //     guest: 'Emma Davis',
// //     checkin: '2025-07-28',
// //     checkout: '2025-08-01',
// //     status: 'Pending',
// //     amount: 4000,
// //     nights: 4,
// //     guests: 8
// //   },
// // ];

// // const sampleProperties = [
// //   {
// //     property: 'Villa Aruna',
// //     manager: 'Dean',
// //     area: 'Bophut',
// //     bedrooms: 3,
// //     bookings: [
// //       { guest: 'John Smith', checkin: '2025-07-21', checkout: '2025-07-26', status: 'Confirmed' },
// //       { guest: 'Sarah Johnson', checkin: '2025-07-27', checkout: '2025-07-30', status: 'Pending' },
// //     ],
// //   },
// //   {
// //     property: 'Villa Tramonto',
// //     manager: 'Jane',
// //     area: 'Lamai',
// //     bedrooms: 2,
// //     bookings: [
// //       { guest: 'Alice Cooper', checkin: '2025-07-23', checkout: '2025-07-24', status: 'Confirmed' },
// //     ],
// //   },
// //   {
// //     property: 'Villa Samui Breeze',
// //     manager: 'Dean',
// //     area: 'Chaweng',
// //     bedrooms: 4,
// //     bookings: [
// //       { guest: 'Michael Brown', checkin: '2025-07-22', checkout: '2025-07-25', status: 'Confirmed' },
// //       { guest: 'Emma Davis', checkin: '2025-07-28', checkout: '2025-08-01', status: 'Pending' },
// //     ],
// //   },
// //   {
// //     property: 'Villa Paradise',
// //     manager: 'Jane',
// //     area: 'Bophut',
// //     bedrooms: 5,
// //     bookings: [
// //       { guest: 'Robert Wilson', checkin: '2025-07-24', checkout: '2025-07-27', status: 'Confirmed' },
// //     ],
// //   },
// // ];

// export default function Bookings() {
//   const [activeTab, setActiveTab] = useState("bookings");
//   const [viewMode, setViewMode] = useState("list");
//   const [search, setSearch] = useState('');
//   const [filterProperty, setFilterProperty] = useState('all');
//   const [filterArea, setFilterArea] = useState('all');
//   const [filterManager, setFilterManager] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
//   const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

//   // Get propertyId from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const urlPropertyId = urlParams.get("propertyId");

//   // Fetch real data from API - use specific endpoint if propertyId is in URL
//   const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
//     queryKey: urlPropertyId ? queryKeys.bookings.withSource(urlPropertyId) : queryKeys.bookings.all(),
//     staleTime: 0,
//     refetchOnMount: true,
//     refetchOnWindowFocus: true,
//   });

//   const { data: properties = [], isLoading: propertiesLoading } = useQuery({
//     queryKey: ['/api/properties'],
//     staleTime: 0,
//   });

//   // Type assertions for safety
//   const bookingsArray = Array.isArray(bookings) ? bookings : [];
//   const propertiesArray = Array.isArray(properties) ? properties : [];

//   // If viewing property-specific bookings, get property name for display
//   const selectedProperty = urlPropertyId
//     ? propertiesArray.find((p: any) => p.id === parseInt(urlPropertyId))
//     : null;

//   const handleBookingClick = (bookingId: number) => {
//     setSelectedBookingId(bookingId);
//     setIsDetailModalOpen(true);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Confirmed':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'Cancelled':
//         return 'bg-red-100 text-red-800 border-red-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   // If viewing property-specific bookings, skip filtering (backend already filtered)
//   const filteredBookings = urlPropertyId ? bookingsArray : bookingsArray.filter((booking: any) => {
//     const property = propertiesArray.find((p: any) => p.id === booking.propertyId);
//     const propertyName = property?.name || '';
//     const propertyAddress = property?.address || '';

//     // Property filter: filter by specific property
//     const matchesProperty = filterProperty === 'all' ||
//       booking.propertyId === parseInt(filterProperty);

//     // Search filter: check property name or guest name
//     const matchesSearch = search === '' ||
//       propertyName.toLowerCase().includes(search.toLowerCase()) ||
//       (booking.guestName && booking.guestName.toLowerCase().includes(search.toLowerCase()));

//     // Area filter: check if address contains the area (since location field doesn't exist)
//     const matchesArea = filterArea === 'all' ||
//       propertyAddress.toLowerCase().includes(filterArea.toLowerCase());

//     // Manager filter: skip for now since properties don't have manager field
//     // In the future, this could be based on property owner or assigned staff
//     const matchesManager = filterManager === 'all'; // Always true for now

//     // Status filter: case-insensitive match on booking status
//     const matchesStatus = filterStatus === 'all' ||
//       booking.status?.toLowerCase() === filterStatus.toLowerCase();

//     return matchesProperty && matchesSearch && matchesArea && matchesManager && matchesStatus;
//   });

//   // Group bookings by property for calendar view
//   const propertiesWithBookings = propertiesArray.map((property: any) => ({
//     ...property,
//     bookings: filteredBookings.filter((b: any) => b.propertyId === property.id)
//   })).filter((p: any) => {
//     // Only show properties that have bookings matching the current filters
//     return p.bookings.length > 0 || (
//       (search === '' || p.name.toLowerCase().includes(search.toLowerCase())) &&
//       (filterArea === 'all' || (p.address && p.address.toLowerCase().includes(filterArea.toLowerCase())))
//     );
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <Calendar className="w-8 h-8 text-primary" />
//             <div>
//               {urlPropertyId && selectedProperty ? (
//                 <>
//                   <h1 className="text-3xl font-bold">Bookings - {selectedProperty.name}</h1>
//                   <p className="text-muted-foreground">Viewing all bookings for this property</p>
//                 </>
//               ) : (
//                 <>
//                   <h1 className="text-3xl font-bold">Unified Calendar & Bookings</h1>
//                   <p className="text-muted-foreground">Manage all bookings, calendars, and property schedules</p>
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="flex gap-2">
//             {urlPropertyId && (
//               <Button
//                 variant="outline"
//                 onClick={() => window.location.href = '/bookings'}
//                 data-testid="button-view-all-bookings"
//               >
//                 View All Bookings
//               </Button>
//             )}
//             <Button
//               className="gap-2"
//               onClick={() => setIsBookingDialogOpen(true)}
//               data-testid="button-new-booking"
//             >
//               <Plus className="w-4 h-4" />
//               New Booking
//             </Button>
//             <Button
//               variant="outline"
//               className="gap-2"
//               onClick={() => setActiveTab("live")}
//               data-testid="button-live-calendar"
//             >
//               <Eye className="w-4 h-4" />
//               Live Calendar
//             </Button>
//           </div>
//         </div>

//         {/* Filters - Hide when viewing property-specific bookings */}
//         {!urlPropertyId && (
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <Filter className="w-5 h-5" />
//                 Filters & Search
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Search</label>
//                 <div className="relative">
//                   <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
//                   <Input
//                     type="text"
//                     placeholder="Search property or guest..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="pl-9"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Property</label>
//                 <Select value={filterProperty} onValueChange={setFilterProperty}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="All Properties" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Properties</SelectItem>
//                     {propertiesArray.map((property: any) => (
//                       <SelectItem key={property.id} value={String(property.id)}>
//                         {property.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Area</label>
//                 <Select value={filterArea} onValueChange={setFilterArea}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="All Areas" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Areas</SelectItem>
//                     <SelectItem value="Bophut">Bophut</SelectItem>
//                     <SelectItem value="Lamai">Lamai</SelectItem>
//                     <SelectItem value="Chaweng">Chaweng</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Manager</label>
//                 <Select value={filterManager} onValueChange={setFilterManager}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="All Managers" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Managers</SelectItem>
//                     <SelectItem value="Dean">Dean</SelectItem>
//                     <SelectItem value="Jane">Jane</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Status</label>
//                 <Select value={filterStatus} onValueChange={setFilterStatus}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="All Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="Confirmed">Confirmed</SelectItem>
//                     <SelectItem value="Pending">Pending</SelectItem>
//                     <SelectItem value="Cancelled">Cancelled</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium">View Mode</label>
//                 <div className="flex gap-2">
//                   <Button
//                     variant={viewMode === "list" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setViewMode("list")}
//                     className="flex-1"
//                   >
//                     <List className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant={viewMode === "grid" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setViewMode("grid")}
//                     className="flex-1"
//                   >
//                     <Grid className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         )}

//         {/* Main Content Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="bookings" className="gap-2">
//               <List className="w-4 h-4" />
//               Booking List
//             </TabsTrigger>
//             <TabsTrigger value="calendar" className="gap-2">
//               <Calendar className="w-4 h-4" />
//               Multi-Property Calendar
//             </TabsTrigger>
//             <TabsTrigger value="live" className="gap-2">
//               <Clock className="w-4 h-4" />
//               Live Calendar
//             </TabsTrigger>
//           </TabsList>

//           {/* Booking List View */}
//           <TabsContent value="bookings" className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Individual Bookings ({filteredBookings.length})</h3>
//               <Badge variant="outline">
//                 Total Revenue: ฿{filteredBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0).toLocaleString()}
//               </Badge>
//             </div>

//             {bookingsLoading ? (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground">Loading bookings...</p>
//               </div>
//             ) : filteredBookings.length === 0 ? (
//               <div className="text-center py-12">
//                 <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
//                 <p className="text-muted-foreground mb-4">
//                   {search || filterProperty !== 'all' || filterArea !== 'all' || filterStatus !== 'all'
//                     ? 'Try adjusting your filters'
//                     : 'Create your first booking to get started'}
//                 </p>
//                 <Button onClick={() => setIsBookingDialogOpen(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   New Booking
//                 </Button>
//               </div>
//             ) : viewMode === "list" ? (
//               <div className="space-y-3">
//                 {filteredBookings.map((booking: any) => {
//                   const property = propertiesArray.find((p: any) => p.id === booking.propertyId);
//                   const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
//                   const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';
//                   const nights = booking.checkIn && booking.checkOut
//                     ? Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
//                     : 0;

//                   return (
//                     <Card
//                       key={booking.id}
//                       className="hover:shadow-md transition-shadow cursor-pointer"
//                       onClick={() => handleBookingClick(booking.id)}
//                       data-testid={`booking-card-${booking.id}`}
//                     >
//                       <CardContent className="p-4">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
//                               <Users className="w-6 h-6 text-primary" />
//                             </div>
//                             <div>
//                               <h4 className="font-medium">{booking.guestName || 'Guest'}</h4>
//                               <p className="text-sm text-muted-foreground">{property?.name || 'Property'}</p>
//                             </div>
//                           </div>

//                           <div className="flex items-center gap-4 text-sm">
//                             <div className="flex items-center gap-1">
//                               <MapPin className="w-4 h-4" />
//                               <span>{property?.address || 'N/A'}</span>
//                             </div>
//                             {property?.bedrooms && (
//                               <div className="flex items-center gap-1">
//                                 <Bed className="w-4 h-4" />
//                                 <span>{property.bedrooms} BR</span>
//                               </div>
//                             )}
//                           </div>

//                           <div className="text-right">
//                             <p className="font-medium">฿{parseFloat(booking.totalAmount || 0).toLocaleString()}</p>
//                             {nights > 0 && <p className="text-sm text-muted-foreground">{nights} nights</p>}
//                           </div>

//                           <div className="text-right">
//                             <p className="text-sm">{checkInDate} → {checkOutDate}</p>
//                             <Badge className={getStatusColor(booking.status)}>
//                               {booking.status}
//                             </Badge>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {filteredBookings.map((booking: any) => {
//                   const property = propertiesArray.find((p: any) => p.id === booking.propertyId);
//                   const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
//                   const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';

//                   return (
//                     <Card
//                       key={booking.id}
//                       className="hover:shadow-md transition-shadow cursor-pointer"
//                       onClick={() => handleBookingClick(booking.id)}
//                       data-testid={`booking-card-grid-${booking.id}`}
//                     >
//                       <CardHeader className="pb-3">
//                         <div className="flex items-center justify-between">
//                           <CardTitle className="text-lg">{booking.guestName || 'Guest'}</CardTitle>
//                           <Badge className={getStatusColor(booking.status)}>
//                             {booking.status}
//                           </Badge>
//                         </div>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="space-y-3">
//                           <div>
//                             <p className="font-medium">{property?.name || 'Property'}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {property?.address || 'N/A'}
//                               {property?.bedrooms && ` • ${property.bedrooms} BR`}
//                             </p>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-sm">Check-in:</span>
//                             <span className="text-sm font-medium">{checkInDate}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-sm">Check-out:</span>
//                             <span className="text-sm font-medium">{checkOutDate}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-sm">Amount:</span>
//                             <span className="text-sm font-medium">฿{parseFloat(booking.totalAmount || 0).toLocaleString()}</span>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             )}
//           </TabsContent>

//           {/* Multi-Property Calendar View */}
//           <TabsContent value="calendar" className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Multi-Property Calendar ({propertiesWithBookings.length} properties)</h3>
//               <Badge variant="outline">
//                 Total Bookings: {propertiesWithBookings.reduce((sum: number, p: any) => sum + p.bookings.length, 0)}
//               </Badge>
//             </div>

//             {propertiesLoading ? (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground">Loading properties...</p>
//               </div>
//             ) : propertiesWithBookings.length === 0 ? (
//               <div className="text-center py-12">
//                 <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
//                 <p className="text-muted-foreground">
//                   {search || filterArea !== 'all' ? 'Try adjusting your filters' : 'No properties available'}
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {propertiesWithBookings.map((property: any) => (
//                   <Card key={property.id} className="hover:shadow-md transition-shadow">
//                     <CardHeader className="pb-4">
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="text-xl">{property.name}</CardTitle>
//                         <Badge variant="secondary">{property.bookings.length} Booking{property.bookings.length !== 1 ? 's' : ''}</Badge>
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                         <div className="flex items-center gap-1">
//                           <MapPin className="w-4 h-4" />
//                           <span>Address: {property.address || 'N/A'}</span>
//                         </div>
//                         {property.bedrooms && (
//                           <div className="flex items-center gap-1">
//                             <Bed className="w-4 h-4" />
//                             <span>{property.bedrooms} Bedrooms</span>
//                           </div>
//                         )}
//                         {property.bathrooms && (
//                           <div className="flex items-center gap-1">
//                             <span>{property.bathrooms} Bathrooms</span>
//                           </div>
//                         )}
//                       </div>
//                     </CardHeader>

//                     <CardContent>
//                       {property.bookings.length === 0 ? (
//                         <div className="text-center py-4 text-muted-foreground">
//                           No bookings for this property
//                         </div>
//                       ) : (
//                         <div className="space-y-3">
//                           {property.bookings.map((booking: any) => {
//                             const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
//                             const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';

//                             return (
//                               <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
//                                 <div className="flex items-center gap-3">
//                                   <Users className="w-4 h-4 text-muted-foreground" />
//                                   <div>
//                                     <p className="font-medium">{booking.guestName || 'Guest'}</p>
//                                     <p className="text-sm text-muted-foreground">
//                                       {checkInDate} → {checkOutDate}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <Badge className={getStatusColor(booking.status)}>
//                                   {booking.status}
//                                 </Badge>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Live Calendar View */}
//           <TabsContent value="live" className="space-y-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold flex items-center gap-2">
//                 <Clock className="w-5 h-5" />
//                 Live Booking Calendar
//               </h3>
//               <div className="flex gap-2">
//                 <Button
//                   onClick={() => setIsBookingDialogOpen(true)}
//                   className="gap-2"
//                 >
//                   <Plus className="w-4 h-4" />
//                   New Booking
//                 </Button>
//               </div>
//             </div>

//             {bookingsLoading ? (
//               <Card>
//                 <CardContent className="p-12 text-center">
//                   <p className="text-muted-foreground">Loading calendar...</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <BookingCalendar
//                 bookings={bookingsArray.map((booking: any) => ({
//                   ...booking,
//                   checkIn: booking.checkIn || booking.checkInDate,
//                   checkOut: booking.checkOut || booking.checkOutDate,
//                 }))}
//               />
//             )}

//             {/* Booking List Below Calendar */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Upcoming Bookings ({filteredBookings.length})</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {filteredBookings.length === 0 ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     No bookings to display
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {filteredBookings.slice(0, 10).map((booking: any) => {
//                       const property = propertiesArray.find((p: any) => p.id === booking.propertyId);
//                       const checkInDate = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A';
//                       const checkOutDate = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A';

//                       return (
//                         <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
//                           <div className="flex items-center gap-3">
//                             <Users className="w-4 h-4 text-muted-foreground" />
//                             <div>
//                               <p className="font-medium">{booking.guestName || 'Guest'}</p>
//                               <p className="text-sm text-muted-foreground">{property?.name || 'Property'}</p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm font-medium">{checkInDate} → {checkOutDate}</p>
//                             <p className="text-sm text-muted-foreground">฿{parseFloat(booking.totalAmount || 0).toLocaleString()}</p>
//                           </div>
//                           <Badge className={getStatusColor(booking.status)}>
//                             {booking.status}
//                           </Badge>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Summary Footer */}
//         <Card className="mt-6">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between text-sm text-muted-foreground">
//               <span>
//                 Showing {activeTab === 'bookings' ? filteredBookings.length : propertiesWithBookings.length}
//                 {activeTab === 'bookings' ? ' bookings' : ' properties'}
//               </span>
//               <span>
//                 {activeTab === 'bookings'
//                   ? `Total Revenue: ฿${filteredBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0).toLocaleString()}`
//                   : `Total Properties: ${propertiesWithBookings.length}`
//                 }
//               </span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Create Booking Dialog */}
//       <CreateBookingDialog
//         open={isBookingDialogOpen}
//         onOpenChange={setIsBookingDialogOpen}
//       />

//       {/* Booking Detail Modal */}
//       <BookingDetailModal
//         open={isDetailModalOpen}
//         onOpenChange={setIsDetailModalOpen}
//         bookingId={selectedBookingId}
//       />
//     </div>
//   );
// }

// app/components/Bookings.tsx
// app/components/Bookings.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Bed,
  Plus,
  Filter,
  Grid,
  List,
  Search,
  Clock,
  Eye,
  CreditCard,
} from "lucide-react";
import { useQuery, useQueryClient, useIsMutating } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import BookingCalendar from "@/components/BookingCalendar";
import BookingDetailModal from "@/components/BookingDetailModal";
import { BackButton } from "@/components/BackButton";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [filterManager, setFilterManager] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // show overlay whenever any mutation is active
  const activeMutations = useIsMutating();
  const isMutating = activeMutations > 0;

  // Get propertyId from URL
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const urlPropertyId = urlParams.get("propertyId");

  // Fetch real data from API - use specific endpoint if propertyId is in URL
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: urlPropertyId
      ? queryKeys.bookings.withSource(urlPropertyId)
      : queryKeys.bookings.all(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    staleTime: 0,
  });

  // Auto-refresh fallback: periodic invalidation to catch other users' changes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        queryClient.invalidateQueries(queryKeys.bookings.all());
      } catch {
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    }, 30_000); // 30s - adjust if needed

    return () => clearInterval(interval);
  }, [queryClient]);

  // Type assertions for safety
  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const propertiesArray = Array.isArray(properties) ? properties : [];

  // If viewing property-specific bookings, get property name for display
  const selectedProperty = urlPropertyId
    ? propertiesArray.find((p: any) => p.id === parseInt(urlPropertyId))
    : null;

  const handleBookingClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // If viewing property-specific bookings, skip filtering (backend already filtered)
  const filteredBookings = urlPropertyId
    ? bookingsArray
    : bookingsArray.filter((booking: any) => {
        const property = propertiesArray.find(
          (p: any) => p.id === booking.propertyId,
        );
        const propertyName = property?.name || "";
        const propertyAddress = property?.address || "";

        // Property filter: filter by specific property
        const matchesProperty =
          filterProperty === "all" ||
          booking.propertyId === parseInt(filterProperty);

        // Search filter: check property name or guest name
        const matchesSearch =
          search === "" ||
          propertyName.toLowerCase().includes(search.toLowerCase()) ||
          (booking.guestName &&
            booking.guestName.toLowerCase().includes(search.toLowerCase()));

        // Area filter: check if address contains the area (since location field doesn't exist)
        const matchesArea =
          filterArea === "all" ||
          propertyAddress.toLowerCase().includes(filterArea.toLowerCase());

        // Manager filter: skip for now since properties don't have manager field
        const matchesManager = filterManager === "all"; // Always true for now

        // Status filter: case-insensitive match on booking status
        const matchesStatus =
          filterStatus === "all" ||
          booking.status?.toLowerCase() === filterStatus.toLowerCase();

        return (
          matchesProperty &&
          matchesSearch &&
          matchesArea &&
          matchesManager &&
          matchesStatus
        );
      });

  // Group bookings by property for calendar view
  const propertiesWithBookings = propertiesArray
    .map((property: any) => ({
      ...property,
      bookings: filteredBookings.filter(
        (b: any) => b.propertyId === property.id,
      ),
    }))
    .filter((p: any) => {
      // Only show properties that have bookings matching the current filters
      return (
        p.bookings.length > 0 ||
        ((search === "" ||
          p.name.toLowerCase().includes(search.toLowerCase())) &&
          (filterArea === "all" ||
            (p.address &&
              p.address.toLowerCase().includes(filterArea.toLowerCase()))))
      );
    });

  return (
    <div className="relative container mx-auto min-h-screen bg-background">
      {/* GLOBAL MUTATION OVERLAY */}
      {isMutating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3 bg-white/90 dark:bg-slate-800/90 p-5 rounded-lg shadow-lg">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin border-primary" />
            <div className="text-base font-medium">Saving changes…</div>
            <div className="text-sm text-muted-foreground">
              Please wait — updating data.
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              {urlPropertyId && selectedProperty ? (
                <>
                  {/* Header with Back Button layered on top */}
                  <div className="mb-4">
                    <BackButton
                      fallbackRoute={
                        urlPropertyId
                          ? `/bookings?propertyId=${urlPropertyId}`
                          : "/bookings"
                      }
                      variant="ghost"
                      className="!p-2 !rounded-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm"
                    >
                      <span className="hidden sm:inline text-sm">
                        Back to Property
                      </span>
                    </BackButton>
                  </div>
                  <h1 className="text-3xl font-bold">
                    Bookings - {selectedProperty.name}
                  </h1>
                  <p className="text-muted-foreground">
                    Viewing all bookings for this property
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">
                    Unified Calendar & Bookings
                  </h1>
                  <p className="text-muted-foreground">
                    Manage all bookings, calendars, and property schedules
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {urlPropertyId && (
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/bookings")}
                data-testid="button-view-all-bookings"
              >
                View All Bookings
              </Button>
            )}
            <Button
              className="gap-2"
              onClick={() => setIsBookingDialogOpen(true)}
              data-testid="button-new-booking"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setActiveTab("live")}
              data-testid="button-live-calendar"
            >
              <Eye className="w-4 h-4" />
              Live Calendar
            </Button>
          </div>
        </div>

        {/* Filters - Hide when viewing property-specific bookings */}
        {!urlPropertyId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                  <label className="text-sm font-medium">Property</label>
                  <Select
                    value={filterProperty}
                    onValueChange={setFilterProperty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {propertiesArray.map((property: any) => (
                        <SelectItem
                          key={property.id}
                          value={String(property.id)}
                        >
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={filterManager}
                    onValueChange={setFilterManager}
                  >
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
        )}

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
              <h3 className="text-lg font-semibold">
                Individual Bookings ({filteredBookings.length})
              </h3>
              <Badge variant="outline">
                Total Revenue: ฿
                {filteredBookings
                  .reduce(
                    (sum: number, b: any) =>
                      sum + (parseFloat(b.totalAmount) || 0),
                    0,
                  )
                  .toLocaleString()}
              </Badge>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground mb-4">
                  {search ||
                  filterProperty !== "all" ||
                  filterArea !== "all" ||
                  filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first booking to get started"}
                </p>
                <Button onClick={() => setIsBookingDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {filteredBookings.map((booking: any) => {
                  const property = propertiesArray.find(
                    (p: any) => p.id === booking.propertyId,
                  );
                  const checkInDate = booking.checkIn
                    ? new Date(booking.checkIn).toLocaleDateString()
                    : "N/A";
                  const checkOutDate = booking.checkOut
                    ? new Date(booking.checkOut).toLocaleDateString()
                    : "N/A";
                  const nights =
                    booking.checkIn && booking.checkOut
                      ? Math.ceil(
                          (new Date(booking.checkOut).getTime() -
                            new Date(booking.checkIn).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0;

                  return (
                    <Card
                      key={booking.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleBookingClick(booking.id)}
                      data-testid={`booking-card-${booking.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {booking.guestName || "Guest"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {property?.name || "Property"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{property?.address || "N/A"}</span>
                            </div>
                            {property?.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{property.bedrooms} BR</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="font-medium">
                              ฿
                              {parseFloat(
                                booking.totalAmount || 0,
                              ).toLocaleString()}
                            </p>
                            {nights > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {nights} nights
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm">
                              {checkInDate} → {checkOutDate}
                            </p>
                            <div className="flex items-center gap-2 justify-end">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              {(booking.status?.toLowerCase() === "pending" ||
                                booking.status?.toLowerCase() ===
                                  "confirmed") &&
                                (booking.paymentStatus === "paid" ||
                                  booking.paymentStatus === "partial") && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    {booking.paymentStatus === "paid"
                                      ? "Pre-Paid"
                                      : "Partial"}
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking: any) => {
                  const property = propertiesArray.find(
                    (p: any) => p.id === booking.propertyId,
                  );
                  const checkInDate = booking.checkIn
                    ? new Date(booking.checkIn).toLocaleDateString()
                    : "N/A";
                  const checkOutDate = booking.checkOut
                    ? new Date(booking.checkOut).toLocaleDateString()
                    : "N/A";

                  return (
                    <Card
                      key={booking.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleBookingClick(booking.id)}
                      data-testid={`booking-card-grid-${booking.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <CardTitle className="text-lg">
                            {booking.guestName || "Guest"}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            {(booking.status?.toLowerCase() === "pending" ||
                              booking.status?.toLowerCase() === "confirmed") &&
                              (booking.paymentStatus === "paid" ||
                                booking.paymentStatus === "partial") && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  {booking.paymentStatus === "paid"
                                    ? "Pre-Paid"
                                    : "Partial"}
                                </Badge>
                              )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">
                              {property?.name || "Property"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {property?.address || "N/A"}
                              {property?.bedrooms &&
                                ` • ${property.bedrooms} BR`}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Check-in:</span>
                            <span className="text-sm font-medium">
                              {checkInDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Check-out:</span>
                            <span className="text-sm font-medium">
                              {checkOutDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Amount:</span>
                            <span className="text-sm font-medium">
                              ฿
                              {parseFloat(
                                booking.totalAmount || 0,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Multi-Property Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Multi-Property Calendar ({propertiesWithBookings.length}{" "}
                properties)
              </h3>
              <Badge variant="outline">
                Total Bookings:{" "}
                {propertiesWithBookings.reduce(
                  (sum: number, p: any) => sum + p.bookings.length,
                  0,
                )}
              </Badge>
            </div>

            {propertiesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : propertiesWithBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Properties Found
                </h3>
                <p className="text-muted-foreground">
                  {search || filterArea !== "all"
                    ? "Try adjusting your filters"
                    : "No properties available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {propertiesWithBookings.map((property: any) => (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {property.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          {property.bookings.length} Booking
                          {property.bookings.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Address: {property.address || "N/A"}</span>
                        </div>
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} Bedrooms</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <span>{property.bathrooms} Bathrooms</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {property.bookings.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No bookings for this property
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {property.bookings.map((booking: any) => {
                            const checkInDate = booking.checkIn
                              ? new Date(booking.checkIn).toLocaleDateString()
                              : "N/A";
                            const checkOutDate = booking.checkOut
                              ? new Date(booking.checkOut).toLocaleDateString()
                              : "N/A";

                            return (
                              <div
                                key={booking.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-3">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">
                                      {booking.guestName || "Guest"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {checkInDate} → {checkOutDate}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={getStatusColor(booking.status)}
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Live Calendar View */}
          <TabsContent value="live" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Booking Calendar
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsBookingDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Booking
                </Button>
              </div>
            </div>

            {bookingsLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading calendar...</p>
                </CardContent>
              </Card>
            ) : (
              <BookingCalendar
                bookings={bookingsArray.map((booking: any) => ({
                  ...booking,
                  checkIn: booking.checkIn || booking.checkInDate,
                  checkOut: booking.checkOut || booking.checkOutDate,
                }))}
              />
            )}

            {/* Booking List Below Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Upcoming Bookings ({filteredBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings to display
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.slice(0, 10).map((booking: any) => {
                      const property = propertiesArray.find(
                        (p: any) => p.id === booking.propertyId,
                      );
                      const checkInDate = booking.checkIn
                        ? new Date(booking.checkIn).toLocaleDateString()
                        : "N/A";
                      const checkOutDate = booking.checkOut
                        ? new Date(booking.checkOut).toLocaleDateString()
                        : "N/A";

                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {booking.guestName || "Guest"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {property?.name || "Property"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {checkInDate} → {checkOutDate}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ฿
                              {parseFloat(
                                booking.totalAmount || 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Footer */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing{" "}
                {activeTab === "bookings"
                  ? filteredBookings.length
                  : propertiesWithBookings.length}
                {activeTab === "bookings" ? " bookings" : " properties"}
              </span>
              <span>
                {activeTab === "bookings"
                  ? `Total Revenue: ฿${filteredBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0).toLocaleString()}`
                  : `Total Properties: ${propertiesWithBookings.length}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        open={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        bookingId={selectedBookingId}
      />
    </div>
  );
}
