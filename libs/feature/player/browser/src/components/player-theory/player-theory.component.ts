import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { ExerciseTheory } from '@platon/feature/compiler'
import { UiFilePreviewComponent } from '@platon/shared/ui'

@Component({
  standalone: true,
  selector: 'player-theory',
  templateUrl: './player-theory.component.html',
  styleUrl: './player-theory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UiFilePreviewComponent],
})
export class PlayerTheoryComponent {
  @Input({ required: true }) theory!: ExerciseTheory
}
