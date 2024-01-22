import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseConfigEditor } from '../../ple-input'
import { InputNumberOptions } from '../input-number'

@Component({
  selector: 'app-input-number-config-editor',
  templateUrl: 'config-editor.component.html',
  styleUrls: ['config-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigEditorComponent extends BaseConfigEditor<InputNumberOptions> {
  constructor() {
    super()
  }
}
