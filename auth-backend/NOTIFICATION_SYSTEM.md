# Notification System Documentation

## Overview

The notification system provides comprehensive in-app and email notifications for the Saudi English Club LMS platform. It includes automated class reminders, event notifications, and user preference management.

## Features

### 1. In-App Notifications
- Real-time notifications displayed in the NotificationCenter component
- Unread notification badges
- Mark as read functionality
- Notification history

### 2. Email Notifications
- SMTP-based email delivery
- HTML email templates with Arabic RTL support
- Email delivery tracking and retry logic
- Configurable email preferences

### 3. Automated Reminders
- **24-hour reminder**: Sent 24 hours before class (email)
- **1-hour reminder**: Sent 1 hour before class (email)
- **15-minute reminder**: Sent 15 minutes before class (in-app only)

### 4. Event Notifications
- Class scheduled
- Class cancelled (with refund info)
- Review submitted
- Low credit balance
- Trial period expiring
- Conversion to regular student

### 5. User Preferences
- Email notifications on/off
- In-app notifications on/off
- Class reminders enabled/disabled
- Class updates enabled/disabled
- Review notifications enabled/disabled
- Credit notifications enabled/disabled

## Database Schema

### notifications table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN (...)),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  class_id UUID REFERENCES class_sessions(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### email_notifications table
```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  notification_id UUID REFERENCES notifications(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### notification_preferences table
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES profiles(id),
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  class_reminders_enabled BOOLEAN DEFAULT true,
  class_updates_enabled BOOLEAN DEFAULT true,
  review_notifications_enabled BOOLEAN DEFAULT true,
  credit_notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## API Endpoints

### Get Unread Notifications
```
GET /api/notifications/unread
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "notifications": [...],
    "count": 5
  }
}
```

### Get All Notifications
```
GET /api/notifications?limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "notifications": [...],
    "count": 50
  }
}
```

### Mark Notification as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "message": "Notification marked as read"
  }
}
```

### Mark All Notifications as Read
```
PUT /api/notifications/read-all
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "message": "All notifications marked as read"
  }
}
```

### Get Notification Preferences
```
GET /api/notifications/preferences
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "preferences": {
      "email_enabled": true,
      "in_app_enabled": true,
      ...
    }
  }
}
```

### Update Notification Preferences
```
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "email_enabled": false,
  "class_reminders_enabled": true
}

Response:
{
  "success": true,
  "data": {
    "message": "Preferences updated successfully"
  }
}
```

## Services

### NotificationService
Main service for creating and managing notifications.

**Methods:**
- `createInAppNotification(data)` - Create in-app notification
- `sendEmailNotification(userId, type, templateData)` - Send email
- `sendNotification(data, sendEmail)` - Send both in-app and email
- `getUnreadNotifications(userId)` - Get unread notifications
- `markAsRead(notificationId)` - Mark as read
- `markAllAsRead(userId)` - Mark all as read
- `getNotificationPreferences(userId)` - Get preferences
- `updateNotificationPreferences(userId, preferences)` - Update preferences

### EmailService
Handles SMTP email delivery.

**Methods:**
- `sendEmail(options)` - Send email via SMTP
- `verifyConnection()` - Verify SMTP connection
- `isEmailConfigured()` - Check if SMTP is configured

### ClassReminderService
Automated class reminder system.

**Methods:**
- `send24HourReminders()` - Send 24h reminders
- `send1HourReminders()` - Send 1h reminders
- `send15MinuteReminders()` - Send 15m reminders
- `runAllReminders()` - Run all reminder checks

### EventNotificationService
Event-based notifications.

**Methods:**
- `notifyClassScheduled(classId)` - Class scheduled notification
- `notifyClassCancelled(classId, refundAmount)` - Class cancelled notification
- `notifyReviewSubmitted(reviewId)` - Review submitted notification
- `notifyLowCreditBalance(userId, currentBalance)` - Low balance notification
- `notifyTrialExpiring(userId, daysRemaining)` - Trial expiring notification
- `notifyConversionComplete(userId)` - Conversion complete notification
- `checkLowCreditBalances()` - Check and notify low balances
- `checkExpiringTrials()` - Check and notify expiring trials

### SchedulerService
Manages periodic task execution.

**Methods:**
- `start()` - Start all scheduled tasks
- `stop()` - Stop all scheduled tasks

**Schedule:**
- 24h reminders: Every hour
- 1h reminders: Every 15 minutes
- 15m reminders: Every 5 minutes
- Low balance check: Every 6 hours
- Expiring trials check: Every 12 hours

## Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Saudi English Club
SMTP_FROM_EMAIL=noreply@saudienglishclub.com
```

## Frontend Components

### NotificationBell
Notification bell icon with unread count badge.

**Usage:**
```tsx
import NotificationBell from '@/components/NotificationBell';

<NotificationBell />
```

### NotificationCenter
Slide-out panel displaying all notifications.

**Props:**
- `isOpen: boolean` - Panel open state
- `onClose: () => void` - Close handler

**Usage:**
```tsx
import NotificationCenter from '@/components/NotificationCenter';

<NotificationCenter isOpen={isOpen} onClose={handleClose} />
```

### NotificationPreferences
Settings page for managing notification preferences.

**Usage:**
```tsx
import NotificationPreferences from '@/components/NotificationPreferences';

<NotificationPreferences />
```

## Frontend Hooks

### useNotifications
React hook for notification management.

**Returns:**
- `notifications` - All notifications
- `unreadCount` - Unread notification count
- `preferences` - User preferences
- `loading` - Loading state
- `fetchNotifications()` - Fetch all notifications
- `fetchUnreadCount()` - Fetch unread count
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `fetchPreferences()` - Fetch preferences
- `updatePreferences(prefs)` - Update preferences

**Usage:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
} = useNotifications();
```

## Email Templates

All email templates support:
- Arabic RTL layout
- Responsive design
- Dark mode compatibility
- Consistent branding

Template types:
- Class reminders (24h, 1h, 15m)
- Class scheduled
- Class cancelled
- Review submitted
- Low credit balance
- Trial expiring
- Conversion complete

## Migration

To apply the notification system migration:

```bash
# Run migration
npm run migrate migrations/006_create_notifications_table.sql
```

Or manually execute the SQL in Supabase SQL Editor.

## Testing

### Manual Testing

1. **Test Email Configuration:**
```bash
# Verify SMTP connection on server start
# Check logs for "Email service configured and verified successfully"
```

2. **Test Class Reminders:**
- Create a class session 24 hours in the future
- Wait for scheduler to run (or trigger manually)
- Check notifications table and email_notifications table

3. **Test Event Notifications:**
- Schedule a class → Check for "class_scheduled" notification
- Cancel a class → Check for "class_cancelled" notification
- Submit a review → Check for "review_submitted" notification

4. **Test Frontend:**
- Open NotificationBell component
- Verify unread count displays correctly
- Click to open NotificationCenter
- Mark notifications as read
- Update preferences in NotificationPreferences

## Troubleshooting

### Emails Not Sending

1. Check SMTP configuration in `.env`
2. Verify SMTP credentials are correct
3. Check email_notifications table for error messages
4. Review server logs for SMTP errors

### Reminders Not Triggering

1. Verify scheduler service is running (check logs)
2. Check class_sessions table for scheduled classes
3. Verify notification preferences allow reminders
4. Check for existing notifications (no duplicates)

### Frontend Not Updating

1. Verify API endpoints are accessible
2. Check browser console for errors
3. Verify authentication token is valid
4. Check network tab for API responses

## Future Enhancements

- [ ] Push notifications (web push API)
- [ ] SMS notifications
- [ ] Notification grouping
- [ ] Notification sound preferences
- [ ] Digest emails (daily/weekly summary)
- [ ] Notification templates customization
- [ ] Multi-language support
- [ ] Notification analytics dashboard
