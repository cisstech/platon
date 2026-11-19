import {
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  effect,
  inject,
  input,
} from '@angular/core'
import { Placement, positionsFor } from '../overlay/placement'

/** Hover delay before a tooltip shows; keyboard focus shows it at once. */
export const TOOLTIP_DELAY = 500

@Component({
  selector: 'pl-tooltip-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `{{ text() }}`,
  styles: `
    :host {
      display: block;
      max-inline-size: 280px;
      padding: var(--pl-space-1) var(--pl-space-2);
      border-radius: var(--pl-radius-1);
      background: var(--pl-color-text);
      color: var(--pl-color-surface);
      font: var(--pl-font-small);
      pointer-events: none;
    }
  `,
})
export class TooltipBubble {
  readonly text = input('')
}

/**
 * Shows a short text next to an element, on hover and on keyboard focus, never on touch. It shows
 * the element's name: when the element has no `aria-label`, the tooltip text becomes it. The bubble
 * itself is hidden from assistive technologies, so the name is read once.
 */
@Directive({
  selector: '[plTooltip]',
  host: {
    '(pointerenter)': 'showAfterDelay($event)',
    '(pointerleave)': 'hide()',
    '(focusin)': 'showOnKeyboardFocus()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '(click)': 'hide()',
  },
})
export class Tooltip {
  readonly text = input.required<string>({ alias: 'plTooltip' })
  readonly placement = input<Placement>('above', { alias: 'plTooltipPlacement' })

  private readonly injector = inject(Injector)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement
  private readonly namesHost = !this.host.hasAttribute('aria-label')
  private overlayRef?: OverlayRef
  private bubble?: ComponentRef<TooltipBubble>
  private timer?: ReturnType<typeof setTimeout>

  constructor() {
    effect(() => {
      const text = this.text()
      if (this.namesHost) this.host.setAttribute('aria-label', text)
      this.bubble?.setInput('text', text)
    })
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer)
      this.overlayRef?.dispose()
    })
  }

  show(): void {
    clearTimeout(this.timer)
    this.overlayRef ??= createOverlayRef(this.injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, this.host).withPositions(
        positionsFor(this.placement())
      ),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    })
    if (this.overlayRef.hasAttached()) return
    this.bubble = this.overlayRef.attach(new ComponentPortal(TooltipBubble))
    this.bubble.setInput('text', this.text())
  }

  hide(): void {
    clearTimeout(this.timer)
    this.bubble = undefined
    if (this.overlayRef?.hasAttached()) this.overlayRef.detach()
  }

  protected showAfterDelay(event: PointerEvent): void {
    if (event.pointerType === 'touch') return
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.show(), TOOLTIP_DELAY)
  }

  protected showOnKeyboardFocus(): void {
    if (this.host.matches(':focus-visible')) this.show()
  }
}
