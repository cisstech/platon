import { NgModule, Type } from '@angular/core'

import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { IDynamicModule } from '@cisstech/nge/services'

import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { BaseModule } from '../../shared/components/base/base.module'
import { CodeEditorComponent } from './code-editor.component'

@NgModule({
  declarations: [CodeEditorComponent],
  imports: [BaseModule, NzToolTipModule, NgeMonacoModule],
  exports: [CodeEditorComponent],
})
export class CodeEditorModule implements IDynamicModule {
  component: Type<unknown> = CodeEditorComponent
}
