import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { NgJsonEditorModule } from 'ang-jsoneditor'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { ShowcaseComponent } from './showcase/showcase.component'

@NgModule({
  imports: [CommonModule, MatButtonModule, NzToolTipModule, NgeMarkdownModule, NgJsonEditorModule],
  declarations: [ShowcaseComponent],
  exports: [ShowcaseComponent],
})
export class DocsModule {}
