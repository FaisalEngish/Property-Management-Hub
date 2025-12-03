import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Phone, MapPin, Globe, Mail, Plus, Edit, Trash2, Star, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

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
  appStoreLink?: string;
  playStoreLink?: string;
  menuUrl?: string;
  servicesOffered?: string;
  availabilityHours?: string;
  specialNotes?: string;
  requiresManagerConfirmation: boolean;
  isActive: boolean;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const contactCategories = [
  { value: "emergency_health", label: "Emergency & Health", icon: "🚨" },
  { value: "on_site_staff", label: "On-Site Staff", icon: "👥" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "wellness_spa", label: "Wellness & Spa", icon: "💆" },
  { value: "culinary_services", label: "Culinary Services", icon: "👨‍🍳" },
  { value: "tours_experiences", label: "Tours & Experiences", icon: "🏝️" },
  { value: "convenience_delivery", label: "Convenience & Delivery", icon: "📱" }
];

const contactTypes = [
  "hospital", "police", "pharmacy", "host", "housekeeper", "taxi", "car_rental", 
  "spa_therapist", "chef", "tour_operator", "delivery_app"
];

export default function LocalContactsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<number>(1); // Default to Villa Aruna
  const [editingContact, setEditingContact] = useState<PropertyLocalContact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch properties for selection
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch local contacts for selected property
  const { data: localContacts = [], isLoading } = useQuery({
    queryKey: ["/api/property-local-contacts", selectedProperty],
    enabled: !!selectedProperty,
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: Partial<PropertyLocalContact>) => {
      return apiRequest("POST", "/api/property-local-contacts", contactData);
    },
    onSuccess: () => {
      toast({
        title: "Contact Created",
        description: "Local contact has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-local-contacts"] });
      setIsDialogOpen(false);
      setEditingContact(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact",
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PropertyLocalContact> & { id: number }) => {
      return apiRequest("PATCH", `/api/property-local-contacts/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Contact Updated",
        description: "Local contact has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-local-contacts"] });
      setIsDialogOpen(false);
      setEditingContact(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact",
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/property-local-contacts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Contact Deleted",
        description: "Local contact has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-local-contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contactData = {
      propertyId: selectedProperty,
      category: formData.get("category") as string,
      contactName: formData.get("contactName") as string,
      contactType: formData.get("contactType") as string,
      phoneNumber: formData.get("phoneNumber") as string || undefined,
      whatsappNumber: formData.get("whatsappNumber") as string || undefined,
      email: formData.get("email") as string || undefined,
      address: formData.get("address") as string || undefined,
      googleMapsLink: formData.get("googleMapsLink") as string || undefined,
      websiteUrl: formData.get("websiteUrl") as string || undefined,
      bookingUrl: formData.get("bookingUrl") as string || undefined,
      servicesOffered: formData.get("servicesOffered") as string || undefined,
      availabilityHours: formData.get("availabilityHours") as string || undefined,
      specialNotes: formData.get("specialNotes") as string || undefined,
      requiresManagerConfirmation: formData.get("requiresManagerConfirmation") === "true",
      isActive: formData.get("isActive") === "true",
      displayOrder: parseInt(formData.get("displayOrder") as string) || 1,
    };

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, ...contactData });
    } else {
      createContactMutation.mutate(contactData);
    }
  };

  const groupedContacts = contactCategories.map(category => ({
    ...category,
    contacts: localContacts.filter((contact: PropertyLocalContact) => contact.category === category.value)
  }));

  const selectedPropertyName = properties.find((p: any) => p.id === selectedProperty)?.name || "Villa Aruna";

  // Check user permissions
  const canManage = user && ['admin', 'portfolio-manager'].includes(user.role);

  if (!canManage) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-semibold">Access Restricted</h3>
              <p className="text-sm text-muted-foreground">
                Only administrators and portfolio managers can manage local contacts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Local Contacts Management</h1>
          <p className="text-muted-foreground">
            Manage emergency contacts, local services, and property-specific contact directory for guests
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingContact(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
              <DialogDescription>
                {editingContact ? "Update the contact information" : "Add a new local contact for guests"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingContact?.category || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactType">Contact Type</Label>
                  <Select name="contactType" defaultValue={editingContact?.contactType || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  name="contactName"
                  defaultValue={editingContact?.contactName || ""}
                  placeholder="e.g., Bangkok Hospital Samui"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    name="phoneNumber"
                    defaultValue={editingContact?.phoneNumber || ""}
                    placeholder="+66 77 123 456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    name="whatsappNumber"
                    defaultValue={editingContact?.whatsappNumber || ""}
                    placeholder="+66 77 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={editingContact?.email || ""}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    name="websiteUrl"
                    defaultValue={editingContact?.websiteUrl || ""}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  name="address"
                  defaultValue={editingContact?.address || ""}
                  placeholder="Full address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicesOffered">Services Offered</Label>
                <Textarea
                  name="servicesOffered"
                  defaultValue={editingContact?.servicesOffered || ""}
                  placeholder="Describe the services offered"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availabilityHours">Availability Hours</Label>
                  <Input
                    name="availabilityHours"
                    defaultValue={editingContact?.availabilityHours || ""}
                    placeholder="e.g., 24/7 or 9:00 AM - 6:00 PM"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    name="displayOrder"
                    type="number"
                    defaultValue={editingContact?.displayOrder || 1}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNotes">Special Notes</Label>
                <Textarea
                  name="specialNotes"
                  defaultValue={editingContact?.specialNotes || ""}
                  placeholder="Any special instructions or notes"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiresManagerConfirmation">Requires Manager Confirmation</Label>
                  <Select name="requiresManagerConfirmation" defaultValue={editingContact?.requiresManagerConfirmation?.toString() || "false"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="isActive">Active Status</Label>
                  <Select name="isActive" defaultValue={editingContact?.isActive?.toString() || "true"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContactMutation.isPending || updateContactMutation.isPending}>
                  {editingContact ? "Update Contact" : "Create Contact"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Property Selection</CardTitle>
          <CardDescription>
            Select a property to manage its local contacts directory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="property">Property:</Label>
            <Select value={selectedProperty.toString()} onValueChange={(value) => setSelectedProperty(parseInt(value))}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property: any) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts Overview - {selectedPropertyName}</CardTitle>
          <CardDescription>
            Manage local contacts organized by category for guest convenience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Tabs defaultValue={contactCategories[0]?.value} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {contactCategories.map(category => (
                  <TabsTrigger key={category.value} value={category.value} className="text-xs">
                    {category.icon}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {groupedContacts.map(category => (
                <TabsContent key={category.value} value={category.value} className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{category.label}</h3>
                      <Badge variant="secondary">
                        {category.contacts.length} contacts
                      </Badge>
                    </div>
                    
                    {category.contacts.length === 0 ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No contacts in this category</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setEditingContact(null);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Contact
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {category.contacts.map((contact: PropertyLocalContact) => (
                          <Card key={contact.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{contact.contactName}</h4>
                                    <Badge variant={contact.isActive ? "default" : "secondary"}>
                                      {contact.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    {contact.requiresManagerConfirmation && (
                                      <Badge variant="outline">
                                        <Star className="h-3 w-3 mr-1" />
                                        Manager Approval
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="capitalize">{contact.contactType.replace('_', ' ')}</p>
                                    
                                    {contact.phoneNumber && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{contact.phoneNumber}</span>
                                      </div>
                                    )}
                                    
                                    {contact.email && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{contact.email}</span>
                                      </div>
                                    )}
                                    
                                    {contact.address && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{contact.address}</span>
                                      </div>
                                    )}
                                    
                                    {contact.websiteUrl && (
                                      <div className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        <span className="truncate">{contact.websiteUrl}</span>
                                      </div>
                                    )}
                                    
                                    {contact.servicesOffered && (
                                      <p className="text-xs bg-muted p-2 rounded">
                                        {contact.servicesOffered}
                                      </p>
                                    )}
                                    
                                    {contact.availabilityHours && (
                                      <p className="text-xs">
                                        <strong>Hours:</strong> {contact.availabilityHours}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingContact(contact);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this contact?")) {
                                        deleteContactMutation.mutate(contact.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}