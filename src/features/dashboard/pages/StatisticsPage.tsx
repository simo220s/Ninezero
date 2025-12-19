/**
 * Statistics and Analytics Dashboard
 * 
 * Features:
 * - Comprehensive English teaching performance analytics
 * - Student progress by age group and English level
 * - Lesson completion and attendance statistics
 * - Revenue analytics in Saudi Riyals
 * - Comparative performance metrics over time
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Award, 
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'
import { 
  usePerformanceMetrics, 
  useAgeGroupAnalytics, 
  useLevelAnalytics, 
  useMonthlyTrends 
} from '@/lib/hooks/useDashboardStats'
import { ErrorMessage } from '@/components/ui/error-message'

// Note: Type interfaces are now imported from the hooks/services

export default function StatisticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Fetch analytics data using React Query hooks
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = usePerformanceMetrics(user?.id || '', timeRange)
  
  const { 
    data: ageGroupData = [], 
    isLoading: ageGroupLoading,
    error: ageGroupError 
  } = useAgeGroupAnalytics(user?.id || '')
  
  const { 
    data: levelData = [], 
    isLoading: levelLoading,
    error: levelError 
  } = useLevelAnalytics(user?.id || '')
  
  const { 
    data: monthlyTrends = [], 
    isLoading: trendsLoading,
    error: trendsError 
  } = useMonthlyTrends(user?.id || '', 5)
  
  // Combine loading states
  const loading = metricsLoading || ageGroupLoading || levelLoading || trendsLoading
  
  // Combine errors
  const error = metricsError || ageGroupError || levelError || trendsError
  
  const handleRetry = () => {
    refetchMetrics()
  }

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ar-SA')} ر.س`
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">الإحصائيات والتحليلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-text-secondary arabic-text">جاري تحميل الإحصائيات...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">الإحصائيات والتحليلات</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorMessage
                message={error instanceof Error ? error.message : 'حدث خطأ في تحميل الإحصائيات'}
                onRetry={handleRetry}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }
  
  if (!metrics) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">الإحصائيات والتحليلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-600 arabic-text">لا توجد بيانات متاحة</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showBreadcrumbs>
      <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 arabic-text">الإحصائيات والتحليلات</h1>
          <p className="text-gray-600 arabic-text mt-1">
            تحليل شامل لأداء التدريس والطلاب
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? 'أسبوع' : 
               range === 'month' ? 'شهر' :
               range === 'quarter' ? '3 أشهر' : 'سنة'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي الطلاب</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalStudents}</p>
                <div className="mt-2">{getChangeIndicator(metrics.totalStudents, 40)}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">معدل الإكمال</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completionRate}%</p>
                <div className="mt-2">{getChangeIndicator(metrics.completionRate, 85)}</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">متوسط التقييم</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.averageRating}</p>
                <div className="mt-2">{getChangeIndicator(metrics.averageRating, 4.5)}</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(metrics.monthlyRevenue)}</p>
                <div className="mt-2">{getChangeIndicator(metrics.monthlyRevenue, 11000)}</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              نظرة عامة على الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 arabic-text">معدل الحضور</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${metrics.attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 arabic-text">معدل إكمال الحصص</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${metrics.completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 arabic-text">نسبة الطلاب النشطين</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((metrics.activeStudents / metrics.totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${(metrics.activeStudents / metrics.totalStudents) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 arabic-text">إجمالي الحصص</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 arabic-text">الحصص المكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.completedClasses}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الاتجاهات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyTrends.slice(-5).map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 arabic-text">{trend.month}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{trend.students} طالب</span>
                      <span>•</span>
                      <span>{trend.classes} حصة</span>
                      <span>•</span>
                      <span>{trend.rating} ⭐</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{formatCurrency(trend.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Group Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            تحليل حسب الفئة العمرية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ageGroupData.map((group) => (
              <div key={group.ageGroup} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 arabic-text">{group.ageGroup} سنة</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {group.studentCount} طالب
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 arabic-text">الحصص المكتملة</span>
                      <span className="font-medium text-gray-900">{group.completedLessons}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 arabic-text">متوسط التقدم</span>
                      <span className="font-medium text-gray-900">{group.averageProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${group.averageProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 arabic-text">الإيرادات</span>
                      <span className="font-bold text-purple-600">{formatCurrency(group.revenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* English Level Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            تحليل حسب مستوى اللغة الإنجليزية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levelData.map((level) => (
              <div key={level.level} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{level.level}</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {level.studentCount} طالب
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium text-gray-900">{level.averageRating}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 arabic-text mb-1">الحصص المكتملة</p>
                    <p className="text-xl font-bold text-gray-900">{level.completedLessons}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 arabic-text mb-1">معدل التقدم</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${level.progressRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{level.progressRate}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 arabic-text mb-1">متوسط الحصص/طالب</p>
                    <p className="text-xl font-bold text-purple-600">
                      {(level.completedLessons / level.studentCount).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              تفصيل الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700 arabic-text font-medium">إجمالي الإيرادات</span>
                <span className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.totalRevenue)}</span>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 arabic-text">حسب الفئة العمرية</h5>
                {ageGroupData.map((group) => (
                  <div key={group.ageGroup} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 arabic-text">{group.ageGroup} سنة</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(group.revenue / metrics.totalRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-24 text-right">
                        {formatCurrency(group.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ملخص الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 arabic-text mb-1">معدل الحضور</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.attendanceRate}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 arabic-text mb-1">معدل الإكمال</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completionRate}%</p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 arabic-text mb-2">متوسط التقييم الإجمالي</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-500 text-xl">
                        {star <= Math.round(metrics.averageRating) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{metrics.averageRating}</span>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 arabic-text mb-1">متوسط الإيراد/حصة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(Math.round(metrics.totalRevenue / metrics.completedClasses))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}
