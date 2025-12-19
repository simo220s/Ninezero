/**
 * Browser Detection Utility
 * 
 * Detects browser type and version for conditional fixes
 * Task 21: Cross-Browser Compatibility Testing
 */

export interface BrowserInfo {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  version: string
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isEdge: boolean
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
}

/**
 * Detect browser information
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      name: 'unknown',
      version: '',
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
    }
  }

  const userAgent = navigator.userAgent
  const vendor = navigator.vendor || ''

  // Detect browser
  let name: BrowserInfo['name'] = 'unknown'
  let version = ''

  // Edge (Chromium-based)
  if (userAgent.includes('Edg/')) {
    name = 'edge'
    version = userAgent.match(/Edg\/(\d+\.\d+)/)?.[1] || ''
  }
  // Chrome
  else if (userAgent.includes('Chrome') && vendor.includes('Google')) {
    name = 'chrome'
    version = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || ''
  }
  // Safari
  else if (userAgent.includes('Safari') && vendor.includes('Apple')) {
    name = 'safari'
    version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || ''
  }
  // Firefox
  else if (userAgent.includes('Firefox')) {
    name = 'firefox'
    version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || ''
  }

  // Detect mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)

  return {
    name,
    version,
    isChrome: name === 'chrome',
    isFirefox: name === 'firefox',
    isSafari: name === 'safari',
    isEdge: name === 'edge',
    isMobile,
    isIOS,
    isAndroid,
  }
}

/**
 * Check if browser supports a specific feature
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false

  switch (feature) {
    case 'clipboard':
      return !!navigator.clipboard?.writeText

    case 'audioContext':
      return !!(window.AudioContext || (window as any).webkitAudioContext)

    case 'notification':
      return 'Notification' in window

    case 'serviceWorker':
      return 'serviceWorker' in navigator

    case 'webSocket':
      return 'WebSocket' in window

    case 'localStorage':
      try {
        const test = '__test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }

    case 'sessionStorage':
      try {
        const test = '__test__'
        sessionStorage.setItem(test, test)
        sessionStorage.removeItem(test)
        return true
      } catch {
        return false
      }

    case 'indexedDB':
      return !!window.indexedDB

    case 'webGL':
      try {
        const canvas = document.createElement('canvas')
        return !!(
          canvas.getContext('webgl') || 
          canvas.getContext('experimental-webgl')
        )
      } catch {
        return false
      }

    case 'touch':
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0

    case 'geolocation':
      return 'geolocation' in navigator

    case 'camera':
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    default:
      return false
  }
}

/**
 * Get browser-specific CSS prefix
 */
export function getCSSPrefix(): string {
  const browser = detectBrowser()
  
  switch (browser.name) {
    case 'firefox':
      return '-moz-'
    case 'safari':
      return '-webkit-'
    case 'chrome':
    case 'edge':
      return '-webkit-'
    default:
      return ''
  }
}

/**
 * Check if browser is supported
 */
export function isBrowserSupported(): boolean {
  const browser = detectBrowser()
  
  // Check for minimum browser versions
  const minVersions: Record<string, number> = {
    chrome: 90,
    firefox: 88,
    safari: 14,
    edge: 90,
  }

  if (browser.name === 'unknown') return false

  const currentVersion = parseInt(browser.version)
  const minVersion = minVersions[browser.name]

  return currentVersion >= minVersion
}

/**
 * Get browser warning message if unsupported
 */
export function getBrowserWarning(): string | null {
  if (isBrowserSupported()) return null

  const browser = detectBrowser()
  
  if (browser.name === 'unknown') {
    return 'Your browser is not supported. Please use Chrome, Firefox, Safari, or Edge.'
  }

  return `Your ${browser.name} version (${browser.version}) is outdated. Please update to the latest version for the best experience.`
}

/**
 * Apply browser-specific fixes
 */
export function applyBrowserFixes(): void {
  const browser = detectBrowser()

  // Safari-specific fixes
  if (browser.isSafari) {
    // Fix for Safari date input
    document.documentElement.classList.add('browser-safari')
    
    // Prevent elastic scrolling on iOS
    if (browser.isIOS) {
      document.body.style.overscrollBehavior = 'none'
    }
  }

  // Firefox-specific fixes
  if (browser.isFirefox) {
    document.documentElement.classList.add('browser-firefox')
  }

  // Chrome-specific fixes
  if (browser.isChrome) {
    document.documentElement.classList.add('browser-chrome')
  }

  // Edge-specific fixes
  if (browser.isEdge) {
    document.documentElement.classList.add('browser-edge')
  }

  // Mobile fixes
  if (browser.isMobile) {
    document.documentElement.classList.add('is-mobile')
    
    // Prevent zoom on input focus (iOS)
    if (browser.isIOS) {
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px'
        }
      })
    }
  }
}

/**
 * Log browser information for debugging
 */
export function logBrowserInfo(): void {
  const browser = detectBrowser()
  console.log('Browser Information:', {
    name: browser.name,
    version: browser.version,
    mobile: browser.isMobile,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    supported: isBrowserSupported(),
  })
}

export default {
  detectBrowser,
  supportsFeature,
  getCSSPrefix,
  isBrowserSupported,
  getBrowserWarning,
  applyBrowserFixes,
  logBrowserInfo,
}
