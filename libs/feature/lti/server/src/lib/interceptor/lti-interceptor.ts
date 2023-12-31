import { SetMetadata } from '@nestjs/common'
import { LmsUserEntity } from '../entities/lms-user.entity'
import { LmsEntity } from '../entities/lms.entity'
import { LTIPayload } from '../provider/payload'

export const LTI_LAUNCH_INTERCEPTOR = Symbol('LTI_LAUNCH_INTERCEPTOR')

export interface LTILaunchInterceptorArgs {
  lms: LmsEntity
  lmsUser: LmsUserEntity
  payload: LTIPayload
  nextUrl: string
}

export interface LTILaunchInterceptor {
  intercept(args: LTILaunchInterceptorArgs): Promise<void>
}

export const RegisterLtiLaunchInterceptor = () => SetMetadata(LTI_LAUNCH_INTERCEPTOR, true)
