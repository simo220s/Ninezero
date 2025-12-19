/**
 * Invoice Service
 * 
 * Business logic for invoice generation, payment history, and receipt management
 * Task 12: Build Invoice and Payment History System
 */

import { supabase } from '../supabase'
import { logger } from '../logger'
import type {
  Invoice,
  InvoiceItem,
  PaymentHistory,
  Receipt,
  TaxDocumentation,
  InvoiceStats,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilter,
  PaymentHistoryFilter,
  InvoiceListItem,
  PaymentHistoryItem,
  EmailInvoiceInput,
  GenerateReceiptInput,
  TaxReportInput,
  InvoiceSearchResult,
} from '@/types/invoice'

class InvoiceService {
  /**
   * Create a new invoice with automatic calculations
   */
  async createInvoice(input: CreateInvoiceInput): Promise<{ data: Invoice | null; error: any }> {
    try {
      // Calculate item totals
      const items = input.items.map((item) => {
        const subtotal = item.quantity * item.unit_price
        const discount = item.discount || 0
        const discountedAmount = subtotal - discount
        const taxRate = input.tax_rate || 15.0
        const taxAmount = (discountedAmount * taxRate) / 100
        const total = discountedAmount + taxAmount

        return {
          id: crypto.randomUUID(),
          description: item.description,
          description_ar: item.description_ar,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: discount,
          tax_amount: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          item_type: item.item_type,
          item_id: item.item_id,
        }
      })

      // Use the stored procedure to create invoice
      const { data: invoiceId, error } = await supabase.rpc('create_invoice', {
        p_user_id: input.user_id,
        p_invoice_type: input.invoice_type,
        p_items: items,
        p_discount_amount: input.discount_amount || 0,
        p_tax_rate: input.tax_rate || 15.0,
        p_payment_method: input.payment_method || null,
        p_notes: input.notes || null,
        p_notes_ar: input.notes_ar || null,
        p_due_days: input.due_days || 7,
      })

      if (error) throw error

      // Fetch the created invoice
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (fetchError) throw fetchError

      logger.log('Invoice created:', invoice.invoice_number)
      return { data: this.mapInvoice(invoice), error: null }
    } catch (error) {
      logger.error('Error creating invoice:', error)
      return { data: null, error }
    }
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(input: UpdateInvoiceInput): Promise<{ data: Invoice | null; error: any }> {
    try {
      const updateData: any = {}

      if (input.status) updateData.status = input.status
      if (input.paid_date) updateData.paid_date = input.paid_date.toISOString().split('T')[0]
      if (input.payment_method) updateData.payment_method = input.payment_method
      if (input.notes !== undefined) updateData.notes = input.notes
      if (input.notes_ar !== undefined) updateData.notes_ar = input.notes_ar

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw error

      logger.log('Invoice updated:', input.id)
      return { data: this.mapInvoice(data), error: null }
    } catch (error) {
      logger.error('Error updating invoice:', error)
      return { data: null, error }
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(
    invoiceId: string,
    paymentMethod: string,
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('mark_invoice_paid', {
        p_invoice_id: invoiceId,
        p_payment_method: paymentMethod,
        p_transaction_id: transactionId || null,
      })

      if (error) throw error

      if (data === true) {
        logger.log('Invoice marked as paid:', invoiceId)
        return { success: true }
      }

      return { success: false, error: 'فشل تحديث حالة الفاتورة' }
    } catch (error: any) {
      logger.error('Error marking invoice as paid:', error)
      return { success: false, error: error.message || 'حدث خطأ أثناء تحديث الفاتورة' }
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<{ data: Invoice | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (error) throw error

      return { data: this.mapInvoice(data), error: null }
    } catch (error) {
      logger.error('Error fetching invoice:', error)
      return { data: null, error }
    }
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<{ data: Invoice | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .single()

      if (error) throw error

      return { data: this.mapInvoice(data), error: null }
    } catch (error) {
      logger.error('Error fetching invoice by number:', error)
      return { data: null, error }
    }
  }

  /**
   * List invoices with filters
   */
  async listInvoices(filter?: InvoiceFilter): Promise<{ data: InvoiceListItem[]; error: any }> {
    try {
      let query = supabase.from('invoices').select('*, profiles!user_id(first_name, last_name, email)')

      if (filter?.user_id) {
        query = query.eq('user_id', filter.user_id)
      }

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      if (filter?.invoice_type) {
        query = query.eq('invoice_type', filter.invoice_type)
      }

      if (filter?.from_date) {
        query = query.gte('invoice_date', filter.from_date.toISOString().split('T')[0])
      }

      if (filter?.to_date) {
        query = query.lte('invoice_date', filter.to_date.toISOString().split('T')[0])
      }

      if (filter?.min_amount !== undefined) {
        query = query.gte('final_amount', filter.min_amount)
      }

      if (filter?.max_amount !== undefined) {
        query = query.lte('final_amount', filter.max_amount)
      }

      if (filter?.search) {
        query = query.or(
          `invoice_number.ilike.%${filter.search}%,notes.ilike.%${filter.search}%,notes_ar.ilike.%${filter.search}%`
        )
      }

      query = query.order('invoice_date', { ascending: false })
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Enhance with additional info
      const enhancedData = data.map((invoice: any) => {
        const isOverdue = invoice.status === 'pending' && new Date(invoice.due_date) < new Date()
        const daysOverdue = isOverdue
          ? Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        return {
          ...this.mapInvoice(invoice),
          user_name: invoice.profiles
            ? `${invoice.profiles.first_name || ''} ${invoice.profiles.last_name || ''}`.trim()
            : undefined,
          user_email: invoice.profiles?.email,
          is_overdue: isOverdue,
          days_overdue: daysOverdue,
        }
      })

      return { data: enhancedData, error: null }
    } catch (error) {
      logger.error('Error listing invoices:', error)
      return { data: [], error }
    }
  }

  /**
   * Search invoices with pagination
   */
  async searchInvoices(
    filter: InvoiceFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: InvoiceSearchResult | null; error: any }> {
    try {
      const offset = (page - 1) * pageSize

      // Get total count
      let countQuery = supabase.from('invoices').select('*', { count: 'exact', head: true })

      if (filter.user_id) countQuery = countQuery.eq('user_id', filter.user_id)
      if (filter.status) countQuery = countQuery.eq('status', filter.status)
      if (filter.invoice_type) countQuery = countQuery.eq('invoice_type', filter.invoice_type)

      const { count, error: countError } = await countQuery

      if (countError) throw countError

      // Get paginated results
      const { data: invoices, error: listError } = await this.listInvoices(filter)

      if (listError) throw listError

      const paginatedInvoices = invoices.slice(offset, offset + pageSize)
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.final_amount, 0)

      return {
        data: {
          invoices: paginatedInvoices,
          total_count: count || 0,
          total_amount: totalAmount,
          page,
          page_size: pageSize,
        },
        error: null,
      }
    } catch (error) {
      logger.error('Error searching invoices:', error)
      return { data: null, error }
    }
  }

  /**
   * Get invoice statistics for a user
   */
  async getInvoiceStats(userId: string): Promise<{ data: InvoiceStats | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_invoice_stats', {
        p_user_id: userId,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          data: {
            total_invoices: 0,
            total_amount: 0,
            total_paid: 0,
            total_pending: 0,
            total_overdue: 0,
            avg_invoice_amount: 0,
            payment_success_rate: 0,
          },
          error: null,
        }
      }

      return { data: data[0] as InvoiceStats, error: null }
    } catch (error) {
      logger.error('Error fetching invoice stats:', error)
      return { data: null, error }
    }
  }

  /**
   * Get payment history with filters
   */
  async getPaymentHistory(
    filter?: PaymentHistoryFilter
  ): Promise<{ data: PaymentHistoryItem[]; error: any }> {
    try {
      let query = supabase
        .from('payment_history')
        .select('*, invoices(invoice_number), profiles!user_id(first_name, last_name, email)')

      if (filter?.user_id) {
        query = query.eq('user_id', filter.user_id)
      }

      if (filter?.payment_status) {
        query = query.eq('payment_status', filter.payment_status)
      }

      if (filter?.payment_method) {
        query = query.eq('payment_method', filter.payment_method)
      }

      if (filter?.from_date) {
        query = query.gte('payment_date', filter.from_date.toISOString())
      }

      if (filter?.to_date) {
        query = query.lte('payment_date', filter.to_date.toISOString())
      }

      if (filter?.search) {
        query = query.or(`transaction_id.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`)
      }

      query = query.order('payment_date', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      const enhancedData = data.map((payment: any) => ({
        ...this.mapPaymentHistory(payment),
        invoice_number: payment.invoices?.invoice_number,
        user_name: payment.profiles
          ? `${payment.profiles.first_name || ''} ${payment.profiles.last_name || ''}`.trim()
          : undefined,
        user_email: payment.profiles?.email,
      }))

      return { data: enhancedData, error: null }
    } catch (error) {
      logger.error('Error fetching payment history:', error)
      return { data: [], error }
    }
  }

  /**
   * Generate receipt for an invoice
   */
  async generateReceipt(input: GenerateReceiptInput): Promise<{ data: Receipt | null; error: any }> {
    try {
      // Get invoice details
      const { data: invoice, error: invoiceError } = await this.getInvoice(input.invoice_id)

      if (invoiceError || !invoice) {
        return { data: null, error: 'الفاتورة غير موجودة' }
      }

      // Create receipt
      const { data, error } = await supabase
        .from('receipts')
        .insert({
          invoice_id: input.invoice_id,
          user_id: invoice.user_id,
          amount_paid: input.amount_paid,
          payment_method: input.payment_method,
          payment_date: input.payment_date?.toISOString() || new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      logger.log('Receipt generated:', data.receipt_number)
      return { data: this.mapReceipt(data), error: null }
    } catch (error) {
      logger.error('Error generating receipt:', error)
      return { data: null, error }
    }
  }

  /**
   * Get receipts for an invoice
   */
  async getInvoiceReceipts(invoiceId: string): Promise<{ data: Receipt[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false })

      if (error) throw error

      return { data: data.map((r) => this.mapReceipt(r)), error: null }
    } catch (error) {
      logger.error('Error fetching invoice receipts:', error)
      return { data: [], error }
    }
  }

  /**
   * Get user receipts
   */
  async getUserReceipts(userId: string): Promise<{ data: Receipt[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false })

      if (error) throw error

      return { data: data.map((r) => this.mapReceipt(r)), error: null }
    } catch (error) {
      logger.error('Error fetching user receipts:', error)
      return { data: [], error }
    }
  }

  /**
   * Generate tax documentation for a period
   */
  async generateTaxDocumentation(
    input: TaxReportInput
  ): Promise<{ data: TaxDocumentation | null; error: any }> {
    try {
      const fromDate = input.from_date || new Date(input.tax_year, 0, 1)
      const toDate = input.to_date || new Date(input.tax_year, 11, 31)
      const taxPeriod = input.tax_period || `${input.tax_year}`

      const { data: docId, error } = await supabase.rpc('generate_tax_documentation', {
        p_user_id: input.user_id,
        p_tax_year: input.tax_year,
        p_tax_period: taxPeriod,
        p_from_date: fromDate.toISOString().split('T')[0],
        p_to_date: toDate.toISOString().split('T')[0],
      })

      if (error) throw error

      // Fetch the created documentation
      const { data: doc, error: fetchError } = await supabase
        .from('tax_documentation')
        .select('*')
        .eq('id', docId)
        .single()

      if (fetchError) throw fetchError

      logger.log('Tax documentation generated:', docId)
      return { data: this.mapTaxDocumentation(doc), error: null }
    } catch (error) {
      logger.error('Error generating tax documentation:', error)
      return { data: null, error }
    }
  }

  /**
   * Get user tax documentation
   */
  async getUserTaxDocumentation(
    userId: string,
    taxYear?: number
  ): Promise<{ data: TaxDocumentation[]; error: any }> {
    try {
      let query = supabase
        .from('tax_documentation')
        .select('*')
        .eq('user_id', userId)
        .order('tax_year', { ascending: false })
        .order('generated_at', { ascending: false })

      if (taxYear) {
        query = query.eq('tax_year', taxYear)
      }

      const { data, error } = await query

      if (error) throw error

      return { data: data.map((d) => this.mapTaxDocumentation(d)), error: null }
    } catch (error) {
      logger.error('Error fetching tax documentation:', error)
      return { data: [], error }
    }
  }

  /**
   * Update overdue invoices (should be run daily)
   */
  async updateOverdueInvoices(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('update_overdue_invoices')

      if (error) throw error

      logger.log(`Updated ${data} overdue invoices`)
      return data || 0
    } catch (error) {
      logger.error('Error updating overdue invoices:', error)
      return 0
    }
  }

  /**
   * Helper: Map database invoice to Invoice type
   */
  private mapInvoice(data: any): Invoice {
    return {
      id: data.id,
      invoice_number: data.invoice_number,
      user_id: data.user_id,
      payment_id: data.payment_id,
      invoice_type: data.invoice_type,
      total_amount: parseFloat(data.total_amount),
      discount_amount: parseFloat(data.discount_amount),
      tax_amount: parseFloat(data.tax_amount),
      tax_rate: parseFloat(data.tax_rate),
      final_amount: parseFloat(data.final_amount),
      currency: data.currency,
      invoice_date: new Date(data.invoice_date),
      due_date: new Date(data.due_date),
      paid_date: data.paid_date ? new Date(data.paid_date) : undefined,
      status: data.status,
      items: data.items || [],
      notes: data.notes,
      notes_ar: data.notes_ar,
      payment_method: data.payment_method,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  }

  /**
   * Helper: Map database payment history to PaymentHistory type
   */
  private mapPaymentHistory(data: any): PaymentHistory {
    return {
      id: data.id,
      user_id: data.user_id,
      invoice_id: data.invoice_id,
      amount: parseFloat(data.amount),
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      transaction_id: data.transaction_id,
      payment_gateway: data.payment_gateway,
      payment_date: new Date(data.payment_date),
      notes: data.notes,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    }
  }

  /**
   * Helper: Map database receipt to Receipt type
   */
  private mapReceipt(data: any): Receipt {
    return {
      id: data.id,
      invoice_id: data.invoice_id,
      receipt_number: data.receipt_number,
      user_id: data.user_id,
      amount_paid: parseFloat(data.amount_paid),
      payment_method: data.payment_method,
      payment_date: new Date(data.payment_date),
      receipt_url: data.receipt_url,
      created_at: new Date(data.created_at),
    }
  }

  /**
   * Helper: Map database tax documentation to TaxDocumentation type
   */
  private mapTaxDocumentation(data: any): TaxDocumentation {
    return {
      id: data.id,
      user_id: data.user_id,
      tax_year: data.tax_year,
      tax_period: data.tax_period,
      total_amount: parseFloat(data.total_amount),
      total_tax: parseFloat(data.total_tax),
      invoice_count: data.invoice_count,
      document_url: data.document_url,
      generated_at: new Date(data.generated_at),
    }
  }
}

export const invoiceService = new InvoiceService()
export default invoiceService
