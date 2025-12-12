import { getRevealedElementIds, markElementRevealed } from './cookies'

const DEFAULT_BUTTON_TEXT = 'Show content'
const DEFAULT_BUTTON_CLASS = 'loading-skip reveal-toggle-button'

const getDefaultDisplay = (tagName = '') => {
  const normalized = tagName.toUpperCase()
  if (normalized === 'SPAN') return 'inline'
  if (['BUTTON', 'INPUT', 'SELECT'].includes(normalized)) return 'inline-block'
  return 'block'
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

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = buttonText
  button.className = buttonClassName
  button.addEventListener('click', () => {
    target.style.display = target.dataset.originalDisplay ?? restoreDisplay
    markElementRevealed(targetId)
    button.remove()
  })

  const parent = target.parentElement || document.body
  parent.insertBefore(button, target)

  return button
}
