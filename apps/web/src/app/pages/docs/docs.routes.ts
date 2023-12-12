import { Routes } from '@angular/router'
import { createWebComponentDoc } from '@platon/feature/webcomponent'
import { DocsPage } from './docs.page'

export default [
  {
    path: '',
    component: DocsPage,
  },
  {
    path: 'components',
    loadChildren: () => import('@cisstech/nge/doc').then((m) => m.NgeDocModule),
    data: [
      createWebComponentDoc({
        root: '/docs/components/',
        backUrl: '/docs',
      }),
    ],
  },
] as Routes
