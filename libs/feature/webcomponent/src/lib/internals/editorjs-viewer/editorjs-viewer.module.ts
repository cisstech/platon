import { CommonModule } from '@angular/common'
import { NgModule, Type } from '@angular/core'
import { IDynamicModule } from '@cisstech/nge/services'
import { EditorjsViewerComponent } from './editorjs-viewer.component'

@NgModule({
  imports: [CommonModule],
  declarations: [EditorjsViewerComponent],
  exports: [EditorjsViewerComponent],
})
export class EditorjsViewerModule implements IDynamicModule {
  component: Type<unknown> = EditorjsViewerComponent
}
