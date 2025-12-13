import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadApp = async () => {
  await import('../src/main.jsx')
}

describe('window.showLog', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    window.history.pushState({}, '', '/')
    delete window.showLog
    vi.resetModules()
  })

  it('exposes showLog that reports reveal and missing target events', async () => {
    const consoleGroup = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
    const consoleTable = vi.spyOn(console, 'table').mockImplementation(() => {})
    const { trackRevealClick, trackMissingTarget, trackSkipEvent } = await import(
      '../src/libs/tracking'
    )
    trackRevealClick({ targetId: 'secret', buttonLabel: 'Reveal' })
    trackMissingTarget({
      source: 'Loading',
      targetId: 'missing-el',
      message: 'Test',
      messageIndex: 0,
    })
    trackSkipEvent({ source: 'LoadingReport' })

    await loadApp()

    expect(typeof window.showLog).toBe('function')
    const output = window.showLog()
    expect(consoleTable).toHaveBeenCalledTimes(3)
    expect(output.reveal).toHaveLength(1)
    expect(output.missing).toHaveLength(1)
    expect(output.skips).toHaveLength(1)

    consoleGroup.mockRestore()
    consoleTable.mockRestore()
  })
})
