import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Luggage, 
  Calendar, 
  Camera, 
  FileText, 
  Calculator, 
  DollarSign, 
  Clock, 
  User, 
  MapPin, 
  Zap,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Timer,
  Upload,
  Eye
} from "lucide-react";

interface GuestCheckIn {
  id: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests: number;
  checkInDate: string;
  assignedStaff?: string;
  staffName?: string;
  passportPhotos?: string[];
  passportNumbers?: string[];
  passportNames?: string[];
  depositType: string;
  depositAmount?: string;
  depositCurrency: string;
  depositPhotoUrl?: string;
  meterPhotoUrl?: string;
  meterReading?: string;
  meterReadingMethod: string;
  ocrConfidence?: string;
  checkInNotes?: string;
  taskStatus: string;
  completedAt?: string;
  completedBy?: string;
}

interface GuestCheckOut {
  id: number;
  checkInId: number;
  checkOutDate: string;
  assignedStaff?: string;
  staffName?: string;
  finalMeterPhotoUrl?: string;
  finalMeterReading?: string;
  finalMeterReadingMethod: string;
  finalOcrConfidence?: string;
  unitsUsed?: string;
  ratePerKwh?: string;
  totalElectricityCost?: string;
  electricityBilling: string;
  companyCompensationReason?: string;
  depositPaid?: string;
  electricityCost?: string;
  discounts?: string;
  discountReason?: string;
  damageCosts?: string;
  damageCostReason?: string;
  finalRefundAmount?: string;
  refundMethod?: string;
  refundReceiptUrl?: string;
  refundStatus: string;
  refundProcessedBy?: string;
  refundProcessedAt?: string;
  checkOutNotes?: string;
  taskStatus: string;
  completedAt?: string;
  completedBy?: string;
}

interface CheckInOutTask {
  id: number;
  taskType: string;
  taskTitle: string;
  taskDescription?: string;
  checkInId?: number;
  checkOutId?: number;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  scheduledDate?: string;
  status: string;
  priority: string;
  startedAt?: string;
  completedAt?: string;
  completionNotes?: string;
  requiresApproval: boolean;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
}

interface CheckInOutHistory {
  id: number;
  entryType: string;
  entryTitle: string;
  entryDescription?: string;
  entryIcon: string;
  checkInId?: number;
  checkOutId?: number;
  taskId?: number;
  actionBy: string;
  actionByName: string;
  visibleToOwner: boolean;
  visibleToStaff: boolean;
  visibleToGuests: boolean;
  additionalData?: any;
  createdAt: string;
}

export default function GuestCheckInCheckOutTracker() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(1);
  const [selectedCheckIn, setSelectedCheckIn] = useState<GuestCheckIn | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<GuestCheckOut | null>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch check-ins data with proper error handling
  const { data: checkInsRaw = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["/api/checkins", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/checkins`),
    retry: false,
  });

  // Fetch check-outs data with proper error handling
  const { data: checkOutsRaw = [], isLoading: checkOutsLoading } = useQuery({
    queryKey: ["/api/checkouts", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/checkouts`),
    retry: false,
  });

  // Fetch tasks data with proper error handling - using checkins as placeholder
  const { data: tasksRaw = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/checkins-tasks", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/checkins`),
    retry: false,
  });

  // Fetch history data with proper error handling - using checkins as placeholder
  const { data: historyRaw = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/checkins-history", selectedPropertyId],
    queryFn: () => apiRequest("GET", `/api/checkins`),
    retry: false,
  });

  // Ensure data is always an array to prevent crashes
  const checkIns = Array.isArray(checkInsRaw) ? checkInsRaw : [];
  const checkOuts = Array.isArray(checkOutsRaw) ? checkOutsRaw : [];
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const history = Array.isArray(historyRaw) ? historyRaw : [];

  // Fetch properties for filter
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties"),
  });

  // Create check-in mutation
  const createCheckInMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/guest-checkin/check-ins", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/history"] });
      setShowCheckInDialog(false);
      toast({
        title: "Check-in Created",
        description: "Guest check-in has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create check-in",
        variant: "destructive",
      });
    },
  });

  // Create check-out mutation
  const createCheckOutMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/guest-checkin/check-outs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/check-outs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/history"] });
      setShowCheckOutDialog(false);
      toast({
        title: "Check-out Created",
        description: "Guest check-out has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create check-out",
        variant: "destructive",
      });
    },
  });

  // Complete check-in mutation
  const completeCheckInMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/guest-checkin/check-ins/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/check-ins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/history"] });
      toast({
        title: "Check-in Completed",
        description: "Guest check-in has been marked as completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete check-in",
        variant: "destructive",
      });
    },
  });

  // Complete check-out mutation
  const completeCheckOutMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/guest-checkin/check-outs/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/check-outs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/history"] });
      toast({
        title: "Check-out Completed",
        description: "Guest check-out has been marked as completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete check-out",
        variant: "destructive",
      });
    },
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: (data: { id: number; refundMethod: string; refundReceiptUrl?: string }) => 
      apiRequest("POST", `/api/guest-checkin/check-outs/${data.id}/process-refund`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/check-outs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkin/history"] });
      setShowRefundDialog(false);
      toast({
        title: "Refund Processed",
        description: "Deposit refund has been successfully processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    },
  });

  // Calculate electricity usage
  const calculateElectricityMutation = useMutation({
    mutationFn: (data: { checkInReading: number; checkOutReading: number; ratePerKwh: number }) => 
      apiRequest("POST", "/api/guest-checkin/calculate-electricity", data),
  });

  // Calculate refund amount
  const calculateRefundMutation = useMutation({
    mutationFn: (data: { depositAmount: number; electricityCost: number; discounts?: number; damageCosts?: number }) => 
      apiRequest("POST", "/api/guest-checkin/calculate-refund", data),
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-green-100 text-green-800",
      refused: "bg-red-100 text-red-800",
      processed: "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTaskTypeIcon = (taskType: string) => {
    return taskType === "check_in" ? <Luggage className="h-4 w-4" /> : <Luggage className="h-4 w-4 rotate-180" />;
  };

  const getEntryIcon = (entryIcon: string) => {
    const icons = {
      luggage: <Luggage className="h-4 w-4" />,
      "dollar-sign": <DollarSign className="h-4 w-4" />,
      calendar: <Calendar className="h-4 w-4" />,
      check: <CheckCircle className="h-4 w-4" />,
      alert: <AlertCircle className="h-4 w-4" />,
    };
    return icons[entryIcon as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  // Overview Tab Content
  const OverviewContent = () => {
    const todayCheckIns = checkIns.filter((ci: GuestCheckIn) => 
      new Date(ci.checkInDate).toDateString() === new Date().toDateString()
    );
    
    const todayCheckOuts = checkOuts.filter((co: GuestCheckOut) => 
      new Date(co.checkOutDate).toDateString() === new Date().toDateString()
    );
    
    const pendingTasks = tasks.filter((task: CheckInOutTask) => task.status === "pending");
    const completedToday = [...checkIns, ...checkOuts].filter((item: any) => 
      item.completedAt && new Date(item.completedAt).toDateString() === new Date().toDateString()
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
              <Luggage className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCheckIns.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayCheckIns.filter((ci: GuestCheckIn) => ci.taskStatus === "completed").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
              <Luggage className="h-4 w-4 text-orange-600 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCheckOuts.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayCheckOuts.filter((co: GuestCheckOut) => co.taskStatus === "completed").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Timer className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTasks.filter((task: CheckInOutTask) => task.priority === "high").length} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday.length}</div>
              <p className="text-xs text-muted-foreground">All processes</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest check-in and check-out activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 5).map((entry: CheckInOutHistory) => (
                <div key={entry.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getEntryIcon(entry.entryIcon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{entry.entryTitle}</p>
                    <p className="text-sm text-gray-500">{entry.entryDescription}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Check-ins Tab Content
  const CheckInsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Guest Check-ins</h3>
        <Button onClick={() => setShowCheckInDialog(true)}>
          <Luggage className="h-4 w-4 mr-2" />
          New Check-in
        </Button>
      </div>

      <div className="grid gap-6">
        {checkInsLoading ? (
          <div className="text-center py-8">Loading check-ins...</div>
        ) : checkIns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No check-ins found</div>
        ) : (
          checkIns.map((checkIn: GuestCheckIn) => (
            <Card key={checkIn.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{checkIn.guestName}</CardTitle>
                    <CardDescription>
                      Check-in: {new Date(checkIn.checkInDate).toLocaleDateString()} • 
                      {checkIn.numberOfGuests} guest{checkIn.numberOfGuests > 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(checkIn.taskStatus)}
                    {checkIn.taskStatus !== "completed" && (
                      <Button 
                        size="sm" 
                        onClick={() => completeCheckInMutation.mutate(checkIn.id)}
                        disabled={completeCheckInMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Contact Info</Label>
                    <div className="text-sm text-gray-600">
                      {checkIn.guestEmail && <div>📧 {checkIn.guestEmail}</div>}
                      {checkIn.guestPhone && <div>📞 {checkIn.guestPhone}</div>}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Deposit</Label>
                    <div className="text-sm text-gray-600">
                      {checkIn.depositType === "none" ? (
                        "No deposit"
                      ) : (
                        <div>
                          {checkIn.depositType.toUpperCase()}: {checkIn.depositAmount} {checkIn.depositCurrency}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Meter Reading</Label>
                    <div className="text-sm text-gray-600">
                      {checkIn.meterReading ? (
                        <div>
                          {checkIn.meterReading} kWh
                          {checkIn.meterReadingMethod === "ocr_auto" && checkIn.ocrConfidence && (
                            <div className="text-xs text-green-600">
                              OCR: {parseFloat(checkIn.ocrConfidence).toFixed(1)}% confidence
                            </div>
                          )}
                        </div>
                      ) : (
                        "Not recorded"
                      )}
                    </div>
                  </div>
                </div>

                {checkIn.passportPhotos && checkIn.passportPhotos.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Passport Documentation</Label>
                    <div className="flex space-x-2 mt-2">
                      {checkIn.passportPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={photo} 
                            alt={`Passport ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(photo, '_blank')}
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    {checkIn.passportNumbers && (
                      <div className="text-xs text-gray-500 mt-1">
                        Passport Numbers: {checkIn.passportNumbers.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {checkIn.checkInNotes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-gray-600 mt-1">{checkIn.checkInNotes}</p>
                  </div>
                )}

                {checkIn.completedAt && (
                  <div className="mt-4 text-sm text-green-600">
                    ✅ Completed on {new Date(checkIn.completedAt).toLocaleString()} by {checkIn.staffName || checkIn.completedBy}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Check-outs Tab Content
  const CheckOutsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Guest Check-outs</h3>
        <Button onClick={() => setShowCheckOutDialog(true)}>
          <Luggage className="h-4 w-4 mr-2 rotate-180" />
          New Check-out
        </Button>
      </div>

      <div className="grid gap-6">
        {checkOutsLoading ? (
          <div className="text-center py-8">Loading check-outs...</div>
        ) : checkOuts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No check-outs found</div>
        ) : (
          checkOuts.map((checkOut: GuestCheckOut) => (
            <Card key={checkOut.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Check-out #{checkOut.id}</CardTitle>
                    <CardDescription>
                      Check-out: {new Date(checkOut.checkOutDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(checkOut.taskStatus)}
                    {checkOut.taskStatus !== "completed" && (
                      <Button 
                        size="sm" 
                        onClick={() => completeCheckOutMutation.mutate(checkOut.id)}
                        disabled={completeCheckOutMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {checkOut.taskStatus === "completed" && checkOut.refundStatus === "pending" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedCheckOut(checkOut);
                          setShowRefundDialog(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Process Refund
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Electricity Usage</Label>
                    <div className="text-sm text-gray-600">
                      {checkOut.unitsUsed ? (
                        <div>
                          {checkOut.unitsUsed} kWh used
                          <div className="text-xs">@ {checkOut.ratePerKwh} THB/kWh</div>
                        </div>
                      ) : (
                        "Not calculated"
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Electricity Cost</Label>
                    <div className="text-sm text-gray-600">
                      {checkOut.totalElectricityCost ? (
                        <div className="font-medium text-orange-600">
                          {checkOut.totalElectricityCost} THB
                        </div>
                      ) : (
                        "Not calculated"
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Billing Method</Label>
                    <div className="text-sm text-gray-600">
                      <Badge variant="outline" className={
                        checkOut.electricityBilling === "included" ? "bg-green-50 text-green-700" :
                        checkOut.electricityBilling === "guest_pays" ? "bg-orange-50 text-orange-700" :
                        "bg-blue-50 text-blue-700"
                      }>
                        {checkOut.electricityBilling.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Final Refund</Label>
                    <div className="text-sm text-gray-600">
                      {checkOut.finalRefundAmount ? (
                        <div className="font-medium text-green-600">
                          {checkOut.finalRefundAmount} THB
                        </div>
                      ) : (
                        "Pending calculation"
                      )}
                    </div>
                  </div>
                </div>

                {checkOut.finalMeterReading && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Final Meter Reading</Label>
                    <div className="text-sm text-gray-600">
                      {checkOut.finalMeterReading} kWh
                      {checkOut.finalMeterReadingMethod === "ocr_auto" && checkOut.finalOcrConfidence && (
                        <span className="text-xs text-green-600 ml-2">
                          (OCR: {parseFloat(checkOut.finalOcrConfidence).toFixed(1)}% confidence)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(checkOut.discounts && parseFloat(checkOut.discounts) > 0) && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Discounts Applied</Label>
                    <div className="text-sm text-green-600">
                      -{checkOut.discounts} THB
                      {checkOut.discountReason && (
                        <div className="text-xs text-gray-500">{checkOut.discountReason}</div>
                      )}
                    </div>
                  </div>
                )}

                {(checkOut.damageCosts && parseFloat(checkOut.damageCosts) > 0) && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Damage Costs</Label>
                    <div className="text-sm text-red-600">
                      +{checkOut.damageCosts} THB
                      {checkOut.damageCostReason && (
                        <div className="text-xs text-gray-500">{checkOut.damageCostReason}</div>
                      )}
                    </div>
                  </div>
                )}

                {checkOut.refundStatus === "processed" && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Refund Status</Label>
                    <div className="text-sm text-green-600">
                      ✅ Processed via {checkOut.refundMethod?.toUpperCase()} on {checkOut.refundProcessedAt ? new Date(checkOut.refundProcessedAt).toLocaleString() : 'N/A'}
                      {checkOut.refundReceiptUrl && (
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="h-auto p-0 ml-2"
                          onClick={() => window.open(checkOut.refundReceiptUrl, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {checkOut.checkOutNotes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-gray-600 mt-1">{checkOut.checkOutNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Demo Tasks Tab Content
  const DemoTasksContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Check-in/Check-out Tasks</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Demo Mode
        </Badge>
      </div>

      <div className="grid gap-4">
        {tasksLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tasks found</div>
        ) : (
          tasks.map((task: CheckInOutTask) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTaskTypeIcon(task.taskType)}
                    <div>
                      <h4 className="font-medium">{task.taskTitle}</h4>
                      <p className="text-sm text-gray-500">{task.taskDescription}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={
                        task.priority === "high" ? "bg-red-50 text-red-700" :
                        task.priority === "normal" ? "bg-blue-50 text-blue-700" :
                        "bg-gray-50 text-gray-700"
                      }
                    >
                      {task.priority.toUpperCase()}
                    </Badge>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  Assigned to: <span className="font-medium">{task.assignedTo}</span>
                  {task.dueDate && (
                    <span className="ml-4">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {task.requiresApproval && (
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Requires Approval
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Settings Tab Content
  const SettingsContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Electricity & OCR Settings</CardTitle>
          <CardDescription>Configure default rates and OCR preferences for this property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate-per-kwh">Default Rate per kWh (THB)</Label>
              <Input id="rate-per-kwh" type="number" step="0.01" defaultValue="7.00" />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="THB">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB - Thai Baht</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ocr-provider">OCR Provider</Label>
              <Select defaultValue="openai_vision">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry Only</SelectItem>
                  <SelectItem value="openai_vision">OpenAI Vision API</SelectItem>
                  <SelectItem value="google_vision">Google Vision API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billing-default">Default Billing Method</Label>
              <Select defaultValue="included">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="included">Electricity Included</SelectItem>
                  <SelectItem value="guest_pays">Guest Pays</SelectItem>
                  <SelectItem value="company_compensates">Company Compensates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure when to receive notifications about check-in/out activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">New Check-in Created</Label>
              <p className="text-sm text-gray-500">Get notified when staff creates a new check-in</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Check-out Completed</Label>
              <p className="text-sm text-gray-500">Get notified when a check-out process is completed</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Refund Requires Approval</Label>
              <p className="text-sm text-gray-500">Get notified when a refund needs management approval</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">High Priority Tasks</Label>
              <p className="text-sm text-gray-500">Get notified about urgent check-in/out tasks</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div className="flex justify-end">
            <Button>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Luggage className="h-8 w-8 mr-3 text-blue-600" />
                Guest Check-In / Check-Out Tracker
              </h1>
              <p className="text-gray-600 mt-2">
                Automated guest arrival and departure management with OCR meter reading and refund calculations
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Select value={selectedPropertyId.toString()} onValueChange={(value) => setSelectedPropertyId(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="check-ins" className="flex items-center">
              <Luggage className="h-4 w-4 mr-2" />
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="check-outs" className="flex items-center">
              <Luggage className="h-4 w-4 mr-2 rotate-180" />
              Check-outs
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Demo Tasks
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewContent />
          </TabsContent>

          <TabsContent value="check-ins">
            <CheckInsContent />
          </TabsContent>

          <TabsContent value="check-outs">
            <CheckOutsContent />
          </TabsContent>

          <TabsContent value="tasks">
            <DemoTasksContent />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Check-in</DialogTitle>
            <DialogDescription>
              Register a new guest arrival with passport documentation and meter reading
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            createCheckInMutation.mutate({
              propertyId: selectedPropertyId,
              guestName: formData.get('guestName'),
              guestEmail: formData.get('guestEmail'),
              guestPhone: formData.get('guestPhone'),
              numberOfGuests: parseInt(formData.get('numberOfGuests') as string || '1'),
              checkInDate: formData.get('checkInDate'),
              depositType: formData.get('depositType'),
              depositAmount: formData.get('depositAmount'),
              depositCurrency: formData.get('depositCurrency') || 'THB',
              meterReading: formData.get('meterReading'),
              meterReadingMethod: formData.get('meterReadingMethod'),
              checkInNotes: formData.get('checkInNotes'),
              taskStatus: 'pending'
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName">Guest Name *</Label>
                  <Input id="guestName" name="guestName" required />
                </div>
                <div>
                  <Label htmlFor="numberOfGuests">Number of Guests</Label>
                  <Input id="numberOfGuests" name="numberOfGuests" type="number" defaultValue="1" min="1" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input id="guestEmail" name="guestEmail" type="email" />
                </div>
                <div>
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input id="guestPhone" name="guestPhone" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate">Check-in Date *</Label>
                  <Input 
                    id="checkInDate" 
                    name="checkInDate" 
                    type="datetime-local" 
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="depositType">Deposit Type</Label>
                  <Select name="depositType" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Deposit</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="digital">Digital/Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="depositAmount">Deposit Amount</Label>
                  <Input id="depositAmount" name="depositAmount" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="depositCurrency">Currency</Label>
                  <Select name="depositCurrency" defaultValue="THB">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meterReading">Meter Reading (kWh)</Label>
                  <Input id="meterReading" name="meterReading" type="number" step="0.1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="meterReadingMethod">Reading Method</Label>
                <Select name="meterReadingMethod" defaultValue="manual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    <SelectItem value="ocr_auto">OCR Automatic</SelectItem>
                    <SelectItem value="ocr_manual_override">OCR with Manual Override</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="checkInNotes">Check-in Notes</Label>
                <Textarea id="checkInNotes" name="checkInNotes" rows={3} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCheckInDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCheckInMutation.isPending}>
                {createCheckInMutation.isPending ? "Creating..." : "Create Check-in"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Check-out</DialogTitle>
            <DialogDescription>
              Process guest departure with final meter reading and refund calculation
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            createCheckOutMutation.mutate({
              propertyId: selectedPropertyId,
              checkInId: parseInt(formData.get('checkInId') as string),
              checkOutDate: formData.get('checkOutDate'),
              finalMeterReading: formData.get('finalMeterReading'),
              finalMeterReadingMethod: formData.get('finalMeterReadingMethod'),
              electricityBilling: formData.get('electricityBilling'),
              discounts: formData.get('discounts') || '0',
              discountReason: formData.get('discountReason'),
              damageCosts: formData.get('damageCosts') || '0',
              damageCostReason: formData.get('damageCostReason'),
              checkOutNotes: formData.get('checkOutNotes'),
              taskStatus: 'pending'
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInId">Associated Check-in *</Label>
                  <Select name="checkInId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select check-in..." />
                    </SelectTrigger>
                    <SelectContent>
                      {checkIns.filter((ci: GuestCheckIn) => ci.taskStatus === "completed").map((checkIn: GuestCheckIn) => (
                        <SelectItem key={checkIn.id} value={checkIn.id.toString()}>
                          #{checkIn.id} - {checkIn.guestName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="checkOutDate">Check-out Date *</Label>
                  <Input 
                    id="checkOutDate" 
                    name="checkOutDate" 
                    type="datetime-local" 
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="finalMeterReading">Final Meter Reading (kWh) *</Label>
                  <Input id="finalMeterReading" name="finalMeterReading" type="number" step="0.1" required />
                </div>
                <div>
                  <Label htmlFor="finalMeterReadingMethod">Reading Method</Label>
                  <Select name="finalMeterReadingMethod" defaultValue="manual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="ocr_auto">OCR Automatic</SelectItem>
                      <SelectItem value="ocr_manual_override">OCR with Manual Override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="electricityBilling">Electricity Billing Method *</Label>
                <Select name="electricityBilling" defaultValue="included" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="included">Electricity Included in Stay</SelectItem>
                    <SelectItem value="guest_pays">Guest Pays for Usage</SelectItem>
                    <SelectItem value="company_compensates">Company Compensates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discounts">Discounts (THB)</Label>
                  <Input id="discounts" name="discounts" type="number" step="0.01" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="damageCosts">Damage Costs (THB)</Label>
                  <Input id="damageCosts" name="damageCosts" type="number" step="0.01" defaultValue="0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountReason">Discount Reason</Label>
                  <Input id="discountReason" name="discountReason" placeholder="e.g., Long stay discount" />
                </div>
                <div>
                  <Label htmlFor="damageCostReason">Damage Cost Reason</Label>
                  <Input id="damageCostReason" name="damageCostReason" placeholder="e.g., Broken towel rack" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="checkOutNotes">Check-out Notes</Label>
                <Textarea id="checkOutNotes" name="checkOutNotes" rows={3} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCheckOutDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCheckOutMutation.isPending}>
                {createCheckOutMutation.isPending ? "Creating..." : "Create Check-out"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Processing Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Deposit Refund</DialogTitle>
            <DialogDescription>
              Complete the refund process for check-out #{selectedCheckOut?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCheckOut && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              processRefundMutation.mutate({
                id: selectedCheckOut.id,
                refundMethod: formData.get('refundMethod') as string,
                refundReceiptUrl: formData.get('refundReceiptUrl') as string,
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Refund Summary</h4>
                  <div className="text-sm space-y-1">
                    <div>Deposit Paid: <span className="font-medium">{selectedCheckOut.depositPaid} THB</span></div>
                    <div>Electricity Cost: <span className="font-medium text-orange-600">-{selectedCheckOut.electricityCost} THB</span></div>
                    {selectedCheckOut.discounts && parseFloat(selectedCheckOut.discounts) > 0 && (
                      <div>Discounts: <span className="font-medium text-green-600">+{selectedCheckOut.discounts} THB</span></div>
                    )}
                    {selectedCheckOut.damageCosts && parseFloat(selectedCheckOut.damageCosts) > 0 && (
                      <div>Damage Costs: <span className="font-medium text-red-600">-{selectedCheckOut.damageCosts} THB</span></div>
                    )}
                    <hr className="my-2" />
                    <div className="font-medium text-lg">
                      Final Refund: <span className="text-green-600">{selectedCheckOut.finalRefundAmount} THB</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="refundMethod">Refund Method *</Label>
                  <Select name="refundMethod" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="digital">Digital Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="refundReceiptUrl">Receipt Photo URL (Optional)</Label>
                  <Input id="refundReceiptUrl" name="refundReceiptUrl" placeholder="Upload receipt photo..." />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowRefundDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processRefundMutation.isPending}>
                  {processRefundMutation.isPending ? "Processing..." : "Process Refund"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}