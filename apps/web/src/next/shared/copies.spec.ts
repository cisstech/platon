import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { copiesToCorrect, pendingCopies } from './copies'

const summary = (pending?: number) => ({ pendingCopies: pending } as ActivityCorrectionSummary)

describe('copies to correct', () => {
  it('counts the copies to correct over every activity, a summary without the count as none', () => {
    expect(pendingCopies([summary(2), summary(1), summary(undefined)])).toBe(3)
    expect(pendingCopies([])).toBe(0)
  })

  it('says what follows their number, in the singular up to one', () => {
    expect([1, 2].map(copiesToCorrect)).toEqual(['copie à corriger', 'copies à corriger'])
  })
})
