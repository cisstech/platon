import { NgModule, Type } from '@angular/core'
import { IDynamicModule } from '@cisstech/nge/services'

import { BaseModule } from '../../shared/components/base/base.module'
import { JsxComponent } from './jsx.component'

@NgModule({
  declarations: [JsxComponent],
  imports: [BaseModule],
  exports: [JsxComponent],
})
export class JsxModule implements IDynamicModule {
  component: Type<unknown> = JsxComponent
}
