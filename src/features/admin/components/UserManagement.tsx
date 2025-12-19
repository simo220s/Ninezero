import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { getAllUsers } from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'
import CreateUserModal from './CreateUserModal'
import { logger } from '@/lib/utils/logger'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_trial: boolean
  created_at: string
}

type RoleFilter = 'all' | 'student' | 'teacher' | 'admin'
type TrialFilter = 'all' | 'trial' | 'regular'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [trialFilter, setTrialFilter] = useState<TrialFilter>('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Sorting
  const [sortBy] = useState<'name' | 'email' | 'date'>('date')
  const [sortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, roleFilter, trialFilter, sortBy, sortOrder])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await getAllUsers()
      
      if (fetchError) throw fetchError
      
      setUsers(data || [])
    } catch (err) {
      logger.error('Error loading users:', err)
      setError('حدث خطأ في تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(search) ||
        user.last_name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      )
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Apply trial filter
    if (trialFilter === 'trial') {
      filtered = filtered.filter(user => user.is_trial)
    } else if (trialFilter === 'regular') {
      filtered = filtered.filter(user => !user.is_trial)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700'
      case 'teacher':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير'
      case 'teacher':
        return 'معلم'
      default:
        return 'طالب'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

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
        <Button onClick={loadUsers}>إعادة المحاولة</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text flex items-center">
            <Users className="w-6 h-6 ms-2" />
            إدارة المستخدمين
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredUsers.length.toString())} مستخدم
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="arabic-text">
          <Plus className="w-4 h-4 ms-2" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <Input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 arabic-text"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع الأدوار</option>
                <option value="student">طالب</option>
                <option value="teacher">معلم</option>
                <option value="admin">مدير</option>
              </select>
            </div>

            {/* Trial Filter */}
            <div>
              <select
                value={trialFilter}
                onChange={(e) => setTrialFilter(e.target.value as TrialFilter)}
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع الحالات</option>
                <option value="trial">تجريبي</option>
                <option value="regular">نظامي</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-text-secondary arabic-text">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">لا توجد نتائج</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-semibold">
                              {user.first_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="mr-3">
                            <p className="text-sm font-medium text-text-primary arabic-text">
                              {user.first_name} {user.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-text-secondary">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full arabic-text ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'student' && (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full arabic-text ${
                            user.is_trial ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.is_trial ? 'تجريبي' : 'نظامي'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="تعديل الرصيد"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
              <div className="text-sm text-text-secondary arabic-text">
                عرض {toArabicNumerals(startIndex + 1)} إلى {toArabicNumerals(Math.min(endIndex, filteredUsers.length))} من {toArabicNumerals(filteredUsers.length.toString())} مستخدم
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

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  )
}
