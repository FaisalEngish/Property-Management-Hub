import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Filter,
  X,
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";

interface PropertyFiltersState {
  search: string;
  location: string;
  status: string;
  propertyType: string;
  occupancyMin: number;
  occupancyMax: number;
  roiMin: number;
  roiMax: number;
  hasMaintenanceTasks: boolean;
  lastBookingFrom: string;
  lastBookingTo: string;
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
  filteredCount,
}: PropertyFiltersProps) {
  const [openAdvanced, setOpenAdvanced] = React.useState(false);

  const update = (k: keyof PropertyFiltersState, v: any) =>
    onFiltersChange({ ...filters, [k]: v });

  const clearAll = () =>
    onFiltersChange({
      search: "",
      location: "",
      status: "",
      propertyType: "",
      occupancyMin: 0,
      occupancyMax: 100,
      roiMin: 0,
      roiMax: 50,
      hasMaintenanceTasks: false,
      lastBookingFrom: "",
      lastBookingTo: "",
    });

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.occupancyMin > 0 || filters.occupancyMax < 100 ? 1 : 0) +
    (filters.roiMin > 0 || filters.roiMax < 50 ? 1 : 0) +
    (filters.hasMaintenanceTasks ? 1 : 0) +
    (filters.lastBookingFrom || filters.lastBookingTo ? 1 : 0);

  return (
    <Card className="mb-6 bg-gradient-to-br from-white/60 to-slate-50/40 border-slate-200/40 shadow-sm">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Filter className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold truncate text-slate-800">
                Property Filters
              </CardTitle>
              <div className="text-xs text-slate-500">
                {filteredCount} / {totalProperties} shown
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px]">
                    {activeCount} active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // quick export (mock)
                const csv = "name,location,status\n";
                const blob = new Blob([csv], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "properties.csv";
                a.click();
              }}
            >
              📊 Export
            </Button>

            <Button size="sm" variant="ghost" onClick={() => window.print()}>
              📋 Print
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                activeCount ? clearAll() : setOpenAdvanced((s) => !s)
              }
            >
              {activeCount ? (
                <span className="flex items-center gap-2">
                  <X className="h-4 w-4" /> Clear
                </span>
              ) : (
                <span className="text-sm">
                  {openAdvanced ? "Close" : "Advanced"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {/* compact toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
          <div className="col-span-1 sm:col-span-2">
            <Input
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="w-full bg-white/80"
            />
          </div>

          <div className="flex gap-2 items-center justify-end">
            <Select
              value={filters.location || "all"}
              onValueChange={(v) => update("location", v === "all" ? "" : v)}
            >
              <SelectTrigger className="min-w-[120px] text-sm">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="chaweng">Chaweng</SelectItem>
                <SelectItem value="lamai">Lamai</SelectItem>
                <SelectItem value="bophut">Bophut</SelectItem>
                <SelectItem value="maenam">Maenam</SelectItem>
                <SelectItem value="bangrak">Bang Rak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* advanced area (collapsible) */}
        <div
          className={`mt-3 grid gap-3 ${
            openAdvanced ? "grid-cols-1 md:grid-cols-3" : "hidden"
          }`}
        >
          {/* Status & Type */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Status & Type
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || "all"}
                onValueChange={(v) => update("status", v === "all" ? "" : v)}
              >
                <SelectTrigger className="min-w-[140px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.propertyType || "all"}
                onValueChange={(v) =>
                  update("propertyType", v === "all" ? "" : v)
                }
              >
                <SelectTrigger className="min-w-[140px] text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Occupancy & ROI */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Occupancy & ROI
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={filters.occupancyMin}
                onChange={(e) =>
                  update("occupancyMin", parseInt(e.target.value) || 0)
                }
                className="w-20 text-sm"
                placeholder="Min %"
              />
              <Input
                type="number"
                value={filters.occupancyMax}
                onChange={(e) =>
                  update("occupancyMax", parseInt(e.target.value) || 100)
                }
                className="w-20 text-sm"
                placeholder="Max %"
              />
              <Input
                type="number"
                value={filters.roiMin}
                onChange={(e) =>
                  update("roiMin", parseInt(e.target.value) || 0)
                }
                className="w-20 text-sm"
                placeholder="ROI Min"
              />
              <Input
                type="number"
                value={filters.roiMax}
                onChange={(e) =>
                  update("roiMax", parseInt(e.target.value) || 50)
                }
                className="w-20 text-sm"
                placeholder="ROI Max"
              />
            </div>
          </div>

          {/* Date & Maintenance */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Last Booking
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.lastBookingFrom}
                onChange={(e) => update("lastBookingFrom", e.target.value)}
                className="text-sm"
              />
              <Input
                type="date"
                value={filters.lastBookingTo}
                onChange={(e) => update("lastBookingTo", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hasMaintenanceTasks}
                  onChange={(e) =>
                    update("hasMaintenanceTasks", e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <span>Has maintenance</span>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenAdvanced(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // basic apply already handled by controlled props
                    setOpenAdvanced(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* active filter chips */}
        {activeCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.search && (
              <Badge className="flex items-center gap-2">
                Search: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => update("search", "")}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {filters.location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => update("location", "")}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge className="flex items-center gap-2">
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => update("status", "")}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PropertyFilters;
