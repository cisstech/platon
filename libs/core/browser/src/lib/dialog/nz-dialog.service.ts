import { Injectable, TemplateRef, inject } from '@angular/core'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import {
  ConfirmOptions,
  DialogService,
  LegacyConfirmOptions,
  MessageOptions,
  NotificationContext,
  PromptOptions,
  TemplateOptions,
  toConfirmOptions,
} from './dialog.service'
import { PromptDialogComponent } from './prompt/prompt.component'

const DEFAULT_DIALOG_DURATION = DialogService.DEFAULT_DIALOG_DURATION

type MessageType = 'error' | 'info' | 'success' | 'warning'

/** The dialogs of the current interface, on ng-zorro. */
@Injectable()
export class NzDialogService extends DialogService {
  private readonly nzModalService = inject(NzModalService)
  private readonly nzMessageService = inject(NzMessageService)
  private readonly nzNotificationService = inject(NzNotificationService)

  error(content: string, options: MessageOptions = { duration: DEFAULT_DIALOG_DURATION }) {
    return this.message('error', content, options)
  }

  info(content: string, options: MessageOptions = { duration: DEFAULT_DIALOG_DURATION }) {
    return this.message('info', content, options)
  }

  success(content: string, options: MessageOptions = { duration: DEFAULT_DIALOG_DURATION }) {
    return this.message('success', content, options)
  }

  warning(content: string, options: MessageOptions = { duration: DEFAULT_DIALOG_DURATION }) {
    return this.message('warning', content, options)
  }

  confirm(options: ConfirmOptions | LegacyConfirmOptions): Promise<boolean> {
    const { title, content, okText, cancelText, danger } = toConfirmOptions(options)
    const okType = 'nzOkType' in options ? options.nzOkType : undefined
    return new Promise<boolean>((resolve) => {
      this.nzModalService.confirm({
        nzTitle: title,
        nzContent: content,
        nzOkText: okText,
        nzCancelText: cancelText,
        nzOkDanger: danger,
        ...(okType === 'primary' ? { nzOkType: 'primary' as const } : {}),
        nzOnOk: () => resolve(true),
        nzOnCancel: () => resolve(false),
      })
    })
  }

  notification(
    template: TemplateRef<NotificationContext>,
    options: TemplateOptions = { duration: DEFAULT_DIALOG_DURATION }
  ) {
    if (options.duration == undefined) options.duration = DEFAULT_DIALOG_DURATION
    const ref = this.nzNotificationService.template(template, {
      nzDuration: options?.duration,
      nzData: options?.data as object,
    })
    return () => {
      this.nzNotificationService.remove(ref.messageId)
    }
  }

  async loading(content: string, consumer: () => Promise<void>): Promise<void> {
    const messageId = this.nzMessageService.loading(content, { nzDuration: 0 }).messageId
    try {
      await consumer()
    } finally {
      this.nzMessageService.remove(messageId)
    }
  }

  prompt(input: PromptOptions): Promise<string | undefined> {
    const dialogRef: NzModalRef = this.nzModalService.create({
      nzTitle: input.title,
      nzContent: PromptDialogComponent,
      nzData: {
        value: input.value,
        label: input.label,
        okTitle: input.okTitle,
        noTitle: input.noTitle,
      },
      nzClosable: false,
      nzFooter: null,
    })

    return new Promise<string>((resolve) => {
      const subscription = dialogRef.componentInstance.confirmEvent.subscribe((result: string) => {
        resolve(result)
        dialogRef.close()
      })

      const afterClose = dialogRef.afterClose.subscribe(() => {
        subscription.unsubscribe()
        afterClose.unsubscribe()
      })
    })
  }

  private message(type: MessageType, content: string, options: MessageOptions) {
    if (options.duration == undefined) options.duration = DEFAULT_DIALOG_DURATION
    const ref = options.notification
      ? this.nzNotificationService[type](options.notification.title, content, { nzDuration: options.duration })
      : this.nzMessageService[type](content, { nzDuration: options.duration })
    return () => {
      if (options.notification) {
        this.nzNotificationService.remove(ref.messageId)
      } else {
        this.nzMessageService.remove(ref.messageId)
      }
    }
  }
}
