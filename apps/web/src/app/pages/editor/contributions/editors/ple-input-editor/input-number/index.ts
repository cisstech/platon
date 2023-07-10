import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { PLE_INPUT_PROVIDERS } from '../ple-input'
import { InputNumberConfigEditorComponent } from './config-editor/config-editor.component'
import { InputNumberValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzInputModule],
  exports: [InputNumberValueEditorComponent, InputNumberConfigEditorComponent],
  declarations: [InputNumberValueEditorComponent, InputNumberConfigEditorComponent],
})
export class InputNumberModule {}

export const InputNumberProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'number',
    label: 'Nombre',
    valueEditor: InputNumberValueEditorComponent,
    configEditor: InputNumberConfigEditorComponent,
  },
}
