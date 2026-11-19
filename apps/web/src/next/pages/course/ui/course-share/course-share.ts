import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Clipboard } from '@angular/cdk/clipboard'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import {
  Button,
  Field,
  FieldInput,
  Icon,
  NO_BREAK_SPACE,
  Panel,
  Segmented,
  SegmentedOption,
} from '@platon/design-system'

export const COURSE_SHARE_HEADING_ID = 'app-course-share-title'

/** The links the panel shares: in PLaTon, and from an LMS through LTI. */
export interface CourseShareData {
  readonly links: { readonly platon: string; readonly lti: string }
}

type LinkKind = keyof CourseShareData['links']

/**
 * « Partager », under its button: the link of the course in PLaTon or through LTI, in a field to read
 * or select, and « Copier le lien », which says it copied.
 */
@Component({
  selector: 'app-course-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Field, FieldInput, Icon, Panel, Segmented],
  templateUrl: './course-share.html',
  styleUrl: './course-share.scss',
})
export class CourseShare {
  private readonly dialogRef = inject(DialogRef)
  private readonly clipboard = inject(Clipboard)
  private readonly announcer = inject(LiveAnnouncer)
  protected readonly data = inject<CourseShareData>(DIALOG_DATA)

  protected readonly headingId = COURSE_SHARE_HEADING_ID
  protected readonly kinds: SegmentedOption<LinkKind>[] = [
    { value: 'platon', label: 'Lien PLaTon' },
    { value: 'lti', label: 'Lien LTI' },
  ]
  protected readonly kind = signal<LinkKind>('platon')
  protected readonly link = computed(() => this.data.links[this.kind()])
  protected readonly copied = signal(false)

  protected choose(kind?: LinkKind): void {
    if (!kind) return
    this.kind.set(kind)
    this.copied.set(false)
  }

  protected copy(): void {
    const copied = this.clipboard.copy(this.link())
    this.copied.set(copied)
    const said = copied
      ? 'Lien copié.'
      : `Le lien n'a pas pu être copié${NO_BREAK_SPACE}: sélectionnez-le dans le champ.`
    this.announcer.announce(said, 'polite').catch(console.error)
  }

  protected select(event: Event): void {
    ;(event.target as HTMLInputElement).select()
  }

  protected close(): void {
    this.dialogRef.close()
  }
}
