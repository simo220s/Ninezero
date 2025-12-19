import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

/**
 * Interactive States Demo Component
 * 
 * This component demonstrates all the enhanced interactive states
 * implemented in Task 25. Use this for visual testing and verification.
 */
export default function InteractiveStatesDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 arabic-text">
            عرض الحالات التفاعلية
          </h1>
          <p className="text-gray-600 arabic-text">
            جميع العناصر التفاعلية مع حالات التمرير والتركيز والنشاط
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">الأزرار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">زر أساسي</Button>
              <Button variant="secondary">زر ثانوي</Button>
              <Button variant="outline">زر محدد</Button>
              <Button variant="ghost">زر شفاف</Button>
              <Button disabled>زر معطل</Button>
              <Button loading>جاري التحميل</Button>
            </div>
            <p className="text-sm text-gray-600 arabic-text">
              جرب التمرير والنقر والتركيز باستخدام Tab
            </p>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">حقول الإدخال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="حقل عادي" placeholder="أدخل النص هنا" />
            <Input label="حقل مع خطأ" error="هذا الحقل مطلوب" />
            <Input label="حقل معطل" disabled value="معطل" />
            <Input label="كلمة المرور" type="password" placeholder="أدخل كلمة المرور" />
          </CardContent>
        </Card>

        {/* Checkboxes */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">مربعات الاختيار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox label="خيار 1" />
            <Checkbox label="خيار 2" defaultChecked />
            <Checkbox label="خيار معطل" disabled />
            <Checkbox label="خيار معطل ومحدد" disabled defaultChecked />
          </CardContent>
        </Card>

        {/* Radio Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">أزرار الاختيار</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option1" id="option1" />
                <label htmlFor="option1" className="cursor-pointer">الخيار 1</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option2" id="option2" />
                <label htmlFor="option2" className="cursor-pointer">الخيار 2</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option3" id="option3" disabled />
                <label htmlFor="option3" className="opacity-50">الخيار 3 (معطل)</label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Select */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">القوائم المنسدلة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select label="اختر خياراً">
              <option value="">-- اختر --</option>
              <option value="1">الخيار 1</option>
              <option value="2">الخيار 2</option>
              <option value="3">الخيار 3</option>
            </Select>
            <Select label="قائمة معطلة" disabled>
              <option value="">معطل</option>
            </Select>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">التبويبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">التبويب 1</TabsTrigger>
                <TabsTrigger value="tab2">التبويب 2</TabsTrigger>
                <TabsTrigger value="tab3">التبويب 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="arabic-text">محتوى التبويب 1</p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="arabic-text">محتوى التبويب 2</p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="arabic-text">محتوى التبويب 3</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">القائمة المنسدلة</CardTitle>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline">افتح القائمة</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent dir="rtl">
                <DropdownMenuItem>الخيار 1</DropdownMenuItem>
                <DropdownMenuItem>الخيار 2</DropdownMenuItem>
                <DropdownMenuItem>الخيار 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="interactive" className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold arabic-text">بطاقة تفاعلية 1</h3>
              <p className="text-sm text-gray-600 arabic-text">انقر للتفاعل</p>
            </CardContent>
          </Card>

          <Card variant="interactive" className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold arabic-text">بطاقة تفاعلية 2</h3>
              <p className="text-sm text-gray-600 arabic-text">انقر للتفاعل</p>
            </CardContent>
          </Card>

          <Card variant="interactive" className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold arabic-text">بطاقة تفاعلية 3</h3>
              <p className="text-sm text-gray-600 arabic-text">انقر للتفاعل</p>
            </CardContent>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="arabic-text text-blue-900">تعليمات الاختبار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-900">
            <p className="arabic-text">✅ مرر الماوس فوق كل عنصر للتحقق من حالة التمرير</p>
            <p className="arabic-text">✅ اضغط Tab للتنقل والتحقق من حالات التركيز</p>
            <p className="arabic-text">✅ انقر واستمر في الضغط للتحقق من الحالة النشطة</p>
            <p className="arabic-text">✅ تحقق من أن العناصر المعطلة لا تستجيب</p>
            <p className="arabic-text">✅ استخدم لوحة المفاتيح فقط للتنقل في الصفحة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
