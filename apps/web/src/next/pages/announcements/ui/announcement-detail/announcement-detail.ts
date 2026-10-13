import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, inject, input, output } from '@angular/core'
import { Button, Icon, Skeleton } from '@platon/design-system'
import { EditorContent } from '../../../../shared/ui/editor-content/editor-content'
import { DetailView } from '../../announcements.vm'

let lastId = 0

/**
 * The open announcement: its title when it sits beside the list (`titled`), when, by whom and for
 * whom it was published, then its content, or its summary when it has none. While the content loads,
 * lines on their way; when it fails, a message and « Réessayer ».
 */
@Component({
  selector: 'app-announcement-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, EditorContent, Skeleton],
  host: {
    tabindex: '-1',
    '[attr.role]': "titled() ? 'article' : null",
    '[attr.aria-labelledby]': 'titled() ? headingId : null',
  },
  templateUrl: './announcement-detail.html',
  styleUrl: './announcement-detail.scss',
})
export class AnnouncementDetail {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement

  readonly detail = input.required<DetailView>()
  readonly titled = input(false, { transform: booleanAttribute })
  readonly retry = output<void>()

  protected readonly headingId = `app-announcement-title-${++lastId}`

  focus(): void {
    this.element.focus()
  }
}
