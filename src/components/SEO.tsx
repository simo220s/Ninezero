import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  structuredData?: object
  noIndex?: boolean
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = '/images/teacher-ahmad-og.jpg',
  url,
  type = 'website',
  structuredData,
  noIndex = false
}: SEOProps) {
  // Default SEO values - Arabic only
  const defaultTitle = 'تعلم الإنجليزية مع الأستاذ أحمد - نادي السعودية للغة الإنجليزية'
  const defaultDescription = 'تعلم اللغة الإنجليزية مع الأستاذ أحمد، معلم معتمد من جامعة أريزونا. حصص فردية وجماعية للأطفال السعوديين من عمر 10-18 سنة. جلسة تجريبية مجانية.'
  const defaultKeywords = ['تعلم الإنجليزية', 'معلم إنجليزي', 'السعودية', 'أطفال', 'جامعة أريزونا', 'TESOL', 'حصص خصوصية', 'تعليم أونلاين']

  const siteUrl = 'https://saudienglishclub.com'
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle
  const fullDescription = description || defaultDescription
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`
  const allKeywords = [...defaultKeywords, ...keywords].join(', ')

  // Default structured data for the organization - Arabic only
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "نادي السعودية للغة الإنجليزية",
    "description": fullDescription,
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "image": fullImage,
    "founder": {
      "@type": "Person",
      "name": "الأستاذ أحمد",
      "jobTitle": "معلم اللغة الإنجليزية",
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "University of Arizona"
      },
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "name": "TESOL Certification"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SA",
      "addressRegion": "المملكة العربية السعودية"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+966-50-123-4567",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "جلسة تجريبية مجانية",
        "description": "جلسة تقييم مجانية 25 دقيقة",
        "price": "0",
        "priceCurrency": "SAR"
      },
      {
        "@type": "Offer",
        "name": "حصص فردية",
        "description": "حصص خصوصية 60 دقيقة",
        "price": "150",
        "priceCurrency": "SAR"
      },
      {
        "@type": "Offer",
        "name": "حصص جماعية",
        "description": "مجموعات صغيرة 60 دقيقة",
        "price": "100",
        "priceCurrency": "SAR"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500",
      "bestRating": "5"
    }
  }

  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content="Teacher Ahmad - Saudi English Club" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Language and Region */}
      <meta name="language" content="ar" />
      <meta name="geo.region" content="SA" />
      <meta name="geo.country" content="Saudi Arabia" />
      <meta name="geo.placename" content="Saudi Arabia" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="الأستاذ أحمد - معلم اللغة الإنجليزية" />
      <meta property="og:site_name" content="نادي السعودية للغة الإنجليزية" />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content="الأستاذ أحمد - معلم اللغة الإنجليزية" />
      <meta name="twitter:creator" content="@SaudiEnglishClub" />
      <meta name="twitter:site" content="@SaudiEnglishClub" />
      
      {/* Additional Meta Tags for Education */}
      <meta name="category" content="Education" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  )
}
