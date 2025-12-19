import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { logger } from '@/lib/logger';
import NotificationCenter from './NotificationCenter';
import notificationService from '@/lib/services/notification-service';

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      // Fetch initial unread count
      fetchUnreadCount();
      
      // Subscribe to real-time notifications
      const _channel = notificationService.subscribeToNotifications(
        user.id,
        (notification) => {
          // Increment unread count when new notification arrives
          setUnreadCount(prev => prev + 1);
          
          // Send browser notification if permission granted
          notificationService.sendBrowserNotification(notification);
          
          logger.log('New notification received:', notification);
        },
        (error) => {
          logger.error('Real-time notification error:', error);
        }
      );
      
      // Cleanup subscription on unmount
      return () => {
        notificationService.unsubscribeFromNotifications();
      };
    }
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await notificationService.getUnreadCount(user.id);
      
      if (error) {
        logger.error('Failed to fetch unread count:', error);
        return;
      }
      
      setUnreadCount(data);
    } catch (error) {
      logger.error('Failed to fetch unread count:', error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    fetchUnreadCount(); // Refresh count when closing
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center size-10 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        aria-label="الإشعارات"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
