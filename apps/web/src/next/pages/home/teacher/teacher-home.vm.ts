import {
  calendarDay,
  CourseHue,
  courseHue,
  IconName,
  NO_BREAK_SPACE,
  relativeTime,
  TagTone,
} from '@platon/design-system'
import { Course, CourseStatistic, TaughtActivity } from '@platon/feature/course/common'
import { RESOURCE_STATUS_NAMES, RESOURCE_TYPE_NAMES } from '@platon/feature/resource/browser/shared'
import { Resource, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { copiesToCorrect, pendingCopies } from '../../../shared/copies'
import { byDeadline, byOpening, closingDue, DueView, openingDue } from '../../../shared/due'
import { plural } from '../../../shared/plural'
import { ActivityRowView, closesThisWeek, closingThisWeek, gradedTag, iconOf, rowOf, today } from '../home.vm'

/** « Vu récemment » shows the first ones of the list of Resources. */
const VIEWED = 3

/** A course of « Mes cours », with its students and teachers. */
export interface TeacherCourseView {
  readonly id: string
  readonly name: string
  readonly hue: CourseHue
  /** « 302 étudiants, 6 enseignants », when the course says so. */
  readonly members?: string
  readonly href: string
}

/** A resource of « Vu récemment ». */
export interface ViewedView {
  readonly id: string
  readonly name: string
  /** What it is and when it was viewed: « Exercice, hier ». */
  readonly when: string
  /** The status of an exercise. */
  readonly status?: { readonly label: string; readonly icon: IconName; readonly tone: TagTone }
  readonly href: string
}

export const teacherEmptySubtitle = 'Trois étapes pour faire travailler vos étudiants.'

/** Nothing to pilot yet: no course, and no copy waiting for the person. */
export const startsFromScratch = (data: { courses: Course[]; corrections: ActivityCorrectionSummary[] }): boolean =>
  data.courses.length === 0 && pendingCopies(data.corrections) === 0

/** The day, then what closes this week and the copies to correct, once known and when there are some. */
export const teacherSubtitle = (
  now: Date,
  locale: string,
  activities: TaughtActivity[] = [],
  corrections: ActivityCorrectionSummary[] = []
): string => {
  const closing = activities.filter((activity) => activity.state === 'opened' && closesThisWeek(activity.closeAt, now))
  const copies = pendingCopies(corrections)

  const parts = [closingThisWeek(closing.length), copies ? `${copies} ${copiesToCorrect(copies)}` : undefined].filter(
    Boolean
  )

  return parts.length ? `${today(now, locale)} ${parts.join(', ')}.` : today(now, locale)
}

/** An activity that follows its dates: it has some, or its restriction periods give them. */
const followsDates = (activity: TaughtActivity) => !!(activity.openAt || activity.closeAt || activity.restricted)

const isRunning = (activity: TaughtActivity) => activity.state === 'opened' && followsDates(activity)

const isOpenWithoutDates = (activity: TaughtActivity) => activity.state === 'opened' && !followsDates(activity)

const isPlannedTest = (activity: TaughtActivity) =>
  activity.state === 'planned' && !!activity.openAt && !!activity.graded

/** Those that count first, then by title. */
const gradedFirst = (a: TaughtActivity, b: TaughtActivity) =>
  Number(!!b.graded) - Number(!!a.graded) || a.title.localeCompare(b.title)

const settingsOf = (activity: TaughtActivity) => `/activities/${activity.courseId}/${activity.id}`

/** When a running activity closes, or why it does not say: no deadline, or one per period. */
const runningDue = (activity: TaughtActivity, now: Date, locale: string): DueView =>
  activity.closeAt
    ? closingDue(activity.closeAt, now, locale)
    : { due: activity.restricted ? 'Dates par période' : 'Sans fermeture', dueTone: 'neutral' }

/** « 251 sur 302 ont commencé », « 1 sur 302 participe ». */
const participation = (activity: TaughtActivity): string => {
  const started = activity.startedCount
  const verb = activity.isChallenge
    ? plural(started, 'participe', 'participent')
    : plural(started, 'a commencé', 'ont commencé')

  return `${started} sur ${activity.studentCount} ${verb}`
}

/** « moyenne provisoire 74 / 100 », while the activity is open. */
const provisionalMean = (activity: TaughtActivity): string | undefined =>
  activity.averageGrade === undefined
    ? undefined
    : `moyenne provisoire ${Math.round(activity.averageGrade)}${NO_BREAK_SPACE}/${NO_BREAK_SPACE}100`

/**
 * « En cours »: the open activities that follow their dates, the closest deadline first. A row opens
 * the monitoring of its activity, with the participation written out and the provisional mean.
 */
export const runningRows = (activities: TaughtActivity[], now: Date, locale: string): ActivityRowView[] =>
  activities
    .filter(isRunning)
    .sort(byDeadline)
    .map((activity) => ({
      ...rowOf(activity),
      ...runningDue(activity, now, locale),
      detail: provisionalMean(activity),
      done: activity.startedCount,
      total: activity.studentCount,
      progressText: participation(activity),
      href: `/activities/monitor/${activity.courseId}/${activity.id}`,
    }))

/** Copies entrusted to the person, counted out of those handed in, with a bar once some are corrected. */
const correctionRow = (
  correction: ActivityCorrectionSummary,
  activity: TaughtActivity | undefined,
  now: Date,
  locale: string
): ActivityRowView => {
  const pending = correction.pendingCopies
  const corrected = correction.submittedCopies - pending
  const lastSubmitted = correction.lastSubmittedAt

  return {
    id: correction.activityId,
    heading: activity?.title || correction.activityName || 'Activité sans titre',
    context: correction.courseName,
    icon: activity ? iconOf(activity) : 'assignment',
    hue: courseHue(correction.courseId),
    due: '',
    dueTone: 'neutral',
    detail: lastSubmitted ? `dernière copie rendue le ${calendarDay(lastSubmitted, locale, now)}` : undefined,
    done: corrected,
    total: corrected > 0 ? correction.submittedCopies : 0,
    progressText: `${pending} ${copiesToCorrect(pending)} sur ${correction.submittedCopies}`,
    action: 'Corriger',
    button: 'secondary',
    href: `/player/correction/${correction.courseId}`,
    queryParams: { activityId: correction.activityId },
  }
}

/** An activity open without dates: neutral for a practice, a warning for one that counts. */
const planRow = (activity: TaughtActivity): ActivityRowView => ({
  ...rowOf(activity),
  due: 'Ouverte, sans dates',
  dueTone: activity.graded ? 'warning' : 'neutral',
  dueIcon: activity.graded ? 'warning' : 'info',
  detail: `${activity.startedCount} ${plural(activity.startedCount, 'étudiant a', 'étudiants ont')} commencé`,
  done: 0,
  total: 0,
  ...gradedTag(activity),
  action: 'Planifier',
  button: 'secondary',
  href: settingsOf(activity),
})

/** A planned test: when it opens, and its settings to review before. */
const reviewRow = (activity: TaughtActivity, now: Date, locale: string): ActivityRowView => ({
  ...rowOf(activity),
  ...openingDue(activity.openAt as Date, now, locale),
  done: 0,
  total: 0,
  ...gradedTag(activity),
  action: 'Relire les réglages',
  button: 'secondary',
  href: settingsOf(activity),
})

/**
 * « À faire »: what waits for a gesture of the person, each with the button that names it. The copies
 * entrusted to them first, then the activities open without dates (those that count first), then the
 * planned tests, by opening.
 */
export const gestureRows = (
  activities: TaughtActivity[],
  corrections: ActivityCorrectionSummary[],
  now: Date,
  locale: string
): ActivityRowView[] => {
  const byId = new Map(activities.map((activity) => [activity.id, activity]))

  const toCorrect = corrections
    .filter((correction) => correction.pendingCopies > 0)
    .map((correction) => correctionRow(correction, byId.get(correction.activityId), now, locale))

  const toPlan = activities.filter(isOpenWithoutDates).sort(gradedFirst).map(planRow)

  const toReview = activities
    .filter(isPlannedTest)
    .sort(byOpening)
    .map((activity) => reviewRow(activity, now, locale))

  return [...toCorrect, ...toPlan, ...toReview]
}

/** « 302 étudiants, 6 enseignants ». */
const membersOf = ({ studentCount, teacherCount }: CourseStatistic): string =>
  `${studentCount} ${plural(studentCount, 'étudiant', 'étudiants')}, ` +
  `${teacherCount} ${plural(teacherCount, 'enseignant', 'enseignants')}`

/** « Mes cours »: each course in its hue, with its students and teachers. */
export const teacherCourses = (courses: Course[]): TeacherCourseView[] =>
  courses.map((course) => ({
    id: course.id,
    name: course.name,
    hue: courseHue(course.id),
    members: course.statistic ? membersOf(course.statistic) : undefined,
    href: `/courses/${course.id}`,
  }))

/** The status of an exercise in a word or two: « Prêt » rather than the long label of the list. */
const STATUSES: Record<ResourceStatus, { label: string; icon: IconName; tone: TagTone }> = {
  [ResourceStatus.READY]: { label: 'Prêt', icon: 'verified', tone: 'success' },
  [ResourceStatus.DRAFT]: { label: RESOURCE_STATUS_NAMES.DRAFT, icon: 'save', tone: 'neutral' },
  [ResourceStatus.BUGGED]: { label: RESOURCE_STATUS_NAMES.BUGGED, icon: 'warning', tone: 'warning' },
  [ResourceStatus.NOT_TESTED]: { label: RESOURCE_STATUS_NAMES.NOT_TESTED, icon: 'pending', tone: 'neutral' },
  [ResourceStatus.DEPRECATED]: { label: RESOURCE_STATUS_NAMES.DEPRECATED, icon: 'error', tone: 'danger' },
}

/**
 * « Vu récemment »: the first resources of the list of Resources, in its order, each with what it is,
 * when it was viewed and, for an exercise, its status.
 */
export const viewedViews = (resources: Resource[], now: Date, locale: string): ViewedView[] =>
  resources.slice(0, VIEWED).map((resource) => {
    const kind = RESOURCE_TYPE_NAMES[resource.type]
    return {
      id: resource.id,
      name: resource.name,
      when: resource.viewedAt ? `${kind}, ${relativeTime(resource.viewedAt, locale, now)}` : kind,
      status: resource.type === ResourceTypes.EXERCISE ? STATUSES[resource.status] : undefined,
      href: `/resources/${resource.id}`,
    }
  })
