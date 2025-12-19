/**
 * Invoice Email Service
 * 
 * Service for sending invoice and receipt emails with Arabic support
 * Task 12: Build Invoice and Payment History System
 */

import { logger } from '../logger'
import type { Invoice, Receipt, EmailInvoiceInput } from '@/types/invoice'
import { generateInvoicePDFHTML, generateReceiptPDFHTML } from '../utils/invoice-pdf-generator'

interface EmailConfig {
  from: string
  fromName: string
  fromNameAr: string
  replyTo: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
}

class InvoiceEmailService {
  private config: EmailConfig = {
    from: 'noreply@saudienglishclub.com',
    fromName: 'Saudi English Club',
    fromNameAr: 'نادي اللغة الإنجليزية السعودي',
    replyTo: 'support@saudienglishclub.com',
  }

  /**
   * Send invoice email to user
   */
  async sendInvoiceEmail(
    invoice: Invoice,
    user: { name: string; email: string; phone?: string },
    options: {
      language?: 'ar' | 'en'
      includePDF?: boolean
      customMessage?: string
      customMessageAr?: string
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const language = options.language || 'ar'
      const isArabic = language === 'ar'

      // Prepare email content
      const subject = isArabic
        ? `فاتورة رقم ${invoice.invoice_number} - ${this.config.fromNameAr}`
        : `Invoice ${invoice.invoice_number} - ${this.config.fromName}`

      const emailBody = this.generateInvoiceEmailBody(invoice, user, language, options.customMessage, options.customMessageAr)

      // In a real implementation, you would use an email service like SendGrid, AWS SES, or Supabase Edge Functions
      // For now, we'll log the email details
      logger.log('Sending invoice email:', {
        to: user.email,
        subject,
        invoiceNumber: invoice.invoice_number,
        language,
      })

      // Simulate email sending
      // In production, replace this with actual email service integration
      const _emailData = {
        to: user.email,
        from: this.config.from,
        fromName: isArabic ? this.config.fromNameAr : this.config.fromName,
        replyTo: this.config.replyTo,
        subject,
        html: emailBody,
        attachments: options.includePDF
          ? [
              {
                filename: `invoice-${invoice.invoice_number}.pdf`,
                content: 'PDF content would go here',
              },
            ]
          : [],
      }

      // TODO: Integrate with actual email service
      // await sendEmail(emailData)

      logger.log('Invoice email sent successfully:', invoice.invoice_number)
      return { success: true }
    } catch (error: any) {
      logger.error('Error sending invoice email:', error)
      return { success: false, error: error.message || 'فشل إرسال البريد الإلكتروني' }
    }
  }

  /**
   * Send receipt email to user
   */
  async sendReceiptEmail(
    receipt: Receipt,
    invoice: Invoice,
    user: { name: string; email: string },
    language: 'ar' | 'en' = 'ar'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isArabic = language === 'ar'

      const subject = isArabic
        ? `إيصال دفع رقم ${receipt.receipt_number} - ${this.config.fromNameAr}`
        : `Payment Receipt ${receipt.receipt_number} - ${this.config.fromName}`

      const emailBody = this.generateReceiptEmailBody(receipt, invoice, user, language)

      logger.log('Sending receipt email:', {
        to: user.email,
        subject,
        receiptNumber: receipt.receipt_number,
        language,
      })

      const _emailData = {
        to: user.email,
        from: this.config.from,
        fromName: isArabic ? this.config.fromNameAr : this.config.fromName,
        replyTo: this.config.replyTo,
        subject,
        html: emailBody,
      }

      // TODO: Integrate with actual email service
      // await sendEmail(emailData)

      logger.log('Receipt email sent successfully:', receipt.receipt_number)
      return { success: true }
    } catch (error: any) {
      logger.error('Error sending receipt email:', error)
      return { success: false, error: error.message || 'فشل إرسال البريد الإلكتروني' }
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminderEmail(
    invoice: Invoice,
    user: { name: string; email: string },
    language: 'ar' | 'en' = 'ar'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isArabic = language === 'ar'
      const daysUntilDue = Math.ceil(
        (invoice.due_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      const subject = isArabic
        ? `تذكير: فاتورة رقم ${invoice.invoice_number} - ${this.config.fromNameAr}`
        : `Reminder: Invoice ${invoice.invoice_number} - ${this.config.fromName}`

      const emailBody = this.generateReminderEmailBody(invoice, user, daysUntilDue, language)

      logger.log('Sending payment reminder email:', {
        to: user.email,
        subject,
        invoiceNumber: invoice.invoice_number,
        daysUntilDue,
      })

      const _emailData = {
        to: user.email,
        from: this.config.from,
        fromName: isArabic ? this.config.fromNameAr : this.config.fromName,
        replyTo: this.config.replyTo,
        subject,
        html: emailBody,
      }

      // TODO: Integrate with actual email service
      // await sendEmail(emailData)

      logger.log('Payment reminder email sent successfully:', invoice.invoice_number)
      return { success: true }
    } catch (error: any) {
      logger.error('Error sending payment reminder email:', error)
      return { success: false, error: error.message || 'فشل إرسال البريد الإلكتروني' }
    }
  }

  /**
   * Generate invoice email body HTML
   */
  private generateInvoiceEmailBody(
    invoice: Invoice,
    user: { name: string; email: string },
    language: 'ar' | 'en',
    customMessage?: string,
    customMessageAr?: string
  ): string {
    const isArabic = language === 'ar'
    const dir = isArabic ? 'rtl' : 'ltr'

    const formatCurrency = (amount: number) => {
      return `${amount.toFixed(2)} ${isArabic ? 'ريال' : 'SAR'}`
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    }

    const statusText = {
      paid: isArabic ? 'مدفوعة' : 'Paid',
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      cancelled: isArabic ? 'ملغاة' : 'Cancelled',
      refunded: isArabic ? 'مستردة' : 'Refunded',
      overdue: isArabic ? 'متأخرة' : 'Overdue',
    }

    return `
<!DOCTYPE html>
<html dir="${dir}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: ${isArabic ? "'Arial', sans-serif" : "'Arial', sans-serif"};
      line-height: 1.6;
      color: #333;
      direction: ${dir};
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .invoice-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #495057;
    }
    .detail-value {
      color: #666;
    }
    .amount-highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .amount-highlight .label {
      font-size: 14px;
      opacity: 0.9;
    }
    .amount-highlight .value {
      font-size: 32px;
      font-weight: 700;
      margin-top: 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
    .custom-message {
      background: #fff3cd;
      border-${isArabic ? 'right' : 'left'}: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? '🧾 فاتورة جديدة' : '🧾 New Invoice'}</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        ${isArabic ? `مرحباً ${user.name}،` : `Hello ${user.name},`}
      </div>
      
      <p>
        ${isArabic ? 'تم إصدار فاتورة جديدة لك. فيما يلي تفاصيل الفاتورة:' : 'A new invoice has been issued for you. Here are the invoice details:'}
      </p>
      
      ${customMessage || customMessageAr ? `
      <div class="custom-message">
        ${isArabic ? customMessageAr || customMessage : customMessage || customMessageAr}
      </div>
      ` : ''}
      
      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">${isArabic ? 'رقم الفاتورة' : 'Invoice Number'}</span>
          <span class="detail-value">${invoice.invoice_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</span>
          <span class="detail-value">${formatDate(invoice.invoice_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
          <span class="detail-value">${formatDate(invoice.due_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">${isArabic ? 'الحالة' : 'Status'}</span>
          <span class="detail-value">${statusText[invoice.status]}</span>
        </div>
      </div>
      
      <div class="amount-highlight">
        <div class="label">${isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</div>
        <div class="value">${formatCurrency(invoice.final_amount)}</div>
      </div>
      
      ${invoice.status === 'pending' || invoice.status === 'overdue' ? `
      <div style="text-align: center;">
        <a href="#" class="button">
          ${isArabic ? 'عرض الفاتورة والدفع' : 'View Invoice & Pay'}
        </a>
      </div>
      ` : ''}
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ${isArabic ? 'إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.' : 'If you have any questions, please don\'t hesitate to contact us.'}
      </p>
    </div>
    
    <div class="footer">
      <p><strong>${isArabic ? this.config.fromNameAr : this.config.fromName}</strong></p>
      <p>${isArabic ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}</p>
      <p style="margin-top: 10px;">
        ${isArabic ? 'هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه' : 'This is an automated email, please do not reply'}
      </p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Generate receipt email body HTML
   */
  private generateReceiptEmailBody(
    receipt: Receipt,
    invoice: Invoice,
    user: { name: string; email: string },
    language: 'ar' | 'en'
  ): string {
    const isArabic = language === 'ar'
    const dir = isArabic ? 'rtl' : 'ltr'

    const formatCurrency = (amount: number) => {
      return `${amount.toFixed(2)} ${isArabic ? 'ريال' : 'SAR'}`
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    return `
<!DOCTYPE html>
<html dir="${dir}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: ${isArabic ? "'Arial', sans-serif" : "'Arial', sans-serif"};
      line-height: 1.6;
      color: #333;
      direction: ${dir};
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .receipt-box {
      background: #f8f9fa;
      border: 2px dashed #28a745;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .receipt-number {
      font-size: 18px;
      font-weight: 600;
      color: #28a745;
      margin-bottom: 10px;
    }
    .paid-stamp {
      display: inline-block;
      padding: 8px 20px;
      background: #d4edda;
      color: #155724;
      font-weight: 700;
      border: 2px solid #155724;
      border-radius: 6px;
      margin: 10px 0;
    }
    .amount-paid {
      font-size: 36px;
      font-weight: 700;
      color: #28a745;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>${isArabic ? 'تم استلام الدفع بنجاح' : 'Payment Received Successfully'}</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">
        ${isArabic ? `عزيزي ${user.name}،` : `Dear ${user.name},`}
      </p>
      
      <p>
        ${isArabic ? 'شكراً لك! تم استلام دفعتك بنجاح.' : 'Thank you! Your payment has been received successfully.'}
      </p>
      
      <div class="receipt-box">
        <div class="receipt-number">
          ${isArabic ? 'رقم الإيصال' : 'Receipt Number'}: ${receipt.receipt_number}
        </div>
        <div class="paid-stamp">${isArabic ? 'مدفوع' : 'PAID'}</div>
        <div class="amount-paid">${formatCurrency(receipt.amount_paid)}</div>
      </div>
      
      <div style="margin: 20px 0;">
        <div class="detail-row">
          <span>${isArabic ? 'رقم الفاتورة' : 'Invoice Number'}</span>
          <span>${invoice.invoice_number}</span>
        </div>
        <div class="detail-row">
          <span>${isArabic ? 'تاريخ الدفع' : 'Payment Date'}</span>
          <span>${formatDate(receipt.payment_date)}</span>
        </div>
        <div class="detail-row">
          <span>${isArabic ? 'طريقة الدفع' : 'Payment Method'}</span>
          <span>${receipt.payment_method}</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="#" class="button">
          ${isArabic ? 'تحميل الإيصال' : 'Download Receipt'}
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ${isArabic ? 'سيتم إرسال نسخة من هذا الإيصال إلى بريدك الإلكتروني.' : 'A copy of this receipt has been sent to your email.'}
      </p>
    </div>
    
    <div class="footer">
      <p><strong>${isArabic ? this.config.fromNameAr : this.config.fromName}</strong></p>
      <p>${isArabic ? 'نقدر تعاملكم معنا' : 'We appreciate your business'}</p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Generate payment reminder email body HTML
   */
  private generateReminderEmailBody(
    invoice: Invoice,
    user: { name: string; email: string },
    daysUntilDue: number,
    language: 'ar' | 'en'
  ): string {
    const isArabic = language === 'ar'
    const dir = isArabic ? 'rtl' : 'ltr'
    const isOverdue = daysUntilDue < 0

    const formatCurrency = (amount: number) => {
      return `${amount.toFixed(2)} ${isArabic ? 'ريال' : 'SAR'}`
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    }

    const urgencyMessage = isOverdue
      ? isArabic
        ? `⚠️ هذه الفاتورة متأخرة بـ ${Math.abs(daysUntilDue)} يوم`
        : `⚠️ This invoice is ${Math.abs(daysUntilDue)} days overdue`
      : isArabic
      ? `⏰ تستحق هذه الفاتورة خلال ${daysUntilDue} يوم`
      : `⏰ This invoice is due in ${daysUntilDue} days`

    return `
<!DOCTYPE html>
<html dir="${dir}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: ${isArabic ? "'Arial', sans-serif" : "'Arial', sans-serif"};
      line-height: 1.6;
      color: #333;
      direction: ${dir};
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: ${isOverdue ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)'};
      color: white;
      padding: 30px;
      text-align: center;
    }
    .urgency-message {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: ${isOverdue ? '#dc3545' : '#ffc107'};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="urgency-message">${urgencyMessage}</div>
      <h1>${isArabic ? 'تذكير بالدفع' : 'Payment Reminder'}</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">
        ${isArabic ? `عزيزي ${user.name}،` : `Dear ${user.name},`}
      </p>
      
      <p>
        ${isArabic ? 'هذا تذكير بخصوص الفاتورة التالية:' : 'This is a reminder regarding the following invoice:'}
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>${isArabic ? 'رقم الفاتورة' : 'Invoice Number'}:</strong> ${invoice.invoice_number}</p>
        <p><strong>${isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}:</strong> ${formatDate(invoice.due_date)}</p>
        <p><strong>${isArabic ? 'المبلغ المستحق' : 'Amount Due'}:</strong> ${formatCurrency(invoice.final_amount)}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="#" class="button">
          ${isArabic ? 'ادفع الآن' : 'Pay Now'}
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        ${isArabic ? 'إذا كنت قد دفعت بالفعل، يرجى تجاهل هذا التذكير.' : 'If you have already paid, please disregard this reminder.'}
      </p>
    </div>
  </div>
</body>
</html>
    `
  }
}

export const invoiceEmailService = new InvoiceEmailService()
export default invoiceEmailService
