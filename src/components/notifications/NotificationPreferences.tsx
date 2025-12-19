/**
 * Notification Preferences Component
 * 
 * Allows users to configure their notification preferences
 * Requirements: 14.5 - Notification preferences for different communication channels
 */

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, Smartphone, Check, X } from 'lucide-react'
import notificationService, { type NotificationPreferences, type NotificationTiming } from '@/lib/services/notification-service'
import { logger } from '@/lib/logger'

interface NotificationPreferencesProps {
  userId: string
  onClose?: () => void
}

export default function NotificationPreferencesComponent({ userId, onClose }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const prefs = await notificationService.getNotificationPreferences(userId)
      if (prefs) {
        setPreferences(prefs)
      }
    } catch (error) {
      logger.error('Error loading preferences:', error)
      setMessage({ type: 'error', text: 'فشل تحميل الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      const success = await notificationService.updateNotificationPreferences(userId, preferences)
      
      if (success) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' })
        setTimeout(() => {
          if (onClose) onClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: 'فشل حفظ الإعدادات' })
      }
    } catch (error) {
      logger.error('Error saving preferences:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' })
    } finally {
      setSaving(false)
    }
  }

  const toggleChannel = (channel: 'email' | 'sms' | 'whatsapp' | 'inApp') => {
    if (!preferences) return
    setPreferences({ ...preferences, [channel]: !preferences[channel] })
  }

  const toggleNotificationType = (type: 'classReminders' | 'parentMessages' | 'systemUpdates') => {
    if (!preferences) return
    setPreferences({ ...preferences, [type]: !preferences[type] })
  }

  const toggleReminderTiming = (timing: NotificationTiming) => {
    if (!preferences) return
    
    const timings = preferences.reminderTimings.includes(timing)
      ? preferences.reminderTimings.filter(t => t !== timing)
      : [...preferences.reminderTimings, timing]
    
    setPreferences({ ...preferences, reminderTimings: timings })
  }

  const updateWhatsAppNumber = (number: string) => {
    if (!preferences) return
    setPreferences({ ...preferences, whatsappNumber: number })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 arabic-text">فشل تحميل الإعدادات</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 arabic-text">إعدادات الإشعارات</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            <p className="text-sm arabic-text">{message.text}</p>
          </div>
        )}

        {/* Communication Channels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-4">قنوات التواصل</h3>
          <div className="space-y-3">
            {/* In-App Notifications */}
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 arabic-text">إشعارات داخل التطبيق</p>
                  <p className="text-sm text-gray-500 arabic-text">إشعارات فورية داخل المنصة</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.inApp}
                onChange={() => toggleChannel('inApp')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            {/* Email Notifications */}
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 arabic-text">البريد الإلكتروني</p>
                  <p className="text-sm text-gray-500 arabic-text">إشعارات عبر البريد الإلكتروني</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={() => toggleChannel('email')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            {/* SMS Notifications */}
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 arabic-text">الرسائل النصية (SMS)</p>
                  <p className="text-sm text-gray-500 arabic-text">إشعارات عبر الرسائل النصية</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.sms}
                onChange={() => toggleChannel('sms')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            {/* WhatsApp Notifications */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors p-2 rounded">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 arabic-text">واتساب</p>
                    <p className="text-sm text-gray-500 arabic-text">إشعارات عبر واتساب</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.whatsapp}
                  onChange={() => toggleChannel('whatsapp')}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
              
              {preferences.whatsapp && (
                <div className="mt-3 pr-8">
                  <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    value={preferences.whatsappNumber || ''}
                    onChange={(e) => updateWhatsAppNumber(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 arabic-text mt-1">
                    أدخل رقم الواتساب بصيغة دولية (+966)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-4">أنواع الإشعارات</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900 arabic-text">تذكيرات الحصص</p>
                <p className="text-sm text-gray-500 arabic-text">إشعارات قبل بدء الحصة</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.classReminders}
                onChange={() => toggleNotificationType('classReminders')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900 arabic-text">رسائل أولياء الأمور</p>
                <p className="text-sm text-gray-500 arabic-text">إشعارات الرسائل من المعلمين</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.parentMessages}
                onChange={() => toggleNotificationType('parentMessages')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-medium text-gray-900 arabic-text">تحديثات النظام</p>
                <p className="text-sm text-gray-500 arabic-text">إشعارات التحديثات والأخبار</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.systemUpdates}
                onChange={() => toggleNotificationType('systemUpdates')}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Reminder Timings */}
        {preferences.classReminders && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-4">توقيت التذكيرات</h3>
            <p className="text-sm text-gray-600 arabic-text mb-3">
              اختر متى تريد استلام تذكيرات الحصص
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.reminderTimings.includes('24h')}
                  onChange={() => toggleReminderTiming('24h')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-900 arabic-text">قبل 24 ساعة من الحصة</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.reminderTimings.includes('1h')}
                  onChange={() => toggleReminderTiming('1h')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-900 arabic-text">قبل ساعة واحدة من الحصة</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.reminderTimings.includes('15min')}
                  onChange={() => toggleReminderTiming('15min')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-900 arabic-text">قبل 15 دقيقة من الحصة</span>
              </label>
            </div>
          </div>
        )}

        {/* Language Preference */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-4">لغة الإشعارات</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setPreferences({ ...preferences, language: 'ar' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                preferences.language === 'ar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setPreferences({ ...preferences, language: 'en' })}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                preferences.language === 'en'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors arabic-text"
          >
            إلغاء
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed arabic-text flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>حفظ الإعدادات</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
