import { NgModule, Type } from '@angular/core';
import { IDynamicModule } from '@cisstech/nge/services';
import { BaseModule } from '../../shared/components/base/base.module';
import { PresenterComponent } from './presenter.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [PresenterComponent],
  imports: [
    BaseModule,
    NzButtonModule,
    NzIconModule
  ],
  exports: [PresenterComponent],
})
export class PresenterModule implements IDynamicModule {
  component: Type<unknown> = PresenterComponent;
}
