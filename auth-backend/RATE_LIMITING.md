# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation for the Saudi English Club LMS API. Rate limiting is implemented to prevent abuse, protect against brute force attacks, and ensure fair resource usage across all users.

## Implementation

Rate limiting is implemented using the `express-rate-limit` package with in-memory storage. For production deployments with multiple servers, consider using a shared store like Redis.

## Rate Limit Policies

### 1. General API Rate Limit
- **Endpoint**: All `/api/*` routes
- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: Prevent general API abuse
- **Configuration**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`

### 2. Authentication Rate Limits

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Limit**: 5 attempts per 15 minutes per IP
- **Purpose**: Prevent brute force password attacks
- **Configuration**: `LOGIN_RATE_LIMIT_MAX`, `LOGIN_RATE_LIMIT_WINDOW_MS`

#### Registration
- **Endpoint**: `POST /api/auth/register`
- **Limit**: 3 attempts per hour per IP
- **Purpose**: Prevent spam account creation
- **Configuration**: `REGISTER_RATE_LIMIT_MAX`, `REGISTER_RATE_LIMIT_WINDOW_MS`

#### Password Reset
- **Endpoint**: `POST /api/auth/forgot-password`
- **Limit**: 3 attempts per hour per IP
- **Purpose**: Prevent email flooding and abuse
- **Configuration**: Same as registration

### 3. Admin Operations Rate Limits

#### General Admin Operations
- **Endpoint**: All `/api/admin/*` routes
- **Limit**: 50 requests per 15 minutes per user
- **Purpose**: Prevent excessive admin operations
- **Applied to**: All admin dashboard operations

#### Credit Adjustments
- **Endpoint**: `POST /api/admin/users/:id/adjust-credits`
- **Limit**: 10 requests per hour per admin
- **Purpose**: Prevent accidental or malicious credit manipulation
- **Additional Protection**: Audit logging of all credit adjustments

### 4. Class Management Rate Limits

#### Class Scheduling
- **Endpoint**: Class scheduling operations
- **Limit**: 20 requests per hour per user
- **Purpose**: Prevent excessive class creation/modification
- **Applied to**: Teacher class scheduling endpoints

### 5. Notification Rate Limits

#### Notification Preferences
- **Endpoint**: `PUT /api/notifications/preferences`
- **Limit**: 10 requests per hour per user
- **Purpose**: Prevent excessive preference updates

### 6. Conversion Operations Rate Limits

#### Manual Conversions
- **Endpoint**: `POST /api/conversion/manual/:userId`, `POST /api/conversion/process-trials`
- **Limit**: 20 requests per hour per admin
- **Purpose**: Prevent excessive conversion operations

### 7. File Upload Rate Limits

#### File Uploads
- **Endpoint**: File upload endpoints
- **Limit**: 5 uploads per hour per user
- **Purpose**: Prevent storage abuse and excessive bandwidth usage

## Response Format

When a rate limit is exceeded, the API returns a 429 (Too Many Requests) status code with the following response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "تم تجاوز عدد الطلبات المسموحة. يرجى المحاولة لاحقاً"
  }
}
```

## Response Headers

Rate limit information is included in response headers:

- `RateLimit-Limit`: Maximum number of requests allowed in the window
- `RateLimit-Remaining`: Number of requests remaining in the current window
- `RateLimit-Reset`: Time when the rate limit window resets (Unix timestamp)

## Configuration

All rate limits can be configured via environment variables in the `.env` file:

```env
# General API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100          # 100 requests

# Login Rate Limiting
LOGIN_RATE_LIMIT_MAX=5               # 5 attempts
LOGIN_RATE_LIMIT_WINDOW_MS=900000    # 15 minutes

# Registration Rate Limiting
REGISTER_RATE_LIMIT_MAX=3            # 3 attempts
REGISTER_RATE_LIMIT_WINDOW_MS=3600000 # 1 hour
```

## Implementation Details

### Middleware Files

1. **`src/middleware/rate-limit.middleware.ts`**
   - Contains all rate limiter configurations
   - Exports rate limiters for use in routes

2. **Route Files**
   - Apply appropriate rate limiters to sensitive endpoints
   - Combine with authentication and authorization middleware

### Example Usage

```typescript
import { loginRateLimiter } from '../middleware/rate-limit.middleware';

router.post('/login', loginRateLimiter, login);
```

## Security Considerations

### IP-Based Limiting
- Rate limits are primarily IP-based
- Consider proxy configurations in production (trust proxy settings)
- May need adjustment for users behind NAT/corporate proxies

### User-Based Limiting
- Some endpoints use user-based limiting (after authentication)
- More accurate for authenticated operations
- Prevents single user from abusing multiple IPs

### Bypass for Trusted IPs
- Consider implementing IP whitelist for monitoring services
- Admin operations from trusted IPs may need higher limits

## Production Recommendations

### 1. Use Redis Store
For multi-server deployments, use a shared Redis store:

```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

export const loginRateLimiter = rateLimit({
  store: new RedisStore({
    client,
    prefix: 'rl:login:',
  }),
  // ... other options
});
```

### 2. Monitor Rate Limit Hits
- Log rate limit violations
- Alert on excessive rate limit hits from single IPs
- Analyze patterns to adjust limits

### 3. Implement Progressive Delays
Consider implementing progressive delays for repeated violations:
- First violation: Standard rate limit
- Repeated violations: Exponentially increasing delays

### 4. DDoS Protection
- Rate limiting alone is not sufficient for DDoS protection
- Use CDN/WAF services (Cloudflare, AWS WAF) for additional protection
- Implement connection limits at load balancer level

## Testing

### Manual Testing
```bash
# Test login rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

### Automated Testing
- Unit tests for rate limiter configuration
- Integration tests for rate limit enforcement
- Load tests to verify limits under high traffic

## Monitoring

### Metrics to Track
1. Rate limit hit rate per endpoint
2. Most frequently limited IPs
3. Time-of-day patterns for rate limit hits
4. False positive rate (legitimate users hitting limits)

### Alerts
- Alert when rate limit hit rate exceeds threshold
- Alert on coordinated attacks (multiple IPs hitting limits simultaneously)
- Alert on legitimate user patterns that may need limit adjustments

## Troubleshooting

### Users Reporting "Too Many Requests"

1. **Check if legitimate**
   - Review user's request pattern
   - Check if they're using automation/scripts
   - Verify they're not behind a shared IP

2. **Adjust limits if needed**
   - Increase limits for specific endpoints
   - Implement user-based limits instead of IP-based
   - Add IP whitelist for known good actors

3. **Provide clear error messages**
   - Include retry-after information
   - Explain rate limits in API documentation
   - Provide contact information for limit increases

## Future Enhancements

1. **Dynamic Rate Limiting**
   - Adjust limits based on user tier/subscription
   - Increase limits for verified users
   - Implement burst allowances

2. **Distributed Rate Limiting**
   - Implement Redis-based rate limiting for multi-server deployments
   - Use consistent hashing for distributed counters

3. **Advanced Patterns**
   - Implement token bucket algorithm for smoother rate limiting
   - Add sliding window counters for more accurate limiting
   - Implement rate limiting by user role

4. **Analytics Dashboard**
   - Real-time rate limit monitoring
   - Historical rate limit data
   - Automated limit adjustment recommendations

## References

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [OWASP Rate Limiting Guide](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [RFC 6585 - Additional HTTP Status Codes](https://tools.ietf.org/html/rfc6585)
