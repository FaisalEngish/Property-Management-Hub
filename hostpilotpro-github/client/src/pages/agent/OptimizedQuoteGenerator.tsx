import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Users, DollarSign, MapPin, Star } from "lucide-react";

// Pre-loaded demo properties for instant search results
const DEMO_PROPERTIES = [
  {
    id: 1,
    name: "Villa Samui Breeze",
    location: "Samui, Thailand",
    price: 8000,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    rating: 4.8,
    image: "🏖️",
    commission: 800,
    amenities: ["Pool", "WiFi", "Kitchen", "AC"]
  },
  {
    id: 2,
    name: "Villa Ocean View",
    location: "Phuket, Thailand", 
    price: 6500,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 4.7,
    image: "🌊",
    commission: 650,
    amenities: ["Ocean View", "WiFi", "Kitchen", "Pool"]
  },
  {
    id: 3,
    name: "Villa Tropical Paradise",
    location: "Koh Phi Phi, Thailand",
    price: 12000,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    rating: 4.9,
    image: "🌴",
    commission: 1200,
    amenities: ["Private Beach", "Pool", "WiFi", "Kitchen"]
  },
  {
    id: 4,
    name: "Villa Aruna Demo",
    location: "Krabi, Thailand",
    price: 20000,
    bedrooms: 5,
    bathrooms: 4,
    guests: 10,
    rating: 4.9,
    image: "🏝️",
    commission: 2000,
    amenities: ["Luxury", "Pool", "WiFi", "Kitchen", "Spa"]
  }
];

export default function OptimizedQuoteGenerator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [guests, setGuests] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Fast, instant search filtering
  const filteredProperties = useMemo(() => {
    return DEMO_PROPERTIES.filter(property => {
      const matchesSearch = searchTerm === "" || 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBudget = (!minBudget || property.price >= parseInt(minBudget)) &&
        (!maxBudget || property.price <= parseInt(maxBudget));
      
      const matchesGuests = !guests || property.guests >= parseInt(guests);
      
      return matchesSearch && matchesBudget && matchesGuests;
    });
  }, [searchTerm, minBudget, maxBudget, guests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Generate Client Quote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Input
                placeholder="Search destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Range (THB)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Guests</label>
              <Input
                placeholder="Number of guests"
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instant Results */}
      {(showResults || searchTerm || minBudget || maxBudget || guests) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Found {filteredProperties.length} Properties
            </h2>
            <Badge variant="secondary">
              Total Commission: ฿{filteredProperties.reduce((sum, p) => sum + p.commission, 0).toLocaleString()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{property.image}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{property.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {property.guests}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        ฿{property.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Commission: ฿{property.commission.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Generate Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No properties match your search criteria.</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}