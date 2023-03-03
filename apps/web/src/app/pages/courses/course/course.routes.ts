import { Routes } from '@angular/router';
import { CoursePage } from './course.page';

export default [
  {
    path: '',
    component: CoursePage,
    children: [
      {
        path: 'overview',
        loadChildren: () => import(
          /* webpackChunkName: "resource-overview" */
          './overview/overview.routes'
        )
      },
      { path: '**', pathMatch: 'full', redirectTo: 'overview' }
    ],
  },
] as Routes;
