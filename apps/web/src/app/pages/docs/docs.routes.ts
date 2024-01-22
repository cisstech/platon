import { Routes } from '@angular/router'
import { createWebComponentDoc } from '@platon/feature/webcomponent'

export default [
  {
    path: 'components',
    loadChildren: () => import('@cisstech/nge/doc').then((m) => m.NgeDocModule),
    data: [
      createWebComponentDoc({
        root: '/docs/components/',
        backUrl: '/',
      }),
    ],
  },
] as Routes
