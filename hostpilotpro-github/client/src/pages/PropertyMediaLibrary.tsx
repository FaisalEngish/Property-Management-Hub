import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Download, 
  Copy, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Tag,
  Building2,
  Star,
  DollarSign,
  Users,
  Bed,
  Bath,
  Calendar
} from "lucide-react";

interface PropertyMedia {
  id: number;
  organizationId: string;
  propertyId: number;
  mediaType: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  displayOrder: number;
  tags: string[];
  isAgentApproved: boolean;
  uploadedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

interface PropertyInternalNotes {
  id: number;
  organizationId: string;
  propertyId: number;
  category: string;
  title: string;
  content: string;
  isVisibleToAgents: boolean;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface Property {
  id: number;
  name: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  commissionRate?: number;
}

interface AgentMediaData {
  property: Property;
  media: PropertyMedia[];
  notes: PropertyInternalNotes[];
}

export default function PropertyMediaLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("media-library");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("");
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<PropertyMedia | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Determine if user is admin/PM (upload access) or agent (view-only)
  const isUploadUser = user?.role === 'admin' || user?.role === 'portfolio-manager';
  const isAgent = user?.role === 'retail-agent' || user?.role === 'referral-agent';

  // Get agent media library data (for agents) or property media (for admin/PM)
  const { data: agentMediaData, isLoading: isLoadingAgentData } = useQuery({
    queryKey: ['/api/agent-media-library', propertyStatusFilter, mediaTypeFilter],
    enabled: isAgent,
  });

  const { data: properties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    enabled: isUploadUser,
  });

  const { data: propertyMedia, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['/api/property-media', selectedProperty, mediaTypeFilter],
    enabled: isUploadUser && selectedProperty !== null,
  });

  const { data: internalNotes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['/api/property-internal-notes', selectedProperty],
    enabled: selectedProperty !== null,
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (mediaData: any) => {
      return await apiRequest("POST", "/api/property-media", mediaData);
    },
    onSuccess: () => {
      toast({
        title: "Media Uploaded",
        description: "Property media has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-media'] });
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve media mutation
  const approveMediaMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      return await apiRequest("PATCH", `/api/property-media/${mediaId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Media Approved",
        description: "Media has been approved for agent access.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-media'] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Track media access mutation
  const trackAccessMutation = useMutation({
    mutationFn: async ({ mediaId, actionType }: { mediaId: number; actionType: string }) => {
      return await apiRequest("POST", "/api/agent-media-access", { mediaId, actionType });
    },
  });

  // Create internal note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      return await apiRequest("POST", "/api/property-internal-notes", noteData);
    },
    onSuccess: () => {
      toast({
        title: "Note Created",
        description: "Internal note has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-internal-notes'] });
      setNoteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMediaAction = (media: PropertyMedia, actionType: string) => {
    if (isAgent) {
      trackAccessMutation.mutate({ mediaId: media.id, actionType });
    }

    if (actionType === 'view') {
      setSelectedMedia(media);
    } else if (actionType === 'copy' && media.mediaUrl) {
      navigator.clipboard.writeText(media.mediaUrl);
      toast({
        title: "URL Copied",
        description: "Media URL has been copied to clipboard.",
      });
    } else if (actionType === 'download' && media.mediaUrl) {
      window.open(media.mediaUrl, '_blank');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'photo': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isAgent && isLoadingAgentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isUploadUser && isLoadingProperties) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Media Library</h1>
          <p className="text-muted-foreground">
            {isAgent 
              ? "Access approved property media and marketing materials"
              : "Manage property media uploads and agent access controls"
            }
          </p>
        </div>
        
        {isUploadUser && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <UploadMediaDialog 
              properties={properties || []}
              onUpload={(data) => uploadMediaMutation.mutate(data)}
              isLoading={uploadMediaMutation.isPending}
            />
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {isAgent && (
            <TabsTrigger value="media-library">Agent Media Library</TabsTrigger>
          )}
          {isUploadUser && (
            <>
              <TabsTrigger value="upload-panel">Upload Panel</TabsTrigger>
              <TabsTrigger value="approval-queue">Approval Queue</TabsTrigger>
            </>
          )}
          <TabsTrigger value="internal-notes">Internal Notes</TabsTrigger>
        </TabsList>

        {/* Agent Media Library */}
        {isAgent && (
          <TabsContent value="media-library" className="space-y-4">
            <AgentMediaLibraryTab 
              data={agentMediaData || []}
              onMediaAction={handleMediaAction}
              mediaTypeFilter={mediaTypeFilter}
              setMediaTypeFilter={setMediaTypeFilter}
              propertyStatusFilter={propertyStatusFilter}
              setPropertyStatusFilter={setPropertyStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>
        )}

        {/* Upload Panel (Admin/PM only) */}
        {isUploadUser && (
          <TabsContent value="upload-panel" className="space-y-4">
            <UploadPanelTab 
              properties={properties || []}
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
              propertyMedia={propertyMedia || []}
              onApprove={(mediaId) => approveMediaMutation.mutate(mediaId)}
              isLoadingMedia={isLoadingMedia}
            />
          </TabsContent>
        )}

        {/* Approval Queue (Admin/PM only) */}
        {isUploadUser && (
          <TabsContent value="approval-queue" className="space-y-4">
            <ApprovalQueueTab 
              properties={properties || []}
              onApprove={(mediaId) => approveMediaMutation.mutate(mediaId)}
            />
          </TabsContent>
        )}

        {/* Internal Notes */}
        <TabsContent value="internal-notes" className="space-y-4">
          <InternalNotesTab 
            properties={isUploadUser ? properties || [] : []}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            notes={internalNotes || []}
            isUploadUser={isUploadUser}
            onCreateNote={(data) => createNoteMutation.mutate(data)}
            noteDialogOpen={noteDialogOpen}
            setNoteDialogOpen={setNoteDialogOpen}
            isLoadingNotes={isLoadingNotes}
          />
        </TabsContent>
      </Tabs>

      {/* Media Preview Dialog */}
      {selectedMedia && (
        <MediaPreviewDialog 
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}

// Agent Media Library Tab Component
function AgentMediaLibraryTab({ 
  data, 
  onMediaAction, 
  mediaTypeFilter, 
  setMediaTypeFilter,
  propertyStatusFilter,
  setPropertyStatusFilter,
  searchTerm,
  setSearchTerm
}: {
  data: AgentMediaData[];
  onMediaAction: (media: PropertyMedia, action: string) => void;
  mediaTypeFilter: string;
  setMediaTypeFilter: (value: string) => void;
  propertyStatusFilter: string;
  setPropertyStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  const filteredData = data.filter(item => {
    const matchesSearch = item.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !propertyStatusFilter || item.property.status === propertyStatusFilter;
    const hasMediaType = !mediaTypeFilter || item.media.some(m => m.mediaType === mediaTypeFilter);
    return matchesSearch && matchesStatus && hasMediaType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Properties</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter">Property Status</Label>
            <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="media-filter">Media Type</Label>
            <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Property Media Grid */}
      <div className="grid gap-6">
        {filteredData.map((item) => (
          <Card key={item.property.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {item.property.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <Badge variant={item.property.status === 'active' ? 'default' : 'secondary'}>
                      {item.property.status}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {item.property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {item.property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {item.property.maxGuests}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${item.property.pricePerNight}/night
                    </span>
                    {item.property.commissionRate && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {item.property.commissionRate}% commission
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Media Grid */}
              {item.media.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {item.media
                    .filter(media => !mediaTypeFilter || media.mediaType === mediaTypeFilter)
                    .map((media) => (
                    <Card key={media.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        {media.thumbnailUrl ? (
                          <img 
                            src={media.thumbnailUrl} 
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            {(() => {
                              switch (media.mediaType) {
                                case 'photo': return <Image className="h-8 w-8" />;
                                case 'video': return <Video className="h-8 w-8" />;
                                case 'document': return <FileText className="h-8 w-8" />;
                                default: return <FileText className="h-8 w-8" />;
                              }
                            })()}
                            <span className="text-sm">{media.mediaType}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1">{media.title}</h4>
                        {media.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {media.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {media.mediaType}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMediaAction(media, 'view')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMediaAction(media, 'copy')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMediaAction(media, 'download')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No approved media available for this property</p>
                </div>
              )}

              {/* Internal Notes (if visible to agents) */}
              {item.notes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Property Notes
                  </h4>
                  <div className="space-y-2">
                    {item.notes.map((note) => (
                      <Card key={note.id} className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">{note.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {note.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Properties Found</h3>
            <p className="text-muted-foreground">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Upload Panel Tab Component  
function UploadPanelTab({ 
  properties, 
  selectedProperty, 
  setSelectedProperty,
  propertyMedia,
  onApprove,
  isLoadingMedia 
}: {
  properties: Property[];
  selectedProperty: number | null;
  setSelectedProperty: (id: number | null) => void;
  propertyMedia: PropertyMedia[];
  onApprove: (mediaId: number) => void;
  isLoadingMedia: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Property Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to view and manage its media</CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedProperty?.toString() || ""} 
            onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Property Media */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle>Property Media</CardTitle>
            <CardDescription>Manage media files for this property</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMedia ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : propertyMedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyMedia.map((media) => (
                  <Card key={media.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {media.thumbnailUrl ? (
                        <img 
                          src={media.thumbnailUrl} 
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {(() => {
                            switch (media.mediaType) {
                              case 'photo': return <Image className="h-8 w-8" />;
                              case 'video': return <Video className="h-8 w-8" />;
                              case 'document': return <FileText className="h-8 w-8" />;
                              default: return <FileText className="h-8 w-8" />;
                            }
                          })()}
                          <span className="text-sm">{media.mediaType}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{media.title}</h4>
                        <Badge 
                          variant={media.isAgentApproved ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {media.isAgentApproved ? (
                            <><Check className="h-3 w-3 mr-1" />Approved</>
                          ) : (
                            <><X className="h-3 w-3 mr-1" />Pending</>
                          )}
                        </Badge>
                      </div>
                      {media.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {media.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {media.mediaType}
                          </Badge>
                          {media.fileSize && (
                            <span className="text-xs text-muted-foreground">
                              {(media.fileSize / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                        </div>
                        {!media.isAgentApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApprove(media.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Media Uploaded</h3>
                <p>Upload media files for this property to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Approval Queue Tab Component
function ApprovalQueueTab({ 
  properties, 
  onApprove 
}: {
  properties: Property[];
  onApprove: (mediaId: number) => void;
}) {
  const { data: pendingMedia, isLoading } = useQuery({
    queryKey: ['/api/property-media', null, null, false], // isAgentApproved = false
  });

  const pendingMediaWithProperty = pendingMedia?.map((media: PropertyMedia) => {
    const property = properties.find(p => p.id === media.propertyId);
    return { ...media, property };
  }) || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>Media uploads waiting for approval to be visible to agents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : pendingMediaWithProperty.length > 0 ? (
            <div className="space-y-4">
              {pendingMediaWithProperty.map((media: any) => (
                <Card key={media.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      {media.thumbnailUrl ? (
                        <img 
                          src={media.thumbnailUrl} 
                          alt={media.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          {(() => {
                            switch (media.mediaType) {
                              case 'photo': return <Image className="h-6 w-6" />;
                              case 'video': return <Video className="h-6 w-6" />;
                              case 'document': return <FileText className="h-6 w-6" />;
                              default: return <FileText className="h-6 w-6" />;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{media.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {media.property?.name || `Property ${media.propertyId}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{media.mediaType}</Badge>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </div>
                      {media.description && (
                        <p className="text-sm text-muted-foreground mb-3">{media.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Uploaded: {new Date(media.createdAt).toLocaleDateString()}</span>
                          {media.fileSize && (
                            <span>Size: {(media.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          )}
                          {media.tags.length > 0 && (
                            <div className="flex gap-1">
                              {media.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onApprove(media.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve for Agents
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No Pending Approvals</h3>
              <p>All uploaded media has been reviewed and approved.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Internal Notes Tab Component
function InternalNotesTab({ 
  properties, 
  selectedProperty, 
  setSelectedProperty,
  notes,
  isUploadUser,
  onCreateNote,
  noteDialogOpen,
  setNoteDialogOpen,
  isLoadingNotes
}: {
  properties: Property[];
  selectedProperty: number | null;
  setSelectedProperty: (id: number | null) => void;
  notes: PropertyInternalNotes[];
  isUploadUser: boolean;
  onCreateNote: (data: any) => void;
  noteDialogOpen: boolean;
  setNoteDialogOpen: (open: boolean) => void;
  isLoadingNotes: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Property Selector (for admin/PM) */}
      {isUploadUser && (
        <Card>
          <CardHeader>
            <CardTitle>Select Property</CardTitle>
            <CardDescription>Choose a property to view and manage internal notes</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Select 
                value={selectedProperty?.toString() || ""} 
                onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProperty && (
              <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <CreateNoteDialog 
                  propertyId={selectedProperty}
                  onCreate={onCreateNote}
                />
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Property-specific notes and information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNotes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()} • {note.createdBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.category}</Badge>
                        <Badge variant={note.isVisibleToAgents ? "default" : "secondary"}>
                          {note.isVisibleToAgents ? (
                            <><Eye className="h-3 w-3 mr-1" />Visible to Agents</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" />Internal Only</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Notes Available</h3>
                <p>
                  {isUploadUser 
                    ? "Create internal notes to track important property information."
                    : "No notes are currently visible for this property."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Upload Media Dialog Component
function UploadMediaDialog({ 
  properties, 
  onUpload, 
  isLoading 
}: {
  properties: Property[];
  onUpload: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    propertyId: '',
    mediaType: '',
    title: '',
    description: '',
    mediaUrl: '',
    thumbnailUrl: '',
    fileSize: '',
    mimeType: '',
    displayOrder: '0',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      propertyId: parseInt(formData.propertyId),
      fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
      displayOrder: parseInt(formData.displayOrder),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onUpload(data);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Upload Property Media</DialogTitle>
        <DialogDescription>
          Add new media files for property marketing and agent access
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="property">Property</Label>
            <Select 
              value={formData.propertyId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mediaType">Media Type</Label>
            <Select 
              value={formData.mediaType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Media title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Media description..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="mediaUrl">Media URL</Label>
          <Input
            id="mediaUrl"
            value={formData.mediaUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, mediaUrl: e.target.value }))}
            placeholder="https://..."
            required
          />
        </div>

        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
          <Input
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fileSize">File Size (MB)</Label>
            <Input
              id="fileSize"
              type="number"
              value={formData.fileSize}
              onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="mimeType">MIME Type</Label>
            <Input
              id="mimeType"
              value={formData.mimeType}
              onChange={(e) => setFormData(prev => ({ ...prev, mimeType: e.target.value }))}
              placeholder="image/jpeg"
            />
          </div>
          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="marketing, exterior, interior..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Create Note Dialog Component
function CreateNoteDialog({ 
  propertyId, 
  onCreate 
}: {
  propertyId: number;
  onCreate: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    category: 'general',
    title: '',
    content: '',
    isVisibleToAgents: false,
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      propertyId,
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onCreate(data);
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create Internal Note</DialogTitle>
        <DialogDescription>
          Add an internal note for this property
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="guest-info">Guest Information</SelectItem>
                <SelectItem value="access">Access Instructions</SelectItem>
                <SelectItem value="amenities">Amenities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visible-to-agents"
              checked={formData.isVisibleToAgents}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisibleToAgents: checked }))}
            />
            <Label htmlFor="visible-to-agents">Visible to Agents</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Note title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Note content..."
            rows={5}
            required
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="important, wifi-password, cleaning..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Media Preview Dialog Component
function MediaPreviewDialog({ 
  media, 
  onClose 
}: {
  media: PropertyMedia;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{media.title}</DialogTitle>
          <DialogDescription>
            {media.mediaType} • Uploaded {new Date(media.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Media Display */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {media.mediaType === 'photo' && media.mediaUrl ? (
              <img 
                src={media.mediaUrl} 
                alt={media.title}
                className="w-full h-full object-contain"
              />
            ) : media.mediaType === 'video' && media.mediaUrl ? (
              <video 
                src={media.mediaUrl} 
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">{media.title}</p>
                  <p className="text-muted-foreground">{media.mediaType} file</p>
                  {media.mediaUrl && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(media.mediaUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Open File
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Media Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{media.mediaType}</Badge>
                </div>
                {media.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{(media.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                )}
                {media.mimeType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>{media.mimeType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={media.isAgentApproved ? "default" : "secondary"}>
                    {media.isAgentApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {media.description || 'No description provided'}
              </p>
              {media.tags.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {media.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {media.mediaUrl && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(media.mediaUrl);
                    // Toast would be shown here
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(media.mediaUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}