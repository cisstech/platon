import { Course, CourseSection, PlayableActivity, TaughtActivity } from '@platon/feature/course/common'

/** The course, its sections and its activities the view functions of the page are tested with. */

export const LOCALE = 'fr-FR'
/** A Monday afternoon, in the local time of the machine running the tests. */
export const NOW = new Date(2026, 8, 28, 14, 30)
export const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)
/** Intl and the copy join numbers and units with no-break spaces. */
export const words = (text?: string) => text?.replace(/\s/g, ' ')

const karim = { id: 'u1', username: 'khaddad', firstName: 'Karim', lastName: 'Haddad' }

export const course = (values: Partial<Course> = {}) =>
  ({
    id: 'ap1',
    name: 'Algorithmique et programmation 1',
    ownerId: 'u1',
    owner: karim,
    createdAt: at(1, 9),
    statistic: { teacherCount: 6, studentCount: 302, activityCount: 9, challengeCount: 1, timeSpent: 34800 },
    permissions: { update: true, archive: true },
    ...values,
  } as Course)

export const section = (id: string, name: string, order: number) =>
  ({ id, name, order, courseId: 'ap1' } as CourseSection)

export const taught = (id: string, values: Partial<TaughtActivity> = {}): TaughtActivity => ({
  id,
  courseId: 'ap1',
  courseName: 'AP1',
  sectionId: 's5',
  order: 0,
  title: `Activité ${id}`,
  resourceId: 'r1',
  openAt: at(1, 8),
  closeAt: null,
  state: 'opened',
  restricted: false,
  isChallenge: false,
  graded: false,
  exerciseCount: 8,
  studentCount: 302,
  startedCount: 23,
  pendingCopies: 0,
  correctors: [],
  ...values,
})

export const playable = (id: string, values: Partial<PlayableActivity> = {}): PlayableActivity => ({
  id,
  courseId: 'ap1',
  courseName: 'AP1',
  sectionId: 's5',
  order: 0,
  title: `Activité ${id}`,
  openAt: at(1, 8),
  closeAt: null,
  state: 'opened',
  isChallenge: false,
  graded: false,
  exerciseCount: 8,
  exercisesDone: 0,
  started: false,
  terminated: false,
  correcting: false,
  ...values,
})
