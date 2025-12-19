import { formatDate, formatTime } from '@/lib/formatters'

export interface ClassEntry {
  id: string
  student_name: string
  start_time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
  type?: string
  notes?: string
}

interface ClassEntryCardProps {
  classEntry: ClassEntry
  className?: string
}

export function ClassEntryCard({ classEntry, className = '' }: ClassEntryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغية'
      case 'in_progress':
        return 'جارية'
      default:
        return 'غير محدد'
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{classEntry.student_name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classEntry.status)}`}>
              {getStatusText(classEntry.status)}
            </span>
          </div>
          
          {classEntry.type && (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
              classEntry.type === 'trial' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-primary-100 text-primary-700'
            }`}>
              {classEntry.type === 'trial' ? 'جلسة تجريبية' : 'حصة منتظمة'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {/* Date */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(classEntry.start_time)}</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(classEntry.start_time)} ({classEntry.duration} دقيقة)</span>
        </div>

        {/* Notes */}
        {classEntry.notes && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-700">{classEntry.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}
