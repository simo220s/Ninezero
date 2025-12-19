# Utility Functions Reference

This directory contains centralized utility functions to avoid code duplication and improve maintainability.

## Available Utilities

### 1. Validation (`validation.ts`)

Centralized validation functions for common patterns.

```typescript
import { validateUserId, validatePercentage, validateArray } from '@/lib/utils/validation';

// Validate UUID
const result = validateUserId(userId);
if (!result.valid) {
  console.error(result.error);
}

// Validate percentage
const percentResult = validatePercentage(discount, 1, 100);

// Validate array
const arrayResult = validateArray(items, 'Items', 1, 10);
```

**Available Functions**:
- `validateUUID(id, fieldName)` - Generic UUID validation
- `validateUserId(userId)` - User ID validation
- `validateSubscriptionId(subscriptionId)` - Subscription ID validation
- `validatePercentage(percentage, min, max)` - Percentage validation
- `validateDurationMonths(months, min, max)` - Duration validation
- `validateRequiredString(value, fieldName, minLength)` - String validation
- `validateArray(array, fieldName, minLength, maxLength)` - Array validation

### 2. Date Helpers (`date-helpers.ts`)

Centralized date manipulation and formatting functions.

```typescript
import { getMonthKey, getArabicMonthName, addMonths } from '@/lib/utils/date-helpers';

// Generate month key for grouping
const monthKey = getMonthKey(new Date());
// Returns: "2024-0" for January 2024

// Get Arabic month name
const monthName = getArabicMonthName(new Date());
// Returns: "يناير"

// Add months to a date
const futureDate = addMonths(new Date(), 3);
```

**Available Functions**:
- `getMonthKey(date)` - Generate sortable month key
- `getArabicMonthName(date)` - Get Arabic month name
- `getEnglishMonthName(date)` - Get English month name
- `getMonthName(date, locale)` - Get month name with locale
- `addMonths(date, months)` - Add months to date
- `addHours(date, hours)` - Add hours to date
- `addDays(date, days)` - Add days to date
- `getStartDateForRange(range, fromDate)` - Get start date for time range
- `getStartOfMonth(date)` - Get first day of month
- `getEndOfMonth(date)` - Get last day of month
- `toISODateString(date)` - Format to ISO date string
- `toISODateTimeString(date)` - Format to ISO datetime string
- `isDateInPast(date, referenceDate)` - Check if date is in past
- `isDateInFuture(date, referenceDate)` - Check if date is in future

**Available Constants**:
- `ARABIC_MONTH_NAMES` - Array of Arabic month names
- `ENGLISH_MONTH_NAMES` - Array of English month names

### 3. API Client (`api-client.ts`)

Centralized API request handling with authentication.

```typescript
import { apiGet, apiPost, apiPut } from '@/lib/utils/api-client';

// GET request
const response = await apiGet<User[]>('/api/users');
if (response.success) {
  console.log(response.data);
}

// POST request
const createResponse = await apiPost<User>('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// PUT request
const updateResponse = await apiPut<User>('/api/users/123', {
  name: 'John Updated'
});
```

**Available Functions**:
- `getApiUrl()` - Get API base URL
- `getAuthHeaders()` - Get authentication headers
- `getStandardHeaders()` - Get standard headers
- `apiRequest(endpoint, options)` - Generic API request
- `apiGet(endpoint, requiresAuth)` - GET request
- `apiPost(endpoint, body, requiresAuth)` - POST request
- `apiPut(endpoint, body, requiresAuth)` - PUT request
- `apiDelete(endpoint, requiresAuth)` - DELETE request
- `apiPatch(endpoint, body, requiresAuth)` - PATCH request

## Usage Guidelines

### When to Use These Utilities

1. **Validation**: Always use centralized validation for:
   - UUID/ID validation
   - Percentage validation
   - Array length validation
   - Required string validation

2. **Date Helpers**: Use for:
   - Grouping data by month
   - Displaying month names
   - Date calculations (adding months/hours/days)
   - Date formatting

3. **API Client**: Use for:
   - All API requests from hooks
   - Authenticated requests
   - Consistent error handling

### Benefits

- **Consistency**: Same validation/formatting across all code
- **Maintainability**: Update logic in one place
- **Type Safety**: All functions are fully typed
- **Documentation**: Comprehensive JSDoc comments
- **Testing**: Utilities can be unit tested independently

### Migration Guide

If you find duplicate code patterns:

1. Check if a utility already exists
2. If not, consider adding it to the appropriate utility file
3. Update existing code to use the utility
4. Document the utility with JSDoc comments

## Examples

### Example 1: Service Validation

**Before**:
```typescript
// Duplicate validation in multiple services
function validateUserId(userId: string) {
  if (!userId || typeof userId !== 'string') {
    return { valid: false, error: 'Valid user ID is required' };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return { valid: false, error: 'Invalid user ID format' };
  }
  return { valid: true };
}
```

**After**:
```typescript
import { validateUserId } from '@/lib/utils/validation';

// Use centralized validation
const validation = validateUserId(userId);
if (!validation.valid) {
  return { success: false, error: validation.error };
}
```

### Example 2: Date Grouping

**Before**:
```typescript
// Duplicate month key generation
const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
const monthNames = ['يناير', 'فبراير', ...];
const monthName = monthNames[date.getMonth()];
```

**After**:
```typescript
import { getMonthKey, getArabicMonthName } from '@/lib/utils/date-helpers';

const monthKey = getMonthKey(date);
const monthName = getArabicMonthName(date);
```

### Example 3: API Requests

**Before**:
```typescript
// Duplicate fetch logic
const API_URL = import.meta.env.VITE_API_URL;
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json',
});

const response = await fetch(`${API_URL}/api/users`, {
  headers: getAuthHeaders(),
});
if (response.ok) {
  const data = await response.json();
  // Handle data
}
```

**After**:
```typescript
import { apiGet } from '@/lib/utils/api-client';

const response = await apiGet<User[]>('/api/users');
if (response.success) {
  // Handle response.data
}
```

## Contributing

When adding new utilities:

1. Add comprehensive JSDoc comments
2. Include usage examples
3. Add proper TypeScript types
4. Export from the default object
5. Update this README
6. Consider adding unit tests

## Related Documentation

- [Validation Utilities](./validation.ts)
- [Date Helpers](./date-helpers.ts)
- [API Client](./api-client.ts)
- [Error Handling](../error-handling/README.md)
- [Logger](./logger.ts)
