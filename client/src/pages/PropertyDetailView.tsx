import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  ExternalLink,
  Upload,
  Shield,
  Plus
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fastCache } from "@/lib/fastCache";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    const embedUrl = srcMatch[1];
    
    // Convert embed URL to a proper shareable Google Maps URL
    // Extract coordinates or place ID from the embed URL
    const pbMatch = embedUrl.match(/pb=([^&]+)/);
    if (pbMatch) {
      // If it's an embed URL with pb parameter, convert it to a regular maps URL
      // The pb parameter is complex, so we'll construct a simpler URL
      // Try to extract coordinates if present
      const coordMatch = embedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    
    // If the src is already a regular maps URL, return it
    if (embedUrl.includes('maps.google.com') && !embedUrl.includes('/embed')) {
      return embedUrl;
    }
    
    // Otherwise return the embed URL as fallback
    return embedUrl;
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
  propertyId?: string;
  onClick?: () => void;
}

function ActionButton({ label, href, icon: Icon, variant = "default", propertyId, onClick }: ActionButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleClick = () => {
    try {
      if (onClick) {
        onClick();
      } else {
        // Check if the href exists and handle property-specific navigation
        if ((href.includes('/property/') || href.includes('/finances')) && propertyId) {
          setLocation(`${href}?propertyId=${propertyId}`);
        } else {
          setLocation(href);
        }
      }
    } catch (error) {
      toast({
        title: "Navigation Error",
        description: `Failed to navigate to ${label}. This feature will be available soon.`,
        variant: "destructive",
      });
      console.error("Navigation error:", error);
    }
  };
  
  return (
    <Button
      variant={variant}
      onClick={handleClick}
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
      return apiRequest("PUT", `/api/properties/${property.id}`, data);
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

// Upload Document Dialog Schema
const documentUploadSchema = z.object({
  docType: z.string().min(1, "Document type is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  expiryDate: z.string().optional(),
});

// Upload Document Dialog Component
function UploadDocumentDialog({ propertyId, onSuccess }: { propertyId: string; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof documentUploadSchema>>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      docType: "",
      fileUrl: "",
      expiryDate: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof documentUploadSchema>) => {
      console.log("🚀 Document upload mutation started", data);
      const payload = {
        ...data,
        propertyId: parseInt(propertyId),
        organizationId: (user as any)?.organizationId || "default-org",
        uploadedBy: (user as any)?.id || "unknown",
      };
      console.log("📦 Payload:", payload);
      const response = await apiRequest("POST", "/api/property-documents", payload);
      console.log("✅ Document upload response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("✅ Document upload successful");
      // Clear fastCache for expiring documents
      fastCache.delete("/api/property-documents/expiring?days=30");
      
      toast({
        title: "Document Uploaded",
        description: "Property document has been uploaded successfully.",
      });
      
      // Invalidate and refetch immediately
      queryClient.invalidateQueries({ queryKey: ["/api/property-documents"] });
      queryClient.invalidateQueries({ queryKey: [`/api/property-documents/property/${propertyId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-documents/expiring?days=30"] });
      queryClient.refetchQueries({ queryKey: ["/api/property-documents/expiring?days=30"] });
      queryClient.refetchQueries({ queryKey: [`/api/property-documents/property/${propertyId}`] });
      
      form.reset();
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: Error) => {
      console.error("❌ Document upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-testid="upload-document-button">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Property Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log("📝 Form submitted with data:", data);
            console.log("🔍 Form errors:", form.formState.errors);
            uploadMutation.mutate(data);
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="docType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., License, Contract, Invoice" {...field} data-testid="input-doc-type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name / File URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., tourism-license-2025.pdf" {...field} data-testid="input-file-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-expiry-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-document">
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Add Insurance Dialog Schema
const insuranceSchema = z.object({
  insurerName: z.string().min(1, "Insurance provider is required"),
  policyNumber: z.string().optional(),
  coverageDetails: z.string().optional(),
  expiryDate: z.string().optional(),
});

// Add Insurance Dialog Component
function AddInsuranceDialog({ propertyId, onSuccess }: { propertyId: string; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof insuranceSchema>>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      insurerName: "",
      policyNumber: "",
      coverageDetails: "",
      expiryDate: "",
    },
  });

  const insuranceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insuranceSchema>) => {
      console.log("🚀 Insurance mutation started", data);
      const payload = {
        ...data,
        propertyId: parseInt(propertyId),
        uploadedBy: (user as any)?.id || "unknown",
      };
      console.log("📦 Payload:", payload);
      const response = await apiRequest("POST", "/api/property-insurance", payload);
      console.log("✅ Insurance response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("✅ Insurance added successful");
      // Clear fastCache for expiring insurance
      fastCache.delete("/api/property-insurance/expiring/30");
      
      toast({
        title: "Insurance Added",
        description: "Property insurance has been added successfully.",
      });
      
      // Invalidate and refetch immediately
      queryClient.invalidateQueries({ queryKey: ["/api/property-insurance"] });
      queryClient.invalidateQueries({ queryKey: [`/api/property-insurance/property/${propertyId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/property-insurance/expiring/30"] });
      queryClient.refetchQueries({ queryKey: ["/api/property-insurance/expiring/30"] });
      queryClient.refetchQueries({ queryKey: [`/api/property-insurance/property/${propertyId}`] });
      
      form.reset();
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: Error) => {
      console.error("❌ Insurance failed:", error);
      toast({
        title: "Failed to Add Insurance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-testid="add-insurance-button">
          <Shield className="w-4 h-4 mr-2" />
          Add Insurance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Property Insurance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log("📝 Insurance form submitted with data:", data);
            console.log("🔍 Form errors:", form.formState.errors);
            insuranceMutation.mutate(data);
          })} className="space-y-4">
            <FormField
              control={form.control}
              name="insurerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AXA Thailand, Bangkok Insurance" {...field} data-testid="input-insurer-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="policyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., POL-2025-12345" {...field} data-testid="input-policy-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverageDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Fire, flood, theft coverage up to 10M THB" {...field} data-testid="input-coverage-details" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} data-testid="input-insurance-expiry" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={insuranceMutation.isPending} data-testid="button-submit-insurance">
                {insuranceMutation.isPending ? "Adding..." : "Add Insurance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PropertyDetailView() {
  const [, params] = useRoute("/property/:id");
  const [, setLocation] = useLocation();
  const propertyId = params?.id;
  const { user } = useAuth();
  const userRole = (user as any)?.role || "guest";
  const { toast } = useToast();

  const { data: property, isLoading } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  // Fetch property documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: [`/api/property-documents/property/${propertyId}`],
    enabled: !!propertyId,
    staleTime: 0,
  });

  console.log("📄 Documents data:", documents, "Length:", Array.isArray(documents) ? documents.length : "not array");

  // Fetch property insurance
  const { data: insurance = [], refetch: refetchInsurance } = useQuery({
    queryKey: [`/api/property-insurance/property/${propertyId}`],
    enabled: !!propertyId,
    staleTime: 0,
  });

  console.log("🛡️ Insurance data:", insurance, "Length:", Array.isArray(insurance) ? insurance.length : "not array");

  // Toast notifications for expired documents
  useEffect(() => {
    if (documents && Array.isArray(documents) && documents.length > 0) {
      const now = new Date();
      const expiredDocs = documents.filter((doc: any) => {
        if (!doc.expiryDate) return false;
        const expiryDate = new Date(doc.expiryDate);
        return expiryDate < now;
      });

      if (expiredDocs.length > 0) {
        expiredDocs.forEach((doc: any) => {
          toast({
            title: "⚠️ Document Expired",
            description: `${doc.docType} for ${property?.name || 'this property'} expired on ${new Date(doc.expiryDate).toLocaleDateString()}`,
            variant: "destructive",
          });
        });
      }
    }
  }, [documents, property, toast]);

  // Toast notifications for expired insurance
  useEffect(() => {
    if (insurance && Array.isArray(insurance) && insurance.length > 0) {
      const now = new Date();
      const expiredIns = insurance.filter((ins: any) => {
        if (!ins.expiryDate) return false;
        const expiryDate = new Date(ins.expiryDate);
        return expiryDate < now;
      });

      if (expiredIns.length > 0) {
        expiredIns.forEach((ins: any) => {
          toast({
            title: "⚠️ Insurance Expired",
            description: `${ins.insuranceType} for ${property?.name || 'this property'} expired on ${new Date(ins.expiryDate).toLocaleDateString()}`,
            variant: "destructive",
          });
        });
      }
    }
  }, [insurance, property, toast]);

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
                <span>{property.maxGuests || 'N/A'} Guests</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{formatCurrency(parseFloat(property.pricePerNight || '0'))}/night</span>
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
                propertyId={property?.id}
              />
              <ActionButton 
                label="View Bookings" 
                href="/bookings" 
                icon={Calendar}
                propertyId={property?.id}
              />
              <ActionButton 
                label="Edit Property" 
                href={`/property/${property?.id}/edit`}
                icon={Settings}
                propertyId={property?.id}
              />
              <ActionButton 
                label="View Utilities" 
                href="/utility-tracker" 
                icon={Calculator}
                variant="outline"
              />
              <ActionButton 
                label="View Finances" 
                href={`/finances?propertyId=${property.id}`}
                icon={DollarSign}
                variant="outline"
              />
              <ActionButton 
                label="Property Info" 
                href="/property-info" 
                icon={Info}
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Property Information",
                    description: "Detailed property information panel is displayed above. Additional settings available in admin dashboard.",
                  });
                }}
              />
              <ActionButton 
                label="Documents" 
                href="#documents-section" 
                icon={FileText}
                variant="outline"
                onClick={() => {
                  document.getElementById('documents-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <ActionButton 
                label="View Calendar" 
                href="/multi-property-calendar" 
                icon={Star}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents & Insurance Section */}
        <div id="documents-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Property Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload property documents like licenses, contracts, and permits with expiry dates to receive alerts.
              </p>
              <UploadDocumentDialog 
                propertyId={property.id} 
                onSuccess={() => {
                  // Success handled by mutation
                }} 
              />
              
              {/* Documents List */}
              {documents.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">Uploaded Documents</h4>
                  {documents.map((doc: any) => {
                    const isExpiring = doc.expiryDate && new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`document-${doc.id}`}>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{doc.docType}</div>
                          <div className="text-xs text-muted-foreground">{doc.fileUrl}</div>
                          {doc.expiryDate && (
                            <div className="text-xs mt-1">
                              Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {isExpired && (
                          <Badge variant="destructive" className="ml-2">🔴 Expired</Badge>
                        )}
                        {isExpiring && !isExpired && (
                          <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">🟠 Expiring Soon</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Property Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add property insurance details with expiry dates to track coverage and receive renewal alerts.
              </p>
              <AddInsuranceDialog 
                propertyId={property.id} 
                onSuccess={() => {
                  // Success handled by mutation
                }} 
              />
              
              {/* Insurance List */}
              {insurance.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">Insurance Policies</h4>
                  {insurance.map((ins: any) => {
                    const isExpiring = ins.expiryDate && new Date(ins.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    const isExpired = ins.expiryDate && new Date(ins.expiryDate) < new Date();
                    
                    return (
                      <div key={ins.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`insurance-${ins.id}`}>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ins.insurerName}</div>
                          {ins.policyNumber && (
                            <div className="text-xs text-muted-foreground">Policy: {ins.policyNumber}</div>
                          )}
                          {ins.expiryDate && (
                            <div className="text-xs mt-1">
                              Expires: {new Date(ins.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {isExpired && (
                          <Badge variant="destructive" className="ml-2">🔴 Expired</Badge>
                        )}
                        {isExpiring && !isExpired && (
                          <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">🟠 Expiring Soon</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}