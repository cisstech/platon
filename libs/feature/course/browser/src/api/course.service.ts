import { Injectable } from '@angular/core';
import { ListResponse } from '@platon/core/common';
import {
  Activity,
  ActivityCorrector,
  ActivityFilters,
  ActivityMember,
  Course,
  CourseDemo,
  CourseDemoAccessAnswer,
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
  UpdateActivity,
  UpdateCourse,
  UpdateCourseSection,
} from '@platon/feature/course/common';
import { Observable } from 'rxjs';
import { ActivityCorrectorProvider } from '../models/activity-corrector.provider';
import { ActivityMemberProvider } from '../models/activity-member.provider';
import { ActivityProvider } from '../models/activity-provider';
import { CourseMemberProvider } from '../models/course-member-provider';
import { CourseProvider } from '../models/course-provider';
import { CourseSectionProvider } from '../models/course-section-provider';
import { CourseDemoProvider } from '../models/course-demo-provider';
import { Optional } from 'typescript-optional';

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(
    private readonly courseProvider: CourseProvider,
    private readonly courseMemberProvider: CourseMemberProvider,
    private readonly courseSectionProvider: CourseSectionProvider,
    private readonly courseDemoProvider: CourseDemoProvider,

    private readonly activityProvider: ActivityProvider,
    private readonly activityMemberProvider: ActivityMemberProvider,
    private readonly activityCorrectorProvider: ActivityCorrectorProvider
  ) {}

  //#region Courses
  search(filters?: CourseFilters): Observable<ListResponse<Course>> {
    return this.courseProvider.search(filters);
  }

  find(id: string): Observable<Course> {
    return this.courseProvider.find(id);
  }

  update(id: string, input: UpdateCourse): Observable<Course> {
    return this.courseProvider.update(id, input);
  }

  create(input: CreateCourse): Observable<Course> {
    return this.courseProvider.create(input);
  }
  //#endregion

  //#region Courses Demo
  createDemo(courseId: string): Observable<CourseDemo> {
    return this.courseDemoProvider.create(courseId);
  }

  accessDemo(uri: string): Observable<CourseDemoAccessAnswer> {
    return this.courseDemoProvider.access(uri);
  }

  getDemo(courseId: string): Observable<Optional<CourseDemo>> {
    return this.courseDemoProvider.get(courseId);
  }

  deleteDemo(courseId: string): Observable<void> {
    return this.courseDemoProvider.delete(courseId);
  }
  //#endregion

  //#region Members
  createMember(
    course: Course,
    input: CreateCourseMember
  ): Observable<CourseMember> {
    return this.courseMemberProvider.create(course, input);
  }

  searchMembers(
    course: Course,
    filters?: CourseMemberFilters
  ): Observable<ListResponse<CourseMember>> {
    return this.courseMemberProvider.search(course, filters);
  }

  deleteMember(member: CourseMember): Observable<void> {
    return this.courseMemberProvider.delete(member);
  }
  //#endregion

  //#region Sections
  findSection(courseId: string, sectionId: string): Observable<CourseSection> {
    return this.courseSectionProvider.find(courseId, sectionId);
  }

  listSections(course: Course): Observable<ListResponse<CourseSection>> {
    return this.courseSectionProvider.list(course);
  }

  createSection(
    course: Course,
    input: CreateCourseSection
  ): Observable<CourseSection> {
    return this.courseSectionProvider.create(course, input);
  }

  updateSection(
    section: CourseSection,
    input: UpdateCourseSection
  ): Observable<CourseSection> {
    return this.courseSectionProvider.update(section, input);
  }

  deleteSection(section: CourseSection): Observable<void> {
    return this.courseSectionProvider.delete(section);
  }
  //#endregion

  //#region Activities
  findActivity(courseId: string, activityId: string): Observable<Activity> {
    return this.activityProvider.find(courseId, activityId);
  }

  listActivities(
    course: Course,
    filters?: ActivityFilters
  ): Observable<ListResponse<Activity>> {
    return this.activityProvider.search(course, filters);
  }

  createActivity(course: Course, input: CreateActivity): Observable<Activity> {
    return this.activityProvider.create(course, input);
  }

  updateActivity(
    activity: Activity,
    input: UpdateActivity
  ): Observable<Activity> {
    return this.activityProvider.update(activity, input);
  }

  deleteActivity(activity: Activity): Observable<void> {
    return this.activityProvider.delete(activity);
  }
  //#endregion

  //#region Activity Members
  createActivityMember(
    activity: Activity,
    input: CreateActivityMember
  ): Observable<ActivityMember> {
    return this.activityMemberProvider.create(activity, input);
  }

  updateActivityMembers(
    activity: Activity,
    input: CreateActivityMember[]
  ): Observable<ListResponse<ActivityMember>> {
    return this.activityMemberProvider.update(activity, input);
  }

  searchActivityMembers(
    activity: Activity
  ): Observable<ListResponse<ActivityMember>> {
    return this.activityMemberProvider.search(activity);
  }

  deleteActivityMember(member: ActivityMember): Observable<void> {
    return this.activityMemberProvider.delete(member);
  }
  //#endregion

  //#region Activity Correctors
  createActivityCorrector(
    activity: string | Activity,
    input: CreateActivityCorrector
  ): Observable<ActivityCorrector> {
    return this.activityCorrectorProvider.create(activity, input);
  }

  updateActivityCorrectors(
    activity: string | Activity,
    input: CreateActivityCorrector[]
  ): Observable<ListResponse<ActivityCorrector>> {
    return this.activityCorrectorProvider.update(activity, input);
  }

  searchActivityCorrector(
    activity: string | Activity
  ): Observable<ListResponse<ActivityCorrector>> {
    return this.activityCorrectorProvider.search(activity);
  }

  deleteActivityCorrector(corrector: ActivityCorrector): Observable<void> {
    return this.activityCorrectorProvider.delete(corrector);
  }
  //#endregion
}
