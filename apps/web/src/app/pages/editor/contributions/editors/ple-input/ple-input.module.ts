import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzSelectModule } from 'ng-zorro-antd/select'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { InputAutomatonModule } from './input-automaton'
import { InputBooleanModule } from './input-boolean'
import { InputCodeModule } from './input-code'
import { InputFileModule } from './input-file'
import { InputGroupComponent } from './input-group/input-group.component'
import { InputJsonModule } from './input-json'
import { InputListModule } from './input-list'
import { InputMathExprModule } from './input-math-expr'
import { InputNumberModule } from './input-number'
import { InputSelectModule } from './input-select'
import { InputTextModule } from './input-text'
import { PleInputComponent } from './ple-input.component'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatIconModule,
    DragDropModule,

    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzListModule,
    NzButtonModule,
    NzToolTipModule,

    NgeMarkdownModule,

    InputCodeModule,
    InputJsonModule,
    InputTextModule,
    InputFileModule,
    InputNumberModule,
    InputBooleanModule,
    InputSelectModule,
    InputListModule,
    InputMathExprModule,
    InputAutomatonModule,
  ],
  declarations: [PleInputComponent, InputGroupComponent],
  exports: [PleInputComponent, InputGroupComponent],
})
export class PleInputEditorModule {}
