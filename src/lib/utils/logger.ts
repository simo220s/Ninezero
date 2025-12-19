/**
 * Enhanced Logger Service
 * Provides structured logging with different log levels and context
 */

export const LogLevelEnum = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
} as const

export type LogLevel = typeof LogLevelEnum[keyof typeof LogLevelEnum]

export interface LogContext {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: LogContext
  error?: Error
  stack?: string
}

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel
  private logs: LogEntry[] = []
  private maxStoredLogs = 100

  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.minLevel = this.isDevelopment ? LogLevelEnum.DEBUG : LogLevelEnum.WARN
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      stack: error?.stack,
    }
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift()
    }
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context) return message
    
    const parts: string[] = [message]
    
    if (context.component) {
      parts.push(`[${context.component}]`)
    }
    
    if (context.action) {
      parts.push(`(${context.action})`)
    }
    
    return parts.join(' ')
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevelEnum.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevelEnum.DEBUG, message, context)
    this.storeLog(entry)
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage(message, context), context?.metadata)
    }
  }

  /**
   * Info level logging - informational messages
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevelEnum.INFO)) return
    
    const entry = this.createLogEntry(LogLevelEnum.INFO, message, context)
    this.storeLog(entry)
    
    if (this.isDevelopment) {
      console.info(this.formatMessage(message, context), context?.metadata)
    }
  }

  /**
   * Warning level logging - potential issues
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevelEnum.WARN)) return
    
    const entry = this.createLogEntry(LogLevelEnum.WARN, message, context)
    this.storeLog(entry)
    
    console.warn(this.formatMessage(message, context), context?.metadata)
  }

  /**
   * Error level logging - errors that need attention
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevelEnum.ERROR)) return
    
    const entry = this.createLogEntry(LogLevelEnum.ERROR, message, context, error)
    this.storeLog(entry)
    
    console.error(this.formatMessage(message, context), error, context?.metadata)
  }

  /**
   * Fatal level logging - critical errors
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevelEnum.FATAL, message, context, error)
    this.storeLog(entry)
    
    console.error(`[FATAL] ${this.formatMessage(message, context)}`, error, context?.metadata)
  }

  /**
   * Group related log messages
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(count?: number): LogEntry[] {
    if (count) {
      return this.logs.slice(-count)
    }
    return [...this.logs]
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Export singleton instance
export const logger = new Logger()

// Legacy compatibility exports
export default {
  log: (message: string, ...args: unknown[]) => logger.debug(message, { metadata: { args } }),
  info: (message: string, ...args: unknown[]) => logger.info(message, { metadata: { args } }),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, { metadata: { args } }),
  error: (message: string, ...args: unknown[]) => {
    const error = args.find(arg => arg instanceof Error) as Error | undefined
    const metadata = args.filter(arg => !(arg instanceof Error))
    logger.error(message, error, { metadata: { args: metadata } })
  },
  debug: (message: string, ...args: unknown[]) => logger.debug(message, { metadata: { args } }),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
}

