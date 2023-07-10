import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { PLE_INPUT_PROVIDERS } from '../ple-input'
import { InputCodeConfigEditorComponent } from './config-editor/config-editor.component'
import { InputCodeValueEditorComponent } from './value-editor/value-editor.component'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSelectModule } from 'ng-zorro-antd/select'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzSelectModule, NgeMonacoModule],
  exports: [InputCodeValueEditorComponent, InputCodeConfigEditorComponent],
  declarations: [InputCodeValueEditorComponent, InputCodeConfigEditorComponent],
})
export class InputCodeModule {}

export const InputCodeProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'code',
    label: 'Code',
    valueEditor: InputCodeValueEditorComponent,
    configEditor: InputCodeConfigEditorComponent,
  },
}
