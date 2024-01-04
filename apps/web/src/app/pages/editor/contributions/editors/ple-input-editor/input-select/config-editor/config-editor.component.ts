import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseConfigEditor } from '../../ple-input'
import { InputSelectOptions } from '../input-select'

@Component({
  selector: 'app-input-select-config-editor',
  templateUrl: 'config-editor.component.html',
  styleUrls: ['config-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigEditorComponent extends BaseConfigEditor<InputSelectOptions> {
  constructor() {
    super()
  }

  override setOptions(options: InputSelectOptions): void {
    super.setOptions?.({
      ...options,
      choices: options.choices || [],
    })
  }

  protected removeChoice(index: number): void {
    this.options.choices?.splice(index, 1)
    this.notifyOptionsChange?.(this.options)
  }

  protected addChoice(value: string): void {
    this.options.choices = [...(this.options.choices || []), value]
    this.notifyOptionsChange?.(this.options)
  }
}
