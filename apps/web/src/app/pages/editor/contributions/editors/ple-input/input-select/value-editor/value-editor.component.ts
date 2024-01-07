import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'
import { InputSelectOptions } from '../input-select'

@Component({
  selector: 'app-input-select-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<string | string[], InputSelectOptions> {
  constructor() {
    super()
  }

  override setValue(value: string | string[]): void {
    super.setValue(value)
  }

  override setOptions(options: InputSelectOptions): void {
    super.setOptions?.({
      ...options,
      choices: options.choices || [],
    })

    if (options.multiple) {
      this.value = this.value || []
      if (!Array.isArray(this.value) && this.value) {
        this.value = [this.value].filter((c) => options.choices?.includes(c))
      } else if (Array.isArray(this.value)) {
        this.value = options.choices?.filter((c) => this.value?.includes(c)) || []
      }
    } else {
      if (Array.isArray(this.value)) {
        this.value = this.value[0]
      }
      this.value = options.choices?.includes(this.value as string) ? (this.value as string) : undefined
    }

    this.notifyValueChange?.(this.value!)
  }
}
