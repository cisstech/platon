import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ExerciseLayout } from '@platon/feature/player/common';

@Component({
  standalone: true,
  selector: 'player-exercise',
  templateUrl: './player-exercise.component.html',
  styleUrls: ['./player-exercise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
  ]
})
export class PlayerExerciseComponent {
  @Input() layout!: ExerciseLayout;
}
