import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import LoadingReport from '../src/components/LoadingReport'
import * as tracking from '../src/libs/tracking'

describe('LoadingReport tracking', () => {
  let container
  let root

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    window.history.pushState({}, '', '/report.html')
    document.cookie = 'report_intro_seen=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
  })

  afterEach(() => {
    vi.useRealTimers()
    if (root) {
      root.unmount()
    }
    container?.remove()
    vi.restoreAllMocks()
  })

  it('tracks when a target element is missing', () => {
    const trackSpy = vi.spyOn(tracking, 'trackMissingTarget')

    root = createRoot(container)
    act(() => {
      root.render(
        <LoadingReport
          messages={[{ text: 'Look here', targetHtmlId: 'missing-target' }]}
        />,
      )
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(trackSpy).toHaveBeenCalledWith({
      source: 'LoadingReport',
      targetId: 'missing-target',
      message: 'Look here',
      messageIndex: 0,
    })
  })

  it('tracks when skip is clicked', () => {
    const trackSpy = vi.spyOn(tracking, 'trackSkipEvent')

    root = createRoot(container)
    act(() => {
      root.render(
        <LoadingReport
          messages={[{ text: 'Look here', targetHtmlId: 'missing-target' }]}
        />,
      )
    })

    const skipButton = container.querySelector('.loading-report-skip')
    expect(skipButton).toBeInstanceOf(HTMLButtonElement)

    act(() => {
      skipButton?.click()
      vi.runAllTimers()
    })

    expect(trackSpy).toHaveBeenCalledWith({ source: 'LoadingReport' })
    expect(document.cookie.includes('report_intro_seen=')).toBe(true)
  })

  it('sets report intro cookie after finishing messages', () => {
    const target = document.createElement('div')
    target.id = 'report-selector'
    document.body.appendChild(target)
    root = createRoot(container)
    act(() => {
      root.render(
        <LoadingReport
          messages={[
            { text: 'Done', targetHtmlId: 'report-selector' },
          ]}
        />,
      )
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(document.cookie.includes('report_intro_seen=')).toBe(true)
  })

  it('skips overlay when report intro cookie already exists', () => {
    document.cookie = 'report_intro_seen=true; path=/;'
    root = createRoot(container)
    act(() => {
      root.render(<LoadingReport />)
    })

    expect(container.querySelector('.loading-report-overlay')).toBeNull()
  })
})
