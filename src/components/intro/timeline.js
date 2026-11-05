// Shared timeline (milliseconds from the start of the intro) for the worker-agent
// build animation. BuildSlots reveal themselves at these times and the robots'
// flight paths are scheduled against the same numbers so they stay in sync.

// added constant time scale to adjust speed of intro bots
export const TIME_SCALE = 2

export const REVEAL_MS = 520 * TIME_SCALE

const BASE_BUILD_AT = {
  navBrand: 140,
  navLinks: 360,
  heroEyebrow: 520,
  heroTitle: 700,
  heroPhoto: 960,
  heroText: 1120,
  heroChips: 1330,
  heroActions: 1600,
  heroFocus: 1780,
  heroDecor: 1900,
  featured: 1850,
}

export const BUILD_AT = Object.fromEntries(
  Object.entries(BASE_BUILD_AT).map(([key, ms]) => [key, ms * TIME_SCALE]),
)

// One agent starts flying to the bottom-right corner (where it becomes the chatbot).
export const HANDOFF_AT = 2150 * TIME_SCALE
export const HANDOFF_MS = 600 * TIME_SCALE

// If anything goes wrong the intro is force-finished after this long.
export const INTRO_TIMEOUT_MS = 6000 * TIME_SCALE

export const INTRO_SESSION_KEY = 'dc:intro-played'
