/**
 * Page-specific Error Boundary Component
 * Provides error boundaries for individual pages with retry functionality
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  pageName?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Page Error Boundary
 * Catches errors within a specific page and provides recovery options
 */
export class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const pageName = this.props.pageName || 'Unknown Page'
    logger.error(`Error in ${pageName}:`, error, errorInfo)
    
    this.setState({ errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard/student'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
          <Card className="max-w-md w-full" dir="rtl">
            <CardContent className="p-8 text-right" dir="rtl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 arabic-text text-right">
                حدث خطأ في تحميل الصفحة
              </h2>
              <p className="text-gray-600 mb-6 arabic-text text-right">
                نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full arabic-text flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  المحاولة مرة أخرى
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full arabic-text flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  العودة للصفحة الرئيسية
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                    <p className="text-xs font-mono text-gray-700 mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs font-mono text-gray-600 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default PageErrorBoundary
