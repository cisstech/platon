import { ValidationPipe } from '@nestjs/common'
import { NotificationFiltersDTO } from './notification.dto'

describe('NotificationFiltersDTO', () => {
  const transform = (value: object) =>
    new ValidationPipe({ transform: true, forbidUnknownValues: false }).transform(value, {
      type: 'query',
      metatype: NotificationFiltersDTO,
    })

  it('reads the filters of the address as booleans and numbers', async () => {
    const filters = await transform({ unread: 'false', excludeSignals: 'true', offset: '40', limit: '20' })

    expect(filters).toEqual(expect.objectContaining({ unread: false, excludeSignals: true, offset: 40, limit: 20 }))
  })

  it('reads a null filter as absent, not as true', async () => {
    const filters = await transform({ unread: null, excludeSignals: true })

    expect(filters).toEqual(expect.objectContaining({ unread: undefined, excludeSignals: true }))
  })

  it('leaves the filters not given absent', async () => {
    const filters = await transform({})

    expect({ ...filters }).toEqual({})
  })

  it('refuses more than 50 notifications at a time, a negative offset, and what is not a number', async () => {
    await expect(transform({ limit: '51' })).rejects.toBeDefined()
    await expect(transform({ offset: '-1' })).rejects.toBeDefined()
    await expect(transform({ limit: 'abc' })).rejects.toBeDefined()
    await expect(transform({ offset: '2.5' })).rejects.toBeDefined()
  })
})
