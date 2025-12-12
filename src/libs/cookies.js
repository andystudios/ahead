const INTRO_COOKIE_KEY = 'intro_seen'

export const hasSeenIntroCookie = () =>
  document.cookie
    .split(';')
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${INTRO_COOKIE_KEY}=`))

export const setIntroSeenCookie = () => {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${INTRO_COOKIE_KEY}=true; path=/; expires=${expires}`
}
