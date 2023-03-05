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
          /* webpackChunkName: "course-home" */
          './home/home.routes'
        )
      },
      {
        path: 'teachers',
        loadChildren: () => import(
          /* webpackChunkName: "course-teachers" */
          './teachers/teachers.routes'
        )
      },
      {
        path: 'students',
        loadChildren: () => import(
          /* webpackChunkName: "course-students" */
          './students/students.routes'
        )
      },
      {
        path: 'settings',
        loadChildren: () => import(
          /* webpackChunkName: "course-settings" */
          './settings/settings.routes'
        )
      },
      { path: '**', pathMatch: 'full', redirectTo: 'home' }
    ],
  },
] as Routes;
