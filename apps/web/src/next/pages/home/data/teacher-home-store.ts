import { Injectable } from '@angular/core'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, TaughtActivity } from '@platon/feature/course/common'
import { Resource } from '@platon/feature/resource/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { forkJoin, Observable } from 'rxjs'
import { HomeLoader } from './home-loader'

/** What the home of a teacher shows, loaded together. */
export interface TeacherHomeData {
  readonly activities: TaughtActivity[]
  readonly corrections: ActivityCorrectionSummary[]
  readonly courses: Course[]
  readonly viewed: Resource[]
  readonly announcements: Announcement[]
}

/** The home of a teacher: the activities of their courses, the copies to correct, their courses, what they viewed. */
@Injectable()
export class TeacherHomeStore extends HomeLoader<TeacherHomeData> {
  protected sources(): Observable<TeacherHomeData> {
    return forkJoin({
      activities: this.api.taught(),
      corrections: this.api.corrections(),
      courses: this.api.courses(['statistic']),
      viewed: this.api.viewed(),
      announcements: this.announcements(),
    })
  }
}
