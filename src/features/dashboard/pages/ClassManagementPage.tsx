/**
 * Class Management Page for English Lessons
 * 
 * Features:
 * - English lesson scheduling with Google Meet
 * - Class type management (Individual, Group, Assessment, Trial)
 * - Duration and pricing by age group
 * - Class history and attendance tracking
 * - Cancellation and rescheduling with refunds
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { updateClassSession } from '@/lib/database'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import { Calendar, Clock, Video, Users, Search, Plus, X, Edit } from 'lucide-react'
import AddClassModal from '@/features/dashboard/components/AddClassModal'
import CancelClassModal from '@/features/dashboard/components/CancelClassModal'
import RescheduleClassModal from '@/features/dashboard/components/RescheduleClassModal'
import { DashboardLayout } from '@/components/navigation'
import {
  cache,
  CacheKeys,
  invalidateCache,
  useLazyLoad,
  useInfiniteScroll,
  useDebounce,
  useDeviceType,
  MobilePerformance,
  OptimizedClassQueries,
} from '@/lib/performance'
import { CONTENT_SPACING, EMPTY_STATE_SPACING } from '@/lib/constants/spacing'
import { ClassCardSkeleton } from '@/components/ui/Skeleton'

// Class types for English lessons
export type ClassType = 'Individual' | 'Group' | 'Assessment' | 'Trial'

// Class status
export type ClassStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show'

export interface EnglishClass {
  id: string
  student_id: string
  teacher_id: string
  date: string
  time: string
  duration: number
  meeting_link: string
  status: ClassStatus
  class_type: ClassType
  age_group: '10-12' | '13-15' | '16-18'
  price: number
  attendance_marked: boolean
  cancellation_reason?: string
  created_at: string
  updated_at: string
  student?: {
    first_name: string
    last_name: string
    email: string
    age: number
  }
}

// Pricing by age group and class type
const PRICING_MATRIX = {
  'Individual': {
    '10-12': 150,
    '13-15': 175,
    '16-18': 200,
  },
  'Group': {
    '10-12': 100,
    '13-15': 125,
    '16-18': 150,
  },
  'Assessment': {
    '10-12': 100,
    '13-15': 100,
    '16-18': 100,
  },
  'Trial': {
    '10-12': 0,
    '13-15': 0,
    '16-18': 0,
  },
}

export default function ClassManagementPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<EnglishClass[]>([])
  const [filteredClasses, setFilteredClasses] = useState<EnglishClass[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClassType | 'all'>('all')
  const [error, setError] = useState<string | null>(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<EnglishClass | null>(null)

  // Performance optimizations
  const deviceType = useDeviceType()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const pageSize = MobilePerformance.getOptimalPageSize(deviceType)

  useEffect(() => {
    if (user?.id) {
      loadClasses()
    }
  }, [user])

  useEffect(() => {
    filterClasses()
  }, [classes, debouncedSearchTerm, statusFilter, typeFilter])

  const loadClasses = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Check cache first
      const cachedData = cache.get<EnglishClass[]>(CacheKeys.CLASSES_LIST)
      if (cachedData) {
        setClasses(cachedData)
        setLoading(false)
        logger.log('Classes loaded from cache')
        return
      }

      // Use optimized query
      const { data, error } = await OptimizedClassQueries.getTeacherClassesList(user.id)

      if (error) {
        setError('حدث خطأ في تحميل بيانات الحصص')
        logger.error('Error loading classes:', error)
      } else {
        const enhancedData = (data || []).map(transformToEnglishClass)
        setClasses(enhancedData)
        
        // Cache the results
        cache.set(CacheKeys.CLASSES_LIST, enhancedData, {
          ttl: 3 * 60 * 1000, // 3 minutes
          storage: 'memory'
        })
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      logger.error('Classes loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const transformToEnglishClass = (cls: any): EnglishClass => {
    const age = cls.student?.age || 12
    let ageGroup: '10-12' | '13-15' | '16-18' = '10-12'
    if (age >= 13 && age <= 15) ageGroup = '13-15'
    else if (age >= 16 && age <= 18) ageGroup = '16-18'

    const classType: ClassType = cls.is_trial ? 'Trial' : (cls.class_type || 'Individual')
    const price = PRICING_MATRIX[classType]?.[ageGroup] || 0

    return {
      ...cls,
      class_type: classType,
      age_group: ageGroup,
      price,
      attendance_marked: cls.attendance_marked || false,
    }
  }

  const filterClasses = () => {
    let filtered = [...classes]

    // Filter to show only upcoming scheduled classes by default (when status filter is 'all')
    if (statusFilter === 'all') {
      filtered = filtered.filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`)
        return classDateTime > new Date() && cls.status === 'scheduled'
      })
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(cls => {
        const studentName = `${cls.student?.first_name || ''} ${cls.student?.last_name || ''}`.toLowerCase()
        const search = debouncedSearchTerm.toLowerCase()
        return studentName.includes(search) || cls.id.toLowerCase().includes(search)
      })
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cls => cls.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(cls => cls.class_type === typeFilter)
    }

    // Sort by date and time (upcoming first for default view, or by status filter)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      
      // If showing all or specific status, show upcoming first
      if (statusFilter === 'all' || statusFilter === 'scheduled') {
        return dateA.getTime() - dateB.getTime() // Ascending for upcoming classes
      } else {
        // For completed/cancelled, show most recent first
        return dateB.getTime() - dateA.getTime()
      }
    })

    setFilteredClasses(filtered)
  }

  // Lazy loading for class list
  const {
    items: displayedClasses,
    hasMore,
    isLoading: isLoadingMore,
    loadMore,
  } = useLazyLoad(filteredClasses, { pageSize })

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore)

  const handleCancelClass = (cls: EnglishClass) => {
    setSelectedClass(cls)
    setIsCancelModalOpen(true)
  }

  const handleRescheduleClass = (cls: EnglishClass) => {
    setSelectedClass(cls)
    setIsRescheduleModalOpen(true)
  }

  const handleMarkAttendance = async (classId: string, attended: boolean) => {
    try {
      const status: ClassStatus = attended ? 'completed' : 'no-show'
      const { error } = await updateClassSession(classId, { status })
      
      if (error) {
        logger.error('Error marking attendance:', error)
        setError('فشل تسجيل الحضور')
      } else {
        invalidateCache.classes()
        await loadClasses()
        logger.log('Attendance marked successfully')
      }
    } catch (err) {
      logger.error('Attendance error:', err)
      setError('حدث خطأ أثناء تسجيل الحضور')
    }
  }

  const getStatusColor = (status: ClassStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'no-show':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: ClassStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة'
      case 'completed':
        return 'مكتملة'
      case 'cancelled':
        return 'ملغاة'
      case 'no-show':
        return 'غياب'
      default:
        return status
    }
  }

  const getTypeColor = (type: ClassType): string => {
    switch (type) {
      case 'Individual':
        return 'bg-purple-100 text-purple-700'
      case 'Group':
        return 'bg-indigo-100 text-indigo-700'
      case 'Assessment':
        return 'bg-yellow-100 text-yellow-700'
      case 'Trial':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeText = (type: ClassType): string => {
    switch (type) {
      case 'Individual':
        return 'فردية'
      case 'Group':
        return 'جماعية'
      case 'Assessment':
        return 'تقييم'
      case 'Trial':
        return 'تجريبية'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const isUpcoming = (date: string, time: string): boolean => {
    const classDateTime = new Date(`${date}T${time}`)
    return classDateTime > new Date()
  }

  const getFilterCount = (filter: ClassStatus | ClassType | 'all'): number => {
    if (filter === 'all') return classes.length
    
    if (['scheduled', 'completed', 'cancelled', 'no-show'].includes(filter)) {
      return classes.filter(c => c.status === filter).length
    }
    
    return classes.filter(c => c.class_type === filter).length
  }

  const calculateMonthlyRevenue = (): number => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return classes
      .filter(c => {
        const classDate = new Date(c.date)
        return c.status === 'completed' && 
               classDate.getMonth() === currentMonth && 
               classDate.getFullYear() === currentYear
      })
      .reduce((sum, c) => sum + c.price, 0)
  }

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className={CONTENT_SPACING.main}>
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إدارة الحصص</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ClassCardSkeleton />
                <ClassCardSkeleton />
                <ClassCardSkeleton />
                <ClassCardSkeleton />
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
              <CardTitle className="arabic-text">إدارة الحصص</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center ${EMPTY_STATE_SPACING.container}`}>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 arabic-text mb-4">{error}</p>
                <Button onClick={loadClasses} variant="outline" className="arabic-text">
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
      onAddClass={() => setIsAddClassModalOpen(true)}
    >
      <div className={`${CONTENT_SPACING.main} ${CONTENT_SPACING.section}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 arabic-text">إدارة الحصص</h1>
          <p className="text-gray-600 arabic-text mt-1">
            جدولة وإدارة حصص اللغة الإنجليزية
          </p>
        </div>
        <Button 
          onClick={() => setIsAddClassModalOpen(true)}
          className="arabic-text flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة حصة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي الحصص</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">حصص مجدولة</p>
                <p className="text-2xl font-bold text-blue-600">{getFilterCount('scheduled')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">حصص مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{getFilterCount('completed')}</p>
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
                <p className="text-sm text-gray-600 arabic-text">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold text-purple-600">{calculateMonthlyRevenue()} ر.س</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث عن حصة (اسم الطالب، رقم الحصة)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 arabic-text">الحالة:</span>
              {(['all', 'scheduled', 'completed', 'cancelled', 'no-show'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'الكل' : getStatusText(status)} ({status === 'all' ? classes.length : getFilterCount(status)})
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 arabic-text">النوع:</span>
              {(['all', 'Individual', 'Group', 'Assessment', 'Trial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors arabic-text ${
                    typeFilter === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'الكل' : getTypeText(type)} ({type === 'all' ? classes.length : getFilterCount(type)})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">
            قائمة الحصص ({filteredClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className={`text-center ${EMPTY_STATE_SPACING.container}`}>
              <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto ${EMPTY_STATE_SPACING.icon}`}>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 arabic-text mb-2">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد حصص في هذه الفئة'}
              </p>
              <Button 
                onClick={() => setIsAddClassModalOpen(true)}
                className="arabic-text mt-4"
              >
                إضافة حصة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedClasses.map((cls) => (
                <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Class Icon */}
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUpcoming(cls.date, cls.time) ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {cls.class_type === 'Group' ? (
                          <Users className={`w-7 h-7 ${isUpcoming(cls.date, cls.time) ? 'text-blue-600' : 'text-gray-600'}`} />
                        ) : (
                          <Video className={`w-7 h-7 ${isUpcoming(cls.date, cls.time) ? 'text-blue-600' : 'text-gray-600'}`} />
                        )}
                      </div>
                      
                      {/* Class Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 arabic-text text-lg">
                            {cls.student?.first_name} {cls.student?.last_name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.status)}`}>
                            {getStatusText(cls.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(cls.class_type)}`}>
                            {getTypeText(cls.class_type)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {cls.age_group} سنة
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="arabic-text">{formatDate(cls.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(cls.time)} ({cls.duration} دقيقة)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <a 
                              href={cls.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              رابط Google Meet
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{cls.price} ر.س</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {cls.status === 'scheduled' && (
                        <>
                          {isUpcoming(cls.date, cls.time) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="arabic-text whitespace-nowrap"
                              onClick={() => window.open(cls.meeting_link, '_blank')}
                            >
                              <Video className="w-4 h-4 ml-1" />
                              الانضمام
                            </Button>
                          )}
                          {/* Teacher can reschedule anytime - no limits */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="arabic-text whitespace-nowrap"
                            onClick={() => handleRescheduleClass(cls)}
                          >
                            <Calendar className="w-4 h-4 ml-1" />
                            إعادة جدولة
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="arabic-text whitespace-nowrap text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelClass(cls)}
                          >
                            <X className="w-4 h-4 ml-1" />
                            إلغاء
                          </Button>
                        </>
                      )}
                      
                      {cls.status === 'scheduled' && !isUpcoming(cls.date, cls.time) && !cls.attendance_marked && (
                        <>
                          <Button 
                            size="sm"
                            className="arabic-text whitespace-nowrap bg-green-600 hover:bg-green-700"
                            onClick={() => handleMarkAttendance(cls.id, true)}
                          >
                            حضر
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="arabic-text whitespace-nowrap"
                            onClick={() => handleMarkAttendance(cls.id, false)}
                          >
                            غاب
                          </Button>
                        </>
                      )}
                      
                      {cls.status === 'completed' && (
                        <div className="text-sm text-green-600 arabic-text font-medium">
                          ✓ مكتملة
                        </div>
                      )}
                      
                      {cls.status === 'cancelled' && (
                        <div className="text-sm text-red-600 arabic-text font-medium">
                          ✗ ملغاة
                        </div>
                      )}
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
                      تحميل المزيد ({filteredClasses.length - displayedClasses.length} متبقي)
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onSuccess={() => {
          invalidateCache.classes()
          loadClasses()
          setIsAddClassModalOpen(false)
        }}
      />

      {/* Cancel Class Modal */}
      {selectedClass && (
        <CancelClassModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false)
            setSelectedClass(null)
          }}
          onSuccess={() => {
            invalidateCache.classes()
            loadClasses()
            setIsCancelModalOpen(false)
            setSelectedClass(null)
          }}
          classData={{
            id: selectedClass.id,
            date: selectedClass.date,
            time: selectedClass.time,
            student_id: selectedClass.student_id,
            price: selectedClass.price
          }}
        />
      )}

      {/* Reschedule Class Modal */}
      {selectedClass && (
        <RescheduleClassModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false)
            setSelectedClass(null)
          }}
          onSuccess={() => {
            invalidateCache.classes()
            loadClasses()
            setIsRescheduleModalOpen(false)
            setSelectedClass(null)
          }}
          classData={{
            id: selectedClass.id,
            date: selectedClass.date,
            time: selectedClass.time,
            duration: selectedClass.duration,
            meeting_link: selectedClass.meeting_link
          }}
        />
      )}
      </div>
    </DashboardLayout>
  )
}
