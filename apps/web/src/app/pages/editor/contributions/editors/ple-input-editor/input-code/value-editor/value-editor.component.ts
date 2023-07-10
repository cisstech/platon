import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'
import { InputCodeOptions } from '../input-code'

@Component({
  selector: 'app-input-code-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCodeValueEditorComponent
  extends BaseValueEditor<string, InputCodeOptions>
  implements OnDestroy
{
  private readonly disposables: monaco.IDisposable[] = []

  constructor() {
    super()
  }

  ngOnDestroy() {
    this.disposables.forEach((d) => d.dispose())
  }

  onCreateEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.updateOptions({
      minimap: {
        enabled: false,
      },
      scrollbar: {
        verticalSliderSize: 6,
      },
      tabIndex: 2,
    })

    const model = monaco.editor.createModel(this.value || '', this.options?.language || 'plaintext')

    editor.setModel(model)
    this.disposables.push(
      model.onDidChangeContent(() => {
        this.notifyValueChange?.(model.getValue())
      })
    )
  }
}
