import { beforeEach, describe, expect, it, vi } from 'vitest'
import { attachRevealElementButton } from '../src/libs/revealElementButton'
import { getRevealedElementIds } from '../src/libs/cookies'

let showRevealStatusMessage = true
const trackRevealClickMock = vi.fn()

vi.mock('../src/libs/config', () => ({
  get SHOW_REVEAL_STATUS_MESSAGE() {
    return showRevealStatusMessage
  },
}))

vi.mock('../src/libs/tracking', () => ({
  trackRevealClick: (...args) => trackRevealClickMock(...args),
}))

const clearRevealCookie = () => {
  document.cookie =
    'revealed_elements=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
}

describe('attachRevealElementButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    clearRevealCookie()
    showRevealStatusMessage = true
    trackRevealClickMock.mockReset()
  })

  it('hides the target and renders a button', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({
      targetId: 'secret',
      buttonText: 'Reveal',
    })

    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button?.textContent).toBe('Reveal')
    expect(target.style.display).toBe('none')
  })

  it('reveals the target and stores the id on click', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    vi.runAllTimers()

    expect(target.style.display).toBe('block')
    expect(getRevealedElementIds()).toContain('secret')
    expect(document.querySelector('button')).toBeNull()
  })

  it('reveals targets that start hidden via inline style', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    target.style.display = 'none'
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    vi.runAllTimers()

    expect(target.style.display).toBe('block')
    expect(getRevealedElementIds()).toContain('secret')
  })

  it('tracks reveal clicks with button metadata', () => {
    const now = new Date('2024-05-15T12:30:00Z')
    vi.setSystemTime(now)
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({
      targetId: 'secret',
      buttonText: 'Reveal me',
    })
    button?.click()

    expect(trackRevealClickMock).toHaveBeenCalledWith({
      targetId: 'secret',
      buttonLabel: 'Reveal me',
      clickedAt: now,
    })
  })

  it('shows status message with above-range count before reveal', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    const badge = document.createElement('span')
    badge.textContent = 'Above range'
    target.appendChild(badge)
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    const message = document.querySelector('.reveal-status-message')
    expect(message?.textContent).toContain('1 values out of range')
    // Before timers run, target remains hidden
    expect(target.style.display).toBe('none')

    vi.runAllTimers()
    expect(target.style.display).not.toBe('none')
  })

  it('treats Mild-risk as above range', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    const badge = document.createElement('span')
    badge.textContent = 'Mild-risk'
    target.appendChild(badge)
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    const message = document.querySelector('.reveal-status-message')
    expect(message?.textContent).toContain('1 values out of range')

    vi.runAllTimers()
    expect(target.style.display).not.toBe('none')
  })

  it('reveals immediately when status messages are disabled', () => {
    showRevealStatusMessage = false
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    expect(document.querySelector('.reveal-status-message')).toBeNull()
    expect(target.style.display).toBe('block')
    expect(getRevealedElementIds()).toContain('secret')
    expect(document.querySelector('button')).toBeNull()
  })

  it('keeps the target visible when already revealed', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.cookie = `revealed_elements=${encodeURIComponent(
      JSON.stringify(['secret']),
    )}; path=/;`
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })

    expect(button).toBeNull()
    expect(target.style.display).toBe('block')
  })
})
