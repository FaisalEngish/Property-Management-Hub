/**
 * Admin Finance Filters Component
 * Shared filtering functionality for all finance tabs
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { FinancialFilters } from "@/pages/AdminFinance";

interface AdminFinanceFiltersProps {
  filters: FinancialFilters;
  onFiltersChange: (filters: FinancialFilters) => void;
}

export function AdminFinanceFilters({ 
  filters, 
  onFiltersChange 
}: AdminFinanceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FinancialFilters>(filters);

  // Fetch properties for filter options
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    select: (data: any) => data || []
  });

  // Fetch users for stakeholder filters
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    select: (data: any) => data || []
  });

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: FinancialFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const propertyManagers = users.filter((user: any) => 
    user.role === 'portfolio-manager' || user.role === 'admin'
  );

  const agents = users.filter((user: any) => 
    user.role === 'retail-agent' || user.role === 'referral-agent'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.startDate ? (
                  format(localFilters.startDate, "MMM dd, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.startDate}
                onSelect={(date) =>
                  setLocalFilters({ ...localFilters, startDate: date })
                }
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
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.endDate ? (
                  format(localFilters.endDate, "MMM dd, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.endDate}
                onSelect={(date) =>
                  setLocalFilters({ ...localFilters, endDate: date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Properties Filter */}
        <div className="space-y-2">
          <Label>Properties</Label>
          <Select
            value={localFilters.propertyIds?.join(',') || ''}
            onValueChange={(value) => {
              if (value) {
                setLocalFilters({
                  ...localFilters,
                  propertyIds: value.split(',').map(Number)
                });
              } else {
                setLocalFilters({
                  ...localFilters,
                  propertyIds: undefined
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Properties</SelectItem>
              {properties.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stakeholders Filter */}
        <div className="space-y-2">
          <Label>Stakeholders</Label>
          <Select
            value={localFilters.stakeholderIds?.join(',') || ''}
            onValueChange={(value) => {
              if (value) {
                setLocalFilters({
                  ...localFilters,
                  stakeholderIds: value.split(',')
                });
              } else {
                setLocalFilters({
                  ...localFilters,
                  stakeholderIds: undefined
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Stakeholders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stakeholders</SelectItem>
              
              {propertyManagers.length > 0 && (
                <>
                  <SelectItem value="" disabled>Property Managers</SelectItem>
                  {propertyManagers.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </>
              )}
              
              {agents.length > 0 && (
                <>
                  <SelectItem value="" disabled>Agents</SelectItem>
                  {agents.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Date Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            setLocalFilters({
              ...localFilters,
              startDate: startOfMonth,
              endDate: now
            });
          }}
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            setLocalFilters({
              ...localFilters,
              startDate: startOfLastMonth,
              endDate: endOfLastMonth
            });
          }}
        >
          Last Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            setLocalFilters({
              ...localFilters,
              startDate: startOfQuarter,
              endDate: now
            });
          }}
        >
          This Quarter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            setLocalFilters({
              ...localFilters,
              startDate: startOfYear,
              endDate: now
            });
          }}
        >
          This Year
        </Button>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}