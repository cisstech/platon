import { ChangeDetectionStrategy, Component } from '@angular/core'
import { AutomatonEditorState } from '@platon/feature/webcomponent'
import { BaseValueEditor } from '../../ple-input'

@Component({
  selector: 'app-input-automaton-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<AutomatonEditorState['automaton']> {
  constructor() {
    super()
  }
}
