import { ConnectedPosition } from '@angular/cdk/overlay'

/**
 * Where a floating element sits against its origin. The opposite side is the fallback; a placement at
 * the start also aligns on the end of its origin when it has no room toward the end of the screen.
 */
export type Placement = 'below-start' | 'above-start' | 'above' | 'below'

const OFFSET = 4

const BELOW_START: ConnectedPosition = {
  originX: 'start',
  originY: 'bottom',
  overlayX: 'start',
  overlayY: 'top',
  offsetY: OFFSET,
}
const ABOVE_START: ConnectedPosition = {
  originX: 'start',
  originY: 'top',
  overlayX: 'start',
  overlayY: 'bottom',
  offsetY: -OFFSET,
}
const BELOW_END: ConnectedPosition = { ...BELOW_START, originX: 'end', overlayX: 'end' }
const ABOVE_END: ConnectedPosition = { ...ABOVE_START, originX: 'end', overlayX: 'end' }
const ABOVE: ConnectedPosition = {
  originX: 'center',
  originY: 'top',
  overlayX: 'center',
  overlayY: 'bottom',
  offsetY: -OFFSET,
}
const BELOW: ConnectedPosition = {
  originX: 'center',
  originY: 'bottom',
  overlayX: 'center',
  overlayY: 'top',
  offsetY: OFFSET,
}

/** The preferred position first, then its fallbacks when there is no room. */
export const positionsFor = (placement: Placement): ConnectedPosition[] =>
  ({
    'below-start': [BELOW_START, BELOW_END, ABOVE_START, ABOVE_END],
    'above-start': [ABOVE_START, ABOVE_END, BELOW_START, BELOW_END],
    above: [ABOVE, BELOW],
    below: [BELOW, ABOVE],
  }[placement])
