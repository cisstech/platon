import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChildren } from '@angular/core'
import { Count } from '../count/count'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  icon?: IconName
  /** Shows the icon alone; the label stays the option's accessible name. */
  iconOnly?: boolean
  /** How many things the choice holds, after its label: « Actuels 3 ». */
  count?: number
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
  imports: [Count, Icon],
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'label()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './segmented.html',
  styleUrl: './segmented.scss',
})
export class Segmented<T extends string = string> {
  readonly options = input.required<SegmentedOption<T>[]>()
  /** Accessible name of the group. */
  readonly label = input.required<string>()
  readonly value = model<T>()
  readonly size = input<SegmentedSize>('md')

  protected readonly name = `pl-segmented-${++lastGroupId}`
  private readonly radios = viewChildren<ElementRef<HTMLInputElement>>('radio')

  /** Focuses the chosen option, as a tab into the group would. */
  focus(): void {
    const radios = this.radios().map(({ nativeElement }) => nativeElement)
    ;(radios.find(({ checked }) => checked) ?? radios[0])?.focus()
  }
}
