import { ChangeDetectionStrategy, Component, input, model } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  icon?: IconName
  /** Shows the icon alone; the label stays the option's accessible name. */
  iconOnly?: boolean
}

/** `md` fits a toolbar; `lg` gives each choice the 44 px a finger needs. */
export type SegmentedSize = 'md' | 'lg'

let lastGroupId = 0

/**
 * One choice among a few, all visible (theme, list filters, display mode). Built on native radio
 * buttons: the arrows move the choice and screen readers announce a radio group.
 */
@Component({
  selector: 'pl-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label()',
    '[attr.data-size]': 'size()',
  },
  template: `
    @for (option of options(); track option.value) {
    <label class="pl-segmented__option" [attr.data-checked]="option.value === value()">
      <input
        class="pl-segmented__input"
        type="radio"
        [name]="name"
        [value]="option.value"
        [checked]="option.value === value()"
        (change)="value.set(option.value)"
      />
      @if (option.icon; as icon) {
      <pl-icon [name]="icon" [size]="1" />
      }
      <span [class.pl-segmented__hidden]="option.iconOnly">{{ option.label }}</span>
    </label>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: calc(var(--pl-space-1) / 2);
      padding: calc(var(--pl-space-1) / 2);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-hover);
    }
    .pl-segmented__option {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--pl-space-1);
      block-size: 28px;
      padding: 0 var(--pl-space-3);
      border-radius: var(--pl-radius-1);
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
      font-weight: var(--pl-weight-strong);
      cursor: pointer;
    }
    :host([data-size='lg']) .pl-segmented__option {
      block-size: 44px;
      font: var(--pl-font-body);
      font-weight: var(--pl-weight-strong);
    }
    .pl-segmented__option[data-checked='true'] {
      background: var(--pl-color-surface);
      box-shadow: var(--pl-shadow-float);
      color: var(--pl-color-text);
    }
    .pl-segmented__option:has(.pl-segmented__input:focus-visible) {
      outline: 2px solid var(--pl-color-focus);
      outline-offset: 1px;
    }
    .pl-segmented__input,
    .pl-segmented__hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      opacity: 0;
    }
  `,
})
export class Segmented<T extends string = string> {
  readonly options = input.required<SegmentedOption<T>[]>()
  /** Accessible name of the group. */
  readonly label = input.required<string>()
  readonly value = model<T>()
  readonly size = input<SegmentedSize>('md')

  protected readonly name = `pl-segmented-${++lastGroupId}`
}
