import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'
import { InputListOptions } from '../input-list'

@Component({
  selector: 'app-input-list-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<string[], InputListOptions> {
  constructor() {
    super()
  }

  override setValue(value: string[]): void {
    super.setValue(value && Array.isArray(value) ? value : [])
  }

  protected editValue(index: number, value: string): void {
    const values = this.value || []
    values[index] = value
    this.notifyValueChange?.(values)
  }

  protected removeValue(index: number): void {
    const values = this.value || []
    values.splice(index, 1)
    this.notifyValueChange?.(values)
  }

  protected addValue(value: string): void {
    const values = this.value || []
    values.push(value)
    this.notifyValueChange?.(values)
  }
}
