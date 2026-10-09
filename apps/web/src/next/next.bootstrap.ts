import { ApplicationRef } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { UiBootContext } from '../shared/ui-boot-context'
import { nextConfig } from './next.config'
import { NextRoot } from './next-root'

export const bootstrap = (context: UiBootContext): Promise<ApplicationRef> =>
  bootstrapApplication(NextRoot, nextConfig(context))
