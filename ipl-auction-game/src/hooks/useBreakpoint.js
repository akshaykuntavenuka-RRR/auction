import { useState, useEffect } from 'react'

export function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    width,
    isMobile:  width < 576,
    isTablet:  width >= 576 && width < 992,
    isLaptop:  width >= 992 && width < 1200,
    isDesktop: width >= 1200,
    isSmall:   width < 992,   // mobile + tablet combined
  }
}
