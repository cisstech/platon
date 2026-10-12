import { Directive, ElementRef, booleanAttribute, inject, input, signal } from '@angular/core'

let lastId = 0

/**
 * The text control of a `pl-field`, on `input[plInput]`: the id its label points to, and its error
 * state. Its field styles it.
 */
@Directive({
  selector: 'input[plInput]',
  host: {
    class: 'pl-field__input',
    '[id]': 'id()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
    '(focus)': 'focused.set(true)',
    '(blur)': 'focused.set(false)',
  },
})
export class FieldInput {
  readonly id = input(`pl-input-${++lastId}`)
  readonly invalid = input(false, { transform: booleanAttribute })
  readonly focused = signal(false)
  readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement
}
