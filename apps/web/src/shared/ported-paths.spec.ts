import { isPorted } from './ported-paths'

describe('isPorted', () => {
  it('knows the addresses of the new interface, whatever the query and the fragment', () => {
    expect(isPorted('/')).toBe(true)
    expect(isPorted('/dashboard')).toBe(true)
    expect(isPorted('/dashboard/?tab=1#top')).toBe(true)
    expect(isPorted('/login?next=%2Fdashboard')).toBe(true)
  })

  it('leaves the others to the current interface', () => {
    expect(isPorted('/courses')).toBe(false)
    expect(isPorted('/dashboard-old')).toBe(false)
    expect(isPorted('/login/no-account')).toBe(false)
  })
})
