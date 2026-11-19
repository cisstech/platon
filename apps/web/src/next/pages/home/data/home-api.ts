import { inject, Injectable } from '@angular/core'
import { AnnouncementService } from '@platon/feature/announcement/browser/shared'
import { Announcement } from '@platon/feature/announcement/common'
import { CourseService } from '@platon/feature/course/browser/shared'
import {
  Course,
  CourseExpandableFields,
  CourseOrderings,
  PlayableActivity,
  TaughtActivity,
} from '@platon/feature/course/common'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { Resource } from '@platon/feature/resource/common'
import { ResultService } from '@platon/feature/result/browser/shared'
import { ActivityCorrectionSummary, RecentCopy } from '@platon/feature/result/common'
import { map, Observable } from 'rxjs'

/** The three figures of the home over all the person's courses. */
export interface HomeFigures {
  /** Mean of their copies, on 100. */
  readonly averageScore: number
  /** Share of their exercises succeeded, in percent. */
  readonly successRate: number
  /** In seconds. */
  readonly timeSpent: number
}

/**
 * What the homes read: for a student, their activities, copies, courses, figures; for a teacher, the
 * activities they teach, the copies to correct, their courses and what they viewed; for both, the
 * announcements.
 */
@Injectable({ providedIn: 'root' })
export class HomeApi {
  private readonly courseService = inject(CourseService)
  private readonly resultService = inject(ResultService)
  private readonly announcementService = inject(AnnouncementService)
  private readonly resourceService = inject(ResourceService)

  activities(): Observable<PlayableActivity[]> {
    return this.courseService.playableActivities()
  }

  copies(): Observable<RecentCopy[]> {
    return this.resultService.recentCopies()
  }

  /** The courses of the person not archived, by name, with what `expands` asks (`statistic` for their members). */
  courses(expands: CourseExpandableFields[] = []): Observable<Course[]> {
    return this.courseService
      .search({ archived: false, order: CourseOrderings.NAME, ...(expands.length ? { expands } : {}) })
      .pipe(map((response) => response.resources))
  }

  figures(): Observable<HomeFigures> {
    return this.resultService.userDashboard().pipe(
      map(({ user }) => ({
        averageScore: user.averageScore,
        successRate: user.successRate,
        timeSpent: user.totalDuration,
      }))
    )
  }

  taught(): Observable<TaughtActivity[]> {
    return this.courseService.taughtActivities()
  }

  corrections(): Observable<ActivityCorrectionSummary[]> {
    return this.resultService.listCorrectionSummaries().pipe(map((response) => response.resources))
  }

  /** The resources viewed last, the most recent first, as the list of Resources shows them. */
  viewed(): Observable<Resource[]> {
    return this.resourceService.search({ views: true }).pipe(map((response) => response.resources))
  }

  announcements(): Observable<Announcement[]> {
    return this.announcementService.getActiveAnnouncements().pipe(map((response) => response.resources))
  }

  /** The person has read it: they closed its banner. */
  markAnnouncementRead(id: string): Observable<void> {
    return this.announcementService.markAsRead(id)
  }
}
