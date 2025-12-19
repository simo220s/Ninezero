/**
 * Custom Pricing Modal Component
 * 
 * Allows teachers to set custom pricing for individual students
 * Requirement 9.2: Interface for teachers to set custom pricing
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Spinner } from '@/components/ui/spinner'
import { DollarSign, AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'
import { useAuth } from '@/lib/auth-context'
import customPricingService from '@/lib/services/custom-pricing-service'

interface Student {
  id: string
  name: string
  email: string
  currentPrice?: number
}

interface CustomPricingModalProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  onSuccess: () => void
}

export default function CustomPricingModal({
  isOpen,
  onClose,
  students,
  onSuccess
}: CustomPricingModalProps) {
  const { user } = useAuth()
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [customPrice, setCustomPrice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!selectedStudentId) {
      setError('يرجى اختيار طالب')
      return
    }

    const price = parseFloat(customPrice)
    if (isNaN(price) || price < 0) {
      setError('يرجى إدخال سعر صحيح')
      return
    }

    setError(null)
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    if (!selectedStudent || !user) return

    setLoading(true)
    setError(null)

    try {
      await customPricingService.setCustomPrice(
        selectedStudentId,
        user.id,
        parseFloat(customPrice)
      )
      
      logger.info('Custom pricing set', {
        studentId: selectedStudentId,
        studentName: selectedStudent.name,
        customPrice: parseFloat(customPrice)
      })

      onSuccess()
      handleClose()
    } catch (err) {
      logger.error('Failed to set custom pricing', err)
      setError('فشل تطبيق السعر المخصص. يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
      setShowConfirmation(false)
    }
  }

  const handleClose = () => {
    setSelectedStudentId('')
    setCustomPrice('')
    setError(null)
    setShowConfirmation(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text text-right flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              تعيين سعر مخصص
            </DialogTitle>
            <DialogDescription className="arabic-text text-right">
              قم بتعيين سعر مخصص لطالب معين
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student" className="arabic-text text-right block">
                اختر الطالب
              </Label>
              <Select
                id="student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                dir="rtl"
              >
                <option value="">اختر طالباً</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                    {student.currentPrice ? ` - السعر الحالي: ${student.currentPrice} ريال` : ''}
                  </option>
                ))}
              </Select>
            </div>

            {/* Custom Price Input */}
            <div className="space-y-2">
              <Label htmlFor="price" className="arabic-text text-right block">
                السعر المخصص (ريال سعودي)
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="text-right pr-10"
                  dir="rtl"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ريال
                </div>
              </div>
              {selectedStudent?.currentPrice && (
                <p className="text-sm text-gray-600 arabic-text text-right">
                  السعر الحالي: {selectedStudent.currentPrice} ريال
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" dir="rtl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600 arabic-text">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="arabic-text"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedStudentId || !customPrice}
                className="arabic-text"
              >
                {loading ? <Spinner size="sm" /> : 'تطبيق السعر'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={(open) => !loading && setShowConfirmation(open)}
        onConfirm={handleConfirm}
        title="تأكيد تطبيق السعر المخصص"
        description={
          selectedStudent
            ? `هل أنت متأكد من تطبيق السعر ${customPrice} ريال للطالب ${selectedStudent.name}؟`
            : ''
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        variant="info"
        loading={loading}
      />
    </>
  )
}
