import { NgModule, Type } from '@angular/core';

import { IDynamicModule } from '@cisstech/nge/services';

import { BaseModule } from '../../shared/components/base/base.module';

import { PresenterComponent } from './presenter.component';

@NgModule({
  declarations: [PresenterComponent],
  imports: [BaseModule],
  exports: [PresenterComponent],
})
export class PresenterModule implements IDynamicModule {
  component: Type<unknown> = PresenterComponent;
}
