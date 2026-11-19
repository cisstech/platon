import { Routes } from '@angular/router'
import { withAuthGuard } from '@platon/core/browser'
import { TemplatesPage } from './templates.page'

export default [
  withAuthGuard(
    {
      path: '',
      component: TemplatesPage,
    },
    ['admin', 'teacher']
  ),
] as Routes
