import { useLanguage } from '@/hooks/useRTL'

export function useStructuredData() {
  const { language } = useLanguage()
  const siteUrl = 'https://saudienglishclub.com'

  const getOrganizationData = () => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": language === 'ar' ? "نادي السعودية للغة الإنجليزية" : "Saudi English Club",
    "alternateName": language === 'ar' ? "SEC" : "Saudi English Club",
    "description": language === 'ar' 
      ? "تعلم اللغة الإنجليزية مع الأستاذ أحمد، معلم معتمد من جامعة أريزونا"
      : "Learn English with Teacher Ahmad, TESOL-certified from University of Arizona",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "image": `${siteUrl}/images/teacher-ahmad-hero.jpg`,
    "telephone": "+966-50-123-4567",
    "email": "info@saudienglishclub.com",
    "foundingDate": "2019",
    "founder": {
      "@type": "Person",
      "name": language === 'ar' ? "الأستاذ أحمد" : "Teacher Ahmad",
      "jobTitle": language === 'ar' ? "معلم اللغة الإنجليزية المعتمد" : "Certified English Language Teacher",
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "University of Arizona",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Tucson",
          "addressRegion": "Arizona",
          "addressCountry": "US"
        }
      },
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "name": "TESOL Certification",
          "credentialCategory": "Teaching English to Speakers of Other Languages"
        }
      ],
      "knowsLanguage": ["Arabic", "English"],
      "yearsOfExperience": "8+"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SA",
      "addressRegion": language === 'ar' ? "المملكة العربية السعودية" : "Saudi Arabia"
    },
    "areaServed": {
      "@type": "Country",
      "name": language === 'ar' ? "المملكة العربية السعودية" : "Saudi Arabia"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "audienceType": language === 'ar' ? "الأطفال والمراهقون" : "Children and Teenagers",
      "suggestedMinAge": 10,
      "suggestedMaxAge": 18
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+966-50-123-4567",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "08:00",
          "closes": "22:00"
        }
      }
    ],
    "sameAs": [
      "https://wa.me/966564084838",
      "https://twitter.com/SaudiEnglishClub",
      "https://instagram.com/saudienglishclub"
    ]
  })

  const getCourseData = () => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": language === 'ar' ? "دورة تعلم اللغة الإنجليزية للأطفال" : "English Language Course for Children",
    "description": language === 'ar'
      ? "دورة شاملة لتعلم اللغة الإنجليزية للأطفال السعوديين من عمر 10-18 سنة مع الأستاذ أحمد المعتمد من جامعة أريزونا"
      : "Comprehensive English language course for Saudi children aged 10-18 with Teacher Ahmad, certified by University of Arizona",
    "provider": {
      "@type": "EducationalOrganization",
      "name": language === 'ar' ? "نادي السعودية للغة الإنجليزية" : "Saudi English Club",
      "url": siteUrl
    },
    "instructor": {
      "@type": "Person",
      "name": language === 'ar' ? "الأستاذ أحمد" : "Teacher Ahmad",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "name": "TESOL Certification"
      }
    },
    "courseMode": ["Online", "Individual", "Group"],
    "educationalLevel": "Beginner to Advanced",
    "teaches": language === 'ar' ? "اللغة الإنجليزية" : "English Language",
    "audience": {
      "@type": "EducationalAudience",
      "suggestedMinAge": 10,
      "suggestedMaxAge": 18
    },
    "offers": [
      {
        "@type": "Offer",
        "name": language === 'ar' ? "جلسة تجريبية مجانية" : "Free Trial Session",
        "price": "0",
        "priceCurrency": "SAR",
        "description": language === 'ar' ? "جلسة تقييم مجانية 25 دقيقة" : "Free 25-minute assessment session"
      },
      {
        "@type": "Offer",
        "name": language === 'ar' ? "حصص فردية" : "Individual Classes",
        "price": "150",
        "priceCurrency": "SAR",
        "description": language === 'ar' ? "حصص خصوصية 60 دقيقة" : "Private 60-minute sessions"
      },
      {
        "@type": "Offer",
        "name": language === 'ar' ? "حصص جماعية" : "Group Classes",
        "price": "100",
        "priceCurrency": "SAR",
        "description": language === 'ar' ? "مجموعات صغيرة 60 دقيقة" : "Small group 60-minute sessions"
      }
    ]
  })

  const getFAQData = (faqs: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  })

  const getPersonData = () => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": language === 'ar' ? "الأستاذ أحمد" : "Teacher Ahmad",
    "jobTitle": language === 'ar' ? "معلم اللغة الإنجليزية المعتمد" : "Certified English Language Teacher",
    "description": language === 'ar'
      ? "معلم لغة إنجليزية معتمد من جامعة أريزونا مع خبرة 8+ سنوات في تعليم الأطفال"
      : "TESOL-certified English teacher from University of Arizona with 8+ years experience teaching Saudi children",
    "image": `${siteUrl}/images/teacher-ahmad-profile.jpg`,
    "url": `${siteUrl}/about`,
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "University of Arizona"
    },
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "TESOL Certification",
        "credentialCategory": "Teaching English to Speakers of Other Languages"
      }
    ],
    "knowsLanguage": ["Arabic", "English"],
    "nationality": {
      "@type": "Country",
      "name": language === 'ar' ? "المملكة العربية السعودية" : "Saudi Arabia"
    },
    "workLocation": {
      "@type": "Place",
      "name": language === 'ar' ? "المملكة العربية السعودية" : "Saudi Arabia"
    },
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": language === 'ar' ? "نادي السعودية للغة الإنجليزية" : "Saudi English Club"
    }
  })

  const getWebsiteData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": language === 'ar' ? "نادي السعودية للغة الإنجليزية" : "Saudi English Club",
    "url": siteUrl,
    "description": language === 'ar'
      ? "تعلم اللغة الإنجليزية مع الأستاذ أحمد، معلم معتمد من جامعة أريزونا"
      : "Learn English with Teacher Ahmad, TESOL-certified from University of Arizona",
    "inLanguage": [language === 'ar' ? 'ar-SA' : 'en-US'],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": language === 'ar' ? "نادي السعودية للغة الإنجليزية" : "Saudi English Club",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo.png`
      }
    }
  })

  return {
    getOrganizationData,
    getCourseData,
    getFAQData,
    getPersonData,
    getWebsiteData
  }
}
