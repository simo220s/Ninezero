# Environment Configuration

This module provides environment variable validation and type-safe access to configuration values.

## Features

- ✅ Validates required environment variables on application startup
- ✅ Provides clear error messages for missing or invalid variables
- ✅ Type-safe access to environment configuration
- ✅ Caches validated configuration for performance
- ✅ Supports both required and optional variables with defaults

## Usage

### Basic Usage

```typescript
import { env } from '@/lib/config';

// Access Supabase configuration
const supabaseUrl = env.supabase.url;
const supabaseKey = env.supabase.anonKey;

// Access API configuration
const apiUrl = env.api.url;
const apiTimeout = env.api.timeout;

// Check environment
if (env.isDevelopment) {
  console.log('Running in development mode');
}
```

### Manual Validation

```typescript
import { validateEnvironment, getMissingVariables } from '@/lib/config';

// Validate environment
const validation = validateEnvironment();

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.error('Missing variables:', getMissingVariables());
}

// Check warnings
if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings);
}
```

### Get Full Configuration

```typescript
import { getValidatedEnv } from '@/lib/config';

const config = getValidatedEnv();

console.log('Supabase URL:', config.supabase.url);
console.log('API URL:', config.api.url);
console.log('Features:', config.features);
```

## Required Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Optional Environment Variables

The following variables are optional and have defaults:

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000`)
- `VITE_API_TIMEOUT` - API request timeout in ms (default: `30000`)
- `VITE_LARAVEL_API_URL` - Laravel API URL (default: `http://localhost:8000/api`)
- `VITE_USE_LARAVEL_BACKEND` - Enable Laravel backend (default: `false`)
- `VITE_USE_SUPABASE_BACKUP` - Use Supabase as backup (default: `true`)
- `VITE_APP_NAME` - Application name (default: `Saudi English Club`)
- `VITE_APP_URL` - Application URL (default: `http://localhost:5173`)
- `VITE_FEATURE_TRIAL_CONVERSION` - Enable trial conversion (default: `true`)
- `VITE_FEATURE_REALTIME_NOTIFICATIONS` - Enable realtime notifications (default: `true`)
- `VITE_FEATURE_ADMIN_DASHBOARD` - Enable admin dashboard (default: `true`)
- `VITE_GA_TRACKING_ID` - Google Analytics tracking ID
- `VITE_FB_PIXEL_ID` - Facebook Pixel ID
- `VITE_SENTRY_DSN` - Sentry DSN for error tracking
- `VITE_SENTRY_ENVIRONMENT` - Sentry environment (default: `development`)
- `VITE_PERFORMANCE_MONITORING` - Enable performance monitoring (default: `true`)
- `VITE_REPORT_WEB_VITALS` - Report web vitals (default: `true`)

## Validation Rules

### VITE_SUPABASE_URL
- Must be a valid URL
- Must contain `supabase.co` or `localhost`

### VITE_SUPABASE_ANON_KEY
- Must be a valid JWT token (3 parts separated by dots)

### VITE_API_URL
- Must be a valid URL (if provided)

### VITE_API_TIMEOUT
- Must be a valid number (if provided)

## Error Handling

If validation fails on application startup, the app will display a user-friendly error message with:

- List of missing required variables
- Instructions on how to fix the issue
- Reference to `.env.production.example`

## Example .env.local

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_API_URL=http://localhost:3000
VITE_LARAVEL_API_URL=http://localhost:8000/api
VITE_USE_LARAVEL_BACKEND=false
VITE_USE_SUPABASE_BACKUP=true
```

## Type Safety

The `env` object provides type-safe access to all configuration values:

```typescript
// TypeScript knows the types
const url: string = env.supabase.url;
const timeout: number = env.api.timeout;
const enabled: boolean = env.features.trialConversion;
const isDev: boolean = env.isDevelopment;
```

## Performance

The environment configuration is validated once on application startup and cached for subsequent access. This ensures:

- No repeated validation overhead
- Fast access to configuration values
- Consistent configuration throughout the app lifecycle
