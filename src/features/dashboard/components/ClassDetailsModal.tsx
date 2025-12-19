import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Clock, Video, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import CancelClassModal from './CancelClassModal'
import { Badge } from '@/components/ui/badge'

interface ClassDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classData: {
    id: string
    date: string
    time: string
    duration: number
    meeting_link?: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
    price?: number
    student_id?: string
    subject?: string
  }
  userRole?: 'student' | 'teacher'
}

export default function ClassDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  classData,
  userRole = 'student'
}: ClassDetailsModalProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  }

  const isUpcoming = () => {
    const classDateTime = new Date(`${classData.date}T${classData.time}`)
    return classDateTime > new Date()
  }

  const canJoin = () => {
    const classDateTime = new Date(`${classData.date}T${classData.time}`)
    const now = new Date()
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 10 && diffMinutes > -60
  }

  const handleJoinClass = () => {
    if (classData.meeting_link && canJoin()) {
      window.open(classData.meeting_link, '_blank')
    }
  }

  const getStatusBadge = () => {
    switch (classData.status) {
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
            <CheckCircle className="w-3 h-3 ml-1" />
            مجدولة
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle className="w-3 h-3 ml-1" />
            مكتملة
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <XCircle className="w-3 h-3 ml-1" />
            ملغاة
          </Badge>
        )
      case 'no-show':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
            <AlertCircle className="w-3 h-3 ml-1" />
            غياب
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <div className="relative p-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 rounded-full w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {/* Header Section */}
            <DialogHeader className="pb-4 pr-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="arabic-text text-xl font-bold text-gray-900 mb-2">
                    {classData.subject || 'حصة اللغة الإنجليزية'}
                  </DialogTitle>
                  {getStatusBadge()}
                </div>
              </div>
            </DialogHeader>

            {/* Body Section */}
            <div className="space-y-3 py-2">
              {/* Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 arabic-text mb-1">التاريخ</p>
                  <p className="text-base text-gray-900 arabic-text font-medium">
                    {formatDate(classData.date)}
                  </p>
                </div>
              </div>

              {/* Time & Duration */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 arabic-text mb-1">الوقت</p>
                  <p className="text-base text-gray-900 font-medium">
                    {formatTime(classData.time)} • {classData.duration} دقيقة
                  </p>
                </div>
              </div>

              {/* Meeting Link - Only for scheduled classes */}
              {classData.meeting_link && classData.status === 'scheduled' && (
                <div className="pt-2">
                  <Button
                    size="lg"
                    onClick={handleJoinClass}
                    disabled={!canJoin()}
                    className="arabic-text w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-5 h-5 ml-2" />
                    {canJoin() ? 'انضم للحصة الآن' : 'قريباً'}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Section - Action Buttons */}
            <DialogFooter className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              {classData.status === 'scheduled' && isUpcoming() && userRole === 'student' && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsCancelModalOpen(true)
                  }}
                  className="arabic-text w-full min-h-[44px] bg-red-600 hover:bg-red-700"
                >
                  <X className="w-5 h-5 ml-2" />
                  إلغاء الحصة
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="arabic-text text-blue-500 hover:text-blue-600 w-full min-h-[44px]"
              >
                إغلاق
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Class Modal for Students */}
      {userRole === 'student' && classData.student_id && (
        <CancelClassModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onSuccess={() => {
            onSuccess()
            setIsCancelModalOpen(false)
            onClose()
          }}
          classData={{
            id: classData.id,
            date: classData.date,
            time: classData.time,
            student_id: classData.student_id,
            price: classData.price || 0
          }}
        />
      )}
    </>
  )
}
