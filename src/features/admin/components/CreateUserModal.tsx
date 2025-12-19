import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { generateReferralCode } from '@/lib/utils'
import { logger } from '@/lib/utils/logger'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
    initialCredits: '0.5',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      // Validate email
      if (!formData.email || !formData.email.includes('@')) {
        setError('البريد الإلكتروني غير صحيح')
        return
      }

      // Validate password
      if (!formData.password || formData.password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        return
      }

      // Validate names
      if (!formData.firstName || !formData.lastName) {
        setError('الاسم الأول والأخير مطلوبان')
        return
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('فشل إنشاء المستخدم')
      }

      // Create profile
      const referralCode = generateReferralCode()
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          referral_code: referralCode,
          is_trial: formData.role === 'student',
        })

      if (profileError) throw profileError

      // Create class credits for students
      if (formData.role === 'student') {
        const { error: creditsError } = await supabase
          .from('class_credits')
          .insert({
            user_id: authData.user.id,
            credits: parseFloat(formData.initialCredits),
          })

        if (creditsError) throw creditsError
      }

      // Success
      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'student',
        initialCredits: '0.5',
      })
    } catch (err: any) {
      logger.error('Error creating user:', err)
      setError(err.message || 'حدث خطأ في إنشاء المستخدم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="arabic-text">إضافة مستخدم جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 arabic-text">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                الاسم الأول
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                className="arabic-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                الاسم الأخير
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                className="arabic-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
              كلمة المرور
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
              الدور
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border-light bg-white text-text-primary arabic-text"
            >
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدير</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-text-primary arabic-text mb-1">
                الرصيد الأولي
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.initialCredits}
                onChange={(e) => handleChange('initialCredits', e.target.value)}
                required
                className="arabic-text"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="arabic-text"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="arabic-text">
              {loading ? (
                <>
                  <Spinner size="sm" className="ms-2" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء المستخدم'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
