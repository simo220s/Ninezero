import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationPreferences() {
  const { preferences, updatePreferences, fetchPreferences } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true);
    setMessage(null);

    const success = await updatePreferences({ [key]: value });

    if (success) {
      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
    } else {
      setMessage({ type: 'error', text: 'فشل حفظ الإعدادات' });
    }

    setSaving(false);

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  if (!preferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const settings = [
    {
      key: 'email_enabled',
      title: 'إشعارات البريد الإلكتروني',
      description: 'استقبال الإشعارات عبر البريد الإلكتروني',
      icon: 'email',
    },
    {
      key: 'in_app_enabled',
      title: 'الإشعارات داخل التطبيق',
      description: 'عرض الإشعارات في لوحة التحكم',
      icon: 'notifications',
    },
    {
      key: 'class_reminders_enabled',
      title: 'تذكيرات الحصص',
      description: 'تلقي تذكيرات قبل بدء الحصص',
      icon: 'schedule',
    },
    {
      key: 'class_updates_enabled',
      title: 'تحديثات الحصص',
      description: 'إشعارات عند جدولة أو إلغاء الحصص',
      icon: 'event',
    },
    {
      key: 'review_notifications_enabled',
      title: 'إشعارات التقييمات',
      description: 'تلقي إشعارات عند استلام تقييمات جديدة',
      icon: 'star',
    },
    {
      key: 'credit_notifications_enabled',
      title: 'إشعارات الرصيد',
      description: 'تنبيهات عند انخفاض رصيد الحصص',
      icon: 'account_balance_wallet',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            إعدادات الإشعارات
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            تحكم في كيفية تلقي الإشعارات
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-6 mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Settings List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {settings.map((setting) => (
            <div key={setting.key} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary-600/10 text-primary-600 shrink-0">
                    <span className="material-symbols-outlined">{setting.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {setting.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() =>
                    handleToggle(
                      setting.key,
                      !preferences[setting.key as keyof typeof preferences]
                    )
                  }
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                    preferences[setting.key as keyof typeof preferences]
                      ? 'bg-primary-600'
                      : 'bg-slate-300 dark:bg-slate-700'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[setting.key as keyof typeof preferences]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
