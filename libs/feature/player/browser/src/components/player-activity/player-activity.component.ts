import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivityLayout } from '@platon/feature/player/common';

@Component({
  standalone: true,
  selector: 'player-activity',
  templateUrl: './player-activity.component.html',
  styleUrls: ['./player-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule
  ]
})
export class PlayerActivityComponent {
  @Input() layout!: ActivityLayout;
}
