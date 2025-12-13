import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import Loading from '../src/components/Loading'
import * as tracking from '../src/libs/tracking'

describe('Loading skip tracking', () => {
  let container
  let root

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    root?.unmount()
    container?.remove()
    vi.restoreAllMocks()
  })

  it('tracks when skip is clicked', () => {
    const trackSpy = vi.spyOn(tracking, 'trackSkipEvent')
    root = createRoot(container)

    act(() => {
      root.render(<Loading />)
    })

    const skipButton = container.querySelector('.loading-skip')
    expect(skipButton).toBeInstanceOf(HTMLButtonElement)

    act(() => {
      skipButton?.click()
      vi.runAllTimers()
    })

    expect(trackSpy).toHaveBeenCalledWith({ source: 'Loading' })
  })
})
