import logger from './logger';

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  jwt: {
    secret: string;
    accessExpiration: string;
    refreshExpiration: string;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    loginMax: number;
    loginWindowMs: number;
    registerMax: number;
    registerWindowMs: number;
  };
  logging: {
    level: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromEmail: string;
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
 * Validate JWT token format
 */
const isValidJwtKey = (key: string): boolean => {
  // JWT format: header.payload.signature
  const parts = key.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Perform comprehensive environment validation
 */
const performValidation = (): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  // Check required variables exist
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push({
        variable: varName,
        message: `${varName} is required but not defined`,
        severity: 'error',
      });
    }
  });

  // Validate SUPABASE_URL
  if (process.env.SUPABASE_URL) {
    if (!isValidSupabaseUrl(process.env.SUPABASE_URL)) {
      errors.push({
        variable: 'SUPABASE_URL',
        message: 'SUPABASE_URL must be a valid Supabase URL',
        severity: 'error',
      });
    }
  }

  // Validate SUPABASE_SERVICE_ROLE_KEY
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!isValidJwtKey(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      errors.push({
        variable: 'SUPABASE_SERVICE_ROLE_KEY',
        message: 'SUPABASE_SERVICE_ROLE_KEY must be a valid JWT token',
        severity: 'error',
      });
    }
  }

  // Validate JWT_SECRET
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push({
        variable: 'JWT_SECRET',
        message: 'JWT_SECRET must be at least 32 characters long',
        severity: 'error',
      });
    }
    
    // Warn about weak secrets in production
    if (process.env.NODE_ENV === 'production') {
      const weakPatterns = ['secret', 'password', 'test', '123', 'abc'];
      const lowerSecret = process.env.JWT_SECRET.toLowerCase();
      if (weakPatterns.some(pattern => lowerSecret.includes(pattern))) {
        warnings.push({
          variable: 'JWT_SECRET',
          message: 'JWT_SECRET appears to be weak. Use a strong random string in production.',
          severity: 'warning',
        });
      }
    }
  }

  // Validate PORT
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push({
      variable: 'PORT',
      message: 'PORT must be a valid number between 1 and 65535',
      severity: 'error',
    });
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!validEnvs.includes(nodeEnv)) {
    warnings.push({
      variable: 'NODE_ENV',
      message: `Invalid NODE_ENV "${nodeEnv}", defaulting to "development"`,
      severity: 'warning',
    });
  }

  // Validate CORS_ORIGINS
  if (process.env.CORS_ORIGINS) {
    const origins = process.env.CORS_ORIGINS.split(',').map(o => o.trim());
    origins.forEach(origin => {
      if (!isValidUrl(origin)) {
        warnings.push({
          variable: 'CORS_ORIGINS',
          message: `Invalid CORS origin: ${origin}`,
          severity: 'warning',
        });
      }
    });
  }

  // Validate rate limit values
  const rateLimitVars = [
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'LOGIN_RATE_LIMIT_MAX',
    'LOGIN_RATE_LIMIT_WINDOW_MS',
    'REGISTER_RATE_LIMIT_MAX',
    'REGISTER_RATE_LIMIT_WINDOW_MS',
  ];

  rateLimitVars.forEach(varName => {
    const value = process.env[varName];
    if (value && isNaN(parseInt(value, 10))) {
      warnings.push({
        variable: varName,
        message: `${varName} must be a number, using default`,
        severity: 'warning',
      });
    }
  });

  // Validate SMTP configuration (optional but warn if incomplete)
  const smtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
  const smtpConfigured = smtpVars.some(v => process.env[v]);
  const allSmtpConfigured = smtpVars.every(v => process.env[v]);

  if (smtpConfigured && !allSmtpConfigured) {
    warnings.push({
      variable: 'SMTP',
      message: 'SMTP is partially configured. Email notifications may not work.',
      severity: 'warning',
    });
  }

  // Validate SMTP_PORT
  if (process.env.SMTP_PORT) {
    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
    if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      warnings.push({
        variable: 'SMTP_PORT',
        message: 'SMTP_PORT must be a valid port number',
        severity: 'warning',
      });
    }
  }

  // Validate SMTP_FROM_EMAIL
  if (process.env.SMTP_FROM_EMAIL && !isValidEmail(process.env.SMTP_FROM_EMAIL)) {
    warnings.push({
      variable: 'SMTP_FROM_EMAIL',
      message: 'SMTP_FROM_EMAIL must be a valid email address',
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
 * Validate and parse environment variables
 */
export const validateEnv = (): EnvConfig => {
  const validation = performValidation();

  // Log warnings
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      logger.warn(`Environment warning: ${warning.message}`, {
        variable: warning.variable,
      });
    });
  }

  // If there are validation errors, throw
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `  - ${e.message}`).join('\n');
    const errorMessage = `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file and ensure all required variables are set correctly.`;
    
    logger.error('Environment validation failed', {
      errors: validation.errors,
    });
    
    throw new Error(errorMessage);
  }

  // Parse and return configuration
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);

  const config: EnvConfig = {
    nodeEnv: (nodeEnv as 'development' | 'production' | 'test') || 'development',
    port,
    supabase: {
      url: process.env.SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    cors: {
      origins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
        : ['http://localhost:5173', 'http://localhost:3000'],
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      loginMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
      loginWindowMs: parseInt(
        process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000',
        10
      ),
      registerMax: parseInt(process.env.REGISTER_RATE_LIMIT_MAX || '3', 10),
      registerWindowMs: parseInt(
        process.env.REGISTER_RATE_LIMIT_WINDOW_MS || '3600000',
        10
      ),
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      fromName: process.env.SMTP_FROM_NAME || 'Saudi English Club',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@saudienglishclub.com',
    },
  };

  logger.info('Environment variables validated successfully', {
    nodeEnv: config.nodeEnv,
    port: config.port,
    corsOrigins: config.cors.origins.length,
    smtpConfigured: !!(config.smtp.user && config.smtp.password),
  });

  return config;
};

/**
 * Get validated environment configuration
 * Singleton pattern - validates once and caches result
 */
let cachedConfig: EnvConfig | null = null;

export const getEnvConfig = (): EnvConfig => {
  if (!cachedConfig) {
    cachedConfig = validateEnv();
  }
  return cachedConfig;
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return getEnvConfig().nodeEnv === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return getEnvConfig().nodeEnv === 'development';
};

/**
 * Check if running in test
 */
export const isTest = (): boolean => {
  return getEnvConfig().nodeEnv === 'test';
};

/**
 * Get missing required variables
 */
export const getMissingVariables = (): string[] => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  return requiredVars.filter(varName => !process.env[varName]);
};

/**
 * Check if environment is properly configured
 */
export const isEnvironmentConfigured = (): boolean => {
  return getMissingVariables().length === 0;
};

/**
 * Get environment validation status
 */
export const getValidationStatus = (): ValidationResult => {
  return performValidation();
};
