import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner, ButtonSpinner } from '@/components/ui/spinner'
import { StarRating } from '@/components/StarRating'
import { supabase } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/formatters'

interface Review {
  id: string
  student_name: string
  rating: number
  comment: string
  created_at: string
  is_approved: boolean
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadReviews()
  }, [filter])

  const loadReviews = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('is_approved', false)
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true)
      }

      const { data, error } = await query

      if (error) throw error

      setReviews(data || [])
    } catch (error) {
      logger.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      setProcessingId(reviewId)

      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: true }
          : review
      ))

      // If filtering by pending, remove from list
      if (filter === 'pending') {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      }

      alert('تم الموافقة على التقييم بنجاح')
    } catch (error) {
      logger.error('Error approving review:', error)
      alert('حدث خطأ في الموافقة على التقييم')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا التقييم؟ سيتم حذفه نهائياً.')) {
      return
    }

    try {
      setProcessingId(reviewId)

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId))

      alert('تم رفض وحذف التقييم')
    } catch (error) {
      logger.error('Error rejecting review:', error)
      alert('حدث خطأ في رفض التقييم')
    } finally {
      setProcessingId(null)
    }
  }

  const handleUnapprove = async (reviewId: string) => {
    try {
      setProcessingId(reviewId)

      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: false }
          : review
      ))

      // If filtering by approved, remove from list
      if (filter === 'approved') {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
      }

      alert('تم إلغاء الموافقة على التقييم')
    } catch (error) {
      logger.error('Error unapproving review:', error)
      alert('حدث خطأ في إلغاء الموافقة')
    } finally {
      setProcessingId(null)
    }
  }

  const pendingCount = reviews.filter(r => !r.is_approved).length
  const approvedCount = reviews.filter(r => r.is_approved).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">إدارة التقييمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="arabic-text flex items-center">
            <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            إدارة التقييمات
          </CardTitle>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
              className="arabic-text"
            >
              قيد الانتظار ({pendingCount})
            </Button>
            <Button
              variant={filter === 'approved' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
              className="arabic-text"
            >
              موافق عليها ({approvedCount})
            </Button>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="arabic-text"
            >
              الكل ({reviews.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-gray-600 arabic-text">
              {filter === 'pending' && 'لا توجد تقييمات قيد الانتظار'}
              {filter === 'approved' && 'لا توجد تقييمات موافق عليها'}
              {filter === 'all' && 'لا توجد تقييمات بعد'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`border rounded-lg p-6 ${
                  review.is_approved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold text-lg">
                        {review.student_name.charAt(0)}
                      </span>
                    </div>
                    
                    {/* Name and Rating */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{review.student_name}</h4>
                      <StarRating rating={review.rating} size={18} />
                      <p className="text-sm text-gray-500 mt-1">
                        {getRelativeTime(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.is_approved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {review.is_approved ? 'موافق عليه' : 'قيد الانتظار'}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {!review.is_approved ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(review.id)}
                        disabled={processingId === review.id}
                        className="arabic-text text-red-600 hover:bg-red-50"
                      >
                        {processingId === review.id ? (
                          <Spinner size="sm" />
                        ) : (
                          'رفض'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={processingId === review.id}
                        className="arabic-text"
                      >
                        {processingId === review.id ? (
                          <ButtonSpinner />
                        ) : (
                          'موافقة'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnapprove(review.id)}
                      disabled={processingId === review.id}
                      className="arabic-text"
                    >
                      {processingId === review.id ? (
                        <Spinner size="sm" />
                      ) : (
                        'إلغاء الموافقة'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
