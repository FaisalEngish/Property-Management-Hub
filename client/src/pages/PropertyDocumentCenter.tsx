import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, Eye, Download, Plus, Search, Filter, Tag, Calendar, User, Building, FolderOpen, File, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fastCache } from "@/lib/fastCache";

const documentUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  category: z.string().min(1, "Category is required"),
  fileType: z.string(),
  tags: z.string().optional(),
  description: z.string().optional(),
  propertyId: z.coerce.number(),
});

const DOCUMENT_CATEGORIES = [
  { id: "legal", name: "Legal Documents", icon: FileText, color: "bg-blue-100 text-blue-700" },
  { id: "contracts", name: "Contracts", icon: FileText, color: "bg-green-100 text-green-700" },
  { id: "licenses", name: "Licenses & Permits", icon: FileText, color: "bg-purple-100 text-purple-700" },
  { id: "utility_bills", name: "Utility Bills", icon: FileText, color: "bg-orange-100 text-orange-700" },
  { id: "insurance", name: "Insurance Documents", icon: FileText, color: "bg-red-100 text-red-700" },
  { id: "financial", name: "Financial Records", icon: FileText, color: "bg-yellow-100 text-yellow-700" },
  { id: "maintenance", name: "Maintenance Records", icon: FileText, color: "bg-gray-100 text-gray-700" },
  { id: "photos", name: "Property Photos", icon: Image, color: "bg-pink-100 text-pink-700" },
];

export default function PropertyDocumentCenter() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user permissions
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const userRole = (user as any)?.role;
  const canEdit = ['admin', 'portfolio-manager'].includes(userRole);
  const canView = ['admin', 'portfolio-manager', 'owner'].includes(userRole);

  // Fetch properties
  const { data: properties, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  // Fetch documents
  const { data: documents, isLoading: isDocumentsLoading } = useQuery({
    queryKey: [`/api/property-documents/property/${selectedProperty}`],
    enabled: !!selectedProperty && !!user,
  });

  // File validation
  const validateFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, JPG, PNG, XLSX, or XLS file.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10 MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      // Auto-fill filename if empty
      if (!form.getValues("fileName")) {
        form.setValue("fileName", file.name);
      }
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/property-documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload document");
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear fastCache for expiring documents to show alerts immediately
      fastCache.delete("/api/property-documents/expiring?days=30");
      
      toast({
        title: "Document Uploaded",
        description: "Document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] && 
          typeof query.queryKey[0] === 'string' && 
          query.queryKey[0].startsWith('/api/property-documents/property/')
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-documents/expiring?days=30"] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      fileName: "",
      category: "",
      fileType: "pdf",
      tags: "",
      description: "",
      propertyId: selectedProperty || 0,
    },
  });

  const onSubmit = (data: any) => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", data.fileName);
    formData.append("category", data.category);
    formData.append("fileType", data.fileType);
    formData.append("tags", data.tags || "");
    formData.append("description", data.description || "");
    formData.append("propertyId", selectedProperty?.toString() || "");

    uploadMutation.mutate(formData);
  };

  const filteredDocuments = (documents as any[])?.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Document Center is only accessible to Admin, Portfolio Manager, and Owner roles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🧾 Property Document Center</h1>
          <p className="text-muted-foreground">
            Manage legal documents, contracts, licenses, and utility bills
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
          <CardDescription>Choose a property to view its documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProperty?.toString()} onValueChange={(value) => setSelectedProperty(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property..." />
            </SelectTrigger>
            <SelectContent>
              {(properties as any[])?.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProperty && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents by name, description, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Categories Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DOCUMENT_CATEGORIES.map((category) => {
              const categoryCount = (documents as any[])?.filter(doc => doc.category === category.id)?.length || 0;
              const CategoryIcon = category.icon;
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">{category.name}</h3>
                    <p className="text-2xl font-bold text-primary">{categoryCount}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Documents
                {selectedCategory !== "all" && (
                  <Badge variant="secondary">
                    {DOCUMENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {filteredDocuments.length} documents found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDocumentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Upload your first document to get started."
                    }
                  </p>
                  {canEdit && (
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((document: any) => {
                    const category = DOCUMENT_CATEGORIES.find(cat => cat.id === document.category);
                    
                    return (
                      <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-100 text-gray-700'}`}>
                            {getFileIcon(document.fileType)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{document.fileName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {category?.name || document.category}
                              </Badge>
                              <span>•</span>
                              <User className="h-3 w-3" />
                              <span>{document.uploadedBy}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                            </div>
                            {document.description && (
                              <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                            )}
                            {document.tags && document.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {document.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(document);
                              setIsPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the property document center
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="file-upload" className="text-sm font-medium">
                  Select File *
                </label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter file name..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="doc">Word Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter tags separated by commas..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description of the document..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.fileType)}
              {selectedDocument?.fileName}
            </DialogTitle>
            <DialogDescription>
              Document preview and details
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="ml-2">
                    {DOCUMENT_CATEGORIES.find(cat => cat.id === selectedDocument.category)?.name}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Uploaded by:</span>
                  <span className="ml-2">{selectedDocument.uploadedBy}</span>
                </div>
                <div>
                  <span className="font-medium">Upload date:</span>
                  <span className="ml-2">{new Date(selectedDocument.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium">File type:</span>
                  <span className="ml-2">{selectedDocument.fileType.toUpperCase()}</span>
                </div>
              </div>
              {selectedDocument.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{selectedDocument.description}</p>
                </div>
              )}
              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDocument.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="border rounded-lg p-4 bg-gray-50 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Document preview would appear here
                </p>
                <Button className="mt-2" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}