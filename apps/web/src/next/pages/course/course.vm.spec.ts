import { Course } from '@platon/feature/course/common'
import {
  createdLine,
  crumbsOf,
  figuresOf,
  filterOutcome,
  grouped,
  nextDeadline,
  sectionSummary,
  shareLinks,
  tabsOf,
  teaches,
} from './course.vm'
import { at, course, LOCALE, NOW, playable, section, taught, words } from './testing/course-world'

describe('teaches', () => {
  it('reads the course as its teacher who may change it, whatever their role on the platform', () => {
    expect(teaches(course())).toBe(true)
    expect(teaches(course({ permissions: { update: false, archive: true } }))).toBe(false)
  })
})

describe('tabsOf', () => {
  it('gives a teacher every tab, a student the overview and the challenges, counted', () => {
    const labels = (tabs: ReturnType<typeof tabsOf>) => tabs.map(({ label, count, href }) => [label, count, href])

    expect(labels(tabsOf(course(), true))).toEqual([
      ["Vue d'ensemble", undefined, '/courses/ap1'],
      ['Challenges', 1, '/courses/ap1/challenges'],
      ['Membres', 308, '/courses/ap1/members'],
      ['Groupes', undefined, '/courses/ap1/groups'],
      ['Paramètres', undefined, '/courses/ap1/settings'],
    ])
    expect(labels(tabsOf(course(), false))).toEqual([
      ["Vue d'ensemble", undefined, '/courses/ap1'],
      ['Challenges', 1, '/courses/ap1/challenges'],
    ])
  })

  it('leaves out the challenges of a course without any', () => {
    const none = course({ statistic: { ...course().statistic, challengeCount: 0 } as Course['statistic'] })

    expect(tabsOf(none, false).map(({ label }) => label)).toEqual(["Vue d'ensemble"])
  })
})

describe('createdLine and nextDeadline', () => {
  it('says when the course was created and by whom, the first of the month written « 1er »', () => {
    expect(createdLine(course(), NOW, LOCALE)).toBe('créé le 1er septembre par Karim Haddad')
    expect(createdLine(course({ createdAt: at(14, 9) }), NOW, LOCALE)).toBe('créé le 14 septembre par Karim Haddad')
    expect(createdLine(course({ createdAt: at(28, 9) }), NOW, LOCALE)).toBe("créé aujourd'hui par Karim Haddad")
  })

  it('says the next deadline of a student among what is left to do, or none', () => {
    const activities = [
      playable('later', { closeAt: at(1, 18, 0, 9) }),
      playable('tonight', { closeAt: at(28, 23, 59) }),
      playable('done', { closeAt: at(28, 16), terminated: true }),
    ]

    expect(words(nextDeadline(activities, NOW, LOCALE))).toBe('Prochaine échéance ce soir à 23 h 59')
    expect(nextDeadline([playable('free')], NOW, LOCALE)).toBeUndefined()
  })

  it('leaves out an activity whose every exercise is done, as the binder of the course does', () => {
    const activities = [
      playable('all-done', { closeAt: at(28, 18), exercisesDone: 8, exerciseCount: 8 }),
      playable('later', { closeAt: at(1, 18, 0, 9) }),
    ]

    expect(words(nextDeadline(activities, NOW, LOCALE))).toBe('Prochaine échéance jeudi à 18 h')
  })
})

describe('grouped', () => {
  const sections = [section('s4', 'Semaine 4', 1), section('s5', 'Semaine 5', 0), section('s6', 'Vide', 2)]
  const activities = [
    taught('tp4', { sectionId: 's4', order: 1, title: 'TP 4 : boucles' }),
    taught('quiz', { sectionId: 's4', order: 0, title: 'Quiz : complexité', state: 'planned' }),
    taught('tp5', { sectionId: 's5', title: 'TP 5 : récursivité' }),
  ]
  const shown = (filters: Parameters<typeof grouped>[2]) =>
    grouped(sections, activities, filters).map(({ section, activities }) => [
      section.name,
      activities.map(({ id }) => id),
    ])

  it('keeps the order the teacher gives the sections and their activities, an empty section too', () => {
    expect(shown({ search: '', state: 'all' })).toEqual([
      ['Semaine 5', ['tp5']],
      ['Semaine 4', ['quiz', 'tp4']],
      ['Vide', []],
    ])
  })

  it('searches the titles and the names of the sections, hiding what keeps nothing', () => {
    expect(shown({ search: 'recursivite', state: 'all' })).toEqual([['Semaine 5', ['tp5']]])
    expect(shown({ search: 'semaine 4', state: 'all' })).toEqual([['Semaine 4', ['quiz', 'tp4']]])
  })

  it('keeps the activities of one state', () => {
    expect(shown({ search: '', state: 'planned' })).toEqual([['Semaine 4', ['quiz']]])
  })
})

describe('crumbsOf', () => {
  it('leads back to the list of courses, then names the course', () => {
    expect(crumbsOf(course())).toEqual([
      { label: 'Cours', link: '/courses' },
      { label: 'Algorithmique et programmation 1' },
    ])
  })
})

describe('filterOutcome and sectionSummary', () => {
  it('says how many activities a search leaves, or that none matches', () => {
    const groups = grouped([section('s5', 'Semaine 5', 0)], [taught('a'), taught('b')], { search: '', state: 'all' })

    expect(filterOutcome(groups)).toBe('2 activités')
    expect(filterOutcome([])).toBe('Aucune activité ne correspond')
  })

  it('says what a section holds, and on a phone what is left to do in it', () => {
    expect(sectionSummary([1, 2, 3])).toBe('3 activités')
    expect(sectionSummary([1], 1)).toBe('1 activité, 1 à faire')
    expect(sectionSummary([1, 2], 0)).toBe('2 activités, rien à faire')
  })
})

describe('shareLinks', () => {
  it('gives the address of the course in PLaTon, and the one an LMS opens through LTI', () => {
    expect(shareLinks('ap1', 'https://platon.example')).toEqual({
      platon: 'https://platon.example/courses/ap1',
      lti: 'https://platon.example/api/v1/lti/launch?next=/courses/ap1',
    })
  })
})

describe('figuresOf', () => {
  it('gives a teacher the headcount and when the course was created, a student who teaches and their deadline', () => {
    const labels = (figures: ReturnType<typeof figuresOf>) =>
      figures.map(({ value, label }) => words([value, label].filter((part) => part !== undefined).join(' ')))

    expect(labels(figuresOf(course(), true, [], NOW, LOCALE))).toEqual([
      '6 enseignants',
      '302 étudiants',
      '9 activités',
      'créé le 1er septembre par Karim Haddad',
    ])
    expect(labels(figuresOf(course(), false, [playable('quiz', { closeAt: at(28, 23, 59) })], NOW, LOCALE))).toEqual([
      'Karim Haddad, responsable, et 5 autres enseignants',
      'Prochaine échéance ce soir à 23 h 59',
    ])
    expect(labels(figuresOf(course(), false, [], NOW, LOCALE))).toEqual([
      'Karim Haddad, responsable, et 5 autres enseignants',
    ])
  })
})
