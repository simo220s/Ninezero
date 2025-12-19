/**
 * Coupon Input Component
 * 
 * Allows users to apply discount coupons at checkout
 * Task 10: Implement Coupon and Discount System
 */

import { useState } from 'react'
import { Tag, Check, X, Loader } from 'lucide-react'
import couponService from '@/lib/services/coupon-service'
import type { ApplyCouponResult } from '@/types/coupon'

interface CouponInputProps {
  userId: string
  purchaseAmount: number
  onCouponApplied: (result: ApplyCouponResult) => void
  onCouponRemoved: () => void
  appliedCoupon?: ApplyCouponResult
}

export default function CouponInput({
  userId,
  purchaseAmount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('الرجاء إدخال كود الخصم')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await couponService.applyCoupon({
        code: couponCode,
        user_id: userId,
        purchase_amount: purchaseAmount,
      })

      if (result.success) {
        onCouponApplied(result)
        setCouponCode('')
      } else {
        setError(result.error_message || 'كود الخصم غير صالح')
      }
    } catch (err) {
      setError('حدث خطأ أثناء تطبيق كود الخصم')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    setCouponCode('')
    setError(null)
  }

  if (appliedCoupon?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-900 arabic-text">تم تطبيق كود الخصم</span>
                <code className="px-2 py-1 bg-white text-green-900 rounded text-sm font-mono">
                  {appliedCoupon.coupon?.code}
                </code>
              </div>
              <p className="text-sm text-green-700 arabic-text mt-1">
                {appliedCoupon.coupon?.name_ar}
              </p>
            </div>
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-green-900">
              -{appliedCoupon.discount_amount.toFixed(2)} ريال
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-sm text-green-700 hover:text-green-900 underline arabic-text"
            >
              إزالة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900 arabic-text">هل لديك كود خصم؟</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase())
            setError(null)
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          placeholder="أدخل كود الخصم"
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed arabic-text uppercase"
          dir="ltr"
        />
        <button
          onClick={handleApplyCoupon}
          disabled={loading || !couponCode.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed arabic-text flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>جاري التحقق...</span>
            </>
          ) : (
            <span>تطبيق</span>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 arabic-text">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 arabic-text">
        💡 نصيحة: يمكنك الحصول على كود خصم من خلال برنامج الإحالة أو العروض الترويجية
      </div>
    </div>
  )
}

/**
 * Coupon Summary Component
 * Shows applied coupon in order summary
 */
export function CouponSummary({ appliedCoupon }: { appliedCoupon?: ApplyCouponResult }) {
  if (!appliedCoupon?.success) return null

  return (
    <div className="flex items-center justify-between py-2 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-600 arabic-text">
          خصم ({appliedCoupon.coupon?.code})
        </span>
      </div>
      <span className="text-sm font-semibold text-green-600">
        -{appliedCoupon.discount_amount.toFixed(2)} ريال
      </span>
    </div>
  )
}
