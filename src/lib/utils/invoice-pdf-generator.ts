/**
 * Invoice PDF Generator
 * 
 * Utility for generating PDF invoices with Arabic support
 * Task 12: Build Invoice and Payment History System
 */

import type { InvoicePDFData } from '@/types/invoice'

/**
 * Generate invoice PDF HTML template
 * This generates an HTML string that can be converted to PDF using a library like jsPDF or html2pdf
 */
export function generateInvoicePDFHTML(data: InvoicePDFData, language: 'ar' | 'en' = 'ar'): string {
  const { invoice, user, company } = data
  const isArabic = language === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'
  const align = isArabic ? 'right' : 'left'

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${isArabic ? 'ريال' : 'SAR'}`
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Status translation
  const statusText = {
    paid: isArabic ? 'مدفوعة' : 'Paid',
    pending: isArabic ? 'قيد الانتظار' : 'Pending',
    cancelled: isArabic ? 'ملغاة' : 'Cancelled',
    refunded: isArabic ? 'مستردة' : 'Refunded',
    overdue: isArabic ? 'متأخرة' : 'Overdue',
  }

  const html = `
<!DOCTYPE html>
<html dir="${dir}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isArabic ? 'فاتورة' : 'Invoice'} ${invoice.invoice_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${isArabic ? "'Cairo', 'Arial', sans-serif" : "'Arial', sans-serif"};
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      direction: ${dir};
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: ${align};
    }
    
    .invoice-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .invoice-number {
      font-size: 18px;
      opacity: 0.9;
    }
    
    .invoice-body {
      padding: 30px;
    }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }
    
    .info-block {
      flex: 1;
    }
    
    .info-block h3 {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 10px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 5px;
    }
    
    .info-block p {
      margin: 5px 0;
      color: #666;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      margin-top: 10px;
    }
    
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-overdue {
      background: #f8d7da;
      color: #721c24;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    
    .items-table thead {
      background: #f8f9fa;
    }
    
    .items-table th {
      padding: 12px;
      text-align: ${align};
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    
    .items-table td {
      padding: 12px;
      text-align: ${align};
      border-bottom: 1px solid #dee2e6;
    }
    
    .items-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .totals-section {
      margin-top: 30px;
      text-align: ${align};
    }
    
    .totals-table {
      width: 100%;
      max-width: 400px;
      margin-${isArabic ? 'right' : 'left'}: auto;
    }
    
    .totals-table tr {
      border-bottom: 1px solid #dee2e6;
    }
    
    .totals-table td {
      padding: 10px;
    }
    
    .totals-table td:first-child {
      font-weight: 600;
      color: #495057;
    }
    
    .totals-table td:last-child {
      text-align: ${isArabic ? 'left' : 'right'};
    }
    
    .total-row {
      background: #f8f9fa;
      font-size: 18px;
      font-weight: 700;
    }
    
    .total-row td {
      color: #667eea;
      padding: 15px 10px;
    }
    
    .notes-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-${isArabic ? 'right' : 'left'}: 4px solid #667eea;
    }
    
    .notes-section h4 {
      font-size: 14px;
      font-weight: 600;
      color: #495057;
      margin-bottom: 10px;
    }
    
    .notes-section p {
      color: #666;
      line-height: 1.8;
    }
    
    .invoice-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
    
    .tax-info {
      margin-top: 10px;
      font-size: 11px;
      color: #6c757d;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .invoice-container {
        border: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>${isArabic ? company.name_ar : company.name}</h1>
      <div class="invoice-number">${isArabic ? 'فاتورة رقم' : 'Invoice'} #${invoice.invoice_number}</div>
    </div>
    
    <div class="invoice-body">
      <div class="info-section">
        <div class="info-block">
          <h3>${isArabic ? 'من' : 'From'}</h3>
          <p><strong>${isArabic ? company.name_ar : company.name}</strong></p>
          <p>${isArabic ? company.address_ar : company.address}</p>
          <p>${isArabic ? 'هاتف' : 'Phone'}: ${company.phone}</p>
          <p>${isArabic ? 'بريد إلكتروني' : 'Email'}: ${company.email}</p>
          ${company.tax_number ? `<p>${isArabic ? 'الرقم الضريبي' : 'Tax Number'}: ${company.tax_number}</p>` : ''}
        </div>
        
        <div class="info-block">
          <h3>${isArabic ? 'إلى' : 'To'}</h3>
          <p><strong>${user.name}</strong></p>
          <p>${user.email}</p>
          ${user.phone ? `<p>${isArabic ? 'هاتف' : 'Phone'}: ${user.phone}</p>` : ''}
          ${user.address ? `<p>${user.address}</p>` : ''}
          <div class="status-badge status-${invoice.status}">
            ${statusText[invoice.status]}
          </div>
        </div>
        
        <div class="info-block">
          <h3>${isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}</h3>
          <p><strong>${isArabic ? 'تاريخ الإصدار' : 'Issue Date'}:</strong></p>
          <p>${formatDate(invoice.invoice_date)}</p>
          <p><strong>${isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}:</strong></p>
          <p>${formatDate(invoice.due_date)}</p>
          ${invoice.paid_date ? `
            <p><strong>${isArabic ? 'تاريخ الدفع' : 'Payment Date'}:</strong></p>
            <p>${formatDate(invoice.paid_date)}</p>
          ` : ''}
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>${isArabic ? 'الوصف' : 'Description'}</th>
            <th>${isArabic ? 'الكمية' : 'Quantity'}</th>
            <th>${isArabic ? 'سعر الوحدة' : 'Unit Price'}</th>
            <th>${isArabic ? 'الخصم' : 'Discount'}</th>
            <th>${isArabic ? 'الإجمالي' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item) => `
            <tr>
              <td>${isArabic ? item.description_ar : item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.discount)}</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>${isArabic ? 'المجموع الفرعي' : 'Subtotal'}</td>
            <td>${formatCurrency(invoice.total_amount)}</td>
          </tr>
          ${
            invoice.discount_amount > 0
              ? `
          <tr>
            <td>${isArabic ? 'الخصم' : 'Discount'}</td>
            <td>-${formatCurrency(invoice.discount_amount)}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td>${isArabic ? 'الضريبة' : 'Tax'} (${invoice.tax_rate}%)</td>
            <td>${formatCurrency(invoice.tax_amount)}</td>
          </tr>
          <tr class="total-row">
            <td>${isArabic ? 'الإجمالي النهائي' : 'Total Amount'}</td>
            <td>${formatCurrency(invoice.final_amount)}</td>
          </tr>
        </table>
      </div>
      
      ${
        invoice.notes || invoice.notes_ar
          ? `
      <div class="notes-section">
        <h4>${isArabic ? 'ملاحظات' : 'Notes'}</h4>
        <p>${isArabic ? invoice.notes_ar || invoice.notes : invoice.notes || invoice.notes_ar}</p>
      </div>
      `
          : ''
      }
      
      <div class="invoice-footer">
        <p>${isArabic ? 'شكراً لتعاملكم معنا' : 'Thank you for your business'}</p>
        <div class="tax-info">
          ${isArabic ? 'هذه فاتورة إلكترونية صالحة قانونياً' : 'This is a legally valid electronic invoice'}
          <br>
          ${isArabic ? 'تم الإنشاء في' : 'Generated on'} ${formatDate(new Date())}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return html
}

/**
 * Generate invoice PDF (browser-based)
 * This function can be used in the browser to generate and download PDFs
 */
export async function generateAndDownloadInvoicePDF(
  data: InvoicePDFData,
  language: 'ar' | 'en' = 'ar'
): Promise<void> {
  const html = generateInvoicePDFHTML(data, language)

  // Create a temporary iframe to print
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (iframeDoc) {
    iframeDoc.open()
    iframeDoc.write(html)
    iframeDoc.close()

    // Wait for content to load
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print()
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }, 250)
    }
  }
}

/**
 * Generate receipt PDF HTML template
 */
export function generateReceiptPDFHTML(
  receiptData: {
    receipt_number: string
    invoice_number: string
    amount_paid: number
    payment_method: string
    payment_date: Date
    user: { name: string; email: string }
    company: { name: string; name_ar: string; address: string; address_ar: string }
  },
  language: 'ar' | 'en' = 'ar'
): string {
  const isArabic = language === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'
  const align = isArabic ? 'right' : 'left'

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

  const paymentMethodText: Record<string, { ar: string; en: string }> = {
    credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
    bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
    cash: { ar: 'نقداً', en: 'Cash' },
    wallet: { ar: 'محفظة إلكترونية', en: 'Wallet' },
    package_credits: { ar: 'رصيد الباقة', en: 'Package Credits' },
  }

  const html = `
<!DOCTYPE html>
<html dir="${dir}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isArabic ? 'إيصال' : 'Receipt'} ${receiptData.receipt_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${isArabic ? "'Cairo', 'Arial', sans-serif" : "'Arial', sans-serif"};
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      direction: ${dir};
      background: #f5f5f5;
    }
    
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 2px dashed #667eea;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .receipt-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
    }
    
    .receipt-header h1 {
      font-size: 28px;
      color: #667eea;
      margin-bottom: 10px;
    }
    
    .receipt-number {
      font-size: 16px;
      color: #666;
      font-weight: 600;
    }
    
    .paid-stamp {
      display: inline-block;
      padding: 10px 30px;
      background: #d4edda;
      color: #155724;
      font-size: 24px;
      font-weight: 700;
      border: 3px solid #155724;
      border-radius: 8px;
      transform: rotate(-5deg);
      margin: 20px 0;
    }
    
    .receipt-info {
      margin: 30px 0;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    
    .info-label {
      font-weight: 600;
      color: #495057;
    }
    
    .info-value {
      color: #666;
      text-align: ${isArabic ? 'left' : 'right'};
    }
    
    .amount-section {
      margin: 30px 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      text-align: center;
    }
    
    .amount-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    
    .amount-value {
      font-size: 36px;
      font-weight: 700;
    }
    
    .receipt-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .receipt-container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt-header">
      <h1>${isArabic ? 'إيصال دفع' : 'Payment Receipt'}</h1>
      <div class="receipt-number">#${receiptData.receipt_number}</div>
      <div class="paid-stamp">${isArabic ? 'مدفوع' : 'PAID'}</div>
    </div>
    
    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">${isArabic ? 'رقم الفاتورة' : 'Invoice Number'}</span>
        <span class="info-value">${receiptData.invoice_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${isArabic ? 'تاريخ الدفع' : 'Payment Date'}</span>
        <span class="info-value">${formatDate(receiptData.payment_date)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${isArabic ? 'طريقة الدفع' : 'Payment Method'}</span>
        <span class="info-value">${isArabic ? paymentMethodText[receiptData.payment_method]?.ar : paymentMethodText[receiptData.payment_method]?.en}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${isArabic ? 'المستلم' : 'Received From'}</span>
        <span class="info-value">${receiptData.user.name}</span>
      </div>
    </div>
    
    <div class="amount-section">
      <div class="amount-label">${isArabic ? 'المبلغ المدفوع' : 'Amount Paid'}</div>
      <div class="amount-value">${formatCurrency(receiptData.amount_paid)}</div>
    </div>
    
    <div class="receipt-footer">
      <p><strong>${isArabic ? receiptData.company.name_ar : receiptData.company.name}</strong></p>
      <p>${isArabic ? receiptData.company.address_ar : receiptData.company.address}</p>
      <p style="margin-top: 20px;">${isArabic ? 'شكراً لتعاملكم معنا' : 'Thank you for your payment'}</p>
      <p style="margin-top: 10px; font-size: 10px;">
        ${isArabic ? 'تم الإنشاء في' : 'Generated on'} ${formatDate(new Date())}
      </p>
    </div>
  </div>
</body>
</html>
  `

  return html
}
