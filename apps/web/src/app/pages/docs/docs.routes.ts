import { Routes } from '@angular/router'
import { NgeDocLinAction, NgeDocSettings } from '@cisstech/nge/doc'
import { createWebComponentDoc } from '@platon/feature/webcomponent'
import { DocsPage } from './docs.page'

const editInGithubAction = (url: string) => {
  const base = 'https://github.com/PlatonOrg/platon/blob/main/shared/assets/docs/'
  return {
    title: 'Edit on github',
    icon: 'https://icongr.am/octicons/mark-github.svg',
    run: base + url,
  } as NgeDocLinAction
}

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
    {
      title: 'Présentation',
      href: 'presentation',
      renderer: 'assets/docs/developers/index.md',
      actions: [editInGithubAction('developers/index.md')],
    },
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
    {
      title: 'Présentation',
      href: 'presentation',
      renderer: 'assets/docs/teachers/index.md',
      actions: [editInGithubAction('teachers/index.md')],
    },
    {
      title: 'Les cercles',
      href: 'circles',
      renderer: 'assets/docs/teachers/circles.md',
      actions: [editInGithubAction('teachers/circles.md')],
    },
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
