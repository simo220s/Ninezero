import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

/**
 * ButtonExamples - Demonstrates all button functionality
 * 
 * This component showcases:
 * 1. Basic onClick handlers
 * 2. Async onClick handlers with loading states
 * 3. Navigation with href prop
 * 4. Navigation with Link component (asChild)
 * 5. Disabled states
 * 6. Loading states
 * 7. Different variants and sizes
 */
export default function ButtonExamples() {
  const [clickCount, setClickCount] = useState(0)
  const [asyncLoading, setAsyncLoading] = useState(false)
  const [asyncResult, setAsyncResult] = useState<string>('')

  const handleBasicClick = () => {
    setClickCount(prev => prev + 1)
  }

  const handleAsyncClick = async () => {
    setAsyncLoading(true)
    setAsyncResult('جاري المعالجة...')
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAsyncResult('تمت العملية بنجاح!')
    setAsyncLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 arabic-text">
          أمثلة على الأزرار - Button Examples
        </h1>

        {/* Basic onClick */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">1. Basic onClick Handler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              زر بسيط مع معالج onClick - عدد النقرات: {clickCount}
            </p>
            <Button onClick={handleBasicClick} className="arabic-text">
              انقر هنا ({clickCount})
            </Button>
          </CardContent>
        </Card>

        {/* Async onClick */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">2. Async onClick with Loading State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              زر مع عملية غير متزامنة - النتيجة: {asyncResult || 'لم يتم التنفيذ بعد'}
            </p>
            <Button 
              onClick={handleAsyncClick} 
              loading={asyncLoading}
              className="arabic-text"
            >
              تنفيذ عملية غير متزامنة
            </Button>
          </CardContent>
        </Card>

        {/* Navigation with href */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">3. Navigation with href Prop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              التنقل باستخدام خاصية href
            </p>
            <div className="flex gap-4">
              <Button href="/dashboard/teacher/students" className="arabic-text">
                عرض الطلاب
              </Button>
              <Button href="/dashboard/teacher/credits" variant="outline" className="arabic-text">
                إدارة الرصيد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation with Link (asChild) */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">4. Navigation with Link Component (asChild)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              التنقل باستخدام مكون Link مع خاصية asChild
            </p>
            <div className="flex gap-4">
              <Button asChild variant="secondary" className="arabic-text">
                <Link to="/dashboard/teacher/classes">إدارة الحصص</Link>
              </Button>
              <Button asChild variant="outline" className="arabic-text">
                <Link to="/dashboard/teacher/reviews">المراجعات</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disabled States */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">5. Disabled States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              أزرار معطلة - لا يمكن النقر عليها
            </p>
            <div className="flex gap-4">
              <Button disabled className="arabic-text">
                زر معطل
              </Button>
              <Button disabled variant="outline" className="arabic-text">
                زر معطل (outline)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">6. Loading States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              أزرار في حالة التحميل
            </p>
            <div className="flex gap-4">
              <Button loading className="arabic-text">
                زر في حالة التحميل
              </Button>
              <Button loading variant="outline" className="arabic-text">
                زر في حالة التحميل (outline)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">7. Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              أنواع مختلفة من الأزرار
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" className="arabic-text">
                Primary
              </Button>
              <Button variant="secondary" className="arabic-text">
                Secondary
              </Button>
              <Button variant="outline" className="arabic-text">
                Outline
              </Button>
              <Button variant="ghost" className="arabic-text">
                Ghost
              </Button>
              <Button variant="whatsapp" className="arabic-text">
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">8. Button Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 arabic-text">
              أحجام مختلفة من الأزرار
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" className="arabic-text">
                Small
              </Button>
              <Button size="md" className="arabic-text">
                Medium
              </Button>
              <Button size="lg" className="arabic-text">
                Large
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expand/Collapse Example */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">9. Expand/Collapse Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ExpandCollapseExample />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Expand/Collapse Example Component
function ExpandCollapseExample() {
  const [showAll, setShowAll] = useState(false)
  const items = Array.from({ length: 15 }, (_, i) => `عنصر ${i + 1}`)

  return (
    <div className="space-y-4">
      <p className="text-gray-600 arabic-text">
        مثال على زر التوسيع/الطي (عرض المزيد/عرض أقل)
      </p>
      
      <div className="space-y-2">
        {(showAll ? items : items.slice(0, 5)).map((item, index) => (
          <div key={index} className="p-3 bg-gray-100 rounded-lg">
            <p className="text-gray-700 arabic-text">{item}</p>
          </div>
        ))}
      </div>

      {items.length > 5 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="arabic-text flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
            >
              <path d="M12 5v14"></path>
              <path d="m19 12-7 7-7-7"></path>
            </svg>
            {showAll ? 'عرض أقل' : 'عرض المزيد'}
          </Button>
        </div>
      )}
    </div>
  )
}
