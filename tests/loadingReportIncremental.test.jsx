import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'

vi.mock('../src/libs/config', () => ({
  LOADING_REPORT_FADE_IN_DURATION_MS: 10,
  LOADING_REPORT_FADE_OUT_DURATION_MS: 10,
  LOADING_REPORT_VISIBLE_DURATION_MS: 10,
  SHOW_LOADING_REPORT_INCREMENTAL: true,
  DISABLE_COOKIES: false,
}))

import LoadingReport from '../src/components/LoadingReport'

describe('LoadingReport incremental reveal', () => {
  let container
  let root

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    window.history.pushState({}, '', '/report.html')
  })

  afterEach(() => {
    vi.useRealTimers()
    root?.unmount()
    container?.remove()
    vi.resetModules()
  })

  it('keeps peek/highlight styles when incremental mode is enabled', async () => {
    const config = await import('../src/libs/config')
    expect(config.SHOW_LOADING_REPORT_INCREMENTAL).toBe(true)
    const first = document.createElement('div')
    first.id = 'first-target'
    first.className = 'bg-aubergine-500'
    document.body.appendChild(first)

    const second = document.createElement('div')
    second.id = 'second-target'
    second.className = 'bg-aubergine-500'
    document.body.appendChild(second)

    root = createRoot(container)
    act(() => {
      root.render(
        <LoadingReport
          messages={[
            { text: 'First', targetHtmlId: 'first-target', highlightClass: 'bg-aubergine-500' },
            { text: 'Second', targetHtmlId: 'second-target', highlightClass: 'bg-aubergine-500' },
          ]}
        />,
      )
    })

    act(() => {
      vi.advanceTimersByTime(25) // first message through fade-out
    })
    await Promise.resolve()

    expect(first.classList.contains('loading-report-peek')).toBe(true)

    act(() => {
      vi.advanceTimersByTime(50) // run second message and finish
    })
    await Promise.resolve()

    expect(second.classList.contains('loading-report-peek')).toBe(true)
    expect(first.classList.contains('loading-report-peek')).toBe(true)
  })
})
