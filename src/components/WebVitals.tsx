import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

interface WebVitalsProps {
  onMetric?: (metric: WebVitalsMetric) => void
  reportToAnalytics?: boolean
}

export default function WebVitals({ onMetric, reportToAnalytics = false }: WebVitalsProps) {
  useEffect(() => {
    // Only load web-vitals in production or when explicitly enabled
    if (import.meta.env.DEV && !reportToAnalytics) return

    const reportMetric = (metric: WebVitalsMetric) => {
      // Call custom handler
      onMetric?.(metric)

      // Report to analytics service (placeholder)
      if (reportToAnalytics) {
        // In a real app, you would send this to your analytics service
        logger.log('📊 Web Vital:', metric)
        
        // Example: Send to Google Analytics 4
        if (typeof (window as unknown as { gtag?: unknown }).gtag !== 'undefined') {
          (window as unknown as { gtag: (event: string, name: string, params: Record<string, unknown>) => void }).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            custom_parameter_1: metric.id
          })
        }
      }
    }

    // Dynamically import web-vitals to avoid increasing bundle size
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(reportMetric)
      onINP(reportMetric)
      onFCP(reportMetric)
      onLCP(reportMetric)
      onTTFB(reportMetric)
    }).catch(() => {
      // Fallback if web-vitals is not available
      logger.warn('Web Vitals library not available')
    })
  }, [onMetric, reportToAnalytics])

  // This component doesn't render anything
  return null
}

// Hook for using web vitals data
export function useWebVitals() {
  const [metrics, setMetrics] = useState<Record<string, WebVitalsMetric>>({})
  const [score, setScore] = useState(0)

  const handleMetric = (metric: WebVitalsMetric) => {
    setMetrics(prev => ({
      ...prev,
      [metric.name]: metric
    }))
  }

  useEffect(() => {
    // Calculate overall performance score
    const calculateScore = () => {
      const { LCP, INP, CLS, FCP, TTFB } = metrics
      let totalScore = 100

      // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
      if (LCP) {
        if (LCP.value > 4000) totalScore -= 30
        else if (LCP.value > 2500) totalScore -= 15
      }

      // INP scoring (good: <200ms, needs improvement: 200-500ms, poor: >500ms)
      if (INP) {
        if (INP.value > 500) totalScore -= 25
        else if (INP.value > 200) totalScore -= 10
      }

      // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
      if (CLS) {
        if (CLS.value > 0.25) totalScore -= 25
        else if (CLS.value > 0.1) totalScore -= 10
      }

      // FCP scoring (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
      if (FCP) {
        if (FCP.value > 3000) totalScore -= 15
        else if (FCP.value > 1800) totalScore -= 8
      }

      // TTFB scoring (good: <800ms, needs improvement: 800-1800ms, poor: >1800ms)
      if (TTFB) {
        if (TTFB.value > 1800) totalScore -= 10
        else if (TTFB.value > 800) totalScore -= 5
      }

      return Math.max(0, totalScore)
    }

    setScore(calculateScore())
  }, [metrics])

  return {
    metrics,
    score,
    handleMetric,
    isGoodPerformance: score >= 80,
    needsImprovement: score >= 50 && score < 80,
    isPoorPerformance: score < 50
  }
}

// Performance monitoring component for development
export function PerformanceDebugger() {
  const { metrics, score } = useWebVitals()

  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 start-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Performance Score: {score}</div>
      {Object.entries(metrics).map(([name, metric]) => (
        <div key={name} className="flex justify-between">
          <span>{name}:</span>
          <span className={`ms-2 ${
            metric.rating === 'good' ? 'text-green-400' :
            metric.rating === 'needs-improvement' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
            {name !== 'CLS' && 'ms'}
          </span>
        </div>
      ))}
    </div>
  )
}
