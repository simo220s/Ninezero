/**
 * Coupon Form Component
 * 
 * Form for creating and editing discount coupons
 * Task 10: Implement Coupon and Discount System
 */

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import couponService from '@/lib/services/coupon-service'
import type { Coupon, CreateCouponInput, DiscountType, ApplicableTo } from '@/types/coupon'
import { logger } from '@/lib/logger'

interface CouponFormProps {
  coupon?: Coupon
  onClose: () => void
  onSuccess: () => void
}

export default function CouponForm({ coupon, onClose, onSuccess }: CouponFormProps) {
  const [formData, setFormData] = useState<CreateCouponInput>({
    code: '',
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: undefined,
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    max_uses: undefined,
    max_uses_per_user: 1,
    applicable_to: 'all',
    status: 'active',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        name_ar: coupon.name_ar,
        description: coupon.description,
        description_ar: coupon.description_ar,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase_amount: coupon.min_purchase_amount,
        max_discount_amount: coupon.max_discount_amount,
        valid_from: new Date(coupon.valid_from),
        valid_until: new Date(coupon.valid_until),
        max_uses: coupon.max_uses,
        max_uses_per_user: coupon.max_uses_per_user,
        applicable_to: coupon.applicable_to,
        status: coupon.status,
      })
    }
  }, [coupon])

  const handleGenerateCode = () => {
    const code = couponService.generateCouponCode('CLUB', 8)
    setFormData({ ...formData, code })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'الكود مطلوب'
    } else if (formData.code.length < 4) {
      newErrors.code = 'الكود يجب أن يكون 4 أحرف على الأقل'
    }

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'الاسم بالعربية مطلوب'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم بالإنجليزية مطلوب'
    }

    if (formData.discount_value <= 0) {
      newErrors.discount_value = 'قيمة الخصم يجب أن تكون أكبر من صفر'
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      newErrors.discount_value = 'النسبة المئوية يجب أن تكون بين 1 و 100'
    }

    if (formData.valid_until <= formData.valid_from) {
      newErrors.valid_until = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية'
    }

    if (formData.max_uses !== undefined && formData.max_uses <= 0) {
      newErrors.max_uses = 'عدد الاستخدامات يجب أن يكون أكبر من صفر'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      if (coupon) {
        // Update existing coupon
        const { error } = await couponService.updateCoupon({
          id: coupon.id,
          ...formData,
        })

        if (error) throw error
      } else {
        // Create new coupon
        const { error } = await couponService.createCoupon(formData)

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (error) {
      logger.error('Error saving coupon:', error)
      alert('حدث خطأ أثناء حفظ الكوبون')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 arabic-text">
            {coupon ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
              كود الكوبون *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                placeholder="CLUB2024"
                dir="ltr"
                disabled={!!coupon}
              />
              {!coupon && (
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 arabic-text"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>توليد</span>
                </button>
              )}
            </div>
            {errors.code && <p className="text-sm text-red-600 mt-1 arabic-text">{errors.code}</p>}
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الاسم بالعربية *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
                placeholder="خصم رمضان"
                dir="rtl"
              />
              {errors.name_ar && <p className="text-sm text-red-600 mt-1 arabic-text">{errors.name_ar}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (English) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ramadan Discount"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الوصف بالعربية
              </label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Discount Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                نوع الخصم *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
                dir="rtl"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ريال)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                قيمة الخصم *
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
              {errors.discount_value && <p className="text-sm text-red-600 mt-1 arabic-text">{errors.discount_value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الحد الأقصى للخصم (ريال)
              </label>
              <input
                type="number"
                value={formData.max_discount_amount || ''}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="غير محدود"
                dir="ltr"
              />
            </div>
          </div>

          {/* Purchase Requirements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الحد الأدنى للشراء (ريال)
              </label>
              <input
                type="number"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                ينطبق على
              </label>
              <select
                value={formData.applicable_to}
                onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value as ApplicableTo })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
                dir="rtl"
              >
                <option value="all">الكل</option>
                <option value="trial">حصص تجريبية</option>
                <option value="regular">حصص نظامية</option>
                <option value="packages">باقات</option>
                <option value="credits">نقاط</option>
              </select>
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                تاريخ البداية *
              </label>
              <input
                type="datetime-local"
                value={formData.valid_from.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, valid_from: new Date(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                تاريخ الانتهاء *
              </label>
              <input
                type="datetime-local"
                value={formData.valid_until.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, valid_until: new Date(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
              {errors.valid_until && <p className="text-sm text-red-600 mt-1 arabic-text">{errors.valid_until}</p>}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الحد الأقصى للاستخدامات
              </label>
              <input
                type="number"
                value={formData.max_uses || ''}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="غير محدود"
                dir="ltr"
              />
              {errors.max_uses && <p className="text-sm text-red-600 mt-1 arabic-text">{errors.max_uses}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                الحد الأقصى لكل مستخدم *
              </label>
              <input
                type="number"
                value={formData.max_uses_per_user}
                onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
              الحالة
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
              dir="rtl"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors arabic-text"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed arabic-text"
            >
              {loading ? 'جاري الحفظ...' : coupon ? 'تحديث' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
