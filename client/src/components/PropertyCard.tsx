import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin } from "lucide-react";

interface PropertyCardProps {
  property: any;
  onDelete: () => void;
}

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const statusColor = property.status === 'active' ? 'default' : 
                     property.status === 'maintenance' ? 'secondary' : 'destructive';

  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <Home className="w-12 h-12 text-gray-400" />
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{property.name}</h3>
        <div className="flex items-start space-x-2 text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{property.address}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Badge variant={statusColor}>
            {property.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {property.bedrooms}BR / {property.bathrooms}BA
          </span>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Max Guests: {property.maxGuests}</p>
          <p>Price: ${property.pricePerNight}/night</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" size="sm">
            View
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            Manage
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
