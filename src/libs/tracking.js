const revealClickEvents = []
const missingTargetEvents = []
const skipEvents = []

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

// Track when a component cannot find its intended target element in the DOM.
export const trackMissingTarget = ({
  source,
  targetId,
  message,
  messageIndex,
  occurredAt = new Date(),
} = {}) => {
  const event = {
    source: source ?? '',
    targetId: targetId ?? '',
    message: message ?? '',
    messageIndex: Number.isFinite(messageIndex) ? messageIndex : null,
    occurredAt,
  }
  missingTargetEvents.push(event)
  return event
}

export const getMissingTargetEvents = () => [...missingTargetEvents]

export const clearMissingTargetEvents = () => {
  missingTargetEvents.length = 0
}

export const trackSkipEvent = ({ source, occurredAt = new Date() } = {}) => {
  const event = {
    source: source ?? '',
    occurredAt,
  }
  skipEvents.push(event)
  return event
}

export const getSkipEvents = () => [...skipEvents]

export const clearSkipEvents = () => {
  skipEvents.length = 0
}
