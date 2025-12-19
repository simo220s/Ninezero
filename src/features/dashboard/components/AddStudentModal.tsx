import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="arabic-text text-2xl">إضافة طالب جديد</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-gray-600 arabic-text">
            سيتم تنفيذ نموذج إضافة الطالب في المرحلة القادمة
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="arabic-text">
              إلغاء
            </Button>
            <Button onClick={() => { onSuccess(); onClose(); }} className="arabic-text">
              إضافة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
