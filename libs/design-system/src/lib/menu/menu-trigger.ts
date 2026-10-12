import { MenuTrigger as AriaMenuTrigger } from '@angular/aria/menu'
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core'

/**
 * Opens the menu it points to. The keyboard, the focus and the ARIA state come from Angular Aria.
 *
 * ```html
 * <button plButton [plMenuTrigger]="create">Créer</button>
 * <pl-menu #create="ngMenu" (itemSelected)="open($event)">…</pl-menu>
 * ```
 */
@Directive({
  selector: '[plMenuTrigger]',
  exportAs: 'plMenuTrigger',
  hostDirectives: [{ directive: AriaMenuTrigger, inputs: ['menu: plMenuTrigger', 'disabled'] }],
})
export class MenuTrigger {
  private readonly aria = inject(AriaMenuTrigger)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement

  constructor() {
    // Capture phase: these run before the handlers of Angular Aria on the same element.
    const beforeOpening = () => this.bringMenuToFront()
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return this.bringMenuToFront()
      if (this.aria.expanded()) return
      // Angular Aria swallows Escape even with its menu closed: hand it to the container, so that a
      // dialog holding the trigger still closes.
      event.stopImmediatePropagation()
      const { key, code, keyCode } = event
      this.host.parentElement?.dispatchEvent(new KeyboardEvent('keydown', { key, code, keyCode, bubbles: true }))
    }
    this.host.addEventListener('click', beforeOpening, { capture: true })
    this.host.addEventListener('keydown', onKeydown, { capture: true })
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('click', beforeOpening, { capture: true })
      this.host.removeEventListener('keydown', onKeydown, { capture: true })
    })
  }

  /** Opens the menu on its first entry, as a click on the trigger does. */
  open(): void {
    this.bringMenuToFront()
    this.aria.open()
  }

  /**
   * The CDK shows its overlays in the top layer, in the order they were shown: the menu, attached at
   * start, would open under a dialog opened since. Shown again while still closed, it comes on top
   * without moving a focused element.
   */
  private bringMenuToFront(): void {
    if (this.aria.expanded()) return
    const popover = this.aria.menu()?.element.closest<HTMLElement>('[popover]')
    if (!popover?.matches(':popover-open')) return
    popover.hidePopover()
    popover.showPopover()
  }
}
