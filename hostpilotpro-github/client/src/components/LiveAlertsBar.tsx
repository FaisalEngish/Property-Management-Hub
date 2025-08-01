import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CreditCard, Users, Clock } from 'lucide-react';

interface LiveAlert {
  overdueTasks: any[];
  unpaidBills: any[];
  guestIssues: any[];
}

export function LiveAlertsBar() {
  const { data: alerts, isLoading } = useQuery<LiveAlert>({
    queryKey: ['/api/dashboard/live-alerts'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });

  if (isLoading || !alerts) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading alerts...</span>
        </div>
      </div>
    );
  }

  const hasAlerts = alerts.overdueTasks.length > 0 || alerts.unpaidBills.length > 0 || alerts.guestIssues.length > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">All systems operational</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Live Alerts</h3>
          <div className="flex flex-wrap gap-3">
            {alerts.overdueTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <Badge variant="destructive" className="text-xs">
                  {alerts.overdueTasks.length} Overdue Tasks
                </Badge>
              </div>
            )}
            {alerts.unpaidBills.length > 0 && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  {alerts.unpaidBills.length} Unpaid Bills
                </Badge>
              </div>
            )}
            {alerts.guestIssues.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  {alerts.guestIssues.length} Guest Issues
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}