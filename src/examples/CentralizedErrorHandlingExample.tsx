/**
 * Centralized Error Handling System Example
 * Demonstrates the new centralized error handling system
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { errorService } from '@/lib/services/error-service'
import { ErrorCategory, ErrorSeverity, type CategorizedError } from '@/lib/utils/error-handler'
import { ErrorCard, InlineError, EmptyState } from '@/components/ui/error-message'

export function CentralizedErrorHandlingExample() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // Example 1: Simple async operation with error handling
  const handleSimpleAsync = async () => {
    setLoading(true)
    setResult(null)

    const data = await errorService.handleAsync(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simulate random success/failure
        if (Math.random() > 0.5) {
          return 'تم تحميل البيانات بنجاح'
        } else {
          throw new Error('فشل تحميل البيانات')
        }
      },
      { showToast: true }
    )

    setLoading(false)
    
    if (data) {
      setResult(data)
      errorService.showSuccess(data)
    }
  }

  // Example 2: Safe async with detailed result
  const handleSafeAsync = async () => {
    setLoading(true)
    setResult(null)

    const { data, error, success } = await errorService.safeAsync(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (Math.random() > 0.5) {
          return 'العملية نجحت'
        } else {
          throw errorService.errors.network()
        }
      }
    )

    setLoading(false)

    if (success && data) {
      setResult(data)
      errorService.showSuccess(data)
    } else if (error) {
      setResult(`خطأ: ${error.userMessage}`)
      errorService.showError(error.userMessage)
    }
  }

  // Example 3: Validation before execution
  const handleValidatedOperation = async () => {
    setLoading(true)
    setResult(null)

    const email = 'test@example.com'

    const data = await errorService.validateAndExecute(
      () => {
        if (!email) return 'البريد الإلكتروني مطلوب'
        if (!email.includes('@')) return 'البريد الإلكتروني غير صحيح'
        return true
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return 'تم التحقق من البريد الإلكتروني'
      },
      { showToast: true }
    )

    setLoading(false)

    if (data) {
      setResult(data)
    }
  }

  // Example 4: Retry with exponential backoff
  const handleRetryOperation = async () => {
    setLoading(true)
    setResult(null)

    try {
      let attempts = 0
      const data = await errorService.retry(
        async () => {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Fail first 2 attempts, succeed on 3rd
          if (attempts < 3) {
            throw new Error('محاولة فاشلة')
          }
          
          return 'نجحت العملية بعد عدة محاولات'
        },
        {
          maxRetries: 3,
          delayMs: 1000,
          onRetry: (attempt: number, error: CategorizedError) => {
            errorService.info(`محاولة ${attempt}...`, {
              metadata: { error: error.message }
            })
          }
        }
      )

      setResult(data)
      errorService.showSuccess(data)
    } catch (error) {
      await errorService.handle(error, { showToast: true })
      setResult('فشلت جميع المحاولات')
    }

    setLoading(false)
  }

  // Example 5: Custom error creation
  const handleCustomError = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Simulate business logic error
      const credits = 0
      
      if (credits <= 0) {
        throw errorService.createError(
          ErrorCategory.BUSINESS_LOGIC,
          'Insufficient credits',
          {
            userMessage: 'رصيد الحصص غير كافٍ. يرجى شراء المزيد من الحصص.',
            severity: ErrorSeverity.MEDIUM,
            recoverable: false,
            context: { credits, required: 1 }
          }
        )
      }
    } catch (error) {
      await errorService.handle(error, { showToast: true })
      setResult('خطأ في منطق العمل')
    }

    setLoading(false)
  }

  // Example 6: Different error categories
  const handleNetworkError = async () => {
    setLoading(true)
    try {
      throw errorService.errors.network()
    } catch (error) {
      await errorService.handle(error, { showToast: true })
    }
    setLoading(false)
  }

  const handleAuthError = async () => {
    setLoading(true)
    try {
      throw errorService.errors.auth()
    } catch (error) {
      await errorService.handle(error, { showToast: true })
    }
    setLoading(false)
  }

  const handleValidationError = async () => {
    setLoading(true)
    try {
      throw errorService.errors.validation('البريد الإلكتروني غير صحيح')
    } catch (error) {
      await errorService.handle(error, { showToast: true })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-right arabic-text">
            نظام معالجة الأخطاء المركزي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Result Display */}
          {result && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 arabic-text text-right">{result}</p>
            </div>
          )}

          {/* Example 1: Simple Async */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              1. عملية غير متزامنة بسيطة
            </h3>
            <Button 
              onClick={handleSimpleAsync} 
              disabled={loading}
              className="w-full arabic-text"
            >
              تنفيذ عملية بسيطة
            </Button>
          </div>

          {/* Example 2: Safe Async */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              2. عملية آمنة مع نتيجة مفصلة
            </h3>
            <Button 
              onClick={handleSafeAsync} 
              disabled={loading}
              variant="outline"
              className="w-full arabic-text"
            >
              تنفيذ عملية آمنة
            </Button>
          </div>

          {/* Example 3: Validated Operation */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              3. عملية مع التحقق
            </h3>
            <Button 
              onClick={handleValidatedOperation} 
              disabled={loading}
              variant="outline"
              className="w-full arabic-text"
            >
              تنفيذ مع التحقق
            </Button>
          </div>

          {/* Example 4: Retry */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              4. إعادة المحاولة التلقائية
            </h3>
            <Button 
              onClick={handleRetryOperation} 
              disabled={loading}
              variant="outline"
              className="w-full arabic-text"
            >
              تنفيذ مع إعادة المحاولة
            </Button>
          </div>

          {/* Example 5: Custom Error */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              5. خطأ مخصص
            </h3>
            <Button 
              onClick={handleCustomError} 
              disabled={loading}
              variant="danger"
              className="w-full arabic-text"
            >
              إنشاء خطأ مخصص
            </Button>
          </div>

          {/* Example 6: Error Categories */}
          <div className="space-y-2">
            <h3 className="font-semibold text-right arabic-text">
              6. أنواع الأخطاء المختلفة
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={handleNetworkError} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="arabic-text"
              >
                خطأ شبكة
              </Button>
              <Button 
                onClick={handleAuthError} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="arabic-text"
              >
                خطأ مصادقة
              </Button>
              <Button 
                onClick={handleValidationError} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="arabic-text"
              >
                خطأ تحقق
              </Button>
            </div>
          </div>

          {/* UI Components Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-right arabic-text">
              مكونات واجهة المستخدم
            </h3>
            
            <InlineError message="هذا مثال على رسالة خطأ مضمنة" />
            
            <ErrorCard 
              message="فشل تحميل البيانات. يرجى المحاولة مرة أخرى."
              onRetry={() => errorService.showInfo('جاري إعادة المحاولة...')}
            />
            
            <EmptyState
              title="لا توجد بيانات"
              message="لم يتم العثور على أي بيانات لعرضها"
              action={{
                label: 'إضافة بيانات',
                onClick: () => errorService.showInfo('فتح نموذج الإضافة...')
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CentralizedErrorHandlingExample
