import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Skeleton } from '../../skeleton/skeleton'

/** A course on its way, in the shape of a binder. */
@Component({
  selector: 'pl-binder-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton],
  host: { 'aria-hidden': 'true' },
  templateUrl: './binder-skeleton.html',
  styleUrl: './binder-skeleton.scss',
})
export class BinderSkeleton {}
