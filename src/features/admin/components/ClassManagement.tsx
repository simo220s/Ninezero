import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  Search,
  Video,
  Clock,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { logger } from '@/lib/utils/logger'
import { getAllClasses } from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  meeting_link?: string
  status: string
  student: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  teacher: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'

export default function ClassManagement() {
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [filteredClasses, setFilteredClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    filterClasses()
  }, [classes, searchTerm, statusFilter, dateFrom, dateTo])

  const loadClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await getAllClasses()

      if (fetchError) throw fetchError

      setClasses(data || [])
    } catch (err) {
      logger.error('Error loading classes:', err)
      setError('حدث خطأ في تحميل الحصص')
    } finally {
      setLoading(false)
    }
  }

  const filterClasses = () => {
    let filtered = [...classes]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((cls) => {
        const student = Array.isArray(cls.student) ? cls.student[0] : cls.student
        const teacher = Array.isArray(cls.teacher) ? cls.teacher[0] : cls.teacher

        const studentName = student
          ? `${student.first_name} ${student.last_name}`.toLowerCase()
          : ''
        const teacherName = teacher
          ? `${teacher.first_name} ${teacher.last_name}`.toLowerCase()
          : ''

        return studentName.includes(search) || teacherName.includes(search)
      })
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((cls) => cls.status === statusFilter)
    }

    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter((cls) => cls.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter((cls) => cls.date <= dateTo)
    }

    setFilteredClasses(filtered)
    setCurrentPage(1)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'no-show':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغاة'
      case 'no-show':
        return 'غياب'
      default:
        return status
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

  const formatTime = (time: string) => {
    return toArabicNumerals(time)
  }

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClasses = filteredClasses.slice(startIndex, endIndex)

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
        <Button onClick={loadClasses}>إعادة المحاولة</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text flex items-center">
            <Calendar className="w-6 h-6 ms-2" />
            إدارة الحصص
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredClasses.length.toString())} حصة
          </p>
        </div>
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
                  placeholder="البحث بالطالب أو المعلم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 arabic-text"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع الحالات</option>
                <option value="scheduled">مجدولة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
                <option value="no-show">غياب</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="arabic-text"
                placeholder="من تاريخ"
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="arabic-text"
                placeholder="إلى تاريخ"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
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
                    المعلم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    التاريخ والوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider arabic-text">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentClasses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-text-secondary arabic-text">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">لا توجد نتائج</p>
                        <p className="text-sm">جرب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentClasses.map((cls) => {
                    const student = Array.isArray(cls.student)
                      ? cls.student[0]
                      : cls.student
                    const teacher = Array.isArray(cls.teacher)
                      ? cls.teacher[0]
                      : cls.teacher

                    return (
                      <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-600 font-semibold">
                                {student?.first_name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="mr-3">
                              <p className="text-sm font-medium text-text-primary arabic-text">
                                {student?.first_name} {student?.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-text-primary arabic-text">
                            {teacher?.first_name} {teacher?.last_name}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-text-primary">{formatDate(cls.date)}</p>
                            <p className="text-text-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(cls.time)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {toArabicNumerals(cls.duration.toString())} دقيقة
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full arabic-text ${getStatusBadgeColor(
                              cls.status
                            )}`}
                          >
                            {getStatusLabel(cls.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {cls.meeting_link && (
                              <button
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="رابط الاجتماع"
                                onClick={() => window.open(cls.meeting_link, '_blank')}
                              >
                                <Video className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
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
                {toArabicNumerals(Math.min(endIndex, filteredClasses.length).toString())}{' '}
                من {toArabicNumerals(filteredClasses.length.toString())} حصة
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
