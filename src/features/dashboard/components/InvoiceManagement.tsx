/**
 * Invoice Management Component
 * 
 * Admin interface for creating and managing invoices
 * Task 12: Build Invoice and Payment History System
 */

import { useState, useEffect } from 'react'
import { invoiceService } from '@/lib/services/invoice-service'
import type {
  Invoice,
  CreateInvoiceInput,
  InvoiceItemInput,
  InvoiceFilter,
  InvoiceListItem,
} from '@/types/invoice'

interface InvoiceManagementProps {
  language?: 'ar' | 'en'
}

export function InvoiceManagement({ language = 'ar' }: InvoiceManagementProps) {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<InvoiceFilter>({})
  const [searchTerm, setSearchTerm] = useState('')

  const isArabic = language === 'ar'

  useEffect(() => {
    loadInvoices()
  }, [filter])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const { data } = await invoiceService.listInvoices(filter)
      if (data) setInvoices(data)
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilter({ ...filter, search: searchTerm })
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      const { status: _, ...rest } = filter
      setFilter(rest)
    } else {
      setFilter({ ...filter, status: status as any })
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

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm(isArabic ? 'هل تريد تأكيد الدفع؟' : 'Confirm payment?')) return

    try {
      const result = await invoiceService.markInvoicePaid(invoiceId, 'bank_transfer')
      if (result.success) {
        alert(isArabic ? 'تم تحديث الفاتورة بنجاح' : 'Invoice updated successfully')
        loadInvoices()
      } else {
        alert(result.error || (isArabic ? 'فشل التحديث' : 'Update failed'))
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isArabic ? 'إدارة الفواتير' : 'Invoice Management'}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <span>➕</span>
          <span>{isArabic ? 'فاتورة جديدة' : 'New Invoice'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={isArabic ? 'بحث برقم الفاتورة...' : 'Search by invoice number...'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="paid">{isArabic ? 'مدفوعة' : 'Paid'}</option>
              <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="overdue">{isArabic ? 'متأخرة' : 'Overdue'}</option>
              <option value="cancelled">{isArabic ? 'ملغاة' : 'Cancelled'}</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <input
              type="date"
              onChange={(e) => setFilter({ ...filter, from_date: new Date(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">
            {isArabic ? 'إجمالي الفواتير' : 'Total Invoices'}
          </div>
          <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">
            {isArabic ? 'المدفوعة' : 'Paid'}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter((inv) => inv.status === 'paid').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">
            {isArabic ? 'المعلقة' : 'Pending'}
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {invoices.filter((inv) => inv.status === 'pending').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">
            {isArabic ? 'المتأخرة' : 'Overdue'}
          </div>
          <div className="text-2xl font-bold text-red-600">
            {invoices.filter((inv) => inv.status === 'overdue').length}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isArabic ? 'رقم الفاتورة' : 'Invoice #'}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isArabic ? 'العميل' : 'Customer'}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isArabic ? 'التاريخ' : 'Date'}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isArabic ? 'الاستحقاق' : 'Due Date'}
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {isArabic ? 'لا توجد فواتير' : 'No invoices found'}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{invoice.user_name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{invoice.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(invoice.due_date)}</div>
                      {invoice.is_overdue && (
                        <div className="text-xs text-red-600">
                          {invoice.days_overdue} {isArabic ? 'يوم متأخر' : 'days overdue'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.final_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title={isArabic ? 'تأكيد الدفع' : 'Mark as Paid'}
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title={isArabic ? 'عرض' : 'View'}
                        >
                          👁️
                        </button>
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title={isArabic ? 'تحميل' : 'Download'}
                        >
                          📥
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadInvoices()
          }}
          language={language}
        />
      )}
    </div>
  )
}

// Create Invoice Modal Component
function CreateInvoiceModal({
  onClose,
  onSuccess,
  language = 'ar',
}: {
  onClose: () => void
  onSuccess: () => void
  language?: 'ar' | 'en'
}) {
  const isArabic = language === 'ar'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateInvoiceInput>>({
    invoice_type: 'package_purchase',
    items: [],
    tax_rate: 15.0,
    due_days: 7,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      if (!formData.user_id || !formData.items || formData.items.length === 0) {
        alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
        return
      }

      const { data, error } = await invoiceService.createInvoice(formData as CreateInvoiceInput)

      if (error) {
        alert(isArabic ? 'حدث خطأ أثناء إنشاء الفاتورة' : 'Error creating invoice')
        return
      }

      alert(isArabic ? 'تم إنشاء الفاتورة بنجاح' : 'Invoice created successfully')
      onSuccess()
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert(isArabic ? 'حدث خطأ' : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isArabic ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'معرف المستخدم' : 'User ID'}
              </label>
              <input
                type="text"
                required
                value={formData.user_id || ''}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'نوع الفاتورة' : 'Invoice Type'}
              </label>
              <select
                value={formData.invoice_type}
                onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="package_purchase">
                  {isArabic ? 'شراء باقة' : 'Package Purchase'}
                </option>
                <option value="class_booking">{isArabic ? 'حجز حصة' : 'Class Booking'}</option>
                <option value="credit_purchase">
                  {isArabic ? 'شراء رصيد' : 'Credit Purchase'}
                </option>
              </select>
            </div>

            <div className="text-center text-gray-500 py-4">
              {isArabic ? 'إضافة البنود والتفاصيل الأخرى...' : 'Add items and other details...'}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading
                  ? isArabic
                    ? 'جاري الإنشاء...'
                    : 'Creating...'
                  : isArabic
                  ? 'إنشاء الفاتورة'
                  : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
