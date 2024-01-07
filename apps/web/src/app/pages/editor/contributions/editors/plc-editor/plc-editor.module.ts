import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzListModule } from 'ng-zorro-antd/list'

import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatIconModule } from '@angular/material/icon'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { PleInputEditorModule } from '../ple-input/ple-input.module'
import { PlcEditorComponent } from './plc-editor.component'

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    MatIconModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    PleInputEditorModule,
  ],
  exports: [PlcEditorComponent],
  declarations: [PlcEditorComponent],
})
export class PleConfigEditorModule implements IDynamicModule {
  component = PlcEditorComponent
}