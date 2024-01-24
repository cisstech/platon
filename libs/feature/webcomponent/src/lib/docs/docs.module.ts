import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { IDynamicModule } from '@cisstech/nge/services'
import { NgJsonEditorModule } from 'ang-jsoneditor'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { DocsComponent } from './docs.component'
import { JSONSchemaExpandablePipe } from './pipes/json-schema-expandable.pipe'
import { JSONSchemaTypeNamePipe } from './pipes/json-schema-type-name.pipe'
import { PropertiesComponent } from './properties/properties.component'
import { ShowcaseComponent } from './showcase/showcase.component'

@NgModule({
  imports: [CommonModule, MatButtonModule, NzToolTipModule, NgeMarkdownModule, NgJsonEditorModule],
  declarations: [
    DocsComponent,
    JSONSchemaExpandablePipe,
    JSONSchemaTypeNamePipe,
    PropertiesComponent,
    ShowcaseComponent,
  ],
})
export class DocsModule implements IDynamicModule {
  component = DocsComponent
}
