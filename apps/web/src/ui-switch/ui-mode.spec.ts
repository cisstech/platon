import { parseUiFlag, parseUiMode, parseUiParam, resolveUiMode } from './ui-mode'

describe('parseUiMode', () => {
  it('accepts the two modes', () => {
    expect(parseUiMode('next')).toBe('next')
    expect(parseUiMode('legacy')).toBe('legacy')
  })

  it('rejects anything else, the bridge pass included', () => {
    for (const value of ['NEXT', 'beta', '', 'legacy-once', null, undefined]) {
      expect(parseUiMode(value)).toBeNull()
    }
  })
})

describe('parseUiParam', () => {
  it('accepts the two modes and the bridge pass', () => {
    expect(parseUiParam('next')).toBe('next')
    expect(parseUiParam('legacy')).toBe('legacy')
    expect(parseUiParam('legacy-once')).toBe('legacy-once')
  })

  it('rejects anything else', () => {
    expect(parseUiParam('next-once')).toBeNull()
    expect(parseUiParam(null)).toBeNull()
  })
})

describe('parseUiFlag', () => {
  it('accepts the three values', () => {
    expect(parseUiFlag('off')).toBe('off')
    expect(parseUiFlag('opt-in')).toBe('opt-in')
    expect(parseUiFlag('default')).toBe('default')
  })

  it('falls back to off', () => {
    for (const value of ['on', true, undefined]) {
      expect(parseUiFlag(value)).toBe('off')
    }
  })
})

describe('resolveUiMode', () => {
  it('keeps the current interface for someone without a preference', () => {
    expect(resolveUiMode({ param: null, stored: null, flag: 'off' })).toBe('legacy')
    expect(resolveUiMode({ param: null, stored: null, flag: 'opt-in' })).toBe('legacy')
  })

  it('starts the new interface for someone without a preference when it is the default', () => {
    expect(resolveUiMode({ param: null, stored: null, flag: 'default' })).toBe('next')
  })

  it('lets the stored preference win over the flag', () => {
    expect(resolveUiMode({ param: null, stored: 'next', flag: 'off' })).toBe('next')
    expect(resolveUiMode({ param: null, stored: 'legacy', flag: 'default' })).toBe('legacy')
  })

  it('lets the parameter win over everything', () => {
    expect(resolveUiMode({ param: 'next', stored: 'legacy', flag: 'off' })).toBe('next')
    expect(resolveUiMode({ param: 'legacy', stored: 'next', flag: 'default' })).toBe('legacy')
  })

  it('starts the current interface for a bridge pass, whatever the preference', () => {
    expect(resolveUiMode({ param: 'legacy-once', stored: 'next', flag: 'default' })).toBe('legacy')
  })
})
