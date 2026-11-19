import { Course } from '@platon/feature/course/common'
import { headcount, teachersLine } from './course-people'

const karim = { id: 'u1', username: 'khaddad', firstName: 'Karim', lastName: 'Haddad' }
const course = (values: Partial<Course> = {}) =>
  ({
    id: 'ap1',
    name: 'Algorithmique et programmation 1',
    ownerId: 'u1',
    owner: karim,
    statistic: { teacherCount: 6, studentCount: 302, activityCount: 9, challengeCount: 1 },
    ...values,
  } as Course)

describe('headcount', () => {
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
})

describe('teachersLine', () => {
  const statistic = (teacherCount: number) => ({ statistic: { teacherCount } as Course['statistic'] })

  it('names who is responsible, then how many others teach', () => {
    expect(teachersLine(course())).toBe('Karim Haddad et 5 autres enseignants')
    expect(teachersLine(course(statistic(2)))).toBe('Karim Haddad et 1 autre enseignant')
    expect(teachersLine(course(statistic(1)))).toBe('Karim Haddad')
    expect(teachersLine(course({ owner: undefined }))).toBe('6 enseignants')
  })

  it('says their role where the course itself is read', () => {
    expect(teachersLine(course(), { responsible: true })).toBe('Karim Haddad, responsable, et 5 autres enseignants')
    expect(teachersLine(course(statistic(1)), { responsible: true })).toBe('Karim Haddad, responsable')
  })
})
