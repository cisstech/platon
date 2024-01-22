import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { UiEditorJsModule } from '@platon/shared/ui'
import { PleInputEditorModule } from '../ple-input/ple-input.module'
import { PleEditorComponent } from './ple-editor.component'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzListModule } from 'ng-zorro-antd/list'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NzCollapseModule,

    NzFormModule,
    NzListModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,

    UiEditorJsModule,

    PleInputEditorModule,
  ],
  exports: [PleEditorComponent],
  declarations: [PleEditorComponent],
})
export class PlfEditorModule implements IDynamicModule {
  component = PleEditorComponent
}
