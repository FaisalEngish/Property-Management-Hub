import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export interface GlobalFilterState {
  propertyId?: number;
  ownerId?: string;
  portfolioManagerId?: string;
  area?: string;
  bedroomCount?: number;
  propertyStatus?: "active" | "inactive";
  searchTerm?: string;
}

interface GlobalFiltersProps {
  filters: GlobalFilterState;
  onFiltersChange: (filters: GlobalFilterState) => void;
  className?: string;
  showFilters?: {
    property?: boolean;
    owner?: boolean;
    portfolioManager?: boolean;
    area?: boolean;
    bedrooms?: boolean;
    status?: boolean;
    search?: boolean;
  };
  placeholder?: string;
}

export default function GlobalFilters({
  filters,
  onFiltersChange,
  className,
  showFilters = {
    property: true,
    owner: true,
    portfolioManager: true,
    area: true,
    bedrooms: true,
    status: true,
    search: true,
  },
  placeholder = "Search..."
}: GlobalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch filter options
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const owners = users.filter((user: any) => user.role === "owner");
  const portfolioManagers = users.filter((user: any) => user.role === "portfolio-manager");
  
  // Get unique areas and bedroom counts from properties
  const areas = [...new Set(properties.map((p: any) => p.address?.split(',').pop()?.trim()).filter(Boolean))];
  const bedroomCounts = [...new Set(properties.map((p: any) => p.bedrooms).filter(Boolean))].sort((a, b) => a - b);

  const handleFilterChange = (key: keyof GlobalFilterState, value: any) => {
    const newFilters = { ...filters };
    if (value === "all" || value === "" || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const getFilterDisplayValue = (key: keyof GlobalFilterState) => {
    const value = filters[key];
    if (!value) return "All";
    
    switch (key) {
      case "propertyId":
        const property = properties.find((p: any) => p.id === value);
        return property?.name || "Unknown Property";
      case "ownerId":
        const owner = owners.find((u: any) => u.id === value);
        return owner ? `${owner.firstName} ${owner.lastName}` : "Unknown Owner";
      case "portfolioManagerId":
        const pm = portfolioManagers.find((u: any) => u.id === value);
        return pm ? `${pm.firstName} ${pm.lastName}` : "Unknown PM";
      case "bedroomCount":
        return `${value} bed${value !== 1 ? 's' : ''}`;
      case "propertyStatus":
        return value.charAt(0).toUpperCase() + value.slice(1);
      default:
        return value;
    }
  };

  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Quick Search */}
        {showFilters.search && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={filters.searchTerm || ""}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Filter Options - Collapsible */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {showFilters.property && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Property
                </label>
                <Select
                  value={filters.propertyId?.toString() || "all"}
                  onValueChange={(value) => handleFilterChange("propertyId", value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.owner && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Owner
                </label>
                <Select
                  value={filters.ownerId || "all"}
                  onValueChange={(value) => handleFilterChange("ownerId", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {owners.map((owner: any) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.portfolioManager && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Portfolio Manager
                </label>
                <Select
                  value={filters.portfolioManagerId || "all"}
                  onValueChange={(value) => handleFilterChange("portfolioManagerId", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All PMs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Portfolio Managers</SelectItem>
                    {portfolioManagers.map((pm: any) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.firstName} {pm.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.area && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Area
                </label>
                <Select
                  value={filters.area || "all"}
                  onValueChange={(value) => handleFilterChange("area", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map((area: string) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.bedrooms && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Bedrooms
                </label>
                <Select
                  value={filters.bedroomCount?.toString() || "all"}
                  onValueChange={(value) => handleFilterChange("bedroomCount", value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {bedroomCounts.map((count: number) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} bed{count !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.status && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Status
                </label>
                <Select
                  value={filters.propertyStatus || "all"}
                  onValueChange={(value) => handleFilterChange("propertyStatus", value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  {getFilterDisplayValue(key as keyof GlobalFilterState)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleFilterChange(key as keyof GlobalFilterState, undefined)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for managing filter state with localStorage persistence
export function useGlobalFilters(storageKey: string = "global-filters") {
  const [filters, setFilters] = useState<GlobalFilterState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch {
      // Ignore localStorage errors
    }
  }, [filters, storageKey]);

  return [filters, setFilters] as const;
}

// Utility function to apply filters to data arrays
export function applyGlobalFilters<T extends Record<string, any>>(
  data: T[],
  filters: GlobalFilterState,
  config: {
    propertyIdField?: string;
    ownerIdField?: string;
    portfolioManagerIdField?: string;
    areaField?: string;
    bedroomCountField?: string;
    statusField?: string;
    searchFields?: string[];
  } = {}
): T[] {
  const {
    propertyIdField = "propertyId",
    ownerIdField = "ownerId",
    portfolioManagerIdField = "portfolioManagerId",
    areaField = "area",
    bedroomCountField = "bedrooms",
    statusField = "status",
    searchFields = ["name", "title", "description"],
  } = config;

  return data.filter((item) => {
    // Property filter
    if (filters.propertyId && item[propertyIdField] !== filters.propertyId) {
      return false;
    }

    // Owner filter
    if (filters.ownerId && item[ownerIdField] !== filters.ownerId) {
      return false;
    }

    // Portfolio Manager filter
    if (filters.portfolioManagerId && item[portfolioManagerIdField] !== filters.portfolioManagerId) {
      return false;
    }

    // Area filter
    if (filters.area && !item[areaField]?.includes(filters.area)) {
      return false;
    }

    // Bedroom count filter
    if (filters.bedroomCount && item[bedroomCountField] !== filters.bedroomCount) {
      return false;
    }

    // Status filter
    if (filters.propertyStatus && item[statusField] !== filters.propertyStatus) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesSearch = searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm)
      );
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}