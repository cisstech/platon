import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../skeleton/skeleton'

/** A copy on its way, in the shape of a small sheet. */
@Component({
  selector: 'pl-copy-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  templateUrl: './copy-card-skeleton.html',
  styleUrl: './copy-card-skeleton.scss',
})
export class CopyCardSkeleton {}
