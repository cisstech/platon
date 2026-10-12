import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../skeleton/skeleton'

/** A notification on its way, in the shape of a row. */
@Component({
  selector: 'pl-notification-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  templateUrl: './notification-skeleton.html',
  styleUrl: './notification-skeleton.scss',
})
export class NotificationSkeleton {}
