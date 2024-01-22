import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { AppPage } from './app/app.page'

bootstrapApplication(AppPage, appConfig).catch((err) => console.error(err))
