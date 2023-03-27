import { Routes } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import ResourcesPage from './resources.page';

export default [
  withAuthGuard(
    {
      path: '',
      component: ResourcesPage
    },
    ['admin', 'teacher']
  ),
  withAuthGuard(
    {
      path: 'create',
      loadChildren: () => import(
        /* webpackChunkName: "resource-create" */
        './create/create.routes'
      )
    },
    ['admin', 'teacher']
  ),
  withAuthGuard(
    {
      path: ':id',
      loadChildren: () => import(
        /* webpackChunkName: "resource-detail" */
        './resource/resource.routes',
      )
    },
    ['admin', 'teacher']
  ),
] as Routes;
