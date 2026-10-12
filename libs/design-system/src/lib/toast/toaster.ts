import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DOCUMENT } from '@angular/common'
import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  TemplateRef,
  createComponent,
  inject,
  signal,
} from '@angular/core'
import { IconName } from '../icon/icon-names'
import { ToastTone } from './toast'
import { ToastStack } from './toast-stack/toast-stack'

export const DEFAULT_TOAST_DURATION = 4000

/** Accessible name of the region that holds the toasts. */
export const TOAST_REGION_LABEL = new InjectionToken<string>('TOAST_REGION_LABEL', {
  factory: () => 'Notifications',
})

/**
 * Where the page starts, as a CSS length: the toasts sit at its bottom left, off the frame of the
 * application (a cover on the left gives its width).
 */
export const TOAST_INSET_START = new InjectionToken<string>('TOAST_INSET_START', {
  factory: () => '0px',
})

export interface ToastRef {
  dismiss(): void
}

export interface ToastContext<T = unknown> {
  $implicit: ToastRef
  data: T
}

/** The one action a toast may carry, such as « Annuler » after a deletion. */
export interface ToastAction {
  label: string
  icon?: IconName
  run: () => void
}

export interface ToastOptions<T = unknown> {
  tone?: ToastTone
  title?: string
  message?: string
  /** Rendered in the toast with a `ToastContext`. */
  template?: TemplateRef<ToastContext<T>>
  data?: T
  /**
   * Milliseconds before the toast goes away; `0` keeps it until it is closed. Without a value, a toast
   * that only confirms goes away after 4 s, and a toast with an action stays until it is closed.
   */
  duration?: number
  action?: ToastAction
  /** Accessible name of the close button; without it, the toast has no close button. */
  dismissLabel?: string
}

/** What holds the timers: the pointer over the stack, or the focus inside it. */
export type ToastHold = 'pointer' | 'focus'

export interface ToastEntry {
  id: number
  options: ToastOptions
  context: ToastContext
  ref: ToastRef
}

/**
 * Shows toasts in a stack at the bottom left of the page. A toast is announced to screen readers,
 * errors assertively; the timers pause while the pointer or the focus is on the stack.
 */
@Injectable({ providedIn: 'root' })
export class Toaster {
  private readonly appRef = inject(ApplicationRef)
  private readonly injector = inject(EnvironmentInjector)
  private readonly announcer = inject(LiveAnnouncer)
  private readonly document = inject(DOCUMENT)
  private readonly entries = signal<ToastEntry[]>([])
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>()
  private readonly holds = new Set<ToastHold>()
  private mounted = false
  private lastId = 0

  readonly toasts = this.entries.asReadonly()

  show<T>(options: ToastOptions<T>): ToastRef {
    this.mount()
    const id = ++this.lastId
    const ref: ToastRef = { dismiss: () => this.dismiss(id) }
    const entry: ToastEntry = {
      id,
      options: options as ToastOptions,
      ref,
      context: { $implicit: ref, data: options.data },
    }
    this.entries.update((entries) => [...entries, entry])

    const text = [options.title, options.message].filter(Boolean).join('. ')
    if (text) void this.announcer.announce(text, options.tone === 'danger' ? 'assertive' : 'polite')
    if (this.holds.size === 0) this.startTimer(entry)
    return ref
  }

  dismiss(id: number): void {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
    this.entries.update((entries) => entries.filter((entry) => entry.id !== id))
  }

  /**
   * Holds the timers while the person reads (pointer) or reaches (focus) a toast. Released by every
   * reason, the timers restart with their full duration.
   */
  hold(reason: ToastHold, held: boolean): void {
    if (held) this.holds.add(reason)
    else this.holds.delete(reason)
    if (this.holds.size > 0) {
      this.timers.forEach((timer) => clearTimeout(timer))
      this.timers.clear()
    } else {
      this.entries().forEach((entry) => this.startTimer(entry))
    }
  }

  private startTimer(entry: ToastEntry): void {
    const duration = entry.options.duration ?? (entry.options.action ? 0 : DEFAULT_TOAST_DURATION)
    if (duration > 0 && !this.timers.has(entry.id)) {
      this.timers.set(
        entry.id,
        setTimeout(() => this.dismiss(entry.id), duration)
      )
    }
  }

  private mount(): void {
    if (this.mounted) return
    this.mounted = true
    const stack = createComponent(ToastStack, { environmentInjector: this.injector })
    this.document.body.appendChild(stack.location.nativeElement)
    this.appRef.attachView(stack.hostView)
  }
}
