import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Zap, 
  Crown,
  Gift,
  Calendar,
  CheckCircle,
  Medal,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  points: number;
  iconUrl?: string;
  badgeColor: string;
  isActive: boolean;
  progress?: number;
  isEarned?: boolean;
  earnedAt?: string;
}

interface UserGameStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  bookingsProcessed: number;
  propertiesManaged: number;
}

interface AchievementSystemProps {
  userId: string;
  organizationId: string;
}

const ACHIEVEMENT_CATEGORIES = {
  task: { name: "Task Master", icon: CheckCircle, color: "text-blue-600" },
  booking: { name: "Booking Expert", icon: Calendar, color: "text-green-600" },
  finance: { name: "Finance Pro", icon: TrendingUp, color: "text-yellow-600" },
  property: { name: "Property Guru", icon: Target, color: "text-purple-600" },
  system: { name: "System Elite", icon: Crown, color: "text-red-600" },
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000, 50000];

function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getNextLevelProgress(points: number): { current: number; next: number; progress: number } {
  const level = calculateLevel(points);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return {
    current: currentThreshold,
    next: nextThreshold,
    progress: Math.min(progress, 100)
  };
}

export default function AchievementSystem({ userId, organizationId }: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch user game stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserGameStats>({
    queryKey: [`/api/achievements/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch all achievements with earned status
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements/definitions'],
  });

  const isLoading = statsLoading || achievementsLoading;
  const userAchievements = achievements.filter(a => a.isEarned);

  const levelProgress = getNextLevelProgress(userStats?.totalPoints || 0);
  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Level and Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Level {userStats?.level || 1}</h3>
                <p className="text-sm text-muted-foreground">{userStats?.totalPoints || 0} total points</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {userStats?.currentStreak || 0} day streak
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {(userStats?.level || 1) + 1}</span>
              <span>{Math.round(levelProgress.progress)}%</span>
            </div>
            <Progress value={levelProgress.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{levelProgress.current} pts</span>
              <span>{levelProgress.next} pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats?.tasksCompleted || 0}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats?.bookingsProcessed || 0}</div>
            <div className="text-sm text-muted-foreground">Bookings Processed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats?.propertiesManaged || 0}</div>
            <div className="text-sm text-muted-foreground">Properties Managed</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>
            Track your progress and unlock rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  <category.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-96">
                <div className="grid gap-3">
                  {filteredAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all",
                        achievement.isEarned 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-muted/30 border-muted"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        achievement.isEarned ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {achievement.isEarned ? (
                          <Medal className="h-6 w-6" />
                        ) : (
                          <Star className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              color: achievement.badgeColor,
                              borderColor: achievement.badgeColor + "40",
                              backgroundColor: achievement.badgeColor + "10"
                            }}
                          >
                            {achievement.points} pts
                          </Badge>
                          {achievement.isEarned && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              ✓ Earned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        
                        {!achievement.isEarned && achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1" />
                          </div>
                        )}
                        
                        {achievement.isEarned && achievement.earnedAt && (
                          <p className="text-xs text-muted-foreground">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}