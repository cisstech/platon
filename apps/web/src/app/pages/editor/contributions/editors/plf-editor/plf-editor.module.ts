import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IDynamicModule } from '@cisstech/nge/services'
import { UiEditorJsModule } from '@platon/shared/ui'
import { PlfEditorComponent } from './plf-editor.component'
import { FormsModule } from '@angular/forms'

@NgModule({
  imports: [CommonModule, FormsModule, UiEditorJsModule],
  exports: [PlfEditorComponent],
  declarations: [PlfEditorComponent],
})
export class PlfEditorModule implements IDynamicModule {
  component = PlfEditorComponent
}
