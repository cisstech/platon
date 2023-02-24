import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgeMarkdownModule } from '@cisstech/nge/markdown';
import { IDynamicModule } from '@cisstech/nge/services';
import { DialogModule } from '@platon/core/browser';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CssComponent } from './css.component';

@NgModule({
  imports: [CommonModule, NgeMarkdownModule, DialogModule, NzToolTipModule],
  declarations: [CssComponent],
})
export class CssModule implements IDynamicModule {
  component = CssComponent;
}
