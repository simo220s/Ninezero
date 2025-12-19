import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { logger } from '@/lib/logger'
import financialService from '@/lib/services/financial-service'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  teacherId: string
}

const expenseCategories = [
  'مواد تعليمية',
  'أدوات مكتبية',
  'برامج وتطبيقات',
  'إنترنت واتصالات',
  'نقل ومواصلات',
  'أخرى'
]

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  teacherId
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    category: 'أخرى',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      setError('يرجى إدخال وصف المصروف')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const { data, error: expenseError } = await financialService.createExpense(teacherId, {
        category: formData.category,
        description: formData.description,
        amount: amount,
        date: formData.date,
        receipt: formData.receipt || undefined,
      })

      if (expenseError) {
        logger.error('Error creating expense:', expenseError)
        setError(expenseError.message || 'حدث خطأ في إضافة المصروف')
        return
      }

      if (data) {
        logger.log('Expense created successfully:', data)
        // Reset form
        setFormData({
          category: 'أخرى',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          receipt: ''
        })
        onSuccess()
        onClose()
      }
    } catch (err) {
      logger.error('Unexpected error creating expense:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        category: 'أخرى',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        receipt: ''
      })
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="arabic-text text-xl">
            إضافة مصروف جديد
          </DialogTitle>
          <DialogDescription className="arabic-text">
            أدخل تفاصيل المصروف لتسجيله في السجل المالي
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category" className="arabic-text">الفئة</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 arabic-text"
              required
            >
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description" className="arabic-text">الوصف</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف المصروف..."
              className="arabic-text mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount" className="arabic-text">المبلغ (ر.س)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="arabic-text mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="date" className="arabic-text">التاريخ</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="arabic-text mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="receipt" className="arabic-text">رابط الإيصال (اختياري)</Label>
            <Input
              id="receipt"
              type="url"
              value={formData.receipt}
              onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
              placeholder="https://..."
              className="arabic-text mt-1"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm arabic-text">{error}</p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="arabic-text w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="arabic-text w-full sm:w-auto"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'إضافة المصروف'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

