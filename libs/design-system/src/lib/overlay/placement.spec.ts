import { positionsFor } from './placement'

describe('positionsFor', () => {
  it('tries the preferred side first, then the opposite one', () => {
    expect(positionsFor('above').map((position) => position.overlayY)).toEqual(['bottom', 'top'])
    expect(positionsFor('below').map((position) => position.overlayY)).toEqual(['top', 'bottom'])
  })

  it('aligns a placement at the start on the end of its origin before changing side', () => {
    const below = positionsFor('below-start').map(({ originX, overlayY }) => `${overlayY} ${originX}`)
    expect(below).toEqual(['top start', 'top end', 'bottom start', 'bottom end'])
    const above = positionsFor('above-start').map(({ originX, overlayY }) => `${overlayY} ${originX}`)
    expect(above).toEqual(['bottom start', 'bottom end', 'top start', 'top end'])
  })
})
