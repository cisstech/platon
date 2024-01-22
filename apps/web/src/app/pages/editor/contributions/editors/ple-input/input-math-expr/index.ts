import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Provider } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule],
  exports: [ValueEditorComponent],
  declarations: [ValueEditorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InputMathExprModule {}

export const InputMathExprProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'mathexpr',
    label: 'Expression mathématique',
    defaultValue: () => '',
    canHandle: (input) => input.type === 'mathexpr',
    valueEditor: ValueEditorComponent,
  } as PleInputProvider,
}
