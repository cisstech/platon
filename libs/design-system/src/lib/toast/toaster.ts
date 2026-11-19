import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DOCUMENT } from '@angular/common'
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  TemplateRef,
  afterNextRender,
  createComponent,
  inject,
  signal,
} from '@angular/core'
import { Toast, ToastTone } from './toast'

export const DEFAULT_TOAST_DURATION = 4000

/** Accessible name of the region that holds the toasts. */
export const TOAST_REGION_LABEL = new InjectionToken<string>('TOAST_REGION_LABEL', {
  factory: () => 'Notifications',
})

export interface ToastRef {
  dismiss(): void
}

export interface ToastContext<T = unknown> {
  $implicit: ToastRef
  data: T
}

export interface ToastOptions<T = unknown> {
  tone?: ToastTone
  title?: string
  message?: string
  /** Rendered in the toast with a `ToastContext`. */
  template?: TemplateRef<ToastContext<T>>
  data?: T
  /** Milliseconds before the toast goes away; `0` keeps it until it is closed. */
  duration?: number
  /** Accessible name of the close button; without it, the toast has no close button. */
  dismissLabel?: string
}

/** What holds the timers: the pointer over the stack, or the focus inside it. */
export type ToastHold = 'pointer' | 'focus'

interface ToastEntry {
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
    const duration = entry.options.duration ?? DEFAULT_TOAST_DURATION
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

@Component({
  selector: 'pl-toast-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toast],
  host: {
    role: 'region',
    '[attr.aria-label]': 'label',
    '(mouseenter)': "toaster.hold('pointer', true)",
    '(mouseleave)': "toaster.hold('pointer', false)",
    '(focusin)': "toaster.hold('focus', true)",
    '(focusout)': 'focusLeft($event)',
  },
  template: `
    @for (entry of toaster.toasts(); track entry.id) {
    <pl-toast
      [tone]="entry.options.tone ?? 'info'"
      [title]="entry.options.title"
      [message]="entry.options.message"
      [template]="entry.options.template"
      [context]="entry.context"
      [dismissLabel]="entry.options.dismissLabel"
      (dismissed)="close(entry.ref)"
    />
    }
  `,
  styles: `
    :host {
      position: fixed;
      inset-block-end: var(--pl-space-4);
      inset-inline-start: var(--pl-space-4);
      z-index: var(--pl-layer-toast);
      display: flex;
      flex-direction: column;
      gap: var(--pl-space-2);
      max-inline-size: calc(100vw - 2 * var(--pl-space-4));
    }
  `,
})
export class ToastStack {
  protected readonly toaster = inject(Toaster)
  protected readonly label = inject(TOAST_REGION_LABEL)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement
  private readonly injector = inject(Injector)

  protected focusLeft(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.toaster.hold('focus', false)
  }

  /**
   * Closes a toast from its button. Browsers fire no `focusout` when the focused button goes away, so
   * the focus moves to the next close button, or the focus hold is released.
   */
  protected close(toast: ToastRef): void {
    const hadFocus = this.host.contains(this.host.ownerDocument.activeElement)
    toast.dismiss()
    if (!hadFocus) return
    afterNextRender(
      () => {
        const next = this.host.querySelector<HTMLElement>('.pl-toast__dismiss')
        if (next) next.focus()
        else this.toaster.hold('focus', false)
      },
      { injector: this.injector }
    )
  }
}
