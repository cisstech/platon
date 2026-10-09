import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  isDevMode,
} from '@angular/core'

/**
 * `primary`: the one main action of a surface. `secondary`: other actions. `ghost`: light actions
 * inside a list or a toolbar. `icon`: an icon alone, which needs a name (`aria-label` or
 * `plTooltip`). `cover`, `cover-quiet` and `cover-icon`: the same on the cover.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'cover' | 'cover-quiet' | 'cover-icon'

/** `sm` and `md` are 36 px high, the smallest target on a desktop; `lg` is 44 px, as on a touch screen. */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** `danger` for an action that destroys or loses something. */
export type ButtonTone = 'default' | 'danger'

/**
 * A button or a link styled as a button. While it works (`loading`), its spinner takes the place of
 * its icon, in front of a label that does not move; it announces itself busy and ignores clicks.
 */
@Component({
  // A component on a native button or link: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[plButton], a[plButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.aria-disabled]': "loading() ? 'true' : null",
  },
  template: `
    @if (loading()) {
    <span class="pl-button__spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styles: `
    :host {
      --pl-icon-size: var(--pl-icon-size-2);
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      gap: var(--pl-space-2);
      block-size: 36px;
      padding: 0 var(--pl-space-4);
      border: 1px solid transparent;
      border-radius: var(--pl-radius-control);
      background: transparent;
      color: inherit;
      font: var(--pl-font-body);
      font-weight: var(--pl-weight-strong);
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background-color var(--pl-duration-hover) var(--pl-ease-standard),
        border-color var(--pl-duration-hover) var(--pl-ease-standard);
    }
    :host([data-size='sm']) {
      padding: 0 var(--pl-space-3);
      font: var(--pl-font-small);
      font-weight: var(--pl-weight-strong);
    }
    :host([data-size='lg']) {
      block-size: 44px;
      font: var(--pl-font-subheading);
    }
    @media (pointer: coarse) {
      :host {
        min-block-size: 44px;
      }
    }

    :host([data-variant='primary']) {
      background: var(--pl-color-primary);
      color: var(--pl-color-on-primary);
    }
    :host([data-variant='primary']:hover) {
      background: var(--pl-color-primary-hover);
    }
    :host([data-variant='primary'][data-tone='danger']) {
      background: var(--pl-color-danger-strong);
      color: var(--pl-color-on-danger);
    }
    :host([data-variant='primary'][data-tone='danger']:hover) {
      background: var(--pl-color-danger-strong-hover);
    }

    :host([data-variant='secondary']) {
      border-color: var(--pl-color-line-strong);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
    }
    :host([data-variant='secondary']:hover) {
      border-color: var(--pl-color-control);
      background: var(--pl-color-surface-muted);
    }
    :host([data-variant='secondary'][data-tone='danger']) {
      border-color: var(--pl-color-danger-line);
      color: var(--pl-color-danger-ink);
    }
    :host([data-variant='secondary'][data-tone='danger']:hover) {
      border-color: var(--pl-color-danger);
      background: var(--pl-color-danger-soft);
    }

    :host([data-variant='ghost']) {
      padding: 0 var(--pl-space-2);
      color: var(--pl-color-primary);
    }
    :host([data-variant='ghost']:hover) {
      background: var(--pl-color-primary-soft);
    }
    :host([data-variant='ghost'][data-tone='danger']) {
      color: var(--pl-color-danger-ink);
    }
    :host([data-variant='ghost'][data-tone='danger']:hover) {
      background: var(--pl-color-danger-soft);
    }

    :host([data-variant='icon']) {
      inline-size: 36px;
      padding: 0;
      color: var(--pl-color-muted);
    }
    :host([data-variant='icon'][data-size='sm']) {
      --pl-icon-size: var(--pl-icon-size-1);
    }
    :host([data-variant='icon'][data-size='lg']) {
      inline-size: 44px;
    }
    :host([data-variant='icon']:hover) {
      background: var(--pl-color-hover);
      color: var(--pl-color-text);
    }

    :host([data-variant='cover']) {
      background: var(--pl-color-cover-primary);
      color: var(--pl-color-cover-primary-text);
    }
    :host([data-variant='cover']:hover) {
      background: var(--pl-color-cover-primary-hover);
    }
    :host([data-variant='cover-quiet']) {
      border-color: var(--pl-color-cover-line);
      color: var(--pl-color-cover-text);
    }
    :host([data-variant='cover-quiet']:hover) {
      background: var(--pl-color-cover-raised);
    }
    :host([data-variant='cover-icon']) {
      inline-size: 36px;
      padding: 0;
      color: var(--pl-color-cover-text);
    }
    :host([data-variant='cover-icon'][data-size='lg']) {
      inline-size: 44px;
    }
    :host([data-variant='cover-icon']:hover) {
      background: var(--pl-color-cover-raised);
    }
    :host([data-variant^='cover']:focus-visible) {
      outline-color: var(--pl-color-cover-primary);
    }

    :host(:disabled),
    :host([aria-disabled='true']:not([aria-busy='true'])) {
      border-color: var(--pl-color-line);
      background: var(--pl-color-surface-muted);
      color: var(--pl-color-subtle);
      cursor: not-allowed;
    }
    :host([aria-busy='true']) {
      cursor: progress;
    }

    /* The projected icon belongs to the page's template: only a deep selector reaches it. */
    :host([aria-busy='true']) ::ng-deep > pl-icon {
      display: none;
    }
    .pl-button__spinner {
      flex: none;
      inline-size: var(--pl-icon-size-1);
      block-size: var(--pl-icon-size-1);
      border: 2px solid currentColor;
      border-block-start-color: transparent;
      border-radius: var(--pl-radius-pill);
      animation: pl-button-spin var(--pl-duration-joy) linear infinite;
    }
    @keyframes pl-button-spin {
      to {
        transform: rotate(1turn);
      }
    }
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary')
  readonly size = input<ButtonSize>('md')
  readonly tone = input<ButtonTone>('default')
  readonly loading = input(false, { transform: booleanAttribute })

  private readonly host: HTMLElement = inject(ElementRef).nativeElement

  constructor() {
    // Capture phase: the handlers of the page, attached to the same element, never see the click.
    const blockWhileLoading = (event: Event) => {
      if (!this.loading()) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    this.host.addEventListener('click', blockWhileLoading, { capture: true })
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', blockWhileLoading, { capture: true }))

    if (isDevMode()) {
      afterNextRender(() => {
        if (
          (this.variant() === 'icon' || this.variant() === 'cover-icon') &&
          !this.host.getAttribute('aria-label') &&
          !this.host.getAttribute('aria-labelledby')
        ) {
          console.error('pl-button: an icon button needs a name, through aria-label or plTooltip.', this.host)
        }
      })
    }
  }
}
