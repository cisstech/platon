import { AnswerStates, answerStateFromGrade, isExerciseDone } from './answer.model'

describe('answerStateFromGrade', () => {
  it('should return AnswerStates.NOT_STARTED if grade is null', () => {
    const grade = null
    const result = answerStateFromGrade(grade)
    expect(result).toBe(AnswerStates.NOT_STARTED)
  })

  it('should return AnswerStates.SUCCEEDED if grade is 100', () => {
    const grade = 100
    const result = answerStateFromGrade(grade)
    expect(result).toBe(AnswerStates.SUCCEEDED)
  })

  it('should return AnswerStates.FAILED if grade is 0', () => {
    const grade = 0
    const result = answerStateFromGrade(grade)
    expect(result).toBe(AnswerStates.FAILED)
  })

  it('should return AnswerStates.PART_SUCC if grade is between 1 and 99', () => {
    const grade = 50
    const result = answerStateFromGrade(grade)
    expect(result).toBe(AnswerStates.PART_SUCC)
  })

  it('should return AnswerStates.ERROR if grade is -1', () => {
    const grade = -1
    const result = answerStateFromGrade(grade)
    expect(result).toBe(AnswerStates.ERROR)
  })
})

describe('isExerciseDone', () => {
  it('counts an exercise as done once answered, whatever its grade', () => {
    const done = [
      AnswerStates.ANSWERED,
      AnswerStates.SUCCEEDED,
      AnswerStates.PART_SUCC,
      AnswerStates.FAILED,
      AnswerStates.ERROR,
    ]

    expect(done.filter(isExerciseDone)).toEqual(done)
  })

  it('does not count an exercise not answered yet, opened or not', () => {
    expect(isExerciseDone(AnswerStates.NOT_STARTED)).toBe(false)
    expect(isExerciseDone(AnswerStates.STARTED)).toBe(false)
  })
})
