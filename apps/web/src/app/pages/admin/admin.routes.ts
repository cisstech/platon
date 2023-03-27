import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { AdminPage } from './admin.page';

export default [
  withAuthGuard(
    {
      path: '',
      component: AdminPage,
      children: [
        {
          path: 'users',
          loadChildren: () => import(
            /* webpackChunkName: "admin-users" */
            './users/users.routes'
          )
        },
        {
          path: 'groups',
          loadChildren: () => import(
            /* webpackChunkName: "admin-groups" */
            './groups/groups.routes'
          )
        },
        {
          path: 'lmses',
          loadChildren: () => import(
            /* webpackChunkName: "admin-lmses" */
            './lmses/lmses.routes'
          )
        },
        {
          path: 'tags',
          loadChildren: () => import(
            /* webpackChunkName: "admin-tags" */
            './tags/tags.routes'
          )
        },
        { path: '**', pathMatch: 'full', redirectTo: 'users' }
      ],
    },
    ['admin']
  ),
] as Routes;
