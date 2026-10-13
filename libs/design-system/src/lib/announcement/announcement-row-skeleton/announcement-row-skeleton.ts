import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../skeleton/skeleton'

/** An announcement on its way, in the shape of a row. */
@Component({
  selector: 'pl-announcement-row-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  templateUrl: './announcement-row-skeleton.html',
  styleUrl: './announcement-row-skeleton.scss',
})
export class AnnouncementRowSkeleton {}
