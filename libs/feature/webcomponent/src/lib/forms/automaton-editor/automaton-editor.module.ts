import { NgModule, Type } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'

import { BaseModule } from '../../shared/components/base/base.module'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { AutomatonEditorComponent } from './automaton-editor.component'
import { DialogModule } from '@platon/core/browser'

@NgModule({
  declarations: [AutomatonEditorComponent],
  imports: [BaseModule, DialogModule, NzIconModule, NzButtonModule],
  exports: [AutomatonEditorComponent],
})
export class AutomatonEditorModule implements IDynamicModule {
  component: Type<unknown> = AutomatonEditorComponent
}
