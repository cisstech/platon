import { ConnectedPosition } from '@angular/cdk/overlay'

/** Where a floating element sits against its origin; the opposite side is the fallback. */
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

/** The preferred position first, then its mirror when there is no room. */
export const positionsFor = (placement: Placement): ConnectedPosition[] =>
  ({
    'below-start': [BELOW_START, ABOVE_START],
    'above-start': [ABOVE_START, BELOW_START],
    above: [ABOVE, BELOW],
    below: [BELOW, ABOVE],
  }[placement])
