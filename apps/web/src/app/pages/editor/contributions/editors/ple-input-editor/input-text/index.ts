import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { PLE_INPUT_PROVIDERS } from '../ple-input'
import { InputTextValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule, NzInputModule],
  exports: [InputTextValueEditorComponent],
  declarations: [InputTextValueEditorComponent],
})
export class InputTextModule {}

export const InputTextProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'text',
    label: 'Texte',
    valueEditor: InputTextValueEditorComponent,
  },
}
