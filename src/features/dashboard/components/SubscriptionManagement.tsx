/**
 * Subscription Management Component
 * 
 * Displays current subscription plan and credit management for regular students
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { CreditCard, TrendingUp, Calendar, Clock } from 'lucide-react'
import type { ClassCredits } from '@/types'

interface SubscriptionManagementProps {
  credits: ClassCredits | null
  completedClasses: number
  scheduledClasses: number
}

export default function SubscriptionManagement({ 
  credits, 
  completedClasses,
  scheduledClasses 
}: SubscriptionManagementProps) {
  // Calculate subscription details
  const currentCredits = credits?.credits || 0
  const totalCreditsUsed = completedClasses
  const estimatedHoursLeft = currentCredits * 1 // Assuming 1 credit = 1 hour

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 shadow-lg">
      <CardHeader>
        <CardTitle className="arabic-text flex items-center text-xl">
          <CreditCard className="w-6 h-6 ms-2 text-indigo-600" />
          إدارة الاشتراك
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Plan Overview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 arabic-text">
              الباقة الحالية
            </h3>
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-full">
              طالب منتظم
            </span>
          </div>
          
          {/* Credits Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currentCredits.toFixed(1)}
              </div>
              <p className="text-green-700 text-sm arabic-text font-medium">رصيد متبقي</p>
              <p className="text-xs text-green-600 arabic-text mt-1">حصة</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {totalCreditsUsed}
              </div>
              <p className="text-blue-700 text-sm arabic-text font-medium">حصص مكتملة</p>
              <p className="text-xs text-blue-600 arabic-text mt-1">إجمالي</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {estimatedHoursLeft.toFixed(1)}
              </div>
              <p className="text-purple-700 text-sm arabic-text font-medium">ساعات متبقية</p>
              <p className="text-xs text-purple-600 arabic-text mt-1">تقديري</p>
            </div>
          </div>

          {/* Usage Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 arabic-text font-medium">استخدام الرصيد</span>
              <span className="text-sm text-gray-600 arabic-text">
                {totalCreditsUsed} / {totalCreditsUsed + currentCredits} حصة
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((totalCreditsUsed / (totalCreditsUsed + currentCredits)) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Low Credit Warning */}
          {currentCredits < 2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 arabic-text mb-1">
                    رصيدك منخفض!
                  </h4>
                  <p className="text-sm text-amber-700 arabic-text">
                    رصيدك الحالي أقل من حصتين. يُنصح بإضافة رصيد لضمان استمرارية الحصص.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-gray-700 arabic-text">حصص قادمة: <strong>{scheduledClasses}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-700 arabic-text">نشط</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            asChild 
            className="arabic-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md h-12"
          >
            <Link to="/#pricing" className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              إضافة رصيد
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="arabic-text border-indigo-200 hover:bg-indigo-50 h-12"
          >
            <Link to="/book-regular" className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              حجز حصة جديدة
            </Link>
          </Button>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 arabic-text mb-2">
            💡 معلومات مهمة
          </h4>
          <ul className="space-y-1 text-sm text-blue-700 arabic-text">
            <li>• كل حصة تستهلك 1.0 رصيد (60 دقيقة)</li>
            <li>• يمكنك حجز حصص متعددة حسب رصيدك المتاح</li>
            <li>• الرصيد لا ينتهي ويمكن استخدامه في أي وقت</li>
            <li>• يمكنك إلغاء الحصة قبل 24 ساعة لاسترجاع الرصيد</li>
          </ul>
        </div>

        {/* Package Recommendations (if low on credits) */}
        {currentCredits < 2 && (
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h4 className="text-base font-bold text-purple-900 arabic-text mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              باقات موصى بها
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-purple-900 arabic-text">باقة 8 حصص</span>
                  <span className="text-sm text-purple-600 arabic-text">وفر 10%</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-1">800 ريال</p>
                <p className="text-xs text-gray-600 arabic-text">100 ريال للحصة الواحدة</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-purple-900 arabic-text">باقة 16 حصة</span>
                  <span className="text-sm text-purple-600 arabic-text">وفر 20%</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 mb-1">1440 ريال</p>
                <p className="text-xs text-gray-600 arabic-text">90 ريال للحصة الواحدة</p>
              </div>
            </div>
            <Button asChild className="w-full mt-3 arabic-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link to="/#pricing">عرض جميع الباقات</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

