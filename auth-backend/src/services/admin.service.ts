import { getSupabaseClient } from '../config/supabase';
import logger from '../config/logger';
import {
  calculatePagination,
  buildPaginationResult,
  QueryFilterBuilder,
  PaginationParams,
  PaginationResult,
  queryCache,
} from '../utils/database.utils';

const supabase = getSupabaseClient();

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  trialStudents: number;
  regularStudents: number;
  scheduledClasses: number;
  completedClasses: number;
  totalCreditsInSystem: number;
  averageRating: number;
  recentConversions: number;
}

/**
 * User list filters
 */
export interface UserListFilters extends PaginationParams {
  role?: string;
  isTrial?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Class list filters
 */
export interface ClassListFilters extends PaginationParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  teacherId?: string;
  studentId?: string;
}

/**
 * Credit transaction filters
 */
export interface CreditTransactionFilters extends PaginationParams {
  userId?: string;
  transactionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Admin service for optimized database queries
 */
class AdminService {
  /**
   * Get dashboard statistics with caching
   */
  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      // Check cache first
      const cacheKey = 'dashboard:stats';
      const cached = queryCache.get<DashboardStats>(cacheKey);
      if (cached) {
        logger.info('Dashboard stats retrieved from cache');
        return cached;
      }

      // Use parallel queries for better performance
      const [
        usersResult,
        classesResult,
        creditsResult,
        ratingsResult,
        conversionsResult,
      ] = await Promise.all([
        // User statistics
        supabase
          .from('profiles')
          .select('role, is_trial', { count: 'exact', head: false }),

        // Class statistics
        supabase
          .from('class_sessions')
          .select('status', { count: 'exact', head: false }),

        // Credit statistics
        supabase
          .from('class_credits')
          .select('credits', { count: 'exact', head: false }),

        // Rating statistics
        supabase
          .from('reviews')
          .select('rating', { count: 'exact', head: false })
          .eq('is_approved', true),

        // Recent conversions (last 30 days)
        supabase
          .from('profiles')
          .select('converted_at', { count: 'exact', head: true })
          .eq('is_trial', false)
          .not('converted_at', 'is', null)
          .gte('converted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Process user statistics
      const users = usersResult.data || [];
      const totalUsers = users.length;
      const totalStudents = users.filter((u) => u.role === 'student').length;
      const totalTeachers = users.filter((u) => u.role === 'teacher').length;
      const totalAdmins = users.filter((u) => u.role === 'admin').length;
      const trialStudents = users.filter((u) => u.role === 'student' && u.is_trial).length;
      const regularStudents = users.filter((u) => u.role === 'student' && !u.is_trial).length;

      // Process class statistics
      const classes = classesResult.data || [];
      const scheduledClasses = classes.filter((c) => c.status === 'scheduled').length;
      const completedClasses = classes.filter((c) => c.status === 'completed').length;

      // Process credit statistics
      const credits = creditsResult.data || [];
      const totalCreditsInSystem = credits.reduce((sum, c) => sum + Number(c.credits || 0), 0);

      // Process rating statistics
      const ratings = ratingsResult.data || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      // Recent conversions count
      const recentConversions = conversionsResult.count || 0;

      const stats: DashboardStats = {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalAdmins,
        trialStudents,
        regularStudents,
        scheduledClasses,
        completedClasses,
        totalCreditsInSystem,
        averageRating: Math.round(averageRating * 10) / 10,
        recentConversions,
      };

      // Cache for 60 seconds
      queryCache.set(cacheKey, stats);

      return stats;
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      return null;
    }
  }

  /**
   * Get user list with pagination and filters (optimized with joins)
   */
  async getUserList(filters: UserListFilters): Promise<PaginationResult<any> | null> {
    try {
      const { offset, limit, page } = calculatePagination(filters);

      // Build filter query
      const filterBuilder = new QueryFilterBuilder()
        .eq('role', filters.role)
        .eq('is_trial', filters.isTrial)
        .gte('created_at', filters.dateFrom)
        .lte('created_at', filters.dateTo);

      // Add search filter
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          is_trial,
          trial_completed,
          created_at,
          class_credits!inner(credits)
        `, { count: 'exact' });

      // Apply filters
      query = filterBuilder.apply(query);

      // Apply search
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching user list:', error);
        return null;
      }

      return buildPaginationResult(data || [], count || 0, page, limit);
    } catch (error) {
      logger.error('Error in getUserList:', error);
      return null;
    }
  }

  /**
   * Get class list with pagination and filters (optimized with joins)
   */
  async getClassList(filters: ClassListFilters): Promise<PaginationResult<any> | null> {
    try {
      const { offset, limit, page } = calculatePagination(filters);

      // Build filter query
      const filterBuilder = new QueryFilterBuilder()
        .eq('status', filters.status)
        .eq('student_id', filters.studentId)
        .eq('teacher_id', filters.teacherId)
        .gte('date', filters.dateFrom)
        .lte('date', filters.dateTo);

      // Query with joins to get student and teacher info
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
          created_at,
          student:profiles!class_sessions_student_id_fkey(id, first_name, last_name, email),
          teacher:profiles!class_sessions_teacher_id_fkey(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      query = filterBuilder.apply(query);

      // Apply pagination and ordering
      query = query
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching class list:', error);
        return null;
      }

      return buildPaginationResult(data || [], count || 0, page, limit);
    } catch (error) {
      logger.error('Error in getClassList:', error);
      return null;
    }
  }

  /**
   * Get credit transactions with pagination and filters (optimized with joins)
   */
  async getCreditTransactions(
    filters: CreditTransactionFilters
  ): Promise<PaginationResult<any> | null> {
    try {
      const { offset, limit, page } = calculatePagination(filters);

      // Build filter query
      const filterBuilder = new QueryFilterBuilder()
        .eq('user_id', filters.userId)
        .eq('transaction_type', filters.transactionType)
        .gte('created_at', filters.dateFrom)
        .lte('created_at', filters.dateTo);

      // Query with joins to get user info
      let query = supabase
        .from('credit_transactions')
        .select(`
          id,
          amount,
          transaction_type,
          reason,
          created_at,
          user:profiles!credit_transactions_user_id_fkey(id, first_name, last_name, email),
          performed_by_user:profiles!credit_transactions_performed_by_fkey(id, first_name, last_name)
        `, { count: 'exact' });

      // Apply filters
      query = filterBuilder.apply(query);

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching credit transactions:', error);
        return null;
      }

      return buildPaginationResult(data || [], count || 0, page, limit);
    } catch (error) {
      logger.error('Error in getCreditTransactions:', error);
      return null;
    }
  }

  /**
   * Get upcoming classes (next 24 hours) with joins
   */
  async getUpcomingClasses(): Promise<any[]> {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const todayStr = now.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          time,
          duration,
          meeting_link,
          status,
          student:profiles!class_sessions_student_id_fkey(id, first_name, last_name, email),
          teacher:profiles!class_sessions_teacher_id_fkey(id, first_name, last_name, email)
        `)
        .eq('status', 'scheduled')
        .gte('date', todayStr)
        .lte('date', tomorrowStr)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(20);

      if (error) {
        logger.error('Error fetching upcoming classes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUpcomingClasses:', error);
      return [];
    }
  }

  /**
   * Get recent activity from audit log
   */
  async getRecentActivity(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          timestamp,
          user:profiles!audit_log_user_id_fkey(id, first_name, last_name, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching recent activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getRecentActivity:', error);
      return [];
    }
  }

  /**
   * Get credit statistics
   */
  async getCreditStatistics(): Promise<any | null> {
    try {
      // Check cache first
      const cacheKey = 'credit:statistics';
      const cached = queryCache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [totalResult, monthlyResult, lowBalanceResult] = await Promise.all([
        // Total credits in system
        supabase
          .from('class_credits')
          .select('credits'),

        // Monthly transactions
        supabase
          .from('credit_transactions')
          .select('amount, transaction_type')
          .gte('created_at', firstDayOfMonth),

        // Low balance users
        supabase
          .from('class_credits')
          .select('user_id', { count: 'exact', head: true })
          .lt('credits', 2),
      ]);

      const totalCredits = (totalResult.data || []).reduce(
        (sum, c) => sum + Number(c.credits || 0),
        0
      );

      const transactions = monthlyResult.data || [];
      const creditsAdded = transactions
        .filter((t) => t.transaction_type === 'add')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const creditsConsumed = transactions
        .filter((t) => t.transaction_type === 'deduct')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const stats = {
        totalCredits,
        creditsAddedThisMonth: creditsAdded,
        creditsConsumedThisMonth: creditsConsumed,
        lowBalanceUsers: lowBalanceResult.count || 0,
      };

      // Cache for 60 seconds
      queryCache.set(cacheKey, stats);

      return stats;
    } catch (error) {
      logger.error('Error fetching credit statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
