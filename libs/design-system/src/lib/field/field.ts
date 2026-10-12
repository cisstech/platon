import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core'

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

/**
 * A labelled text field: its label, with an aside on its right (`plFieldAside`, such as a link), then a
 * box that holds `input[plInput]` and, after it, a button such as `plPasswordReveal`. The box shows the
 * focus and the error of its input; the message that explains an error belongs to the page, which
 * links it through the input's `aria-describedby`.
 */
@Component({
  selector: 'pl-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-invalid]': "control()?.invalid() ? '' : null",
    '[attr.data-focused]': "control()?.focused() ? '' : null",
  },
  template: `
    <div class="pl-field__head">
      <label class="pl-field__label" [for]="control()?.id()">{{ label() }}</label>
      <ng-content select="[plFieldAside]" />
    </div>
    <div class="pl-field__box">
      <ng-content select="input[plInput]" />
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--pl-space-2);
    }
    .pl-field__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--pl-space-2);
      font: var(--pl-font-small);
      font-weight: var(--pl-weight-strong);
    }
    .pl-field__box {
      display: flex;
      align-items: center;
      gap: var(--pl-space-2);
      min-block-size: 40px;
      padding: 0 var(--pl-space-1) 0 var(--pl-space-3);
      border: 1px solid var(--pl-color-control);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-surface);
    }
    :host([data-focused]) .pl-field__box {
      border-color: var(--pl-color-primary);
      outline: 2px solid var(--pl-color-focus);
      outline-offset: 1px;
    }
    :host([data-invalid]) .pl-field__box {
      border-color: var(--pl-color-danger);
    }
    :host ::ng-deep .pl-field__input {
      flex: 1;
      align-self: stretch;
      min-inline-size: 0;
      padding: 0;
      border: 0;
      background: none;
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    :host ::ng-deep .pl-field__input::placeholder {
      color: var(--pl-color-subtle);
    }
    :host ::ng-deep .pl-field__input:focus-visible {
      outline: none;
    }
    @media (pointer: coarse) {
      .pl-field__box {
        min-block-size: 44px;
      }
      /* A 44 px square target in a 44 px box: the button overlaps the border rather than grow the box. */
      :host ::ng-deep .pl-field__box > button {
        inline-size: 44px;
        margin-block: -1px;
      }
    }
  `,
})
export class Field {
  readonly label = input.required<string>()
  readonly control = contentChild(FieldInput)
}

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
    const control = this.field.control()
    if (!control) return
    this.shown.update((shown) => !shown)
    control.element.type = this.shown() ? 'text' : 'password'
  }
}
