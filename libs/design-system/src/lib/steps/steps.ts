import { ChangeDetectionStrategy, Component } from '@angular/core'

/** Steps to take in order, each numbered: an ordered list. */
@Component({
  selector: 'pl-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list' },
  templateUrl: './steps.html',
  styleUrl: './steps.scss',
})
export class Steps {}
