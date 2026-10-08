import { UserRoles } from '@platon/core/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import {
  accountType,
  coverEntries,
  createEntries,
  createTarget,
  helpInFoot,
  parentResource,
  pendingCopies,
} from './cover.vm'

const summary = (pendingCopies: number): ActivityCorrectionSummary => ({
  activityId: 'a',
  activityName: 'TP 3',
  courseId: 'c',
  courseName: 'AP1',
  totalExercises: 10,
  correctedExercises: 4,
  pendingCopies,
})

const labels = (role: UserRoles, summaries?: ActivityCorrectionSummary[]) =>
  coverEntries(role, summaries).map((entry) => entry.label)

describe('coverEntries', () => {
  it('gives a student the home, the announcements and the courses', () => {
    expect(labels(UserRoles.student)).toEqual(['Accueil', 'Annonces', 'Cours'])
    expect(labels(UserRoles.demo)).toEqual(['Accueil', 'Annonces', 'Cours'])
  })

  it('adds Corrections for a student who corrects, even when everything is corrected', () => {
    expect(labels(UserRoles.student, [summary(0)])).toEqual(['Accueil', 'Annonces', 'Cours', 'Corrections'])
  })

  it('gives a teacher Corrections, the resources and the tests, always', () => {
    expect(labels(UserRoles.teacher)).toEqual([
      'Accueil',
      'Annonces',
      'Cours',
      'Corrections',
      'Ressources',
      "Tests d'entrée",
    ])
  })

  it('adds the administration for an administrator, last', () => {
    expect(labels(UserRoles.admin).at(-1)).toBe('Administration')
  })

  it('counts the copies to correct over every activity, and says so', () => {
    const corrections = coverEntries(UserRoles.teacher, [summary(2), summary(1)]).find((e) => e.label === 'Corrections')
    expect(corrections).toMatchObject({ count: 3, countLabel: 'copies à corriger' })
    expect(pendingCopies([summary(1)])).toBe(1)
    expect(coverEntries(UserRoles.teacher, [summary(1)]).find((e) => e.count)?.countLabel).toBe('copie à corriger')
  })

  it('shows no count when nothing waits', () => {
    expect(coverEntries(UserRoles.teacher, [summary(0)]).some((entry) => entry.count)).toBe(false)
  })

  it('keeps the addresses of the current interface', () => {
    expect(coverEntries(UserRoles.admin).map((entry) => entry.link)).toEqual([
      '/dashboard',
      '/announcements',
      '/courses',
      '/corrections',
      '/resources',
      '/tests',
      '/admin',
    ])
  })
})

describe('accountType and help', () => {
  it('names the type of account, never a gender', () => {
    expect(accountType(UserRoles.student)).toBe('Compte étudiant')
    expect(accountType(UserRoles.teacher)).toBe('Compte enseignant')
    expect(accountType(UserRoles.admin)).toBe('Compte administrateur')
  })

  it('puts the documentation in the foot for who creates, in the profile for the others', () => {
    expect(helpInFoot(UserRoles.teacher)).toBe(true)
    expect(helpInFoot(UserRoles.admin)).toBe(true)
    expect(helpInFoot(UserRoles.student)).toBe(false)
  })
})

describe('createEntries', () => {
  it('offers nothing to a student', () => {
    expect(createEntries(UserRoles.student)).toEqual([])
  })

  it('offers a course, an activity and an exercise to a teacher, in the order they nest', () => {
    expect(createEntries(UserRoles.teacher).map((entry) => entry.kind)).toEqual(['course', 'activity', 'exercise'])
    expect(createEntries(UserRoles.teacher).every((entry) => !/PLE|PLA/.test(entry.description))).toBe(true)
  })

  it('adds a circle for an administrator, last', () => {
    expect(createEntries(UserRoles.admin).at(-1)?.kind).toBe('circle')
  })
})

describe('createTarget', () => {
  it('creates a course on its own page', () => {
    expect(createTarget('course', '/resources/abc')).toEqual({ path: '/courses/create' })
  })

  it('creates a resource inside the resource open at the time', () => {
    expect(createTarget('exercise', '/resources/abc/overview?tab=1')).toEqual({
      path: '/resources/create',
      queryParams: { type: 'EXERCISE', parent: 'abc' },
    })
    expect(createTarget('activity', '/dashboard')).toEqual({
      path: '/resources/create',
      queryParams: { type: 'ACTIVITY' },
    })
  })

  it('never takes the creation page for a parent', () => {
    expect(parentResource('/resources/create?type=CIRCLE')).toBeUndefined()
    expect(parentResource('/courses/abc')).toBeUndefined()
  })
})
