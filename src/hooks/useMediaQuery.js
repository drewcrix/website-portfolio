import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query, e.g. useMediaQuery('(min-width: 768px)'). */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const isMobileViewport = () => window.matchMedia('(max-width: 639px)').matches
