import { useEffect, useState } from 'react'
import { ReviewCard } from '@/components/ReviewCard'
import type { Review } from '@/components/ReviewCard'
import { StarRating } from '@/components/StarRating'
import { supabase } from '@/lib/supabase'

export default function AllReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
      setTotalReviews(count || 0)
      
      // Calculate average rating and distribution
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length
        setAverageRating(avg)

        // Calculate rating distribution
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        data.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1
        })
        setRatingDistribution(distribution)
      }
    } catch (error) {
      logger.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-text-primary arabic-text mb-8">
            تقييمات الطلاب
          </h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 arabic-text">
              لا توجد تقييمات بعد
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-text-primary arabic-text mb-8">
          تقييمات الطلاب
        </h2>

        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-right">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} size={28} className="justify-center md:justify-end mb-2" />
              <p className="text-gray-600 arabic-text">
                بناءً على {totalReviews} تقييم
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {rating} نجوم
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}
