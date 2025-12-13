import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './Loading.css'
import logo from '../assets/logo.svg'
import {
  DISABLE_COOKIES,
  START_DELAY_MS,
  FADE_IN_DURATION_MS,
  FADE_OUT_DURATION_MS,
  VISIBLE_DURATION_MS,
  MESSAGE_LINE_STEP,
} from '../libs/config'
import { hasSeenIntroCookie, setIntroSeenCookie } from '../libs/cookies'
import { trackMissingTarget, trackSkipEvent } from '../libs/tracking'

const log = (...args) => console.log('[Loading]', ...args)

const MAX_MESSAGE_LINES = 5
const MAX_PERMANENT_MESSAGES = MAX_MESSAGE_LINES - 1

const MESSAGES = [
  { text: 'Welcome to Ahead, Andres', always: true },
  { text: 'We are gathering your health report', permanent: true },
  { text: 'Use the top left menu to navigate', targetHtmlId: 'top-menu' },
  { text: 'Manage your profile on the top right', targetHtmlId: 'profile-menu' },
  { text: 'Please contact us if you have any questions', clear: true }
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
  const [isClearing, setIsClearing] = useState(false)
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
    const clearDelay = currentMessage?.clear ? FADE_OUT_DURATION_MS : 0

    const toFadeIn = window.setTimeout(
      () => {
        log('Phase: fade-in', currentMessageText)
        setMessagePhase('fade-in')
      },
      delay + clearDelay,
    )
    const toVisible = window.setTimeout(() => {
      log('Phase: visible', currentMessageText)
      if (currentMessagePermanent) {
        setPermanentMessages((existing) => {
          const alreadyAdded = existing.some(
            (msg) => msg.id === safeMessageIndex,
          )
          if (alreadyAdded) return existing
          if (existing.length >= MAX_PERMANENT_MESSAGES) return existing
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
    }, delay + clearDelay + FADE_IN_DURATION_MS)
    const toFadeOut = window.setTimeout(
      () => {
        log('Phase: fade-out', currentMessageText)
        setMessagePhase('fade-out')
      },
      delay + clearDelay + FADE_IN_DURATION_MS + VISIBLE_DURATION_MS,
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
    }, delay + clearDelay + FADE_IN_DURATION_MS + VISIBLE_DURATION_MS + FADE_OUT_DURATION_MS)

    const toStartClear =
      currentMessage?.clear &&
      window.setTimeout(() => {
        setIsClearing(true)
      }, delay)

    const toClear =
      currentMessage?.clear &&
      window.setTimeout(() => {
        setPermanentMessages([])
        setIsClearing(false)
      }, delay + clearDelay)

    messageTimeoutsRef.current = [
      toStartClear,
      toFadeIn,
      toVisible,
      toFadeOut,
      toNext,
      toClear,
    ].filter(Boolean)

    return () => {
      messageTimeoutsRef.current.forEach(clearTimeout)
      window.clearTimeout(fadeTimeoutRef.current)
    }
  }, [
    activeMessages,
    currentMessage?.clear,
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
      trackMissingTarget({
        source: 'Loading',
        targetId,
        message: currentMessageText,
        messageIndex: safeMessageIndex,
      })
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

  useEffect(() => {
    if (!isFading) return undefined
    if (fadeTimeoutRef.current) return undefined

    const timeout = window.setTimeout(() => {
      setIsMounted(false)
      fadeTimeoutRef.current = undefined
    }, FADE_OUT_DURATION_MS)
    fadeTimeoutRef.current = timeout

    return () => {
      if (fadeTimeoutRef.current === timeout) {
        window.clearTimeout(timeout)
        fadeTimeoutRef.current = undefined
      }
    }
  }, [isFading])

  const isCurrentPermanentPinned = permanentMessages.some(
    (msg) => msg.id === safeMessageIndex,
  )
  const shouldRenderCurrent =
    currentMessage && (!currentMessage.permanent || !isCurrentPermanentPinned)
  const messagesMinHeight = MAX_MESSAGE_LINES * MESSAGE_LINE_STEP
  const currentLineIndex = Math.min(
    permanentMessages.length,
    MAX_MESSAGE_LINES - 1,
  )
  const shouldDimNonCurrentLines = currentMessagePermanent

  const handleSkip = () => {
    log('Skip clicked; fading out and marking intro seen')
    messageTimeoutsRef.current.forEach(clearTimeout)
    messageTimeoutsRef.current = []

    trackSkipEvent({ source: 'Loading' })
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
            className={`loading-message permanent visible${
              shouldDimNonCurrentLines && msg.id !== safeMessageIndex
                ? ' dimmed'
                : ''
            }${isClearing ? ' clearing' : ''}`}
            style={{ top: `${idx * MESSAGE_LINE_STEP}px` }}
          >
            {msg.text}
          </div>
        ))}
        {shouldRenderCurrent && (
          <div
            className={`loading-message ${messagePhase}`}
            style={{
              top: `${currentLineIndex * MESSAGE_LINE_STEP}px`,
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
