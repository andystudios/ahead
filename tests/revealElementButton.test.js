import { beforeEach, describe, expect, it } from 'vitest'
import { attachRevealElementButton } from '../src/libs/revealElementButton'
import { getRevealedElementIds } from '../src/libs/cookies'

const clearRevealCookie = () => {
  document.cookie =
    'revealed_elements=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;'
}

describe('attachRevealElementButton', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    clearRevealCookie()
  })

  it('hides the target and renders a button', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({
      targetId: 'secret',
      buttonText: 'Reveal',
    })

    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button?.textContent).toBe('Reveal')
    expect(target.style.display).toBe('none')
  })

  it('reveals the target and stores the id on click', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    expect(target.style.display).toBe('')
    expect(getRevealedElementIds()).toContain('secret')
    expect(document.querySelector('button')).toBeNull()
  })

  it('reveals targets that start hidden via inline style', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    target.style.display = 'none'
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })
    button?.click()

    expect(target.style.display).toBe('block')
    expect(getRevealedElementIds()).toContain('secret')
  })

  it('keeps the target visible when already revealed', () => {
    const target = document.createElement('div')
    target.id = 'secret'
    document.cookie = `revealed_elements=${encodeURIComponent(
      JSON.stringify(['secret']),
    )}; path=/;`
    document.body.appendChild(target)

    const button = attachRevealElementButton({ targetId: 'secret' })

    expect(button).toBeNull()
    expect(target.style.display).toBe('')
  })
})
