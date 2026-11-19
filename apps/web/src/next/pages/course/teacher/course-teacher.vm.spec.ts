import { TaughtActivity } from '@platon/feature/course/common'
import { at, LOCALE, NOW, taught, words } from '../testing/course-world'
import { teacherRow, teacherTodo } from './course-teacher.vm'

describe('teacherRow', () => {
  const row = (values: Partial<TaughtActivity>) => teacherRow(taught('a', values), NOW, LOCALE)

  it('says the state with its glyph, the dates in words, the limits and the exercises, and opens the monitoring', () => {
    const exam = row({
      title: 'Examen partiel 2',
      state: 'planned',
      openAt: at(12, 8, 0, 9),
      graded: true,
      duration: 5400,
      attempts: 1,
    })

    expect(exam).toMatchObject({
      heading: 'Examen partiel 2',
      icon: 'history_edu',
      hue: expect.any(String),
      status: 'Planifiée',
      statusTone: 'info',
      statusIcon: 'event',
      tag: 'Notée',
      href: '/activities/monitor/ap1/a',
    })
    expect(words(exam.due)).toBe('Ouvre le lundi 12 octobre à 8 h')
    expect(words(exam.detail)).toBe('1 h 30 min, une tentative, 8 exercices')
    expect(exam.plan).toBeUndefined()
  })

  it('offers to plan an open activity without dates: neutral for a practice, a warning for a graded one', () => {
    const practice = row({ openAt: null })
    const exam = row({ openAt: null, graded: true })

    expect(practice).toMatchObject({ status: 'Ouverte', statusTone: 'success', due: 'Sans dates', dueTone: 'neutral' })
    expect(practice.plan).toBe('/activities/ap1/a')
    expect(exam).toMatchObject({ status: 'Ouverte', due: 'Sans dates', dueTone: 'warning', dueIcon: 'priority_high' })
  })

  it('says an open activity closes, or that it never does, without a button', () => {
    expect(words(row({ closeAt: at(28, 23, 59) }).due)).toBe('Ferme ce soir à 23 h 59')
    expect(row({ closeAt: at(28, 23, 59) })).toMatchObject({ dueTone: 'warning', plan: undefined })
    expect(row({}).due).toBe('Sans fermeture')
  })

  it('says a closed activity in correction with its copies, else when it closed', () => {
    expect(row({ state: 'closed', closeAt: at(22, 18), pendingCopies: 14, graded: true })).toMatchObject({
      status: 'En correction',
      statusTone: 'warning',
      statusIcon: 'pending',
      due: '14 copies à corriger',
    })
    const closed = row({ state: 'closed', closeAt: at(21, 18) })
    expect(closed).toMatchObject({ status: 'Fermée le 21 sept.', statusIcon: 'event_busy' })
    expect(closed.due).toBeUndefined()
  })

  it('names in its menu what to do with it: settle it, test it, open its resource', () => {
    expect(row({}).menu).toEqual({
      settings: '/activities/ap1/a',
      test: '/player/activity/a',
      resource: '/resources/r1',
    })
    expect(row({ resourceId: undefined }).menu.resource).toBeUndefined()
  })
})

describe('teacherTodo', () => {
  it('lists the copies to correct of the whole course, what to plan and what closes within a day', () => {
    const todo = teacherTodo(
      [
        taught('exam', {
          title: 'Examen partiel 1',
          state: 'closed',
          pendingCopies: 14,
          correctors: ['Julien Lefèvre'],
        }),
        taught('tp5', { title: 'TP 5', openAt: null }),
        taught('quiz', { title: 'Quiz', closeAt: at(28, 23, 59), startedCount: 251 }),
        taught('tp4', { title: 'TP 4', closeAt: at(2, 18, 0, 9) }),
      ],
      NOW,
      LOCALE
    )

    expect(todo.map(({ heading, detail }) => [words(heading), detail])).toEqual([
      ['14 copies à corriger', 'Examen partiel 1, confiées à Julien Lefèvre'],
      ['TP 5 à planifier', "Ouverte, sans dates. 23 étudiants l'ont déjà commencé."],
      ['Ferme ce soir à 23 h 59', 'Quiz, 251 sur 302 ont commencé'],
    ])
    expect(todo.map(({ href }) => href)).toEqual([
      '/player/correction/ap1',
      '/activities/ap1/tp5',
      '/activities/monitor/ap1/quiz',
    ])
    expect(todo[0].queryParams).toEqual({ activityId: 'exam' })
    expect(todo[2].tone).toBe('warning')
  })

  it('agrees with one copy, and says when no one started an activity to plan', () => {
    const todo = teacherTodo(
      [
        taught('exam', { title: 'Examen', state: 'closed', pendingCopies: 1, correctors: ['Léa Fontaine', 'Julien'] }),
        taught('tp5', { title: 'TP 5', openAt: null, startedCount: 0 }),
      ],
      NOW,
      LOCALE
    )

    expect(todo.map(({ heading, detail }) => [heading, detail])).toEqual([
      ['1 copie à corriger', 'Examen, confiée à Léa Fontaine et Julien'],
      ['TP 5 à planifier', "Ouverte, sans dates. Aucun étudiant ne l'a encore commencé."],
    ])
  })
})
