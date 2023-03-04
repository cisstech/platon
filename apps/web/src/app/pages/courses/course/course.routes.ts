import { Routes } from '@angular/router';
import { CoursePage } from './course.page';

export default [
  {
    path: '',
    component: CoursePage,
    children: [
      {
        path: 'home',
        loadChildren: () => import(
          /* webpackChunkName: "resource-home" */
          './home/home.routes'
        )
      },
      {
        path: 'teachers',
        loadChildren: () => import(
          /* webpackChunkName: "resource-teachers" */
          './teachers/teachers.routes'
        )
      },
      {
        path: 'students',
        loadChildren: () => import(
          /* webpackChunkName: "resource-students" */
          './students/students.routes'
        )
      },
      {
        path: 'settings',
        loadChildren: () => import(
          /* webpackChunkName: "resource-settings" */
          './settings/settings.routes'
        )
      },
      { path: '**', pathMatch: 'full', redirectTo: 'home' }
    ],
  },
] as Routes;
