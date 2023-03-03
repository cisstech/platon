import { Routes } from '@angular/router';
import { CourseComponent } from './course.component';

export default [
  {
    path: '',
    component: CourseComponent,
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
