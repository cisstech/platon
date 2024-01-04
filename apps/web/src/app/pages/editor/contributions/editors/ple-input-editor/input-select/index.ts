import { CommonModule } from '@angular/common'
import { NgModule, Provider } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { UiTagListComponent } from '@platon/shared/ui'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ConfigEditorComponent } from './config-editor/config-editor.component'
import { ValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzCheckboxModule,
    NzSelectModule,
    NzInputModule,
    UiTagListComponent,
  ],
  exports: [ValueEditorComponent, ConfigEditorComponent],
  declarations: [ValueEditorComponent, ConfigEditorComponent],
})
export class InputSelectModule {}

export const InputSelectProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'select',
    label: 'Select',
    defaultValue: () => undefined,
    canHandle: (input) => input.type === 'select',
    valueEditor: ValueEditorComponent,
    configEditor: ConfigEditorComponent,
  } as PleInputProvider,
}
