/**
 * Input Validation Service
 * 
 * Provides comprehensive input validation for Arabic and English text inputs
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

import { z } from 'zod'
// DOMPurify will be imported dynamically or use a simpler sanitization approach
// import DOMPurify from 'isomorphic-dompurify'
import { logger } from '../logger'

// Validation patterns
const PATTERNS = {
  // Arabic text (including diacritics and common punctuation)
  ARABIC: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?؛،؟\-()]+$/,
  
  // English text (letters, numbers, common punctuation)
  ENGLISH: /^[a-zA-Z0-9\s.,!?'"\-()]+$/,
  
  // Bilingual (Arabic + English)
  BILINGUAL: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF a-zA-Z0-9\s.,!?؛،؟'"\-()]+$/,
  
  // Saudi phone number (+966 or 05)
  SAUDI_PHONE: /^(\+966|966|05)[0-9]{8,9}$/,
  
  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Google Meet link
  GOOGLE_MEET: /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/,
  
  // URL
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  
  // Alphanumeric (for IDs, codes)
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  
  // UUID
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

// Dangerous patterns to detect potential attacks
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
  /<iframe[^>]*>/gi, // Iframes
  /eval\s*\(/gi, // eval() calls
  /expression\s*\(/gi, // CSS expressions
  /<object[^>]*>/gi, // Object tags
  /<embed[^>]*>/gi, // Embed tags
  /vbscript:/gi, // VBScript protocol
  /data:text\/html/gi, // Data URLs with HTML
]

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(UNION\s+SELECT)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
]

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  
  // Simple HTML sanitization - remove all tags except safe ones
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']
  let sanitized = input
  
  // Remove all HTML tags except allowed ones
  sanitized = sanitized.replace(/<([^>]+)>/g, (match, tag) => {
    const tagName = tag.split(' ')[0].toLowerCase().replace('/', '')
    if (allowedTags.includes(tagName)) {
      return match
    }
    return ''
  })
  
  // Remove event handlers and javascript: protocols
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitized
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validate Arabic text input
 */
export function validateArabicText(input: string, options: { minLength?: number; maxLength?: number } = {}): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(input)
  
  if (!sanitized) {
    return { valid: false, error: 'النص مطلوب' }
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    return { valid: false, error: `النص يجب أن يكون ${options.minLength} حرف على الأقل` }
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    return { valid: false, error: `النص يجب ألا يتجاوز ${options.maxLength} حرف` }
  }
  
  if (!PATTERNS.ARABIC.test(sanitized)) {
    return { valid: false, error: 'يجب إدخال نص عربي فقط' }
  }
  
  return { valid: true }
}

/**
 * Validate English text input
 */
export function validateEnglishText(input: string, options: { minLength?: number; maxLength?: number } = {}): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(input)
  
  if (!sanitized) {
    return { valid: false, error: 'Text is required' }
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    return { valid: false, error: `Text must be at least ${options.minLength} characters` }
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    return { valid: false, error: `Text must not exceed ${options.maxLength} characters` }
  }
  
  if (!PATTERNS.ENGLISH.test(sanitized)) {
    return { valid: false, error: 'Please enter English text only' }
  }
  
  return { valid: true }
}

/**
 * Validate bilingual text (Arabic + English)
 */
export function validateBilingualText(input: string, options: { minLength?: number; maxLength?: number } = {}): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(input)
  
  if (!sanitized) {
    return { valid: false, error: 'النص مطلوب / Text is required' }
  }
  
  if (options.minLength && sanitized.length < options.minLength) {
    return { valid: false, error: `النص يجب أن يكون ${options.minLength} حرف على الأقل` }
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    return { valid: false, error: `النص يجب ألا يتجاوز ${options.maxLength} حرف` }
  }
  
  if (!PATTERNS.BILINGUAL.test(sanitized)) {
    return { valid: false, error: 'يجب إدخال نص عربي أو إنجليزي فقط' }
  }
  
  return { valid: true }
}

/**
 * Validate Saudi phone number
 */
export function validateSaudiPhone(phone: string): { valid: boolean; error?: string; formatted?: string } {
  const sanitized = phone.replace(/\s+/g, '').replace(/-/g, '')
  
  if (!PATTERNS.SAUDI_PHONE.test(sanitized)) {
    return { valid: false, error: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ +966 أو 05' }
  }
  
  // Format to +966 format
  let formatted = sanitized
  if (formatted.startsWith('05')) {
    formatted = '+966' + formatted.substring(1)
  } else if (formatted.startsWith('966')) {
    formatted = '+' + formatted
  }
  
  return { valid: true, formatted }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(email).toLowerCase()
  
  if (!sanitized) {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' }
  }
  
  if (!PATTERNS.EMAIL.test(sanitized)) {
    return { valid: false, error: 'البريد الإلكتروني غير صحيح' }
  }
  
  return { valid: true }
}

/**
 * Validate Google Meet link
 */
export function validateGoogleMeetLink(link: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(link).trim()
  
  if (!sanitized) {
    return { valid: false, error: 'رابط Google Meet مطلوب' }
  }
  
  if (!PATTERNS.GOOGLE_MEET.test(sanitized)) {
    return { valid: false, error: 'رابط Google Meet غير صحيح. يجب أن يكون بصيغة https://meet.google.com/xxx-xxxx-xxx' }
  }
  
  return { valid: true }
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeText(url).trim()
  
  if (!sanitized) {
    return { valid: false, error: 'الرابط مطلوب' }
  }
  
  if (!PATTERNS.URL.test(sanitized)) {
    return { valid: false, error: 'الرابط غير صحيح' }
  }
  
  return { valid: true }
}

/**
 * Detect potential XSS attacks
 */
export function detectXSS(input: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(input))
}

/**
 * Detect potential SQL injection
 */
export function detectSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: string, type: 'arabic' | 'english' | 'bilingual' | 'email' | 'phone' | 'url' | 'meet'): { valid: boolean; sanitized: string; error?: string } {
  // Check for XSS
  if (detectXSS(input)) {
    logger.warn('XSS attempt detected:', input.substring(0, 50))
    return { valid: false, sanitized: '', error: 'إدخال غير صالح' }
  }
  
  // Check for SQL injection
  if (detectSQLInjection(input)) {
    logger.warn('SQL injection attempt detected:', input.substring(0, 50))
    return { valid: false, sanitized: '', error: 'إدخال غير صالح' }
  }
  
  // Sanitize input
  const sanitized = sanitizeText(input)
  
  // Validate based on type
  let validation: { valid: boolean; error?: string }
  
  switch (type) {
    case 'arabic':
      validation = validateArabicText(sanitized)
      break
    case 'english':
      validation = validateEnglishText(sanitized)
      break
    case 'bilingual':
      validation = validateBilingualText(sanitized)
      break
    case 'email':
      validation = validateEmail(sanitized)
      break
    case 'phone':
      validation = validateSaudiPhone(sanitized)
      break
    case 'url':
      validation = validateUrl(sanitized)
      break
    case 'meet':
      validation = validateGoogleMeetLink(sanitized)
      break
    default:
      validation = { valid: false, error: 'نوع التحقق غير صحيح' }
  }
  
  return {
    valid: validation.valid,
    sanitized,
    error: validation.error,
  }
}

// Zod schemas for common validations
export const schemas = {
  arabicText: z.string().min(1, 'النص مطلوب').max(1000, 'النص طويل جداً').refine(
    (val) => PATTERNS.ARABIC.test(sanitizeText(val)),
    'يجب إدخال نص عربي فقط'
  ),
  
  englishText: z.string().min(1, 'Text is required').max(1000, 'Text is too long').refine(
    (val) => PATTERNS.ENGLISH.test(sanitizeText(val)),
    'Please enter English text only'
  ),
  
  bilingualText: z.string().min(1, 'النص مطلوب').max(1000, 'النص طويل جداً').refine(
    (val) => PATTERNS.BILINGUAL.test(sanitizeText(val)),
    'يجب إدخال نص عربي أو إنجليزي فقط'
  ),
  
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  
  saudiPhone: z.string().refine(
    (val) => PATTERNS.SAUDI_PHONE.test(val.replace(/\s+/g, '').replace(/-/g, '')),
    'رقم الهاتف غير صحيح'
  ),
  
  googleMeetLink: z.string().refine(
    (val) => PATTERNS.GOOGLE_MEET.test(sanitizeText(val)),
    'رابط Google Meet غير صحيح'
  ),
  
  url: z.string().url('الرابط غير صحيح'),
  
  uuid: z.string().uuid('المعرف غير صحيح'),
  
  positiveNumber: z.number().positive('يجب أن يكون الرقم موجباً'),
  
  age: z.number().min(10, 'العمر يجب أن يكون 10 سنوات على الأقل').max(18, 'العمر يجب ألا يتجاوز 18 سنة'),
  
  credits: z.number().min(0, 'الرصيد لا يمكن أن يكون سالباً'),
  
  price: z.number().min(0, 'السعر لا يمكن أن يكون سالباً'),
}

export default {
  sanitizeHtml,
  sanitizeText,
  validateArabicText,
  validateEnglishText,
  validateBilingualText,
  validateSaudiPhone,
  validateEmail,
  validateGoogleMeetLink,
  validateUrl,
  detectXSS,
  detectSQLInjection,
  validateInput,
  schemas,
}
