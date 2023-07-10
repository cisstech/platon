import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzSelectModule } from 'ng-zorro-antd/select'

import { CommonModule } from '@angular/common'
import { InputBooleanModule } from './input-boolean'
import { InputCodeModule } from './input-code'
import { InputJsonModule } from './input-json'
import { InputNumberModule } from './input-number'
import { InputTextModule } from './input-text'
import { PleInputComponent } from './ple-input.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzListModule,
    NzButtonModule,

    InputCodeModule,
    InputJsonModule,
    InputTextModule,
    InputNumberModule,
    InputBooleanModule,
  ],
  declarations: [PleInputComponent],
  exports: [PleInputComponent],
})
export class PleInputEditorModule {}
