import React, { useState, useEffect } from "react";
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
  const [userStats, setUserStats] = useState<UserGameStats>({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    bookingsProcessed: 0,
    propertiesManaged: 0,
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading achievements and user data
    const mockUserStats: UserGameStats = {
      totalPoints: 850,
      level: calculateLevel(850),
      currentStreak: 7,
      longestStreak: 12,
      tasksCompleted: 45,
      bookingsProcessed: 23,
      propertiesManaged: 8,
    };

    const mockAchievements: Achievement[] = [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first task",
        category: "task",
        type: "milestone",
        points: 10,
        badgeColor: "#3B82F6",
        isActive: true,
        isEarned: true,
        earnedAt: "2025-01-15T10:30:00Z"
      },
      {
        id: 2,
        name: "Task Master",
        description: "Complete 50 tasks",
        category: "task",
        type: "milestone",
        points: 100,
        badgeColor: "#3B82F6",
        isActive: true,
        progress: 90,
        isEarned: false
      },
      {
        id: 3,
        name: "Booking Pro",
        description: "Process 25 bookings",
        category: "booking",
        type: "milestone",
        points: 75,
        badgeColor: "#10B981",
        isActive: true,
        isEarned: true,
        earnedAt: "2025-01-20T14:15:00Z"
      },
      {
        id: 4,
        name: "Finance Wizard",
        description: "Manage finances for 3 consecutive months",
        category: "finance",
        type: "streak",
        points: 150,
        badgeColor: "#F59E0B",
        isActive: true,
        progress: 66,
        isEarned: false
      },
      {
        id: 5,
        name: "Property Expert",
        description: "Manage 10 properties",
        category: "property",
        type: "milestone",
        points: 200,
        badgeColor: "#8B5CF6",
        isActive: true,
        progress: 80,
        isEarned: false
      },
      {
        id: 6,
        name: "Week Warrior",
        description: "7-day activity streak",
        category: "system",
        type: "streak",
        points: 50,
        badgeColor: "#EF4444",
        isActive: true,
        isEarned: true,
        earnedAt: "2025-01-25T09:00:00Z"
      }
    ];

    setUserStats(mockUserStats);
    setAchievements(mockAchievements);
    setUserAchievements(mockAchievements.filter(a => a.isEarned));
    setIsLoading(false);
  }, [userId, organizationId]);

  const levelProgress = getNextLevelProgress(userStats.totalPoints);
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
                <h3 className="text-lg font-semibold">Level {userStats.level}</h3>
                <p className="text-sm text-muted-foreground">{userStats.totalPoints} total points</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {userStats.currentStreak} day streak
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userStats.level + 1}</span>
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
            <div className="text-2xl font-bold">{userStats.tasksCompleted}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats.bookingsProcessed}</div>
            <div className="text-sm text-muted-foreground">Bookings Processed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userStats.propertiesManaged}</div>
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