import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Star, Trophy, Gift, Calendar, TrendingUp, Crown, Award } from "lucide-react";

export default function LoyaltyGuestTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loyaltyTiers = [
    { name: "Bronze", color: "bg-orange-100 text-orange-800", minStays: 1, benefits: ["Welcome drink", "Late checkout"] },
    { name: "Silver", color: "bg-gray-100 text-gray-800", minStays: 3, benefits: ["Room upgrade", "Spa discount 10%", "Priority booking"] },
    { name: "Gold", color: "bg-yellow-100 text-yellow-800", minStays: 5, benefits: ["Free breakfast", "Airport transfer", "Spa discount 20%"] },
    { name: "Platinum", color: "bg-purple-100 text-purple-800", minStays: 10, benefits: ["Free night after 5 stays", "Concierge service", "Spa discount 30%"] }
  ];

  const loyaltyGuests = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      tier: "Platinum",
      totalStays: 12,
      totalSpent: 18500,
      lastStay: "2024-12-15",
      nextBooking: "2025-02-10",
      favoriteProperty: "Villa Samui Breeze",
      preferences: ["Ocean view", "Late checkout", "Spa services"],
      pointsBalance: 2400,
      rewardsEarned: 8,
      status: "active",
      joinDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@business.com",
      tier: "Gold",
      totalStays: 8,
      totalSpent: 12800,
      lastStay: "2025-01-05",
      nextBooking: "2025-03-20",
      favoriteProperty: "Villa Aruna",
      preferences: ["Pool access", "Business center", "Early checkin"],
      pointsBalance: 1850,
      rewardsEarned: 5,
      status: "active",
      joinDate: "2023-06-20"
    },
    {
      id: 3,
      name: "Emma Williams",
      email: "emma.w@travel.com",
      tier: "Silver",
      totalStays: 4,
      totalSpent: 6200,
      lastStay: "2024-11-28",
      nextBooking: null,
      favoriteProperty: "Villa Paradise",
      preferences: ["Garden view", "Yoga space", "Healthy meals"],
      pointsBalance: 920,
      rewardsEarned: 2,
      status: "active",
      joinDate: "2024-03-10"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@startup.io",
      tier: "Bronze",
      totalStays: 2,
      totalSpent: 3100,
      lastStay: "2024-08-15",
      nextBooking: null,
      favoriteProperty: "Villa Samui Breeze",
      preferences: ["WiFi", "Workspace", "Coffee machine"],
      pointsBalance: 465,
      rewardsEarned: 1,
      status: "inactive",
      joinDate: "2024-07-05"
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.anderson@family.com",
      tier: "Gold",
      totalStays: 6,
      totalSpent: 9800,
      lastStay: "2024-12-30",
      nextBooking: "2025-04-15",
      favoriteProperty: "Villa Paradise",
      preferences: ["Family rooms", "Pool safety", "Kids activities"],
      pointsBalance: 1470,
      rewardsEarned: 4,
      status: "active",
      joinDate: "2023-11-08"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      guestName: "Sarah Johnson",
      activity: "Earned 150 points from Villa Samui Breeze stay",
      date: "2024-12-15",
      type: "points_earned"
    },
    {
      id: 2,
      guestName: "Michael Chen",
      activity: "Redeemed free spa treatment (500 points)",
      date: "2025-01-05",
      type: "reward_redeemed"
    },
    {
      id: 3,
      guestName: "Emma Williams",
      activity: "Upgraded to Silver tier (4 stays completed)",
      date: "2024-11-28",
      type: "tier_upgrade"
    },
    {
      id: 4,
      guestName: "Lisa Anderson",
      activity: "Booked next stay with Gold tier benefits",
      date: "2024-12-30",
      type: "booking_made"
    }
  ];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Bronze": return <Award className="w-4 h-4" />;
      case "Silver": return <Star className="w-4 h-4" />;
      case "Gold": return <Trophy className="w-4 h-4" />;
      case "Platinum": return <Crown className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-orange-100 text-orange-800";
      case "Silver": return "bg-gray-100 text-gray-800";
      case "Gold": return "bg-yellow-100 text-yellow-800";
      case "Platinum": return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const summaryStats = {
    totalGuests: loyaltyGuests.length,
    activeGuests: loyaltyGuests.filter(g => g.status === "active").length,
    totalPointsIssued: loyaltyGuests.reduce((sum, g) => sum + g.pointsBalance, 0),
    averageStays: (loyaltyGuests.reduce((sum, g) => sum + g.totalStays, 0) / loyaltyGuests.length).toFixed(1)
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8" />
            Loyalty Guest Tracker
          </h1>
          <p className="text-gray-600">Track guest loyalty, rewards, and retention programs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Gift className="w-4 h-4 mr-2" />
            Send Rewards
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      <Tabs defaultValue="guests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guests">Loyalty Guests</TabsTrigger>
          <TabsTrigger value="tiers">Tier Management</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Program</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Program Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Loyalty Guests</p>
                    <p className="text-2xl font-bold">{summaryStats.totalGuests}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.activeGuests}</p>
                  </div>
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Outstanding</p>
                    <p className="text-2xl font-bold text-purple-600">{summaryStats.totalPointsIssued.toLocaleString()}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Stays per Guest</p>
                    <p className="text-2xl font-bold text-orange-600">{summaryStats.averageStays}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Guest List */}
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyGuests.map((guest) => (
                  <div key={guest.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          {getTierIcon(guest.tier)}
                          <div>
                            <h4 className="font-medium">{guest.name}</h4>
                            <p className="text-sm text-gray-600">{guest.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTierColor(guest.tier)}>
                          {guest.tier}
                        </Badge>
                        <Badge className={getStatusColor(guest.status)}>
                          {guest.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Total Stays</p>
                        <p className="font-medium">{guest.totalStays}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Spent</p>
                        <p className="font-medium">${guest.totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Points Balance</p>
                        <p className="font-medium text-purple-600">{guest.pointsBalance}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Stay</p>
                        <p className="font-medium">{guest.lastStay}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next Booking</p>
                        <p className="font-medium">{guest.nextBooking || "None scheduled"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rewards Earned</p>
                        <p className="font-medium text-green-600">{guest.rewardsEarned}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preferences</p>
                        <div className="flex gap-1">
                          {guest.preferences.slice(0, 3).map((pref, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button variant="outline" size="sm">Send Offer</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loyaltyTiers.map((tier) => (
              <Card key={tier.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTierIcon(tier.name)}
                      <span>{tier.name} Tier</span>
                    </div>
                    <Badge className={tier.color}>{tier.minStays}+ stays</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Member Benefits:</p>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-600">
                      Current Members: {loyaltyGuests.filter(g => g.tier === tier.name).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reward Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Gift className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="font-medium">{activity.guestName}</p>
                        <p className="text-sm text-gray-600">{activity.activity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.date}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loyaltyTiers.map((tier) => {
                    const count = loyaltyGuests.filter(g => g.tier === tier.name).length;
                    const percentage = ((count / loyaltyGuests.length) * 100).toFixed(1);
                    return (
                      <div key={tier.name} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          {getTierIcon(tier.name)}
                          {tier.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-12">{count} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Retention Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">80%</p>
                  <p className="text-gray-600">Retention Rate</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Repeat Bookings</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tier Progression</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Referral Rate</span>
                    <span className="font-semibold">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Points System</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Points per $1 spent</label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Points expiry (months)</label>
                      <Input type="number" defaultValue="24" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Bonus points for reviews</label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Communication</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Welcome email</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Birthday offers</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Points expiry alerts</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tier upgrade notifications</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}