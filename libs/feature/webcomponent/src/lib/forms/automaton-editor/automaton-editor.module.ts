import { NgModule, Type } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IDynamicModule } from '@cisstech/nge/services';
import { DialogModule } from '@platon/core/browser';

import { BaseModule } from '../../shared/components/base/base.module';

import { AutomatonEditorComponent } from './automaton-editor.component';

@NgModule({
  declarations: [AutomatonEditorComponent],
  imports: [
    BaseModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DialogModule,
  ],
  exports: [AutomatonEditorComponent],
})
export class AutomatonEditorModule implements IDynamicModule {
  component: Type<unknown> = AutomatonEditorComponent;
}
