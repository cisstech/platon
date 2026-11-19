import { ChangeDetectionStrategy, Component, viewChild, viewChildren } from '@angular/core'
import { AnnouncementList, AnnouncementRow, AnnouncementRowSkeleton, Skeleton } from '@platon/design-system'
import { ShowMore } from '../../../shared/ui/show-more/show-more'
import { announcementsList } from '../announcements-page'
import { AnnouncementDetail } from '../ui/announcement-detail/announcement-detail'
import { AnnouncementSearch } from '../ui/announcement-search/announcement-search'

/** On a wide screen: the search and the list on the left, the open announcement beside them. */
@Component({
  selector: 'app-announcements-wide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnnouncementDetail,
    AnnouncementList,
    AnnouncementRow,
    AnnouncementRowSkeleton,
    AnnouncementSearch,
    ShowMore,
    Skeleton,
  ],
  templateUrl: './announcements-wide.html',
  styleUrls: ['../announcements-layout.scss', './announcements-wide.scss'],
})
export class AnnouncementsWide {
  private readonly rowParts = viewChildren(AnnouncementRow)
  private readonly detailPart = viewChild(AnnouncementDetail)
  protected readonly list = announcementsList(this.rowParts)

  /** Loads the content again, the focus staying in the announcement: the button that held it goes away. */
  protected retryContent(id: string): void {
    this.list.store.retryContent(id)
    this.detailPart()?.focus()
  }
}
