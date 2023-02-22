import { Routes } from '@angular/router';
import { ResourceComponent } from './resource.component';

export default [
  {
    path: 'create',
    loadChildren: () => import(
      /* webpackChunkName: "resource-create" */
      './create/create.routes'
    )
  },
  {
    path: 'preview',
    loadChildren: () => import(
      /* webpackChunkName: "resource-preview" */
      './preview/preview.routes'
    )
  },
  {
    path: ':id',
    component: ResourceComponent,
    children: [
      {
        path: 'overview',
        loadChildren: () => import(
          /* webpackChunkName: "resource-overview" */
          './overview/overview.routes'
        )
      },
      {
        path: 'browse',
        loadChildren: () => import(
          /* webpackChunkName: "resource-browse" */
          './browse/browse.routes'
        )
      },
      {
        path: 'events',
        loadChildren: () => import(
          /* webpackChunkName: "resource-events" */
          './events/events.routes'
        )
      },
      {
        path: 'settings',
        loadChildren: () => import(
          /* webpackChunkName: "resource-settings" */
          './settings/settings.routes'
        )
      },
      { path: '**', pathMatch: 'full', redirectTo: 'overview' }
    ],
  },
] as Routes;
