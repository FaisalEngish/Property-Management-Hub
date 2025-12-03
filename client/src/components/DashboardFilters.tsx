import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterIcon, X, Search, MapPin, Building, Users, Bed } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface DashboardFiltersProps {
  // Required callbacks
  onFiltersChange: (filters: FilterState) => void;
  
  // Optional configuration
  showPropertyFilter?: boolean;
  showLocationFilter?: boolean;
  showRoleFilter?: boolean;
  showDateRange?: boolean;
  showBedroomFilter?: boolean;
  showSearchFilter?: boolean;
  showStatusFilter?: boolean;
  
  // Custom filter options
  propertyOptions?: FilterOption[];
  locationOptions?: FilterOption[];
  roleOptions?: FilterOption[];
  statusOptions?: FilterOption[];
  
  // Initial values
  initialFilters?: Partial<FilterState>;
  
  // Layout
  compact?: boolean;
  className?: string;
}

export interface FilterState {
  search?: string;
  properties?: string[];
  locations?: string[];
  roles?: string[];
  statuses?: string[];
  bedrooms?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any; // Allow custom filters
}

// Default options - properties will be fetched from API
const defaultPropertyOptions: FilterOption[] = [];

const defaultLocationOptions: FilterOption[] = [
  { value: "koh-samui", label: "Koh Samui", count: 25 },
  { value: "phuket", label: "Phuket", count: 18 },
  { value: "koh-phangan", label: "Koh Phangan", count: 12 },
  { value: "krabi", label: "Krabi", count: 8 },
];

const defaultRoleOptions: FilterOption[] = [
  { value: "admin", label: "Admin", count: 2 },
  { value: "portfolio-manager", label: "Portfolio Manager", count: 3 },
  { value: "staff", label: "Staff", count: 8 },
  { value: "owner", label: "Owner", count: 15 },
];

const defaultStatusOptions: FilterOption[] = [
  { value: "active", label: "Active", count: 45 },
  { value: "pending", label: "Pending", count: 12 },
  { value: "completed", label: "Completed", count: 128 },
  { value: "cancelled", label: "Cancelled", count: 5 },
];

const bedroomOptions = [
  { value: "any", label: "Any Bedrooms" },
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4", label: "4 Bedrooms" },
  { value: "5+", label: "5+ Bedrooms" },
];

export default function DashboardFilters({
  onFiltersChange,
  showPropertyFilter = true,
  showLocationFilter = true,
  showRoleFilter = false,
  showDateRange = true,
  showBedroomFilter = false,
  showSearchFilter = true,
  showStatusFilter = true,
  propertyOptions = defaultPropertyOptions,
  locationOptions = defaultLocationOptions,
  roleOptions = defaultRoleOptions,
  statusOptions = defaultStatusOptions,
  initialFilters = {},
  compact = false,
  className = "",
}: DashboardFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const removeFilter = (key: string, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      // Remove specific value from array
      const newArray = (filters[key] as string[]).filter(v => v !== value);
      updateFilters({ [key]: newArray.length > 0 ? newArray : undefined });
    } else {
      // Remove entire filter
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== "";
    }).length;
  };

  const MultiSelectFilter = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon 
  }: {
    options: FilterOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
    icon: any;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {value.length > 0 ? `${value.length} selected` : placeholder}
          </div>
          <FilterIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...value, option.value]);
                  } else {
                    onChange(value.filter(v => v !== option.value));
                  }
                }}
              />
              <label
                htmlFor={option.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
              >
                {option.label}
                {option.count && (
                  <span className="text-muted-foreground ml-2">({option.count})</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg", className)}>
        {showSearchFilter && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.search || ""}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9 w-64"
            />
          </div>
        )}
        
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              
              {/* Render full filter controls here */}
              {showPropertyFilter && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Properties</label>
                  <MultiSelectFilter
                    options={propertyOptions}
                    value={filters.properties || []}
                    onChange={(value) => updateFilters({ properties: value })}
                    placeholder="Select properties"
                    icon={Building}
                  />
                </div>
              )}
              
              {/* Add other filters similarly */}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Dashboard Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <>
                <Badge variant="secondary">
                  {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{filters.search}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('search')}
                />
              </Badge>
            )}
            
            {filters.properties?.map(property => (
              <Badge key={property} variant="outline" className="flex items-center gap-1">
                {propertyOptions.find(p => p.value === property)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('properties', property)}
                />
              </Badge>
            ))}
            
            {filters.locations?.map(location => (
              <Badge key={location} variant="outline" className="flex items-center gap-1">
                {locationOptions.find(l => l.value === location)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('locations', location)}
                />
              </Badge>
            ))}
            
            {filters.roles?.map(role => (
              <Badge key={role} variant="outline" className="flex items-center gap-1">
                {roleOptions.find(r => r.value === role)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('roles', role)}
                />
              </Badge>
            ))}
            
            {filters.bedrooms && filters.bedrooms !== 'any' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {bedroomOptions.find(b => b.value === filters.bedrooms)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('bedrooms')}
                />
              </Badge>
            )}
          </div>
        )}
        
        {/* Search Filter */}
        {showSearchFilter && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties, bookings, guests, or staff..."
              value={filters.search || ""}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        )}
        
        {/* Main Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {showPropertyFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Properties</label>
              <MultiSelectFilter
                options={propertyOptions}
                value={filters.properties || []}
                onChange={(value) => updateFilters({ properties: value })}
                placeholder="All properties"
                icon={Building}
              />
            </div>
          )}
          
          {showLocationFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Locations</label>
              <MultiSelectFilter
                options={locationOptions}
                value={filters.locations || []}
                onChange={(value) => updateFilters({ locations: value })}
                placeholder="All locations"
                icon={MapPin}
              />
            </div>
          )}
          
          {showRoleFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">User Roles</label>
              <MultiSelectFilter
                options={roleOptions}
                value={filters.roles || []}
                onChange={(value) => updateFilters({ roles: value })}
                placeholder="All roles"
                icon={Users}
              />
            </div>
          )}
          
          {showBedroomFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Bedrooms</label>
              <Select
                value={filters.bedrooms || "any"}
                onValueChange={(value) => updateFilters({ bedrooms: value === "any" ? undefined : value })}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {bedroomOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {showStatusFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <MultiSelectFilter
                options={statusOptions}
                value={filters.statuses || []}
                onChange={(value) => updateFilters({ statuses: value })}
                placeholder="All statuses"
                icon={FilterIcon}
              />
            </div>
          )}
        </div>
        
        {/* Date Range Filter */}
        {showDateRange && (
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilters({ dateFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilters({ dateTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}