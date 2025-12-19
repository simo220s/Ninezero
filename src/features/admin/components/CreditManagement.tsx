import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CreditCard,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react'
import {
  getAllCreditTransactions,
  getCreditStatistics,
  adjustUserCredits,
  getAllUsers,
} from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/utils/logger'
import { toArabicNumerals } from '@/lib/formatters'
import { useAuth } from '@/lib/auth-context'

interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

interface CreditStats {
  totalCredits: number
  creditsAddedThisMonth: number
  creditsConsumedThisMonth: number
  avgCreditsPerStudent: number
  lowBalanceCount: number
}

type TransactionTypeFilter = 'all' | 'add' | 'deduct' | 'refund'

export default function CreditManagement() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<CreditTransaction[]>([])
  const [stats, setStats] = useState<CreditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Manual adjustment modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    amount: '',
    reason: '',
    type: 'add' as 'add' | 'deduct',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, typeFilter, dateFrom, dateTo])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load transactions
      const { data: transData, error: transError } = await getAllCreditTransactions()
      if (transError) throw transError
      setTransactions(transData || [])

      // Load statistics
      const { data: statsData, error: statsError } = await getCreditStatistics()
      if (statsError) throw statsError
      setStats(statsData)

      // Load users for adjustment modal
      const { data: usersData, error: usersError } = await getAllUsers()
      if (usersError) throw usersError
      setUsers(usersData || [])
    } catch (err) {
      logger.error('Error loading credit data:', err)
      setError('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((trans) => {
        const user = Array.isArray(trans.user) ? trans.user[0] : trans.user
        const userName = user
          ? `${user.first_name} ${user.last_name}`.toLowerCase()
          : ''
        const userEmail = user?.email?.toLowerCase() || ''

        return userName.includes(search) || userEmail.includes(search)
      })
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((trans) => trans.transaction_type === typeFilter)
    }

    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (trans) => new Date(trans.created_at) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(
        (trans) => new Date(trans.created_at) <= endDate
      )
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      setAdjustError('غير مصرح')
      return
    }

    try {
      setAdjusting(true)
      setAdjustError(null)

      const amount =
        adjustForm.type === 'add'
          ? parseFloat(adjustForm.amount)
          : -parseFloat(adjustForm.amount)

      const { error } = await adjustUserCredits(
        adjustForm.userId,
        amount,
        adjustForm.reason,
        user.id
      )

      if (error) throw error

      // Success - reload data and close modal
      await loadData()
      setIsAdjustModalOpen(false)
      setAdjustForm({
        userId: '',
        amount: '',
        reason: '',
        type: 'add',
      })
    } catch (err: any) {
      logger.error('Error adjusting credits:', err)
      setAdjustError(err.message || 'حدث خطأ في تعديل الرصيد')
    } finally {
      setAdjusting(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="w-4 h-4" />
      case 'deduct':
        return <Minus className="w-4 h-4" />
      case 'refund':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-green-600'
      case 'deduct':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'add':
        return 'إضافة'
      case 'deduct':
        return 'خصم'
      case 'refund':
        return 'استرجاع'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text flex items-center">
            <CreditCard className="w-6 h-6 ms-2" />
            إدارة الرصيد
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredTransactions.length.toString())} معاملة
          </p>
        </div>
        <Button onClick={() => setIsAdjustModalOpen(true)} className="arabic-text">
          <DollarSign className="w-4 h-4 ms-2" />
          تعديل رصيد يدوي
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary-600 arabic-text flex items-center text-base">
              <CreditCard className="w-5 h-5 ms-2" />
              إجمالي الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {toArabicNumerals(stats?.totalCredits.toFixed(1) || '0')}
            </div>
            <p className="text-primary-600 text-sm arabic-text">رصيد الحصص في النظام</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-600 arabic-text flex items-center text-base">
              <TrendingUp className="w-5 h-5 ms-2" />
              المضاف هذا الشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {toArabicNumerals(stats?.creditsAddedThisMonth.toFixed(1) || '0')}
            </div>
            <p className="text-green-600 text-sm arabic-text">رصيد مضاف</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-600 arabic-text flex items-center text-base">
              <TrendingDown className="w-5 h-5 ms-2" />
              المستهلك هذا الشهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {toArabicNumerals(stats?.creditsConsumedThisMonth.toFixed(1) || '0')}
            </div>
            <p className="text-red-600 text-sm arabic-text">رصيد مستهلك</p>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 arabic-text flex items-center text-base">
              <Users className="w-5 h-5 ms-2" />
              متوسط الرصيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {toArabicNumerals(stats?.avgCreditsPerStudent.toFixed(1) || '0')}
            </div>
            <p className="text-orange-600 text-sm arabic-text">
              {toArabicNumerals(stats?.lowBalanceCount.toString() || '0')} رصيد منخفض
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <Input
                  type="text"
                  placeholder="البحث بالمستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 arabic-text"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as TransactionTypeFilter)
                }
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع الأنواع</option>
                <option value="add">إضافة</option>
                <option value="deduct">خصم</option>
                <option value="refund">استرجاع</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="arabic-text"
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="arabic-text"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    السبب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-text-secondary arabic-text">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">لا توجد معاملات</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((trans) => {
                    const user = Array.isArray(trans.user)
                      ? trans.user[0]
                      : trans.user

                    return (
                      <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
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
                          <div
                            className={`flex items-center gap-2 ${getTransactionColor(
                              trans.transaction_type
                            )}`}
                          >
                            {getTransactionIcon(trans.transaction_type)}
                            <span className="text-sm font-medium arabic-text">
                              {getTransactionLabel(trans.transaction_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${
                              trans.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {trans.amount > 0 ? '+' : ''}
                            {toArabicNumerals(trans.amount.toFixed(1))}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary arabic-text max-w-xs truncate">
                            {trans.description || '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(trans.created_at)}
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
                  Math.min(endIndex, filteredTransactions.length).toString()
                )}{' '}
                من {toArabicNumerals(filteredTransactions.length.toString())} معاملة
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

      {/* Manual Adjustment Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="arabic-text">تعديل رصيد يدوي</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdjustCredits} className="space-y-4">
            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 arabic-text">{adjustError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                المستخدم
              </label>
              <select
                value={adjustForm.userId}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, userId: e.target.value })
                }
                required
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="">اختر مستخدم</option>
                {users
                  .filter((u) => u.role !== 'admin')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                نوع العملية
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    adjustForm.type === 'add'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Plus className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium arabic-text">إضافة رصيد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'deduct' })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    adjustForm.type === 'deduct'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Minus className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium arabic-text">خصم رصيد</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                المبلغ
              </label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={adjustForm.amount}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, amount: e.target.value })
                }
                required
                className="arabic-text"
                placeholder="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                السبب
              </label>
              <textarea
                value={adjustForm.reason}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, reason: e.target.value })
                }
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-text-primary arabic-text resize-none"
                placeholder="اكتب سبب التعديل..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustModalOpen(false)}
                disabled={adjusting}
                className="arabic-text"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={adjusting} className="arabic-text">
                {adjusting ? (
                  <>
                    <Spinner size="sm" className="ms-2" />
                    جاري التعديل...
                  </>
                ) : (
                  'تأكيد التعديل'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
