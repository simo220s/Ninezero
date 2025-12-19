import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Star,
  Search,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { getAllReviews, approveReview, deleteReview } from '@/lib/admin-database'
import { Spinner } from '@/components/ui/spinner'
import { toArabicNumerals } from '@/lib/formatters'
import { logger } from '@/lib/utils/logger'

interface Review {
  id: string
  student_id: string
  teacher_id: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
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

type ApprovalFilter = 'all' | 'approved' | 'pending'
type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1'

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchTerm, approvalFilter, ratingFilter])

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await getAllReviews()

      if (fetchError) throw fetchError

      setReviews(data || [])
    } catch (err: any) {
      logger.error('Error loading reviews:', err)
      // If table doesn't exist, show a friendly message
      if (err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setError('جدول التقييمات غير موجود بعد. سيتم إنشاؤه عند إضافة أول تقييم.')
      } else {
        setError('حدث خطأ في تحميل التقييمات')
      }
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((review) => {
        const student = Array.isArray(review.student)
          ? review.student[0]
          : review.student
        const teacher = Array.isArray(review.teacher)
          ? review.teacher[0]
          : review.teacher

        const studentName = student
          ? `${student.first_name} ${student.last_name}`.toLowerCase()
          : ''
        const teacherName = teacher
          ? `${teacher.first_name} ${teacher.last_name}`.toLowerCase()
          : ''
        const comment = review.comment?.toLowerCase() || ''

        return (
          studentName.includes(search) ||
          teacherName.includes(search) ||
          comment.includes(search)
        )
      })
    }

    // Apply approval filter
    if (approvalFilter === 'approved') {
      filtered = filtered.filter((review) => review.approved)
    } else if (approvalFilter === 'pending') {
      filtered = filtered.filter((review) => !review.approved)
    }

    // Apply rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      )
    }

    setFilteredReviews(filtered)
    setCurrentPage(1)
  }

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId)
      const { error } = await approveReview(reviewId)

      if (error) throw error

      // Reload reviews
      await loadReviews()
    } catch (err) {
      logger.error('Error approving review:', err)
      alert('حدث خطأ في الموافقة على التقييم')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return
    }

    try {
      setActionLoading(reviewId)
      const { error } = await deleteReview(reviewId)

      if (error) throw error

      // Reload reviews
      await loadReviews()
    } catch (err) {
      logger.error('Error deleting review:', err)
      alert('حدث خطأ في حذف التقييم')
    } finally {
      setActionLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReviews = filteredReviews.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Calculate statistics
  const pendingCount = reviews.filter((r) => !r.approved).length
  const approvedCount = reviews.filter((r) => r.approved).length
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

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
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-text-secondary arabic-text mb-4">{error}</p>
        <Button onClick={loadReviews}>إعادة المحاولة</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text flex items-center">
            <Star className="w-6 h-6 ms-2" />
            إدارة التقييمات
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إجمالي {toArabicNumerals(filteredReviews.length.toString())} تقييم
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary arabic-text mb-1">
                  التقييمات المعتمدة
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {toArabicNumerals(approvedCount.toString())}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary arabic-text mb-1">
                  بانتظار الموافقة
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {toArabicNumerals(pendingCount.toString())}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary arabic-text mb-1">
                  متوسط التقييم
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {toArabicNumerals(avgRating.toFixed(1))}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600 fill-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Approval Filter */}
            <div>
              <select
                value={approvalFilter}
                onChange={(e) =>
                  setApprovalFilter(e.target.value as ApprovalFilter)
                }
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع التقييمات</option>
                <option value="approved">معتمدة</option>
                <option value="pending">بانتظار الموافقة</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
                className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
              >
                <option value="all">جميع التقييمات</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
                <option value="2">نجمتان</option>
                <option value="1">نجمة واحدة</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {currentReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-text-secondary arabic-text mb-1">
                لا توجد تقييمات
              </p>
              <p className="text-sm text-text-secondary arabic-text">
                جرب تغيير معايير البحث
              </p>
            </CardContent>
          </Card>
        ) : (
          currentReviews.map((review) => {
            const student = Array.isArray(review.student)
              ? review.student[0]
              : review.student
            const teacher = Array.isArray(review.teacher)
              ? review.teacher[0]
              : review.teacher

            return (
              <Card
                key={review.id}
                className={`${
                  !review.approved ? 'border-2 border-yellow-200 bg-yellow-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* Student and Teacher Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-semibold text-lg">
                            {student?.first_name?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary arabic-text">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            تقييم للمعلم: {teacher?.first_name} {teacher?.last_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-text-secondary">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-text-primary arabic-text leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}

                      {/* Status Badge */}
                      {!review.approved && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          <MessageSquare className="w-4 h-4" />
                          <span className="arabic-text">بانتظار الموافقة</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      {!review.approved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={actionLoading === review.id}
                          className="arabic-text bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === review.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 ms-1" />
                              موافقة
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review.id)}
                        disabled={actionLoading === review.id}
                        className="arabic-text text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {actionLoading === review.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 ms-1" />
                            حذف
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary arabic-text">
                عرض {toArabicNumerals((startIndex + 1).toString())} إلى{' '}
                {toArabicNumerals(
                  Math.min(endIndex, filteredReviews.length).toString()
                )}{' '}
                من {toArabicNumerals(filteredReviews.length.toString())} تقييم
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
