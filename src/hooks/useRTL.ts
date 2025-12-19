/**
 * Simple RTL hook - Always returns RTL for Arabic
 */
export function useRTL() {
  return {
    direction: 'rtl' as const,
    isRTL: true,
  }
}

export function useLanguage() {
  return {
    language: 'ar' as const,
    direction: 'rtl' as const,
    setLanguage: () => {},
    toggleLanguage: () => {},
  }
}
