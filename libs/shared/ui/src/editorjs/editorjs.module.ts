import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EditorJsViewerComponent } from './editorjs-viewer/editorjs-viewer.component';

import { EditorJsComponent } from './editorjs.component';

@NgModule({
  imports: [CommonModule],
  exports: [EditorJsComponent, EditorJsViewerComponent],
  declarations: [EditorJsComponent, EditorJsViewerComponent],
})
export class UiEditorJsModule { }
