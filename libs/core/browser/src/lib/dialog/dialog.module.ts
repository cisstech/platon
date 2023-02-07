import { NzMessageModule } from 'ng-zorro-antd/message';

import { NgModule } from '@angular/core';
import { DialogService } from './dialog.service';


@NgModule({
  imports: [NzMessageModule],
  exports: [NzMessageModule],
  providers: [DialogService]
})
export class DialogModule { }
