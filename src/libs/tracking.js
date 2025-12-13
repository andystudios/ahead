const revealClickEvents = []

// Track when a reveal button is clicked for later inspection/telemetry.
// Accepts a target identifier, optional button label, and timestamp.
export const trackRevealClick = ({
  targetId,
  buttonLabel,
  clickedAt = new Date(),
} = {}) => {
  const event = {
    targetId: targetId ?? '',
    buttonLabel: buttonLabel ?? '',
    clickedAt,
  }
  revealClickEvents.push(event)
  return event
}

export const getRevealClickEvents = () => [...revealClickEvents]

export const clearRevealClickEvents = () => {
  revealClickEvents.length = 0
}
