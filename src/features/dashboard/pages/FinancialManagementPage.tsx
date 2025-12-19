/**
 * Financial Management Module
 * 
 * Features:
 * - Integration with Cyaxaress Payment and Settlement models
 * - Income tracking dashboard
 * - Monthly income breakdown by age group and lesson type
 * - Expense tracking for teaching materials
 * - Financial reports with PDF export
 * - Average income calculations
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Plus,
  Calendar,
  PieChart,
  Receipt,
  CreditCard
} from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'
import financialService from '@/lib/services/financial-service'
import AddExpenseModal from '@/features/dashboard/components/AddExpenseModal'

// Financial data interfaces
interface IncomeRecord {
  id: string
  date: string
  student_name: string
  age_group: '10-12' | '13-15' | '16-18'
  lesson_type: 'Individual' | 'Group' | 'Assessment' | 'Trial'
  amount: number
  status: 'completed' | 'pending'
}

interface ExpenseRecord {
  id: string
  date: string
  category: string
  description: string
  amount: number
  receipt?: string
}

interface MonthlyBreakdown {
  month: string
  totalIncome: number
  byAgeGroup: {
    '10-12': number
    '13-15': number
    '16-18': number
  }
  byLessonType: {
    Individual: number
    Group: number
    Assessment: number
    Trial: number
  }
  expenses: number
  netIncome: number
}

export default function FinancialManagementPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange] = useState<'month' | 'quarter' | 'year'>('month')
  
  // Financial data
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([])
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown[]>([])
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadFinancialData()
    }
  }, [user, timeRange])

  const loadFinancialData = async () => {
    if (!user?.id) {
      setError('لم يتم العثور على معرف المستخدم')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch real data from database
      const [incomeResult, expenseResult, monthlyResult] = await Promise.all([
        financialService.getIncomeRecords(user.id),
        financialService.getExpenseRecords(user.id),
        financialService.getMonthlyBreakdown(user.id, 4),
      ])

      if (incomeResult.error) {
        logger.error('Error loading income records:', incomeResult.error)
        setError('حدث خطأ في تحميل بيانات الدخل')
        return
      }

      if (expenseResult.error) {
        logger.error('Error loading expense records:', expenseResult.error)
        // Continue with expenses as empty if error (not critical)
      }

      if (monthlyResult.error) {
        logger.error('Error loading monthly breakdown:', monthlyResult.error)
        setError('حدث خطأ في تحميل التفصيل الشهري')
        return
      }

      setIncomeRecords(incomeResult.data || [])
      setExpenseRecords(expenseResult.data || [])
      setMonthlyData(monthlyResult.data || [])
      
      logger.log('Financial data loaded successfully', {
        incomeCount: incomeResult.data?.length || 0,
        expenseCount: expenseResult.data?.length || 0,
        monthlyCount: monthlyResult.data?.length || 0,
      })
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات المالية')
      logger.error('Financial data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalIncome = (): number => {
    return monthlyData.reduce((sum, month) => sum + month.totalIncome, 0)
  }

  const calculateTotalExpenses = (): number => {
    return monthlyData.reduce((sum, month) => sum + month.expenses, 0)
  }

  const calculateNetIncome = (): number => {
    return calculateTotalIncome() - calculateTotalExpenses()
  }

  const calculateAverageIncomePerLesson = (): number => {
    const totalLessons = incomeRecords.filter(r => r.status === 'completed').length
    return totalLessons > 0 ? calculateTotalIncome() / totalLessons : 0
  }

  const calculateAverageIncomePerStudent = (): number => {
    const uniqueStudents = new Set(incomeRecords.map(r => r.student_name)).size
    return uniqueStudents > 0 ? calculateTotalIncome() / uniqueStudents : 0
  }

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ar-SA')} ر.س`
  }

  const handleExportPDF = () => {
    logger.log('Exporting financial report as PDF')
    // Mock PDF export
    alert('سيتم تصدير التقرير المالي قريباً')
  }

  const handleExportExcel = () => {
    logger.log('Exporting financial data as Excel')
    // Create CSV data
    const headers = ['التاريخ', 'الطالب', 'الفئة العمرية', 'نوع الحصة', 'المبلغ', 'الحالة']
    const csvData = incomeRecords.map(r => [
      r.date,
      r.student_name,
      r.age_group,
      r.lesson_type,
      r.amount,
      r.status === 'completed' ? 'مكتمل' : 'معلق'
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">الشؤون المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-text-secondary arabic-text">جاري تحميل البيانات المالية...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">الشؤون المالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-red-600 arabic-text mb-4">{error}</p>
                <Button onClick={loadFinancialData} variant="outline" className="arabic-text">
                  المحاولة مرة أخرى
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showBreadcrumbs>
      <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 arabic-text">الشؤون المالية</h1>
          <p className="text-gray-600 arabic-text mt-1">
            إدارة الدخل والمصروفات وتتبع الأداء المالي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleExportExcel}
            className="arabic-text flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportPDF}
            className="arabic-text flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير PDF
          </Button>
          <Button 
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="arabic-text flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة مصروف
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي الدخل</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(calculateTotalIncome())}</p>
                <p className="text-xs text-gray-500 arabic-text mt-2">
                  من الحصص المكتملة
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(calculateTotalExpenses())}</p>
                <p className="text-xs text-gray-500 arabic-text mt-2">
                  من جميع المصروفات
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">صافي الدخل</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(calculateNetIncome())}</p>
                <p className="text-xs text-gray-500 arabic-text mt-2">
                  الدخل - المصروفات
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 arabic-text">متوسط الدخل/حصة</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(Math.round(calculateAverageIncomePerLesson()))}</p>
                <p className="text-xs text-gray-500 arabic-text mt-2">
                  {formatCurrency(Math.round(calculateAverageIncomePerStudent()))} لكل طالب
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            التفصيل الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 arabic-text text-lg">{month.month}</h4>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(month.netIncome)}</p>
                    <p className="text-sm text-gray-600 arabic-text">صافي الدخل</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* By Age Group */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 arabic-text mb-3">حسب الفئة العمرية</h5>
                    <div className="space-y-2">
                      {Object.entries(month.byAgeGroup).map(([age, amount]) => (
                        <div key={age} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{age} سنة</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Lesson Type */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 arabic-text mb-3">حسب نوع الحصة</h5>
                    <div className="space-y-2">
                      {Object.entries(month.byLessonType).map(([type, amount]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 arabic-text">
                            {type === 'Individual' ? 'فردية' :
                             type === 'Group' ? 'جماعية' :
                             type === 'Assessment' ? 'تقييم' : 'تجريبية'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 arabic-text">إجمالي الدخل</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(month.totalIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 arabic-text">المصروفات</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(month.expenses)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 arabic-text">صافي الدخل</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(month.netIncome)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="arabic-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                سجل الدخل
              </CardTitle>
              <span className="text-sm text-gray-600">{incomeRecords.length} معاملة</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomeRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 arabic-text">{record.student_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <span>{record.date}</span>
                      <span>•</span>
                      <span>{record.age_group} سنة</span>
                      <span>•</span>
                      <span className="arabic-text">
                        {record.lesson_type === 'Individual' ? 'فردية' :
                         record.lesson_type === 'Group' ? 'جماعية' :
                         record.lesson_type === 'Assessment' ? 'تقييم' : 'تجريبية'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(record.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      record.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status === 'completed' ? 'مكتمل' : 'معلق'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="arabic-text flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                سجل المصروفات
              </CardTitle>
              <span className="text-sm text-gray-600">{expenseRecords.length} معاملة</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 arabic-text">{record.category}</p>
                    <p className="text-sm text-gray-600 arabic-text mt-1">{record.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(record.amount)}</p>
                  </div>
                </div>
              ))}
              
              {expenseRecords.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 arabic-text">لا توجد مصروفات مسجلة</p>
                  <Button 
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    variant="outline"
                    className="arabic-text mt-4"
                  >
                    إضافة مصروف
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSuccess={loadFinancialData}
        teacherId={user?.id || ''}
      />
      </div>
    </DashboardLayout>
  )
}
