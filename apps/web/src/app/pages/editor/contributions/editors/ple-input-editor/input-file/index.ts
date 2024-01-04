import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { EditorDirectivesModule } from '@cisstech/nge-ide/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { InputFileValueEditorComponent } from './value-editor/value-editor.component'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

@NgModule({
  imports: [CommonModule, NzButtonModule, NzIconModule, NzToolTipModule, EditorDirectivesModule],
  exports: [InputFileValueEditorComponent],
  declarations: [InputFileValueEditorComponent],
})
export class InputFileModule {}

export const InputFileProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'file',
    label: 'Fichier',
    defaultValue: () => '',
    canHandle: (input) =>
      input.type
        ? input.type === 'file'
        : typeof input.value === 'string' && input.value.match(/@copycontent|@copyurl/g),
    valueEditor: InputFileValueEditorComponent,
  } as PleInputProvider,
}
