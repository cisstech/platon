import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { IDynamicModule } from '@cisstech/nge/services'

import { IconGrPipe } from '@cisstech/nge/pipes'
import { BaseModule } from '../../shared/components/base/base.module'
import { InputBoxComponent } from './input-box.component'
import { MatIconModule } from '@angular/material/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'

@NgModule({
  declarations: [InputBoxComponent],
  imports: [
    BaseModule,
    IconGrPipe,

    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,

    NzPopoverModule,
  ],
  exports: [InputBoxComponent],
})
export class InputBoxModule implements IDynamicModule {
  component: Type<unknown> = InputBoxComponent
}
