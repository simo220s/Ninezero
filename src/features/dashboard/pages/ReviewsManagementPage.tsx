/**
 * Reviews and Feedback Management Page
 * 
 * Features:
 * - Review display for completed English lessons
 * - Parent feedback collection and management
 * - Teacher response functionality
 * - Rating analytics and performance metrics
 * - Filtering by age group and English level
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import { Star, MessageSquare, Search, Filter, TrendingUp, Award } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'
import reviewsService from '@/lib/services/reviews-service'

// Review interface
export interface Review {
  id: string
  class_id: string
  student_id: string
  teacher_id: string
  rating: number // 1-5 stars
  comment: string
  parent_name: string
  student_age: number
  age_group: '10-12' | '13-15' | '16-18'
  english_level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'
  class_type: 'Individual' | 'Group' | 'Assessment' | 'Trial'
  teacher_response?: string
  responded_at?: string
  created_at: string
  student?: {
    first_name: string
    last_name: string
    email: string
  }
}

type FilterType = 'all' | '5-star' | '4-star' | '3-star' | '2-star' | '1-star' | 'responded' | 'pending'

export default function ReviewsManagementPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<FilterType>('all')
  const [ageGroupFilter, setAgeGroupFilter] = useState<'all' | '10-12' | '13-15' | '16-18'>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'>('all')
  const [error, setError] = useState<string | null>(null)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadReviews()
    }
  }, [user])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchTerm, ratingFilter, ageGroupFilter, levelFilter])

  const loadReviews = async () => {
    if (!user?.id) {
      setError('لم يتم العثور على معرف المستخدم')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Fetch real reviews from database
      const { data: reviewsData, error: reviewsError } = await reviewsService.getTeacherReviews(user.id)
      
      if (reviewsError) {
        logger.error('Error loading reviews:', reviewsError)
        setError('حدث خطأ في تحميل المراجعات')
        
        // Fallback to mock data for demonstration if error
        const mockReviews: Review[] = [
        {
          id: '1',
          class_id: 'c1',
          student_id: 's1',
          teacher_id: user?.id || '',
          rating: 5,
          comment: 'معلم ممتاز! ابني استفاد كثيراً من الحصة. شرح واضح ومبسط.',
          parent_name: 'أحمد محمد',
          student_age: 12,
          age_group: '10-12',
          english_level: 'Beginner',
          class_type: 'Individual',
          created_at: new Date().toISOString(),
          student: { first_name: 'محمد', last_name: 'أحمد', email: 'student1@example.com' }
        },
        {
          id: '2',
          class_id: 'c2',
          student_id: 's2',
          teacher_id: user?.id || '',
          rating: 4,
          comment: 'حصة جيدة جداً. أتمنى المزيد من التمارين العملية.',
          parent_name: 'فاطمة علي',
          student_age: 15,
          age_group: '13-15',
          english_level: 'Intermediate',
          class_type: 'Group',
          teacher_response: 'شكراً على ملاحظتك. سأضيف المزيد من التمارين في الحصص القادمة.',
          responded_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          student: { first_name: 'سارة', last_name: 'علي', email: 'student2@example.com' }
        },
      ]
        setReviews(mockReviews)
        setLoading(false)
        return
      }
      
      // Use real data
      setReviews(reviewsData || [])
      logger.log('Reviews loaded successfully', { count: reviewsData?.length || 0 })
    } catch (err) {
      setError('حدث خطأ في تحميل التقييمات')
      logger.error('Reviews loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = [...reviews]

    if (searchTerm) {
      filtered = filtered.filter(review => {
        const studentName = `${review.student?.first_name || ''} ${review.student?.last_name || ''}`.toLowerCase()
        const parentName = review.parent_name.toLowerCase()
        const comment = review.comment.toLowerCase()
        const search = searchTerm.toLowerCase()
        return studentName.includes(search) || parentName.includes(search) || comment.includes(search)
      })
    }

    if (ratingFilter !== 'all') {
      if (ratingFilter === 'responded') {
        filtered = filtered.filter(r => r.teacher_response)
      } else if (ratingFilter === 'pending') {
        filtered = filtered.filter(r => !r.teacher_response)
      } else {
        const rating = parseInt(ratingFilter.split('-')[0])
        filtered = filtered.filter(r => r.rating === rating)
      }
    }

    if (ageGroupFilter !== 'all') {
      filtered = filtered.filter(r => r.age_group === ageGroupFilter)
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(r => r.english_level === levelFilter)
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFilteredReviews(filtered)
  }

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) return

    try {
      // Mock API call
      logger.log('Submitting response:', { reviewId, responseText })
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, teacher_response: responseText, responded_at: new Date().toISOString() }
          : r
      ))
      
      setRespondingTo(null)
      setResponseText('')
    } catch (err) {
      logger.error('Response submission error:', err)
      setError('فشل إرسال الرد')
    }
  }

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      dist[r.rating as keyof typeof dist]++
    })
    return dist
  }

  const getResponseRate = (): number => {
    if (reviews.length === 0) return 0
    const responded = reviews.filter(r => r.teacher_response).length
    return (responded / reviews.length) * 100
  }

  const getFilterCount = (filter: FilterType): number => {
    if (filter === 'all') return reviews.length
    if (filter === 'responded') return reviews.filter(r => r.teacher_response).length
    if (filter === 'pending') return reviews.filter(r => !r.teacher_response).length
    const rating = parseInt(filter.split('-')[0])
    return reviews.filter(r => r.rating === rating).length
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إدارة المراجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-text-secondary arabic-text">جاري تحميل التقييمات...</p>
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
              <CardTitle className="arabic-text">إدارة المراجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 arabic-text mb-4">{error}</p>
                <Button onClick={loadReviews} variant="outline" className="arabic-text">
                  المحاولة مرة أخرى
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const avgRating = calculateAverageRating()
  const ratingDist = getRatingDistribution()
  const responseRate = getResponseRate()

  return (
    <DashboardLayout showBreadcrumbs>
      <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 arabic-text">إدارة المراجعات</h1>
          <p className="text-gray-600 arabic-text mt-1">
            تقييمات وملاحظات أولياء الأمور على حصص اللغة الإنجليزية
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">متوسط التقييم</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
                  {renderStars(Math.round(avgRating), 'sm')}
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي التقييمات</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">معدل الرد</p>
                <p className="text-3xl font-bold text-green-600">{responseRate.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">تقييمات 5 نجوم</p>
                <p className="text-3xl font-bold text-purple-600">{ratingDist[5]}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">توزيع التقييمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-24">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${reviews.length > 0 ? (ratingDist[rating as keyof typeof ratingDist] / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDist[rating as keyof typeof ratingDist]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث في التقييمات (الطالب، ولي الأمر، التعليق)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">التقييم:</span>
              {(['all', '5-star', '4-star', '3-star', '2-star', '1-star', 'responded', 'pending'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRatingFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    ratingFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'الكل' : 
                   filter === 'responded' ? 'تم الرد' :
                   filter === 'pending' ? 'بانتظار الرد' :
                   `${filter.split('-')[0]} نجوم`} ({getFilterCount(filter)})
                </button>
              ))}
            </div>

            {/* Age Group Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">الفئة العمرية:</span>
              {(['all', '10-12', '13-15', '16-18'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setAgeGroupFilter(group)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    ageGroupFilter === group
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {group === 'all' ? 'الكل' : `${group} سنة`}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">المستوى:</span>
              {(['all', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    levelFilter === level
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'الكل' : level}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">
            التقييمات ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 arabic-text mb-2">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد تقييمات في هذه الفئة'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {review.student?.first_name?.charAt(0) || 'ط'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 arabic-text">
                            {review.student?.first_name} {review.student?.last_name}
                          </h4>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600 arabic-text">
                            ولي الأمر: {review.parent_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{formatDate(review.created_at)}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {review.age_group} سنة
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {review.english_level}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {review.class_type === 'Individual' ? 'فردية' :
                             review.class_type === 'Group' ? 'جماعية' :
                             review.class_type === 'Assessment' ? 'تقييم' : 'تجريبية'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 arabic-text leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  {/* Teacher Response */}
                  {review.teacher_response ? (
                    <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 arabic-text">ردك:</span>
                        <span className="text-xs text-blue-600">{formatDate(review.responded_at!)}</span>
                      </div>
                      <p className="text-blue-900 arabic-text leading-relaxed">
                        {review.teacher_response}
                      </p>
                    </div>
                  ) : respondingTo === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="اكتب ردك على التقييم..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 arabic-text focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleSubmitResponse(review.id)}
                          disabled={!responseText.trim()}
                          className="arabic-text"
                        >
                          إرسال الرد
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseText('')
                          }}
                          className="arabic-text"
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setRespondingTo(review.id)}
                      className="arabic-text flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      الرد على التقييم
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
