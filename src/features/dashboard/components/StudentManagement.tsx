import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getAllStudents, deleteStudentPermanently } from '@/lib/database'
import { RTLArrow } from '@/components/RTLArrow'
import StudentDetailsModal from './StudentDetailsModal'
import DeleteStudentModal from './DeleteStudentModal'
import { Star, Trash2 } from 'lucide-react'
import { formatStudentName, getStudentInitials } from '@/lib/utils/student-helpers'
import { logger } from '@/lib/logger'

interface Student {
  id: string
  user_id?: string
  name: string
  email: string
  phone?: string
  age: number
  level: string
  is_trial: boolean
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

type FilterType = 'all' | 'trial' | 'active' | 'beginner' | 'intermediate' | 'advanced'

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [showAllStudents, setShowAllStudents] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, activeFilter])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAllStudents()
      
      if (error) {
        setError('حدث خطأ في تحميل بيانات الطلاب')
        logger.error('Error loading students:', error)
      } else {
        setStudents(data || [])
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      logger.error('Students loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = [...students]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase()
        const email = (student.profiles?.email || student.email).toLowerCase()
        const search = searchTerm.toLowerCase()
        
        return fullName.includes(search) || email.includes(search) || student.name.toLowerCase().includes(search)
      })
    }

    // Apply category filter
    switch (activeFilter) {
      case 'trial':
        filtered = filtered.filter(s => s.is_trial)
        break
      case 'active':
        filtered = filtered.filter(s => !s.is_trial)
        break
      case 'beginner':
        filtered = filtered.filter(s => s.level === 'beginner')
        break
      case 'intermediate':
        filtered = filtered.filter(s => s.level === 'intermediate')
        break
      case 'advanced':
        filtered = filtered.filter(s => s.level === 'advanced')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    setFilteredStudents(filtered)
  }

  const getFilterCount = (filter: FilterType): number => {
    switch (filter) {
      case 'all':
        return students.length
      case 'trial':
        return students.filter(s => s.is_trial).length
      case 'active':
        return students.filter(s => !s.is_trial).length
      case 'beginner':
        return students.filter(s => s.level === 'beginner').length
      case 'intermediate':
        return students.filter(s => s.level === 'intermediate').length
      case 'advanced':
        return students.filter(s => s.level === 'advanced').length
      default:
        return 0
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-600'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-600'
      case 'advanced':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
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

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleScheduleClass = (studentId: string) => {
    // TODO: Implement schedule class functionality
    logger.log('Schedule class for student:', studentId)
  }

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return

    try {
      setIsDeleting(true)
      const { error } = await deleteStudentPermanently(
        studentToDelete.id,
        studentToDelete.user_id
      )

      if (error) {
        setError('حدث خطأ في حذف الطالب')
        logger.error('Error deleting student:', error)
        setIsDeleteModalOpen(false)
        return
      }

      // Refresh the students list
      await loadStudents()
      setIsDeleteModalOpen(false)
      setStudentToDelete(null)
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      logger.error('Delete student error:', err)
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Mock function to get student rating (replace with actual API call)
  const getStudentRating = (): number => {
    // TODO: Fetch actual rating from database
    return 4.5 // Mock rating
  }

  const filters = [
    { key: 'all' as FilterType, label: 'جميع الطلاب', icon: '👥' },
    { key: 'trial' as FilterType, label: 'طلاب تجريبيون', icon: '🆓' },
    { key: 'active' as FilterType, label: 'طلاب نشطون', icon: '✅' },
    { key: 'beginner' as FilterType, label: 'مبتدئ', icon: '🌱' },
    { key: 'intermediate' as FilterType, label: 'متوسط', icon: '📈' },
    { key: 'advanced' as FilterType, label: 'متقدم', icon: '🎯' }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">إدارة الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-text-secondary arabic-text">جاري تحميل بيانات الطلاب...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">إدارة الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 arabic-text mb-4">{error}</p>
            <Button onClick={loadStudents} variant="outline" className="arabic-text">
              المحاولة مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="arabic-text flex items-center">
            <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            إدارة الطلاب ({filteredStudents.length})
          </CardTitle>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Input
              placeholder="البحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 arabic-text"
            />
            <Button size="sm" className="arabic-text">
              إضافة طالب
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                activeFilter === filter.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-bg-light text-text-secondary hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              {filter.icon} {filter.label} ({getFilterCount(filter.key)})
            </button>
          ))}
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-text-secondary arabic-text mb-2">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلاب في هذه الفئة'}
            </p>
            {searchTerm && (
              <p className="text-sm text-text-secondary arabic-text">
                جرب البحث بكلمات مختلفة أو امسح مربع البحث
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllStudents ? filteredStudents : filteredStudents.slice(0, 10)).map((student) => (
              <div key={student.id} className="border border-border-light rounded-lg p-4 hover:shadow-custom-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {getStudentInitials(student)}
                      </span>
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-1">
                        <h4 className="font-semibold text-text-primary arabic-text">
                          {formatStudentName(student)}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.is_trial ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {student.is_trial ? 'تجريبي' : 'نشط'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
                          {getLevelText(student.level)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-text-secondary">
                        <span>{student.profiles?.email || student.email}</span>
                        {student.phone && <span>{student.phone}</span>}
                        <span>{student.age} سنة</span>
                        <span>انضم في {formatDate(student.created_at)}</span>
                      </div>
                      
                      {/* Average Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {getStudentRating().toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 arabic-text">(متوسط التقييم)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="arabic-text"
                      onClick={() => handleViewDetails(student)}
                    >
                      عرض التفاصيل
                    </Button>
                    <Button 
                      size="sm" 
                      className="arabic-text"
                      onClick={() => handleScheduleClass(student.user_id || student.id)}
                    >
                      جدولة حصة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="arabic-text bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteClick(student)}
                    >
                      <Trash2 className="w-4 h-4 ms-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Student Details Modal */}
            <StudentDetailsModal
              student={selectedStudent}
              isOpen={isDetailsModalOpen}
              onClose={() => {
                setIsDetailsModalOpen(false)
                setSelectedStudent(null)
              }}
              onScheduleClass={handleScheduleClass}
            />

            {/* Delete Confirmation Modal */}
            <DeleteStudentModal
              isOpen={isDeleteModalOpen}
              onClose={() => {
                setIsDeleteModalOpen(false)
                setStudentToDelete(null)
              }}
              onConfirm={handleDeleteConfirm}
              studentName={studentToDelete ? formatStudentName(studentToDelete) : ''}
            />
            
            {/* Load More Button */}
            {filteredStudents.length > 10 && (
              <div className="text-center pt-6">
                <Button 
                  variant="outline" 
                  className="arabic-text flex items-center gap-2 mx-auto"
                  onClick={() => setShowAllStudents(!showAllStudents)}
                >
                  <RTLArrow 
                    direction={showAllStudents ? "up" : "down"} 
                    size={20} 
                  />
                  {showAllStudents ? 'عرض أقل من الطلاب' : 'عرض المزيد من الطلاب'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
