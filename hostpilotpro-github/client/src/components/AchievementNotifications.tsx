import React, { useState, useEffect } from "react";
import { Toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Award, 
  X,
  Sparkles,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementNotification {
  id: number;
  achievementId: number;
  achievement: {
    name: string;
    description: string;
    points: number;
    badgeColor: string;
    category: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface AchievementNotificationsProps {
  userId: string;
  organizationId: string;
}

export default function AchievementNotifications({ userId, organizationId }: AchievementNotificationsProps) {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementNotification | null>(null);

  // Mock notification polling
  useEffect(() => {
    const checkForNewAchievements = () => {
      // In a real app, this would poll the backend for new achievements
      // For demo purposes, we'll simulate earning achievements
      
      // This is just for demonstration - remove in production
      const mockNewAchievement: AchievementNotification = {
        id: Date.now(),
        achievementId: 1,
        achievement: {
          name: "Welcome Aboard!",
          description: "You've successfully logged into HostPilotPro",
          points: 10,
          badgeColor: "#3B82F6",
          category: "system"
        },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Only show once per session for demo
      if (notifications.length === 0) {
        setTimeout(() => {
          showAchievementEarned(mockNewAchievement);
        }, 3000);
      }
    };

    checkForNewAchievements();
  }, [userId, organizationId]);

  const showAchievementEarned = (notification: AchievementNotification) => {
    setCurrentAchievement(notification);
    setShowCelebration(true);
    setNotifications(prev => [notification, ...prev]);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const dismissCelebration = () => {
    setShowCelebration(false);
    if (currentAchievement) {
      markAsRead(currentAchievement.id);
    }
  };

  // Achievement celebration modal
  const AchievementCelebration = () => {
    if (!showCelebration || !currentAchievement) return null;

    return (
      <Dialog open={showCelebration} onOpenChange={dismissCelebration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-full"
                  />
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: currentAchievement.achievement.badgeColor }}
                  >
                    <Trophy />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-yellow-600">
                    Achievement Unlocked!
                  </h3>
                  <h4 className="text-lg font-semibold">
                    {currentAchievement.achievement.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentAchievement.achievement.description}
                  </p>
                  <Badge 
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    +{currentAchievement.achievement.points} points
                  </Badge>
                </div>
              </motion.div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center">
            <Button onClick={dismissCelebration} className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Floating achievement toast
  const AchievementToast = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0 || showCelebration) return null;

    return (
      <AnimatePresence>
        {unreadNotifications.slice(0, 1).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 border-l-4 border-l-yellow-400 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: notification.achievement.badgeColor }}
                  >
                    <Star className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">
                        Achievement Unlocked!
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm">
                      {notification.achievement.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.achievement.description}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      +{notification.achievement.points} pts
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <>
      <AchievementCelebration />
      <AchievementToast />
    </>
  );
}