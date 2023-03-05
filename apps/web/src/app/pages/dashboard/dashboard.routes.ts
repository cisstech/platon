import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { OverviewPage } from './overview/overview.page';

export default [
  {
    path: '',
    component: DashboardPage,
    children: [
      { path: 'dashboard', component: OverviewPage },
      {
        path: 'resources',
        loadChildren: () => import(
          /* webpackChunkName: "resources" */
          '../resources/resources.routes'
        )
      },
      {
        path: 'account',
        loadChildren: () => import(
          /* webpackChunkName: "account" */
          '../account/account.routes',
        )
      },
      {
        path: 'activity',
        loadChildren: () => import(
          /* webpackChunkName: "activity" */
          '../activity/activity.routes'
        )
      },
      {
        path: 'courses',
        loadChildren: () => import(
          /* webpackChunkName: "courses" */
          '../courses/courses.routes'
        )
      },
      {
        path: 'forum',
        loadChildren: () => import(
          /* webpackChunkName: "forum" */
          '../forum/forum.routes'
        )
      },
      {
        path: 'settings',
        loadChildren: () => import(
          /* webpackChunkName: "settings" */
          '../settings/settings.routes'
        )
      }
    ]
  },
] as Routes;
