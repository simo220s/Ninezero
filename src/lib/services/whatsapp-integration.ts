/**
 * WhatsApp Integration Service
 * 
 * Handles WhatsApp communications for parent notifications
 * Requirements: 14.3 - WhatsApp integration for parent communications
 */

import { logger } from '../logger'

export interface WhatsAppMessage {
  phoneNumber: string
  message: string
  mediaUrl?: string
}

export interface WhatsAppTemplate {
  name: string
  language: 'ar' | 'en'
  parameters: string[]
}

/**
 * Format Saudi phone number for WhatsApp
 */
export function formatSaudiPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  // If starts with 966, it's already in international format
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`
  }
  
  // If starts with 0, remove it and add 966
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  
  // Add Saudi country code
  return `+966${cleaned}`
}

/**
 * Generate WhatsApp Web link
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const formattedNumber = formatSaudiPhoneNumber(phoneNumber)
  const encodedMessage = encodeURIComponent(message)
  
  // Remove + from phone number for WhatsApp link
  const cleanNumber = formattedNumber.replace('+', '')
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp API link (for mobile apps)
 */
export function generateWhatsAppApiLink(phoneNumber: string, message: string): string {
  const formattedNumber = formatSaudiPhoneNumber(phoneNumber)
  const encodedMessage = encodeURIComponent(message)
  const cleanNumber = formattedNumber.replace('+', '')
  
  return `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`
}

/**
 * Validate Saudi phone number
 */
export function validateSaudiPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Saudi numbers are 9 digits starting with 5
  // With country code: +966 5X XXX XXXX
  if (cleaned.startsWith('966')) {
    const localNumber = cleaned.substring(3)
    return localNumber.length === 9 && localNumber.startsWith('5')
  }
  
  // Without country code: 05X XXX XXXX or 5X XXX XXXX
  if (cleaned.startsWith('0')) {
    const localNumber = cleaned.substring(1)
    return localNumber.length === 9 && localNumber.startsWith('5')
  }
  
  return cleaned.length === 9 && cleaned.startsWith('5')
}

/**
 * WhatsApp message templates for common scenarios
 */
export const WhatsAppTemplates = {
  /**
   * Class reminder template (24 hours before)
   */
  classReminder24h: (studentName: string, teacherName: string, date: string, time: string, meetingLink: string) => {
    return `السلام عليكم ورحمة الله وبركاته

تذكير بحصة اللغة الإنجليزية 📚

الطالب: ${studentName}
المعلم: ${teacherName}
التاريخ: ${date}
الوقت: ${time}

الحصة ستبدأ خلال 24 ساعة ⏰

رابط الحصة:
${meetingLink}

نتمنى لكم حصة مفيدة! 🌟

نادي اللغة الإنجليزية السعودي`
  },

  /**
   * Class reminder template (1 hour before)
   */
  classReminder1h: (studentName: string, teacherName: string, time: string, meetingLink: string) => {
    return `تذكير عاجل ⏰

حصة ${studentName} مع المعلم ${teacherName} ستبدأ خلال ساعة واحدة!

الوقت: ${time}

رابط الحصة:
${meetingLink}

يرجى التحضير والانضمام في الوقت المحدد 📚`
  },

  /**
   * Class reminder template (15 minutes before)
   */
  classReminder15min: (studentName: string, meetingLink: string) => {
    return `🔔 الحصة تبدأ خلال 15 دقيقة!

الطالب: ${studentName}

انضم الآن:
${meetingLink}

نراكم قريباً! 👋`
  },

  /**
   * Class cancelled template
   */
  classCancelled: (studentName: string, teacherName: string, date: string, time: string, reason?: string) => {
    return `إشعار إلغاء حصة ❌

تم إلغاء حصة ${studentName} مع المعلم ${teacherName}

التاريخ: ${date}
الوقت: ${time}

${reason ? `السبب: ${reason}` : ''}

سيتم التواصل معكم لإعادة جدولة الحصة.

نعتذر عن الإزعاج 🙏`
  },

  /**
   * Class rescheduled template
   */
  classRescheduled: (studentName: string, teacherName: string, oldDate: string, oldTime: string, newDate: string, newTime: string, meetingLink: string) => {
    return `إشعار تغيير موعد الحصة 📅

الطالب: ${studentName}
المعلم: ${teacherName}

الموعد السابق:
${oldDate} - ${oldTime}

الموعد الجديد:
${newDate} - ${newTime}

رابط الحصة:
${meetingLink}

نعتذر عن أي إزعاج 🙏`
  },

  /**
   * Parent message template
   */
  parentMessage: (studentName: string, teacherName: string, message: string) => {
    return `رسالة من المعلم ${teacherName} 📝

بخصوص الطالب: ${studentName}

${message}

للرد على هذه الرسالة، يرجى التواصل عبر المنصة.

نادي اللغة الإنجليزية السعودي`
  },

  /**
   * Progress report template
   */
  progressReport: (studentName: string, level: string, completedLessons: number, nextLesson: string) => {
    return `تقرير تقدم الطالب 📊

الطالب: ${studentName}
المستوى: ${level}
الحصص المكتملة: ${completedLessons}

الحصة القادمة: ${nextLesson}

استمروا في التقدم الرائع! 🌟

نادي اللغة الإنجليزية السعودي`
  },

  /**
   * Welcome message for new students
   */
  welcomeMessage: (studentName: string, parentName: string, trialDate: string, trialTime: string, meetingLink: string) => {
    return `مرحباً بكم في نادي اللغة الإنجليزية السعودي! 🎉

ولي الأمر: ${parentName}
الطالب: ${studentName}

تم تأكيد حجز الحصة التجريبية المجانية:

التاريخ: ${trialDate}
الوقت: ${trialTime}

رابط الحصة:
${meetingLink}

نصائح للحصة التجريبية:
✅ تأكد من اتصال الإنترنت
✅ جهز مكان هادئ للدراسة
✅ انضم قبل 5 دقائق من الموعد

نتطلع لرؤيتكم! 🌟`
  },

  /**
   * Payment reminder template
   */
  paymentReminder: (parentName: string, studentName: string, amount: number, dueDate: string) => {
    return `تذكير بالدفع 💳

ولي الأمر: ${parentName}
الطالب: ${studentName}

المبلغ المستحق: ${amount} ريال
تاريخ الاستحقاق: ${dueDate}

للدفع، يرجى زيارة المنصة:
[رابط الدفع]

شكراً لثقتكم بنا 🙏

نادي اللغة الإنجليزية السعودي`
  },
}

/**
 * Send WhatsApp message (opens WhatsApp with pre-filled message)
 */
export function sendWhatsAppMessage(phoneNumber: string, message: string): void {
  const link = generateWhatsAppLink(phoneNumber, message)
  
  // Open WhatsApp in new window
  window.open(link, '_blank')
  
  logger.log('WhatsApp message initiated:', { phoneNumber, messageLength: message.length })
}

/**
 * Send bulk WhatsApp messages
 */
export function sendBulkWhatsAppMessages(messages: WhatsAppMessage[]): void {
  messages.forEach((msg, index) => {
    // Add delay between messages to avoid spam detection
    setTimeout(() => {
      sendWhatsAppMessage(msg.phoneNumber, msg.message)
    }, index * 2000) // 2 seconds delay between each message
  })
  
  logger.log('Bulk WhatsApp messages initiated:', messages.length)
}

/**
 * Copy WhatsApp message to clipboard
 */
export async function copyWhatsAppMessageToClipboard(message: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(message)
    logger.log('WhatsApp message copied to clipboard')
    return true
  } catch (error) {
    logger.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Generate QR code for WhatsApp contact
 */
export function generateWhatsAppQRCode(phoneNumber: string): string {
  const formattedNumber = formatSaudiPhoneNumber(phoneNumber)
  const cleanNumber = formattedNumber.replace('+', '')
  
  // Use a QR code API service
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/${cleanNumber}`
}

export default {
  formatSaudiPhoneNumber,
  generateWhatsAppLink,
  generateWhatsAppApiLink,
  validateSaudiPhoneNumber,
  sendWhatsAppMessage,
  sendBulkWhatsAppMessages,
  copyWhatsAppMessageToClipboard,
  generateWhatsAppQRCode,
  templates: WhatsAppTemplates,
}
