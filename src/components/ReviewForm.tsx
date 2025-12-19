import { useState, type FormEvent } from 'react'
import { StarRating } from './StarRating'
import { Button } from './ui/button'
import { logger } from '@/lib/logger'

export interface ReviewSubmission {
  rating: number
  comment: string
}

interface ReviewFormProps {
  onSubmit: (data: ReviewSubmission) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function ReviewForm({ onSubmit, onCancel, className = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: { rating?: string; comment?: string } = {}

    if (rating === 0) {
      newErrors.rating = 'يجب اختيار تقييم من 1 إلى 5 نجوم'
    }

    if (comment.trim().length < 10) {
      newErrors.comment = 'التعليق يجب أن يكون 10 أحرف على الأقل'
    } else if (comment.trim().length > 500) {
      newErrors.comment = 'التعليق يجب ألا يتجاوز 500 حرف'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ rating, comment: comment.trim() })
      
      // Reset form on success
      setRating(0)
      setComment('')
      setErrors({})
    } catch (error) {
      logger.error('Error submitting review:', error)
      setErrors({ comment: 'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Rating Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التقييم <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={32}
        />
        {errors.rating && (
          <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Comment Input */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          التعليق <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="شارك تجربتك مع الأستاذ أحمد..."
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {comment.length} / 500 حرف
          </span>
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </Button>
      </div>
    </form>
  )
}
