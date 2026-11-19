import { Directive, inject, signal } from '@angular/core'
import { Field } from './field'

/**
 * On a button inside a `pl-field` (a `plButton` of the `icon` variant, named by its `aria-label`):
 * shows or hides the password of the field; `aria-pressed` says which. Its icon follows `shown()`.
 */
@Directive({
  selector: 'button[plPasswordReveal]',
  exportAs: 'plPasswordReveal',
  host: {
    '[attr.aria-pressed]': 'shown()',
    '(click)': 'toggle()',
  },
})
export class PasswordReveal {
  private readonly field = inject(Field)
  readonly shown = signal(false)

  protected toggle(): void {
    const element = this.field.control()?.element
    if (!(element instanceof HTMLInputElement)) return
    this.shown.update((shown) => !shown)
    element.type = this.shown() ? 'text' : 'password'
  }
}
