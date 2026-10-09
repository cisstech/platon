import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/** How far the sheet must be pulled down, in pixels, to close. */
export const SHEET_DISMISS_DISTANCE = 80

/**
 * A panel that rises from the bottom of a narrow screen, inside a dialog of the CDK. Pulled down by
 * its handle beyond `SHEET_DISMISS_DISTANCE`, it asks to close through `dismissed`; Escape and the
 * scrim close the dialog itself.
 */
@Component({
  selector: 'pl-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-sheet',
    '[style.transform]': 'transform()',
    '[attr.data-dragging]': "dragStart() === null ? null : ''",
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'end()',
    '(pointercancel)': 'cancel()',
  },
  template: `
    <div class="pl-sheet__handle" aria-hidden="true"></div>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-block-size: 90dvh;
      padding-block-end: var(--pl-space-4);
      overflow-y: auto;
      border-radius: var(--pl-radius-card) var(--pl-radius-card) 0 0;
      background: var(--pl-color-surface-raised);
      box-shadow: var(--pl-shadow-overlay);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
      transition: transform var(--pl-duration-panel) var(--pl-ease-standard);
    }
    :host([data-dragging]) {
      transition: none;
    }
    .pl-sheet__handle {
      flex: none;
      display: grid;
      place-items: center;
      block-size: var(--pl-space-6);
      touch-action: none;
      cursor: grab;
    }
    .pl-sheet__handle::before {
      inline-size: var(--pl-space-8);
      block-size: var(--pl-space-1);
      border-radius: var(--pl-radius-pill);
      background: var(--pl-color-line-strong);
      content: '';
    }
  `,
})
export class Sheet {
  readonly dismissed = output<void>()

  protected readonly dragStart = signal<number | null>(null)
  private readonly offset = signal(0)
  protected readonly transform = computed(() => (this.offset() > 0 ? `translateY(${this.offset()}px)` : null))

  /** Only the handle pulls: a press anywhere else stays a click on what is under it. */
  protected start(event: PointerEvent): void {
    const handle = (event.target as HTMLElement).closest('.pl-sheet__handle')
    if (!handle) return
    handle.setPointerCapture?.(event.pointerId)
    this.dragStart.set(event.clientY)
  }

  protected move(event: PointerEvent): void {
    const start = this.dragStart()
    if (start !== null) this.offset.set(Math.max(0, event.clientY - start))
  }

  protected end(): void {
    const pulled = this.offset() >= SHEET_DISMISS_DISTANCE
    this.cancel()
    if (pulled) this.dismissed.emit()
  }

  protected cancel(): void {
    this.dragStart.set(null)
    this.offset.set(0)
  }
}

/** An entry of a sheet, on a link or a button: an icon, the label, and a trailing icon when it helps. */
@Component({
  // A component on a native link or button: the attribute keeps the form of the library's directives.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[plSheetItem], button[plSheetItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-sheet-item' },
  template: `
    <pl-icon class="pl-sheet-item__icon" [name]="icon()" [size]="3" />
    <span class="pl-sheet-item__label"><ng-content /></span>
    @if (trailing(); as trailing) {
    <pl-icon class="pl-sheet-item__trailing" [name]="trailing" [size]="2" />
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--pl-space-3);
      inline-size: 100%;
      min-block-size: 52px;
      padding: 0 var(--pl-space-4);
      border: 0;
      border-block-end: 1px solid var(--pl-color-line);
      background: none;
      color: var(--pl-color-text);
      font: var(--pl-font-body);
      font-weight: var(--pl-weight-strong);
      text-align: start;
      text-decoration: none;
      cursor: pointer;
    }
    :host(:last-child) {
      border-block-end: 0;
    }
    :host(:hover) {
      background: var(--pl-color-hover);
    }
    :host(:focus-visible) {
      outline-offset: -2px;
    }
    .pl-sheet-item__icon {
      color: var(--pl-color-muted);
    }
    .pl-sheet-item__label {
      flex: 1;
    }
    .pl-sheet-item__trailing {
      color: var(--pl-color-subtle);
    }
  `,
})
export class SheetItem {
  readonly icon = input.required<IconName>()
  readonly trailing = input<IconName>()
}

/** A line of a sheet that holds a control, such as the choice of the theme: its label, then the control. */
@Component({
  selector: 'pl-sheet-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pl-sheet-field' },
  template: `
    <span class="pl-sheet-field__label">
      @if (icon(); as icon) {
      <pl-icon class="pl-sheet-field__icon" [name]="icon" [size]="3" />
      }
      {{ label() }}
    </span>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--pl-space-3);
      min-block-size: 60px;
      padding: var(--pl-space-2) var(--pl-space-4);
      border-block-end: 1px solid var(--pl-color-line);
    }
    .pl-sheet-field__label {
      display: inline-flex;
      align-items: center;
      gap: var(--pl-space-3);
      font-weight: var(--pl-weight-strong);
    }
    .pl-sheet-field__icon {
      color: var(--pl-color-muted);
    }
  `,
})
export class SheetField {
  readonly label = input.required<string>()
  readonly icon = input<IconName>()
}
