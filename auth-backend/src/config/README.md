# Backend Environment Configuration

This module provides comprehensive environment variable validation and type-safe access to configuration values for the backend service.

## Features

- ✅ Validates required environment variables on server startup
- ✅ Provides detailed error messages for missing or invalid variables
- ✅ Type-safe access to environment configuration
- ✅ Caches validated configuration for performance
- ✅ Validates URL formats, JWT tokens, email addresses, and numeric values
- ✅ Warns about weak secrets in production
- ✅ Supports both required and optional variables with defaults

## Usage

### Basic Usage

```typescript
import { getEnvConfig } from './config/env';

// Get validated configuration
const config = getEnvConfig();

// Access configuration values
const supabaseUrl = config.supabase.url;
const jwtSecret = config.jwt.secret;
const port = config.port;

// Check environment
if (config.nodeEnv === 'production') {
  console.log('Running in production mode');
}
```

### Check Configuration Status

```typescript
import { 
  isEnvironmentConfigured, 
  getMissingVariables,
  getValidationStatus 
} from './config/env';

// Check if all required variables are present
if (!isEnvironmentConfigured()) {
  const missing = getMissingVariables();
  console.error('Missing variables:', missing);
}

// Get full validation status
const status = getValidationStatus();
console.log('Valid:', status.isValid);
console.log('Errors:', status.errors);
console.log('Warnings:', status.warnings);
```

### Helper Functions

```typescript
import { isProduction, isDevelopment, isTest } from './config/env';

if (isProduction()) {
  // Production-specific logic
}

if (isDevelopment()) {
  // Development-specific logic
}
```

## Required Environment Variables

The following environment variables are required:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (JWT token)
- `JWT_SECRET` - Secret for signing JWT tokens (minimum 32 characters)

## Optional Environment Variables

The following variables are optional and have defaults:

- `NODE_ENV` - Node environment (default: `development`)
- `PORT` - Server port (default: `3000`)
- `JWT_ACCESS_EXPIRATION` - Access token expiration (default: `15m`)
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration (default: `7d`)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (default: `http://localhost:5173,http://localhost:3000`)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in ms (default: `900000`)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: `100`)
- `LOGIN_RATE_LIMIT_MAX` - Max login attempts (default: `5`)
- `LOGIN_RATE_LIMIT_WINDOW_MS` - Login rate limit window (default: `900000`)
- `REGISTER_RATE_LIMIT_MAX` - Max registration attempts (default: `3`)
- `REGISTER_RATE_LIMIT_WINDOW_MS` - Registration rate limit window (default: `3600000`)
- `LOG_LEVEL` - Logging level (default: `info`)
- `SMTP_HOST` - SMTP server host (default: `smtp.gmail.com`)
- `SMTP_PORT` - SMTP server port (default: `587`)
- `SMTP_SECURE` - Use TLS (default: `false`)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM_NAME` - Email sender name (default: `Saudi English Club`)
- `SMTP_FROM_EMAIL` - Email sender address (default: `noreply@saudienglishclub.com`)

## Validation Rules

### SUPABASE_URL
- Must be a valid URL
- Must contain `supabase.co` or `localhost`

### SUPABASE_SERVICE_ROLE_KEY
- Must be a valid JWT token (3 parts separated by dots)

### JWT_SECRET
- Must be at least 32 characters long
- Warns if contains weak patterns in production (e.g., "secret", "password", "test")

### PORT
- Must be a valid number between 1 and 65535

### NODE_ENV
- Must be one of: `development`, `production`, `test`
- Defaults to `development` if invalid

### CORS_ORIGINS
- Each origin must be a valid URL

### Rate Limit Variables
- All rate limit variables must be valid numbers

### SMTP_PORT
- Must be a valid port number between 1 and 65535

### SMTP_FROM_EMAIL
- Must be a valid email address format

## Error Handling

If validation fails on server startup, the server will:

1. Log detailed error messages with the specific issues
2. Throw an error with a formatted message listing all validation errors
3. Prevent the server from starting

Example error output:

```
Environment validation failed:
  - SUPABASE_URL is required but not defined
  - JWT_SECRET must be at least 32 characters long
  - PORT must be a valid number between 1 and 65535

Please check your .env file and ensure all required variables are set correctly.
```

## Warnings

The validator will log warnings for:

- Invalid NODE_ENV values (will default to development)
- Invalid CORS origins
- Invalid rate limit values (will use defaults)
- Partially configured SMTP (some variables set, others missing)
- Invalid SMTP port or email address
- Weak JWT secrets in production

## Example .env

```bash
# Required
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Server
PORT=3000

# CORS
CORS_ORIGINS=https://saudienglishclub.com,https://www.saudienglishclub.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_WINDOW_MS=900000

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Saudi English Club
SMTP_FROM_EMAIL=noreply@saudienglishclub.com
```

## Type Safety

The configuration object is fully typed:

```typescript
interface EnvConfig {
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
```

## Performance

The environment configuration is validated once on server startup and cached for subsequent access. This ensures:

- No repeated validation overhead
- Fast access to configuration values
- Consistent configuration throughout the server lifecycle

## Security Considerations

1. **Never commit .env files** - Use `.env.example` as a template
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 64`
3. **Rotate secrets regularly** - Especially in production
4. **Limit CORS origins** - Only allow trusted domains
5. **Use environment-specific configs** - Different values for dev/staging/prod
