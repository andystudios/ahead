import { describe, expect, it } from 'vitest'
import { DISABLE_COOKIES } from '../src/libs/config'

describe('config constants', () => {
  it('exposes DISABLE_COOKIES default as false', () => {
    expect(DISABLE_COOKIES).toBe(false)
  })
})
