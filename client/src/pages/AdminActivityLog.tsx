import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, Eye, Filter, Search, Shield, User, UserCheck } from "lucide-react";
import { format, parseISO } from "date-fns";

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

interface BalanceOverride {
  id: number;
  targetUserId: string;
  targetUserRole: string;
  adminUserId: string;
  adminUserName: string;
  overrideType: string;
  entityType: string;
  previousValue: string;
  newValue: string;
  adjustmentAmount: string;
  reason: string;
  createdAt: string;
}

interface ImpersonationSession {
  id: number;
  adminUserId: string;
  targetUserId: string;
  targetUserRole: string;
  reason: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
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

export default function AdminActivityLog() {
  const [filters, setFilters] = useState({
    entityType: "",
    actionType: "",
    severity: "",
    dateFrom: "",
    dateTo: "",
    userId: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit trail
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["/api/admin/audit-trail", filters],
    enabled: true
  });

  // Fetch balance override history
  const { data: balanceOverrides = [], isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/admin/balance-override-history"],
    enabled: true
  });

  // Fetch impersonation history
  const { data: impersonationHistory = [], isLoading: impersonationLoading } = useQuery({
    queryKey: ["/api/admin/impersonation-history"],
    enabled: true
  });

  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = !searchTerm || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const criticalActions = auditLogs.filter((log: AuditLog) => 
    log.severity === 'critical' || log.isOverride
  );

  const recentActions = auditLogs.slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Activity Log</h1>
          <p className="text-muted-foreground">
            Monitor all administrative actions and system changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Admin Dashboard</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Actions</p>
                <p className="text-2xl font-bold text-red-600">{criticalActions.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance Overrides</p>
                <p className="text-2xl font-bold text-orange-600">{balanceOverrides.length}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impersonations</p>
                <p className="text-2xl font-bold text-purple-600">{impersonationHistory.length}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="audit-trail" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit-trail">📋 Audit Trail</TabsTrigger>
          <TabsTrigger value="critical-actions">⚠️ Critical Actions</TabsTrigger>
          <TabsTrigger value="balance-overrides">💰 Balance Overrides</TabsTrigger>
          <TabsTrigger value="impersonations">👤 Impersonations</TabsTrigger>
        </TabsList>

        {/* Audit Trail Tab */}
        <TabsContent value="audit-trail" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users, actions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filters.entityType} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, entityType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Entities</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="booking">Bookings</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="property">Properties</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.actionType} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, actionType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="override">Override</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.severity} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, severity: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  placeholder="From Date"
                />

                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  placeholder="To Date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit Log List */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredLogs.map((log: AuditLog) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <span className="text-lg">
                              {actionTypeIcons[log.actionType as keyof typeof actionTypeIcons] || "📝"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.userRole}
                              </Badge>
                              <Badge className={`text-xs ${severityColors[log.severity as keyof typeof severityColors]}`}>
                                {log.severity}
                              </Badge>
                              {log.isOverride && (
                                <Badge variant="destructive" className="text-xs">
                                  OVERRIDE
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.entityDescription || `${log.actionType} ${log.entityType} ${log.entityId}`}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {format(parseISO(log.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                              </span>
                              <span>{log.entityType}</span>
                              {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                            </div>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Action Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">User</label>
                                  <p className="text-sm text-muted-foreground">{log.userName} ({log.userRole})</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Action</label>
                                  <p className="text-sm text-muted-foreground">{log.actionType}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Entity</label>
                                  <p className="text-sm text-muted-foreground">{log.entityType} #{log.entityId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Timestamp</label>
                                  <p className="text-sm text-muted-foreground">
                                    {format(parseISO(log.createdAt), "MMM dd, yyyy 'at' h:mm:ss a")}
                                  </p>
                                </div>
                              </div>
                              
                              {log.changeReason && (
                                <div>
                                  <label className="text-sm font-medium">Reason</label>
                                  <p className="text-sm text-muted-foreground">{log.changeReason}</p>
                                </div>
                              )}

                              {log.oldValues && (
                                <div>
                                  <label className="text-sm font-medium">Previous Values</label>
                                  <pre className="text-xs bg-muted p-2 rounded mt-1">
                                    {JSON.stringify(log.oldValues, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.newValues && (
                                <div>
                                  <label className="text-sm font-medium">New Values</label>
                                  <pre className="text-xs bg-muted p-2 rounded mt-1">
                                    {JSON.stringify(log.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.impersonatedUserId && (
                                <div>
                                  <label className="text-sm font-medium">Impersonated User</label>
                                  <p className="text-sm text-muted-foreground">{log.impersonatedUserId}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Actions Tab */}
        <TabsContent value="critical-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical & Override Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {criticalActions.map((log: AuditLog) => (
                    <div key={log.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{log.userName}</span>
                        <Badge variant="destructive" className="text-xs">
                          {log.isOverride ? "OVERRIDE" : "CRITICAL"}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{log.entityDescription}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(log.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Overrides Tab */}
        <TabsContent value="balance-overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Balance Override History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {balanceOverrides.map((override: BalanceOverride) => (
                    <div key={override.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{override.adminUserName}</span>
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {override.overrideType} for {override.targetUserRole} {override.targetUserId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${override.previousValue} → ${override.newValue}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Adjustment: ${override.adjustmentAmount}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{override.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(override.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impersonations Tab */}
        <TabsContent value="impersonations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                User Impersonation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {impersonationHistory.map((session: ImpersonationSession) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Admin {session.adminUserId}</span>
                            <Badge variant={session.isActive ? "default" : "secondary"} className="text-xs">
                              {session.isActive ? "Active" : "Ended"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Impersonated: {session.targetUserRole} {session.targetUserId}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Started: {format(parseISO(session.startedAt), "MMM dd, h:mm a")}</p>
                          {session.endedAt && (
                            <p>Ended: {format(parseISO(session.endedAt), "MMM dd, h:mm a")}</p>
                          )}
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-sm text-muted-foreground">{session.reason}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}