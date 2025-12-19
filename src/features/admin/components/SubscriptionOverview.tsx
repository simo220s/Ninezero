import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CreditCard,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'
import { supabase } from '@/lib/supabase'

interface SubscriptionWithUser {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  status: 'active' | 'cancelled' | 'expired'
  start_date: string
  renewal_date: string
  cancellation_date?: string
  credits: number
  used_credits: number
  price: number
  discount_percentage?: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

interface SubscriptionStats {
  totalActive: number
  totalRevenue: number
  avgCreditsUsed: number
  cancellationRate: number
}

export default function SubscriptionOverview() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionWithUser[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'credits' | 'price'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortSubscriptions()
  }, [subscriptions, searchTerm, statusFilter, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load subscriptions with user data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user:users!subscriptions_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (subscriptionError) throw subscriptionError

      setSubscriptions(subscriptionData || [])

      // Calculate statistics
      const activeSubscriptions = subscriptionData?.filter(s => s.status === 'active') || []
      const totalRevenue = activeSubscriptions.reduce((sum, s) => {
        const price = s.discount_percentage 
          ? s.price * (1 - s.discount_percentage / 100)
          : s.price
        return sum + price
      }, 0)
      
      const avgCreditsUsed = activeSubscriptions.length > 0
        ? activeSubscriptions.reduce((sum, s) => sum + (s.used_credits / s.credits) * 100, 0) / activeSubscriptions.length
        : 0

      const cancelledCount = subscriptionData?.filter(s => s.status === 'cancelled').length || 0
      const cancellationRate = subscriptionData && subscriptionData.length > 0
        ? (cancelledCount / subscriptionData.length) * 100
        : 0

      setStats({
        totalActive: activeSubscriptions.length,
        totalRevenue,
        avgCreditsUsed,
        cancellationRate
      })
    } catch (err) {
      console.error('Error loading subscription data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortSubscriptions = () => {
    let filtered = [...subscriptions]

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((sub) => {
        const user = Array.isArray(sub.user) ? sub.user[0] : sub.user
        const userName = user
          ? `${user.first_name} ${user.last_name}`.toLowerCase()
          : ''
        const userEmail = user?.email?.toLowerCase() || ''
        const planName = sub.plan_name?.toLowerCase() || ''

        return userName.includes(search) || userEmail.includes(search) || planName.includes(search)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name': {
          const userA = Array.isArray(a.user) ? a.user[0] : a.user
          const userB = Array.isArray(b.user) ? b.user[0] : b.user
          const nameA = userA ? `${userA.first_name} ${userA.last_name}` : ''
          const nameB = userB ? `${userB.first_name} ${userB.last_name}` : ''
          comparison = nameA.localeCompare(nameB)
          break
        }
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'credits':
          comparison = (a.used_credits / a.credits) - (b.used_credits / b.credits)
          break
        case 'price':
          comparison = a.price - b.price
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredSubscriptions(filtered)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number, discountPercentage?: number) => {
    const finalPrice = discountPercentage 
      ? price * (1 - discountPercentage / 100)
      : price
    return toArabicNumerals(finalPrice.toFixed(2))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 arabic-text">
            <CheckCircle className="w-3 h-3 ml-1" />
            نشط
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 arabic-text">
            <XCircle className="w-3 h-3 ml-1" />
            ملغي
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 arabic-text">
            <Clock className="w-3 h-3 ml-1" />
            منتهي
          </span>
        )
      default:
        return null
    }
  }

  const getCreditsProgress = (used: number, total: number) => {
    const percentage = (used / total) * 100
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span className="arabic-text">
            {toArabicNumerals(used.toString())} / {toArabicNumerals(total.toString())} حصة
          </span>
          <span>{toArabicNumerals(percentage.toFixed(0))}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
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
        <Button onClick={loadData}>إعادة المحاولة</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text flex items-center">
            <CreditCard className="w-6 h-6 ms-2" />
            نظرة عامة على الاشتراكات
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredSubscriptions.length.toString())} اشتراك
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-600 arabic-text flex items-center text-base">
              <CheckCircle className="w-5 h-5 ms-2" />
              الاشتراكات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {toArabicNumerals(stats?.totalActive.toString() || '0')}
            </div>
            <p className="text-green-600 text-sm arabic-text">اشتراك نشط</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary-600 arabic-text flex items-center text-base">
              <DollarSign className="w-5 h-5 ms-2" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {toArabicNumerals(stats?.totalRevenue.toFixed(0) || '0')} ر.س
            </div>
            <p className="text-primary-600 text-sm arabic-text">إجمالي الإيرادات</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-600 arabic-text flex items-center text-base">
              <TrendingUp className="w-5 h-5 ms-2" />
              متوسط الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {toArabicNumerals(stats?.avgCreditsUsed.toFixed(1) || '0')}%
            </div>
            <p className="text-blue-600 text-sm arabic-text">من الحصص المستخدمة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 arabic-text flex items-center text-base">
              <XCircle className="w-5 h-5 ms-2" />
              معدل الإلغاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {toArabicNumerals(stats?.cancellationRate.toFixed(1) || '0')}%
            </div>
            <p className="text-orange-600 text-sm arabic-text">من إجمالي الاشتراكات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                type="text"
                placeholder="البحث بالطالب أو الخطة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 pr-10 pl-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="cancelled">ملغي</option>
                <option value="expired">منتهي</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="date">التاريخ</option>
                <option value="name">الاسم</option>
                <option value="credits">الاستخدام</option>
                <option value="price">السعر</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الخطة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الحصص
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    تاريخ التجديد
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-text-secondary arabic-text">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">لا توجد اشتراكات</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentSubscriptions.map((subscription) => {
                    const user = Array.isArray(subscription.user) ? subscription.user[0] : subscription.user

                    return (
                      <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-semibold">
                                {user?.first_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="mr-3">
                              <p className="text-sm font-medium text-text-primary arabic-text">
                                {user?.first_name} {user?.last_name}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-text-primary arabic-text">
                            {subscription.plan_name || 'خطة قياسية'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-[150px]">
                            {getCreditsProgress(subscription.used_credits, subscription.credits)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-bold text-text-primary">
                              {formatPrice(subscription.price, subscription.discount_percentage)} ر.س
                            </p>
                            {subscription.discount_percentage && (
                              <p className="text-xs text-green-600 arabic-text">
                                خصم {toArabicNumerals(subscription.discount_percentage.toString())}%
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-text-secondary">
                            <Calendar className="w-4 h-4 ml-1" />
                            {formatDate(subscription.renewal_date)}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary arabic-text">
                عرض {toArabicNumerals((startIndex + 1).toString())} إلى{' '}
                {toArabicNumerals(
                  Math.min(endIndex, filteredSubscriptions.length).toString()
                )}{' '}
                من {toArabicNumerals(filteredSubscriptions.length.toString())} اشتراك
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-text-primary hover:bg-gray-100'
                        }`}
                      >
                        {toArabicNumerals(pageNum.toString())}
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
