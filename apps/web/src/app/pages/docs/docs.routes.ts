import { Routes } from '@angular/router'
import { NgeDocSettings } from '@cisstech/nge/doc'
import { createWebComponentDoc } from '@platon/feature/webcomponent'
import { DocsPage } from './docs.page'

const DeveloperDocs = {
  meta: {
    name: 'PLaTon pour les développeurs',
    root: '/docs/developers/',
    logo: 'assets/images/logo/platon.svg',
    backUrl: '/docs',
    repo: {
      name: 'platon',
      url: 'https://github.com/PlatonOrg/platon',
    },
  },
  pages: [
    { title: 'Présentation',
    href: 'presentation',
    renderer: 'assets/docs/developers/index.md' ,
    actions: [
      {
        title: 'Éditer sur Github',
        icon: 'https://icongr.am/octicons/mark-github.svg',
        run: `https://github.com/PlatonOrg/platon/blob/main/shared/assets/docs/developers/index.md`,
      }]
  }
  ],
} as NgeDocSettings

const TeacherDocs = {
  meta: {
    name: 'PLaTon pour les enseignants',
    root: '/docs/teachers/',
    logo: 'assets/images/logo/platon.svg',
    backUrl: '/docs',
    repo: {
      name: 'platon',
      url: 'https://github.com/PlatonOrg/platon',
    },
  },
  pages: [
    { title: 'Présentation',
    href: 'presentation',
    renderer: 'assets/docs/teachers/index.md' ,
    actions: [
      {
        title: 'Éditer sur Github',
        icon: 'https://icongr.am/octicons/mark-github.svg',
        run: `https://github.com/PlatonOrg/platon/blob/main/shared/assets/docs/developers/teachers.md`,
      }]
  }
  ],
} as NgeDocSettings

export default [
  {
    path: '',
    component: DocsPage,
  },
  {
    path: '**',
    loadChildren: () => import('@cisstech/nge/doc').then((m) => m.NgeDocModule),
    data: [
      DeveloperDocs,
      TeacherDocs,
      createWebComponentDoc({
        root: '/docs/pages/',
        backUrl: '/docs',
      }),
    ],
  },
] as Routes
