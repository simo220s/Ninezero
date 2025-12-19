# Real-Time Notification System

## Overview

This notification system provides comprehensive real-time notifications and class reminders for the English teaching platform, specifically designed for Saudi Arabia with Arabic/English bilingual support and WhatsApp integration.

## Features

### 1. Real-Time Class Countdown Timers ⏰
- Live countdown for all upcoming classes
- Visual indicators for urgency (starting soon, today, upcoming)
- Automatic updates every second
- Support for multiple simultaneous countdowns

### 2. Automated Notifications 📧
- **Email notifications** - Automated emails in Arabic
- **SMS notifications** - Text messages for class reminders
- **WhatsApp integration** - Direct WhatsApp messages to parents
- **In-app notifications** - Real-time notifications within the platform

### 3. Class Reminder System 🔔
Automated reminders at three intervals:
- **24 hours before class** - Advance notice
- **1 hour before class** - Preparation reminder
- **15 minutes before class** - Final reminder with meeting link

### 4. WhatsApp Integration 💬
- Direct WhatsApp messaging to parents
- Pre-built message templates in Arabic
- Saudi phone number validation (+966)
- Quick send functionality
- Message templates for:
  - Class reminders
  - Progress reports
  - Parent messages
  - Class cancellations
  - Welcome messages

### 5. Notification Preferences ⚙️
Users can customize:
- Communication channels (Email, SMS, WhatsApp, In-App)
- Notification types (Class reminders, Parent messages, System updates)
- Reminder timings (24h, 1h, 15min)
- Language preference (Arabic/English)
- WhatsApp number

## Components

### Core Services

#### `notification-service.ts`
Main notification service handling:
- Notification preferences management
- Class reminder scheduling
- Multi-channel notification sending
- Automated reminder processing

```typescript
import notificationService from '@/lib/services/notification-service'

// Get user preferences
const prefs = await notificationService.getNotificationPreferences(userId)

// Schedule class reminders
await notificationService.scheduleClassReminders({
  id: classId,
  studentId,
  teacherId,
  date: '2024-01-15',
  time: '17:00',
  meetingLink: 'https://meet.google.com/xxx',
  studentName: 'أحمد',
  teacherName: 'المعلم محمد'
})

// Send parent message
await notificationService.sendParentMessage(
  parentId,
  'أحمد',
  'تقدم ممتاز في الحصة اليوم!',
  'المعلم محمد'
)
```

#### `countdown-timer.ts`
Real-time countdown functionality:
- Calculate countdown for classes
- React hooks for live updates
- Formatting and display utilities

```typescript
import { useClassCountdown } from '@/lib/services/countdown-timer'

function MyComponent() {
  const countdown = useClassCountdown(classDate, classTime)
  
  return (
    <div>
      {countdown.isStartingSoon && (
        <span>تبدأ خلال {countdown.minutes} دقيقة</span>
      )}
    </div>
  )
}
```

#### `whatsapp-integration.ts`
WhatsApp messaging utilities:
- Phone number formatting and validation
- Message templates
- WhatsApp link generation
- Bulk messaging support

```typescript
import whatsappService from '@/lib/services/whatsapp-integration'

// Send WhatsApp message
whatsappService.sendWhatsAppMessage(
  '+966501234567',
  'السلام عليكم، تذكير بحصة اليوم...'
)

// Use template
const message = whatsappService.templates.classReminder24h(
  'أحمد',
  'المعلم محمد',
  'غداً',
  '5:00 مساءً',
  'https://meet.google.com/xxx'
)
```

### UI Components

#### `NotificationPreferences.tsx`
User interface for managing notification settings:
- Channel toggles (Email, SMS, WhatsApp, In-App)
- Notification type preferences
- Reminder timing selection
- Language preference
- WhatsApp number input

#### `ClassCountdownTimer.tsx`
Display components for class countdowns:
- Full countdown display with details
- Compact countdown badge
- Today's schedule countdown
- Automatic meeting link display when starting soon

#### `WhatsAppMessenger.tsx`
Interface for sending WhatsApp messages:
- Message templates
- Custom message composition
- Phone number validation
- Message preview
- Quick send buttons

#### `RealTimeNotificationCenter.tsx`
Central hub for all notifications:
- Today's classes with countdowns
- Upcoming classes overview
- Quick WhatsApp access
- Notification preferences access
- Real-time updates

## Database Schema

### Tables

#### `notification_preferences`
Stores user notification preferences
- `user_id` - User reference
- `email_enabled`, `sms_enabled`, `whatsapp_enabled`, `in_app_enabled` - Channel toggles
- `class_reminders`, `parent_messages`, `system_updates` - Type toggles
- `reminder_timings` - Array of timing preferences
- `language` - Preferred language (ar/en)
- `whatsapp_number` - WhatsApp contact number

#### `notifications`
In-app notifications
- `user_id` - Recipient
- `type` - Notification type
- `title`, `title_en` - Bilingual titles
- `message`, `message_en` - Bilingual messages
- `read` - Read status
- `priority` - Urgency level

#### `scheduled_reminders`
Scheduled class reminders
- `class_id` - Class reference
- `student_id` - Student reference
- `timing` - When to send (24h, 1h, 15min)
- `scheduled_time` - When to send
- `status` - Reminder status

#### `notification_logs`
Audit log of sent notifications
- `user_id` - Recipient
- `channel` - Communication channel
- `type` - Notification type
- `recipient` - Contact info
- `message` - Message content
- `status` - Delivery status

## Usage Examples

### Schedule Reminders for New Class

```typescript
import notificationService from '@/lib/services/notification-service'

async function createClass(classData) {
  // Create class in database
  const newClass = await createClassSession(classData)
  
  // Schedule automated reminders
  await notificationService.scheduleClassReminders({
    id: newClass.id,
    studentId: classData.studentId,
    teacherId: classData.teacherId,
    date: classData.date,
    time: classData.time,
    meetingLink: classData.meetingLink,
    studentName: classData.studentName,
    teacherName: classData.teacherName
  })
}
```

### Display Countdown in Dashboard

```typescript
import ClassCountdownTimer from '@/components/notifications/ClassCountdownTimer'

function TeacherDashboard({ upcomingClasses }) {
  return (
    <div>
      {upcomingClasses.map(cls => (
        <ClassCountdownTimer
          key={cls.id}
          classDate={cls.date}
          classTime={cls.time}
          studentName={cls.studentName}
          meetingLink={cls.meetingLink}
          showDetails={true}
        />
      ))}
    </div>
  )
}
```

### Send WhatsApp Message to Parent

```typescript
import { QuickWhatsAppButton } from '@/components/notifications/WhatsAppMessenger'

function StudentCard({ student }) {
  return (
    <div>
      <h3>{student.name}</h3>
      <QuickWhatsAppButton
        phoneNumber={student.parentPhone}
        studentName={student.name}
      />
    </div>
  )
}
```

### Update Notification Preferences

```typescript
import NotificationPreferencesComponent from '@/components/notifications/NotificationPreferences'

function SettingsPage({ userId }) {
  return (
    <NotificationPreferencesComponent
      userId={userId}
      onClose={() => navigate('/dashboard')}
    />
  )
}
```

## Cron Job Setup

For automated reminder processing, set up a cron job to run every minute:

```bash
# Run every minute
* * * * * node scripts/process-reminders.js
```

```javascript
// scripts/process-reminders.js
import notificationService from './src/lib/services/notification-service'

async function processReminders() {
  await notificationService.processPendingReminders()
}

processReminders()
```

## Environment Variables

```env
# Email Service (SendGrid, AWS SES, etc.)
VITE_EMAIL_SERVICE_API_KEY=your_api_key
VITE_EMAIL_FROM_ADDRESS=noreply@saudienglishclub.com

# SMS Service (Twilio, AWS SNS, etc.)
VITE_SMS_SERVICE_API_KEY=your_api_key
VITE_SMS_FROM_NUMBER=+966xxxxxxxxx

# WhatsApp Business API (optional)
VITE_WHATSAPP_API_KEY=your_api_key
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

## Best Practices

1. **Always validate phone numbers** before sending WhatsApp messages
2. **Respect user preferences** - check before sending notifications
3. **Use appropriate timing** - don't send notifications too early or late
4. **Provide opt-out options** - allow users to disable notifications
5. **Log all notifications** - maintain audit trail for debugging
6. **Handle failures gracefully** - retry failed notifications
7. **Test with real data** - verify Saudi phone number formats
8. **Use templates** - maintain consistency in messaging

## Troubleshooting

### Reminders Not Sending
- Check scheduled_reminders table for status
- Verify notification preferences are enabled
- Check notification_logs for error messages
- Ensure cron job is running

### WhatsApp Links Not Working
- Verify phone number format (+966xxxxxxxxx)
- Check Saudi number validation (must start with 5)
- Test with actual WhatsApp-enabled numbers

### Countdown Not Updating
- Check browser console for errors
- Verify date/time format is correct
- Ensure component is properly mounted

## Future Enhancements

- [ ] Push notifications for mobile apps
- [ ] WhatsApp Business API integration
- [ ] Advanced scheduling (recurring reminders)
- [ ] Notification analytics dashboard
- [ ] A/B testing for message templates
- [ ] Multi-language support expansion
- [ ] Voice call reminders
- [ ] Calendar integration (Google Calendar, iCal)

## Support

For issues or questions:
- Check the notification_logs table for delivery status
- Review user notification preferences
- Test with sample data first
- Contact system administrator for API key issues
