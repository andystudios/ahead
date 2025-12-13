import { SHOW_REVEAL_STATUS_MESSAGE } from './config'
import { getRevealedElementIds, markElementRevealed } from './cookies'
import { trackRevealClick } from './tracking'

const DEFAULT_BUTTON_TEXT = 'Show content'
const DEFAULT_BUTTON_CLASS = 'loading-skip reveal-toggle-button'
const MESSAGE_VISIBLE_DURATION_MS = 1200
const MESSAGE_FADE_DURATION_MS = 600
const ABOVE_RANGE_TERMS = ['Below range', 'above range', 'mild-risk']
const DUPLICATED_ELEMENT_CORRECTION = 2

const getDefaultDisplay = (tagName = '') => {
  const normalized = tagName.toUpperCase()
  if (normalized === 'SPAN') return 'inline'
  if (['BUTTON', 'INPUT', 'SELECT'].includes(normalized)) return 'inline-block'
  return 'block'
}

const isAboveRangeText = (text = '') => {
  const normalized = text.trim().toLowerCase()
  return ABOVE_RANGE_TERMS.includes(normalized)
}

const getAboveRangeCount = (target) =>
  Math.round(
    Array.from(target.querySelectorAll('*')).filter((el) =>
      isAboveRangeText(el.textContent ?? ''),
    ).length / DUPLICATED_ELEMENT_CORRECTION,
  )

const hasMildRiskBadge = (target) =>
  Array.from(target.querySelectorAll('*')).some(
    (el) => (el.textContent ?? '').trim().toLowerCase() === 'mild-risk',
  )

// Hide a target element by id and inject a button to reveal it.
// Persists revealed targets via cookies so the button does not reappear.
export const attachRevealElementButton = ({
  targetId,
  buttonText = DEFAULT_BUTTON_TEXT,
  buttonClassName = DEFAULT_BUTTON_CLASS,
} = {}) => {
  if (typeof document === 'undefined') return null
  if (!targetId) {
    console.error('[attachRevealElementButton] targetId is required')
    return null
  }

  const target = document.getElementById(targetId)
  if (!target) {
    console.error(
      `[attachRevealElementButton] Element with id "${targetId}" not found`,
    )
    return null
  }

  const computedDisplay = window.getComputedStyle(target).display
  const restoreDisplay =
    target.dataset.originalDisplay ||
    (computedDisplay !== 'none' ? computedDisplay : '') ||
    getDefaultDisplay(target.tagName)
  target.dataset.originalDisplay = restoreDisplay

  const revealedIds = getRevealedElementIds()
  const isAlreadyRevealed = revealedIds.includes(targetId)
  if (isAlreadyRevealed) {
    target.style.display = restoreDisplay
    return null
  }

  target.style.display = 'none'

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = buttonText
  button.className = buttonClassName
  const parent = target.parentElement || document.body

  const aboveRangeCount = getAboveRangeCount(target)
  const hasMildRisk = hasMildRiskBadge(target)

  if (aboveRangeCount > 0) {
    button.style.position = 'relative'
    const warning = document.createElement('span')
    warning.className = hasMildRisk
      ? 'reveal-warning-icon mild-risk'
      : 'reveal-warning-icon'
    warning.textContent = '!'
    warning.title = 'Some values are out of range'
    warning.setAttribute('aria-hidden', 'true')
    warning.style.cssText = [
      'position: absolute',
      'top: -6px',
      'right: -6px',
      'width: 18px',
      'height: 18px',
      'display: inline-flex',
      'align-items: center',
      'justify-content: center',
      'border-radius: 999px',
      hasMildRisk
        ? 'background: var(--color-rust-50)'
        : 'background: var(--color-aubergine-500)',
      hasMildRisk ? 'color: var(--color-rust-600)' : 'color: #ffffff',
      'font-size: 12px',
      'font-weight: 700',
      'box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2)',
      'pointer-events: none',
    ].join(';')
    button.appendChild(warning)
  }

  const revealTarget = () => {
    target.style.display = target.dataset.originalDisplay ?? restoreDisplay
    markElementRevealed(targetId)
  }

  button.addEventListener('click', () => {
    trackRevealClick({
      targetId,
      buttonLabel: button.textContent ?? buttonText,
      clickedAt: new Date(),
    })

    if (!SHOW_REVEAL_STATUS_MESSAGE) {
      button.remove()
      revealTarget()
      return
    }

    const message = document.createElement('div')
    message.className = 'reveal-status-message'
    message.setAttribute('role', 'status')
    message.textContent =
      aboveRangeCount === 0
        ? 'All your values are in range Andres'
        : `You have ${aboveRangeCount} values out of range, please take a closer look at them.`
    message.style.cssText = [
      'margin: 12px 0',
      'padding: 12px 16px',
      'background: #121212',
      'color: #ffffff',
      'border-radius: 12px',
      'font-size: 14px',
      'line-height: 20px',
      'opacity: 1',
      'transition: opacity 600ms ease',
    ].join(';')

    parent.insertBefore(message, target)
    button.remove()

    window.setTimeout(() => {
      message.style.opacity = '0'
      window.setTimeout(() => {
        message.remove()
        revealTarget()
      }, MESSAGE_FADE_DURATION_MS)
    }, MESSAGE_VISIBLE_DURATION_MS)
  })

  parent.insertBefore(button, target)

  return button
}
