import { isPorted } from './ported-paths'

describe('isPorted', () => {
  it('knows the addresses of the new interface, whatever the query and the fragment', () => {
    expect(isPorted('/')).toBe(true)
    expect(isPorted('/dashboard')).toBe(true)
    expect(isPorted('/dashboard/?tab=1#top')).toBe(true)
    expect(isPorted('/login?next=%2Fdashboard')).toBe(true)
    expect(isPorted('/announcements?highlight=a1')).toBe(true)
    expect(isPorted('/courses?q=algo')).toBe(true)
    expect(isPorted('/courses/create')).toBe(true)
  })

  it('leaves the others to the current interface', () => {
    expect(isPorted('/courses/ap1')).toBe(false)
    expect(isPorted('/dashboard-old')).toBe(false)
    expect(isPorted('/login/no-account')).toBe(false)
  })
})
