import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { IDynamicModule } from '@cisstech/nge/services';

import { BaseModule } from '../../shared/components/base/base.module';
import { PickerComponent } from './picker.component';
import { IconGrPipeModule } from '@cisstech/nge/pipes';

@NgModule({
  declarations: [PickerComponent],
  imports: [
    BaseModule,
    FormsModule,
    IconGrPipeModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  exports: [PickerComponent],
})
export class PickerModule implements IDynamicModule {
  component: Type<unknown> = PickerComponent;
}
