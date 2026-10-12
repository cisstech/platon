import { ChangeDetectionStrategy, Component } from '@angular/core'

/** The bottom of the cover: help, notifications, the profile and the credit. */
@Component({
  selector: 'pl-cover-foot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pl-cover-foot' },
  templateUrl: './cover-foot.html',
  styleUrl: './cover-foot.scss',
})
export class CoverFoot {}
