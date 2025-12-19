import { useEffect, useState } from 'react'
import { Calendar, Clock } from 'lucide-react'

// Declare NeetoCal types
declare global {
  interface Window {
    neetoCal: {
      embed: (config: {
        type: string
        id: string
        organization: string
        elementSelector: string
        styles: string
        isSidebarAndCoverImgHidden: string
        shouldForwardQueryParams: string
      }) => void
      q?: any[]
    }
  }
}

export default function BookTrialPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Clear the container first
    const container = document.getElementById('inline-embed-container')
    if (container) {
      container.innerHTML = ''
    }

    // Initialize NeetoCal queue
    window.neetoCal = window.neetoCal || {
      embed: function () {
        (window.neetoCal.q = window.neetoCal.q || []).push(arguments)
      },
      q: []
    }

    // Function to embed the calendar
    const embedCalendar = () => {
      try {
        logger.log('Embedding NeetoCal calendar...')
        window.neetoCal.embed({
          type: "inline",
          id: "ea729381-1127-4843-b6e7-8801d6cd5700",
          organization: "americanenglish",
          elementSelector: "#inline-embed-container",
          styles: "height: 100%; width: 100%;",
          isSidebarAndCoverImgHidden: "true",
          shouldForwardQueryParams: "false"
        })
        logger.log('NeetoCal embed called successfully')
        // Mark as loaded after a short delay to ensure calendar renders
        setTimeout(() => setIsLoaded(true), 1500)
      } catch (error) {
        logger.error('NeetoCal embed error:', error)
      }
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://cdn.neetocal.com/javascript/embed.js"]')

    if (existingScript) {
      // Script already loaded, embed immediately
      logger.log('NeetoCal script already loaded')
      embedCalendar()
    } else {
      // Create and load NeetoCal script
      logger.log('Loading NeetoCal script...')
      const script = document.createElement('script')
      script.src = 'https://cdn.neetocal.com/javascript/embed.js'
      script.async = true
      script.onload = () => {
        logger.log('NeetoCal script loaded')
        embedCalendar()
      }
      script.onerror = () => {
        logger.error('Failed to load NeetoCal script')
      }
      document.body.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Clear the container on unmount
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header - Shows loading or session info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          {!isLoaded ? (
            // Loading state
            <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-base font-medium arabic-text shadow-sm">
              <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              جاري عرض المواعيد المتاحة
            </div>
          ) : (
            // Loaded state - Session info
            <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-lg border-2 border-blue-200">
              {/* Calendar Icon + Title */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 font-semibold arabic-text">حصة تجريبية - تقييم المستوى</span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Duration */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 font-medium">25 دقيقة</span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Google Meet */}
              <div className="flex items-center gap-2">
                <img 
                  src="https://i.ibb.co/k6xrqJQK/7089160-google-meet-icon-1.png" 
                  alt="Google Meet" 
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium">Google Meet</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div
            id="inline-embed-container"
            className="w-full"
            style={{
              height: '717px',
              minHeight: '600px'
            }}
          >
            {/* Fallback content while loading */}
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-white">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-700 text-lg arabic-text font-medium">جاري تحميل التقويم...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for NeetoCal */}
      <style>{`
        /* Override NeetoCal loading colors to match blue theme */
        #inline-embed-container .loading-spinner,
        #inline-embed-container .spinner,
        #inline-embed-container [class*="loading"],
        #inline-embed-container [class*="spinner"] {
          border-color: #2563eb !important;
          border-top-color: transparent !important;
        }
        
        /* Style the calendar iframe */
        #inline-embed-container iframe {
          border-radius: 0.75rem;
        }
        
        /* Ensure responsive behavior */
        @media (max-width: 1024px) {
          #inline-embed-container {
            height: 650px !important;
            min-height: 550px !important;
          }
        }
        
        @media (max-width: 768px) {
          #inline-embed-container {
            height: 600px !important;
            min-height: 500px !important;
          }
        }
        
        @media (max-width: 480px) {
          #inline-embed-container {
            height: 550px !important;
            min-height: 450px !important;
          }
        }

        /* Blue spinner animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Blue border width utility */
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  )
}
