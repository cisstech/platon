import { ChangeDetectionStrategy, Component } from '@angular/core';



@Component({
  standalone: true,
  selector: 'app-settings-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [

  ]
})
export class SettingsUsersPage { }
