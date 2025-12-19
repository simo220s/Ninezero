/**
 * Invoice and Payment History System Types
 * 
 * Type definitions for invoice generation, payment history, and receipt management
 * Task 12: Build Invoice and Payment History System
 */

export type InvoiceStatus = 'paid' | 'pending' | 'cancelled' | 'refunded' | 'overdue'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash' | 'wallet' | 'package_credits'
export type InvoiceType = 'package_purchase' | 'class_booking' | 'credit_purchase' | 'subscription' | 'other'

export interface Invoice {
  id: string
  invoice_number: string
  user_id: string
  payment_id?: string
  invoice_type: InvoiceType
  total_amount: number
  discount_amount: number
  tax_amount: number
  tax_rate: number
  final_amount: number
  currency: string
  invoice_date: Date
  due_date: Date
  paid_date?: Date
  status: InvoiceStatus
  items: InvoiceItem[]
  notes?: string
  notes_ar?: string
  payment_method?: PaymentMethod
  created_at: Date
  updated_at: Date
}

export interface InvoiceItem {
  id: string
  description: string
  description_ar: string
  quantity: number
  unit_price: number
  discount: number
  tax_amount: number
  total: number
  item_type: 'package' | 'class' | 'credits' | 'subscription' | 'other'
  item_id?: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  invoice_id?: string
  amount: number
  payment_method: PaymentMethod
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  payment_gateway?: string
  payment_date: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Receipt {
  id: string
  invoice_id: string
  receipt_number: string
  user_id: string
  amount_paid: number
  payment_method: PaymentMethod
  payment_date: Date
  receipt_url?: string
  created_at: Date
}

export interface TaxDocumentation {
  id: string
  user_id: string
  tax_year: number
  tax_period: string
  total_amount: number
  total_tax: number
  invoice_count: number
  document_url?: string
  generated_at: Date
}

export interface InvoiceStats {
  total_invoices: number
  total_amount: number
  total_paid: number
  total_pending: number
  total_overdue: number
  avg_invoice_amount: number
  payment_success_rate: number
}

export interface CreateInvoiceInput {
  user_id: string
  invoice_type: InvoiceType
  items: InvoiceItemInput[]
  payment_method?: PaymentMethod
  discount_amount?: number
  tax_rate?: number
  notes?: string
  notes_ar?: string
  due_days?: number
}

export interface InvoiceItemInput {
  description: string
  description_ar: string
  quantity: number
  unit_price: number
  discount?: number
  item_type: 'package' | 'class' | 'credits' | 'subscription' | 'other'
  item_id?: string
}

export interface UpdateInvoiceInput {
  id: string
  status?: InvoiceStatus
  paid_date?: Date
  payment_method?: PaymentMethod
  notes?: string
  notes_ar?: string
}

export interface InvoiceFilter {
  user_id?: string
  status?: InvoiceStatus
  invoice_type?: InvoiceType
  from_date?: Date
  to_date?: Date
  min_amount?: number
  max_amount?: number
  search?: string
}

export interface PaymentHistoryFilter {
  user_id?: string
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: PaymentMethod
  from_date?: Date
  to_date?: Date
  search?: string
}

export interface InvoiceListItem extends Invoice {
  user_name?: string
  user_email?: string
  is_overdue?: boolean
  days_overdue?: number
}

export interface PaymentHistoryItem extends PaymentHistory {
  invoice_number?: string
  user_name?: string
  user_email?: string
}

export interface InvoicePDFData {
  invoice: Invoice
  user: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  company: {
    name: string
    name_ar: string
    address: string
    address_ar: string
    phone: string
    email: string
    tax_number?: string
    logo_url?: string
  }
}

export interface EmailInvoiceInput {
  invoice_id: string
  recipient_email?: string
  language?: 'ar' | 'en'
  include_pdf?: boolean
}

export interface GenerateReceiptInput {
  invoice_id: string
  amount_paid: number
  payment_method: PaymentMethod
  payment_date?: Date
}

export interface TaxReportInput {
  user_id: string
  tax_year: number
  tax_period?: string
  from_date?: Date
  to_date?: Date
}

export interface InvoiceSearchResult {
  invoices: InvoiceListItem[]
  total_count: number
  total_amount: number
  page: number
  page_size: number
}
