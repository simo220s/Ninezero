import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiGet, apiPut } from '@/lib/utils/api-client';
import { logger } from '@/lib/utils/logger';

interface NotificationPreferences {
  email_enabled: boolean;
  in_app_enabled: boolean;
  class_reminders_enabled: boolean;
  class_updates_enabled: boolean;
  review_notifications_enabled: boolean;
  credit_notifications_enabled: boolean;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  class_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiGet<{ notifications: Notification[] }>('/api/notifications');
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await apiGet<{ count: number }>('/api/notifications/unread');
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      logger.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await apiPut(`/api/notifications/${notificationId}/read`, {});
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await apiPut('/api/notifications/read-all', {});
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const response = await apiGet<{ preferences: NotificationPreferences }>('/api/notifications/preferences');
      if (response.success && response.data) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      logger.error('Failed to fetch notification preferences:', error);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await apiPut('/api/notifications/preferences', newPreferences);
      if (response.success) {
        setPreferences((prev) => (prev ? { ...prev, ...newPreferences } : null));
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to update notification preferences:', error);
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchPreferences();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    fetchPreferences,
    updatePreferences,
  };
}
