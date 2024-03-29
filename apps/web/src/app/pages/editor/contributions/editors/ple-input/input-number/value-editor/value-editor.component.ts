import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'
import { InputNumberOptions } from '../input-number'

@Component({
  selector: 'app-input-number-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<number, InputNumberOptions> {
  constructor() {
    super()
  }

  override setValue(value: number): void {
    super.setValue(this.convertToNumericValue(value))
  }
}
