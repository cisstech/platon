import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ValueEditorComponent } from './value-editor/value-editor.component'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSwitchModule } from 'ng-zorro-antd/switch'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzSwitchModule],
  exports: [ValueEditorComponent],
  declarations: [ValueEditorComponent],
})
export class InputBooleanModule {}

export const InputBooleanProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'boolean',
    label: 'Boolean',
    defaultValue: () => false,
    canHandle: (input) => (input.type ? input.type === 'boolean' : typeof input.value === 'boolean'),
    valueEditor: ValueEditorComponent,
  } as PleInputProvider,
}
