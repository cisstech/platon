import { TemplateRef } from '@angular/core'

export interface MessageOptions {
  /** Milliseconds before the message goes away; `0` keeps it until it is closed. */
  duration?: number
  notification?: {
    title: string
  }
}

export interface TemplateOptions<T = unknown> {
  duration?: number
  data?: T
}

/**
 * What a notification template receives: a handle on the notification, whose type depends on the
 * implementation, and the data passed with it.
 */
export interface NotificationContext<T = any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $implicit: any
  data: T
}

export interface ConfirmOptions {
  title: string
  /** Text of the question. Simple HTML (`<br>`, `<i>`) is rendered, through Angular sanitization. */
  content?: string
  okText?: string
  cancelText?: string
  /** The confirmation destroys or loses something. */
  danger?: boolean
}

/** The ng-zorro keys still used by existing calls, accepted until they are rewritten. */
export interface LegacyConfirmOptions {
  nzTitle?: string
  nzContent?: string
  nzOkText?: string | null
  nzCancelText?: string | null
  nzOkDanger?: boolean
  nzOkType?: string
}

export interface PromptOptions {
  title: string
  value?: string
  label?: string
  okTitle?: string
  noTitle?: string
}

/** Neutral confirm options, whichever form the caller used. */
export const toConfirmOptions = (options: ConfirmOptions | LegacyConfirmOptions): ConfirmOptions => {
  if ('title' in options) return options
  return {
    title: options.nzTitle ?? '',
    content: options.nzContent,
    okText: options.nzOkText ?? undefined,
    cancelText: options.nzCancelText ?? undefined,
    danger: options.nzOkDanger,
  }
}

/**
 * Messages, confirmations and prompts shown to the person. Each interface binds its own
 * implementation: ng-zorro in the current one, the design system in the new one.
 */
export abstract class DialogService {
  public static readonly DEFAULT_DIALOG_DURATION: number = 4500

  /** Each message method returns a function that closes the message. */
  abstract error(content: string, options?: MessageOptions): () => void
  abstract info(content: string, options?: MessageOptions): () => void
  abstract success(content: string, options?: MessageOptions): () => void
  abstract warning(content: string, options?: MessageOptions): () => void

  /** Resolves `true` when confirmed, `false` when cancelled or dismissed. */
  abstract confirm(options: ConfirmOptions | LegacyConfirmOptions): Promise<boolean>

  abstract notification(template: TemplateRef<NotificationContext>, options?: TemplateOptions): () => void

  /** Shows `content` while `consumer` runs. */
  abstract loading(content: string, consumer: () => Promise<void>): Promise<void>

  /** Resolves the entered value, or `undefined` when cancelled. */
  abstract prompt(input: PromptOptions): Promise<string | undefined>
}
