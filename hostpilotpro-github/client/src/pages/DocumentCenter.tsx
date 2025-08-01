import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Eye,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  Shield,
  FolderOpen
} from "lucide-react";

interface PropertyDocument {
  id: number;
  title: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  category: string;
  visibility: string;
  status: string;
  hasExpiration: boolean;
  expirationDate?: string;
  propertyId?: number;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
}

interface DocumentSummary {
  totalDocuments: number;
  documentsByCategory: Array<{ category: string; count: number }>;
  expiringCount: number;
  recentUploads: number;
  pendingApproval: number;
  byVisibility: Array<{ visibility: string; count: number }>;
}

const documentCategories = [
  { value: "contracts", label: "📄 Signed Contracts", icon: "📄" },
  { value: "licenses", label: "🏛️ Government Licenses", icon: "🏛️" },
  { value: "manuals", label: "📖 House Manuals", icon: "📖" },
  { value: "floorplans", label: "🏗️ Floor Plans", icon: "🏗️" },
  { value: "inventory", label: "📋 Inventory Lists", icon: "📋" },
  { value: "logs", label: "📊 Service Logs", icon: "📊" },
  { value: "identification", label: "🆔 Owner ID/Passport", icon: "🆔" },
  { value: "utility_accounts", label: "⚡ Utility Screenshots", icon: "⚡" },
  { value: "insurance", label: "🛡️ Insurance Documents", icon: "🛡️" },
  { value: "certificates", label: "🎖️ Safety Certificates", icon: "🎖️" }
];

const visibilityOptions = [
  { value: "admin_pm_only", label: "Admin/PM Only", icon: Shield },
  { value: "owner_visible", label: "Owner Visible", icon: Users },
  { value: "staff_visible", label: "Staff Visible", icon: Building },
  { value: "all_visible", label: "All Visible", icon: Eye }
];

export default function DocumentCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PropertyDocument | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "",
    visibility: "admin_pm_only",
    description: "",
    hasExpiration: false,
    expirationDate: "",
    propertyId: "",
    tags: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties for dropdown
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents", selectedProperty, selectedCategory, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      return apiRequest("GET", `/api/documents?${params.toString()}`);
    }
  });

  // Fetch document summary
  const { data: summary } = useQuery({
    queryKey: ["/api/documents/summary", selectedProperty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('propertyId', selectedProperty);
      return apiRequest("GET", `/api/documents/summary?${params.toString()}`);
    }
  });

  // Fetch expiring documents
  const { data: expiringDocs = [] } = useQuery({
    queryKey: ["/api/documents/expiring"],
    queryFn: () => apiRequest("GET", "/api/documents/expiring"),
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return apiRequest("POST", "/api/documents", documentData);
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "The document has been added to the system.",
      });
      setShowUploadDialog(false);
      setUploadForm({
        title: "",
        category: "",
        visibility: "admin_pm_only",
        description: "",
        hasExpiration: false,
        expirationDate: "",
        propertyId: "",
        tags: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (!uploadForm.title || !uploadForm.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const documentData = {
      ...uploadForm,
      filename: `${uploadForm.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`,
      originalFilename: `${uploadForm.title}.pdf`,
      propertyId: uploadForm.propertyId ? parseInt(uploadForm.propertyId) : null,
      tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : [],
      expirationDate: uploadForm.hasExpiration ? uploadForm.expirationDate : null
    };

    uploadMutation.mutate(documentData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "pending_approval":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    const option = visibilityOptions.find(opt => opt.value === visibility);
    const IconComponent = option?.icon || Eye;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryIcon = (category: string) => {
    const cat = documentCategories.find(c => c.value === category);
    return cat?.icon || "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpiringDocument = (doc: PropertyDocument) => {
    if (!doc.hasExpiration || !doc.expirationDate) return false;
    const expirationDate = new Date(doc.expirationDate);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expirationDate <= thirtyDaysFromNow;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📂 Document Center</h1>
          <p className="text-muted-foreground">
            Secure document vault and owner onboarding file management
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Add a new document to the property management system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title*</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property</Label>
                  <Select 
                    value={uploadForm.propertyId} 
                    onValueChange={(value) => setUploadForm({...uploadForm, propertyId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={uploadForm.category} 
                    onValueChange={(value) => setUploadForm({...uploadForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select 
                    value={uploadForm.visibility} 
                    onValueChange={(value) => setUploadForm({...uploadForm, visibility: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Brief description of the document"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  placeholder="important, signed, current"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasExpiration"
                  checked={uploadForm.hasExpiration}
                  onChange={(e) => setUploadForm({...uploadForm, hasExpiration: e.target.checked})}
                />
                <Label htmlFor="hasExpiration">Document has expiration date</Label>
              </div>

              {uploadForm.hasExpiration && (
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={uploadForm.expirationDate}
                    onChange={(e) => setUploadForm({...uploadForm, expirationDate: e.target.value})}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="documents">📁 All Documents</TabsTrigger>
          <TabsTrigger value="expiring">⚠️ Expiring Soon</TabsTrigger>
          <TabsTrigger value="onboarding">✅ Owner Onboarding</TabsTrigger>
          <TabsTrigger value="access-logs">📋 Access Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalDocuments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{summary?.recentUploads || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{summary?.expiringCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Next 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{summary?.pendingApproval || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Requires review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.documentsByCategory?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Document types
                </p>
              </CardContent>
            </Card>
          </div>

          {summary?.documentsByCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Documents by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.documentsByCategory.map((category) => {
                    const categoryInfo = documentCategories.find(c => c.value === category.category);
                    const percentage = summary.totalDocuments > 0 ? (category.count / summary.totalDocuments) * 100 : 0;
                    
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{getCategoryIcon(category.category)}</span>
                            {categoryInfo?.label || category.category}
                          </span>
                          <span className="font-medium">{category.count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[200px]">
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

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {documentCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {documentsLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: PropertyDocument) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(doc.category)}</span>
                        <div>
                          <CardTitle className="text-sm font-medium line-clamp-1">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatFileSize(doc.fileSize)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getVisibilityIcon(doc.visibility)}
                        {isExpiringDocument(doc) && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        {getStatusBadge(doc.status)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {doc.hasExpiration && doc.expirationDate && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Documents Expiring Soon
              </CardTitle>
              <CardDescription>
                Documents that will expire within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No documents expiring soon</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringDocs.map((doc: PropertyDocument) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCategoryIcon(doc.category)}</span>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Expires: {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status)}
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>✅ Owner Onboarding Checklist</CardTitle>
              <CardDescription>
                Track document collection and setup progress for new owners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>Owner onboarding checklist interface coming soon</p>
                <p className="text-sm">Will include step-by-step document collection workflow</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Document Access Logs</CardTitle>
              <CardDescription>
                Audit trail of all document access and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <p>Access logs interface coming soon</p>
                <p className="text-sm">Will display detailed audit trail for compliance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}