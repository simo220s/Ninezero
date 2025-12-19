import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { handleError, isOnline } from '@/lib/error-handling'
import { logger } from '@/lib/logger'

interface Student {
  id: string
  name: string
  email: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface ConvertStudentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ConvertStudentModal({ 
  student, 
  isOpen, 
  onClose,
  onSuccess 
}: ConvertStudentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = async () => {
    if (!student) {
      setError('لم يتم تحديد طالب للتحويل')
      return
    }

    // Check network connectivity
    if (!isOnline()) {
      setError('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      logger.log('Converting student:', student.id)

      // Import the conversion function
      const { convertTrialStudent } = await import('@/lib/database')
      
      // Convert the student (with retry logic built-in)
      const result = await convertTrialStudent(student.id)
      
      logger.log('Conversion result:', result)
      
      if (result.error) {
        logger.error('Conversion error from database:', result.error)
        throw new Error(result.error.message || 'فشل تحويل الطالب')
      }

      // Success - show success message
      logger.log('Student converted successfully')
      
      // Close modal and refresh
      onSuccess()
      onClose()
      
      // Show success notification
      alert('تم تحويل الطالب بنجاح! ✅')
    } catch (err) {
      logger.error('Conversion error:', err)
      const errorMessage = handleError(err)
      setError(errorMessage || 'حدث خطأ أثناء تحويل الطالب. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const studentName = student?.profiles 
    ? `${student.profiles.first_name} ${student.profiles.last_name}`
    : student?.name || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="arabic-text text-xl">
            تحويل إلى طالب نظامي
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-gray-700 arabic-text">
            هل تريد تحويل <strong className="text-primary-600">{studentName}</strong> من طالب تجريبي إلى طالب نظامي؟
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200" role="region" aria-label="مزايا التحويل">
            <h4 className="font-semibold text-blue-900 arabic-text mb-3">
              ما سيحدث:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 arabic-text" role="list">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 ms-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                الوصول إلى لوحة التحكم الكاملة
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 ms-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                القدرة على حجز حصص منتظمة
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 ms-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                إمكانية إضافة رصيد الحصص
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 ms-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                الوصول إلى نظام الإحالة
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert" aria-live="polite">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-700 text-sm arabic-text">{error}</p>
                  {error.includes('اتصال') && (
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={loading}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline arabic-text disabled:opacity-50"
                      aria-label="إعادة المحاولة"
                    >
                      إعادة المحاولة
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="arabic-text"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleConvert}
              disabled={loading}
              className="arabic-text"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="ms-2" />
                  جاري التحويل...
                </>
              ) : (
                'تحويل الآن'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
