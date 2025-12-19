/**
 * Subscription Plan Management Component
 * 
 * Allows teachers to create and modify subscription plans
 * Requirement 9.1: Interface to create and modify subscription plans
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { logger } from '@/lib/logger'
import subscriptionPlanService, { type SubscriptionPlan } from '@/lib/services/subscription-plan-service'
import { toast } from '@/components/ui/toast'



interface FormData {
  name: string
  nameAr: string
  price: string
  credits: string
  duration: 'monthly' | 'quarterly' | 'annual'
  features: string
}

interface FormErrors {
  name?: string
  nameAr?: string
  price?: string
  credits?: string
  features?: string
}

export default function SubscriptionPlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nameAr: '',
    price: '',
    credits: '',
    duration: 'monthly',
    features: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await subscriptionPlanService.getAllPlans()
      
      if (error) {
        toast.error('فشل تحميل باقات الاشتراك')
        logger.error('Error loading subscription plans:', error)
        return
      }
      
      setPlans(data || [])
    } catch (err) {
      logger.error('Error loading subscription plans:', err)
      toast.error('حدث خطأ أثناء تحميل الباقات')
    } finally {
      setLoading(false)
    }
  }


  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'اسم الباقة بالإنجليزية مطلوب'
    }

    if (!formData.nameAr.trim()) {
      errors.nameAr = 'اسم الباقة بالعربية مطلوب'
    }

    const price = parseFloat(formData.price)
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = 'السعر يجب أن يكون رقماً موجباً'
    }

    const credits = parseFloat(formData.credits)
    if (!formData.credits || isNaN(credits) || credits <= 0) {
      errors.credits = 'عدد الحصص يجب أن يكون رقماً موجباً'
    }

    if (!formData.features.trim()) {
      errors.features = 'الميزات مطلوبة (افصل بينها بفاصلة)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const planData = {
        name: formData.name,
        name_ar: formData.nameAr,
        price: parseFloat(formData.price),
        credits: parseFloat(formData.credits),
        duration: formData.duration,
        features: formData.features.split(',').map(f => f.trim())
      }

      if (editingPlanId) {
        // Update existing plan
        const { error } = await subscriptionPlanService.updatePlan(editingPlanId, planData)
        
        if (error) {
          toast.error('فشل تحديث الباقة')
          return
        }
        
        toast.success('تم تحديث الباقة بنجاح')
        setEditingPlanId(null)
      } else {
        // Create new plan
        const { error } = await subscriptionPlanService.createPlan(planData)
        
        if (error) {
          toast.error('فشل إنشاء الباقة')
          return
        }
        
        toast.success('تم إنشاء الباقة بنجاح')
        setIsCreating(false)
      }

      // Reset form
      setFormData({
        name: '',
        nameAr: '',
        price: '',
        credits: '',
        duration: 'monthly',
        features: ''
      })
      setFormErrors({})

      // Reload plans
      await loadPlans()
    } catch (err) {
      logger.error('Error saving subscription plan:', err)
      toast.error('حدث خطأ أثناء حفظ الباقة')
    }
  }


  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id)
    setIsCreating(true)
    setFormData({
      name: plan.name,
      nameAr: plan.name_ar,
      price: plan.price.toString(),
      credits: plan.credits.toString(),
      duration: plan.duration,
      features: plan.features.join(', ')
    })
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      return
    }

    try {
      const { error } = await subscriptionPlanService.deletePlan(planId)
      
      if (error) {
        toast.error('فشل حذف الباقة')
        return
      }
      
      toast.success('تم حذف الباقة بنجاح')
      await loadPlans()
    } catch (err) {
      logger.error('Error deleting subscription plan:', err)
      toast.error('حدث خطأ أثناء حذف الباقة')
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingPlanId(null)
    setFormData({
      name: '',
      nameAr: '',
      price: '',
      credits: '',
      duration: 'monthly',
      features: ''
    })
    setFormErrors({})
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'monthly': return 'شهري'
      case 'quarterly': return 'ربع سنوي'
      case 'annual': return 'سنوي'
      default: return duration
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }


  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary arabic-text">
            إدارة باقات الاشتراك
          </h2>
          <p className="text-text-secondary arabic-text mt-1">
            إنشاء وتعديل باقات الاشتراك للطلاب
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="arabic-text"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة باقة جديدة
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="border-primary-200 bg-primary-50/30">
          <CardHeader>
            <CardTitle className="arabic-text">
              {editingPlanId ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="arabic-text text-right block">
                    اسم الباقة (English)
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 8 Classes Package"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 arabic-text text-right">{formErrors.name}</p>
                  )}
                </div>

                {/* Arabic Name */}
                <div className="space-y-2">
                  <Label htmlFor="nameAr" className="arabic-text text-right block">
                    اسم الباقة (العربية)
                  </Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: باقة 8 حصص"
                    className={`text-right ${formErrors.nameAr ? 'border-red-500' : ''}`}
                  />
                  {formErrors.nameAr && (
                    <p className="text-sm text-red-600 arabic-text text-right">{formErrors.nameAr}</p>
                  )}
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="arabic-text text-right block">
                    السعر (ريال)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="800"
                    className={`text-right ${formErrors.price ? 'border-red-500' : ''}`}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-600 arabic-text text-right">{formErrors.price}</p>
                  )}
                </div>

                {/* Credits */}
                <div className="space-y-2">
                  <Label htmlFor="credits" className="arabic-text text-right block">
                    عدد الحصص
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    step="0.5"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    placeholder="8"
                    className={`text-right ${formErrors.credits ? 'border-red-500' : ''}`}
                  />
                  {formErrors.credits && (
                    <p className="text-sm text-red-600 arabic-text text-right">{formErrors.credits}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="arabic-text text-right block">
                    المدة
                  </Label>
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                    className="flex h-11 w-full rounded-xl border-2 border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right arabic-text"
                  >
                    <option value="monthly">شهري</option>
                    <option value="quarterly">ربع سنوي</option>
                    <option value="annual">سنوي</option>
                  </select>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label htmlFor="features" className="arabic-text text-right block">
                  الميزات (افصل بينها بفاصلة)
                </Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="8 حصص, جدولة مرنة, إلغاء في أي وقت"
                  className={`text-right ${formErrors.features ? 'border-red-500' : ''}`}
                />
                {formErrors.features && (
                  <p className="text-sm text-red-600 arabic-text text-right">{formErrors.features}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="arabic-text"
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="arabic-text"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingPlanId ? 'حفظ التعديلات' : 'إضافة الباقة'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}


      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`hover:shadow-lg transition-all ${
              plan.is_active ? 'border-primary-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="arabic-text text-xl mb-1">
                    {plan.name_ar}
                  </CardTitle>
                  <p className="text-sm text-text-secondary">{plan.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(plan.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center py-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {plan.price.toLocaleString('ar-SA')} ريال
                </div>
                <p className="text-sm text-text-secondary arabic-text">
                  {getDurationLabel(plan.duration)}
                </p>
              </div>

              {/* Credits */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-text-secondary arabic-text">عدد الحصص</span>
                <span className="text-lg font-bold text-green-600">
                  {plan.credits} حصة
                </span>
              </div>

              {/* Price per class */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-text-secondary arabic-text">سعر الحصة</span>
                <span className="text-lg font-bold text-blue-600">
                  {(plan.price / plan.credits).toFixed(0)} ريال
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-primary arabic-text">الميزات:</p>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-text-secondary arabic-text"
                    >
                      <svg
                        className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Status Badge */}
              <div className="pt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    plan.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {plan.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && !isCreating && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary arabic-text mb-2">
              لا توجد باقات اشتراك
            </h3>
            <p className="text-text-secondary arabic-text mb-4">
              ابدأ بإضافة باقة اشتراك جديدة للطلاب
            </p>
            <Button onClick={() => setIsCreating(true)} className="arabic-text">
              <Plus className="w-4 h-4 ml-2" />
              إضافة باقة جديدة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
