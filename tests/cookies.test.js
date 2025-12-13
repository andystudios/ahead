/* @vitest-environment jsdom */
import { describe, expect, afterEach, it } from 'vitest'
import {
  getRevealedElementIds,
  hasSeenIntroCookie,
  hasSeenReportIntroCookie,
  markElementRevealed,
  setIntroSeenCookie,
  setReportIntroSeenCookie,
} from '../src/libs/cookies'

const clearIntroCookie = () => {
  document.cookie =
    'intro_seen=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

const clearReportIntroCookie = () => {
  document.cookie =
    'report_intro_seen=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

const clearRevealedElementsCookie = () => {
  document.cookie =
    'revealed_elements=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('cookies helpers', () => {
  afterEach(() => {
    clearIntroCookie()
    clearReportIntroCookie()
    clearRevealedElementsCookie()
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

  it('handles report intro cookie detection and setting', () => {
    expect(hasSeenReportIntroCookie()).toBe(false)
    setReportIntroSeenCookie()
    expect(hasSeenReportIntroCookie()).toBe(true)
    expect(document.cookie).toContain('report_intro_seen=true')
  })

  it('returns empty array when revealed elements cookie is absent', () => {
    expect(getRevealedElementIds()).toEqual([])
  })

  it('parses revealed element ids and deduplicates', () => {
    document.cookie = `revealed_elements=${encodeURIComponent(
      JSON.stringify(['a', 'b', 'a']),
    )}; path=/`

    expect(getRevealedElementIds()).toEqual(['a', 'b'])
  })

  it('ignores invalid revealed elements cookie values', () => {
    document.cookie = 'revealed_elements=not-json; path=/'
    expect(getRevealedElementIds()).toEqual([])

    document.cookie = `revealed_elements=${encodeURIComponent(
      JSON.stringify([null, 42, '', 'valid']),
    )}; path=/`
    expect(getRevealedElementIds()).toEqual(['valid'])
  })

  it('marks elements as revealed while preserving existing ones', () => {
    document.cookie = `revealed_elements=${encodeURIComponent(
      JSON.stringify(['existing']),
    )}; path=/`

    markElementRevealed('new-id')

    const ids = getRevealedElementIds()
    expect(ids).toContain('existing')
    expect(ids).toContain('new-id')
  })

  it('does not write when markElementRevealed is called without id', () => {
    markElementRevealed('')
    expect(document.cookie.includes('revealed_elements=')).toBe(false)
  })
})
