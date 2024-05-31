import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'

import { UiFilePreviewComponent } from '@platon/shared/ui'
import { ZipEditorComponent } from './zip-editor.component'

@NgModule({
  imports: [CommonModule, UiFilePreviewComponent],
  exports: [ZipEditorComponent],
  declarations: [ZipEditorComponent],
})
export class ZipEditorModule implements IDynamicModule {
  component = ZipEditorComponent
}
