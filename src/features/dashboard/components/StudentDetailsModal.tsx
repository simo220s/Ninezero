import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { User, Calendar, Star, CreditCard, Mail, Phone, Clock } from 'lucide-react'
import { formatStudentName, getStudentInitials } from '@/lib/utils/student-helpers'
import { logger } from '@/lib/logger'

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  age: number
  level: string
  is_trial: boolean
  created_at: string
  user_id?: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface StudentDetailsModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onScheduleClass?: (studentId: string) => void
}

export default function StudentDetailsModal({
  student,
  isOpen,
  onClose,
  onScheduleClass
}: StudentDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [classHistory, setClassHistory] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info')

  useEffect(() => {
    if (student && isOpen) {
      loadStudentDetails()
    }
  }, [student, isOpen])

  const loadStudentDetails = async () => {
    if (!student) return

    setLoading(true)
    try {
      // TODO: Load actual data from database
      // For now, using mock data
      
      // Mock class history
      setClassHistory([
        {
          id: '1',
          date: '2024-10-20',
          time: '10:00',
          duration: 60,
          status: 'completed',
          rating: 5
        },
        {
          id: '2',
          date: '2024-10-18',
          time: '14:00',
          duration: 60,
          status: 'completed',
          rating: 4
        },
        {
          id: '3',
          date: '2024-10-15',
          time: '10:00',
          duration: 60,
          status: 'completed',
          rating: 5
        }
      ])

      // Mock average rating
      setAverageRating(4.7)

      // Mock credit balance
      setCreditBalance(5.5)
    } catch (error) {
      logger.error('Error loading student details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ'
      case 'intermediate':
        return 'متوسط'
      case 'advanced':
        return 'متقدم'
      default:
        return 'غير محدد'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="arabic-text text-2xl flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">
                {getStudentInitials(student)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {formatStudentName(student)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.is_trial ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                }`}>
                  {student.is_trial ? 'تجريبي' : 'نشط'}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-primary-700 arabic-text">رصيد الحصص</span>
                </div>
                <div className="text-2xl font-bold text-primary-900">{creditBalance}</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700 arabic-text">متوسط التقييم</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-900">
                    {averageRating?.toFixed(1) || 'N/A'}
                  </div>
                  {averageRating && renderStars(Math.round(averageRating))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 arabic-text">الحصص المكتملة</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {classHistory.filter(c => c.status === 'completed').length}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors arabic-text ${
                    activeTab === 'info'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  المعلومات الشخصية
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors arabic-text ${
                    activeTab === 'history'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  سجل الحصص
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="space-y-4 mt-4">
                {/* Personal Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-bg-light rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 arabic-text">البريد الإلكتروني</div>
                      <div className="font-medium">{student.profiles?.email || student.email}</div>
                    </div>
                  </div>

                  {student.phone && (
                    <div className="flex items-center gap-3 p-3 bg-bg-light rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500 arabic-text">رقم الهاتف</div>
                        <div className="font-medium">{student.phone}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-bg-light rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 arabic-text">العمر</div>
                      <div className="font-medium">{student.age} سنة</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-bg-light rounded-lg">
                    <Star className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 arabic-text">المستوى</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(student.level)}`}>
                        {getLevelText(student.level)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-bg-light rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500 arabic-text">تاريخ الانضمام</div>
                      <div className="font-medium">{formatDate(student.created_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {activeTab === 'history' && (
                <div className="mt-4">
                {classHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 arabic-text">لا توجد حصص مسجلة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classHistory.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border border-border-light rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium">{formatDate(classItem.date)}</div>
                            <div className="text-sm text-gray-600">
                              {classItem.time} • {classItem.duration} دقيقة
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {classItem.rating && renderStars(classItem.rating)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            classItem.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {classItem.status === 'completed' ? 'مكتملة' : classItem.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} className="arabic-text">
                إغلاق
              </Button>
              {onScheduleClass && (
                <Button
                  onClick={() => {
                    onScheduleClass(student.user_id || student.id)
                    onClose()
                  }}
                  className="arabic-text"
                >
                  <Calendar className="w-4 h-4 ms-2" />
                  جدولة حصة
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
