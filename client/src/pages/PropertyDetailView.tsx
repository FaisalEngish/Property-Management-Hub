import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Home, 
  Star, 
  DollarSign,
  Calendar,
  ClipboardList,
  Calculator,
  FileText,
  Settings,
  Info,
  TrendingUp,
  Building,
  Edit,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock booking source data - in real app this would come from API
const mockBookingSources = [
  { name: 'Airbnb', value: 45, color: '#FF5A5F' },
  { name: 'Booking.com', value: 25, color: '#003580' },
  { name: 'VRBO', value: 20, color: '#FFD700' },
  { name: 'Direct', value: 10, color: '#4CAF50' }
];

// Helper function to extract URL from iframe HTML
function extractUrlFromIframe(iframeHtml: string): string {
  const srcMatch = iframeHtml.match(/src="([^"]+)"/);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }
  // If we can't extract URL, return the original string
  return iframeHtml;
}

// Mock property descriptions
const mockDescriptions = {
  description: "Beautiful luxury villa with stunning ocean views, private pool, and modern amenities. Perfect for families or groups seeking a premium tropical experience.",
  spaceDescription: "3 spacious bedrooms with en-suite bathrooms, open-plan living area, fully equipped kitchen, private infinity pool, and multiple terraces with panoramic views.",
  interaction: "Our dedicated property manager is available 24/7 to assist with any requests. We provide personalized concierge services and local recommendations.",
  neighborhood: "Located in the prestigious Bophut area, close to pristine beaches, luxury resorts, world-class restaurants, and vibrant nightlife.",
  transit: "15 minutes from Samui Airport, complimentary airport transfers available. Scooter and car rental services can be arranged.",
  otherNotes: "Strict no-smoking policy. No pets allowed. Minimum 3-night stay required. Check-in: 3 PM, Check-out: 11 AM."
};

interface ActionButtonProps {
  label: string;
  href: string;
  icon: React.ElementType;
  variant?: "default" | "outline";
}

function ActionButton({ label, href, icon: Icon, variant = "default" }: ActionButtonProps) {
  const [, setLocation] = useLocation();
  
  return (
    <Button
      variant={variant}
      onClick={() => setLocation(href)}
      className="w-full h-12 flex items-center justify-center gap-2"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  );
}

interface EditMapLinkDialogProps {
  property: any;
  onUpdate: () => void;
}

function EditMapLinkDialog({ property, onUpdate }: EditMapLinkDialogProps) {
  const [mapLink, setMapLink] = useState(property.googleMapsLink || "");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: { googleMapsLink: string }) => {
      return apiRequest(`/api/properties/${property.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${property.id}`] });
      toast({
        title: "Success",
        description: "Google Maps link updated successfully",
      });
      setIsOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to update map link: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePropertyMutation.mutate({ googleMapsLink: mapLink });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2 p-1 h-6 w-6">
          <Edit className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Google Maps Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mapLink">Google Maps Link or Embed HTML</Label>
            <Textarea
              id="mapLink"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="Paste Google Maps share link or embed HTML code here..."
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can paste either a Google Maps share link (https://maps.google.com/...) or full embed HTML code
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DescriptionBlockProps {
  title: string;
  text?: string;
}

function DescriptionBlock({ title, text }: DescriptionBlockProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {text || "Not available."}
        </p>
      </CardContent>
    </Card>
  );
}

interface BookingPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

function BookingPieChart({ data }: BookingPieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Booking Source Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PropertyDetailView() {
  const [, params] = useRoute("/property/:id");
  const [, setLocation] = useLocation();
  const propertyId = params?.id;
  const { user } = useAuth();
  const userRole = (user as any)?.role || "guest";

  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => setLocation('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  // Check access permissions (simplified)
  if (userRole === 'guest') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to view this property</p>
          <Button onClick={() => setLocation('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = property.status === 'active' ? 'default' : 
                     property.status === 'maintenance' ? 'secondary' : 'destructive';

  // Calculate mock occupancy rate and rating
  const occupancyRate = 78;
  const rating = 4.8;
  const reviewCount = 152;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation('/properties')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Button>
        </div>

        {/* Property Overview Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          {/* Property Header */}
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{property.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <button 
                onClick={() => {
                  const mapUrl = property.googleMapsLink 
                    ? (property.googleMapsLink.includes('<iframe') 
                        ? extractUrlFromIframe(property.googleMapsLink)
                        : property.googleMapsLink)
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`;
                  window.open(mapUrl, '_blank');
                }}
                className="text-lg text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-center gap-1"
                title="View on Google Maps"
              >
                {property.address}
                <ExternalLink className="w-4 h-4" />
              </button>
              {userRole === 'admin' && (
                <EditMapLinkDialog 
                  property={property} 
                  onUpdate={() => {
                    // Refresh will happen via React Query invalidation
                  }} 
                />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{property.capacity} Guests</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(property.pricePerNight)}/night</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={statusColor}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Property ID:</span>
                  <span className="font-medium">#{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy:</span>
                  <span className="font-medium">{occupancyRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                    <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Source Chart */}
        <div className="mb-8">
          <BookingPieChart data={mockBookingSources} />
        </div>

        {/* Property Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DescriptionBlock title="General Description" text={mockDescriptions.description} />
          <DescriptionBlock title="Space Description" text={mockDescriptions.spaceDescription} />
          <DescriptionBlock title="Guest Interaction" text={mockDescriptions.interaction} />
          <DescriptionBlock title="Neighborhood" text={mockDescriptions.neighborhood} />
          <DescriptionBlock title="Transportation" text={mockDescriptions.transit} />
          <DescriptionBlock title="Other Notes" text={mockDescriptions.otherNotes} />
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Property Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton 
                label="View Tasks" 
                href="/tasks" 
                icon={ClipboardList}
              />
              <ActionButton 
                label="View Bookings" 
                href="/bookings" 
                icon={Calendar}
              />
              <ActionButton 
                label="Edit Property" 
                href="/settings" 
                icon={Settings}
              />
              <ActionButton 
                label="View Utilities" 
                href="/utility-tracker" 
                icon={Calculator}
                variant="outline"
              />
              <ActionButton 
                label="View Finances" 
                href="/finances" 
                icon={DollarSign}
                variant="outline"
              />
              <ActionButton 
                label="Important Info" 
                href="/settings" 
                icon={Info}
                variant="outline"
              />
              <ActionButton 
                label="Documents" 
                href="/settings" 
                icon={FileText}
                variant="outline"
              />
              <ActionButton 
                label="View Calendar" 
                href="/multi-property-calendar" 
                icon={Star}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}