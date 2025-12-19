/**
 * Notification System Component
 * 
 * Handles class reminders and parent communications
 * Requirements: 10.5, 10.6, 10.7, 10.8 - Notification system for class reminders
 */

import { useState, useEffect } from 'react'
import { Bell, X, Calendar, Users, MessageSquare, AlertCircle } from 'lucide-react'

export type NotificationType = 'class_reminder' | 'parent_message' | 'student_update' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  titleAr: string
  message: string
  messageAr: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  actionLabelAr?: string
  priority?: 'low' | 'medium' | 'high'
}

interface NotificationSystemProps {
  className?: string
}

export default function NotificationSystem({ className = '' }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications (mock data for now)
    loadNotifications()
    
    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const loadNotifications = () => {
    // Mock notifications - in production, fetch from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'class_reminder',
        title: 'Class Starting Soon',
        titleAr: 'حصة قريبة',
        message: 'Your class with Ahmed starts in 15 minutes',
        messageAr: 'حصتك مع أحمد تبدأ خلال 15 دقيقة',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        actionUrl: '/dashboard/teacher/classes',
        actionLabel: 'Join Class',
        actionLabelAr: 'الانضمام للحصة',
        priority: 'high',
      },
      {
        id: '2',
        type: 'parent_message',
        title: 'New Parent Message',
        titleAr: 'رسالة جديدة من ولي أمر',
        message: 'Parent of Sara sent you a message',
        messageAr: 'ولي أمر سارة أرسل لك رسالة',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        actionUrl: '/dashboard/teacher/messages',
        actionLabel: 'View Message',
        actionLabelAr: 'عرض الرسالة',
        priority: 'medium',
      },
      {
        id: '3',
        type: 'student_update',
        title: 'Student Progress Update',
        titleAr: 'تحديث تقدم الطالب',
        message: 'Mohammed completed his assessment',
        messageAr: 'محمد أكمل التقييم الخاص به',
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: true,
        actionUrl: '/dashboard/teacher/students',
        actionLabel: 'View Progress',
        actionLabelAr: 'عرض التقدم',
        priority: 'low',
      },
    ]
    
    setNotifications(mockNotifications)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'class_reminder':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'parent_message':
        return <MessageSquare className="w-5 h-5 text-green-600" />
      case 'student_update':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'system':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-r-4 border-red-500'
      case 'medium':
        return 'border-r-4 border-yellow-500'
      case 'low':
        return 'border-r-4 border-blue-500'
      default:
        return ''
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    return `منذ ${days} يوم`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute left-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 arabic-text">الإشعارات</h3>
                <p className="text-sm text-gray-500 arabic-text">
                  {unreadCount} غير مقروءة
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 arabic-text"
                  >
                    تعليم الكل كمقروء
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 arabic-text">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium text-gray-900 arabic-text ${
                              !notification.read ? 'font-semibold' : ''
                            }`}>
                              {notification.titleAr}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                              aria-label="حذف"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 arabic-text mt-1">
                            {notification.messageAr}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 arabic-text">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium arabic-text"
                                onClick={() => setIsOpen(false)}
                              >
                                {notification.actionLabelAr}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to notifications page
                  }}
                  className="w-full text-sm text-center text-primary-600 hover:text-primary-700 font-medium arabic-text"
                >
                  عرض جميع الإشعارات
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
