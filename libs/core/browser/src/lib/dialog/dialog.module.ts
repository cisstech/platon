import { NgModule } from '@angular/core'

import { NzMessageService } from 'ng-zorro-antd/message'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { DialogService } from './dialog.service'
import { NzDialogService } from './nz-dialog.service'
import { PromptDialogComponent } from './prompt/prompt.component'

@NgModule({
  imports: [NzModalModule, PromptDialogComponent],
  exports: [NzModalModule],
  providers: [{ provide: DialogService, useClass: NzDialogService }, NzMessageService],
})
export class DialogModule {}
