import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getAllStudents, createClassSession, getUserCredits } from '@/lib/database'
import { useAuth } from '@/lib/auth-context'
import { z } from 'zod'
import { handleError, isOnline } from '@/lib/error-handling'
import { AlertCircle, CheckCircle, Coins } from 'lucide-react'

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Validation schema
const classSchema = z.object({
  studentId: z.string().min(1, 'يرجى اختيار طالب'),
  date: z.string().refine(date => new Date(date) > new Date(), {
    message: 'التاريخ يجب أن يكون في المستقبل'
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة'),
  duration: z.number().min(15, 'المدة يجب أن تكون 15 دقيقة على الأقل').max(180, 'المدة يجب أن تكون 180 دقيقة كحد أقصى'),
  meetingLink: z.string().url('رابط غير صحيح').refine(
    link => link.includes('meet.google.com'),
    { message: 'يجب أن يكون رابط Google Meet' }
  ),
  recurring: z.boolean(),
  recurrencePattern: z.enum(['weekly', 'biweekly']).optional()
})

type ClassFormData = z.infer<typeof classSchema>

export default function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
  const { user } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [studentCredits, setStudentCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  const [formData, setFormData] = useState<ClassFormData>({
    studentId: '',
    date: '',
    time: '',
    duration: 60,
    meetingLink: '',
    recurring: false,
    recurrencePattern: 'weekly'
  })

  useEffect(() => {
    if (isOpen) {
      loadStudents()
    }
  }, [isOpen])

  const loadStudents = async () => {
    setLoading(true)
    setErrors({})
    
    // Check network connectivity
    if (!isOnline()) {
      setErrors({ general: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك.' })
      setLoading(false)
      return
    }
    
    try {
      const { data, error } = await getAllStudents()
      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      logger.error('Error loading students:', err)
      const errorMessage = handleError(err)
      setErrors({ general: errorMessage || 'فشل تحميل قائمة الطلاب. يرجى المحاولة مرة أخرى.' })
    } finally {
      setLoading(false)
    }
  }

  const loadStudentCredits = async (studentId: string) => {
    if (!studentId) {
      setStudentCredits(null)
      return
    }

    try {
      setLoadingCredits(true)
      const { data, error } = await getUserCredits(studentId)
      
      if (error) {
        logger.error('Error loading student credits:', error)
        setStudentCredits(null)
        return
      }

      setStudentCredits(data?.credits || 0)
    } catch (err) {
      logger.error('Error loading student credits:', err)
      setStudentCredits(null)
    } finally {
      setLoadingCredits(false)
    }
  }

  const handleChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Load credits when student is selected
    if (field === 'studentId') {
      loadStudentCredits(value)
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Check network connectivity
    if (!isOnline()) {
      setErrors({ general: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.' })
      return
    }
    
    try {
      // Validate form data
      const validatedData = classSchema.parse(formData)
      
      if (!user?.id) {
        setErrors({ general: 'يجب تسجيل الدخول لإضافة حصة' })
        return
      }
      
      setSubmitting(true)
      
      // Create class session in database with retry logic
      const { error } = await createClassSession({
        studentId: validatedData.studentId,
        teacherId: user.id,
        date: validatedData.date,
        time: validatedData.time,
        duration: validatedData.duration,
        meetingLink: validatedData.meetingLink,
        recurring: validatedData.recurring,
        recurrencePattern: validatedData.recurrencePattern
      })
      
      if (error) {
        logger.error('Error creating class:', error)
        const errorMessage = handleError(error)
        setErrors({ general: errorMessage || 'حدث خطأ أثناء إنشاء الحصة. يرجى المحاولة مرة أخرى.' })
        return
      }
      
      // Success!
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        studentId: '',
        date: '',
        time: '',
        duration: 60,
        meetingLink: '',
        recurring: false,
        recurrencePattern: 'weekly'
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.issues.forEach((issue: z.ZodIssue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else {
        const errorMessage = handleError(err)
        setErrors({ general: errorMessage || 'حدث خطأ أثناء إنشاء الحصة. يرجى المحاولة مرة أخرى.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="arabic-text text-2xl text-gray-900">إضافة حصة جديدة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-gray-900">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-700 arabic-text">{errors.general}</p>
                    {errors.general.includes('اتصال') && (
                      <button
                        type="button"
                        onClick={loadStudents}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline arabic-text"
                        aria-label="إعادة المحاولة"
                      >
                        إعادة المحاولة
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Selection */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-900 arabic-text mb-2">
              اختر الطالب *
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              <>
                <select
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 arabic-text text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.studentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="" className="text-gray-900">-- اختر طالباً --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.user_id} className="text-gray-900">
                      {student.profiles?.first_name} {student.profiles?.last_name} ({student.profiles?.email})
                    </option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600 arabic-text">{errors.studentId}</p>
                )}
              </>
            )}
            
            {/* Student Credit Balance Display */}
            {formData.studentId && (
              <div className="mt-3">
                {loadingCredits ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Spinner size="sm" />
                    <span className="arabic-text">جاري تحميل الرصيد...</span>
                  </div>
                ) : studentCredits !== null ? (
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    studentCredits >= 1 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    {studentCredits >= 1 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <span className={`font-semibold ${
                          studentCredits >= 1 ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          رصيد الطالب: {studentCredits} حصة
                        </span>
                      </div>
                      {studentCredits < 1 && (
                        <p className="text-xs text-yellow-700 arabic-text mt-1">
                          تنبيه: رصيد الطالب غير كافٍ لحجز حصة كاملة
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Date & Time - Enhanced UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-900 arabic-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                التاريخ *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={submitting}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 arabic-text flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.date}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-900 arabic-text mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                الوقت *
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={submitting}
                />
              </div>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 arabic-text flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          {/* Duration - Enhanced UI */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-900 arabic-text mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              المدة (دقيقة) *
            </label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-4 py-2.5 arabic-text text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                errors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={submitting}
            >
              <option value="30" className="text-gray-900">30 دقيقة</option>
              <option value="45" className="text-gray-900">45 دقيقة</option>
              <option value="60" className="text-gray-900">60 دقيقة (موصى به)</option>
              <option value="90" className="text-gray-900">90 دقيقة</option>
              <option value="120" className="text-gray-900">120 دقيقة</option>
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 arabic-text flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.duration}
              </p>
            )}
          </div>

          {/* Meeting Link - Enhanced UI */}
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-900 arabic-text mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              رابط Google Meet *
            </label>
            <div className="flex-1 relative">
              <input
                type="url"
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.meetingLink ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={submitting}
              />
              {formData.meetingLink && formData.meetingLink.includes('meet.google.com') && !errors.meetingLink && (
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.meetingLink ? (
              <p className="mt-1 text-sm text-red-600 arabic-text flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.meetingLink}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 arabic-text">
                تأكد من أن الرابط يبدأ بـ https://meet.google.com/
              </p>
            )}
          </div>

          {/* Recurring Option */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => handleChange('recurring', e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={submitting}
                aria-describedby="recurring-description"
              />
              <label htmlFor="recurring" className="text-sm text-gray-900 arabic-text">
                حصة متكررة
              </label>
            </div>

            {formData.recurring && (
              <div className="mr-8" role="region" aria-label="إعدادات التكرار">
                <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-900 arabic-text mb-2">
                  نمط التكرار
                </label>
                <select
                  id="recurrencePattern"
                  value={formData.recurrencePattern}
                  onChange={(e) => handleChange('recurrencePattern', e.target.value as 'weekly' | 'biweekly')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 arabic-text text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={submitting}
                  aria-label="اختر نمط تكرار الحصة"
                >
                  <option value="weekly" className="text-gray-900">أسبوعياً</option>
                  <option value="biweekly" className="text-gray-900">كل أسبوعين</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={submitting}
              className="arabic-text"
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              className="arabic-text"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="ms-2" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة الحصة'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
