import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, User, Phone, Mail, Key, Wifi, Shield, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PropertyAccess() {
  const { toast } = useToast();

  // Fetch property access data
  const { data: properties, isLoading } = useQuery({
    queryKey: ["/api/portfolio/property-access"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Access</h1>
          <p className="text-muted-foreground">
            Manage property access codes and contact information
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property: any) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {property.name}
              </CardTitle>
              <CardDescription>{property.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bedrooms:</span>
                  <span className="ml-2">{property.bedrooms}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Guests:</span>
                  <span className="ml-2">{property.maxGuests}</span>
                </div>
              </div>

              {/* Owner Contact */}
              <div className="border rounded-lg p-3 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Owner Contact
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{property.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {property.ownerEmail}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {property.ownerPhone}
                  </div>
                </div>
              </div>

              {/* Current Guest */}
              {property.currentGuest && (
                <div className="border rounded-lg p-3 space-y-2">
                  <h4 className="font-medium">Current Guest</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{property.currentGuest}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {property.guestEmail}
                    </div>
                    <div className="text-muted-foreground">
                      {property.checkInDate} - {property.checkOutDate}
                    </div>
                  </div>
                </div>
              )}

              {/* Access Codes */}
              <div className="border rounded-lg p-3 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Access Codes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3 w-3" />
                    <span className="text-muted-foreground">WiFi:</span>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {property.accessCodes?.wifi}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    <span className="text-muted-foreground">Safe:</span>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {property.accessCodes?.safe}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-3 w-3" />
                    <span className="text-muted-foreground">Gate:</span>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {property.accessCodes?.gate}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Parking:</span>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {property.accessCodes?.parking}
                    </code>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Update Codes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Access Codes</DialogTitle>
                      <DialogDescription>
                        Update access codes for {property.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>WiFi Password</Label>
                          <Input defaultValue={property.accessCodes?.wifi} />
                        </div>
                        <div>
                          <Label>Safe Code</Label>
                          <Input defaultValue={property.accessCodes?.safe} />
                        </div>
                        <div>
                          <Label>Gate Code</Label>
                          <Input defaultValue={property.accessCodes?.gate} />
                        </div>
                        <div>
                          <Label>Parking Code</Label>
                          <Input defaultValue={property.accessCodes?.parking} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Access codes updated",
                            description: "Property access codes have been updated successfully.",
                          });
                        }}
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!properties?.length && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Properties Assigned</h3>
            <p className="text-muted-foreground">
              You don't have any properties assigned to manage yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}