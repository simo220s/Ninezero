# Data Fetching Hooks Documentation

This directory contains custom React Query hooks for fetching data from the database. These hooks replace mock data and provide proper loading states, error handling, and caching.

## Available Hooks

### Student Data Hooks (`useStudentData.ts`)

#### `useStudentData(teacherId: string)`
Fetches all students for a teacher.

```typescript
import { useStudentData } from '@/lib/hooks'

function MyComponent() {
  const { user } = useAuth()
  const { data: students, isLoading, error, refetch } = useStudentData(user.id)
  
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />
  
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

#### `useStudent(studentId: string)`
Fetches a single student by ID.

```typescript
const { data: student, isLoading, error } = useStudent(studentId)
```

#### `useStudentStats(teacherId: string)`
Fetches student statistics (counts by age group, level, etc.).

```typescript
const { data: stats, isLoading, error } = useStudentStats(teacherId)
```

### Class Data Hooks (`useClassData.ts`)

#### `useTeacherClasses(teacherId: string)`
Fetches all classes for a teacher.

```typescript
import { useTeacherClasses } from '@/lib/hooks'

function TeacherSchedule() {
  const { user } = useAuth()
  const { data: classes, isLoading, error } = useTeacherClasses(user.id)
  
  return (
    <ClassScheduleTable classes={classes} loading={isLoading} />
  )
}
```

#### `useStudentClasses(studentId: string)`
Fetches all classes for a student.

```typescript
const { data: classes, isLoading, error } = useStudentClasses(studentId)
```

#### `useUpcomingClasses(userId: string, role: 'teacher' | 'student')`
Fetches only upcoming scheduled classes.

```typescript
const { data: upcomingClasses, isLoading } = useUpcomingClasses(user.id, 'teacher')
```

#### `useTodayClasses(userId: string, role: 'teacher' | 'student')`
Fetches today's scheduled classes (auto-refreshes every minute).

```typescript
const { data: todayClasses, isLoading } = useTodayClasses(user.id, 'teacher')
```

### Dashboard Stats Hooks (`useDashboardStats.ts`)

#### `useTeacherStats(teacherId: string)`
Fetches comprehensive teacher dashboard statistics.

```typescript
import { useTeacherStats } from '@/lib/hooks'

function DashboardStats() {
  const { user } = useAuth()
  const { data: stats, isLoading, error } = useTeacherStats(user.id)
  
  if (isLoading) return <DashboardCardSkeleton count={4} />
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Students" value={stats.totalStudents} />
      <StatCard title="Active Students" value={stats.activeStudents} />
      <StatCard title="Upcoming Classes" value={stats.upcomingClasses} />
      <StatCard title="Success Rate" value={`${stats.successRate}%`} />
    </div>
  )
}
```

#### `usePerformanceMetrics(teacherId: string, timeRange: 'week' | 'month' | 'quarter' | 'year')`
Fetches performance metrics for analytics.

```typescript
const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
const { data: metrics, isLoading } = usePerformanceMetrics(user.id, timeRange)
```

#### `useAgeGroupAnalytics(teacherId: string)`
Fetches student analytics grouped by age.

```typescript
const { data: ageGroups, isLoading } = useAgeGroupAnalytics(teacherId)
```

#### `useLevelAnalytics(teacherId: string)`
Fetches student analytics grouped by English level.

```typescript
const { data: levels, isLoading } = useLevelAnalytics(teacherId)
```

#### `useMonthlyTrends(teacherId: string, months: number)`
Fetches monthly trend data for charts.

```typescript
const { data: trends, isLoading } = useMonthlyTrends(teacherId, 5)
```

## Invalidating Queries

When you mutate data (create, update, delete), you should invalidate related queries to refetch fresh data.

### Invalidate Student Data

```typescript
import { useInvalidateStudents } from '@/lib/hooks'

function AddStudentForm() {
  const { invalidateAll } = useInvalidateStudents()
  
  const handleSubmit = async (data) => {
    await createStudent(data)
    invalidateAll(teacherId) // Refetch all student data
  }
}
```

### Invalidate Class Data

```typescript
import { useInvalidateClasses } from '@/lib/hooks'

function AddClassModal() {
  const { invalidateTeacher } = useInvalidateClasses()
  
  const handleSubmit = async (data) => {
    await createClass(data)
    invalidateTeacher(teacherId) // Refetch teacher's classes
  }
}
```

### Invalidate Stats

```typescript
import { useInvalidateStats } from '@/lib/hooks'

function CompleteClassButton() {
  const { invalidateAll } = useInvalidateStats()
  
  const handleComplete = async () => {
    await markClassComplete(classId)
    invalidateAll(teacherId) // Refetch all stats
  }
}
```

## Loading States

All hooks return standard React Query states:

- `data`: The fetched data (undefined while loading)
- `isLoading`: True during initial fetch
- `isFetching`: True during any fetch (including background refetch)
- `error`: Error object if fetch failed
- `refetch`: Function to manually refetch data

### Example with All States

```typescript
function StudentList() {
  const { user } = useAuth()
  const { 
    data: students, 
    isLoading, 
    isFetching,
    error, 
    refetch 
  } = useStudentData(user.id)
  
  if (isLoading) {
    return <DashboardCardSkeleton count={3} />
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message="Failed to load students" 
        onRetry={refetch} 
      />
    )
  }
  
  if (!students || students.length === 0) {
    return <EmptyStudentList />
  }
  
  return (
    <div>
      {isFetching && <div className="text-sm text-gray-500">Updating...</div>}
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

## Caching Configuration

Each hook has different cache times based on data volatility:

- **Student Data**: 5 minutes stale time, 10 minutes cache time
- **Class Data**: 2 minutes stale time, 5 minutes cache time
- **Today's Classes**: 30 seconds stale time, auto-refetch every minute
- **Stats**: 5-15 minutes stale time, 10-30 minutes cache time

## Best Practices

1. **Always check loading state** before rendering data
2. **Provide error handling** with retry functionality
3. **Show empty states** when data array is empty
4. **Invalidate queries** after mutations
5. **Use skeleton loaders** for better UX during loading
6. **Enable queries conditionally** with the `enabled` option

```typescript
// Only fetch if user ID exists
const { data } = useStudentData(user?.id || '', {
  enabled: !!user?.id
})
```

## Migration from Mock Data

### Before (Mock Data)
```typescript
const [students, setStudents] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const mockStudents = [
    { id: '1', name: 'Student 1' },
    { id: '2', name: 'Student 2' },
  ]
  setStudents(mockStudents)
  setLoading(false)
}, [])
```

### After (Real Data with Hooks)
```typescript
const { data: students = [], isLoading } = useStudentData(teacherId)
```

That's it! The hook handles loading, error states, caching, and refetching automatically.
