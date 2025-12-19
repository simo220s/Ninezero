import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface DeleteStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  studentName: string
}

export default function DeleteStudentModal({
  isOpen,
  onClose,
  onConfirm,
  studentName
}: DeleteStudentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      logger.error('Error deleting student:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="arabic-text text-xl">
              حذف الطالب نهائياً
            </DialogTitle>
          </div>
          <DialogDescription className="arabic-text text-base pt-4">
            <p className="mb-4 text-text-primary">
              هل أنت متأكد من حذف الطالب <strong>{studentName}</strong> نهائياً؟
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 arabic-text font-medium mb-2">
              ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
              </p>
              <ul className="text-xs text-red-700 arabic-text space-y-1 list-disc list-inside">
                <li>سيتم حذف جميع بيانات الطالب</li>
                <li>سيتم حذف جميع الحصص المرتبطة</li>
                <li>سيتم حذف جميع التقييمات</li>
                <li>سيتم حذف الرصيد المتبقي</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="arabic-text w-full sm:w-auto"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="arabic-text w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف نهائياً'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

