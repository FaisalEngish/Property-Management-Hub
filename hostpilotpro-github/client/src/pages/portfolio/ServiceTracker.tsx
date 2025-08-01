import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, Clock, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ServiceTracker() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch service timeline data
  const { data: serviceTimeline, isLoading } = useQuery({
    queryKey: ["/api/portfolio/service-tracker"],
  });

  const statusOptions = ["current", "due_soon", "overdue", "completed"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current": return "bg-green-100 text-green-800";
      case "due_soon": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredServices = serviceTimeline?.filter((service: any) => {
    const matchesStatus = selectedStatus === "all" || service.status === selectedStatus;
    const matchesSearch = service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Tracker</h1>
          <p className="text-muted-foreground">
            Track recurring services and maintenance schedules
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices?.map((service: any) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                {service.serviceType}
              </CardTitle>
              <CardDescription>{service.notes}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(service.status)}>
                  {service.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm font-medium">
                  ${service.cost}
                </span>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Provider:
                  </span>
                  <span className="text-xs truncate">{service.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last Service:
                  </span>
                  <span>{service.lastServiceDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Next Due:
                  </span>
                  <span>{service.nextDueDate}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View History
                </Button>
                {service.status === "due_soon" || service.status === "overdue" ? (
                  <Button size="sm" className="flex-1">
                    Schedule Service
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1">
                    Update Schedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredServices?.length && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Services Found</h3>
            <p className="text-muted-foreground">
              No services match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}