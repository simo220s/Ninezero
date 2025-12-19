/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';

  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .substring(0, 255); // Limit length
};

/**
 * Sanitize name input (allows Arabic and English letters, spaces, hyphens)
 */
export const sanitizeName = (name: string): string => {
  if (typeof name !== 'string') return '';

  return name
    .trim()
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .substring(0, 100); // Limit length
};

/**
 * Sanitize phone number (allows digits, +, -, spaces, parentheses)
 */
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') return '';

  return phone
    .trim()
    .replace(/[^0-9+\-\s()]/g, '') // Keep only valid phone characters
    .substring(0, 20); // Limit length
};

/**
 * Sanitize URL
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';

  // Remove dangerous protocols
  const cleaned = url
    .trim()
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');

  // Validate URL format
  try {
    const urlObj = new URL(cleaned);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return cleaned.substring(0, 2048); // Limit length
  } catch {
    return '';
  }
};

/**
 * Sanitize HTML content (strip all HTML tags)
 */
export const stripHtml = (html: string): string => {
  if (typeof html !== 'string') return '';

  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim()
    .substring(0, 5000); // Limit length
};

/**
 * Sanitize number input
 */
export const sanitizeNumber = (input: any): number | null => {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  return num;
};

/**
 * Sanitize integer input
 */
export const sanitizeInteger = (input: any, min?: number, max?: number): number | null => {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return min;
  }

  if (max !== undefined && num > max) {
    return max;
  }

  return num;
};

/**
 * Sanitize boolean input
 */
export const sanitizeBoolean = (input: any): boolean => {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  return Boolean(input);
};

/**
 * Sanitize UUID
 */
export const sanitizeUuid = (uuid: string): string | null => {
  if (typeof uuid !== 'string') return null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return null;
  }

  return uuid.toLowerCase();
};

/**
 * Sanitize date string (YYYY-MM-DD format)
 */
export const sanitizeDate = (date: string): string | null => {
  if (typeof date !== 'string') return null;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return null;
  }

  // Validate it's a real date
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return date;
};

/**
 * Sanitize time string (HH:MM format)
 */
export const sanitizeTime = (time: string): string | null => {
  if (typeof time !== 'string') return null;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return null;
  }

  return time;
};

/**
 * Sanitize object by applying sanitization to all string values
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize pagination parameters
 */
export const sanitizePagination = (
  limit?: any,
  offset?: any
): { limit: number; offset: number } => {
  const sanitizedLimit = sanitizeInteger(limit, 1, 100) || 50;
  const sanitizedOffset = sanitizeInteger(offset, 0) || 0;

  return {
    limit: sanitizedLimit,
    offset: sanitizedOffset,
  };
};

/**
 * Sanitize search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .substring(0, 200); // Limit length
};

/**
 * Sanitize SQL LIKE pattern (for search queries)
 */
export const sanitizeLikePattern = (pattern: string): string => {
  if (typeof pattern !== 'string') return '';

  // Escape special SQL LIKE characters
  return pattern
    .replace(/[%_\\]/g, '\\$&') // Escape %, _, and \
    .trim()
    .substring(0, 200);
};
