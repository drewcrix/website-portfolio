import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ChatContext } from './chatContext'
import { useIntro } from '../intro/introContext'
import { createChatEngine } from '../../lib/chatEngine'
import { projects } from '../../lib/projects'
import { readSession, removeSession, writeSession } from '../../lib/storage'
import { isMobileViewport } from '../../hooks/useMediaQuery'
import { intents, fallback, greeting } from '../../data/chatbot'
import { site } from '../../data/site'
import { about } from '../../data/profile'

const HISTORY_KEY = 'dc:chat-history'
const TEASER_KEY = 'dc:chat-teaser-dismissed'
const MAX_HISTORY = 60

let nextId = Date.now()
const makeMessage = (from, reply) => ({ id: nextId++, from, text: reply.text, actions: reply.actions })

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Simulated "typing" time: long enough to feel conversational, never slow. */
function typingDelay(text) {
  if (prefersReducedMotion()) return 120
  return Math.min(1100, 420 + text.length * 6)
}

export default function ChatProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { phase } = useIntro()
  const engine = useMemo(
    () => createChatEngine({ projects, intents, fallback, site, profile: about }),
    [],
  )

  const [messages, setMessages] = useState(() => readSession(HISTORY_KEY, []))
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const timers = useRef([])
  // Replies are queued so nothing a visitor sends is ever dropped while the
  // guide is still "typing"; this is when the current queue finishes.
  const busyUntil = useRef(0)
  const locationRef = useRef(location)
  locationRef.current = location

  useEffect(() => writeSession(HISTORY_KEY, messages.slice(-MAX_HISTORY)), [messages])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const go = useCallback(
    (target) => {
      const [pathname, hash = ''] = target.split('#')
      const here = locationRef.current
      if (here.pathname === pathname && !hash) return
      navigate({ pathname, hash: hash ? `#${hash}` : '' })
      // On phones the chat covers the page, so step aside once we've navigated.
      if (isMobileViewport()) later(() => setOpen(false), 900)
    },
    [navigate],
  )

  /** Shows the typing indicator, then the reply (after any replies already queued). */
  const reply = useCallback(
    (response, { pause = 0, greet = false } = {}) => {
      const now = performance.now()
      const start = Math.max(now + pause, busyUntil.current)
      const end = start + typingDelay(response.text)
      busyUntil.current = end
      later(() => setTyping(true), start - now)
      later(() => {
        if (busyUntil.current === end) setTyping(false)
        if (greet) {
          // Skip the greeting if the visitor already started the conversation.
          setMessages((m) => (m.length ? m : [makeMessage('bot', response)]))
          if (!readSession(TEASER_KEY, false)) setTeaser(true)
          return
        }
        setMessages((m) => [...m, makeMessage('bot', response)])
        if (response.navigate) later(() => go(response.navigate), 550)
      }, end - now)
    },
    [go],
  )

  const send = useCallback(
    (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setMessages((m) => [...m, makeMessage('user', { text: trimmed })])
      reply(engine.respond(trimmed))
    },
    [engine, reply],
  )

  const choose = useCallback(
    (action) => {
      if (!action.intent) return
      setMessages((m) => [...m, makeMessage('user', { text: action.label })])
      reply(engine.run(action.intent))
    },
    [engine, reply],
  )

  const dismissTeaser = useCallback(() => {
    setTeaser(false)
    writeSession(TEASER_KEY, true)
  }, [])

  const openChat = useCallback(() => {
    setOpen(true)
    dismissTeaser()
  }, [dismissTeaser])

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    busyUntil.current = 0
    setTyping(false)
    removeSession(HISTORY_KEY)
    setMessages([makeMessage('bot', greeting)])
  }, [])

  // Greet first-time visitors once the launcher is on screen (i.e. after the intro).
  const guideReady = phase === 'done'
  const greeted = useRef(false)
  useEffect(() => {
    if (!guideReady || messages.length || greeted.current) return
    greeted.current = true
    reply(greeting, { pause: prefersReducedMotion() ? 300 : 650, greet: true })
    // Only runs when the guide first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideReady])

  const value = useMemo(
    () => ({
      messages,
      open,
      typing,
      teaser,
      guideReady,
      setOpen,
      openChat,
      send,
      choose,
      restart,
      dismissTeaser,
    }),
    [messages, open, typing, teaser, guideReady, openChat, send, choose, restart, dismissTeaser],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
