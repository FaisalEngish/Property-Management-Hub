// Simple localStorage-based profile management for immediate persistence
interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  department: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  bookingAlerts: boolean;
  maintenanceAlerts: boolean;
  paymentNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  systemUpdates: boolean;
}

export const profileStorage = {
  // Profile data
  saveProfile: (userId: string, profileData: UserProfileData) => {
    try {
      localStorage.setItem(`profile_${userId}`, JSON.stringify(profileData));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  },

  getProfile: (userId: string): UserProfileData | null => {
    try {
      const stored = localStorage.getItem(`profile_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  },

  // Notification preferences
  saveNotifications: (userId: string, preferences: NotificationPreferences) => {
    try {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving notifications:', error);
      return false;
    }
  },

  getNotifications: (userId: string): NotificationPreferences | null => {
    try {
      const stored = localStorage.getItem(`notifications_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return null;
    }
  }
};