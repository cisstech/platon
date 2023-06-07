import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PromptDialogComponent } from './prompt/prompt.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private modal: NzModalService,
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


  prompt(input: {
    title: string,
    value?: string
    label?: string
    okTitle?: string
    noTitle?: string
  }): Promise<string | undefined> {
    const dialogRef: NzModalRef = this.modal.create({
      nzTitle: input.title,
      nzContent: PromptDialogComponent,
      nzComponentParams: {
        value: input.value,
        label: input.label,
        okTitle: input.okTitle,
        noTitle: input.noTitle
      },
      nzClosable: false,
      nzFooter: null
    });

    return new Promise<string>((resolve) => {
      const subscription = dialogRef.componentInstance.confirmEvent.subscribe((result: string) => {
        resolve(result);
        dialogRef.close();
      });

      const afterClose = dialogRef.afterClose.subscribe(() => {
        console.log('CLOSE')
        subscription.unsubscribe();
        afterClose.unsubscribe();
      });
    })
  }
}
