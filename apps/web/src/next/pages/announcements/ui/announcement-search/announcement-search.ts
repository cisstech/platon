import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core'
import { Button, Empty, Field, FieldInput } from '@platon/design-system'

/**
 * The search of the announcements: its field, labelled for screen readers, and what it found nothing
 * for, with « Effacer la recherche », which gives the focus back to the field.
 */
@Component({
  selector: 'app-announcement-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Empty, Field, FieldInput],
  templateUrl: './announcement-search.html',
  styleUrl: './announcement-search.scss',
})
export class AnnouncementSearch {
  readonly value = input.required<string>()
  /** What it found nothing for, once said; nothing while it finds something. */
  readonly noMatch = input<string>()
  readonly searched = output<string>()
  readonly cleared = output<void>()

  private readonly field = viewChild.required(FieldInput)

  protected search(event: Event): void {
    this.searched.emit((event.target as HTMLInputElement).value)
  }

  /** The button that held the focus goes away with the message: the focus goes back to the field. */
  protected clear(): void {
    this.cleared.emit()
    this.field().element.focus()
  }
}
