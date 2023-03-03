import { Routes } from '@angular/router';
import ResourcesPage from './resources.page';

export default [
  {
    path: '',
    component: ResourcesPage
  },
  {
    path: 'create',
    loadChildren: () => import(
      /* webpackChunkName: "resource-create" */
      './create/create.routes'
    )
  },
  {
    path: ':id',
    loadChildren: () => import(
      /* webpackChunkName: "resource-detail" */'./resource/resource.routes',
    )
  },
] as Routes;
