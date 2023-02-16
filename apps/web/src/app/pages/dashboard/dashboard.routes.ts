import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { OverviewComponent } from './overview/overview.component';

export default [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: OverviewComponent },
      {
        path: 'workspace',
        loadChildren: () => import(
          /* webpackChunkName: "workspace" */
          '../workspace/workspace.routes'
        )
      },
      {
        path: 'resource',
        loadChildren: () => import(
          /* webpackChunkName: "resource" */'../resource/resource.routes',
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
        path: 'docs',
        loadChildren: () => import(
          /* webpackChunkName: "docs" */
          '../docs/docs.routes'
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
