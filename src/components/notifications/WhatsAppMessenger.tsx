/**
 * WhatsApp Messenger Component
 * 
 * Interface for sending WhatsApp messages to parents
 * Requirements: 14.3 - WhatsApp integration for parent communications
 */

import { useState } from 'react'
import { MessageSquare, Send, Copy, Check, X, Phone } from 'lucide-react'
import whatsappService, { WhatsAppTemplates } from '@/lib/services/whatsapp-integration'
import { logger } from '@/lib/logger'

interface WhatsAppMessengerProps {
  recipientName: string
  recipientPhone: string
  studentName?: string
  teacherName?: string
  onClose?: () => void
}

export default function WhatsAppMessenger({
  recipientName,
  recipientPhone,
  studentName,
  teacherName,
  onClose,
}: WhatsAppMessengerProps) {
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [phoneError, setPhoneError] = useState<string>('')

  // Validate phone number on mount
  useState(() => {
    if (!whatsappService.validateSaudiPhoneNumber(recipientPhone)) {
      setPhoneError('رقم الهاتف غير صالح. يجب أن يكون رقم سعودي يبدأ بـ 5')
    }
  })

  const templates = [
    {
      id: 'custom',
      name: 'رسالة مخصصة',
      icon: '✍️',
      generate: () => '',
    },
    {
      id: 'parent_message',
      name: 'رسالة عامة',
      icon: '📝',
      generate: () => WhatsAppTemplates.parentMessage(
        studentName || 'الطالب',
        teacherName || 'المعلم',
        'أكتب رسالتك هنا...'
      ),
    },
    {
      id: 'progress_report',
      name: 'تقرير تقدم',
      icon: '📊',
      generate: () => WhatsAppTemplates.progressReport(
        studentName || 'الطالب',
        'متوسط',
        10,
        'الأسبوع القادم'
      ),
    },
    {
      id: 'class_reminder',
      name: 'تذكير بالحصة',
      icon: '⏰',
      generate: () => WhatsAppTemplates.classReminder24h(
        studentName || 'الطالب',
        teacherName || 'المعلم',
        'غداً',
        '5:00 مساءً',
        'https://meet.google.com/xxx-xxxx-xxx'
      ),
    },
  ]

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setMessage(template.generate())
    }
  }

  const handleSend = () => {
    if (!message.trim()) {
      return
    }

    if (phoneError) {
      return
    }

    whatsappService.sendWhatsAppMessage(recipientPhone, message)
    logger.log('WhatsApp message sent to:', recipientName)
    
    if (onClose) {
      onClose()
    }
  }

  const handleCopy = async () => {
    const success = await whatsappService.copyWhatsAppMessageToClipboard(message)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formattedPhone = whatsappService.formatSaudiPhoneNumber(recipientPhone)

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 arabic-text">
                إرسال رسالة واتساب
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-600" dir="ltr">
                  {formattedPhone}
                </p>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-green-100 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Recipient Info */}
        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 arabic-text">المستلم:</p>
              <p className="font-semibold text-gray-900 arabic-text">{recipientName}</p>
            </div>
            {studentName && (
              <div className="text-left">
                <p className="text-sm text-gray-600 arabic-text">الطالب:</p>
                <p className="font-semibold text-gray-900 arabic-text">{studentName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Phone Error */}
        {phoneError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 arabic-text">{phoneError}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 arabic-text mb-3">
            اختر قالب الرسالة
          </label>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 rounded-lg border-2 transition-all text-right ${
                  selectedTemplate === template.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="font-medium text-gray-900 arabic-text">
                    {template.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 arabic-text mb-2">
            نص الرسالة
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none arabic-text"
            dir="rtl"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500 arabic-text">
              {message.length} حرف
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 arabic-text">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="arabic-text">نسخ النص</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        {message && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 arabic-text mb-2">معاينة الرسالة:</p>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-900 whitespace-pre-wrap arabic-text" dir="rtl">
                {message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors arabic-text"
            >
              إلغاء
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!message.trim() || !!phoneError}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed arabic-text flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>إرسال عبر واتساب</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3 arabic-text">
          سيتم فتح واتساب مع الرسالة المعدة مسبقاً
        </p>
      </div>
    </div>
  )
}

/**
 * Quick WhatsApp button for contact cards
 */
export function QuickWhatsAppButton({
  phoneNumber,
  studentName,
  compact = false,
}: {
  phoneNumber: string
  studentName?: string
  compact?: boolean
}) {
  const [showMessenger, setShowMessenger] = useState(false)

  const handleQuickMessage = () => {
    const message = studentName
      ? `السلام عليكم، بخصوص الطالب ${studentName}...`
      : 'السلام عليكم...'
    
    whatsappService.sendWhatsAppMessage(phoneNumber, message)
  }

  if (compact) {
    return (
      <button
        onClick={handleQuickMessage}
        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        title="إرسال رسالة واتساب"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowMessenger(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors arabic-text"
      >
        <MessageSquare className="w-5 h-5" />
        <span>واتساب</span>
      </button>

      {showMessenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <WhatsAppMessenger
            recipientName="ولي الأمر"
            recipientPhone={phoneNumber}
            studentName={studentName}
            onClose={() => setShowMessenger(false)}
          />
        </div>
      )}
    </>
  )
}
