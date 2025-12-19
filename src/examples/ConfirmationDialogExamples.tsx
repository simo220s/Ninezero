/**
 * Confirmation Dialog Examples
 * 
 * Demonstrates various use cases for the ConfirmationDialog component
 * with different severity levels and scenarios.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog, useConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Trash2, AlertTriangle, Info } from 'lucide-react'

export default function ConfirmationDialogExamples() {
  // Example 1: Subscription Cancellation (Danger)
  const subscriptionDialog = useConfirmationDialog(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    // Subscription cancelled
    alert('تم إلغاء الاشتراك بنجاح')
  })

  // Example 2: Class Deletion (Danger)
  const [showClassDeleteDialog, setShowClassDeleteDialog] = useState(false)
  const [deletingClass, setDeletingClass] = useState(false)

  const handleDeleteClass = async () => {
    setDeletingClass(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      // Class deleted
      alert('تم حذف الحصة بنجاح')
      setShowClassDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete class:', error)
    } finally {
      setDeletingClass(false)
    }
  }

  // Example 3: Account Deletion (Danger with details)
  const [showAccountDeleteDialog, setShowAccountDeleteDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      // Account deleted
      alert('تم حذف الحساب بنجاح')
      setShowAccountDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete account:', error)
    } finally {
      setDeletingAccount(false)
    }
  }

  // Example 4: Logout Confirmation (Warning)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      // Logged out
      alert('تم تسجيل الخروج بنجاح')
      setShowLogoutDialog(false)
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  // Example 5: Discard Changes (Warning)
  const discardDialog = useConfirmationDialog(async () => {
    // Changes discarded
    alert('تم تجاهل التغييرات')
  })

  // Example 6: Important Action (Info)
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  const handleImportantAction = async () => {
    // Important action confirmed
    alert('تم تأكيد الإجراء')
    setShowInfoDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-right" dir="rtl">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 arabic-text">
            أمثلة على نوافذ التأكيد
          </h1>
          <p className="text-lg text-gray-600 arabic-text">
            عرض توضيحي لمختلف أنواع نوافذ التأكيد للإجراءات المهمة
          </p>
        </div>

        {/* Danger Examples */}
        <Card dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
              <span>إجراءات خطيرة (Danger)</span>
              <Trash2 className="w-5 h-5 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="space-y-4">
              {/* Example 1: Subscription Cancellation */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">إلغاء الاشتراك</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد إلغاء الاشتراك مع استخدام useConfirmationDialog hook
                  </p>
                </div>
                <Button
                  onClick={subscriptionDialog.open}
                  variant="outline"
                  className="arabic-text text-red-600 border-red-300 hover:bg-red-50"
                >
                  إلغاء الاشتراك
                </Button>
              </div>

              {/* Example 2: Class Deletion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">حذف حصة</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد حذف حصة مجدولة
                  </p>
                </div>
                <Button
                  onClick={() => setShowClassDeleteDialog(true)}
                  variant="outline"
                  className="arabic-text text-red-600 border-red-300 hover:bg-red-50"
                >
                  حذف الحصة
                </Button>
              </div>

              {/* Example 3: Account Deletion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">حذف الحساب</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد حذف الحساب مع تفاصيل إضافية
                  </p>
                </div>
                <Button
                  onClick={() => setShowAccountDeleteDialog(true)}
                  variant="outline"
                  className="arabic-text text-red-600 border-red-300 hover:bg-red-50"
                >
                  حذف الحساب
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Examples */}
        <Card dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
              <span>تحذيرات (Warning)</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="space-y-4">
              {/* Example 4: Logout */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">تسجيل الخروج</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد تسجيل الخروج من الحساب
                  </p>
                </div>
                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  variant="outline"
                  className="arabic-text text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  تسجيل الخروج
                </Button>
              </div>

              {/* Example 5: Discard Changes */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">تجاهل التغييرات</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد تجاهل التغييرات غير المحفوظة
                  </p>
                </div>
                <Button
                  onClick={discardDialog.open}
                  variant="outline"
                  className="arabic-text text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  تجاهل التغييرات
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Example */}
        <Card dir="rtl">
          <CardHeader dir="rtl">
            <CardTitle className="arabic-text text-right flex items-center gap-2 justify-end">
              <span>معلومات (Info)</span>
              <Info className="w-5 h-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent dir="rtl">
            <div className="space-y-4">
              {/* Example 6: Important Action */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" dir="rtl">
                <div className="flex-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900 arabic-text">إجراء مهم</h3>
                  <p className="text-sm text-gray-600 arabic-text">
                    تأكيد إجراء مهم يتطلب انتباه المستخدم
                  </p>
                </div>
                <Button
                  onClick={() => setShowInfoDialog(true)}
                  variant="outline"
                  className="arabic-text text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  تنفيذ الإجراء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        
        {/* Subscription Cancellation Dialog (using hook) */}
        <ConfirmationDialog
          open={subscriptionDialog.isOpen}
          onOpenChange={subscriptionDialog.close}
          onConfirm={subscriptionDialog.confirm}
          title="إلغاء الاشتراك"
          description="هل أنت متأكد من رغبتك في إلغاء الاشتراك؟ سيتم إيقاف جميع المزايا فوراً."
          confirmText="نعم، إلغاء الاشتراك"
          cancelText="العودة"
          variant="danger"
          loading={subscriptionDialog.loading}
        />

        {/* Class Deletion Dialog */}
        <ConfirmationDialog
          open={showClassDeleteDialog}
          onOpenChange={setShowClassDeleteDialog}
          onConfirm={handleDeleteClass}
          title="حذف الحصة"
          description="هل أنت متأكد من حذف هذه الحصة؟ لن تتمكن من استرجاعها بعد الحذف."
          confirmText="نعم، حذف الحصة"
          cancelText="إلغاء"
          variant="danger"
          loading={deletingClass}
          details="سيتم إرجاع الرصيد إلى حسابك تلقائياً"
        />

        {/* Account Deletion Dialog */}
        <ConfirmationDialog
          open={showAccountDeleteDialog}
          onOpenChange={setShowAccountDeleteDialog}
          onConfirm={handleDeleteAccount}
          title="حذف الحساب نهائياً"
          description="هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وحصصك بشكل دائم."
          confirmText="نعم، حذف الحساب"
          cancelText="إلغاء"
          variant="danger"
          loading={deletingAccount}
          details="⚠️ تحذير: سيتم حذف جميع البيانات بشكل نهائي ولن تتمكن من استرجاعها"
        />

        {/* Logout Dialog */}
        <ConfirmationDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          onConfirm={handleLogout}
          title="تسجيل الخروج"
          description="هل تريد تسجيل الخروج من حسابك؟"
          confirmText="نعم، تسجيل الخروج"
          cancelText="البقاء"
          variant="warning"
          loading={loggingOut}
        />

        {/* Discard Changes Dialog (using hook) */}
        <ConfirmationDialog
          open={discardDialog.isOpen}
          onOpenChange={discardDialog.close}
          onConfirm={discardDialog.confirm}
          title="تجاهل التغييرات"
          description="لديك تغييرات غير محفوظة. هل تريد تجاهلها والمتابعة؟"
          confirmText="نعم، تجاهل"
          cancelText="العودة للتعديل"
          variant="warning"
          loading={discardDialog.loading}
        />

        {/* Important Action Dialog */}
        <ConfirmationDialog
          open={showInfoDialog}
          onOpenChange={setShowInfoDialog}
          onConfirm={handleImportantAction}
          title="تأكيد الإجراء"
          description="هذا إجراء مهم يتطلب تأكيدك. هل تريد المتابعة؟"
          confirmText="نعم، متابعة"
          cancelText="إلغاء"
          variant="info"
          details="سيتم تطبيق التغييرات فوراً بعد التأكيد"
        />
      </div>
    </div>
  )
}
