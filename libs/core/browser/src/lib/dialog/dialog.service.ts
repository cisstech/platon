import { Injectable, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PromptDialogComponent } from './prompt/prompt.component';


interface MessageOptions {
  duration?: number;
  notification?: {
    title: string
  },
}

interface TemplateOptions<T = unknown> {
  duration?: number;
  data?: T;
}


@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(
    private readonly nzModalService: NzModalService,
    private readonly nzMessageService: NzMessageService,
    private readonly nzNotificationService: NzNotificationService,
  ) { }
  
  public static readonly DEFAULT_DIALOG_DURATION : number = 4.5;

  error(content: string, options: MessageOptions = { duration: DialogService.DEFAULT_DIALOG_DURATION }) {
    if (options.duration == null) options.duration = DialogService.DEFAULT_DIALOG_DURATION;
    const ref = options?.notification
      ? this.nzNotificationService.error(options.notification.title, content, { nzDuration: options?.duration })
      : this.nzMessageService.error(content, { nzDuration: options?.duration });
    return () => {
      options?.notification ? this.nzNotificationService.remove(ref.messageId)
        : this.nzMessageService.remove(ref.messageId);
    };
  }

  info(content: string,  options: MessageOptions = { duration: DialogService.DEFAULT_DIALOG_DURATION }) {
    if (options.duration == null) options.duration = DialogService.DEFAULT_DIALOG_DURATION;
    const ref = options?.notification
      ? this.nzNotificationService.info(options.notification.title, content, { nzDuration: options?.duration })
      : this.nzMessageService.info(content, { nzDuration: options?.duration });
    return () => {
      options?.notification ? this.nzNotificationService.remove(ref.messageId)
        : this.nzMessageService.remove(ref.messageId);
    };
  }

  success(content: string, options: MessageOptions = { duration: DialogService.DEFAULT_DIALOG_DURATION }) {
    if (options.duration == null) options.duration = DialogService.DEFAULT_DIALOG_DURATION;
    const ref = options?.notification
      ? this.nzNotificationService.success(options.notification.title, content, { nzDuration: options?.duration })
      : this.nzMessageService.success(content, { nzDuration: options?.duration });
    return () => {
      options?.notification ? this.nzNotificationService.remove(ref.messageId)
        : this.nzMessageService.remove(ref.messageId);
    };
  }

  warning(content: string,  options: MessageOptions = { duration: DialogService.DEFAULT_DIALOG_DURATION }) {
    if (options.duration == null) options.duration = DialogService.DEFAULT_DIALOG_DURATION;
    const ref = options?.notification
      ? this.nzNotificationService.warning(options.notification.title, content, { nzDuration: options?.duration })
      : this.nzMessageService.warning(content, { nzDuration: options?.duration });
    return () => {
      options?.notification ? this.nzNotificationService.remove(ref.messageId)
        : this.nzMessageService.remove(ref.messageId);
    };
  }

  notification(template: TemplateRef<object>, options: TemplateOptions = { duration: DialogService.DEFAULT_DIALOG_DURATION }) {
    if (options.duration == null) options.duration = DialogService.DEFAULT_DIALOG_DURATION
    const ref = this.nzNotificationService.template(template, {
      nzDuration: options?.duration,
      nzData: options?.data as object
    });
    return () => {
      this.nzNotificationService.remove(ref.messageId);
    };
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
    const dialogRef: NzModalRef = this.nzModalService.create({
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
