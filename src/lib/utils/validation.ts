/**
 * Validation Utilities
 * 
 * Centralized validation functions to avoid code duplication.
 * Provides common validation patterns used across services.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * UUID v4 regex pattern for validation
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================================
// Validation Result Type
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// UUID Validation
// ============================================================================

/**
 * Validate UUID format
 * 
 * Checks if a string is a valid UUID v4 format.
 * 
 * @param id - The ID string to validate
 * @param fieldName - Optional field name for error messages (default: "ID")
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateUUID(userId, "User ID");
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateUUID(id: string, fieldName: string = 'ID'): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `Valid ${fieldName} is required` };
  }

  if (!UUID_REGEX.test(id)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  return { valid: true };
}

/**
 * Validate user ID (alias for validateUUID with specific field name)
 * 
 * @param userId - The user ID to validate
 * @returns ValidationResult
 */
export function validateUserId(userId: string): ValidationResult {
  return validateUUID(userId, 'user ID');
}

/**
 * Validate subscription ID (alias for validateUUID with specific field name)
 * 
 * @param subscriptionId - The subscription ID to validate
 * @returns ValidationResult
 */
export function validateSubscriptionId(subscriptionId: string): ValidationResult {
  return validateUUID(subscriptionId, 'subscription ID');
}

// ============================================================================
// Percentage Validation
// ============================================================================

/**
 * Validate percentage value
 * 
 * Ensures a number is within valid percentage range (1-100).
 * 
 * @param percentage - The percentage value to validate
 * @param min - Minimum allowed percentage (default: 1)
 * @param max - Maximum allowed percentage (default: 100)
 * @returns ValidationResult
 * 
 * @example
 * ```typescript
 * const result = validatePercentage(discountPercent);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validatePercentage(
  percentage: number,
  min: number = 1,
  max: number = 100
): ValidationResult {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return { valid: false, error: 'Percentage must be a number' };
  }

  if (percentage < min || percentage > max) {
    return { 
      valid: false, 
      error: `Percentage must be between ${min} and ${max}` 
    };
  }

  return { valid: true };
}

// ============================================================================
// Duration Validation
// ============================================================================

/**
 * Validate duration in months
 * 
 * Ensures a duration is a positive integer within allowed range.
 * 
 * @param months - The duration in months to validate
 * @param min - Minimum allowed months (default: 1)
 * @param max - Maximum allowed months (default: 12)
 * @returns ValidationResult
 * 
 * @example
 * ```typescript
 * const result = validateDurationMonths(durationMonths);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateDurationMonths(
  months: number,
  min: number = 1,
  max: number = 12
): ValidationResult {
  if (typeof months !== 'number' || isNaN(months) || !Number.isInteger(months)) {
    return { valid: false, error: 'Duration must be a whole number' };
  }

  if (months < min || months > max) {
    return { 
      valid: false, 
      error: `Duration must be between ${min} and ${max} months` 
    };
  }

  return { valid: true };
}

// ============================================================================
// String Validation
// ============================================================================

/**
 * Validate required string with minimum length
 * 
 * @param value - The string value to validate
 * @param fieldName - Field name for error messages
 * @param minLength - Minimum required length (default: 1)
 * @returns ValidationResult
 * 
 * @example
 * ```typescript
 * const result = validateRequiredString(reason, "Reason", 3);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateRequiredString(
  value: string,
  fieldName: string,
  minLength: number = 1
): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.trim().length < minLength) {
    return { 
      valid: false, 
      error: `${fieldName} must be at least ${minLength} characters` 
    };
  }

  return { valid: true };
}

// ============================================================================
// Array Validation
// ============================================================================

/**
 * Validate array with length constraints
 * 
 * @param array - The array to validate
 * @param fieldName - Field name for error messages
 * @param minLength - Minimum required length (default: 1)
 * @param maxLength - Maximum allowed length (optional)
 * @returns ValidationResult
 * 
 * @example
 * ```typescript
 * const result = validateArray(reasons, "Reasons", 1, 10);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateArray(
  array: any[],
  fieldName: string,
  minLength: number = 1,
  maxLength?: number
): ValidationResult {
  if (!Array.isArray(array)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }

  if (array.length < minLength) {
    return { 
      valid: false, 
      error: `At least ${minLength} ${fieldName.toLowerCase()} required` 
    };
  }

  if (maxLength && array.length > maxLength) {
    return { 
      valid: false, 
      error: `Maximum ${maxLength} ${fieldName.toLowerCase()} allowed` 
    };
  }

  return { valid: true };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  validateUUID,
  validateUserId,
  validateSubscriptionId,
  validatePercentage,
  validateDurationMonths,
  validateRequiredString,
  validateArray,
};
