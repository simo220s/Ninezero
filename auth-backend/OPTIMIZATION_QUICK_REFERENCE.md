# Database Optimization Quick Reference

## Using the Optimization Features

### 1. Pagination

```typescript
import { adminService } from './services/admin.service';

// Get paginated user list
const users = await adminService.getUserList({
  page: 1,        // Page number (default: 1)
  limit: 20,      // Items per page (default: 20, max: 100)
  role: 'student',
  search: 'john'
});

// Response format
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNextPage: true,
    hasPreviousPage: false
  }
}
```

### 2. Query Filtering

```typescript
import { QueryFilterBuilder } from './utils/database.utils';

const filters = new QueryFilterBuilder()
  .eq('role', 'student')           // Equality filter
  .in('status', ['active', 'pending'])  // IN filter
  .gte('created_at', '2024-01-01') // Greater than or equal
  .lte('created_at', '2024-12-31') // Less than or equal
  .ilike('email', 'example');      // Case-insensitive LIKE

const query = supabase.from('profiles').select('*');
const filteredQuery = filters.apply(query);
```

### 3. Query Caching

```typescript
import { queryCache } from './utils/database.utils';

// Check cache
const cached = queryCache.get<DashboardStats>('dashboard:stats');
if (cached) {
  return cached;
}

// Fetch and cache
const stats = await fetchDashboardStats();
queryCache.set('dashboard:stats', stats);

// Clear cache
queryCache.clear();

// Clear specific key
queryCache.set('key', null);
```

### 4. Admin Service Methods

```typescript
import { adminService } from './services/admin.service';

// Dashboard statistics (cached)
const stats = await adminService.getDashboardStats();

// User list with filters
const users = await adminService.getUserList({
  page: 1,
  limit: 20,
  role: 'student',
  isTrial: true,
  search: 'john',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Class list with filters
const classes = await adminService.getClassList({
  page: 1,
  limit: 20,
  status: 'scheduled',
  teacherId: 'teacher-id',
  studentId: 'student-id',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Credit transactions
const transactions = await adminService.getCreditTransactions({
  page: 1,
  limit: 50,
  userId: 'user-id',
  transactionType: 'add',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Upcoming classes (next 24 hours)
const upcoming = await adminService.getUpcomingClasses();

// Recent activity
const activity = await adminService.getRecentActivity(20);

// Credit statistics (cached)
const creditStats = await adminService.getCreditStatistics();
```

### 5. Optimized Class Queries

```typescript
import { classStatusService } from './services/class-status.service';

// Get upcoming classes for user
const upcoming = await classStatusService.getUpcomingClasses(
  userId,
  'student' // or 'teacher'
);

// Get class history
const history = await classStatusService.getClassHistory(
  userId,
  'student',
  50 // limit
);
```

### 6. Optimized Notification Queries

```typescript
import { notificationService } from './services/notification.service';

// Get unread notifications
const unread = await notificationService.getUnreadNotifications(
  userId,
  50 // limit
);
```

## Database Indexes

All queries automatically benefit from these indexes:

### Most Used Indexes
- `idx_class_sessions_student_date` - Student class queries
- `idx_class_sessions_teacher_date` - Teacher class queries
- `idx_notifications_user_read` - Unread notifications
- `idx_credit_transactions_user_date` - Transaction history
- `idx_profiles_role_trial` - User filtering

### Query Patterns That Use Indexes

✅ **Good** - Uses indexes
```typescript
// Filter by indexed column first
.eq('student_id', userId)
.gte('date', '2024-01-01')
.order('date', { ascending: false })
```

❌ **Bad** - May not use indexes
```typescript
// Filter by non-indexed column first
.gte('date', '2024-01-01')
.eq('student_id', userId)
```

## Performance Tips

### 1. Always Use Pagination
```typescript
// ✅ Good
const users = await adminService.getUserList({ page: 1, limit: 20 });

// ❌ Bad - fetches all records
const users = await supabase.from('profiles').select('*');
```

### 2. Select Only Needed Columns
```typescript
// ✅ Good
.select('id, email, first_name, last_name')

// ❌ Bad - fetches all columns
.select('*')
```

### 3. Use Joins Instead of Multiple Queries
```typescript
// ✅ Good - single query
const classes = await supabase
  .from('class_sessions')
  .select('*, student:profiles!student_id(*)');

// ❌ Bad - multiple queries
const classes = await supabase.from('class_sessions').select('*');
const students = await supabase.from('profiles')
  .in('id', classes.map(c => c.student_id));
```

### 4. Cache Frequently Accessed Data
```typescript
// ✅ Good - cache dashboard stats
const cached = queryCache.get('stats');
if (!cached) {
  const stats = await fetchStats();
  queryCache.set('stats', stats);
}

// ❌ Bad - fetch every time
const stats = await fetchStats();
```

### 5. Use Appropriate Limits
```typescript
// ✅ Good - reasonable limit
.limit(50)

// ❌ Bad - no limit or too large
.limit(10000)
```

## Monitoring

### Check Query Performance
```sql
-- Find slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Check Index Usage
```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

### Update Statistics
```sql
-- Run after significant data changes
ANALYZE class_sessions;
ANALYZE profiles;
ANALYZE credit_transactions;
ANALYZE notifications;
```

## Common Patterns

### Admin Dashboard
```typescript
// Parallel queries for dashboard
const [stats, upcoming, activity] = await Promise.all([
  adminService.getDashboardStats(),
  adminService.getUpcomingClasses(),
  adminService.getRecentActivity(10)
]);
```

### User Management
```typescript
// Paginated user list with search
const users = await adminService.getUserList({
  page: parseInt(req.query.page) || 1,
  limit: parseInt(req.query.limit) || 20,
  role: req.query.role,
  search: req.query.search
});
```

### Class Management
```typescript
// Filter classes by date range
const classes = await adminService.getClassList({
  page: 1,
  limit: 20,
  status: 'scheduled',
  dateFrom: startDate,
  dateTo: endDate
});
```

## Troubleshooting

### Slow Queries
1. Check if indexes are being used: `EXPLAIN ANALYZE <query>`
2. Verify statistics are up to date: `ANALYZE <table>`
3. Check for missing indexes on filter columns
4. Reduce result set size with pagination

### High Memory Usage
1. Implement pagination on large result sets
2. Select only needed columns
3. Clear query cache periodically
4. Reduce cache TTL

### Cache Issues
1. Clear cache after data updates
2. Adjust TTL based on data change frequency
3. Monitor cache hit rate
4. Consider Redis for distributed caching

## Best Practices Checklist

- ✅ Use pagination for all list queries
- ✅ Select only needed columns
- ✅ Filter on indexed columns first
- ✅ Use joins instead of multiple queries
- ✅ Cache frequently accessed data
- ✅ Set reasonable query limits
- ✅ Monitor query performance
- ✅ Update statistics regularly
- ✅ Clear cache on data updates
- ✅ Use parallel queries when possible
