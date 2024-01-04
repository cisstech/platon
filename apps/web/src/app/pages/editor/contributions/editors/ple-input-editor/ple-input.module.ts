import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzSelectModule } from 'ng-zorro-antd/select'

import { CommonModule } from '@angular/common'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { InputBooleanModule } from './input-boolean'
import { InputCodeModule } from './input-code'
import { InputFileModule } from './input-file'
import { InputGroupComponent } from './input-group/input-group.component'
import { InputJsonModule } from './input-json'
import { InputListModule } from './input-list'
import { InputNumberModule } from './input-number'
import { InputSelectModule } from './input-select'
import { InputTextModule } from './input-text'
import { PleInputComponent } from './ple-input.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzListModule,
    NzButtonModule,

    InputCodeModule,
    InputJsonModule,
    InputTextModule,
    InputFileModule,
    InputNumberModule,
    InputBooleanModule,
    InputSelectModule,
    InputListModule,
  ],
  declarations: [PleInputComponent, InputGroupComponent],
  exports: [PleInputComponent, InputGroupComponent],
})
export class PleInputEditorModule {}
