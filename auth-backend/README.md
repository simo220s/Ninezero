# Node.js JWT Authentication Backend

RESTful authentication backend service for the Saudi English Club application. Built with Node.js, Express, and TypeScript, connecting to Supabase PostgreSQL database.

## Features

- 🔐 JWT-based authentication (access & refresh tokens)
- 👤 User registration and login
- 🔑 Password reset functionality
- ✉️ Email verification
- 🛡️ Rate limiting and security headers
- 📝 Request logging with Winston
- 🗄️ Supabase PostgreSQL integration
- 🌍 Arabic error messages
- 🔒 HTTPS enforcement in production
- 📊 Health check and metrics endpoints

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Language**: TypeScript

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account with PostgreSQL database
- Environment variables configured

## Installation

1. **Clone the repository**
   ```bash
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure all required variables (see Environment Variables section below).

4. **Run database migrations**
   
   Apply migrations using Supabase MCP tools:
   ```bash
   # Use mcp_supabase_apply_migration for each migration file
   # Or run them manually in Supabase SQL Editor
   ```
   
   Migrations to apply (in order):
   - `migrations/001_add_password_hash_column.sql`
   - `migrations/002_create_token_blacklist.sql`
   - `migrations/003_create_password_reset_tokens.sql`
   - `migrations/004_create_email_verification_tokens.sql`

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_WINDOW_MS=900000
REGISTER_RATE_LIMIT_MAX=3
REGISTER_RATE_LIMIT_WINDOW_MS=3600000

# Logging
LOG_LEVEL=info
LOG_TO_FILE=false
```

### Required Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS)
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "أحمد",
  "lastName": "محمد",
  "role": "student"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "أحمد",
      "lastName": "محمد",
      "role": "student",
      "isEmailVerified": false,
      "isTrial": true
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Health & Monitoring

#### Health Check
```http
GET /health
```

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-24T20:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected"
  },
  "responseTime": "15ms"
}
```

#### Metrics
```http
GET /metrics
```

## Database Migrations

### Using Supabase MCP Tools

The project uses Supabase MCP (Model Context Protocol) tools for database management:

1. **Apply Migration**:
   ```typescript
   mcp_supabase_apply_migration({
     name: "migration_name",
     query: "SQL_QUERY_HERE"
   })
   ```

2. **Verify Schema**:
   ```typescript
   mcp_supabase_list_tables({
     schemas: ["public"]
   })
   ```

3. **Test Queries**:
   ```typescript
   mcp_supabase_execute_sql({
     query: "SELECT * FROM profiles LIMIT 1"
   })
   ```

### Manual Migration

Alternatively, run migrations manually in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy content from each migration file
3. Execute in order (001, 002, 003, 004)

## Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run in production mode
npm start

# Type check
npm run lint
```

## Security Considerations

### Production Checklist

- ✅ Use HTTPS only
- ✅ Set strong JWT_SECRET (min 32 characters)
- ✅ Configure proper CORS origins
- ✅ Enable rate limiting
- ✅ Use environment variables for secrets
- ✅ Enable request logging
- ✅ Set up error monitoring
- ✅ Configure database connection pooling
- ✅ Enable HSTS headers
- ✅ Use Helmet for security headers

### Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Short-lived access tokens (15min), longer refresh tokens (7 days)
- **Rate Limiting**: Prevents brute force attacks
- **Token Blacklisting**: Invalidates tokens on logout
- **CORS**: Restricts cross-origin requests
- **Helmet**: Sets security HTTP headers
- **HTTPS Enforcement**: Redirects HTTP to HTTPS in production
- **Input Validation**: Zod schemas validate all inputs

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": {}
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_EXISTS` - Email already registered
- `TOKEN_EXPIRED` - JWT token expired
- `INVALID_TOKEN` - Invalid JWT token
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Input validation failed
- `SERVER_ERROR` - Internal server error

## Logging

Logs are written to:
- Console (always)
- `logs/error.log` (errors only, production)
- `logs/combined.log` (all logs, production)

Log levels: ERROR, WARN, INFO, DEBUG

## Project Structure

```
auth-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── supabase.ts
│   ├── controllers/     # Route handlers
│   │   └── auth.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── https.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── request-logger.middleware.ts
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.ts
│   │   └── health.routes.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   └── user.service.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   └── responses.ts
│   ├── validators/      # Zod schemas
│   │   └── auth.validators.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── migrations/          # Database migrations
├── logs/                # Log files
├── .env.example         # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC

## Support

For issues or questions, please contact the development team.
