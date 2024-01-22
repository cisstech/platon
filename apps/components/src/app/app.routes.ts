import { Route } from '@angular/router'
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
    loadChildren: () => import('@cisstech/nge/doc').then((m) => m.NgeDocModule),
    data: [
      createWebComponentDoc({
        root: '/',
        backUrl: undefined,
        backUrlHref: baseUrl(),
      }),
    ],
  },
  { path: '**', redirectTo: '/' },
]
