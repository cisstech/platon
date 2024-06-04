import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'

import { UiFilePreviewComponent } from '@platon/shared/ui'
import { ZipEditorComponent } from './zip-editor.component'
import { NzTreeModule } from 'ng-zorro-antd/tree'
import { NzIconModule } from 'ng-zorro-antd/icon'

@NgModule({
  imports: [CommonModule, UiFilePreviewComponent, NzTreeModule, NzIconModule],
  exports: [ZipEditorComponent],
  declarations: [ZipEditorComponent],
})
export class ZipEditorModule implements IDynamicModule {
  component = ZipEditorComponent
}
