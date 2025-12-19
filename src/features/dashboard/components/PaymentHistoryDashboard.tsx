/**
 * Payment History Dashboard Component
 * 
 * Dashboard for parents to view payment history and invoices
 * Task 12: Build Invoice and Payment History System
 */

import { useState, useEffect } from 'react'
import { invoiceService } from '@/lib/services/invoice-service'
import { invoiceEmailService } from '@/lib/services/invoice-email-service'
import { generateAndDownloadInvoicePDF } from '@/lib/utils/invoice-pdf-generator'
import type {
  Invoice,
  PaymentHistory,
  Receipt,
  InvoiceStats,
  InvoiceFilter,
  PaymentHistoryFilter,
} from '@/types/invoice'

interface PaymentHistoryDashboardProps {
  userId: string
  userName: string
  userEmail: string
  language?: 'ar' | 'en'
}

export function PaymentHistoryDashboard({
  userId,
  userName,
  userEmail,
  language = 'ar',
}: PaymentHistoryDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filter, _setFilter] = useState<InvoiceFilter>({ user_id: userId })
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'receipts'>('invoices')

  const isArabic = language === 'ar'

  useEffect(() => {
    loadData()
  }, [userId, filter])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load invoices
      const { data: invoicesData } = await invoiceService.listInvoices(filter)
      if (invoicesData) setInvoices(invoicesData)

      // Load payment history
      const paymentFilter: PaymentHistoryFilter = { user_id: userId }
      const { data: paymentsData } = await invoiceService.getPaymentHistory(paymentFilter)
      if (paymentsData) setPaymentHistory(paymentsData)

      // Load stats
      const { data: statsData } = await invoiceService.getInvoiceStats(userId)
      if (statsData) setStats(statsData)
    } catch (error) {
      console.error('Error loading payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const pdfData = {
        invoice,
        user: {
          name: userName,
          email: userEmail,
        },
        company: {
          name: 'Saudi English Club',
          name_ar: 'نادي اللغة الإنجليزية السعودي',
          address: 'Riyadh, Saudi Arabia',
          address_ar: 'الرياض، المملكة العربية السعودية',
          phone: '+966 XX XXX XXXX',
          email: 'info@saudienglishclub.com',
          tax_number: '123456789',
        },
      }

      await generateAndDownloadInvoicePDF(pdfData, language)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert(isArabic ? 'حدث خطأ أثناء تحميل الفاتورة' : 'Error downloading invoice')
    }
  }

  const handleEmailInvoice = async (invoice: Invoice) => {
    try {
      const result = await invoiceEmailService.sendInvoiceEmail(
        invoice,
        { name: userName, email: userEmail },
        { language, includePDF: true }
      )

      if (result.success) {
        alert(isArabic ? 'تم إرسال الفاتورة بنجاح' : 'Invoice sent successfully')
      } else {
        alert(result.error || (isArabic ? 'فشل إرسال الفاتورة' : 'Failed to send invoice'))
      }
    } catch (error) {
      console.error('Error emailing invoice:', error)
      alert(isArabic ? 'حدث خطأ أثناء إرسال الفاتورة' : 'Error sending invoice')
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${isArabic ? 'ريال' : 'SAR'}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: isArabic ? 'مدفوعة' : 'Paid',
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: isArabic ? 'قيد الانتظار' : 'Pending',
      },
      overdue: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: isArabic ? 'متأخرة' : 'Overdue',
      },
      cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: isArabic ? 'ملغاة' : 'Cancelled',
      },
      refunded: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: isArabic ? 'مستردة' : 'Refunded',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">
              {isArabic ? 'إجمالي الفواتير' : 'Total Invoices'}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_invoices}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">
              {isArabic ? 'المبلغ المدفوع' : 'Total Paid'}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.total_paid)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">
              {isArabic ? 'المبلغ المعلق' : 'Pending Amount'}
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.total_pending)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">
              {isArabic ? 'معدل النجاح' : 'Success Rate'}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.payment_success_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'invoices'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isArabic ? 'الفواتير' : 'Invoices'}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'payments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isArabic ? 'سجل الدفعات' : 'Payment History'}
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'receipts'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isArabic ? 'الإيصالات' : 'Receipts'}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {isArabic ? 'لا توجد فواتير' : 'No invoices found'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isArabic ? 'رقم الفاتورة' : 'Invoice #'}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isArabic ? 'التاريخ' : 'Date'}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isArabic ? 'المبلغ' : 'Amount'}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isArabic ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isArabic ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(invoice.invoice_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.final_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadInvoice(invoice)}
                                className="text-primary-600 hover:text-primary-900"
                                title={isArabic ? 'تحميل' : 'Download'}
                              >
                                📥
                              </button>
                              <button
                                onClick={() => handleEmailInvoice(invoice)}
                                className="text-primary-600 hover:text-primary-900"
                                title={isArabic ? 'إرسال بالبريد' : 'Email'}
                              >
                                📧
                              </button>
                              <button
                                onClick={() => setSelectedInvoice(invoice)}
                                className="text-primary-600 hover:text-primary-900"
                                title={isArabic ? 'عرض' : 'View'}
                              >
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {isArabic ? 'لا يوجد سجل دفعات' : 'No payment history found'}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(payment.payment_date)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {isArabic ? 'طريقة الدفع' : 'Payment Method'}: {payment.payment_method}
                          </div>
                          {payment.transaction_id && (
                            <div className="text-xs text-gray-500 mt-1">
                              {isArabic ? 'رقم المعاملة' : 'Transaction ID'}: {payment.transaction_id}
                            </div>
                          )}
                        </div>
                        <div>
                          {getStatusBadge(payment.payment_status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="text-center py-12 text-gray-500">
              {isArabic ? 'قريباً - عرض الإيصالات' : 'Coming Soon - Receipts View'}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">
                      {isArabic ? 'رقم الفاتورة' : 'Invoice Number'}
                    </div>
                    <div className="font-semibold">{selectedInvoice.invoice_number}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      {isArabic ? 'الحالة' : 'Status'}
                    </div>
                    <div>{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      {isArabic ? 'تاريخ الإصدار' : 'Issue Date'}
                    </div>
                    <div className="font-semibold">{formatDate(selectedInvoice.invoice_date)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      {isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}
                    </div>
                    <div className="font-semibold">{formatDate(selectedInvoice.due_date)}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">
                    {isArabic ? 'البنود' : 'Items'}
                  </h3>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{isArabic ? item.description_ar : item.description}</span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                  {selectedInvoice.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{isArabic ? 'الخصم' : 'Discount'}</span>
                      <span>-{formatCurrency(selectedInvoice.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>{isArabic ? 'الضريبة' : 'Tax'} ({selectedInvoice.tax_rate}%)</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>{isArabic ? 'الإجمالي' : 'Total'}</span>
                    <span>{formatCurrency(selectedInvoice.final_amount)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    {isArabic ? 'تحميل PDF' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => handleEmailInvoice(selectedInvoice)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    {isArabic ? 'إرسال بالبريد' : 'Email Invoice'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
