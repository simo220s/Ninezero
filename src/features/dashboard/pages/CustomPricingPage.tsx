/**
 * Custom Pricing Management Page
 * 
 * Teacher dashboard page for managing custom pricing for individual students
 * Requirement 9.2: Interface for teachers to set custom pricing
 */

import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { DollarSign, Search, ArrowRight, Edit, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import TeacherSidebar from '../components/TeacherSidebar'
import CustomPricingModal from '../components/CustomPricingModal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import Footer from '@/components/Footer'
import customPricingService from '@/lib/services/custom-pricing-service'

interface StudentWithPricing {
  id: string
  name: string
  email: string
  defaultPrice: number
  customPrice?: number
  hasCustomPrice: boolean
}

export default function CustomPricingPage() {
  const { user, getUserRole } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [students, setStudents] = useState<StudentWithPricing[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentWithPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState<StudentWithPricing | null>(null)
  const [removing, setRemoving] = useState(false)

  // Redirect if not a teacher
  if (!user || getUserRole() !== 'teacher') {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === '') {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  const loadStudents = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await customPricingService.getStudentsWithPricing(user.id)
      setStudents(data)
      setFilteredStudents(data)
      
      logger.info('Students with pricing loaded', { count: data.length })
    } catch (error) {
      logger.error('Failed to load students', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCustomPrice = async () => {
    if (!studentToRemove || !user) return

    setRemoving(true)
    try {
      await customPricingService.removeCustomPrice(studentToRemove.id, user.id)
      
      logger.info('Custom pricing removed', {
        studentId: studentToRemove.id,
        studentName: studentToRemove.name
      })

      // Update local state
      setStudents(students.map(s =>
        s.id === studentToRemove.id
          ? { ...s, customPrice: undefined, hasCustomPrice: false }
          : s
      ))

      setStudentToRemove(null)
    } catch (error) {
      logger.error('Failed to remove custom pricing', error)
    } finally {
      setRemoving(false)
    }
  }

  const studentsWithCustomPricing = students.filter(s => s.hasCustomPrice)
  const studentsWithDefaultPricing = students.filter(s => !s.hasCustomPrice)

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Sidebar */}
      <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-border-light sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden"
                  aria-label="فتح القائمة الجانبية"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
                <h1 className="text-2xl font-bold text-text-primary arabic-text">
                  الأسعار المخصصة
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="arabic-text">
                  <Link to="/dashboard/teacher" className="flex items-center gap-2">
                    <span>العودة</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Page Description */}
          <div className="mb-6">
            <p className="text-text-secondary arabic-text text-right">
              قم بتعيين أسعار مخصصة للطلاب الأفراد. يمكنك تطبيق أسعار مختلفة عن السعر الافتراضي لكل طالب.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
                dir="rtl"
              />
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="arabic-text flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              تعيين سعر مخصص
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Students with Custom Pricing */}
              {studentsWithCustomPricing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text text-right">
                      الطلاب بأسعار مخصصة ({studentsWithCustomPricing.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredStudents
                        .filter(s => s.hasCustomPrice)
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            dir="rtl"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-primary arabic-text">
                                {student.name}
                              </h3>
                              <p className="text-sm text-text-secondary">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500 arabic-text line-through">
                                  {student.defaultPrice} ريال
                                </p>
                                <p className="text-lg font-bold text-primary-600 arabic-text">
                                  {student.customPrice} ريال
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Open modal with this student pre-selected
                                    setIsModalOpen(true)
                                  }}
                                  className="arabic-text"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setStudentToRemove(student)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Students with Default Pricing */}
              {studentsWithDefaultPricing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="arabic-text text-right">
                      الطلاب بالسعر الافتراضي ({studentsWithDefaultPricing.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredStudents
                        .filter(s => !s.hasCustomPrice)
                        .map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            dir="rtl"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-text-primary arabic-text">
                                {student.name}
                              </h3>
                              <p className="text-sm text-text-secondary">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-lg font-semibold text-text-primary arabic-text">
                                {student.defaultPrice} ريال
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                className="arabic-text"
                              >
                                تعيين سعر مخصص
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {filteredStudents.length === 0 && (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">
                        لا توجد نتائج
                      </h3>
                      <p className="text-text-secondary arabic-text">
                        {searchTerm ? 'لم يتم العثور على طلاب مطابقين لبحثك' : 'لا يوجد طلاب'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Custom Pricing Modal */}
      <CustomPricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
        onSuccess={loadStudents}
      />

      {/* Remove Custom Price Confirmation */}
      <ConfirmationDialog
        open={!!studentToRemove}
        onOpenChange={(open) => !removing && !open && setStudentToRemove(null)}
        onConfirm={handleRemoveCustomPrice}
        title="إزالة السعر المخصص"
        description={
          studentToRemove
            ? `هل أنت متأكد من إزالة السعر المخصص للطالب ${studentToRemove.name}؟ سيتم تطبيق السعر الافتراضي ${studentToRemove.defaultPrice} ريال.`
            : ''
        }
        confirmText="إزالة"
        cancelText="إلغاء"
        variant="warning"
        loading={removing}
      />
    </div>
  )
}
