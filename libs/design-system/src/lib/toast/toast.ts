import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, TemplateRef, computed, input, output } from '@angular/core'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { Tooltip } from '../tooltip/tooltip'

export type ToastTone = 'info' | 'success' | 'warning' | 'danger' | 'loading'

/** A confirmation takes `check`, not the icon of success: staying is not succeeding. */
const TONE_ICONS: Record<Exclude<ToastTone, 'loading'>, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'error',
}

/**
 * A short message floating over the page, on the color of the cover. Its tone comes with an icon,
 * never with color alone; a confirmation or an information stays neutral. It may carry one action,
 * such as « Annuler ».
 */
@Component({
  selector: 'pl-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, NgTemplateOutlet, Tooltip],
  host: {
    class: 'pl-toast',
    '[attr.data-tone]': 'tone()',
  },
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  readonly tone = input<ToastTone>('info')
  readonly title = input<string>()
  readonly message = input<string>()
  /** Rendered under the message, with `context`. */
  readonly template = input<TemplateRef<unknown>>()
  readonly context = input<unknown>()
  /** Label of the one action the toast carries, such as « Annuler ». */
  readonly actionLabel = input<string>()
  readonly actionIcon = input<IconName>()
  /** Accessible name of the close button; without it, the toast has no close button. */
  readonly dismissLabel = input<string>()
  readonly acted = output<void>()
  readonly dismissed = output<void>()

  protected readonly icon = computed(() => {
    const tone = this.tone()
    return tone === 'loading' ? null : TONE_ICONS[tone]
  })
}
