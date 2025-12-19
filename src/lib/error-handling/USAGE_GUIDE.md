# Centralized Error Handling System - Usage Guide

## Overview

The centralized error handling system provides a comprehensive solution for managing errors throughout the application. It includes error categorization, logging, user-friendly messages, recovery mechanisms, and UI components.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Error Service](#error-service)
3. [Async Operations](#async-operations)
4. [Error Categories](#error-categories)
5. [Logging](#logging)
6. [UI Components](#ui-components)
7. [Error Recovery](#error-recovery)
8. [Best Practices](#best-practices)

## Quick Start

```typescript
import { errorService } from '@/lib/error-handling'

// Simple async operation with error handling
const data = await errorService.handleAsync(
  async () => await fetchData(),
  { showToast: true }
)

if (data) {
  // Success - use the data
  console.log(data)
}
```

## Error Service

The `errorService` is the main entry point for all error handling operations.

### Basic Error Handling

```typescript
import { errorService } from '@/lib/error-handling'

try {
  // Your code
  throw new Error('Something went wrong')
} catch (error) {
  // Handle the error
  await errorService.handle(error, {
    showToast: true,
    logError: true,
    attemptRecovery: true,
  })
}
```

### Creating Custom Errors

```typescript
import { errorService, ErrorCategory, ErrorSeverity } from '@/lib/error-handling'

// Create a validation error
const error = errorService.createError(
  ErrorCategory.VALIDATION,
  'Invalid email format',
  {
    userMessage: 'البريد الإلكتروني غير صحيح',
    severity: ErrorSeverity.LOW,
    recoverable: false,
  }
)

// Throw or handle the error
throw error
```

### Pre-built Error Creators

```typescript
import { errorService } from '@/lib/error-handling'

// Network error
throw errorService.errors.network()

// Authentication error
throw errorService.errors.auth()

// Validation error
throw errorService.errors.validation('البريد الإلكتروني مطلوب')

// Database error
throw errorService.errors.database()

// Business logic error
throw errorService.errors.business('رصيد غير كافٍ')
```

## Async Operations

### Handle Async (Simple)

Returns `null` on error, shows toast automatically:

```typescript
const data = await errorService.handleAsync(
  async () => {
    const response = await fetch('/api/data')
    return response.json()
  },
  { showToast: true }
)

if (data) {
  // Use data
}
```

### Safe Async (Detailed)

Returns result object with data and error:

```typescript
const { data, error, success } = await errorService.safeAsync(
  async () => await fetchData()
)

if (success) {
  console.log('Data:', data)
} else {
  console.error('Error:', error.userMessage)
}
```

### Validate and Execute

Validate before executing:

```typescript
const result = await errorService.validateAndExecute(
  () => {
    if (!email) return 'البريد الإلكتروني مطلوب'
    if (!email.includes('@')) return 'البريد الإلكتروني غير صحيح'
    return true
  },
  async () => {
    return await sendEmail(email)
  },
  { showToast: true }
)
```

### Retry with Exponential Backoff

```typescript
const data = await errorService.retry(
  async () => {
    const response = await fetch('/api/unstable')
    if (!response.ok) throw new Error('Failed')
    return response.json()
  },
  {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message)
    },
  }
)
```

## Error Categories

The system categorizes errors into the following types:

### Network Errors
- Connection failures
- Timeout errors
- Fetch failures

```typescript
import { ErrorCategory } from '@/lib/error-handling'

const error = errorService.createError(
  ErrorCategory.NETWORK,
  'Connection failed',
  { userMessage: 'خطأ في الاتصال' }
)
```

### Validation Errors
- Form validation
- Input validation
- Data validation

```typescript
const error = errorService.createError(
  ErrorCategory.VALIDATION,
  'Invalid input',
  { userMessage: 'البيانات المدخلة غير صحيحة' }
)
```

### Authentication Errors
- Login failures
- Session expired
- Invalid credentials

```typescript
const error = errorService.createError(
  ErrorCategory.AUTHENTICATION,
  'Session expired',
  { userMessage: 'انتهت صلاحية الجلسة' }
)
```

### Authorization Errors
- Permission denied
- Access forbidden

```typescript
const error = errorService.createError(
  ErrorCategory.AUTHORIZATION,
  'Access denied',
  { userMessage: 'ليس لديك صلاحية' }
)
```

### Database Errors
- Query failures
- Connection errors
- Constraint violations

```typescript
const error = errorService.createError(
  ErrorCategory.DATABASE,
  'Query failed',
  { userMessage: 'خطأ في قاعدة البيانات' }
)
```

### Business Logic Errors
- Business rule violations
- Invalid operations

```typescript
const error = errorService.createError(
  ErrorCategory.BUSINESS_LOGIC,
  'Insufficient credits',
  { userMessage: 'رصيد غير كافٍ' }
)
```

### Runtime Errors
- Unexpected errors
- Code errors

```typescript
const error = errorService.createError(
  ErrorCategory.RUNTIME,
  'Unexpected error',
  { userMessage: 'حدث خطأ غير متوقع' }
)
```

## Logging

### Log Levels

```typescript
import { errorService } from '@/lib/error-handling'

// Debug (development only)
errorService.debug('Debug message', {
  component: 'MyComponent',
  metadata: { userId: '123' }
})

// Info
errorService.info('User logged in', {
  component: 'Auth',
  action: 'login'
})

// Warning
errorService.warn('Deprecated API used', {
  component: 'API',
  metadata: { endpoint: '/old-api' }
})

// Error
errorService.log('Operation failed', error, {
  component: 'DataService',
  action: 'fetchData'
})
```

### Get Recent Logs

```typescript
// Get last 10 logs
const recentLogs = errorService.getRecentLogs(10)

// Export all logs
const logsJson = errorService.exportLogs()

// Clear logs
errorService.clearLogs()
```

## UI Components

### Error Boundary

Wrap your app or components:

```typescript
import { ErrorBoundary } from '@/lib/error-handling'

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

With custom handlers:

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.log('Error caught:', error)
  }}
  onReset={() => {
    console.log('User reset error')
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Page Error Boundary

For individual pages:

```typescript
import { PageErrorBoundary } from '@/lib/error-handling'

function MyPage() {
  return (
    <PageErrorBoundary pageName="Student Dashboard">
      <PageContent />
    </PageErrorBoundary>
  )
}
```

### Inline Error

For form fields:

```typescript
import { InlineError } from '@/lib/error-handling'

<InlineError message="هذا الحقل مطلوب" />
```

### Error Card

For sections:

```typescript
import { ErrorCard } from '@/lib/error-handling'

<ErrorCard
  message="فشل تحميل البيانات"
  onRetry={handleRetry}
/>
```

### Full Page Error

For page-level errors:

```typescript
import { ErrorPage } from '@/lib/error-handling'

<ErrorPage
  message="حدث خطأ في تحميل الصفحة"
  onRetry={handleRetry}
/>
```

### Empty State

For no data scenarios:

```typescript
import { EmptyState } from '@/lib/error-handling'

<EmptyState
  title="لا توجد بيانات"
  message="لم يتم العثور على أي بيانات"
  action={{
    label: 'إضافة بيانات',
    onClick: handleAdd
  }}
/>
```

### Toast Notifications

```typescript
import { errorService } from '@/lib/error-handling'

// Success
errorService.showSuccess('تم الحفظ بنجاح')

// Error
errorService.showError('حدث خطأ')

// Warning
errorService.showWarning('تحذير')

// Info
errorService.showInfo('معلومة')
```

## Error Recovery

### Register Custom Recovery Strategy

```typescript
import { errorService, ErrorCategory } from '@/lib/error-handling'

errorService.registerRecovery({
  canRecover: (error) => {
    return error.category === ErrorCategory.AUTHENTICATION
  },
  recover: async (error) => {
    // Try to refresh the session
    await refreshSession()
  },
  description: 'Refresh authentication session'
})
```

### Built-in Recovery Strategies

The system includes default recovery strategies for:

1. **Authentication Errors**: Redirects to login page
2. **Network Errors**: Checks if connection is restored

## Best Practices

### 1. Always Use Error Service

```typescript
// ❌ Don't
try {
  await fetchData()
} catch (error) {
  console.error(error)
  alert('Error!')
}

// ✅ Do
const data = await errorService.handleAsync(
  () => fetchData(),
  { showToast: true }
)
```

### 2. Provide Context

```typescript
errorService.log('Failed to save user', error, {
  component: 'UserService',
  action: 'saveUser',
  metadata: { userId: user.id }
})
```

### 3. Use Appropriate Error Categories

```typescript
// For validation
throw errorService.errors.validation('البريد الإلكتروني مطلوب')

// For network issues
throw errorService.errors.network()

// For business logic
throw errorService.errors.business('رصيد غير كافٍ')
```

### 4. Handle All States in Components

```typescript
function MyComponent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const result = await errorService.handleAsync(
      () => fetchData(),
      { showToast: false }
    )

    setLoading(false)

    if (result) {
      setData(result)
    } else {
      setError('فشل تحميل البيانات')
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorCard message={error} onRetry={loadData} />
  if (!data) return <EmptyState title="لا توجد بيانات" />

  return <DataDisplay data={data} />
}
```

### 5. Use Retry for Unstable Operations

```typescript
const data = await errorService.retry(
  () => unstableOperation(),
  { maxRetries: 3, delayMs: 1000 }
)
```

### 6. Validate Before Executing

```typescript
await errorService.validateAndExecute(
  () => {
    if (!formData.email) return 'البريد الإلكتروني مطلوب'
    if (!formData.name) return 'الاسم مطلوب'
    return true
  },
  () => submitForm(formData)
)
```

## Complete Example

```typescript
import { errorService, ErrorBoundary, ErrorCard } from '@/lib/error-handling'
import { useState, useEffect } from 'react'

function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState([])

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    setError(null)

    // Use retry for reliability
    const result = await errorService.retry(
      async () => {
        const response = await fetch('/api/students')
        if (!response.ok) throw new Error('Failed to fetch')
        return response.json()
      },
      {
        maxRetries: 3,
        onRetry: (attempt) => {
          errorService.info(`Retrying... Attempt ${attempt}`)
        }
      }
    ).catch(async (error) => {
      // Handle error
      await errorService.handle(error, {
        showToast: false,
        logError: true
      })
      return null
    })

    setLoading(false)

    if (result) {
      setStudents(result)
    } else {
      setError('فشل تحميل بيانات الطلاب')
    }
  }

  const handleAddStudent = async (studentData) => {
    // Validate and execute
    const result = await errorService.validateAndExecute(
      () => {
        if (!studentData.name) return 'الاسم مطلوب'
        if (!studentData.email) return 'البريد الإلكتروني مطلوب'
        return true
      },
      async () => {
        const response = await fetch('/api/students', {
          method: 'POST',
          body: JSON.stringify(studentData)
        })
        return response.json()
      },
      { showToast: true }
    )

    if (result) {
      errorService.showSuccess('تم إضافة الطالب بنجاح')
      loadStudents()
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorCard message={error} onRetry={loadStudents} />
  if (students.length === 0) {
    return (
      <EmptyState
        title="لا يوجد طلاب"
        message="لم يتم العثور على طلاب"
        action={{
          label: 'إضافة طالب',
          onClick: () => setShowAddModal(true)
        }}
      />
    )
  }

  return (
    <ErrorBoundary>
      <div>
        {students.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </ErrorBoundary>
  )
}

export default StudentDashboard
```

## Summary

The centralized error handling system provides:

✅ **Consistent error handling** across the application
✅ **User-friendly Arabic messages** for all errors
✅ **Automatic logging** with different log levels
✅ **Error categorization** for better handling
✅ **Recovery mechanisms** for common scenarios
✅ **Retry logic** with exponential backoff
✅ **UI components** for displaying errors
✅ **Toast notifications** for user feedback
✅ **Error boundaries** for React errors

For more examples, see `src/examples/ErrorHandlingExamples.tsx`.
