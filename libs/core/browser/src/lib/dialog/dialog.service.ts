import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private readonly nzMessageService: NzMessageService
  ) { }


  error(content: string) {
    this.nzMessageService.error(content);
  }

  info(content: string) {
    this.nzMessageService.info(content);
  }

  success(content: string) {
    this.nzMessageService.success(content);
  }

  warning(content: string) {
    this.nzMessageService.warning(content);
  }

  async loading(content: string, consumer: () => Promise<void>): Promise<void> {
    const messageId = this.nzMessageService.loading(
      content, { nzDuration: 0 }
    ).messageId;
    try {
      await consumer();
    } finally {
      this.nzMessageService.remove(messageId);
    }
  }

}
