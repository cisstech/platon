import { DOCUMENT } from '@angular/common'
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core'
import { AnnouncementDisclosure, AnnouncementRowSkeleton } from '@platon/design-system'
import { announcementsList } from '../announcements-page'
import { AnnouncementDetail } from '../ui/announcement-detail/announcement-detail'
import { AnnouncementMore } from '../ui/announcement-more/announcement-more'
import { AnnouncementSearch } from '../ui/announcement-search/announcement-search'

/**
 * On a narrow screen: the search, then each announcement opening in place. The one the page was
 * opened on (`highlight`) is brought into view once its content is there: before, the page may be too
 * short to bring it up.
 */
@Component({
  selector: 'app-announcements-narrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnnouncementDetail, AnnouncementDisclosure, AnnouncementMore, AnnouncementRowSkeleton, AnnouncementSearch],
  templateUrl: './announcements-narrow.html',
  styleUrls: ['../announcements-layout.scss', './announcements-narrow.scss'],
})
export class AnnouncementsNarrow {
  readonly highlight = input<string>()

  private readonly disclosureParts = viewChildren(AnnouncementDisclosure)
  private readonly detailPart = viewChild(AnnouncementDetail)
  protected readonly list = announcementsList(this.disclosureParts)

  constructor() {
    const document = inject(DOCUMENT)
    let shown = false
    afterRenderEffect(() => {
      const highlight = this.highlight()
      const opened = this.list.detail()
      if (shown || !highlight || opened?.id !== highlight || opened.status === 'loading') return
      shown = true
      document.getElementById(`announcement-${highlight}`)?.scrollIntoView({ block: 'start' })
    })
  }

  protected toggle(id: string, expanded: boolean): void {
    if (expanded) this.list.store.open(id)
    else this.list.store.close()
  }

  /** Loads the content again, the focus staying in the announcement: the button that held it goes away. */
  protected retryContent(id: string): void {
    this.list.store.retryContent(id)
    this.detailPart()?.focus()
  }
}
