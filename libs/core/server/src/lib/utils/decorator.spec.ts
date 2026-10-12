import { ValidationPipe } from '@nestjs/common'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { ToBoolean, ToInt } from './decorator'

class Filters {
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  readonly flag?: boolean

  @ToInt()
  @IsInt()
  @IsOptional()
  readonly count?: number
}

const read = (query: object) =>
  new ValidationPipe({ transform: true, forbidUnknownValues: false }).transform(query, {
    type: 'query',
    metatype: Filters,
  }) as Promise<Filters>

describe('ToBoolean', () => {
  it('reads true, 1 and an empty value as true, anything else as false', async () => {
    expect((await read({ flag: 'true' })).flag).toBe(true)
    expect((await read({ flag: '1' })).flag).toBe(true)
    expect((await read({ flag: '' })).flag).toBe(true)
    expect((await read({ flag: 'false' })).flag).toBe(false)
    expect((await read({ flag: 'no' })).flag).toBe(false)
  })

  it('leaves a null or absent value unset, where toBoolean alone reads null as true', async () => {
    expect((await read({ flag: null })).flag).toBeUndefined()
    expect((await read({})).flag).toBeUndefined()
  })
})

describe('ToInt', () => {
  it('reads a whole number, and leaves an empty, null or absent value unset', async () => {
    expect((await read({ count: '40' })).count).toBe(40)
    expect((await read({ count: '' })).count).toBeUndefined()
    expect((await read({ count: null })).count).toBeUndefined()
    expect((await read({})).count).toBeUndefined()
  })

  it('lets the validation refuse what is not a whole number, where toNumber would drop it silently', async () => {
    await expect(read({ count: 'abc' })).rejects.toBeDefined()
    await expect(read({ count: '2.5' })).rejects.toBeDefined()
  })
})
