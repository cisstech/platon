import { Param, ParseUUIDPipe } from '@nestjs/common'
import { Transform } from 'class-transformer'
import { toBoolean } from './cast'

export const UUIDParam = (name: string) => Param(name, new ParseUUIDPipe())

/**
 * Reads a boolean from the address or the body: `true`, `1` and an empty value are true, anything else
 * false. A null or absent value stays unset, where `toBoolean` alone reads null as true.
 */
export const ToBoolean = () =>
  Transform(({ value }: { value: unknown }) => (value == null ? undefined : toBoolean(value as string)))

/**
 * Reads a number from the address or the body. An empty, null or absent value stays unset; anything
 * else that is not a number becomes `NaN`, so that `@IsInt()` or `@IsNumber()` refuses the request,
 * where `toNumber` would drop it silently.
 */
export const ToInt = () =>
  Transform(({ value }: { value: unknown }) => (value == null || value === '' ? undefined : Number(value)))
