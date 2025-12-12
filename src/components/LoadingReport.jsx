import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './LoadingReport.css'

export const FADE_IN_DURATION_MS = 600
export const FADE_OUT_DURATION_MS = 600
export const VISIBLE_DURATION_MS = 1400
const PEEK_CLASS = 'loading-report-peek'

const DEFAULT_MESSAGES = [
  { text: 'When you have more than one report you can select them here', targetHtmlId: 'report-selector' },
  { text: 'Each part of your body can be selected here', targetHtmlId: 'system-navigation' },
  { text: 'Grey areas indicate you should pay attention', targetHtmlId: 'system-navigation' },
  { text: 'Filter the results if you need', targetHtmlId: 'report-filters' },
]

function LoadingReport({ messages = DEFAULT_MESSAGES }) {
  const isReportPage =
    typeof window !== 'undefined' &&
    window.location.pathname.endsWith('report.html')

  const [isMounted, setIsMounted] = useState(isReportPage)
  const [isFading, setIsFading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [messagePhase, setMessagePhase] = useState('idle')
  const messageTimeoutsRef = useRef([])
  const fadeTimeoutRef = useRef()

  const safeMessages = useMemo(() => messages ?? [], [messages])
  const currentMessage = safeMessages[messageIndex]
  const currentTargetId = currentMessage?.targetHtmlId

  useEffect(() => {
    if (!isReportPage) {
      window.setTimeout(() => setIsMounted(false), 0)
    }
  }, [isReportPage])

  useEffect(() => {
    if (!isMounted) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMounted])

  const handleFinish = useCallback(() => {
    setIsFading(true)
    fadeTimeoutRef.current = window.setTimeout(
      () => setIsMounted(false),
      FADE_OUT_DURATION_MS,
    )
  }, [])

  const handleSkip = () => {
    messageTimeoutsRef.current.forEach(clearTimeout)
    messageTimeoutsRef.current = []
    handleFinish()
  }

  useEffect(() => {
    if (!isMounted || isFading) return

    messageTimeoutsRef.current.forEach(clearTimeout)
    messageTimeoutsRef.current = []

    window.setTimeout(() => setMessagePhase('idle'), 0)

    const toFadeIn = window.setTimeout(
      () => setMessagePhase('fade-in'),
      0,
    )
    const toVisible = window.setTimeout(
      () => setMessagePhase('visible'),
      FADE_IN_DURATION_MS,
    )
    const toFadeOut = window.setTimeout(
      () => setMessagePhase('fade-out'),
      FADE_IN_DURATION_MS + VISIBLE_DURATION_MS,
    )
    const toNext = window.setTimeout(() => {
      const isLast = messageIndex >= safeMessages.length - 1
      if (isLast) {
        handleFinish()
      } else {
        setMessageIndex((idx) => Math.min(idx + 1, safeMessages.length - 1))
      }
    }, FADE_IN_DURATION_MS + VISIBLE_DURATION_MS + FADE_OUT_DURATION_MS)

    messageTimeoutsRef.current = [toFadeIn, toVisible, toFadeOut, toNext]

    return () => {
      messageTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [handleFinish, isFading, isMounted, messageIndex, safeMessages.length])

  useEffect(() => {
    if (!isMounted) return undefined
    if (!currentTargetId) return undefined

    const targetEl = document.getElementById(currentTargetId)
    if (!targetEl) {
      console.error(
        `[LoadingReport] targetHtmlId "${currentTargetId}" not found`,
      )
      return undefined
    }

    targetEl.classList.add(PEEK_CLASS)
    return () => targetEl.classList.remove(PEEK_CLASS)
  }, [currentTargetId, isMounted])

  useEffect(
    () => () => {
      messageTimeoutsRef.current.forEach(clearTimeout)
      window.clearTimeout(fadeTimeoutRef.current)
    },
    [],
  )

  if (!isMounted) return null

  return (
    <div
      className={`loading-report-overlay${isFading ? ' fade-out' : ''}`}
      aria-live="polite"
    >
      <div className={`loading-report-message ${messagePhase}`}>
        {currentMessage?.text}
      </div>
      <button
        className="loading-report-skip"
        type="button"
        onClick={handleSkip}
      >
        Skip
      </button>
    </div>
  )
}

export default LoadingReport
