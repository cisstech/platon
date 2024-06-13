import { Routes } from '@angular/router'
import { DashboardPage } from './dashboard.page'
import { OverviewPage } from './overview/overview.page'

export default [
  {
    path: '',
    component: DashboardPage,
    children: [
      { title: 'PLaTon - Tableau de bord', path: 'dashboard', component: OverviewPage },
      {
        title: 'PLaTon - Agenda',
        path: 'agenda',
        loadChildren: () =>
          import(
            /* webpackChunkName: "agenda" */
            '../agenda/agenda.routes'
          ),
      },
      {
        title: 'PLaTon - Espace de travail',
        path: 'resources',
        loadChildren: () =>
          import(
            /* webpackChunkName: "resources" */
            '../resources/resources.routes'
          ),
      },
      {
        title: 'PLaTon - Mon compte',
        path: 'account',
        loadChildren: () =>
          import(
            /* webpackChunkName: "account" */
            '../account/account.routes'
          ),
      },
      {
        title: 'PLaTon - Activités',
        path: 'activities',
        loadChildren: () =>
          import(
            /* webpackChunkName: "activities" */
            '../activities/activities.routes'
          ),
      },
      {
        title: 'PLaTon - Cours',
        path: 'courses',
        loadChildren: () =>
          import(
            /* webpackChunkName: "courses" */
            '../courses/courses.routes'
          ),
      },
      {
        path: 'forum',
        loadChildren: () =>
          import(
            /* webpackChunkName: "forum" */
            '../forum/forum.routes'
          ),
      },
      {
        title: 'PLaTon - Corrections',
        path: 'corrections',
        loadChildren: () =>
          import(
            /* webpackChunkName: "corrections" */
            '../corrections/corrections.routes'
          ),
      },
      {
        title: 'PLaTon - Administration',
        path: 'admin',
        loadChildren: () =>
          import(
            /* webpackChunkName: "admin" */
            '../admin/admin.routes'
          ),
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
] as Routes
