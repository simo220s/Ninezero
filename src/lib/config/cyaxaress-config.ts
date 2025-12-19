/**
 * Cyaxaress Laravel LMS Configuration
 * 
 * Configuration for integrating with the existing Cyaxaress Laravel LMS
 * Environment variables should be set in .env file
 */

export interface CyaxaressConfig {
  // Laravel API Configuration
  apiBaseUrl: string
  apiTimeout: number
  
  // Authentication
  authTokenKey: string
  authRefreshInterval: number // milliseconds
  
  // Feature Flags
  useLaravelBackend: boolean
  useSupabaseBackup: boolean
  
  // Laravel Module Paths
  modules: {
    user: string
    course: string
    payment: string
    dashboard: string
    media: string
    rolePermissions: string
  }
  
  // Default Values
  defaults: {
    lessonDuration: number // minutes
    trialLessonCredits: number
    regularLessonCredits: number
    currency: string
    locale: string
  }
}

// Load configuration from environment variables
const config: CyaxaressConfig = {
  // Laravel API Configuration
  apiBaseUrl: import.meta.env.VITE_LARAVEL_API_URL || 'http://localhost:8000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Authentication
  authTokenKey: 'cyaxaress_auth_token',
  authRefreshInterval: 3600000, // 1 hour
  
  // Feature Flags
  useLaravelBackend: import.meta.env.VITE_USE_LARAVEL_BACKEND === 'true',
  useSupabaseBackup: import.meta.env.VITE_USE_SUPABASE_BACKUP !== 'false', // default true
  
  // Laravel Module Paths (matching Cyaxaress namespace structure)
  modules: {
    user: '/Cyaxaress/User',
    course: '/Cyaxaress/Course',
    payment: '/Cyaxaress/Payment',
    dashboard: '/Cyaxaress/Dashboard',
    media: '/Cyaxaress/Media',
    rolePermissions: '/Cyaxaress/RolePermissions',
  },
  
  // Default Values for English Teaching Business
  defaults: {
    lessonDuration: 60, // 60 minutes default
    trialLessonCredits: 0.5,
    regularLessonCredits: 1.0,
    currency: 'SAR', // Saudi Riyal
    locale: 'ar-SA', // Arabic (Saudi Arabia)
  },
}

/**
 * Get API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  return `${config.apiBaseUrl}${endpoint}`
}

/**
 * Check if Laravel backend is enabled
 */
export function isLaravelBackendEnabled(): boolean {
  return config.useLaravelBackend
}

/**
 * Check if Supabase backup is enabled
 */
export function isSupabaseBackupEnabled(): boolean {
  return config.useSupabaseBackup
}

/**
 * Get module path
 */
export function getModulePath(module: keyof CyaxaressConfig['modules']): string {
  return config.modules[module]
}

/**
 * Get default lesson duration
 */
export function getDefaultLessonDuration(): number {
  return config.defaults.lessonDuration
}

/**
 * Get trial lesson credits
 */
export function getTrialLessonCredits(): number {
  return config.defaults.trialLessonCredits
}

/**
 * Get regular lesson credits
 */
export function getRegularLessonCredits(): number {
  return config.defaults.regularLessonCredits
}

/**
 * Get currency code
 */
export function getCurrency(): string {
  return config.defaults.currency
}

/**
 * Get locale
 */
export function getLocale(): string {
  return config.defaults.locale
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.apiBaseUrl) {
    errors.push('API Base URL is not configured')
  }
  
  if (config.apiTimeout < 1000) {
    errors.push('API timeout is too low (minimum 1000ms)')
  }
  
  if (config.defaults.lessonDuration < 15) {
    errors.push('Default lesson duration is too short (minimum 15 minutes)')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Validate configuration on load
const validation = validateConfig()
if (!validation.valid) {
  console.warn('Cyaxaress configuration validation failed:', validation.errors)
}

export default config
