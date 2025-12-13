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
  })
})
