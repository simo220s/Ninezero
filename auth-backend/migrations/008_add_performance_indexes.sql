-- Migration: Add performance indexes for frequently queried fields
-- Description: Optimize database queries by adding indexes on commonly filtered and joined columns
-- Created: 2024-10-25

-- ============================================================================
-- CLASS_SESSIONS TABLE INDEXES
-- ============================================================================

-- Index for student queries (get classes by student)
-- Used in: getUpcomingClasses, getClassHistory, student dashboard
CREATE INDEX IF NOT EXISTS idx_class_sessions_student_id 
ON class_sessions(student_id);

-- Index for teacher queries (get classes by teacher)
-- Used in: getUpcomingClasses, getClassHistory, teacher dashboard
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_id 
ON class_sessions(teacher_id);

-- Composite index for date-based queries with status filter
-- Used in: updateClassStatuses, getUpcomingClasses (scheduled classes by date)
CREATE INDEX IF NOT EXISTS idx_class_sessions_status_date 
ON class_sessions(status, date);

-- Composite index for student + date queries (most common pattern)
-- Used in: student dashboard, class history with date filtering
CREATE INDEX IF NOT EXISTS idx_class_sessions_student_date 
ON class_sessions(student_id, date DESC);

-- Composite index for teacher + date queries
-- Used in: teacher dashboard, class scheduling conflicts
CREATE INDEX IF NOT EXISTS idx_class_sessions_teacher_date 
ON class_sessions(teacher_id, date DESC);

-- Index for trial lesson queries
-- Used in: trial conversion detection, trial statistics
CREATE INDEX IF NOT EXISTS idx_class_sessions_is_trial 
ON class_sessions(is_trial) 
WHERE is_trial = true;

-- ============================================================================
-- PROFILES TABLE INDEXES
-- ============================================================================

-- Index for role-based queries
-- Used in: admin user management, role filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);

-- Index for trial student queries
-- Used in: trial student filtering, conversion tracking
CREATE INDEX IF NOT EXISTS idx_profiles_is_trial 
ON profiles(is_trial) 
WHERE is_trial = true;

-- Composite index for role + trial status
-- Used in: admin dashboard stats, user management filters
CREATE INDEX IF NOT EXISTS idx_profiles_role_trial 
ON profiles(role, is_trial);

-- Index for email verification status
-- Used in: authentication, user verification workflows
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
ON profiles(is_email_verified) 
WHERE is_email_verified = false;

-- Index for referral code lookups
-- Used in: referral system, user registration
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code 
ON profiles(referral_code) 
WHERE referral_code IS NOT NULL;

-- ============================================================================
-- CREDIT_TRANSACTIONS TABLE INDEXES
-- ============================================================================

-- Index for user transaction history
-- Used in: credit history, transaction reports
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id 
ON credit_transactions(user_id);

-- Composite index for user + date queries (most common pattern)
-- Used in: transaction history with date filtering, monthly reports
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_date 
ON credit_transactions(user_id, created_at DESC);

-- Index for transaction type filtering
-- Used in: admin reports, transaction analysis
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type 
ON credit_transactions(transaction_type);

-- Index for class-related transactions
-- Used in: class cancellation refunds, transaction tracking
CREATE INDEX IF NOT EXISTS idx_credit_transactions_class_id 
ON credit_transactions(class_id) 
WHERE class_id IS NOT NULL;

-- Composite index for date-based transaction reports
-- Used in: admin dashboard, financial reports
CREATE INDEX IF NOT EXISTS idx_credit_transactions_date_type 
ON credit_transactions(created_at DESC, transaction_type);

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================================================

-- Composite index for user + read status (most common query)
-- Used in: getUnreadNotifications, notification center
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read, created_at DESC);

-- Index for notification type filtering
-- Used in: notification analytics, type-based queries
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(type);

-- Index for lesson-related notifications
-- Used in: class reminder notifications, notification cleanup
CREATE INDEX IF NOT EXISTS idx_notifications_lesson_id 
ON notifications(lesson_id) 
WHERE lesson_id IS NOT NULL;

-- Index for unread notifications count
-- Used in: notification badge count, quick unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, read) 
WHERE read = false;

-- ============================================================================
-- REVIEWS TABLE INDEXES
-- ============================================================================

-- Index for student reviews
-- Used in: student review history
CREATE INDEX IF NOT EXISTS idx_reviews_student_id 
ON reviews(student_id);

-- Index for lesson reviews (unique constraint already exists, but explicit index helps)
-- Used in: checking if lesson has been reviewed
CREATE INDEX IF NOT EXISTS idx_reviews_lesson_id 
ON reviews(lesson_id);

-- Index for approval status filtering
-- Used in: admin review management, public review display
CREATE INDEX IF NOT EXISTS idx_reviews_approved 
ON reviews(is_approved);

-- Composite index for approved reviews by date
-- Used in: public review display, teacher ratings
CREATE INDEX IF NOT EXISTS idx_reviews_approved_date 
ON reviews(is_approved, created_at DESC) 
WHERE is_approved = true;

-- ============================================================================
-- AUDIT_LOG TABLE INDEXES (note: table name is audit_log not audit_logs)
-- ============================================================================

-- Index for user action history
-- Used in: admin audit trail, user activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id 
ON audit_log(user_id);

-- Index for action type filtering
-- Used in: admin reports, security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_log_action 
ON audit_log(action);

-- Composite index for date-based audit queries
-- Used in: admin dashboard recent activity, audit reports
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp 
ON audit_log(timestamp DESC);

-- Index for entity tracking
-- Used in: tracking changes to specific entities
CREATE INDEX IF NOT EXISTS idx_audit_log_entity 
ON audit_log(entity_type, entity_id);

-- ============================================================================
-- TOKEN_BLACKLIST TABLE INDEXES
-- ============================================================================

-- Index for token lookup (primary use case)
-- Used in: authentication middleware, token validation
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token 
ON token_blacklist(token);

-- Index for cleanup of expired tokens
-- Used in: scheduled cleanup jobs
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at 
ON token_blacklist(expires_at);

-- ============================================================================
-- PASSWORD_RESET_TOKENS TABLE INDEXES
-- ============================================================================

-- Index for token lookup
-- Used in: password reset validation
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
ON password_reset_tokens(token);

-- Index for user password reset history
-- Used in: security monitoring, rate limiting
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
ON password_reset_tokens(user_id);

-- Index for cleanup of expired tokens
-- Used in: scheduled cleanup jobs
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
ON password_reset_tokens(expires_at);

-- ============================================================================
-- EMAIL_VERIFICATION_TOKENS TABLE INDEXES
-- ============================================================================

-- Index for token lookup
-- Used in: email verification
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
ON email_verification_tokens(token);

-- Index for user verification status
-- Used in: resending verification emails
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
ON email_verification_tokens(user_id);

-- Index for cleanup of expired tokens
-- Used in: scheduled cleanup jobs
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
ON email_verification_tokens(expires_at);

-- Note: admin_settings, notification_preferences, and email_notifications tables
-- will be created in future migrations and will need their own indexes at that time

-- ============================================================================
-- CLASS_CREDITS TABLE INDEXES
-- ============================================================================

-- Index for user credit lookup (primary use case)
-- Used in: credit balance checks, class scheduling validation
CREATE INDEX IF NOT EXISTS idx_class_credits_user_id 
ON class_credits(user_id);

-- Index for low balance alerts
-- Used in: notification service, credit monitoring
CREATE INDEX IF NOT EXISTS idx_class_credits_low_balance 
ON class_credits(credits) 
WHERE credits < 2;

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- 1. Partial indexes (with WHERE clause) are used for:
--    - Boolean flags that are frequently filtered (is_trial, is_approved, read)
--    - Nullable foreign keys (class_id, notification_id)
--    - Expired token cleanup queries
--    These reduce index size and improve write performance

-- 2. Composite indexes are ordered by:
--    - Equality filters first (user_id, status)
--    - Range filters last (date, created_at)
--    This follows PostgreSQL best practices for index efficiency

-- 3. DESC ordering on date fields:
--    - Most queries fetch recent records first
--    - Matches common ORDER BY patterns in application code

-- 4. All indexes use IF NOT EXISTS:
--    - Safe for re-running migration
--    - Prevents errors if indexes already exist

-- ============================================================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================================================

-- Run ANALYZE after creating indexes to update query planner statistics:
ANALYZE class_sessions;
ANALYZE profiles;
ANALYZE credit_transactions;
ANALYZE notifications;
ANALYZE reviews;
ANALYZE audit_log;

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan ASC;

-- Check for unused indexes (idx_scan = 0) and consider removing them

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
