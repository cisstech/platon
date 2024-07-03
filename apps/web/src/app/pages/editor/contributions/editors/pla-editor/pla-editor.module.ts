import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { DragDropModule } from '@angular/cdk/drag-drop'

import { IDynamicModule } from '@cisstech/nge/services'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzStepsModule } from 'ng-zorro-antd/steps'
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { MatIconModule } from '@angular/material/icon'
import {
  CircleTreeComponent,
  ResourceFiltersComponent,
  ResourceItemComponent,
  ResourceListComponent,
  ResourcePipesModule,
  ResourceSearchBarComponent,
} from '@platon/feature/resource/browser'
import { PleInputEditorModule } from '../ple-input/ple-input.module'
import { PlaExerciseEditorComponent } from './exercise-editor/exercise-editor.component'
import { PlaEditorComponent } from './pla-editor.component'
import { UiFilterIndicatorComponent, UiSearchBarComponent } from '@platon/shared/ui'
import { ViewportIntersectionDirective } from '@cisstech/nge/directives'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { MatExpansionModule } from '@angular/material/expansion'
import { ExerciseCardComponent } from './exercise-card/exercise-card.component'
import { ExerciseListComponent } from './exercise-list/exercise-list.component'
import { NzModalModule } from 'ng-zorro-antd/modal'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatIconModule,
    DragDropModule,
    MatExpansionModule,

    NzStepsModule,
    NzCollapseModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzStepsModule,
    NzFormModule,
    NzCheckboxModule,
    NzTimePickerModule,
    NzListModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzBreadCrumbModule,
    NzSpinModule,

    ViewportIntersectionDirective,

    ResourceItemComponent,
    ResourceSearchBarComponent,
    ResourcePipesModule,
    ResourceListComponent,
    ResourceFiltersComponent,

    CircleTreeComponent,
    UiSearchBarComponent,
    UiFilterIndicatorComponent,

    ExerciseCardComponent,
    ExerciseListComponent,

    PleInputEditorModule,

    NzModalModule,
  ],
  exports: [PlaEditorComponent],
  declarations: [PlaEditorComponent, PlaExerciseEditorComponent],
})
export class PlfEditorModule implements IDynamicModule {
  component = PlaEditorComponent
}
