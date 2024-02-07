import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { UserAvatarComponent } from '@platon/core/browser'
import { CourseActivityCardComponent } from '@platon/feature/course/browser'
import { Activity } from '@platon/feature/course/common'
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common'
import { DurationPipe } from '@platon/shared/ui'
import { NzEmptyComponent } from 'ng-zorro-antd/empty'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton'
import { NzTimelineModule } from 'ng-zorro-antd/timeline'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { Subscription } from 'rxjs'
import { CoursePresenter } from '../course.presenter'

@Component({
  standalone: true,
  selector: 'app-course-challenges',
  templateUrl: './challenges.page.html',
  styleUrls: ['./challenges.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    NzGridModule,
    NzEmptyComponent,
    NzSelectModule,
    NzTimelineModule,
    NzTypographyModule,
    NzSkeletonComponent,

    DurationPipe,
    UserAvatarComponent,
    CourseActivityCardComponent,
  ],
})
export class ChallengesPage implements OnInit, OnDestroy {
  private readonly presenter = inject(CoursePresenter)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly subscriptions: Subscription[] = []

  protected activity?: Activity | null
  protected challenges: Activity[] = []

  protected noData = false
  protected loading = true

  protected courseLeaderboard: CourseLeaderboardEntry[] = []
  protected activityLeaderboard: ActivityLeaderboardEntry[] = []

  protected context = this.presenter.defaultContext()

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context

        this.challenges = await this.presenter.listActivities({ challenge: true })

        if (!this.courseLeaderboard.length) {
          this.courseLeaderboard = await this.presenter.courseLeaderboard()
        }

        const activity = this.challenges.find((a) => a.id === this.activatedRoute.snapshot.queryParams.activity)

        await this.onChooseActivity(activity)
      }),

      this.presenter.onDeletedActivity.subscribe(async (activity) => {
        if (activity.id === this.activity?.id) {
          await this.onChooseActivity(null)
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async onChooseActivity(activity?: Activity | null): Promise<void> {
    this.loading = true
    this.changeDetectorRef.markForCheck()

    this.activity = activity
    this.activityLeaderboard = []
    if (activity) {
      this.activityLeaderboard = await this.presenter.activityLeaderboard(activity.id)
    }

    this.checkNoData()
    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  private checkNoData(): void {
    this.noData = this.activity ? !this.activityLeaderboard.length : !this.courseLeaderboard.length
  }
}
