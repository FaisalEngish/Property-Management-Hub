import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Eye, Edit, Trash2, Download, Wand2, Languages, Target, BarChart3, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MarketingPack {
  id: number;
  organizationId: string;
  propertyId: number;
  propertyName: string;
  generatedBy: string;
  pdfUrl?: string;
  aiSummary: string;
  packType: string;
  targetAudience: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: number;
  name: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  pricePerNight: number;
}

export default function MarketingPackManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<MarketingPack | null>(null);
  const [bulkGenerateDialogOpen, setBulkGenerateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [packTypeFilter, setPackTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch marketing packs
  const { data: marketingPacks = [], isLoading: packsLoading } = useQuery<MarketingPack[]>({
    queryKey: ["/api/marketing-packs"],
  });

  // Fetch properties for dropdowns
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch analytics
  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/marketing-packs/analytics"],
  });

  // Create marketing pack mutation
  const createPackMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/marketing-packs", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Marketing pack created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-packs"] });
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create marketing pack",
        variant: "destructive",
      });
    },
  });

  // Delete marketing pack mutation
  const deletePackMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/marketing-packs/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Marketing pack deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-packs"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete marketing pack",
        variant: "destructive",
      });
    },
  });

  // Bulk generate mutation
  const bulkGenerateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/marketing-packs/bulk-generate", data),
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-packs"] });
      setBulkGenerateDialogOpen(false);
      setSelectedPropertyIds([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to bulk generate marketing packs",
        variant: "destructive",
      });
    },
  });

  const handleCreatePack = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const packData = {
      propertyId: parseInt(formData.get("propertyId") as string),
      packType: formData.get("packType") as string,
      targetAudience: formData.get("targetAudience") as string,
      language: formData.get("language") as string,
      status: "draft",
    };

    createPackMutation.mutate(packData);
  };

  const handleBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const bulkData = {
      propertyIds: selectedPropertyIds,
      packType: formData.get("packType") as string,
      targetAudience: formData.get("targetAudience") as string,
      language: formData.get("language") as string,
    };

    bulkGenerateMutation.mutate(bulkData);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "generated": return "secondary";
      case "draft": return "outline";
      case "archived": return "destructive";
      default: return "outline";
    }
  };

  const getPackTypeIcon = (packType: string) => {
    switch (packType) {
      case "luxury": return "💎";
      case "premium": return "⭐";
      case "standard": return "📄";
      case "agent-focused": return "🏢";
      default: return "📦";
    }
  };

  // Filter packs
  const filteredPacks = marketingPacks.filter((pack: MarketingPack) => {
    const matchesStatus = statusFilter === "all" || pack.status === statusFilter;
    const matchesPackType = packTypeFilter === "all" || pack.packType === packTypeFilter;
    const matchesSearch = !searchQuery || 
      pack.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.packType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPackType && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Pack Management</h1>
          <p className="text-muted-foreground">
            Generate and manage AI-powered marketing materials for your properties
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setBulkGenerateDialogOpen(true)} variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pack
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packs">Marketing Packs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Packs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalPacks || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all properties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Badge variant="default" className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.statusDistribution?.published || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for use
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generated</CardTitle>
                <Wand2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.statusDistribution?.generated || 0}</div>
                <p className="text-xs text-muted-foreground">
                  AI generated content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.statusDistribution?.draft || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Work in progress
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pack Type Distribution</CardTitle>
                <CardDescription>Distribution of marketing pack types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.packTypeDistribution?.map((item: any) => (
                    <div key={item.packType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPackTypeIcon(item.packType)}</span>
                        <span className="capitalize">{item.packType}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Audience Distribution</CardTitle>
                <CardDescription>Marketing focus by audience type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.audienceDistribution?.map((item: any) => (
                    <div key={item.audience} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{item.audience}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packs" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search packs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packTypeFilter} onValueChange={setPackTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="agent-focused">Agent-Focused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacks.map((pack: MarketingPack) => (
              <Card key={pack.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        <span className="mr-2">{getPackTypeIcon(pack.packType)}</span>
                        {pack.propertyName}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {pack.packType} • {pack.targetAudience}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(pack.status)}>
                      {pack.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Languages className="h-4 w-4" />
                      <span className="uppercase">{pack.language}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {pack.aiSummary?.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPack(pack);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {pack.pdfUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={pack.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePackMutation.mutate(pack.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPacks.length === 0 && !packsLoading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No marketing packs found</h3>
              <p className="text-muted-foreground">
                Create your first marketing pack to get started.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Language Distribution
                </CardTitle>
                <CardDescription>Marketing packs by language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.languageDistribution?.map((item: any) => (
                    <div key={item.language} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="uppercase">{item.language}</span>
                      </div>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Pack creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.monthlyTrends?.map((item: any) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(item.month).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <Badge variant="outline">{item.count} packs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Marketing Pack Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Marketing Pack</DialogTitle>
            <DialogDescription>
              Generate AI-powered marketing materials for your property.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePack} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property</Label>
              <Select name="propertyId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.bedrooms}BR
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packType">Pack Type</Label>
              <Select name="packType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select pack type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="agent-focused">Agent-Focused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select name="targetAudience" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="families">Families</SelectItem>
                  <SelectItem value="couples">Couples</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select name="language" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="th">Thai</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createPackMutation.isPending}>
                {createPackMutation.isPending ? "Creating..." : "Create Pack"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Marketing Pack Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{getPackTypeIcon(selectedPack?.packType || "")}</span>
              {selectedPack?.propertyName} - {selectedPack?.packType}
            </DialogTitle>
            <DialogDescription>
              Generated for {selectedPack?.targetAudience} audience in {selectedPack?.language?.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedPack && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={getStatusBadgeVariant(selectedPack.status)}>
                  {selectedPack.status}
                </Badge>
                <Badge variant="outline">
                  {selectedPack.language?.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>AI Generated Content</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedPack.aiSummary}</pre>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(selectedPack.createdAt).toLocaleDateString()}
                {selectedPack.updatedAt !== selectedPack.createdAt && (
                  <>
                    {" • "}
                    Updated: {new Date(selectedPack.updatedAt).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkGenerateDialogOpen} onOpenChange={setBulkGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Generate Marketing Packs</DialogTitle>
            <DialogDescription>
              Generate marketing packs for multiple properties at once.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Properties</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                {properties.map((property) => (
                  <label key={property.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPropertyIds([...selectedPropertyIds, property.id]);
                        } else {
                          setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== property.id));
                        }
                      }}
                    />
                    <span className="text-sm">{property.name} - {property.bedrooms}BR</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPropertyIds.length} properties selected
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packType">Pack Type</Label>
              <Select name="packType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select pack type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="agent-focused">Agent-Focused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select name="targetAudience" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="families">Families</SelectItem>
                  <SelectItem value="couples">Couples</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select name="language" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="th">Thai</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={bulkGenerateMutation.isPending || selectedPropertyIds.length === 0}
              >
                {bulkGenerateMutation.isPending ? "Generating..." : `Generate ${selectedPropertyIds.length} Packs`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}