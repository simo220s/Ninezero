# Loading States Implementation Guide

## Overview

This guide documents the implementation of improved loading states and performance optimizations across the LMS platform. All "جاري التحميل..." text has been replaced with skeleton loaders for better UX.

## Skeleton Loader Components

### Available Skeleton Components

Located in `src/components/ui/Skeleton.tsx`:

1. **Skeleton** - Base skeleton component
2. **StudentCardSkeleton** - For student list items
3. **ClassCardSkeleton** - For class list items
4. **TableSkeleton** - For data tables
5. **StatsCardSkeleton** - For dashboard statistics
6. **DashboardStatsSkeleton** - For dashboard stats grid
7. **ListSkeleton** - For generic lists
8. **FormSkeleton** - For form loading states
9. **PageHeaderSkeleton** - For page headers
10. **CreditManagementSkeleton** - For credit management forms
11. **StudentDetailsSkeleton** - For student detail views

### Usage Examples

#### Basic Skeleton
```tsx
import { Skeleton } from '@/components/ui/Skeleton'

<Skeleton className="h-4 w-32" />
<Skeleton variant="circular" className="w-12 h-12" />
```

#### Student List Loading
```tsx
import { StudentCardSkeleton } from '@/components/ui/Skeleton'

{loading ? (
  <div className="space-y-4">
    <StudentCardSkeleton />
    <StudentCardSkeleton />
    <StudentCardSkeleton />
  </div>
) : (
  // Actual content
)}
```

#### Class List Loading
```tsx
import { ClassCardSkeleton } from '@/components/ui/Skeleton'

{loading ? (
  <div className="space-y-4">
    <ClassCardSkeleton />
    <ClassCardSkeleton />
    <ClassCardSkeleton />
  </div>
) : (
  // Actual content
)}
```

#### Table Loading
```tsx
import { TableSkeleton } from '@/components/ui/Skeleton'

{loading ? (
  <TableSkeleton rows={5} columns={4} />
) : (
  // Actual table
)}
```

## Async Button Actions

### useAsyncAction Hook

Located in `src/lib/hooks/useAsyncAction.ts`:

```tsx
import { useAsyncAction } from '@/lib/hooks/useAsyncAction'

const { execute, isLoading, error } = useAsyncAction(
  async (studentId: string) => {
    await deleteStudent(studentId)
  },
  {
    successMessage: 'تم حذف الطالب بنجاح',
    errorMessage: 'فشل حذف الطالب',
    onSuccess: () => {
      // Refresh data
      refetch()
    }
  }
)

// In component
<Button 
  onClick={() => execute(student.id)} 
  loading={isLoading}
>
  حذف
</Button>
```

### Multiple Async Actions

```tsx
import { useAsyncActions } from '@/lib/hooks/useAsyncAction'

const actions = useAsyncActions({
  deleteStudent: async (id: string) => {
    await studentService.delete(id)
  },
  updateStudent: async (id: string, data: any) => {
    await studentService.update(id, data)
  }
})

<Button 
  onClick={() => actions.deleteStudent.execute(student.id)}
  loading={actions.deleteStudent.isLoading}
>
  حذف
</Button>
```

### Debounced Actions (for Search)

```tsx
import { useDebouncedAsyncAction } from '@/lib/hooks/useAsyncAction'

const { execute, isLoading } = useDebouncedAsyncAction(
  async (query: string) => {
    const results = await searchStudents(query)
    setResults(results)
  },
  300 // 300ms delay
)

<Input 
  onChange={(e) => execute(e.target.value)}
  placeholder="البحث..."
/>
```

## Button Loading States

The Button component automatically handles loading states:

```tsx
import { Button } from '@/components/ui/button'

// Automatic loading state
<Button 
  onClick={async () => {
    await saveData()
  }}
>
  حفظ
</Button>

// Manual loading state
<Button loading={isLoading}>
  حفظ
</Button>

// With async action hook
<Button 
  onClick={() => execute()}
  loading={isLoading}
>
  حفظ
</Button>
```

## Performance Optimizations

### Caching

```tsx
import { cache, CacheKeys } from '@/lib/performance'

// Set cache
cache.set(CacheKeys.STUDENTS_LIST, students, {
  ttl: 5 * 60 * 1000, // 5 minutes
  storage: 'memory'
})

// Get from cache
const cachedStudents = cache.get(CacheKeys.STUDENTS_LIST)

// Invalidate cache
invalidateCache.students()
```

### Lazy Loading

```tsx
import { useLazyLoad, useInfiniteScroll } from '@/lib/performance'

const {
  items: displayedStudents,
  hasMore,
  isLoading,
  loadMore
} = useLazyLoad(allStudents, { pageSize: 20 })

const loadMoreRef = useInfiniteScroll(loadMore, hasMore, isLoading)

// In component
<div ref={loadMoreRef}>Load more trigger</div>
```

### Debounced Search

```tsx
import { useDebounce } from '@/lib/performance'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch)
  }
}, [debouncedSearch])
```

### Lazy Image Loading

```tsx
import { LazyImage, LazyAvatar } from '@/components/ui/lazy-image'

// Lazy loaded image
<LazyImage 
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  quality={85}
/>

// Lazy loaded avatar
<LazyAvatar 
  src={avatarUrl}
  name="Student Name"
  size="md"
/>
```

## Updated Pages

### StudentManagementPage
- ✅ Replaced loading text with StudentCardSkeleton
- ✅ Implemented lazy loading for student list
- ✅ Added caching for student data
- ✅ Debounced search input

### ClassManagementPage
- ✅ Replaced loading text with ClassCardSkeleton
- ✅ Implemented lazy loading for class list
- ✅ Added caching for class data
- ✅ Optimized database queries

### CreditManagementPage
- ✅ Replaced loading text with CreditManagementSkeleton
- ✅ Added async action handling
- ✅ Implemented proper loading states for buttons

### CategoryAnalytics
- ✅ Replaced loading text with skeleton loader
- ✅ Added progressive loading

### CategoryManager
- ✅ Replaced loading text with skeleton loader
- ✅ Optimized category filtering

### CategoryFilter
- ✅ Replaced loading text with skeleton loader

### PackageManagement
- ✅ Replaced loading text with skeleton loader
- ✅ Added progressive loading for packages

### PackagePurchaseFlow
- ✅ Replaced loading text with skeleton loader
- ✅ Improved checkout loading experience

## Performance Metrics

### Target Metrics
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds
- First contentful paint: < 1 second
- Skeleton display: Immediate (no delay)
- Cached data load: < 500ms

### Optimization Techniques Applied
1. **Skeleton Loaders** - Immediate visual feedback
2. **Progressive Loading** - Load data in chunks
3. **Caching** - Reduce redundant API calls
4. **Lazy Loading** - Load images and components on demand
5. **Debouncing** - Reduce search API calls
6. **Virtual Scrolling** - Handle large lists efficiently
7. **Query Optimization** - Efficient database queries

## Best Practices

### Do's
✅ Use skeleton loaders for all loading states
✅ Show loading indicators on async buttons
✅ Cache frequently accessed data
✅ Implement lazy loading for images
✅ Debounce search inputs
✅ Use progressive loading for large datasets
✅ Provide immediate visual feedback

### Don'ts
❌ Don't use "جاري التحميل..." text alone
❌ Don't block UI during async operations
❌ Don't fetch same data multiple times
❌ Don't load all images at once
❌ Don't trigger search on every keystroke
❌ Don't render large lists without pagination
❌ Don't leave users wondering if something is happening

## Testing Loading States

### Manual Testing
1. Test with slow network (throttle to 3G)
2. Verify skeleton loaders appear immediately
3. Check button loading states work correctly
4. Confirm cached data loads quickly
5. Test lazy loading triggers properly
6. Verify search debouncing works

### Network Throttling
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from throttling dropdown
4. Test loading states
```

## Migration Guide

### Replacing Old Loading States

**Before:**
```tsx
{loading && (
  <div className="text-center">
    <Spinner size="lg" />
    <p>جاري التحميل...</p>
  </div>
)}
```

**After:**
```tsx
{loading && (
  <div className="space-y-4">
    <StudentCardSkeleton />
    <StudentCardSkeleton />
    <StudentCardSkeleton />
  </div>
)}
```

### Adding Async Button Loading

**Before:**
```tsx
<Button onClick={handleDelete}>
  حذف
</Button>
```

**After:**
```tsx
const { execute, isLoading } = useAsyncAction(handleDelete, {
  successMessage: 'تم الحذف بنجاح'
})

<Button onClick={execute} loading={isLoading}>
  حذف
</Button>
```

## Troubleshooting

### Skeleton Not Showing
- Check if loading state is properly set
- Verify skeleton component is imported
- Ensure conditional rendering is correct

### Button Not Showing Loading
- Check if loading prop is passed
- Verify async action is properly wrapped
- Ensure Button component is from ui/button

### Cache Not Working
- Verify cache key is correct
- Check TTL is not expired
- Ensure cache.set is called after data fetch

### Images Not Lazy Loading
- Check if LazyImage component is used
- Verify IntersectionObserver is supported
- Ensure proper src prop is provided

## Future Improvements

1. Add shimmer animation to skeletons
2. Implement predictive loading
3. Add service worker for offline caching
4. Optimize bundle size with code splitting
5. Add performance monitoring
6. Implement request deduplication
7. Add optimistic UI updates

## Resources

- [Performance Optimization Module](../../lib/performance/index.ts)
- [Skeleton Components](./Skeleton.tsx)
- [Async Action Hook](../../lib/hooks/useAsyncAction.ts)
- [Button Component](./button.tsx)
- [Lazy Image Component](./lazy-image.tsx)
