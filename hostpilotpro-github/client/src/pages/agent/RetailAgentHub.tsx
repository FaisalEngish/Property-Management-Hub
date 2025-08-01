import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  DollarSign, 
  FileText, 
  Download, 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  Target,
  ChevronRight
} from "lucide-react";

// Quick stats for the dashboard
const QUICK_STATS = {
  monthlyEarnings: 89000,
  thisMonthBookings: 12,
  pendingCommissions: 15600,
  currentRank: 1,
  totalAgents: 25,
  conversionRate: 32.5
};

const RECENT_ACTIVITY = [
  { type: "booking", message: "New booking: Villa Samui Breeze", amount: 8000, time: "2 hours ago" },
  { type: "commission", message: "Commission paid", amount: 2400, time: "1 day ago" },
  { type: "quote", message: "Quote generated for Villa Ocean View", amount: 6500, time: "3 hours ago" },
  { type: "ranking", message: "Moved to #1 position", amount: null, time: "Yesterday" }
];

const QUICK_ACTIONS = [
  {
    id: "quote-generator",
    title: "Quote Generator",
    description: "Generate instant quotes for clients",
    icon: Search,
    color: "bg-blue-600 hover:bg-blue-700",
    route: "/agent/quote-generator",
    stats: "4 properties available"
  },
  {
    id: "commissions", 
    title: "Commissions",
    description: "Track earnings and payouts",
    icon: DollarSign,
    color: "bg-green-600 hover:bg-green-700", 
    route: "/agent/commissions",
    stats: `฿${QUICK_STATS.monthlyEarnings.toLocaleString()} this month`
  },
  {
    id: "proposals",
    title: "Proposals", 
    description: "Manage client proposals",
    icon: FileText,
    color: "bg-purple-600 hover:bg-purple-700",
    route: "/agent/proposals",
    stats: "3 pending reviews"
  },
  {
    id: "media-download",
    title: "Media Library",
    description: "Download property media",
    icon: Download, 
    color: "bg-orange-600 hover:bg-orange-700",
    route: "/agent/media-download",
    stats: "48 files available"
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    description: "View agent rankings",
    icon: Trophy,
    color: "bg-yellow-600 hover:bg-yellow-700",
    route: "/agent/leaderboard", 
    stats: `Rank #${QUICK_STATS.currentRank} of ${QUICK_STATS.totalAgents}`
  }
];

export default function RetailAgentHub() {
  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking": return <Calendar className="h-4 w-4 text-blue-600" />;
      case "commission": return <DollarSign className="h-4 w-4 text-green-600" />;
      case "quote": return <Search className="h-4 w-4 text-purple-600" />;
      case "ranking": return <Trophy className="h-4 w-4 text-yellow-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retail Agent Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your performance overview</p>
        </div>
        <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
          Rank #{QUICK_STATS.currentRank} Agent
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ฿{QUICK_STATS.monthlyEarnings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookings This Month</p>
                <p className="text-2xl font-bold text-blue-600">{QUICK_STATS.thisMonthBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Commissions</p>
                <p className="text-2xl font-bold text-orange-600">
                  ฿{QUICK_STATS.pendingCommissions.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{QUICK_STATS.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-gray-600">Access your most used tools</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Card 
                key={action.id} 
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200"
                onClick={() => handleNavigation(action.route)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {action.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ฿{activity.amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">This Month Goal</p>
                  <p className="text-sm text-gray-600">฿100,000 target</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">89%</p>
                  <p className="text-xs text-gray-500">฿11K to go</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Ranking Position</p>
                  <p className="text-sm text-gray-600">Out of {QUICK_STATS.totalAgents} agents</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">#{QUICK_STATS.currentRank}</p>
                  <p className="text-xs text-gray-500">Top performer</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Avg. Deal Size</p>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">฿7,400</p>
                  <p className="text-xs text-gray-500">+12% vs last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              📚 Agent Training
            </Button>
            <Button variant="outline" size="sm">
              💬 Support Chat
            </Button>
            <Button variant="outline" size="sm">
              📊 Monthly Report
            </Button>
            <Button variant="outline" size="sm">
              🎯 Set Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}