import { Routes } from '@angular/router'
import { CoursePage } from './course.page'

export default [
  {
    path: '',
    component: CoursePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-dashboard" */
            './dashboard/dashboard.routes'
          ),
      },
      {
        path: 'challenges',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-challenges" */
            './challenges/challenges.routes'
          ),
      },
      {
        path: 'teachers',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-teachers" */
            './teachers/teachers.routes'
          ),
      },
      {
        path: 'students',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-students" */
            './students/students.routes'
          ),
      },
      {
        path: 'members',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-members" */
            './members/members.routes'
          ),
      },
      {
        path: 'groups',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-groups" */
            './groups/groups.routes'
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import(
            /* webpackChunkName: "course-settings" */
            './settings/settings.routes'
          ),
      },
      { path: '**', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
] as Routes
