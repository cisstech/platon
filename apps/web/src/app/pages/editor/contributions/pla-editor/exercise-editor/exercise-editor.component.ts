import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ActivityExercise } from '@platon/feature/compiler';

@Component({
  selector: 'app-pla-exercise-editor',
  templateUrl: './exercise-editor.component.html',
  styleUrls: ['./exercise-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaExerciseEditorComponent implements OnDestroy {
  private readonly disposables: monaco.IDisposable[] = [];

  @Input() exercise!: ActivityExercise;
  @Output() exerciseChange = new EventEmitter<ActivityExercise>();

  @Output() deleteClicked = new EventEmitter<void>();

  protected overriding = false;


  ngOnDestroy() {
    this.disposables.forEach(d => d.dispose());
  }

  onCreateEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.updateOptions({
      minimap: {
        enabled: false,
      },
      scrollbar: {
        verticalSliderSize: 6,

      },
      tabIndex: 2
    });

    let content = this.exercise.overrides?.toString() || '';
    try {
      content = JSON.stringify(this.exercise.overrides, null, 2);
    } catch {
      content = '{}';
    }

    const model = monaco.editor.createModel(
      content,
      'json'
    );

    editor.setModel(model);
    this.disposables.push(
      model.onDidChangeContent(() => {
        try {
          this.exercise.overrides = JSON.parse(model.getValue());
          this.exerciseChange.emit(this.exercise);
        } catch {
          //
        }
      })
    );
  }
}
