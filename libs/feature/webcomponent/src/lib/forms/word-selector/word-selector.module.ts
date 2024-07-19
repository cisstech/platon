import { NgModule, Type } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { IDynamicModule } from '@cisstech/nge/services'

import { IconGrPipe } from '@cisstech/nge/pipes'
import { BaseModule } from '../../shared/components/base/base.module'
import { WordSelectorComponent } from './word-selector.component'
import { DragDropModule } from '@angular/cdk/drag-drop'

@NgModule({
  declarations: [WordSelectorComponent],
  imports: [
    BaseModule,
    IconGrPipe,

    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,

    DragDropModule,
  ],
  exports: [WordSelectorComponent],
})
export class WordSelectorModule implements IDynamicModule {
  component: Type<unknown> = WordSelectorComponent
}
