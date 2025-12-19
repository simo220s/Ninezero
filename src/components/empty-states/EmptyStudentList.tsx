import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface EmptyStudentListProps {
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyStudentList({ 
  message = 'لا يوجد طلاب حالياً',
  actionLabel,
  onAction
}: EmptyStudentListProps) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-2">
        قائمة الطلاب فارغة
      </h3>
      <p className="text-gray-600 arabic-text mb-6">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
