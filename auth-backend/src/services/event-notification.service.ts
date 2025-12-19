import { getSupabaseClient } from '../config/supabase';
import { notificationService, NotificationType } from './notification.service';
import logger from '../config/logger';

const supabase = getSupabaseClient();

/**
 * Event notification service for handling various system events
 */
class EventNotificationService {
  /**
   * Send notification when a new class is scheduled
   */
  async notifyClassScheduled(classId: string): Promise<boolean> {
    try {
      const { data: classSession, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          student_id,
          teacher_id,
          is_trial
        `)
        .eq('id', classId)
        .single();

      if (error || !classSession) {
        logger.error('Failed to fetch class for scheduled notification:', error);
        return false;
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

      // Notify student
      await notificationService.sendNotification(
        {
          userId: classSession.student_id,
          type: NotificationType.CLASS_SCHEDULED,
          title: 'تم جدولة حصة جديدة',
          message: `تم جدولة حصة ${classSession.is_trial ? 'تجريبية' : 'جديدة'} لك في ${classSession.date} الساعة ${classSession.time}`,
          classId: classSession.id,
          metadata: {
            date: classSession.date,
            time: classSession.time,
            teacherName,
            duration: classSession.duration,
            isTrial: classSession.is_trial,
          },
        },
        true // Send email
      );

      logger.info(`Class scheduled notification sent for class ${classId}`);
      return true;
    } catch (error) {
      logger.error('Error sending class scheduled notification:', error);
      return false;
    }
  }

  /**
   * Send notification when a class is cancelled
   */
  async notifyClassCancelled(
    classId: string,
    refundAmount?: number
  ): Promise<boolean> {
    try {
      const { data: classSession, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          student_id,
          teacher_id
        `)
        .eq('id', classId)
        .single();

      if (error || !classSession) {
        logger.error('Failed to fetch class for cancellation notification:', error);
        return false;
      }

      // Notify student
      await notificationService.sendNotification(
        {
          userId: classSession.student_id,
          type: NotificationType.CLASS_CANCELLED,
          title: 'تم إلغاء الحصة',
          message: `تم إلغاء الحصة المجدولة في ${classSession.date} الساعة ${classSession.time}${refundAmount ? `. تم إرجاع ${refundAmount} رصيد إلى حسابك` : ''}`,
          classId: classSession.id,
          metadata: {
            date: classSession.date,
            time: classSession.time,
            refundAmount,
          },
        },
        true // Send email
      );

      logger.info(`Class cancelled notification sent for class ${classId}`);
      return true;
    } catch (error) {
      logger.error('Error sending class cancelled notification:', error);
      return false;
    }
  }

  /**
   * Send notification when a review is submitted
   */
  async notifyReviewSubmitted(reviewId: string): Promise<boolean> {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          student_id,
          lesson_id
        `)
        .eq('id', reviewId)
        .single();

      if (error || !review) {
        logger.error('Failed to fetch review for notification:', error);
        return false;
      }

      // Fetch student name
      const { data: student } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', review.student_id)
        .single();

      const studentName = student
        ? `${student.first_name} ${student.last_name}`.trim()
        : 'طالب';

      // Fetch lesson to get teacher_id
      const { data: lesson } = await supabase
        .from('lessons')
        .select('teacher_id')
        .eq('id', review.lesson_id)
        .single();

      if (!lesson) {
        logger.error('Failed to fetch lesson for review notification');
        return false;
      }

      // Notify teacher
      await notificationService.sendNotification(
        {
          userId: lesson.teacher_id,
          type: NotificationType.REVIEW_SUBMITTED,
          title: 'تقييم جديد',
          message: `تلقيت تقييماً جديداً من ${studentName}: ${review.rating}/5 نجوم`,
          metadata: {
            studentName,
            rating: review.rating,
            comment: review.comment,
            reviewId: review.id,
          },
        },
        true // Send email
      );

      logger.info(`Review submitted notification sent for review ${reviewId}`);
      return true;
    } catch (error) {
      logger.error('Error sending review submitted notification:', error);
      return false;
    }
  }

  /**
   * Send notification when credit balance is low
   */
  async notifyLowCreditBalance(userId: string, currentBalance: number): Promise<boolean> {
    try {
      // Check if we already sent a low balance notification recently (within 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', NotificationType.LOW_CREDIT_BALANCE)
        .gte('created_at', sevenDaysAgo.toISOString())
        .single();

      if (recentNotification) {
        logger.info(`Low balance notification already sent recently for user ${userId}`);
        return false;
      }

      await notificationService.sendNotification(
        {
          userId,
          type: NotificationType.LOW_CREDIT_BALANCE,
          title: 'رصيدك منخفض',
          message: `رصيدك الحالي: ${currentBalance} حصة. يرجى شحن رصيدك لضمان استمرار حصصك.`,
          metadata: {
            currentBalance,
          },
        },
        true // Send email
      );

      logger.info(`Low credit balance notification sent for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error sending low credit balance notification:', error);
      return false;
    }
  }

  /**
   * Send notification when trial period is expiring
   */
  async notifyTrialExpiring(userId: string, daysRemaining: number): Promise<boolean> {
    try {
      await notificationService.sendNotification(
        {
          userId,
          type: NotificationType.TRIAL_EXPIRING,
          title: 'الفترة التجريبية تنتهي قريباً',
          message: `فترتك التجريبية ستنتهي خلال ${daysRemaining} أيام. احجز حصتك التجريبية المجانية الآن!`,
          metadata: {
            daysRemaining,
          },
        },
        true // Send email
      );

      logger.info(`Trial expiring notification sent for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error sending trial expiring notification:', error);
      return false;
    }
  }

  /**
   * Send notification when student converts from trial to regular
   */
  async notifyConversionComplete(userId: string): Promise<boolean> {
    try {
      await notificationService.sendNotification(
        {
          userId,
          type: NotificationType.CONVERSION_COMPLETE,
          title: 'مبروك! تم تفعيل حسابك',
          message: 'تم تفعيل حسابك كطالب منتظم. يمكنك الآن حجز الحصص والاستفادة من جميع ميزات المنصة.',
          metadata: {},
        },
        true // Send email
      );

      logger.info(`Conversion complete notification sent for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error sending conversion complete notification:', error);
      return false;
    }
  }

  /**
   * Check and notify users with low credit balance
   */
  async checkLowCreditBalances(): Promise<number> {
    try {
      const LOW_BALANCE_THRESHOLD = 2;

      const { data: users, error } = await supabase
        .from('class_credits')
        .select('user_id, credits')
        .lt('credits', LOW_BALANCE_THRESHOLD);

      if (error) {
        logger.error('Failed to fetch users with low credit balance:', error);
        return 0;
      }

      if (!users || users.length === 0) {
        logger.info('No users with low credit balance found');
        return 0;
      }

      let notifiedCount = 0;

      for (const user of users) {
        const notified = await this.notifyLowCreditBalance(
          user.user_id,
          user.credits
        );
        if (notified) {
          notifiedCount++;
        }
      }

      logger.info(`Notified ${notifiedCount} users about low credit balance`);
      return notifiedCount;
    } catch (error) {
      logger.error('Error checking low credit balances:', error);
      return 0;
    }
  }

  /**
   * Check and notify trial students about expiring trials
   */
  async checkExpiringTrials(): Promise<number> {
    try {
      const TRIAL_DURATION_DAYS = 7;
      const NOTIFY_DAYS_BEFORE = [3, 1]; // Notify 3 days and 1 day before expiry

      const { data: trialStudents, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('is_trial', true)
        .eq('trial_completed', false);

      if (error) {
        logger.error('Failed to fetch trial students:', error);
        return 0;
      }

      if (!trialStudents || trialStudents.length === 0) {
        logger.info('No trial students found');
        return 0;
      }

      let notifiedCount = 0;
      const now = new Date();

      for (const student of trialStudents) {
        const createdAt = new Date(student.created_at);
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(expiryDate.getDate() + TRIAL_DURATION_DAYS);

        const daysRemaining = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (NOTIFY_DAYS_BEFORE.includes(daysRemaining)) {
          // Check if we already sent notification for this day
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', student.id)
            .eq('type', NotificationType.TRIAL_EXPIRING)
            .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
            .single();

          if (!existingNotification) {
            const notified = await this.notifyTrialExpiring(student.id, daysRemaining);
            if (notified) {
              notifiedCount++;
            }
          }
        }
      }

      logger.info(`Notified ${notifiedCount} trial students about expiring trials`);
      return notifiedCount;
    } catch (error) {
      logger.error('Error checking expiring trials:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const eventNotificationService = new EventNotificationService();
