import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Filter, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface FilterOptions {
  properties: { id: number; name: string }[];
  departments: string[];
  costCenters: string[];
  budgetCategories: string[];
  businessUnits: string[];
  types: string[];
  categories: string[];
  channelSources: string[];
  revenueStreams: string[];
  statuses: string[];
  tags: string[];
  dateRange: {
    earliest: string;
    latest: string;
  };
}

interface FilterValues {
  propertyId?: string;
  department?: string;
  costCenter?: string;
  budgetCategory?: string;
  businessUnit?: string;
  type?: string;
  category?: string;
  channelSource?: string;
  revenueStream?: string;
  status?: string;
  dateStart?: Date;
  dateEnd?: Date;
  tags?: string[];
  fiscalYear?: number;
  minAmount?: number;
  maxAmount?: number;
}

interface AdvancedFinanceFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  onReset: () => void;
  loading?: boolean;
}

export default function AdvancedFinanceFilters({
  onFiltersChange,
  onReset,
  loading = false
}: AdvancedFinanceFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/finance/filter-options");
        if (response.ok) {
          const options = await response.json();
          setFilterOptions(options);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update applied filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== "";
    }).length;
    setAppliedFiltersCount(count);
  }, [filters]);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: keyof FilterValues) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
    onReset();
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = (filters.tags || []).filter(tag => tag !== tagToRemove);
    updateFilter('tags', updatedTags.length > 0 ? updatedTags : undefined);
  };

  if (!filterOptions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading filter options...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {appliedFiltersCount > 0 && (
              <Badge variant="secondary">
                {appliedFiltersCount} applied
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {appliedFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Property Filter */}
          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            <Select value={filters.propertyId || ""} onValueChange={(value) => updateFilter('propertyId', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Properties</SelectItem>
                {filterOptions.properties.map(property => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={filters.type || ""} onValueChange={(value) => updateFilter('type', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {filterOptions.types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={filters.department || ""} onValueChange={(value) => updateFilter('department', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {filterOptions.departments.map(department => (
                  <SelectItem key={department} value={department}>
                    {department.charAt(0).toUpperCase() + department.slice(1).replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateStart ? format(filters.dateStart, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateStart}
                  onSelect={(date) => updateFilter('dateStart', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateEnd ? format(filters.dateEnd, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateEnd}
                  onSelect={(date) => updateFilter('dateEnd', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Applied Filters Display */}
        {appliedFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Applied Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.propertyId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Property: {filterOptions.properties.find(p => p.id.toString() === filters.propertyId)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('propertyId')} />
                </Badge>
              )}
              {filters.department && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Department: {filters.department}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('department')} />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Type: {filters.type}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('type')} />
                </Badge>
              )}
              {filters.dateStart && (
                <Badge variant="outline" className="flex items-center gap-1">
                  From: {format(filters.dateStart, "MMM dd")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('dateStart')} />
                </Badge>
              )}
              {filters.dateEnd && (
                <Badge variant="outline" className="flex items-center gap-1">
                  To: {format(filters.dateEnd, "MMM dd")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter('dateEnd')} />
                </Badge>
              )}
              {filters.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  Tag: {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Business Intelligence Filters */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Business Intelligence</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cost Center</Label>
                  <Select value={filters.costCenter || ""} onValueChange={(value) => updateFilter('costCenter', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cost Centers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cost Centers</SelectItem>
                      {filterOptions.costCenters.map(center => (
                        <SelectItem key={center} value={center}>
                          {center}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget Category</Label>
                  <Select value={filters.budgetCategory || ""} onValueChange={(value) => updateFilter('budgetCategory', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {filterOptions.budgetCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business Unit</Label>
                  <Select value={filters.businessUnit || ""} onValueChange={(value) => updateFilter('businessUnit', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Business Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Business Units</SelectItem>
                      {filterOptions.businessUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Revenue & Channel Filters */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Revenue & Channels</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Channel Source</Label>
                  <Select value={filters.channelSource || ""} onValueChange={(value) => updateFilter('channelSource', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Channels</SelectItem>
                      {filterOptions.channelSources.map(channel => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Revenue Stream</Label>
                  <Select value={filters.revenueStream || ""} onValueChange={(value) => updateFilter('revenueStream', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Streams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Streams</SelectItem>
                      {filterOptions.revenueStreams.map(stream => (
                        <SelectItem key={stream} value={stream}>
                          {stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Amount Range Filter */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Amount Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ""}
                    onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maximum Amount</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxAmount || ""}
                    onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Additional Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category || ""} onValueChange={(value) => updateFilter('category', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {filterOptions.categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status || ""} onValueChange={(value) => updateFilter('status', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      {filterOptions.statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}