import { Route } from '@angular/router'
import { noTheme } from '@platon/core/browser'
import { LandingPage } from './landing/landing.page'

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingPage,
    data: {
      ...noTheme,
    },
  },
  {
    path: 'playground',
    title: 'PLaTon - Playground',
    loadChildren: () =>
      import(
        /* webpackChunkName: "playground" */
        './playground/playground.routes'
      ),
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
]
