/**
 * Package Display Component
 * 
 * Display packages on pricing page with purchase functionality
 * Task 11: Develop Package and Bundle System
 */

import { useState, useEffect } from 'react'
import { Check, Star, TrendingUp, Users, Calendar, Gift } from 'lucide-react'
import { packageService } from '@/lib/services/package-service'
import type { Package, PackageType } from '@/types/package'
import { logger } from '@/lib/logger'

interface PackageDisplayProps {
  onPurchase?: (packageId: string) => void
  showFeaturedOnly?: boolean
  packageType?: PackageType
}

export function PackageDisplay({ onPurchase, showFeaturedOnly, packageType }: PackageDisplayProps) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPackages()
  }, [showFeaturedOnly, packageType])

  const loadPackages = async () => {
    setLoading(true)
    try {
      const filter = {
        active_only: true,
        is_featured: showFeaturedOnly,
        package_type: packageType,
      }

      const { data, error } = await packageService.listPackages(filter)
      if (error) throw error
      setPackages(data)
    } catch (error) {
      logger.error('Error loading packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseClick = (packageId: string) => {
    if (onPurchase) {
      onPurchase(packageId)
    }
  }

  const getPackageIcon = (type: PackageType) => {
    const icons = {
      credit_bundle: <Gift className="w-6 h-6" />,
      family: <Users className="w-6 h-6" />,
      trial_combo: <Star className="w-6 h-6" />,
      seasonal: <Calendar className="w-6 h-6" />,
      custom: <TrendingUp className="w-6 h-6" />,
    }
    return icons[type]
  }

  const calculateSavings = (pkg: Package) => {
    if (!pkg.discount_price) return null
    const savings = pkg.price - pkg.discount_price
    const percentage = Math.round((savings / pkg.price) * 100)
    return { amount: savings, percentage }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">جاري تحميل الباقات...</p>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">لا توجد باقات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {packages.map((pkg) => {
        const savings = calculateSavings(pkg)
        const effectivePrice = pkg.discount_price || pkg.price
        const pricePerClass = Math.round((effectivePrice / pkg.credits) * 100) / 100

        return (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
              pkg.is_featured ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}
          >
            {/* Featured Badge */}
            {pkg.is_featured && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                مميزة
              </div>
            )}

            {/* Bestseller Badge */}
            {pkg.is_bestseller && (
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                🔥 الأكثر مبيعاً
              </div>
            )}

            {/* Savings Badge */}
            {savings && (
              <div className="absolute top-16 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                وفر {savings.percentage}%
              </div>
            )}

            {/* Package Header */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                {getPackageIcon(pkg.package_type)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name_ar}</h3>
              <p className="text-gray-600 text-sm">{pkg.name}</p>
            </div>

            {/* Pricing */}
            <div className="p-8 text-center border-b border-gray-200">
              <div className="mb-4">
                {pkg.discount_price ? (
                  <>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {pkg.discount_price}
                      <span className="text-lg text-gray-600 mr-2">ريال</span>
                    </div>
                    <div className="text-lg text-gray-400 line-through">
                      {pkg.price} ريال
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {pkg.price}
                    <span className="text-lg text-gray-600 mr-2">ريال</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-lg text-gray-900">{pkg.credits} حصة</p>
                <p>{pricePerClass} ريال للحصة الواحدة</p>
                {pkg.validity_days && (
                  <p className="text-blue-600">صالحة لمدة {pkg.validity_days} يوم</p>
                )}
              </div>
            </div>

            {/* Description */}
            {pkg.description_ar && (
              <div className="px-8 py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 text-center">{pkg.description_ar}</p>
              </div>
            )}

            {/* Features */}
            <div className="p-8 space-y-3">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature.text_ar}</span>
                </div>
              ))}

              {/* Special Package Info */}
              {pkg.package_type === 'family' && pkg.max_students && pkg.max_students > 1 && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-600 font-medium">
                    مناسبة لـ {pkg.max_students} طلاب
                  </span>
                </div>
              )}

              {pkg.includes_trial && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                  <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-600 font-medium">
                    تشمل {pkg.trial_classes} حصة تجريبية
                  </span>
                </div>
              )}
            </div>

            {/* Purchase Button */}
            <div className="p-8 pt-0">
              <button
                onClick={() => handlePurchaseClick(pkg.id)}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  pkg.is_featured
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                اشترِ الآن
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
