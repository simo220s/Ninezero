import { getSupabaseClient } from '../config/supabase';
import logger from '../config/logger';

const supabase = getSupabaseClient();

// Import trial conversion service (lazy to avoid circular dependency)
let trialConversionService: any = null;
const getTrialConversionService = async () => {
  if (!trialConversionService) {
    const module = await import('./trial-conversion.service');
    trialConversionService = module.trialConversionService;
  }
  return trialConversionService;
};

/**
 * Class status service for automatic status updates
 */
class ClassStatusService {
  /**
   * Update class statuses based on current time
   * Moves scheduled classes to 'in_progress' or 'completed' based on time
   */
  async updateClassStatuses(): Promise<{
    inProgress: number;
    completed: number;
  }> {
    try {
      const now = new Date();
      let inProgressCount = 0;
      let completedCount = 0;

      // Get all scheduled classes
      const { data: scheduledClasses, error: fetchError } = await supabase
        .from('class_sessions')
        .select('id, date, time, duration')
        .eq('status', 'scheduled');

      if (fetchError) {
        logger.error('Failed to fetch scheduled classes:', fetchError);
        return { inProgress: 0, completed: 0 };
      }

      if (!scheduledClasses || scheduledClasses.length === 0) {
        return { inProgress: 0, completed: 0 };
      }

      // Process each class
      for (const classSession of scheduledClasses) {
        const [year, month, day] = classSession.date.split('-').map(Number);
        const [hours, minutes] = classSession.time.split(':').map(Number);
        
        const classStart = new Date(year, month - 1, day, hours, minutes);
        const classEnd = new Date(
          classStart.getTime() + classSession.duration * 60 * 1000
        );

        // Check if class should be in progress
        if (now >= classStart && now < classEnd) {
          const { error: updateError } = await supabase
            .from('class_sessions')
            .update({ status: 'in_progress' })
            .eq('id', classSession.id);

          if (!updateError) {
            inProgressCount++;
            logger.info(`Class ${classSession.id} moved to in_progress`);
          }
        }
        // Check if class should be completed
        else if (now >= classEnd) {
          const { error: updateError } = await supabase
            .from('class_sessions')
            .update({ status: 'completed' })
            .eq('id', classSession.id);

          if (!updateError) {
            completedCount++;
            logger.info(`Class ${classSession.id} moved to completed`);

            // Check if this is a trial lesson and trigger conversion
            const conversionService = await getTrialConversionService();
            await conversionService.checkAndConvertTrialStudent(classSession.id);
          }
        }
      }

      logger.info(
        `Class status update: ${inProgressCount} in progress, ${completedCount} completed`
      );

      return { inProgress: inProgressCount, completed: completedCount };
    } catch (error) {
      logger.error('Error updating class statuses:', error);
      return { inProgress: 0, completed: 0 };
    }
  }

  /**
   * Get upcoming classes for a user (optimized with proper indexing)
   */
  async getUpcomingClasses(userId: string, role: string): Promise<any[]> {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Build query with role-specific filter first (uses indexes)
      let query = supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          meeting_link,
          status,
          is_trial,
          student:profiles!class_sessions_student_id_fkey(id, first_name, last_name, email),
          teacher:profiles!class_sessions_teacher_id_fkey(id, first_name, last_name, email)
        `)
        .in('status', ['scheduled', 'in_progress'])
        .gte('date', todayStr);

      // Apply role filter (uses idx_class_sessions_student_date or idx_class_sessions_teacher_date)
      if (role === 'student') {
        query = query.eq('student_id', userId);
      } else if (role === 'teacher') {
        query = query.eq('teacher_id', userId);
      }

      // Order and limit
      query = query
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(50); // Reasonable limit for upcoming classes

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch upcoming classes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching upcoming classes:', error);
      return [];
    }
  }

  /**
   * Get class history for a user (optimized with proper indexing)
   */
  async getClassHistory(
    userId: string,
    role: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      // Build query with role-specific filter first (uses indexes)
      let query = supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          meeting_link,
          status,
          is_trial,
          student:profiles!class_sessions_student_id_fkey(id, first_name, last_name, email),
          teacher:profiles!class_sessions_teacher_id_fkey(id, first_name, last_name, email)
        `)
        .eq('status', 'completed');

      // Apply role filter (uses idx_class_sessions_student_date or idx_class_sessions_teacher_date)
      if (role === 'student') {
        query = query.eq('student_id', userId);
      } else if (role === 'teacher') {
        query = query.eq('teacher_id', userId);
      }

      // Order and limit
      query = query
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(Math.min(limit, 100)); // Cap at 100 for performance

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch class history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching class history:', error);
      return [];
    }
  }

  /**
   * Check if a class is within join window
   */
  isWithinJoinWindow(
    classDate: string,
    classTime: string,
    joinWindowMinutes: number = 10
  ): boolean {
    try {
      const [year, month, day] = classDate.split('-').map(Number);
      const [hours, minutes] = classTime.split(':').map(Number);
      
      const classDateTime = new Date(year, month - 1, day, hours, minutes);
      const joinWindowStart = new Date(
        classDateTime.getTime() - joinWindowMinutes * 60 * 1000
      );
      const now = new Date();

      return now >= joinWindowStart && now <= classDateTime;
    } catch (error) {
      logger.error('Error checking join window:', error);
      return false;
    }
  }

  /**
   * Get class status based on time
   */
  getClassStatus(
    classDate: string,
    classTime: string,
    duration: number
  ): 'upcoming' | 'in_progress' | 'completed' {
    try {
      const [year, month, day] = classDate.split('-').map(Number);
      const [hours, minutes] = classTime.split(':').map(Number);
      
      const classStart = new Date(year, month - 1, day, hours, minutes);
      const classEnd = new Date(classStart.getTime() + duration * 60 * 1000);
      const now = new Date();

      if (now >= classStart && now < classEnd) {
        return 'in_progress';
      } else if (now >= classEnd) {
        return 'completed';
      } else {
        return 'upcoming';
      }
    } catch (error) {
      logger.error('Error getting class status:', error);
      return 'upcoming';
    }
  }
}

// Export singleton instance
export const classStatusService = new ClassStatusService();
