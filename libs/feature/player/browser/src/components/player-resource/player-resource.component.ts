import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResourceLayout } from '@platon/feature/player/common';
import { PlayerActivityComponent } from '../player-activity/player-activity.component';
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component';

@Component({
  standalone: true,
  selector: 'player-resource',
  templateUrl: './player-resource.component.html',
  styleUrls: ['./player-resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PlayerExerciseComponent,
    PlayerActivityComponent,
  ]
})
export class PlayerResourceComponent {
  @Input() layout!: ResourceLayout;
}
