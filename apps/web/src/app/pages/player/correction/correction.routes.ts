import { Routes } from '@angular/router'
import { withAuthGuard } from '@platon/core/browser'
import { PlayerCorrectionPage } from './correction.page'

export default [
  withAuthGuard({
    path: ':id',
    component: PlayerCorrectionPage,
  }),
] as Routes
