import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Percent,
  Search,
  Tag,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
} from 'lucide-react'
import {
  applyManualDiscount,
  getAllActiveDiscounts,
  removeDiscount,
  getDiscountStatistics,
} from '@/lib/services/discount-service'
import { getAllUsers } from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface DiscountRecord {
  id: string
  user_id: string
  subscription_id: string
  discount_percentage: number
  discount_type: string
  start_date: string
  end_date: string
  is_active: boolean
  reason: string
  applied_by: string
  created_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  applied_by_user?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface DiscountStats {
  totalActiveDiscounts: number
  totalDiscountValue: number
  avgDiscountPercentage: number
  discountsByType: Record<string, number>
}

export default function DiscountManagement() {
  const { user } = useAuth()
  const [discounts, setDiscounts] = useState<DiscountRecord[]>([])
  const [filteredDiscounts, setFilteredDiscounts] = useState<DiscountRecord[]>([])
  const [stats, setStats] = useState<DiscountStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Apply discount modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([])
  const [applyForm, setApplyForm] = useState({
    userId: '',
    subscriptionId: '',
    discountPercentage: '',
    durationMonths: '3',
    reason: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterDiscounts()
  }, [discounts, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load discounts
      const { data: discountData, error: discountError } = await getAllActiveDiscounts()
      if (discountError) throw discountError
      setDiscounts(discountData || [])

      // Load statistics
      const { data: statsData } = await getDiscountStatistics()
      setStats(statsData || {
        totalActiveDiscounts: 0,
        totalDiscountValue: 0,
        avgDiscountPercentage: 0,
        discountsByType: {}
      })

      // Load users for modal
      const { data: usersData, error: usersError } = await getAllUsers()
      if (usersError) throw usersError
      setUsers(usersData || [])
    } catch (err) {
      console.error('Error loading discount data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const filterDiscounts = () => {
    let filtered = [...discounts]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((discount) => {
        const user = Array.isArray(discount.user) ? discount.user[0] : discount.user
        const userName = user
          ? `${user.first_name} ${user.last_name}`.toLowerCase()
          : ''
        const userEmail = user?.email?.toLowerCase() || ''
        const reason = discount.reason?.toLowerCase() || ''

        return userName.includes(search) || userEmail.includes(search) || reason.includes(search)
      })
    }

    setFilteredDiscounts(filtered)
    setCurrentPage(1)
  }

  const handleUserChange = async (userId: string) => {
    setApplyForm({ ...applyForm, userId, subscriptionId: '' })
    
    if (!userId) {
      setUserSubscriptions([])
      return
    }

    // Load user's active subscriptions
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (!error && data) {
        setUserSubscriptions(data)
      }
    } catch (err) {
      console.error('Error loading subscriptions:', err)
    }
  }

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      setApplyError('غير مصرح')
      return
    }

    try {
      setApplying(true)
      setApplyError(null)

      const { error } = await applyManualDiscount({
        userId: applyForm.userId,
        subscriptionId: applyForm.subscriptionId,
        discountPercentage: parseFloat(applyForm.discountPercentage),
        durationMonths: parseInt(applyForm.durationMonths),
        reason: applyForm.reason,
        appliedBy: user.id
      })

      if (error) throw error

      // Success - reload data and close modal
      await loadData()
      setIsApplyModalOpen(false)
      setApplyForm({
        userId: '',
        subscriptionId: '',
        discountPercentage: '',
        durationMonths: '3',
        reason: '',
      })
      setUserSubscriptions([])
    } catch (err: any) {
      console.error('Error applying discount:', err)
      setApplyError(err.message || 'حدث خطأ في تطبيق الخصم')
    } finally {
      setApplying(false)
    }
  }

  const handleRemoveDiscount = async (discountId: string) => {
    if (!user?.id) return

    if (!confirm('هل أنت متأكد من إزالة هذا الخصم؟')) {
      return
    }

    try {
      const { error } = await removeDiscount(discountId, user.id)
      if (error) throw error

      await loadData()
    } catch (err) {
      console.error('Error removing discount:', err)
      alert('حدث خطأ في إزالة الخصم')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'manual':
        return 'يدوي'
      case 'retention':
        return 'استبقاء'
      case 'promotional':
        return 'ترويجي'
      case 'custom':
        return 'مخصص'
      default:
        return type
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDiscounts = filteredDiscounts.slice(startIndex, endIndex)

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
            <Percent className="w-6 h-6 ms-2" />
            إدارة الخصومات
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredDiscounts.length.toString())} خصم نشط
          </p>
        </div>
        <Button onClick={() => setIsApplyModalOpen(true)} className="arabic-text">
          <Tag className="w-4 h-4 ms-2" />
          تطبيق خصم جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary-600 arabic-text flex items-center text-base">
              <Tag className="w-5 h-5 ms-2" />
              الخصومات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {toArabicNumerals(stats?.totalActiveDiscounts.toString() || '0')}
            </div>
            <p className="text-primary-600 text-sm arabic-text">خصم نشط حالياً</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-600 arabic-text flex items-center text-base">
              <Percent className="w-5 h-5 ms-2" />
              متوسط الخصم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {toArabicNumerals(stats?.avgDiscountPercentage.toFixed(1) || '0')}%
            </div>
            <p className="text-green-600 text-sm arabic-text">نسبة الخصم المتوسطة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 arabic-text flex items-center text-base">
              <Users className="w-5 h-5 ms-2" />
              الطلاب المستفيدون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {toArabicNumerals(new Set(discounts.map(d => d.user_id)).size.toString())}
            </div>
            <p className="text-orange-600 text-sm arabic-text">طالب لديه خصم</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <Input
              type="text"
              placeholder="البحث بالطالب أو السبب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 arabic-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Discounts Table */}
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
                    نسبة الخصم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    السبب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    تاريخ الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-text-secondary arabic-text">
                        <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">لا توجد خصومات نشطة</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentDiscounts.map((discount) => {
                    const user = Array.isArray(discount.user) ? discount.user[0] : discount.user

                    return (
                      <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
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
                          <span className="text-lg font-bold text-green-600">
                            {toArabicNumerals(discount.discount_percentage.toString())}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 arabic-text">
                            {getDiscountTypeLabel(discount.discount_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary arabic-text max-w-xs truncate">
                            {discount.reason || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-text-secondary">
                            <Calendar className="w-4 h-4 ml-1" />
                            {formatDate(discount.end_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDiscount(discount.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                  Math.min(endIndex, filteredDiscounts.length).toString()
                )}{' '}
                من {toArabicNumerals(filteredDiscounts.length.toString())} خصم
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

      {/* Apply Discount Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text">تطبيق خصم جديد</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApplyDiscount} className="space-y-4">
            {applyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 arabic-text">{applyError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                الطالب
              </label>
              <select
                value={applyForm.userId}
                onChange={(e) => handleUserChange(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="">اختر طالب</option>
                {users
                  .filter((u) => u.role === 'student')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            {applyForm.userId && (
              <div>
                <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                  الاشتراك
                </label>
                <select
                  value={applyForm.subscriptionId}
                  onChange={(e) =>
                    setApplyForm({ ...applyForm, subscriptionId: e.target.value })
                  }
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
                >
                  <option value="">اختر اشتراك</option>
                  {userSubscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      اشتراك {sub.plan_name || 'قياسي'} - {sub.credits} حصة
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                نسبة الخصم (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={applyForm.discountPercentage}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, discountPercentage: e.target.value })
                }
                required
                className="arabic-text"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                المدة (بالأشهر)
              </label>
              <Input
                type="number"
                min="1"
                max="12"
                value={applyForm.durationMonths}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, durationMonths: e.target.value })
                }
                required
                className="arabic-text"
                placeholder="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                سبب الخصم
              </label>
              <textarea
                value={applyForm.reason}
                onChange={(e) =>
                  setApplyForm({ ...applyForm, reason: e.target.value })
                }
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-text-primary arabic-text resize-none"
                placeholder="اكتب سبب تطبيق الخصم..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsApplyModalOpen(false)
                  setApplyForm({
                    userId: '',
                    subscriptionId: '',
                    discountPercentage: '',
                    durationMonths: '3',
                    reason: '',
                  })
                  setUserSubscriptions([])
                }}
                disabled={applying}
                className="arabic-text"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={applying} className="arabic-text">
                {applying ? (
                  <>
                    <Spinner size="sm" className="ms-2" />
                    جاري التطبيق...
                  </>
                ) : (
                  'تطبيق الخصم'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
