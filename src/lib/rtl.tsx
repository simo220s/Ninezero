import React, { createContext, useContext, useEffect } from 'react'

interface RTLContextType {
  direction: 'rtl' | 'ltr'
  isRTL: boolean
}

const RTLContext = createContext<RTLContextType>({
  direction: 'rtl',
  isRTL: true,
})

export const useRTLContext = (): RTLContextType => useContext(RTLContext)

interface RTLProviderProps {
  children: React.ReactNode
  defaultDirection?: 'rtl' | 'ltr'
}

export function RTLProvider({ children, defaultDirection = 'rtl' }: RTLProviderProps) {
  const isRTL = defaultDirection === 'rtl'

  useEffect(() => {
    // Set the document direction
    document.documentElement.dir = defaultDirection
    document.documentElement.lang = isRTL ? 'ar' : 'en'
  }, [defaultDirection, isRTL])

  const value: RTLContextType = {
    direction: defaultDirection,
    isRTL,
  }

  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>
}
