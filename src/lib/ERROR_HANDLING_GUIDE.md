# Error Handling Guide

This guide explains how to use the comprehensive error handling system in the Saudi English Club platform.

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Usage Examples](#usage-examples)
4. [Best Practices](#best-practices)
5. [Error Types](#error-types)
6. [Arabic Error Messages](#arabic-error-messages)

## Overview

The error handling system provides:

- **Consistent error handling** across the application
- **User-friendly Arabic error messages**
- **Automatic logging** of errors
- **Toast notifications** for user feedback
- **Error boundaries** for React component errors
- **Retry mechanisms** with exponential backoff
- **Validation helpers** for common scenarios

## Core Components

### 1. Logger (`src/lib/utils/logger.ts`)

Provides structured logging with different log levels:

```typescript
import { logger } from '@/lib/utils/logger'

// Different log levels
logger.debug('Debug message', { data: 'value' })
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error occurred', error, { context: 'additional data' })
```

### 2. AppError Class (`src/lib/error-handling.ts`)

Custom error class with type and user-friendly messages:

```typescript
import { AppError, ErrorType } from '@/lib/error-handling'

throw new AppError(
  ErrorType.VALIDATION,
  'INVALID_EMAIL',
  'البريد الإلكتروني غير صحيح'
)
```

### 3. Async Handlers (`src/lib/utils/async-handler.ts`)

Utilities for handling async operations:

```typescript
import { handleAsync, safeAsync, validateAndExecute } from '@/lib/utils/async-handler'

// Basic async handling
const result = await handleAsync(
  async () => {
    return await fetchData()
  },
  { showToast: true }
)

// Safe async (returns { data, error })
const { data, error } = await safeAsync(async () => {
  return await fetchData()
})

// With validation
await validateAndExecute(
  () => email ? true : 'البريد الإلكتروني مطلوب',
  async () => await sendEmail(email)
)
```

### 4. Error UI Components (`src/components/ui/error-message.tsx`)

Pre-built error message components:

```typescript
import {
  InlineError,
  ErrorCard,
  ErrorPage,
  EmptyState,
  NetworkError,
} from '@/components/ui/error-message'

// Inline error for forms
<InlineError message="هذا الحقل مطلوب" />

// Error card with retry
<ErrorCard
  message="فشل تحميل البيانات"
  onRetry={handleRetry}
/>

// Full page error
<ErrorPage message="حدث خطأ" onRetry={handleRetry} />

// Empty state
<EmptyState
  title="لا توجد بيانات"
  message="لم يتم العثور على أي بيانات"
  action={{ label: 'إضافة', onClick: handleAdd }}
/>
```

### 5. Toast Notifications (`src/components/ui/toast.tsx`)

Global toast notification system:

```typescript
import { toast } from '@/components/ui/toast'

toast.success('تم الحفظ بنجاح')
toast.error('حدث خطأ')
toast.warning('تحذير')
toast.info('معلومة')
```

### 6. Error Boundary (`src/components/ui/error-boundary.tsx`)

Catches React component errors:

```typescript
import ErrorBoundary from '@/components/ui/error-boundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Usage Examples

### Example 1: Form Submission

```typescript
import { handleAsync } from '@/lib/utils/async-handler'
import { toast } from '@/components/ui/toast'
import { AppError, ErrorType } from '@/lib/error-handling'

const handleSubmit = async (formData: FormData) => {
  const result = await handleAsync(
    async () => {
      // Validation
      if (!formData.email) {
        throw new AppError(
          ErrorType.VALIDATION,
          'REQUIRED_FIELD',
          'البريد الإلكتروني مطلوب'
        )
      }

      // API call
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      return response.json()
    },
    {
      showToast: true,
      logError: true,
    }
  )

  if (result) {
    toast.success('تم إرسال النموذج بنجاح')
    // Handle success
  }
}
```

### Example 2: Data Fetching with Retry

```typescript
import { retryAsync } from '@/lib/utils/async-handler'
import { logger } from '@/lib/utils/logger'

const fetchStudents = async () => {
  try {
    const data = await retryAsync(
      async () => {
        const response = await supabase
          .from('students')
          .select('*')
        
        if (response.error) throw response.error
        return response.data
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (attempt) => {
          logger.info(`Retrying fetch... Attempt ${attempt}`)
        },
      }
    )
    
    return data
  } catch (error) {
    logger.error('Failed to fetch students after retries', error)
    toast.error('فشل تحميل بيانات الطلاب')
    return []
  }
}
```

### Example 3: Component with Error Handling

```typescript
import { useState, useEffect } from 'react'
import { handleAsync } from '@/lib/utils/async-handler'
import { ErrorCard } from '@/components/ui/error-message'
import { Spinner } from '@/components/ui/spinner'

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStudents = async () => {
    setLoading(true)
    setError(null)

    const result = await handleAsync(
      async () => {
        const response = await fetch('/api/students')
        if (!response.ok) throw new Error('Failed to fetch')
        return response.json()
      },
      {
        showToast: false, // We'll show error in UI instead
        logError: true,
      }
    )

    setLoading(false)

    if (result) {
      setStudents(result)
    } else {
      setError('فشل تحميل بيانات الطلاب')
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorCard message={error} onRetry={loadStudents} />
  if (students.length === 0) {
    return <EmptyState title="لا يوجد طلاب" message="لم يتم العثور على طلاب" />
  }

  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

### Example 4: Credit Management with Validation

```typescript
import { validateAndExecute } from '@/lib/utils/async-handler'
import { toast } from '@/components/ui/toast'

const addCredits = async (studentId: string, amount: number) => {
  const result = await validateAndExecute(
    () => {
      if (!studentId) return 'يرجى اختيار طالب'
      if (amount <= 0) return 'المبلغ يجب أن يكون أكبر من صفر'
      if (amount > 100) return 'المبلغ يجب أن يكون أقل من 100'
      return true
    },
    async () => {
      const { data, error } = await supabase
        .from('students')
        .update({ credits: amount })
        .eq('id', studentId)
      
      if (error) throw error
      return data
    },
    {
      showToast: true,
    }
  )

  if (result) {
    toast.success('تم إضافة الرصيد بنجاح')
  }
}
```

## Best Practices

### 1. Always Use Async Handlers

Instead of raw try-catch blocks, use the async handlers:

```typescript
// ❌ Don't do this
try {
  const data = await fetchData()
  toast.success('Success')
} catch (error) {
  console.error(error)
  toast.error('Error')
}

// ✅ Do this
const data = await handleAsync(
  () => fetchData(),
  { showToast: true }
)
```

### 2. Use Appropriate Error Types

Choose the correct error type for better error handling:

```typescript
// Validation errors
throw new AppError(ErrorType.VALIDATION, 'INVALID_EMAIL', 'البريد الإلكتروني غير صحيح')

// Authentication errors
throw new AppError(ErrorType.AUTHENTICATION, 'UNAUTHORIZED', 'غير مصرح')

// Business logic errors
throw new AppError(ErrorType.BUSINESS_LOGIC, 'NO_CREDITS', 'رصيد غير كافٍ')

// Network errors
throw new AppError(ErrorType.NETWORK, 'NETWORK_ERROR', 'خطأ في الاتصال')
```

### 3. Log Errors Appropriately

Use the correct log level:

```typescript
logger.debug('Detailed debug info') // Development only
logger.info('User logged in') // Informational
logger.warn('Deprecated API used') // Warnings
logger.error('Failed to save', error) // Errors
```

### 4. Provide User-Friendly Messages

Always provide Arabic messages for users:

```typescript
// ❌ Don't show technical errors
toast.error(error.message) // "TypeError: Cannot read property 'id' of undefined"

// ✅ Show user-friendly messages
toast.error('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.')
```

### 5. Handle Loading and Error States

Always handle all states in components:

```typescript
const MyComponent = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState(null)

  // Loading state
  if (loading) return <Spinner />
  
  // Error state
  if (error) return <ErrorCard message={error} onRetry={loadData} />
  
  // Empty state
  if (!data || data.length === 0) {
    return <EmptyState title="لا توجد بيانات" message="..." />
  }
  
  // Success state
  return <DataDisplay data={data} />
}
```

## Error Types

The system supports these error types:

- `ErrorType.NETWORK` - Network and connectivity errors
- `ErrorType.VALIDATION` - Input validation errors
- `ErrorType.AUTHENTICATION` - Authentication errors (401)
- `ErrorType.AUTHORIZATION` - Authorization errors (403)
- `ErrorType.DATABASE` - Database and query errors
- `ErrorType.BUSINESS_LOGIC` - Business rule violations
- `ErrorType.UNKNOWN` - Unknown or unexpected errors

## Arabic Error Messages

All error messages are available in Arabic in `ERROR_MESSAGES`:

```typescript
import { ERROR_MESSAGES } from '@/lib/error-handling'

ERROR_MESSAGES.NETWORK_ERROR // 'خطأ في الاتصال بالإنترنت'
ERROR_MESSAGES.UNAUTHORIZED // 'غير مصرح لك بهذا الإجراء'
ERROR_MESSAGES.NO_CREDITS // 'رصيد الحصص غير كافٍ'
// ... and many more
```

## Testing Error Handling

Test error scenarios in your components:

```typescript
import { render, screen } from '@testing-library/react'
import { handleAsync } from '@/lib/utils/async-handler'

test('shows error message on failure', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('Failed'))
  
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/خطأ/)).toBeInTheDocument()
  })
})
```

## Summary

The error handling system provides:

✅ Consistent error handling across the app
✅ User-friendly Arabic error messages
✅ Automatic logging and monitoring
✅ Toast notifications for feedback
✅ Error boundaries for React errors
✅ Retry mechanisms for resilience
✅ Validation helpers for forms
✅ Pre-built UI components

For more examples, see `src/examples/ErrorHandlingExamples.tsx`.
