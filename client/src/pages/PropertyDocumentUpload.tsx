import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  FileImage,
  File
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const documentCategories = [
  { value: "ownership", label: "Proof of Ownership", required: true, icon: FileText },
  { value: "floorplan", label: "Floorplan", required: false, icon: FileImage },
  { value: "license", label: "Rental License", required: true, icon: FileText },
  { value: "insurance", label: "Property Insurance", required: true, icon: FileText },
  { value: "welcome", label: "Welcome Book / Guest Manual", required: false, icon: File },
  { value: "safety", label: "Safety Certificates", required: false, icon: FileText },
  { value: "hoa", label: "HOA / Residence Rules", required: false, icon: File }
];

export default function PropertyDocumentUpload() {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ["/api/owner/properties"],
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/owner/documents", selectedProperty],
    enabled: !!selectedProperty,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ propertyId, category, files }: { 
      propertyId: string; 
      category: string; 
      files: File[] 
    }) => {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("category", category);
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      return fetch("/api/owner/documents/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Documents uploaded successfully",
        description: "Your documents have been uploaded and will be reviewed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/documents", selectedProperty] });
      setUploadingCategory(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your documents. Please try again.",
        variant: "destructive",
      });
      setUploadingCategory(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest("DELETE", `/api/owner/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/documents", selectedProperty] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the document. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (category: string, files: FileList | null) => {
    if (!files || !selectedProperty) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.includes('pdf') || file.type.includes('image');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select PDF or image files under 10MB each.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCategory(category);
    uploadMutation.mutate({
      propertyId: selectedProperty,
      category,
      files: validFiles
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "approved" ? "default" : 
                  status === "rejected" ? "destructive" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getCompletionStats = () => {
    if (!documents) return { completed: 0, required: 0 };
    
    const categoriesWithDocs = documentCategories.reduce((acc, category) => {
      const categoryDocs = documents.filter((doc: any) => doc.category === category.value);
      if (categoryDocs.length > 0) {
        acc.completed++;
      }
      if (category.required) {
        acc.required++;
      }
      return acc;
    }, { completed: 0, required: 0 });

    return categoriesWithDocs;
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage important documents for your properties
          </p>
        </div>
        {selectedProperty && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Completion Status</div>
            <div className="text-lg font-semibold">
              {stats.completed}/{documentCategories.length} Categories
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.required} required categories
            </div>
          </div>
        )}
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a property to manage documents" />
            </SelectTrigger>
            <SelectContent>
              {properties?.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProperty && (
        <div className="grid gap-6">
          {documentCategories.map((category) => {
            const Icon = category.icon;
            const categoryDocs = documents?.filter((doc: any) => doc.category === category.value) || [];
            const isUploading = uploadingCategory === category.value;

            return (
              <Card key={category.value}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{category.label}</CardTitle>
                      {category.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {categoryDocs.length > 0 && (
                        <Badge variant="outline">{categoryDocs.length} file(s)</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <div className="space-y-2">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(category.value, e.target.files)}
                        className="hidden"
                        id={`upload-${category.value}`}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor={`upload-${category.value}`}
                        className={`cursor-pointer text-blue-600 hover:text-blue-500 ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploading ? "Uploading..." : "Click to upload files"}
                      </label>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 10MB each
                      </p>
                    </div>
                  </div>

                  {/* Existing Documents */}
                  {categoryDocs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Uploaded Documents</h4>
                      {categoryDocs.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="font-medium">{doc.filename}</div>
                              <div className="text-sm text-gray-500">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                            {getStatusIcon(doc.status)}
                            {getStatusBadge(doc.status)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>{doc.filename}</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 overflow-auto">
                                  {doc.fileType?.includes('pdf') ? (
                                    <iframe
                                      src={doc.fileUrl}
                                      className="w-full h-96"
                                      title={doc.filename}
                                    />
                                  ) : (
                                    <img
                                      src={doc.fileUrl}
                                      alt={doc.filename}
                                      className="max-w-full h-auto"
                                    />
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(doc.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document Requirements */}
                  <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Document Requirements:</strong>
                    <ul className="mt-1 space-y-1">
                      {category.value === "ownership" && (
                        <>
                          <li>• Title deed or purchase agreement</li>
                          <li>• Property registration documents</li>
                        </>
                      )}
                      {category.value === "license" && (
                        <>
                          <li>• Short-term rental license</li>
                          <li>• Business registration certificate</li>
                        </>
                      )}
                      {category.value === "insurance" && (
                        <>
                          <li>• Property insurance policy</li>
                          <li>• Liability coverage documentation</li>
                        </>
                      )}
                      {category.value === "floorplan" && (
                        <>
                          <li>• Architectural drawings or floor plans</li>
                          <li>• Room layout with dimensions</li>
                        </>
                      )}
                      {category.value === "safety" && (
                        <>
                          <li>• Fire safety certificates</li>
                          <li>• Electrical safety inspections</li>
                        </>
                      )}
                      {category.value === "welcome" && (
                        <>
                          <li>• Guest welcome instructions</li>
                          <li>• Property usage guidelines</li>
                        </>
                      )}
                      {category.value === "hoa" && (
                        <>
                          <li>• Homeowners association rules</li>
                          <li>• Building or residence regulations</li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}