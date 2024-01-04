import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ConfigEditorComponent } from './config-editor/config-editor.component'
import { ValueEditorComponent } from './value-editor/value-editor.component'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSelectModule } from 'ng-zorro-antd/select'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzSelectModule, NgeMonacoModule],
  exports: [ValueEditorComponent, ConfigEditorComponent],
  declarations: [ValueEditorComponent, ConfigEditorComponent],
})
export class InputCodeModule {}

export const InputCodeProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'code',
    label: 'Code',
    defaultValue: () => '',
    defaultOptions: () => ({
      language: 'python',
    }),
    canHandle: (input) => (input.type ? input.type === 'code' : typeof input.value === 'string'),
    valueEditor: ValueEditorComponent,
    configEditor: ConfigEditorComponent,
  } as PleInputProvider,
}
