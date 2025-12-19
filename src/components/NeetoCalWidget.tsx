import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

interface NeetoCalWidgetProps {
  embedUrl: string
  duration: number
  appointmentType: 'trial' | 'regular'
  onBookingComplete?: (bookingData: any) => void
}

export default function NeetoCalWidget({ 
  embedUrl, 
  duration, 
  appointmentType,
  onBookingComplete 
}: NeetoCalWidgetProps) {
  const { user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Listen for messages from the NeetoCal iframe
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from NeetoCal domain
      if (!event.origin.includes('neetocal.com')) return

      if (event.data.type === 'booking_completed') {
        onBookingComplete?.(event.data.booking)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onBookingComplete])

  // Construct the embed URL with prefilled data
  const getEmbedUrl = () => {
    const url = new URL(embedUrl)
    
    if (user) {
      // Prefill user data
      url.searchParams.set('name', `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim())
      url.searchParams.set('email', user.email || '')
    }
    
    // Add appointment type and duration
    url.searchParams.set('duration', duration.toString())
    url.searchParams.set('type', appointmentType)
    
    return url.toString()
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-white rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        width="100%"
        height="600"
        frameBorder="0"
        title={`Book ${appointmentType} lesson - ${duration} minutes`}
        className="w-full h-full"
        allow="camera; microphone; fullscreen"
      />
    </div>
  )
}
