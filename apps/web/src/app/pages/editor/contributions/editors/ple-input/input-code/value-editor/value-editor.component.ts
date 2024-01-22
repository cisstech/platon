import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'
import { InputCodeOptions } from '../input-code'

@Component({
  selector: 'app-input-code-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<string, InputCodeOptions> implements OnDestroy {
  private readonly disposables: monaco.IDisposable[] = []
  private model?: monaco.editor.ITextModel
  private editor?: monaco.editor.IStandaloneCodeEditor
  protected ignoreNextChange = false

  constructor() {
    super()
  }

  ngOnDestroy() {
    this.disposables.forEach((d) => d.dispose())
  }

  override setOptions(options: InputCodeOptions): void {
    if (options.language && this.model) {
      monaco.editor.setModelLanguage(this.model, options.language)
    }
    super.setOptions(options)
  }

  override setValue(value: string): void {
    value = this.convertToTextValue(value)
    if (this.model) {
      this.ignoreNextChange = true
      this.model.setValue(value)
    }
    super.setValue(value)
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
      readOnly: this.disabled,
      theme: 'nord',
    })

    const model = monaco.editor.createModel(this.value || '', this.options?.language || 'twig')

    editor.setModel(model)
    this.disposables.push(
      model.onDidChangeContent(() => {
        if (this.ignoreNextChange) {
          this.ignoreNextChange = false
          return
        }

        const value = model.getValue()
        this.notifyValueChange?.(value)
      })
    )

    this.model = model
    this.editor = editor
  }
}
