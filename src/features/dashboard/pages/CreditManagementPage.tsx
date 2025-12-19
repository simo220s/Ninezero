/**
 * Credit Management Page
 * Add and manage student class credits - FULLY FUNCTIONAL
 * Enhanced with CreditService and Toast Notifications
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { getAllStudents, getUserCredits } from '@/lib/database'
import { logger } from '@/lib/logger'
import { Plus, DollarSign, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'
import { formatStudentName } from '@/lib/utils/student-helpers'
import { CreditManagementForm } from '@/features/dashboard/components/CreditManagementForm'
import { useAuth } from '@/lib/auth-context'
import { CONTENT_SPACING, EMPTY_STATE_SPACING } from '@/lib/constants/spacing'
import { CreditManagementSkeleton } from '@/components/ui/Skeleton'

interface Student {
  id: string
  user_id: string // This is the actual user ID we need for credits!
  name: string
  email: string
  is_trial: boolean
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
  credits?: number
}

export default function CreditManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      
      const { data: studentsData, error: studentsError } = await getAllStudents()
      
      if (studentsError) {
        logger.error('Error loading students:', studentsError)
        setStudents([])
        return
      }

      if (!studentsData) {
        setStudents([])
        return
      }
      
      // Load credits for each student using their user_id
      const studentsWithCredits = await Promise.all(
        studentsData.map(async (student) => {
          // Use user_id, not student id!
          const { data: credits } = await getUserCredits(student.user_id)
          return { 
            ...student, 
            credits: credits?.credits || 0,
            name: formatStudentName(student)
          }
        })
      )

      setStudents(studentsWithCredits)
      logger.log(`Loaded ${studentsWithCredits.length} students with credits`)
    } catch (err) {
      logger.error('Error loading students:', err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreditAdded = async () => {
    // Reload students to show updated credits
    await loadStudents()
  }

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className={`${CONTENT_SPACING.maxWidth} ${CONTENT_SPACING.main}`}>
          <CreditManagementSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showBreadcrumbs>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className={`${CONTENT_SPACING.maxWidth} ${CONTENT_SPACING.main} ${CONTENT_SPACING.section}`}>
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 arabic-text">
            💰 إدارة رصيد الحصص
          </h1>
          <p className="text-gray-700 arabic-text mt-2">
            إضافة وإدارة رصيد الحصص للطلاب
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text mb-1">إجمالي الرصيد</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {students.reduce((sum, s) => sum + (s.credits || 0), 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 arabic-text mt-1">حصة</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text mb-1">طلاب نشطون</p>
                  <p className="text-3xl font-bold text-green-600">
                    {students.filter(s => !s.is_trial && (s.credits || 0) > 0).length}
                  </p>
                  <p className="text-xs text-gray-500 arabic-text mt-1">لديهم رصيد</p>
                </div>
                <Users className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text mb-1">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold text-purple-600">{students.length}</p>
                  <p className="text-xs text-gray-500 arabic-text mt-1">طالب</p>
                </div>
                <Users className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Credit Form */}
        <CreditManagementForm
          students={students}
          teacherId={user?.id || ''}
          onSuccess={handleCreditAdded}
        />

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text text-gray-900">قائمة الطلاب وأرصدتهم</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className={`text-center ${EMPTY_STATE_SPACING.container} text-gray-500`}>
                <Users className={`w-16 h-16 mx-auto ${EMPTY_STATE_SPACING.icon} opacity-30`} />
                <p className="arabic-text">لا يوجد طلاب حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-bold arabic-text text-gray-900 text-lg">
                        {formatStudentName(student)}
                      </p>
                      <p className="text-sm text-gray-600">{student.profiles?.email}</p>
                      <p className="text-xs text-gray-500 arabic-text mt-1">
                        {student.is_trial ? '🎓 طالب تجريبي' : '💎 طالب منتظم'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-black text-blue-600">{student.credits || 0}</p>
                        <p className="text-xs text-gray-600 arabic-text">حصة</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="arabic-text bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 ms-1" />
                        إضافة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
