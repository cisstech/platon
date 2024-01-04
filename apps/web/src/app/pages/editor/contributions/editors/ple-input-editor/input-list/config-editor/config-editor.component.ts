import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseConfigEditor } from '../../ple-input'
import { InputListOptions } from '../input-list'

@Component({
  selector: 'app-input-list-config-editor',
  templateUrl: 'config-editor.component.html',
  styleUrls: ['config-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigEditorComponent extends BaseConfigEditor<InputListOptions> {
  constructor() {
    super()
  }
}
