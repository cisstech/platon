import { PlayableActivity } from '@platon/feature/course/common'
import { soonRows, todoRows } from './playable-activity'

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
