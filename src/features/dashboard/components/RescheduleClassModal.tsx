import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Clock } from 'lucide-react'
import { logger } from '@/lib/logger'
import { updateClassSession } from '@/lib/database'

interface RescheduleClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classData: {
    id: string
    date: string
    time: string
    duration: number
    meeting_link?: string
  }
}

export default function RescheduleClassModal({
  isOpen,
  onClose,
  onSuccess,
  classData
}: RescheduleClassModalProps) {
  const [newDate, setNewDate] = useState(classData.date)
  const [newTime, setNewTime] = useState(classData.time)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDate || !newTime) {
      setError('يرجى تحديد التاريخ والوقت الجديدين')
      return
    }

    // Validate that new date/time is in the future (teachers can reschedule anytime)
    const newDateTime = new Date(`${newDate}T${newTime}`)
    if (newDateTime <= new Date()) {
      setError('يرجى اختيار تاريخ ووقت في المستقبل')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const { error: updateError } = await updateClassSession(classData.id, {
        date: newDate,
        time: newTime
      })

      if (updateError) {
        setError('حدث خطأ في إعادة جدولة الحصة')
        logger.error('Error rescheduling class:', updateError)
        return
      }

      logger.log('Class rescheduled successfully', { 
        classId: classData.id, 
        newDate, 
        newTime 
      })

      onSuccess()
      onClose()
    } catch (err) {
      logger.error('Unexpected error rescheduling class:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNewDate(classData.date)
      setNewTime(classData.time)
      setError(null)
      onClose()
    }
  }

  const formatCurrentDateTime = () => {
    const date = new Date(`${classData.date}T${classData.time}`)
    return date.toLocaleString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="arabic-text text-xl">
              إعادة جدولة الحصة
            </DialogTitle>
          </div>
          <DialogDescription className="arabic-text">
            يمكنك إعادة جدولة الحصة في أي وقت بدون قيود. اختر التاريخ والوقت الجديدين.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Schedule */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Label className="arabic-text text-sm font-medium text-gray-600 mb-2 block">
              الجدولة الحالية
            </Label>
            <p className="text-gray-900 arabic-text font-medium">
              {formatCurrentDateTime()}
            </p>
          </div>

          {/* New Date */}
          <div>
            <Label htmlFor="newDate" className="arabic-text flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              التاريخ الجديد
            </Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="arabic-text mt-1"
              required
            />
          </div>

          {/* New Time */}
          <div>
            <Label htmlFor="newTime" className="arabic-text flex items-center gap-2">
              <Clock className="w-4 h-4" />
              الوقت الجديد
            </Label>
            <Input
              id="newTime"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="arabic-text mt-1"
              required
            />
          </div>

          {/* Duration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 arabic-text">
              <span className="font-medium">مدة الحصة:</span> {classData.duration} دقيقة
            </p>
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
              {isSubmitting ? 'جاري إعادة الجدولة...' : 'تأكيد إعادة الجدولة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

