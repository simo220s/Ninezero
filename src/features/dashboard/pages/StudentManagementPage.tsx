/**
 * Student Management Page for English Teaching Business
 * 
 * Comprehensive student management with:
 * - Age group filtering (10-12, 13-15, 16-18)
 * - English level tracking (Beginner, Elementary, Intermediate, Advanced)
 * - Parent contact information with Saudi phone formatting
 * - English skills progress tracking (Speaking, Listening, Reading, Writing)
 * - Bulk operations (import/export)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { logger } from '@/lib/logger'
import { useAuth } from '@/lib/auth-context'
import { Search, Download, Upload, UserPlus, Filter } from 'lucide-react'
import StudentDetailsModal from '@/features/dashboard/components/StudentDetailsModal'
import AddStudentModal from '@/features/dashboard/components/AddStudentModal'
import BulkImportModal from '@/features/dashboard/components/BulkImportModal'
import { DashboardLayout } from '@/components/navigation'
import { LazyAvatar } from '@/components/ui/lazy-image'
import studentService from '@/lib/services/student-service'
import { formatStudentName } from '@/lib/utils/student-helpers'
import {
  cache,
  CacheKeys,
  invalidateCache,
  useLazyLoad,
  useInfiniteScroll,
  useDebounce,
  useDeviceType,
  MobilePerformance,
} from '@/lib/performance'
import { CONTENT_SPACING, EMPTY_STATE_SPACING } from '@/lib/constants/spacing'
import { StudentCardSkeleton } from '@/components/ui/Skeleton'

// Age groups for filtering
export type AgeGroup = '10-12' | '13-15' | '16-18' | 'all'

// English proficiency levels
export type EnglishLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'

// English skills for progress tracking
export type EnglishSkill = 'Speaking' | 'Listening' | 'Reading' | 'Writing' | 'Grammar' | 'Vocabulary'

export interface EnhancedStudent {
  id: string
  user_id?: string
  name: string
  email: string
  age: number
  ageGroup: AgeGroup
  level: string // For compatibility with existing Student interface
  englishLevel: EnglishLevel
  is_trial: boolean
  created_at: string
  
  // Parent contact information
  parentInfo: {
    parentName: string
    phoneNumber: string // Saudi format: +966XXXXXXXXX
    whatsappNumber?: string
    preferredLanguage: 'Arabic' | 'English'
  }
  
  // English skills progress
  skillsProgress: {
    skill: EnglishSkill
    currentLevel: number // 1-10 scale
    improvement: number // progress since last assessment
    lastAssessmentDate: Date
  }[]
  
  // Additional info
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

type FilterType = 'all' | 'trial' | 'active' | AgeGroup | EnglishLevel

export default function StudentManagementPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<EnhancedStudent[]>([])
  const [filteredStudents, setFilteredStudents] = useState<EnhancedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [ageGroupFilter, setAgeGroupFilter] = useState<AgeGroup>('all')
  const [levelFilter, setLevelFilter] = useState<EnglishLevel | 'all'>('all')
  const [error, setError] = useState<string | null>(null)
  
  // Modals
  const [selectedStudent, setSelectedStudent] = useState<EnhancedStudent | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false)

  // Performance optimizations
  const deviceType = useDeviceType()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Adaptive page size based on device
  const pageSize = MobilePerformance.getOptimalPageSize(deviceType)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, debouncedSearchTerm, activeFilter, ageGroupFilter, levelFilter])

  const loadStudents = async () => {
    if (!user?.id) {
      setError('لم يتم العثور على معرف المستخدم')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Check cache first
      const cachedData = cache.get<EnhancedStudent[]>(CacheKeys.STUDENTS_LIST)
      if (cachedData) {
        setStudents(cachedData)
        setLoading(false)
        logger.log('Students loaded from cache')
        return
      }

      // Fetch real students from database
      const { data, error: studentsError } = await studentService.getTeacherStudents(user.id)
      
      if (studentsError) {
        setError('حدث خطأ في تحميل بيانات الطلاب')
        logger.error('Error loading students:', studentsError)
        setLoading(false)
        return
      }

      setStudents(data || [])
      
      // Cache the results
      if (data) {
        cache.set(CacheKeys.STUDENTS_LIST, data, {
          ttl: 5 * 60 * 1000, // 5 minutes
          storage: 'memory'
        })
      }

      logger.log('Students loaded successfully', { count: data?.length || 0 })
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      logger.error('Students loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const _transformToEnhancedStudent = (student: any): EnhancedStudent => {
    // Determine age group
    const age = student.age || 12
    let ageGroup: AgeGroup = '10-12'
    if (age >= 13 && age <= 15) ageGroup = '13-15'
    else if (age >= 16 && age <= 18) ageGroup = '16-18'

    return {
      ...student,
      ageGroup,
      level: student.level || 'beginner',
      englishLevel: (student.level || 'Beginner') as EnglishLevel,
      parentInfo: {
        parentName: student.parent_name || 'غير محدد',
        phoneNumber: student.parent_phone || '+966',
        whatsappNumber: student.parent_whatsapp,
        preferredLanguage: student.parent_language || 'Arabic',
      },
      skillsProgress: student.skills_progress || [
        { skill: 'Speaking', currentLevel: 5, improvement: 0, lastAssessmentDate: new Date() },
        { skill: 'Listening', currentLevel: 5, improvement: 0, lastAssessmentDate: new Date() },
        { skill: 'Reading', currentLevel: 5, improvement: 0, lastAssessmentDate: new Date() },
        { skill: 'Writing', currentLevel: 5, improvement: 0, lastAssessmentDate: new Date() },
      ],
    }
  }

  const filterStudents = () => {
    let filtered = [...students]

    // Search filter (using debounced search term)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(student => {
        const fullName = `${student.profiles?.first_name || ''} ${student.profiles?.last_name || ''}`.toLowerCase()
        const email = (student.profiles?.email || student.email).toLowerCase()
        const parentName = student.parentInfo.parentName.toLowerCase()
        const search = debouncedSearchTerm.toLowerCase()
        
        return fullName.includes(search) || 
               email.includes(search) || 
               student.name.toLowerCase().includes(search) ||
               parentName.includes(search)
      })
    }

    // Age group filter
    if (ageGroupFilter !== 'all') {
      filtered = filtered.filter(s => s.ageGroup === ageGroupFilter)
    }

    // English level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(s => s.englishLevel === levelFilter)
    }

    // Status filter
    if (activeFilter === 'trial') {
      filtered = filtered.filter(s => s.is_trial)
    } else if (activeFilter === 'active') {
      filtered = filtered.filter(s => !s.is_trial)
    }

    setFilteredStudents(filtered)
  }

  // Lazy loading for student list
  const {
    items: displayedStudents,
    hasMore,
    isLoading: isLoadingMore,
    loadMore,
  } = useLazyLoad(filteredStudents, { pageSize })

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore)

  // Bulk operations
  const handleExportStudents = () => {
    try {
      // Use service to generate CSV
      const csv = studentService.exportStudentsToCSV(filteredStudents)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      logger.log('Students exported successfully', { count: filteredStudents.length })
    } catch (err) {
      logger.error('Export error:', err)
      setError('فشل تصدير البيانات')
    }
  }

  const formatSaudiPhone = (phone: string): string => {
    // Format Saudi phone number: +966XXXXXXXXX
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('966')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0')) {
      return `+966${cleaned.substring(1)}`
    }
    return `+966${cleaned}`
  }

  const getLevelColor = (level: EnglishLevel): string => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-700'
      case 'Elementary':
        return 'bg-blue-100 text-blue-700'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'Advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getAgeGroupColor = (ageGroup: AgeGroup): string => {
    switch (ageGroup) {
      case '10-12':
        return 'bg-purple-100 text-purple-700'
      case '13-15':
        return 'bg-indigo-100 text-indigo-700'
      case '16-18':
        return 'bg-pink-100 text-pink-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getFilterCount = (filter: FilterType): number => {
    switch (filter) {
      case 'all':
        return students.length
      case 'trial':
        return students.filter(s => s.is_trial).length
      case 'active':
        return students.filter(s => !s.is_trial).length
      case '10-12':
      case '13-15':
      case '16-18':
        return students.filter(s => s.ageGroup === filter).length
      case 'Beginner':
      case 'Elementary':
      case 'Intermediate':
      case 'Advanced':
        return students.filter(s => s.englishLevel === filter).length
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

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className={CONTENT_SPACING.main}>
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إدارة الطلاب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StudentCardSkeleton />
                <StudentCardSkeleton />
                <StudentCardSkeleton />
                <StudentCardSkeleton />
                <StudentCardSkeleton />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className={CONTENT_SPACING.main}>
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إدارة الطلاب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center ${EMPTY_STATE_SPACING.container}`}>
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
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      showBreadcrumbs 
      onAddStudent={() => setIsAddStudentModalOpen(true)}
    >
      <div className={`${CONTENT_SPACING.main} ${CONTENT_SPACING.section}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 arabic-text">إدارة الطلاب</h1>
          <p className="text-gray-600 arabic-text mt-1">
            إدارة شاملة لطلاب اللغة الإنجليزية (10-18 سنة)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportStudents}
            className="arabic-text flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsBulkImportModalOpen(true)}
            className="arabic-text flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            استيراد
          </Button>
          <Button 
            onClick={() => setIsAddStudentModalOpen(true)}
            className="arabic-text flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            إضافة طالب
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">طلاب نشطون</p>
                <p className="text-2xl font-bold text-green-600">{getFilterCount('active')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">طلاب تجريبيون</p>
                <p className="text-2xl font-bold text-yellow-600">{getFilterCount('trial')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">متوسط العمر</p>
                <p className="text-2xl font-bold text-purple-600">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length)
                    : 0} سنة
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث عن طالب (الاسم، البريد، ولي الأمر)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">الفئة العمرية:</span>
              {(['all', '10-12', '13-15', '16-18'] as const).map((group) => (
                <button
                  key={group}
                  onClick={() => setAgeGroupFilter(group)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    ageGroupFilter === group
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {group === 'all' ? 'الكل' : `${group} سنة`} ({getFilterCount(group)})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">المستوى:</span>
              {(['all', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    levelFilter === level
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'all' ? 'الكل' : level} ({level === 'all' ? students.length : getFilterCount(level)})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 arabic-text">الحالة:</span>
              {(['all', 'active', 'trial'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    activeFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'الكل' : status === 'active' ? 'نشط' : 'تجريبي'} ({getFilterCount(status)})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">
            قائمة الطلاب ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className={`text-center ${EMPTY_STATE_SPACING.container}`}>
              <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto ${EMPTY_STATE_SPACING.icon}`}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 arabic-text mb-2">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلاب في هذه الفئة'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedStudents.map((student) => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar with lazy loading */}
                      <LazyAvatar
                        name={formatStudentName(student)}
                        size="lg"
                        className="flex-shrink-0"
                      />
                      
                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 arabic-text text-lg">
                            {formatStudentName(student)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.is_trial ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {student.is_trial ? 'تجريبي' : 'نشط'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.englishLevel)}`}>
                            {student.englishLevel}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeGroupColor(student.ageGroup)}`}>
                            {student.age} سنة ({student.ageGroup})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>{student.profiles?.email || student.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span className="arabic-text">ولي الأمر: {student.parentInfo.parentName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span dir="ltr">{formatSaudiPhone(student.parentInfo.phoneNumber)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="arabic-text">انضم في {formatDate(student.created_at)}</span>
                          </div>
                        </div>

                        {/* Skills Progress Preview */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {student.skillsProgress.slice(0, 4).map((skill) => (
                            <div key={skill.skill} className="text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-600">{skill.skill}</span>
                                <span className="font-medium text-gray-900">{skill.currentLevel}/10</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${skill.currentLevel * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="arabic-text whitespace-nowrap"
                        onClick={() => {
                          setSelectedStudent(student)
                          setIsDetailsModalOpen(true)
                        }}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button 
                        size="sm" 
                        className="arabic-text whitespace-nowrap"
                      >
                        جدولة حصة
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-gray-600 arabic-text">تحميل المزيد...</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="arabic-text"
                    >
                      تحميل المزيد ({filteredStudents.length - displayedStudents.length} متبقي)
                    </Button>
                  )}
                </div>
              )}
              
              {/* Performance info (dev mode only) */}
              {import.meta.env.DEV && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>عرض {displayedStudents.length} من {filteredStudents.length}</span>
                    <span>الجهاز: {deviceType}</span>
                    <span>حجم الصفحة: {pageSize}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedStudent(null)
          }}
          onScheduleClass={() => {}}
        />
      )}
      
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSuccess={() => {
          invalidateCache.students()
          loadStudents()
        }}
      />
      
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onSuccess={() => {
          invalidateCache.students()
          loadStudents()
        }}
      />
      </div>
    </DashboardLayout>
  )
}
