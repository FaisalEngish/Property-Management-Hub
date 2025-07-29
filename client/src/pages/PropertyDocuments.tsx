import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, Download, Eye, Trash2, Search, Plus } from "lucide-react";

const DOCUMENT_CATEGORIES = [
  { id: "ownership", name: "Ownership Documents", color: "bg-blue-100 text-blue-700" },
  { id: "license", name: "Licenses & Permits", color: "bg-green-100 text-green-700" },
  { id: "insurance", name: "Insurance Policies", color: "bg-purple-100 text-purple-700" },
  { id: "contracts", name: "Contracts", color: "bg-orange-100 text-orange-700" },
  { id: "financial", name: "Financial Records", color: "bg-red-100 text-red-700" },
  { id: "maintenance", name: "Maintenance Records", color: "bg-yellow-100 text-yellow-700" },
  { id: "photos", name: "Property Photos", color: "bg-pink-100 text-pink-700" },
  { id: "other", name: "Other Documents", color: "bg-gray-100 text-gray-700" }
];

export default function PropertyDocuments() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "",
    file: null as File | null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id
  });

  // Fetch property documents
  const { data: documents, isLoading } = useQuery({
    queryKey: [`/api/property-documents/property/${id}`],
    enabled: !!id
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/property-documents", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      setUploadData({ title: "", category: "", file: null });
      queryClient.invalidateQueries({ queryKey: [`/api/property-documents/property/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: (documentId: number) => 
      apiRequest(`/api/property-documents/${documentId}`, "DELETE"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/property-documents/property/${id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  });

  const handleUpload = () => {
    if (!uploadData.title || !uploadData.category || !uploadData.file) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("propertyId", id!);
    formData.append("title", uploadData.title);
    formData.append("category", uploadData.category);
    formData.append("file", uploadData.file);

    uploadMutation.mutate(formData);
  };

  // Filter documents
  const filteredDocuments = documents?.filter((doc: any) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Get category stats
  const categoryStats = DOCUMENT_CATEGORIES.map(category => ({
    ...category,
    count: documents?.filter((doc: any) => doc.category === category.id).length || 0
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/property-hub")}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hub
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Documents</h1>
              <p className="text-gray-600">{property?.name} - Document Management</p>
            </div>
          </div>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Title</label>
                  <Input
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select 
                    value={uploadData.category} 
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File</label>
                  <Input
                    type="file"
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      file: e.target.files?.[0] || null 
                    }))}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={uploadMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === "all" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  <span>All Documents</span>
                  <Badge variant="secondary">{documents?.length || 0}</Badge>
                </button>
                
                {categoryStats.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.id ? category.color : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search documents..."
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-600">Upload your first document to get started</p>
                </div>
              ) : (
                filteredDocuments.map((doc: any) => {
                  const category = DOCUMENT_CATEGORIES.find(cat => cat.id === doc.category);
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <Badge className={category?.color}>
                              {category?.name}
                            </Badge>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {doc.title}
                        </h4>
                        
                        <div className="text-xs text-gray-500 mb-3">
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteMutation.mutate(doc.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}