import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatRadioModule } from '@angular/material/radio';

import { IDynamicModule } from '@cisstech/nge/services';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';

import { BaseModule } from '../../shared/components/base/base.module';

import { RadioGroupComponent } from './radio-group.component';
import { CssPipeModule } from '../../shared/pipes/css.pipe';

@NgModule({
  declarations: [RadioGroupComponent],
  imports: [
    BaseModule,
    CssPipeModule,
    NgeMarkdownModule,

    FormsModule,
    MatRadioModule,
  ],
  exports: [RadioGroupComponent],
})
export class RadioGroupModule implements IDynamicModule {
  component: Type<unknown> = RadioGroupComponent;
}
