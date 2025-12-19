import { useEffect } from 'react'
import { usePerformance } from '@/hooks/usePerformance'
import { logger } from '@/lib/logger'

interface PerformanceMonitorProps {
  enabled?: boolean
  logToConsole?: boolean
  reportToAnalytics?: boolean
}

export default function PerformanceMonitor({
  enabled = false, // Changed from import.meta.env.DEV to false - hide by default
  logToConsole = import.meta.env.DEV, // Still log to console in dev
  reportToAnalytics = false
}: PerformanceMonitorProps) {
  const { metrics, performanceScore, isSlowConnection } = usePerformance()

  useEffect(() => {
    if (!enabled) return

    // Log performance metrics
    if (logToConsole && Object.keys(metrics).length > 0) {
      logger.group('🚀 Performance Metrics')
      logger.log('Score:', performanceScore)
      logger.log('Slow Connection:', isSlowConnection)
      logger.log('Metrics:', metrics)
      logger.groupEnd()
    }

    // Report to analytics (placeholder)
    if (reportToAnalytics && performanceScore > 0) {
      // In a real app, you would send this to your analytics service
      logger.log('📊 Reporting to analytics:', {
        score: performanceScore,
        metrics,
        timestamp: new Date().toISOString()
      })
    }
  }, [metrics, performanceScore, isSlowConnection, enabled, logToConsole, reportToAnalytics])

  // Show performance warning for slow connections
  useEffect(() => {
    if (isSlowConnection && enabled) {
      logger.warn('⚠️ Slow connection detected. Consider showing lightweight version.')
    }
  }, [isSlowConnection, enabled])

  // Don't render anything in production
  if (!enabled) return null

  return (
    <div className="fixed bottom-4 end-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>Score: {performanceScore}</div>
      {metrics.lcp && <div>LCP: {Math.round(metrics.lcp)}ms</div>}
      {metrics.fid && <div>FID: {Math.round(metrics.fid)}ms</div>}
      {metrics.cls && <div>CLS: {metrics.cls.toFixed(3)}</div>}
      {isSlowConnection && <div className="text-yellow-300">Slow Connection</div>}
    </div>
  )
}

// Hook for conditional loading based on performance
export function useConditionalLoading() {
  const { isSlowConnection, performanceScore } = usePerformance()

  const shouldLoadHeavyContent = !isSlowConnection && performanceScore > 60
  const shouldUseOptimizedImages = isSlowConnection || performanceScore < 80
  const shouldReduceAnimations = isSlowConnection || performanceScore < 70

  return {
    shouldLoadHeavyContent,
    shouldUseOptimizedImages,
    shouldReduceAnimations,
    isSlowConnection,
    performanceScore
  }
}
