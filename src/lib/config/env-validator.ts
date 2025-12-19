/**
 * Environment Variable Validator for Frontend
 * 
 * Validates required environment variables on application startup
 * and provides type-safe access to environment configuration.
 */

import { logger } from '../utils/logger';

/**
 * Frontend environment configuration interface
 */
export interface FrontendEnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    url: string;
    timeout: number;
  };
  laravel: {
    apiUrl: string;
    enabled: boolean;
    useSupabaseBackup: boolean;
  };
  app: {
    name: string;
    url: string;
  };
  features: {
    trialConversion: boolean;
    realtimeNotifications: boolean;
    adminDashboard: boolean;
  };
  analytics: {
    gaTrackingId?: string;
    fbPixelId?: string;
  };
  monitoring: {
    sentryDsn?: string;
    sentryEnvironment: string;
    performanceMonitoring: boolean;
    reportWebVitals: boolean;
  };
}

/**
 * Validation error details
 */
interface ValidationError {
  variable: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Required environment variables
 */
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_VARS = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_API_TIMEOUT: '30000',
  VITE_LARAVEL_API_URL: 'http://localhost:8000/api',
  VITE_USE_LARAVEL_BACKEND: 'false',
  VITE_USE_SUPABASE_BACKUP: 'true',
  VITE_APP_NAME: 'Saudi English Club',
  VITE_APP_URL: 'http://localhost:5173',
  VITE_FEATURE_TRIAL_CONVERSION: 'true',
  VITE_FEATURE_REALTIME_NOTIFICATIONS: 'true',
  VITE_FEATURE_ADMIN_DASHBOARD: 'true',
  VITE_SENTRY_ENVIRONMENT: 'development',
  VITE_PERFORMANCE_MONITORING: 'true',
  VITE_REPORT_WEB_VITALS: 'true',
} as const;

/**
 * Get environment variable value
 */
const getEnvVar = (key: string): string | undefined => {
  return import.meta.env[key];
};

/**
 * Validate URL format
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Supabase URL format
 */
const isValidSupabaseUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  return url.includes('supabase.co') || url.includes('localhost');
};

/**
 * Validate Supabase anonymous key format
 */
const isValidSupabaseKey = (key: string): boolean => {
  // JWT format: header.payload.signature
  const parts = key.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Validate all environment variables
 */
export const validateEnvironment = (): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = getEnvVar(varName);
    
    if (!value) {
      errors.push({
        variable: varName,
        message: `${varName} is required but not defined`,
        severity: 'error',
      });
      continue;
    }

    // Validate Supabase URL
    if (varName === 'VITE_SUPABASE_URL') {
      if (!isValidSupabaseUrl(value)) {
        errors.push({
          variable: varName,
          message: `${varName} must be a valid Supabase URL`,
          severity: 'error',
        });
      }
    }

    // Validate Supabase anonymous key
    if (varName === 'VITE_SUPABASE_ANON_KEY') {
      if (!isValidSupabaseKey(value)) {
        errors.push({
          variable: varName,
          message: `${varName} must be a valid JWT token`,
          severity: 'error',
        });
      }
    }
  }

  // Check optional variables and warn about missing ones
  const apiUrl = getEnvVar('VITE_API_URL');
  if (apiUrl && !isValidUrl(apiUrl)) {
    warnings.push({
      variable: 'VITE_API_URL',
      message: 'VITE_API_URL is not a valid URL, using default',
      severity: 'warning',
    });
  }

  const laravelApiUrl = getEnvVar('VITE_LARAVEL_API_URL');
  if (laravelApiUrl && !isValidUrl(laravelApiUrl)) {
    warnings.push({
      variable: 'VITE_LARAVEL_API_URL',
      message: 'VITE_LARAVEL_API_URL is not a valid URL, using default',
      severity: 'warning',
    });
  }

  // Validate numeric values
  const apiTimeout = getEnvVar('VITE_API_TIMEOUT');
  if (apiTimeout && isNaN(parseInt(apiTimeout, 10))) {
    warnings.push({
      variable: 'VITE_API_TIMEOUT',
      message: 'VITE_API_TIMEOUT must be a number, using default',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export const getEnvConfig = (): FrontendEnvConfig => {
  const validation = validateEnvironment();

  // Log warnings
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      logger.warn(`Environment warning: ${warning.message}`);
    });
  }

  // Throw error if validation fails
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `  - ${e.message}`).join('\n');
    const errorMessage = `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file and ensure all required variables are set.`;
    
    logger.error('Environment validation failed');
    throw new Error(errorMessage);
  }

  // Parse and return configuration
  const config: FrontendEnvConfig = {
    supabase: {
      url: getEnvVar('VITE_SUPABASE_URL')!,
      anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY')!,
    },
    api: {
      url: getEnvVar('VITE_API_URL') || OPTIONAL_VARS.VITE_API_URL,
      timeout: parseInt(
        getEnvVar('VITE_API_TIMEOUT') || OPTIONAL_VARS.VITE_API_TIMEOUT,
        10
      ),
    },
    laravel: {
      apiUrl: getEnvVar('VITE_LARAVEL_API_URL') || OPTIONAL_VARS.VITE_LARAVEL_API_URL,
      enabled: getEnvVar('VITE_USE_LARAVEL_BACKEND') === 'true',
      useSupabaseBackup: getEnvVar('VITE_USE_SUPABASE_BACKUP') !== 'false',
    },
    app: {
      name: getEnvVar('VITE_APP_NAME') || OPTIONAL_VARS.VITE_APP_NAME,
      url: getEnvVar('VITE_APP_URL') || OPTIONAL_VARS.VITE_APP_URL,
    },
    features: {
      trialConversion: getEnvVar('VITE_FEATURE_TRIAL_CONVERSION') !== 'false',
      realtimeNotifications: getEnvVar('VITE_FEATURE_REALTIME_NOTIFICATIONS') !== 'false',
      adminDashboard: getEnvVar('VITE_FEATURE_ADMIN_DASHBOARD') !== 'false',
    },
    analytics: {
      gaTrackingId: getEnvVar('VITE_GA_TRACKING_ID'),
      fbPixelId: getEnvVar('VITE_FB_PIXEL_ID'),
    },
    monitoring: {
      sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
      sentryEnvironment: getEnvVar('VITE_SENTRY_ENVIRONMENT') || OPTIONAL_VARS.VITE_SENTRY_ENVIRONMENT,
      performanceMonitoring: getEnvVar('VITE_PERFORMANCE_MONITORING') !== 'false',
      reportWebVitals: getEnvVar('VITE_REPORT_WEB_VITALS') !== 'false',
    },
  };

  return config;
};

/**
 * Cached configuration instance
 */
let cachedConfig: FrontendEnvConfig | null = null;

/**
 * Get environment configuration (cached)
 * Validates once and caches the result
 */
export const getValidatedEnv = (): FrontendEnvConfig => {
  if (!cachedConfig) {
    cachedConfig = getEnvConfig();
  }
  return cachedConfig;
};

/**
 * Type-safe environment variable access
 */
export const env = {
  get supabase() {
    return getValidatedEnv().supabase;
  },
  get api() {
    return getValidatedEnv().api;
  },
  get laravel() {
    return getValidatedEnv().laravel;
  },
  get app() {
    return getValidatedEnv().app;
  },
  get features() {
    return getValidatedEnv().features;
  },
  get analytics() {
    return getValidatedEnv().analytics;
  },
  get monitoring() {
    return getValidatedEnv().monitoring;
  },
  get isDevelopment() {
    return import.meta.env.DEV;
  },
  get isProduction() {
    return import.meta.env.PROD;
  },
};

/**
 * Get missing required variables
 */
export const getMissingVariables = (): string[] => {
  const missing: string[] = [];
  
  for (const varName of REQUIRED_VARS) {
    if (!getEnvVar(varName)) {
      missing.push(varName);
    }
  }
  
  return missing;
};

/**
 * Check if environment is properly configured
 */
export const isEnvironmentConfigured = (): boolean => {
  return getMissingVariables().length === 0;
};
