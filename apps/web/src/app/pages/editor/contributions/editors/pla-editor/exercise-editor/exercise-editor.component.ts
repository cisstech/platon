import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core'
import { ActivityExercise } from '@platon/feature/compiler'
import { ResourceFileService, ResourceService } from '@platon/feature/resource/browser'
import { Resource } from '@platon/feature/resource/common'
import { catchError, firstValueFrom, of } from 'rxjs'
import { PleInput } from '../../ple-input-editor/ple-input'

@Component({
  selector: 'app-pla-exercise-editor',
  templateUrl: './exercise-editor.component.html',
  styleUrls: ['./exercise-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaExerciseEditorComponent {
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly resourceFileService = inject(ResourceFileService)

  protected _exercise!: ActivityExercise

  protected inputs?: PleInput[] = []
  protected selectedInput?: PleInput
  protected resource?: Resource

  get exercise(): ActivityExercise {
    return this._exercise
  }

  @Input()
  set exercise(value: ActivityExercise) {
    this._exercise = value
    Promise.all([
      firstValueFrom(this.resourceService.find(value.resource)),
      firstValueFrom(
        this.resourceFileService
          .read(value.resource, 'config.json', value.version)
          .pipe(catchError(() => of(undefined)))
      ) as unknown as Promise<{ inputs: PleInput[] }>,
    ]).then(([resource, config]) => {
      this.resource = resource
      this.inputs = config?.inputs
      this.changeDetectorRef.detectChanges()
    })
  }

  @Output() exerciseChange = new EventEmitter<ActivityExercise>()

  @Output() deleteClicked = new EventEmitter<void>()

  protected overriding = false
  protected onOverrideVariable(name: string, value: unknown) {
    this.exercise.overrides = this.exercise.overrides || {}
    this.exercise.overrides[name] = value
    this.exerciseChange.emit(this.exercise)
  }
}
