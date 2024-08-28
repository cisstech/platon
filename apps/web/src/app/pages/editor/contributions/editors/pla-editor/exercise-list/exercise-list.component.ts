import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

import { NzEmptyModule } from 'ng-zorro-antd/empty'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { Resource } from '@platon/feature/resource/common'
import { ExerciseCardComponent } from '../exercise-card/exercise-card.component'
import { DragDropModule } from '@angular/cdk/drag-drop'

@Component({
  standalone: true,
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzEmptyModule, NgeUiListModule, ExerciseCardComponent, DragDropModule],
})
export class ExerciseListComponent {
  @Input() items: Resource[] = []

  @Output() levelClicked = new EventEmitter<string>()
  @Output() topicClicked = new EventEmitter<string>()
  @Output() exerciseClicked = new EventEmitter<Resource>()
}
