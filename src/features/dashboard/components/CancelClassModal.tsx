import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Calendar, Clock, Info } from 'lucide-react'
import { logger } from '@/lib/logger'
import { cancelClassWithOptions, addCredits } from '@/lib/database'

interface CancelClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classData: {
    id: string
    date: string
    time: string
    student_id: string
    price: number
  }
}

const cancellationReasons = [
  { value: 'schedule_conflict', label: 'تعارض في الجدول' },
  { value: 'health', label: 'سبب صحي / عدم شعور بالراحة' },
  { value: 'emergency', label: 'ظرف عائلي طارئ' },
  { value: 'other', label: 'سبب آخر' },
]

export default function CancelClassModal({
  isOpen,
  onClose,
  onSuccess,
  classData
}: CancelClassModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isWithin12Hours = () => {
    const classDateTime = new Date(`${classData.date}T${classData.time}`)
    const now = new Date()
    const diffHours = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours <= 12
  }

  const policyMessage = useMemo(() => {
    if (isWithin12Hours()) {
      return {
        text: 'تم إلغاء الحصة قبل أقل من 12 ساعة، سيتم خصم الرصيد لدفع أجر المعلم.',
        tone: 'danger' as const,
      }
    }
    return {
      text: 'تم الإلغاء قبل أكثر من 12 ساعة، لا يوجد أي خصم على الرصيد.',
      tone: 'success' as const,
    }
  }, [classData.date, classData.time])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason) {
      setError('يرجى اختيار سبب الإلغاء')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const within12Hours = isWithin12Hours()
      const refundCredits = !within12Hours

      const { error: cancelError } = await cancelClassWithOptions(classData.id, {
        type: 'regular',
        reason: cancellationReasons.find((r) => r.value === selectedReason)?.label || 'إلغاء',
        refundCredits,
      })

      if (cancelError) {
        setError('حدث خطأ في إلغاء الحصة')
        logger.error('Error cancelling class:', cancelError)
        return
      }

      if (refundCredits) {
        const { error: refundError } = await addCredits(classData.student_id, classData.price)
        if (refundError) {
          logger.error('Error refunding credits:', refundError)
        }
      }

      setSelectedReason('')
      onSuccess()
      onClose()
    } catch (err) {
      logger.error('Unexpected error cancelling class:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setError(null)
    setSelectedReason('')
    onClose()
  }

  const handleWhatsAppReschedule = () => {
    const message = `مرحباً، أرغب بإعادة جدولة الحصة بتاريخ ${classData.date} في ${classData.time}.`
    const url = `https://wa.me/966564084838?text=${encodeURIComponent(message)}`
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md md:max-w-lg p-0 overflow-hidden" dir="rtl">
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="arabic-text text-2xl font-bold">
                إلغاء الحصة
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Class Info */}
          <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-3 shadow-sm" dir="rtl">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold arabic-text">حصة اللغة الإنجليزية</p>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs arabic-text">
                <Info className="w-3 h-3" />
                مجدولة
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-700 arabic-text">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>{new Date(classData.date).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>{classData.time} • 60 دقيقة</span>
              </div>
            </div>
          </div>

          {/* Policy Message */}
          <div className={`rounded-3xl border p-5 arabic-text text-sm leading-relaxed shadow-sm ${policyMessage.tone === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-900'}`}>
            {policyMessage.text}
          </div>

          {/* Reason Select */}
          <div className="space-y-2">
            <Label className="arabic-text font-semibold">سبب الإلغاء</Label>
            <Select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              label=""
              className="arabic-text"
              required
            >
              <option value="" disabled>اختر السبب</option>
              {cancellationReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm arabic-text">{error}</p>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="arabic-text w-full"
            >
              إغلاق
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="arabic-text w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              onClick={handleWhatsAppReschedule}
            >
              إعادة جدولة عبر واتساب
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedReason}
              className="arabic-text w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

