import { User, UserRoles } from '@platon/core/common'
import { Activity, calculateActivityOpenState, canUserAnswerActivity } from './activity.model'

describe('canUserAnswerActivity', () => {
  it('should return true for non-challenge activities', () => {
    const activity = { isChallenge: false } as Activity
    const user = { role: UserRoles.student } as User

    const result = canUserAnswerActivity(activity, user)

    expect(result).toBe(true)
  })

  it('should return false for challenge activities if user is an admin', () => {
    const activity = { isChallenge: true } as Activity
    const user = { role: UserRoles.admin } as User

    const result = canUserAnswerActivity(activity, user)

    expect(result).toBe(false)
  })

  it('should return false for challenge activities if user is a teacher', () => {
    const activity = { isChallenge: true } as Activity
    const user = { role: UserRoles.teacher } as User

    const result = canUserAnswerActivity(activity, user)

    expect(result).toBe(false)
  })

  it('should return true for challenge activities if user is not a teacher', () => {
    const activity = { isChallenge: true } as Activity
    const user = { role: UserRoles.student } as User

    const result = canUserAnswerActivity(activity, user)

    expect(result).toBe(true)
  })
})

describe('calculateActivityOpenState', () => {
  it('should return "planned" when openAt is in the future and closeAt is defined', () => {
    const value = {
      openAt: new Date(Date.now() + 86400000), // Tomorrow
      closeAt: new Date(Date.now() + 172800000), // Day after tomorrow
    }

    const result = calculateActivityOpenState(value)

    expect(result).toBe('planned')
  })

  it('should return "opened" when openAt is in the past and closeAt is defined', () => {
    const value = {
      openAt: new Date(Date.now() - 86400000), // Yesterday
      closeAt: new Date(Date.now() + 86400000), // Tomorrow
    }

    const result = calculateActivityOpenState(value)

    expect(result).toBe('opened')
  })

  it('should return "closed" when closeAt is in the past and openAt is defined', () => {
    const value = {
      openAt: new Date(Date.now() - 86400000), // Yesterday
      closeAt: new Date(Date.now() - 43200000), // 12 hours ago
    }

    const result = calculateActivityOpenState(value)

    expect(result).toBe('closed')
  })

  it('should return "opened" when openAt is in the past and closeAt is not defined', () => {
    const value = {
      openAt: new Date(Date.now() - 86400000), // Yesterday
    }

    const result = calculateActivityOpenState(value)

    expect(result).toBe('opened')
  })

  it('should return "opened" when closeAt is in the future and openAt is not defined', () => {
    const value = {
      closeAt: new Date(Date.now() + 86400000), // Tomorrow
    }

    const result = calculateActivityOpenState(value)

    expect(result).toBe('opened')
  })

  it('should return "opened" when neither openAt nor closeAt are defined', () => {
    const value = {}

    const result = calculateActivityOpenState(value)

    expect(result).toBe('opened')
  })
})
