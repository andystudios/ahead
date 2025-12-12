import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'
import logo from '../assets/logo.svg'
import { DISABLE_COOKIES } from '../libs/config'
import { hasSeenIntroCookie, setIntroSeenCookie } from '../libs/cookies'

const START_DELAY_MS = 1500
const FADE_IN_DURATION_MS = 500
const FADE_OUT_DURATION_MS = 1000
const VISIBLE_DURATION_MS = 2000
const MESSAGE_LINE_HEIGHT = 22
const MESSAGE_LINE_GAP = 8
const MESSAGE_LINE_STEP = MESSAGE_LINE_HEIGHT + MESSAGE_LINE_GAP
const log = (...args) => console.log('[Loading]', ...args)

const MESSAGES = [
  { text: 'Welcome to Ahead, Andres', always: true },
  { text: 'We are gathering your health report', permanent: true },
  { text: 'Use the top right menu to navigate', targetHtmlId: 'top-menu' },
  { text: 'Manage your profile on the top left', targetHtmlId: 'profile-menu' },
  { text: 'After checking the report, please take a look at the action plan' },
]

function Loading() {
  const isExcludedPage =
    typeof window !== 'undefined' &&
    (window.location.pathname.endsWith('report.html') ||
      window.location.pathname.endsWith('action_plan.html'))

  const [hasSeenIntro, setHasSeenIntro] = useState(() =>
    DISABLE_COOKIES ? false : hasSeenIntroCookie(),
  )
  const [isMounted, setIsMounted] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [messagePhase, setMessagePhase] = useState('idle')
  const [permanentMessages, setPermanentMessages] = useState([])
  const fadeTimeoutRef = useRef()
  const messageTimeoutsRef = useRef([])
  const activeMessages = useMemo(() => {
    if (hasSeenIntro) return MESSAGES.filter((msg) => msg.always)
    return MESSAGES
  }, [hasSeenIntro])
  const safeMessageIndex = Math.min(
    messageIndex,
    Math.max(activeMessages.length - 1, 0),
  )
  const currentMessage = activeMessages[safeMessageIndex]
  const currentMessageText = currentMessage?.text
  const currentMessagePermanent = currentMessage?.permanent
  const currentTargetId = currentMessage?.targetHtmlId

  useEffect(() => {
    if (isExcludedPage || DISABLE_COOKIES) {
      log('Cookies disabled via config; skipping intro cookie read')
      return
    }

    if (hasSeenIntro) {
      log('Intro cookie detected; will show only always=true messages')
    } else {
      log('No intro cookie; showing full intro sequence')
    }
  }, [hasSeenIntro, isExcludedPage])

  const markIntroSeen = useCallback(() => {
    if (!hasSeenIntro) setHasSeenIntro(true)
    if (DISABLE_COOKIES) {
      log('Intro seen; cookies disabled so no cookie will be set')
      return
    }
    log('Marking intro as seen in cookie')
    setIntroSeenCookie()
  }, [hasSeenIntro])

  useEffect(() => {
    // Lock body scroll while overlay is mounted; restore on cleanup.
    if (isExcludedPage) return undefined

    if (isMounted) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
    return undefined
  }, [isExcludedPage, isMounted])

  useEffect(() => {
    if (isExcludedPage || isFading) return

    // Clear any existing message timers before scheduling new ones
    messageTimeoutsRef.current.forEach(clearTimeout)
    messageTimeoutsRef.current = []

    window.setTimeout(() => setMessagePhase('idle'), 0)
    const delay = safeMessageIndex === 0 ? START_DELAY_MS : 0

    const toFadeIn = window.setTimeout(
      () => {
        log('Phase: fade-in', currentMessageText)
        setMessagePhase('fade-in')
      },
      delay,
    )
    const toVisible = window.setTimeout(() => {
      log('Phase: visible', currentMessageText)
      if (currentMessagePermanent) {
        setPermanentMessages((existing) => {
          const alreadyAdded = existing.some(
            (msg) => msg.id === safeMessageIndex,
          )
          if (alreadyAdded) return existing
          return [
            ...existing,
            {
              id: safeMessageIndex,
              text: currentMessageText,
            },
          ]
        })
      }
      setMessagePhase('visible')
    }, delay + FADE_IN_DURATION_MS)
    const toFadeOut = window.setTimeout(
      () => {
        log('Phase: fade-out', currentMessageText)
        setMessagePhase('fade-out')
      },
      delay + FADE_IN_DURATION_MS + VISIBLE_DURATION_MS,
    )
    const toNext = window.setTimeout(() => {
      const isLast = safeMessageIndex >= activeMessages.length - 1
      if (isLast) {
        log('Last message reached; fading out')
        markIntroSeen()
        setIsFading(true)
        fadeTimeoutRef.current = window.setTimeout(
          () => setIsMounted(false),
          FADE_OUT_DURATION_MS,
        )
      } else {
        log('Advancing to message', safeMessageIndex + 1)
        setMessageIndex((idx) => Math.min(idx + 1, activeMessages.length - 1))
      }
    }, delay + FADE_IN_DURATION_MS + VISIBLE_DURATION_MS + FADE_OUT_DURATION_MS)

    messageTimeoutsRef.current = [toFadeIn, toVisible, toFadeOut, toNext]

    return () => {
      messageTimeoutsRef.current.forEach(clearTimeout)
      window.clearTimeout(fadeTimeoutRef.current)
    }
  }, [
    activeMessages,
    currentMessageText,
    currentMessagePermanent,
    isExcludedPage,
    isFading,
    markIntroSeen,
    messageIndex,
    safeMessageIndex,
  ])

  useEffect(() => {
    log(
      'Showing message',
      `${safeMessageIndex + 1}/${activeMessages.length}`,
      currentMessageText,
    )

    if (isExcludedPage) return undefined

    const targetId = currentTargetId
    if (!currentMessage) return undefined
    if (!targetId) return undefined

    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      log('Peeking target element', targetId)
      targetEl.classList.add('loading-peek')
    } else {
      console.error(
        `[Loading] targetHtmlId "${targetId}" not found; skipping message.`,
      )
      // Stop any in-flight timers for the current message
      messageTimeoutsRef.current.forEach(clearTimeout)
      messageTimeoutsRef.current = []

      const isLast = safeMessageIndex >= activeMessages.length - 1
      window.setTimeout(() => {
        if (isLast) {
          markIntroSeen()
          setIsFading(true)
          fadeTimeoutRef.current = window.setTimeout(
          () => setIsMounted(false),
          FADE_OUT_DURATION_MS,
        )
      } else {
        setMessageIndex((idx) => Math.min(idx + 1, activeMessages.length - 1))
      }
      }, 0)
    }
    return undefined
  }, [
    activeMessages.length,
    currentMessage,
    currentMessagePermanent,
    currentMessageText,
    currentTargetId,
    isExcludedPage,
    markIntroSeen,
    messageIndex,
    safeMessageIndex,
  ])

  const isCurrentPermanentPinned = permanentMessages.some(
    (msg) => msg.id === safeMessageIndex,
  )
  const shouldRenderCurrent =
    currentMessage && (!currentMessage.permanent || !isCurrentPermanentPinned)
  const messagesMinHeight = Math.max(
    (permanentMessages.length + 1) * MESSAGE_LINE_STEP,
    MESSAGE_LINE_STEP,
  )

  const handleSkip = () => {
    log('Skip clicked; fading out and marking intro seen')
    messageTimeoutsRef.current.forEach(clearTimeout)
    messageTimeoutsRef.current = []

    markIntroSeen()
    setIsFading(true)
    fadeTimeoutRef.current = window.setTimeout(
      () => setIsMounted(false),
      FADE_OUT_DURATION_MS,
    )
  }

  if (!isMounted) return null
  if (isExcludedPage) {
    log('Skipping loading overlay on excluded page')
    return null
  }

  return (
    <div
      className={`loading-overlay${isFading ? ' fade-out' : ''}`}
      aria-live="polite"
    >
      <img alt="Loading" className="loading-logo" src={logo} />
      <div
        className="loading-messages"
        style={{ minHeight: `${messagesMinHeight}px` }}
      >
        {permanentMessages.map((msg, idx) => (
          <div
            key={`permanent-${msg.id}`}
            className="loading-message permanent visible"
            style={{ top: `${idx * MESSAGE_LINE_STEP}px` }}
          >
            {msg.text}
          </div>
        ))}
        {shouldRenderCurrent && (
          <div
            className={`loading-message ${messagePhase}`}
            style={{
              top: `${permanentMessages.length * MESSAGE_LINE_STEP}px`,
            }}
          >
            {currentMessage?.text}
          </div>
        )}
      </div>
      <button className="loading-skip" type="button" onClick={handleSkip}>
        Skip
      </button>
    </div>
  )
}

export default Loading
