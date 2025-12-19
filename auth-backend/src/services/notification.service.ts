import { getSupabaseClient } from '../config/supabase';
import { emailService } from './email.service';
import logger from '../config/logger';

const supabase = getSupabaseClient();

/**
 * Notification types
 */
export enum NotificationType {
  CLASS_REMINDER_24H = 'class_reminder_24h',
  CLASS_REMINDER_1H = 'class_reminder_1h',
  CLASS_REMINDER_15M = 'class_reminder_15m',
  CLASS_SCHEDULED = 'class_scheduled',
  CLASS_CANCELLED = 'class_cancelled',
  REVIEW_SUBMITTED = 'review_submitted',
  LOW_CREDIT_BALANCE = 'low_credit_balance',
  TRIAL_EXPIRING = 'trial_expiring',
  CONVERSION_COMPLETE = 'conversion_complete',
}

/**
 * Notification data interface
 */
export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  classId?: string;
  metadata?: Record<string, any>;
}

/**
 * Email template data
 */
interface EmailTemplateData {
  subject: string;
  html: string;
}

/**
 * Notification service for managing in-app and email notifications
 */
class NotificationService {
  /**
   * Create an in-app notification
   */
  async createInAppNotification(data: NotificationData): Promise<string | null> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          class_id: data.classId,
          metadata: data.metadata || {},
          read: false,
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Failed to create in-app notification:', error);
        return null;
      }

      logger.info(`In-app notification created for user ${data.userId}`);
      return notification.id;
    } catch (error) {
      logger.error('Error creating in-app notification:', error);
      return null;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(
    userId: string,
    type: NotificationType,
    templateData: Record<string, any>,
    notificationId?: string
  ): Promise<boolean> {
    try {
      // Get user email and preferences
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error('Failed to fetch user for email notification:', userError);
        return false;
      }

      // Check notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('email_enabled')
        .eq('user_id', userId)
        .single();

      if (preferences && !preferences.email_enabled) {
        logger.info(`Email notifications disabled for user ${userId}`);
        return false;
      }

      // Generate email template
      const emailTemplate = this.getEmailTemplate(type, {
        ...templateData,
        userName: `${user.first_name} ${user.last_name}`.trim() || 'عزيزي الطالب',
      });

      // Record email notification attempt
      const { data: emailRecord, error: emailRecordError } = await supabase
        .from('email_notifications')
        .insert({
          user_id: userId,
          notification_id: notificationId,
          email_type: type,
          recipient_email: user.email,
          subject: emailTemplate.subject,
          body: emailTemplate.html,
          status: 'pending',
        })
        .select('id')
        .single();

      if (emailRecordError) {
        logger.error('Failed to record email notification:', emailRecordError);
      }

      // Send email
      const sent = await emailService.sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      // Update email notification status
      if (emailRecord) {
        await supabase
          .from('email_notifications')
          .update({
            status: sent ? 'sent' : 'failed',
            sent_at: sent ? new Date().toISOString() : null,
            error_message: sent ? null : 'Failed to send email',
          })
          .eq('id', emailRecord.id);
      }

      return sent;
    } catch (error) {
      logger.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send notification (both in-app and email)
   */
  async sendNotification(
    data: NotificationData,
    sendEmail: boolean = true
  ): Promise<{ inAppId: string | null; emailSent: boolean }> {
    // Create in-app notification
    const inAppId = await this.createInAppNotification(data);

    // Send email if requested
    let emailSent = false;
    if (sendEmail) {
      emailSent = await this.sendEmailNotification(
        data.userId,
        data.type,
        data.metadata || {},
        inAppId || undefined
      );
    }

    return { inAppId, emailSent };
  }

  /**
   * Get unread notifications for a user (optimized with composite index)
   */
  async getUnreadNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // Uses idx_notifications_user_read composite index
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, message, created_at, lesson_id')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 100)); // Cap at 100 for performance

      if (error) {
        logger.error('Failed to fetch unread notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        logger.error('Failed to mark notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        logger.error('Failed to mark all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Failed to fetch notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<{
      email_enabled: boolean;
      in_app_enabled: boolean;
      class_reminders_enabled: boolean;
      class_updates_enabled: boolean;
      review_notifications_enabled: boolean;
      credit_notifications_enabled: boolean;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        });

      if (error) {
        logger.error('Failed to update notification preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Get email template for notification type
   */
  private getEmailTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): EmailTemplateData {
    const templates: Record<NotificationType, (data: any) => EmailTemplateData> = {
      [NotificationType.CLASS_REMINDER_24H]: (d) => ({
        subject: 'تذكير: حصتك غداً - Saudi English Club',
        html: this.generateEmailHTML(
          'تذكير بحصتك القادمة',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>نذكرك بأن لديك حصة مجدولة غداً:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${d.date}</p>
              <p style="margin: 5px 0;"><strong>الوقت:</strong> ${d.time}</p>
              <p style="margin: 5px 0;"><strong>المدرس:</strong> ${d.teacherName}</p>
            </div>
            <p>نتطلع لرؤيتك في الحصة!</p>
          `
        ),
      }),
      [NotificationType.CLASS_REMINDER_1H]: (d) => ({
        subject: 'تذكير: حصتك خلال ساعة - Saudi English Club',
        html: this.generateEmailHTML(
          'حصتك تبدأ قريباً',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>حصتك ستبدأ خلال ساعة واحدة:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>الوقت:</strong> ${d.time}</p>
              <p style="margin: 5px 0;"><strong>المدرس:</strong> ${d.teacherName}</p>
            </div>
            <p>تأكد من أنك جاهز للانضمام!</p>
          `
        ),
      }),
      [NotificationType.CLASS_REMINDER_15M]: (d) => ({
        subject: 'حصتك تبدأ الآن - Saudi English Club',
        html: this.generateEmailHTML(
          'حان وقت الحصة',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>حصتك تبدأ خلال 15 دقيقة!</p>
            <p>يمكنك الانضمام الآن من خلال لوحة التحكم.</p>
          `
        ),
      }),
      [NotificationType.CLASS_SCHEDULED]: (d) => ({
        subject: 'تم جدولة حصة جديدة - Saudi English Club',
        html: this.generateEmailHTML(
          'حصة جديدة مجدولة',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>تم جدولة حصة جديدة لك:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${d.date}</p>
              <p style="margin: 5px 0;"><strong>الوقت:</strong> ${d.time}</p>
              <p style="margin: 5px 0;"><strong>المدرس:</strong> ${d.teacherName}</p>
              <p style="margin: 5px 0;"><strong>المدة:</strong> ${d.duration} دقيقة</p>
            </div>
            <p>يمكنك رؤية تفاصيل الحصة في لوحة التحكم.</p>
          `
        ),
      }),
      [NotificationType.CLASS_CANCELLED]: (d) => ({
        subject: 'تم إلغاء الحصة - Saudi English Club',
        html: this.generateEmailHTML(
          'إلغاء حصة',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>نأسف لإبلاغك بأنه تم إلغاء الحصة التالية:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${d.date}</p>
              <p style="margin: 5px 0;"><strong>الوقت:</strong> ${d.time}</p>
            </div>
            <p>${d.refundAmount ? `تم إرجاع ${d.refundAmount} رصيد إلى حسابك.` : ''}</p>
            <p>نعتذر عن أي إزعاج.</p>
          `
        ),
      }),
      [NotificationType.REVIEW_SUBMITTED]: (d) => ({
        subject: 'تقييم جديد من طالب - Saudi English Club',
        html: this.generateEmailHTML(
          'تقييم جديد',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>تلقيت تقييماً جديداً من ${d.studentName}:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>التقييم:</strong> ${d.rating}/5 ⭐</p>
              <p style="margin: 5px 0;"><strong>التعليق:</strong> ${d.comment || 'لا يوجد تعليق'}</p>
            </div>
            <p>شكراً لجهودك المستمرة!</p>
          `
        ),
      }),
      [NotificationType.LOW_CREDIT_BALANCE]: (d) => ({
        subject: 'رصيدك منخفض - Saudi English Club',
        html: this.generateEmailHTML(
          'تنبيه: رصيد منخفض',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>رصيدك الحالي منخفض: ${d.currentBalance} حصة</p>
            <p>لضمان استمرار حصصك، يرجى شحن رصيدك قريباً.</p>
          `
        ),
      }),
      [NotificationType.TRIAL_EXPIRING]: (d) => ({
        subject: 'الفترة التجريبية تنتهي قريباً - Saudi English Club',
        html: this.generateEmailHTML(
          'تنبيه: انتهاء الفترة التجريبية',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>فترتك التجريبية ستنتهي خلال ${d.daysRemaining} أيام.</p>
            <p>احجز حصتك التجريبية المجانية الآن لتقييم مستوى طفلك!</p>
          `
        ),
      }),
      [NotificationType.CONVERSION_COMPLETE]: (d) => ({
        subject: 'مبروك! تم تفعيل حسابك - Saudi English Club',
        html: this.generateEmailHTML(
          'تم تفعيل حسابك',
          `
            <p>مرحباً ${d.userName}،</p>
            <p>مبروك! تم تفعيل حسابك كطالب منتظم.</p>
            <p>يمكنك الآن حجز الحصص والاستفادة من جميع ميزات المنصة.</p>
            <p>نتمنى لك رحلة تعليمية ممتعة!</p>
          `
        ),
      }),
    };

    const templateFn = templates[type];
    return templateFn ? templateFn(data) : this.getDefaultTemplate(data);
  }

  /**
   * Generate HTML email template
   */
  private generateEmailHTML(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Cairo', Arial, sans-serif; background-color: #f6f7f8; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p style="margin: 0;">© 2024 Saudi English Club. جميع الحقوق محفوظة.</p>
            <p style="margin: 10px 0 0 0;">
              <a href="#" style="color: #2563eb; text-decoration: none;">إلغاء الاشتراك</a> | 
              <a href="#" style="color: #2563eb; text-decoration: none;">تواصل معنا</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get default email template
   */
  private getDefaultTemplate(data: any): EmailTemplateData {
    return {
      subject: 'إشعار من Saudi English Club',
      html: this.generateEmailHTML(
        'إشعار',
        `
          <p>مرحباً ${data.userName}،</p>
          <p>لديك إشعار جديد من Saudi English Club.</p>
        `
      ),
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
