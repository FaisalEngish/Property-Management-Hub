/**
 * Commission Settings Tab Component
 * Manage commission splits, rates, and configurations
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Settings, Edit, Plus, Save, X, UserCheck, Building2, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CommissionSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingSettings, setEditingSettings] = useState<any>(null);

  // Fetch current commission settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/finance/commission-settings'],
  });

  // Fetch users for dropdowns
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch properties for dropdowns
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) => 
      apiRequest('/api/admin/finance/commission-settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finance/commission-settings'] });
      setIsEditing(false);
      setEditingSettings(null);
      toast({
        title: "Settings Updated",
        description: "Commission settings have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update commission settings.",
        variant: "destructive",
      });
    },
  });

  const handleStartEditing = () => {
    setEditingSettings(JSON.parse(JSON.stringify(settings)));
    setIsEditing(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(editingSettings);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingSettings(null);
  };

  const propertyManagers = users.filter((user: any) => 
    user.role === 'portfolio-manager' || user.role === 'admin'
  );

  if (isLoading || !settings) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  const currentSettings = isEditing ? editingSettings : settings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Commission Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure commission rates and splits for all stakeholders
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateSettingsMutation.isPending}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleStartEditing}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Property Manager Commission Splits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Property Manager Commission Splits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Manager</TableHead>
                <TableHead>Commission Split %</TableHead>
                <TableHead>Properties Managed</TableHead>
                {isEditing && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(currentSettings.propertyManagerSplits || {}).map(([managerId, config]: [string, any]) => {
                const manager = users.find((u: any) => u.id === managerId);
                const managerName = manager ? `${manager.firstName} ${manager.lastName}` : managerId;
                
                return (
                  <TableRow key={managerId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        {managerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={config.splitPercentage}
                            onChange={(e) => {
                              const newSettings = { ...editingSettings };
                              newSettings.propertyManagerSplits[managerId].splitPercentage = parseInt(e.target.value);
                              setEditingSettings(newSettings);
                            }}
                            className="w-20"
                          />
                          <Percent className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : (
                        <span>{config.splitPercentage}%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {config.properties.length} properties
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSettings = { ...editingSettings };
                            delete newSettings.propertyManagerSplits[managerId];
                            setEditingSettings(newSettings);
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {isEditing && (
            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property Manager
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Property Manager</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Property Manager</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyManagers.map((manager: any) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.firstName} {manager.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Commission Split %</Label>
                      <Input type="number" placeholder="50" />
                    </div>
                    <Button className="w-full">Add Manager</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Contract Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Owner Contract Rates (Management Fee %)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentSettings.ownerContractRates || {}).map(([propertyId, rate]: [string, any]) => {
              const property = properties.find((p: any) => p.id === parseInt(propertyId));
              const propertyName = property?.name || `Property ${propertyId}`;
              
              return (
                <div key={propertyId} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">{propertyName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Management Fee:</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={rate}
                          onChange={(e) => {
                            const newSettings = { ...editingSettings };
                            newSettings.ownerContractRates[propertyId] = parseInt(e.target.value);
                            setEditingSettings(newSettings);
                          }}
                          className="w-16 h-8"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    ) : (
                      <span className="font-medium">{rate}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agent Commission Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Commission Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium mb-2">Referral Agent Rate</h4>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      value={currentSettings.agentCommissionRates?.referral || 5}
                      onChange={(e) => {
                        const newSettings = { ...editingSettings };
                        newSettings.agentCommissionRates.referral = parseInt(e.target.value);
                        setEditingSettings(newSettings);
                      }}
                      className="w-20"
                    />
                    <span>% of booking value</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">{currentSettings.agentCommissionRates?.referral || 5}%</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Commission for referred bookings
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium mb-2">Retail Agent Rate</h4>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      value={currentSettings.agentCommissionRates?.retail || 7}
                      onChange={(e) => {
                        const newSettings = { ...editingSettings };
                        newSettings.agentCommissionRates.retail = parseInt(e.target.value);
                        setEditingSettings(newSettings);
                      }}
                      className="w-20"
                    />
                    <span>% of booking value</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">{currentSettings.agentCommissionRates?.retail || 7}%</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Commission for direct sales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Wage Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Wage Rates (Monthly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(currentSettings.staffWageRates || {}).map(([staffId, rate]: [string, any]) => {
              const staff = users.find((u: any) => u.id === staffId);
              const staffName = staff ? `${staff.firstName} ${staff.lastName}` : staffId;
              
              return (
                <div key={staffId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{staffName}</div>
                    <div className="text-sm text-muted-foreground">Staff Member</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Monthly Rate:</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span>$</span>
                        <Input
                          type="number"
                          value={rate}
                          onChange={(e) => {
                            const newSettings = { ...editingSettings };
                            newSettings.staffWageRates[staffId] = parseInt(e.target.value);
                            setEditingSettings(newSettings);
                          }}
                          className="w-24 h-8"
                        />
                      </div>
                    ) : (
                      <span className="font-medium">${rate.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}