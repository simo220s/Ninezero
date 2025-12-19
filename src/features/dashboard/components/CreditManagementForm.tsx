/**
 * Credit Management Form Component
 * 
 * Enhanced form for adding credits to students with validation,
 * toast notifications, and real-time balance updates
 * 
 * Task 5: Implement Credit Management Workflow
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Plus, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { useCreditManagement } from '@/lib/hooks/useCreditManagement'
import { toast } from '@/components/ui/toast'
import { formatStudentName } from '@/lib/utils/student-helpers'
import { logger } from '@/lib/logger'

interface Student {
  id: string
  user_id: string
  name: string
  email: string
  is_trial: boolean
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
  credits?: number
}

interface CreditManagementFormProps {
  students: Student[]
  teacherId: string
  onSuccess?: () => void
}

export const CreditManagementForm = ({
  students,
  teacherId,
  onSuccess
}: CreditManagementFormProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [reason, setReason] = useState('')
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [validationError, setValidationError] = useState('')

  const {
    addCredits,
    getStudentCredits,
    isLoading
  } = useCreditManagement()

  // Load current balance when student is selected
  useEffect(() => {
    if (selectedStudent) {
      loadCurrentBalance()
    }
  }, [selectedStudent])

  const loadCurrentBalance = async () => {
    if (!selectedStudent) return

    try {
      const balance = await getStudentCredits(selectedStudent.user_id)
      setCurrentBalance(balance)
    } catch (error) {
      logger.error('Error loading balance:', error)
      setCurrentBalance(selectedStudent.credits || 0)
    }
  }

  const validateAmount = (amount: string): boolean => {
    setValidationError('')

    if (!amount || amount.trim() === '') {
      setValidationError('يرجى إدخال عدد الحصص')
      return false
    }

    const numAmount = parseFloat(amount)

    if (isNaN(numAmount)) {
      setValidationError('يرجى إدخال رقم صحيح')
      return false
    }

    if (numAmount <= 0) {
      setValidationError('يجب أن يكون عدد الحصص أكبر من صفر')
      return false
    }

    if (numAmount > 100) {
      setValidationError('لا يمكن إضافة أكثر من 100 حصة في المرة الواحدة')
      return false
    }

    // Check for valid increments (0.5)
    if (numAmount % 0.5 !== 0) {
      setValidationError('يرجى إدخال عدد صحيح أو نصف حصة (مثال: 5 أو 5.5)')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent) {
      toast.error('يرجى اختيار طالب')
      return
    }

    if (!validateAmount(creditAmount)) {
      toast.error(validationError)
      return
    }

    const amount = parseFloat(creditAmount)

    try {
      logger.log('Submitting credit addition:', {
        studentId: selectedStudent.user_id,
        teacherId,
        amount,
        reason: reason || 'إضافة رصيد'
      })

      const result = await addCredits({
        studentId: selectedStudent.user_id,
        teacherId,
        amount,
        reason: reason || 'إضافة رصيد'
      })

      if (result.success) {
        toast.success(
          `تمت إضافة ${amount} حصة بنجاح لـ ${formatStudentName(selectedStudent)} ✅`,
          5000
        )

        // Reset form
        setSelectedStudent(null)
        setCreditAmount('')
        setReason('')
        setSearchTerm('')
        setValidationError('')

        // Call success callback
        onSuccess?.()
      }
    } catch (error: any) {
      logger.error('Error adding credits:', error)
      toast.error(error?.message || 'فشل في إضافة الرصيد')
    }
  }

  const filteredStudents = students.filter(s => {
    const fullName = formatStudentName(s).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return fullName.includes(searchLower) || 
           (s.profiles?.email || '').toLowerCase().includes(searchLower)
  })

  const newBalance = selectedStudent && creditAmount
    ? currentBalance + parseFloat(creditAmount || '0')
    : currentBalance

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="arabic-text text-blue-600 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          إضافة رصيد حصص جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2 arabic-text text-gray-700">
                1️⃣ اختر الطالب
              </label>
              <Input
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="arabic-text text-gray-900 placeholder:text-gray-500"
              />

              {/* Search Results */}
              {searchTerm && filteredStudents.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg shadow-lg bg-white">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student)
                        setSearchTerm('')
                      }}
                      className="w-full p-3 text-right hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="font-semibold arabic-text text-gray-900">
                        {formatStudentName(student)}
                      </p>
                      <p className="text-sm text-gray-600 arabic-text">
                        الرصيد الحالي: {student.credits || 0} حصة
                      </p>
                      <p className="text-xs text-gray-500">{student.profiles?.email}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && filteredStudents.length === 0 && (
                <div className="mt-2 p-4 border border-gray-200 rounded-lg text-center text-gray-600 arabic-text">
                  لا توجد نتائج
                </div>
              )}

              {/* Selected Student Display */}
              {selectedStudent && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
                  <p className="font-bold arabic-text text-gray-900 text-lg">
                    ✅ {formatStudentName(selectedStudent)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <p className="text-sm arabic-text text-gray-700 font-semibold">
                      الرصيد الحالي: {currentBalance} حصة
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{selectedStudent.profiles?.email}</p>
                </div>
              )}
            </div>

            {/* Credit Amount */}
            <div>
              <label className="block text-sm font-semibold mb-2 arabic-text text-gray-700">
                2️⃣ عدد الحصص المراد إضافتها
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                max="100"
                placeholder="مثال: 5 أو 10.5"
                value={creditAmount}
                onChange={(e) => {
                  setCreditAmount(e.target.value)
                  setValidationError('')
                }}
                disabled={!selectedStudent}
                className="arabic-text text-gray-900 text-lg placeholder:text-gray-500"
              />
              {validationError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <p className="arabic-text">{validationError}</p>
                </div>
              )}
              <p className="text-xs text-gray-600 arabic-text mt-1">
                يمكن إضافة من 0.5 إلى 100 حصة
              </p>

              {/* Reason (Optional) */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 arabic-text text-gray-700">
                  3️⃣ السبب (اختياري)
                </label>
                <Input
                  type="text"
                  placeholder="مثال: شراء باقة 10 حصص"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={!selectedStudent}
                  className="arabic-text text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* New Balance Preview */}
              {selectedStudent && creditAmount && !validationError && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold arabic-text text-green-900">
                      الرصيد الجديد: {newBalance.toFixed(1)} حصة
                    </p>
                  </div>
                  <p className="text-xs text-green-700 arabic-text mt-1">
                    ({currentBalance} + {parseFloat(creditAmount)} = {newBalance.toFixed(1)})
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedStudent || !creditAmount || isLoading || !!validationError}
                className="arabic-text w-full mt-4 h-12 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 ms-2" />
                    إضافة الرصيد الآن ✅
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreditManagementForm
