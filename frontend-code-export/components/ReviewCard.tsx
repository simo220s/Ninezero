import { StarRating } from './StarRating'
import { getRelativeTime } from '@/lib/formatters'

export interface Review {
  id: string
  student_name: string
  rating: number
  comment: string
  created_at: string
}

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-bold text-lg">
              {review.student_name.charAt(0)}
            </span>
          </div>
        </div>
        
        {/* Name and Rating */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{review.student_name}</h3>
          <StarRating rating={review.rating} size={18} />
        </div>
      </div>
      
      {/* Comment */}
      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
      
      {/* Timestamp */}
      <p className="text-sm text-gray-500">
        {getRelativeTime(review.created_at)}
      </p>
    </div>
  )
}
