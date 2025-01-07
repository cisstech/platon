/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpErrorResponse } from '@angular/common/http'
import { Injectable, OnDestroy, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService, DialogService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { CourseService } from '@platon/feature/course/browser'
import {
  Activity,
  ActivityFilters,
  Course,
  CourseDemo,
  CourseGroup,
  CourseGroupDetail,
  CourseMember,
  CourseMemberRoles,
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
import { Optional } from 'typescript-optional'

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

  async updateMemberRole(member: CourseMember, role: CourseMemberRoles): Promise<void> {
    try {
      await firstValueFrom(this.courseService.updateMemberRole(member, role))
    } catch (e: unknown) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 403) {
          this.dialogService.error('Le rôle enseignant ne peut pas être donné à un compte étudiant.')
          throw e
        }
      } else {
        this.alertError()
      }
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

  async updateActivityOrder(ids: string[]): Promise<void> {
    const { course } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.courseService.updateActivityOrder(course, ids))
    } catch {
      this.alertError()
    }
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

  async delete(): Promise<boolean> {
    const { course } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.courseService.delete(course))
      this.dialogService.success('Le cours a bien été supprimé !')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async createDemo(): Promise<boolean> {
    const { course } = this.context.value as Required<Context>
    try {
      const demo = await firstValueFrom(this.courseService.createDemo(course.id))

      this.context.next({
        ...this.context.value,
        demo: Optional.ofNonNull(demo),
      })

      this.dialogService.success('Une démo a bien été créée!')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async deleteDemo(): Promise<boolean> {
    const { course } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.courseService.deleteDemo(course.id))

      this.context.next({
        ...this.context.value,
        demo: Optional.empty(),
      })

      this.dialogService.success('La démo a bien été supprimée!')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async copyDemoUri(): Promise<void> {
    this.dialogService.info('URL copiée')
  }

  async listCourseGroups(): Promise<CourseGroup[]> {
    const { course } = this.context.value
    if (!course) {
      return []
    }
    const response = await firstValueFrom(this.courseService.listGroups(course.id))
    return response.resources
  }

  async updateGroupName(groupId: string, newName: string): Promise<void> {
    const { course } = this.context.value
    if (!course) {
      return
    }
    try {
      await firstValueFrom(this.courseService.updateGroupName(course.id, groupId, newName))
      this.context.next({
        ...this.context.value,
        courseGroups: this.context.value.courseGroups
          ?.map((group) => {
            if (group.courseGroup.groupId === groupId) {
              return {
                ...group,
                courseGroup: {
                  ...group.courseGroup,
                  name: newName,
                },
              }
            }
            return group
          })
          .sort((a, b) => a.courseGroup.name.localeCompare(b.courseGroup.name)),
      })
    } catch {
      this.alertError()
    }
  }

  async listCourseGroupMembers(groupId: string): Promise<CourseMember[]> {
    const { course } = this.context.value
    if (!course) {
      return []
    }
    const response = await firstValueFrom(this.courseService.listGroupMembers(course.id, groupId))
    this.context.next({
      ...this.context.value,
      courseGroups: this.context.value.courseGroups?.map((group) => {
        if (group.courseGroup.groupId === groupId) {
          return {
            ...group,
            members: response.resources,
          }
        }
        return group
      }),
    })
    return response.resources
  }

  async removeGroupMember(groupId: string, member: CourseMember): Promise<void> {
    const { course } = this.context.value
    if (!course) {
      return
    }
    try {
      await firstValueFrom(this.courseService.deleteGroupMember(course.id, groupId, member.user!.id))
      this.context.next({
        ...this.context.value,
        courseGroups: this.context.value.courseGroups?.map((group) => {
          if (group.courseGroup.groupId === groupId) {
            return {
              ...group,
              members: group.members.filter((m) => m.user!.id !== member.user!.id),
            }
          }
          return group
        }),
      })
    } catch {
      this.alertError()
    }
  }

  async addGroupMember(groupId: string, members: CourseMember[]): Promise<void> {
    const { course } = this.context.value
    if (!course) {
      return
    }
    try {
      await Promise.all(
        members.map(async (member) => {
          await firstValueFrom(this.courseService.addGroupMember(course.id, groupId, member.user!.id))
        })
      )
      this.context.next({
        ...this.context.value,
        courseGroups: this.context.value.courseGroups?.map((group) => {
          if (group.courseGroup.groupId === groupId) {
            return {
              ...group,
              members: group.members.concat(members.map((m) => ({ ...m, createdAt: new Date() }))),
            }
          }
          return group
        }),
      })
    } catch {
      this.alertError()
    }
  }

  async addGroup(): Promise<void> {
    const { course } = this.context.value
    if (!course) {
      return
    }
    try {
      const group = await firstValueFrom(this.courseService.addCourseGroup(course.id))
      this.context.next({
        ...this.context.value,
        courseGroups: this.context.value.courseGroups?.concat({
          courseGroup: group.resource,
          members: [],
        }),
      })
    } catch {
      this.alertError()
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const { course } = this.context.value
    if (!course) {
      return
    }
    try {
      await firstValueFrom(this.courseService.deleteGroup(course.id, groupId))
      this.context.next({
        ...this.context.value,
        courseGroups: this.context.value.courseGroups?.filter((group) => group.courseGroup.groupId !== groupId),
      })
    } catch {
      this.alertError()
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

    const demo = await firstValueFrom(this.courseService.getDemo(course.id))

    this.context.next({
      state: 'READY',
      user,
      course,
      demo,
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
  courseGroups?: CourseGroupDetail[]
  demo?: Optional<CourseDemo>
}
