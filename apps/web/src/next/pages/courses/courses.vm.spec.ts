import { convertToParamMap } from '@angular/router'
import { Course, CourseOrderings, PlayableActivity } from '@platon/feature/course/common'
import {
  asked,
  cardViews,
  challengesBadge,
  DEFAULT_FILTERS,
  filtersFrom,
  headcount,
  isFiltered,
  nextDue,
  noMatch,
  ORDERS,
  paramsOf,
  PERIODS,
  progressLine,
  searchOutcome,
  studentCard,
  teacherCard,
  teachersLine,
} from './courses.vm'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 8, day, hours, minutes)
const LOCALE = 'fr-FR'
const words = (text?: string) => text?.replace(/\s/g, ' ')

const karim = { id: 'u1', username: 'khaddad', firstName: 'Karim', lastName: 'Haddad' }
const course = (values: Partial<Course> = {}) =>
  ({
    id: 'ap1',
    name: 'Algorithmique et programmation 1',
    desc: 'Bases de la programmation en Python.',
    ownerId: 'u1',
    owner: karim,
    updatedAt: at(26, 9),
    statistic: { teacherCount: 6, studentCount: 302, activityCount: 9, challengeCount: 1 },
    permissions: { update: true, archive: true },
    ...values,
  } as Course)
const activity = (values: Partial<PlayableActivity>) =>
  ({
    id: 'a',
    courseId: 'ap1',
    title: 'TP',
    state: 'opened',
    exercisesDone: 0,
    exerciseCount: 4,
    terminated: false,
    ...values,
  } as PlayableActivity)

describe('headcount and challengesBadge', () => {
  it('says what each figure counts, in full', () => {
    expect(headcount(course().statistic).map(({ icon, value, label }) => [icon, value, label])).toEqual([
      ['person', 6, 'enseignants'],
      ['groups', 302, 'étudiants'],
      ['widgets', 9, 'activités'],
    ])
    expect(
      headcount({ teacherCount: 1, studentCount: 1, activityCount: 0 } as Course['statistic']).map((f) => f.label)
    ).toEqual(['enseignant', 'étudiant', 'activité'])
    expect(headcount(undefined)).toEqual([])
  })

  it('names the challenges of a course, and none when it has none', () => {
    expect(challengesBadge(1)).toBe('1 challenge')
    expect(challengesBadge(3)).toBe('3 challenges')
    expect(challengesBadge(0)).toBeUndefined()
  })
})

describe('teachersLine', () => {
  it('names who is responsible, then how many others teach', () => {
    expect(teachersLine(course())).toBe('Karim Haddad et 5 autres enseignants')
    expect(teachersLine(course({ statistic: { teacherCount: 2 } as Course['statistic'] }))).toBe(
      'Karim Haddad et 1 autre enseignant'
    )
    expect(teachersLine(course({ statistic: { teacherCount: 1 } as Course['statistic'] }))).toBe('Karim Haddad')
    expect(teachersLine(course({ owner: undefined }))).toBe('6 enseignants')
  })
})

describe('progressLine', () => {
  it('says the exercises done, then the activities finished, in words', () => {
    expect(
      words(progressLine({ done: 34, total: 59, percent: 58, finished: false, activitiesDone: 4, activityCount: 9 }))
    ).toBe('34 exercices sur 59, 4 activités terminées sur 9')
    expect(
      words(progressLine({ done: 12, total: 12, percent: 100, finished: true, activitiesDone: 4, activityCount: 4 }))
    ).toBe('Cours terminé, 4 activités sur 4')
    expect(progressLine({ done: 0, total: 0, percent: 0, finished: false, activitiesDone: 0, activityCount: 0 })).toBe(
      "Aucune activité pour l'instant"
    )
  })
})

describe('nextDue', () => {
  it('says the activity that closes first, a warning within a day', () => {
    const due = nextDue(
      'ap1',
      [
        activity({ id: 'b', title: 'TP 4', closeAt: at(30, 18) }),
        activity({ id: 'a', title: 'Quiz', closeAt: at(28, 23, 59) }),
        activity({ id: 'c', title: 'Autre cours', courseId: 'an1', closeAt: at(28, 16) }),
      ],
      NOW,
      LOCALE
    )

    expect(words(due.due)).toBe('Quiz : ferme ce soir à 23 h 59')
    expect(due).toMatchObject({ dueTone: 'warning', dueIcon: 'schedule' })
  })

  it('leaves out what is done or handed in, then says what opens next', () => {
    const due = nextDue(
      'ap1',
      [
        activity({ title: 'Fini', closeAt: at(28, 20), exercisesDone: 4 }),
        activity({ title: 'Rendu', closeAt: at(28, 21), terminated: true }),
        activity({ title: 'Contrôle continu 2', state: 'planned', openAt: at(30, 10) }),
      ],
      NOW,
      LOCALE
    )

    expect(words(due.due)).toBe('Contrôle continu 2 : ouvre mercredi à 10 h')
    expect(due).toMatchObject({ dueTone: 'info', dueIcon: 'event' })
  })

  it('says there is no deadline ahead', () => {
    expect(nextDue('ap1', [activity({ closeAt: null })], NOW, LOCALE)).toEqual({
      due: 'Aucune échéance à venir',
      dueTone: 'neutral',
    })
  })
})

describe('teacherCard and studentCard', () => {
  it('gives a teacher the headcount and the day of the last update', () => {
    const card = teacherCard(course(), LOCALE)

    expect(card).toMatchObject({
      id: 'ap1',
      heading: 'Algorithmique et programmation 1',
      monogram: 'AP1',
      href: '/courses/ap1',
      badge: '1 challenge',
      badgeHref: '/courses/ap1/challenges',
      archivable: true,
      kind: 'teacher',
    })
    expect(card.counts).toHaveLength(3)
    expect(card.updated).toBe('26 sept.')
  })

  it('gives a student their progress, who teaches and their next deadline, and no headcount', () => {
    const card = studentCard(
      course(),
      [activity({ title: 'Quiz', closeAt: at(28, 23, 59), exercisesDone: 1 })],
      NOW,
      LOCALE
    )

    expect(card.kind).toBe('student')
    expect(card.counts).toBeUndefined()
    expect(card.progress).toMatchObject({ done: 1, total: 4 })
    expect(card.percent).toBe(25)
    expect(card.teachers).toBe('Karim Haddad et 5 autres enseignants')
    expect(words(card.due?.due)).toBe('Quiz : ferme ce soir à 23 h 59')
  })

  it('says only who teaches on a course a student archived, whose activities are not listed', () => {
    const card = studentCard(course(), undefined, NOW, LOCALE)

    expect(card.progress).toBeUndefined()
    expect(card.due).toBeUndefined()
    expect(card.teachers).toBe('Karim Haddad et 5 autres enseignants')
  })
})

describe('filtersFrom and paramsOf', () => {
  it('reads the address of the current interface, and writes only what differs from the default', () => {
    const filters = filtersFrom(
      convertToParamMap({ q: 'algo', order: 'NAME', direction: 'DESC', period: '7', tab: 'archived' })
    )

    expect(filters).toEqual({ search: 'algo', order: CourseOrderings.NAME, period: 7, tab: 'archived' })
    expect(paramsOf(filters)).toEqual({ q: 'algo', order: 'NAME', period: 7, tab: 'archived', direction: null })
    expect(paramsOf(DEFAULT_FILTERS)).toEqual({ q: null, order: null, period: null, tab: null, direction: null })
  })

  it('falls back on the default for what it does not know', () => {
    expect(filtersFrom(convertToParamMap({ order: 'SIZE', period: '3', tab: 'trash' }))).toEqual({
      search: '',
      order: CourseOrderings.UPDATED_AT,
      period: 0,
      tab: 'current',
    })
  })
})

describe('ORDERS and PERIODS', () => {
  it('sort in the natural direction of each order, and limit to a rolling period of update', () => {
    expect(ORDERS.map(({ value, label }) => [value, label])).toEqual([
      ['UPDATED_AT', 'Mis à jour récemment'],
      ['CREATED_AT', 'Créés récemment'],
      ['NAME', 'Par nom'],
    ])
    expect(PERIODS.map(({ value, label }) => [value, words(label)])).toEqual([
      [0, 'Toutes les périodes'],
      [1, 'Dernières 24 h'],
      [7, '7 derniers jours'],
      [31, '31 derniers jours'],
      [180, '6 derniers mois'],
      [365, '12 derniers mois'],
    ])
  })
})

describe('noMatch', () => {
  it('says what found nothing, the search, the period or both, and what clears it', () => {
    expect(noMatch({ search: ' algo ', period: 0 })).toEqual({
      heading: 'Aucun cours ne correspond à «\u00a0algo\u00a0».',
      clear: 'Effacer la recherche',
    })
    expect(noMatch({ search: '', period: 7 })).toEqual({
      heading: 'Aucun cours mis à jour sur cette période.',
      clear: 'Voir toutes les périodes',
    })
    expect(noMatch({ search: 'algo', period: 7 })).toEqual({
      heading: 'Aucun cours ne correspond à «\u00a0algo\u00a0» sur cette période.',
      clear: 'Effacer les filtres',
    })
  })
})

describe('cardViews', () => {
  const context = { tab: 'current' as const, teaches: false, missing: new Set<string>(), now: NOW, locale: LOCALE }
  const activities = [activity({ exercisesDone: 1 })]

  it('offers no archiving on the whole platform, where every course shows as it is', () => {
    expect(cardViews([course()], { ...context, teaches: true }).map((card) => card.archivable)).toEqual([true])
    expect(
      cardViews([course()], { ...context, teaches: true, tab: 'platform' }).map((card) => card.archivable)
    ).toEqual([false])
  })

  it('says the progress of a student, but on their archives and on a course whose activities are on their way', () => {
    const progressOf = (values: Partial<typeof context>) =>
      cardViews([course()], { ...context, ...values, activities }).map((card) => card.progress?.done)

    expect(progressOf({})).toEqual([1])
    expect(progressOf({ tab: 'archived' })).toEqual([undefined])
    expect(progressOf({ missing: new Set(['ap1']) })).toEqual([undefined])
  })
})

describe('isFiltered, asked and searchOutcome', () => {
  it('tell a search or a period from the whole list, and what a search found', () => {
    expect(isFiltered({ search: '  ', period: 0 })).toBe(false)
    expect(isFiltered({ search: 'algo', period: 0 })).toBe(true)
    expect(isFiltered({ search: '', period: 7 })).toBe(true)
    expect(asked({ search: ' algo ', period: 7 })).toBe(asked({ search: 'algo', period: 7 }))
    expect(asked({ search: 'algo', period: 7 })).not.toBe(asked({ search: 'algo', period: 0 }))
    expect(searchOutcome(3, { search: 'algo', period: 0 })).toBe('3 cours')
    expect(searchOutcome(0, { search: '', period: 7 })).toBe('Aucun cours mis à jour sur cette période.')
  })
})
