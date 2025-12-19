import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getUserAppointments } from '@/lib/database'
import { useAuth } from '@/lib/auth-context'
import { ReviewForm, type ReviewSubmission } from '@/components/ReviewForm'
import type { ClassSession } from '@/types'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PendingReviews() {
  const { user } = useAuth()
  const [completedClasses, setCompletedClasses] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadCompletedClasses()
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        logger.error('Error loading profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (err) {
      logger.error('Profile loading error:', err)
    }
  }

  const loadCompletedClasses = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await getUserAppointments(user.id)
      
      if (error) {
        logger.error('Error loading classes:', error)
      } else {
        // Filter completed classes that need reviews (assuming we track review status)
        const needsReview = (data || [])
          .filter(cls => 
            cls.status === 'completed' && 
            new Date(cls.appointmentDate) < new Date()
            // In a real app, you'd also check if review already exists
          )
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
        
        setCompletedClasses(needsReview)
      }
    } catch (err) {
      logger.error('Classes loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (cls: ClassSession) => {
    setSelectedClass(cls)
    setShowReviewModal(true)
  }

  const handleReviewSubmit = async (data: ReviewSubmission) => {
    if (!user) {
      throw new Error('يجب تسجيل الدخول لترك تقييم')
    }

    try {
      // Get student name from profile or user metadata
      const firstName = userProfile?.first_name || user.user_metadata?.first_name || 'طالب'
      const lastName = userProfile?.last_name || user.user_metadata?.last_name || ''
      const studentName = `${firstName} ${lastName}`.trim()

      // Insert review into database
      const { error } = await supabase
        .from('reviews')
        .insert({
          student_id: user.id,
          student_name: studentName,
          rating: data.rating,
          comment: data.comment,
          is_approved: false
        })

      if (error) throw error

      // Remove the class from pending reviews
      if (selectedClass) {
        setCompletedClasses(prev => prev.filter(cls => cls.id !== selectedClass.id))
      }

      // Close modal
      setShowReviewModal(false)
      setSelectedClass(null)

      alert('تم إرسال التقييم بنجاح! سيتم عرضه بعد الموافقة عليه.')
    } catch (error) {
      logger.error('Error submitting review:', error)
      throw error
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">التقييمات المعلقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (completedClasses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">التقييمات المعلقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-text-secondary arabic-text">
              لا توجد حصص تحتاج لتقييم حالياً
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center">
            <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            التقييمات المعلقة ({completedClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedClasses.map((cls) => (
              <div key={cls.id} className="border border-border-light rounded-md p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary arabic-text mb-2">
                      حصة مع الأستاذ أحمد
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-4">
                      <span className="arabic-text">{formatDate(cls.appointmentDate.toString())}</span>
                      <span className="arabic-text">
                        {cls.appointmentType === 'trial' ? 'جلسة تجريبية' : 'حصة منتظمة'}
                      </span>
                      <span className="arabic-text">{cls.duration} دقيقة</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleReviewClick(cls)}
                    size="sm"
                    className="arabic-text"
                  >
                    اترك تقييم
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 arabic-text">
              💡 تقييمك يساعدنا على تحسين جودة التعليم وتطوير خدماتنا. شكراً لك!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="arabic-text">اترك تقييمك</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedClass && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 arabic-text mb-1">حصة مع الأستاذ أحمد</p>
                <p className="text-sm text-gray-500 arabic-text">
                  {formatDate(selectedClass.appointmentDate.toString())}
                </p>
              </div>
            )}
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
