import { Course, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { copyViews, courseViews, emptySubtitle, figureViews, subtitle } from './student-home.vm'

const LOCALE = 'fr-FR'
// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)
// Intl and the copy join numbers and units with no-break spaces.
const words = (text?: string) => text?.replace(/\s/g, ' ')

const activity = (id: string, values: Partial<PlayableActivity> = {}): PlayableActivity => ({
  id,
  courseId: 'c-ap1',
  courseName: 'Algorithmique 1',
  sectionId: 's-1',
  order: 0,
  title: `Activité ${id}`,
  openAt: at(1, 8, 0, 8),
  closeAt: null,
  state: 'opened',
  isChallenge: false,
  graded: false,
  exerciseCount: 6,
  exercisesDone: 0,
  started: false,
  terminated: false,
  ...values,
})

describe('subtitle', () => {
  it('says the day, then how many activities close this week, only when some do', () => {
    const closing = [
      activity('a1', { closeAt: at(28, 23, 59) }),
      activity('a2', { closeAt: at(1, 18, 0, 9) }),
      activity('a3', { closeAt: at(5, 18, 0, 9) }),
      activity('a4', { closeAt: at(2, 18, 0, 9), terminated: true }),
    ]

    expect(subtitle(NOW, LOCALE)).toBe('Lundi 28 septembre.')
    expect(subtitle(NOW, LOCALE, closing)).toBe('Lundi 28 septembre. Deux activités ferment cette semaine.')
    expect(subtitle(NOW, LOCALE, closing.slice(0, 1))).toBe('Lundi 28 septembre. Une activité ferme cette semaine.')
    expect(subtitle(NOW, LOCALE, [])).toBe('Lundi 28 septembre.')
  })

  it('welcomes a person without a course', () => {
    expect(emptySubtitle(NOW, LOCALE)).toBe(
      "Lundi 28 septembre. Votre espace est prêt, il n'attend plus que vos cours."
    )
  })
})

describe('copyViews', () => {
  const copy = (status: RecentCopy['status'], values: Partial<RecentCopy> = {}): RecentCopy => ({
    sessionId: `s-${status}`,
    activityId: `a-${status}`,
    activityTitle: 'TP 3 : conditions',
    courseId: 'c-ap1',
    courseName: 'Algorithmique 1',
    terminatedAt: at(22, 10, 0),
    status,
    ...values,
  })

  it('writes the grade in the margin and opens the corrected copy', () => {
    const [graded] = copyViews([copy('graded', { grade: 81.67 })], NOW, LOCALE)
    expect(graded).toMatchObject({
      heading: 'TP 3 : conditions',
      context: 'Algorithmique 1',
      date: 'Rendue le 22 septembre',
      grade: 82,
      gradeLabel: '82 sur 100',
      action: 'Voir la correction',
      actionIcon: 'rate_review',
      href: '/player/activity/a-graded',
    })
  })

  it('says a copy is being corrected, with an empty margin and no link', () => {
    const [correcting] = copyViews([copy('correcting')], NOW, LOCALE)
    expect(correcting).toMatchObject({ state: 'En correction', stateIcon: 'pending' })
    expect([correcting.grade, correcting.href]).toEqual([undefined, undefined])
  })

  it('says nothing of the grade an activity hides, and opens nothing', () => {
    const [hidden] = copyViews([copy('hidden')], NOW, LOCALE)
    expect([hidden.grade, hidden.state, hidden.action, hidden.href]).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ])
    expect(hidden.date).toBe('Rendue le 22 septembre')
  })
})

describe('courseViews', () => {
  const course = (id: string, name: string) => ({ id, name } as Course)

  it('counts the exercises done over every activity of each course', () => {
    const views = courseViews(
      [
        course('c-ap1', 'Algorithmique 1'),
        course('c-an1', 'Analyse 1'),
        course('c-al1', 'Algèbre 1'),
        course('c-new', 'Nouveau'),
      ],
      [
        activity('a1', { courseId: 'c-ap1', exercisesDone: 30, exerciseCount: 40 }),
        activity('a2', { courseId: 'c-ap1', exercisesDone: 4, exerciseCount: 19 }),
        activity('b1', { courseId: 'c-an1', exercisesDone: 1, exerciseCount: 40 }),
        activity('c1', { courseId: 'c-al1', exercisesDone: 12, exerciseCount: 12 }),
      ]
    )

    expect(views.map((view) => [view.name, view.percent, words(view.progressText), view.finished])).toEqual([
      ['Algorithmique 1', 58, '34 exercices sur 59', false],
      ['Analyse 1', 3, '1 exercice sur 40', false],
      ['Algèbre 1', 100, 'Cours terminé', true],
      ['Nouveau', 0, "Aucune activité pour l'instant", false],
    ])
    expect(views[0].href).toBe('/courses/c-ap1')
  })
})

describe('figureViews', () => {
  it('says the mean, the success and the time spent over all courses', () => {
    expect(
      figureViews({ averageScore: 78.4, successRate: 71.2, timeSpent: 41 * 3600 }, LOCALE).map((figure) => ({
        ...figure,
        value: words(figure.value),
        unit: words(figure.unit),
      }))
    ).toEqual([
      { label: 'Moyenne', value: '78', unit: '/ 100' },
      { label: 'Réussite', value: '71 %' },
      { label: 'Temps passé', value: '41 h' },
    ])
  })
})
