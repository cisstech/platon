import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { Button } from '@platon/design-system'

/**
 * « Afficher les annonces plus anciennes »: busy while they come, so that it keeps the focus, and
 * the failure said under it.
 */
@Component({
  selector: 'app-announcement-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './announcement-more.html',
  styleUrl: './announcement-more.scss',
})
export class AnnouncementMore {
  readonly state = input.required<'idle' | 'loading' | 'error'>()
  readonly asked = output<void>()
}
