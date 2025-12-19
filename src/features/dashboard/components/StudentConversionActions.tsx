/**
 * Student Conversion Actions Component
 * Accept/Deny system for trial student conversion
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { convertTrialStudent } from '@/lib/database'
import { logger } from '@/lib/logger'
import { Check, X } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  profiles?: {
    first_name: string
    last_name: string
  }
}

interface StudentConversionActionsProps {
  student: Student
  onSuccess: () => void
}

export default function StudentConversionActions({ student, onSuccess }: StudentConversionActionsProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showDenyDialog, setShowDenyDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [denyReason, setDenyReason] = useState('')

  const handleAccept = async () => {
    try {
      setLoading(true)
      const { error } = await convertTrialStudent(student.id)
      
      if (error) throw error
      
      onSuccess()
      setShowAcceptDialog(false)
      logger.log('Student accepted and converted')
    } catch (err) {
      logger.error('Accept error:', err)
      alert('فشل قبول الطالب')
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = async () => {
    try {
      setLoading(true)
      
      // Mark student as denied (you can add a denied_at field to profiles table)
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('profiles')
        .update({ 
          trial_denied: true,
          denial_reason: denyReason,
          denied_at: new Date().toISOString()
        })
        .eq('id', student.id)
      
      onSuccess()
      setShowDenyDialog(false)
      logger.log('Student denied')
    } catch (err) {
      logger.error('Deny error:', err)
      alert('فشل رفض الطالب')
    } finally {
      setLoading(false)
    }
  }

  const studentName = student.profiles 
    ? `${student.profiles.first_name} ${student.profiles.last_name}`
    : student.name

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setShowAcceptDialog(true)}
          className="bg-green-600 hover:bg-green-700 arabic-text"
        >
          <Check className="w-4 h-4 ms-1" />
          قبول
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDenyDialog(true)}
          className="text-red-600 hover:bg-red-50 arabic-text"
        >
          <X className="w-4 h-4 ms-1" />
          رفض
        </Button>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="arabic-text">قبول الطالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="arabic-text">
              هل تريد قبول <strong>{studentName}</strong> وتحويله إلى طالب نظامي؟
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 arabic-text">
                سيتم منح الطالب الوصول الكامل لجميع المزايا
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAccept} disabled={loading} className="bg-green-600">
                {loading ? <Spinner size="sm" /> : 'قبول'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="arabic-text">رفض الطالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="arabic-text">
              هل تريد رفض <strong>{studentName}</strong>؟
            </p>
            <div>
              <label className="block text-sm font-medium mb-2 arabic-text">
                سبب الرفض (اختياري)
              </label>
              <select
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 arabic-text"
              >
                <option value="">اختر السبب</option>
                <option value="not_serious">غير جاد في التعلم</option>
                <option value="behavior">سلوك غير مناسب</option>
                <option value="no_show">عدم الحضور</option>
                <option value="other">سبب آخر</option>
              </select>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 arabic-text">
                سيتم إعلام الطالب بالرفض ولن يتمكن من التسجيل مرة أخرى
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDenyDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleDeny} disabled={loading} className="bg-red-600">
                {loading ? <Spinner size="sm" /> : 'رفض'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
