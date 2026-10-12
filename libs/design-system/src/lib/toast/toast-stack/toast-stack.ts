import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  untracked,
} from '@angular/core'
import { Toast } from '../toast'
import { TOAST_INSET_START, TOAST_REGION_LABEL, ToastEntry, ToastRef, Toaster } from '../toaster'

@Component({
  selector: 'pl-toast-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toast],
  host: {
    role: 'region',
    popover: 'manual',
    '[attr.aria-label]': 'label',
    '[style.--pl-toast-inset-start]': 'insetStart',
    '(mouseenter)': "toaster.hold('pointer', true)",
    '(mouseleave)': "toaster.hold('pointer', false)",
    '(focusin)': "toaster.hold('focus', true)",
    '(focusout)': 'focusLeft($event)',
  },
  templateUrl: './toast-stack.html',
  styleUrl: './toast-stack.scss',
})
export class ToastStack {
  protected readonly toaster = inject(Toaster)
  protected readonly label = inject(TOAST_REGION_LABEL)
  protected readonly insetStart = inject(TOAST_INSET_START)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement
  private readonly injector = inject(Injector)

  constructor() {
    effect(() => {
      const shown = this.toaster.toasts().length > 0
      untracked(() => this.raise(shown))
    })
  }

  /**
   * Shows the stack again on each change: dialogs sit in the top layer, which ranks by the order
   * things show, not by `z-index`, and a toast raised from a dialog must not hide under it.
   */
  private raise(shown: boolean): void {
    const host = this.host as HTMLElement & { showPopover?: () => void; hidePopover?: () => void }
    if (!host.showPopover || !host.hidePopover) return
    if (host.matches(':popover-open')) host.hidePopover()
    if (shown) host.showPopover()
  }

  protected focusLeft(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.toaster.hold('focus', false)
  }

  /** Runs the toast's action, then closes it. */
  protected act(entry: ToastEntry): void {
    entry.options.action?.run()
    this.close(entry.ref)
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
