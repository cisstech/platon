import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  isDevMode,
} from '@angular/core'

/**
 * `primary`: the one main action of a surface. `secondary`: other actions. `ghost`: light actions
 * inside a list or a toolbar. `icon`: an icon alone, which needs a name (`aria-label` or
 * `plTooltip`). `cover`, `cover-quiet` and `cover-icon`: the same on the cover.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'cover' | 'cover-quiet' | 'cover-icon'

/** `sm` and `md` are 36 px high, the smallest target on a desktop; `lg` is 44 px, as on a touch screen. */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** `danger` for an action that destroys or loses something. */
export type ButtonTone = 'default' | 'danger'

/**
 * A button or a link styled as a button. While it works (`loading`), its spinner takes the place of
 * its icon, in front of a label that does not move; it announces itself busy and ignores clicks.
 */
@Component({
  // A component on a native button or link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[plButton], a[plButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.aria-disabled]': "loading() ? 'true' : null",
  },
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary')
  readonly size = input<ButtonSize>('md')
  readonly tone = input<ButtonTone>('default')
  readonly loading = input(false, { transform: booleanAttribute })

  private readonly host: HTMLElement = inject(ElementRef).nativeElement

  constructor() {
    // Capture phase: the handlers of the page, attached to the same element, never see the click.
    const blockWhileLoading = (event: Event) => {
      if (!this.loading()) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    this.host.addEventListener('click', blockWhileLoading, { capture: true })
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', blockWhileLoading, { capture: true }))

    if (isDevMode()) {
      afterNextRender(() => {
        if (
          (this.variant() === 'icon' || this.variant() === 'cover-icon') &&
          !this.host.getAttribute('aria-label') &&
          !this.host.getAttribute('aria-labelledby')
        ) {
          console.error('pl-button: an icon button needs a name, through aria-label or plTooltip.', this.host)
        }
      })
    }
  }
}
