import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { IntroContext } from './introContext'
import { HANDOFF_AT, HANDOFF_MS, INTRO_SESSION_KEY, INTRO_TIMEOUT_MS } from './timeline'
import { readSession, writeSession } from '../../lib/storage'

function shouldPlayIntro(pathname, search) {
  if (pathname !== '/') return false
  const params = new URLSearchParams(search)
  if (params.has('nointro')) return false
  if (params.has('intro')) return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return !readSession(INTRO_SESSION_KEY, false)
}

export default function IntroProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState(() =>
    shouldPlayIntro(location.pathname, location.search)
      ? { phase: 'pending', startedAt: null, skipped: false }
      : { phase: 'done', startedAt: null, skipped: false },
  )
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const finish = useCallback(() => {
    clearTimers()
    setState((s) => (s.phase === 'done' ? s : { ...s, phase: 'done' }))
  }, [])

  const skip = useCallback(() => {
    setState((s) => (s.phase === 'done' || s.skipped ? s : { ...s, skipped: true, phase: 'handoff' }))
  }, [])

  const replay = useCallback(() => {
    clearTimers()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate('/')
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    navigate('/')
    setState({ phase: 'pending', startedAt: null, skipped: false })
  }, [navigate])

  // pending → running on the next frame, once the blueprint layout has painted.
  useEffect(() => {
    if (state.phase !== 'pending') return
    writeSession(INTRO_SESSION_KEY, true)
    let raf2
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() =>
        setState((s) => (s.phase === 'pending' ? { ...s, phase: 'running', startedAt: performance.now() } : s)),
      )
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [state.phase])

  // running → handoff → done, with a hard timeout as a safety net.
  useEffect(() => {
    if (state.phase !== 'running') return
    clearTimers()
    timers.current.push(
      setTimeout(() => setState((s) => (s.phase === 'running' ? { ...s, phase: 'handoff' } : s)), HANDOFF_AT),
      setTimeout(finish, INTRO_TIMEOUT_MS),
    )
    return clearTimers
  }, [state.phase, finish])

  // If WorkerAgents never reports the handoff finished, finish anyway.
  useEffect(() => {
    if (state.phase !== 'handoff') return
    const t = setTimeout(finish, state.skipped ? 400 : HANDOFF_MS + 700)
    return () => clearTimeout(t)
  }, [state.phase, state.skipped, finish])

  // Leaving the homepage or pressing Escape skips the intro.
  useEffect(() => {
    if (location.pathname !== '/') skip()
  }, [location.pathname, skip])

  useEffect(() => {
    if (state.phase === 'done') return
    const onKey = (e) => e.key === 'Escape' && skip()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.phase, skip])

  // Exposed for styling hooks and automated tests.
  useEffect(() => {
    document.documentElement.dataset.intro = state.phase
  }, [state.phase])

  const value = useMemo(() => ({ ...state, skip, finishHandoff: finish, replay }), [state, skip, finish, replay])

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}
