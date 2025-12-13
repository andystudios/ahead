import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attachScrollHeadingLogger } from '../src/libs/scroll'

const createHeading = (id, top, ariaLevel = '2') => {
  const heading = document.createElement('div')
  heading.id = id
  heading.setAttribute('role', 'heading')
  heading.setAttribute('aria-level', ariaLevel)
  heading.textContent = `${id} text`
  heading.getBoundingClientRect = () => ({
    top,
    bottom: top + 20,
    left: 0,
    right: 100,
    width: 100,
    height: 20,
  })
  return heading
}

describe('attachScrollHeadingLogger', () => {
  let logSpy
  let scrollContainer
  let nav

  beforeEach(() => {
    document.body.innerHTML = ''
    scrollContainer = document.createElement('div')
    scrollContainer.id = 'scroll-target'
    document.body.appendChild(scrollContainer)

    nav = document.createElement('div')
    nav.id = 'system-navigation'
    document.body.appendChild(nav)

    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy?.mockRestore()
    document.body.innerHTML = ''
  })

  it('highlights the matching nav item for the closest heading', () => {
    const headings = [
      createHeading('heading-1', -120),
      createHeading('heading-2', 30),
      createHeading('heading-3', 180),
      createHeading('heading-ignored', 5, '3'),
    ]
    headings.forEach((heading) => scrollContainer.appendChild(heading))

    const navLink = document.createElement('button')
    navLink.setAttribute('aria-label', 'heading-2 text')
    nav.appendChild(navLink)

    const detach = attachScrollHeadingLogger()
    logSpy.mockClear()
    scrollContainer.dispatchEvent(new Event('scroll'))

    expect(logSpy).not.toHaveBeenCalled()
    expect(navLink.style.backgroundColor).toBe('rgb(224, 224, 224)')

    detach?.()
  })

  it('does not log when no headings are present', () => {
    // insert a non-matching heading to ensure aria-level filter works
    scrollContainer.appendChild(createHeading('heading-wrong', 0, '1'))

    const detach = attachScrollHeadingLogger()
    logSpy.mockClear()
    scrollContainer.dispatchEvent(new Event('scroll'))

    const calls = logSpy.mock.calls
    expect(calls.length).toBe(0)
    expect(nav.style.backgroundColor).toBe('')

    detach?.()
  })

  it('stops logging after cleanup', () => {
    const heading = createHeading('heading-4', 10)
    scrollContainer.appendChild(heading)

    const detach = attachScrollHeadingLogger()
    detach?.()
    logSpy.mockClear()

    scrollContainer.dispatchEvent(new Event('scroll'))

    expect(logSpy).not.toHaveBeenCalled()
    expect(nav.style.backgroundColor).toBe('')
  })
})
