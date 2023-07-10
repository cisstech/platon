import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { PLE_INPUT_PROVIDERS } from '../ple-input'
import { InputBooleanValueEditorComponent } from './value-editor/value-editor.component'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSwitchModule } from 'ng-zorro-antd/switch'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzSwitchModule],
  exports: [InputBooleanValueEditorComponent],
  declarations: [InputBooleanValueEditorComponent],
})
export class InputBooleanModule {}

export const InputBooleanProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'boolean',
    label: 'Boolean',
    valueEditor: InputBooleanValueEditorComponent,
  },
}
