import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiGet } from '@/lib/utils/api-client';
import { logger } from '@/lib/utils/logger';

interface ClassSession {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  meeting_link: string;
  is_trial: boolean;
  student_id: string;
  teacher_id: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useClasses(autoRefresh: boolean = true, refreshInterval: number = 60000) {
  const { user } = useAuth();
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSession[]>([]);
  const [classHistory, setClassHistory] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch upcoming classes
   */
  const fetchUpcomingClasses = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiGet<{ classes: ClassSession[] }>('/api/classes/upcoming');
      if (response.success && response.data) {
        setUpcomingClasses(response.data.classes);
        setError(null);
      } else {
        setError('Failed to fetch upcoming classes');
      }
    } catch (err) {
      logger.error('Error fetching upcoming classes:', err);
      setError('Failed to fetch upcoming classes');
    }
  }, [user]);

  /**
   * Fetch class history
   */
  const fetchClassHistory = useCallback(
    async (limit: number = 50) => {
      if (!user) return;

      try {
        const response = await apiGet<{ classes: ClassSession[] }>(`/api/classes/history?limit=${limit}`);
        if (response.success && response.data) {
          setClassHistory(response.data.classes);
          setError(null);
        } else {
          setError('Failed to fetch class history');
        }
      } catch (err) {
        logger.error('Error fetching class history:', err);
        setError('Failed to fetch class history');
      }
    },
    [user]
  );

  /**
   * Check if user can join a class
   */
  const canJoinClass = async (classId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await apiGet<{ canJoin: boolean }>(`/api/classes/${classId}/can-join`);
      return response.success && response.data ? response.data.canJoin : false;
    } catch (err) {
      logger.error('Error checking join availability:', err);
      return false;
    }
  };

  /**
   * Refresh all class data
   */
  const refreshClasses = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUpcomingClasses(), fetchClassHistory()]);
    setLoading(false);
  }, [fetchUpcomingClasses, fetchClassHistory]);

  /**
   * Get class status based on time
   */
  const getClassStatus = (
    classDate: string,
    classTime: string,
    duration: number
  ): 'upcoming' | 'in_progress' | 'completed' => {
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
  };

  /**
   * Check if class is within join window
   */
  const isWithinJoinWindow = (
    classDate: string,
    classTime: string,
    joinWindowMinutes: number = 10
  ): boolean => {
    const [year, month, day] = classDate.split('-').map(Number);
    const [hours, minutes] = classTime.split(':').map(Number);

    const classDateTime = new Date(year, month - 1, day, hours, minutes);
    const joinWindowStart = new Date(
      classDateTime.getTime() - joinWindowMinutes * 60 * 1000
    );
    const now = new Date();

    return now >= joinWindowStart && now <= classDateTime;
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      refreshClasses();
    }
  }, [user]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchUpcomingClasses();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, user, refreshInterval, fetchUpcomingClasses]);

  return {
    upcomingClasses,
    classHistory,
    loading,
    error,
    refreshClasses,
    fetchUpcomingClasses,
    fetchClassHistory,
    canJoinClass,
    getClassStatus,
    isWithinJoinWindow,
  };
}
