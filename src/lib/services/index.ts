/**
 * Services Export Index
 * 
 * Central export point for all notification and real-time services
 */

// Notification Service
export { default as notificationService } from './notification-service'
export type {
  NotificationChannel,
  NotificationTiming,
  NotificationPreferences,
  ClassReminder,
  NotificationTemplate,
} from './notification-service'

// Countdown Timer Service
export {
  calculateCountdown,
  useClassCountdown,
  useMultipleClassCountdowns,
  formatCountdownDisplay,
  getCountdownColor,
  getCountdownBadgeVariant,
  shouldShowNotification,
} from './countdown-timer'
export type { ClassCountdown } from './countdown-timer'

// WhatsApp Integration Service
export { default as whatsappService } from './whatsapp-integration'
export {
  formatSaudiPhoneNumber,
  generateWhatsAppLink,
  generateWhatsAppApiLink,
  validateSaudiPhoneNumber,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
  copyWhatsAppMessageToClipboard,
  generateWhatsAppQRCode,
  WhatsAppTemplates,
} from './whatsapp-integration'
export type { WhatsAppMessage, WhatsAppTemplate } from './whatsapp-integration'

// Coupon Service
export { default as couponService } from './coupon-service'

// Package Service
export { default as packageService } from './package-service'

// Invoice Service
export { default as invoiceService } from './invoice-service'

// Invoice Email Service
export { default as invoiceEmailService } from './invoice-email-service'

// Wishlist Service
export { default as wishlistService } from './wishlist-service'
