import { describe, expect, it } from 'vitest'
import {
  clearSkipEvents,
  clearMissingTargetEvents,
  clearRevealClickEvents,
  getSkipEvents,
  getMissingTargetEvents,
  getRevealClickEvents,
  trackMissingTarget,
  trackSkipEvent,
  trackRevealClick,
} from '../src/libs/tracking'

describe('tracking', () => {
  it('stores reveal click events with label and timestamp', () => {
    clearRevealClickEvents()
    const now = new Date('2024-06-01T00:00:00Z')
    trackRevealClick({ targetId: 'secret', buttonLabel: 'Reveal', clickedAt: now })

    const events = getRevealClickEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      targetId: 'secret',
      buttonLabel: 'Reveal',
      clickedAt: now,
    })
  })

  it('tracks missing targets with source and message details', () => {
    clearMissingTargetEvents()
    const now = new Date('2024-06-02T12:00:00Z')
    trackMissingTarget({
      source: 'LoadingReport',
      targetId: 'missing-el',
      message: 'Test message',
      messageIndex: 2,
      occurredAt: now,
    })

    const events = getMissingTargetEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      source: 'LoadingReport',
      targetId: 'missing-el',
      message: 'Test message',
      messageIndex: 2,
      occurredAt: now,
    })
  })

  it('tracks skip events with source and timestamp', () => {
    clearSkipEvents()
    const now = new Date('2024-06-03T08:00:00Z')
    trackSkipEvent({ source: 'Loading', occurredAt: now })

    const events = getSkipEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      source: 'Loading',
      occurredAt: now,
    })
  })
})
