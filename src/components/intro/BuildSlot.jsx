import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { useIntro } from './introContext'
import { REVEAL_MS } from './timeline'

const HIDDEN = {
  wipe: { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
  fade: { opacity: 0, transform: 'scale(0.92)' },
}

/**
 * Wraps a real page element so the intro's worker agents can "build" it.
 * While the intro runs, the element is shown as a dashed blueprint outline and
 * then revealed left-to-right behind a scanning beam at `at` ms. Outside the
 * intro it renders its children untouched, so the page never depends on it.
 *
 * variant="fade" pops the content in without the wipe or outline — for content
 * that overflows its box (e.g. the floating chips around the headshot).
 */
export default function BuildSlot({
  at = 0,
  label,
  target,
  variant = 'wipe',
  as: Tag = 'div',
  className = '',
  contentClassName,
  children,
}) {
  const { phase, startedAt, skipped } = useIntro()
  const inIntro = phase !== 'done'
  const contentRef = useRef(null)
  // 'blueprint' → 'revealing' → 'settled'
  const [status, setStatus] = useState(inIntro ? 'blueprint' : 'settled')

  // Replaying the intro puts every slot back into blueprint mode.
  useLayoutEffect(() => {
    if (phase === 'pending') setStatus('blueprint')
  }, [phase])

  useEffect(() => {
    if (status !== 'blueprint') return
    if (!inIntro || skipped) {
      setStatus('fast')
      return
    }
    if (startedAt == null) return
    const delay = Math.max(0, at - (performance.now() - startedAt))
    const t = setTimeout(() => setStatus('revealing'), delay)
    return () => clearTimeout(t)
  }, [status, inIntro, skipped, startedAt, at])

  useEffect(() => {
    if (status !== 'revealing' && status !== 'fast') return
    const el = contentRef.current
    if (!el) return setStatus('settled')
    if (status === 'fast') el.style.removeProperty('clip-path')
    const controls =
      status === 'fast'
        ? animate(el, { opacity: [0, 1] }, { duration: 0.25 })
        : variant === 'fade'
          ? animate(el, { opacity: [0, 1], transform: ['scale(0.92)', 'scale(1)'] }, { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] })
          : animate(
            el,
            { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'], opacity: [0.35, 1] },
            { duration: REVEAL_MS / 1000, ease: [0.65, 0, 0.35, 1] },
          )
    controls.then(() => setStatus('settled'))
    return () => controls.stop()
  }, [status, variant])

  // Drop every inline style the reveal left behind (a leftover clip-path would
  // clip shadows, focus rings and anything positioned outside the box).
  useLayoutEffect(() => {
    if (status !== 'settled' || !contentRef.current) return
    for (const prop of ['clip-path', 'opacity', 'transform']) contentRef.current.style.removeProperty(prop)
  }, [status])

  // Sparks outlive the reveal itself, so they get their own short-lived flag.
  const [sparks, setSparks] = useState(false)
  const sparkTimer = useRef()
  useEffect(() => {
    if (status !== 'revealing' || variant !== 'wipe') return
    setSparks(true)
    clearTimeout(sparkTimer.current)
    sparkTimer.current = setTimeout(() => setSparks(false), REVEAL_MS + 600)
  }, [status, variant])
  useEffect(() => () => clearTimeout(sparkTimer.current), [])

  const settled = status === 'settled'

  return (
    <Tag className={`relative ${className}`} data-build={target}>
      <div ref={contentRef} className={contentClassName} style={settled ? undefined : HIDDEN[variant]}>
        {children}
      </div>
      {!settled && variant === 'wipe' && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-1.5 rounded-xl border border-dashed border-sky-400/80 bg-sky-50/40"
          initial={false}
          animate={{ opacity: status === 'blueprint' ? 1 : 0 }}
          transition={{ duration: status === 'blueprint' ? 0 : REVEAL_MS / 1000, ease: 'easeIn' }}
        >
          <span className="absolute -top-px -left-px h-2.5 w-2.5 border-t-2 border-l-2 border-sky-500" />
          <span className="absolute -top-px -right-px h-2.5 w-2.5 border-t-2 border-r-2 border-sky-500" />
          <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-sky-500" />
          <span className="absolute -right-px -bottom-px h-2.5 w-2.5 border-r-2 border-b-2 border-sky-500" />
          {label && (
            <span className="absolute -top-2.5 left-3 rounded bg-white px-1.5 font-mono text-[10px] leading-4 whitespace-nowrap text-sky-700 shadow-sm ring-1 ring-sky-200">
              {label}
            </span>
          )}
        </motion.div>
      )}
      {status === 'revealing' && variant === 'wipe' && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -top-2 -bottom-2 w-[3px] rounded-full bg-sky-400 shadow-[0_0_12px_3px_rgb(56_189_248/0.65)]"
          initial={{ left: '0%', opacity: 1 }}
          animate={{ left: '100%', opacity: [1, 1, 0] }}
          transition={{ duration: REVEAL_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
      {sparks && <SparkBurst delay={REVEAL_MS * 0.85} />}
    </Tag>
  )
}

const SPARKS = Array.from({ length: 7 }, (_, i) => {
  const angle = (i / 7) * Math.PI * 2
  return { x: Math.cos(angle) * 22, y: Math.sin(angle) * 22 }
})

function SparkBurst({ delay }) {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 right-0">
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-sky-400"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.6, 1, 0.4] }}
          transition={{ delay: delay / 1000, duration: 0.45, ease: 'easeOut' }}
        />
      ))}
    </span>
  )
}
