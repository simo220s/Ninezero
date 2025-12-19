import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClassSession {
  id: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
}

interface MiniCalendarProps {
  classes: ClassSession[]
}

export default function MiniCalendar({ classes }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getClassesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return classes.filter(c => c.date === dateString)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })

  const weekDays = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']

  const selectedDateClasses = getClassesForDate(selectedDate)

  return (
    <Card className="p-4" dir="rtl">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4" dir="rtl">
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-semibold text-gray-900 arabic-text">
            {monthName}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-600 arabic-text py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before the first day */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            // Adjust for timezone offset to ensure correct date string comparison
            const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            const dateString = localDate.toISOString().split('T')[0]
            const classesOnDate = classes.filter(c => c.date === dateString)

            const hasScheduledClass = classesOnDate.some(c => c.status === 'scheduled')
            const hasCompletedClass = classesOnDate.some(c => c.status === 'completed')
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = selectedDate.toDateString() === date.toDateString()

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer relative transition-all
                  ${isSelected ? 'ring-2 ring-primary-600 ring-offset-2 bg-primary-50' : ''}
                  ${isToday ? 'bg-blue-500 text-white font-bold' : ''}
                  ${!isToday && hasScheduledClass ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                  ${!isToday && hasCompletedClass && !hasScheduledClass ? 'bg-green-100 text-green-700' : ''}
                  ${!isToday && !hasScheduledClass && !hasCompletedClass ? 'text-gray-700 hover:bg-gray-100' : ''}
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                `}
                aria-label={`${day} ${monthName}`}
                aria-pressed={isSelected}
              >
                {day}
                {classesOnDate.length > 0 && (
                  <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-orange-500'}`} aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Classes */}
      <div className="border-t border-gray-200 pt-4 mt-2">
        <h4 className="text-sm font-semibold text-gray-900 arabic-text mb-3">
          حصص {selectedDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}
        </h4>
        {selectedDateClasses.length > 0 ? (
          <div className="space-y-2">
            {selectedDateClasses.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 flex-row-reverse" dir="rtl">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className={`w-2 h-2 rounded-full ${session.status === 'scheduled' ? 'bg-blue-500' :
                      session.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                    }`} aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700 arabic-text">{session.time}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${session.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  } arabic-text`}>
                  {session.status === 'scheduled' ? 'مجدولة' :
                    session.status === 'completed' ? 'مكتملة' : 'ملغية'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2 arabic-text">لا توجد حصص في هذا اليوم</p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-200 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-600 arabic-text">اليوم</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100" />
          <span className="text-xs text-gray-600 arabic-text">مجدولة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100" />
          <span className="text-xs text-gray-600 arabic-text">مكتملة</span>
        </div>
      </div>
    </Card>
  )
}

