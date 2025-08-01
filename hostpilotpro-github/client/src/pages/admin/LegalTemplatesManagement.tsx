import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";
import { Trash2, Edit, Plus, FileText, Globe, Calendar } from "lucide-react";

interface LegalTemplate {
  id: number;
  countryCode: string;
  docType: string;
  templateText: string;
  createdAt: string;
}

const COUNTRY_OPTIONS = [
  { code: "THA", name: "Thailand" },
  { code: "USA", name: "United States" },
  { code: "GBR", name: "United Kingdom" },
  { code: "SGP", name: "Singapore" },
  { code: "MYS", name: "Malaysia" },
  { code: "IDN", name: "Indonesia" },
  { code: "VNM", name: "Vietnam" },
  { code: "PHL", name: "Philippines" },
];

const DOC_TYPE_OPTIONS = [
  { value: "contract", label: "Rental Contract" },
  { value: "deposit_rules", label: "Deposit Rules" },
  { value: "terms_conditions", label: "Terms & Conditions" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "cancellation_policy", label: "Cancellation Policy" },
  { value: "house_rules", label: "House Rules" },
];

export default function LegalTemplatesManagement() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LegalTemplate | null>(null);
  const [formData, setFormData] = useState({
    countryCode: "",
    docType: "",
    templateText: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch legal templates with filters
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/legal-templates", selectedCountry, selectedDocType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCountry) params.append("countryCode", selectedCountry);
      if (selectedDocType) params.append("docType", selectedDocType);
      
      return apiRequest("GET", `/api/legal-templates?${params.toString()}`).then(res => res.json());
    },
  });

  // Fetch available countries and doc types
  const { data: availableCountries = [] } = useQuery({
    queryKey: ["/api/legal-templates/countries"],
    queryFn: () => apiRequest("GET", "/api/legal-templates/countries").then(res => res.json()),
  });

  const { data: availableDocTypes = [] } = useQuery({
    queryKey: ["/api/legal-templates/doc-types"],
    queryFn: () => apiRequest("GET", "/api/legal-templates/doc-types").then(res => res.json()),
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (template: { countryCode: string; docType: string; templateText: string }) =>
      apiRequest("POST", "/api/legal-templates", { body: template }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates/doc-types"] });
      toast({ title: "Success", description: "Legal template created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create legal template", variant: "destructive" });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, ...template }: { id: number; countryCode: string; docType: string; templateText: string }) =>
      apiRequest("PUT", `/api/legal-templates/${id}`, { body: template }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates"] });
      toast({ title: "Success", description: "Legal template updated successfully" });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update legal template", variant: "destructive" });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/legal-templates/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-templates/doc-types"] });
      toast({ title: "Success", description: "Legal template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete legal template", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ countryCode: "", docType: "", templateText: "" });
    setEditingTemplate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.countryCode || !formData.docType || !formData.templateText) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, ...formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleEdit = (template: LegalTemplate) => {
    setEditingTemplate(template);
    setFormData({
      countryCode: template.countryCode,
      docType: template.docType,
      templateText: template.templateText,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this legal template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const getCountryName = (code: string) => {
    return COUNTRY_OPTIONS.find(c => c.code === code)?.name || code;
  };

  const getDocTypeName = (type: string) => {
    return DOC_TYPE_OPTIONS.find(d => d.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Templates Management</h1>
          <p className="text-muted-foreground">
            Manage country-specific legal documents and contract templates
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Legal Template" : "Create Legal Template"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate ? "Update the legal template details" : "Create a new country-specific legal template"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country</Label>
                  <Select value={formData.countryCode} onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={formData.docType} onValueChange={(value) => setFormData(prev => ({ ...prev, docType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPE_OPTIONS.map((docType) => (
                        <SelectItem key={docType.value} value={docType.value}>
                          {docType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateText">Template Content</Label>
                <Textarea
                  id="templateText"
                  value={formData.templateText}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateText: e.target.value }))}
                  placeholder="Enter the legal template text..."
                  className="min-h-[300px]"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="templates">📄 Templates</TabsTrigger>
          <TabsTrigger value="countries">🌍 Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableCountries.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Types</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableDocTypes.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All countries</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {getCountryName(country)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All document types</SelectItem>
                {availableDocTypes.map((docType) => (
                  <SelectItem key={docType} value={docType}>
                    {getDocTypeName(docType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {getDocTypeName(template.docType)}
                        </CardTitle>
                        <Badge variant="secondary">
                          {getCountryName(template.countryCode)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleteTemplateMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-sm text-muted-foreground mb-2">Template Preview:</div>
                      <div className="text-sm max-h-32 overflow-y-auto">
                        {template.templateText.length > 200 
                          ? `${template.templateText.substring(0, 200)}...` 
                          : template.templateText
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {templates.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No legal templates found</p>
                    <p className="text-sm text-muted-foreground">Create your first template to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCountries.map((country) => {
              const countryTemplates = templates.filter(t => t.countryCode === country);
              return (
                <Card key={country}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {getCountryName(country)}
                    </CardTitle>
                    <CardDescription>
                      {countryTemplates.length} template(s) available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {DOC_TYPE_OPTIONS.map((docType) => {
                        const hasTemplate = countryTemplates.some(t => t.docType === docType.value);
                        return (
                          <div key={docType.value} className="flex items-center justify-between">
                            <span className="text-sm">{docType.label}</span>
                            <Badge variant={hasTemplate ? "default" : "secondary"}>
                              {hasTemplate ? "Available" : "Missing"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {availableCountries.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No countries configured</p>
                  <p className="text-sm text-muted-foreground">Add legal templates to see countries here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}