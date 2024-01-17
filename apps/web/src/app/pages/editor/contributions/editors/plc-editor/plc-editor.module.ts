import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzListModule } from 'ng-zorro-antd/list'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSwitchModule } from 'ng-zorro-antd/switch'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { PleInputEditorModule } from '../ple-input/ple-input.module'
import { PlcEditorComponent } from './plc-editor.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatIconModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzSwitchModule,
    PleInputEditorModule,
  ],
  exports: [PlcEditorComponent],
  declarations: [PlcEditorComponent],
})
export class PleConfigEditorModule implements IDynamicModule {
  component = PlcEditorComponent
}
