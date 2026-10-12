import { Course, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { copyViews, courseViews, emptySubtitle, figureViews, soonRows, subtitle, todoRows } from './student-home.vm'

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

describe('todoRows', () => {
  const rows = todoRows(
    [
      activity('later', { title: 'TP 4', closeAt: at(1, 18, 0, 9), started: true, exercisesDone: 3, exerciseCount: 8 }),
      activity('none', { title: 'TP 5', exerciseCount: 8 }),
      activity('tonight', { title: 'Quiz', closeAt: at(28, 23, 59), started: true, exercisesDone: 5 }),
      activity('planned', { state: 'planned', openAt: at(30, 10, 0) }),
      activity('closed', { state: 'closed', closeAt: at(27, 18, 0) }),
      activity('challenge', {
        title: 'Challenge',
        isChallenge: true,
        exercisesDone: 6,
        terminated: true,
        started: true,
      }),
    ],
    NOW,
    LOCALE
  )

  it('lists the open activities by deadline, those without one after', () => {
    expect(rows.map((row) => row.id)).toEqual(['tonight', 'later', 'challenge', 'none'])
  })

  it('says the deadline, close within 24 h as a warning', () => {
    expect(rows.map((row) => [words(row.due), row.dueTone])).toEqual([
      ['Ferme ce soir à 23 h 59', 'warning'],
      ['Ferme jeudi à 18 h', 'neutral'],
      ['Sans échéance', 'neutral'],
      ['Sans échéance', 'neutral'],
    ])
    expect(rows.map((row) => row.dueIcon)).toEqual(['schedule', 'schedule', undefined, undefined])
  })

  it('writes the action out, and carries it on a button for the first activity left to do only', () => {
    expect(rows.map((row) => [row.action, row.button])).toEqual([
      ['Reprendre', 'primary'],
      ['Reprendre', undefined],
      ['Voir mes résultats', undefined],
      ['Commencer', undefined],
    ])
    expect(rows[0].href).toBe('/player/activity/tonight')
  })

  it('counts the exercises done, in the hue of the course', () => {
    expect(rows[0]).toMatchObject({ done: 5, total: 6, progressText: '5 sur 6', progressHint: 'exercices faits' })
    expect([rows[0].hue, rows[1].hue]).toEqual(['raspberry', 'raspberry'])
  })

  it('takes the icon of a challenge, of an activity that counts, else of any activity', () => {
    const graded = todoRows([activity('g', { graded: true })], NOW, LOCALE)[0]
    expect(rows.map((row) => row.icon)).toEqual(['assignment', 'assignment', 'emoji_events', 'assignment'])
    expect(graded.icon).toBe('history_edu')
  })

  it('turns a deadline into a warning within 24 h, not beyond', () => {
    const minute = 60 * 1000
    const tones = todoRows(
      [
        activity('in', { closeAt: new Date(NOW.getTime() + 24 * 3600 * 1000 - minute) }),
        activity('out', { closeAt: new Date(NOW.getTime() + 24 * 3600 * 1000 + minute) }),
      ],
      NOW,
      LOCALE
    ).map((row) => [row.id, row.dueTone])
    expect(tones).toEqual([
      ['in', 'warning'],
      ['out', 'neutral'],
    ])
  })

  it('says an open activity counts in the grades, with its limits', () => {
    const [graded] = todoRows([activity('g', { graded: true, duration: 3600, attempts: 2 })], NOW, LOCALE)
    expect({ ...graded, detail: words(graded.detail) }).toMatchObject({
      tag: 'Notée',
      tagIcon: 'grading',
      detail: '1 h, 2 tentatives',
      progressText: '0 sur 6',
    })
  })

  it('gives no button when every open activity is done', () => {
    const done = todoRows([activity('d', { terminated: true, started: true })], NOW, LOCALE)
    expect([done[0].action, done[0].button]).toEqual(['Voir mes résultats', undefined])
  })
})

describe('soonRows', () => {
  it('says what opens within seven days, a graded one with its duration and attempts', () => {
    const rows = soonRows(
      [
        activity('cc2', {
          title: 'Contrôle continu 2',
          state: 'planned',
          openAt: at(30, 10, 0),
          graded: true,
          duration: 2700,
          attempts: 1,
        }),
        activity('far', { state: 'planned', openAt: at(12, 10, 0, 9) }),
        activity('open', { state: 'opened' }),
      ],
      NOW,
      LOCALE
    )

    expect(rows).toHaveLength(1)
    expect({ ...rows[0], due: words(rows[0].due), detail: words(rows[0].detail) }).toMatchObject({
      id: 'cc2',
      icon: 'history_edu',
      due: 'Ouvre mercredi à 10 h',
      dueTone: 'info',
      dueIcon: 'event',
      detail: '45 min, une tentative',
      tag: 'Notée',
      tagIcon: 'grading',
      action: 'Lire les règles',
    })
  })

  it('looks seven days ahead, not a minute more', () => {
    const minute = 60 * 1000
    const ids = soonRows(
      [
        activity('in', { state: 'planned', openAt: new Date(NOW.getTime() + 7 * 24 * 3600 * 1000 - minute) }),
        activity('out', { state: 'planned', openAt: new Date(NOW.getTime() + 7 * 24 * 3600 * 1000 + minute) }),
      ],
      NOW,
      LOCALE
    ).map((row) => row.id)
    expect(ids).toEqual(['in'])
  })

  it('counts several attempts, and says nothing of limits an activity does not set', () => {
    const [many, none] = soonRows(
      [
        activity('m', { state: 'planned', openAt: at(29, 8, 0), graded: true, attempts: 3 }),
        activity('n', { state: 'planned', openAt: at(29, 9, 0), graded: true }),
      ],
      NOW,
      LOCALE
    )
    expect(many.detail).toBe('3 tentatives')
    expect(none.detail).toBeUndefined()
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

    expect(views.map((view) => [view.name, view.percent, view.progressText, view.finished])).toEqual([
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
