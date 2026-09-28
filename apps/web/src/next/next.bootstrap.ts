import { ApplicationRef } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { nextConfig } from './next.config'
import { NextRootComponent } from './next-root.component'

/** Starts the new interface. Loaded by `main.ts` only when this interface is chosen. */
export const bootstrap = (): Promise<ApplicationRef> => bootstrapApplication(NextRootComponent, nextConfig)
