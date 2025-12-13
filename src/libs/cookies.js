const INTRO_COOKIE_KEY = 'intro_seen'
const REPORT_INTRO_COOKIE_KEY = 'report_intro_seen'
const REVEALED_ELEMENTS_COOKIE_KEY = 'revealed_elements'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

const readCookieValue = (key) =>
  document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`))
    ?.split('=')[1]

const writeCookieValue = (key, value) => {
  const expires = new Date(Date.now() + ONE_YEAR_MS).toUTCString()
  document.cookie = `${key}=${value}; path=/; expires=${expires}`
}

export const hasSeenIntroCookie = () =>
  document.cookie
    .split(';')
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${INTRO_COOKIE_KEY}=`))

export const setIntroSeenCookie = () => {
  writeCookieValue(INTRO_COOKIE_KEY, 'true')
}

export const hasSeenReportIntroCookie = () =>
  document.cookie
    .split(';')
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${REPORT_INTRO_COOKIE_KEY}=`))

export const setReportIntroSeenCookie = () => {
  writeCookieValue(REPORT_INTRO_COOKIE_KEY, 'true')
}

export const getRevealedElementIds = () => {
  const raw = readCookieValue(REVEALED_ELEMENTS_COOKIE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(parsed)) return []
    const filtered = parsed
      .filter((id) => typeof id === 'string' && id.trim().length > 0)
      .map((id) => id.trim())
    return Array.from(new Set(filtered))
  } catch {
    return []
  }
}

export const markElementRevealed = (id) => {
  if (!id) return
  const existing = new Set(getRevealedElementIds())
  existing.add(id)
  const serialized = encodeURIComponent(JSON.stringify(Array.from(existing)))
  writeCookieValue(REVEALED_ELEMENTS_COOKIE_KEY, serialized)
}
