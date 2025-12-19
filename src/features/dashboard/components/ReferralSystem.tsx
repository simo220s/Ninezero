import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getUserReferrals, getUserProfile } from '@/lib/database'
import { useAuth } from '@/lib/auth-context'
import type { ReferralStats } from '@/types'

export default function ReferralSystem() {
  const { user } = useAuth()
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    if (user) {
      loadReferralData()
    }
  }, [user])

  const loadReferralData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load user profile for referral code
      const { data: profile, error: profileError } = await getUserProfile(user.id)
      if (profileError) {
        logger.error('Error loading profile:', profileError)
      }

      // Load referrals
      const { data: referrals, error: referralsError } = await getUserReferrals(user.id)
      if (referralsError) {
        logger.error('Error loading referrals:', referralsError)
      }

      // Calculate stats
      const stats: ReferralStats = {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
        completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        totalCreditsEarned: referrals?.reduce((sum, r) => sum + (r.credits_awarded || 0), 0) || 0,
        referralCode: profile?.referral_code || 'LOADING...',
        shareableLink: `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`
      }

      setReferralStats(stats)
    } catch (err) {
      logger.error('Referral data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (!referralStats?.shareableLink) return

    try {
      setCopying(true)
      await navigator.clipboard.writeText(referralStats.shareableLink)
      
      // Show success feedback
      const button = document.getElementById('copy-button')
      if (button) {
        const originalText = button.textContent
        button.textContent = 'تم النسخ!'
        setTimeout(() => {
          button.textContent = originalText
        }, 2000)
      }
    } catch (err) {
      logger.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = referralStats.shareableLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('تم نسخ رابط الإحالة!')
    } finally {
      setCopying(false)
    }
  }

  const shareViaWhatsApp = () => {
    if (!referralStats) return
    
    const message = `🎓 انضم معي لتعلم الإنجليزية مع الأستاذ أحمد!

✅ معلم معتمد من جامعة أريزونا
✅ نتائج مضمونة 98%
✅ جلسة تجريبية مجانية

استخدم رابط الإحالة الخاص بي واحصل على خصم:
${referralStats.shareableLink}

#تعلم_الإنجليزية #السعودية`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareViaTwitter = () => {
    if (!referralStats) return
    
    const message = `🎓 تعلم الإنجليزية مع الأستاذ أحمد - معلم معتمد من جامعة أريزونا!
✅ نتائج مضمونة 98%
✅ جلسة تجريبية مجانية

${referralStats.shareableLink}

#تعلم_الإنجليزية #السعودية`

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    window.open(twitterUrl, '_blank')
  }

  const getMilestoneProgress = () => {
    if (!referralStats) return { current: 0, next: 5, progress: 0 }
    
    const completed = referralStats.completedReferrals
    let nextMilestone = 5
    
    if (completed >= 10) {
      nextMilestone = Math.ceil(completed / 10) * 10 + 10
    } else if (completed >= 5) {
      nextMilestone = 10
    }
    
    const progress = (completed / nextMilestone) * 100
    
    return { current: completed, next: nextMilestone, progress }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">نظام الإحالة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!referralStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="arabic-text">نظام الإحالة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-text-secondary arabic-text">حدث خطأ في تحميل بيانات الإحالة</p>
            <Button onClick={loadReferralData} variant="outline" size="sm" className="mt-4 arabic-text">
              المحاولة مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const milestone = getMilestoneProgress()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-text flex items-center">
          <svg className="w-6 h-6 ms-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          نظام الإحالة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Referral Code Section */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-primary-600 arabic-text mb-3">كود الإحالة الخاص بك</h3>
            
            <div className="bg-white p-4 rounded-lg border border-primary-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary arabic-text">رابط الإحالة:</span>
                <Button
                  id="copy-button"
                  onClick={copyReferralLink}
                  disabled={copying}
                  variant="outline"
                  size="sm"
                  className="arabic-text"
                >
                  {copying ? 'جاري النسخ...' : 'نسخ الرابط'}
                </Button>
              </div>
              <code className="text-primary-600 font-mono text-sm break-all">
                {referralStats.shareableLink}
              </code>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={shareViaWhatsApp}
                variant="whatsapp"
                size="sm"
                className="arabic-text"
              >
                <svg className="w-4 h-4 ms-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                </svg>
                مشاركة عبر واتساب
              </Button>
              
              <Button
                onClick={shareViaTwitter}
                variant="outline"
                size="sm"
                className="arabic-text"
              >
                <svg className="w-4 h-4 ms-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                مشاركة عبر تويتر
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary-600">
                {referralStats.pendingReferrals}
              </div>
              <p className="text-sm text-primary-600 arabic-text">إحالات معلقة</p>
              <p className="text-xs text-primary-600 arabic-text mt-1">+0.25 نقطة لكل إحالة</p>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-success-600">
                {referralStats.completedReferrals}
              </div>
              <p className="text-sm text-success-600 arabic-text">إحالات مكتملة</p>
              <p className="text-xs text-success-600 arabic-text mt-1">+0.5 نقطة إضافية</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {referralStats.totalCreditsEarned.toFixed(2)}
              </div>
              <p className="text-sm text-yellow-600 arabic-text">نقاط مكتسبة</p>
              <p className="text-xs text-yellow-600 arabic-text mt-1">يمكن استخدامها للحصص</p>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-600 arabic-text mb-3">التقدم نحو المكافأة التالية</h4>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-yellow-600 arabic-text mb-2">
                <span>{milestone.current} من {milestone.next} إحالات مكتملة</span>
                <span>{Math.round(milestone.progress)}%</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-yellow-600 arabic-text">
              {milestone.next === 5 && (
                <p>🎁 عند الوصول لـ 5 إحالات مكتملة: احصل على نقطة مجانية إضافية!</p>
              )}
              {milestone.next === 10 && (
                <p>🎁 عند الوصول لـ 10 إحالات مكتملة: احصل على خصم 20% على الباقة التالية!</p>
              )}
              {milestone.next > 10 && (
                <p>🎁 عند الوصول لـ {milestone.next} إحالة: مكافآت حصرية تنتظرك!</p>
              )}
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-600 arabic-text mb-4">كيف يعمل نظام الإحالة؟</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-blue-600 arabic-text font-medium">شارك رابط الإحالة</p>
                  <p className="text-blue-500 arabic-text text-sm">أرسل الرابط لأصدقائك عبر واتساب أو وسائل التواصل</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-blue-600 arabic-text font-medium">صديقك يسجل</p>
                  <p className="text-blue-500 arabic-text text-sm">احصل على 0.25 نقطة فور تسجيل صديقك</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="text-blue-600 arabic-text font-medium">صديقك يحجز حصة</p>
                  <p className="text-blue-500 arabic-text text-sm">احصل على 0.5 نقطة إضافية عند حجز صديقك أول حصة مدفوعة</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="text-blue-600 arabic-text font-medium">استخدم النقاط</p>
                  <p className="text-blue-500 arabic-text text-sm">استخدم النقاط المكتسبة لحجز حصص مجانية أو احصل على خصومات</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
