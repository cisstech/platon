import { NgModule, Type } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { OverlayModule } from '@angular/cdk/overlay'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { IDynamicModule } from '@cisstech/nge/services'

import { BaseModule } from '../../shared/components/base/base.module'

import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CssPipeModule } from '../../shared/pipes/css.pipe'
import { MatrixResizerComponent } from './matrix-resizer/matrix-resizer.component'
import { MatrixComponent } from './matrix.component'

@NgModule({
  declarations: [MatrixComponent, MatrixResizerComponent],
  imports: [BaseModule, CssPipeModule, FormsModule, OverlayModule, MatIconModule, NzToolTipModule, MatButtonModule],
  exports: [MatrixComponent],
})
export class MatrixModule implements IDynamicModule {
  component: Type<unknown> = MatrixComponent
}
