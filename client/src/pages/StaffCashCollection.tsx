import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Camera, CheckCircle, Receipt, DollarSign, Clock, MapPin, User, Building, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

export default function StaffCashCollection() {
  const { formatWithConversion } = useCurrency();
  const [isRecordCollectionOpen, setIsRecordCollectionOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending checkouts from API
  const { data: pendingCheckouts = [] } = useQuery<any[]>({
    queryKey: ["/api/staff-cash-collection/pending"],
  });

  // Fetch completed collections from API
  const { data: completedCollections = [] } = useQuery<any[]>({
    queryKey: ["/api/staff-cash-collection/completed"],
  });

  const recordCollectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/staff-wallet/cash-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record cash collection');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Cash collection recorded and added to your wallet" });
      setIsRecordCollectionOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff-cash-collection"] });
    }
  });

  const handleRecordCollection = (checkout: any) => {
    setSelectedCheckout(checkout);
    setIsRecordCollectionOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Collection Tracker</h1>
          <p className="text-gray-600">Track cash collections from guest check-outs</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <CreditCard className="w-4 h-4 mr-1" />
          Cash Tracker
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Collections ({pendingCheckouts.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedCollections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Cash Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingCheckouts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending cash collections</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCheckouts.map((checkout) => (
                    <div key={checkout.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{checkout.guestName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {checkout.propertyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {checkout.checkoutDate} at {checkout.checkoutTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-blue-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {checkout.electricityReading.start} → {checkout.electricityReading.end} kWh
                              </span>
                              <span>
                                Usage: {checkout.electricityReading.end - checkout.electricityReading.start} kWh × {formatWithConversion(checkout.electricityReading.rate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatWithConversion(checkout.estimatedCash)}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">Expected cash</p>
                          <Button 
                            onClick={() => handleRecordCollection(checkout)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            Collect Cash
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedCollections.map((collection) => (
                  <div key={collection.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{collection.guestName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {collection.propertyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {collection.checkoutDate} at {collection.collectionTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Collected by: {collection.collectedBy}</span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {collection.electricityUsage} kWh
                            </span>
                            {collection.receiptPhoto && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Camera className="w-4 h-4" />
                                Receipt photo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatWithConversion(collection.cashCollected)}
                        </p>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Added to wallet
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Collection Dialog */}
      <Dialog open={isRecordCollectionOpen} onOpenChange={setIsRecordCollectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Cash Collection</DialogTitle>
          </DialogHeader>
          {selectedCheckout && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">{selectedCheckout.guestName}</p>
                    <p className="text-sm text-gray-600">{selectedCheckout.propertyName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Electricity Usage</p>
                    <p className="font-semibold">
                      {selectedCheckout.electricityReading.end - selectedCheckout.electricityReading.start} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Amount</p>
                    <p className="font-semibold text-green-600">
                      {formatWithConversion(selectedCheckout.estimatedCash)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Actual Amount Collected (THB)</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedCheckout.estimatedCash}
                  placeholder="Enter actual amount collected"
                />
              </div>

              <div>
                <Label>Collection Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="How was payment collected?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Payment</SelectItem>
                    <SelectItem value="card_cash">Card + Cash</SelectItem>
                    <SelectItem value="transfer_cash">Bank Transfer + Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Receipt Photo (Optional)</Label>
                <Input type="file" accept="image/*" />
                <p className="text-xs text-gray-500 mt-1">Take a photo of the receipt or payment proof</p>
              </div>

              <div>
                <Label>Collection Notes</Label>
                <Textarea 
                  placeholder="Any additional notes about the collection..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRecordCollectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => recordCollectionMutation.mutate({})}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Record & Add to Wallet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}