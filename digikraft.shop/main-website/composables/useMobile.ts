/**
 * Mobile utilities composable
 * Provides mobile detection, haptic feedback, and other mobile-specific utilities
 */

export const useMobile = () => {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isLandscape = ref(false)
  const screenWidth = ref(0)
  const screenHeight = ref(0)

  const checkDevice = () => {
    if (process.client) {
      screenWidth.value = window.innerWidth
      screenHeight.value = window.innerHeight
      isMobile.value = screenWidth.value < 768
      isTablet.value = screenWidth.value >= 768 && screenWidth.value < 1024
      isLandscape.value = window.innerHeight < window.innerWidth
    }
  }

  /**
   * Trigger haptic feedback (vibration)
   * @param pattern - 'light', 'medium', 'heavy', or array of durations
   */
  const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | number[] = 'light') => {
    if (!process.client || !navigator.vibrate) return

    const patterns: Record<string, number[]> = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 20, 10],
      error: [30, 10, 30],
      warning: [20, 10, 20]
    }

    const vibrationPattern = typeof pattern === 'string' ? patterns[pattern] : pattern
    navigator.vibrate(vibrationPattern)
  }

  /**
   * Share content using native share API
   */
  const share = async (data: ShareData) => {
    if (!process.client || !navigator.share) {
      // Fallback: copy to clipboard
      const text = `${data.title}\n${data.text}\n${data.url}`
      await navigator.clipboard.writeText(text)
      return
    }

    try {
      await navigator.share(data)
    } catch (err) {
      console.log('Share cancelled or failed')
    }
  }

  /**
   * Request full screen
   */
  const requestFullscreen = async (element: HTMLElement) => {
    if (!process.client) return

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err)
    }
  }

  /**
   * Exit full screen
   */
  const exitFullscreen = async () => {
    if (!process.client) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen()
      }
    } catch (err) {
      console.error('Exit fullscreen failed:', err)
    }
  }

  /**
   * Detect if device has notch (safe area)
   */
  const hasNotch = () => {
    if (!process.client) return false
    return CSS.supports('padding-top', 'max(0px, env(safe-area-inset-top))')
  }

  /**
   * Get safe area insets
   */
  const getSafeAreaInsets = () => {
    if (!process.client) return { top: 0, right: 0, bottom: 0, left: 0 }

    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }

  /**
   * Detect if user prefers reduced motion
   */
  const prefersReducedMotion = () => {
    if (!process.client) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Detect if user prefers dark mode
   */
  const prefersDarkMode = () => {
    if (!process.client) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Detect if device is in landscape mode
   */
  const isInLandscapeMode = () => {
    if (!process.client) return false
    return window.matchMedia('(orientation: landscape)').matches
  }

  /**
   * Get device orientation
   */
  const getOrientation = () => {
    if (!process.client) return 'portrait'
    return screen.orientation?.type || (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
  }

  /**
   * Listen for orientation changes
   */
  const onOrientationChange = (callback: (orientation: string) => void) => {
    if (!process.client) return

    const handleChange = () => {
      callback(getOrientation())
    }

    window.addEventListener('orientationchange', handleChange)
    screen.orientation?.addEventListener('change', handleChange)

    return () => {
      window.removeEventListener('orientationchange', handleChange)
      screen.orientation?.removeEventListener('change', handleChange)
    }
  }

  /**
   * Detect swipe gestures
   */
  const useSwipe = (element: Ref<HTMLElement | null>, callbacks: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
  }) => {
    let startX = 0
    let startY = 0
    const threshold = 50

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const diffX = startX - endX
      const diffY = startY - endY

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft()
        } else if (diffX < -threshold && callbacks.onSwipeRight) {
          callbacks.onSwipeRight()
        }
      } else {
        if (diffY > threshold && callbacks.onSwipeUp) {
          callbacks.onSwipeUp()
        } else if (diffY < -threshold && callbacks.onSwipeDown) {
          callbacks.onSwipeDown()
        }
      }
    }

    onMounted(() => {
      if (element.value) {
        element.value.addEventListener('touchstart', handleTouchStart)
        element.value.addEventListener('touchend', handleTouchEnd)
      }
    })

    onUnmounted(() => {
      if (element.value) {
        element.value.removeEventListener('touchstart', handleTouchStart)
        element.value.removeEventListener('touchend', handleTouchEnd)
      }
    })
  }

  /**
   * Detect long press
   */
  const useLongPress = (element: Ref<HTMLElement | null>, callback: () => void, duration = 500) => {
    let timeout: NodeJS.Timeout

    const handleTouchStart = () => {
      timeout = setTimeout(callback, duration)
    }

    const handleTouchEnd = () => {
      clearTimeout(timeout)
    }

    onMounted(() => {
      if (element.value) {
        element.value.addEventListener('touchstart', handleTouchStart)
        element.value.addEventListener('touchend', handleTouchEnd)
        element.value.addEventListener('touchcancel', handleTouchEnd)
      }
    })

    onUnmounted(() => {
      if (element.value) {
        element.value.removeEventListener('touchstart', handleTouchStart)
        element.value.removeEventListener('touchend', handleTouchEnd)
        element.value.removeEventListener('touchcancel', handleTouchEnd)
      }
      clearTimeout(timeout)
    })
  }

  /**
   * Detect double tap
   */
  const useDoubleTap = (element: Ref<HTMLElement | null>, callback: () => void, delay = 300) => {
    let lastTap = 0

    const handleTouchEnd = () => {
      const now = Date.now()
      if (now - lastTap < delay) {
        callback()
      }
      lastTap = now
    }

    onMounted(() => {
      if (element.value) {
        element.value.addEventListener('touchend', handleTouchEnd)
      }
    })

    onUnmounted(() => {
      if (element.value) {
        element.value.removeEventListener('touchend', handleTouchEnd)
      }
    })
  }

  // Initialize on mount
  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice)
    window.removeEventListener('orientationchange', checkDevice)
  })

  return {
    isMobile,
    isTablet,
    isLandscape,
    screenWidth,
    screenHeight,
    checkDevice,
    triggerHaptic,
    share,
    requestFullscreen,
    exitFullscreen,
    hasNotch,
    getSafeAreaInsets,
    prefersReducedMotion,
    prefersDarkMode,
    isInLandscapeMode,
    getOrientation,
    onOrientationChange,
    useSwipe,
    useLongPress,
    useDoubleTap
  }
}
