import { ChangeDetectionStrategy, Component } from '@angular/core';



@Component({
  standalone: true,
  selector: 'app-settings-lmses',
  templateUrl: './lmses.page.html',
  styleUrls: ['./lmses.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [

  ]
})
export class SettingsLmsesPage { }
