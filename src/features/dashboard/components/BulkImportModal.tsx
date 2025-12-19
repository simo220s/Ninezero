import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="arabic-text text-2xl">استيراد الطلاب</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-gray-600 arabic-text mb-4">
            قم بتحميل ملف CSV يحتوي على بيانات الطلاب
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 arabic-text">اسحب الملف هنا أو انقر للتحميل</p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="arabic-text">
              إلغاء
            </Button>
            <Button onClick={() => { onSuccess(); onClose(); }} className="arabic-text">
              استيراد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
