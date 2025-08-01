import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  Star,
  Shield,
  Car,
  Stethoscope,
  Utensils,
  Waves,
  ShoppingCart,
  Coffee,
  Heart,
  Camera,
  ExternalLink,
  MessageCircle,
  Download,
  QrCode,
  User,
  Search,
  Filter,
  ShoppingBag,
  Truck,
  PhoneCall,
  Navigation,
} from "lucide-react";

interface PropertyLocalContact {
  id: number;
  organizationId: string;
  propertyId: number;
  category: string;
  contactName: string;
  contactType: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  googleMapsLink?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  menuUrl?: string;
  qrCodeUrl?: string;
  appStoreLink?: string;
  playStoreLink?: string;
  servicesOffered?: string;
  specialNotes?: string;
  availabilityHours?: string;
  requiresManagerConfirmation: boolean;
  isActive: boolean;
  displayOrder: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LocalEmergencyContactsProps {
  propertyId: number;
}

// Category configurations
const categoryConfig = {
  emergency_health: {
    title: "Emergency & Health",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  on_site_staff: {
    title: "On-Site & Assigned Staff",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  transportation: {
    title: "Transportation",
    icon: Car,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  wellness_spa: {
    title: "Wellness & In-Villa Spa",
    icon: Heart,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  culinary_services: {
    title: "Culinary Services",
    icon: Utensils,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  tours_experiences: {
    title: "Tours & Experiences",
    icon: Camera,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  convenience_delivery: {
    title: "Convenience & Delivery",
    icon: ShoppingBag,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  }
};

// Contact type icon mapping
const contactTypeIcons = {
  hospital: Stethoscope,
  police: Shield,
  host: User,
  housekeeper: User,
  taxi: Car,
  car_rental: Car,
  spa_therapist: Heart,
  chef: Utensils,
  tour_operator: Camera,
  delivery_app: ShoppingBag,
  default: Phone
};

export default function LocalEmergencyContacts({ propertyId }: LocalEmergencyContactsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: contacts = [], isLoading } = useQuery<PropertyLocalContact[]>({
    queryKey: ["/api/property-local-contacts", propertyId],
    enabled: !!propertyId,
  });

  // Filter contacts based on search and category
  const filteredContacts = contacts.filter((contact: PropertyLocalContact) => {
    const matchesSearch = contact.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.servicesOffered?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.specialNotes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || contact.category === selectedCategory;
    
    return matchesSearch && matchesCategory && contact.isActive;
  });

  // Group contacts by category
  const groupedContacts = filteredContacts.reduce((acc: Record<string, PropertyLocalContact[]>, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = [];
    }
    acc[contact.category].push(contact);
    return acc;
  }, {});

  const renderContactCard = (contact: PropertyLocalContact) => {
    const TypeIcon = contactTypeIcons[contact.contactType as keyof typeof contactTypeIcons] || contactTypeIcons.default;
    
    return (
      <Card key={contact.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <TypeIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{contact.contactName}</CardTitle>
                {contact.availabilityHours && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{contact.availabilityHours}</span>
                  </div>
                )}
              </div>
            </div>
            {contact.requiresManagerConfirmation && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Manager Approval
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Services Offered */}
          {contact.servicesOffered && (
            <div>
              <p className="text-sm font-medium mb-2">Services:</p>
              <p className="text-sm text-muted-foreground">{contact.servicesOffered}</p>
            </div>
          )}

          {/* Contact Methods */}
          <div className="space-y-2">
            {contact.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <a 
                  href={`tel:${contact.phoneNumber}`}
                  className="text-sm hover:underline text-green-600 font-medium"
                >
                  {contact.phoneNumber}
                </a>
              </div>
            )}
            
            {contact.whatsappNumber && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <a 
                  href={`https://wa.me/${contact.whatsappNumber.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline text-green-600 font-medium"
                >
                  WhatsApp: {contact.whatsappNumber}
                </a>
              </div>
            )}
            
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <a 
                  href={`mailto:${contact.email}`}
                  className="text-sm hover:underline text-blue-600 font-medium"
                >
                  {contact.email}
                </a>
              </div>
            )}
          </div>

          {/* Address & Maps */}
          {(contact.address || contact.googleMapsLink) && (
            <div className="space-y-2">
              {contact.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{contact.address}</span>
                </div>
              )}
              
              {contact.googleMapsLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <a 
                    href={contact.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Maps
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Website & Booking Links */}
          <div className="flex flex-wrap gap-2">
            {contact.websiteUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={contact.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            
            {contact.bookingUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={contact.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  Book Now
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            
            {contact.menuUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={contact.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Coffee className="h-4 w-4" />
                  Menu
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            
            {contact.qrCodeUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={contact.qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Menu
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>

          {/* App Store Links */}
          {(contact.appStoreLink || contact.playStoreLink) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Download App:</p>
              <div className="flex gap-2">
                {contact.appStoreLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={contact.appStoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      App Store
                    </a>
                  </Button>
                )}
                
                {contact.playStoreLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={contact.playStoreLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Play Store
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Special Notes */}
          {contact.specialNotes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{contact.specialNotes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Local & Emergency Contacts
          </CardTitle>
          <CardDescription>Loading local contacts and services...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Local & Emergency Contacts
        </CardTitle>
        <CardDescription>
          Essential contacts for your stay - emergency services, transportation, dining, and local experiences
        </CardDescription>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.title}</option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all" 
                ? "No contacts found matching your search criteria" 
                : "No local contacts available for this property"}
            </p>
          </div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedContacts)[0] || "emergency_health"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              {Object.entries(groupedContacts).map(([category, contacts]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const Icon = config?.icon || Shield;
                
                return (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config?.title || category}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {contacts.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(groupedContacts).map(([category, contacts]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config?.icon || Shield;
              
              return (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className={`p-4 rounded-lg ${config?.bgColor || 'bg-gray-50'} ${config?.borderColor || 'border-gray-200'} border`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${config?.color || 'text-gray-600'}`} />
                      <h3 className="font-semibold">{config?.title || category}</h3>
                      <Badge variant="outline">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category === 'emergency_health' && "Emergency services and medical facilities for urgent situations"}
                      {category === 'on_site_staff' && "Your dedicated property team available to assist during your stay"}
                      {category === 'transportation' && "Reliable transport options for airport transfers and local travel"}
                      {category === 'wellness_spa' && "In-villa spa treatments and wellness services"}
                      {category === 'culinary_services' && "Private chefs and catering services for special dining experiences"}
                      {category === 'tours_experiences' && "Local tours, activities, and cultural experiences"}
                      {category === 'convenience_delivery' && "Food delivery, groceries, and daily convenience services"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts
                      .sort((a: PropertyLocalContact, b: PropertyLocalContact) => a.displayOrder - b.displayOrder)
                      .map(renderContactCard)
                    }
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}