import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Provider } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { emptyAutomaton } from '@platon/feature/webcomponent'
import { NzFormModule } from 'ng-zorro-antd/form'
import { PLE_INPUT_PROVIDERS, PleInputProvider } from '../ple-input'
import { ValueEditorComponent } from './value-editor/value-editor.component'

@NgModule({
  imports: [CommonModule, FormsModule, NzFormModule],
  exports: [ValueEditorComponent],
  declarations: [ValueEditorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InputAutomatonModule {}

export const InputAutomatonProvider: Provider = {
  provide: PLE_INPUT_PROVIDERS,
  multi: true,
  useValue: {
    type: 'automaton',
    label: 'Automate',
    defaultValue: () => emptyAutomaton(),
    canHandle: (input) => input.type === 'automaton',
    valueEditor: ValueEditorComponent,
  } as PleInputProvider,
}
