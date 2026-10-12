import { ChangeDetectionStrategy, Component } from '@angular/core'

/** A list of notifications, newest first. */
@Component({
  selector: 'pl-notification-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'list' },
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss',
})
export class NotificationList {}
