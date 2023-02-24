import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IDynamicModule } from '@cisstech/nge/services';
import { UiEditorJsModule } from '@platon/shared/ui';
import { PLFormEditorComponent } from './pl-form-editor.component';

@NgModule({
  imports: [
    CommonModule,
    UiEditorJsModule,
  ],
  exports: [PLFormEditorComponent],
  declarations: [PLFormEditorComponent]
})
export class PLFormEditorModule implements IDynamicModule {
  component = PLFormEditorComponent;
}
