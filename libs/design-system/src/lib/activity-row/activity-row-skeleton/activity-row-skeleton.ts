import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../skeleton/skeleton'

/** An activity on its way, in the shape of a row. */
@Component({
  selector: 'pl-activity-row-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  templateUrl: './activity-row-skeleton.html',
  styleUrl: './activity-row-skeleton.scss',
})
export class ActivityRowSkeleton {}
