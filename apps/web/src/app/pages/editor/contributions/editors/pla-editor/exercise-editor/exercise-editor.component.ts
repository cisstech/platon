import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core'
import { ActivityExercise, PleInput } from '@platon/feature/compiler'
import { ResourceService } from '@platon/feature/resource/browser'
import { ExerciseResourceMeta, Resource } from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-pla-exercise-editor',
  templateUrl: './exercise-editor.component.html',
  styleUrls: ['./exercise-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaExerciseEditorComponent {
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected _exercise!: ActivityExercise

  protected inputs?: PleInput[] = []
  protected resource?: Resource

  get exercise(): ActivityExercise {
    return this._exercise
  }

  @Input()
  set exercise(value: ActivityExercise) {
    this._exercise = value
    firstValueFrom(
      this.resourceService.find({
        id: value.resource,
        expands: ['metadata'],
      })
    ).then((resource) => {
      this.resource = resource
      const metadata = resource.metadata as ExerciseResourceMeta | undefined
      this.inputs = metadata?.config?.inputs?.map((input) => ({
        ...input,
        value: value.overrides?.[input.name] || input.value,
      }))
      this.changeDetectorRef.detectChanges()
    })
  }

  @Output() exerciseChange = new EventEmitter<ActivityExercise>()
  @Output() deleteClicked = new EventEmitter<void>()

  @Input() disabled?: boolean

  protected overriding = false
  protected expandedInputs: Record<string, boolean> = {}

  protected onOverrideVariable(name: string, value: unknown) {
    this.exercise.overrides = this.exercise.overrides || {}
    this.exercise.overrides[name] = value
    this.exerciseChange.emit(this.exercise)
  }
}
