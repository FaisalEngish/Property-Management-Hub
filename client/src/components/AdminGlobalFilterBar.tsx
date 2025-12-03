import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search, MapPin, Building, User, Users } from "lucide-react";

export interface AdminFilters {
  propertyId?: number;
  ownerId?: string;
  portfolioManagerId?: string;
  area?: string;
  bedroomCount?: number;
  searchText?: string;
}

interface AdminGlobalFilterBarProps {
  onFiltersChange: (filters: AdminFilters) => void;
  className?: string;
}

const AREAS = [
  "Chaweng", "Lamai", "Nathon", "Bophut", "Maenam", "Choeng Mon", "Taling Ngam", "Lipa Noi"
];

const BEDROOM_OPTIONS = [
  { label: "1 Bedroom", value: 1 },
  { label: "2 Bedrooms", value: 2 },
  { label: "3 Bedrooms", value: 3 },
  { label: "4 Bedrooms", value: 4 },
  { label: "5 Bedrooms", value: 5 },
  { label: "6 Bedrooms", value: 6 },
  { label: "7+ Bedrooms", value: 7 }
];

// Properties will be fetched from API - no mock data
const MOCK_PROPERTIES: { id: number; name: string }[] = [];

const MOCK_OWNERS = [
  { id: "owner1", name: "John Smith" },
  { id: "owner2", name: "Sarah Johnson" },
  { id: "owner3", name: "Michael Brown" },
  { id: "owner4", name: "Emma Davis" }
];

const MOCK_PORTFOLIO_MANAGERS = [
  { id: "pm1", name: "Alex Thompson" },
  { id: "pm2", name: "Jessica Wilson" },
  { id: "pm3", name: "David Miller" }
];

export default function AdminGlobalFilterBar({ onFiltersChange, className }: AdminGlobalFilterBarProps) {
  const [filters, setFilters] = useState<AdminFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<AdminFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const clearSpecificFilter = (filterKey: keyof AdminFilters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof AdminFilters] !== undefined && filters[key as keyof AdminFilters] !== ""
  ).length;

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Global Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>

        {/* Search Bar - Always visible */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties, guests, tasks..."
              value={filters.searchText || ""}
              onChange={(e) => updateFilters({ searchText: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.propertyId && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                Property: {MOCK_PROPERTIES.find(p => p.id === filters.propertyId)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('propertyId')}
                />
              </Badge>
            )}
            {filters.ownerId && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Owner: {MOCK_OWNERS.find(o => o.id === filters.ownerId)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('ownerId')}
                />
              </Badge>
            )}
            {filters.portfolioManagerId && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                PM: {MOCK_PORTFOLIO_MANAGERS.find(pm => pm.id === filters.portfolioManagerId)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('portfolioManagerId')}
                />
              </Badge>
            )}
            {filters.area && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Area: {filters.area}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('area')}
                />
              </Badge>
            )}
            {filters.bedroomCount && (
              <Badge variant="outline" className="flex items-center gap-1">
                Bedrooms: {filters.bedroomCount === 7 ? "7+" : filters.bedroomCount}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearSpecificFilter('bedroomCount')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Expanded Filter Controls */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <Select 
                value={filters.propertyId?.toString() || ""} 
                onValueChange={(value) => updateFilters({ propertyId: value ? parseInt(value) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Properties</SelectItem>
                  {MOCK_PROPERTIES.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <Select 
                value={filters.ownerId || ""} 
                onValueChange={(value) => updateFilters({ ownerId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Owners</SelectItem>
                  {MOCK_OWNERS.map(owner => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Portfolio Manager Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Manager</label>
              <Select 
                value={filters.portfolioManagerId || ""} 
                onValueChange={(value) => updateFilters({ portfolioManagerId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All PMs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Portfolio Managers</SelectItem>
                  {MOCK_PORTFOLIO_MANAGERS.map(pm => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <Select 
                value={filters.area || ""} 
                onValueChange={(value) => updateFilters({ area: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Areas</SelectItem>
                  {AREAS.map(area => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bedroom Count Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <Select 
                value={filters.bedroomCount?.toString() || ""} 
                onValueChange={(value) => updateFilters({ bedroomCount: value ? parseInt(value) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {BEDROOM_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}