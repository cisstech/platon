import { ChangeDetectionStrategy, Component } from '@angular/core'

/** A list of announcements, the most recent first. */
@Component({
  selector: 'pl-announcement-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list' },
  templateUrl: './announcement-list.html',
  styleUrl: './announcement-list.scss',
})
export class AnnouncementList {}
