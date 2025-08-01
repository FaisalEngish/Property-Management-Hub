import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Eye, History, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface ViewChangeHistoryProps {
  entityType: string;
  entityId: string;
  className?: string;
}

interface AuditLog {
  id: number;
  userId: string;
  userRole: string;
  userName: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityDescription?: string;
  oldValues?: any;
  newValues?: any;
  changeReason?: string;
  impersonatedUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: string;
  isOverride: boolean;
  createdAt: string;
}

const severityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const actionTypeIcons = {
  create: "➕",
  update: "✏️",
  delete: "🗑️",
  approve: "✅",
  override: "⚡",
  impersonate: "👤",
  end_impersonate: "🚪",
  balance_override: "💰",
  login: "🔐",
  logout: "🚪"
};

export default function ViewChangeHistory({ entityType, entityId, className = "" }: ViewChangeHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only show to admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  const { data: changeHistory = [], isLoading } = useQuery({
    queryKey: [`/api/admin/audit-trail/entity/${entityType}/${entityId}`],
    enabled: isOpen // Only fetch when dialog is opened
  });

  const getValueDiff = (oldVal: any, newVal: any) => {
    if (!oldVal || !newVal) return null;
    
    const oldKeys = Object.keys(oldVal);
    const newKeys = Object.keys(newVal);
    const allKeys = [...new Set([...oldKeys, ...newKeys])];
    
    return allKeys.map(key => {
      const oldValue = oldVal[key];
      const newValue = newVal[key];
      
      if (oldValue !== newValue) {
        return (
          <div key={key} className="grid grid-cols-3 gap-2 text-xs">
            <span className="font-medium">{key}:</span>
            <span className="text-red-600 line-through">{String(oldValue || 'null')}</span>
            <span className="text-green-600">{String(newValue || 'null')}</span>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={`${className} h-8 px-2`}>
          <History className="h-4 w-4 mr-1" />
          <span className="text-xs">View History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Change History: {entityType} #{entityId}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : changeHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No change history found for this record.</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {changeHistory.map((log: AuditLog, index: number) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <span className="text-lg">
                            {actionTypeIcons[log.actionType as keyof typeof actionTypeIcons] || "📝"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{log.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.userRole}
                            </Badge>
                            <Badge className={`text-xs ${severityColors[log.severity as keyof typeof severityColors]}`}>
                              {log.severity}
                            </Badge>
                            {log.isOverride && (
                              <Badge variant="destructive" className="text-xs">
                                ADMIN OVERRIDE
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-primary mb-1">
                            {log.actionType.charAt(0).toUpperCase() + log.actionType.slice(1)} Action
                          </p>
                          {log.entityDescription && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.entityDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(parseISO(log.createdAt), "MMM dd, yyyy 'at' h:mm:ss a")}
                            </span>
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {log.changeReason && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <label className="text-sm font-medium text-blue-900">Reason for Change:</label>
                        <p className="text-sm text-blue-800 mt-1">{log.changeReason}</p>
                      </div>
                    )}

                    {log.impersonatedUserId && (
                      <div className="bg-purple-50 p-3 rounded-md">
                        <label className="text-sm font-medium text-purple-900">Impersonation:</label>
                        <p className="text-sm text-purple-800 mt-1">
                          Action performed while impersonating user: {log.impersonatedUserId}
                        </p>
                      </div>
                    )}

                    {log.oldValues && log.newValues && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Value Changes:</label>
                        <div className="bg-muted p-3 rounded-md space-y-1">
                          <div className="grid grid-cols-3 gap-2 text-xs font-medium border-b pb-1">
                            <span>Field</span>
                            <span className="text-red-600">Previous</span>
                            <span className="text-green-600">New</span>
                          </div>
                          {getValueDiff(log.oldValues, log.newValues)}
                        </div>
                      </div>
                    )}

                    {log.oldValues && !log.newValues && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Deleted Values:</label>
                        <div className="bg-red-50 p-3 rounded-md">
                          <pre className="text-xs text-red-800">
                            {JSON.stringify(log.oldValues, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {!log.oldValues && log.newValues && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Created Values:</label>
                        <div className="bg-green-50 p-3 rounded-md">
                          <pre className="text-xs text-green-800">
                            {JSON.stringify(log.newValues, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {index < changeHistory.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}