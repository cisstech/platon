import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BaseConfigEditor } from '../../ple-input'
import { InputCodeOptions } from '../input-code'

@Component({
  selector: 'app-input-code-config-editor',
  templateUrl: 'config-editor.component.html',
  styleUrls: ['config-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigEditorComponent extends BaseConfigEditor<InputCodeOptions> {
  readonly languages = monaco.languages.getLanguages()
  constructor() {
    super()
  }
}
