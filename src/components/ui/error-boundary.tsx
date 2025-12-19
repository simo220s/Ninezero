import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './button'
import { logger } from '@/lib/utils/logger'
import { errorHandler } from '@/lib/utils/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorCount: number
}

/**
 * Enhanced Global Error Boundary
 * Catches React component errors with logging and recovery options
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorCount: 0,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with context
    logger.error('React Error Boundary caught an error', error, {
      component: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount + 1,
      },
    })

    // Categorize and handle the error
    errorHandler.handleError(error, {
      showToast: false, // Don't show toast, we're showing full page error
      logError: false, // Already logged above
      attemptRecovery: false,
      context: {
        componentStack: errorInfo.componentStack,
      },
    })

    // Update error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    logger.info('User attempting to recover from error')
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
    })
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  private handleReload = () => {
    logger.info('User reloading page after error')
    window.location.reload()
  }

  private handleGoHome = () => {
    logger.info('User navigating to home after error')
    window.location.href = '/'
  }

  private handleExportLogs = () => {
    const logs = logger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const showCriticalError = this.state.errorCount >= 3

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light" dir="rtl">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 arabic-text text-right">
                {showCriticalError ? 'خطأ حرج' : 'حدث خطأ غير متوقع'}
              </h2>
              <p className="text-text-secondary arabic-text text-right">
                {showCriticalError 
                  ? 'حدثت أخطاء متعددة. يرجى إعادة تحميل الصفحة أو الاتصال بالدعم الفني.'
                  : 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'}
              </p>
            </div>
            
            <div className="space-y-3">
              {!showCriticalError && (
                <Button onClick={this.handleRetry} className="w-full arabic-text">
                  المحاولة مرة أخرى
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={this.handleReload}
                className="w-full arabic-text"
              >
                إعادة تحميل الصفحة
              </Button>

              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="w-full arabic-text"
              >
                العودة للصفحة الرئيسية
              </Button>

              {import.meta.env.DEV && (
                <Button 
                  variant="ghost" 
                  onClick={this.handleExportLogs}
                  className="w-full text-sm"
                >
                  Export Error Logs
                </Button>
              )}
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-xs font-semibold mb-2">Error Message:</p>
                  <pre className="text-xs bg-white p-2 rounded mb-3 overflow-auto">
                    {this.state.error.message}
                  </pre>
                  
                  <p className="text-xs font-semibold mb-2">Stack Trace:</p>
                  <pre className="text-xs bg-white p-2 rounded mb-3 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>

                  {this.state.errorInfo && (
                    <>
                      <p className="text-xs font-semibold mb-2">Component Stack:</p>
                      <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Error Count: {this.state.errorCount}
                  </p>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
