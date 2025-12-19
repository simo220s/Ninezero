/**
 * Real-Time Notification Center
 * 
 * Central hub for real-time notifications and class countdowns
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8
 */

import { useState, useEffect } from 'react'
import { Bell, Settings, MessageSquare, Clock, Calendar } from 'lucide-react'
import NotificationPreferencesComponent from '@/components/notifications/NotificationPreferences'
import ClassCountdownTimer from '@/components/notifications/ClassCountdownTimer'
import WhatsAppMessenger from '@/components/notifications/WhatsAppMessenger'
import { useMultipleClassCountdowns } from '@/lib/services/countdown-timer'

interface RealTimeNotificationCenterProps {
  userId: string
  userRole: 'teacher' | 'student' | 'parent'
  upcomingClasses: Array<{
    id: string
    date: Date
    time: string
    studentName: string
    studentPhone?: string
    meetingLink: string
  }>
}

export default function RealTimeNotificationCenter({
  userId,
  userRole,
  upcomingClasses,
}: RealTimeNotificationCenterProps) {
  const [showPreferences, setShowPreferences] = useState(false)
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'all'>('today')

  // Get countdowns for all classes
  const countdowns = useMultipleClassCountdowns(
    upcomingClasses.map(cls => ({
      id: cls.id,
      date: cls.date,
      time: cls.time,
    }))
  )

  // Filter classes by tab
  const todayClasses = upcomingClasses.filter(cls => {
    const today = new Date().toDateString()
    return cls.date.toDateString() === today
  })

  const upcomingClassesFiltered = upcomingClasses.filter(cls => {
    const today = new Date().toDateString()
    return cls.date.toDateString() !== today
  })

  // Check for classes starting soon and show notifications
  useEffect(() => {
    const checkStartingSoon = () => {
      upcomingClasses.forEach(cls => {
        const countdown = countdowns.get(cls.id)
        if (countdown?.isStartingSoon && countdown.minutes === 15) {
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('حصة قريبة!', {
              body: `حصتك مع ${cls.studentName} تبدأ خلال 15 دقيقة`,
              icon: '/logo.png',
              tag: cls.id,
            })
          }
        }
      })
    }

    const interval = setInterval(checkStartingSoon, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [upcomingClasses, countdowns])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleSendWhatsApp = (cls: any) => {
    setSelectedClass(cls)
    setShowWhatsApp(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 arabic-text">
              مركز الإشعارات
            </h2>
            <p className="text-sm text-gray-600 arabic-text">
              تذكيرات الحصص والإشعارات الفورية
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreferences(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors arabic-text"
        >
          <Settings className="w-5 h-5" />
          <span>الإعدادات</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Classes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-900">
              {todayClasses.length}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-800 arabic-text">
            حصص اليوم
          </p>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-900">
              {upcomingClassesFiltered.length}
            </span>
          </div>
          <p className="text-sm font-medium text-green-800 arabic-text">
            حصص قادمة
          </p>
        </div>

        {/* Starting Soon */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-orange-900">
              {Array.from(countdowns.values()).filter(c => c.isStartingSoon).length}
            </span>
          </div>
          <p className="text-sm font-medium text-orange-800 arabic-text">
            تبدأ قريباً
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-6 py-3 font-medium transition-colors arabic-text ${
            activeTab === 'today'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          حصص اليوم ({todayClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 font-medium transition-colors arabic-text ${
            activeTab === 'upcoming'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          الحصص القادمة ({upcomingClassesFiltered.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-medium transition-colors arabic-text ${
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          جميع الحصص ({upcomingClasses.length})
        </button>
      </div>

      {/* Class List with Countdowns */}
      <div className="space-y-4">
        {activeTab === 'today' && (
          todayClasses.length > 0 ? (
            todayClasses.map(cls => {
              const countdown = countdowns.get(cls.id)
              return (
                <div key={cls.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <ClassCountdownTimer
                        classDate={cls.date}
                        classTime={cls.time}
                        studentName={cls.studentName}
                        meetingLink={cls.meetingLink}
                        showDetails={true}
                      />
                    </div>
                    
                    {userRole === 'teacher' && cls.studentPhone && (
                      <button
                        onClick={() => handleSendWhatsApp(cls)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors arabic-text"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>واتساب</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 arabic-text">لا توجد حصص اليوم</p>
            </div>
          )
        )}

        {activeTab === 'upcoming' && (
          upcomingClassesFiltered.length > 0 ? (
            upcomingClassesFiltered.map(cls => {
              const classCountdown = countdowns.get(cls.id)
              return (
                <div key={cls.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 arabic-text mb-2">
                        حصة مع {cls.studentName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span dir="ltr">{cls.date.toLocaleDateString('ar-SA')}</span>
                        <span dir="ltr">{cls.time}</span>
                      </div>
                      {classCountdown && (
                        <div className="mt-3">
                          <ClassCountdownTimer
                            classDate={cls.date}
                            classTime={cls.time}
                            compact={true}
                          />
                        </div>
                      )}
                    </div>
                    
                    {userRole === 'teacher' && cls.studentPhone && (
                      <button
                        onClick={() => handleSendWhatsApp(cls)}
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="إرسال رسالة واتساب"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 arabic-text">لا توجد حصص قادمة</p>
            </div>
          )
        )}

        {activeTab === 'all' && (
          upcomingClasses.length > 0 ? (
            upcomingClasses.map(cls => {
              const countdown = countdowns.get(cls.id)
              const isToday = cls.date.toDateString() === new Date().toDateString()
              const classCountdown = countdowns.get(cls.id)
              
              return (
                <div key={cls.id} className={`bg-white rounded-lg border p-6 shadow-sm ${
                  isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 arabic-text">
                          حصة مع {cls.studentName}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full arabic-text">
                            اليوم
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span dir="ltr">{cls.date.toLocaleDateString('ar-SA')}</span>
                        <span dir="ltr">{cls.time}</span>
                      </div>
                      {classCountdown && (
                        <ClassCountdownTimer
                          classDate={cls.date}
                          classTime={cls.time}
                          compact={true}
                        />
                      )}
                    </div>
                    
                    {userRole === 'teacher' && cls.studentPhone && (
                      <button
                        onClick={() => handleSendWhatsApp(cls)}
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="إرسال رسالة واتساب"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 arabic-text">لا توجد حصص مجدولة</p>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <NotificationPreferencesComponent
            userId={userId}
            onClose={() => setShowPreferences(false)}
          />
        </div>
      )}

      {showWhatsApp && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <WhatsAppMessenger
            recipientName="ولي الأمر"
            recipientPhone={selectedClass.studentPhone}
            studentName={selectedClass.studentName}
            teacherName="المعلم"
            onClose={() => {
              setShowWhatsApp(false)
              setSelectedClass(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
