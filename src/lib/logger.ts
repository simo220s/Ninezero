/**
 * Production-safe logger utility
 * Logs in development, silent in production
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  }
}

