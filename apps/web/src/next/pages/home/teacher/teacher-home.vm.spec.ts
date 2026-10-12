import { Course, TaughtActivity } from '@platon/feature/course/common'
import { Resource, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import {
  gestureRows,
  runningRows,
  startsFromScratch,
  teacherCourses,
  teacherSubtitle,
  viewedViews,
} from './teacher-home.vm'

const LOCALE = 'fr-FR'
// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)
// Intl and the copy join numbers and units with no-break spaces.
const words = (text?: string) => text?.replace(/\s/g, ' ')

const taught = (id: string, values: Partial<TaughtActivity> = {}): TaughtActivity => ({
  id,
  courseId: 'c-ap1',
  courseName: 'Algorithmique 1',
  title: `Activité ${id}`,
  openAt: at(1, 8, 0, 8),
  closeAt: null,
  state: 'opened',
  restricted: false,
  isChallenge: false,
  graded: false,
  studentCount: 302,
  startedCount: 0,
  ...values,
})

const summary = (activityId: string, values: Partial<ActivityCorrectionSummary> = {}): ActivityCorrectionSummary => ({
  activityId,
  activityName: `Résumé ${activityId}`,
  courseId: 'c-web',
  courseName: 'Programmation web',
  totalExercises: 4,
  correctedExercises: 0,
  pendingCopies: 2,
  submittedCopies: 2,
  lastSubmittedAt: at(26, 10),
  ...values,
})

describe('teacherSubtitle', () => {
  it('says the day, then what closes this week and the copies to correct, only what is true', () => {
    const closing = [taught('a', { closeAt: at(28, 23, 59) }), taught('b', { closeAt: at(1, 18, 0, 9) })]

    expect(teacherSubtitle(NOW, LOCALE)).toBe('Lundi 28 septembre.')
    expect(teacherSubtitle(NOW, LOCALE, closing, [summary('p')])).toBe(
      'Lundi 28 septembre. Deux activités ferment cette semaine, 2 copies à corriger.'
    )
    expect(teacherSubtitle(NOW, LOCALE, [], [summary('p', { pendingCopies: 1 })])).toBe(
      'Lundi 28 septembre. 1 copie à corriger.'
    )
    expect(teacherSubtitle(NOW, LOCALE, closing.slice(0, 1), [summary('p', { pendingCopies: 0 })])).toBe(
      'Lundi 28 septembre. Une activité ferme cette semaine.'
    )
  })
})

describe('startsFromScratch', () => {
  it('holds for a teacher without a course, unless copies wait for them', () => {
    const course = { id: 'c-ap1' } as Course

    expect(startsFromScratch({ courses: [], corrections: [] })).toBe(true)
    expect(startsFromScratch({ courses: [], corrections: [summary('p', { pendingCopies: 0 })] })).toBe(true)
    expect(startsFromScratch({ courses: [], corrections: [summary('p')] })).toBe(false)
    expect(startsFromScratch({ courses: [course], corrections: [] })).toBe(false)
  })
})

describe('runningRows', () => {
  const rows = runningRows(
    [
      taught('tp4', { title: 'TP 4', closeAt: at(1, 18, 0, 9), startedCount: 187, averageGrade: 68.4 }),
      taught('challenge', { title: 'Challenge', isChallenge: true, startedCount: 118 }),
      taught('quiz', { title: 'Quiz', closeAt: at(28, 23, 59), startedCount: 251, averageGrade: 74 }),
      taught('periods', { title: 'Par groupes', openAt: null, restricted: true, startedCount: 1 }),
      taught('nodates', { title: 'TP 5', openAt: null }),
      taught('planned', { state: 'planned', openAt: at(5, 8, 0, 9) }),
      taught('closed', { state: 'closed', closeAt: at(27, 18) }),
    ],
    NOW,
    LOCALE
  )

  it('lists the open activities that follow dates, the closest deadline first', () => {
    expect(rows.map((row) => row.id)).toEqual(['quiz', 'tp4', 'challenge', 'periods'])
  })

  it('says the deadline, without one, or that the dates are set by period', () => {
    expect(rows.map((row) => [words(row.due), row.dueTone])).toEqual([
      ['Ferme ce soir à 23 h 59', 'warning'],
      ['Ferme jeudi à 18 h', 'neutral'],
      ['Sans fermeture', 'neutral'],
      ['Dates par période', 'neutral'],
    ])
  })

  it('writes the participation out, over a bar, and the mean as provisional', () => {
    expect(rows.map((row) => [row.progressText, row.done, row.total, words(row.detail)])).toEqual([
      ['251 sur 302 ont commencé', 251, 302, 'moyenne provisoire 74 / 100'],
      ['187 sur 302 ont commencé', 187, 302, 'moyenne provisoire 68 / 100'],
      ['118 sur 302 participent', 118, 302, undefined],
      ['1 sur 302 a commencé', 1, 302, undefined],
    ])
  })

  it('agrees the verb with a single participant, or none', () => {
    const [none, one] = runningRows(
      [
        taught('a', { closeAt: at(1, 18, 0, 9), startedCount: 0 }),
        taught('b', { closeAt: at(2, 18, 0, 9), isChallenge: true, startedCount: 1 }),
      ],
      NOW,
      LOCALE
    )
    expect([none.progressText, one.progressText]).toEqual(['0 sur 302 a commencé', '1 sur 302 participe'])
  })

  it('opens the monitoring of the activity, with no button and nothing written but the chevron', () => {
    expect(rows[0]).toMatchObject({ href: '/activities/monitor/c-ap1/quiz' })
    expect(rows.map((row) => [row.action, row.button])).toEqual(rows.map(() => [undefined, undefined]))
    expect(rows.map((row) => row.icon)).toEqual(['assignment', 'assignment', 'emoji_events', 'assignment'])
  })
})

describe('gestureRows', () => {
  const activities = [
    taught('projet', { title: 'Projet 1 : formulaire', courseId: 'c-web', courseName: 'Programmation web' }),
    taught('tp5', { title: 'TP 5', openAt: null, startedCount: 23 }),
    taught('exam', { title: 'Examen partiel 2', openAt: null, graded: true, startedCount: 1 }),
    taught('soon', { title: 'TP 6', state: 'planned', openAt: at(1, 8, 0, 9) }),
    taught('later', { title: 'TP 9', state: 'planned', openAt: at(26, 8, 0, 9) }),
    taught('partiel', { title: 'Partiel 3', state: 'planned', openAt: at(12, 8, 0, 9), graded: true }),
    taught('periods', { openAt: null, restricted: true }),
  ]
  const rows = gestureRows(
    activities,
    [
      summary('projet'),
      summary('done', { pendingCopies: 0 }),
      summary('unknown', { pendingCopies: 3, submittedCopies: 5 }),
      summary('untitled', { activityName: '', pendingCopies: 1, submittedCopies: 1 }),
    ],
    NOW,
    LOCALE
  )

  it('lists the copies to correct, the activities open without dates (those that count first), then the planned tests', () => {
    expect(rows.map((row) => row.id)).toEqual(['projet', 'unknown', 'untitled', 'exam', 'tp5', 'partiel'])
  })

  it('counts the copies to correct out of those handed in, a bar once some are corrected, and leads to the correction', () => {
    expect(rows[0]).toMatchObject({
      heading: 'Projet 1 : formulaire',
      context: 'Programmation web',
      detail: 'dernière copie rendue le 26 septembre',
      progressText: '2 copies à corriger sur 2',
      total: 0,
      action: 'Corriger',
      button: 'secondary',
      href: '/player/correction/c-web',
      queryParams: { activityId: 'projet' },
    })
    expect(rows[1]).toMatchObject({
      heading: 'Résumé unknown',
      progressText: '3 copies à corriger sur 5',
      done: 2,
      total: 5,
    })
    expect(rows[2]).toMatchObject({ heading: 'Activité sans titre', progressText: '1 copie à corriger sur 1' })
  })

  it('says an activity is open without dates, a warning for one that counts, and offers to plan it', () => {
    expect(rows.slice(3, 5).map((row) => [row.due, row.dueTone, row.dueIcon, row.detail, row.tag])).toEqual([
      ['Ouverte, sans dates', 'warning', 'warning', '1 étudiant a commencé', 'Notée'],
      ['Ouverte, sans dates', 'neutral', 'info', '23 étudiants ont commencé', undefined],
    ])
    expect(rows[4]).toMatchObject({ action: 'Planifier', button: 'secondary', href: '/activities/c-ap1/tp5' })
  })

  it('says when a planned test opens, whatever the date, and offers to review it', () => {
    expect(rows.slice(5).map((row) => [words(row.due), row.dueTone, row.action, row.href])).toEqual([
      ['Ouvre le lundi 12 octobre à 8 h', 'info', 'Relire les réglages', '/activities/c-ap1/partiel'],
    ])
  })
})

describe('teacherCourses', () => {
  it('says each course with its students and its teachers, in its hue', () => {
    const courses = teacherCourses([
      { id: 'c-ap1', name: 'Algorithmique 1', statistic: { studentCount: 302, teacherCount: 6 } } as Course,
      { id: 'c-java', name: 'Java, L3', statistic: { studentCount: 1, teacherCount: 1 } } as Course,
      { id: 'c-new', name: 'Nouveau' } as Course,
    ])

    expect(courses.map((course) => [course.name, course.members, course.href])).toEqual([
      ['Algorithmique 1', '302 étudiants, 6 enseignants', '/courses/c-ap1'],
      ['Java, L3', '1 étudiant, 1 enseignant', '/courses/c-java'],
      ['Nouveau', undefined, '/courses/c-new'],
    ])
    expect(courses[0].hue).toBe('raspberry')
  })
})

describe('viewedViews', () => {
  const resource = (id: string, type: ResourceTypes, status: ResourceStatus, viewedAt: Date) =>
    ({ id, name: `Ressource ${id}`, type, status, viewedAt } as Resource)

  it('shows the first three viewed, with what they are, when, and for an exercise its status', () => {
    const views = viewedViews(
      [
        resource('r1', ResourceTypes.EXERCISE, ResourceStatus.READY, at(28, 9)),
        resource('r2', ResourceTypes.EXERCISE, ResourceStatus.DRAFT, at(27, 16)),
        resource('r3', ResourceTypes.ACTIVITY, ResourceStatus.READY, at(25, 10)),
        resource('r4', ResourceTypes.CIRCLE, ResourceStatus.READY, at(24, 10)),
      ],
      NOW,
      LOCALE
    )

    expect(views.map((view) => [view.name, words(view.when), view.status?.label, view.status?.icon])).toEqual([
      ['Ressource r1', 'Exercice, il y a 5 h', 'Prêt', 'verified'],
      ['Ressource r2', 'Exercice, hier', 'Brouillon', 'save'],
      ['Ressource r3', 'Activité, vendredi', undefined, undefined],
    ])
    expect(views[0].href).toBe('/resources/r1')
  })

  it('says the other statuses of an exercise in their own words', () => {
    const [bugged] = viewedViews([resource('b', ResourceTypes.EXERCISE, ResourceStatus.BUGGED, at(28, 9))], NOW, LOCALE)
    expect(bugged.status).toMatchObject({ label: 'Contient des bugs', tone: 'warning' })
  })
})
