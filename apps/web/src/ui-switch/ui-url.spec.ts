import { withUiParam, withoutUiParam } from './ui-url'

describe('withUiParam', () => {
  it('sets the parameter and keeps the path, the other parameters and the hash', () => {
    const url = new URL('https://platon.test/courses/42/members?tab=groups#top')
    expect(withUiParam(url, 'legacy-once')).toBe('/courses/42/members?tab=groups&ui=legacy-once#top')
  })

  it('replaces an existing value', () => {
    expect(withUiParam(new URL('https://platon.test/dashboard?ui=next'), 'legacy')).toBe('/dashboard?ui=legacy')
  })
})

describe('withoutUiParam', () => {
  it('removes only the parameter and keeps the path, the other parameters and the hash', () => {
    const url = new URL('https://platon.test/courses/42?ui=next&next=%2Fdashboard#members')
    expect(withoutUiParam(url)).toBe('/courses/42?next=%2Fdashboard#members')
  })

  it('leaves no dangling question mark', () => {
    expect(withoutUiParam(new URL('https://platon.test/dashboard?ui=legacy'))).toBe('/dashboard')
  })
})
