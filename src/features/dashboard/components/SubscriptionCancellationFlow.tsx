import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, X, Gift, Clock, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import subscriptionService from '@/lib/services/subscription-service'

interface SubscriptionCancellationFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (action: 'cancelled' | 'discount-accepted') => void
  currentPrice?: number
  subscriptionId?: string
}

type CancellationStep = 1 | 2 | 3

interface CancellationReason {
  id: string
  label: string
}

const CANCELLATION_REASONS: CancellationReason[] = [
  { id: 'price_high', label: 'السعر مرتفع' },
  { id: 'not_using_enough', label: 'لا أستخدم الخدمة بشكل كافٍ' },
  { id: 'quality_issues', label: 'جودة الحصص لا تلبي التوقعات' },
  { id: 'found_alternative', label: 'وجدت بديل أفضل' },
  { id: 'technical_issues', label: 'مشاكل تقنية' },
  { id: 'other', label: 'أخرى' }
]

const DISCOUNT_PERCENTAGE = 20
const MINIMUM_DISPLAY_TIME = 5000 // 5 seconds

export default function SubscriptionCancellationFlow({
  isOpen,
  onClose,
  onComplete,
  currentPrice = 100,
  subscriptionId
}: SubscriptionCancellationFlowProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<CancellationStep>(1)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string>('')
  const [canProceedFromStep2, setCanProceedFromStep2] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Start timer when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      setCanProceedFromStep2(false)
      const timer = setTimeout(() => {
        setCanProceedFromStep2(true)
      }, MINIMUM_DISPLAY_TIME)
      
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => {
      if (prev.includes(reasonId)) {
        return prev.filter(id => id !== reasonId)
      } else {
        return [...prev, reasonId]
      }
    })
    // Clear validation error when user makes a selection
    if (validationError) {
      setValidationError('')
    }
  }

  const handleSubmitFeedback = async () => {
    // Validate that at least one reason is selected
    if (selectedReasons.length === 0) {
      setValidationError('يرجى اختيار سبب واحد على الأقل')
      return
    }

    if (!user?.id) {
      setValidationError('خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى')
      return
    }

    setIsSubmitting(true)
    setValidationError('')

    try {
      // Submit feedback to backend API
      const { success, error } = await subscriptionService.submitCancellationFeedback(
        user.id,
        selectedReasons
      )

      if (!success || error) {
        throw error
      }

      console.log('Cancellation reasons submitted:', selectedReasons)

      // Progress to Step 2 (Retention Offer)
      setCurrentStep(2)
    } catch (error) {
      setValidationError('حدث خطأ. يرجى المحاولة مرة أخرى')
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptDiscount = async () => {
    if (!user?.id || !subscriptionId) {
      setValidationError('خطأ في البيانات. يرجى المحاولة مرة أخرى')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Apply discount via backend API
      const { success, error } = await subscriptionService.applyRetentionDiscount(
        user.id,
        subscriptionId,
        DISCOUNT_PERCENTAGE
      )

      if (!success || error) {
        throw error
      }

      console.log('Discount accepted and applied')
      
      // Close modal and notify parent
      onComplete('discount-accepted')
      handleClose()
    } catch (error) {
      setValidationError('فشل تطبيق الخصم. يرجى التواصل مع الدعم')
      console.error('Failed to apply discount:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueCancellation = () => {
    // Progress to Step 3 (Confirmation)
    setCurrentStep(3)
  }

  const handleConfirmCancellation = async () => {
    if (!user?.id || !subscriptionId) {
      setValidationError('خطأ في البيانات. يرجى المحاولة مرة أخرى')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Confirm cancellation via backend API with timestamp
      const { success, cancellationRequest, error } = await subscriptionService.confirmCancellation({
        userId: user.id,
        subscriptionId,
        reasons: selectedReasons,
        discountOffered: true,
        discountAccepted: false
      })

      if (!success || error) {
        throw error
      }

      console.log('Cancellation confirmed with request:', cancellationRequest)
      
      // Close modal and notify parent
      onComplete('cancelled')
      handleClose()
    } catch (error) {
      setValidationError('حدث خطأ. يرجى المحاولة مرة أخرى')
      console.error('Failed to confirm cancellation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep(1)
    setSelectedReasons([])
    setValidationError('')
    setCanProceedFromStep2(false)
    setIsSubmitting(false)
    onClose()
  }

  // Calculate discount pricing
  const discountAmount = (currentPrice * DISCOUNT_PERCENTAGE) / 100
  const newPrice = currentPrice - discountAmount

  const renderStep1 = () => (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-right" dir="rtl">
        <h3 className="text-xl font-bold text-gray-900 arabic-text mb-2">
          لماذا تريد إلغاء الاشتراك؟
        </h3>
        <p className="text-sm text-gray-600 arabic-text">
          نود معرفة السبب لتحسين خدماتنا. يمكنك اختيار أكثر من سبب.
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-4" 
          role="alert"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 arabic-text text-right flex-1">
              {validationError}
            </p>
          </div>
        </div>
      )}

      {/* Cancellation Reasons */}
      <div className="space-y-3" dir="rtl">
        {CANCELLATION_REASONS.map((reason) => (
          <label
            key={reason.id}
            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedReasons.includes(reason.id)
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-[0.99] bg-white'
            }`}
            dir="rtl"
          >
            <input
              type="checkbox"
              checked={selectedReasons.includes(reason.id)}
              onChange={() => handleReasonToggle(reason.id)}
              className="w-5 h-5 text-primary-600 border-2 border-gray-300 rounded transition-all duration-200 hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none active:scale-95 cursor-pointer"
            />
            <span className="flex-1 text-gray-900 arabic-text text-right font-medium">
              {reason.label}
            </span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4" dir="rtl">
        <Button
          onClick={handleSubmitFeedback}
          className="flex-1 arabic-text"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري المعالجة...' : 'متابعة'}
        </Button>
        <Button
          onClick={handleClose}
          variant="outline"
          className="flex-1 arabic-text"
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6" dir="rtl">
      {/* Header with Gift Icon */}
      <div className="text-center" dir="rtl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 arabic-text mb-2">
          انتظر! لدينا عرض خاص لك
        </h3>
        <p className="text-gray-600 arabic-text">
          نقدر ولاءك ونود أن نقدم لك خصمًا حصريًا
        </p>
      </div>

      {/* Discount Offer Card */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6" dir="rtl">
        <div className="text-center space-y-4">
          <div className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full font-bold text-lg arabic-text">
            خصم {DISCOUNT_PERCENTAGE}٪
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3" dir="rtl">
              <span className="text-3xl font-bold text-gray-900 arabic-text">
                {newPrice.toFixed(2)} ريال
              </span>
              <span className="text-xl text-gray-500 line-through arabic-text">
                {currentPrice.toFixed(2)} ريال
              </span>
            </div>
            <p className="text-primary-700 font-semibold arabic-text">
              وفر {discountAmount.toFixed(2)} ريال شهريًا
            </p>
          </div>

          <div className="bg-white/80 rounded-lg p-4 text-right" dir="rtl">
            <p className="text-sm text-gray-700 arabic-text leading-relaxed">
              سيتم تطبيق هذا الخصم على اشتراكك لمدة 3 أشهر القادمة. استمتع بجميع المزايا بسعر أقل!
            </p>
          </div>
        </div>
      </div>

      {/* Timer Notice */}
      {!canProceedFromStep2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" dir="rtl">
          <div className="flex items-center gap-3 justify-end" dir="rtl">
            <p className="text-amber-800 text-sm arabic-text text-right">
              يرجى قراءة العرض بعناية قبل اتخاذ القرار
            </p>
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-4" 
          role="alert"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 arabic-text text-right flex-1">
              {validationError}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2" dir="rtl">
        <Button
          onClick={handleAcceptDiscount}
          className="w-full arabic-text text-lg py-6"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري التطبيق...' : 'قبول الخصم والاستمرار'}
        </Button>
        <Button
          onClick={handleContinueCancellation}
          variant="ghost"
          className="w-full arabic-text text-gray-600 hover:text-gray-900"
          disabled={!canProceedFromStep2 || isSubmitting}
        >
          متابعة الإلغاء
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center" dir="rtl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 arabic-text mb-2">
          تأكيد إلغاء الاشتراك
        </h3>
      </div>

      {/* 24-Hour Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6" dir="rtl">
        <div className="flex items-start gap-4" dir="rtl">
          <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1 text-right" dir="rtl">
            <h4 className="font-bold text-blue-900 arabic-text mb-2">
              سيتم تفعيل الإلغاء خلال 24 ساعة
            </h4>
            <p className="text-blue-800 arabic-text text-sm leading-relaxed">
              بعد تأكيد الإلغاء، سيظل اشتراكك نشطًا لمدة 24 ساعة. بعد ذلك، سيتم إلغاء الاشتراك تلقائيًا.
            </p>
          </div>
        </div>
      </div>

      {/* Immediate Cancellation Option */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6" dir="rtl">
        <div className="flex items-start gap-4" dir="rtl">
          <Mail className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
          <div className="flex-1 text-right" dir="rtl">
            <h4 className="font-bold text-gray-900 arabic-text mb-2">
              هل تريد الإلغاء الفوري؟
            </h4>
            <p className="text-gray-700 arabic-text text-sm leading-relaxed">
              للإلغاء الفوري، يمكنك استخدام رابط الإلغاء المرسل في البريد الإلكتروني الأصلي عند الاشتراك.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div 
          className="bg-red-50 border border-red-200 rounded-lg p-4" 
          role="alert"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 arabic-text text-right flex-1">
              {validationError}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2" dir="rtl">
        <Button
          onClick={handleConfirmCancellation}
          className="w-full arabic-text text-lg py-6 bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الإلغاء'}
        </Button>
        <Button
          onClick={handleClose}
          variant="outline"
          className="w-full arabic-text"
          disabled={isSubmitting}
        >
          العودة إلى الاشتراك
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between" dir="rtl">
            <DialogTitle className="arabic-text text-2xl text-gray-900 text-right flex-1">
              إلغاء الاشتراك
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
