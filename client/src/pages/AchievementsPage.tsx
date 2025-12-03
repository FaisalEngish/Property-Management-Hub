import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, TrendingUp } from "lucide-react";
import AchievementSystem from "@/components/AchievementSystem";
import AchievementNotifications from "@/components/AchievementNotifications";
import { useFastAuth } from "@/lib/fastAuth";

export default function AchievementsPage() {
  const { user } = useFastAuth();
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please log in to view your achievements.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and unlock rewards as you use HostPilotPro
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200">
          <Star className="h-3 w-3 mr-1" />
          Gamification System
        </Badge>
      </div>

      {/* Achievement System */}
      <AchievementSystem 
        userId={user.id} 
        organizationId={user.organizationId || "default-org"} 
      />

      {/* Achievement Notifications Component */}
      <AchievementNotifications 
        userId={user.id} 
        organizationId={user.organizationId || "default-org"} 
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Complete tasks, process bookings, and manage properties to earn points
            </p>
            <p className="text-sm text-muted-foreground">
              • Level up by accumulating points and maintaining activity streaks
            </p>
            <p className="text-sm text-muted-foreground">
              • Unlock badges and achievements for reaching milestones
            </p>
            <p className="text-sm text-muted-foreground">
              • Track your progress across different categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Visual progress tracking keeps you motivated
            </p>
            <p className="text-sm text-muted-foreground">
              • Recognition for your contributions and improvements
            </p>
            <p className="text-sm text-muted-foreground">
              • Competitive elements to drive engagement
            </p>
            <p className="text-sm text-muted-foreground">
              • Personalized goals based on your role and activities
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}