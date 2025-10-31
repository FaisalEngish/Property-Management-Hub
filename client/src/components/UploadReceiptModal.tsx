import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UploadReceiptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadReceiptModal({ open, onClose }: UploadReceiptModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [propertyId, setPropertyId] = useState<string>("");
  const [billType, setBillType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [billingMonth, setBillingMonth] = useState<string>("");
  const [responsibleParty, setResponsibleParty] = useState<string>("owner");
  const [isUploading, setIsUploading] = useState(false);

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPG, and PNG files are allowed.",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Missing file",
        description: "Please attach a receipt (PDF, JPG, or PNG).",
        variant: "destructive",
      });
      return;
    }

    if (!propertyId) {
      toast({
        title: "Missing property",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }

    if (!billType) {
      toast({
        title: "Missing bill type",
        description: "Please select a bill type.",
        variant: "destructive",
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "Missing due date",
        description: "Please select a due date.",
        variant: "destructive",
      });
      return;
    }

    if (!billingMonth) {
      toast({
        title: "Missing billing month",
        description: "Please select a billing month.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('property_id', propertyId);
      formData.append('bill_type', billType);
      formData.append('amount', amount || '0');
      formData.append('due_date', dueDate);
      formData.append('provider', provider || '');
      formData.append('account_number', accountNumber || '');
      formData.append('billing_month', billingMonth);
      formData.append('responsible_party', responsibleParty);

      const response = await fetch('/api/utility-bills', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Upload failed');
      }

      toast({
        title: "Upload successful",
        description: "Utility bill has been uploaded successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/utility-bills'] });
      
      handleClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: err.message || "An error occurred while uploading the bill.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPropertyId("");
    setBillType("");
    setAmount("");
    setDueDate("");
    setProvider("");
    setAccountNumber("");
    setBillingMonth("");
    setResponsibleParty("owner");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Utility Bill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Property *</Label>
            <Select value={propertyId} onValueChange={setPropertyId} required>
              <SelectTrigger id="property" data-testid="select-property">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((prop: any) => (
                  <SelectItem key={prop.id} value={prop.id.toString()}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type *</Label>
            <Select value={billType} onValueChange={setBillType} required>
              <SelectTrigger id="billType" data-testid="select-bill-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                data-testid="input-due-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingMonth">Billing Month * (YYYY-MM)</Label>
            <Input
              id="billingMonth"
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              required
              data-testid="input-billing-month"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Energy Australia"
                data-testid="input-provider"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Optional"
                data-testid="input-account-number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleParty">Responsible Party</Label>
            <Select value={responsibleParty} onValueChange={setResponsibleParty}>
              <SelectTrigger id="responsibleParty" data-testid="select-responsible-party">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt * (PDF, JPG, PNG - max 10MB)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept=".pdf,image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                required
                data-testid="input-receipt-file"
                className="flex-1"
              />
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              data-testid="button-submit-upload"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
