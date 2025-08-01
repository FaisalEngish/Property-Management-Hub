import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Upload, Camera, FileText, DollarSign, Clock, User, CheckCircle, AlertTriangle, LogIn, LogOut, Zap, Settings, BarChart } from "lucide-react";
import { format } from "date-fns";

export default function CheckInCheckOutWorkflow() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  // Check-ins Query
  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["/api/checkins"],
    retry: false,
  });

  // Check-outs Query
  const { data: checkOuts = [], isLoading: checkOutsLoading } = useQuery({
    queryKey: ["/api/checkouts"],
    retry: false,
  });

  // Demo Tasks Query - using checkins data as placeholder
  const { data: demoTasks = [], isLoading: demoTasksLoading } = useQuery({
    queryKey: ["/api/checkins"],
    retry: false,
  });

  // Properties Query for filtering
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'management':
        return <User className="h-4 w-4" />;
      case 'housekeeping':
        return <CheckCircle className="h-4 w-4" />;
      case 'pool':
        return <Zap className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: string | number, currency = 'THB') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Check-in Completion Dialog Component
  const CheckInCompletionDialog = ({ checkIn, onComplete }: { checkIn: any; onComplete: (id: number, data: any) => void }) => {
    const [formData, setFormData] = useState({
      electricMeterReading: '',
      meterReadingMethod: 'manual',
      guestNames: [''],
      passportNumbers: [''],
      depositType: 'none',
      depositAmount: '',
      depositCurrency: 'THB',
      completionNotes: '',
    });

    const handleSubmit = () => {
      onComplete(checkIn.id, formData);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete Check-in
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Complete Guest Check-in
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Electric Meter Reading */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Electric Meter Reading (kWh)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading">Current Reading</Label>
                  <Input
                    id="reading"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={formData.electricMeterReading}
                    onChange={(e) => setFormData({ ...formData, electricMeterReading: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="method">Reading Method</Label>
                  <Select value={formData.meterReadingMethod} onValueChange={(value) => setFormData({ ...formData, meterReadingMethod: value })}>
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
            </div>

            {/* Guest Information */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Guest Information
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input
                    id="guestName"
                    placeholder="Full name from passport"
                    value={formData.guestNames[0]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      guestNames: [e.target.value, ...formData.guestNames.slice(1)]
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    placeholder="Passport number"
                    value={formData.passportNumbers[0]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      passportNumbers: [e.target.value, ...formData.passportNumbers.slice(1)]
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Deposit Information */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Security Deposit
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="depositType">Deposit Type</Label>
                  <Select value={formData.depositType} onValueChange={(value) => setFormData({ ...formData, depositType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Deposit</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="digital">Digital Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.depositType !== 'none' && (
                  <>
                    <div>
                      <Label htmlFor="depositAmount">Amount</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        placeholder="0.00"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="depositCurrency">Currency</Label>
                      <Select value={formData.depositCurrency} onValueChange={(value) => setFormData({ ...formData, depositCurrency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Completion Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or observations..."
                value={formData.completionNotes}
                onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Complete Check-in
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Check-out Completion Dialog Component  
  const CheckOutCompletionDialog = ({ checkOut, onComplete }: { checkOut: any; onComplete: (id: number, data: any) => void }) => {
    const [formData, setFormData] = useState({
      electricMeterReading: '',
      meterReadingMethod: 'manual',
      paymentStatus: 'included',
      paymentMethod: '',
      discountAmount: '',
      discountReason: '',
      completionNotes: '',
      handlerComments: '',
    });

    const handleSubmit = () => {
      onComplete(checkOut.id, formData);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <LogOut className="h-4 w-4 mr-1" />
            Complete Check-out
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Complete Guest Check-out
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Electric Meter Reading */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Final Electric Meter Reading (kWh)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reading">Final Reading</Label>
                  <Input
                    id="reading"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={formData.electricMeterReading}
                    onChange={(e) => setFormData({ ...formData, electricMeterReading: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="method">Reading Method</Label>
                  <Select value={formData.meterReadingMethod} onValueChange={(value) => setFormData({ ...formData, meterReadingMethod: value })}>
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
            </div>

            {/* Payment Status */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Electricity Payment
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="included">Included in Stay</SelectItem>
                      <SelectItem value="paid_by_guest">Paid by Guest</SelectItem>
                      <SelectItem value="not_charged">Not Charged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.paymentStatus === 'paid_by_guest' && (
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="digital">Digital Payment</SelectItem>
                        <SelectItem value="deducted_from_deposit">Deducted from Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Discount (Optional)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountAmount">Discount Amount (THB)</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="discountReason">Discount Reason</Label>
                  <Select value={formData.discountReason} onValueChange={(value) => setFormData({ ...formData, discountReason: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="power_outage">Power Outage</SelectItem>
                      <SelectItem value="goodwill_gesture">Goodwill Gesture</SelectItem>
                      <SelectItem value="maintenance_issue">Maintenance Issue</SelectItem>
                      <SelectItem value="guest_complaint">Guest Complaint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="completionNotes">Completion Notes</Label>
                <Textarea
                  id="completionNotes"
                  placeholder="Any observations about the check-out process..."
                  value={formData.completionNotes}
                  onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="handlerComments">Handler Comments</Label>
                <Textarea
                  id="handlerComments"
                  placeholder="Private comments for internal reference..."
                  value={formData.handlerComments}
                  onChange={(e) => setFormData({ ...formData, handlerComments: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Complete Check-out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Complete Check-in Mutation
  const completeCheckInMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/guest-checkins/${id}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkins"] });
      toast({
        title: "Check-in Completed",
        description: "Guest check-in has been successfully completed.",
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

  // Complete Check-out Mutation
  const completeCheckOutMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/guest-checkouts/${id}/complete`, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-checkouts"] });
      
      if (response.depositRefundAlert) {
        toast({
          title: "Check-out Completed with Alert",
          description: "Manual deposit refund required for non-THB currency.",
          variant: "default",
        });
      } else {
        toast({
          title: "Check-out Completed",
          description: "Guest check-out has been successfully completed.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete check-out",
        variant: "destructive",
      });
    },
  });

  // Complete Demo Task Mutation
  const completeDemoTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/checkin-checkout-demo-tasks/${id}/complete`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkin-checkout-demo-tasks"] });
      toast({
        title: "Task Completed",
        description: "Demo task has been marked as completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access the check-in/check-out workflow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            Check-in/Check-out Workflow
          </h1>
          <p className="text-gray-600 mt-1">
            Manage guest arrivals, departures, and electric meter readings with OCR automation
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="checkins" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Check-ins
          </TabsTrigger>
          <TabsTrigger value="checkouts" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Check-outs
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Demo Tasks
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
                <LogIn className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {checkIns.filter((c: any) => c.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Awaiting staff assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Pending Check-outs</CardTitle>
                <LogOut className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {checkOuts.filter((c: any) => c.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Awaiting completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {demoTasks.filter((t: any) => t.status !== 'completed').length}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Across all departments
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest check-in/check-out workflow activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...checkIns.slice(0, 3), ...checkOuts.slice(0, 3)]
                  .sort((a: any, b: any) => new Date(b.createdAt || b.scheduledDate).getTime() - new Date(a.createdAt || a.scheduledDate).getTime())
                  .slice(0, 5)
                  .map((item: any) => (
                    <div key={`${item.id}-${item.checkInId ? 'out' : 'in'}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.checkInId ? (
                          <LogOut className="h-5 w-5 text-red-500" />
                        ) : (
                          <LogIn className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {item.checkInId ? 'Check-out' : 'Check-in'} - Property #{item.propertyId}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(item.scheduledDate), 'MMM dd, yyyy at HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Guest Check-ins
              </CardTitle>
              <CardDescription>
                Manage guest arrivals with passport documentation and electric meter readings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkInsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : checkIns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <LogIn className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No check-ins found</p>
                  </div>
                ) : (
                  checkIns.map((checkIn: any) => (
                    <div key={checkIn.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <LogIn className="h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">Property #{checkIn.propertyId}</h3>
                            <p className="text-sm text-gray-600">
                              Scheduled: {format(new Date(checkIn.scheduledDate), 'MMM dd, yyyy at HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(checkIn.status)}>
                            {checkIn.status.replace('_', ' ')}
                          </Badge>
                          {checkIn.status === 'pending' && user?.role === 'staff' && (
                            <CheckInCompletionDialog 
                              checkIn={checkIn}
                              onComplete={(id, data) => completeCheckInMutation.mutate({ id, data })}
                            />
                          )}
                        </div>
                      </div>
                      
                      {checkIn.status === 'completed' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Electric Reading</p>
                            <p className="font-medium">{checkIn.electricMeterReading} kWh</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Guest Names</p>
                            <p className="font-medium">{checkIn.guestNames?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deposit</p>
                            <p className="font-medium">
                              {checkIn.depositType === 'none' ? 'No Deposit' : 
                               `${formatCurrency(checkIn.depositAmount, checkIn.depositCurrency)}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Method</p>
                            <p className="font-medium">{checkIn.meterReadingMethod?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      )}
                      
                      {checkIn.completionNotes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm">{checkIn.completionNotes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Guest Check-outs
              </CardTitle>
              <CardDescription>
                Process guest departures with electricity billing and payment collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkOutsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : checkOuts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <LogOut className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No check-outs found</p>
                  </div>
                ) : (
                  checkOuts.map((checkOut: any) => (
                    <div key={checkOut.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <LogOut className="h-5 w-5 text-red-500" />
                          <div>
                            <h3 className="font-semibold">Property #{checkOut.propertyId}</h3>
                            <p className="text-sm text-gray-600">
                              Scheduled: {format(new Date(checkOut.scheduledDate), 'MMM dd, yyyy at HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(checkOut.status)}>
                            {checkOut.status.replace('_', ' ')}
                          </Badge>
                          {checkOut.status === 'pending' && user?.role === 'staff' && (
                            <CheckOutCompletionDialog 
                              checkOut={checkOut}
                              onComplete={(id, data) => completeCheckOutMutation.mutate({ id, data })}
                            />
                          )}
                        </div>
                      </div>
                      
                      {checkOut.status === 'completed' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-sm text-gray-600">Electric Usage</p>
                            <p className="font-medium">{checkOut.electricityUsed} kWh</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Charge</p>
                            <p className="font-medium">
                              {formatCurrency(checkOut.totalElectricityCharge)}
                              {checkOut.discountAmount > 0 && (
                                <span className="text-sm text-green-600 ml-1">
                                  (-{formatCurrency(checkOut.discountAmount)})
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <p className="font-medium">{checkOut.paymentStatus?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Rate</p>
                            <p className="font-medium">{checkOut.electricityRatePerKwh} THB/kWh</p>
                          </div>
                        </div>
                      )}
                      
                      {(checkOut.discountReason || checkOut.handlerComments) && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {checkOut.discountReason && (
                            <div>
                              <p className="text-sm text-gray-600">Discount Reason</p>
                              <p className="text-sm">{checkOut.discountReason}</p>
                            </div>
                          )}
                          {checkOut.handlerComments && (
                            <div>
                              <p className="text-sm text-gray-600">Handler Comments</p>
                              <p className="text-sm">{checkOut.handlerComments}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Check-in/Check-out Demo Tasks
              </CardTitle>
              <CardDescription>
                Role-specific tasks for pool staff, housekeepers, hosting staff, and managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoTasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : demoTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No demo tasks found</p>
                  </div>
                ) : (
                  demoTasks.map((task: any) => (
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getDepartmentIcon(task.department)}
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {task.department}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.status === 'pending' && user?.role === 'staff' && (
                            <Button 
                              size="sm" 
                              onClick={() => completeDemoTaskMutation.mutate({ 
                                id: task.id, 
                                data: { completionNotes: 'Task completed via workflow interface' }
                              })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t text-sm">
                        <div>
                          <p className="text-gray-600">Task Type</p>
                          <p className="font-medium">{task.taskType?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Assigned Role</p>
                          <p className="font-medium">{task.assignedRole}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-medium">
                            {format(new Date(task.dueDate), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{task.estimatedDuration || 30} min</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workflow Settings
              </CardTitle>
              <CardDescription>
                Configure electricity rates, OCR settings, and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Electricity Settings
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="defaultRate">Default Rate (THB per kWh)</Label>
                        <Input
                          id="defaultRate"
                          type="number"
                          step="0.01"
                          defaultValue="7.00"
                          placeholder="7.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="THB">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      OCR Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoOcr">Auto OCR Processing</Label>
                        <input type="checkbox" id="autoOcr" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="manualOverride">Manual Override Allowed</Label>
                        <input type="checkbox" id="manualOverride" defaultChecked />
                      </div>
                      <div>
                        <Label htmlFor="confidence">Minimum Confidence (%)</Label>
                        <Input
                          id="confidence"
                          type="number"
                          min="50"
                          max="100"
                          defaultValue="85"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Notification Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Deposit Refund Alerts</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>High Usage Warnings</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Task Assignment Notifications</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Completion Confirmations</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}