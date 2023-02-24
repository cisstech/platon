import { Routes } from '@angular/router';
import { NgeDocSettings } from '@cisstech/nge/doc';
import { createWebComponentDoc } from '@platon/feature/webcomponent';
import { DocsComponent } from './docs.component';

const DeveloperDocs = {
  meta: {
    name: 'PLaTon pour les développeurs',
    root: '/docs/developers/',
    logo: 'assets/images/logo/platon.svg',
    backUrl: '/docs',
    repo: {
      name: 'platon',
      url: 'https://github.com/cisstech/platon'
    },
  },
  pages: [
    { title: 'Présentation', href: 'presentation', renderer: 'assets/docs/developers/index.md' }
  ],
} as NgeDocSettings;


export default [
  {
    path: '',
    component: DocsComponent
  },
  {
    path: '**',
    loadChildren: () => import('@cisstech/nge/doc').then(m => m.NgeDocModule),
    data: [
      DeveloperDocs,
      createWebComponentDoc({
        root: '/docs/components/',
        backUrl: '/docs',
      }),
    ],
  },
] as Routes;
