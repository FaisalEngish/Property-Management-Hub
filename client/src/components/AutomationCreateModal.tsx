import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AutomationCreateModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "booking_due",
    action: "email",
    schedule: "0 9 * * *",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/automations", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Automation Created",
        description: "Your automation rule has been created successfully",
      });
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        trigger: "booking_due",
        action: "email",
        schedule: "0 9 * * *",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.trigger || !formData.action) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Automation</DialogTitle>
          <DialogDescription>
            Set up automated workflows for property management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="automation-name">Name *</Label>
            <Input
              id="automation-name"
              placeholder="e.g., Send booking confirmation"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              data-testid="input-automation-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="automation-description">Description</Label>
            <Textarea
              id="automation-description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              data-testid="input-automation-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="automation-trigger">Trigger *</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) =>
                setFormData({ ...formData, trigger: value })
              }
            >
              <SelectTrigger
                id="automation-trigger"
                data-testid="select-automation-trigger"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_due">
                  Booking Check-in Due
                </SelectItem>
                <SelectItem value="task_overdue">Task Overdue</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="document_expiring">
                  Document Expiring
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="automation-action">Action *</Label>
            <Select
              value={formData.action}
              onValueChange={(value) =>
                setFormData({ ...formData, action: value })
              }
            >
              <SelectTrigger
                id="automation-action"
                data-testid="select-automation-action"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send Email</SelectItem>
                <SelectItem value="sms">Send SMS</SelectItem>
                <SelectItem value="push_notification">
                  Push Notification
                </SelectItem>
                <SelectItem value="whatsapp">WhatsApp Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="automation-schedule">
              Schedule (Cron Expression)
            </Label>
            <Input
              id="automation-schedule"
              placeholder="e.g., 0 9 * * * (daily at 9 AM)"
              value={formData.schedule}
              onChange={(e) =>
                setFormData({ ...formData, schedule: e.target.value })
              }
              data-testid="input-automation-schedule"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              disabled={createMutation.isPending}
              data-testid="button-create-automation"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Automation"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              data-testid="button-cancel-automation"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
