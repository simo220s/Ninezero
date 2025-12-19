import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, CreditCard } from 'lucide-react'

/**
 * Loading skeleton for RegularDashboardSubscription page
 * RTL-compatible with Arabic text alignment
 */
export default function SubscriptionPageSkeleton() {
  return (
    <div className="space-y-8" dir="rtl">
      {/* Subscription Management Card Skeleton */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-lg">
        <CardHeader>
          <CardTitle className="arabic-text flex items-center text-xl">
            <CreditCard className="w-6 h-6 ms-2 text-indigo-600" />
            إدارة الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Plan Overview Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-200">
            <div className="animate-pulse space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              </div>

              {/* Credits Display - 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200"
                  >
                    <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3"></div>
              </div>

              {/* Subscription Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Pricing Info Skeleton */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Card Skeleton */}
      <Card dir="rtl">
        <CardHeader dir="rtl">
          <CardTitle className="arabic-text flex items-center text-xl text-right" dir="rtl">
            <Receipt className="w-6 h-6 ms-2 text-indigo-600" />
            سجل المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent dir="rtl">
          <div className="text-center py-12 animate-pulse" dir="rtl">
            <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Skeleton */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-12 bg-gray-200 rounded-lg w-full sm:w-48 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-full sm:w-48 animate-pulse"></div>
      </div>
    </div>
  )
}
