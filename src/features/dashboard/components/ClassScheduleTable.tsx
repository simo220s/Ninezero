import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { deleteClassSession } from '@/lib/database'
import { ClassTableSkeleton } from '@/components/skeletons'
import { EmptyClassSchedule } from '@/components/empty-states'
import { handleError, isOnline } from '@/lib/error-handling'
import { logger } from '@/lib/logger'

interface ClassSession {
  id: string
  className?: string // Name of the class/subject
  instructorName?: string // Name of the instructor
  date: string // ISO date string
  time: string // HH:MM format
  duration: number // minutes
  meetingLink?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  studentName?: string // For teacher view
}

interface ClassScheduleTableProps {
  classes: ClassSession[]
  userRole?: 'student' | 'teacher'
  loading?: boolean
  onEdit?: (classId: string) => void
  onDelete?: (classId: string) => void
  onRefresh?: () => void
}

export default function ClassScheduleTable({ 
  classes = [], 
  userRole = 'student',
  loading = false,
  onEdit,
  onDelete,
  onRefresh
}: ClassScheduleTableProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all')
  const [filterStudent, setFilterStudent] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Get unique student names for filter dropdown
  const uniqueStudents = useMemo(() => {
    const students = new Set<string>()
    classes.forEach(cls => {
      if (cls.studentName) {
        students.add(cls.studentName)
      }
    })
    return Array.from(students).sort()
  }, [classes])

  // Sort and filter classes
  const sortedClasses = useMemo(() => {
    let filtered = [...classes]
    
    // Apply status filter
    if (filterStatus === 'upcoming') {
      filtered = filtered.filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`)
        return classDateTime.getTime() > new Date().getTime()
      })
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`)
        return classDateTime.getTime() < new Date().getTime()
      })
    }
    
    // Apply student filter (for teacher view)
    if (filterStudent !== 'all' && userRole === 'teacher') {
      filtered = filtered.filter(cls => cls.studentName === filterStudent)
    }
    
    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    })
  }, [classes, sortOrder, filterStatus, filterStudent, userRole])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
      return
    }

    // Check network connectivity
    if (!isOnline()) {
      setDeleteError('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.')
      return
    }
    
    setDeleting(classId)
    setDeleteError(null)
    
    try {
      const { error } = await deleteClassSession(classId)
      if (error) {
        throw error
      }
      
      // Refresh the list
      if (onRefresh) {
        onRefresh()
      }
      if (onDelete) {
        onDelete(classId)
      }
    } catch (err) {
      logger.error('Delete error:', err)
      const errorMessage = handleError(err)
      setDeleteError(errorMessage || 'حدث خطأ أثناء حذف الحصة. يرجى المحاولة مرة أخرى.')
    } finally {
      setDeleting(null)
    }
  }

  // Check if class is upcoming (within 24 hours)
  const isUpcoming = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffHours = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 24
  }

  // Check if join button should be enabled (10 minutes before)
  const canJoinClass = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMinutes = (classDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 10 && diffMinutes > -60 // Can join 10 min before until 60 min after
  }

  // Check if class is in the past
  const isPast = (date: string, time: string) => {
    const classDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return classDateTime.getTime() < now.getTime()
  }

  const getStatusBadge = (status: ClassSession['status']) => {
    const badges = {
      scheduled: {
        icon: <Clock className="w-4 h-4" />,
        text: 'مجدولة',
        className: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'مكتملة',
        className: 'bg-success-100 text-success-700 border-success-200'
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        text: 'ملغاة',
        className: 'bg-gray-100 text-gray-700 border-gray-200'
      },
      'no-show': {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'غياب',
        className: 'bg-red-100 text-red-700 border-red-200'
      }
    }

    const badge = badges[status]
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}>
        {badge.icon}
        <span className="arabic-text">{badge.text}</span>
      </span>
    )
  }

  if (loading) {
    return <ClassTableSkeleton />
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">جدول الحصص</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyClassSchedule userRole={userRole} onAddClass={onEdit ? () => onEdit('') : undefined} />
        </CardContent>
      </Card>
    )
  }

  // Check if filtered results are empty
  const hasFilteredResults = sortedClasses.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="arabic-text">جدول الحصص</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="تصفية الحصص">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded text-sm arabic-text transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={filterStatus === 'all'}
                aria-label="عرض جميع الحصص"
              >
                الكل
              </button>
              <button
                onClick={() => setFilterStatus('upcoming')}
                className={`px-3 py-1 rounded text-sm arabic-text transition-colors ${
                  filterStatus === 'upcoming' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={filterStatus === 'upcoming'}
                aria-label="عرض الحصص القادمة فقط"
              >
                القادمة
              </button>
              <button
                onClick={() => setFilterStatus('past')}
                className={`px-3 py-1 rounded text-sm arabic-text transition-colors ${
                  filterStatus === 'past' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={filterStatus === 'past'}
                aria-label="عرض الحصص السابقة فقط"
              >
                السابقة
              </button>
            </div>
            
            {/* Student Filter (Teacher only) */}
            {userRole === 'teacher' && uniqueStudents.length > 0 && (
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm arabic-text bg-white hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors"
                aria-label="تصفية حسب الطالب"
              >
                <option value="all">جميع الطلاب</option>
                {uniqueStudents.map(student => (
                  <option key={student} value={student}>{student}</option>
                ))}
              </select>
            )}
            
            {/* Sort Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleSortOrder}
              className="arabic-text"
              aria-label={`ترتيب الحصص: ${sortOrder === 'asc' ? 'من الأقدم للأحدث' : 'من الأحدث للأقدم'}`}
            >
              {sortOrder === 'asc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="assertive">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-red-700 arabic-text">{deleteError}</p>
                <button
                  type="button"
                  onClick={() => setDeleteError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline arabic-text"
                  aria-label="إغلاق رسالة الخطأ"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty filtered results state */}
        {!hasFilteredResults && (
          <div className="text-center py-12" dir="rtl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-2">
              لا توجد حصص تطابق الفلتر المحدد
            </h3>
            <p className="text-gray-600 arabic-text">
              جرب تغيير خيارات الفلتر لعرض حصص أخرى
            </p>
          </div>
        )}
        
        {/* Desktop: Table View */}
        {hasFilteredResults && (
          <div className="hidden md:block overflow-x-auto" dir="rtl">
          <table className="w-full" role="table" aria-label="جدول الحصص الدراسية">
            <thead className="bg-gray-50 border-b border-gray-200" role="rowgroup">
              <tr role="row">
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  اسم الحصة
                </th>
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  المعلم
                </th>
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  التاريخ
                </th>
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  الوقت
                </th>
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  المدة
                </th>
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  الحالة
                </th>
                {userRole === 'teacher' && (
                  <th 
                    role="columnheader" 
                    scope="col" 
                    className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                  >
                    الطالب
                  </th>
                )}
                <th 
                  role="columnheader" 
                  scope="col" 
                  className="px-4 py-3 text-right arabic-text font-semibold text-gray-700"
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedClasses.map((classSession) => {
                const upcoming = isUpcoming(classSession.date, classSession.time)
                const past = isPast(classSession.date, classSession.time)
                const canJoin = canJoinClass(classSession.date, classSession.time)

                return (
                  <tr
                    key={classSession.id}
                    className={`
                      border-b border-gray-100 transition-colors
                      ${upcoming ? 'bg-yellow-50 border-r-4 border-r-yellow-500' : ''}
                      ${past && classSession.status === 'scheduled' ? 'opacity-60' : ''}
                      hover:bg-gray-50
                    `}
                  >
                    <td className="px-4 py-4">
                      <span className="arabic-text font-medium text-gray-900">
                        {classSession.className || 'حصة دراسية'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="arabic-text text-gray-900">
                        {classSession.instructorName || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="arabic-text font-medium text-gray-900">
                          {new Date(classSession.date).toLocaleDateString('ar-SA', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="arabic-text font-medium text-gray-900">
                          {classSession.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="arabic-text text-gray-700">
                        {classSession.duration} دقيقة
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(classSession.status)}
                    </td>
                    {userRole === 'teacher' && (
                      <td className="px-4 py-4">
                        <span className="arabic-text text-gray-900">
                          {classSession.studentName || '-'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2" role="group" aria-label="إجراءات الحصة">
                        {classSession.meetingLink && classSession.status === 'scheduled' && (
                          <Button
                            size="sm"
                            disabled={!canJoin}
                            onClick={() => window.open(classSession.meetingLink, '_blank')}
                            className="arabic-text"
                            aria-label={canJoin ? 'الانضمام للحصة الآن' : 'سيتم تفعيل الرابط قبل الحصة بـ 10 دقائق'}
                          >
                            <Video className="w-4 h-4 ms-1" aria-hidden="true" />
                            {canJoin ? 'انضم' : 'قريباً'}
                          </Button>
                        )}
                        {userRole === 'teacher' && (
                          <>
                            {onEdit && classSession.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(classSession.id)}
                                className="p-2"
                                aria-label="تعديل الحصة"
                              >
                                <Edit className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            )}
                            {classSession.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(classSession.id)}
                                disabled={deleting === classSession.id}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label="حذف الحصة"
                              >
                                {deleting === classSession.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" aria-label="جاري الحذف" />
                                ) : (
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Mobile: Card View */}
        {hasFilteredResults && (
          <div className="md:hidden space-y-4" dir="rtl">
          {sortedClasses.map((classSession) => {
            const upcoming = isUpcoming(classSession.date, classSession.time)
            const past = isPast(classSession.date, classSession.time)
            const canJoin = canJoinClass(classSession.date, classSession.time)

            return (
              <Card
                key={classSession.id}
                className={`
                  ${upcoming ? 'border-2 border-yellow-500 bg-yellow-50' : ''}
                  ${past && classSession.status === 'scheduled' ? 'opacity-60' : ''}
                `}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Class Name and Status */}
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="arabic-text font-bold text-gray-900 text-lg">
                        {classSession.className || 'حصة دراسية'}
                      </h3>
                      {getStatusBadge(classSession.status)}
                    </div>

                    {/* Instructor */}
                    {classSession.instructorName && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 arabic-text">المعلم:</span>
                        <span className="text-sm font-medium text-gray-900 arabic-text">
                          {classSession.instructorName}
                        </span>
                      </div>
                    )}

                    {/* Date and Time */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="arabic-text font-medium text-gray-900">
                          {new Date(classSession.date).toLocaleDateString('ar-SA', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="arabic-text text-gray-700">
                          {classSession.time}
                        </span>
                        <span className="text-gray-500 text-sm arabic-text">
                          ({classSession.duration} دقيقة)
                        </span>
                      </div>
                    </div>

                    {/* Student Name (for teacher) */}
                    {userRole === 'teacher' && classSession.studentName && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600 arabic-text">الطالب: </span>
                        <span className="text-sm font-medium text-gray-900 arabic-text">
                          {classSession.studentName}
                        </span>
                      </div>
                    )}

                    {/* Join Button */}
                    {classSession.meetingLink && classSession.status === 'scheduled' && (
                      <Button
                        className="w-full arabic-text"
                        disabled={!canJoin}
                        onClick={() => window.open(classSession.meetingLink, '_blank')}
                        aria-label={canJoin ? 'الانضمام للحصة الآن' : 'سيتم تفعيل الرابط قبل الحصة بـ 10 دقائق'}
                      >
                        <Video className="w-4 h-4 ms-1" aria-hidden="true" />
                        {canJoin ? 'الانضمام للحصة' : 'قريباً'}
                      </Button>
                    )}

                    {/* Teacher Actions */}
                    {userRole === 'teacher' && classSession.status === 'scheduled' && (
                      <div className="flex gap-2 pt-3 border-t border-gray-200" role="group" aria-label="إجراءات الحصة">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(classSession.id)}
                            className="flex-1 arabic-text"
                            aria-label="تعديل الحصة"
                          >
                            <Edit className="w-4 h-4 ms-1" aria-hidden="true" />
                            تعديل
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(classSession.id)}
                          disabled={deleting === classSession.id}
                          className="flex-1 arabic-text text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="حذف الحصة"
                        >
                          {deleting === classSession.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin ms-1" aria-label="جاري الحذف" />
                          ) : (
                            <Trash2 className="w-4 h-4 ms-1" aria-hidden="true" />
                          )}
                          حذف
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
