import { ChangeDetectionStrategy, Component } from '@angular/core';



@Component({
  standalone: true,
  selector: 'app-settings-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [

  ]
})
export class SettingsGroupsPage { }
