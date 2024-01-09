import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core'
import { ActivityExercise, PleInput, Variables } from '@platon/feature/compiler'
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
  protected overrides: Variables = {}

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
      this.inputs = []
      this.overrides = {}
      for (const input of metadata?.config?.inputs || []) {
        if (value.overrides?.[input.name] != null) {
          this.overrides[input.name] = value.overrides[input.name]
        }
        this.inputs.push({
          ...input,
          value: this.overrides[input.name],
        })
      }
      this.changeDetectorRef.detectChanges()
    })
  }

  @Output() exerciseChange = new EventEmitter<ActivityExercise>()
  @Output() deleteClicked = new EventEmitter<void>()

  @Input() disabled?: boolean

  protected overriding = false
  protected expandedInputs: Record<string, boolean> = {}

  protected onOverrideVariable(name: string, value: unknown) {
    this.overrides[name] = value
    this.exercise.overrides = this.overrides
    this.exerciseChange.emit(this.exercise)
  }
}
