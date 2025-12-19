# Centralized Error Handling System

## Overview

A comprehensive error handling system for the LMS platform that provides:

- ✅ **Error Categorization**: Network, validation, authentication, authorization, database, business logic, runtime errors
- ✅ **Error Logging**: Multiple log levels (debug, info, warn, error, fatal) with context
- ✅ **User-Friendly Messages**: Arabic error messages for all error types
- ✅ **Error Recovery**: Automatic recovery mechanisms for common scenarios
- ✅ **Async Handlers**: Utilities for handling async operations with retry logic
- ✅ **UI Components**: Pre-built error display components (boundaries, cards, inline errors)
- ✅ **Toast Notifications**: Global toast system for user feedback

## Quick Start

```typescript
import { errorService } from '@/lib/services/error-service'

// Handle async operations
const data = await errorService.handleAsync(
  async () => await fetchData(),
  { showToast: true }
)

if (data) {
  // Use the data
}
```

## File Structure

```
src/lib/error-handling/
├── index.ts                    # Main exports (use this for imports)
├── README.md                   # This file
└── USAGE_GUIDE.md             # Comprehensive usage guide

src/lib/utils/
├── logger.ts                   # Enhanced logging service
├── error-handler.ts            # Error categorization and recovery
└── async-handler.ts            # Async operation utilities

src/lib/services/
└── error-service.ts            # Main error service (unified interface)

src/components/ui/
├── error-boundary.tsx          # Global error boundary (enhanced)
├── page-error-boundary.tsx     # Page-level error boundary
├── error-message.tsx           # Error UI components
├── error-display.tsx           # Additional error displays
└── toast.tsx                   # Toast notification system

src/examples/
└── CentralizedErrorHandlingExample.tsx  # Usage examples
```

## Core Components

### 1. Error Service (`errorService`)

The main entry point for all error handling operations.

```typescript
import { errorService } from '@/lib/services/error-service'

// Handle errors
await errorService.handle(error, { showToast: true })

// Create custom errors
const error = errorService.createError(
  ErrorCategory.VALIDATION,
  'Invalid input',
  { userMessage: 'البيانات غير صحيحة' }
)

// Pre-built error creators
throw errorService.errors.network()
throw errorService.errors.auth()
throw errorService.errors.validation('البريد الإلكتروني مطلوب')
```

### 2. Logger (`logger`)

Enhanced logging with multiple levels and context.

```typescript
import { logger } from '@/lib/utils/logger'

logger.debug('Debug message', { component: 'MyComponent' })
logger.info('User logged in', { userId: '123' })
logger.warn('Deprecated API used')
logger.error('Operation failed', error, { action: 'fetchData' })
logger.fatal('Critical error', error)
```

### 3. Async Handlers

Utilities for handling async operations.

```typescript
import { errorService } from '@/lib/services/error-service'

// Simple async
const data = await errorService.handleAsync(() => fetchData())

// Safe async (returns result object)
const { data, error, success } = await errorService.safeAsync(() => fetchData())

// With validation
await errorService.validateAndExecute(
  () => email ? true : 'البريد الإلكتروني مطلوب',
  () => sendEmail(email)
)

// With retry
const data = await errorService.retry(
  () => unstableOperation(),
  { maxRetries: 3 }
)
```

### 4. Error Boundaries

React error boundaries for catching component errors.

```typescript
import ErrorBoundary from '@/components/ui/error-boundary'
import { PageErrorBoundary } from '@/components/ui/page-error-boundary'

// Global boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Page-level boundary
<PageErrorBoundary pageName="Dashboard">
  <DashboardContent />
</PageErrorBoundary>
```

### 5. Error UI Components

Pre-built components for displaying errors.

```typescript
import { 
  InlineError, 
  ErrorCard, 
  ErrorPage, 
  EmptyState 
} from '@/components/ui/error-message'

// Inline error (for forms)
<InlineError message="هذا الحقل مطلوب" />

// Error card (for sections)
<ErrorCard message="فشل تحميل البيانات" onRetry={handleRetry} />

// Full page error
<ErrorPage message="حدث خطأ" onRetry={handleRetry} />

// Empty state
<EmptyState
  title="لا توجد بيانات"
  message="لم يتم العثور على بيانات"
  action={{ label: 'إضافة', onClick: handleAdd }}
/>
```

### 6. Toast Notifications

Global toast system for user feedback.

```typescript
import { errorService } from '@/lib/services/error-service'

errorService.showSuccess('تم الحفظ بنجاح')
errorService.showError('حدث خطأ')
errorService.showWarning('تحذير')
errorService.showInfo('معلومة')
```

## Error Categories

The system categorizes errors into:

- **NETWORK**: Connection failures, timeouts, fetch errors
- **VALIDATION**: Form validation, input validation
- **AUTHENTICATION**: Login failures, session expired
- **AUTHORIZATION**: Permission denied, access forbidden
- **DATABASE**: Query failures, constraint violations
- **BUSINESS_LOGIC**: Business rule violations
- **RUNTIME**: Unexpected errors, code errors
- **UNKNOWN**: Uncategorized errors

## Error Severity Levels

- **LOW**: Minor issues, informational
- **MEDIUM**: Standard errors requiring attention
- **HIGH**: Serious errors affecting functionality
- **CRITICAL**: Critical errors requiring immediate action

## Log Levels

- **DEBUG**: Detailed debugging information (development only)
- **INFO**: Informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages requiring attention
- **FATAL**: Critical errors causing system failure

## Recovery Mechanisms

The system includes automatic recovery strategies for:

1. **Authentication Errors**: Redirects to login page
2. **Network Errors**: Checks if connection is restored

You can register custom recovery strategies:

```typescript
import { errorService, ErrorCategory } from '@/lib/services/error-service'

errorService.registerRecovery({
  canRecover: (error) => error.category === ErrorCategory.AUTHENTICATION,
  recover: async () => {
    await refreshSession()
  },
  description: 'Refresh authentication session'
})
```

## Best Practices

1. **Always use errorService** for error handling
2. **Provide context** when logging errors
3. **Use appropriate error categories** for better handling
4. **Handle all states** in components (loading, error, empty, success)
5. **Use retry** for unstable operations
6. **Validate before executing** operations

## Examples

See the following files for examples:

- `src/examples/CentralizedErrorHandlingExample.tsx` - Interactive examples
- `src/lib/error-handling/USAGE_GUIDE.md` - Comprehensive usage guide
- `src/examples/ErrorHandlingExamples.tsx` - Legacy examples

## Migration from Legacy System

The new system is backward compatible with the existing error handling:

```typescript
// Old way (still works)
import { handleError } from '@/lib/error-handling'
handleError(error)

// New way (recommended)
import { errorService } from '@/lib/services/error-service'
await errorService.handle(error)
```

## Testing

The error handling system can be tested using the example component:

1. Navigate to the examples page
2. Try different error scenarios
3. Observe error messages, logging, and recovery

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **8.1**: Error Handler logs error details for debugging
- ✅ **8.2**: Error Handler displays user-friendly error messages
- ✅ **8.3**: Error Handler provides retry options for network failures
- ✅ **8.4**: Error Handler prevents application crash and maintains session
- ✅ **8.5**: Error Handler never exposes sensitive error details to users

## Future Enhancements

Potential future improvements:

- Integration with error monitoring services (Sentry, LogRocket)
- Error analytics and reporting dashboard
- Custom error recovery workflows
- Error rate limiting and throttling
- Offline error queue for network failures

## Support

For questions or issues with the error handling system:

1. Check the USAGE_GUIDE.md for detailed documentation
2. Review the examples in CentralizedErrorHandlingExample.tsx
3. Check the inline code documentation
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: Development Team
