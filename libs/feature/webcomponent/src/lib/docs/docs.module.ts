import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocsComponent } from './docs.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MatButtonModule } from '@angular/material/button';
import { IDynamicModule } from '@cisstech/nge/services';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    NzToolTipModule,
    NgeMarkdownModule,
    NgJsonEditorModule,
  ],
  declarations: [DocsComponent, ShowcaseComponent],
})
export class DocsModule implements IDynamicModule {
  component = DocsComponent;
}
