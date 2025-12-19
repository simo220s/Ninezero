/**
 * Tests for Logger utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Logger, LogLevel } from '../logger'

describe('Logger', () => {
  let logger: Logger
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logger = new Logger()
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should log debug messages', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.debug('Test debug message')
    expect(consoleDebugSpy).toHaveBeenCalled()
  })

  it('should log info messages', () => {
    logger.setLogLevel(LogLevel.INFO)
    logger.info('Test info message')
    expect(consoleInfoSpy).toHaveBeenCalled()
  })

  it('should log warning messages', () => {
    logger.setLogLevel(LogLevel.WARN)
    logger.warn('Test warning message')
    expect(consoleWarnSpy).toHaveBeenCalled()
  })

  it('should log error messages', () => {
    logger.setLogLevel(LogLevel.ERROR)
    logger.error('Test error message', new Error('Test error'))
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should respect log level', () => {
    logger.setLogLevel(LogLevel.ERROR)
    logger.debug('Should not log')
    logger.info('Should not log')
    logger.warn('Should not log')
    
    expect(consoleDebugSpy).not.toHaveBeenCalled()
    expect(consoleInfoSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should store logs in memory', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.info('Test message')
    
    const logs = logger.getLogs()
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[logs.length - 1].message).toBe('Test message')
  })

  it('should filter logs by level', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.info('Info message')
    logger.error('Error message')
    
    const errorLogs = logger.getLogs(LogLevel.ERROR)
    expect(errorLogs.every(log => log.level === LogLevel.ERROR)).toBe(true)
  })

  it('should clear logs', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    logger.info('Test message')
    expect(logger.getLogs().length).toBeGreaterThan(0)
    
    logger.clearLogs()
    expect(logger.getLogs().length).toBe(0)
  })

  it('should limit stored logs', () => {
    logger.setLogLevel(LogLevel.DEBUG)
    
    // Add more than maxLogs (1000)
    for (let i = 0; i < 1100; i++) {
      logger.info(`Message ${i}`)
    }
    
    const logs = logger.getLogs()
    expect(logs.length).toBeLessThanOrEqual(1000)
  })
})
