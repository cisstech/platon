import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DocsComponent } from './docs.component'
import { ShowcaseComponent } from './showcase/showcase.component'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { NgJsonEditorModule } from 'ang-jsoneditor'
import { MatButtonModule } from '@angular/material/button'
import { IDynamicModule } from '@cisstech/nge/services'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { SpecialTypeComponent } from './special-type/special-type.component'
import { ApiDisplayComponent } from './api-display/api-display.component'

@NgModule({
  imports: [CommonModule, MatButtonModule, NzToolTipModule, NzPopoverModule, NgeMarkdownModule, NgJsonEditorModule],
  declarations: [DocsComponent, ShowcaseComponent, SpecialTypeComponent, ApiDisplayComponent],
})
export class DocsModule implements IDynamicModule {
  component = DocsComponent
}
