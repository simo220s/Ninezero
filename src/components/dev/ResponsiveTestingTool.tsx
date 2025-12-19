import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

/**
 * ResponsiveTestingTool - Development tool for testing responsive breakpoints
 * 
 * This component displays current viewport information and provides quick
 * breakpoint testing buttons. Only visible in development mode.
 * 
 * Usage: Add <ResponsiveTestingTool /> to your app during development
 */
export default function ResponsiveTestingTool() {
  const {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isLandscape
  } = useResponsive()

  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  // Only show in development
  useEffect(() => {
    setIsVisible(import.meta.env.DEV)
  }, [])

  if (!isVisible) return null

  const testBreakpoints = [
    { name: 'iPhone SE', width: 320, height: 568 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Laptop', width: 1280, height: 720 },
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: '2K Display', width: 2560, height: 1440 }
  ]

  const setViewport = (width: number, height: number) => {
    // Note: This only works in browser DevTools responsive mode
    // It provides the dimensions for manual testing
    alert(`Set viewport to: ${width}x${height}\n\nUse browser DevTools (F12) > Toggle device toolbar (Ctrl+Shift+M) to test this size.`)
  }

  const getDeviceCategory = () => {
    if (isMobile) return 'Mobile'
    if (isTablet) return 'Tablet'
    if (isDesktop) return 'Desktop'
    return 'Unknown'
  }

  const getBreakpointColor = () => {
    if (isMobile) return 'bg-blue-500'
    if (isTablet) return 'bg-green-500'
    if (isDesktop) return 'bg-purple-500'
    return 'bg-gray-500'
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
      {isMinimized ? (
        // Minimized view - just a badge
        <button
          onClick={() => setIsMinimized(false)}
          className={`${getBreakpointColor()} text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all`}
          title="Click to expand responsive testing tool"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">{windowSize.width}x{windowSize.height}</span>
            <span className="text-xs opacity-75">{currentBreakpoint}</span>
          </div>
        </button>
      ) : (
        // Expanded view - full panel
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <h3 className="font-bold text-sm">Responsive Testing Tool</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-500 hover:text-gray-700 px-2 py-1"
              title="Minimize"
            >
              ✕
            </button>
          </div>

          {/* Current Viewport Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-2 font-bold">{windowSize.width}x{windowSize.height}</span>
              </div>
              <div>
                <span className="text-gray-600">Breakpoint:</span>
                <span className={`ml-2 font-bold ${getBreakpointColor()} text-white px-2 py-0.5 rounded`}>
                  {currentBreakpoint}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-bold">{getDeviceCategory()}</span>
              </div>
              <div>
                <span className="text-gray-600">Orientation:</span>
                <span className="ml-2 font-bold">{isLandscape ? 'Landscape' : 'Portrait'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Touch:</span>
                <span className="ml-2 font-bold">{isTouchDevice ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Device Flags */}
          <div className="mb-4 flex gap-2">
            <span className={`px-2 py-1 rounded text-xs ${isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}`}>
              Mobile
            </span>
            <span className={`px-2 py-1 rounded text-xs ${isTablet ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
              Tablet
            </span>
            <span className={`px-2 py-1 rounded text-xs ${isDesktop ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-400'}`}>
              Desktop
            </span>
          </div>

          {/* Quick Test Buttons */}
          <div className="mb-2">
            <h4 className="font-semibold mb-2 text-xs text-gray-700">Quick Test Sizes:</h4>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {testBreakpoints.map((device) => (
                <button
                  key={device.name}
                  onClick={() => setViewport(device.width, device.height)}
                  className="text-left px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                >
                  <div className="font-semibold">{device.name}</div>
                  <div className="text-gray-600">{device.width}x{device.height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
            <p>Use browser DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M) to test different sizes.</p>
          </div>
        </div>
      )}
    </div>
  )
}
