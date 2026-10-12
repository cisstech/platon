import { ChangeDetectionStrategy, Component } from '@angular/core'

/** A list of activities, the most urgent first. */
@Component({
  selector: 'pl-activity-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list' },
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.scss',
})
export class ActivityList {}
