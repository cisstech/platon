import { userDisplayName } from '@platon/core/common'
import { IconName } from '@platon/design-system'
import { Course, CourseStatistic } from '@platon/feature/course/common'
import { plural } from './plural'

/** A figure of the headcount, in full: « 302 étudiants ». */
export interface HeadcountView {
  readonly icon: IconName
  readonly value: number
  readonly label: string
}

export const headcount = (statistic?: CourseStatistic): HeadcountView[] =>
  statistic
    ? [
        {
          icon: 'person',
          value: statistic.teacherCount,
          label: plural(statistic.teacherCount, 'enseignant', 'enseignants'),
        },
        {
          icon: 'groups',
          value: statistic.studentCount,
          label: plural(statistic.studentCount, 'étudiant', 'étudiants'),
        },
        {
          icon: 'widgets',
          value: statistic.activityCount,
          label: plural(statistic.activityCount, 'activité', 'activités'),
        },
      ]
    : []

/**
 * Who teaches a course: who is responsible for it, then how many others teach it. « Karim Haddad et 5
 * autres enseignants », or, where the course itself is read, `responsible` names their role:
 * « Karim Haddad, responsable, et 5 autres enseignants ».
 */
export const teachersLine = (course: Course, options: { responsible?: boolean } = {}): string => {
  const count = course.statistic?.teacherCount ?? 1
  if (!course.owner) return `${count} ${plural(count, 'enseignant', 'enseignants')}`
  const others = count - 1
  const name = options.responsible ? `${userDisplayName(course.owner)}, responsable` : userDisplayName(course.owner)
  if (others <= 0) return name
  const rest = `${others} ${plural(others, 'autre enseignant', 'autres enseignants')}`
  return options.responsible ? `${name}, et ${rest}` : `${name} et ${rest}`
}
