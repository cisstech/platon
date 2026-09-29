import { dismissUiOffer, isUiOfferDismissed, readUiPreference, writeUiPreference } from './ui-storage'

const memoryStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  }
}

const brokenStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError')
  },
  setItem: (): void => {
    throw new Error('SecurityError')
  },
}

describe('interface preference', () => {
  it('is written and read back under platon.ui', () => {
    const storage = memoryStorage()
    writeUiPreference('next', storage)
    expect(storage.getItem('platon.ui')).toBe('next')
    expect(readUiPreference(storage)).toBe('next')
  })

  it('ignores an unknown value', () => {
    expect(readUiPreference(memoryStorage({ 'platon.ui': 'beta' }))).toBeNull()
  })
})

describe('offer dismissal', () => {
  it('is remembered under platon.ui.offer-dismissed', () => {
    const storage = memoryStorage()
    expect(isUiOfferDismissed(storage)).toBe(false)
    dismissUiOffer(storage)
    expect(storage.getItem('platon.ui.offer-dismissed')).toBe('1')
    expect(isUiOfferDismissed(storage)).toBe(true)
  })
})

describe('without a usable storage (private browsing)', () => {
  it('reads nothing and never throws', () => {
    for (const storage of [null, brokenStorage]) {
      expect(readUiPreference(storage)).toBeNull()
      expect(isUiOfferDismissed(storage)).toBe(false)
      expect(() => writeUiPreference('next', storage)).not.toThrow()
      expect(() => dismissUiOffer(storage)).not.toThrow()
    }
  })
})
