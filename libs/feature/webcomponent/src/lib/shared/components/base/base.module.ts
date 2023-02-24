import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgeMonacoModule } from '@cisstech/nge/monaco';
import { BaseComponent } from './base.component';

@NgModule({
  imports: [CommonModule, NgeMonacoModule],
  exports: [CommonModule, BaseComponent],
  declarations: [BaseComponent],
})
export class BaseModule {}
