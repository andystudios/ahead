/* @vitest-environment jsdom */
import { describe, expect, afterEach, it } from 'vitest'
import { hasSeenIntroCookie, setIntroSeenCookie } from '../src/libs/cookies'

const clearIntroCookie = () => {
  document.cookie =
    'intro_seen=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('cookies helpers', () => {
  afterEach(() => {
    clearIntroCookie()
  })

  it('returns false when intro cookie is absent', () => {
    clearIntroCookie()
    expect(hasSeenIntroCookie()).toBe(false)
  })

  it('detects intro cookie when present', () => {
    document.cookie = 'intro_seen=true; path=/'
    expect(hasSeenIntroCookie()).toBe(true)
  })

  it('sets intro cookie with setIntroSeenCookie', () => {
    setIntroSeenCookie()
    expect(hasSeenIntroCookie()).toBe(true)
    expect(document.cookie).toContain('intro_seen=true')
  })
})
