import { PORTED_PATHS } from '../shared/ported-paths'
import { nextRoutes } from './next.routes'

describe('nextRoutes', () => {
  it('serves exactly the ported addresses the current interface sends back', () => {
    const shell = nextRoutes.find((route) => route.path === '')
    const served = ['/', ...(shell?.children ?? []).filter((route) => route.path).map((route) => `/${route.path}`)]
    expect(served.sort()).toEqual([...PORTED_PATHS].sort())
  })
})
