/**
 * Saved Timeslots Component
 * 
 * Component for managing saved preferred time slots
 * Task 13: Implement Wishlist and Favorites System
 */

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, Trash2, Plus, User } from 'lucide-react'
import { wishlistService } from '@/lib/services/wishlist-service'
import type { SavedTimeslotWithDetails, SaveTimeslotInput } from '@/types/wishlist'
import { useAuth } from '@/hooks/useAuth'

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد', labelEn: 'Sunday' },
  { value: 1, label: 'الإثنين', labelEn: 'Monday' },
  { value: 2, label: 'الثلاثاء', labelEn: 'Tuesday' },
  { value: 3, label: 'الأربعاء', labelEn: 'Wednesday' },
  { value: 4, label: 'الخميس', labelEn: 'Thursday' },
  { value: 5, label: 'الجمعة', labelEn: 'Friday' },
  { value: 6, label: 'السبت', labelEn: 'Saturday' },
]

export const SavedTimeslots: React.FC = () => {
  const { user } = useAuth()
  const [timeslots, setTimeslots] = useState<SavedTimeslotWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>()

  useEffect(() => {
    if (user) {
      loadTimeslots()
    }
  }, [user, selectedTeacher])

  const loadTimeslots = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await wishlistService.getSavedTimeslots(user.id, selectedTeacher)

    if (!error && data) {
      setTimeslots(data)
    }

    setLoading(false)
  }

  const handleDeleteTimeslot = async (timeslotId: string) => {
    const { success } = await wishlistService.deleteTimeslot(timeslotId)

    if (success) {
      setTimeslots(timeslots.filter(slot => slot.id !== timeslotId))
    }
  }

  const handleBookTimeslot = (timeslot: SavedTimeslotWithDetails) => {
    // TODO: Navigate to booking page with pre-filled timeslot
    alert(`حجز حصة في ${getDayLabel(timeslot.day_of_week)} ${timeslot.start_time}`)
  }

  const getDayLabel = (dayOfWeek: number): string => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || ''
  }

  const formatTime = (time: string): string => {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'م' : 'ص'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const groupTimeslotsByDay = () => {
    const grouped: Record<number, SavedTimeslotWithDetails[]> = {}
    
    timeslots.forEach(slot => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = []
      }
      grouped[slot.day_of_week].push(slot)
    })

    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const groupedTimeslots = groupTimeslotsByDay()

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الأوقات المحفوظة</h2>
          <p className="text-gray-600 mt-1">
            {timeslots.length} وقت محفوظ
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          إضافة وقت
        </button>
      </div>

      {/* Teacher Filter */}
      {/* TODO: Add teacher selection dropdown */}

      {/* Timeslots */}
      {timeslots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد أوقات محفوظة
          </h3>
          <p className="text-gray-600 mb-4">
            احفظ أوقاتك المفضلة لحجز الحصص بسهولة
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إضافة وقت محفوظ
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map(day => {
            const daySlots = groupedTimeslots[day.value]
            if (!daySlots || daySlots.length === 0) return null

            return (
              <div key={day.value} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {day.label}
                </h3>

                <div className="space-y-3">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                          {slot.is_recurring && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              متكرر
                            </span>
                          )}
                        </div>

                        {slot.teacher_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <User className="w-4 h-4" />
                            <span>{slot.teacher_name}</span>
                          </div>
                        )}

                        {slot.notes && (
                          <p className="text-sm text-gray-600">
                            {slot.notes}
                          </p>
                        )}

                        {slot.next_occurrence && (
                          <p className="text-xs text-green-600 mt-2">
                            الموعد القادم: {new Date(slot.next_occurrence).toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookTimeslot(slot)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          حجز
                        </button>
                        <button
                          onClick={() => handleDeleteTimeslot(slot.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Timeslot Modal */}
      {showAddModal && (
        <AddTimeslotModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadTimeslots()
          }}
        />
      )}
    </div>
  )
}

// Add Timeslot Modal Component
interface AddTimeslotModalProps {
  onClose: () => void
  onSuccess: () => void
}

const AddTimeslotModal: React.FC<AddTimeslotModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [dayOfWeek, setDayOfWeek] = useState(0)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [isRecurring, setIsRecurring] = useState(true)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return

    setLoading(true)

    const input: SaveTimeslotInput = {
      user_id: user.id,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      is_recurring: isRecurring,
      notes: notes || undefined,
    }

    const { data, error } = await wishlistService.saveTimeslot(input)

    setLoading(false)

    if (!error && data) {
      onSuccess()
    } else {
      alert('حدث خطأ أثناء حفظ الوقت')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          إضافة وقت محفوظ
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اليوم *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="text-sm text-gray-700">
              وقت متكرر أسبوعياً
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="أضف ملاحظات..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavedTimeslots
