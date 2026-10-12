import { Menu as AriaMenu } from '@angular/aria/menu'
import {
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay'
import { DomPortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
} from '@angular/core'
import { Placement, positionsFor } from '../overlay/placement'

/**
 * A menu of actions, shown under (or above) its trigger. Selecting an entry emits its value through
 * `itemSelected` and closes the menu; `Échap` closes it and gives the focus back to the trigger.
 * The menu lives in an overlay pane from the start, so opening it never moves the focused element.
 * Without a trigger, it stays hidden: Angular Aria would show it in place.
 */
@Component({
  selector: 'pl-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: AriaMenu, outputs: ['itemSelected'] }],
  host: { class: 'pl-menu', '[attr.data-triggered]': 'triggered()' },
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  readonly placement = input<Placement>('below-start')

  private readonly aria = inject(AriaMenu)
  protected readonly triggered = computed(() => Boolean(this.aria.parent()))
  private readonly injector = inject(Injector)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement
  private overlayRef?: OverlayRef

  constructor() {
    afterNextRender(() => {
      this.overlayRef = createOverlayRef(this.injector, {
        scrollStrategy: createRepositionScrollStrategy(this.injector),
      })
      this.overlayRef.attach(new DomPortal(this.host))
    })
    effect(() => {
      const origin = this.aria.parent()?.element
      if (!this.aria.visible() || !origin) return
      const placement = this.placement()
      afterNextRender(
        () => {
          this.overlayRef?.updatePositionStrategy(
            createFlexibleConnectedPositionStrategy(this.injector, origin).withPositions(positionsFor(placement))
          )
        },
        { injector: this.injector }
      )
    })
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose())
  }
}

export type MenuItemTone = 'default' | 'danger'
