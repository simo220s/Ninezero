/**
 * Package Builder Component
 * 
 * Form for creating and editing packages
 * Task 11: Develop Package and Bundle System
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { packageService } from '@/lib/services/package-service'
import type { Package, CreatePackageInput, PackageType } from '@/types/package'
import { logger } from '@/lib/logger'

interface PackageBuilderProps {
  package?: Package
  onClose: () => void
  onSave: () => void
}

export function PackageBuilder({ package: existingPackage, onClose, onSave }: PackageBuilderProps) {
  const [formData, setFormData] = useState<CreatePackageInput>({
    name: existingPackage?.name || '',
    name_ar: existingPackage?.name_ar || '',
    description: existingPackage?.description || '',
    description_ar: existingPackage?.description_ar || '',
    package_type: existingPackage?.package_type || 'credit_bundle',
    credits: existingPackage?.credits || 5,
    price: existingPackage?.price || 500,
    discount_price: existingPackage?.discount_price,
    validity_days: existingPackage?.validity_days,
    max_students: existingPackage?.max_students || 1,
    includes_trial: existingPackage?.includes_trial || false,
    trial_classes: existingPackage?.trial_classes || 0,
    regular_classes: existingPackage?.regular_classes || 0,
    features: existingPackage?.features || [],
    is_featured: existingPackage?.is_featured || false,
    is_bestseller: existingPackage?.is_bestseller || false,
    is_seasonal: existingPackage?.is_seasonal || false,
    display_order: existingPackage?.display_order || 0,
    status: existingPackage?.status || 'active',
  })

  const [saving, setSaving] = useState(false)
  const [newFeature, setNewFeature] = useState({ text: '', text_ar: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (existingPackage) {
        const { error } = await packageService.updatePackage({
          id: existingPackage.id,
          ...formData,
        })
        if (error) throw error
      } else {
        const { error } = await packageService.createPackage(formData)
        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      logger.error('Error saving package:', error)
      alert('حدث خطأ أثناء حفظ الباقة')
    } finally {
      setSaving(false)
    }
  }

  const addFeature = () => {
    if (newFeature.text && newFeature.text_ar) {
      setFormData({
        ...formData,
        features: [
          ...(formData.features || []),
          { id: Date.now().toString(), ...newFeature },
        ],
      })
      setNewFeature({ text: '', text_ar: '' })
    }
  }

  const removeFeature = (id: string) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((f) => f.id !== id) || [],
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {existingPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">المعلومات الأساسية</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name in English *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف بالعربية
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description in English
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Package Type and Credits */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">نوع الباقة والرصيد</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الباقة *
                </label>
                <select
                  required
                  value={formData.package_type}
                  onChange={(e) => setFormData({ ...formData, package_type: e.target.value as PackageType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit_bundle">باقة رصيد</option>
                  <option value="family">باقة عائلية</option>
                  <option value="trial_combo">باقة تجريبية</option>
                  <option value="seasonal">باقة موسمية</option>
                  <option value="custom">باقة مخصصة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الحصص *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صلاحية الباقة (أيام)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.validity_days || ''}
                  onChange={(e) => setFormData({ ...formData, validity_days: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">التسعير</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر الأساسي (ريال) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سعر الخصم (ريال)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_price || ''}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.discount_price && formData.price > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  نسبة الخصم: {Math.round(((formData.price - formData.discount_price) / formData.price) * 100)}%
                  ({formData.price - formData.discount_price} ريال توفير)
                </p>
              </div>
            )}
          </div>

          {/* Special Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">خيارات خاصة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.package_type === 'family' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد الطلاب (للباقة العائلية)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {formData.package_type === 'trial_combo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الحصص التجريبية
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.trial_classes}
                      onChange={(e) => setFormData({ ...formData, trial_classes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الحصص العادية
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.regular_classes}
                      onChange={(e) => setFormData({ ...formData, regular_classes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">باقة مميزة</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_bestseller}
                  onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">الأكثر مبيعاً</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_seasonal}
                  onChange={(e) => setFormData({ ...formData, is_seasonal: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">باقة موسمية</span>
              </label>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">مميزات الباقة</h4>
            
            <div className="space-y-2">
              {formData.features?.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700">{feature.text_ar}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(feature.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ميزة بالعربية"
                value={newFeature.text_ar}
                onChange={(e) => setNewFeature({ ...newFeature, text_ar: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Feature in English"
                value={newFeature.text}
                onChange={(e) => setNewFeature({ ...newFeature, text: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الباقة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
