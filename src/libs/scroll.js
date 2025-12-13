const getHeadingElements = (root) => {
  if (!root || typeof root.querySelectorAll !== 'function') return []
  return Array.from(
    root.querySelectorAll('div[role="heading"][aria-level="2"]'),
  )
}

const getDistanceFromViewportTop = (element) => {
  if (!element || typeof element.getBoundingClientRect !== 'function') {
    return Number.POSITIVE_INFINITY
  }

  const rect = element.getBoundingClientRect()
  return typeof rect.top === 'number' ? Math.abs(rect.top) : Number.POSITIVE_INFINITY
}

const findClosestHeading = (root) => {
  const headings = getHeadingElements(root)
  if (!headings.length) return null

  let closest = null
  let shortestDistance = Number.POSITIVE_INFINITY

  headings.forEach((heading) => {
    const distance = getDistanceFromViewportTop(heading)
    if (distance < shortestDistance) {
      shortestDistance = distance
      closest = heading
    }
  })

  return closest
}

export const attachScrollHeadingLogger = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  const scrollTarget = document.getElementById('scroll-target')
  if (!scrollTarget) return null

  let highlightedNav = null

  const clearHighlight = () => {
    if (!highlightedNav) return

    if (highlightedNav.dataset.originalBg !== undefined) {
      highlightedNav.style.backgroundColor = highlightedNav.dataset.originalBg
      delete highlightedNav.dataset.originalBg
    } else {
      highlightedNav.style.backgroundColor = ''
    }

    highlightedNav = null
  }

  const highlightNav = (el) => {
    if (!el) return
    if (el === highlightedNav) return

    clearHighlight()
    if (el.dataset.originalBg === undefined) {
      el.dataset.originalBg = el.style.backgroundColor || ''
    }
    el.style.backgroundColor = '#e0e0e0'
    highlightedNav = el
  }

  const handleScroll = () => {
    const closestHeading = findClosestHeading(scrollTarget)
    if (closestHeading) {
      const text = (closestHeading.textContent || '').trim()
      const nav = document.getElementById('system-navigation')
      let matchedNavItem = null

      if (nav) {
        const matchingItem = Array.from(nav.querySelectorAll('[aria-label]')).find(
          (item) => (item.getAttribute('aria-label') || '').includes(text),
        )
        matchedNavItem = matchingItem || null
      }

      if (matchedNavItem) {
        highlightNav(matchedNavItem)
      } else {
        clearHighlight()
      }
    } else {
      clearHighlight()
    }
  }

  scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
  return () => scrollTarget.removeEventListener('scroll', handleScroll)
}
