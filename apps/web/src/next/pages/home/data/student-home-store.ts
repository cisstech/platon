import { Injectable } from '@angular/core'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { forkJoin, Observable } from 'rxjs'
import { HomeFigures } from './home-api'
import { HomeLoader } from './home-loader'

/** What the home of a student shows, loaded together. */
export interface StudentHomeData {
  readonly activities: PlayableActivity[]
  readonly copies: RecentCopy[]
  readonly courses: Course[]
  readonly figures: HomeFigures
  readonly announcements: Announcement[]
}

/** The home of a student: their activities, their copies, their courses and their figures. */
@Injectable()
export class StudentHomeStore extends HomeLoader<StudentHomeData> {
  protected sources(): Observable<StudentHomeData> {
    return forkJoin({
      activities: this.api.activities(),
      copies: this.api.copies(),
      courses: this.api.courses(),
      figures: this.api.figures(),
      announcements: this.announcements(),
    })
  }
}
