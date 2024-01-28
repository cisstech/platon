import { Route } from '@angular/router'
import { noTheme } from '@platon/core/browser'
import { LandingPage } from './landing/landing.page'
import { createWebComponentDoc } from '@platon/feature/webcomponent'

export const baseUrl = () => {
  let url = window.location.origin
  if (url.includes('github')) {
    url = `${url}/platon`
  }
  return url
}

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingPage,
    data: {
      ...noTheme,
    },
  },
  {
    path: 'docs/components',
    loadChildren: () => import('@cisstech/nge/doc').then((m) => m.NgeDocModule),
    data: [
      createWebComponentDoc({
        root: '/docs/components',
        backUrl: undefined,
        backUrlHref: baseUrl(),
      }),
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]
