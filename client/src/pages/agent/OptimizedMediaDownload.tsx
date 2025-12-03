import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Image, Video, FileText, Filter, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["All Categories", "exterior", "interior", "tour", "aerial", "marketing"];
const TYPES = ["All Types", "image", "video", "document"];

export default function OptimizedMediaDownload() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Fetch properties from API
  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch media items from API
  const { data: mediaItems = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/property-media"],
  });

  // Build property list for filter dropdown
  const PROPERTIES = useMemo(() => {
    const propertyNames = properties.map((p: any) => p.name);
    return ["All Properties", ...propertyNames];
  }, [properties]);

  // Fast, instant filtering
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item: any) => {
      const matchesSearch = searchTerm === "" || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.property?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProperty = propertyFilter === "All Properties" || item.property === propertyFilter;
      const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
      const matchesType = typeFilter === "All Types" || item.type === typeFilter;
      
      return matchesSearch && matchesProperty && matchesCategory && matchesType;
    });
  }, [searchTerm, propertyFilter, categoryFilter, typeFilter, mediaItems]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-blue-100 text-blue-800";
      case "video": return "bg-purple-100 text-purple-800";
      case "document": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownload = (item: any) => {
    // Simulate download
    console.log(`Downloading ${item.name}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPropertyFilter("All Properties");
    setCategoryFilter("All Categories");
    setTypeFilter("All Types");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Media Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTIES.map((property) => (
                    <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredMedia.length} items found
              </Badge>
              <Badge variant="outline">
                Total size: {filteredMedia.reduce((sum, item) => sum + parseFloat(item.size), 0).toFixed(1)}MB
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative">
                <div className="text-4xl">{item.icon}</div>
                <Badge className={`absolute top-2 right-2 ${getTypeColor(item.type)}`}>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    <span className="text-xs">{item.type}</span>
                  </div>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                <p className="text-xs text-gray-600">{item.property}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.resolution}</span>
                  <span>{item.size}</span>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="sm"
                  onClick={() => handleDownload(item)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download {item.format}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredMedia.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-2">No media files match your criteria</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}