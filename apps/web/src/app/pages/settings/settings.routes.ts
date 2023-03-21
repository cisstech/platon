import { Routes } from '@angular/router';
import { SettingsPage } from './settings.page';

export default [
  {
    path: '',
    component: SettingsPage,
    children: [
      {
        path: 'users',
        loadChildren: () => import(
          /* webpackChunkName: "settings-users" */
          './users/users.routes'
        )
      },
      {
        path: 'groups',
        loadChildren: () => import(
          /* webpackChunkName: "settings-groups" */
          './groups/groups.routes'
        )
      },
      {
        path: 'lmses',
        loadChildren: () => import(
          /* webpackChunkName: "settings-lmses" */
          './lmses/lmses.routes'
        )
      },
      {
        path: 'tags',
        loadChildren: () => import(
          /* webpackChunkName: "settings-tags" */
          './tags/tags.routes'
        )
      },
      { path: '**', pathMatch: 'full', redirectTo: 'users' }
    ],
  },
] as Routes;
