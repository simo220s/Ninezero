import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, CreditCard, Clock, Video, TrendingUp } from 'lucide-react'
import { getAdminDashboardStats, getUpcomingClasses24h, getRecentActivity, type AdminStats, type UpcomingClass, type RecentActivity } from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'
import { logger } from '@/lib/utils/logger'

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load stats
      const { data: statsData, error: statsError } = await getAdminDashboardStats()
      if (statsError) throw statsError
      setStats(statsData)

      // Load upcoming classes
      const { data: classesData, error: classesError } = await getUpcomingClasses24h()
      if (classesError) throw classesError
      setUpcomingClasses(classesData || [])

      // Load recent activity
      const { data: activityData, error: activityError } = await getRecentActivity()
      if (activityError) throw activityError
      setRecentActivity(activityData || [])
    } catch (err) {
      logger.error('Error loading dashboard data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return toArabicNumerals(time)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${toArabicNumerals(diffMins.toString())} دقيقة`
    if (diffHours < 24) return `منذ ${toArabicNumerals(diffHours.toString())} ساعة`
    return `منذ ${toArabicNumerals(diffDays.toString())} يوم`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 arabic-text mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary arabic-text mb-2">
          مرحباً بك في لوحة الإدارة
        </h2>
        <p className="text-text-secondary arabic-text">
          نظرة عامة على النظام والإحصائيات الرئيسية
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary-600 arabic-text flex items-center text-base">
              <Users className="w-5 h-5 ms-2" />
              إجمالي المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {toArabicNumerals(stats?.totalUsers.toString() || '0')}
            </div>
            <p className="text-primary-600 text-sm arabic-text">
              {toArabicNumerals(stats?.totalStudents.toString() || '0')} طالب • {toArabicNumerals(stats?.totalTeachers.toString() || '0')} معلم
            </p>
          </CardContent>
        </Card>

        {/* Total Classes */}
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-success-600 arabic-text flex items-center text-base">
              <Calendar className="w-5 h-5 ms-2" />
              الحصص المجدولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success-600 mb-2">
              {toArabicNumerals(stats?.scheduledClasses.toString() || '0')}
            </div>
            <p className="text-success-600 text-sm arabic-text">
              {toArabicNumerals(stats?.completedClasses.toString() || '0')} مكتملة
            </p>
          </CardContent>
        </Card>

        {/* Total Credits */}
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-600 arabic-text flex items-center text-base">
              <CreditCard className="w-5 h-5 ms-2" />
              إجمالي الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {toArabicNumerals(stats?.totalCredits.toFixed(1) || '0')}
            </div>
            <p className="text-yellow-600 text-sm arabic-text">
              رصيد الحصص في النظام
            </p>
          </CardContent>
        </Card>

        {/* Student Stats */}
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 arabic-text flex items-center text-base">
              <TrendingUp className="w-5 h-5 ms-2" />
              الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {toArabicNumerals(stats?.trialStudents.toString() || '0')}
            </div>
            <p className="text-orange-600 text-sm arabic-text">
              تجريبي • {toArabicNumerals(stats?.regularStudents.toString() || '0')} نظامي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center">
              <Clock className="w-5 h-5 ms-2" />
              الحصص القادمة (24 ساعة)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8 text-text-secondary arabic-text">
                لا توجد حصص مجدولة في الـ 24 ساعة القادمة
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary arabic-text truncate">
                        {cls.studentName}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatDate(cls.date)} • {formatTime(cls.time)}
                      </p>
                    </div>
                    {cls.meetingLink && (
                      <Video className="w-5 h-5 text-primary-600 flex-shrink-0 ms-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center">
              <TrendingUp className="w-5 h-5 ms-2" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-text-secondary arabic-text">
                لا توجد أنشطة حديثة
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary arabic-text">
                        {activity.description}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
