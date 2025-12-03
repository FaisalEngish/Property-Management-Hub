import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";

// Pre-loaded leaderboard data for instant display
const RETAIL_AGENTS = [
  { rank: 1, name: "Ploy", bookings: 12, earnings: 89000, bonus: "Dinner voucher", trend: "+15%" },
  { rank: 2, name: "Sarah", bookings: 8, earnings: 65000, bonus: "Spa day", trend: "+8%" },
  { rank: 3, name: "Lisa", bookings: 6, earnings: 42000, bonus: "Gift card", trend: "+3%" },
  { rank: 4, name: "Anna", bookings: 5, earnings: 38000, bonus: "Movie tickets", trend: "-2%" },
  { rank: 5, name: "Emma", bookings: 4, earnings: 28000, bonus: "Coffee voucher", trend: "+5%" }
];

const REFERRAL_AGENTS = [
  { rank: 1, name: "George", referrals: 9, earnings: 54000, bonus: "2-night stay", trend: "+12%" },
  { rank: 2, name: "Mike", referrals: 7, earnings: 42000, bonus: "Restaurant voucher", trend: "+6%" },
  { rank: 3, name: "David", referrals: 5, earnings: 31000, bonus: "Spa treatment", trend: "+4%" },
  { rank: 4, name: "James", referrals: 4, earnings: 24000, bonus: "Shopping voucher", trend: "-1%" },
  { rank: 5, name: "Robert", referrals: 3, earnings: 18000, bonus: "Activity pass", trend: "+2%" }
];

const LAST_MONTH_WINNER = {
  name: "Anna K.",
  type: "Retail Agent",
  earnings: 125000,
  prize: "Weekend getaway prize"
};

export default function OptimizedLeaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Star className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Leaderboard</h1>
        <p className="text-gray-600">Top performing agents this month</p>
      </div>

      {/* Last Month's Winner */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Trophy className="h-6 w-6" />
            Last Month's Champion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{LAST_MONTH_WINNER.name}</h3>
              <p className="text-gray-600">{LAST_MONTH_WINNER.type}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-600">
                ฿{LAST_MONTH_WINNER.earnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{LAST_MONTH_WINNER.prize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retail Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Retail Agents - This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RETAIL_AGENTS.map((agent) => (
                <div key={agent.rank} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getRankIcon(agent.rank)}
                    <div>
                      <h4 className="font-semibold">{agent.name}</h4>
                      <p className="text-sm text-gray-600">{agent.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-green-600">
                        ฿{agent.earnings.toLocaleString()}
                      </p>
                      <Badge variant="outline" className={getTrendColor(agent.trend)}>
                        {agent.trend}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{agent.bonus}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Referral Agents - This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {REFERRAL_AGENTS.map((agent) => (
                <div key={agent.rank} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getRankIcon(agent.rank)}
                    <div>
                      <h4 className="font-semibold">{agent.name}</h4>
                      <p className="text-sm text-gray-600">{agent.referrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-green-600">
                        ฿{agent.earnings.toLocaleString()}
                      </p>
                      <Badge variant="outline" className={getTrendColor(agent.trend)}>
                        {agent.trend}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{agent.bonus}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-600">Total Bookings</h3>
            <p className="text-2xl font-bold text-blue-600">
              {RETAIL_AGENTS.reduce((sum, agent) => sum + agent.bookings, 0)}
            </p>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-600">Total Referrals</h3>
            <p className="text-2xl font-bold text-purple-600">
              {REFERRAL_AGENTS.reduce((sum, agent) => sum + agent.referrals, 0)}
            </p>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-600">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-600">
              ฿{(RETAIL_AGENTS.reduce((sum, agent) => sum + agent.earnings, 0) + 
                 REFERRAL_AGENTS.reduce((sum, agent) => sum + agent.earnings, 0)).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Combined</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}