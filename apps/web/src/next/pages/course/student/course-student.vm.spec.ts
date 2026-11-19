import { PlayableActivity } from '@platon/feature/course/common'
import { at, course, LOCALE, NOW, playable, section, words } from '../testing/course-world'
import { phoneTodo, studentPanel, studentRow } from './course-student.vm'

describe('studentRow', () => {
  const row = (values: Partial<PlayableActivity>) => studentRow(playable('a', values), NOW, LOCALE)

  it('says the progress and what to do, a deadline or none', () => {
    expect(row({ closeAt: at(28, 23, 59), started: true, exercisesDone: 5, exerciseCount: 6 })).toMatchObject({
      progressText: '5 sur 6',
      done: 5,
      total: 6,
      action: 'Reprendre',
      button: 'secondary',
      href: '/player/activity/a',
    })
    expect(row({}).due).toBe('Sans échéance')
    expect(row({}).action).toBe('Commencer')
    expect(row({}).context).toBeUndefined()
  })

  it('says a planned activity is not open yet, without an action', () => {
    expect(row({ state: 'planned', openAt: at(12, 8, 0, 9) })).toMatchObject({
      progressText: 'Pas encore ouverte',
      action: undefined,
      total: 0,
    })
  })

  it('says the grade of a graded copy, or that it is being corrected', () => {
    const closed = { state: 'closed' as const, closeAt: at(21, 18), graded: true, started: true, terminated: true }

    expect(words(row({ ...closed, grade: 82 }).progressText)).toBe('82 / 100')
    expect(row({ ...closed, grade: 82 })).toMatchObject({ action: 'Voir mes résultats', due: 'Fermée le 21 sept.' })
    expect(row({ ...closed, correcting: true }).progressText).toBe('Copie en correction')
  })
})

describe('studentPanel', () => {
  it('says the progress in exercises, the time spent, and the activity to resume first', () => {
    const panel = studentPanel(
      course(),
      [
        playable('tp4', { title: 'TP 4', closeAt: at(1, 18, 0, 9), started: true, exercisesDone: 3 }),
        playable('quiz', { title: 'Quiz', closeAt: at(28, 23, 59), started: true, exercisesDone: 5, exerciseCount: 6 }),
        playable('done', { exercisesDone: 8, terminated: true }),
      ],
      NOW,
      LOCALE
    )

    expect(panel).toMatchObject({ done: 16, total: 22, percent: 73, finished: false })
    expect(words(panel.time)).toBe('9 h 40 min passées')
    expect(words(panel.progressLine)).toBe('16 exercices sur 22, 1 activité terminée sur 3')
    expect(panel.resume).toMatchObject({ heading: 'Quiz', action: 'Reprendre', button: 'primary' })
  })

  it('resumes the first activity left to do, even when one handed in closes before it', () => {
    const panel = studentPanel(
      course(),
      [
        playable('quiz', { title: 'Quiz', closeAt: at(28, 23, 59), started: true, terminated: true }),
        playable('tp4', { title: 'TP 4', closeAt: at(1, 18, 0, 9), started: true }),
      ],
      NOW,
      LOCALE
    )

    expect(panel.resume).toMatchObject({ heading: 'TP 4', action: 'Reprendre', context: undefined })
  })
})

describe('phoneTodo', () => {
  it('lists the open activities by deadline, each with the name of its section', () => {
    const rows = phoneTodo(
      [
        playable('tp4', { title: 'TP 4', sectionId: 's4', closeAt: at(1, 18, 0, 9) }),
        playable('quiz', { title: 'Quiz', sectionId: 's5', closeAt: at(28, 23, 59) }),
      ],
      [section('s4', 'Semaine 4', 0), section('s5', 'Semaine 5', 1)],
      NOW,
      LOCALE
    )

    expect(rows.map(({ heading, context }) => [heading, context])).toEqual([
      ['Quiz', 'Semaine 5'],
      ['TP 4', 'Semaine 4'],
    ])
  })
})
