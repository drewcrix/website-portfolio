// sessionStorage helpers that never throw (private browsing, blocked storage, SSR).

export function readSession(key, fallback) {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable — state simply won't persist across reloads.
  }
}

export function removeSession(key) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}
