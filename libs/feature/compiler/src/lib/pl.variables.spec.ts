import { ActivityExercise, extractExercisesFromActivityVariables, normalizeExerciseGroups } from './pl.variables'

const exercise = (id: string): ActivityExercise =>
  ({ id, resource: 'resource-' + id, version: 'latest', source: {} } as unknown as ActivityExercise)

describe('normalizeExerciseGroups', () => {
  it('keeps groups that already have a name, exercises and a grader', () => {
    const groups = { '0': { name: 'Semaine 1', exercises: [exercise('a')], grader: { type: 'mean' as const } } }
    expect(normalizeExerciseGroups(groups)).toEqual(groups)
  })

  it('wraps a group stored as a bare array of exercises', () => {
    expect(normalizeExerciseGroups({ '0': [exercise('a'), exercise('b')], '1': [exercise('c')] })).toEqual({
      '0': { name: 'Groupe 1', exercises: [exercise('a'), exercise('b')], grader: { type: 'empty' } },
      '1': { name: 'Groupe 2', exercises: [exercise('c')], grader: { type: 'empty' } },
    })
  })

  it('reads a top level array of groups', () => {
    expect(normalizeExerciseGroups([[exercise('a')]])).toEqual({
      '0': { name: 'Groupe 1', exercises: [exercise('a')], grader: { type: 'empty' } },
    })
  })

  it('fills a named group that misses its exercises or its grader', () => {
    expect(normalizeExerciseGroups({ '3': { name: 'Rattrapage' } })).toEqual({
      '3': { name: 'Rattrapage', exercises: [], grader: { type: 'empty' } },
    })
  })

  it('returns no group for a missing value', () => {
    expect(normalizeExerciseGroups(undefined)).toEqual({})
    expect(normalizeExerciseGroups(null)).toEqual({})
  })
})

describe('extractExercisesFromActivityVariables', () => {
  it('lists the exercises of both stored shapes', () => {
    const variables = {
      exerciseGroups: {
        '0': [exercise('a')],
        '1': { name: 'Semaine 2', exercises: [exercise('b'), exercise('c')], grader: { type: 'empty' } },
      },
    }
    expect(extractExercisesFromActivityVariables(variables as never).map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })
})
