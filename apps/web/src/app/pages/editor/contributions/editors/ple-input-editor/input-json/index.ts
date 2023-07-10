import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { PLE_INPUT_PROVIDERS } from '../ple-input'
import { InputJsonValueEditorComponent } from './value-editor/value-editor.component'
import { NgJsonEditorModule } from 'ang-jsoneditor'

@NgModule({
  imports: [CommonModule, NgJsonEditorModule],
  exports: [InputJsonValueEditorComponent],
  declarations: [InputJsonValueEditorComponent],
})
export class InputJsonModule {}

export const InputJsonProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'json',
    label: 'JSON',
    valueEditor: InputJsonValueEditorComponent,
  },
}
