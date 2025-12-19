/**
 * Coupon Management Component
 * 
 * Admin interface for creating and managing discount coupons
 * Task 10: Implement Coupon and Discount System
 */

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Copy, TrendingUp, Users, DollarSign, Search, Filter } from 'lucide-react'
import couponService from '@/lib/services/coupon-service'
import CouponForm from './CouponForm'
import type { CouponListItem, CouponFilter, CouponStats } from '@/types/coupon'
import { logger } from '@/lib/logger'

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<CouponListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<CouponFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponListItem | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null)

  useEffect(() => {
    loadCoupons()
  }, [filter])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const { data, error } = await couponService.listCoupons({
        ...filter,
        search: searchTerm || undefined,
      })

      if (error) throw error

      setCoupons(data)
    } catch (error) {
      logger.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadCoupons()
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return

    try {
      const { error } = await couponService.deleteCoupon(couponId)
      if (error) throw error

      loadCoupons()
    } catch (error) {
      logger.error('Error deleting coupon:', error)
      alert('حدث خطأ أثناء حذف الكوبون')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('تم نسخ الكود')
  }

  const handleViewStats = async (coupon: CouponListItem) => {
    try {
      const { data, error } = await couponService.getCouponStats(coupon.id)
      if (error) throw error

      setCouponStats(data)
      setSelectedCoupon(coupon)
      setShowStatsModal(true)
    } catch (error) {
      logger.error('Error loading coupon stats:', error)
    }
  }

  const getStatusBadge = (coupon: CouponListItem) => {
    if (coupon.is_expired) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">منتهي</span>
    }
    if (coupon.is_depleted) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">مستنفذ</span>
    }
    if (coupon.status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">نشط</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">غير نشط</span>
  }

  const getDiscountDisplay = (coupon: CouponListItem) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return `${coupon.discount_value} ريال`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 arabic-text">إدارة كوبونات الخصم</h1>
          <p className="text-sm text-gray-600 arabic-text mt-1">
            إنشاء وإدارة كوبونات الخصم والعروض الترويجية
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors arabic-text"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء كوبون جديد</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="البحث بالكود أو الاسم..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
                dir="rtl"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
              dir="rtl"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="expired">منتهي</option>
              <option value="depleted">مستنفذ</option>
            </select>
          </div>

          {/* Applicable To Filter */}
          <div>
            <select
              value={filter.applicable_to || ''}
              onChange={(e) => setFilter({ ...filter, applicable_to: e.target.value as any || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent arabic-text"
              dir="rtl"
            >
              <option value="">جميع الأنواع</option>
              <option value="all">الكل</option>
              <option value="trial">حصص تجريبية</option>
              <option value="regular">حصص نظامية</option>
              <option value="packages">باقات</option>
              <option value="credits">نقاط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 arabic-text">لا توجد كوبونات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الكود
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الخصم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الاستخدام
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الصلاحية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider arabic-text">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 text-gray-900 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="نسخ الكود"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 arabic-text">
                        {coupon.name_ar}
                      </div>
                      <div className="text-xs text-gray-500">{coupon.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary-600">
                        {getDiscountDisplay(coupon)}
                      </div>
                      {coupon.min_purchase_amount > 0 && (
                        <div className="text-xs text-gray-500 arabic-text">
                          حد أدنى: {coupon.min_purchase_amount} ريال
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usage_count} / {coupon.max_uses || '∞'}
                      </div>
                      {coupon.remaining_uses !== undefined && (
                        <div className="text-xs text-gray-500 arabic-text">
                          متبقي: {coupon.remaining_uses}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600" dir="ltr">
                        {new Date(coupon.valid_from).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-xs text-gray-600" dir="ltr">
                        {new Date(coupon.valid_until).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStats(coupon)}
                          className="p-2 hover:bg-blue-50 rounded transition-colors"
                          title="الإحصائيات"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon)
                            setShowCreateModal(true)
                          }}
                          className="p-2 hover:bg-yellow-50 rounded transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Modal */}
      {showStatsModal && selectedCoupon && couponStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 arabic-text">
                إحصائيات الكوبون: {selectedCoupon.code}
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600 arabic-text">إجمالي الاستخدامات</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{couponStats.total_uses}</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 arabic-text">مستخدمين فريدين</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{couponStats.unique_users}</div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600 arabic-text">إجمالي الخصم</span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {couponStats.total_discount_given.toFixed(2)} ريال
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 arabic-text">متوسط الخصم</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {couponStats.avg_discount.toFixed(2)} ريال
                </div>
              </div>

              <div className="col-span-2 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600 arabic-text">إجمالي الإيرادات</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {couponStats.total_revenue.toFixed(2)} ريال
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors arabic-text"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CouponForm
          coupon={selectedCoupon || undefined}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedCoupon(null)
          }}
          onSuccess={() => {
            loadCoupons()
          }}
        />
      )}
    </div>
  )
}
