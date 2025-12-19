import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Save, X, Edit2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getAllSettings, updateSetting } from '@/lib/admin-database'
import { logger } from '@/lib/utils/logger'

interface Setting {
  id: string
  key: string
  value: any
  description: string
  updated_by?: string
  updated_at: string
  created_at: string
}

interface SettingsByCategory {
  [category: string]: Setting[]
}

export default function SystemSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAllSettings()
      
      if (error) {
        logger.error('Error loading settings:', error)
        setMessage({ type: 'error', text: 'فشل تحميل الإعدادات' })
        return
      }

      setSettings(data || [])
      setMessage(null)
    } catch (error) {
      logger.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحميل الإعدادات' })
    } finally {
      setLoading(false)
    }
  }

  const groupSettingsByCategory = (): SettingsByCategory => {
    const grouped: SettingsByCategory = {
      'إعدادات الفترة التجريبية': [],
      'إعدادات الحصص': [],
      'إعدادات الإشعارات': [],
      'إعدادات الرصيد': [],
      'إعدادات عامة': [],
    }

    settings.forEach((setting) => {
      if (setting.key.includes('trial')) {
        grouped['إعدادات الفترة التجريبية'].push(setting)
      } else if (setting.key.includes('class') || setting.key.includes('join_window')) {
        grouped['إعدادات الحصص'].push(setting)
      } else if (setting.key.includes('notification')) {
        grouped['إعدادات الإشعارات'].push(setting)
      } else if (setting.key.includes('credit')) {
        grouped['إعدادات الرصيد'].push(setting)
      } else {
        grouped['إعدادات عامة'].push(setting)
      }
    })

    // Remove empty categories
    Object.keys(grouped).forEach((key) => {
      if (grouped[key].length === 0) {
        delete grouped[key]
      }
    })

    return grouped
  }

  const handleEdit = (setting: Setting) => {
    setEditingKey(setting.key)
    // Convert value to string for editing
    const valueStr = typeof setting.value === 'object' 
      ? JSON.stringify(setting.value) 
      : String(setting.value)
    setEditValue(valueStr)
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const handleSave = async (key: string) => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'يجب تسجيل الدخول لتحديث الإعدادات' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      // Validate the value
      if (!editValue.trim()) {
        setMessage({ type: 'error', text: 'القيمة لا يمكن أن تكون فارغة' })
        return
      }

      // Try to parse as JSON if it looks like JSON
      let parsedValue: any = editValue
      if (editValue.startsWith('{') || editValue.startsWith('[')) {
        try {
          parsedValue = JSON.parse(editValue)
        } catch {
          setMessage({ type: 'error', text: 'صيغة JSON غير صحيحة' })
          return
        }
      }

      const { error } = await updateSetting(key, parsedValue, user.id)

      if (error) {
        logger.error('Error updating setting:', error)
        setMessage({ type: 'error', text: 'فشل تحديث الإعداد' })
        return
      }

      setMessage({ type: 'success', text: 'تم تحديث الإعداد بنجاح' })
      setEditingKey(null)
      setEditValue('')
      
      // Reload settings to get updated values
      await loadSettings()
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      logger.error('Error saving setting:', error)
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإعداد' })
    } finally {
      setSaving(false)
    }
  }

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text flex items-center">
              <Settings className="w-6 h-6 ms-2" />
              إعدادات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const groupedSettings = groupSettingsByCategory()

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="arabic-text">{message.text}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-6 h-6 ms-2" />
              إعدادات النظام
            </div>
            <Button
              onClick={loadSettings}
              variant="outline"
              size="sm"
              className="arabic-text"
            >
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSettings).length === 0 ? (
            <div className="text-center py-12 text-text-secondary arabic-text">
              <p className="text-lg mb-2">لا توجد إعدادات</p>
              <p className="text-sm">لم يتم العثور على أي إعدادات في النظام</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-text-primary arabic-text mb-4 pb-2 border-b border-border-light">
                    {category}
                  </h3>
                  <div className="space-y-4">
                    {categorySettings.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-start justify-between p-4 bg-bg-light rounded-lg border border-border-light hover:border-primary-200 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-text-primary">
                              {setting.key}
                            </h4>
                          </div>
                          <p className="text-sm text-text-secondary arabic-text mb-3">
                            {setting.description}
                          </p>
                          
                          {editingKey === setting.key ? (
                            <div className="space-y-2">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                rows={editValue.includes('\n') ? 4 : 1}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleSave(setting.key)}
                                  disabled={saving}
                                  size="sm"
                                  className="arabic-text"
                                >
                                  {saving ? (
                                    <>
                                      <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                                      جاري الحفظ...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 ms-1" />
                                      حفظ
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  disabled={saving}
                                  variant="outline"
                                  size="sm"
                                  className="arabic-text"
                                >
                                  <X className="w-4 h-4 ms-1" />
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <code className="px-3 py-1.5 bg-white border border-border-light rounded text-sm font-mono">
                                {formatValue(setting.value)}
                              </code>
                            </div>
                          )}
                        </div>
                        
                        {editingKey !== setting.key && (
                          <Button
                            onClick={() => handleEdit(setting)}
                            variant="ghost"
                            size="sm"
                            className="arabic-text"
                          >
                            <Edit2 className="w-4 h-4 ms-1" />
                            تعديل
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
