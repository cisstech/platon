import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IDynamicModule } from '@cisstech/nge/services'

import { UiFilePreviewComponent } from '@platon/shared/ui'
import { PdfEditorComponent } from './pdf-editor.component'

@NgModule({
  imports: [CommonModule, UiFilePreviewComponent],
  exports: [PdfEditorComponent],
  declarations: [PdfEditorComponent],
})
export class PdfEditorModule implements IDynamicModule {
  component = PdfEditorComponent
}
