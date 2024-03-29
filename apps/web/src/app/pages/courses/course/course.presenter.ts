/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable, OnDestroy, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService, DialogService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { CourseService } from '@platon/feature/course/browser'
import {
  Activity,
  ActivityFilters,
  Course,
  CourseMember,
  CourseSection,
  CreateCourseMember,
  CreateCourseSection,
  UpdateCourse,
  UpdateCourseSection,
} from '@platon/feature/course/common'
import { ResultService } from '@platon/feature/result/browser'
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common'
import { LayoutState, layoutStateFromError } from '@platon/shared/ui'
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs'

@Injectable()
export class CoursePresenter implements OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly authService = inject(AuthService)
  private readonly resultService = inject(ResultService)
  private readonly dialogService = inject(DialogService)
  private readonly courseService = inject(CourseService)
  private readonly activatedRoute = inject(ActivatedRoute)

  private readonly context = new BehaviorSubject<Context>(this.defaultContext())

  readonly contextChange = this.context.asObservable()
  readonly onDeletedActivity = this.courseService.onDeletedActivity

  constructor() {
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe((params) => {
        this.onChangeRoute(params.get('id') as string).catch(console.error)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  defaultContext(): Context {
    return { state: 'LOADING' }
  }

  // Members

  async addMember(input: CreateCourseMember): Promise<void> {
    const { course } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.courseService.createMember(course, input))
    } catch {
      this.alertError()
    }
  }

  async deleteMember(member: CourseMember): Promise<void> {
    try {
      await firstValueFrom(this.courseService.deleteMember(member))
    } catch {
      this.alertError()
    }
  }

  // Sections

  async listSections(): Promise<CourseSection[]> {
    const { course } = this.context.value
    if (!course) {
      return []
    }
    const response = await firstValueFrom(this.courseService.listSections(course))
    return response.resources
  }

  async addSection(input: CreateCourseSection): Promise<void> {
    const { course } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.courseService.createSection(course, input))
    } catch {
      this.alertError()
    }
  }

  async updateSection(section: CourseSection, input: UpdateCourseSection): Promise<void> {
    try {
      await firstValueFrom(this.courseService.updateSection(section, input))
    } catch {
      this.alertError()
    }
  }

  async deleteSection(section: CourseSection): Promise<void> {
    try {
      await firstValueFrom(this.courseService.deleteSection(section))
    } catch {
      this.alertError()
    }
  }

  // Activities

  async listActivities(filters?: ActivityFilters): Promise<Activity[]> {
    const { course } = this.context.value
    if (!course) {
      return []
    }
    const response = await firstValueFrom(this.courseService.listActivities(course, filters))
    return response.resources
  }

  // Leaderboard

  async courseLeaderboard(): Promise<CourseLeaderboardEntry[]> {
    const { course } = this.context.value as Required<Context>
    if (!course) {
      return []
    }

    return firstValueFrom(
      this.resultService.courseLeaderboard({
        courseId: course.id,
      })
    )
  }

  async activityLeaderboard(activityId: string): Promise<ActivityLeaderboardEntry[]> {
    return firstValueFrom(
      this.resultService.activityLeaderboard({
        activityId,
      })
    )
  }

  async update(input: UpdateCourse): Promise<boolean> {
    const { course } = this.context.value as Required<Context>
    try {
      const changes = await firstValueFrom(
        this.courseService.update(course.id, {
          ...input,
          expands: ['permissions', 'statistic'],
        })
      )
      this.context.next({
        ...this.context.value,
        course: changes,
      })

      this.dialogService.success('Les informations du cours ont bien été modifiées !')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  private async refresh(id: string): Promise<void> {
    const [user, course] = await Promise.all([
      this.authService.ready(),
      firstValueFrom(
        this.courseService.find({
          id,
          expands: ['permissions', 'statistic'],
        })
      ),
    ])

    this.context.next({
      state: 'READY',
      user,
      course,
    })
  }

  private async onChangeRoute(id: string): Promise<void> {
    try {
      await this.refresh(id)
    } catch (error) {
      this.context.next({ state: layoutStateFromError(error) })
    }
  }

  private alertError(): void {
    this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
  }
}

export interface Context {
  state: LayoutState
  user?: User
  course?: Course
}
