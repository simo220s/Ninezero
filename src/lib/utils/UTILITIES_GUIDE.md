# Utility Functions Guide

This guide documents all reusable utility functions available in the application.

## Table of Contents

1. [Student Helpers](#student-helpers)
2. [Color Constants](#color-constants)
3. [Spacing Constants](#spacing-constants)
4. [Validation Schemas](#validation-schemas)
5. [Query Keys](#query-keys)
6. [Usage Examples](#usage-examples)

---

## Student Helpers

Located in: `src/lib/utils/student-helpers.ts`

### `formatStudentName(student, options?)`

Formats student name with proper fallback handling.

**Parameters:**
- `student`: Object with `name` and/or `profiles` data
- `options`: Optional formatting options
  - `fallback`: Custom fallback text (default: "طالب")
  - `format`: 'full' | 'first' | 'last' (default: 'full')

**Returns:** Formatted student name string

**Examples:**

```typescript
import { formatStudentName } from '@/lib/utils/student-helpers'

// Full name from profiles
formatStudentName({ 
  profiles: { first_name: 'أحمد', last_name: 'محمد' } 
})
// Returns: "أحمد محمد"

// Fallback to name field
formatStudentName({ name: 'أحمد' })
// Returns: "أحمد"

// Default fallback
formatStudentName({})
// Returns: "طالب"

// First name only
formatStudentName(
  { profiles: { first_name: 'أحمد', last_name: 'محمد' } },
  { format: 'first' }
)
// Returns: "أحمد"

// Custom fallback
formatStudentName({}, { fallback: 'غير محدد' })
// Returns: "غير محدد"
```

### `getStudentInitials(student)`

Gets student initials for avatar display.

**Returns:** 1-2 character string

**Example:**

```typescript
getStudentInitials({ 
  profiles: { first_name: 'أحمد', last_name: 'محمد' } 
})
// Returns: "أم"
```

### `hasCompleteProfile(student)`

Checks if student has complete profile data.

**Returns:** Boolean

**Example:**

```typescript
hasCompleteProfile({ 
  profiles: { first_name: 'أحمد', last_name: 'محمد' } 
})
// Returns: true
```

### `getStudentEmail(student)`

Gets student display email with fallback.

**Returns:** Email string

**Example:**

```typescript
getStudentEmail({ 
  profiles: { email: 'student@example.com' } 
})
// Returns: "student@example.com"
```

---

## Color Constants

Located in: `src/lib/constants/color-classes.ts`

### Available Color Sets

#### `TEXT_COLORS`

Consistent text color classes for all text elements.

```typescript
import { TEXT_COLORS } from '@/lib/constants/color-classes'

// Usage
<h1 className={TEXT_COLORS.heading}>عنوان</h1>
<p className={TEXT_COLORS.body}>نص</p>
<span className={TEXT_COLORS.error}>خطأ</span>
```

**Available colors:**
- `primary`, `primaryDark`, `primaryLight`
- `secondary`, `secondaryDark`
- `heading`, `subheading`, `body`, `label`, `value`
- `placeholder`, `muted`
- `error`, `success`, `warning`, `info`
- `link`, `linkVisited`
- `white`, `black`

#### `BG_COLORS`

Background color classes.

```typescript
import { BG_COLORS } from '@/lib/constants/color-classes'

<div className={BG_COLORS.primary}>محتوى</div>
```

**Available colors:**
- `primary`, `primaryHover`, `primaryLight`
- `secondary`, `secondaryHover`
- `white`, `gray`
- `error`, `errorDark`, `success`, `successDark`
- `warning`, `warningDark`, `info`, `infoDark`

#### `BORDER_COLORS`

Border color classes.

```typescript
import { BORDER_COLORS } from '@/lib/constants/color-classes'

<div className={`border ${BORDER_COLORS.default}`}>محتوى</div>
```

#### `BUTTON_COLORS`

Pre-configured button color combinations.

```typescript
import { BUTTON_COLORS } from '@/lib/constants/color-classes'

const primaryButton = `${BUTTON_COLORS.primary.bg} ${BUTTON_COLORS.primary.text}`
```

### Helper Functions

```typescript
import { getTextColor, getBgColor, getBorderColor } from '@/lib/constants/color-classes'

const textClass = getTextColor('primary')
const bgClass = getBgColor('success')
const borderClass = getBorderColor('error')
```

---

## Spacing Constants

Located in: `src/lib/constants/spacing.ts`

### Responsive Spacing

Optimized spacing values for all screen sizes.

```typescript
import { RESPONSIVE_SPACING } from '@/lib/constants/spacing'

// Section spacing (responsive across all breakpoints)
<section className={RESPONSIVE_SPACING.section}>
  محتوى
</section>

// Card spacing
<div className={RESPONSIVE_SPACING.card}>
  محتوى البطاقة
</div>

// Gap spacing
<div className={RESPONSIVE_SPACING.gap}>
  عناصر متباعدة
</div>
```

### Specific Breakpoint Spacing

```typescript
import { SPACING } from '@/lib/constants/spacing'

// Mobile only
<div className={SPACING.mobile.section}>محتوى</div>

// Tablet only
<div className={SPACING.tablet.card}>محتوى</div>

// Desktop only
<div className={SPACING.desktop.gap}>محتوى</div>
```

### Layout-Specific Spacing

```typescript
import { 
  HEADER_SPACING, 
  CONTENT_SPACING, 
  GRID_SPACING 
} from '@/lib/constants/spacing'

// Header
<header className={HEADER_SPACING.container}>محتوى</header>

// Main content
<main className={CONTENT_SPACING.main}>محتوى</main>

// Grid layout
<div className={GRID_SPACING.cols3}>عناصر الشبكة</div>
```

### Helper Functions

```typescript
import { combineSpacing, getSpacing } from '@/lib/constants/spacing'

// Combine multiple spacing classes
const spacing = combineSpacing('py-4', 'px-6', 'gap-4')

// Get specific spacing
const mobileSection = getSpacing('section', 'mobile')
```

---

## Validation Schemas

Located in: `src/lib/validation/`

### Auth Validation

```typescript
import { loginSchema, signupSchema } from '@/lib/validation/auth-validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema)
})
```

### Form Validation

```typescript
import { 
  addStudentSchema,
  addClassSchema,
  creditManagementSchema 
} from '@/lib/validation/form-validation'

// Add student form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(addStudentSchema)
})
```

### Common Field Validations

```typescript
import { 
  phoneSchema,
  urlSchema,
  positiveNumberSchema,
  dateSchema,
  timeSchema 
} from '@/lib/validation/form-validation'

// Custom form schema
const myFormSchema = z.object({
  phone: phoneSchema,
  website: urlSchema,
  price: positiveNumberSchema('السعر'),
  date: dateSchema,
  time: timeSchema
})
```

---

## Query Keys

Located in: `src/lib/api/query-keys.ts`

### Usage with React Query

```typescript
import { STUDENT_QUERY_KEYS, CLASS_QUERY_KEYS } from '@/lib/api/query-keys'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Fetch students
const { data: students } = useQuery({
  queryKey: STUDENT_QUERY_KEYS.all(teacherId),
  queryFn: () => fetchStudents(teacherId)
})

// Invalidate cache
const queryClient = useQueryClient()
queryClient.invalidateQueries({ 
  queryKey: STUDENT_QUERY_KEYS.all(teacherId) 
})
```

### Available Query Keys

- `STUDENT_QUERY_KEYS`: Student-related queries
- `CLASS_QUERY_KEYS`: Class/session queries
- `STATS_QUERY_KEYS`: Statistics and analytics
- `CREDIT_QUERY_KEYS`: Credit management
- `REVIEW_QUERY_KEYS`: Reviews and ratings
- `USER_QUERY_KEYS`: User profile data
- `NOTIFICATION_QUERY_KEYS`: Notifications
- `PACKAGE_QUERY_KEYS`: Package management
- `COUPON_QUERY_KEYS`: Coupon management
- `INVOICE_QUERY_KEYS`: Invoice management
- `CATEGORY_QUERY_KEYS`: Category management
- `WISHLIST_QUERY_KEYS`: Wishlist data
- `FINANCIAL_QUERY_KEYS`: Financial data

### Centralized Access

```typescript
import { QUERY_KEYS } from '@/lib/api/query-keys'

// Access all query keys
const studentKeys = QUERY_KEYS.students
const classKeys = QUERY_KEYS.classes
```

---

## Usage Examples

### Complete Component Example

```typescript
import { formatStudentName } from '@/lib/utils/student-helpers'
import { TEXT_COLORS, BG_COLORS } from '@/lib/constants/color-classes'
import { RESPONSIVE_SPACING } from '@/lib/constants/spacing'
import { STUDENT_QUERY_KEYS } from '@/lib/api/query-keys'
import { useQuery } from '@tanstack/react-query'

function StudentCard({ student }) {
  return (
    <div className={`${BG_COLORS.white} ${RESPONSIVE_SPACING.card} rounded-lg shadow`}>
      <h3 className={TEXT_COLORS.heading}>
        {formatStudentName(student)}
      </h3>
      <p className={TEXT_COLORS.body}>
        {student.email}
      </p>
    </div>
  )
}

function StudentList({ teacherId }) {
  const { data: students } = useQuery({
    queryKey: STUDENT_QUERY_KEYS.all(teacherId),
    queryFn: () => fetchStudents(teacherId)
  })

  return (
    <div className={RESPONSIVE_SPACING.gap}>
      {students?.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

### Form with Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addStudentSchema } from '@/lib/validation/form-validation'
import { TEXT_COLORS } from '@/lib/constants/color-classes'

function AddStudentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addStudentSchema)
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className={TEXT_COLORS.label}>الاسم الأول</label>
        <input {...register('firstName')} />
        {errors.firstName && (
          <p className={TEXT_COLORS.error}>{errors.firstName.message}</p>
        )}
      </div>
      
      <button type="submit">إضافة طالب</button>
    </form>
  )
}
```

---

## Best Practices

1. **Always use utility functions** instead of duplicating logic
2. **Import from index files** for cleaner imports:
   ```typescript
   // Good
   import { formatStudentName } from '@/lib/utils/student-helpers'
   
   // Also good (if using index)
   import { formatStudentName } from '@/lib/utils'
   ```

3. **Use constants for colors and spacing** to maintain consistency:
   ```typescript
   // Good
   <div className={TEXT_COLORS.heading}>
   
   // Avoid
   <div className="text-gray-900">
   ```

4. **Use validation schemas** for all forms:
   ```typescript
   // Good
   resolver: zodResolver(addStudentSchema)
   
   // Avoid
   // Manual validation
   ```

5. **Use query keys** for React Query caching:
   ```typescript
   // Good
   queryKey: STUDENT_QUERY_KEYS.all(teacherId)
   
   // Avoid
   queryKey: ['students', teacherId]
   ```

---

## Contributing

When adding new utility functions:

1. Add JSDoc comments with examples
2. Export from appropriate index file
3. Update this guide with usage examples
4. Write tests for the utility function
5. Ensure TypeScript types are properly defined

---

## Related Documentation

- [Error Handling Guide](../ERROR_HANDLING_GUIDE.md)
- [Loading States Guide](../../components/ui/LOADING_STATES_GUIDE.md)
- [Hooks README](../hooks/README.md)
