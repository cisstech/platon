import { Routes } from '@angular/router';
import { ResourcePage } from './resource.page';

export default [
  {
    path: '',
    component: ResourcePage,
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
