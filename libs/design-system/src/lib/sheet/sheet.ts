import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core'

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
  templateUrl: './sheet.html',
  styleUrl: './sheet.scss',
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
