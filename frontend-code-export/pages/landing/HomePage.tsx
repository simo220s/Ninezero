import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SEO from '@/components/SEO'
import HeroSection from './HeroSection'
import StatsSection from './StatsSection'
import PricingSection from './PricingSection'
import TestimonialsSection from './TestimonialsSection'
import ReviewsSection from './ReviewsSection'
import FAQSection from './FAQSection'
import { useStructuredData } from '@/lib/structured-data'

export default function HomePage() {
  const { getOrganizationData, getCourseData, getWebsiteData } = useStructuredData()

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
        <StatsSection />
        <PricingSection />
        <TestimonialsSection />
        <ReviewsSection />
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  )
}
