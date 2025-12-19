/**
 * Package Management Component
 * 
 * Admin interface for managing packages and bundles
 * Task 11: Develop Package and Bundle System
 */

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, Package as PackageIcon } from 'lucide-react'
import { packageService } from '@/lib/services/package-service'
import type { PackageListItem, PackageFilter, PackageType, PackageStatus } from '@/types/package'
import { logger } from '@/lib/logger'

export function PackageManagement() {
  const [packages, setPackages] = useState<PackageListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PackageFilter>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageListItem | null>(null)

  useEffect(() => {
    loadPackages()
  }, [filter])

  const loadPackages = async () => {
    setLoading(true)
    try {
      const { data, error } = await packageService.listPackages(filter)
      if (error) throw error
      setPackages(data)
    } catch (error) {
      logger.error('Error loading packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (packageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return

    try {
      const { error } = await packageService.deletePackage(packageId)
      if (error) throw error
      await loadPackages()
    } catch (error) {
      logger.error('Error deleting package:', error)
      alert('حدث خطأ أثناء حذف الباقة')
    }
  }

  const getPackageTypeLabel = (type: PackageType): string => {
    const labels: Record<PackageType, string> = {
      credit_bundle: 'باقة رصيد',
      family: 'باقة عائلية',
      trial_combo: 'باقة تجريبية',
      seasonal: 'باقة موسمية',
      custom: 'باقة مخصصة',
    }
    return labels[type]
  }

  const getStatusBadge = (status: PackageStatus) => {
    const badges: Record<PackageStatus, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'غير نشط' },
      archived: { bg: 'bg-red-100', text: 'text-red-800', label: 'مؤرشف' },
      coming_soon: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قريباً' },
    }
    const badge = badges[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الباقات</h2>
          <p className="text-gray-600 mt-1">إدارة باقات الرصيد والعروض الخاصة</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة باقة جديدة
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الباقة</label>
            <select
              value={filter.package_type || ''}
              onChange={(e) =>
                setFilter({ ...filter, package_type: e.target.value as PackageType || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              <option value="credit_bundle">باقة رصيد</option>
              <option value="family">باقة عائلية</option>
              <option value="trial_combo">باقة تجريبية</option>
              <option value="seasonal">باقة موسمية</option>
              <option value="custom">باقة مخصصة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={filter.status || ''}
              onChange={(e) =>
                setFilter({ ...filter, status: e.target.value as PackageStatus || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="archived">مؤرشف</option>
              <option value="coming_soon">قريباً</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">بحث</label>
            <input
              type="text"
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="ابحث عن باقة..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.is_featured || false}
                onChange={(e) => setFilter({ ...filter, is_featured: e.target.checked || undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">مميزة فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* Packages List */}
      {loading ? (
        <div className="space-y-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد باقات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Package Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{pkg.name_ar}</h3>
                    <p className="text-sm text-gray-600">{pkg.name}</p>
                  </div>
                  {getStatusBadge(pkg.status)}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {getPackageTypeLabel(pkg.package_type)}
                  </span>
                  {pkg.is_featured && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded">⭐ مميزة</span>
                  )}
                  {pkg.is_bestseller && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded">🔥 الأكثر مبيعاً</span>
                  )}
                </div>

                {pkg.description_ar && (
                  <p className="text-sm text-gray-600 line-clamp-2">{pkg.description_ar}</p>
                )}
              </div>

              {/* Package Details */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">عدد الحصص</span>
                  <span className="font-bold text-gray-900">{pkg.credits} حصة</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">السعر</span>
                  <div className="text-left">
                    {pkg.discount_price ? (
                      <>
                        <span className="font-bold text-green-600">{pkg.discount_price} ريال</span>
                        <span className="text-sm text-gray-400 line-through mr-2">{pkg.price} ريال</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">{pkg.price} ريال</span>
                    )}
                  </div>
                </div>

                {pkg.savings_percentage && pkg.savings_percentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">التوفير</span>
                    <span className="text-sm font-medium text-green-600">
                      {pkg.savings_percentage}% ({pkg.savings_amount} ريال)
                    </span>
                  </div>
                )}

                {pkg.validity_days && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">صلاحية الباقة</span>
                    <span className="text-sm text-gray-900">{pkg.validity_days} يوم</span>
                  </div>
                )}

                {pkg.purchase_count !== undefined && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">عدد المبيعات</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.purchase_count}</span>
                  </div>
                )}

                {pkg.revenue !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الإيرادات</span>
                    <span className="text-sm font-medium text-gray-900">{pkg.revenue} ريال</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  عرض
                </button>
                <button
                  onClick={() => {
                    setSelectedPackage(pkg)
                    setShowCreateModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {selectedPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </h3>
            <p className="text-gray-600">سيتم إضافة نموذج إنشاء/تعديل الباقة هنا</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedPackage(null)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
