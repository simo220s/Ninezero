/**
 * Error Handling Examples
 * Demonstrates how to use the error handling system throughout the application
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  InlineError,
  ErrorCard,
  EmptyState,
  NetworkError,
  NotFoundError,
} from '@/components/ui/error-message'
import { toast } from '@/components/ui/toast'
import {
  handleAsync,
  safeAsync,
  validateAndExecute,
  retryAsync,
} from '@/lib/utils/async-handler'
import { logger } from '@/lib/utils/logger'
import { AppError, ErrorTypeEnum } from '@/lib/error-handling'

export const ErrorHandlingExamples = () => {
  const [loading, setLoading] = useState(false)

  // Example 1: Basic async operation with error handling
  const handleBasicOperation = async () => {
    setLoading(true)
    
    const result = await handleAsync(
      async () => {
        // Simulate API call
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to fetch')
        return response.json()
      },
      {
        showToast: true,
        toastMessage: 'فشل تحميل البيانات',
        logError: true,
      }
    )

    setLoading(false)
    
    if (result) {
      toast.success('تم تحميل البيانات بنجاح')
    }
  }

  // Example 2: Safe async with result object
  const handleSafeOperation = async () => {
    const { data, error } = await safeAsync(async () => {
      const response = await fetch('/api/data')
      return response.json()
    })

    if (error) {
      logger.error('Operation failed', error)
      toast.error('حدث خطأ أثناء تحميل البيانات')
      return
    }

    if (data) {
      // Data loaded successfully
      toast.success('تم تحميل البيانات بنجاح')
    }
  }

  // Example 3: Validation before execution
  const handleValidatedOperation = async () => {
    const email = 'test@example.com'
    
    const result = await validateAndExecute(
      () => {
        if (!email) return 'البريد الإلكتروني مطلوب'
        if (!email.includes('@')) return 'البريد الإلكتروني غير صحيح'
        return true
      },
      async () => {
        // Execute operation only if validation passes
        const response = await fetch('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({ email }),
        })
        return response.json()
      }
    )

    if (result) {
      toast.success('تم إرسال البريد الإلكتروني')
    }
  }

  // Example 4: Retry with exponential backoff
  const handleRetryOperation = async () => {
    try {
      await retryAsync(
        async () => {
          const response = await fetch('/api/unstable-endpoint')
          if (!response.ok) throw new Error('Request failed')
          return response.json()
        },
        {
          maxRetries: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          onRetry: (attempt) => {
            logger.info(`Retrying... Attempt ${attempt}`)
          },
        }
      )
      
      toast.success('تم تحميل البيانات بنجاح')
      // Result loaded successfully
    } catch (error) {
      toast.error('فشل تحميل البيانات بعد عدة محاولات')
    }
  }

  // Example 5: Custom AppError
  const handleCustomError = async () => {
    try {
      // Simulate business logic error
      const credits = 0
      
      if (credits <= 0) {
        throw new AppError(
          ErrorTypeEnum.BUSINESS_LOGIC,
          'NO_CREDITS',
          'رصيد الحصص غير كافٍ. يرجى شراء المزيد من الحصص.'
        )
      }
      
      // Continue with operation...
    } catch (error) {
      if (error instanceof AppError) {
        toast.error(error.userMessage)
        logger.error('Business logic error', error)
      } else {
        toast.error('حدث خطأ غير متوقع')
      }
    }
  }

  // Example 6: Form submission with error handling
  const _handleFormSubmit = async (formData: { name: string; email: string }) => {
    const result = await handleAsync(
      async () => {
        // Validate
        if (!formData.name) {
          throw new AppError(
            ErrorTypeEnum.VALIDATION,
            'REQUIRED_FIELD',
            'الاسم مطلوب'
          )
        }

        if (!formData.email.includes('@')) {
          throw new AppError(
            ErrorTypeEnum.VALIDATION,
            'INVALID_EMAIL',
            'البريد الإلكتروني غير صحيح'
          )
        }

        // Submit
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Handling Examples</h1>

      {/* Example 1: Inline Error */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Inline Error Message</h2>
        <InlineError message="هذا الحقل مطلوب" />
        <InlineError message="البريد الإلكتروني غير صحيح" />
      </section>

      {/* Example 2: Error Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Error Card</h2>
        <ErrorCard
          message="فشل تحميل البيانات. يرجى المحاولة مرة أخرى."
          onRetry={() => toast.info('جاري إعادة المحاولة...')}
        />
      </section>

      {/* Example 3: Network Error */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Network Error</h2>
        <NetworkError onRetry={() => toast.info('جاري إعادة الاتصال...')} />
      </section>

      {/* Example 4: Empty State */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Empty State</h2>
        <EmptyState
          title="لا توجد بيانات"
          message="لم يتم العثور على أي بيانات لعرضها."
          action={{
            label: 'إضافة بيانات',
            onClick: () => toast.info('فتح نموذج الإضافة...'),
          }}
        />
      </section>

      {/* Example 5: Async Operations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Async Operations</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleBasicOperation} disabled={loading}>
            Basic Async
          </Button>
          <Button onClick={handleSafeOperation} disabled={loading}>
            Safe Async
          </Button>
          <Button onClick={handleValidatedOperation} disabled={loading}>
            Validated Async
          </Button>
          <Button onClick={handleRetryOperation} disabled={loading}>
            Retry Async
          </Button>
          <Button onClick={handleCustomError} disabled={loading}>
            Custom Error
          </Button>
        </div>
      </section>

      {/* Example 6: Not Found */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Not Found Error</h2>
        <NotFoundError resourceName="الطالب" />
      </section>

      {/* Example 7: Usage in Components */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Usage Examples</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm overflow-auto">
            {`// In a component:
const MyComponent = () => {
  const handleSave = async () => {
    const result = await handleAsync(
      async () => {
        await saveData()
      },
      { showToast: true }
    )
    
    if (result) {
      // Success handling
    }
  }
  
  return <Button onClick={handleSave}>Save</Button>
}

// With validation:
const handleSubmit = async (data) => {
  await validateAndExecute(
    () => data.email ? true : 'البريد الإلكتروني مطلوب',
    async () => await submitForm(data)
  )
}

// With retry:
const fetchData = async () => {
  const data = await retryAsync(
    () => api.getData(),
    { maxRetries: 3 }
  )
}`}
          </pre>
        </div>
      </section>
    </div>
  )
}

export default ErrorHandlingExamples
