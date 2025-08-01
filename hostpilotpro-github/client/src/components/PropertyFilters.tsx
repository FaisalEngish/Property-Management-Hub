import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Filter, X, MapPin, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface PropertyFiltersState {
  search: string;
  location: string;
  status: string;
  occupancyMin: number;
  occupancyMax: number;
  roiMin: number;
  roiMax: number;
  hasMaintenanceTasks: boolean;
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  onFiltersChange: (filters: PropertyFiltersState) => void;
  totalProperties: number;
  filteredCount: number;
}

export function PropertyFilters({ 
  filters, 
  onFiltersChange, 
  totalProperties, 
  filteredCount 
}: PropertyFiltersProps) {
  const updateFilter = (key: keyof PropertyFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      location: '',
      status: '',
      occupancyMin: 0,
      occupancyMax: 100,
      roiMin: 0,
      roiMax: 50,
      hasMaintenanceTasks: false,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.status) count++;
    if (filters.occupancyMin > 0 || filters.occupancyMax < 100) count++;
    if (filters.roiMin > 0 || filters.roiMax < 50) count++;
    if (filters.hasMaintenanceTasks) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Property Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Showing {filteredCount} of {totalProperties} properties
            </span>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="flex-1"
          />
          
          <Select value={filters.location || 'all'} onValueChange={(value) => updateFilter('location', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="chaweng">Chaweng</SelectItem>
              <SelectItem value="lamai">Lamai</SelectItem>
              <SelectItem value="bophut">Bophut</SelectItem>
              <SelectItem value="maenam">Maenam</SelectItem>
              <SelectItem value="bangrak">Bang Rak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant={filters.hasMaintenanceTasks ? "default" : "outline"}
            onClick={() => updateFilter('hasMaintenanceTasks', !filters.hasMaintenanceTasks)}
            className="justify-start"
          >
            Has Maintenance Tasks
          </Button>
        </div>

        {/* Advanced Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Occupancy Rate Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <label className="text-sm font-medium">
                Occupancy Rate: {filters.occupancyMin}% - {filters.occupancyMax}%
              </label>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={filters.occupancyMin}
                onChange={(e) => updateFilter('occupancyMin', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-20"
              />
              <span className="flex items-center">to</span>
              <Input
                type="number"
                value={filters.occupancyMax}
                onChange={(e) => updateFilter('occupancyMax', parseInt(e.target.value) || 100)}
                min={0}
                max={100}
                className="w-20"
              />
            </div>
          </div>

          {/* ROI Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <label className="text-sm font-medium">
                ROI: {filters.roiMin}% - {filters.roiMax}%
              </label>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={filters.roiMin}
                onChange={(e) => updateFilter('roiMin', parseInt(e.target.value) || 0)}
                min={0}
                max={50}
                className="w-20"
              />
              <span className="flex items-center">to</span>
              <Input
                type="number"
                value={filters.roiMax}
                onChange={(e) => updateFilter('roiMax', parseInt(e.target.value) || 50)}
                min={0}
                max={50}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('search', '')}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('location', '')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', '')}
                />
              </Badge>
            )}
            {(filters.occupancyMin > 0 || filters.occupancyMax < 100) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Occupancy: {filters.occupancyMin}%-{filters.occupancyMax}%
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    updateFilter('occupancyMin', 0);
                    updateFilter('occupancyMax', 100);
                  }}
                />
              </Badge>
            )}
            {(filters.roiMin > 0 || filters.roiMax < 50) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ROI: {filters.roiMin}%-{filters.roiMax}%
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    updateFilter('roiMin', 0);
                    updateFilter('roiMax', 50);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;