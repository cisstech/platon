import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { ActivityPlayer } from '@platon/feature/player/common';
import { DurationPipe } from '@platon/shared/ui';


@Component({
  standalone: true,
  selector: 'player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['./player-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    DurationPipe,
  ]
})
export class PlayerSettingsComponent {
  @Input() player!: ActivityPlayer;
}
