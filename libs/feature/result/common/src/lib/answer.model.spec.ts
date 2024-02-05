import { AnswerStates, answerStateFromGrade } from './answer.model'

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
