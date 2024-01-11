import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { NgJsonEditorModule } from 'ang-jsoneditor'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [CommonModule, NgJsonEditorModule],
  exports: [ValueEditorComponent],
  declarations: [ValueEditorComponent],
})
export class InputJsonModule {}

export const InputJsonProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'json',
    label: 'JSON',
    defaultValue: () => ({}),
    canHandle: (input) => (input.type ? input.type === 'json' : typeof input.value === 'object'),
    valueEditor: ValueEditorComponent,
  } as PleInputProvider,
}
