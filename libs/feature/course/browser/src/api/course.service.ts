import { Injectable } from '@angular/core'
import { ListResponse, ItemResponse } from '@platon/core/common'
import {
  Activity,
  ActivityCorrector,
  ActivityFilters,
  ActivityMember,
  Course,
  CourseDemo,
  CourseDemoAccessResponse,
  CourseFilters,
  CourseMember,
  CourseMemberFilters,
  CourseSection,
  CreateActivity,
  CreateActivityCorrector,
  CreateActivityMember,
  CreateCourse,
  CreateCourseMember,
  CreateCourseSection,
  FindCourse,
  UpdateActivity,
  UpdateCourse,
  UpdateCourseSection,
  CourseGroup,
  ActivityGroup,
  CourseMemberRoles,
} from '@platon/feature/course/common'
import { Observable, Subject, tap } from 'rxjs'
import { ActivityCorrectorProvider } from '../models/activity-corrector.provider'
import { ActivityMemberProvider } from '../models/activity-member.provider'
import { ActivityProvider } from '../models/activity-provider'
import { CourseMemberProvider } from '../models/course-member-provider'
import { CourseProvider } from '../models/course-provider'
import { CourseSectionProvider } from '../models/course-section-provider'
import { CourseDemoProvider } from '../models/course-demo-provider'
import { Optional } from 'typescript-optional'
import { CourseGroupProvider } from '../models/course-group-provider'
import { ActivityGroupProvider } from '../models/activity-group.provider'

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly deleteActivityEvent = new Subject<Activity>()
  private readonly addMemberEvent = new Subject<CourseMember>()
  private readonly deleteMemberEvent = new Subject<CourseMember>()

  readonly onAddedMember = this.addMemberEvent.asObservable()
  readonly onDeletedMember = this.deleteMemberEvent.asObservable()
  readonly onDeletedActivity = this.deleteActivityEvent.asObservable()

  constructor(
    private readonly courseProvider: CourseProvider,
    private readonly courseMemberProvider: CourseMemberProvider,
    private readonly courseSectionProvider: CourseSectionProvider,
    private readonly courseDemoProvider: CourseDemoProvider,
    private readonly courseGroupProvider: CourseGroupProvider,

    private readonly activityProvider: ActivityProvider,
    private readonly activityMemberProvider: ActivityMemberProvider,
    private readonly activityCorrectorProvider: ActivityCorrectorProvider,
    private readonly activityGroupProvider: ActivityGroupProvider
  ) {}

  //#region Courses
  search(filters?: CourseFilters): Observable<ListResponse<Course>> {
    return this.courseProvider.search(filters)
  }

  find(input: FindCourse): Observable<Course> {
    return this.courseProvider.find(input)
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.courseProvider.update(id, input)
  }

  delete(course: Course): Observable<void> {
    return this.courseProvider.delete(course)
  }

  create(input: CreateCourse): Observable<Course> {
    return this.courseProvider.create(input)
  }
  //#endregion

  //#region Courses Demo
  createDemo(courseId: string): Observable<CourseDemo> {
    return this.courseDemoProvider.create(courseId)
  }

  accessDemo(uri: string): Observable<CourseDemoAccessResponse> {
    return this.courseDemoProvider.access(uri)
  }

  getDemo(courseId: string): Observable<Optional<CourseDemo>> {
    return this.courseDemoProvider.get(courseId)
  }

  deleteDemo(courseId: string): Observable<void> {
    return this.courseDemoProvider.delete(courseId)
  }
  //#endregion

  //#region Members
  createMember(course: Course, input: CreateCourseMember): Observable<CourseMember> {
    return this.courseMemberProvider.create(course, input).pipe(tap((member) => this.addMemberEvent.next(member)))
  }

  updateMemberRole(member: CourseMember, role: CourseMemberRoles): Observable<CourseMember> {
    return this.courseMemberProvider.updateRole(member, role)
  }

  searchMembers(course: Course | string, filters?: CourseMemberFilters): Observable<ListResponse<CourseMember>> {
    return this.courseMemberProvider.search(course, filters)
  }

  deleteMember(member: CourseMember): Observable<void> {
    return this.courseMemberProvider.delete(member).pipe(tap(() => this.deleteMemberEvent.next(member)))
  }
  //#endregion

  //#region Sections
  findSection(courseId: string, sectionId: string): Observable<CourseSection> {
    return this.courseSectionProvider.find(courseId, sectionId)
  }

  listSections(course: Course): Observable<ListResponse<CourseSection>> {
    return this.courseSectionProvider.list(course)
  }

  createSection(course: Course, input: CreateCourseSection): Observable<CourseSection> {
    return this.courseSectionProvider.create(course, input)
  }

  updateSection(section: CourseSection, input: UpdateCourseSection): Observable<CourseSection> {
    return this.courseSectionProvider.update(section, input)
  }

  deleteSection(section: CourseSection): Observable<void> {
    return this.courseSectionProvider.delete(section)
  }
  //#endregion

  //#region Activities
  findActivity(courseId: string, activityId: string): Observable<Activity> {
    return this.activityProvider.find(courseId, activityId)
  }

  listActivities(course: Course, filters?: ActivityFilters): Observable<ListResponse<Activity>> {
    return this.activityProvider.search(course, filters)
  }

  createActivity(course: Course, input: CreateActivity): Observable<Activity> {
    return this.activityProvider.create(course, input)
  }

  updateActivity(activity: Activity, input: UpdateActivity): Observable<Activity> {
    return this.activityProvider.update(activity, input)
  }

  updateActivityOrder(course: Course, sortedActivityIds: string[]): Observable<void> {
    return this.activityProvider.updateOrder(course, sortedActivityIds)
  }

  reloadActivity(activity: Activity, version?: string): Observable<Activity> {
    return this.activityProvider.reload(activity, version)
  }

  deleteActivity(activity: Activity): Observable<void> {
    return this.activityProvider.delete(activity).pipe(tap(() => this.deleteActivityEvent.next(activity)))
  }

  closeActivity(activity: Activity): Observable<Activity> {
    return this.activityProvider.close(activity)
  }

  reopenActivity(activity: Activity): Observable<Activity> {
    return this.activityProvider.reopen(activity)
  }

  //#endregion

  //#region Activity Members
  createActivityMember(activity: Activity, input: CreateActivityMember): Observable<ActivityMember> {
    return this.activityMemberProvider.create(activity, input)
  }

  updateActivityMembers(activity: Activity, input: CreateActivityMember[]): Observable<ListResponse<ActivityMember>> {
    return this.activityMemberProvider.update(activity, input)
  }

  searchActivityMembers(activity: Activity): Observable<ListResponse<ActivityMember>> {
    return this.activityMemberProvider.search(activity)
  }

  deleteActivityMember(member: ActivityMember): Observable<void> {
    return this.activityMemberProvider.delete(member)
  }
  //#endregion

  //#region Activity Correctors
  createActivityCorrector(activity: string | Activity, input: CreateActivityCorrector): Observable<ActivityCorrector> {
    return this.activityCorrectorProvider.create(activity, input)
  }

  updateActivityCorrectors(
    activity: string | Activity,
    input: CreateActivityCorrector[]
  ): Observable<ListResponse<ActivityCorrector>> {
    return this.activityCorrectorProvider.update(activity, input)
  }

  searchActivityCorrector(activity: string | Activity): Observable<ListResponse<ActivityCorrector>> {
    return this.activityCorrectorProvider.search(activity)
  }

  deleteActivityCorrector(corrector: ActivityCorrector): Observable<void> {
    return this.activityCorrectorProvider.delete(corrector)
  }
  //#endregion

  //#region Groups
  listGroups(courseId: string): Observable<ListResponse<CourseGroup>> {
    return this.courseGroupProvider.list(courseId)
  }

  updateGroupName(courseId: string, groupId: string, name: string): Observable<CourseGroup> {
    return this.courseGroupProvider.updateName(courseId, groupId, name)
  }

  listGroupMembers(courseId: string, groupId: string): Observable<ListResponse<CourseMember>> {
    return this.courseGroupProvider.listMembers(courseId, groupId)
  }

  listGroupsMembers(courseId: string, groupsIds: string[]): Observable<ListResponse<CourseMember>> {
    return this.courseGroupProvider.listGroupsMembers(courseId, groupsIds)
  }

  deleteGroupMember(courseId: string, groupId: string, userId: string): Observable<void> {
    return this.courseGroupProvider.deleteMember(courseId, groupId, userId)
  }

  addGroupMember(courseId: string, groupId: string, userId: string): Observable<void> {
    return this.courseGroupProvider.addMember(courseId, groupId, userId)
  }

  addCourseGroup(courseId: string): Observable<ItemResponse<CourseGroup>> {
    return this.courseGroupProvider.addCourseGroup(courseId)
  }

  deleteGroup(courseId: string, groupId: string): Observable<void> {
    return this.courseGroupProvider.deleteGroup(courseId, groupId)
  }

  //#endregion

  //#region Activity Groups

  createActivityGroup(activityId: string, groupId: string): Observable<ActivityGroup> {
    return this.activityGroupProvider.create(activityId, groupId)
  }

  updateActivityGroups(activityId: string, groupsIds: string[]): Observable<ListResponse<ActivityGroup>> {
    return this.activityGroupProvider.update(activityId, groupsIds)
  }

  searchActivityGroups(activityId: string): Observable<ListResponse<ActivityGroup>> {
    return this.activityGroupProvider.search(activityId)
  }

  deleteActivityGroup(activityId: string, groupId: string): Observable<void> {
    return this.activityGroupProvider.delete(activityId, groupId)
  }

  //#endregion
}
