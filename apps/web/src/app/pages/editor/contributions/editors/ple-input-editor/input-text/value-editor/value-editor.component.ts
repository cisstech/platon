import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseValueEditor } from '../../ple-input'

@Component({
  selector: 'app-input-text-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextValueEditorComponent extends BaseValueEditor<string> {
  constructor() {
    super()
  }
}
