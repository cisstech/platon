/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetMetadata } from '@nestjs/common'

export const SANDBOX = Symbol('SANDBOX')

export const RegisterSandbox = () => SetMetadata(SANDBOX, true)
