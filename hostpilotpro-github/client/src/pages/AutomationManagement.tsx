import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Clock, 
  DollarSign, 
  Bell, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause
} from "lucide-react";

interface AutomationStatus {
  commissionAutomation: boolean;
  utilityAlerts: boolean;
  lastRun: {
    commissionCheck: string;
    utilityCheck: string;
  };
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
    createdAt: string;
  }>;
}

export default function AutomationManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus>({
    commissionAutomation: true,
    utilityAlerts: true,
    lastRun: {
      commissionCheck: "2025-01-26 09:00:00",
      utilityCheck: "2025-01-26 09:00:00"
    },
    alerts: []
  });

  const handleTestCommissionAutomation = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/automation/test-commission");
      const data = response.data || {};
      
      toast({
        title: "Commission Test Complete",
        description: `Processed ${data.processed || 0} bookings`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not run commission automation test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUtilityAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/automation/test-utility-alerts");
      const data = response.data || {};
      
      toast({
        title: "Utility Alert Test Complete", 
        description: `Generated ${data.alerts || 0} alerts`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not run utility alerts test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAutomationStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/automation/status");
      const data = response.data || {};
      
      setAutomationStatus(data);
      toast({
        title: "Status Updated",
        description: "Automation status refreshed",
      });
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "Could not get automation status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Automation Management
          </h1>
          <p className="text-gray-600 mt-2">Monitor and control commission automation and utility alert systems</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Commission Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {automationStatus.commissionAutomation ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Real-time processing</p>
                </div>
                <Badge variant={automationStatus.commissionAutomation ? "default" : "destructive"}>
                  {automationStatus.commissionAutomation ? "Live" : "Stopped"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Utility Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {automationStatus.utilityAlerts ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Daily 9:00 AM checks</p>
                </div>
                <Badge variant={automationStatus.utilityAlerts ? "default" : "destructive"}>
                  {automationStatus.utilityAlerts ? "Live" : "Stopped"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Manual Testing & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleTestCommissionAutomation}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Test Commission Automation
              </Button>
              
              <Button 
                onClick={handleTestUtilityAlerts}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Utility Alerts
              </Button>
              
              <Button 
                onClick={handleGetAutomationStatus}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Last Run Times */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Run Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Commission Processing</h3>
                <p className="text-sm text-gray-600">
                  Last Run: {automationStatus.lastRun.commissionCheck}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Runs automatically on booking confirmations
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Utility Alert Check</h3>
                <p className="text-sm text-gray-600">
                  Last Run: {automationStatus.lastRun.utilityCheck}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Runs daily at 9:00 AM + weekly Monday reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Current Alerts ({automationStatus.alerts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!automationStatus.alerts || automationStatus.alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                <p className="text-gray-600">
                  All automation systems are running smoothly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {automationStatus.alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">{alert.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{alert.createdAt}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={alert.severity === "high" ? "destructive" : "secondary"}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* System Information */}
        <div className="text-center text-sm text-gray-500">
          <p>Automation systems powered by node-cron scheduling</p>
          <p className="mt-1">Commission: 10% rates • Utility alerts: Daily checks • Auto-payouts: ฿5,000 threshold</p>
        </div>
      </div>
    </div>
  );
}