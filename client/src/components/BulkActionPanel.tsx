import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Users, 
  Settings, 
  Archive, 
  X, 
  CheckSquare,
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface BulkActionPanelProps {
  selectedProperties: any[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActionPanel({ 
  selectedProperties, 
  onClearSelection, 
  onRefresh 
}: BulkActionPanelProps) {
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: string;
    data: any;
  }>({ isOpen: false, action: '', data: null });
  
  const { toast } = useToast();

  if (selectedProperties.length === 0) {
    return null;
  }

  const handleAssignManager = () => {
    setActionDialog({
      isOpen: true,
      action: 'assign-manager',
      data: { selectedCount: selectedProperties.length }
    });
  };

  const handleUpdateStatus = () => {
    setActionDialog({
      isOpen: true,
      action: 'update-status',
      data: { selectedCount: selectedProperties.length }
    });
  };

  const handleArchive = () => {
    setActionDialog({
      isOpen: true,
      action: 'archive',
      data: { selectedCount: selectedProperties.length }
    });
  };

  const executeBulkAction = async (action: string, params: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let message = '';
      switch (action) {
        case 'assign-manager':
          message = `Assigned ${params.manager} to ${selectedProperties.length} properties`;
          break;
        case 'update-status':
          message = `Updated status to "${params.status}" for ${selectedProperties.length} properties`;
          break;
        case 'archive':
          message = `Archived ${selectedProperties.length} properties`;
          break;
      }
      
      toast({
        title: "Bulk Action Completed",
        description: message,
      });
      
      setActionDialog({ isOpen: false, action: '', data: null });
      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedProperties.slice(0, 3).map((property, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {property.name}
                  </Badge>
                ))}
                {selectedProperties.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedProperties.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAssignManager}
                className="flex items-center gap-1"
              >
                <Users className="h-4 w-4" />
                Assign Manager
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateStatus}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Update Status
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleArchive}
                className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearSelection}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => 
        setActionDialog({ isOpen: open, action: '', data: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'assign-manager' && 'Assign Property Manager'}
              {actionDialog.action === 'update-status' && 'Update Property Status'}
              {actionDialog.action === 'archive' && 'Archive Properties'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'assign-manager' && 
                `Select a property manager to assign to ${actionDialog.data?.selectedCount} selected properties.`
              }
              {actionDialog.action === 'update-status' && 
                `Choose the new status for ${actionDialog.data?.selectedCount} selected properties.`
              }
              {actionDialog.action === 'archive' && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  This will archive {actionDialog.data?.selectedCount} properties. They will be hidden from the main view but can be restored later.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionDialog.action === 'assign-manager' && (
              <Select defaultValue="manager1">
                <SelectTrigger>
                  <SelectValue placeholder="Select Property Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager1">John Smith</SelectItem>
                  <SelectItem value="manager2">Sarah Johnson</SelectItem>
                  <SelectItem value="manager3">Mike Chen</SelectItem>
                  <SelectItem value="manager4">Lisa Wong</SelectItem>
                </SelectContent>
              </Select>
            )}

            {actionDialog.action === 'update-status' && (
              <Select defaultValue="active">
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}

            {actionDialog.action === 'archive' && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  Archived properties will be moved to the archive section and will not appear in regular property listings. 
                  You can restore them at any time from the archive.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setActionDialog({ isOpen: false, action: '', data: null })
            }>
              Cancel
            </Button>
            <Button onClick={() => {
              // Get the selected value from the dialog
              const params = actionDialog.action === 'assign-manager' 
                ? { manager: 'John Smith' }
                : actionDialog.action === 'update-status'
                ? { status: 'active' }
                : {};
              executeBulkAction(actionDialog.action, params);
            }}>
              {actionDialog.action === 'archive' ? 'Archive Properties' : 'Apply Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkActionPanel;