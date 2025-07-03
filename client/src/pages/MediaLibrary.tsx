import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Camera, 
  Upload, 
  FolderPlus, 
  Settings,
  Eye,
  Download,
  Share2,
  Users,
  Shield,
  Clock,
  Activity,
  FileImage,
  FileVideo,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Tags,
  BarChart3
} from "lucide-react";

// Form schemas
const mediaFileSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mediaType: z.enum(["photo", "video", "floor_plan", "pdf_brochure", "drone_footage", "360_tour"]),
  description: z.string().optional(),
  cloudLink: z.string().url("Must be a valid URL"),
  cloudProvider: z.enum(["google_drive", "dropbox", "onedrive", "direct_url"]).default("google_drive"),
  thumbnailUrl: z.string().url().optional(),
  propertyId: z.number(),
  accessLevel: z.enum(["private", "agent_approved", "public", "unbranded"]).default("private"),
  tags: z.array(z.string()).default([]),
  isAgentApproved: z.boolean().default(false),
  isUnbranded: z.boolean().default(false),
  expiryDate: z.string().optional(),
});

const folderSchema = z.object({
  folderName: z.string().min(1, "Folder name is required"),
  folderDescription: z.string().optional(),
  propertyId: z.number(),
  cloudFolderLink: z.string().url().optional(),
  cloudProvider: z.enum(["google_drive", "dropbox", "onedrive"]).default("google_drive"),
  accessLevel: z.enum(["private", "agent_approved", "public"]).default("private"),
  isAgentApproved: z.boolean().default(false),
});

type MediaFileFormData = z.infer<typeof mediaFileSchema>;
type FolderFormData = z.infer<typeof folderSchema>;

export default function MediaLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("files");
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [accessLevelFilter, setAccessLevelFilter] = useState<string>("all");
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // Query for properties
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Query for media files
  const { data: mediaFiles = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/media/files", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/media/files${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Query for media folders
  const { data: mediaFolders = [] } = useQuery({
    queryKey: ["/api/media/folders", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/media/folders${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Query for media stats
  const { data: mediaStats = {} } = useQuery({
    queryKey: ["/api/media/stats"],
  });

  // Query for AI suggestions
  const { data: aiSuggestions = [] } = useQuery({
    queryKey: ["/api/media/ai-suggestions", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/media/ai-suggestions${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Query for analytics
  const { data: mediaAnalytics = [] } = useQuery({
    queryKey: ["/api/media/analytics", selectedProperty],
    queryFn: () => apiRequest("GET", `/api/media/analytics${selectedProperty ? `?propertyId=${selectedProperty}` : ""}`),
  });

  // Query for access logs (admin/PM only)
  const { data: accessLogs = [] } = useQuery({
    queryKey: ["/api/media/access-logs"],
    enabled: user?.role && ["admin", "portfolio-manager"].includes(user.role),
  });

  // Query for agent accessible media (agents only)
  const { data: agentMedia = [] } = useQuery({
    queryKey: ["/api/media/agent-accessible"],
    enabled: user?.role && ["referral-agent", "retail-agent"].includes(user.role),
  });

  // Mutations
  const createFileMutation = useMutation({
    mutationFn: async (data: MediaFileFormData) => {
      return apiRequest("POST", "/api/media/files", data);
    },
    onSuccess: () => {
      toast({ title: "Media file uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/stats"] });
      setIsFileDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MediaFileFormData> }) => {
      return apiRequest("PUT", `/api/media/files/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Media file updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/media/files/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Media file deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: FolderFormData) => {
      return apiRequest("POST", "/api/media/folders", data);
    },
    onSuccess: () => {
      toast({ title: "Folder created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/media/folders"] });
      setIsFolderDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logAccessMutation = useMutation({
    mutationFn: async ({ id, type, reason }: { id: number; type: string; reason?: string }) => {
      return apiRequest("GET", `/api/media/access/${id}?type=${type}&reason=${reason || ""}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/analytics"] });
    },
  });

  // Forms
  const fileForm = useForm<MediaFileFormData>({
    resolver: zodResolver(mediaFileSchema),
    defaultValues: {
      mediaType: "photo",
      cloudProvider: "google_drive",
      accessLevel: "private",
      tags: [],
      isAgentApproved: false,
      isUnbranded: false,
    },
  });

  const folderForm = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      cloudProvider: "google_drive",
      accessLevel: "private",
      isAgentApproved: false,
    },
  });

  // Filter media files based on search and filters
  const filteredMediaFiles = mediaFiles.filter((file: any) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = mediaTypeFilter === "all" || file.mediaType === mediaTypeFilter;
    const matchesAccess = accessLevelFilter === "all" || file.accessLevel === accessLevelFilter;
    
    return matchesSearch && matchesType && matchesAccess;
  });

  // Helper functions
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "photo": return <FileImage className="h-4 w-4" />;
      case "video": return <FileVideo className="h-4 w-4" />;
      case "360_tour": return <Camera className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAccessLevelBadge = (level: string, isApproved: boolean) => {
    switch (level) {
      case "agent_approved":
        return <Badge variant="default" className="bg-green-500">Agent Approved</Badge>;
      case "unbranded":
        return <Badge variant="default" className="bg-blue-500">Unbranded</Badge>;
      case "public":
        return <Badge variant="default" className="bg-purple-500">Public</Badge>;
      default:
        return <Badge variant="secondary">Private</Badge>;
    }
  };

  const handleFileAccess = (file: any, accessType: string) => {
    logAccessMutation.mutate({ 
      id: file.id, 
      type: accessType, 
      reason: `media_${accessType}` 
    });
    
    // Open the cloud link
    if (accessType === "download" || accessType === "view") {
      window.open(file.cloudLink, '_blank');
    }
  };

  const handleApprovalToggle = (file: any, approved: boolean) => {
    updateFileMutation.mutate({
      id: file.id,
      data: { isAgentApproved: approved }
    });
  };

  // Check user permissions
  const canManageMedia = user?.role && ["admin", "portfolio-manager"].includes(user.role);
  const canUploadMedia = user?.role && ["admin", "portfolio-manager", "owner"].includes(user.role);
  const isAgent = user?.role && ["referral-agent", "retail-agent"].includes(user.role);

  if (isAgent) {
    // Agent-specific view
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">Access approved property media for your listings</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Users className="h-4 w-4 mr-2" />
            {user?.role === "referral-agent" ? "Referral Agent" : "Retail Agent"}
          </Badge>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileImage className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Available Media</p>
                  <p className="text-2xl font-bold">{agentMedia.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Downloads Today</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Unbranded Files</p>
                  <p className="text-2xl font-bold">
                    {agentMedia.filter((file: any) => file.isUnbranded).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="photo">Photos</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="floor_plan">Floor Plans</SelectItem>
              <SelectItem value="drone_footage">Drone Footage</SelectItem>
              <SelectItem value="360_tour">360° Tours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agent Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentMedia.map((file: any) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getMediaTypeIcon(file.mediaType)}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {file.isUnbranded && (
                    <Badge variant="default" className="bg-blue-500">Unbranded</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{file.fileName}</h3>
                    {getMediaTypeIcon(file.mediaType)}
                  </div>
                  {file.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{file.description}</p>
                  )}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {file.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {file.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{file.tags.length - 3}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileAccess(file, "view")}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleFileAccess(file, "download")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileAccess(file, "share")}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {agentMedia.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No approved media available</h3>
              <p className="text-muted-foreground">
                Contact your property manager to get media files approved for agent use.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage property media files, folders, and agent access controls
          </p>
        </div>
        <div className="flex gap-2">
          {canUploadMedia && (
            <>
              <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Media Folder</DialogTitle>
                    <DialogDescription>
                      Organize your media files into folders for better management.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...folderForm}>
                    <form onSubmit={folderForm.handleSubmit((data) => createFolderMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={folderForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties.map((property: any) => (
                                  <SelectItem key={property.id} value={property.id.toString()}>
                                    {property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={folderForm.control}
                        name="folderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Folder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Exterior Photos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={folderForm.control}
                        name="folderDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the contents of this folder..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={folderForm.control}
                        name="cloudFolderLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cloud Folder Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://drive.google.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createFolderMutation.isPending}>
                          {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Media File</DialogTitle>
                    <DialogDescription>
                      Add photos, videos, or documents to your property media library.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...fileForm}>
                    <form onSubmit={fileForm.handleSubmit((data) => createFileMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={fileForm.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {properties.map((property: any) => (
                                    <SelectItem key={property.id} value={property.id.toString()}>
                                      {property.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fileForm.control}
                          name="mediaType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Media Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="photo">Photo</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="floor_plan">Floor Plan</SelectItem>
                                  <SelectItem value="pdf_brochure">PDF Brochure</SelectItem>
                                  <SelectItem value="drone_footage">Drone Footage</SelectItem>
                                  <SelectItem value="360_tour">360° Tour</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={fileForm.control}
                        name="fileName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Master Bedroom - Ocean View" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fileForm.control}
                        name="cloudLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cloud Storage Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://drive.google.com/file/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fileForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe this media file..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={fileForm.control}
                          name="accessLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private">Private</SelectItem>
                                  <SelectItem value="agent_approved">Agent Approved</SelectItem>
                                  <SelectItem value="unbranded">Unbranded</SelectItem>
                                  <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={fileForm.control}
                          name="cloudProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cloud Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="google_drive">Google Drive</SelectItem>
                                  <SelectItem value="dropbox">Dropbox</SelectItem>
                                  <SelectItem value="onedrive">OneDrive</SelectItem>
                                  <SelectItem value="direct_url">Direct URL</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {canManageMedia && (
                        <div className="flex items-center space-x-4">
                          <FormField
                            control={fileForm.control}
                            name="isAgentApproved"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Agent Approved</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={fileForm.control}
                            name="isUnbranded"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Unbranded</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFileDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createFileMutation.isPending}>
                          {createFileMutation.isPending ? "Uploading..." : "Upload Media"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileImage className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">{mediaStats.totalFiles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Agent Approved</p>
                <p className="text-2xl font-bold">{mediaStats.agentApproved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold">{mediaStats.pendingApproval || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">{mediaStats.totalViews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedProperty?.toString() || ""} onValueChange={(value) => setSelectedProperty(value ? parseInt(value) : null)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by property" />
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

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="files">Media Files</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
          {canManageMedia && <TabsTrigger value="access-logs">Access Logs</TabsTrigger>}
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="floor_plan">Floor Plans</SelectItem>
                <SelectItem value="pdf_brochure">PDF Brochures</SelectItem>
                <SelectItem value="drone_footage">Drone Footage</SelectItem>
                <SelectItem value="360_tour">360° Tours</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access Levels</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="agent_approved">Agent Approved</SelectItem>
                <SelectItem value="unbranded">Unbranded</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Files Grid */}
          {filesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted animate-pulse rounded flex-1" />
                        <div className="h-8 bg-muted animate-pulse rounded flex-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMediaFiles.map((file: any) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {getMediaTypeIcon(file.mediaType)}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {getAccessLevelBadge(file.accessLevel, file.isAgentApproved)}
                      {file.expiryDate && (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Expires
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{file.fileName}</h3>
                        {getMediaTypeIcon(file.mediaType)}
                      </div>
                      {file.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{file.description}</p>
                      )}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                          {file.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{file.tags.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFileAccess(file, "view")}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFileAccess(file, "download")}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {canManageMedia && (
                          <Button
                            size="sm"
                            variant={file.isAgentApproved ? "default" : "outline"}
                            onClick={() => handleApprovalToggle(file, !file.isAgentApproved)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredMediaFiles.length === 0 && !filesLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No media files found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || mediaTypeFilter !== "all" || accessLevelFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Start by uploading your first media file."}
                </p>
                {canUploadMedia && (
                  <Button onClick={() => setIsFileDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaFolders.map((folder: any) => (
              <Card key={folder.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{folder.folderName}</h3>
                      {folder.folderDescription && (
                        <p className="text-sm text-muted-foreground">{folder.folderDescription}</p>
                      )}
                      {getAccessLevelBadge(folder.accessLevel, folder.isAgentApproved)}
                    </div>
                    <div className="flex gap-2">
                      {folder.cloudFolderLink && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={folder.cloudFolderLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mediaFolders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No folders created</h3>
                <p className="text-muted-foreground mb-4">
                  Organize your media files by creating folders.
                </p>
                {canUploadMedia && (
                  <Button onClick={() => setIsFolderDialogOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create Folder
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Performing Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mediaAnalytics.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{item.fileName || `File ${item.mediaFileId}`}</p>
                          <p className="text-xs text-muted-foreground">{item.viewCount} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.downloadCount} downloads</p>
                        <Progress value={(item.popularityScore / 100) * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weekly Views</span>
                    <span className="text-2xl font-bold">
                      {mediaAnalytics.reduce((sum: number, item: any) => sum + (item.weeklyViews || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Views</span>
                    <span className="text-2xl font-bold">
                      {mediaAnalytics.reduce((sum: number, item: any) => sum + (item.monthlyViews || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Downloads</span>
                    <span className="text-2xl font-bold">
                      {mediaAnalytics.reduce((sum: number, item: any) => sum + (item.downloadCount || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Shares</span>
                    <span className="text-2xl font-bold">
                      {mediaAnalytics.reduce((sum: number, item: any) => sum + (item.shareCount || 0), 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-suggestions" className="space-y-4">
          <div className="space-y-4">
            {aiSuggestions.map((suggestion: any) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          suggestion.priority === "critical" ? "destructive" :
                          suggestion.priority === "high" ? "default" :
                          suggestion.priority === "medium" ? "secondary" : "outline"
                        }>
                          {suggestion.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {suggestion.suggestionType.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(suggestion.confidenceScore * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm">{suggestion.suggestionText}</p>
                      {suggestion.detectedIssues && suggestion.detectedIssues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Detected Issues:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.detectedIssues.map((issue: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">{issue}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateFileMutation.mutate({
                            id: suggestion.id,
                            data: { status: "accepted" }
                          });
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateFileMutation.mutate({
                            id: suggestion.id,
                            data: { status: "rejected" }
                          });
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {aiSuggestions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI suggestions available</h3>
                <p className="text-muted-foreground">
                  AI suggestions will appear here to help improve your media library.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canManageMedia && (
          <TabsContent value="access-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Access Logs</CardTitle>
                <CardDescription>
                  Track agent access to your media files for compliance and analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-full">
                          {log.accessType === "download" ? (
                            <Download className="h-4 w-4" />
                          ) : log.accessType === "view" ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Agent {log.agentRole.replace('-', ' ')} accessed file
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.accessReason} • {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{log.accessType}</Badge>
                    </div>
                  ))}
                </div>
                
                {accessLogs.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No access logs yet</h3>
                    <p className="text-muted-foreground">
                      Agent access activity will be logged here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}