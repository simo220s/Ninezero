import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SEO from '@/components/SEO'
import HeroSection from './HeroSection'
import JourneySection from './JourneySection'
import StatsSection from './StatsSection'
import PricingSection from './PricingSection'
import TestimonialsSection from './TestimonialsSection'
import ReviewsSection from './ReviewsSection'
import FAQSection from './FAQSection'
import FinalCTASection from './FinalCTASection'
import { useStructuredData } from '@/lib/structured-data'

export default function HomePage() {
  const { getOrganizationData, getCourseData, getWebsiteData } = useStructuredData()
  const location = useLocation()

  // Handle hash navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location])

  // Combine multiple structured data types
  const combinedStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      getWebsiteData(),
      getOrganizationData(),
      getCourseData()
    ]
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="تعلم الإنجليزية مع الأستاذ أحمد"
        description="تعلم اللغة الإنجليزية مع الأستاذ أحمد، معلم معتمد من جامعة أريزونا. حصص فردية وجماعية للأطفال السعوديين. جلسة تجريبية مجانية 25 دقيقة."
        keywords={['تعلم الإنجليزية', 'معلم إنجليزي', 'السعودية', 'أطفال', 'جامعة أريزونا', 'TESOL', 'حصص خصوصية']}
        structuredData={combinedStructuredData}
        url="/"
      />
      
      <Header />
      
      <main id="main-content" role="main">
        <HeroSection />
        <JourneySection />
        <StatsSection />
        <PricingSection />
        <TestimonialsSection />
        <ReviewsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      
      <Footer />
    </div>
  )
}
