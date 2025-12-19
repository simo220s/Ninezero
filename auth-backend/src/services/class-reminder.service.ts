import { getSupabaseClient } from '../config/supabase';
import { notificationService, NotificationType } from './notification.service';
import logger from '../config/logger';

const supabase = getSupabaseClient();

/**
 * Class reminder service for sending scheduled notifications
 */
class ClassReminderService {
  /**
   * Send 24-hour reminder for upcoming classes
   */
  async send24HourReminders(): Promise<number> {
    try {
      // Get classes starting in 24 hours (±30 minutes window)
      const now = new Date();
      const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 30 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000);

      const { data: classes, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          student_id,
          teacher_id
        `)
        .eq('status', 'scheduled')
        .gte('date', windowStart.toISOString().split('T')[0])
        .lte('date', windowEnd.toISOString().split('T')[0]);

      if (error) {
        logger.error('Failed to fetch classes for 24h reminders:', error);
        return 0;
      }

      if (!classes || classes.length === 0) {
        logger.info('No classes found for 24h reminders');
        return 0;
      }

      let sentCount = 0;

      for (const classSession of classes) {
        // Check if reminder already sent
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('class_id', classSession.id)
          .eq('type', NotificationType.CLASS_REMINDER_24H)
          .single();

        if (existingNotification) {
          continue; // Skip if already sent
        }

        // Fetch teacher name
        const { data: teacher } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', classSession.teacher_id)
          .single();

        const teacherName = teacher
          ? `${teacher.first_name} ${teacher.last_name}`.trim()
          : 'المدرس';

        // Send notification to student
        await notificationService.sendNotification(
          {
            userId: classSession.student_id,
            type: NotificationType.CLASS_REMINDER_24H,
            title: 'تذكير: حصتك غداً',
            message: `لديك حصة مجدولة غداً في ${classSession.time} مع ${teacherName}`,
            classId: classSession.id,
            metadata: {
              date: classSession.date,
              time: classSession.time,
              teacherName,
              duration: classSession.duration,
            },
          },
          true // Send email
        );

        sentCount++;
      }

      logger.info(`Sent ${sentCount} 24-hour reminders`);
      return sentCount;
    } catch (error) {
      logger.error('Error sending 24-hour reminders:', error);
      return 0;
    }
  }

  /**
   * Send 1-hour reminder for upcoming classes
   */
  async send1HourReminders(): Promise<number> {
    try {
      // Get classes starting in 1 hour (±15 minutes window)
      const now = new Date();
      const targetTime = new Date(now.getTime() + 60 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 15 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 15 * 60 * 1000);

      const { data: classes, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          student_id,
          teacher_id
        `)
        .eq('status', 'scheduled')
        .gte('date', windowStart.toISOString().split('T')[0])
        .lte('date', windowEnd.toISOString().split('T')[0]);

      if (error) {
        logger.error('Failed to fetch classes for 1h reminders:', error);
        return 0;
      }

      if (!classes || classes.length === 0) {
        logger.info('No classes found for 1h reminders');
        return 0;
      }

      let sentCount = 0;

      for (const classSession of classes) {
        // Check if reminder already sent
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('class_id', classSession.id)
          .eq('type', NotificationType.CLASS_REMINDER_1H)
          .single();

        if (existingNotification) {
          continue; // Skip if already sent
        }

        // Fetch teacher name
        const { data: teacher } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', classSession.teacher_id)
          .single();

        const teacherName = teacher
          ? `${teacher.first_name} ${teacher.last_name}`.trim()
          : 'المدرس';

        // Send notification to student
        await notificationService.sendNotification(
          {
            userId: classSession.student_id,
            type: NotificationType.CLASS_REMINDER_1H,
            title: 'تذكير: حصتك خلال ساعة',
            message: `حصتك ستبدأ خلال ساعة واحدة في ${classSession.time} مع ${teacherName}`,
            classId: classSession.id,
            metadata: {
              date: classSession.date,
              time: classSession.time,
              teacherName,
              duration: classSession.duration,
            },
          },
          true // Send email
        );

        sentCount++;
      }

      logger.info(`Sent ${sentCount} 1-hour reminders`);
      return sentCount;
    } catch (error) {
      logger.error('Error sending 1-hour reminders:', error);
      return 0;
    }
  }

  /**
   * Send 15-minute reminder for upcoming classes (in-app only)
   */
  async send15MinuteReminders(): Promise<number> {
    try {
      // Get classes starting in 15 minutes (±5 minutes window)
      const now = new Date();
      const targetTime = new Date(now.getTime() + 15 * 60 * 1000);
      const windowStart = new Date(targetTime.getTime() - 5 * 60 * 1000);
      const windowEnd = new Date(targetTime.getTime() + 5 * 60 * 1000);

      const { data: classes, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          student_id,
          teacher_id,
          meeting_link
        `)
        .eq('status', 'scheduled')
        .gte('date', windowStart.toISOString().split('T')[0])
        .lte('date', windowEnd.toISOString().split('T')[0]);

      if (error) {
        logger.error('Failed to fetch classes for 15m reminders:', error);
        return 0;
      }

      if (!classes || classes.length === 0) {
        logger.info('No classes found for 15m reminders');
        return 0;
      }

      let sentCount = 0;

      for (const classSession of classes) {
        // Check if reminder already sent
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('class_id', classSession.id)
          .eq('type', NotificationType.CLASS_REMINDER_15M)
          .single();

        if (existingNotification) {
          continue; // Skip if already sent
        }

        // Fetch teacher name
        const { data: teacher } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', classSession.teacher_id)
          .single();

        const teacherName = teacher
          ? `${teacher.first_name} ${teacher.last_name}`.trim()
          : 'المدرس';

        // Send in-app notification only (no email)
        await notificationService.sendNotification(
          {
            userId: classSession.student_id,
            type: NotificationType.CLASS_REMINDER_15M,
            title: 'حان وقت الحصة!',
            message: `حصتك تبدأ خلال 15 دقيقة. يمكنك الانضمام الآن!`,
            classId: classSession.id,
            metadata: {
              date: classSession.date,
              time: classSession.time,
              teacherName,
              meetingLink: classSession.meeting_link,
            },
          },
          false // No email for 15-minute reminder
        );

        sentCount++;
      }

      logger.info(`Sent ${sentCount} 15-minute reminders`);
      return sentCount;
    } catch (error) {
      logger.error('Error sending 15-minute reminders:', error);
      return 0;
    }
  }

  /**
   * Run all reminder checks
   */
  async runAllReminders(): Promise<{
    reminders24h: number;
    reminders1h: number;
    reminders15m: number;
  }> {
    logger.info('Running all class reminders...');

    const reminders24h = await this.send24HourReminders();
    const reminders1h = await this.send1HourReminders();
    const reminders15m = await this.send15MinuteReminders();

    logger.info(
      `Reminder summary: 24h=${reminders24h}, 1h=${reminders1h}, 15m=${reminders15m}`
    );

    return { reminders24h, reminders1h, reminders15m };
  }
}

// Export singleton instance
export const classReminderService = new ClassReminderService();
