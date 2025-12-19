/**
 * Package Purchase Flow Component
 * 
 * Complete purchase flow with coupon application and payment
 * Task 11: Develop Package and Bundle System
 */

import { useState, useEffect } from 'react'
import { X, Tag, CreditCard, Check } from 'lucide-react'
import { packageService } from '@/lib/services/package-service'
import { couponService } from '@/lib/services/coupon-service'
import type { Package } from '@/types/package'
import { logger } from '@/lib/logger'

interface PackagePurchaseFlowProps {
  packageId: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export function PackagePurchaseFlow({
  packageId,
  userId,
  onClose,
  onSuccess,
}: PackagePurchaseFlowProps) {
  const [pkg, setPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details')

  // Pricing state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [discountPrice, setDiscountPrice] = useState(0)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('credit_card')

  useEffect(() => {
    loadPackage()
  }, [packageId])

  const loadPackage = async () => {
    setLoading(true)
    try {
      const { data, error } = await packageService.getPackage(packageId)
      if (error) throw error
      if (!data) throw new Error('Package not found')

      setPackage(data)
      setOriginalPrice(data.price)
      setDiscountPrice(data.discount_price || 0)
      setFinalPrice(data.discount_price || data.price)
    } catch (error) {
      logger.error('Error loading package:', error)
      alert('حدث خطأ أثناء تحميل الباقة')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const currentPrice = discountPrice || originalPrice

      const validation = await couponService.validateCoupon(couponCode, userId, currentPrice)

      if (!validation.is_valid) {
        alert(validation.error_message || 'كود الخصم غير صالح')
        return
      }

      setCouponDiscount(validation.discount_amount)
      setFinalPrice(currentPrice - validation.discount_amount)
      setAppliedCoupon(couponCode)
      alert('تم تطبيق كود الخصم بنجاح!')
    } catch (error) {
      logger.error('Error applying coupon:', error)
      alert('حدث خطأ أثناء تطبيق كود الخصم')
    }
  }

  const handleRemoveCoupon = () => {
    setCouponDiscount(0)
    setFinalPrice(discountPrice || originalPrice)
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const handlePurchase = async () => {
    if (!pkg) return

    setProcessing(true)
    try {
      const result = await packageService.purchasePackage({
        package_id: packageId,
        user_id: userId,
        coupon_code: appliedCoupon || undefined,
        payment_method: paymentMethod,
      })

      if (!result.success) {
        throw new Error(result.error_message || 'فشلت عملية الشراء')
      }

      setStep('success')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
    } catch (error: any) {
      logger.error('Error purchasing package:', error)
      alert(error.message || 'حدث خطأ أثناء إتمام عملية الشراء')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 mt-6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pkg) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">شراء الباقة</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'success' ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">تمت عملية الشراء بنجاح!</h4>
            <p className="text-gray-600 mb-4">
              تم إضافة {pkg.credits} حصة إلى رصيدك
            </p>
            <p className="text-sm text-gray-500">سيتم إغلاق هذه النافذة تلقائياً...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Package Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-4">{pkg.name_ar}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد الحصص</span>
                  <span className="font-medium text-gray-900">{pkg.credits} حصة</span>
                </div>
                {pkg.validity_days && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">صلاحية الباقة</span>
                    <span className="font-medium text-gray-900">{pkg.validity_days} يوم</span>
                  </div>
                )}
                {pkg.package_type === 'family' && pkg.max_students && pkg.max_students > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد الطلاب</span>
                    <span className="font-medium text-gray-900">حتى {pkg.max_students} طلاب</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Section */}
            {step === 'details' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  كود الخصم (اختياري)
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Tag className="w-5 h-5 text-green-600" />
                    <span className="flex-1 text-sm text-green-800">
                      تم تطبيق كود الخصم: {appliedCoupon}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      إزالة
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="أدخل كود الخصم"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      تطبيق
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h4 className="font-semibold text-gray-900 mb-4">ملخص الطلب</h4>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">السعر الأساسي</span>
                <span className="text-gray-900">{originalPrice} ريال</span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">خصم الباقة</span>
                  <span className="text-green-600">-{originalPrice - discountPrice} ريال</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">خصم الكوبون</span>
                  <span className="text-green-600">-{couponDiscount} ريال</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-300">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">المجموع</span>
                  <span className="font-bold text-blue-600 text-xl">{finalPrice} ريال</span>
                </div>
              </div>

              {(discountPrice > 0 || couponDiscount > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 text-center">
                    🎉 وفرت {originalPrice - finalPrice} ريال
                    ({Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}%)
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            {step === 'details' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">طريقة الدفع</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">بطاقة ائتمان</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">تحويل بنكي</span>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handlePurchase}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'جاري المعالجة...' : `ادفع ${finalPrice} ريال`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
