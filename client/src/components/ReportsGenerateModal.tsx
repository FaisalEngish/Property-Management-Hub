import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReportsGenerateModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("bookings");

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/reports/generate', { 
        type: reportType 
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Report Generated",
        description: `${reportType} report has been created successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Select a report type to generate comprehensive analytics
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type" data-testid="select-report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">Bookings Report</SelectItem>
                <SelectItem value="finances">Financial Report</SelectItem>
                <SelectItem value="tasks">Tasks Report</SelectItem>
                <SelectItem value="properties">Properties Report</SelectItem>
                <SelectItem value="occupancy">Occupancy Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              disabled={generateMutation.isPending}
              data-testid="button-generate-report"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={generateMutation.isPending}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
