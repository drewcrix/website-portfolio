import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, motion } from 'motion/react'
import { FastForward } from 'lucide-react'
import Robot from '../agents/Robot'
import { useIntro } from './introContext'
import { BUILD_AT, HANDOFF_AT, HANDOFF_MS, REVEAL_MS, TIME_SCALE } from './timeline'
import { LAUNCHER } from '../chat/launcher'

const AGENTS = [
  { key: 'structure', label: 'Agent 1 · Structure' },
  { key: 'content', label: 'Agent 2 · Content' },
  { key: 'polish', label: 'Agent 3 · Polish' },
]

/** Page-coordinate point inside a [data-build] element, or null if it isn't laid out. */
function pointIn(name, ax = 0.5, ay = 0.5, dx = 0, dy = 0) {
  const el = document.querySelector(`[data-build="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return null
  return { x: r.left + window.scrollX + r.width * ax + dx, y: r.top + window.scrollY + r.height * ay + dy }
}

const lift = (p, by) => p && { x: p.x, y: p.y - by }

/** Flight plans: arrays of [time ms, point, opacity]. Missing targets are skipped. */
function planFlights() {
  const vw = document.documentElement.clientWidth
  const viewportBottom = window.scrollY + window.innerHeight
  const navBrand = pointIn('nav-brand')
  const navLinks = pointIn('nav-links', 0.85)
  const navY = navBrand?.y ?? 32
  const photoTop = pointIn('hero-photo', 0.5, 0)
  const featured = pointIn('featured', 0.1, 0)
  const featuredVisible = featured && featured.y < viewportBottom - 80

  const structure = [
    [0, { x: -50, y: navY }, 0],
    [BUILD_AT.navBrand, navBrand, 1],
    [BUILD_AT.navLinks + REVEAL_MS * 0.5, navLinks, 1],
    [BUILD_AT.heroTitle, lift(pointIn('hero-title', 0.04, 0), 24), 1],
    [BUILD_AT.heroTitle + REVEAL_MS, lift(pointIn('hero-title', 0.96, 0), 24), 1],
    [BUILD_AT.heroText + REVEAL_MS * 0.6, lift(pointIn('hero-text', 0.85, 0), 18), 1],
    [BUILD_AT.heroText + REVEAL_MS + 300 * TIME_SCALE, lift(pointIn('hero-text', -0.2, 1), 0), 0],
  ]

  const content = [
    [BUILD_AT.heroPhoto - 420 * TIME_SCALE, photoTop && { x: vw + 60, y: photoTop.y - 30 }, 0],
    [BUILD_AT.heroPhoto, lift(pointIn('hero-photo', 0.12, 0), 30), 1],
    [BUILD_AT.heroPhoto + REVEAL_MS, lift(pointIn('hero-photo', 0.88, 0), 30), 1],
    [BUILD_AT.heroChips + 260 * TIME_SCALE, pointIn('hero-photo', 1, 0.5, 18), 1],
    ...(featuredVisible
      ? [
          [BUILD_AT.featured, lift(featured, 26), 1],
          [BUILD_AT.featured + REVEAL_MS, lift(pointIn('featured', 0.6, 0), 26), 1],
          [BUILD_AT.featured + REVEAL_MS + 300 * TIME_SCALE, { x: vw + 60, y: featured.y - 60 }, 0],
        ]
      : [[BUILD_AT.featured + 200 * TIME_SCALE, photoTop && { x: vw + 60, y: photoTop.y + 120 }, 0]]),
  ]

  const actionsLeft = lift(pointIn('hero-actions', 0.04, 0), 26)
  const polish = [
    [BUILD_AT.heroActions - 380 * TIME_SCALE, actionsLeft && { x: -50, y: actionsLeft.y + 140 }, 0],
    [BUILD_AT.heroActions, actionsLeft, 1],
    [BUILD_AT.heroFocus + 120 * TIME_SCALE, lift(pointIn('hero-focus', 0.75, 0), 22), 1],
    [HANDOFF_AT - 80 * TIME_SCALE, pointIn('hero-photo', 0.98, 0.04, -6, -6), 1],
  ]

  const usable = (plan) => plan.filter(([, p]) => p)
  return { structure: usable(structure), content: usable(content), polish: usable(polish) }
}

/** Beam/carry flags for each agent, as [time ms, agent, props]. */
const FLAG_SCHEDULE = [
  [BUILD_AT.heroTitle, 'structure', { beam: true }],
  [BUILD_AT.heroTitle + REVEAL_MS, 'structure', { beam: false }],
  [BUILD_AT.heroText + REVEAL_MS * 0.6, 'structure', { beam: true }],
  [BUILD_AT.heroText + REVEAL_MS + 100 * TIME_SCALE, 'structure', { beam: false }],
  [BUILD_AT.heroPhoto, 'content', { carrying: false, beam: true }],
  [BUILD_AT.heroPhoto + REVEAL_MS, 'content', { beam: false }],
  [BUILD_AT.featured, 'content', { beam: true }],
  [BUILD_AT.featured + REVEAL_MS, 'content', { beam: false }],
  [BUILD_AT.heroActions, 'polish', { beam: true }],
  [BUILD_AT.heroFocus + 120 * TIME_SCALE, 'polish', { beam: false }],
]

function launcherTarget() {
  const mobile = window.matchMedia('(max-width: 639px)').matches
  const inset = mobile ? LAUNCHER.insetMobile : LAUNCHER.inset
  return {
    x: document.documentElement.clientWidth - inset - LAUNCHER.size / 2,
    y: window.innerHeight - inset - LAUNCHER.size / 2,
  }
}

export default function WorkerAgents() {
  const { phase, startedAt, skipped, skip, finishHandoff } = useIntro()
  const [mounted, setMounted] = useState(true)
  const [layerHeight, setLayerHeight] = useState(0)
  const [flags, setFlags] = useState({ structure: {}, content: { carrying: true }, polish: {} })
  const [flight, setFlight] = useState(null)
  const refs = { structure: useRef(null), content: useRef(null), polish: useRef(null) }
  const flyerRef = useRef(null)
  const size = useRef(48)

  // Schedule every robot's flight once the intro clock starts.
  useLayoutEffect(() => {
    if (phase !== 'running' || startedAt == null) return
    size.current = window.matchMedia('(max-width: 639px)').matches ? 40 : 48
    setLayerHeight(document.documentElement.scrollHeight)
    const half = size.current / 2
    const elapsed = performance.now() - startedAt
    const plans = planFlights()
    const controls = []

    for (const [key, plan] of Object.entries(plans)) {
      const el = refs[key].current
      if (!el || plan.length < 2) continue
      const t0 = plan[0][0]
      const span = plan[plan.length - 1][0] - t0
      const xs = plan.map(([, p]) => p.x - half)
      const ys = plan.map(([, p]) => p.y - half)
      const rotate = plan.map(([, p], i) => {
        const next = plan[i + 1]?.[1]
        return next ? Math.max(-14, Math.min(14, (next.x - p.x) * 0.04)) : 0
      })
      const timing = {
        duration: span / 1000,
        times: plan.map(([t]) => (t - t0) / span),
        delay: Math.max(0, t0 - elapsed) / 1000,
        ease: 'easeInOut',
      }
      controls.push(
        animate(el, { x: xs, y: ys, opacity: plan.map(([, , o]) => o) }, timing),
        animate(el.firstElementChild, { rotate }, timing),
      )
    }

    const timers = FLAG_SCHEDULE.map(([t, key, value]) =>
      setTimeout(() => setFlags((f) => ({ ...f, [key]: { ...f[key], ...value } })), Math.max(0, t - elapsed)),
    )
    return () => {
      controls.forEach((c) => c.stop())
      timers.forEach(clearTimeout)
    }
    // refs are stable; re-plan only when the intro (re)starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startedAt])

  // Handoff: agent 3 leaves the page layer and flies to the chatbot corner.
  useLayoutEffect(() => {
    if (phase !== 'handoff') return
    if (skipped) {
      const t = setTimeout(finishHandoff, 260)
      return () => clearTimeout(t)
    }
    const el = refs.polish.current
    const r = el?.getBoundingClientRect()
    if (!r || !r.width) {
      finishHandoff()
      return
    }
    setFlight({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, skipped])

  useEffect(() => {
    if (!flight || !flyerRef.current) return
    const half = size.current / 2
    const target = launcherTarget()
    const scale = LAUNCHER.robot / size.current
    const midX = (flight.x + target.x) / 2
    const midY = Math.min(flight.y, target.y) - 60
    const controls = animate(
      flyerRef.current,
      {
        x: [flight.x - half, midX - half, target.x - half],
        y: [flight.y - half, midY - half, target.y - half],
        scale: [1, 1.1, scale],
        rotate: [0, 12, 0],
      },
      { duration: HANDOFF_MS / 1000, ease: [0.45, 0, 0.2, 1] },
    )
    controls.then(finishHandoff)
    return () => controls.stop()
  }, [flight, finishHandoff])

  useEffect(() => {
    if (phase === 'done') setMounted(false)
    else setMounted(true)
  }, [phase])

  if (!mounted) return null

  const fadingOut = skipped
  return createPortal(
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-[70] w-full overflow-hidden"
        style={{ height: layerHeight || '100vh' }}
      >
        {AGENTS.map(({ key, label }) => (
          <motion.div
            key={key}
            ref={refs[key]}
            className="absolute top-0 left-0 drop-shadow-[0_10px_14px_rgb(15_34_64/0.25)]"
            style={{ opacity: 0, x: -100, y: -100 }}
            animate={fadingOut || (key === 'polish' && flight) ? { opacity: 0 } : undefined}
            transition={{ duration: flight ? 0 : 0.2 }}
          >
            <div>
              <Robot variant={key} size={size.current} beam={flags[key].beam} carrying={flags[key].carrying} />
            </div>
            <span className="absolute top-full left-1/2 mt-3 hidden -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] whitespace-nowrap text-navy-700 shadow-sm ring-1 ring-navy-100 sm:block">
              {label}
            </span>
          </motion.div>
        ))}
      </div>

      {flight && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[75]">
          <div
            ref={flyerRef}
            className="absolute top-0 left-0 drop-shadow-[0_10px_14px_rgb(15_34_64/0.25)]"
            style={{ transform: `translate(${flight.x - size.current / 2}px, ${flight.y - size.current / 2}px)` }}
          >
            <Robot variant="polish" size={size.current} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {!skipped && phase !== 'handoff' && (
          <motion.div
            className="fixed bottom-4 left-4 z-[80] sm:bottom-5 sm:left-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="flex items-center gap-1 rounded-full bg-navy-950/90 py-1 pr-1 pl-3 text-xs text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
              <span className="flex gap-1" aria-hidden>
                {AGENTS.map(({ key }, i) => (
                  <motion.span
                    key={key}
                    className="h-1.5 w-1.5 rounded-full bg-sky-300"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
              <span className="mr-1 ml-2 hidden text-white/80 sm:inline" role="status">
                Agents are assembling the page…
              </span>
              <button
                type="button"
                onClick={skip}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-sky-300"
              >
                Skip intro <FastForward className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
