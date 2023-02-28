import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


import { MatIconModule } from '@angular/material/icon';

import { ActivityPlayer } from '@platon/feature/player/common';


@Component({
  standalone: true,
  selector: 'player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['./player-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
  ]
})
export class PlayerSettingsComponent {
  @Input() player!: ActivityPlayer;
}
