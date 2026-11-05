import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Scrolls to the top on page changes, or to the #hash target when there is one. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }
    // The target may not exist until the new page has rendered.
    let tries = 0
    let raf
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (tries++ < 30) raf = requestAnimationFrame(seek)
    }
    seek()
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])

  return null
}
