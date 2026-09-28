import { ApplicationRef } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app.config'
import { AppPage } from './app.page'

/** Starts the current interface. Loaded by `main.ts` only when this interface is chosen. */
export const bootstrap = (): Promise<ApplicationRef> => bootstrapApplication(AppPage, appConfig)
