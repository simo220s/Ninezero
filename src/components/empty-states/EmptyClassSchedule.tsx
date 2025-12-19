import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

interface EmptyClassScheduleProps {
  userRole?: 'student' | 'teacher'
  onAddClass?: () => void
}

export default function EmptyClassSchedule({ userRole = 'student', onAddClass }: EmptyClassScheduleProps) {
  return (
    <div className="text-center py-12" dir="rtl">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-2">
        لا توجد حصص قادمة
      </h3>
      
      {userRole === 'student' ? (
        <>
          <p className="text-gray-600 arabic-text mb-6">
            ابدأ بحجز حصتك الأولى الآن
          </p>
          <Button asChild className="arabic-text">
            <Link to="/booking">احجز حصة جديدة</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="text-gray-600 arabic-text mb-6">
            لم يتم إضافة أي حصص بعد. ابدأ بإضافة حصة جديدة
          </p>
          <Button onClick={onAddClass} className="arabic-text">
            إضافة حصة جديدة
          </Button>
        </>
      )}
    </div>
  )
}
