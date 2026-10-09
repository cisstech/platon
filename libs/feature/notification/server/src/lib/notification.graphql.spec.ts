import { ValidationPipe } from '@nestjs/common'
import { NotificationFiltersInput } from './notification.graphql'

describe('NotificationFiltersInput', () => {
  const transform = (value: object) =>
    new ValidationPipe({ transform: true, forbidUnknownValues: false }).transform(value, {
      type: 'body',
      metatype: NotificationFiltersInput,
    })

  it('devrait lire un filtre à null comme absent, et non comme vrai', async () => {
    const filters = await transform({ unread: null, excludeSignals: true })

    expect(filters).toEqual(expect.objectContaining({ unread: undefined, excludeSignals: true }))
  })

  it('devrait garder les valeurs booléennes données', async () => {
    const filters = await transform({ unread: true, excludeSignals: false })

    expect(filters).toEqual(expect.objectContaining({ unread: true, excludeSignals: false }))
  })
})
