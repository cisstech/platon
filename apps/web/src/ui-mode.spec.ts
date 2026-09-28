import {
  UI_MODE_STORAGE_KEY,
  loadUiFlag,
  parseUiFlag,
  parseUiMode,
  readStoredUiMode,
  resolveUiMode,
  withoutUiParam,
  writeStoredUiMode,
} from './ui-mode'

const memoryStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  }
}

const brokenStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('SecurityError')
  },
}

const jsonResponse = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response)

describe('parseUiMode', () => {
  it('accepts the two modes', () => {
    expect(parseUiMode('next')).toBe('next')
    expect(parseUiMode('legacy')).toBe('legacy')
  })

  it('rejects anything else', () => {
    expect(parseUiMode('NEXT')).toBeNull()
    expect(parseUiMode('beta')).toBeNull()
    expect(parseUiMode('')).toBeNull()
    expect(parseUiMode(null)).toBeNull()
    expect(parseUiMode(undefined)).toBeNull()
  })
})

describe('parseUiFlag', () => {
  it('accepts the three values', () => {
    expect(parseUiFlag('off')).toBe('off')
    expect(parseUiFlag('opt-in')).toBe('opt-in')
    expect(parseUiFlag('default')).toBe('default')
  })

  it('falls back to off', () => {
    expect(parseUiFlag('on')).toBe('off')
    expect(parseUiFlag(true)).toBe('off')
    expect(parseUiFlag(undefined)).toBe('off')
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

  it('lets the query parameter win over everything', () => {
    expect(resolveUiMode({ param: 'next', stored: 'legacy', flag: 'off' })).toBe('next')
    expect(resolveUiMode({ param: 'legacy', stored: 'next', flag: 'default' })).toBe('legacy')
  })
})

describe('stored preference', () => {
  it('reads and writes the platon.ui key', () => {
    const storage = memoryStorage()
    writeStoredUiMode(storage, 'next')
    expect(storage.getItem(UI_MODE_STORAGE_KEY)).toBe('next')
    expect(readStoredUiMode(storage)).toBe('next')
  })

  it('ignores an unknown stored value', () => {
    expect(readStoredUiMode(memoryStorage({ [UI_MODE_STORAGE_KEY]: 'beta' }))).toBeNull()
  })

  it('survives a storage that is missing or throws (private browsing)', () => {
    expect(readStoredUiMode(null)).toBeNull()
    expect(readStoredUiMode(brokenStorage)).toBeNull()
    expect(() => writeStoredUiMode(brokenStorage, 'next')).not.toThrow()
    expect(() => writeStoredUiMode(null, 'next')).not.toThrow()
  })
})

describe('withoutUiParam', () => {
  it('removes only the ui parameter and keeps the path, the other parameters and the hash', () => {
    const url = new URL('https://platon.test/courses/42?ui=next&next=%2Fdashboard#members')
    expect(withoutUiParam(url)).toBe('/courses/42?next=%2Fdashboard#members')
  })

  it('leaves no dangling question mark', () => {
    expect(withoutUiParam(new URL('https://platon.test/dashboard?ui=legacy'))).toBe('/dashboard')
  })
})

describe('loadUiFlag', () => {
  it('reads the flag from assets/ui.json', async () => {
    const fetchFn = jest.fn(() => jsonResponse({ next: 'opt-in' }))
    await expect(loadUiFlag(fetchFn)).resolves.toBe('opt-in')
    expect(fetchFn).toHaveBeenCalledWith('assets/ui.json', expect.objectContaining({ cache: 'no-store' }))
  })

  it('is off when the file is missing', async () => {
    await expect(loadUiFlag(() => jsonResponse({}, false))).resolves.toBe('off')
  })

  it('is off when the file is not valid JSON', async () => {
    const fetchFn = () => Promise.resolve({ ok: true, json: () => Promise.reject(new SyntaxError('bad')) } as Response)
    await expect(loadUiFlag(fetchFn)).resolves.toBe('off')
  })

  it('is off when the request fails', async () => {
    await expect(loadUiFlag(() => Promise.reject(new TypeError('offline')))).resolves.toBe('off')
  })

  it('is off when the request does not answer in time', async () => {
    const never = (_input: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      })
    await expect(loadUiFlag(never, 10)).resolves.toBe('off')
  })
})
