import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  MessageSquare, 
  Star, 
  Calendar, 
  Crown, 
  Heart, 
  TrendingUp,
  Send,
  Plus,
  Filter,
  Search,
  Award,
  Gift,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import type { 
  GuestLoyaltyProfile, 
  LoyaltyTier, 
  GuestMessage, 
  SmartReplySuggestion,
  MessagingTrigger
} from "@shared/schema";

export default function LoyaltyGuestTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedGuest, setSelectedGuest] = useState<GuestLoyaltyProfile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTierDialog, setShowNewTierDialog] = useState(false);
  const [showNewTriggerDialog, setShowNewTriggerDialog] = useState(false);

  // Fetch guest loyalty profiles
  const { data: guestProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["/api/loyalty/guests"],
  });

  // Fetch repeat guests
  const { data: repeatGuests = [], isLoading: repeatLoading } = useQuery({
    queryKey: ["/api/loyalty/repeat-guests"],
  });

  // Fetch loyalty tiers
  const { data: loyaltyTiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ["/api/loyalty/tiers"],
  });

  // Fetch messages for selected guest
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedGuest?.id],
    enabled: !!selectedGuest,
  });

  // Fetch smart reply suggestions
  const { data: smartReplies = [] } = useQuery({
    queryKey: ["/api/smart-replies"],
  });

  // Fetch messaging triggers
  const { data: messagingTriggers = [] } = useQuery({
    queryKey: ["/api/messaging-triggers"],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the guest.",
      });
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  // Create loyalty tier mutation
  const createTierMutation = useMutation({
    mutationFn: async (tierData: any) => {
      return await apiRequest("POST", "/api/loyalty/tiers", tierData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loyalty tier created successfully.",
      });
      setShowNewTierDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/tiers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create loyalty tier.",
        variant: "destructive",
      });
    },
  });

  const filteredGuests = guestProfiles.filter((guest: GuestLoyaltyProfile) => {
    const matchesTier = filterTier === "all" || guest.loyaltyTier === filterTier;
    const matchesSearch = 
      guest.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierColor = (tier: string) => {
    const tierConfig = loyaltyTiers.find((t: LoyaltyTier) => t.tierName.toLowerCase() === tier);
    return tierConfig?.tierColor || "#6B7280";
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "vip": return "default";
      case "gold": return "secondary";
      case "silver": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!selectedGuest || !messageText.trim()) return;

    sendMessageMutation.mutate({
      guestLoyaltyId: selectedGuest.id,
      messageContent: messageText,
      messageType: "text",
      urgencyLevel: "normal",
    });
  };

  const GuestCard = ({ guest }: { guest: GuestLoyaltyProfile }) => (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        selectedGuest?.id === guest.id ? "border-primary bg-muted/50" : ""
      }`}
      onClick={() => setSelectedGuest(guest)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{guest.guestName}</p>
              <p className="text-sm text-muted-foreground">{guest.guestEmail}</p>
            </div>
          </div>
          <Badge 
            variant={getTierBadgeVariant(guest.loyaltyTier)}
            style={{ backgroundColor: getTierColor(guest.loyaltyTier) }}
            className="text-white"
          >
            {guest.loyaltyTier?.toUpperCase()}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>{guest.totalStays} stays</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-500" />
            <span>฿{parseFloat(guest.totalSpent).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-blue-500" />
            <span>{formatDate(guest.lastStayDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-purple-500" />
            <span>{guest.averageStayDuration || 0} days avg</span>
          </div>
        </div>

        {guest.isVip && (
          <div className="mt-2 flex items-center gap-1 text-yellow-600">
            <Crown className="h-3 w-3" />
            <span className="text-xs font-medium">VIP Guest</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MessageBubble = ({ message }: { message: GuestMessage }) => (
    <div className={`flex ${message.senderType === 'guest' ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        message.senderType === 'guest' 
          ? 'bg-muted text-foreground' 
          : 'bg-primary text-primary-foreground'
      }`}>
        <p className="text-sm">{message.messageContent}</p>
        <p className="text-xs opacity-70 mt-1">
          {new Date(message.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold">Loyalty & Repeat Guest Tracker</h1>
            <p className="text-muted-foreground">Smart messaging system for guest retention</p>
          </div>
        </div>

        <Tabs defaultValue="guests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="guests">Guest Profiles</TabsTrigger>
            <TabsTrigger value="messaging">Smart Messaging</TabsTrigger>
            <TabsTrigger value="tiers">Loyalty Tiers</TabsTrigger>
            <TabsTrigger value="triggers">Message Triggers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Guest Profiles Tab */}
          <TabsContent value="guests">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guest List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Guest Directory
                    </CardTitle>
                    <CardDescription>
                      {guestProfiles.length} total guests • {repeatGuests.length} repeat guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="space-y-3 mb-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search guests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={filterTier} onValueChange={setFilterTier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tiers</SelectItem>
                          {loyaltyTiers.map((tier: LoyaltyTier) => (
                            <SelectItem key={tier.id} value={tier.tierName.toLowerCase()}>
                              {tier.tierName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {filteredGuests.map((guest: GuestLoyaltyProfile) => (
                          <GuestCard key={guest.id} guest={guest} />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Guest Details */}
              <div className="lg:col-span-2">
                {selectedGuest ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {selectedGuest.guestName}
                            {selectedGuest.isVip && <Crown className="h-5 w-5 text-yellow-500" />}
                          </CardTitle>
                          <CardDescription>{selectedGuest.guestEmail}</CardDescription>
                        </div>
                        <Badge 
                          variant={getTierBadgeVariant(selectedGuest.loyaltyTier)}
                          style={{ backgroundColor: getTierColor(selectedGuest.loyaltyTier) }}
                          className="text-white"
                        >
                          {selectedGuest.loyaltyTier?.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold">{selectedGuest.totalStays}</p>
                          <p className="text-sm text-muted-foreground">Total Stays</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold">฿{parseFloat(selectedGuest.totalSpent).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold">{selectedGuest.averageStayDuration || 0}</p>
                          <p className="text-sm text-muted-foreground">Avg Stay (days)</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <Award className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold">{selectedGuest.loyaltyPoints}</p>
                          <p className="text-sm text-muted-foreground">Loyalty Points</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Guest Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedGuest.guestEmail}</span>
                            </div>
                            {selectedGuest.guestPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedGuest.guestPhone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>First Stay: {formatDate(selectedGuest.firstStayDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Last Stay: {formatDate(selectedGuest.lastStayDate)}</span>
                            </div>
                          </div>
                        </div>

                        {selectedGuest.guestNotes && (
                          <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {selectedGuest.guestNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-[500px]">
                      <div className="text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a guest to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Smart Messaging Tab */}
          <TabsContent value="messaging">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Message Thread */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Guest Conversations
                  </CardTitle>
                  <CardDescription>
                    {selectedGuest ? `Chatting with ${selectedGuest.guestName}` : "Select a guest to start messaging"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedGuest ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-[400px] border rounded-lg p-4">
                        {messages.length > 0 ? (
                          messages.map((message: GuestMessage) => (
                            <MessageBubble key={message.id} message={message} />
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No messages yet. Start a conversation!</p>
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          size="icon"
                          className="self-end"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-16">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a guest from the Guest Profiles tab to start messaging</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Smart Replies */}
              <Card>
                <CardHeader>
                  <CardTitle>Smart Reply Suggestions</CardTitle>
                  <CardDescription>Pre-configured message templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {smartReplies.map((reply: SmartReplySuggestion) => (
                        <Card key={reply.id} className="cursor-pointer hover:bg-muted/50">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{reply.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                Used {reply.useCount} times
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">{reply.trigger}</p>
                            <p className="text-xs text-muted-foreground">{reply.messageTemplate}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loyalty Tiers Tab */}
          <TabsContent value="tiers">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Loyalty Tier Management</h3>
                  <p className="text-muted-foreground">Configure loyalty tiers and benefits</p>
                </div>
                <Dialog open={showNewTierDialog} onOpenChange={setShowNewTierDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Loyalty Tier</DialogTitle>
                      <DialogDescription>
                        Define a new loyalty tier with requirements and benefits
                      </DialogDescription>
                    </DialogHeader>
                    {/* Add tier creation form here */}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loyaltyTiers.map((tier: LoyaltyTier) => (
                  <Card key={tier.id}>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div 
                          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ backgroundColor: tier.tierColor }}
                        >
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">{tier.tierName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tier.minStays}+ stays required
                        </p>
                      </div>

                      {tier.benefits && tier.benefits.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Benefits:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {tier.benefits.map((benefit: string, index: number) => (
                              <li key={index} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Message Triggers Tab */}
          <TabsContent value="triggers">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Automated Messaging Triggers</h3>
                  <p className="text-muted-foreground">Set up automated messages for guest engagement</p>
                </div>
                <Dialog open={showNewTriggerDialog} onOpenChange={setShowNewTriggerDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Trigger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Message Trigger</DialogTitle>
                      <DialogDescription>
                        Set up automated message triggers for guest engagement
                      </DialogDescription>
                    </DialogHeader>
                    {/* Add trigger creation form here */}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messagingTriggers.map((trigger: MessagingTrigger) => (
                  <Card key={trigger.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{trigger.triggerName}</CardTitle>
                        <Badge variant={trigger.isActive ? "default" : "secondary"}>
                          {trigger.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{trigger.triggerType}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Condition:</p>
                          <p className="text-xs text-muted-foreground">{trigger.triggerCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Message Template:</p>
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            {trigger.messageTemplate}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Delay: {trigger.delayMinutes}min</span>
                          <span>Triggered: {trigger.triggerCount} times</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Total Guests</span>
                  </div>
                  <p className="text-2xl font-bold">{guestProfiles.length}</p>
                  <p className="text-xs text-muted-foreground">Registered in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Repeat Guests</span>
                  </div>
                  <p className="text-2xl font-bold">{repeatGuests.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {guestProfiles.length > 0 ? Math.round((repeatGuests.length / guestProfiles.length) * 100) : 0}% retention rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium">VIP Guests</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {guestProfiles.filter((g: GuestLoyaltyProfile) => g.isVip).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Premium tier members</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ฿{guestProfiles.reduce((sum: number, g: GuestLoyaltyProfile) => 
                      sum + parseFloat(g.totalSpent), 0
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">From loyal guests</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Loyalty Distribution</CardTitle>
                <CardDescription>Guest distribution across loyalty tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyTiers.map((tier: LoyaltyTier) => {
                    const tierGuests = guestProfiles.filter(
                      (g: GuestLoyaltyProfile) => g.loyaltyTier === tier.tierName.toLowerCase()
                    );
                    const percentage = guestProfiles.length > 0 
                      ? Math.round((tierGuests.length / guestProfiles.length) * 100) 
                      : 0;
                    
                    return (
                      <div key={tier.id} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">{tier.tierName}</div>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: tier.tierColor 
                            }}
                          />
                        </div>
                        <div className="w-16 text-sm text-muted-foreground text-right">
                          {tierGuests.length} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}