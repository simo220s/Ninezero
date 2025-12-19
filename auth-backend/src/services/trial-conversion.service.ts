import { getSupabaseClient } from '../config/supabase';
import { eventNotificationService } from './event-notification.service';
import logger from '../config/logger';

const supabase = getSupabaseClient();

/**
 * Trial conversion service for managing student conversion from trial to regular
 */
class TrialConversionService {
  /**
   * Check if a trial lesson is completed and trigger conversion
   */
  async checkAndConvertTrialStudent(classId: string): Promise<boolean> {
    try {
      // Get class session details
      const { data: classSession, error: classError } = await supabase
        .from('class_sessions')
        .select('id, student_id, is_trial, status')
        .eq('id', classId)
        .maybeSingle();

      if (classError) {
        logger.error('Failed to fetch class session:', classError);
        return false;
      }

      if (!classSession) {
        logger.error('Class session not found:', classId);
        return false;
      }

      // Only process trial lessons that are completed
      if (!classSession.is_trial || classSession.status !== 'completed') {
        return false;
      }

      // Get student profile
      const { data: profile, error: profileError} = await supabase
        .from('profiles')
        .select('id, is_trial, trial_completed, converted_at')
        .eq('id', classSession.student_id)
        .maybeSingle();

      if (profileError) {
        logger.error('Failed to fetch student profile:', profileError);
        return false;
      }

      if (!profile) {
        logger.error('Student profile not found:', classSession.student_id);
        return false;
      }

      // Check if student is still in trial and hasn't been converted
      if (!profile.is_trial || profile.trial_completed) {
        logger.info(`Student ${classSession.student_id} already converted or not in trial`);
        return false;
      }

      // Perform conversion
      const converted = await this.convertTrialToRegular(classSession.student_id);

      if (converted) {
        logger.info(`Successfully converted trial student ${classSession.student_id} to regular`);
      }

      return converted;
    } catch (error) {
      logger.error('Error checking and converting trial student:', error);
      return false;
    }
  }

  /**
   * Convert a trial student to regular student
   */
  async convertTrialToRegular(userId: string): Promise<boolean> {
    try {
      // Update profile flags
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_trial: false,
          trial_completed: true,
          converted_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to update profile for conversion:', updateError);
        return false;
      }

      // Send conversion notification to student
      await eventNotificationService.notifyConversionComplete(userId);

      // Notify admin about new regular student
      await this.notifyAdminAboutConversion(userId);

      // Create audit log entry
      await this.createConversionAuditLog(userId);

      logger.info(`Trial student ${userId} converted to regular successfully`);
      return true;
    } catch (error) {
      logger.error('Error converting trial to regular:', error);
      return false;
    }
  }

  /**
   * Notify admin about new regular student conversion
   */
  private async notifyAdminAboutConversion(userId: string): Promise<void> {
    try {
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (studentError) {
        logger.error('Error fetching student for admin notification:', studentError);
        return;
      }

      if (!student) {
        logger.error('Failed to fetch student for admin notification:', studentError);
        return;
      }

      // Get all admin users
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminsError || !admins || admins.length === 0) {
        logger.warn('No admin users found for conversion notification');
        return;
      }

      const studentName = `${student.first_name} ${student.last_name}`.trim();

      // Send notification to each admin
      for (const admin of admins) {
        const { notificationService } = await import('./notification.service');
        await notificationService.sendNotification(
          {
            userId: admin.id,
            type: 'conversion_complete' as any,
            title: 'طالب جديد منتظم',
            message: `تم تحويل ${studentName} من طالب تجريبي إلى طالب منتظم`,
            metadata: {
              studentId: userId,
              studentName,
              studentEmail: student.email,
            },
          },
          true // Send email
        );
      }

      logger.info(`Admin notifications sent for conversion of student ${userId}`);
    } catch (error) {
      logger.error('Error notifying admin about conversion:', error);
    }
  }

  /**
   * Create audit log entry for conversion
   */
  private async createConversionAuditLog(userId: string): Promise<void> {
    try {
      const { data: student } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .maybeSingle();

      const studentName = student
        ? `${student.first_name} ${student.last_name}`.trim()
        : 'Unknown';

      // Create audit log entry
      const { error } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'trial_conversion',
        entity_type: 'profile',
        entity_id: userId,
        old_value: { is_trial: true, trial_completed: false },
        new_value: {
          is_trial: false,
          trial_completed: true,
          converted_at: new Date().toISOString(),
        },
        description: `Trial student ${studentName} converted to regular student`,
        ip_address: null, // System action
        created_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to create audit log for conversion:', error);
      }
    } catch (error) {
      logger.error('Error creating conversion audit log:', error);
    }
  }

  /**
   * Check all completed trial lessons and trigger conversions
   */
  async processCompletedTrialLessons(): Promise<number> {
    try {
      // Get all completed trial lessons
      const { data: completedTrials, error } = await supabase
        .from('class_sessions')
        .select('id, student_id')
        .eq('is_trial', true)
        .eq('status', 'completed');

      if (error) {
        logger.error('Failed to fetch completed trial lessons:', error);
        return 0;
      }

      if (!completedTrials || completedTrials.length === 0) {
        return 0;
      }

      let conversionCount = 0;

      // Process each completed trial
      for (const trial of completedTrials) {
        const converted = await this.checkAndConvertTrialStudent(trial.id);
        if (converted) {
          conversionCount++;
        }
      }

      logger.info(`Processed ${completedTrials.length} completed trials, converted ${conversionCount} students`);
      return conversionCount;
    } catch (error) {
      logger.error('Error processing completed trial lessons:', error);
      return 0;
    }
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats(): Promise<{
    totalTrialStudents: number;
    convertedStudents: number;
    conversionRate: number;
  }> {
    try {
      // Get total trial students (ever)
      const { count: totalTrials } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('trial_completed', true);

      // Get converted students
      const { count: converted } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('trial_completed', true)
        .eq('is_trial', false);

      const totalTrialStudents = totalTrials || 0;
      const convertedStudents = converted || 0;
      const conversionRate =
        totalTrialStudents > 0
          ? (convertedStudents / totalTrialStudents) * 100
          : 0;

      return {
        totalTrialStudents,
        convertedStudents,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting conversion stats:', error);
      return {
        totalTrialStudents: 0,
        convertedStudents: 0,
        conversionRate: 0,
      };
    }
  }

  /**
   * Manually trigger conversion for a student (admin action)
   */
  async manualConversion(
    userId: string,
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify student is in trial
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_trial, trial_completed')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        logger.error('Error fetching profile for manual conversion:', profileError);
        return { success: false, message: 'Database error: ' + profileError.message };
      }

      if (!profile) {
        return { success: false, message: 'Student not found' };
      }

      if (!profile.is_trial) {
        return { success: false, message: 'Student is not in trial period' };
      }

      if (profile.trial_completed) {
        return { success: false, message: 'Student already converted' };
      }

      // Perform conversion
      const converted = await this.convertTrialToRegular(userId);

      if (converted) {
        // Log admin action
        await supabase.from('audit_logs').insert({
          user_id: adminId,
          action: 'manual_trial_conversion',
          entity_type: 'profile',
          entity_id: userId,
          description: `Admin manually converted trial student to regular`,
          created_at: new Date().toISOString(),
        });

        return { success: true, message: 'Student converted successfully' };
      }

      return { success: false, message: 'Conversion failed' };
    } catch (error) {
      logger.error('Error in manual conversion:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
}

// Export singleton instance
export const trialConversionService = new TrialConversionService();
