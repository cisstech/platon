import { Dialog as CdkDialog, DialogConfig, DialogRef } from '@angular/cdk/dialog'
import { Injectable, TemplateRef, inject } from '@angular/core'
import {
  ConfirmOptions,
  DialogService,
  LegacyConfirmOptions,
  MessageOptions,
  NotificationContext,
  PromptOptions,
  TemplateOptions,
  toConfirmOptions,
} from '@platon/core/browser/shared'
import { DEFAULT_TOAST_DURATION, ToastTone, Toaster } from '@platon/design-system'
import { firstValueFrom } from 'rxjs'
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog'
import { PromptDialog, PromptDialogData } from './prompt-dialog'

const DISMISS_LABEL = 'Fermer'

let lastDialogId = 0

/** `DialogService` of the new interface: toasts at the bottom left, dialogs of the design system. */
@Injectable()
export class NextDialog extends DialogService {
  private readonly toaster = inject(Toaster)
  private readonly dialog = inject(CdkDialog)

  error(content: string, options: MessageOptions = {}): () => void {
    return this.message('danger', content, options)
  }

  info(content: string, options: MessageOptions = {}): () => void {
    return this.message('info', content, options)
  }

  success(content: string, options: MessageOptions = {}): () => void {
    return this.message('success', content, options)
  }

  warning(content: string, options: MessageOptions = {}): () => void {
    return this.message('warning', content, options)
  }

  async confirm(options: ConfirmOptions | LegacyConfirmOptions): Promise<boolean> {
    const data: ConfirmDialogData = { ...toConfirmOptions(options), headingId: this.nextHeadingId() }
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(
      ConfirmDialog,
      this.config<boolean, ConfirmDialogData>(data)
    )
    return (await firstValueFrom(dialogRef.closed)) === true
  }

  notification(template: TemplateRef<NotificationContext>, options: TemplateOptions = {}): () => void {
    const toast = this.toaster.show({
      template,
      data: options.data,
      duration: options.duration ?? DEFAULT_TOAST_DURATION,
      dismissLabel: DISMISS_LABEL,
    })
    return () => toast.dismiss()
  }

  async loading(content: string, consumer: () => Promise<void>): Promise<void> {
    const toast = this.toaster.show({ tone: 'loading', message: content, duration: 0 })
    try {
      await consumer()
    } finally {
      toast.dismiss()
    }
  }

  async prompt(input: PromptOptions): Promise<string | undefined> {
    const data: PromptDialogData = { ...input, headingId: this.nextHeadingId() }
    const dialogRef = this.dialog.open<string | undefined, PromptDialogData>(
      PromptDialog,
      this.config<string | undefined, PromptDialogData>(data)
    )
    return (await firstValueFrom(dialogRef.closed)) || undefined
  }

  private message(tone: ToastTone, content: string, options: MessageOptions): () => void {
    const toast = this.toaster.show({
      tone,
      title: options.notification?.title,
      message: content,
      duration: options.duration ?? DEFAULT_TOAST_DURATION,
      dismissLabel: DISMISS_LABEL,
    })
    return () => toast.dismiss()
  }

  private config<R, D extends { headingId: string }>(data: D): DialogConfig<D, DialogRef<R>> {
    return { data, ariaLabelledBy: data.headingId, backdropClass: 'pl-scrim', restoreFocus: true }
  }

  private nextHeadingId(): string {
    return `app-dialog-title-${++lastDialogId}`
  }
}
