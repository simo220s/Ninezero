import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onChange,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1)
    }
  }

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex + 1)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null)
    }
  }

  const getStarFill = (starIndex: number): 'full' | 'half' | 'empty' => {
    const displayRating = hoverRating !== null ? hoverRating : rating
    const starValue = starIndex + 1

    if (displayRating >= starValue) {
      return 'full'
    } else if (displayRating >= starValue - 0.5) {
      return 'half'
    } else {
      return 'empty'
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const fill = getStarFill(index)
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`relative ${
              interactive
                ? 'cursor-pointer transition-transform hover:scale-110'
                : 'cursor-default'
            }`}
            aria-label={`${index + 1} نجوم`}
          >
            {fill === 'full' && (
              <Star
                size={size}
                className="fill-yellow-400 text-yellow-400"
              />
            )}
            {fill === 'half' && (
              <div className="relative">
                <Star
                  size={size}
                  className="text-gray-300"
                />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    size={size}
                    className="fill-yellow-400 text-yellow-400"
                  />
                </div>
              </div>
            )}
            {fill === 'empty' && (
              <Star
                size={size}
                className="text-gray-300"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
