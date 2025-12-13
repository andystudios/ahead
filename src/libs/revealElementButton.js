import { getRevealedElementIds, markElementRevealed } from './cookies'

const DEFAULT_BUTTON_TEXT = 'Show content'
const DEFAULT_BUTTON_CLASS = 'loading-skip reveal-toggle-button'
const MESSAGE_VISIBLE_DURATION_MS = 1200
const MESSAGE_FADE_DURATION_MS = 600
const ABOVE_RANGE_TERMS = ['Below range', 'above range', 'mild-risk']

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

  // Some elements are duplicated in the DOM because the download hack
  const duplicatedElementCorrection = 2

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = buttonText
  button.className = buttonClassName
  button.addEventListener('click', () => {
    const aboveRangeCount = Array.from(target.querySelectorAll('*')).filter(
      (el) => isAboveRangeText(el.textContent ?? ''),
    ).length / duplicatedElementCorrection

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
        target.style.display = target.dataset.originalDisplay ?? restoreDisplay
        markElementRevealed(targetId)
      }, MESSAGE_FADE_DURATION_MS)
    }, MESSAGE_VISIBLE_DURATION_MS)
  })

  const parent = target.parentElement || document.body
  parent.insertBefore(button, target)

  return button
}
