import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, ExternalLink, RotateCcw, X } from 'lucide-react'
import Robot from '../agents/Robot'
import RichText from '../RichText'
import { useChat } from './chatContext'
import { LAUNCHER } from './launcher'
import { guide } from '../../data/chatbot'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { toHref } from '../../lib/projects'

export default function Chatbot() {
  const chat = useChat()
  const launcherRef = useRef(null)
  const wasOpen = useRef(false)

  // Escape closes the panel wherever focus is.
  const { open, setOpen } = chat
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  // Return focus to the launcher when the panel closes.
  useEffect(() => {
    if (wasOpen.current && !chat.open) launcherRef.current?.focus({ preventScroll: true })
    wasOpen.current = chat.open
  }, [chat.open])

  if (!chat.guideReady) return null

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end sm:right-5 sm:bottom-5">
      <AnimatePresence>{chat.open && <ChatPanel key="panel" />}</AnimatePresence>
      <AnimatePresence>{chat.teaser && !chat.open && <Teaser key="teaser" />}</AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => (chat.open ? chat.setOpen(false) : chat.openChat())}
        aria-label={chat.open ? 'Close portfolio guide' : 'Open portfolio guide chat'}
        aria-expanded={chat.open}
        aria-controls="portfolio-guide-panel"
        className={`group relative grid place-items-center rounded-full bg-white shadow-[0_12px_30px_-8px_rgb(15_34_64/0.45)] ring-1 ring-navy-100 transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgb(15_34_64/0.5)] ${chat.open ? 'max-sm:hidden' : ''}`}
        style={{ width: LAUNCHER.size, height: LAUNCHER.size }}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      >
        {chat.teaser && !chat.open && (
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-sky-400/50" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {chat.open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-navy-900" aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              <Robot variant="polish" size={LAUNCHER.robot} />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="pointer-events-none absolute right-full mr-3 hidden rounded-lg bg-navy-950 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow transition group-hover:opacity-100 sm:block">
          {chat.open ? 'Close guide' : 'Portfolio guide'}
        </span>
      </motion.button>
    </div>
  )
}

function Teaser() {
  const chat = useChat()
  const compact = useMediaQuery('(max-width: 639px)')
  const greeting = chat.messages.find((m) => m.from === 'bot')

  // On phones the teaser sits over the page, so keep it short and let it go away.
  const { dismissTeaser } = chat
  useEffect(() => {
    if (!compact) return
    const t = setTimeout(dismissTeaser, 8000)
    return () => clearTimeout(t)
  }, [compact, dismissTeaser])

  if (!greeting) return null
  return (
    <motion.div
      role="status"
      className="relative mb-3 w-[min(20rem,calc(100vw-2rem))] origin-bottom-right rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_20px_50px_-15px_rgb(15_34_64/0.35)] ring-1 ring-navy-100"
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <button
        type="button"
        onClick={chat.dismissTeaser}
        className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss greeting"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <button type="button" onClick={chat.openChat} className="block pr-6 text-left text-sm leading-relaxed text-slate-700">
        {compact ? (
          <>
            {greeting.text.split('👋')[0]}👋{' '}
            <span className="font-semibold text-accent">Tap to chat</span>
          </>
        ) : (
          greeting.text
        )}
      </button>
      <div className={`mt-3 flex-wrap gap-1.5 ${compact ? 'hidden' : 'flex'}`}>
        {greeting.actions?.slice(0, 5).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              chat.openChat()
              chat.choose(action)
            }}
            className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800 ring-1 ring-navy-100 transition hover:bg-navy-100"
          >
            {action.label}
          </button>
        ))}
      </div>
      <span aria-hidden className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-white ring-1 ring-navy-100 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
    </motion.div>
  )
}

function ChatPanel() {
  const chat = useChat()
  const titleId = useId()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [chat.messages.length, chat.typing])

  const lastBotIndex = chat.messages.findLastIndex((m) => m.from === 'bot')

  return (
    <motion.section
      id="portfolio-guide-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed inset-x-2 bottom-2 flex h-[min(78dvh,640px)] origin-bottom-right flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgb(15_34_64/0.45)] ring-1 ring-navy-100 sm:static sm:mb-4 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px]"
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <header className="relative flex items-center gap-3 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 px-4 py-3.5 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 shadow-inner">
          <Robot variant="polish" size={34} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-base font-semibold text-white">
            {guide.name}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-navy-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            {guide.tagline}
          </p>
        </div>
        <button
          type="button"
          onClick={chat.restart}
          className="grid h-9 w-9 place-items-center rounded-full text-navy-100 transition hover:bg-white/10 hover:text-white"
          aria-label="Restart conversation"
          title="Restart conversation"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => chat.setOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-full text-navy-100 transition hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 py-4">
        {chat.messages.map((message, i) => (
          <Message key={message.id} message={message} showActions={i === lastBotIndex && !chat.typing} />
        ))}
        {chat.typing && <TypingIndicator />}
      </div>

      <form
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          chat.send(draft)
          setDraft('')
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message the portfolio guide
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about projects, research, resume…"
          autoComplete="off"
          maxLength={300}
          className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-accent/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-white transition hover:bg-navy-800 disabled:bg-slate-300"
          aria-label="Send message"
        >
          <ArrowUp className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </motion.section>
  )
}

function Message({ message, showActions }) {
  const chat = useChat()
  const fromBot = message.from === 'bot'
  return (
    <motion.div
      className={`flex gap-2 ${fromBot ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {fromBot && (
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-navy-100">
          <Robot variant="polish" size={22} hovering={false} />
        </span>
      )}
      <div className={`max-w-[85%] ${fromBot ? '' : 'text-right'}`}>
        <div
          className={`inline-block rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed whitespace-pre-line ${
            fromBot
              ? 'rounded-tl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80'
              : 'rounded-tr-md bg-navy-900 text-white'
          }`}
        >
          {fromBot ? <RichText text={message.text} /> : message.text}
        </div>
        {fromBot && showActions && message.actions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.actions.map((action) =>
              action.href ? (
                <a
                  key={action.label + action.href}
                  href={toHref(action.href)}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-800 ring-1 ring-navy-200 transition hover:bg-navy-50"
                >
                  {action.label}
                  {action.external && <ExternalLink className="h-3 w-3" aria-hidden />}
                </a>
              ) : (
                <button
                  key={action.label + action.intent}
                  type="button"
                  onClick={() => chat.choose(action)}
                  className="rounded-full bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-800 ring-1 ring-navy-100 transition hover:bg-navy-100"
                >
                  {action.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2" aria-label="Guide is typing" role="status">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-navy-100">
        <Robot variant="polish" size={22} hovering={false} />
      </span>
      <span className="flex gap-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-200/80">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  )
}
