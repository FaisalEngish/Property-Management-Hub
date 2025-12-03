import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

import TopBar from "@/components/TopBar";
import PropertyCard from "@/components/PropertyCard";
import CreatePropertyDialog from "@/components/CreatePropertyDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryKeys, invalidatePropertyQueries } from "@/lib/queryKeys";

export default function Properties() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Set<number>>(
    new Set(),
  );
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: queryKeys.properties.all(),
  });

  // Guard: ensure array
  const propertiesArray = Array.isArray(properties) ? properties : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      invalidatePropertyQueries(queryClient);
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      setSelectedProperties(new Set());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/properties/${id}`)),
      );
    },
    onSuccess: () => {
      invalidatePropertyQueries(queryClient);
      toast({
        title: "Success",
        description: "Selected properties deleted",
      });
      setSelectedProperties(new Set());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Bulk delete failed",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProperty = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProperties.size === 0) return;
    if (
      window.confirm(`Delete ${selectedProperties.size} selected properties?`)
    ) {
      bulkDeleteMutation.mutate(Array.from(selectedProperties));
    }
  };

  const handleSelectProperty = (id: number, selected: boolean) => {
    setSelectedProperties((prev) => {
      const newSet = new Set(prev);
      if (selected) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleViewDetails = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  // simple client-side search (name/location/id etc.)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return propertiesArray;
    return propertiesArray.filter((p: any) => {
      if (!p) return false;
      const hay = [p.name, p.title, p.location, p.address, String(p.id)]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [propertiesArray, query]);

  return (
    <>
      <TopBar
        title="Properties"
        action={
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        }
      />

      {/* center container */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="property-search" className="sr-only">
                Search properties
              </label>
              <div className="relative w-full sm:w-[420px]">
                <input
                  id="property-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, location or id..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {selectedProperties.size > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {selectedProperties.size} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* small meta + actions */}
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600 hidden sm:block">
                {isLoading
                  ? "Loading…"
                  : `${filtered.length} of ${propertiesArray.length} properties`}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // quick select all visible
                    const ids = filtered
                      .map((p: any) => p?.id)
                      .filter(Boolean) as number[];
                    setSelectedProperties(new Set(ids));
                  }}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="hidden sm:inline-flex bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 h-56 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-lg py-16 flex flex-col items-center justify-center gap-4">
              <div className="text-3xl">🏠</div>
              <h3 className="text-lg font-semibold text-slate-800">
                No properties found
              </h3>
              <p className="text-sm text-slate-500 max-w-xl text-center">
                Try adding your first property or clear the search/filter to
                show results.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered
                .filter(
                  (property, index, self) =>
                    property &&
                    property.id &&
                    self.findIndex((p) => p.id === property.id) === index,
                )
                .map((property: any) => (
                  <PropertyCard
                    key={`property-${property.id}`}
                    property={property}
                    isSelected={selectedProperties.has(property.id)}
                    onSelect={(selected) =>
                      handleSelectProperty(property.id, selected)
                    }
                    onViewDetails={() => handleViewDetails(property.id)}
                    onDelete={() => handleDeleteProperty(property.id)}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

      <CreatePropertyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}
